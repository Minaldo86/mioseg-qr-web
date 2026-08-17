"use client";

import type { CSSProperties } from "react";
import styles from "@/app/[locale]/dashboard/dashboard.module.css";

type NewsItem = { id: string; text: string; createdAt: string };

type Props = {
  items: NewsItem[];
  formatDate: (value: string) => string;
  labels?: { title: string; hint: string; count: string; empty: string; emptyHint: string };
};

export default function QrxNewsSection({ items, formatDate, labels = {
  title: "News & Updates", hint: "Aktuelle Informationen und Änderungen dieses QR-X.",
  count: "{{count}} Updates", empty: "Noch keine Updates vorhanden.",
  emptyHint: "Wenn der Ersteller neue Informationen hinzufügt, erscheinen sie hier.",
} }: Props) {
  return (
    <section style={panelStyle}>
      <div className={styles.cardHeader}>
        <div>
          <h2>{labels.title}</h2>
          <p>{labels.hint}</p>
        </div>
        <span>{labels.count.replace("{{count}}", String(items.length))}</span>
      </div>

      {items.length > 0 ? (
        <div style={newsListStyle}>
          {items.map((item) => (
            <article key={item.id} style={newsCardStyle}>
              <div style={newsDateStyle}>{formatDate(item.createdAt)}</div>
              <p style={newsTextStyle}>{item.text}</p>
            </article>
          ))}
        </div>
      ) : (
        <div style={emptyStateStyle}>
          <strong>{labels.empty}</strong>
          <span>{labels.emptyHint}</span>
        </div>
      )}
    </section>
  );
}

const panelStyle: CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", borderRadius: 30, background: "rgba(15, 23, 42, 0.82)", border: "1px solid rgba(148, 163, 184, 0.16)", boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)", padding: 22 };
const newsListStyle: CSSProperties = { display: "grid", gap: 12 };
const newsCardStyle: CSSProperties = { borderRadius: 22, padding: 16, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)", display: "grid", gap: 8 };
const newsDateStyle: CSSProperties = { color: "#93c5fd", fontSize: 12, fontWeight: 950 };
const newsTextStyle: CSSProperties = { margin: 0, color: "#dbeafe", lineHeight: 1.65, fontWeight: 750, whiteSpace: "pre-wrap" };
const emptyStateStyle: CSSProperties = { borderRadius: 22, padding: 18, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", display: "grid", gap: 6 };
