import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type RpcResult = Record<string, unknown>;
type SupabasePostgrestErrorLike = { message: string; details?: unknown };

function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Wichtig: nicht beim Import crashen – erst wenn Route wirklich aufgerufen wird.
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key);
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

    const supabase = getSupabase();

    const { data, error } = await supabase.rpc("qrx_track_unique_view", {
      p_qrx_id: qrxId,
      p_visitor_hash: visitorHash,
    });

    if (error) {
      const e = error as SupabasePostgrestErrorLike;
      return NextResponse.json(
        { error: e.message, details: typeof e.details !== "undefined" ? e.details : null },
        { status: 500 }
      );
    }

    const safeData: RpcResult = typeof data === "object" && data !== null ? (data as RpcResult) : {};
    return NextResponse.json({ success: true, ...safeData });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}