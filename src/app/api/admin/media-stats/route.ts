import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type MediaRow = {
  id: string;
  qrx_id: string | null;
  filename: string | null;
  type: string | null;
  bytes: number | null;
  original_bytes: number | null;
  optimized_bytes: number | null;
  processing_status: string | null;
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

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function calculateSavingsPercent(originalBytes: number, optimizedBytes: number) {
  if (originalBytes <= 0) return 0;
  const saved = Math.max(0, originalBytes - optimizedBytes);
  return Math.round((saved / originalBytes) * 10000) / 100;
}

function normalizeMedia(row: MediaRow) {
  const originalBytes = toNumber(row.original_bytes) || toNumber(row.bytes);
  const optimizedBytes = toNumber(row.optimized_bytes) || originalBytes;
  const savedBytes = Math.max(0, originalBytes - optimizedBytes);

  return {
    id: row.id,
    qrx_id: row.qrx_id,
    filename: row.filename,
    type: row.type,
    processing_status: row.processing_status,
    originalBytes,
    optimizedBytes,
    savedBytes,
    savingsPercent: calculateSavingsPercent(originalBytes, optimizedBytes),
  };
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const url = new URL(request.url);
    const search = String(url.searchParams.get("search") || "").trim().toLowerCase();
    const typeFilter = String(url.searchParams.get("type") || "all").trim().toLowerCase();
    const statusFilter = String(url.searchParams.get("status") || "all").trim().toLowerCase();
    const sort = String(url.searchParams.get("sort") || "largest").trim().toLowerCase();
    const minMbRaw = Number(String(url.searchParams.get("minMb") || "0").replace(",", "."));
    const minBytes = Number.isFinite(minMbRaw) && minMbRaw > 0 ? minMbRaw * 1024 * 1024 : 0;

    const { data, error } = await supabase
      .from("qr_x_media")
      .select("id, qrx_id, filename, type, bytes, original_bytes, optimized_bytes, processing_status");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (Array.isArray(data) ? data : []) as MediaRow[];

    const mediaCount = rows.length;
    const imageRows = rows.filter((row) => row.type === "image" || row.type === "logo");
    const fileRows = rows.filter((row) => row.type === "file");

    const normalizedRows = rows.map(normalizeMedia);

    const filteredRows = normalizedRows
      .filter((row) => {
        if (typeFilter !== "all" && String(row.type || "").toLowerCase() !== typeFilter) return false;

        const status = String(row.processing_status || "unknown").toLowerCase();
        if (statusFilter !== "all") {
          if (statusFilter === "failed") {
            if (status !== "failed" && status !== "error") return false;
          } else if (statusFilter === "ready") {
            if (status !== "ready" && status !== "done" && status !== "optimized") return false;
          } else if (status !== statusFilter) {
            return false;
          }
        }

        if (row.originalBytes < minBytes) return false;

        if (search) {
          const haystack = `${row.filename || ""} ${row.qrx_id || ""} ${row.id || ""}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "savings") return b.savedBytes - a.savedBytes;
        if (sort === "worst") return a.savingsPercent - b.savingsPercent;
        if (sort === "failed") {
          const af = ["failed", "error"].includes(String(a.processing_status || "").toLowerCase()) ? 1 : 0;
          const bf = ["failed", "error"].includes(String(b.processing_status || "").toLowerCase()) ? 1 : 0;
          return bf - af || b.originalBytes - a.originalBytes;
        }
        return b.originalBytes - a.originalBytes;
      })
      .slice(0, 100);

    const originalBytes = normalizedRows.reduce((sum, row) => sum + row.originalBytes, 0);
    const optimizedBytes = normalizedRows.reduce((sum, row) => sum + row.optimizedBytes, 0);
    const savedBytes = Math.max(0, originalBytes - optimizedBytes);

    const optimizedRows = rows.filter((row) => toNumber(row.optimized_bytes) > 0);
    const processingRows = rows.filter((row) => row.processing_status === "pending" || row.processing_status === "processing");
    const failedRows = rows.filter((row) => row.processing_status === "failed" || row.processing_status === "error");

    const statusCounts = rows.reduce<Record<string, number>>((acc, row) => {
      const key = String(row.processing_status || "unknown").toLowerCase();
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const averageOriginalBytes = mediaCount > 0 ? originalBytes / mediaCount : 0;
    const averageOptimizedBytes = mediaCount > 0 ? optimizedBytes / mediaCount : 0;
    const largestOriginalBytes = normalizedRows.reduce((max, row) => Math.max(max, row.originalBytes), 0);

    const topLargest = [...normalizedRows]
      .sort((a, b) => b.originalBytes - a.originalBytes)
      .slice(0, 10);

    const topSavings = [...normalizedRows]
      .sort((a, b) => b.savedBytes - a.savedBytes)
      .slice(0, 10);

    return NextResponse.json({
      ok: true,
      totals: {
        mediaCount,
        imageCount: imageRows.length,
        fileCount: fileRows.length,
        optimizedCount: optimizedRows.length,
        processingCount: processingRows.length,
        failedCount: failedRows.length,
        originalBytes,
        optimizedBytes,
        savedBytes,
        savingsPercent: calculateSavingsPercent(originalBytes, optimizedBytes),
        averageOriginalBytes,
        averageOptimizedBytes,
        averageSavingsPercent: calculateSavingsPercent(averageOriginalBytes, averageOptimizedBytes),
        largestOriginalBytes,
      },
      topLargest,
      topSavings,
      mediaItems: filteredRows,
      statusCounts,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
