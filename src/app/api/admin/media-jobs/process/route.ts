import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type MediaJobRow = {
  id: string;
  media_id: string;
  qrx_id: string | null;
  job_type: string | null;
  status: string | null;
  attempts: number | null;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: job, error: jobErr } = await supabase
      .from("qrx_media_jobs")
      .select("id, media_id, qrx_id, job_type, status, attempts")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<MediaJobRow>();

    if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 });

    if (!job) {
      return NextResponse.json({
        ok: true,
        processed: false,
        message: "No queued media job found",
      });
    }

    const attempts = Number(job.attempts ?? 0) + 1;
    const now = new Date().toISOString();

    const { error: startErr } = await supabase
      .from("qrx_media_jobs")
      .update({
        status: "processing",
        attempts,
        started_at: now,
        updated_at: now,
        processing_error: null,
      })
      .eq("id", job.id);

    if (startErr) return NextResponse.json({ error: startErr.message }, { status: 500 });

    const { error: mediaUpdateErr } = await supabase
      .from("qr_x_media")
      .update({
        processing_status: "processing",
        processing_error: null,
      })
      .eq("id", job.media_id);

    if (mediaUpdateErr) {
      const failedAt = new Date().toISOString();
      await supabase
        .from("qrx_media_jobs")
        .update({
          status: "failed",
          processing_error: mediaUpdateErr.message,
          finished_at: failedAt,
          updated_at: failedAt,
        })
        .eq("id", job.id);

      return NextResponse.json({ error: mediaUpdateErr.message }, { status: 500 });
    }

    const { error: invokeErr } = await supabase.functions.invoke("qrx-media-process-image", {
      body: {
        mediaId: job.media_id,
        jobId: job.id,
        reason: "media_job_queue",
      },
    });

    if (invokeErr) {
      const failedAt = new Date().toISOString();

      await supabase
        .from("qrx_media_jobs")
        .update({
          status: "failed",
          processing_error: invokeErr.message,
          finished_at: failedAt,
          updated_at: failedAt,
        })
        .eq("id", job.id);

      await supabase
        .from("qr_x_media")
        .update({
          processing_status: "failed",
          processing_error: invokeErr.message,
        })
        .eq("id", job.media_id);

      return NextResponse.json({ ok: false, processed: false, job, error: invokeErr.message }, { status: 500 });
    }

    const doneAt = new Date().toISOString();
    await supabase
      .from("qrx_media_jobs")
      .update({
        status: "done",
        finished_at: doneAt,
        updated_at: doneAt,
        processing_error: null,
      })
      .eq("id", job.id);

    return NextResponse.json({
      ok: true,
      processed: true,
      job: {
        ...job,
        attempts,
        status: "done",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
