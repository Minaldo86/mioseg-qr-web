"use client";

import Link from "next/link";
import React from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import type { LegalDocument, LegalLocale } from "../legal/types";

type LegalPageProps = {
  locale: LegalLocale;
  eyebrow: string;
  document: LegalDocument;
};

type LegalUi = {
  documentLabel: string;
  currentVersion: string;
  validityLabel: string;
  validityValue: string;
  languageLabel: string;
  languageName: string;
  contents: string;
  home: string;
  getApp: string;
  privacy: string;
  terms: string;
  imprint: string;
};

const LEGAL_UI: Record<LegalLocale, LegalUi> = {
  de: {
    documentLabel: "Dokument",
    currentVersion: "Aktuelle Fassung",
    validityLabel: "Gültigkeit",
    validityValue: "App + Webplattform",
    languageLabel: "Sprache",
    languageName: "Deutsch",
    contents: "Inhalt",
    home: "Startseite",
    getApp: "Get App",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    imprint: "Impressum",
  },
  en: {
    documentLabel: "Document",
    currentVersion: "Current version",
    validityLabel: "Applies to",
    validityValue: "App + web platform",
    languageLabel: "Language",
    languageName: "English",
    contents: "Contents",
    home: "Home",
    getApp: "Get App",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    imprint: "Legal Notice",
  },
  tr: {
    documentLabel: "Belge",
    currentVersion: "Güncel sürüm",
    validityLabel: "Geçerlilik",
    validityValue: "Uygulama + web platformu",
    languageLabel: "Dil",
    languageName: "Türkçe",
    contents: "İçindekiler",
    home: "Ana sayfa",
    getApp: "Uygulamayı edin",
    privacy: "Gizlilik Politikası",
    terms: "Kullanım Koşulları",
    imprint: "Yasal Bildirim",
  },
  pl: {
    documentLabel: "Dokument",
    currentVersion: "Aktualna wersja",
    validityLabel: "Zakres",
    validityValue: "Aplikacja + platforma internetowa",
    languageLabel: "Język",
    languageName: "Polski",
    contents: "Spis treści",
    home: "Strona główna",
    getApp: "Pobierz aplikację",
    privacy: "Polityka prywatności",
    terms: "Warunki użytkowania",
    imprint: "Impressum",
  },
  ar: {
    documentLabel: "المستند",
    currentVersion: "النسخة الحالية",
    validityLabel: "النطاق",
    validityValue: "التطبيق + منصة الويب",
    languageLabel: "اللغة",
    languageName: "العربية",
    contents: "المحتويات",
    home: "الرئيسية",
    getApp: "احصل على التطبيق",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
    imprint: "البيانات القانونية",
  },
  fr: {
    documentLabel: "Document",
    currentVersion: "Version actuelle",
    validityLabel: "Champ d’application",
    validityValue: "App + plateforme web",
    languageLabel: "Langue",
    languageName: "Français",
    contents: "Sommaire",
    home: "Accueil",
    getApp: "Télécharger l’app",
    privacy: "Politique de confidentialité",
    terms: "Conditions d’utilisation",
    imprint: "Mentions légales",
  },
  es: {
    documentLabel: "Documento",
    currentVersion: "Versión actual",
    validityLabel: "Ámbito",
    validityValue: "App + plataforma web",
    languageLabel: "Idioma",
    languageName: "Español",
    contents: "Contenido",
    home: "Inicio",
    getApp: "Descargar app",
    privacy: "Política de privacidad",
    terms: "Términos de uso",
    imprint: "Aviso legal",
  },
  it: {
    documentLabel: "Documento",
    currentVersion: "Versione attuale",
    validityLabel: "Ambito",
    validityValue: "App + piattaforma web",
    languageLabel: "Lingua",
    languageName: "Italiano",
    contents: "Indice",
    home: "Home",
    getApp: "Scarica l’app",
    privacy: "Privacy",
    terms: "Condizioni d’uso",
    imprint: "Note legali",
  },
};

function sectionId(index: number) {
  return `section-${index + 1}`;
}

export default function LegalPage({
  locale,
  eyebrow,
  document,
}: LegalPageProps) {
  const ui = LEGAL_UI[locale];

  return (
    <main style={styles.page} dir={locale === "ar" ? "rtl" : "ltr"}>
      <section style={styles.heroSection}>
        <div style={styles.container}>
          <div style={styles.languageRow}>
            <LanguageSwitcher currentLocale={locale} />
          </div>

          <span style={styles.eyebrow}>{eyebrow}</span>
          <h1 style={styles.title}>{document.title}</h1>
          <p style={styles.subtitle}>{document.subtitle}</p>

          {document.fallbackNotice ? (
            <p style={styles.fallbackNotice}>{document.fallbackNotice}</p>
          ) : null}

          <div style={styles.metaRow}>
            <div style={styles.metaCard}>
              <span style={styles.metaLabel}>{ui.documentLabel}</span>
              <strong style={styles.metaValue}>{ui.currentVersion}</strong>
            </div>

            <div style={styles.metaCard}>
              <span style={styles.metaLabel}>{ui.validityLabel}</span>
              <strong style={styles.metaValue}>{ui.validityValue}</strong>
            </div>

            <div style={styles.metaCard}>
              <span style={styles.metaLabel}>{ui.languageLabel}</span>
              <strong style={styles.metaValue}>{ui.languageName}</strong>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.contentSection}>
        <div style={styles.contentWrap}>
          <aside style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <p style={styles.sidebarTitle}>{ui.contents}</p>

              <nav style={styles.nav}>
                {document.sections.map((section, index) => (
                  <a
                    key={`${sectionId(index)}-${section.title}`}
                    href={`#${sectionId(index)}`}
                    style={styles.navLink}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>

              <div style={styles.sidebarDivider} />

              <div style={styles.quickLinks}>
                <Link href={`/${locale}`} style={styles.quickLink}>
                  {ui.home}
                </Link>
                <Link href={`/${locale}/get-app`} style={styles.quickLink}>
                  {ui.getApp}
                </Link>
                <Link href={`/${locale}/datenschutz`} style={styles.quickLink}>
                  {ui.privacy}
                </Link>
                <Link href={`/${locale}/nutzungsbedingungen`} style={styles.quickLink}>
                  {ui.terms}
                </Link>
                <Link href={`/${locale}/impressum`} style={styles.quickLink}>
                  {ui.imprint}
                </Link>
              </div>
            </div>
          </aside>

          <div style={styles.mainColumn}>
            {document.sections.map((section, sectionIndex) => (
              <section
                key={`${sectionId(sectionIndex)}-${section.title}`}
                id={sectionId(sectionIndex)}
                style={styles.sectionCard}
              >
                <h2 style={styles.sectionTitle}>{section.title}</h2>

                {section.content.map((paragraph, index) => (
                  <p
                    key={`${sectionId(sectionIndex)}-p-${index}`}
                    style={styles.paragraph}
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #08111d 0%, #0d1726 24%, #f8fafc 24%, #f8fafc 100%)",
  },
  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px",
  },
  languageRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 18,
  },
  heroSection: {
    padding: "72px 0 44px",
    color: "#ffffff",
  },
  eyebrow: {
    display: "inline-block",
    marginBottom: 14,
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#d9e8ff",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: 52,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: -1.2,
  },
  subtitle: {
    margin: "0 0 24px 0",
    maxWidth: 820,
    fontSize: 18,
    lineHeight: 1.8,
    color: "#bfd0e3",
  },
  fallbackNotice: {
    margin: "0 0 20px 0",
    maxWidth: 820,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#d9e8ff",
    fontSize: 14,
    lineHeight: 1.7,
  },
  metaRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },
  metaCard: {
    minWidth: 160,
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: "#aac0d8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: 700,
  },
  metaValue: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: 800,
  },
  contentSection: {
    padding: "0 0 72px",
  },
  contentWrap: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px",
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    gap: 24,
    alignItems: "start",
  },
  sidebar: {
    position: "sticky",
    top: 24,
    alignSelf: "start",
  },
  sidebarCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
  },
  sidebarTitle: {
    margin: "0 0 14px 0",
    fontSize: 15,
    fontWeight: 900,
    color: "#0f172a",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  navLink: {
    color: "#183a67",
    textDecoration: "none",
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 700,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "#e8eef5",
    margin: "18px 0",
  },
  quickLinks: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  quickLink: {
    color: "#5b6778",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
  },
  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: 28,
    padding: 28,
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.05)",
    scrollMarginTop: 24,
  },
  sectionTitle: {
    margin: "0 0 14px 0",
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: -0.4,
  },
  paragraph: {
    margin: "0 0 14px 0",
    fontSize: 15,
    lineHeight: 1.85,
    color: "#445064",
    whiteSpace: "pre-wrap",
  },
};
