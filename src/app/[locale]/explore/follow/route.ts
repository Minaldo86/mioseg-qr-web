import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FollowBody = {
  qrxId?: unknown;
  action?: unknown;
};

function getEnvironment() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    throw new Error(
      "Supabase-Umgebungsvariablen sind nicht vollständig konfiguriert.",
    );
  }

  return { url, anonKey, serviceKey };
}

async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return { user: null, error: "Nicht angemeldet." };
  }

  const { url, anonKey } = getEnvironment();

  const client = createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: "Deine Sitzung ist ungültig oder abgelaufen.",
    };
  }

  return { user, error: null };
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth.user) {
      return NextResponse.json(
        { error: auth.error || "Nicht angemeldet." },
        { status: 401 },
      );
    }

    const { url, serviceKey } = getEnvironment();
    const admin = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await admin
      .from("qrx_saves")
      .select("qrx_id")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Explore saves load failed:", error);
      return NextResponse.json(
        { error: "Gespeicherte QR-X konnten nicht geladen werden." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      savedIds: (data ?? [])
        .map((row) => String(row.qrx_id || ""))
        .filter(Boolean),
    });
  } catch (error) {
    console.error("Explore follow GET failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gespeicherte QR-X konnten nicht geladen werden.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth.user) {
      return NextResponse.json(
        { error: auth.error || "Nicht angemeldet." },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as FollowBody;
    const qrxId = String(body.qrxId || "").trim();
    const action = String(body.action || "").trim();

    if (!qrxId) {
      return NextResponse.json(
        { error: "QR-X-ID fehlt." },
        { status: 400 },
      );
    }

    if (action !== "save" && action !== "remove") {
      return NextResponse.json(
        { error: "Ungültige Aktion." },
        { status: 400 },
      );
    }

    const { url, serviceKey } = getEnvironment();
    const admin = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: qrx, error: qrxError } = await admin
      .from("qr_x_entries")
      .select("id,deleted_at,suspended")
      .eq("id", qrxId)
      .maybeSingle();

    if (qrxError || !qrx || qrx.deleted_at || qrx.suspended) {
      return NextResponse.json(
        { error: "Dieser QR-X ist nicht verfügbar." },
        { status: 404 },
      );
    }

    if (action === "save") {
      const { error } = await admin
        .from("qrx_saves")
        .upsert(
          {
            user_id: auth.user.id,
            qrx_id: qrxId,
          },
          {
            onConflict: "qrx_id,user_id",
            ignoreDuplicates: true,
          },
        );

      if (error) {
        console.error("Explore follow save failed:", error);
        return NextResponse.json(
          { error: "QR-X konnte nicht gespeichert werden." },
          { status: 500 },
        );
      }

      return NextResponse.json({ ok: true, followed: true });
    }

    const { error } = await admin
      .from("qrx_saves")
      .delete()
      .eq("user_id", auth.user.id)
      .eq("qrx_id", qrxId);

    if (error) {
      console.error("Explore follow remove failed:", error);
      return NextResponse.json(
        { error: "QR-X konnte nicht entfernt werden." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, followed: false });
  } catch (error) {
    console.error("Explore follow POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Speichern nicht möglich.",
      },
      { status: 500 },
    );
  }
}
