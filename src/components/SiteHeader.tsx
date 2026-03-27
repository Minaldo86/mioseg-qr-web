"use client";

import Link from "next/link";
import styles from "./site-header.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <div className={styles.logoBox}>
            <img
              src="/logo-white.png"
              alt="mioseg qr"
              className={styles.logo}
            />
          </div>

          <div className={styles.textWrap}>
            <span className={styles.title}>mioseg qr</span>
            <span className={styles.subtitle}>QR-X Plattform</span>
          </div>
        </Link>

        <Link href="/get-app" className={styles.cta}>
          Get App
        </Link>
      </div>
    </header>
  );
}