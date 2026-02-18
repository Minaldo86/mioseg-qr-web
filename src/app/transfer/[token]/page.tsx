"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function safeToken(input: unknown): string {
  if (typeof input !== "string") return "";
  const t = input.trim();
  return t.length > 0 ? t : "";
}

export default function TransferTokenPage() {
  const params = useParams();

  // next/navigation liefert string | string[] | undefined
  const token = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)?.token;
    const v = Array.isArray(raw) ? raw[0] : raw;
    return safeToken(v);
  }, [params]);

  const [triedOpen, setTriedOpen] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // ✅ Deep Link (öffnet App, wenn installiert)
  const appDeepLink = useMemo(() => {
    return token ? `miosegqr://transfer/${encodeURIComponent(token)}` : "";
  }, [token]);

  // ✅ Universal Link (diese Seite)
  const universalLink = useMemo(() => {
    return token ? `https://mioseg-qr.com/transfer/${encodeURIComponent(token)}` : "https://mioseg-qr.com";
  }, [token]);

  // ✅ Store Links (Platzhalter bis App live ist)
  const storeLink = useMemo(() => {
    if (isAndroid()) return "https://play.google.com/store/apps/details?id=com.mioseg.qr";
    if (isIOS()) return "https://apps.apple.com/";
    return "https://mioseg-qr.com/get-app";
  }, []);

  useEffect(() => {
    if (!token) return;

    const mobile = isAndroid() || isIOS();
    if (!mobile) {
      setShowFallback(true);
      return;
    }

    setTriedOpen(true);
    window.location.href = appDeepLink;

    const t = window.setTimeout(() => setShowFallback(true), 1200);
    return () => window.clearTimeout(t);
  }, [token, appDeepLink]);

  const onOpenApp = () => {
    if (!token) return;
    setTriedOpen(true);
    window.location.href = appDeepLink;
    window.setTimeout(() => setShowFallback(true), 1200);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(universalLink);
      window.alert("Link kopiert ✅");
    } catch {
      window.alert("Kopieren nicht möglich – bitte manuell markieren.");
    }
  };

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Ungültiger Transfer-Link</h1>
          <p style={styles.p}>Der Token fehlt oder ist ungültig.</p>
          <a style={styles.link} href="https://mioseg-qr.com">
            Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoDot} />
          <div style={styles.logoText}>mioseg qr</div>
        </div>

        <h1 style={styles.h1}>QR-X Übertragung</h1>
        <p style={styles.p}>Wir öffnen jetzt die App, damit du die Übertragung annehmen kannst.</p>

        <button style={styles.primaryBtn} onClick={onOpenApp}>
          In App öffnen
        </button>

        <div style={styles.smallBox}>
          <div style={styles.smallTitle}>Falls du nicht eingeloggt bist:</div>
          <div style={styles.smallText}>Bitte in der App einloggen – danach kannst du den Transfer annehmen.</div>
        </div>

        {(showFallback || !triedOpen) && (
          <>
            <div style={{ height: 10 }} />
            <div style={styles.hr} />

            <h2 style={styles.h2}>App nicht installiert?</h2>
            <p style={styles.p}>Installiere mioseg qr und öffne danach den Link erneut.</p>

            <a style={styles.secondaryBtn} href={storeLink} target="_blank" rel="noreferrer">
              App herunterladen
            </a>

            <button style={styles.ghostBtn} onClick={onCopy}>
              Link kopieren
            </button>

            <div style={styles.mini}>
              Direktlink:{" "}
              <a style={styles.link} href={universalLink}>
                {universalLink}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f0f10",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#151518",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  logoDot: { width: 10, height: 10, borderRadius: 999, background: "#4da3ff" },
  logoText: { fontWeight: 700, letterSpacing: 0.3, color: "#dfefff" },
  h1: { margin: "8px 0 10px 0", fontSize: 22 },
  h2: { margin: "12px 0 8px 0", fontSize: 16 },
  p: { margin: "0 0 12px 0", color: "rgba(255,255,255,0.78)", lineHeight: 1.5, fontSize: 14 },
  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "#4da3ff",
    color: "#081018",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
  },
  secondaryBtn: {
    display: "block",
    width: "100%",
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 700,
    textDecoration: "none",
    marginTop: 8,
  },
  ghostBtn: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px dashed rgba(255,255,255,0.20)",
    background: "transparent",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10,
  },
  smallBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  },
  smallTitle: { fontSize: 12, fontWeight: 800, marginBottom: 4, color: "rgba(255,255,255,0.9)" },
  smallText: { fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.45 },
  hr: { height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" },
  mini: {
    marginTop: 12,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.45,
    wordBreak: "break-word",
  },
  link: { color: "#4da3ff", textDecoration: "none" },
};
