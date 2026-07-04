import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type MediaJobRow = {
  id: string;
  media_id: string;
  qrx_id: string | null;
  job_type: string | null;
  status: string | null;
  reason: string | null;
  attempts: number | null;
  processing_error: string | null;
  created_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  updated_at: string | null;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, { auth: { persistSession: false } });
}

function countByStatus(jobs: MediaJobRow[], status: string) {
  return jobs.filter((job) => String(job.status || "").toLowerCase() === status).length;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("qrx_media_jobs")
      .select("id, media_id, qrx_id, job_type, status, reason, attempts, processing_error, created_at, started_at, finished_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const jobs = (Array.isArray(data) ? data : []) as MediaJobRow[];

    return NextResponse.json({
      ok: true,
      jobs,
      summary: {
        totalLoaded: jobs.length,
        queued: countByStatus(jobs, "queued"),
        processing: countByStatus(jobs, "processing"),
        done: countByStatus(jobs, "done"),
        failed: countByStatus(jobs, "failed"),
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
