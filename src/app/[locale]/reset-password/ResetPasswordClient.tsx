"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../auth/auth.module.css";

type Props = {
  locale: string;
};

function validatePassword(value: string, locale: string) {
  if (value.length < 8) {
    return locale === "de"
      ? "Das Passwort muss mindestens 8 Zeichen lang sein."
      : "The password must contain at least 8 characters.";
  }

  if (!/[A-ZÄÖÜ]/.test(value)) {
    return locale === "de"
      ? "Das Passwort muss mindestens einen Großbuchstaben enthalten."
      : "The password must contain at least one uppercase letter.";
  }

  if (!/[a-zäöüß]/.test(value)) {
    return locale === "de"
      ? "Das Passwort muss mindestens einen Kleinbuchstaben enthalten."
      : "The password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(value)) {
    return locale === "de"
      ? "Das Passwort muss mindestens eine Zahl enthalten."
      : "The password must contain at least one number.";
  }

  return null;
}

export default function ResetPasswordClient({ locale }: Props) {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [working, setWorking] = useState(false);

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const copy = useMemo(
    () =>
      locale === "de"
        ? {
            navHome: "Startseite",
            kicker: "Kontowiederherstellung",
            title: "Neues Passwort festlegen.",
            subtitle:
              "Lege ein neues Passwort für dein Mioseg-qr-Konto fest.",
            formTitle: "Passwort zurücksetzen",
            formSubtitle:
              "Der Link aus deiner E-Mail wird geprüft. Danach kannst du ein neues Passwort speichern.",
            password: "Neues Passwort",
            repeatPassword: "Neues Passwort wiederholen",
            submit: "Neues Passwort speichern",
            loading: "Passwort wird gespeichert …",
            checking: "Reset-Link wird geprüft …",
            invalidLink:
              "Der Reset-Link ist ungültig oder abgelaufen. Fordere auf der Login-Seite bitte einen neuen Link an.",
            mismatch: "Die Passwörter stimmen nicht überein.",
            success:
              "Dein Passwort wurde erfolgreich geändert. Du wirst zur Anmeldung weitergeleitet.",
            backToLogin: "Zurück zur Anmeldung",
            feature1Title: "Sicher",
            feature1Text:
              "Das neue Passwort wird direkt über Supabase Auth gespeichert.",
            feature2Title: "Einmaliger Link",
            feature2Text:
              "Der Link aus der E-Mail ist zeitlich begrenzt und nur für die Wiederherstellung gedacht.",
            feature3Title: "Danach anmelden",
            feature3Text:
              "Nach der Änderung meldest du dich mit deinem neuen Passwort an.",
          }
        : {
            navHome: "Home",
            kicker: "Account recovery",
            title: "Set a new password.",
            subtitle:
              "Choose a new password for your Mioseg qr account.",
            formTitle: "Reset password",
            formSubtitle:
              "The link from your email is being checked. You can then save a new password.",
            password: "New password",
            repeatPassword: "Repeat new password",
            submit: "Save new password",
            loading: "Saving password …",
            checking: "Checking reset link …",
            invalidLink:
              "The reset link is invalid or expired. Please request a new link on the login page.",
            mismatch: "The passwords do not match.",
            success:
              "Your password has been changed successfully. You will be redirected to login.",
            backToLogin: "Back to login",
            feature1Title: "Secure",
            feature1Text:
              "The new password is stored directly through Supabase Auth.",
            feature2Title: "One-time link",
            feature2Text:
              "The email link is time-limited and intended only for account recovery.",
            feature3Title: "Sign in afterwards",
            feature3Text:
              "After the change, sign in with your new password.",
          },
    [locale],
  );

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setRecoveryReady(Boolean(session));
        setCheckingSession(false);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        setErrorText(copy.invalidLink);
        setRecoveryReady(false);
        setCheckingSession(false);
        return;
      }

      if (data.session) {
        setRecoveryReady(true);
      }

      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [copy.invalidLink]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (working || !recoveryReady) return;

    setMessage(null);
    setErrorText(null);

    const passwordError = validatePassword(password, locale);
    if (passwordError) {
      setErrorText(passwordError);
      return;
    }

    if (password !== repeatPassword) {
      setErrorText(copy.mismatch);
      return;
    }

    setWorking(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage(copy.success);
      setPassword("");
      setRepeatPassword("");

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.replace(`/${locale}/login`);
        router.refresh();
      }, 1600);
    } catch {
      setErrorText(
        locale === "de"
          ? "Das Passwort konnte nicht geändert werden. Fordere bitte einen neuen Reset-Link an."
          : "The password could not be changed. Please request a new reset link.",
      );
    } finally {
      setWorking(false);
    }
  }

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
              <span>🔐</span>
              <div>
                <strong>{copy.feature1Title}</strong>
                <small>{copy.feature1Text}</small>
              </div>
            </div>

            <div className={styles.featureItem}>
              <span>✉️</span>
              <div>
                <strong>{copy.feature2Title}</strong>
                <small>{copy.feature2Text}</small>
              </div>
            </div>

            <div className={styles.featureItem}>
              <span>✓</span>
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

          {checkingSession ? (
            <div className={styles.message}>{copy.checking}</div>
          ) : null}

          {!checkingSession && !recoveryReady ? (
            <>
              <div className={styles.error}>{errorText || copy.invalidLink}</div>

              <p className={styles.switchText}>
                <Link href={`/${locale}/login`}>{copy.backToLogin}</Link>
              </p>
            </>
          ) : null}

          {!checkingSession && recoveryReady ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="new-password">{copy.password}</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="repeat-password">
                  {copy.repeatPassword}
                </label>
                <input
                  id="repeat-password"
                  type="password"
                  autoComplete="new-password"
                  value={repeatPassword}
                  onChange={(event) => setRepeatPassword(event.target.value)}
                  required
                />
              </div>

              <div
                style={{
                  borderRadius: 16,
                  padding: "12px 14px",
                  display: "grid",
                  gap: 5,
                  background: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(255,255,255,0.075)",
                  color: "#94a3b8",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                <span>✓ Mindestens 8 Zeichen</span>
                <span>✓ Ein Großbuchstabe</span>
                <span>✓ Ein Kleinbuchstabe</span>
                <span>✓ Eine Zahl</span>
              </div>

              {message ? (
                <div className={styles.message}>{message}</div>
              ) : null}

              {errorText ? (
                <div className={styles.error}>{errorText}</div>
              ) : null}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={working}
              >
                {working ? copy.loading : copy.submit}
              </button>
            </form>
          ) : null}

          <p className={styles.switchText}>
            <Link href={`/${locale}/login`}>{copy.backToLogin}</Link>
          </p>
        </article>
      </section>
    </main>
  );
}
