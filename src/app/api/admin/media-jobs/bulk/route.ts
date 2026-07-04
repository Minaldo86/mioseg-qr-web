import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type RequestBody = {
  search?: unknown;
  type?: unknown;
  status?: unknown;
  minMb?: unknown;
  limit?: unknown;
  dryRun?: unknown;
};

type MediaRow = {
  id: string;
  qrx_id: string | null;
  filename: string | null;
  type: string | null;
  mime_type: string | null;
  bytes: number | null;
  original_bytes: number | null;
  processing_status: string | null;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, { auth: { persistSession: false } });
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function matchesStatus(rowStatus: string, filter: string) {
  if (filter === "all") return true;
  if (filter === "failed") return rowStatus === "failed" || rowStatus === "error";
  if (filter === "ready") return rowStatus === "ready" || rowStatus === "done" || rowStatus === "optimized";
  if (filter === "not_optimized") return rowStatus === "queued" || rowStatus === "pending" || rowStatus === "processing" || rowStatus === "unknown";
  return rowStatus === filter;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;

    const search = normalizeString(body.search).toLowerCase();
    const typeFilter = normalizeString(body.type, "image").toLowerCase();
    const statusFilter = normalizeString(body.status, "failed").toLowerCase();
    const minMbRaw = Number(normalizeString(body.minMb, "0").replace(",", "."));
    const minBytes = Number.isFinite(minMbRaw) && minMbRaw > 0 ? minMbRaw * 1024 * 1024 : 0;
    const limitRaw = Number(body.limit ?? 100);
    const limit = Math.max(1, Math.min(500, Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 100));
    const dryRun = body.dryRun !== false;

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("qr_x_media")
      .select("id, qrx_id, filename, type, mime_type, bytes, original_bytes, processing_status")
      .limit(5000);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = (Array.isArray(data) ? data : []) as MediaRow[];

    const matched = rows
      .filter((row) => {
        const type = String(row.type || "").toLowerCase();
        const mimeType = String(row.mime_type || "").toLowerCase();
        const status = String(row.processing_status || "unknown").toLowerCase();
        const size = toNumber(row.original_bytes) || toNumber(row.bytes);

        if (!mimeType.startsWith("image/") || type === "file") return false;
        if (typeFilter !== "all" && type !== typeFilter) return false;
        if (!matchesStatus(status, statusFilter)) return false;
        if (size < minBytes) return false;

        if (search) {
          const haystack = `${row.filename || ""} ${row.qrx_id || ""} ${row.id || ""}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aSize = toNumber(a.original_bytes) || toNumber(a.bytes);
        const bSize = toNumber(b.original_bytes) || toNumber(b.bytes);
        return bSize - aSize;
      })
      .slice(0, limit);

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        matchedCount: matched.length,
        sample: matched.slice(0, 10).map((row) => ({
          id: row.id,
          qrx_id: row.qrx_id,
          filename: row.filename,
          type: row.type,
          mime_type: row.mime_type,
          processing_status: row.processing_status,
          original_bytes: toNumber(row.original_bytes) || toNumber(row.bytes),
        })),
      });
    }

    if (matched.length === 0) {
      return NextResponse.json({
        ok: true,
        dryRun: false,
        createdCount: 0,
        message: "No matching media found",
      });
    }

    const mediaIds = matched.map((row) => row.id);

    const { error: mediaUpdateErr } = await supabase
      .from("qr_x_media")
      .update({
        processing_status: "queued",
        processing_error: null,
      })
      .in("id", mediaIds);

    if (mediaUpdateErr) {
      return NextResponse.json({ error: mediaUpdateErr.message }, { status: 500 });
    }

    const jobsPayload = matched.map((row) => ({
      media_id: row.id,
      qrx_id: row.qrx_id,
      job_type: "bulk_reprocess",
      status: "queued",
      reason: `admin_bulk_reprocess:${typeFilter}:${statusFilter}`,
      attempts: 0,
      processing_error: null,
    }));

    const { data: insertedJobs, error: jobErr } = await supabase
      .from("qrx_media_jobs")
      .insert(jobsPayload)
      .select("id, media_id, qrx_id, job_type, status, reason, created_at");

    if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      dryRun: false,
      createdCount: Array.isArray(insertedJobs) ? insertedJobs.length : 0,
      jobs: insertedJobs ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
