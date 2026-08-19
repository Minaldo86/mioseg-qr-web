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
  labels = { business: "Business QR-X", normal: "Normaler QR-X", verified: "Verifiziert" },
}: Props) {
  return (
    <div style={coverStyle}>
      {cover ? <img src={cover} alt={title} style={coverImageStyle} /> : null}
      {!cover ? <div style={coverPlaceholderStyle}>QR-X</div> : null}
      <div style={coverOverlayStyle} />

      <div style={coverContentStyle}>
        {logo ? <img src={logo} alt={`${title} Logo`} style={logoStyle} /> : null}

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={badgeRowStyle}>
            <span style={badgeStyle(isBusiness)}>
              {isBusiness ? `🏢 ${labels.business}` : `⌗ ${labels.normal}`}
            </span>

            {categoryMeta ? (
              <span style={categoryBadgeStyle}>
                {categoryMeta.icon} {categoryMeta.label}
              </span>
            ) : null}

            {verified ? <span style={verifiedBadgeStyle}>✓ {labels.verified}</span> : null}
          </div>

          <h1 style={heroTitleStyle}>{title}</h1>
          {subtitleTitle ? <div style={subtitleTitleStyle}>{subtitleTitle}</div> : null}
          <p style={heroDescriptionStyle}>{description}</p>
        </div>
      </div>
    </div>
  );
}

const coverStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  borderRadius: 28,
  overflow: "hidden",
  position: "relative",
  background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))",
};
const coverImageStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const coverPlaceholderStyle: CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.18)", fontSize: 72, fontWeight: 950 };
const coverOverlayStyle: CSSProperties = { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,12,21,0.1) 0%, rgba(6,12,21,0.88) 100%)" };
const coverContentStyle: CSSProperties = { position: "absolute", left: 24, right: 24, bottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" };
const logoStyle: CSSProperties = { width: 92, height: 92, objectFit: "cover", borderRadius: 24, border: "1px solid rgba(255,255,255,0.24)", background: "#fff" };
const badgeRowStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 };
function badgeStyle(isBusiness: boolean): CSSProperties {
  return { minHeight: 32, display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "0 10px", background: isBusiness ? "#fff7ed" : "#ecfdf3", color: isBusiness ? "#9a4f00" : "#166534", fontSize: 12, fontWeight: 950, border: isBusiness ? "1px solid #fed7aa" : "1px solid #bbf7d0" };
}
const categoryBadgeStyle: CSSProperties = { minHeight: 32, display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "0 10px", background: "rgba(59,130,246,0.18)", color: "#dbeafe", fontSize: 12, fontWeight: 950, border: "1px solid rgba(147,197,253,0.28)" };
const verifiedBadgeStyle: CSSProperties = { minHeight: 32, display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "0 10px", background: "rgba(13,23,38,0.86)", color: "#ffffff", fontSize: 12, fontWeight: 950, border: "1px solid rgba(255,255,255,0.18)" };
const heroTitleStyle: CSSProperties = { margin: 0, color: "#fff", fontSize: 42, lineHeight: 1.05, fontWeight: 950, letterSpacing: "-0.04em" };
const subtitleTitleStyle: CSSProperties = { marginTop: 8, color: "#bfdbfe", fontSize: 16, fontWeight: 950 };
const heroDescriptionStyle: CSSProperties = { margin: "10px 0 0", color: "#dbeafe", lineHeight: 1.6, maxWidth: 760 };
