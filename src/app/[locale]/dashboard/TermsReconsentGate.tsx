"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


const SUPPORTED_TERMS_LOCALES = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;
type TermsLocale = (typeof SUPPORTED_TERMS_LOCALES)[number];

type TermsCopy = {
  saveFailed: string;
  checking: string;
  updatedTitle: string;
  updatedText: string;
  viewTerms: string;
  acceptCheck: string;
  saving: string;
  acceptContinue: string;
  meta: string;
};

const TERMS_TEXT: Record<TermsLocale, TermsCopy> = {
  de: {
    saveFailed: "Die Zustimmung konnte nicht gespeichert werden. Bitte versuche es erneut.",
    checking: "Nutzungsbedingungen werden geprüft …",
    updatedTitle: "Aktualisierte Nutzungsbedingungen",
    updatedText: "Wir haben unsere Nutzungsbedingungen aktualisiert. Bitte lies die Fassung {{version}} und bestätige sie, um mioseg qr weiter zu nutzen.",
    viewTerms: "Nutzungsbedingungen ansehen ↗",
    acceptCheck: "Ich akzeptiere die aktualisierten Nutzungsbedingungen (Version {{version}}).",
    saving: "Wird gespeichert …",
    acceptContinue: "Zustimmen und fortfahren",
    meta: "Version {{version}} · Stand {{date}}",
  },
  en: {
    saveFailed: "Your acceptance could not be saved. Please try again.",
    checking: "Checking Terms of Use …",
    updatedTitle: "Updated Terms of Use",
    updatedText: "We have updated our Terms of Use. Please read version {{version}} and accept it to continue using mioseg qr.",
    viewTerms: "View Terms of Use ↗",
    acceptCheck: "I accept the updated Terms of Use (version {{version}}).",
    saving: "Saving …",
    acceptContinue: "Accept and continue",
    meta: "Version {{version}} · Effective {{date}}",
  },
  tr: {
    saveFailed: "Onayınız kaydedilemedi. Lütfen tekrar deneyin.",
    checking: "Kullanım Koşulları kontrol ediliyor …",
    updatedTitle: "Güncellenen Kullanım Koşulları",
    updatedText: "Kullanım Koşullarımızı güncelledik. mioseg qr'ı kullanmaya devam etmek için lütfen {{version}} sürümünü okuyun ve kabul edin.",
    viewTerms: "Kullanım Koşullarını görüntüle ↗",
    acceptCheck: "Güncellenen Kullanım Koşullarını (sürüm {{version}}) kabul ediyorum.",
    saving: "Kaydediliyor …",
    acceptContinue: "Kabul et ve devam et",
    meta: "Sürüm {{version}} · Tarih {{date}}",
  },
  pl: {
    saveFailed: "Nie udało się zapisać zgody. Spróbuj ponownie.",
    checking: "Sprawdzanie Warunków użytkowania …",
    updatedTitle: "Zaktualizowane Warunki użytkowania",
    updatedText: "Zaktualizowaliśmy nasze Warunki użytkowania. Przeczytaj wersję {{version}} i zaakceptuj ją, aby nadal korzystać z mioseg qr.",
    viewTerms: "Zobacz Warunki użytkowania ↗",
    acceptCheck: "Akceptuję zaktualizowane Warunki użytkowania (wersja {{version}}).",
    saving: "Zapisywanie …",
    acceptContinue: "Zaakceptuj i kontynuuj",
    meta: "Wersja {{version}} · Stan na {{date}}",
  },
  ar: {
    saveFailed: "تعذر حفظ موافقتك. يرجى المحاولة مرة أخرى.",
    checking: "جارٍ التحقق من شروط الاستخدام …",
    updatedTitle: "شروط استخدام محدّثة",
    updatedText: "لقد قمنا بتحديث شروط الاستخدام. يرجى قراءة الإصدار {{version}} والموافقة عليه لمتابعة استخدام mioseg qr.",
    viewTerms: "عرض شروط الاستخدام ↗",
    acceptCheck: "أوافق على شروط الاستخدام المحدّثة (الإصدار {{version}}).",
    saving: "جارٍ الحفظ …",
    acceptContinue: "الموافقة والمتابعة",
    meta: "الإصدار {{version}} · بتاريخ {{date}}",
  },
  fr: {
    saveFailed: "Votre acceptation n’a pas pu être enregistrée. Veuillez réessayer.",
    checking: "Vérification des Conditions d’utilisation …",
    updatedTitle: "Conditions d’utilisation mises à jour",
    updatedText: "Nous avons mis à jour nos Conditions d’utilisation. Veuillez lire la version {{version}} et l’accepter pour continuer à utiliser mioseg qr.",
    viewTerms: "Voir les Conditions d’utilisation ↗",
    acceptCheck: "J’accepte les Conditions d’utilisation mises à jour (version {{version}}).",
    saving: "Enregistrement …",
    acceptContinue: "Accepter et continuer",
    meta: "Version {{version}} · Mise à jour {{date}}",
  },
  es: {
    saveFailed: "No se pudo guardar tu aceptación. Inténtalo de nuevo.",
    checking: "Comprobando los Términos de uso …",
    updatedTitle: "Términos de uso actualizados",
    updatedText: "Hemos actualizado nuestros Términos de uso. Lee la versión {{version}} y acéptala para seguir usando mioseg qr.",
    viewTerms: "Ver Términos de uso ↗",
    acceptCheck: "Acepto los Términos de uso actualizados (versión {{version}}).",
    saving: "Guardando …",
    acceptContinue: "Aceptar y continuar",
    meta: "Versión {{version}} · Fecha {{date}}",
  },
  it: {
    saveFailed: "Non è stato possibile salvare la tua accettazione. Riprova.",
    checking: "Verifica delle Condizioni d’uso …",
    updatedTitle: "Condizioni d’uso aggiornate",
    updatedText: "Abbiamo aggiornato le nostre Condizioni d’uso. Leggi la versione {{version}} e accettala per continuare a usare mioseg qr.",
    viewTerms: "Visualizza le Condizioni d’uso ↗",
    acceptCheck: "Accetto le Condizioni d’uso aggiornate (versione {{version}}).",
    saving: "Salvataggio …",
    acceptContinue: "Accetta e continua",
    meta: "Versione {{version}} · Aggiornata il {{date}}",
  },
};

function normalizeTermsLocale(value: string): TermsLocale {
  return SUPPORTED_TERMS_LOCALES.includes(value as TermsLocale)
    ? (value as TermsLocale)
    : "de";
}

function termsInterpolate(value: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (result, [key, replacement]) => result.replaceAll(`{{${key}}}`, replacement),
    value,
  );
}

const CURRENT_TERMS_VERSION = "1.0";
const CURRENT_TERMS_EFFECTIVE_DATE = "2026-08-08";

/**
 * Bei einer wesentlichen neuen Fassung:
 * - CURRENT_TERMS_VERSION erhöhen
 * - CURRENT_TERMS_EFFECTIVE_DATE aktualisieren
 * - TERMS_RECONSENT_REQUIRED = true
 *
 * Bei rein redaktionellen/unschädlichen Änderungen kann false bleiben.
 */
const TERMS_RECONSENT_REQUIRED = false;

export default function TermsReconsentGate({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const termsLocale = normalizeTermsLocale(locale);
  const ui = TERMS_TEXT[termsLocale];
  const [checking, setChecking] = useState(TERMS_RECONSENT_REQUIRED);
  const [accepted, setAccepted] = useState(!TERMS_RECONSENT_REQUIRED);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkAcceptance() {
      if (!TERMS_RECONSENT_REQUIRED) {
        if (active) {
          setAccepted(true);
          setChecking(false);
        }
        return;
      }

      setChecking(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError) {
        console.warn("Terms gate user lookup failed:", userError.message);
        setAccepted(true);
        setChecking(false);
        return;
      }

      if (!user) {
        // Login-/Session-Handling bleibt Aufgabe der bestehenden Web-Auth.
        setAccepted(true);
        setChecking(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("legal_acceptances")
        .select("id")
        .eq("user_id", user.id)
        .eq("document_type", "terms")
        .eq("document_version", CURRENT_TERMS_VERSION)
        .limit(1);

      if (!active) return;

      if (error) {
        console.warn("Terms acceptance check failed:", error.message);
        // Technischer Fehler soll Nutzer nicht dauerhaft aussperren.
        setAccepted(true);
        setChecking(false);
        return;
      }

      setAccepted(Array.isArray(data) && data.length > 0);
      setChecking(false);
    }

    void checkAcceptance();

    return () => {
      active = false;
    };
  }, []);

  async function acceptTerms() {
    if (!checked || saving || !userId) return;

    setSaving(true);
    setErrorText(null);

    try {
      const now = new Date().toISOString();

      const { error } = await supabase.from("legal_acceptances").insert({
        user_id: userId,
        document_type: "terms",
        document_version: CURRENT_TERMS_VERSION,
        document_effective_date: CURRENT_TERMS_EFFECTIVE_DATE,
        accepted_language: locale || "de",
        source: "web",
        client_accepted_at: now,
      });

      if (error) {
        const { data: existing } = await supabase
          .from("legal_acceptances")
          .select("id")
          .eq("user_id", userId)
          .eq("document_type", "terms")
          .eq("document_version", CURRENT_TERMS_VERSION)
          .limit(1);

        if (!existing?.length) throw error;
      }

      setAccepted(true);
    } catch (error) {
      console.warn("Terms reconsent failed:", error);
      setErrorText(ui.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  if (!TERMS_RECONSENT_REQUIRED || accepted) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <main style={screenStyle}>
        <div style={{ color: "#94a3b8", fontWeight: 800 }}>
          {ui.checking}
        </div>
      </main>
    );
  }

  return (
    <main style={screenStyle}>
      <section style={cardStyle}>
        <div style={iconStyle}>📄</div>

        <h1 style={titleStyle}>
          {ui.updatedTitle}
        </h1>

        <p style={textStyle}>
          {termsInterpolate(ui.updatedText, {
            version: CURRENT_TERMS_VERSION,
          })}
        </p>

        {/*
          Falls eure öffentliche Web-Route anders heißt, nur diesen href anpassen.
          Die App verwendet /nutzungsbedingungen.
        */}
        <Link
          href={`/${termsLocale}/nutzungsbedingungen`}
          target="_blank"
          rel="noreferrer"
          style={termsLinkStyle}
        >
          {ui.viewTerms}
        </Link>

        <label style={checkRowStyle}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            style={{ width: 20, height: 20, marginTop: 2, accentColor: "#f8fafc" }}
          />
          <span>
            {termsInterpolate(ui.acceptCheck, {
              version: CURRENT_TERMS_VERSION,
            })}
          </span>
        </label>

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}

        <button
          type="button"
          disabled={!checked || saving || !userId}
          onClick={() => void acceptTerms()}
          style={{
            ...acceptButtonStyle,
            opacity: !checked || saving || !userId ? 0.45 : 1,
            cursor: !checked || saving || !userId ? "not-allowed" : "pointer",
          }}
        >
          {saving ? ui.saving : ui.acceptContinue}
        </button>

        <div style={metaStyle}>
          {termsInterpolate(ui.meta, {
            version: CURRENT_TERMS_VERSION,
            date: CURRENT_TERMS_EFFECTIVE_DATE,
          })}
        </div>
      </section>
    </main>
  );
}

const screenStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "28px 18px",
  boxSizing: "border-box",
  background:
    "radial-gradient(circle at 80% 8%, rgba(37,99,235,0.2), transparent 28%), linear-gradient(180deg,#07101f 0%,#0d1726 55%,#08111f 100%)",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: "min(560px, 100%)",
  borderRadius: 28,
  padding: 26,
  boxSizing: "border-box",
  background: "rgba(15,23,42,0.94)",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 28px 80px rgba(0,0,0,0.24)",
};

const iconStyle: React.CSSProperties = {
  width: 54,
  height: 54,
  display: "grid",
  placeItems: "center",
  margin: "0 auto 16px",
  borderRadius: 17,
  background: "rgba(245,197,66,0.1)",
  border: "1px solid rgba(245,197,66,0.24)",
  fontSize: 24,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  textAlign: "center",
  fontSize: 26,
  lineHeight: 1.2,
  fontWeight: 950,
};

const textStyle: React.CSSProperties = {
  margin: "12px 0 0",
  color: "#aeb8c5",
  textAlign: "center",
  fontSize: 14,
  lineHeight: 1.65,
};

const termsLinkStyle: React.CSSProperties = {
  minHeight: 46,
  marginTop: 20,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#dce6f2",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 900,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const checkRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 11,
  marginTop: 20,
  color: "#cbd5e1",
  fontSize: 13,
  lineHeight: 1.55,
  cursor: "pointer",
};

const acceptButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 50,
  marginTop: 20,
  border: 0,
  borderRadius: 15,
  background: "#f8fafc",
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 950,
};

const metaStyle: React.CSSProperties = {
  marginTop: 12,
  color: "#718096",
  textAlign: "center",
  fontSize: 11,
};

const errorStyle: React.CSSProperties = {
  marginTop: 14,
  padding: "11px 12px",
  borderRadius: 12,
  color: "#fecaca",
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.2)",
  fontSize: 12,
  lineHeight: 1.5,
};
