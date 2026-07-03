import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type MediaRow = {
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

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("qr_x_media")
      .select("type, bytes, original_bytes, optimized_bytes, processing_status");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (Array.isArray(data) ? data : []) as MediaRow[];

    const mediaCount = rows.length;
    const imageRows = rows.filter((row) => row.type === "image" || row.type === "logo");
    const fileRows = rows.filter((row) => row.type === "file");

    const getOriginal = (row: MediaRow) => toNumber(row.original_bytes) || toNumber(row.bytes);
    const getOptimized = (row: MediaRow) => {
      const optimized = toNumber(row.optimized_bytes);
      if (optimized > 0) return optimized;
      return getOriginal(row);
    };

    const originalBytes = rows.reduce((sum, row) => sum + getOriginal(row), 0);
    const optimizedBytes = rows.reduce((sum, row) => sum + getOptimized(row), 0);
    const savedBytes = Math.max(0, originalBytes - optimizedBytes);

    const optimizedRows = rows.filter((row) => toNumber(row.optimized_bytes) > 0);
    const processingRows = rows.filter((row) => row.processing_status === "pending" || row.processing_status === "processing");
    const failedRows = rows.filter((row) => row.processing_status === "failed" || row.processing_status === "error");

    const averageOriginalBytes = mediaCount > 0 ? originalBytes / mediaCount : 0;
    const averageOptimizedBytes = mediaCount > 0 ? optimizedBytes / mediaCount : 0;
    const largestOriginalBytes = rows.reduce((max, row) => Math.max(max, getOriginal(row)), 0);

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
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
