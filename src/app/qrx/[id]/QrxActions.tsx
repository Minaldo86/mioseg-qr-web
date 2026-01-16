// app/qrx/[id]/QrxActions.tsx
"use client";

import { useMemo, useState } from "react";

type Props = {
  qrxId: string;
  webBase?: string; // optional override
};

const DEFAULT_WEB_BASE = "https://mioseg-qr.com";

// Deine App Deep Links:
function buildOpenLink(qrxId: string) {
  // Öffnen
  return `miosegqr://qrx/${encodeURIComponent(qrxId)}`;
}

function buildSaveLink(qrxId: string) {
  // In App speichern (App soll ?save=1 auswerten)
  return `miosegqr://qrx/${encodeURIComponent(qrxId)}?save=1`;
}

// Optional: Expo Go Deep Link (nur DEV)
// NEXT_PUBLIC_EXPO_GO_BASE="exp://192.168.178.10:19000/--"
function buildExpoGoLink(qrxId: string, save: boolean) {
  const base = process.env.NEXT_PUBLIC_EXPO_GO_BASE;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/qrx/${encodeURIComponent(qrxId)}${save ? "?save=1" : ""}`;
}

export default function QrxActions({ qrxId, webBase }: Props) {
  const [hint, setHint] = useState<string | null>(null);

  const base = webBase || DEFAULT_WEB_BASE;
  const webLink = useMemo(() => `${base.replace(/\/+$/, "")}/qrx/${qrxId}`, [base, qrxId]);

  const openLink = useMemo(() => buildOpenLink(qrxId), [qrxId]);
  const saveLink = useMemo(() => buildSaveLink(qrxId), [qrxId]);

  const expoOpen = useMemo(() => buildExpoGoLink(qrxId, false), [qrxId]);
  const expoSave = useMemo(() => buildExpoGoLink(qrxId, true), [qrxId]);

  const tryOpen = (url: string) => {
    setHint(null);

    // Deep links werden vom Browser versucht zu öffnen.
    // Wenn App nicht installiert: Browser bleibt einfach hier -> wir zeigen Hinweis.
    window.location.href = url;

    // Nach kurzer Zeit Hinweis einblenden (Fallback)
    window.setTimeout(() => {
      setHint(
        "Wenn sich nichts geöffnet hat, ist die App vermutlich nicht installiert. " +
          "Installiere die MIOSEG QR App und versuche es erneut."
      );
    }, 900);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHint("Link kopiert ✅");
    } catch {
      setHint("Kopieren nicht möglich – bitte manuell markieren/kopieren.");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
      }}
    >
      <button
        onClick={() => tryOpen(openLink)}
        style={btnStylePrimary}
      >
        In App öffnen
      </button>

      <button
        onClick={() => tryOpen(saveLink)}
        style={btnStyle}
      >
        In App speichern (Updates erhalten)
      </button>

      {/* Optional DEV: Expo Go */}
      {expoOpen && (
        <button onClick={() => tryOpen(expoOpen)} style={btnStyleGhost}>
          (DEV) In Expo Go öffnen
        </button>
      )}
      {expoSave && (
        <button onClick={() => tryOpen(expoSave)} style={btnStyleGhost}>
          (DEV) In Expo Go speichern
        </button>
      )}

      <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => copy(webLink)} style={btnStyleSmall}>
            Web-Link kopieren
          </button>
          <button onClick={() => copy(`qrx:${qrxId}`)} style={btnStyleSmall}>
            QR-X Key kopieren (qrx:{qrxId})
          </button>
        </div>

        {hint && (
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: "18px" }}>
            {hint}
          </div>
        )}

        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: "17px" }}>
          Hinweis: „In App speichern“ sorgt dafür, dass die App intern <b>qrx:{qrxId}</b> speichert – dadurch bekommt der Nutzer Updates.
        </div>
      </div>
    </div>
  );
}

const btnStylePrimary: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "white",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};

const btnStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnStyleGhost: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px dashed rgba(255,255,255,0.25)",
  background: "transparent",
  color: "rgba(255,255,255,0.9)",
  fontWeight: 600,
  cursor: "pointer",
};

const btnStyleSmall: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};
