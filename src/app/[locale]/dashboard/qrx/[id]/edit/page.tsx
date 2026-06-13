
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../../dashboard.module.css";

type QrxType = "normal" | "business";

type QrxEntry = {
  id: string;
  owner_user_id: string | null;
  title: string | null;
  company_name: string | null;
  description: string | null;
  type: QrxType | string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_email: string | null;
  cta_navigation: string | null;
  verified: boolean | null;
  suspended: boolean | null;
  password_protected: boolean | null;
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

function formatOptionalNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return String(value);
}

function getSafeQrxType(value: string | null | undefined): QrxType {
  return value === "business" ? "business" : "normal";
}

export default function EditQrxPage() {
  const router = useRouter();
  const params = useParams();

  const locale = getParam(params?.locale as string | string[] | undefined, "de");
  const qrxId = getParam(params?.id as string | string[] | undefined, "");

  const [loading, setLoading] = useState(true);
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

  const [passwordProtected, setPasswordProtected] = useState(false);
  const [passwordWasProtected, setPasswordWasProtected] = useState(false);
  const [qrxPassword, setQrxPassword] = useState("");
  const [qrxPasswordRepeat, setQrxPasswordRepeat] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  useEffect(() => {
    void loadQrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrxId]);

  async function saveQrxPasswordProtection(args: {
    qrxId: string;
    enabled: boolean;
    password: string;
  }) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const token = session?.access_token;

    if (!token) {
      throw new Error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
    }

    const { error } = await supabase.functions.invoke("set-qrx-password", {
      body: {
        qrxId: args.qrxId,
        enabled: args.enabled,
        password: args.enabled ? args.password : "",
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (error) {
      throw error;
    }
  }

  async function loadQrx() {
    setLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!qrxId) {
        throw new Error("QR-X ID fehlt.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Bitte melde dich zuerst an.");

      const { data, error } = await supabase
        .from("qr_x_entries")
        .select(
          "id,owner_user_id,title,company_name,description,type,location_name,location_lat,location_lng,cta_phone,cta_website,cta_email,cta_navigation,verified,suspended,password_protected"
        )
        .eq("id", qrxId)
        .maybeSingle()
        .returns<QrxEntry>();

      if (error) throw error;
      if (!data) throw new Error("QR-X wurde nicht gefunden.");
      if (data.owner_user_id !== user.id) throw new Error("Du darfst diesen QR-X nicht bearbeiten.");

      const safeType = getSafeQrxType(data.type);
      const isProtected = data.password_protected === true;

      setQrxType(safeType);
      setTitle(data.title ?? "");
      setCompanyName(data.company_name ?? "");
      setDescription(data.description ?? "");
      setLocationName(data.location_name ?? "");
      setLocationLat(formatOptionalNumber(data.location_lat));
      setLocationLng(formatOptionalNumber(data.location_lng));
      setCtaPhone(data.cta_phone ?? "");
      setCtaWebsite(data.cta_website ?? "");
      setCtaEmail(data.cta_email ?? "");
      setCtaNavigation(data.cta_navigation ?? "");
      setPasswordProtected(isProtected);
      setPasswordWasProtected(isProtected);
      setQrxPassword("");
      setQrxPasswordRepeat("");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "QR-X konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!qrxId) {
        throw new Error("QR-X ID fehlt.");
      }

      const nextTitle = title.trim();

      if (!nextTitle) {
        throw new Error("Bitte gib einen Titel ein.");
      }

      const nextPassword = qrxPassword.trim();
      const nextPasswordRepeat = qrxPasswordRepeat.trim();
      const passwordChanged = passwordProtected && nextPassword.length > 0;
      const passwordWasDisabled = passwordWasProtected && !passwordProtected;
      const passwordWasEnabled = !passwordWasProtected && passwordProtected;

      if ((passwordWasEnabled || passwordChanged) && nextPassword.length < 4) {
        throw new Error("Das Passwort muss mindestens 4 Zeichen lang sein.");
      }

      if ((passwordWasEnabled || passwordChanged) && nextPassword !== nextPasswordRepeat) {
        throw new Error("Die beiden Passwörter stimmen nicht überein.");
      }

      const lat = parseOptionalNumber(locationLat, "Breitengrad");
      const lng = parseOptionalNumber(locationLng, "Längengrad");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Bitte melde dich zuerst an.");

      const { error } = await supabase
        .from("qr_x_entries")
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", qrxId)
        .eq("owner_user_id", user.id);

      if (error) throw error;

      if (passwordWasDisabled) {
        await saveQrxPasswordProtection({ qrxId, enabled: false, password: "" });
        setPasswordWasProtected(false);
        setQrxPassword("");
        setQrxPasswordRepeat("");
      } else if (passwordWasEnabled || passwordChanged) {
        await saveQrxPasswordProtection({ qrxId, enabled: true, password: nextPassword });
        setPasswordWasProtected(true);
        setPasswordProtected(true);
        setQrxPassword("");
        setQrxPasswordRepeat("");
      }

      setSuccessText("QR-X wurde gespeichert.");
      router.refresh();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "QR-X konnte nicht gespeichert werden.");
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

        <nav className={styles.nav} aria-label="QR-X bearbeiten Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
          {qrxId ? <Link href={`/${locale}/dashboard/qrx/${qrxId}/media`}>Bilder & Medien</Link> : null}
          {qrxId ? <Link href={`/${locale}/qrx/${qrxId}`}>QR-X öffnen</Link> : null}
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>QR-X bearbeiten</span>
          <h1>{title.trim() || "QR-X bearbeiten"}</h1>
          <p>
            Bearbeite die Basisdaten deines QR-X und verwalte den Passwortschutz. Bilder und Galerie findest du unter „Bilder & Medien“.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx`} className={styles.secondaryButton}>
            Zurück zu Meine QR-X
          </Link>
          {qrxId ? (
            <Link href={`/${locale}/dashboard/qrx/${qrxId}/media`} className={styles.secondaryButton}>
              Bilder & Medien
            </Link>
          ) : null}
        </div>
      </section>

      <section style={panelStyle}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Basisdaten</h2>
            <p>Ändere Typ, Titel, Beschreibung, Standort und Kontaktaktionen.</p>
          </div>
          <span>{isBusiness ? "Business QR-X" : "Normaler QR-X"}</span>
        </div>

        {loading ? <div style={loadingStyle}>QR-X wird geladen …</div> : null}

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}
        {successText ? <div style={successStyle}>{successText}</div> : null}

        {!loading ? (
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
                <input value={locationLat} onChange={(event) => setLocationLat(event.target.value)} style={inputStyle} placeholder="z. B. 50.9375" />
              </label>

              <label style={labelStyle}>
                Längengrad
                <input value={locationLng} onChange={(event) => setLocationLng(event.target.value)} style={inputStyle} placeholder="z. B. 6.9603" />
              </label>
            </div>

            {isBusiness ? (
              <>
                <div style={dividerStyle} />

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
                  <input value={ctaWebsite} onChange={(event) => setCtaWebsite(event.target.value)} style={inputStyle} placeholder="https://..." />
                </label>

                <label style={labelStyle}>
                  E-Mail
                  <input value={ctaEmail} onChange={(event) => setCtaEmail(event.target.value)} style={inputStyle} />
                </label>

                <label style={labelStyle}>
                  Navigation
                  <input value={ctaNavigation} onChange={(event) => setCtaNavigation(event.target.value)} style={inputStyle} placeholder="Adresse oder Google-Maps-Link" />
                </label>
              </>
            ) : null}

            <div style={passwordBoxStyle(passwordProtected)}>
              <label style={passwordToggleStyle}>
                <span>QR-X mit Passwort schützen</span>
                <input
                  type="checkbox"
                  checked={passwordProtected}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setPasswordProtected(checked);
                    if (!checked) {
                      setQrxPassword("");
                      setQrxPasswordRepeat("");
                    }
                  }}
                  style={{ width: 20, height: 20, accentColor: "#60a5fa" }}
                />
              </label>

              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55, fontSize: 13 }}>
                Wenn aktiviert, müssen Besucher vor dem Öffnen dieses QR-X ein Passwort eingeben.
                {passwordWasProtected && passwordProtected ? " Lasse die Felder leer, wenn du das bestehende Passwort behalten möchtest." : ""}
              </p>

              {passwordProtected ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={labelStyle}>
                    {passwordWasProtected ? "Neues Passwort" : "Passwort *"}
                    <input
                      type="password"
                      value={qrxPassword}
                      onChange={(event) => setQrxPassword(event.target.value)}
                      style={inputStyle}
                      minLength={4}
                      required={!passwordWasProtected}
                      autoComplete="new-password"
                    />
                  </label>

                  <label style={labelStyle}>
                    {passwordWasProtected ? "Neues Passwort wiederholen" : "Passwort wiederholen *"}
                    <input
                      type="password"
                      value={qrxPasswordRepeat}
                      onChange={(event) => setQrxPasswordRepeat(event.target.value)}
                      style={inputStyle}
                      minLength={4}
                      required={!passwordWasProtected}
                      autoComplete="new-password"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <Link href={`/${locale}/dashboard/qrx`} className={styles.secondaryButton}>
                Abbrechen
              </Link>

              <button type="submit" disabled={saving} className={styles.primaryButton} style={{ border: 0, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.72 : 1 }}>
                {saving ? "Speichert …" : "QR-X speichern"}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  maxWidth: 880,
  margin: "0 auto",
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

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "rgba(255,255,255,0.09)",
  margin: "4px 0",
};

const loadingStyle: React.CSSProperties = {
  minHeight: 160,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  fontWeight: 950,
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

const successStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 16,
  marginBottom: 16,
  background: "rgba(34, 197, 94, 0.14)",
  border: "1px solid rgba(134, 239, 172, 0.22)",
  color: "#bbf7d0",
  fontWeight: 850,
  lineHeight: 1.55,
};

function passwordBoxStyle(active: boolean): React.CSSProperties {
  return {
    borderRadius: 22,
    padding: 16,
    background: active ? "rgba(59,130,246,0.14)" : "rgba(255,255,255,0.045)",
    border: active ? "1px solid rgba(147,197,253,0.28)" : "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 12,
  };
}

const passwordToggleStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  color: "#ffffff",
  fontWeight: 950,
  cursor: "pointer",
};
