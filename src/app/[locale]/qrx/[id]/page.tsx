"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../dashboard/dashboard.module.css";

type QrxEntry = {
  id: string;
  title: string | null;
  company_name: string | null;
  description: string | null;
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
  created_at: string | null;
};

type QrxMedia = {
  id: string;
  type: "image" | "file" | string;
  url: string;
  filename: string | null;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function getTitle(entry: QrxEntry | null) {
  if (!entry) return "QR-X";
  return entry.company_name?.trim() || entry.title?.trim() || "QR-X";
}

function normalizeUrl(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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
          "id,title,company_name,description,type,category,verified,suspended,deleted_at,cover_image_url,logo_url,location_name,cta_phone,cta_website,cta_email,cta_navigation,created_at",
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
        .select("id,type,url,filename")
        .eq("qrx_id", qrxId)
        .eq("type", "image")
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

  const title = getTitle(entry);
  const description = entry?.description?.trim() || entry?.location_name?.trim() || "QR-X auf mioseg qr";
  const cover = entry?.cover_image_url?.trim() || null;
  const logo = entry?.logo_url?.trim() || null;
  const isBusiness = entry?.type === "business";
  const website = normalizeUrl(entry?.cta_website ?? null);
  const navigation = normalizeUrl(entry?.cta_navigation ?? null);

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
              <div style={coverOverlayStyle} />
              <div style={coverContentStyle}>
                {logo ? <img src={logo} alt={`${title} Logo`} style={logoStyle} /> : null}
                <div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    <span style={badgeStyle(isBusiness)}>{isBusiness ? "🏢 Business QR-X" : "⌗ Normaler QR-X"}</span>
                    {entry.verified ? <span style={verifiedBadgeStyle}>✓ Verifiziert</span> : null}
                  </div>
                  <h1 style={{ margin: 0, color: "#fff", fontSize: 42, lineHeight: 1.05 }}>{title}</h1>
                  <p style={{ margin: "10px 0 0", color: "#dbeafe", lineHeight: 1.6 }}>{description}</p>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
              {entry.location_name?.trim() ? <InfoRow title="📍 Standort" text={entry.location_name.trim()} /> : null}
              {isBusiness && entry.category ? <InfoRow title="▦ Kategorie" text={entry.category} /> : null}

              {isBusiness ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {entry.cta_phone?.trim() ? <a href={`tel:${entry.cta_phone.trim()}`} className={styles.primaryButton}>Telefon</a> : null}
                  {website ? <a href={website} target="_blank" rel="noreferrer" className={styles.secondaryButton}>Webseite öffnen</a> : null}
                  {entry.cta_email?.trim() ? <a href={`mailto:${entry.cta_email.trim()}`} className={styles.secondaryButton}>E-Mail schreiben</a> : null}
                  {navigation ? <a href={navigation} target="_blank" rel="noreferrer" className={styles.secondaryButton}>Navigation öffnen</a> : null}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </section>

      {!loading && media.length > 0 ? (
        <section style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Bilder</h2>
              <p>Galerie dieses QR-X.</p>
            </div>
            <span>{media.length} Bilder</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {media.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noreferrer" style={galleryItemStyle}>
                <img src={item.url} alt={item.filename ?? "QR-X Bild"} style={galleryImageStyle} />
              </a>
            ))}
          </div>
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

const panelStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 18px",
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const loadingStyle: React.CSSProperties = {
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  fontWeight: 950,
};

const errorStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const coverStyle: React.CSSProperties = {
  minHeight: 310,
  borderRadius: 28,
  overflow: "hidden",
  position: "relative",
  background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))",
};

const coverImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 310,
  objectFit: "cover",
  display: "block",
};

const coverOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(6,12,21,0.08) 0%, rgba(6,12,21,0.82) 100%)",
};

const coverContentStyle: React.CSSProperties = {
  position: "absolute",
  left: 24,
  right: 24,
  bottom: 24,
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const logoStyle: React.CSSProperties = {
  width: 82,
  height: 82,
  objectFit: "cover",
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.24)",
  background: "#fff",
};

function badgeStyle(isBusiness: boolean): React.CSSProperties {
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

const verifiedBadgeStyle: React.CSSProperties = {
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

const infoRowStyle: React.CSSProperties = {
  display: "grid",
  gap: 5,
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
};

const galleryItemStyle: React.CSSProperties = {
  display: "block",
  borderRadius: 22,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.105)",
  background: "rgba(255,255,255,0.055)",
};

const galleryImageStyle: React.CSSProperties = {
  width: "100%",
  height: 190,
  objectFit: "cover",
  display: "block",
};
