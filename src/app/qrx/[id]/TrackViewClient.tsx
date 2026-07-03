"use client";

import { useEffect } from "react";

const VIEW_DEDUPE_MS = 6 * 60 * 60 * 1000;

function getOrCreateVisitorId(): string {
  try {
    const key = "miosegqr_visitor_id_v1";
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem(key, id);
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export default function TrackViewClient({ qrxId }: { qrxId: string }) {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (!qrxId) return;

        const visitorId = getOrCreateVisitorId();
        const dedupeKey = `miosegqr_viewed_${qrxId}`;
        const last = Number(localStorage.getItem(dedupeKey) ?? "0");
        const now = Date.now();

        if (last && Number.isFinite(last) && now - last < VIEW_DEDUPE_MS) return;

        const res = await fetch("/api/qrx/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrxId,
            visitorHash: visitorId,
          }),
        });

        if (cancelled) return;

        if (res.ok) {
          localStorage.setItem(dedupeKey, String(now));
        }
      } catch {
        // Tracking darf nie die UI kaputt machen.
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [qrxId]);

  return null;
}
