import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type RequestBody = {
  jobId?: unknown;
};

type MediaJobRow = {
  id: string;
  media_id: string;
  status: string | null;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const jobId = typeof body.jobId === "string" ? body.jobId.trim() : "";

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: job, error: jobErr } = await supabase
      .from("qrx_media_jobs")
      .select("id, media_id, status")
      .eq("id", jobId)
      .maybeSingle<MediaJobRow>();

    if (jobErr) {
      return NextResponse.json({ error: jobErr.message }, { status: 500 });
    }

    if (!job) {
      return NextResponse.json({ error: "Media job not found" }, { status: 404 });
    }

    if (String(job.status || "").toLowerCase() !== "failed") {
      return NextResponse.json(
        { error: "Only failed jobs can be retried" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data: updatedJob, error: updateJobErr } = await supabase
      .from("qrx_media_jobs")
      .update({
        status: "queued",
        processing_error: null,
        started_at: null,
        finished_at: null,
        updated_at: now,
      })
      .eq("id", jobId)
      .select("id, media_id, qrx_id, job_type, status, reason, attempts, processing_error, created_at, started_at, finished_at, updated_at")
      .single();

    if (updateJobErr) {
      return NextResponse.json({ error: updateJobErr.message }, { status: 500 });
    }

    await supabase
      .from("qr_x_media")
      .update({
        processing_status: "queued",
        processing_error: null,
      })
      .eq("id", job.media_id);

    return NextResponse.json({
      ok: true,
      retried: true,
      job: updatedJob,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
