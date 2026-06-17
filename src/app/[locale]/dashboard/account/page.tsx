"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../dashboard.module.css";

type ProfileRow = {
  id: string;
  email: string | null;
  display_name?: string | null;
  full_name?: string | null;
  created_at?: string | null;

  billing_email?: string | null;
  billing_company?: string | null;
  billing_name?: string | null;
  billing_street?: string | null;
  billing_postal_code?: string | null;
  billing_city?: string | null;
  billing_country_code?: string | null;
  billing_vat_id?: string | null;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
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

function normalizeCountryCode(value: string) {
  return value.trim().toUpperCase().slice(0, 2) || "DE";
}

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();

  const locale = getParam(params?.locale as string | string[] | undefined, "de");

  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [billingEmail, setBillingEmail] = useState("");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCountryCode, setBillingCountryCode] = useState("DE");
  const [billingVatId, setBillingVatId] = useState("");

  const [savingBilling, setSavingBilling] = useState(false);
  const [billingMessage, setBillingMessage] = useState("");

  useEffect(() => {
    void loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    setErrorText(null);
    setBillingMessage("");

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

    setUserId(user.id);
    setEmail(user.email ?? "");
    setCreatedAt(user.created_at ?? null);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.warn("Profile konnte nicht geladen werden:", error.message);
      setProfile(null);
      setLoading(false);
      return;
    }

    const profileData = data as ProfileRow;

    setProfile(profileData);
    setBillingEmail(profileData.billing_email ?? user.email ?? "");
    setBillingCompany(profileData.billing_company ?? "");
    setBillingName(profileData.billing_name ?? "");
    setBillingStreet(profileData.billing_street ?? "");
    setBillingPostalCode(profileData.billing_postal_code ?? "");
    setBillingCity(profileData.billing_city ?? "");
    setBillingCountryCode(profileData.billing_country_code ?? "DE");
    setBillingVatId(profileData.billing_vat_id ?? "");
    setLoading(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    setErrorText(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorText(error.message);
      setSigningOut(false);
      return;
    }

    router.push(`/${locale}/login`);
  }

  async function saveBillingData() {
    if (!userId) return;

    setSavingBilling(true);
    setBillingMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        billing_email: billingEmail.trim() || null,
        billing_company: billingCompany.trim() || null,
        billing_name: billingName.trim() || null,
        billing_street: billingStreet.trim() || null,
        billing_postal_code: billingPostalCode.trim() || null,
        billing_city: billingCity.trim() || null,
        billing_country_code: normalizeCountryCode(billingCountryCode),
        billing_vat_id: billingVatId.trim() || null,
      })
      .eq("id", userId);

    if (error) {
      setBillingMessage(`Fehler: ${error.message}`);
    } else {
      setBillingMessage("Rechnungsdaten gespeichert.");
      await loadAccount();
    }

    setSavingBilling(false);
  }

  const displayName =
    profile?.display_name?.trim() ||
    profile?.full_name?.trim() ||
    billingName.trim() ||
    email ||
    "Mioseg qr Nutzer";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="Konto Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
          <Link href={`/${locale}/dashboard/credits`}>Credits</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Konto</span>
          <h1>Dein Konto</h1>
          <p>
            Hier verwaltest du deine Kontodaten und Rechnungsadresse für Credit-Käufe,
            Rechnungen und den automatischen E-Mail-Versand.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard`} className={styles.secondaryButton}>
            Zurück zum Dashboard
          </Link>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className={styles.primaryButton}
            style={{ border: 0, cursor: signingOut ? "not-allowed" : "pointer", opacity: signingOut ? 0.72 : 1 }}
          >
            {signingOut ? "Meldet ab …" : "Abmelden"}
          </button>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="Konto Übersicht">
        <article className={styles.statCard}>
          <div className={styles.statIcon}>👤</div>
          <div>
            <div className={styles.statValue}>{loading ? "…" : "Aktiv"}</div>
            <div className={styles.statLabel}>Konto-Status</div>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>💳</div>
          <div>
            <div className={styles.statValue}>Pay</div>
            <div className={styles.statLabel}>Credit-System</div>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>🧾</div>
          <div>
            <div className={styles.statValue}>PDF</div>
            <div className={styles.statLabel}>Rechnungen</div>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>🔐</div>
          <div>
            <div className={styles.statValue}>Auth</div>
            <div className={styles.statLabel}>Supabase Login</div>
          </div>
        </article>
      </section>

      <section
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Kontodaten</h2>
              <p>Diese Daten kommen direkt aus deiner Supabase-Anmeldung und dem Profil.</p>
            </div>
            <span>{loading ? "Lädt" : "Live"}</span>
          </div>

          {errorText ? <div style={errorStyle}>{errorText}</div> : null}

          {loading ? (
            <div
              style={{
                minHeight: 220,
                display: "grid",
                placeItems: "center",
                color: "#cbd5e1",
                fontWeight: 950,
              }}
            >
              Konto wird geladen …
            </div>
          ) : null}

          {!loading && !errorText ? (
            <div style={{ display: "grid", gap: 12 }}>
              <InfoRow label="Name / Anzeige" value={displayName} />
              <InfoRow label="E-Mail" value={email || "–"} />
              <InfoRow label="User-ID" value={userId || "–"} monospace />
              <InfoRow label="Registriert seit" value={formatDate(createdAt)} />
            </div>
          ) : null}
        </article>

        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Rechnungsdaten</h2>
              <p>
                Diese Daten werden für Rechnungen, PDF-Erstellung und den automatischen
                E-Mail-Versand nach Credit-Käufen verwendet.
              </p>
            </div>
            <span>Rechnung</span>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <label style={labelStyle}>
              Firma
              <input
                value={billingCompany}
                onChange={(event) => setBillingCompany(event.target.value)}
                placeholder="Firma"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Ansprechpartner / Name
              <input
                value={billingName}
                onChange={(event) => setBillingName(event.target.value)}
                placeholder="Max Mustermann"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Rechnungs-E-Mail
              <input
                value={billingEmail}
                onChange={(event) => setBillingEmail(event.target.value)}
                placeholder="rechnung@example.com"
                style={inputStyle}
                type="email"
              />
            </label>

            <label style={labelStyle}>
              Straße und Hausnummer
              <input
                value={billingStreet}
                onChange={(event) => setBillingStreet(event.target.value)}
                placeholder="Musterstraße 1"
                style={inputStyle}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <label style={labelStyle}>
                PLZ
                <input
                  value={billingPostalCode}
                  onChange={(event) => setBillingPostalCode(event.target.value)}
                  placeholder="52511"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Ort
                <input
                  value={billingCity}
                  onChange={(event) => setBillingCity(event.target.value)}
                  placeholder="Geilenkirchen"
                  style={inputStyle}
                />
              </label>
            </div>

            <label style={labelStyle}>
              Land
              <input
                value={billingCountryCode}
                onChange={(event) => setBillingCountryCode(normalizeCountryCode(event.target.value))}
                placeholder="DE"
                maxLength={2}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              USt.-ID
              <input
                value={billingVatId}
                onChange={(event) => setBillingVatId(event.target.value)}
                placeholder="Optional, z. B. DE123456789"
                style={inputStyle}
              />
            </label>

            {billingMessage ? (
              <div
                style={{
                  borderRadius: 16,
                  padding: "12px 14px",
                  background: billingMessage.startsWith("Fehler")
                    ? "rgba(239, 68, 68, 0.14)"
                    : "rgba(34, 197, 94, 0.14)",
                  border: billingMessage.startsWith("Fehler")
                    ? "1px solid rgba(252, 165, 165, 0.22)"
                    : "1px solid rgba(134, 239, 172, 0.22)",
                  color: billingMessage.startsWith("Fehler") ? "#fecaca" : "#bbf7d0",
                  fontWeight: 850,
                }}
              >
                {billingMessage}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void saveBillingData()}
              disabled={savingBilling}
              className={styles.primaryButton}
              style={{
                border: 0,
                cursor: savingBilling ? "not-allowed" : "pointer",
                opacity: savingBilling ? 0.72 : 1,
              }}
            >
              {savingBilling ? "Speichert …" : "Rechnungsdaten speichern"}
            </button>
          </div>
        </article>

        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Nächste Konto-Funktionen</h2>
              <p>Diese Bereiche bauen wir nach Stripe und Rechnungserstellung aus.</p>
            </div>
            <span>Roadmap</span>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <RoadmapItem icon="🧾" title="Rechnungen herunterladen" text="Nach Stripe-Kauf sollen Rechnungen im Konto abrufbar sein." />
            <RoadmapItem icon="🏢" title="Rechnungsadresse" text="Firma, Name, Straße, PLZ, Ort und Land für korrekte Rechnungen." />
            <RoadmapItem icon="🔐" title="Sicherheit" text="Passwort ändern, Sitzung prüfen und später Account löschen." />
            <RoadmapItem icon="🛟" title="Support" text="Kontakt & Hilfe direkt mit deinem Nutzerkonto verbinden." />
          </div>
        </article>
      </section>
    </main>
  );
}

function InfoRow({ label, value, monospace }: { label: string; value: string; monospace?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: 12,
        alignItems: "center",
        borderRadius: 18,
        padding: 14,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.075)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 900 }}>{label}</div>
      <div
        style={{
          color: "#ffffff",
          fontSize: 14,
          fontWeight: 850,
          wordBreak: "break-word",
          fontFamily: monospace ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function RoadmapItem({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "48px 1fr",
        gap: 12,
        alignItems: "center",
        borderRadius: 18,
        padding: 14,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.075)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          display: "grid",
          placeItems: "center",
          borderRadius: 18,
          color: "#07101f",
          background: "linear-gradient(180deg, #ffffff, #dbeafe)",
          fontSize: 21,
          fontWeight: 950,
        }}
      >
        {icon}
      </div>
      <div>
        <strong style={{ display: "block", color: "#ffffff", fontSize: 15, fontWeight: 950 }}>{title}</strong>
        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 12, lineHeight: 1.45, fontWeight: 750 }}>
          {text}
        </p>
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 50,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  padding: "12px 14px",
  fontSize: 14,
  fontWeight: 750,
  outline: "none",
  boxSizing: "border-box",
};

const errorStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 16,
  marginBottom: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};
