import { supabaseAdmin } from "../../../../lib/supabase-admin";

type UnknownRecord = Record<string, unknown>;

type AdminUserData = {
  email?: string | null;
  banned_until?: string | null;
};

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function isAdminRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const [scheme, encoded] = authHeader.split(" ");
  if (scheme !== "Basic" || !encoded) return false;

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return false;

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    return (
      username === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    );
  } catch {
    return false;
  }
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function findUserIdFromQuery(query: string) {
  const trimmed = query.trim();

  if (!trimmed) return { userId: null, email: null };

  if (looksLikeUuid(trimmed)) {
    const { data: qrxRow } = await supabaseAdmin
      .from("qr_x_entries")
      .select("owner_user_id")
      .eq("id", trimmed)
      .maybeSingle();

    if (qrxRow?.owner_user_id) {
      return { userId: qrxRow.owner_user_id as string, email: null };
    }

    return { userId: trimmed, email: null };
  }

  if (trimmed.includes("@")) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (!error && data?.users?.length) {
      const found = data.users.find(
        (user) => user.email?.toLowerCase() === trimmed.toLowerCase()
      );

      if (found?.id) {
        return { userId: found.id, email: found.email ?? trimmed };
      }
    }

    return { userId: null, email: trimmed };
  }

  return { userId: null, email: null };
}

async function loadQrxList(userId: string) {
  const fullSelect =
    "id, title, type, verified, created_at, suspended, suspended_reason, deleted_at, deleted_reason, deleted_by_admin, company_name, category";

  const fallbackSelect =
    "id, title, type, verified, created_at, deleted_at, deleted_reason, deleted_by_admin, company_name, category";

  const fullResult = await supabaseAdmin
    .from("qr_x_entries")
    .select(fullSelect)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (!fullResult.error) {
    return fullResult.data ?? [];
  }

  console.warn("qrxList full select failed, retry fallback:", fullResult.error.message);

  const fallbackResult = await supabaseAdmin
    .from("qr_x_entries")
    .select(fallbackSelect)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (fallbackResult.error) {
    console.warn("qrxList fallback select failed:", fallbackResult.error.message);
    return [];
  }

  return (fallbackResult.data ?? []).map((item: UnknownRecord) => ({
    ...item,
    suspended: false,
    suspended_reason: null,
    deleted_at: null,
    deleted_reason: null,
    deleted_by_admin: false,
  }));
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const query = String(searchParams.get("q") || "").trim();

    if (!query) {
      return Response.json({ error: "Suchbegriff fehlt" }, { status: 400 });
    }

    const found = await findUserIdFromQuery(query);

    if (!found.userId) {
      return Response.json(
        { error: "Kein Nutzer gefunden. Suche am besten mit User-ID oder QR-X-ID." },
        { status: 404 }
      );
    }

    let email = found.email;
    let userData: AdminUserData | null = null;

    try {
      const { data } = await supabaseAdmin.auth.admin.getUserById(found.userId);
      userData = (data?.user ?? null) as AdminUserData | null;
      email = userData?.email ?? email ?? null;
    } catch {
      userData = null;
    }

    const { data: creditRow } = await supabaseAdmin
      .from("qrx_credits")
      .select("credits")
      .eq("user_id", found.userId)
      .maybeSingle();

    const { count: qrxCount } = await supabaseAdmin
      .from("qr_x_entries")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", found.userId);

    const { count: businessQrxCount } = await supabaseAdmin
      .from("qr_x_entries")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", found.userId)
      .eq("type", "business");

    const { count: verifiedBusinessQrxCount } = await supabaseAdmin
      .from("qr_x_entries")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", found.userId)
      .eq("type", "business")
      .eq("verified", true);

    const { count: openTicketsCount } = await supabaseAdmin
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", found.userId)
      .neq("status", "resolved");

    const { count: openVerificationsCount } = await supabaseAdmin
      .from("qrx_verification_requests")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", found.userId)
      .eq("status", "pending");

    const { data: recentTickets } = await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .eq("user_id", found.userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const qrxList = await loadQrxList(found.userId);
    const recentQrx = qrxList.slice(0, 5);

    return Response.json({
      query,
      userId: found.userId,
      email,
      currentCredits:
        typeof creditRow?.credits === "number" ? creditRow.credits : null,
      qrxCount: qrxCount ?? 0,
      businessQrxCount: businessQrxCount ?? 0,
      verifiedBusinessQrxCount: verifiedBusinessQrxCount ?? 0,
      openTicketsCount: openTicketsCount ?? 0,
      openVerificationsCount: openVerificationsCount ?? 0,
      recentTickets: recentTickets ?? [],
      recentQrx,
      qrxList,
      userBlocked: userData?.banned_until
        ? new Date(userData.banned_until).getTime() > Date.now()
        : false,
      bannedUntil: userData?.banned_until ?? null,
    });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

async function writeAdminLog(input: {
  actionType: string;
  targetUserId?: string | null;
  note?: string | null;
}) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: input.actionType,
    target_user_id: input.targetUserId ?? null,
    note: input.note ?? null,
  });

  if (error) {
    console.warn("admin_action_log insert failed:", error.message);
  }
}
export async function PATCH(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const body = await req.json();

    const userId = String(body?.userId || "").trim();
    const action = String(body?.action || "").trim();
    const reason = String(body?.reason || "Admin-Aktion").trim();

    if (!userId) {
      return Response.json({ error: "User-ID fehlt." }, { status: 400 });
    }

    if (action === "ban_user") {
      const bannedUntil = "2099-01-01T00:00:00.000Z";

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "876000h",
      });

      if (error) {
        throw error;
      }

      const { error: suspendError } = await supabaseAdmin
        .from("qr_x_entries")
        .update({
          suspended: true,
          suspended_reason: reason || "Nutzer wurde gesperrt",
        })
        .eq("owner_user_id", userId);

      if (suspendError) {
        throw suspendError;
      }

      await writeAdminLog({
        actionType: "user_banned",
        targetUserId: userId,
        note: `${reason || "Nutzer wurde gesperrt"} | Alle QR-X automatisch gesperrt`,
      });

      return Response.json({
        ok: true,
        action: "ban_user",
        bannedUntil,
      });
    }

    if (action === "unban_user") {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });

      if (error) {
        throw error;
      }

      await writeAdminLog({
        actionType: "user_unbanned",
        targetUserId: userId,
        note: reason || "Nutzer entsperrt. QR-X bleiben gesperrt.",
      });

      return Response.json({
        ok: true,
        action: "unban_user",
      });
    }

    if (action === "suspend_all_qrx") {
      const { error } = await supabaseAdmin
        .from("qr_x_entries")
        .update({
          suspended: true,
          suspended_reason: reason || "Alle QR-X durch Admin gesperrt",
        })
        .eq("owner_user_id", userId);

      if (error) {
        throw error;
      }

      await writeAdminLog({
        actionType: "all_qrx_suspended",
        targetUserId: userId,
        note: reason || "Alle QR-X durch Admin gesperrt",
      });

      return Response.json({
        ok: true,
        action: "suspend_all_qrx",
      });
    }

    if (action === "unsuspend_all_qrx") {
      const { error } = await supabaseAdmin
        .from("qr_x_entries")
        .update({
          suspended: false,
          suspended_reason: null,
        })
        .eq("owner_user_id", userId);

      if (error) {
        throw error;
      }

      await writeAdminLog({
        actionType: "all_qrx_unsuspended",
        targetUserId: userId,
        note: reason || "Alle QR-X durch Admin freigegeben",
      });

      return Response.json({
        ok: true,
        action: "unsuspend_all_qrx",
      });
    }

    return Response.json(
      { error: "Ungültige Aktion." },
      { status: 400 }
    );
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
