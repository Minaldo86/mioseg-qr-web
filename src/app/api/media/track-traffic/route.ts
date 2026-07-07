import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type RequestBody = {
  qrxId?: unknown;
  mediaId?: unknown;
  variant?: unknown;
  source?: unknown;
  bytes?: unknown;
  viewerKey?: unknown;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, { auth: { persistSession: false } });
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function readBytes(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) && num > 0 ? Math.min(Math.round(num), 200 * 1024 * 1024) : 0;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const qrxId = readString(body.qrxId) || null;
    const mediaId = readString(body.mediaId) || null;
    const variant = readString(body.variant, "unknown") || "unknown";
    const source = readString(body.source, "web") || "web";
    const viewerKey = readString(body.viewerKey) || null;
    const bytes = readBytes(body.bytes);

    if (!qrxId && !mediaId) {
      return NextResponse.json({ error: "qrxId or mediaId is required" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent");
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("qrx_media_traffic_events").insert({
      qrx_id: qrxId,
      media_id: mediaId,
      variant,
      source,
      bytes,
      viewer_key: viewerKey,
      user_agent: userAgent,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
