"use client";

import { useEffect } from "react";

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
    // Falls localStorage nicht geht -> fallback (nicht perfekt, aber bricht nichts)
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

        // optional: lokale Dedupe, damit wir nicht bei jedem Reload spammen (z.B. 1x pro 6h)
        const dedupeKey = `miosegqr_viewed_${qrxId}`;
        const last = Number(localStorage.getItem(dedupeKey) ?? "0");
        const now = Date.now();
        const sixHours = 6 * 60 * 60 * 1000;

        if (last && now - last < sixHours) return;

        const res = await fetch("/api/qrx/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrxId,
            visitorHash: visitorId, // wir benutzen hier visitorId als hash (stabil pro Browser)
          }),
        });

        if (cancelled) return;

        // Wenn ok -> timestamp setzen
        if (res.ok) {
          localStorage.setItem(dedupeKey, String(now));
        }
      } catch {
        // tracking darf nie UI killen
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [qrxId]);

  return null;
}