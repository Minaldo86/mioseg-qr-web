// src/app/transfer/[token]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabasePublic } from "@/lib/supabase-public"; // <- falls dein Export anders heißt: anpassen

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function safeToken(input: unknown) {
  const t = String(input ?? "").trim();
  return t.length > 0 ? t : "";
}

function fmtRemaining(seconds: number) {
  if (seconds <= 0) return "00:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (v: number) => String(v).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

type TransferInfo = {
  token?: string | null;
  status?: string | null; // z.B. "pending" | "accepted" | "expired" | "canceled"
  expires_at?: string | null;
  created_at?: string | null;
  accepted_at?: string | null;

  recipient_email?: string | null;
  qrx_id?: string | null;

  // falls deine RPC das liefert (nice-to-have)
  qrx_title?: string | null;
};

type UiState =
  | { kind: "loading" }
  | { kind: "invalid"; message: string }
  | { kind: "expired"; message: string; info?: TransferInfo }
  | { kind: "accepted"; message: string; info?: TransferInfo }
  | { kind: "pending"; info: TransferInfo };

export default function TransferTokenPage() {
  const params = useParams();

  // Next 15 typed routes: params kann string oder string[] sein
  const token = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)?.token;
    const v = Array.isArray(raw) ? raw[0] : raw;
    return safeToken(v);
  }, [params]);

  const [ui, setUi] = useState<UiState>({ kind: "loading" });

  const [qrxTitle, setQrxTitle] = useState<string | null>(null);

  const [remainingSec, setRemainingSec] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

  const [triedOpen, setTriedOpen] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Deep Link -> App öffnet Transfer Screen
  const appDeepLink = useMemo(() => {
    return token ? `miosegqr://transfer/${encodeURIComponent(token)}` : "";
  }, [token]);

  // Universal Link (diese Seite)
  const universalLink = useMemo(() => {
    return token ? `https://mioseg-qr.com/transfer/${encodeURIComponent(token)}` : "https://mioseg-qr.com";
  }, [token]);

  const storeLink = useMemo(() => {
    if (isAndroid()) {
      // TODO: Sobald Play Store live: ersetzen (oder lassen, wenn korrekt)
      return "https://play.google.com/store/apps/details?id=com.mioseg.qr";
    }
    if (isIOS()) {
      // TODO: Sobald App Store live: ersetzen
      return "https://apps.apple.com/";
    }
    return "https://mioseg-qr.com/get-app";
  }, []);

  const stopTimer = () => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = (expiresAtIso: string) => {
    stopTimer();

    const tick = () => {
      const now = Date.now();
      const exp = new Date(expiresAtIso).getTime();
      const sec = Math.floor((exp - now) / 1000);
      setRemainingSec(sec > 0 ? sec : 0);

      if (sec <= 0) {
        stopTimer();
        setUi((prev) => {
          if (prev.kind === "pending") {
            return { kind: "expired", message: "Dieser Transfer-Link ist abgelaufen.", info: prev.info };
          }
          return prev;
        });
      }
    };

    tick();
    intervalRef.current = window.setInterval(tick, 1000);
  };

  const computeStatus = (info: TransferInfo) => {
    const status = (info.status ?? "").toLowerCase().trim();

    if (info.accepted_at) return "accepted";
    if (status === "accepted") return "accepted";
    if (status === "canceled" || status === "cancelled") return "canceled";

    if (info.expires_at) {
      const exp = new Date(info.expires_at).getTime();
      if (Number.isFinite(exp) && exp <= Date.now()) return "expired";
    }
    if (status === "expired") return "expired";

    return "pending";
  };

  const loadTransferInfo = async () => {
    if (!token) {
      setUi({ kind: "invalid", message: "Ungültiger Transfer-Link (Token fehlt)." });
      return;
    }

    setUi({ kind: "loading" });
    setQrxTitle(null);
    setShowFallback(false);
    setTriedOpen(false);
    stopTimer();
    setRemainingSec(0);

    // 1) Transfer-Info via RPC (du hast: get_qrx_transfer_info(p_token text))
    const { data, error } = await supabasePublic.rpc("get_qrx_transfer_info", {
      p_token: token,
    });

    if (error) {
      setUi({ kind: "invalid", message: `Transfer konnte nicht geprüft werden. (${error.message})` });
      return;
    }

    const row = (Array.isArray(data) ? data[0] : data) as TransferInfo | null;

    if (!row) {
      setUi({ kind: "invalid", message: "Dieser Transfer-Link ist ungültig oder existiert nicht mehr." });
      return;
    }

    const status = computeStatus(row);

    // QR-X Name aus RPC übernehmen, wenn vorhanden
    if (row.qrx_title && row.qrx_title.trim()) {
      setQrxTitle(row.qrx_title.trim());
    } else if (row.qrx_id) {
      // 2) Optionaler Fallback: QR-X Title aus qr_x_entries holen (wenn Policies es erlauben)
      const { data: eData } = await supabasePublic
        .from("qr_x_entries")
        .select("title")
        .eq("id", row.qrx_id)
        .maybeSingle();
      const t = (eData?.title as unknown);
      const title = typeof t === "string" ? t.trim() : "";
      if (title) setQrxTitle(title);
    }

    if (row.expires_at) startTimer(row.expires_at);

    if (status === "expired") {
      setUi({ kind: "expired", message: "Dieser Transfer-Link ist abgelaufen.", info: row });
      return;
    }

    if (status === "accepted") {
      setUi({ kind: "accepted", message: "Dieser Transfer wurde bereits angenommen.", info: row });
      return;
    }

    if (status === "canceled") {
      setUi({ kind: "invalid", message: "Dieser Transfer wurde abgebrochen." });
      return;
    }

    setUi({ kind: "pending", info: row });
  };

  useEffect(() => {
    loadTransferInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-Open App (nur wenn Transfer pending & mobile)
  useEffect(() => {
    if (ui.kind !== "pending") return;
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
  }, [ui.kind, token, appDeepLink]);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const onOpenApp = () => {
    if (!token) return;
    setTriedOpen(true);
    window.location.href = appDeepLink;
    window.setTimeout(() => setShowFallback(true), 1200);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(universalLink);
      alert("Link kopiert ✅");
    } catch {
      alert("Kopieren nicht möglich – bitte manuell markieren.");
    }
  };

  // ---------- UI helpers ----------
  const recipientEmail =
    ui.kind === "pending"
      ? ui.info.recipient_email ?? null
      : ui.kind === "expired"
        ? ui.info?.recipient_email ?? null
        : ui.kind === "accepted"
          ? ui.info?.recipient_email ?? null
          : null;

  const expiresAt =
    ui.kind === "pending"
      ? ui.info.expires_at ?? null
      : ui.kind === "expired"
        ? ui.info?.expires_at ?? null
        : ui.kind === "accepted"
          ? ui.info?.expires_at ?? null
          : null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoDot} />
          <div style={styles.logoText}>mioseg qr</div>
        </div>

        <h1 style={styles.h1}>QR-X Übertragung</h1>

        {ui.kind === "loading" && (
          <p style={styles.p}>Transfer wird geprüft…</p>
        )}

        {ui.kind === "invalid" && (
          <>
            <p style={styles.p}>{ui.message}</p>
            <a style={styles.secondaryBtn} href="https://mioseg-qr.com">
              Zur Startseite
            </a>
          </>
        )}

        {(ui.kind === "expired" || ui.kind === "accepted") && (
          <>
            <div style={styles.badgeRow}>
              <span style={{ ...styles.badge, ...(ui.kind === "expired" ? styles.badgeRed : styles.badgeYellow) }}>
                {ui.kind === "expired" ? "Abgelaufen" : "Bereits angenommen"}
              </span>
            </div>

            <p style={styles.p}>{ui.message}</p>

            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>QR-X</div>
                <div style={styles.infoValue}>{qrxTitle ?? "—"}</div>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Empfänger</div>
                <div style={styles.infoValue}>{recipientEmail ?? "—"}</div>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Gültig bis</div>
                <div style={styles.infoValue}>{expiresAt ? new Date(expiresAt).toLocaleString() : "—"}</div>
              </div>
            </div>

            <div style={styles.hr} />

            <h2 style={styles.h2}>App nicht installiert?</h2>
            <p style={styles.p}>Installiere mioseg qr und öffne danach den Link erneut.</p>

            <a style={styles.secondaryBtn} href={storeLink} target="_blank" rel="noreferrer">
              App herunterladen
            </a>

            <button style={styles.ghostBtn} onClick={onCopy}>
              Link kopieren
            </button>
          </>
        )}

        {ui.kind === "pending" && (
          <>
            <p style={styles.p}>
              Wir öffnen jetzt die App, damit du die Übertragung annehmen kannst.
            </p>

            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>QR-X</div>
                <div style={styles.infoValue}>{qrxTitle ?? "—"}</div>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Empfänger</div>
                <div style={styles.infoValue}>{recipientEmail ?? "—"}</div>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Läuft ab in</div>
                <div style={styles.infoValue}>
                  {expiresAt ? fmtRemaining(remainingSec) : "—"}
                </div>
              </div>
            </div>

            <button style={styles.primaryBtn} onClick={onOpenApp}>
              In App öffnen
            </button>

            <div style={styles.smallBox}>
              <div style={styles.smallTitle}>Falls du nicht eingeloggt bist:</div>
              <div style={styles.smallText}>
                Bitte in der App einloggen – danach kannst du den Transfer annehmen.
              </div>
            </div>

            {(showFallback || !triedOpen) && (
              <>
                <div style={{ height: 10 }} />
                <div style={styles.hr} />

                <h2 style={styles.h2}>App nicht installiert?</h2>
                <p style={styles.p}>
                  Installiere mioseg qr und öffne danach den Link erneut.
                </p>

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

            <div style={{ marginTop: 12 }}>
              <button style={styles.tinyBtn} onClick={loadTransferInfo}>
                Transfer erneut prüfen
              </button>
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
    maxWidth: 440,
    background: "#151518",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#4da3ff",
  },
  logoText: {
    fontWeight: 700,
    letterSpacing: 0.3,
    color: "#dfefff",
  },
  h1: {
    margin: "8px 0 10px 0",
    fontSize: 22,
  },
  h2: {
    margin: "12px 0 8px 0",
    fontSize: 16,
  },
  p: {
    margin: "0 0 12px 0",
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.5,
    fontSize: 14,
  },
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
    marginTop: 10,
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
  tinyBtn: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 600,
    cursor: "pointer",
  },
  smallBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  },
  smallTitle: {
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 4,
    color: "rgba(255,255,255,0.9)",
  },
  smallText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.45,
  },
  hr: {
    height: 1,
    background: "rgba(255,255,255,0.08)",
    margin: "14px 0",
  },
  mini: {
    marginTop: 12,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.45,
    wordBreak: "break-word",
  },
  link: {
    color: "#4da3ff",
    textDecoration: "none",
  },

  infoBox: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "6px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  infoLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    minWidth: 90,
  },
  infoValue: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textAlign: "right",
    wordBreak: "break-word",
  },

  badgeRow: {
    marginTop: 6,
    marginBottom: 8,
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  badgeRed: {
    background: "rgba(255, 90, 90, 0.18)",
    border: "1px solid rgba(255, 90, 90, 0.35)",
    color: "rgba(255,255,255,0.92)",
  },
  badgeYellow: {
    background: "rgba(255, 209, 102, 0.15)",
    border: "1px solid rgba(255, 209, 102, 0.35)",
    color: "rgba(255,255,255,0.92)",
  },
};
