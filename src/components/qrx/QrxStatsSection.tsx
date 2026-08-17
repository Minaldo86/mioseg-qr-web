"use client";

import type { CSSProperties } from "react";

type Stat = { label: string; value: string; icon: string };

export default function QrxStatsSection({ stats, ariaLabel = "QR-X Kennzahlen" }: { stats: Stat[]; ariaLabel?: string }) {
  return (
    <section style={statsGridStyle} aria-label={ariaLabel}>
      {stats.map((item) => (
        <article key={item.label} style={statCardStyle}>
          <span style={statIconStyle}>{item.icon}</span>
          <div>
            <strong style={statValueStyle}>{item.value}</strong>
            <span style={statLabelStyle}>{item.label}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

const statsGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 16 };
const statCardStyle: CSSProperties = { borderRadius: 22, padding: 16, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", gap: 12 };
const statIconStyle: CSSProperties = { width: 42, height: 42, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.08)", fontSize: 20 };
const statValueStyle: CSSProperties = { display: "block", color: "#ffffff", fontSize: 22, fontWeight: 950 };
const statLabelStyle: CSSProperties = { display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 850 };
