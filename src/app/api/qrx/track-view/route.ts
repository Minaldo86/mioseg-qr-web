import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type RpcResult = Record<string, unknown>;
type SupabasePostgrestErrorLike = { message: string; details?: unknown };

function getEnv(name: string) {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : "";
}

function getSupabaseAdminClient() {
  // akzeptiert beide Varianten (SUPABASE_URL oder NEXT_PUBLIC_SUPABASE_URL)
  const url = getEnv("SUPABASE_URL") || getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url) throw new Error("Missing env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
  if (!serviceKey) throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const bodyUnknown: unknown = await req.json().catch(() => ({}));
    const body =
      typeof bodyUnknown === "object" && bodyUnknown !== null
        ? (bodyUnknown as Record<string, unknown>)
        : {};

    const qrxId = typeof body.qrxId === "string" ? body.qrxId.trim() : "";
    const visitorHash = typeof body.visitorHash === "string" ? body.visitorHash.trim() : "";

    if (!qrxId) return NextResponse.json({ error: "Missing qrxId" }, { status: 400 });
    if (!visitorHash) return NextResponse.json({ error: "Missing visitorHash" }, { status: 400 });

    // ✅ Client erst hier erstellen (nicht beim Import)
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase.rpc("qrx_track_unique_view", {
      p_qrx_id: qrxId,
      p_visitor_hash: visitorHash,
    });

    if (error) {
      const e = error as SupabasePostgrestErrorLike;
      const details = typeof e.details !== "undefined" ? e.details : null;
      return NextResponse.json({ error: e.message, details }, { status: 500 });
    }

    const safeData: RpcResult =
      typeof data === "object" && data !== null ? (data as RpcResult) : {};

    return NextResponse.json({ success: true, ...safeData });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}