"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../../dashboard.module.css";

type QrxEntry = {
  id: string;
  title: string | null;
  company_name: string | null;
  description: string | null;
  type: "normal" | "business" | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_email: string | null;
  cta_navigation: string | null;
  owner_user_id: string | null;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function EditQrxPage() {
  const router = useRouter();
  const params = useParams();

  const locale = getParam(params?.locale as string | string[] | undefined, "de");
  const qrxId = getParam(params?.id as string | string[] | undefined, "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [entry, setEntry] = useState<QrxEntry | null>(null);

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [ctaPhone, setCtaPhone] = useState("");
  const [ctaWebsite, setCtaWebsite] = useState("");
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaNavigation, setCtaNavigation] = useState("");

  useEffect(() => {
    void loadQrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrxId]);

  async function loadQrx() {
    setLoading(true);
    setErrorText(null);
    setSuccessText(null);

    if (!qrxId) {
      setErrorText("QR-X ID fehlt.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorText(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setErrorText("Bitte melde dich zuerst an.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("qr_x_entries")
      .select(
        "id,title,company_name,description,type,location_name,location_lat,location_lng,cta_phone,cta_website,cta_email,cta_navigation,owner_user_id"
      )
      .eq("id", qrxId)
      .maybeSingle()
      .returns<QrxEntry>();

    if (error) {
      setErrorText(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setErrorText("QR-X wurde nicht gefunden.");
      setLoading(false);
      return;
    }

    if (data.owner_user_id !== user.id) {
      setErrorText("Du darfst diesen QR-X nicht bearbeiten.");
      setLoading(false);
      return;
    }

    setEntry(data);
    setTitle(data.title ?? "");
    setCompanyName(data.company_name ?? "");
    setDescription(data.description ?? "");
    setLocationName(data.location_name ?? "");
    setLocationLat(data.location_lat != null ? String(data.location_lat) : "");
    setLocationLng(data.location_lng != null ? String(data.location_lng) : "");
    setCtaPhone(data.cta_phone ?? "");
    setCtaWebsite(data.cta_website ?? "");
    setCtaEmail(data.cta_email ?? "");
    setCtaNavigation(data.cta_navigation ?? "");
    setLoading(false);
  }

  function parseOptionalNumber(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const normalized = trimmed.replace(",", ".");
    const numberValue = Number(normalized);

    if (!Number.isFinite(numberValue)) {
      throw new Error("Breiten- und Längengrad müssen gültige Zahlen sein.");
    }

    return numberValue;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!entry) {
        throw new Error("QR-X konnte nicht geladen werden.");
      }

      const nextTitle = title.trim();

      if (!nextTitle) {
        throw new Error("Bitte gib einen Titel ein.");
      }

      const lat = parseOptionalNumber(locationLat);
      const lng = parseOptionalNumber(locationLng);

      const { error } = await supabase
        .from("qr_x_entries")
        .update({
          title: nextTitle,
          company_name: entry.type === "business" ? toNullable(companyName) : null,
          description: toNullable(description),
          location_name: toNullable(locationName),
          location_lat: lat,
          location_lng: lng,
          cta_phone: entry.type === "business" ? toNullable(ctaPhone) : null,
          cta_website: entry.type === "business" ? toNullable(ctaWebsite) : null,
          cta_email: entry.type === "business" ? toNullable(ctaEmail) : null,
          cta_navigation: entry.type === "business" ? toNullable(ctaNavigation) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id)
        .eq("owner_user_id", entry.owner_user_id);

      if (error) {
        throw error;
      }

      setSuccessText("QR-X wurde gespeichert.");
      router.refresh();

      window.setTimeout(() => {
        router.push(`/${locale}/dashboard/qrx`);
      }, 800);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "QR-X konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  const isBusiness = entry?.type === "business";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-white.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="QR-X bearbeiten Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>QR-X bearbeiten</span>
          <h1>QR-X bearbeiten</h1>
          <p>
            Schlanke Bearbeitung für die wichtigsten QR-X Daten. Bilder, Dateien und erweiterte Inhalte ergänzen wir später.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/qrx/${qrxId}`} className={styles.secondaryButton}>
            QR-X öffnen
          </Link>
          <Link href={`/${locale}/dashboard/qrx`} className={styles.secondaryButton}>
            Zurück
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 880,
          margin: "0 auto",
          borderRadius: 30,
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
          padding: 22,
        }}
      >
        <div className={styles.cardHeader}>
          <div>
            <h2>Basisdaten</h2>
            <p>Titel, Beschreibung, Standort und Kontaktangaben bearbeiten.</p>
          </div>
          <span>{isBusiness ? "Business QR-X" : "Normaler QR-X"}</span>
        </div>

        {loading ? (
          <div
            style={{
              minHeight: 240,
              display: "grid",
              placeItems: "center",
              color: "#cbd5e1",
              fontWeight: 950,
            }}
          >
            QR-X wird geladen …
          </div>
        ) : null}

        {errorText ? (
          <div
            style={{
              borderRadius: 22,
              padding: 16,
              marginBottom: 16,
              background: "rgba(239, 68, 68, 0.14)",
              border: "1px solid rgba(252, 165, 165, 0.22)",
              color: "#fecaca",
              fontWeight: 850,
              lineHeight: 1.55,
            }}
          >
            {errorText}
          </div>
        ) : null}

        {successText ? (
          <div
            style={{
              borderRadius: 22,
              padding: 16,
              marginBottom: 16,
              background: "rgba(34, 197, 94, 0.14)",
              border: "1px solid rgba(134, 239, 172, 0.22)",
              color: "#bbf7d0",
              fontWeight: 850,
              lineHeight: 1.55,
            }}
          >
            {successText}
          </div>
        ) : null}

        {!loading && entry ? (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <label style={labelStyle}>
              Titel *
              <input value={title} onChange={(event) => setTitle(event.target.value)} style={inputStyle} required />
            </label>

            {isBusiness ? (
              <label style={labelStyle}>
                Firmenname
                <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} style={inputStyle} />
              </label>
            ) : null}

            <label style={labelStyle}>
              Beschreibung
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                style={{ ...inputStyle, minHeight: 140, paddingTop: 14, resize: "vertical" }}
              />
            </label>

            <label style={labelStyle}>
              Standortname
              <input value={locationName} onChange={(event) => setLocationName(event.target.value)} style={inputStyle} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={labelStyle}>
                Breitengrad
                <input
                  value={locationLat}
                  onChange={(event) => setLocationLat(event.target.value)}
                  style={inputStyle}
                  placeholder="z. B. 50.9375"
                />
              </label>

              <label style={labelStyle}>
                Längengrad
                <input
                  value={locationLng}
                  onChange={(event) => setLocationLng(event.target.value)}
                  style={inputStyle}
                  placeholder="z. B. 6.9603"
                />
              </label>
            </div>

            {isBusiness ? (
              <>
                <div
                  style={{
                    height: 1,
                    background: "rgba(255,255,255,0.09)",
                    margin: "4px 0",
                  }}
                />

                <div>
                  <h3 style={{ margin: "0 0 10px", color: "#ffffff", fontSize: 18 }}>Kontakt & Aktionen</h3>
                  <p style={{ margin: "0 0 14px", color: "#94a3b8", lineHeight: 1.55 }}>
                    Diese Angaben erscheinen später als Buttons in der QR-X Webansicht.
                  </p>
                </div>

                <label style={labelStyle}>
                  Telefon
                  <input value={ctaPhone} onChange={(event) => setCtaPhone(event.target.value)} style={inputStyle} />
                </label>

                <label style={labelStyle}>
                  Webseite
                  <input
                    value={ctaWebsite}
                    onChange={(event) => setCtaWebsite(event.target.value)}
                    style={inputStyle}
                    placeholder="https://..."
                  />
                </label>

                <label style={labelStyle}>
                  E-Mail
                  <input value={ctaEmail} onChange={(event) => setCtaEmail(event.target.value)} style={inputStyle} />
                </label>

                <label style={labelStyle}>
                  Navigation
                  <input
                    value={ctaNavigation}
                    onChange={(event) => setCtaNavigation(event.target.value)}
                    style={inputStyle}
                    placeholder="Adresse oder Google-Maps-Link"
                  />
                </label>
              </>
            ) : null}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 8,
              }}
            >
              <Link href={`/${locale}/dashboard/qrx`} className={styles.secondaryButton}>
                Abbrechen
              </Link>

              <button
                type="submit"
                disabled={saving}
                className={styles.primaryButton}
                style={{ border: 0, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.72 : 1 }}
              >
                {saving ? "Speichert …" : "Speichern"}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.22)",
  background: "rgba(255,255,255,0.07)",
  color: "#ffffff",
  padding: "0 14px",
  fontSize: 15,
  fontWeight: 800,
  outline: "none",
  boxSizing: "border-box",
};
