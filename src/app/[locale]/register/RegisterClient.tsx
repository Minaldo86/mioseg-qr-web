"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../auth/auth.module.css";

const CURRENT_TERMS_VERSION = "1.0";
const CURRENT_TERMS_DATE = "2026-08-08";

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

type Props = {
  locale: string;
};

type RegisterCopy = {
  navHome: string; kicker: string; title: string; subtitle: string; formTitle: string; formSubtitle: string;
  email: string; password: string; passwordRepeat: string; submit: string; loading: string; hasAccount: string;
  login: string; passwordMismatch: string; passwordShort: string; termsPrefix: string; terms: string; termsSuffix: string;
  age: string; privacyPrefix: string; privacy: string; termsMissing: string; ageMissing: string; success: string;
  feature1Title: string; feature1Text: string; feature2Title: string; feature2Text: string; feature3Title: string; feature3Text: string;
  alreadyRegistered: string; weakPassword: string; registrationFailed: string;
};

const REGISTER_COPY: Record<AccountLanguage, RegisterCopy> = {
  de: { navHome:"Startseite", kicker:"Mioseg qr Konto", title:"Erstelle dein Konto und starte deinen ersten QR-X.", subtitle:"Dein Account gilt automatisch für Web und App. Alles bleibt über Supabase synchron.", formTitle:"Registrieren", formSubtitle:"Erstelle dein Konto für mioseg qr.", email:"E-Mail", password:"Passwort", passwordRepeat:"Passwort wiederholen", submit:"Konto erstellen", loading:"Konto wird erstellt ...", hasAccount:"Du hast bereits ein Konto?", login:"Einloggen", passwordMismatch:"Die Passwörter stimmen nicht überein.", passwordShort:"Das Passwort sollte mindestens 6 Zeichen haben.", termsPrefix:"Ich akzeptiere die", terms:"Nutzungsbedingungen", termsSuffix:` (Version ${CURRENT_TERMS_VERSION}).`, age:"Ich bestätige, dass ich mindestens 16 Jahre alt bin.", privacyPrefix:"Informationen zur Verarbeitung deiner Daten findest du in der", privacy:"Datenschutzerklärung", termsMissing:"Bitte akzeptiere die Nutzungsbedingungen, bevor du dein Konto erstellst.", ageMissing:"Bitte bestätige, dass du mindestens 16 Jahre alt bist.", success:"Konto wurde erstellt. Bitte bestätige bei Bedarf deine E-Mail-Adresse und melde dich danach an.", feature1Title:"QR-X im Browser", feature1Text:"Erstelle und verwalte QR-X bequem am Desktop.", feature2Title:"App-kompatibel", feature2Text:"Melde dich mit demselben Konto auch in der App an.", feature3Title:"Credits bereit", feature3Text:"Credit-Stand und Käufe werden zentral gespeichert.", alreadyRegistered:"Für diese E-Mail existiert bereits ein Konto.", weakPassword:"Bitte wähle ein stärkeres Passwort.", registrationFailed:"Registrierung fehlgeschlagen. Bitte versuche es erneut." },
  en: { navHome:"Home", kicker:"Mioseg qr account", title:"Create your account and start your first QR-X.", subtitle:"Your account works for web and app. Everything stays synced through Supabase.", formTitle:"Register", formSubtitle:"Create your mioseg qr account.", email:"Email", password:"Password", passwordRepeat:"Repeat password", submit:"Create account", loading:"Creating account ...", hasAccount:"Already have an account?", login:"Login", passwordMismatch:"The passwords do not match.", passwordShort:"The password should have at least 6 characters.", termsPrefix:"I accept the", terms:"Terms of Use", termsSuffix:` (version ${CURRENT_TERMS_VERSION}).`, age:"I confirm that I am at least 16 years old.", privacyPrefix:"Information about how we process your data is available in the", privacy:"Privacy Policy", termsMissing:"Please accept the Terms of Use before creating your account.", ageMissing:"Please confirm that you are at least 16 years old.", success:"Account created. Please confirm your email address if required, then sign in.", feature1Title:"QR-X in browser", feature1Text:"Create and manage QR-X comfortably on desktop.", feature2Title:"App compatible", feature2Text:"Sign in to the app with the same account.", feature3Title:"Credits ready", feature3Text:"Credit balance and purchases are stored centrally.", alreadyRegistered:"An account already exists for this email.", weakPassword:"Please choose a stronger password.", registrationFailed:"Registration failed. Please try again." },
  tr: { navHome:"Ana sayfa", kicker:"Mioseg qr hesabı", title:"Hesabınızı oluşturun ve ilk QR-X'inizi başlatın.", subtitle:"Hesabınız web ve uygulamada geçerlidir. Her şey Supabase üzerinden senkronize kalır.", formTitle:"Kayıt ol", formSubtitle:"Mioseg qr hesabınızı oluşturun.", email:"E-posta", password:"Şifre", passwordRepeat:"Şifreyi tekrar girin", submit:"Hesap oluştur", loading:"Hesap oluşturuluyor ...", hasAccount:"Zaten hesabınız var mı?", login:"Giriş yap", passwordMismatch:"Şifreler eşleşmiyor.", passwordShort:"Şifre en az 6 karakter olmalıdır.", termsPrefix:"Şunları kabul ediyorum:", terms:"Kullanım Koşulları", termsSuffix:` (sürüm ${CURRENT_TERMS_VERSION}).`, age:"En az 16 yaşında olduğumu onaylıyorum.", privacyPrefix:"Verilerinizin işlenmesine ilişkin bilgileri şurada bulabilirsiniz:", privacy:"Gizlilik Politikası", termsMissing:"Hesabınızı oluşturmadan önce Kullanım Koşullarını kabul edin.", ageMissing:"Lütfen en az 16 yaşında olduğunuzu onaylayın.", success:"Hesap oluşturuldu. Gerekirse e-posta adresinizi doğrulayın ve ardından giriş yapın.", feature1Title:"Tarayıcıda QR-X", feature1Text:"QR-X'lerinizi masaüstünde kolayca oluşturun ve yönetin.", feature2Title:"Uygulama uyumlu", feature2Text:"Aynı hesapla uygulamada da giriş yapın.", feature3Title:"Krediler hazır", feature3Text:"Kredi bakiyesi ve satın alımlar merkezi olarak saklanır.", alreadyRegistered:"Bu e-posta için zaten bir hesap mevcut.", weakPassword:"Lütfen daha güçlü bir şifre seçin.", registrationFailed:"Kayıt başarısız. Lütfen tekrar deneyin." },
  pl: { navHome:"Strona główna", kicker:"Konto Mioseg qr", title:"Utwórz konto i rozpocznij swój pierwszy QR-X.", subtitle:"Twoje konto działa w wersji webowej i aplikacji. Wszystko pozostaje zsynchronizowane przez Supabase.", formTitle:"Rejestracja", formSubtitle:"Utwórz konto mioseg qr.", email:"E-mail", password:"Hasło", passwordRepeat:"Powtórz hasło", submit:"Utwórz konto", loading:"Tworzenie konta ...", hasAccount:"Masz już konto?", login:"Zaloguj się", passwordMismatch:"Hasła nie są zgodne.", passwordShort:"Hasło powinno mieć co najmniej 6 znaków.", termsPrefix:"Akceptuję", terms:"Warunki korzystania", termsSuffix:` (wersja ${CURRENT_TERMS_VERSION}).`, age:"Potwierdzam, że mam co najmniej 16 lat.", privacyPrefix:"Informacje o przetwarzaniu danych znajdziesz w", privacy:"Polityce prywatności", termsMissing:"Przed utworzeniem konta zaakceptuj Warunki korzystania.", ageMissing:"Potwierdź, że masz co najmniej 16 lat.", success:"Konto zostało utworzone. W razie potrzeby potwierdź adres e-mail, a następnie się zaloguj.", feature1Title:"QR-X w przeglądarce", feature1Text:"Twórz i zarządzaj QR-X wygodnie na komputerze.", feature2Title:"Zgodne z aplikacją", feature2Text:"Zaloguj się w aplikacji przy użyciu tego samego konta.", feature3Title:"Kredyty gotowe", feature3Text:"Saldo kredytów i zakupy są przechowywane centralnie.", alreadyRegistered:"Dla tego adresu e-mail istnieje już konto.", weakPassword:"Wybierz silniejsze hasło.", registrationFailed:"Rejestracja nie powiodła się. Spróbuj ponownie." },
  ar: { navHome:"الرئيسية", kicker:"حساب Mioseg qr", title:"أنشئ حسابك وابدأ أول QR-X لك.", subtitle:"يعمل حسابك على الويب وفي التطبيق. يبقى كل شيء متزامنًا عبر Supabase.", formTitle:"إنشاء حساب", formSubtitle:"أنشئ حساب mioseg qr الخاص بك.", email:"البريد الإلكتروني", password:"كلمة المرور", passwordRepeat:"تأكيد كلمة المرور", submit:"إنشاء حساب", loading:"جارٍ إنشاء الحساب ...", hasAccount:"لديك حساب بالفعل؟", login:"تسجيل الدخول", passwordMismatch:"كلمتا المرور غير متطابقتين.", passwordShort:"يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.", termsPrefix:"أوافق على", terms:"شروط الاستخدام", termsSuffix:` (الإصدار ${CURRENT_TERMS_VERSION}).`, age:"أؤكد أن عمري 16 عامًا على الأقل.", privacyPrefix:"يمكنك العثور على معلومات حول معالجة بياناتك في", privacy:"سياسة الخصوصية", termsMissing:"يرجى قبول شروط الاستخدام قبل إنشاء حسابك.", ageMissing:"يرجى تأكيد أن عمرك 16 عامًا على الأقل.", success:"تم إنشاء الحساب. يرجى تأكيد بريدك الإلكتروني عند الحاجة ثم تسجيل الدخول.", feature1Title:"QR-X في المتصفح", feature1Text:"أنشئ وأدر QR-X بسهولة من سطح المكتب.", feature2Title:"متوافق مع التطبيق", feature2Text:"سجّل الدخول إلى التطبيق باستخدام الحساب نفسه.", feature3Title:"الأرصدة جاهزة", feature3Text:"يتم حفظ رصيد الأرصدة والمشتريات مركزيًا.", alreadyRegistered:"يوجد حساب بالفعل لهذا البريد الإلكتروني.", weakPassword:"يرجى اختيار كلمة مرور أقوى.", registrationFailed:"فشل التسجيل. يرجى المحاولة مرة أخرى." },
  fr: { navHome:"Accueil", kicker:"Compte Mioseg qr", title:"Créez votre compte et lancez votre premier QR-X.", subtitle:"Votre compte fonctionne sur le web et dans l’application. Tout reste synchronisé via Supabase.", formTitle:"Créer un compte", formSubtitle:"Créez votre compte mioseg qr.", email:"E-mail", password:"Mot de passe", passwordRepeat:"Répéter le mot de passe", submit:"Créer un compte", loading:"Création du compte ...", hasAccount:"Vous avez déjà un compte ?", login:"Se connecter", passwordMismatch:"Les mots de passe ne correspondent pas.", passwordShort:"Le mot de passe doit comporter au moins 6 caractères.", termsPrefix:"J’accepte les", terms:"Conditions d’utilisation", termsSuffix:` (version ${CURRENT_TERMS_VERSION}).`, age:"Je confirme avoir au moins 16 ans.", privacyPrefix:"Les informations sur le traitement de vos données sont disponibles dans la", privacy:"Politique de confidentialité", termsMissing:"Veuillez accepter les Conditions d’utilisation avant de créer votre compte.", ageMissing:"Veuillez confirmer que vous avez au moins 16 ans.", success:"Compte créé. Confirmez votre adresse e-mail si nécessaire, puis connectez-vous.", feature1Title:"QR-X dans le navigateur", feature1Text:"Créez et gérez facilement vos QR-X sur ordinateur.", feature2Title:"Compatible avec l’application", feature2Text:"Connectez-vous à l’application avec le même compte.", feature3Title:"Crédits disponibles", feature3Text:"Le solde de crédits et les achats sont enregistrés de manière centralisée.", alreadyRegistered:"Un compte existe déjà pour cet e-mail.", weakPassword:"Veuillez choisir un mot de passe plus robuste.", registrationFailed:"L’inscription a échoué. Veuillez réessayer." },
  es: { navHome:"Inicio", kicker:"Cuenta Mioseg qr", title:"Crea tu cuenta y empieza tu primer QR-X.", subtitle:"Tu cuenta funciona en la web y en la aplicación. Todo permanece sincronizado mediante Supabase.", formTitle:"Registrarse", formSubtitle:"Crea tu cuenta de mioseg qr.", email:"Correo electrónico", password:"Contraseña", passwordRepeat:"Repetir contraseña", submit:"Crear cuenta", loading:"Creando cuenta ...", hasAccount:"¿Ya tienes una cuenta?", login:"Iniciar sesión", passwordMismatch:"Las contraseñas no coinciden.", passwordShort:"La contraseña debe tener al menos 6 caracteres.", termsPrefix:"Acepto los", terms:"Términos de uso", termsSuffix:` (versión ${CURRENT_TERMS_VERSION}).`, age:"Confirmo que tengo al menos 16 años.", privacyPrefix:"La información sobre el tratamiento de tus datos está disponible en la", privacy:"Política de privacidad", termsMissing:"Acepta los Términos de uso antes de crear tu cuenta.", ageMissing:"Confirma que tienes al menos 16 años.", success:"Cuenta creada. Confirma tu correo electrónico si es necesario y luego inicia sesión.", feature1Title:"QR-X en el navegador", feature1Text:"Crea y gestiona QR-X cómodamente desde el ordenador.", feature2Title:"Compatible con la aplicación", feature2Text:"Inicia sesión en la aplicación con la misma cuenta.", feature3Title:"Créditos listos", feature3Text:"El saldo de créditos y las compras se almacenan de forma centralizada.", alreadyRegistered:"Ya existe una cuenta para este correo electrónico.", weakPassword:"Elige una contraseña más segura.", registrationFailed:"No se pudo completar el registro. Inténtalo de nuevo." },
  it: { navHome:"Home", kicker:"Account Mioseg qr", title:"Crea il tuo account e avvia il tuo primo QR-X.", subtitle:"Il tuo account funziona sul web e nell’app. Tutto rimane sincronizzato tramite Supabase.", formTitle:"Registrati", formSubtitle:"Crea il tuo account mioseg qr.", email:"E-mail", password:"Password", passwordRepeat:"Ripeti password", submit:"Crea account", loading:"Creazione account ...", hasAccount:"Hai già un account?", login:"Accedi", passwordMismatch:"Le password non coincidono.", passwordShort:"La password deve contenere almeno 6 caratteri.", termsPrefix:"Accetto i", terms:"Termini di utilizzo", termsSuffix:` (versione ${CURRENT_TERMS_VERSION}).`, age:"Confermo di avere almeno 16 anni.", privacyPrefix:"Le informazioni sul trattamento dei tuoi dati sono disponibili nella", privacy:"Informativa sulla privacy", termsMissing:"Accetta i Termini di utilizzo prima di creare il tuo account.", ageMissing:"Conferma di avere almeno 16 anni.", success:"Account creato. Conferma il tuo indirizzo e-mail se necessario, quindi accedi.", feature1Title:"QR-X nel browser", feature1Text:"Crea e gestisci comodamente i QR-X dal desktop.", feature2Title:"Compatibile con l’app", feature2Text:"Accedi all’app con lo stesso account.", feature3Title:"Crediti pronti", feature3Text:"Saldo crediti e acquisti vengono salvati centralmente.", alreadyRegistered:"Esiste già un account per questa e-mail.", weakPassword:"Scegli una password più sicura.", registrationFailed:"Registrazione non riuscita. Riprova." },
};

function getRegisterErrorMessage(message: string, locale: string) {
  const lower = message.toLowerCase();
  const copy = REGISTER_COPY[normalizeAccountLanguage(locale)];
  if (lower.includes("already registered") || lower.includes("already exists")) return copy.alreadyRegistered;
  if (lower.includes("password")) return copy.weakPassword;
  return copy.registrationFailed;
}

export default function RegisterClient({ locale }: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const copy = useMemo(
    () => REGISTER_COPY[normalizeAccountLanguage(locale)],
    [locale],
  );

  // Adjust only these two paths if your web legal pages currently use different slugs.
  const termsHref = `/${locale}/nutzungsbedingungen`;
  const privacyHref = `/${locale}/datenschutz`;

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

      if (!termsAccepted) {
        setErrorText(copy.termsMissing);
        return;
      }

      if (!ageConfirmed) {
        setErrorText(copy.ageMissing);
        return;
      }

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/${locale}/dashboard`
          : undefined;

      const acceptedAt = new Date().toISOString();

      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            terms_accepted: true,
            terms_version: CURRENT_TERMS_VERSION,
            terms_effective_date: CURRENT_TERMS_DATE,
            terms_accepted_at_client: acceptedAt,
            terms_language: locale,
            terms_source: "web",
            age_confirmed_16: true,
            age_confirmed_at_client: acceptedAt,
          },
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

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 13,
                lineHeight: 1.5,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                disabled={working}
                style={{ marginTop: 3 }}
              />
              <span>
                {copy.termsPrefix}{" "}
                <Link href={termsHref} target="_blank">
                  {copy.terms}
                </Link>
                {copy.termsSuffix}
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 13,
                lineHeight: 1.5,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(event) => setAgeConfirmed(event.target.checked)}
                disabled={working}
                style={{ marginTop: 3 }}
              />
              <span>{copy.age}</span>
            </label>

            <p style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.78, margin: 0 }}>
              {copy.privacyPrefix}{" "}
              <Link href={privacyHref} target="_blank">
                {copy.privacy}
              </Link>
              .
            </p>

            {message ? <div className={styles.message}>{message}</div> : null}
            {errorText ? <div className={styles.error}>{errorText}</div> : null}

            <button
              className={styles.primaryButton}
              type="submit"
              disabled={working || !termsAccepted || !ageConfirmed}
            >
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
