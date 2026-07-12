"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useMemo } from "react";

type MediaEventType =
  | "image_view"
  | "file_open"
  | "file_download"
  | "variant_delivery";

type MediaVariant = "thumb" | "medium" | "large" | "original";
type MediaType = "image" | "file";
type InteractionMode = "open" | "download";

type Props = {
  qrxId: string;
  mediaId: string;
  mediaType: MediaType;
  eventType: MediaEventType;
  variant: MediaVariant;
  source: string;
  href: string;
  mode: InteractionMode;
  filename?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  children: ReactNode;
};

const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

function getSessionId() {
  const storageKey = "mioseg_media_analytics_session";

  try {
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) return existing;

    const next =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.sessionStorage.setItem(storageKey, next);
    return next;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function shouldTrack(key: string) {
  try {
    const storageKey = `mioseg_media_event:${key}`;
    const lastValue = window.sessionStorage.getItem(storageKey);
    const lastTime = Number(lastValue ?? 0);
    const now = Date.now();

    if (Number.isFinite(lastTime) && now - lastTime < DEDUPE_WINDOW_MS) {
      return false;
    }

    window.sessionStorage.setItem(storageKey, String(now));
    return true;
  } catch {
    return true;
  }
}

async function trackEvent(payload: {
  qrxId: string;
  mediaId: string;
  mediaType: MediaType;
  eventType: MediaEventType;
  variant: MediaVariant;
  source: string;
}) {
  const dedupeKey = [
    payload.qrxId,
    payload.mediaId,
    payload.eventType,
    payload.variant,
    payload.source,
  ].join(":");

  if (!shouldTrack(dedupeKey)) return;

  try {
    await fetch("/api/media/analytics/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        qrx_id: payload.qrxId,
        media_id: payload.mediaId,
        media_type: payload.mediaType,
        event_type: payload.eventType,
        variant: payload.variant,
        source: payload.source,
        session_id: getSessionId(),
      }),
    });
  } catch (error) {
    console.warn("Media Analytics konnten nicht übertragen werden:", error);
  }
}

export default function MediaInteractionLink({
  qrxId,
  mediaId,
  mediaType,
  eventType,
  variant,
  source,
  href,
  mode,
  filename,
  style,
  ariaLabel,
  children,
}: Props) {
  const payload = useMemo(
    () => ({
      qrxId,
      mediaId,
      mediaType,
      eventType,
      variant,
      source,
    }),
    [eventType, mediaId, mediaType, qrxId, source, variant],
  );

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const trackingPromise = trackEvent(payload);

    if (mode === "open") {
      const targetWindow = window.open(href, "_blank", "noopener,noreferrer");
      void trackingPromise;

      if (!targetWindow) {
        window.location.href = href;
      }

      return;
    }

    await trackingPromise;

    const link = document.createElement("a");
    link.href = href;
    link.download = filename?.trim() || "download";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      style={style}
      aria-label={ariaLabel}
      download={mode === "download" ? filename : undefined}
    >
      {children}
    </a>
  );
}
