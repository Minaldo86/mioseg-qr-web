"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./site-header.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.wrapper}>
      <div className={styles.inner}>
        {/* LOGO */}
        <Link href="/" className={styles.brand}>
          <div className={styles.logoBox}>
            <Image
              src="/mioseg_qr_white_transparent.png"
              alt="mioseg qr"
              width={40}
              height={40}
              priority
            />
          </div>

          <div className={styles.textWrap}>
            <span className={styles.title}>mioseg qr</span>
            <span className={styles.subtitle}>QR-X Plattform</span>
          </div>
        </Link>

        {/* NUR CTA */}
        <Link href="/get-app" className={styles.cta}>
          Get App
        </Link>
      </div>
    </header>
  );
}