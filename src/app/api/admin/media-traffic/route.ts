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
  lastSeenAt: string | null;
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

    const rows = (Array.isArray(data) ? data : []) as unknown as TrafficEventRow[];
    const qrxMap = new Map<string, QrxAgg>();
    const mediaMap = new Map<string, MediaAgg>();

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
    }

    const topQrx = [...qrxMap.values()].sort((a, b) => b.totalBytes - a.totalBytes).slice(0, 25);
    const topMedia = [...mediaMap.values()].sort((a, b) => b.totalBytes - a.totalBytes).slice(0, 25);

    // Grobe Egress-Schätzung: 0,09 € pro GB. Nur als Orientierung, echte Supabase-Kosten bitte später konfigurieren.
    const estimatedCostCents = Math.round((totalBytes / 1024 / 1024 / 1024) * 9);

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
      },
      topQrx,
      topMedia,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
