import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type QrxQualityRow = {
  id: string;
  force_original_quality: boolean | null;
};

type PatchBody = {
  qrxId?: unknown;
  forceOriginal?: unknown;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qrxId = String(url.searchParams.get("qrxId") || "").trim();

    if (!qrxId) {
      return NextResponse.json({ error: "Missing qrxId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("qr_x_entries")
      .select("id, force_original_quality")
      .eq("id", qrxId)
      .maybeSingle<QrxQualityRow>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "QR-X not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
      force_original_quality: Boolean(data.force_original_quality),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as PatchBody;
    const qrxId = typeof body.qrxId === "string" ? body.qrxId.trim() : "";
    const forceOriginal = Boolean(body.forceOriginal);

    if (!qrxId) {
      return NextResponse.json({ error: "Missing qrxId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("qr_x_entries")
      .update({ force_original_quality: forceOriginal })
      .eq("id", qrxId)
      .select("id, force_original_quality")
      .single<QrxQualityRow>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
      force_original_quality: Boolean(data.force_original_quality),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
