"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./site-header.module.css";

const SUPPORTED = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;
type HeaderLocale = (typeof SUPPORTED)[number];

const HEADER_TEXT: Record<HeaderLocale, { home: string; getApp: string }> = {
  de: { home: "mioseg qr Startseite", getApp: "App herunterladen" },
  en: { home: "mioseg qr home", getApp: "Get App" },
  tr: { home: "mioseg qr ana sayfa", getApp: "Uygulamayı indir" },
  pl: { home: "Strona główna mioseg qr", getApp: "Pobierz aplikację" },
  ar: { home: "الصفحة الرئيسية لـ mioseg qr", getApp: "تنزيل التطبيق" },
  fr: { home: "Accueil mioseg qr", getApp: "Télécharger l’application" },
  es: { home: "Inicio de mioseg qr", getApp: "Descargar la aplicación" },
  it: { home: "Home di mioseg qr", getApp: "Scarica l’app" },
};

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const firstSegment = pathname.split("/").filter(Boolean)[0] || "";
  const langParam = (searchParams.get("lang") || "").trim().toLowerCase();

  const locale: HeaderLocale = SUPPORTED.includes(firstSegment as HeaderLocale)
    ? (firstSegment as HeaderLocale)
    : SUPPORTED.includes(langParam as HeaderLocale)
      ? (langParam as HeaderLocale)
      : "de";

  const ui = HEADER_TEXT[locale];

  return (
    <header className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href={`/${locale}`} className={styles.brand} aria-label={ui.home}>
          <img
            src="/logo-wwhite.png"
            alt="mioseg qr Logo"
            className={styles.logo}
          />
        </Link>

        <Link href={`/${locale}/get-app`} className={styles.cta}>
          {ui.getApp}
        </Link>
      </div>
    </header>
  );
}