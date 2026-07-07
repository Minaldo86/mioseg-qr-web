import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type TrafficEventRow = {
  qrx_id: string | null;
  media_id: string | null;
  variant: string | null;
  bytes: number | null;
  created_at: string | null;
  qr_x_entries?:
    | {
        title: string | null;
        company_name: string | null;
      }[]
    | null;
  qr_x_media?:
    | {
        filename: string | null;
      }[]
    | null;
};

type QrxAgg = {
  qrxId: string | null;
  title: string | null;
  companyName: string | null;
  eventCount: number;
  totalBytes: number;
  todayBytes: number;
  monthBytes: number;
  weekBytes: number;
  storageBytes?: number;
  estimatedTrafficCostCents?: number;
  estimatedStorageCostCents?: number;
  estimatedTotalCostCents?: number;
  lastSeenAt: string | null;
};

type MediaAgg = {
  mediaId: string | null;
  qrxId: string | null;
  filename: string | null;
  variant: string | null;
  eventCount: number;
  totalBytes: number;
  todayBytes: number;
  monthBytes: number;
  weekBytes: number;
  storageBytes?: number;
  estimatedTrafficCostCents?: number;
  estimatedStorageCostCents?: number;
  estimatedTotalCostCents?: number;
  lastSeenAt: string | null;
};

type VariantAgg = {
  variant: string;
  eventCount: number;
  totalBytes: number;
  todayBytes: number;
  weekBytes: number;
  monthBytes: number;
  sharePercent: number;
};

type StorageMediaRow = {
  id: string;
  qrx_id: string | null;
  filename: string | null;
  bytes: number | null;
  original_bytes: number | null;
  optimized_bytes: number | null;
};

type StorageAgg = {
  id: string | null;
  qrxId: string | null;
  filename: string | null;
  storageBytes: number;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, { auth: { persistSession: false } });
}

function safeBytes(value: number | null | undefined) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) && num > 0 ? Math.round(num) : 0;
}

const TRAFFIC_EGRESS_COST_CENTS_PER_GB = 9;
const STORAGE_COST_CENTS_PER_GB_MONTH = 2;

function estimateEgressCostCents(bytes: number) {
  // Grobe Egress-Schätzung: 0,09 € pro GB. Später kann dieser Wert in eine Pricing-/Config-Tabelle wandern.
  return Math.round((bytes / 1024 / 1024 / 1024) * TRAFFIC_EGRESS_COST_CENTS_PER_GB);
}

function estimateStorageCostCents(bytes: number) {
  // Grobe Storage-Schätzung pro Monat. Original + erzeugte Derivate werden als gespeicherte Daten gerechnet.
  return Math.round((bytes / 1024 / 1024 / 1024) * STORAGE_COST_CENTS_PER_GB_MONTH);
}

function isSameDay(value: string | null | undefined, startOfDay: number) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= startOfDay;
}

function isSameMonth(value: string | null | undefined, startOfMonth: number) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= startOfMonth;
}

function isSameWeek(value: string | null | undefined, startOfWeek: number) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= startOfWeek;
}

function maxDate(a: string | null, b: string | null) {
  if (!a) return b;
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfWeekDate = new Date(now);
    startOfWeekDate.setDate(now.getDate() - 6);
    startOfWeekDate.setHours(0, 0, 0, 0);
    const startOfWeek = startOfWeekDate.getTime();

    const { data, error } = await supabase
      .from("qrx_media_traffic_events")
      .select(
        "qrx_id, media_id, variant, bytes, created_at, qr_x_entries(title, company_name), qr_x_media(filename)"
      )
      .order("created_at", { ascending: false })
      .limit(10000);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: mediaRowsRaw, error: mediaRowsError } = await supabase
      .from("qr_x_media")
      .select("id, qrx_id, filename, bytes, original_bytes, optimized_bytes")
      .limit(20000);

    if (mediaRowsError) return NextResponse.json({ error: mediaRowsError.message }, { status: 500 });

    const rows = (Array.isArray(data) ? data : []) as unknown as TrafficEventRow[];
    const storageRows = (Array.isArray(mediaRowsRaw) ? mediaRowsRaw : []) as unknown as StorageMediaRow[];
    const qrxMap = new Map<string, QrxAgg>();
    const mediaMap = new Map<string, MediaAgg>();
    const variantMap = new Map<string, VariantAgg>();
    const storageByQrx = new Map<string, number>();
    const storageByMedia = new Map<string, StorageAgg>();

    let totalStorageBytes = 0;

    for (const media of storageRows) {
      const originalBytes = safeBytes(media.original_bytes) || safeBytes(media.bytes);
      const optimizedBytes = safeBytes(media.optimized_bytes);
      const storageBytes = originalBytes + optimizedBytes;
      totalStorageBytes += storageBytes;

      const qrxKey = media.qrx_id || "unknown";
      storageByQrx.set(qrxKey, (storageByQrx.get(qrxKey) ?? 0) + storageBytes);
      storageByMedia.set(media.id || "unknown", {
        id: media.id,
        qrxId: media.qrx_id,
        filename: media.filename,
        storageBytes,
      });
    }

    let totalBytes = 0;
    let todayBytes = 0;
    let monthBytes = 0;
    let weekBytes = 0;

    for (const row of rows) {
      const bytes = safeBytes(row.bytes);
      const today = isSameDay(row.created_at, startOfDay);
      const month = isSameMonth(row.created_at, startOfMonth);
      const week = isSameWeek(row.created_at, startOfWeek);

      totalBytes += bytes;
      if (today) todayBytes += bytes;
      if (month) monthBytes += bytes;
      if (week) weekBytes += bytes;

      const qrxKey = row.qrx_id || "unknown";
      const qrxExisting = qrxMap.get(qrxKey) ?? {
        qrxId: row.qrx_id,
        title: row.qr_x_entries?.[0]?.title ?? null,
        companyName: row.qr_x_entries?.[0]?.company_name ?? null,
        eventCount: 0,
        totalBytes: 0,
        todayBytes: 0,
        monthBytes: 0,
        weekBytes: 0,
        lastSeenAt: null,
      };
      qrxExisting.eventCount += 1;
      qrxExisting.totalBytes += bytes;
      if (today) qrxExisting.todayBytes += bytes;
      if (month) qrxExisting.monthBytes += bytes;
      if (week) qrxExisting.weekBytes += bytes;
      qrxExisting.lastSeenAt = maxDate(qrxExisting.lastSeenAt, row.created_at);
      qrxMap.set(qrxKey, qrxExisting);

      const mediaKey = `${row.media_id || "unknown"}:${row.variant || "unknown"}`;
      const mediaExisting = mediaMap.get(mediaKey) ?? {
        mediaId: row.media_id,
        qrxId: row.qrx_id,
        filename: row.qr_x_media?.[0]?.filename ?? null,
        variant: row.variant ?? null,
        eventCount: 0,
        totalBytes: 0,
        todayBytes: 0,
        monthBytes: 0,
        weekBytes: 0,
        lastSeenAt: null,
      };
      mediaExisting.eventCount += 1;
      mediaExisting.totalBytes += bytes;
      if (today) mediaExisting.todayBytes += bytes;
      if (month) mediaExisting.monthBytes += bytes;
      if (week) mediaExisting.weekBytes += bytes;
      mediaExisting.lastSeenAt = maxDate(mediaExisting.lastSeenAt, row.created_at);
      mediaMap.set(mediaKey, mediaExisting);

      const variantKey = row.variant || "unknown";
      const variantExisting = variantMap.get(variantKey) ?? {
        variant: variantKey,
        eventCount: 0,
        totalBytes: 0,
        todayBytes: 0,
        weekBytes: 0,
        monthBytes: 0,
        sharePercent: 0,
      };
      variantExisting.eventCount += 1;
      variantExisting.totalBytes += bytes;
      if (today) variantExisting.todayBytes += bytes;
      if (week) variantExisting.weekBytes += bytes;
      if (month) variantExisting.monthBytes += bytes;
      variantMap.set(variantKey, variantExisting);
    }

    const topQrx = [...qrxMap.values()].sort((a, b) => b.totalBytes - a.totalBytes).slice(0, 25);
    const topMedia = [...mediaMap.values()].sort((a, b) => b.totalBytes - a.totalBytes).slice(0, 25);
    const topQrxWeek = [...qrxMap.values()].sort((a, b) => b.weekBytes - a.weekBytes).slice(0, 10);
    const topMediaWeek = [...mediaMap.values()].sort((a, b) => b.weekBytes - a.weekBytes).slice(0, 10);

    const topVariants = [...variantMap.values()]
      .map((variant) => ({
        ...variant,
        sharePercent: totalBytes > 0 ? Math.round((variant.totalBytes / totalBytes) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.totalBytes - a.totalBytes);

    const enrichedQrx = [...qrxMap.values()].map((item) => {
      const storageBytes = storageByQrx.get(item.qrxId || "unknown") ?? 0;
      const estimatedTrafficCostCents = estimateEgressCostCents(item.totalBytes);
      const estimatedStorageCostCents = estimateStorageCostCents(storageBytes);
      return {
        ...item,
        storageBytes,
        estimatedTrafficCostCents,
        estimatedStorageCostCents,
        estimatedTotalCostCents: estimatedTrafficCostCents + estimatedStorageCostCents,
      };
    });

    const enrichedMedia = [...mediaMap.values()].map((item) => {
      const storage = storageByMedia.get(item.mediaId || "unknown");
      const storageBytes = storage?.storageBytes ?? 0;
      const estimatedTrafficCostCents = estimateEgressCostCents(item.totalBytes);
      const estimatedStorageCostCents = estimateStorageCostCents(storageBytes);
      return {
        ...item,
        filename: item.filename || storage?.filename || null,
        storageBytes,
        estimatedTrafficCostCents,
        estimatedStorageCostCents,
        estimatedTotalCostCents: estimatedTrafficCostCents + estimatedStorageCostCents,
      };
    });

    const topCostQrx = [...enrichedQrx].sort((a, b) => (b.estimatedTotalCostCents ?? 0) - (a.estimatedTotalCostCents ?? 0)).slice(0, 25);
    const topCostMedia = [...enrichedMedia].sort((a, b) => (b.estimatedTotalCostCents ?? 0) - (a.estimatedTotalCostCents ?? 0)).slice(0, 25);

    const largestQrxBytes = topQrx[0]?.totalBytes ?? 0;
    const largestMediaBytes = topMedia[0]?.totalBytes ?? 0;
    const largestQrxSharePercent = totalBytes > 0 ? Math.round((largestQrxBytes / totalBytes) * 1000) / 10 : 0;
    const averageBytesPerEvent = rows.length > 0 ? Math.round(totalBytes / rows.length) : 0;
    const estimatedCostCents = estimateEgressCostCents(totalBytes);
    const estimatedTodayCostCents = estimateEgressCostCents(todayBytes);
    const estimatedWeekCostCents = estimateEgressCostCents(weekBytes);
    const estimatedMonthCostCents = estimateEgressCostCents(monthBytes);
    const estimatedStorageCostCents = estimateStorageCostCents(totalStorageBytes);
    const estimatedTotalCostCents = estimatedMonthCostCents + estimatedStorageCostCents;

    const healthStatus =
      largestQrxSharePercent >= 70
        ? "critical"
        : largestQrxSharePercent >= 40
          ? "watch"
          : rows.length > 0
            ? "healthy"
            : "empty";

    return NextResponse.json({
      ok: true,
      summary: {
        eventCount: rows.length,
        totalBytes,
        todayBytes,
        monthBytes,
        weekBytes,
        mediaCount: mediaMap.size,
        qrxCount: qrxMap.size,
        estimatedCostCents,
        estimatedTodayCostCents,
        estimatedWeekCostCents,
        estimatedMonthCostCents,
        estimatedStorageCostCents,
        estimatedTotalCostCents,
        totalStorageBytes,
        trafficEgressCostCentsPerGb: TRAFFIC_EGRESS_COST_CENTS_PER_GB,
        storageCostCentsPerGbMonth: STORAGE_COST_CENTS_PER_GB_MONTH,
        largestQrxBytes,
        largestMediaBytes,
        largestQrxSharePercent,
        averageBytesPerEvent,
        healthStatus,
      },
      topQrx,
      topMedia,
      topQrxWeek,
      topMediaWeek,
      topCostQrx,
      topCostMedia,
      topVariants,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
