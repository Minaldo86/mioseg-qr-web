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

function normalizeAccountLanguage(value: string | null | undefined): AccountLanguage {
  const raw = String(value ?? "").trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_ACCOUNT_LANGUAGES.includes(raw as AccountLanguage)
    ? (raw as AccountLanguage)
    : "de";
}

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

type LoginCopy = {
  navHome: string;
  kicker: string;
  title: string;
  subtitle: string;
  formTitle: string;
  formSubtitle: string;
  email: string;
  password: string;
  submit: string;
  loading: string;
  noAccount: string;
  register: string;
  forgotPassword: string;
  resetSent: string;
  feature1Title: string;
  feature1Text: string;
  feature2Title: string;
  feature2Text: string;
  feature3Title: string;
  feature3Text: string;
  invalidCredentials: string;
  emailNotConfirmed: string;
  loginFailed: string;
  emailRequired: string;
  resetFailed: string;
};

const LOGIN_COPY: Record<AccountLanguage, LoginCopy> = {
  de: {
    navHome: "Startseite", kicker: "Mioseg qr Konto", title: "Anmelden und QR-X im Browser verwalten.", subtitle: "Nutze denselben Account wie in der App. QR-X, Credits und gespeicherte Inhalte bleiben synchron.", formTitle: "Einloggen", formSubtitle: "Melde dich mit deiner E-Mail und deinem Passwort an.", email: "E-Mail", password: "Passwort", submit: "Einloggen", loading: "Wird angemeldet ...", noAccount: "Noch kein Konto?", register: "Jetzt registrieren", forgotPassword: "Passwort vergessen?", resetSent: "Wenn die E-Mail registriert ist, erhältst du einen Link zum Zurücksetzen des Passworts.", feature1Title: "Ein Konto", feature1Text: "Web und App nutzen denselben Supabase-Account.", feature2Title: "Synchron", feature2Text: "QR-X und Credits sind überall synchron verfügbar.", feature3Title: "Dashboard", feature3Text: "Verwalte QR-X, Scans, Credits und Support im Browser.", invalidCredentials: "E-Mail oder Passwort ist nicht korrekt.", emailNotConfirmed: "Bitte bestätige zuerst deine E-Mail-Adresse.", loginFailed: "Anmeldung fehlgeschlagen. Bitte versuche es erneut.", emailRequired: "Bitte gib zuerst deine E-Mail-Adresse ein.", resetFailed: "Passwort-Link konnte nicht gesendet werden."
  },
  en: {
    navHome: "Home", kicker: "Mioseg qr account", title: "Sign in and manage QR-X in the browser.", subtitle: "Use the same account as in the app. QR-X, credits and saved content stay synced.", formTitle: "Login", formSubtitle: "Sign in with your email and password.", email: "Email", password: "Password", submit: "Login", loading: "Signing in ...", noAccount: "No account yet?", register: "Create account", forgotPassword: "Forgot password?", resetSent: "If the email is registered, you will receive a password reset link.", feature1Title: "One account", feature1Text: "Web and app use the same Supabase account.", feature2Title: "Synced", feature2Text: "QR-X and credits stay synced everywhere.", feature3Title: "Dashboard", feature3Text: "Manage QR-X, scans, credits and support in the browser.", invalidCredentials: "Email or password is incorrect.", emailNotConfirmed: "Please confirm your email address first.", loginFailed: "Login failed. Please try again.", emailRequired: "Please enter your email address first.", resetFailed: "Password reset link could not be sent."
  },
  tr: {
    navHome: "Ana sayfa", kicker: "Mioseg qr hesabı", title: "Giriş yapın ve QR-X'lerinizi tarayıcıda yönetin.", subtitle: "Uygulamadaki hesabınızla aynı hesabı kullanın. QR-X'ler, krediler ve kaydedilen içerikler senkronize kalır.", formTitle: "Giriş yap", formSubtitle: "E-posta adresiniz ve şifrenizle giriş yapın.", email: "E-posta", password: "Şifre", submit: "Giriş yap", loading: "Giriş yapılıyor ...", noAccount: "Henüz hesabınız yok mu?", register: "Hesap oluştur", forgotPassword: "Şifrenizi mi unuttunuz?", resetSent: "E-posta kayıtlıysa şifre sıfırlama bağlantısı alacaksınız.", feature1Title: "Tek hesap", feature1Text: "Web ve uygulama aynı Supabase hesabını kullanır.", feature2Title: "Senkronize", feature2Text: "QR-X'ler ve krediler her yerde senkronize kalır.", feature3Title: "Kontrol paneli", feature3Text: "QR-X'leri, taramaları, kredileri ve desteği tarayıcıda yönetin.", invalidCredentials: "E-posta veya şifre hatalı.", emailNotConfirmed: "Lütfen önce e-posta adresinizi doğrulayın.", loginFailed: "Giriş başarısız. Lütfen tekrar deneyin.", emailRequired: "Lütfen önce e-posta adresinizi girin.", resetFailed: "Şifre sıfırlama bağlantısı gönderilemedi."
  },
  pl: {
    navHome: "Strona główna", kicker: "Konto Mioseg qr", title: "Zaloguj się i zarządzaj QR-X w przeglądarce.", subtitle: "Używaj tego samego konta co w aplikacji. QR-X, kredyty i zapisane treści pozostają zsynchronizowane.", formTitle: "Zaloguj się", formSubtitle: "Zaloguj się za pomocą adresu e-mail i hasła.", email: "E-mail", password: "Hasło", submit: "Zaloguj się", loading: "Logowanie ...", noAccount: "Nie masz jeszcze konta?", register: "Utwórz konto", forgotPassword: "Nie pamiętasz hasła?", resetSent: "Jeśli adres e-mail jest zarejestrowany, otrzymasz link do zresetowania hasła.", feature1Title: "Jedno konto", feature1Text: "Wersja webowa i aplikacja korzystają z tego samego konta Supabase.", feature2Title: "Synchronizacja", feature2Text: "QR-X i kredyty pozostają zsynchronizowane wszędzie.", feature3Title: "Panel", feature3Text: "Zarządzaj QR-X, skanami, kredytami i pomocą w przeglądarce.", invalidCredentials: "Adres e-mail lub hasło są nieprawidłowe.", emailNotConfirmed: "Najpierw potwierdź swój adres e-mail.", loginFailed: "Logowanie nie powiodło się. Spróbuj ponownie.", emailRequired: "Najpierw wpisz swój adres e-mail.", resetFailed: "Nie udało się wysłać linku do resetowania hasła."
  },
  ar: {
    navHome: "الرئيسية", kicker: "حساب Mioseg qr", title: "سجّل الدخول وأدر QR-X من المتصفح.", subtitle: "استخدم الحساب نفسه الموجود في التطبيق. تبقى عناصر QR-X والأرصدة والمحتوى المحفوظ متزامنة.", formTitle: "تسجيل الدخول", formSubtitle: "سجّل الدخول باستخدام بريدك الإلكتروني وكلمة المرور.", email: "البريد الإلكتروني", password: "كلمة المرور", submit: "تسجيل الدخول", loading: "جارٍ تسجيل الدخول ...", noAccount: "ليس لديك حساب بعد؟", register: "إنشاء حساب", forgotPassword: "هل نسيت كلمة المرور؟", resetSent: "إذا كان البريد الإلكتروني مسجلاً، فستتلقى رابطًا لإعادة تعيين كلمة المرور.", feature1Title: "حساب واحد", feature1Text: "يستخدم الويب والتطبيق حساب Supabase نفسه.", feature2Title: "متزامن", feature2Text: "تبقى عناصر QR-X والأرصدة متزامنة في كل مكان.", feature3Title: "لوحة التحكم", feature3Text: "أدر QR-X وعمليات المسح والأرصدة والدعم من المتصفح.", invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", emailNotConfirmed: "يرجى تأكيد عنوان بريدك الإلكتروني أولاً.", loginFailed: "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.", emailRequired: "يرجى إدخال عنوان بريدك الإلكتروني أولاً.", resetFailed: "تعذر إرسال رابط إعادة تعيين كلمة المرور."
  },
  fr: {
    navHome: "Accueil", kicker: "Compte Mioseg qr", title: "Connectez-vous et gérez vos QR-X dans le navigateur.", subtitle: "Utilisez le même compte que dans l’application. Les QR-X, crédits et contenus enregistrés restent synchronisés.", formTitle: "Connexion", formSubtitle: "Connectez-vous avec votre e-mail et votre mot de passe.", email: "E-mail", password: "Mot de passe", submit: "Se connecter", loading: "Connexion ...", noAccount: "Pas encore de compte ?", register: "Créer un compte", forgotPassword: "Mot de passe oublié ?", resetSent: "Si l’e-mail est enregistré, vous recevrez un lien de réinitialisation du mot de passe.", feature1Title: "Un seul compte", feature1Text: "Le web et l’application utilisent le même compte Supabase.", feature2Title: "Synchronisé", feature2Text: "Les QR-X et les crédits restent synchronisés partout.", feature3Title: "Tableau de bord", feature3Text: "Gérez vos QR-X, scans, crédits et demandes d’assistance dans le navigateur.", invalidCredentials: "L’e-mail ou le mot de passe est incorrect.", emailNotConfirmed: "Veuillez d’abord confirmer votre adresse e-mail.", loginFailed: "La connexion a échoué. Veuillez réessayer.", emailRequired: "Veuillez d’abord saisir votre adresse e-mail.", resetFailed: "Le lien de réinitialisation du mot de passe n’a pas pu être envoyé."
  },
  es: {
    navHome: "Inicio", kicker: "Cuenta Mioseg qr", title: "Inicia sesión y gestiona tus QR-X en el navegador.", subtitle: "Usa la misma cuenta que en la aplicación. Los QR-X, créditos y contenidos guardados permanecen sincronizados.", formTitle: "Iniciar sesión", formSubtitle: "Inicia sesión con tu correo electrónico y contraseña.", email: "Correo electrónico", password: "Contraseña", submit: "Iniciar sesión", loading: "Iniciando sesión ...", noAccount: "¿Aún no tienes cuenta?", register: "Crear cuenta", forgotPassword: "¿Has olvidado la contraseña?", resetSent: "Si el correo está registrado, recibirás un enlace para restablecer la contraseña.", feature1Title: "Una cuenta", feature1Text: "La web y la aplicación utilizan la misma cuenta de Supabase.", feature2Title: "Sincronizado", feature2Text: "Los QR-X y los créditos permanecen sincronizados en todas partes.", feature3Title: "Panel", feature3Text: "Gestiona QR-X, escaneos, créditos y soporte en el navegador.", invalidCredentials: "El correo electrónico o la contraseña no son correctos.", emailNotConfirmed: "Confirma primero tu dirección de correo electrónico.", loginFailed: "No se pudo iniciar sesión. Inténtalo de nuevo.", emailRequired: "Introduce primero tu dirección de correo electrónico.", resetFailed: "No se pudo enviar el enlace para restablecer la contraseña."
  },
  it: {
    navHome: "Home", kicker: "Account Mioseg qr", title: "Accedi e gestisci i tuoi QR-X nel browser.", subtitle: "Usa lo stesso account dell’app. QR-X, crediti e contenuti salvati rimangono sincronizzati.", formTitle: "Accedi", formSubtitle: "Accedi con e-mail e password.", email: "E-mail", password: "Password", submit: "Accedi", loading: "Accesso in corso ...", noAccount: "Non hai ancora un account?", register: "Crea account", forgotPassword: "Password dimenticata?", resetSent: "Se l’e-mail è registrata, riceverai un link per reimpostare la password.", feature1Title: "Un solo account", feature1Text: "Web e app utilizzano lo stesso account Supabase.", feature2Title: "Sincronizzato", feature2Text: "QR-X e crediti rimangono sincronizzati ovunque.", feature3Title: "Dashboard", feature3Text: "Gestisci QR-X, scansioni, crediti e supporto nel browser.", invalidCredentials: "E-mail o password non corretti.", emailNotConfirmed: "Conferma prima il tuo indirizzo e-mail.", loginFailed: "Accesso non riuscito. Riprova.", emailRequired: "Inserisci prima il tuo indirizzo e-mail.", resetFailed: "Non è stato possibile inviare il link per reimpostare la password."
  },
};

function getAuthErrorMessage(message: string, locale: string) {
  const lower = message.toLowerCase();
  const copy = LOGIN_COPY[normalizeAccountLanguage(locale)];
  if (lower.includes("invalid login credentials")) return copy.invalidCredentials;
  if (lower.includes("email not confirmed")) return copy.emailNotConfirmed;
  return copy.loginFailed;
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
    () => LOGIN_COPY[normalizeAccountLanguage(locale)],
    [locale],
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
      setErrorText(copy.emailRequired);
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
      setErrorText(copy.resetFailed);
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
