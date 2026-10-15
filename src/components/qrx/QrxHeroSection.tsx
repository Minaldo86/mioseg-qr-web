"use client";

import type { CSSProperties } from "react";

type CategoryMeta = { label: string; icon: string } | null;

type Props = {
  title: string;
  subtitleTitle: string | null;
  description: string;
  cover: string | null;
  logo: string | null;
  isBusiness: boolean;
  categoryMeta: CategoryMeta;
  verified: boolean;
  labels?: { business: string; normal: string; verified: string };
};

export default function QrxHeroSection({
  title,
  subtitleTitle,
  description,
  cover,
  logo,
  isBusiness,
  categoryMeta,
  verified,
  labels = { business: "Business", normal: "Normaler Mioseg QR", verified: "Verifiziert" },
}: Props) {
  return (
    <div style={coverStyle}>
      {cover ? <img src={cover} alt={title} style={coverImageStyle} /> : null}
      {!cover ? <div style={coverPlaceholderStyle}>Mioseg QR</div> : null}
      <div style={coverOverlayStyle} />

      <div style={coverContentStyle}>
        <h1 style={heroTitleStyle}>{title}</h1>
        {subtitleTitle ? <div style={subtitleTitleStyle}>{subtitleTitle}</div> : null}

        <div style={brandRowStyle}>
          {logo ? <img src={logo} alt={`${title} Logo`} style={logoStyle} /> : null}
          <span style={brandNameStyle}>mioseg qr</span>
          {isBusiness ? (
            <>
              <span aria-hidden="true" style={brandSeparatorStyle}>|</span>
              <span style={businessNameStyle}>{labels.business === "Business" ? labels.business : "Business"}</span>
            </>
          ) : null}
        </div>

        {categoryMeta || verified ? (
          <div style={badgeRowStyle}>
            {categoryMeta ? (
              <span style={categoryBadgeStyle}>
                {categoryMeta.icon} {categoryMeta.label}
              </span>
            ) : null}
            {verified ? <span style={verifiedBadgeStyle}>✓ {labels.verified}</span> : null}
          </div>
        ) : null}

        {description ? <p style={heroDescriptionStyle}>{description}</p> : null}
      </div>
    </div>
  );
}

const coverStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  minHeight: 290,
  borderRadius: 28,
  overflow: "hidden",
  position: "relative",
  background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))",
};
const coverImageStyle: CSSProperties = {
  position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block",
};
const coverPlaceholderStyle: CSSProperties = {
  position: "absolute", inset: 0, display: "grid", placeItems: "center",
  color: "rgba(255,255,255,0.18)", fontSize: "clamp(30px, 8vw, 72px)", fontWeight: 950,
};
const coverOverlayStyle: CSSProperties = {
  position: "absolute", inset: 0,
  background: "linear-gradient(180deg, rgba(6,12,21,0.1) 0%, rgba(6,12,21,0.88) 100%)",
};
const coverContentStyle: CSSProperties = {
  position: "absolute", left: 24, right: 24, bottom: 24,
  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12,
};
const heroTitleStyle: CSSProperties = {
  margin: 0, color: "#fff", fontSize: "clamp(28px, 6vw, 42px)",
  lineHeight: 1.1, fontWeight: 950, letterSpacing: "-0.04em", overflowWrap: "anywhere",
};
const subtitleTitleStyle: CSSProperties = { color: "#bfdbfe", fontSize: 16, fontWeight: 950 };
const brandRowStyle: CSSProperties = {
  display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10,
  minWidth: 0, marginTop: 4,
};
const logoStyle: CSSProperties = {
  width: 32, height: 32, objectFit: "contain", flexShrink: 0,
  borderRadius: 6, display: "block",
};
const brandNameStyle: CSSProperties = {
  color: "#fff", fontSize: "clamp(18px, 4vw, 25px)", fontWeight: 850, lineHeight: 1.2,
};
const brandSeparatorStyle: CSSProperties = { color: "rgba(255,255,255,0.65)", fontSize: 23 };
// Gleicher Gelbton wie im gezeigten „App öffnen“-Button; bei abweichender CSS-Farbe anpassen.
const businessNameStyle: CSSProperties = {
  color: "#ffe66b", fontSize: "clamp(18px, 4vw, 25px)", fontWeight: 850, lineHeight: 1.2,
};
const badgeRowStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
const categoryBadgeStyle: CSSProperties = {
  minHeight: 32, display: "inline-flex", alignItems: "center", borderRadius: 999,
  padding: "0 10px", background: "rgba(59,130,246,0.18)", color: "#dbeafe",
  fontSize: 12, fontWeight: 950, border: "1px solid rgba(147,197,253,0.28)",
};
const verifiedBadgeStyle: CSSProperties = {
  minHeight: 32, display: "inline-flex", alignItems: "center", borderRadius: 999,
  padding: "0 10px", background: "rgba(13,23,38,0.86)", color: "#ffffff",
  fontSize: 12, fontWeight: 950, border: "1px solid rgba(255,255,255,0.18)",
};
const heroDescriptionStyle: CSSProperties = {
  margin: 0, color: "#dbeafe", lineHeight: 1.6, maxWidth: 760,
};
