"use client";

import Link from "next/link";
import styles from "./site-header.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="mioseg qr Startseite">
          <img
            src="/logo-white.png"
            alt="mioseg qr Logo"
            className={styles.logo}
          />
        </Link>

        <Link href="/get-app" className={styles.cta}>
          Get App
        </Link>
      </div>
    </header>
  );
}