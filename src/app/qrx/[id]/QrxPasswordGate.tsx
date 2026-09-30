"use client";

import { useState } from "react";
import styles from "./page.module.css";

type QrxPasswordLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

const PASSWORD_TEXT = {
  de:{required:"Bitte gib das Passwort ein.",checkFailed:"Passwort konnte nicht geprüft werden.",wrong:"Falsches Passwort. Bitte prüfe deine Eingabe.",title:"Mioseg QR geschützt",text:"Dieser Mioseg QR ist passwortgeschützt. Bitte gib das Passwort ein, um den Inhalt zu öffnen.",placeholder:"Passwort",checking:"Prüfe…",open:"Mioseg QR öffnen"},
  en:{required:"Please enter the password.",checkFailed:"The password could not be verified.",wrong:"Incorrect password. Please check your entry.",title:"Mioseg QR protected",text:"This Mioseg QR is password-protected. Enter the password to open the content.",placeholder:"Password",checking:"Checking…",open:"Open Mioseg QR"},
  tr:{required:"Lütfen parolayı girin.",checkFailed:"Parola doğrulanamadı.",wrong:"Parola yanlış. Lütfen girişinizi kontrol edin.",title:"Mioseg QR korumalı",text:"Bu Mioseg QR parola korumalıdır. İçeriği açmak için parolayı girin.",placeholder:"Parola",checking:"Kontrol ediliyor…",open:"Mioseg QR'i aç"},
  pl:{required:"Wpisz hasło.",checkFailed:"Nie udało się sprawdzić hasła.",wrong:"Nieprawidłowe hasło. Sprawdź wpisane dane.",title:"Mioseg QR chroniony",text:"Ten Mioseg QR jest chroniony hasłem. Wpisz hasło, aby otworzyć zawartość.",placeholder:"Hasło",checking:"Sprawdzanie…",open:"Otwórz Mioseg QR"},
  ar:{required:"يرجى إدخال كلمة المرور.",checkFailed:"تعذر التحقق من كلمة المرور.",wrong:"كلمة المرور غير صحيحة. يرجى التحقق من الإدخال.",title:"Mioseg QR محمي",text:"هذا Mioseg QR محمي بكلمة مرور. أدخل كلمة المرور لفتح المحتوى.",placeholder:"كلمة المرور",checking:"جارٍ التحقق…",open:"فتح Mioseg QR"},
  fr:{required:"Veuillez saisir le mot de passe.",checkFailed:"Le mot de passe n’a pas pu être vérifié.",wrong:"Mot de passe incorrect. Vérifiez votre saisie.",title:"Mioseg QR protégé",text:"Ce Mioseg QR est protégé par mot de passe. Saisissez-le pour ouvrir le contenu.",placeholder:"Mot de passe",checking:"Vérification…",open:"Ouvrir le Mioseg QR"},
  es:{required:"Introduce la contraseña.",checkFailed:"No se pudo comprobar la contraseña.",wrong:"Contraseña incorrecta. Comprueba lo que has introducido.",title:"Mioseg QR protegido",text:"Este Mioseg QR está protegido con contraseña. Introduce la contraseña para abrir el contenido.",placeholder:"Contraseña",checking:"Comprobando…",open:"Abrir Mioseg QR"},
  it:{required:"Inserisci la password.",checkFailed:"Impossibile verificare la password.",wrong:"Password errata. Controlla i dati inseriti.",title:"Mioseg QR protetto",text:"Questo Mioseg QR è protetto da password. Inseriscila per aprire il contenuto.",placeholder:"Password",checking:"Verifica…",open:"Apri Mioseg QR"},
} as const;


export default function QrxPasswordGate({
  qrxId,
  enabled,
  children,
  locale = "de",
}: {
  qrxId: string;
  enabled: boolean;
  children: React.ReactNode;
  locale?: QrxPasswordLocale;
}) {
  const ui = PASSWORD_TEXT[locale];
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(!enabled);
  const [checking, setChecking] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const verifyPassword = async () => {
    const trimmed = password.trim();

    if (!trimmed) {
      setErrorText(ui.required);
      return;
    }

    try {
      setChecking(true);
      setErrorText(null);

      const res = await fetch("/api/qrx/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId,
          password: trimmed,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || ui.checkFailed);
      }

      if (data?.accessGranted === true) {
        setUnlocked(true);
        setPassword("");
        return;
      }

      setErrorText(ui.wrong);
    } catch (error: unknown) {

      setErrorText(
        error instanceof Error
          ? error.message
          : ui.checkFailed
      );
    } finally {
      setChecking(false);
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>{ui.title}</h1>
      <p className={styles.sub}>
        {ui.text}
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              verifyPassword();
            }
          }}
          placeholder={ui.placeholder}
          autoComplete="current-password"
          style={{
            width: "100%",
            minHeight: 48,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            padding: "0 14px",
            fontSize: 16,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {errorText ? (
          <p className={styles.sub} style={{ color: "#fecaca", margin: 0 }}>
            {errorText}
          </p>
        ) : null}

        <button
          type="button"
          onClick={verifyPassword}
          disabled={checking}
          style={{
            minHeight: 48,
            borderRadius: 14,
            border: "none",
            background: "#e2e8f0",
            color: "#0f172a",
            fontWeight: 800,
            cursor: checking ? "default" : "pointer",
            opacity: checking ? 0.65 : 1,
          }}
        >
          {checking ? ui.checking : ui.open}
        </button>
      </div>
    </div>
  );
}
