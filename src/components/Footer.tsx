"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SUPPORTED = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;

const FOOTER_TEXT: Record<string, {
  description: string;
  legal: string;
  imprint: string;
  privacy: string;
  terms: string;
  copyright: string;
}> = {
  de: { description:"QR-X Plattform für gespeicherte Scans, flexible Inhalte, Business QR-X, Standortbezug und professionelle Webansichten.", legal:"Rechtliches", imprint:"Impressum", privacy:"Datenschutz", terms:"Nutzungsbedingungen", copyright:"© 2026 mioseg qr. Alle Rechte vorbehalten." },
  en: { description:"QR-X platform for saved scans, flexible content, Business QR-X, location context and professional web views.", legal:"Legal", imprint:"Legal notice", privacy:"Privacy", terms:"Terms of Use", copyright:"© 2026 mioseg qr. All rights reserved." },
  tr: { description:"Kaydedilen taramalar, esnek içerikler, Business QR-X, konum bağlamı ve profesyonel web görünümleri için QR-X platformu.", legal:"Yasal", imprint:"Yasal bildirim", privacy:"Gizlilik", terms:"Kullanım Koşulları", copyright:"© 2026 mioseg qr. Tüm hakları saklıdır." },
  pl: { description:"Platforma QR-X do zapisanych skanów, elastycznych treści, Business QR-X, lokalizacji i profesjonalnych widoków webowych.", legal:"Informacje prawne", imprint:"Impressum", privacy:"Prywatność", terms:"Warunki użytkowania", copyright:"© 2026 mioseg qr. Wszelkie prawa zastrzeżone." },
  ar: { description:"منصة QR-X لعمليات المسح المحفوظة والمحتوى المرن وBusiness QR-X والسياق الجغرافي وعروض الويب الاحترافية.", legal:"معلومات قانونية", imprint:"البيانات القانونية", privacy:"الخصوصية", terms:"شروط الاستخدام", copyright:"© 2026 mioseg qr. جميع الحقوق محفوظة." },
  fr: { description:"Plateforme QR-X pour les scans enregistrés, les contenus flexibles, Business QR-X, la localisation et les vues web professionnelles.", legal:"Mentions légales", imprint:"Mentions légales", privacy:"Confidentialité", terms:"Conditions d’utilisation", copyright:"© 2026 mioseg qr. Tous droits réservés." },
  es: { description:"Plataforma QR-X para escaneos guardados, contenido flexible, Business QR-X, contexto de ubicación y vistas web profesionales.", legal:"Legal", imprint:"Aviso legal", privacy:"Privacidad", terms:"Condiciones de uso", copyright:"© 2026 mioseg qr. Todos los derechos reservados." },
  it: { description:"Piattaforma QR-X per scansioni salvate, contenuti flessibili, Business QR-X, contesto di posizione e viste web professionali.", legal:"Note legali", imprint:"Note legali", privacy:"Privacy", terms:"Condizioni d’uso", copyright:"© 2026 mioseg qr. Tutti i diritti riservati." },
};

export default function Footer() {
  const pathname = usePathname() || "/";
  const firstSegment = pathname.split("/").filter(Boolean)[0] || "";
  const locale = SUPPORTED.includes(firstSegment as (typeof SUPPORTED)[number]) ? firstSegment : "en";
  const ui = FOOTER_TEXT[locale] ?? FOOTER_TEXT.en;

  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.topRow}>
          <div style={styles.brandBlock}>
            <span style={styles.brandTitle}>mioseg qr</span>
            <p style={styles.brandText}>{ui.description}</p>
          </div>

          <div style={styles.linkBlock}>
            <span style={styles.linkHeading}>{ui.legal}</span>
            <div style={styles.links}>
              <Link href={`/${locale}/impressum`} style={styles.link}>{ui.imprint}</Link>
              <Link href={`/${locale}/datenschutz`} style={styles.link}>{ui.privacy}</Link>
              <Link href={`/${locale}/nutzungsbedingungen`} style={styles.link}>{ui.terms}</Link>
            </div>
          </div>
        </div>

        <div style={styles.bottomRow}>
          <span style={styles.copy}>{ui.copyright}</span>
        </div>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    marginTop: 0,
    background: "#0b1220",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "28px 24px 34px",
  },
  inner: {
    maxWidth: 1180,
    margin: "0 auto",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 28,
    flexWrap: "wrap",
    marginBottom: 22,
  },
  brandBlock: {
    maxWidth: 520,
  },
  brandTitle: {
    display: "inline-block",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 10,
  },
  brandText: {
    margin: 0,
    color: "#b9c8d8",
    fontSize: 14,
    lineHeight: 1.8,
  },
  linkBlock: {
    minWidth: 220,
  },
  linkHeading: {
    display: "inline-block",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 10,
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  link: {
    color: "#cfe0f2",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
  },
  bottomRow: {
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  copy: {
    color: "#8fa4bb",
    fontSize: 13,
  },
};
