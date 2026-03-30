"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, locales, type Locale } from "../i18n/config";

import styles from "./language-switcher.module.css";

const localeLabels: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  tr: "TR",
  pl: "PL",
  ar: "AR",
  fr: "FR",
  es: "ES",
  it: "IT",
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

  const nextPath = `/${[nextLocale, ...rest].join("/")}`;
  return nextPath === "" ? `/${nextLocale}` : nextPath;
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

  return (
    <div className={`${styles.switcher} ${className}`.trim()}>
      {locales.map((locale) => {
        const href = replaceLocaleInPath(pathname, locale);
        const isActive = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={href}
            hrefLang={locale}
            locale={false}
            className={`${styles.link} ${isActive ? styles.linkActive : ""}`.trim()}
            aria-current={isActive ? "page" : undefined}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </div>
  );
}