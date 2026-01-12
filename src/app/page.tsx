import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Logo / Branding */}
        <div className={styles.logoWrapper}>
          <Image
            src="/logo.png" // falls du noch kein Logo hast: Datei einfach später ersetzen
            alt="mioseg qr"
            width={120}
            height={120}
            priority
          />
        </div>

        {/* Headline */}
        <h1 className={styles.title}>mioseg qr</h1>
        <p className={styles.subtitle}>
          QR-X Inhalte ansehen, teilen und speichern
        </p>

        {/* Info */}
        <div className={styles.intro}>
          <p>
            Dieser QR-X wurde mit <strong>mioseg qr</strong> erstellt.
          </p>
          <p>
            Mit der App kannst du QR-X speichern, Updates erhalten und Inhalte
            verwalten.
          </p>
        </div>

        {/* Call to Action */}
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://mioseg-qr.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            App herunterladen
          </a>

          <a
            className={styles.secondary}
            href="/qrx/demo"
          >
            Beispiel-QR-X ansehen
          </a>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} mioseg qr</p>
        </footer>
      </main>
    </div>
  );
}
