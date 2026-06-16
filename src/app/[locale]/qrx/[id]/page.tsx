"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../dashboard/dashboard.module.css";

type BusinessCategory =
  | "praxis_gesundheit"
  | "gastronomie"
  | "unternehmen"
  | "dienstleistung"
  | "handwerk"
  | "event"
  | "verein"
  | "wohltaetigkeit"
  | "sehenswuerdigkeit"
  | "sonstiges";

type NewsItem = {
  text: string;
  createdAt: string;
};

const BUSINESS_CATEGORY_OPTIONS: Array<{
  value: BusinessCategory;
  label: string;
  icon: string;
}> = [
  { value: "praxis_gesundheit", label: "Praxis & Gesundheit", icon: "🏥" },
  { value: "gastronomie", label: "Gastronomie", icon: "🍽️" },
  { value: "unternehmen", label: "Unternehmen", icon: "🏢" },
  { value: "dienstleistung", label: "Dienstleistung", icon: "🛠️" },
  { value: "handwerk", label: "Handwerk", icon: "🔨" },
  { value: "event", label: "Event", icon: "📅" },
  { value: "verein", label: "Verein", icon: "👥" },
  { value: "wohltaetigkeit", label: "Wohltätigkeit", icon: "♡" },
  { value: "sehenswuerdigkeit", label: "Sehenswürdigkeit", icon: "📷" },
  { value: "sonstiges", label: "Sonstiges", icon: "▦" },
];

function getBusinessCategoryMeta(value: string | null | undefined) {
  if (!value) return null;
  return BUSINESS_CATEGORY_OPTIONS.find((item) => item.value === value) ?? null;
}

type QrxEntry = {
  id: string;
  title: string | null;
  company_name: string | null;
  description: string | null;
  news: NewsItem[] | null;
  type: "normal" | "business" | string | null;
  category: string | null;
  verified: boolean | null;
  suspended: boolean | null;
  deleted_at: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  location_name: string | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_email: string | null;
  cta_navigation: string | null;
  views_total: number | null;
  follower_count: number | null;
  created_at: string | null;
};

type QrxMedia = {
  id: string;
  type: "image" | "file" | string;
  url: string;
  filename: string | null;
  bytes?: number | null;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function getDisplayTitle(entry: QrxEntry | null) {
  if (!entry) return "QR-X";
  return entry.company_name?.trim() || entry.title?.trim() || "QR-X";
}

function getSubtitleTitle(entry: QrxEntry | null) {
  if (!entry) return null;
  const company = entry.company_name?.trim();
  const title = entry.title?.trim();

  if (company && title && company !== title) return title;
  return null;
}

function normalizeUrl(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeNavigationUrl(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

function formatNumber(value: number | null | undefined) {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "0";

  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, numberValue));
}

function formatDate(value: string | null | undefined) {
  if (!value) return "–";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeNewsItems(value: NewsItem[] | null | undefined) {
  const raw = Array.isArray(value) ? value : [];

  return raw
    .filter((item) => typeof item?.text === "string" && item.text.trim().length > 0)
    .map((item, index) => ({
      id: `${item.createdAt ?? "news"}-${index}`,
      text: item.text.trim(),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
    }))
    .sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });
}

export default function PublicQrxDetailPage() {
  const params = useParams();
  const locale = getParam(params?.locale as string | string[] | undefined, "de");
  const qrxId = getParam(params?.id as string | string[] | undefined, "");

  const [entry, setEntry] = useState<QrxEntry | null>(null);
  const [media, setMedia] = useState<QrxMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    void loadQrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrxId]);

  async function loadQrx() {
    setLoading(true);
    setErrorText(null);

    try {
      if (!qrxId) throw new Error("QR-X ID fehlt.");

      const { data, error } = await supabase
        .from("qr_x_entries")
        .select(
          "id,title,company_name,description,news,type,category,verified,suspended,deleted_at,cover_image_url,logo_url,location_name,cta_phone,cta_website,cta_email,cta_navigation,views_total,follower_count,created_at",
        )
        .eq("id", qrxId)
        .maybeSingle()
        .returns<QrxEntry>();

      if (error) throw error;
      if (!data || data.deleted_at) throw new Error("Dieser QR-X wurde nicht gefunden.");
      if (data.suspended) throw new Error("Dieser QR-X ist aktuell nicht verfügbar.");

      setEntry(data);

      const { data: mediaData, error: mediaError } = await supabase
        .from("qr_x_media")
        .select("id,type,url,filename,bytes")
        .eq("qrx_id", qrxId)
        .returns<QrxMedia[]>();

      if (mediaError) {
        console.warn("QR-X media load error:", mediaError);
        setMedia([]);
      } else {
        setMedia(mediaData ?? []);
      }
    } catch (error) {
      setEntry(null);
      setMedia([]);
      setErrorText(error instanceof Error ? error.message : "QR-X konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  const title = getDisplayTitle(entry);
  const subtitleTitle = getSubtitleTitle(entry);
  const description = entry?.description?.trim() || entry?.location_name?.trim() || "QR-X auf mioseg qr";
  const cover = entry?.cover_image_url?.trim() || null;
  const logo = entry?.logo_url?.trim() || null;
  const isBusiness = entry?.type === "business";
  const website = normalizeUrl(entry?.cta_website ?? null);
  const navigation = normalizeNavigationUrl(entry?.cta_navigation ?? null);
  const categoryMeta = getBusinessCategoryMeta(entry?.category);
  const newsItems = useMemo(() => normalizeNewsItems(entry?.news), [entry?.news]);
  const imageMedia = media.filter((item) => item.type === "image" && item.url !== logo && item.url !== cover);
  const fileMedia = media.filter((item) => item.type === "file");

  const stats = [
    {
      label: "Follower",
      value: formatNumber(entry?.follower_count),
      icon: "👥",
    },
    {
      label: "Medien",
      value: formatNumber(media.length),
      icon: "🖼️",
    },
    {
      label: "Updates",
      value: formatNumber(newsItems.length),
      icon: "📰",
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}`} className={styles.brand}>
          <img src="/logo-white.png" alt="Mioseg qr Logo" />
        </Link>
        <nav className={styles.nav} aria-label="QR-X Navigation">
          <Link href={`/${locale}`}>Startseite</Link>
          <Link href={`/${locale}/explore`}>Explore</Link>
        </nav>
      </header>

      <section style={panelStyle}>
        {loading ? <div style={loadingStyle}>QR-X wird geladen …</div> : null}
        {!loading && errorText ? <div style={errorStyle}>{errorText}</div> : null}

        {!loading && entry ? (
          <>
            <div style={coverStyle}>
              {cover ? <img src={cover} alt={title} style={coverImageStyle} /> : null}
              {!cover ? <div style={coverPlaceholderStyle}>QR-X</div> : null}
              <div style={coverOverlayStyle} />

              <div style={coverContentStyle}>
                {logo ? <img src={logo} alt={`${title} Logo`} style={logoStyle} /> : null}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={badgeRowStyle}>
                    <span style={badgeStyle(isBusiness)}>
                      {isBusiness ? "🏢 Business QR-X" : "⌗ Normaler QR-X"}
                    </span>

                    {categoryMeta ? (
                      <span style={categoryBadgeStyle}>
                        {categoryMeta.icon} {categoryMeta.label}
                      </span>
                    ) : null}

                    {entry.verified ? <span style={verifiedBadgeStyle}>✓ Verifiziert</span> : null}
                  </div>

                  <h1 style={heroTitleStyle}>{title}</h1>
                  {subtitleTitle ? <div style={subtitleTitleStyle}>{subtitleTitle}</div> : null}
                  <p style={heroDescriptionStyle}>{description}</p>
                </div>
              </div>
            </div>

            <section style={statsGridStyle} aria-label="QR-X Kennzahlen">
              {stats.map((item) => (
                <article key={item.label} style={statCardStyle}>
                  <span style={statIconStyle}>{item.icon}</span>
                  <div>
                    <strong style={statValueStyle}>{item.value}</strong>
                    <span style={statLabelStyle}>{item.label}</span>
                  </div>
                </article>
              ))}
            </section>

            <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
              {entry.location_name?.trim() ? (
                <InfoRow title="📍 Standort" text={entry.location_name.trim()} />
              ) : null}

              {categoryMeta ? (
                <InfoRow title="▦ Kategorie" text={`${categoryMeta.icon} ${categoryMeta.label}`} />
              ) : null}

              {entry.created_at ? (
                <InfoRow title="🕒 Erstellt" text={formatDate(entry.created_at)} />
              ) : null}

              {isBusiness ? (
                <div style={ctaGridStyle}>
                  {entry.cta_phone?.trim() ? (
                    <a href={`tel:${entry.cta_phone.trim()}`} className={styles.primaryButton}>
                      Telefon
                    </a>
                  ) : null}

                  {website ? (
                    <a href={website} target="_blank" rel="noreferrer" className={styles.secondaryButton}>
                      Webseite öffnen
                    </a>
                  ) : null}

                  {entry.cta_email?.trim() ? (
                    <a href={`mailto:${entry.cta_email.trim()}`} className={styles.secondaryButton}>
                      E-Mail schreiben
                    </a>
                  ) : null}

                  {navigation ? (
                    <a href={navigation} target="_blank" rel="noreferrer" className={styles.secondaryButton}>
                      Navigation öffnen
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </section>

      {!loading && entry ? (
        <section style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>News & Updates</h2>
              <p>Aktuelle Informationen und Änderungen dieses QR-X.</p>
            </div>
            <span>{newsItems.length} Updates</span>
          </div>

          {newsItems.length > 0 ? (
            <div style={newsListStyle}>
              {newsItems.map((item) => (
                <article key={item.id} style={newsCardStyle}>
                  <div style={newsDateStyle}>{formatDate(item.createdAt)}</div>
                  <p style={newsTextStyle}>{item.text}</p>
                </article>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <strong>Noch keine Updates vorhanden.</strong>
              <span>Wenn der Ersteller neue Informationen hinzufügt, erscheinen sie hier.</span>
            </div>
          )}
        </section>
      ) : null}

      {!loading && (imageMedia.length > 0 || fileMedia.length > 0) ? (
        <section style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Medien</h2>
              <p>Bilder und Dateien dieses QR-X.</p>
            </div>
            <span>{media.length} Medien</span>
          </div>

          {imageMedia.length > 0 ? (
            <>
              <h3 style={sectionSubTitleStyle}>Bilder</h3>
              <div style={galleryGridStyle}>
                {imageMedia.map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noreferrer" style={galleryItemStyle}>
                    <img src={item.url} alt={item.filename ?? "QR-X Bild"} style={galleryImageStyle} />
                  </a>
                ))}
              </div>
            </>
          ) : null}

          {fileMedia.length > 0 ? (
            <div style={{ marginTop: imageMedia.length > 0 ? 18 : 0 }}>
              <h3 style={sectionSubTitleStyle}>Dateien</h3>
              <div style={fileListStyle}>
                {fileMedia.map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noreferrer" style={fileItemStyle}>
                    <span>📄 {item.filename ?? "Datei öffnen"}</span>
                    <span>Öffnen</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

function InfoRow({ title, text }: { title: string; text: string }) {
  return (
    <div style={infoRowStyle}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

const panelStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 18px",
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const loadingStyle: CSSProperties = {
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  fontWeight: 950,
};

const errorStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const coverStyle: CSSProperties = {
  minHeight: 360,
  borderRadius: 28,
  overflow: "hidden",
  position: "relative",
  background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))",
};

const coverImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 360,
  objectFit: "cover",
  display: "block",
};

const coverPlaceholderStyle: CSSProperties = {
  minHeight: 360,
  display: "grid",
  placeItems: "center",
  color: "rgba(255,255,255,0.18)",
  fontSize: 72,
  fontWeight: 950,
};

const coverOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(6,12,21,0.1) 0%, rgba(6,12,21,0.88) 100%)",
};

const coverContentStyle: CSSProperties = {
  position: "absolute",
  left: 24,
  right: 24,
  bottom: 24,
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const logoStyle: CSSProperties = {
  width: 92,
  height: 92,
  objectFit: "cover",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.24)",
  background: "#fff",
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 10,
};

function badgeStyle(isBusiness: boolean): CSSProperties {
  return {
    minHeight: 32,
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "0 10px",
    background: isBusiness ? "#fff7ed" : "#ecfdf3",
    color: isBusiness ? "#9a4f00" : "#166534",
    fontSize: 12,
    fontWeight: 950,
    border: isBusiness ? "1px solid #fed7aa" : "1px solid #bbf7d0",
  };
}

const categoryBadgeStyle: CSSProperties = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(59,130,246,0.18)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 950,
  border: "1px solid rgba(147,197,253,0.28)",
};

const verifiedBadgeStyle: CSSProperties = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(13,23,38,0.86)",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 950,
  border: "1px solid rgba(255,255,255,0.18)",
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  color: "#fff",
  fontSize: 42,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-0.04em",
};

const subtitleTitleStyle: CSSProperties = {
  marginTop: 8,
  color: "#bfdbfe",
  fontSize: 16,
  fontWeight: 950,
};

const heroDescriptionStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "#dbeafe",
  lineHeight: 1.6,
  maxWidth: 760,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const statCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const statIconStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.08)",
  fontSize: 20,
};

const statValueStyle: CSSProperties = {
  display: "block",
  color: "#ffffff",
  fontSize: 22,
  fontWeight: 950,
};

const statLabelStyle: CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 850,
};

const infoRowStyle: CSSProperties = {
  display: "grid",
  gap: 5,
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
};

const ctaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const newsListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const newsCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 8,
};

const newsDateStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 950,
};

const newsTextStyle: CSSProperties = {
  margin: 0,
  color: "#dbeafe",
  lineHeight: 1.65,
  fontWeight: 750,
  whiteSpace: "pre-wrap",
};

const emptyStateStyle: CSSProperties = {
  borderRadius: 22,
  padding: 18,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#94a3b8",
  display: "grid",
  gap: 6,
};

const sectionSubTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 950,
};

const galleryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const galleryItemStyle: CSSProperties = {
  display: "block",
  borderRadius: 22,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.105)",
  background: "rgba(255,255,255,0.055)",
};

const galleryImageStyle: CSSProperties = {
  width: "100%",
  height: 190,
  objectFit: "cover",
  display: "block",
};

const fileListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const fileItemStyle: CSSProperties = {
  minHeight: 54,
  borderRadius: 18,
  padding: "0 14px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  fontWeight: 900,
};
