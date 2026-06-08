"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import { defaultLocale, isValidLocale } from "../../../i18n/config";
import styles from "../auth/auth.module.css";

type Props = {
  params: {
    locale: string;
  };
};

function getRegisterErrorMessage(message: string, locale: string) {
  const lower = message.toLowerCase();

  if (lower.includes("already registered") || lower.includes("already exists")) {
    return locale === "de"
      ? "Für diese E-Mail existiert bereits ein Konto."
      : "An account already exists for this email.";
  }

  if (lower.includes("password")) {
    return locale === "de"
      ? "Bitte wähle ein stärkeres Passwort."
      : "Please choose a stronger password.";
  }

  return locale === "de"
    ? "Registrierung fehlgeschlagen. Bitte versuche es erneut."
    : "Registration failed. Please try again.";
}

export default function RegisterPage({ params }: Props) {
  const locale = isValidLocale(params.locale) ? params.locale : defaultLocale;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const copy = useMemo(
    () =>
      locale === "de"
        ? {
            navHome: "Startseite",
            kicker: "Mioseg qr Konto",
            title: "Erstelle dein Konto und starte deinen ersten QR-X.",
            subtitle:
              "Dein Account gilt später automatisch für Web und App. Alles bleibt über Supabase synchron.",
            formTitle: "Registrieren",
            formSubtitle: "Erstelle dein Konto für mioseg qr.",
            email: "E-Mail",
            password: "Passwort",
            passwordRepeat: "Passwort wiederholen",
            submit: "Konto erstellen",
            loading: "Konto wird erstellt ...",
            hasAccount: "Du hast bereits ein Konto?",
            login: "Einloggen",
            passwordMismatch: "Die Passwörter stimmen nicht überein.",
            passwordShort: "Das Passwort sollte mindestens 6 Zeichen haben.",
            success:
              "Konto wurde erstellt. Bitte bestätige bei Bedarf deine E-Mail-Adresse und melde dich danach an.",
            feature1Title: "QR-X im Browser",
            feature1Text: "Erstelle und verwalte QR-X später bequem am Desktop.",
            feature2Title: "App-kompatibel",
            feature2Text: "Später einfach mit demselben Konto in der App anmelden.",
            feature3Title: "Credits bereit",
            feature3Text: "Credit-Stand und Käufe werden zentral gespeichert.",
          }
        : {
            navHome: "Home",
            kicker: "Mioseg qr account",
            title: "Create your account and start your first QR-X.",
            subtitle:
              "Your account will work for web and app. Everything stays synced through Supabase.",
            formTitle: "Register",
            formSubtitle: "Create your mioseg qr account.",
            email: "Email",
            password: "Password",
            passwordRepeat: "Repeat password",
            submit: "Create account",
            loading: "Creating account ...",
            hasAccount: "Already have an account?",
            login: "Login",
            passwordMismatch: "The passwords do not match.",
            passwordShort: "The password should have at least 6 characters.",
            success:
              "Account created. Please confirm your email address if required, then sign in.",
            feature1Title: "QR-X in browser",
            feature1Text: "Create and manage QR-X comfortably on desktop later.",
            feature2Title: "App compatible",
            feature2Text: "Later sign in to the app with the same account.",
            feature3Title: "Credits ready",
            feature3Text: "Credit balance and purchases are stored centrally.",
          },
    [locale]
  );

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking(true);
    setErrorText(null);
    setMessage(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (password.length < 6) {
        setErrorText(copy.passwordShort);
        return;
      }

      if (password !== passwordRepeat) {
        setErrorText(copy.passwordMismatch);
        return;
      }

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/${locale}/dashboard`
          : undefined;

      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        setErrorText(getRegisterErrorMessage(error.message, locale));
        return;
      }

      setMessage(copy.success);
      setPassword("");
      setPasswordRepeat("");

      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 1200);
    } finally {
      setWorking(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}`} className={styles.brand}>
          <img src="/logo-white.png" alt="Mioseg qr Logo" />
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
              <span>📱</span>
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

          <form className={styles.form} onSubmit={handleRegister}>
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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="passwordRepeat">{copy.passwordRepeat}</label>
              <input
                id="passwordRepeat"
                type="password"
                autoComplete="new-password"
                value={passwordRepeat}
                onChange={(event) => setPasswordRepeat(event.target.value)}
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
            {copy.hasAccount} <Link href={`/${locale}/login`}>{copy.login}</Link>
          </p>
        </article>
      </section>
    </main>
  );
}
