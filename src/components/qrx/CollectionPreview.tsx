"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

export type QrxCollectionPreviewItem = {
  id: string;
  title: string | null;
  company_name: string | null;
  description?: string | null;
  type: "normal" | "business" | string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  location_name?: string | null;
  verified?: boolean | null;
  custom_title?: string | null;
};

type CollectionPreviewProps = {
  parentQrxId: string;
  parentQrxTitle: string;
  items: QrxCollectionPreviewItem[];
  locale?: string;
  compact?: boolean;
  routeMode?: "localized" | "root";
  collectionTitle?: string | null;
  collectionDescription?: string | null;
  labels?: { untitled:string; business:string; normal:string; collection:string; one:string; many:string; verified:string; part:string; open:string };
};

function getDisplayTitle(item: QrxCollectionPreviewItem, untitled: string) {
  return (
    item.custom_title?.trim() ||
    item.company_name?.trim() ||
    item.title?.trim() ||
    untitled
  );
}

function getDisplayText(item: QrxCollectionPreviewItem, business: string, normal: string) {
  return (
    item.description?.trim() ||
    item.location_name?.trim() ||
    (item.type === "business" ? business : normal)
  );
}

export default function CollectionPreview({
  parentQrxId,
  parentQrxTitle,
  items,
  locale = "de",
  compact = false,
  routeMode = "localized",
  collectionTitle = null,
  collectionDescription = null,
  labels = { untitled:"Unbenannter QR-X", business:"Business QR-X", normal:"Normaler QR-X", collection:"Sammlung", one:"Eintrag", many:"Einträge", verified:"Verifiziert", part:"Sammlung", open:"Öffnen →" },
}: CollectionPreviewProps) {
  if (items.length === 0) return null;

  const visibleTitle = collectionTitle?.trim() || labels.collection;
  const visibleDescription = collectionDescription?.trim() || null;

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>{visibleTitle}</h2>
          {visibleDescription ? (
            <p style={descriptionStyle}>{visibleDescription}</p>
          ) : null}
        </div>

        <span style={countBadgeStyle}>
          {items.length} {items.length === 1 ? labels.one : labels.many}
        </span>
      </div>

      <div style={compact ? compactGridStyle : gridStyle}>
        {items.map((item) => {
          const title = getDisplayTitle(item, labels.untitled);
          const image =
            item.cover_image_url?.trim() ||
            item.logo_url?.trim() ||
            null;

          const detailPath =
            routeMode === "root"
              ? `/qrx/${item.id}`
              : `/${locale}/qrx/${item.id}`;

          const href = `${detailPath}?parentQrxId=${encodeURIComponent(
            parentQrxId,
          )}&parentQrxTitle=${encodeURIComponent(parentQrxTitle)}`;

          return (
            <Link key={item.id} href={href} style={cardStyle}>
              <div style={imageWrapStyle}>
                {image ? (
                  <img src={image} alt={title} style={imageStyle} />
                ) : (
                  <div style={fallbackStyle}>
                    {item.type === "business" ? "🏢" : "▣"}
                  </div>
                )}

                <div style={overlayStyle} />

                <div style={topBadgeRowStyle}>
                  <span style={typeBadgeStyle(item.type === "business")}>
                    {item.type === "business"
                      ? labels.business
                      : labels.normal}
                  </span>

                  {item.verified ? (
                    <span style={verifiedBadgeStyle}>✓ {labels.verified}</span>
                  ) : null}
                </div>
              </div>

              <div style={bodyStyle}>
                <h3 style={itemTitleStyle}>{title}</h3>

                <p style={itemTextStyle}>
                  {getDisplayText(item, labels.business, labels.normal)}
                </p>

                {item.location_name?.trim() ? (
                  <div style={locationStyle}>
                    📍 {item.location_name.trim()}
                  </div>
                ) : null}

                <div style={footerStyle}>
                  <span style={sourceStyle}>{labels.part}</span>
                  <span style={openStyle}>{labels.open}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  padding: 18,
  borderRadius: 26,
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.86), rgba(15,23,42,0.72))",
  border: "1px solid rgba(148,163,184,0.16)",
  boxShadow: "0 18px 46px rgba(0,0,0,0.14)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
};

const titleStyle: CSSProperties = {
  margin: "0 0 6px",
  color: "#ffffff",
  fontSize: 24,
  lineHeight: 1.15,
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  lineHeight: 1.55,
};

const countBadgeStyle: CSSProperties = {
  minHeight: 34,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 12px",
  background: "rgba(37,99,235,0.16)",
  border: "1px solid rgba(147,197,253,0.2)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 950,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
};

const compactGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 12,
};

const cardStyle: CSSProperties = {
  overflow: "hidden",
  borderRadius: 22,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.095), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.09)",
  textDecoration: "none",
  boxShadow: "0 14px 32px rgba(0,0,0,0.12)",
  transition: "transform 160ms ease, border-color 160ms ease",
};

const imageWrapStyle: CSSProperties = {
  height: 150,
  position: "relative",
  overflow: "hidden",
  background: "rgba(255,255,255,0.06)",
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const fallbackStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  fontSize: 40,
  background:
    "radial-gradient(circle at 30% 20%, #ffffff 0%, #e5eef7 52%, #d7e2ee 100%)",
};

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(2,6,23,0.04), rgba(2,6,23,0.58))",
};

const topBadgeRowStyle: CSSProperties = {
  position: "absolute",
  top: 10,
  left: 10,
  right: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  flexWrap: "wrap",
};

function typeBadgeStyle(business: boolean): CSSProperties {
  return {
    minHeight: 28,
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "0 9px",
    background: business ? "#fff7ed" : "#ecfdf3",
    color: business ? "#9a4f00" : "#166534",
    border: business ? "1px solid #fed7aa" : "1px solid #bbf7d0",
    fontSize: 11,
    fontWeight: 950,
  };
}

const verifiedBadgeStyle: CSSProperties = {
  minHeight: 28,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 9px",
  background: "rgba(15,23,42,0.88)",
  color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.16)",
  fontSize: 11,
  fontWeight: 950,
};

const bodyStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 14,
};

const itemTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 19,
  lineHeight: 1.2,
  fontWeight: 950,
};

const itemTextStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
  lineHeight: 1.55,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const locationStyle: CSSProperties = {
  minHeight: 30,
  display: "inline-flex",
  alignItems: "center",
  justifySelf: "start",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(255,255,255,0.055)",
  color: "#cbd5e1",
  fontSize: 12,
  fontWeight: 850,
};

const footerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginTop: 2,
};

const sourceStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 850,
};

const openStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 12,
  fontWeight: 950,
};
