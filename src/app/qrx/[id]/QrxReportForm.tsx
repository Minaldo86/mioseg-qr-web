"use client";

import { useState } from "react";

type Props = {
  qrxId: string;
};

type ReportReason =
  | "fake_or_fraud"
  | "wrong_business_info"
  | "spam"
  | "illegal_or_dangerous"
  | "copyright"
  | "other";

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "fake_or_fraud", label: "Betrug / Fake" },
  { value: "wrong_business_info", label: "Falsche Unternehmensangaben" },
  { value: "spam", label: "Spam / Werbung" },
  { value: "illegal_or_dangerous", label: "Illegale oder gefährliche Inhalte" },
  { value: "copyright", label: "Urheberrecht / fremde Inhalte" },
  { value: "other", label: "Sonstiges" },
];

export default function QrxReportForm({ qrxId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("fake_or_fraud");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetAndClose = () => {
    setOpen(false);
    setError(null);
    setDone(false);
    setDescription("");
    setEmail("");
    setReason("fake_or_fraud");
  };

  const submitReport = async () => {
    try {
      setWorking(true);
      setError(null);

      const trimmedDescription = description.trim();

      if (trimmedDescription.length < 20) {
        throw new Error("Bitte beschreibe das Problem mit mindestens 20 Zeichen.");
      }

      const res = await fetch("/api/report-qrx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId,
          reason,
          description: trimmedDescription,
          reporterEmail: email.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Meldung konnte nicht gesendet werden.");
      }

      setDone(true);
      setDescription("");
      setEmail("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Meldung konnte nicht gesendet werden.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div style={reportFooterWrap}>
        <button type="button" onClick={() => setOpen(true)} style={reportLink}>
          Inhalt beanstanden
        </button>
      </div>

      {open ? (
        <div style={overlay} role="dialog" aria-modal="true" aria-label="QR-X melden">
          <div style={modal}>
            <div style={modalTop}>
              <div>
                <h2 style={title}>QR-X melden</h2>
                <p style={sub}>
                  Melde diesen QR-X nur, wenn du ein echtes Problem erkennst.
                  Eine Meldung sperrt den QR-X nicht automatisch.
                </p>
              </div>

              <button type="button" onClick={resetAndClose} style={closeButton}>
                ×
              </button>
            </div>

            {done ? (
              <div style={successBox}>
                Danke. Deine Meldung wurde an die Moderation weitergeleitet.
              </div>
            ) : (
              <div style={formGrid}>
                <label style={label}>
                  Grund
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    style={select}
                  >
                    {REASONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={label}>
                  Beschreibung
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beschreibe kurz, was an diesem QR-X problematisch ist."
                    style={textarea}
                  />
                </label>

                <label style={label}>
                  E-Mail für Rückfragen (optional)
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    type="email"
                    style={input}
                  />
                </label>

                {error ? <div style={errorBox}>{error}</div> : null}

                <div style={buttonRow}>
                  <button type="button" onClick={resetAndClose} style={secondaryButton}>
                    Abbrechen
                  </button>

                  <button
                    type="button"
                    onClick={submitReport}
                    disabled={working}
                    style={{
                      ...primaryButton,
                      opacity: working ? 0.65 : 1,
                    }}
                  >
                    {working ? "Sende…" : "Meldung senden"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

const reportFooterWrap: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginTop: 8,
  marginBottom: 0,
};

const reportLink: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "rgba(255,255,255,0.34)",
  fontSize: 10,
  fontWeight: 500,
  textDecoration: "none",
  cursor: "pointer",
  padding: "4px 6px",
  lineHeight: "14px",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(0,0,0,0.72)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#111827",
  color: "white",
  padding: 20,
  boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
};

const modalTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
};

const sub: React.CSSProperties = {
  margin: "8px 0 0 0",
  color: "rgba(255,255,255,0.68)",
  fontSize: 13,
  lineHeight: "19px",
};

const closeButton: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  borderRadius: 12,
  width: 36,
  height: 36,
  cursor: "pointer",
  fontSize: 24,
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const label: React.CSSProperties = {
  display: "grid",
  gap: 7,
  color: "rgba(255,255,255,0.82)",
  fontSize: 13,
  fontWeight: 700,
};

const select: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b1220",
  color: "white",
  padding: "12px 12px",
  fontWeight: 700,
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: 110,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b1220",
  color: "white",
  padding: 12,
  resize: "vertical",
  fontFamily: "inherit",
};

const input: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b1220",
  color: "white",
  padding: "12px 12px",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  background: "white",
  color: "#111827",
  padding: "12px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  color: "white",
  padding: "12px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(127,29,29,0.35)",
  color: "#fecaca",
  padding: 12,
};

const successBox: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(34,197,94,0.35)",
  background: "rgba(20,83,45,0.35)",
  color: "#bbf7d0",
  padding: 14,
  fontWeight: 800,
};
