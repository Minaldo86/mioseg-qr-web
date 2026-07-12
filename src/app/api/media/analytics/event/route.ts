import { createHmac } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MediaAnalyticsEventType =
  | "image_view"
  | "file_open"
  | "file_download"
  | "variant_delivery";

type MediaAnalyticsVariant = "thumb" | "medium" | "large" | "original";
type MediaAnalyticsMediaType = "image" | "file";

type MediaAnalyticsPayload = {
  event_type?: unknown;
  qrx_id?: unknown;
  media_id?: unknown;
  media_type?: unknown;
  variant?: unknown;
  session_id?: unknown;
  source?: unknown;
};

const EVENT_TYPES = new Set<MediaAnalyticsEventType>([
  "image_view",
  "file_open",
  "file_download",
  "variant_delivery",
]);

const VARIANTS = new Set<MediaAnalyticsVariant>([
  "thumb",
  "medium",
  "large",
  "original",
]);

const MEDIA_TYPES = new Set<MediaAnalyticsMediaType>(["image", "file"]);

const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|twitterbot|linkedinbot|embedly|quora link preview|skypeuripreview|headlesschrome|lighthouse|pagespeed/i;

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

function getDailyRotationKey() {
  return new Date().toISOString().slice(0, 10);
}

function createVisitorHash(request: NextRequest, sessionId: string) {
  const secret =
    process.env.MEDIA_ANALYTICS_HASH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("MEDIA_ANALYTICS_HASH_SECRET fehlt.");
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) || "unknown";
  const language = request.headers.get("accept-language")?.slice(0, 120) || "";
  const rotationKey = getDailyRotationKey();

  return createHmac("sha256", secret)
    .update(`${rotationKey}|${ip}|${userAgent}|${language}|${sessionId}`)
    .digest("hex");
}

function isLikelyBot(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  if (!userAgent.trim()) return true;
  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase-Serverkonfiguration fehlt.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    if (isLikelyBot(request)) {
      return NextResponse.json({ ok: true, ignored: "bot" });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type muss application/json sein." },
        { status: 415 },
      );
    }

    const payload = (await request.json()) as MediaAnalyticsPayload;

    if (
      !isNonEmptyString(payload.event_type, 40) ||
      !EVENT_TYPES.has(payload.event_type as MediaAnalyticsEventType)
    ) {
      return NextResponse.json(
        { error: "Ungültiger Analytics-Eventtyp." },
        { status: 400 },
      );
    }

    if (!isNonEmptyString(payload.qrx_id, 80) || !isUuid(payload.qrx_id)) {
      return NextResponse.json(
        { error: "Ungültige QR-X-ID." },
        { status: 400 },
      );
    }

    if (!isNonEmptyString(payload.media_id, 80) || !isUuid(payload.media_id)) {
      return NextResponse.json(
        { error: "Ungültige Media-ID." },
        { status: 400 },
      );
    }

    if (
      !isNonEmptyString(payload.media_type, 20) ||
      !MEDIA_TYPES.has(payload.media_type as MediaAnalyticsMediaType)
    ) {
      return NextResponse.json(
        { error: "Ungültiger Medientyp." },
        { status: 400 },
      );
    }

    if (
      !isNonEmptyString(payload.variant, 20) ||
      !VARIANTS.has(payload.variant as MediaAnalyticsVariant)
    ) {
      return NextResponse.json(
        { error: "Ungültige Medienvariante." },
        { status: 400 },
      );
    }

    if (!isNonEmptyString(payload.session_id, 120)) {
      return NextResponse.json(
        { error: "Ungültige Analytics-Session." },
        { status: 400 },
      );
    }

    const source = isNonEmptyString(payload.source, 80)
      ? payload.source.trim()
      : "web_public_qrx";

    const eventType = payload.event_type as MediaAnalyticsEventType;
    const mediaType = payload.media_type as MediaAnalyticsMediaType;
    const variant = payload.variant as MediaAnalyticsVariant;
    const qrxId = payload.qrx_id.trim();
    const mediaId = payload.media_id.trim();
    const visitorHash = createVisitorHash(request, payload.session_id.trim());

    if (eventType === "image_view" && mediaType !== "image") {
      return NextResponse.json(
        { error: "image_view ist nur für Bilder erlaubt." },
        { status: 400 },
      );
    }

    if (
      (eventType === "file_open" || eventType === "file_download") &&
      mediaType !== "file"
    ) {
      return NextResponse.json(
        { error: `${eventType} ist nur für Dateien erlaubt.` },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.rpc(
      "record_media_analytics_event",
      {
        p_event_type: eventType,
        p_qrx_id: qrxId,
        p_media_id: mediaId,
        p_media_type: mediaType,
        p_variant: variant,
        p_visitor_hash: visitorHash,
        p_source: source,
      },
    );

    if (error) {
      console.error("record_media_analytics_event error:", error);
      return NextResponse.json(
        { error: "Analytics-Ereignis konnte nicht gespeichert werden." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      recorded: data !== false,
    });
  } catch (error) {
    console.error("media analytics route error:", error);
    return NextResponse.json(
      { error: "Media Analytics konnte nicht verarbeitet werden." },
      { status: 500 },
    );
  }
}
