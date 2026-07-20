"use client";

import type { CSSProperties } from "react";
import styles from "@/app/[locale]/dashboard/dashboard.module.css";

export type QrxMediaDisplayItem = {
  id: string;
  type: string;
  url: string;
  filename: string | null;
  displayUrl: string;
  fullscreenUrl: string;
};

type Props = {
  imageItems: QrxMediaDisplayItem[];
  fileItems: QrxMediaDisplayItem[];
  totalCount: number;
  onImageOpen: (id: string) => void;
  onFileOpen: (id: string) => void;
  onFileDownload: (id: string) => void;
};

export default function QrxMediaSection({
  imageItems,
  fileItems,
  totalCount,
  onImageOpen,
  onFileOpen,
  onFileDownload,
}: Props) {
  if (imageItems.length === 0 && fileItems.length === 0) return null;

  return (
    <section style={panelStyle}>
      <div className={styles.cardHeader}>
        <div>
          <h2>Medien</h2>
          <p>Bilder und Dateien dieses QR-X.</p>
        </div>
        <span>{totalCount} Medien</span>
      </div>

      {imageItems.length > 0 ? (
        <>
          <h3 style={sectionSubTitleStyle}>Bilder</h3>
          <div style={galleryGridStyle}>
            {imageItems.map((item) => (
              <a
                key={item.id}
                href={item.fullscreenUrl}
                target="_blank"
                rel="noreferrer"
                style={galleryItemStyle}
                onClick={() => onImageOpen(item.id)}
              >
                <img src={item.displayUrl} alt={item.filename ?? "QR-X Bild"} style={galleryImageStyle} />
              </a>
            ))}
          </div>
        </>
      ) : null}

      {fileItems.length > 0 ? (
        <div style={{ marginTop: imageItems.length > 0 ? 18 : 0 }}>
          <h3 style={sectionSubTitleStyle}>Dateien</h3>
          <div style={fileListStyle}>
            {fileItems.map((item) => (
              <div key={item.id} style={fileItemStyle}>
                <span>📄 {item.filename ?? "Datei öffnen"}</span>
                <span style={fileActionRowStyle}>
                  <a href={item.url} target="_blank" rel="noreferrer" style={fileActionLinkStyle} onClick={() => onFileOpen(item.id)}>
                    Öffnen
                  </a>
                  <a href={item.url} download={item.filename ?? undefined} style={fileActionLinkStyle} onClick={() => onFileDownload(item.id)}>
                    Herunterladen
                  </a>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

const panelStyle: CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", borderRadius: 30, background: "rgba(15, 23, 42, 0.82)", border: "1px solid rgba(148, 163, 184, 0.16)", boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)", padding: 22 };
const sectionSubTitleStyle: CSSProperties = { margin: "0 0 12px", color: "#ffffff", fontSize: 18, fontWeight: 950 };
const galleryGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 };
const galleryItemStyle: CSSProperties = { display: "block", borderRadius: 22, overflow: "hidden", border: "1px solid rgba(255,255,255,0.105)", background: "rgba(255,255,255,0.055)" };
const galleryImageStyle: CSSProperties = { width: "100%", height: 190, objectFit: "cover", display: "block" };
const fileListStyle: CSSProperties = { display: "grid", gap: 10 };
const fileItemStyle: CSSProperties = { minHeight: 54, borderRadius: 18, padding: "0 14px", background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)", color: "#dbeafe", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontWeight: 900 };
const fileActionRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" };
const fileActionLinkStyle: CSSProperties = { color: "#bfdbfe", textDecoration: "none", fontWeight: 950 };
