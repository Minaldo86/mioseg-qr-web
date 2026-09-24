"use client";

import Link from "next/link";
import React from "react";
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
    <main
      style={styles.page}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-legal-page
    >
      <style jsx global>{`
        @media (max-width: 768px) {
          [data-legal-page] {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            background: linear-gradient(
              180deg,
              #08111d 0,
              #0d1726 430px,
              #f8fafc 430px,
              #f8fafc 100%
            ) !important;
          }

          [data-legal-container],
          [data-legal-content-wrap] {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          [data-legal-hero] {
            padding: 32px 0 30px !important;
          }

          [data-legal-eyebrow] {
            margin-bottom: 12px !important;
            padding: 7px 11px !important;
            font-size: 11px !important;
          }

          [data-legal-title] {
            max-width: 100% !important;
            margin-bottom: 12px !important;
            font-size: clamp(34px, 10vw, 44px) !important;
            line-height: 1.08 !important;
            letter-spacing: -0.8px !important;
            overflow-wrap: anywhere !important;
          }

          [data-legal-subtitle] {
            margin-bottom: 22px !important;
            font-size: 16px !important;
            line-height: 1.55 !important;
          }

          [data-legal-meta-row] {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          [data-legal-meta-card] {
            min-width: 0 !important;
            padding: 13px 14px !important;
            border-radius: 16px !important;
          }

          [data-legal-meta-card]:last-child {
            grid-column: 1 / -1 !important;
          }

          [data-legal-content-section] {
            padding: 22px 0 48px !important;
          }

          [data-legal-content-wrap] {
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
          }

          [data-legal-sidebar] {
            position: static !important;
            width: 100% !important;
            min-width: 0 !important;
          }

          [data-legal-sidebar-card] {
            width: 100% !important;
            max-height: 330px !important;
            overflow-y: auto !important;
            box-sizing: border-box !important;
            padding: 18px !important;
            border-radius: 20px !important;
            -webkit-overflow-scrolling: touch;
          }

          [data-legal-main-column] {
            width: 100% !important;
            min-width: 0 !important;
            gap: 14px !important;
          }

          [data-legal-section-card] {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            padding: 20px 18px !important;
            border-radius: 20px !important;
            scroll-margin-top: 90px !important;
          }

          [data-legal-section-title] {
            max-width: 100% !important;
            margin-bottom: 12px !important;
            font-size: 21px !important;
            line-height: 1.28 !important;
            letter-spacing: -0.2px !important;
            overflow-wrap: anywhere !important;
          }

          [data-legal-paragraph] {
            max-width: 100% !important;
            margin-bottom: 12px !important;
            font-size: 15px !important;
            line-height: 1.72 !important;
            overflow-wrap: anywhere !important;
            word-break: normal !important;
          }
        }

        @media (max-width: 380px) {
          [data-legal-meta-row] {
            grid-template-columns: 1fr !important;
          }

          [data-legal-meta-card]:last-child {
            grid-column: auto !important;
          }
        }
      `}</style>

      <section style={styles.heroSection} data-legal-hero>
        <div style={styles.container} data-legal-container>
          <span style={styles.eyebrow} data-legal-eyebrow>{eyebrow}</span>
          <h1 style={styles.title} data-legal-title>{document.title}</h1>
          <p style={styles.subtitle} data-legal-subtitle>{document.subtitle}</p>

          {document.fallbackNotice ? (
            <p style={styles.fallbackNotice}>{document.fallbackNotice}</p>
          ) : null}

          <div style={styles.metaRow} data-legal-meta-row>
            <div style={styles.metaCard} data-legal-meta-card>
              <span style={styles.metaLabel}>{ui.documentLabel}</span>
              <strong style={styles.metaValue}>{ui.currentVersion}</strong>
            </div>

            <div style={styles.metaCard} data-legal-meta-card>
              <span style={styles.metaLabel}>{ui.validityLabel}</span>
              <strong style={styles.metaValue}>{ui.validityValue}</strong>
            </div>

            <div style={styles.metaCard} data-legal-meta-card>
              <span style={styles.metaLabel}>{ui.languageLabel}</span>
              <strong style={styles.metaValue}>{ui.languageName}</strong>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.contentSection} data-legal-content-section>
        <div style={styles.contentWrap} data-legal-content-wrap>
          <aside style={styles.sidebar} data-legal-sidebar>
            <div style={styles.sidebarCard} data-legal-sidebar-card>
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

          <div style={styles.mainColumn} data-legal-main-column>
            {document.sections.map((section, sectionIndex) => (
              <section
                key={`${sectionId(sectionIndex)}-${section.title}`}
                id={sectionId(sectionIndex)}
                style={styles.sectionCard}
                data-legal-section-card
              >
                <h2 style={styles.sectionTitle} data-legal-section-title>
                  {section.title}
                </h2>

                {section.content.map((paragraph, index) => (
                  <p
                    key={`${sectionId(sectionIndex)}-p-${index}`}
                    style={styles.paragraph}
                    data-legal-paragraph
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
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
    colorScheme: "only light",
    background:
      "linear-gradient(180deg, #08111d 0%, #0d1726 24%, #f8fafc 24%, #f8fafc 100%)",
  },
  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px",
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
