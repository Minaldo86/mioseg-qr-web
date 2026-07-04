import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const mediaId = typeof body?.mediaId === "string" ? body.mediaId.trim() : "";

    if (!mediaId) {
      return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: media, error: mediaErr } = await supabase
      .from("qr_x_media")
      .select("id, type, mime_type")
      .eq("id", mediaId)
      .maybeSingle();

    if (mediaErr) {
      return NextResponse.json({ error: mediaErr.message }, { status: 500 });
    }

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const mimeType = String((media as any).mime_type || "");
    const type = String((media as any).type || "");

    if (!mimeType.startsWith("image/") || type === "file") {
      return NextResponse.json(
        { error: "Only image/logo media can be reprocessed" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateErr } = await supabase
      .from("qr_x_media")
      .update({
        processing_status: "queued",
        processing_error: null,
      })
      .eq("id", mediaId)
      .select("id, qrx_id, filename, type, mime_type, processing_status, processing_error")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const { error: invokeErr } = await supabase.functions.invoke("qrx-media-process-image", {
      body: {
        mediaId,
        reason: "admin_reprocess",
      },
    });

    if (invokeErr) {
      return NextResponse.json(
        {
          ok: true,
          queued: true,
          warning: invokeErr.message,
          media: updated,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      ok: true,
      queued: true,
      media: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
