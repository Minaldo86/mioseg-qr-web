"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../dashboard.module.css";

type QrxType = "normal" | "business";

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalNumber(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(",", ".");
  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`${label} muss eine gültige Zahl sein.`);
  }

  return numberValue;
}

export default function NewQrxPage() {
  const router = useRouter();
  const params = useParams();

  const locale = getParam(params?.locale as string | string[] | undefined, "de");

  const [qrxType, setQrxType] = useState<QrxType>("normal");
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

  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      const nextTitle = title.trim();

      if (!nextTitle) {
        throw new Error("Bitte gib einen Titel ein.");
      }

      const lat = parseOptionalNumber(locationLat, "Breitengrad");
      const lng = parseOptionalNumber(locationLng, "Längengrad");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Bitte melde dich zuerst an.");
      }

      const { data, error } = await supabase
        .from("qr_x_entries")
        .insert({
          owner_user_id: user.id,
          title: nextTitle,
          company_name: qrxType === "business" ? toNullable(companyName) : null,
          description: toNullable(description),
          type: qrxType,
          location_name: toNullable(locationName),
          location_lat: lat,
          location_lng: lng,
          cta_phone: qrxType === "business" ? toNullable(ctaPhone) : null,
          cta_website: qrxType === "business" ? toNullable(ctaWebsite) : null,
          cta_email: qrxType === "business" ? toNullable(ctaEmail) : null,
          cta_navigation: qrxType === "business" ? toNullable(ctaNavigation) : null,
          verified: false,
          suspended: false,
          password_protected: false,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      setSuccessText("QR-X wurde erstellt.");

      const newId = data?.id;

      window.setTimeout(() => {
        if (newId) {
          router.push(`/${locale}/dashboard/qrx/${newId}/edit`);
        } else {
          router.push(`/${locale}/dashboard/qrx`);
        }
      }, 700);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "QR-X konnte nicht erstellt werden.");
    } finally {
      setSaving(false);
    }
  }

  const isBusiness = qrxType === "business";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-white.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="QR-X erstellen Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>QR-X erstellen</span>
          <h1>Neuen QR-X erstellen</h1>
          <p>
            Erstelle eine schlanke erste Web-Version deines QR-X. Bilder, Dateien, Layouts und Credits
            ergänzen wir im nächsten Schritt.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx`} className={styles.secondaryButton}>
            Zurück zu Meine QR-X
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
            <p>Wähle den Typ und trage die wichtigsten Informationen ein.</p>
          </div>
          <span>{isBusiness ? "Business QR-X" : "Normaler QR-X"}</span>
        </div>

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

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button
              type="button"
              onClick={() => setQrxType("normal")}
              style={{
                minHeight: 74,
                borderRadius: 18,
                border: qrxType === "normal" ? "1px solid #bbf7d0" : "1px solid rgba(148, 163, 184, 0.22)",
                background: qrxType === "normal" ? "rgba(34,197,94,0.16)" : "rgba(255,255,255,0.06)",
                color: "#ffffff",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              ⌗ Normaler QR-X
            </button>

            <button
              type="button"
              onClick={() => setQrxType("business")}
              style={{
                minHeight: 74,
                borderRadius: 18,
                border: qrxType === "business" ? "1px solid #fed7aa" : "1px solid rgba(148, 163, 184, 0.22)",
                background: qrxType === "business" ? "rgba(251,146,60,0.16)" : "rgba(255,255,255,0.06)",
                color: "#ffffff",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              🏢 Business QR-X
            </button>
          </div>

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
              {saving ? "Erstellt …" : "QR-X erstellen"}
            </button>
          </div>
        </form>
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
