"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { defaultLocale, locales, type Locale } from "../i18n/config";
import styles from "./language-switcher.module.css";

const localeLabels: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
  pl: "Polski",
  ar: "العربية",
  fr: "Français",
  es: "Español",
  it: "Italiano",
};

const localeShortLabels: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  tr: "TR",
  pl: "PL",
  ar: "AR",
  fr: "FR",
  es: "ES",
  it: "IT",
};

const switcherText: Record<Locale, { select: string; menu: string; language: string }> = {
  de: { select: "Sprache auswählen", menu: "Sprachauswahl", language: "Sprache" },
  en: { select: "Select language", menu: "Language selection", language: "Language" },
  tr: { select: "Dil seç", menu: "Dil seçimi", language: "Dil" },
  pl: { select: "Wybierz język", menu: "Wybór języka", language: "Język" },
  ar: { select: "اختر اللغة", menu: "اختيار اللغة", language: "اللغة" },
  fr: { select: "Choisir la langue", menu: "Sélection de la langue", language: "Langue" },
  es: { select: "Seleccionar idioma", menu: "Selección de idioma", language: "Idioma" },
  it: { select: "Seleziona lingua", menu: "Selezione della lingua", language: "Lingua" },
};

function replaceLocaleInPath(pathname: string, nextLocale: Locale): string {
  if (!pathname || pathname === "/") {
    return `/${nextLocale}`;
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${nextLocale}`;
  }

  const first = segments[0];
  const isCurrentLocale = locales.includes(first as Locale);
  const rest = isCurrentLocale ? segments.slice(1) : segments;

  return `/${[nextLocale, ...rest].join("/")}`;
}

type LanguageSwitcherProps = {
  currentLocale: Locale;
  className?: string;
};

export default function LanguageSwitcher({
  currentLocale,
  className = "",
}: LanguageSwitcherProps) {
  const pathname = usePathname() || `/${defaultLocale}`;
  const ui = switcherText[currentLocale];
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className}`.trim()}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ui.select}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.triggerIcon} aria-hidden="true">
          🌐
        </span>

        <span className={styles.triggerText}>
          <span className={styles.triggerShort}>{localeShortLabels[currentLocale]}</span>
          <span className={styles.triggerLabel}>{localeLabels[currentLocale]}</span>
        </span>

        <span
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`.trim()}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {open ? (
        <div className={styles.menu} role="menu" aria-label={ui.menu}>
          <div className={styles.menuHeader}>{ui.language}</div>

          <div className={styles.menuList}>
            {locales.map((locale) => {
              const href = replaceLocaleInPath(pathname, locale);
              const isActive = locale === currentLocale;

              return (
                <Link
                  key={locale}
                  href={href}
                  hrefLang={locale}
                  locale={false}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  className={`${styles.menuItem} ${
                    isActive ? styles.menuItemActive : ""
                  }`.trim()}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.menuItemLeft}>
                    <span className={styles.menuItemShort}>{localeShortLabels[locale]}</span>
                    <span className={styles.menuItemLabel}>{localeLabels[locale]}</span>
                  </span>

                  {isActive ? (
                    <span className={styles.menuItemCheck} aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}