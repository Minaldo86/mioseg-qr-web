"use client";

import { useEffect, useState, type CSSProperties } from "react";

type VerificationCopy = {
  dialogTitle: string;
  dialogIntro: string;
  checkedTitle: string;
  checkedText: string;
  statusTitle: string;
  statusText: string;
  meaningTitle: string;
  meaningText: string;
  understood: string;
  openAria: string;
  closeAria: string;
};

type Props = {
  badgeLabel: string;
  copy: VerificationCopy;
};

export default function VerificationInfoButton({ badgeLabel, copy }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={copy.openAria}
        aria-haspopup="dialog"
        style={badgeButtonStyle}
      >
        <span style={badgeIconStyle}>✓</span>
        {badgeLabel}
      </button>

      {open ? (
        <div
          style={backdropStyle}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-dialog-title"
            style={dialogStyle}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={copy.closeAria}
              style={closeButtonStyle}
            >
              ×
            </button>

            <div style={shieldStyle} aria-hidden="true">
              <span style={shieldInnerStyle}>✓</span>
            </div>

            <h2 id="verification-dialog-title" style={titleStyle}>
              {copy.dialogTitle}
            </h2>

            <p style={introStyle}>{copy.dialogIntro}</p>

            <div style={infoCardStyle}>
              <div style={smallIconStyle} aria-hidden="true">▤</div>
              <div>
                <h3 style={cardTitleStyle}>{copy.checkedTitle}</h3>
                <p style={cardTextStyle}>{copy.checkedText}</p>
              </div>
            </div>

            <div style={infoCardStyle}>
              <div style={smallIconStyle} aria-hidden="true">✓</div>
              <div>
                <h3 style={cardTitleStyle}>{copy.statusTitle}</h3>
                <p style={cardTextStyle}>{copy.statusText}</p>
              </div>
            </div>

            <div style={meaningCardStyle}>
              <h3 style={meaningTitleStyle}>{copy.meaningTitle}</h3>
              <p style={meaningTextStyle}>{copy.meaningText}</p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={understoodButtonStyle}
            >
              {copy.understood}
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}

const badgeButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 999,
  padding: "0 18px",
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  background: "rgba(8,17,29,0.88)",
  color: "#facc15",
  border: "1px solid rgba(250,204,21,0.74)",
  fontWeight: 900,
  fontSize: 13,
  letterSpacing: "0.03em",
  boxShadow: "0 12px 28px rgba(0,0,0,0.24)",
  backdropFilter: "blur(12px)",
  cursor: "pointer",
  fontFamily: "inherit",
};

const badgeIconStyle: CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  border: "1px solid currentColor",
  fontSize: 12,
  lineHeight: 1,
};

const backdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  display: "grid",
  placeItems: "center",
  padding: 18,
  background: "rgba(0, 0, 0, 0.72)",
  backdropFilter: "blur(5px)",
};

const dialogStyle: CSSProperties = {
  position: "relative",
  width: "min(620px, 100%)",
  maxHeight: "calc(100dvh - 36px)",
  overflowY: "auto",
  boxSizing: "border-box",
  borderRadius: 30,
  padding: "38px 34px 30px",
  background: "#111824",
  border: "1px solid rgba(148,163,184,0.22)",
  boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
  color: "#f8fafc",
};

const closeButtonStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 42,
  height: 42,
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(255,255,255,0.04)",
  color: "#dbe4ef",
  display: "grid",
  placeItems: "center",
  fontSize: 28,
  lineHeight: 1,
  cursor: "pointer",
};

const shieldStyle: CSSProperties = {
  width: 74,
  height: 74,
  margin: "2px auto 24px",
  borderRadius: 22,
  display: "grid",
  placeItems: "center",
  color: "#f7c948",
  background: "rgba(126,94,0,0.14)",
  border: "1px solid rgba(247,201,72,0.3)",
  boxShadow: "0 0 28px rgba(247,201,72,0.08)",
};

const shieldInnerStyle: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 13,
  display: "grid",
  placeItems: "center",
  border: "3px solid currentColor",
  fontSize: 20,
  fontWeight: 950,
  transform: "rotate(45deg)",
};

const titleStyle: CSSProperties = {
  margin: 0,
  textAlign: "center",
  color: "#ffffff",
  fontSize: "clamp(28px, 4vw, 38px)",
  lineHeight: 1.12,
  fontWeight: 950,
  letterSpacing: "-0.03em",
};

const introStyle: CSSProperties = {
  maxWidth: 500,
  margin: "18px auto 28px",
  textAlign: "center",
  color: "#c3cfdd",
  fontSize: 18,
  lineHeight: 1.5,
};

const infoCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "58px 1fr",
  gap: 16,
  alignItems: "start",
  marginTop: 14,
  padding: 20,
  borderRadius: 22,
  background: "#151f2c",
  border: "1px solid rgba(148,163,184,0.18)",
};

const smallIconStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  color: "#f7c948",
  background: "rgba(126,94,0,0.14)",
  border: "1px solid rgba(247,201,72,0.26)",
  fontSize: 22,
  fontWeight: 900,
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 19,
  lineHeight: 1.25,
  fontWeight: 900,
};

const cardTextStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#aebdcc",
  fontSize: 16,
  lineHeight: 1.48,
};

const meaningCardStyle: CSSProperties = {
  marginTop: 14,
  padding: 20,
  borderRadius: 22,
  background: "#0c131d",
  border: "1px solid rgba(148,163,184,0.16)",
};

const meaningTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 18,
  lineHeight: 1.3,
  fontWeight: 900,
};

const meaningTextStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "#97a8b9",
  fontSize: 15,
  lineHeight: 1.58,
};

const understoodButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 56,
  marginTop: 24,
  border: 0,
  borderRadius: 18,
  background: "#f4f7fa",
  color: "#0b111a",
  fontSize: 17,
  fontWeight: 950,
  cursor: "pointer",
};
