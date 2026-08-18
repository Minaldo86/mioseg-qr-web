"use client";

import { useState } from "react";
import styles from "./page.module.css";

type QrxPasswordLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

const PASSWORD_TEXT = {
  de:{required:"Bitte gib das Passwort ein.",checkFailed:"Passwort konnte nicht geprüft werden.",wrong:"Falsches Passwort. Bitte prüfe deine Eingabe.",title:"QR-X geschützt",text:"Dieser QR-X ist passwortgeschützt. Bitte gib das Passwort ein, um den Inhalt zu öffnen.",placeholder:"Passwort",checking:"Prüfe…",open:"QR-X öffnen"},
  en:{required:"Please enter the password.",checkFailed:"The password could not be verified.",wrong:"Incorrect password. Please check your entry.",title:"QR-X protected",text:"This QR-X is password-protected. Enter the password to open the content.",placeholder:"Password",checking:"Checking…",open:"Open QR-X"},
  tr:{required:"Lütfen parolayı girin.",checkFailed:"Parola doğrulanamadı.",wrong:"Parola yanlış. Lütfen girişinizi kontrol edin.",title:"QR-X korumalı",text:"Bu QR-X parola korumalıdır. İçeriği açmak için parolayı girin.",placeholder:"Parola",checking:"Kontrol ediliyor…",open:"QR-X'i aç"},
  pl:{required:"Wpisz hasło.",checkFailed:"Nie udało się sprawdzić hasła.",wrong:"Nieprawidłowe hasło. Sprawdź wpisane dane.",title:"QR-X chroniony",text:"Ten QR-X jest chroniony hasłem. Wpisz hasło, aby otworzyć zawartość.",placeholder:"Hasło",checking:"Sprawdzanie…",open:"Otwórz QR-X"},
  ar:{required:"يرجى إدخال كلمة المرور.",checkFailed:"تعذر التحقق من كلمة المرور.",wrong:"كلمة المرور غير صحيحة. يرجى التحقق من الإدخال.",title:"QR-X محمي",text:"هذا QR-X محمي بكلمة مرور. أدخل كلمة المرور لفتح المحتوى.",placeholder:"كلمة المرور",checking:"جارٍ التحقق…",open:"فتح QR-X"},
  fr:{required:"Veuillez saisir le mot de passe.",checkFailed:"Le mot de passe n’a pas pu être vérifié.",wrong:"Mot de passe incorrect. Vérifiez votre saisie.",title:"QR-X protégé",text:"Ce QR-X est protégé par mot de passe. Saisissez-le pour ouvrir le contenu.",placeholder:"Mot de passe",checking:"Vérification…",open:"Ouvrir le QR-X"},
  es:{required:"Introduce la contraseña.",checkFailed:"No se pudo comprobar la contraseña.",wrong:"Contraseña incorrecta. Comprueba lo que has introducido.",title:"QR-X protegido",text:"Este QR-X está protegido con contraseña. Introduce la contraseña para abrir el contenido.",placeholder:"Contraseña",checking:"Comprobando…",open:"Abrir QR-X"},
  it:{required:"Inserisci la password.",checkFailed:"Impossibile verificare la password.",wrong:"Password errata. Controlla i dati inseriti.",title:"QR-X protetto",text:"Questo QR-X è protetto da password. Inseriscila per aprire il contenuto.",placeholder:"Password",checking:"Verifica…",open:"Apri QR-X"},
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
