import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const qrxId = typeof body?.qrxId === "string" ? body.qrxId.trim() : "";
    const visitorHash = typeof body?.visitorHash === "string" ? body.visitorHash.trim() : "";

    if (!qrxId) {
      return NextResponse.json({ error: "Missing qrxId" }, { status: 400 });
    }
    if (!visitorHash) {
      return NextResponse.json({ error: "Missing visitorHash" }, { status: 400 });
    }

    // Alles in einer DB-Funktion (atomic)
    const { data, error } = await supabase.rpc("qrx_track_unique_view", {
      p_qrx_id: qrxId, // wird in SQL zu uuid gecastet
      p_visitor_hash: visitorHash,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message, details: (error as any)?.details ?? null },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}