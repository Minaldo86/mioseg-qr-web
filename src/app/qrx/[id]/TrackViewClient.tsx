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

        // Wichtig:
        // Web ruft die Statistik-Engine bewusst bei jedem Öffnen auf.
        // Dadurch kann views_total jeden echten Öffnungsvorgang zählen.
        // views_unique_total bleibt serverseitig durch viewerKey geschützt.
        const res = await fetch("/api/qrx/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrxId,
            visitorHash: visitorId,
          }),
        });

        if (cancelled) return;

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn("track-view failed:", res.status, text);
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
