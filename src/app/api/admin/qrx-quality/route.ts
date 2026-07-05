import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type QrxQualityRow = {
  id: string;
  force_original_quality: boolean | null;
};

type RequestBody = {
  qrxId?: unknown;
  forceOriginalQuality?: unknown;
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

function getQrxIdFromUrl(req: Request) {
  const url = new URL(req.url);
  return String(url.searchParams.get("qrxId") || "").trim();
}

export async function GET(req: Request) {
  try {
    const qrxId = getQrxIdFromUrl(req);

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
      qrx: {
        id: data.id,
        force_original_quality: data.force_original_quality ? true : false,
      },
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
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const qrxId = typeof body.qrxId === "string" ? body.qrxId.trim() : "";

    if (!qrxId) {
      return NextResponse.json({ error: "Missing qrxId" }, { status: 400 });
    }

    if (typeof body.forceOriginalQuality !== "boolean") {
      return NextResponse.json(
        { error: "forceOriginalQuality must be boolean" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("qr_x_entries")
      .update({ force_original_quality: body.forceOriginalQuality })
      .eq("id", qrxId)
      .select("id, force_original_quality")
      .single<QrxQualityRow>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      qrx: {
        id: data.id,
        force_original_quality: data.force_original_quality ? true : false,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
