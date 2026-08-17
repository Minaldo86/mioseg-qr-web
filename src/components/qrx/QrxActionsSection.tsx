"use client";

import type { CSSProperties } from "react";
import styles from "@/app/[locale]/dashboard/dashboard.module.css";

type Props = {
  isOwner: boolean;
  hasSaved: boolean;
  currentUserId: string | null;
  saveLoading: boolean;
  followerCount: string;
  qrImageUrl: string;
  title: string;
  onToggleSave: () => void;
  onDownloadQr: () => void;
  onCopyLink: () => void;
  labels?: {
    aria: string; own: string; followed: string; follow: string; ownHint: string;
    savedHint: string; followHint: string; loginHint: string; wait: string;
    savedBy: string; image: string; imageHint: string; qrAlt: string; download: string; copy: string;
  };
};

export default function QrxActionsSection({
  isOwner,
  hasSaved,
  currentUserId,
  saveLoading,
  followerCount,
  qrImageUrl,
  title,
  onToggleSave,
  onDownloadQr,
  onCopyLink,
  labels = {
    aria: "QR-X Aktionen",
    own: "Eigener QR-X",
    followed: "Gefolgt",
    follow: "Folgen",
    ownHint: "Du bist der Besitzer dieses QR-X. Er ist automatisch in deinen erstellten QR-X sichtbar.",
    savedHint: "Dieser QR-X ist aktuell in deinen gespeicherten Einträgen.",
    followHint: "Du kannst diesem QR-X folgen, um ihn in deiner App und im Web wiederzufinden.",
    loginHint: "Melde dich an, um diesem QR-X zu folgen.",
    wait: "Bitte warten …",
    savedBy: "Gespeichert von {{count}}",
    image: "QR-X Bild",
    imageHint: "Lade den QR-Code als Bild herunter oder kopiere den öffentlichen Link.",
    qrAlt: "QR-Code für {{title}}",
    download: "QR-Code herunterladen",
    copy: "Link kopieren",
  },
}: Props) {
  return (
    <section style={actionsLayoutStyle} aria-label={labels.aria}>
      <div style={followBoxStyle}>
        <div>
          <h2 style={boxTitleStyle}>{isOwner ? labels.own : hasSaved ? labels.followed : labels.follow}</h2>
          <p style={boxHintStyle}>
            {isOwner
              ? labels.ownHint
              : currentUserId
                ? hasSaved
                  ? labels.savedHint
                  : labels.followHint
                : labels.loginHint}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleSave}
          disabled={isOwner || saveLoading || !currentUserId}
          className={styles.primaryButton}
          style={{ border: 0, cursor: isOwner || saveLoading || !currentUserId ? "not-allowed" : "pointer", opacity: isOwner || saveLoading || !currentUserId ? 0.82 : 1 }}
        >
          {isOwner ? `👑 ${labels.own}` : saveLoading ? labels.wait : hasSaved ? `✓ ${labels.followed}` : `+ ${labels.follow}`}
        </button>

        <span style={saveCountStyle}>{labels.savedBy.replace("{{count}}", followerCount)}</span>
      </div>

      <div style={qrDownloadBoxStyle}>
        <div>
          <h2 style={boxTitleStyle}>{labels.image}</h2>
          <p style={boxHintStyle}>{labels.imageHint}</p>
        </div>

        {qrImageUrl ? <img src={qrImageUrl} alt={labels.qrAlt.replace("{{title}}", title)} style={qrImageStyle} /> : null}

        <div style={qrButtonRowStyle}>
          <button type="button" onClick={onDownloadQr} className={styles.primaryButton} style={{ border: 0 }}>
            {labels.download}
          </button>
          <button type="button" onClick={onCopyLink} className={styles.secondaryButton} style={{ border: 0 }}>
            {labels.copy}
          </button>
        </div>
      </div>
    </section>
  );
}

const actionsLayoutStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 20 };
const followBoxStyle: CSSProperties = { borderRadius: 24, padding: 18, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(147,197,253,0.22)", display: "grid", gap: 14 };
const qrDownloadBoxStyle: CSSProperties = { borderRadius: 24, padding: 18, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.09)", display: "grid", gap: 14 };
const boxTitleStyle: CSSProperties = { margin: "0 0 6px", color: "#ffffff", fontSize: 20, fontWeight: 950 };
const boxHintStyle: CSSProperties = { margin: 0, color: "#94a3b8", lineHeight: 1.55, fontSize: 13, fontWeight: 760 };
const saveCountStyle: CSSProperties = { color: "#bfdbfe", fontSize: 13, fontWeight: 900 };
const qrImageStyle: CSSProperties = { width: 180, height: 180, borderRadius: 22, background: "#ffffff", padding: 12, justifySelf: "center" };
const qrButtonRowStyle: CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
