"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../auth/auth.module.css";

type Props = {
  locale: string;
};

const SUPPORTED_ACCOUNT_LANGUAGES = [
  "de",
  "en",
  "tr",
  "pl",
  "ar",
  "fr",
  "es",
  "it",
] as const;

type AccountLanguage = (typeof SUPPORTED_ACCOUNT_LANGUAGES)[number];

function isAccountLanguage(value: string | null | undefined): value is AccountLanguage {
  return Boolean(
    value && SUPPORTED_ACCOUNT_LANGUAGES.includes(value as AccountLanguage),
  );
}

function replaceLocaleInUrl(url: string, language: AccountLanguage) {
  if (!url.startsWith("/")) return `/${language}/dashboard`;

  const parts = url.split("/");
  if (parts.length > 1 && isAccountLanguage(parts[1])) {
    parts[1] = language;
    return parts.join("/");
  }

  return `/${language}/dashboard`;
}

function getAuthErrorMessage(message: string, locale: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return locale === "de"
      ? "E-Mail oder Passwort ist nicht korrekt."
      : "Email or password is incorrect.";
  }

  if (lower.includes("email not confirmed")) {
    return locale === "de"
      ? "Bitte bestätige zuerst deine E-Mail-Adresse."
      : "Please confirm your email address first.";
  }

  return locale === "de"
    ? "Anmeldung fehlgeschlagen. Bitte versuche es erneut."
    : "Login failed. Please try again.";
}

export default function LoginClient({ locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const nextUrl = searchParams.get("next") || `/${locale}/dashboard`;

  const copy = useMemo(
    () =>
      locale === "de"
        ? {
            navHome: "Startseite",
            kicker: "Mioseg qr Konto",
            title: "Anmelden und QR-X im Browser verwalten.",
            subtitle:
              "Nutze denselben Account wie in der App. QR-X, Credits und gespeicherte Inhalte bleiben synchron.",
            formTitle: "Einloggen",
            formSubtitle: "Melde dich mit deiner E-Mail und deinem Passwort an.",
            email: "E-Mail",
            password: "Passwort",
            submit: "Einloggen",
            loading: "Wird angemeldet ...",
            noAccount: "Noch kein Konto?",
            register: "Jetzt registrieren",
            forgotPassword: "Passwort vergessen?",
            resetSent:
              "Wenn die E-Mail registriert ist, erhältst du einen Link zum Zurücksetzen des Passworts.",
            feature1Title: "Ein Konto",
            feature1Text: "Web und App nutzen denselben Supabase-Account.",
            feature2Title: "Synchron",
            feature2Text: "QR-X und Credits sind später überall sichtbar.",
            feature3Title: "Dashboard",
            feature3Text: "Verwalte QR-X, Scans, Credits und Support im Browser.",
          }
        : {
            navHome: "Home",
            kicker: "Mioseg qr account",
            title: "Sign in and manage QR-X in the browser.",
            subtitle:
              "Use the same account as in the app. QR-X, credits and saved content stay synced.",
            formTitle: "Login",
            formSubtitle: "Sign in with your email and password.",
            email: "Email",
            password: "Password",
            submit: "Login",
            loading: "Signing in ...",
            noAccount: "No account yet?",
            register: "Create account",
            forgotPassword: "Forgot password?",
            resetSent:
              "If the email is registered, you will receive a password reset link.",
            feature1Title: "One account",
            feature1Text: "Web and app use the same Supabase account.",
            feature2Title: "Synced",
            feature2Text: "QR-X and credits will be visible everywhere.",
            feature3Title: "Dashboard",
            feature3Text: "Manage QR-X, scans, credits and support in the browser.",
          },
    [locale]
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking(true);
    setErrorText(null);
    setMessage(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorText(getAuthErrorMessage(error.message, locale));
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let destination = nextUrl;

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("language")
          .eq("id", user.id)
          .maybeSingle();

        if (isAccountLanguage(profile?.language)) {
          destination = replaceLocaleInUrl(nextUrl, profile.language);
        }
      }

      router.push(destination);
      router.refresh();
    } finally {
      setWorking(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorText(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorText(
        locale === "de"
          ? "Bitte gib zuerst deine E-Mail-Adresse ein."
          : "Please enter your email address first."
      );
      return;
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/${locale}/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      setErrorText(
        locale === "de"
          ? "Passwort-Link konnte nicht gesendet werden."
          : "Password reset link could not be sent."
      );
      return;
    }

    setMessage(copy.resetSent);
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <Link href={`/${locale}`} className={styles.navLink}>
          {copy.navHome}
        </Link>
      </header>

      <section className={styles.authShell}>
        <article className={styles.introCard}>
          <div>
            <span className={styles.kicker}>{copy.kicker}</span>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <span>▣</span>
              <div>
                <strong>{copy.feature1Title}</strong>
                <small>{copy.feature1Text}</small>
              </div>
            </div>
            <div className={styles.featureItem}>
              <span>🔄</span>
              <div>
                <strong>{copy.feature2Title}</strong>
                <small>{copy.feature2Text}</small>
              </div>
            </div>
            <div className={styles.featureItem}>
              <span>💳</span>
              <div>
                <strong>{copy.feature3Title}</strong>
                <small>{copy.feature3Text}</small>
              </div>
            </div>
          </div>
        </article>

        <article className={styles.formCard}>
          <h2>{copy.formTitle}</h2>
          <p>{copy.formSubtitle}</p>

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label htmlFor="email">{copy.email}</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">{copy.password}</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {message ? <div className={styles.message}>{message}</div> : null}
            {errorText ? <div className={styles.error}>{errorText}</div> : null}

            <button className={styles.primaryButton} type="submit" disabled={working}>
              {working ? copy.loading : copy.submit}
            </button>
          </form>

          <p className={styles.switchText}>
            <button
              type="button"
              onClick={handlePasswordReset}
              style={{
                appearance: "none",
                border: "none",
                padding: 0,
                background: "transparent",
                color: "#bfdbfe",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              {copy.forgotPassword}
            </button>
          </p>

          <p className={styles.switchText}>
            {copy.noAccount}{" "}
            <Link href={`/${locale}/register`}>{copy.register}</Link>
          </p>
        </article>
      </section>
    </main>
  );
}
