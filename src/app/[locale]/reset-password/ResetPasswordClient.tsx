"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../auth/auth.module.css";

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

type ResetCopy = {
  navHome:string; kicker:string; title:string; subtitle:string; formTitle:string; formSubtitle:string; password:string; repeatPassword:string;
  submit:string; loading:string; checking:string; invalidLink:string; mismatch:string; success:string; backToLogin:string;
  feature1Title:string; feature1Text:string; feature2Title:string; feature2Text:string; feature3Title:string; feature3Text:string;
  minLength:string; uppercase:string; lowercase:string; number:string; changeFailed:string;
};

const RESET_COPY: Record<AccountLanguage, ResetCopy> = {
  de:{ navHome:"Startseite", kicker:"Kontowiederherstellung", title:"Neues Passwort festlegen.", subtitle:"Lege ein neues Passwort für dein Mioseg-qr-Konto fest.", formTitle:"Passwort zurücksetzen", formSubtitle:"Der Link aus deiner E-Mail wird geprüft. Danach kannst du ein neues Passwort speichern.", password:"Neues Passwort", repeatPassword:"Neues Passwort wiederholen", submit:"Neues Passwort speichern", loading:"Passwort wird gespeichert …", checking:"Reset-Link wird geprüft …", invalidLink:"Der Reset-Link ist ungültig oder abgelaufen. Fordere auf der Login-Seite bitte einen neuen Link an.", mismatch:"Die Passwörter stimmen nicht überein.", success:"Dein Passwort wurde erfolgreich geändert. Du wirst zur Anmeldung weitergeleitet.", backToLogin:"Zurück zur Anmeldung", feature1Title:"Sicher", feature1Text:"Das neue Passwort wird direkt über Supabase Auth gespeichert.", feature2Title:"Einmaliger Link", feature2Text:"Der Link aus der E-Mail ist zeitlich begrenzt und nur für die Wiederherstellung gedacht.", feature3Title:"Danach anmelden", feature3Text:"Nach der Änderung meldest du dich mit deinem neuen Passwort an.", minLength:"Mindestens 8 Zeichen", uppercase:"Ein Großbuchstabe", lowercase:"Ein Kleinbuchstabe", number:"Eine Zahl", changeFailed:"Das Passwort konnte nicht geändert werden. Fordere bitte einen neuen Reset-Link an." },
  en:{ navHome:"Home", kicker:"Account recovery", title:"Set a new password.", subtitle:"Choose a new password for your Mioseg qr account.", formTitle:"Reset password", formSubtitle:"The link from your email is being checked. You can then save a new password.", password:"New password", repeatPassword:"Repeat new password", submit:"Save new password", loading:"Saving password …", checking:"Checking reset link …", invalidLink:"The reset link is invalid or expired. Please request a new link on the login page.", mismatch:"The passwords do not match.", success:"Your password has been changed successfully. You will be redirected to login.", backToLogin:"Back to login", feature1Title:"Secure", feature1Text:"The new password is stored directly through Supabase Auth.", feature2Title:"One-time link", feature2Text:"The email link is time-limited and intended only for account recovery.", feature3Title:"Sign in afterwards", feature3Text:"After the change, sign in with your new password.", minLength:"At least 8 characters", uppercase:"One uppercase letter", lowercase:"One lowercase letter", number:"One number", changeFailed:"The password could not be changed. Please request a new reset link." },
  tr:{ navHome:"Ana sayfa", kicker:"Hesap kurtarma", title:"Yeni bir şifre belirleyin.", subtitle:"Mioseg qr hesabınız için yeni bir şifre seçin.", formTitle:"Şifreyi sıfırla", formSubtitle:"E-postanızdaki bağlantı kontrol ediliyor. Ardından yeni bir şifre kaydedebilirsiniz.", password:"Yeni şifre", repeatPassword:"Yeni şifreyi tekrar girin", submit:"Yeni şifreyi kaydet", loading:"Şifre kaydediliyor …", checking:"Sıfırlama bağlantısı kontrol ediliyor …", invalidLink:"Sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen giriş sayfasından yeni bir bağlantı isteyin.", mismatch:"Şifreler eşleşmiyor.", success:"Şifreniz başarıyla değiştirildi. Giriş sayfasına yönlendirileceksiniz.", backToLogin:"Girişe dön", feature1Title:"Güvenli", feature1Text:"Yeni şifre doğrudan Supabase Auth üzerinden kaydedilir.", feature2Title:"Tek kullanımlık bağlantı", feature2Text:"E-postadaki bağlantı süreyle sınırlıdır ve yalnızca hesap kurtarma için kullanılır.", feature3Title:"Ardından giriş yap", feature3Text:"Değişiklikten sonra yeni şifrenizle giriş yapın.", minLength:"En az 8 karakter", uppercase:"Bir büyük harf", lowercase:"Bir küçük harf", number:"Bir sayı", changeFailed:"Şifre değiştirilemedi. Lütfen yeni bir sıfırlama bağlantısı isteyin." },
  pl:{ navHome:"Strona główna", kicker:"Odzyskiwanie konta", title:"Ustaw nowe hasło.", subtitle:"Wybierz nowe hasło do swojego konta Mioseg qr.", formTitle:"Zresetuj hasło", formSubtitle:"Link z wiadomości e-mail jest sprawdzany. Następnie możesz zapisać nowe hasło.", password:"Nowe hasło", repeatPassword:"Powtórz nowe hasło", submit:"Zapisz nowe hasło", loading:"Zapisywanie hasła …", checking:"Sprawdzanie linku resetującego …", invalidLink:"Link resetujący jest nieprawidłowy lub wygasł. Poproś o nowy link na stronie logowania.", mismatch:"Hasła nie są zgodne.", success:"Hasło zostało zmienione. Nastąpi przekierowanie do logowania.", backToLogin:"Wróć do logowania", feature1Title:"Bezpiecznie", feature1Text:"Nowe hasło jest zapisywane bezpośrednio przez Supabase Auth.", feature2Title:"Jednorazowy link", feature2Text:"Link z e-maila jest ograniczony czasowo i służy wyłącznie do odzyskiwania konta.", feature3Title:"Następnie się zaloguj", feature3Text:"Po zmianie zaloguj się przy użyciu nowego hasła.", minLength:"Co najmniej 8 znaków", uppercase:"Jedna wielka litera", lowercase:"Jedna mała litera", number:"Jedna cyfra", changeFailed:"Nie udało się zmienić hasła. Poproś o nowy link resetujący." },
  ar:{ navHome:"الرئيسية", kicker:"استعادة الحساب", title:"عيّن كلمة مرور جديدة.", subtitle:"اختر كلمة مرور جديدة لحساب Mioseg qr الخاص بك.", formTitle:"إعادة تعيين كلمة المرور", formSubtitle:"يتم التحقق من الرابط الموجود في بريدك الإلكتروني. بعد ذلك يمكنك حفظ كلمة مرور جديدة.", password:"كلمة المرور الجديدة", repeatPassword:"تأكيد كلمة المرور الجديدة", submit:"حفظ كلمة المرور الجديدة", loading:"جارٍ حفظ كلمة المرور …", checking:"جارٍ التحقق من رابط إعادة التعيين …", invalidLink:"رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد من صفحة تسجيل الدخول.", mismatch:"كلمتا المرور غير متطابقتين.", success:"تم تغيير كلمة المرور بنجاح. سيتم تحويلك إلى تسجيل الدخول.", backToLogin:"العودة إلى تسجيل الدخول", feature1Title:"آمن", feature1Text:"يتم حفظ كلمة المرور الجديدة مباشرة عبر Supabase Auth.", feature2Title:"رابط لمرة واحدة", feature2Text:"رابط البريد الإلكتروني محدود الوقت ومخصص فقط لاستعادة الحساب.", feature3Title:"ثم سجّل الدخول", feature3Text:"بعد التغيير، سجّل الدخول باستخدام كلمة المرور الجديدة.", minLength:"8 أحرف على الأقل", uppercase:"حرف كبير واحد", lowercase:"حرف صغير واحد", number:"رقم واحد", changeFailed:"تعذر تغيير كلمة المرور. يرجى طلب رابط إعادة تعيين جديد." },
  fr:{ navHome:"Accueil", kicker:"Récupération du compte", title:"Définissez un nouveau mot de passe.", subtitle:"Choisissez un nouveau mot de passe pour votre compte Mioseg qr.", formTitle:"Réinitialiser le mot de passe", formSubtitle:"Le lien reçu par e-mail est en cours de vérification. Vous pourrez ensuite enregistrer un nouveau mot de passe.", password:"Nouveau mot de passe", repeatPassword:"Répéter le nouveau mot de passe", submit:"Enregistrer le nouveau mot de passe", loading:"Enregistrement du mot de passe …", checking:"Vérification du lien …", invalidLink:"Le lien de réinitialisation est invalide ou expiré. Demandez un nouveau lien depuis la page de connexion.", mismatch:"Les mots de passe ne correspondent pas.", success:"Votre mot de passe a été modifié. Vous allez être redirigé vers la connexion.", backToLogin:"Retour à la connexion", feature1Title:"Sécurisé", feature1Text:"Le nouveau mot de passe est enregistré directement via Supabase Auth.", feature2Title:"Lien à usage unique", feature2Text:"Le lien reçu par e-mail est limité dans le temps et réservé à la récupération du compte.", feature3Title:"Se connecter ensuite", feature3Text:"Après la modification, connectez-vous avec votre nouveau mot de passe.", minLength:"Au moins 8 caractères", uppercase:"Une lettre majuscule", lowercase:"Une lettre minuscule", number:"Un chiffre", changeFailed:"Le mot de passe n’a pas pu être modifié. Demandez un nouveau lien de réinitialisation." },
  es:{ navHome:"Inicio", kicker:"Recuperación de cuenta", title:"Establece una nueva contraseña.", subtitle:"Elige una nueva contraseña para tu cuenta de Mioseg qr.", formTitle:"Restablecer contraseña", formSubtitle:"Se está comprobando el enlace de tu correo. Después podrás guardar una nueva contraseña.", password:"Nueva contraseña", repeatPassword:"Repetir nueva contraseña", submit:"Guardar nueva contraseña", loading:"Guardando contraseña …", checking:"Comprobando enlace …", invalidLink:"El enlace de restablecimiento no es válido o ha caducado. Solicita un nuevo enlace en la página de inicio de sesión.", mismatch:"Las contraseñas no coinciden.", success:"Tu contraseña se ha cambiado correctamente. Serás redirigido al inicio de sesión.", backToLogin:"Volver al inicio de sesión", feature1Title:"Seguro", feature1Text:"La nueva contraseña se guarda directamente mediante Supabase Auth.", feature2Title:"Enlace de un solo uso", feature2Text:"El enlace del correo tiene una duración limitada y está destinado solo a recuperar la cuenta.", feature3Title:"Inicia sesión después", feature3Text:"Después del cambio, inicia sesión con tu nueva contraseña.", minLength:"Al menos 8 caracteres", uppercase:"Una letra mayúscula", lowercase:"Una letra minúscula", number:"Un número", changeFailed:"No se pudo cambiar la contraseña. Solicita un nuevo enlace de restablecimiento." },
  it:{ navHome:"Home", kicker:"Recupero account", title:"Imposta una nuova password.", subtitle:"Scegli una nuova password per il tuo account Mioseg qr.", formTitle:"Reimposta password", formSubtitle:"Il link ricevuto via e-mail viene verificato. Poi potrai salvare una nuova password.", password:"Nuova password", repeatPassword:"Ripeti nuova password", submit:"Salva nuova password", loading:"Salvataggio password …", checking:"Verifica del link …", invalidLink:"Il link di reimpostazione non è valido o è scaduto. Richiedi un nuovo link dalla pagina di accesso.", mismatch:"Le password non coincidono.", success:"La password è stata modificata correttamente. Verrai reindirizzato all’accesso.", backToLogin:"Torna all’accesso", feature1Title:"Sicuro", feature1Text:"La nuova password viene salvata direttamente tramite Supabase Auth.", feature2Title:"Link monouso", feature2Text:"Il link ricevuto via e-mail ha una durata limitata ed è destinato solo al recupero dell’account.", feature3Title:"Accedi dopo", feature3Text:"Dopo la modifica, accedi con la nuova password.", minLength:"Almeno 8 caratteri", uppercase:"Una lettera maiuscola", lowercase:"Una lettera minuscola", number:"Un numero", changeFailed:"Non è stato possibile modificare la password. Richiedi un nuovo link di reimpostazione." },
};

function validatePassword(value: string, locale: string) {
  const copy = RESET_COPY[normalizeAccountLanguage(locale)];
  if (value.length < 8) return copy.minLength + ".";
  if (!/[A-ZÄÖÜ]/.test(value)) return copy.uppercase + ".";
  if (!/[a-zäöüß]/.test(value)) return copy.lowercase + ".";
  if (!/[0-9]/.test(value)) return copy.number + ".";
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
    () => RESET_COPY[normalizeAccountLanguage(locale)],
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
      setErrorText(copy.changeFailed);
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
                <span>✓ {copy.minLength}</span>
                <span>✓ {copy.uppercase}</span>
                <span>✓ {copy.lowercase}</span>
                <span>✓ {copy.number}</span>
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
