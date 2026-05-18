import { supabaseAdmin } from "@/lib/supabase-admin";

type QrxStatusBody = {
  qrxId?: unknown;
  moderationAction?: unknown;
  suspended?: unknown;
  reason?: unknown;
  deleteAction?: unknown;
};

const QRX_SELECT =
  "id, owner_user_id, title, type, verified, company_name, category, created_at, updated_at, suspended, suspended_reason, suspended_at, report_count, report_score, moderation_status, moderation_flagged_at, auto_suspended_at, deleted_at, deleted_reason, deleted_by_admin";

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

async function writeAdminLog(input: {
  actionType: string;
  targetUserId?: string | null;
  qrxId?: string | null;
  note?: string | null;
}) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: input.actionType,
    target_user_id: input.targetUserId ?? null,
    qrx_id: input.qrxId ?? null,
    note: input.note ?? null,
  });

  if (error) {
    console.warn("admin_action_log insert failed:", error.message);
  }
}

async function fetchQrx(qrxId: string) {
  const { data, error } = await supabaseAdmin
    .from("qr_x_entries")
    .select(QRX_SELECT)
    .eq("id", qrxId)
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const reported = searchParams.get("reported") === "1";
    const qrxId = String(searchParams.get("qrxId") || "").trim();

    if (reported) {
      const { data, error } = await supabaseAdmin
        .from("qr_x_entries")
        .select(QRX_SELECT)
        .or("report_count.gt.0,report_score.gt.0,moderation_status.neq.ok")
        .order("report_score", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) {
        return Response.json(
          { error: "Gemeldete QR-X konnten nicht geladen werden", details: error.message },
          { status: 500 }
        );
      }

      return Response.json({ qrx: data ?? [] });
    }

    if (!qrxId) {
      return Response.json({ error: "QR-X-ID fehlt" }, { status: 400 });
    }

    const { data, error } = await fetchQrx(qrxId);

    if (error || !data) {
      return Response.json(
        { error: "QR-X nicht gefunden", details: error?.message },
        { status: 404 }
      );
    }

    return Response.json({ qrx: data });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const body = (await req.json()) as QrxStatusBody;

    const qrxId = String(body?.qrxId || "").trim();
    const moderationAction =
      typeof body?.moderationAction === "string" ? body.moderationAction : null;
    const suspended = Boolean(body?.suspended);
    const reason =
      typeof body?.reason === "string" && body.reason.trim().length > 0
        ? body.reason.trim()
        : null;

    const deleteAction =
      typeof body?.deleteAction === "string"
        ? body.deleteAction
        : null;

    if (!qrxId) {
      return Response.json({ error: "QR-X-ID fehlt" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await fetchQrx(qrxId);

    if (existingError || !existing) {
      return Response.json(
        { error: "QR-X nicht gefunden", details: existingError?.message },
        { status: 404 }
      );
    }

    const nowIso = new Date().toISOString();

    if (moderationAction === "mark_reviewed") {
      const { data, error } = await supabaseAdmin
        .from("qr_x_entries")
        .update({
          report_count: 0,
          report_score: 0,
          moderation_status: "ok",
          moderation_flagged_at: null,
          auto_suspended_at: null,
          updated_at: nowIso,
        })
        .eq("id", qrxId)
        .select(QRX_SELECT)
        .single();

      if (error) {
        return Response.json(
          { error: "QR-X konnte nicht als geprüft markiert werden", details: error.message },
          { status: 500 }
        );
      }

      await writeAdminLog({
        actionType: "qrx_marked_reviewed",
        targetUserId: data.owner_user_id,
        qrxId: data.id,
        note: "QR-X Meldungen/Score wurden nach Prüfung zurückgesetzt.",
      });

      return Response.json({ ok: true, qrx: data });
    }

    if (suspended && !reason) {
      return Response.json(
        { error: "Zum Sperren ist ein Sperrgrund erforderlich" },
        { status: 400 }
      );
    }

    /*
     * SOFT DELETE
     */

    if (deleteAction === "soft_delete") {
      if (!reason) {
        return Response.json(
          { error: "Zum Löschen ist ein Grund erforderlich" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("qr_x_entries")
        .update({
          deleted_at: nowIso,
          deleted_reason: reason,
          deleted_by_admin: true,
          updated_at: nowIso,
        })
        .eq("id", qrxId)
        .select(QRX_SELECT)
        .single();

      if (error) {
        return Response.json(
          {
            error: "QR-X konnte nicht gelöscht werden",
            details: error.message,
          },
          { status: 500 }
        );
      }

      await writeAdminLog({
        actionType: "qrx_soft_deleted",
        targetUserId: data.owner_user_id,
        qrxId: data.id,
        note: `QR-X gelöscht. Grund: ${reason}`,
      });

      return Response.json({
        ok: true,
        qrx: data,
      });
    }

    /*
     * RESTORE
     */

    if (deleteAction === "restore") {
      const { data, error } = await supabaseAdmin
        .from("qr_x_entries")
        .update({
          deleted_at: null,
          deleted_reason: null,
          deleted_by_admin: false,
          updated_at: nowIso,
        })
        .eq("id", qrxId)
        .select(QRX_SELECT)
        .single();

      if (error) {
        return Response.json(
          {
            error: "QR-X konnte nicht wiederhergestellt werden",
            details: error.message,
          },
          { status: 500 }
        );
      }

      await writeAdminLog({
        actionType: "qrx_restored",
        targetUserId: data.owner_user_id,
        qrxId: data.id,
        note: "QR-X wurde wiederhergestellt.",
      });

      return Response.json({
        ok: true,
        qrx: data,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("qr_x_entries")
      .update({
        suspended,
        suspended_reason: suspended ? reason : null,
        suspended_at: suspended ? nowIso : null,
        moderation_status: suspended ? "auto_suspended" : existing.moderation_status,
        updated_at: nowIso,
      })
      .eq("id", qrxId)
      .select(QRX_SELECT)
      .single();

    if (error) {
      return Response.json(
        { error: "QR-X Status konnte nicht geändert werden", details: error.message },
        { status: 500 }
      );
    }

    await writeAdminLog({
      actionType: suspended ? "qrx_suspended" : "qrx_unsuspended",
      targetUserId: data.owner_user_id,
      qrxId: data.id,
      note: suspended
        ? `QR-X gesperrt. Grund: ${reason}`
        : "QR-X entsperrt.",
    });

    return Response.json({ ok: true, qrx: data });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
