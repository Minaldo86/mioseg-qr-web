"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../dashboard.module.css";

type ProfileRow = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  created_at?: string | null;

  first_name?: string | null;
  last_name?: string | null;
  street?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  company_name?: string | null;
  vat_id?: string | null;
  language?: string | null;
  account_type?: string | null;

  billing_email?: string | null;
  billing_company?: string | null;
  billing_name?: string | null;
  billing_street?: string | null;
  billing_postal_code?: string | null;
  billing_city?: string | null;
  billing_country_code?: string | null;
  billing_vat_id?: string | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  created_at: string | null;
  status: string | null;
  invoice_type: string | null;
  amount_cents: number | null;
  gross_amount_cents: number | null;
  currency: string | null;
  pdf_path: string | null;
  storage_bucket: string | null;
};

type SecurityInfo = {
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  provider: string;
  browser: string;
  platform: string;
};



function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim())
    return value[0];
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


function formatMoney(cents: number | null | undefined, currency: string | null | undefined) {
  const value = Number(cents ?? 0);
  const safeValue = Number.isFinite(value) ? value / 100 : 0;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: (currency || "EUR").toUpperCase(),
  }).format(safeValue);
}

function getInvoiceStatusLabel(status: string | null | undefined) {
  if (status === "sent") return "Versendet";
  if (status === "created") return "Erstellt";
  if (status === "creating") return "Wird erstellt";
  if (status === "failed") return "Fehlgeschlagen";
  if (status === "refunded") return "Erstattet";
  return status?.trim() || "Unbekannt";
}

function getInvoiceStatusStyle(status: string | null | undefined): React.CSSProperties {
  const success = status === "sent" || status === "created";
  const failed = status === "failed";
  const refunded = status === "refunded";

  return {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 28,
    borderRadius: 999,
    padding: "0 10px",
    background: failed
      ? "rgba(239,68,68,0.14)"
      : refunded
        ? "rgba(245,158,11,0.14)"
        : success
          ? "rgba(34,197,94,0.14)"
          : "rgba(59,130,246,0.14)",
    border: failed
      ? "1px solid rgba(252,165,165,0.22)"
      : refunded
        ? "1px solid rgba(253,230,138,0.2)"
        : success
          ? "1px solid rgba(134,239,172,0.22)"
          : "1px solid rgba(147,197,253,0.2)",
    color: failed
      ? "#fecaca"
      : refunded
        ? "#fde68a"
        : success
          ? "#bbf7d0"
          : "#bfdbfe",
    fontSize: 11,
    fontWeight: 900,
  };
}


function formatDateTime(value: string | null | undefined) {
  if (!value) return "–";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getBrowserName(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/OPR\//i.test(userAgent)) return "Opera";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Chrome\//i.test(userAgent)) return "Google Chrome";
  if (/Safari\//i.test(userAgent)) return "Safari";
  return "Unbekannter Browser";
}

function getPlatformName(platform: string, userAgent: string) {
  if (/Windows/i.test(platform) || /Windows/i.test(userAgent)) return "Windows";
  if (/Mac/i.test(platform) || /Macintosh/i.test(userAgent)) return "macOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Linux/i.test(platform) || /Linux/i.test(userAgent)) return "Linux";
  return platform || "Unbekanntes Gerät";
}

function validateNewPassword(value: string) {
  if (value.length < 8) {
    return "Das neue Passwort muss mindestens 8 Zeichen lang sein.";
  }

  if (!/[A-ZÄÖÜ]/.test(value)) {
    return "Das neue Passwort muss mindestens einen Großbuchstaben enthalten.";
  }

  if (!/[a-zäöüß]/.test(value)) {
    return "Das neue Passwort muss mindestens einen Kleinbuchstaben enthalten.";
  }

  if (!/[0-9]/.test(value)) {
    return "Das neue Passwort muss mindestens eine Zahl enthalten.";
  }

  return null;
}

function normalizeCountryCode(value: string) {
  return value.trim().toUpperCase().slice(0, 2) || "DE";
}

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();

  const locale = getParam(
    params?.locale as string | string[] | undefined,
    "de",
  );

  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "billing" | "security">("overview");

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("DE");
  const [companyName, setCompanyName] = useState("");
  const [vatId, setVatId] = useState("");
  const [language, setLanguage] = useState("de");
  const [accountType, setAccountType] = useState("private");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

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

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  const [securityInfo, setSecurityInfo] = useState<SecurityInfo>({
    lastSignInAt: null,
    emailConfirmedAt: null,
    provider: "E-Mail",
    browser: "Unbekannter Browser",
    platform: "Unbekanntes Gerät",
  });
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    void loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    setErrorText(null);
    setBillingMessage("");
    setProfileMessage("");
    setInvoiceError(null);
    setLoadingInvoices(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorText(userError.message);
      setLoading(false);
      setLoadingInvoices(false);
      return;
    }

    if (!user) {
      setErrorText("Bitte melde dich zuerst an.");
      setLoading(false);
      setLoadingInvoices(false);
      return;
    }

    setUserId(user.id);
    setEmail(user.email ?? "");
    setCreatedAt(user.created_at ?? null);

    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";
    const platform =
      typeof navigator !== "undefined" ? navigator.platform : "";

    setSecurityInfo({
      lastSignInAt: user.last_sign_in_at ?? null,
      emailConfirmedAt: user.email_confirmed_at ?? null,
      provider:
        typeof user.app_metadata?.provider === "string"
          ? user.app_metadata.provider
          : "email",
      browser: getBrowserName(userAgent),
      platform: getPlatformName(platform, userAgent),
    });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.warn("Profile konnte nicht geladen werden:", error.message);
    }

    const { data: invoiceRows, error: invoicesError } = await supabase
      .from("qrx_invoices")
      .select(
        "id,invoice_number,created_at,status,invoice_type,amount_cents,gross_amount_cents,currency,pdf_path,storage_bucket",
      )
      .eq("user_id", user.id)
      .eq("invoice_type", "invoice")
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<InvoiceRow[]>();

    if (invoicesError) {
      console.warn("Rechnungen konnten nicht geladen werden:", invoicesError.message);
      setInvoices([]);
      setInvoiceError(invoicesError.message);
    } else {
      setInvoices(invoiceRows ?? []);
    }

    setLoadingInvoices(false);

    const profileData = (data ?? { id: user.id }) as ProfileRow;

    setProfile(profileData);
    setFirstName(profileData.first_name ?? "");
    setLastName(profileData.last_name ?? "");
    setStreet(profileData.street ?? "");
    setPostalCode(profileData.postal_code ?? "");
    setCity(profileData.city ?? "");
    setCountry(profileData.country ?? "DE");
    setCompanyName(profileData.company_name ?? "");
    setVatId(profileData.vat_id ?? "");
    setLanguage(profileData.language ?? "de");
    setAccountType(profileData.account_type ?? "private");
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

  async function handleDeleteAccount() {
    if (deletingAccount) return;

    setErrorText(null);
    setDeleteMessage("");

    if (!deleteChecked || deleteConfirm !== "KONTO LÖSCHEN") {
      setDeleteMessage(
        "Bitte bestätige die Löschung mit Checkbox und dem Text KONTO LÖSCHEN.",
      );
      return;
    }

    const reallyDelete = window.confirm(
      "Möchtest du dein Konto wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    );

    if (!reallyDelete) return;

    setDeletingAccount(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error(
          "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
        );
      }

      const { data, error } = await supabase.functions.invoke(
        "delete-account",
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      );

      if (error) throw error;

      const response = data as {
        ok?: boolean;
        error?: string;
        details?: string;
        step?: string;
      } | null;

      if (response && response.ok === false) {
        throw new Error(
          response.details ||
            response.error ||
            response.step ||
            "Konto konnte nicht gelöscht werden.",
        );
      }

      await supabase.auth.signOut();
      router.replace(`/${locale}/login`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Konto konnte nicht gelöscht werden.";
      setDeleteMessage(message);
      setDeletingAccount(false);
    }
  }

  async function handleDownloadInvoice(invoice: InvoiceRow) {
    if (downloadingInvoiceId) return;

    setDownloadingInvoiceId(invoice.id);
    setInvoiceError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
      }

      const response = await fetch("/api/account/invoices/download", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Die Rechnung konnte nicht heruntergeladen werden.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${invoice.invoice_number || "Rechnung"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setInvoiceError(
        error instanceof Error
          ? error.message
          : "Die Rechnung konnte nicht heruntergeladen werden.",
      );
    } finally {
      setDownloadingInvoiceId(null);
    }
  }

  function closePasswordModal() {
    if (changingPassword) return;

    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setRepeatPassword("");
    setPasswordMessage("");
  }

  async function handleChangePassword() {
    if (changingPassword) return;

    setPasswordMessage("");

    if (!email) {
      setPasswordMessage("Für dieses Konto ist keine E-Mail-Adresse verfügbar.");
      return;
    }

    if (!currentPassword) {
      setPasswordMessage("Bitte gib dein aktuelles Passwort ein.");
      return;
    }

    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
      setPasswordMessage(passwordError);
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordMessage("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage(
        "Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.",
      );
      return;
    }

    setChangingPassword(true);

    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (reauthError) {
        throw new Error("Das aktuelle Passwort ist nicht korrekt.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setPasswordMessage("Passwort erfolgreich geändert.");

      window.setTimeout(() => {
        setPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setRepeatPassword("");
        setPasswordMessage("");
      }, 1400);
    } catch (error) {
      setPasswordMessage(
        error instanceof Error
          ? error.message
          : "Das Passwort konnte nicht geändert werden.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function saveProfile() {
    if (!userId) return;

    setSavingProfile(true);
    setProfileMessage("");

    const payload = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      street: street.trim() || null,
      postal_code: postalCode.trim() || null,
      city: city.trim() || null,
      country: normalizeCountryCode(country),
      company_name: companyName.trim() || null,
      vat_id: vatId.trim() || null,
      language: language.trim() || "de",
      account_type: accountType.trim() || "private",
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          ...payload,
        },
        { onConflict: "id" },
      );

    if (error) {
      setProfileMessage(`Fehler: ${error.message}`);
    } else {
      setProfileMessage("Profil gespeichert.");
      await loadAccount();
    }

    setSavingProfile(false);
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
    `${firstName} ${lastName}`.trim() ||
    companyName.trim() ||
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

      <div className="mioseg-account-page-content">
      <section
        className={styles.hero}
        style={{
          minHeight: 0,
          paddingTop: 24,
          paddingBottom: 24,
        }}
      >
        <div>
          <span className={styles.kicker}>Konto</span>
          <h1 style={{ marginBottom: 10 }}>Konto</h1>
          <p style={{ maxWidth: 760 }}>
            Verwalte deine Kontodaten, Rechnungen und Sicherheit an einem Ort.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link
            href={`/${locale}/dashboard`}
            className={styles.secondaryButton}
          >
            Zurück zum Dashboard
          </Link>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className={styles.primaryButton}
            style={{
              border: 0,
              cursor: signingOut ? "not-allowed" : "pointer",
              opacity: signingOut ? 0.72 : 1,
            }}
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
            <div className={styles.statValue}>{loadingInvoices ? "…" : invoices.length}</div>
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

      <nav className="mioseg-account-tabs" aria-label="Kontobereiche">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={activeTab === "overview" ? "is-active" : ""}
        >
          <span>◉</span>
          Übersicht
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={activeTab === "profile" ? "is-active" : ""}
        >
          <span>👤</span>
          Profil
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={activeTab === "billing" ? "is-active" : ""}
        >
          <span>🧾</span>
          Rechnungen
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={activeTab === "security" ? "is-active" : ""}
        >
          <span>🔐</span>
          Sicherheit
        </button>
      </nav>


      <section
        className="mioseg-account-content"
        style={{
          width: "100%",
          display: "grid",
          gap: 18,
          boxSizing: "border-box",
        }}
      >
        {activeTab === "overview" ? (
          <>
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Kontodaten</h2>
              <p>
                Diese Daten kommen direkt aus deiner Supabase-Anmeldung und dem
                Profil.
              </p>
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
          </>
        ) : null}

        {activeTab === "profile" ? (
          <>
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Profil bearbeiten</h2>
              <p>
                Diese Angaben werden für dein Konto, Support-Anfragen und spätere
                Profilfunktionen verwendet. Die Login-E-Mail bleibt in Supabase Auth.
              </p>
            </div>
            <span>Profil</span>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div className="mioseg-account-grid-2">
              <label style={labelStyle}>
                Vorname
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Vorname"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Nachname
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Nachname"
                  style={inputStyle}
                />
              </label>
            </div>

            <label style={labelStyle}>
              Kontotyp
              <select
                value={accountType}
                onChange={(event) => setAccountType(event.target.value)}
                style={selectStyle}
              >
                <option value="private" style={optionStyle}>Privatperson</option>
                <option value="business" style={optionStyle}>Unternehmen</option>
              </select>
            </label>

            <label style={labelStyle}>
              Firma
              <input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Optional"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Straße und Hausnummer
              <input
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder="Straße und Hausnummer"
                style={inputStyle}
              />
            </label>

            <div className="mioseg-account-grid-postal">
              <label style={labelStyle}>
                PLZ
                <input
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  placeholder="PLZ"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Ort
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Ort"
                  style={inputStyle}
                />
              </label>
            </div>

            <div className="mioseg-account-grid-2">
              <label style={labelStyle}>
                Land
                <input
                  value={country}
                  onChange={(event) =>
                    setCountry(normalizeCountryCode(event.target.value))
                  }
                  placeholder="DE"
                  maxLength={2}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Sprache
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  style={selectStyle}
                >
                  <option value="de" style={optionStyle}>Deutsch</option>
                  <option value="en" style={optionStyle}>English</option>
                  <option value="fr" style={optionStyle}>Français</option>
                  <option value="tr" style={optionStyle}>Türkçe</option>
                </select>
              </label>
            </div>

            <label style={labelStyle}>
              USt.-ID
              <input
                value={vatId}
                onChange={(event) => setVatId(event.target.value)}
                placeholder="Optional, z. B. DE123456789"
                style={inputStyle}
              />
            </label>

            {profileMessage ? (
              <div
                style={{
                  borderRadius: 16,
                  padding: "12px 14px",
                  background: profileMessage.startsWith("Fehler")
                    ? "rgba(239, 68, 68, 0.14)"
                    : "rgba(34, 197, 94, 0.14)",
                  border: profileMessage.startsWith("Fehler")
                    ? "1px solid rgba(252, 165, 165, 0.22)"
                    : "1px solid rgba(134, 239, 172, 0.22)",
                  color: profileMessage.startsWith("Fehler")
                    ? "#fecaca"
                    : "#bbf7d0",
                  fontWeight: 850,
                }}
              >
                {profileMessage}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={savingProfile}
              className={styles.primaryButton}
              style={{
                border: 0,
                cursor: savingProfile ? "not-allowed" : "pointer",
                opacity: savingProfile ? 0.72 : 1,
              }}
            >
              {savingProfile ? "Speichert …" : "Profil speichern"}
            </button>
          </div>
        </article>
          </>
        ) : null}

        {activeTab === "billing" ? (
          <>
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Rechnungsdaten</h2>
              <p>
                Diese Daten werden für Rechnungen, PDF-Erstellung und den
                automatischen E-Mail-Versand nach Credit-Käufen verwendet.
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

            <div className="mioseg-account-grid-postal">
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
                onChange={(event) =>
                  setBillingCountryCode(
                    normalizeCountryCode(event.target.value),
                  )
                }
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
                  color: billingMessage.startsWith("Fehler")
                    ? "#fecaca"
                    : "#bbf7d0",
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
              <h2>Meine Rechnungen</h2>
              <p>
                Hier findest du deine Rechnungen für Credit-Käufe und kannst
                verfügbare PDF-Dateien sicher herunterladen.
              </p>
            </div>
            <span>
              {loadingInvoices
                ? "Lädt"
                : invoices.length === 0
                  ? "Keine Rechnungen"
                  : invoices.length === 1
                    ? "1 Rechnung"
                    : `${invoices.length} Rechnungen`}
            </span>
          </div>

          {invoiceError ? <div style={errorStyle}>{invoiceError}</div> : null}

          {loadingInvoices ? (
            <div
              style={{
                minHeight: 140,
                display: "grid",
                placeItems: "center",
                color: "#cbd5e1",
                fontWeight: 900,
              }}
            >
              Rechnungen werden geladen …
            </div>
          ) : null}

          {!loadingInvoices && invoices.length === 0 ? (
            <div style={emptyInvoiceStyle}>
              <div style={emptyInvoiceIconStyle}>🧾</div>
              <strong style={{ color: "#ffffff", fontSize: 17 }}>
                Noch keine Rechnungen
              </strong>
              <span>
                Nach jedem erfolgreichen Credit-Kauf wird deine Rechnung
                automatisch erstellt und hier dauerhaft gespeichert.
              </span>

              <div style={emptyInvoiceFeatureGridStyle}>
                <span>✓ PDF herunterladen</span>
                <span>✓ Rechnungsnummer</span>
                <span>✓ Zahlungsdatum</span>
                <span>✓ Betrag und Status</span>
              </div>
            </div>
          ) : null}

          {!loadingInvoices && invoices.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {invoices.map((invoice) => {
                const amount = invoice.gross_amount_cents ?? invoice.amount_cents ?? 0;
                const canDownload =
                  Boolean(invoice.pdf_path) &&
                  ["created", "sent", "refunded"].includes(invoice.status || "");
                const downloading = downloadingInvoiceId === invoice.id;

                return (
                  <article key={invoice.id} style={invoiceRowStyle}>
                    <div style={invoiceMainStyle}>
                      <div style={invoiceIconStyle}>🧾</div>
                      <div style={{ minWidth: 0 }}>
                        <strong style={invoiceNumberStyle}>{invoice.invoice_number}</strong>
                        <div style={invoiceMetaStyle}>
                          {formatDate(invoice.created_at)} · {formatMoney(amount, invoice.currency)}
                        </div>
                      </div>
                    </div>

                    <div style={invoiceActionsStyle}>
                      <span style={getInvoiceStatusStyle(invoice.status)}>
                        {getInvoiceStatusLabel(invoice.status)}
                      </span>

                      <button
                        type="button"
                        onClick={() => void handleDownloadInvoice(invoice)}
                        disabled={!canDownload || downloading}
                        style={{
                          ...invoiceDownloadButtonStyle,
                          cursor: !canDownload || downloading ? "not-allowed" : "pointer",
                          opacity: !canDownload || downloading ? 0.5 : 1,
                        }}
                      >
                        {downloading
                          ? "Lädt …"
                          : canDownload
                            ? "PDF herunterladen"
                            : "PDF nicht verfügbar"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </article>
          </>
        ) : null}

        {activeTab === "security" ? (
          <>
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Sicherheit</h2>
              <p>
                Prüfe deine aktuelle Anmeldung und ändere bei Bedarf dein
                Passwort.
              </p>
            </div>
            <span>Sicher</span>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div className="mioseg-security-grid">
              <SecurityInfoCard
                icon="✉️"
                label="Login-E-Mail"
                value={email || "–"}
                detail={
                  securityInfo.emailConfirmedAt
                    ? `Bestätigt am ${formatDateTime(
                        securityInfo.emailConfirmedAt,
                      )}`
                    : "E-Mail noch nicht bestätigt"
                }
                positive={Boolean(securityInfo.emailConfirmedAt)}
              />

              <SecurityInfoCard
                icon="🔐"
                label="Login-Provider"
                value={
                  securityInfo.provider === "email"
                    ? "Supabase E-Mail"
                    : securityInfo.provider
                }
                detail="Authentifizierung aktiv"
                positive
              />

              <SecurityInfoCard
                icon="💻"
                label="Dieses Gerät"
                value={`${securityInfo.browser} · ${securityInfo.platform}`}
                detail="Aktuelle Browsersitzung"
                positive
              />

              <SecurityInfoCard
                icon="🕘"
                label="Letzte Anmeldung"
                value={formatDateTime(securityInfo.lastSignInAt)}
                detail="Von Supabase Auth gemeldet"
                positive
              />
            </div>

            <div style={securityActionCardStyle}>
              <div>
                <strong style={{ color: "#ffffff", fontSize: 16 }}>
                  Passwort
                </strong>
                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#94a3b8",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  Verwende mindestens acht Zeichen, Groß- und Kleinbuchstaben
                  sowie eine Zahl.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPasswordMessage("");
                  setPasswordModalOpen(true);
                }}
                style={securityPrimaryButtonStyle}
              >
                Passwort ändern
              </button>
            </div>

          </div>
        </article>


        <article style={dangerPanelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2
                style={{
                  color: "#cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: 18,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ color: "#f87171", opacity: 0.8 }}
                >
                  🛡️
                </span>
                Konto dauerhaft löschen
              </h2>
              <p style={{ maxWidth: 820 }}>
                Diese Aktion kann nicht rückgängig gemacht werden. Deine
                Kontodaten, Credits und Zugänge werden entfernt; eigene QR-X
                werden deaktiviert.
              </p>
            </div>
            <span
              style={{
                color: "#94a3b8",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(148,163,184,0.12)",
              }}
            >
              Optional
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gap: 13,
              paddingTop: 4,
            }}
          >
            <label style={deleteCheckboxStyle}>
              <input
                type="checkbox"
                checked={deleteChecked}
                onChange={(event) => setDeleteChecked(event.target.checked)}
                disabled={deletingAccount}
                style={{ width: 18, height: 18, accentColor: "#ef4444" }}
              />
              <span>
                Ich möchte die dauerhafte Kontolöschung freischalten.
              </span>
            </label>

            <label style={labelStyle}>
              Zur Bestätigung bitte KONTO LÖSCHEN eingeben
              <input
                value={deleteConfirm}
                onChange={(event) => setDeleteConfirm(event.target.value)}
                placeholder="KONTO LÖSCHEN"
                disabled={deletingAccount}
                style={inputStyle}
              />
            </label>

            {deleteMessage ? (
              <div style={errorStyle}>{deleteMessage}</div>
            ) : null}

            <button
              type="button"
              onClick={() => void handleDeleteAccount()}
              disabled={
                deletingAccount ||
                !deleteChecked ||
                deleteConfirm !== "KONTO LÖSCHEN"
              }
              style={{
                minHeight: 44,
                justifySelf: "end",
                border: "1px solid rgba(248,113,113,0.24)",
                borderRadius: 13,
                background: "rgba(127,29,29,0.12)",
                color: "#fca5a5",
                padding: "0 16px",
                fontSize: 13,
                fontWeight: 900,
                cursor:
                  deletingAccount ||
                  !deleteChecked ||
                  deleteConfirm !== "KONTO LÖSCHEN"
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  deletingAccount ||
                  !deleteChecked ||
                  deleteConfirm !== "KONTO LÖSCHEN"
                    ? 0.52
                    : 1,
              }}
            >
              {deletingAccount
                ? "Konto wird gelöscht …"
                : "Konto dauerhaft löschen"}
            </button>
          </div>
        </article>
          </>
        ) : null}


      </section>

      </div>

      {passwordModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
          style={modalBackdropStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePasswordModal();
            }
          }}
        >
          <div style={modalCardStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <span style={modalKickerStyle}>SICHERHEIT</span>
                <h2
                  id="password-modal-title"
                  style={{ margin: "7px 0 0", color: "#ffffff" }}
                >
                  Passwort ändern
                </h2>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={changingPassword}
                aria-label="Fenster schließen"
                style={modalCloseButtonStyle}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 13 }}>
              <label style={labelStyle}>
                Aktuelles Passwort
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Neues Passwort
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Neues Passwort wiederholen
                <input
                  type="password"
                  value={repeatPassword}
                  onChange={(event) => setRepeatPassword(event.target.value)}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </label>

              <div style={passwordRulesStyle}>
                <span>Mindestens 8 Zeichen</span>
                <span>Mindestens ein Großbuchstabe</span>
                <span>Mindestens ein Kleinbuchstabe</span>
                <span>Mindestens eine Zahl</span>
              </div>

              {passwordMessage ? (
                <div
                  style={
                    passwordMessage.includes("erfolgreich")
                      ? successStyle
                      : errorStyle
                  }
                >
                  {passwordMessage}
                </div>
              ) : null}

              <div style={modalActionRowStyle}>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  style={modalSecondaryButtonStyle}
                >
                  Abbrechen
                </button>

                <button
                  type="button"
                  onClick={() => void handleChangePassword()}
                  disabled={changingPassword}
                  style={{
                    ...securityPrimaryButtonStyle,
                    cursor: changingPassword ? "not-allowed" : "pointer",
                    opacity: changingPassword ? 0.65 : 1,
                  }}
                >
                  {changingPassword ? "Wird geändert …" : "Passwort speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style
        dangerouslySetInnerHTML={{
          __html: `
.mioseg-account-page-content {
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  box-sizing: border-box;
}

.mioseg-account-page-content > section {
  width: 100%;
  box-sizing: border-box;
}

.mioseg-account-content {
  width: 100%;
  box-sizing: border-box;
}

.mioseg-account-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mioseg-account-grid-postal {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(0, 2fr);
  gap: 12px;
}


.mioseg-account-tabs {
  width: 100%;
  display: flex;
  gap: 8px;
  margin: 0 0 18px;
  padding: 0 0 8px;
  border-bottom: 1px solid rgba(148,163,184,0.14);
  overflow-x: auto;
  scrollbar-width: none;
}

.mioseg-account-tabs::-webkit-scrollbar {
  display: none;
}

.mioseg-account-tabs button {
  min-height: 44px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #94a3b8;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}

.mioseg-account-tabs button:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.03);
}

.mioseg-account-tabs button.is-active {
  color: #ffffff;
  border-bottom-color: #60a5fa;
}

.mioseg-security-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 760px) {
  .mioseg-account-grid-2,
  .mioseg-account-grid-postal,
  .mioseg-security-grid {
    grid-template-columns: 1fr;
  }
}
          `.trim(),
        }}
      />
    </main>
  );
}

function InfoRow({
  label,
  value,
  monospace,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
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
      <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 900 }}>
        {label}
      </div>
      <div
        style={{
          color: "#ffffff",
          fontSize: 14,
          fontWeight: 850,
          wordBreak: "break-word",
          fontFamily: monospace
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SecurityInfoCard({
  icon,
  label,
  value,
  detail,
  positive,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div style={securityInfoCardStyle}>
      <div style={securityInfoIconStyle}>{icon}</div>

      <div style={{ minWidth: 0 }}>
        <span style={securityInfoLabelStyle}>{label}</span>
        <strong style={securityInfoValueStyle}>{value}</strong>
        <span
          style={{
            ...securityInfoDetailStyle,
            color: positive ? "#86efac" : "#fca5a5",
          }}
        >
          {positive ? "● " : "● "}
          {detail}
        </span>
      </div>
    </div>
  );
}

const securityInfoCardStyle: React.CSSProperties = {
  minHeight: 112,
  borderRadius: 20,
  padding: 15,
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const securityInfoIconStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  flex: "0 0 auto",
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(180deg,#ffffff,#dbeafe)",
  color: "#07101f",
  fontSize: 19,
};

const securityInfoLabelStyle: React.CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const securityInfoValueStyle: React.CSSProperties = {
  display: "block",
  marginTop: 5,
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 950,
  lineHeight: 1.35,
  wordBreak: "break-word",
};

const securityInfoDetailStyle: React.CSSProperties = {
  display: "block",
  marginTop: 6,
  fontSize: 11,
  fontWeight: 800,
  lineHeight: 1.4,
};

const securityActionCardStyle: React.CSSProperties = {
  borderRadius: 20,
  padding: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  background: "rgba(59,130,246,0.07)",
  border: "1px solid rgba(147,197,253,0.14)",
};

const securityPrimaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  border: 0,
  borderRadius: 14,
  padding: "0 16px",
  background: "linear-gradient(180deg,#2563eb,#7c3aed)",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 950,
  cursor: "pointer",
};




const modalBackdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  padding: 20,
  display: "grid",
  placeItems: "center",
  background: "rgba(2,6,23,0.78)",
  backdropFilter: "blur(10px)",
};

const modalCardStyle: React.CSSProperties = {
  width: "min(100%, 560px)",
  maxHeight: "calc(100vh - 40px)",
  overflowY: "auto",
  borderRadius: 26,
  padding: 22,
  background: "#0f1a2a",
  border: "1px solid rgba(148,163,184,0.2)",
  boxShadow: "0 30px 90px rgba(0,0,0,0.48)",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 18,
};

const modalKickerStyle: React.CSSProperties = {
  display: "inline-flex",
  minHeight: 27,
  alignItems: "center",
  borderRadius: 999,
  padding: "0 9px",
  background: "rgba(59,130,246,0.13)",
  border: "1px solid rgba(147,197,253,0.16)",
  color: "#bfdbfe",
  fontSize: 10,
  fontWeight: 950,
  letterSpacing: "0.06em",
};

const modalCloseButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 13,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#ffffff",
  fontSize: 24,
  lineHeight: 1,
  cursor: "pointer",
};

const passwordRulesStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 13,
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 7,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 800,
};

const modalActionRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const modalSecondaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: 14,
  padding: "0 16px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
};

const successStyle: React.CSSProperties = {
  borderRadius: 18,
  padding: 14,
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(134,239,172,0.22)",
  color: "#bbf7d0",
  fontWeight: 850,
  lineHeight: 1.5,
};

const emptyInvoiceIconStyle: React.CSSProperties = {
  width: 58,
  height: 58,
  display: "grid",
  placeItems: "center",
  borderRadius: 20,
  background: "linear-gradient(180deg,#ffffff,#dbeafe)",
  color: "#07101f",
  fontSize: 25,
  boxShadow: "0 14px 34px rgba(37,99,235,0.12)",
};

const emptyInvoiceFeatureGridStyle: React.CSSProperties = {
  width: "min(100%, 520px)",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
  marginTop: 6,
  color: "#cbd5e1",
  fontSize: 12,
  fontWeight: 800,
};

const invoiceRowStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 20,
  padding: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const invoiceMainStyle: React.CSSProperties = {
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const invoiceIconStyle: React.CSSProperties = {
  width: 46,
  height: 46,
  flex: "0 0 auto",
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(180deg,#ffffff,#dbeafe)",
  color: "#07101f",
  fontSize: 20,
};

const invoiceNumberStyle: React.CSSProperties = {
  display: "block",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 950,
  wordBreak: "break-word",
};

const invoiceMetaStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 750,
};

const invoiceActionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const invoiceDownloadButtonStyle: React.CSSProperties = {
  minHeight: 40,
  border: 0,
  borderRadius: 13,
  padding: "0 14px",
  background: "linear-gradient(180deg,#2563eb,#7c3aed)",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 950,
};

const emptyInvoiceStyle: React.CSSProperties = {
  minHeight: 220,
  borderRadius: 22,
  padding: 24,
  display: "grid",
  placeItems: "center",
  gap: 10,
  textAlign: "center",
  background:
    "linear-gradient(180deg, rgba(59,130,246,0.06), rgba(255,255,255,0.025))",
  border: "1px solid rgba(147,197,253,0.12)",
  color: "#94a3b8",
  lineHeight: 1.55,
  fontWeight: 800,
};

const panelStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 28,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const dangerPanelStyle: React.CSSProperties = {
  ...panelStyle,
  marginTop: 2,
  background: "rgba(15, 23, 42, 0.48)",
  border: "1px solid rgba(248, 113, 113, 0.1)",
  boxShadow: "none",
  padding: 18,
};

const deleteCheckboxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.45,
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


const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "#ffffff",
  colorScheme: "dark",
};

const optionStyle: React.CSSProperties = {
  background: "#111827",
  color: "#ffffff",
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
