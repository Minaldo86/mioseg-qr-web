"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function QrxPasswordGate({
  qrxId,
  enabled,
  children,
}: {
  qrxId: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(!enabled);
  const [checking, setChecking] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const verifyPassword = async () => {
    const trimmed = password.trim();

    if (!trimmed) {
      setErrorText("Bitte gib das Passwort ein.");
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
        throw new Error(data?.error || "Passwort konnte nicht geprüft werden.");
      }

      if (data?.accessGranted === true) {
        setUnlocked(true);
        setPassword("");
        return;
      }

      setErrorText("Falsches Passwort. Bitte prüfe deine Eingabe.");
    } catch (error: unknown) {

      setErrorText(
        error instanceof Error
          ? error.message
          : "Passwort konnte nicht geprüft werden."
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
      <h1 className={styles.title}>QR-X geschützt</h1>
      <p className={styles.sub}>
        Dieser QR-X ist passwortgeschützt. Bitte gib das Passwort ein, um den Inhalt zu öffnen.
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
          placeholder="Passwort"
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
          {checking ? "Prüfe…" : "QR-X öffnen"}
        </button>
      </div>
    </div>
  );
}
