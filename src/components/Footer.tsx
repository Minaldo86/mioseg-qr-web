"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SUPPORTED = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;
type FooterLocale = (typeof SUPPORTED)[number];

function normalizeLocale(value: string | null | undefined): FooterLocale | null {
  const normalized = value?.trim().toLowerCase().split("-")[0] ?? "";
  return SUPPORTED.includes(normalized as FooterLocale)
    ? (normalized as FooterLocale)
    : null;
}

const FOOTER_TEXT: Record<string, {
  description: string;
  legal: string;
  imprint: string;
  privacy: string;
  terms: string;
  copyright: string;
}> = {
  de: { description:"Mioseg qr verbindet dynamische QR-Codes mit flexiblen Inhalten, gespeicherten Scans, Standortbezug und professionellen Webansichten.", legal:"Rechtliches", imprint:"Impressum", privacy:"Datenschutz", terms:"Nutzungsbedingungen", copyright:"© 2026 mioseg qr. Alle Rechte vorbehalten." },
  en: { description:"Mioseg qr connects dynamic QR codes with flexible content, saved scans, location context and professional web views.", legal:"Legal", imprint:"Legal notice", privacy:"Privacy", terms:"Terms of Use", copyright:"© 2026 mioseg qr. All rights reserved." },
  tr: { description:"Mioseg qr; dinamik QR kodlarını esnek içerikler, kaydedilen taramalar, konum bilgileri ve profesyonel web görünümleriyle birleştirir.", legal:"Yasal", imprint:"Yasal bildirim", privacy:"Gizlilik", terms:"Kullanım Koşulları", copyright:"© 2026 mioseg qr. Tüm hakları saklıdır." },
  pl: { description:"Mioseg qr łączy dynamiczne kody QR z elastycznymi treściami, zapisanymi skanami, lokalizacją i profesjonalnymi widokami internetowymi.", legal:"Informacje prawne", imprint:"Impressum", privacy:"Prywatność", terms:"Warunki użytkowania", copyright:"© 2026 mioseg qr. Wszelkie prawa zastrzeżone." },
  ar: { description:"يربط Mioseg qr رموز QR الديناميكية بالمحتوى المرن وعمليات المسح المحفوظة والموقع وصفحات الويب الاحترافية.", legal:"معلومات قانونية", imprint:"البيانات القانونية", privacy:"الخصوصية", terms:"شروط الاستخدام", copyright:"© 2026 mioseg qr. جميع الحقوق محفوظة." },
  fr: { description:"Mioseg qr associe des codes QR dynamiques à des contenus flexibles, des scans enregistrés, la localisation et des pages web professionnelles.", legal:"Mentions légales", imprint:"Mentions légales", privacy:"Confidentialité", terms:"Conditions d’utilisation", copyright:"© 2026 mioseg qr. Tous droits réservés." },
  es: { description:"Mioseg qr conecta códigos QR dinámicos con contenido flexible, escaneos guardados, ubicación y páginas web profesionales.", legal:"Legal", imprint:"Aviso legal", privacy:"Privacidad", terms:"Condiciones de uso", copyright:"© 2026 mioseg qr. Todos los derechos reservados." },
  it: { description:"Mioseg qr collega codici QR dinamici a contenuti flessibili, scansioni salvate, posizione e pagine web professionali.", legal:"Note legali", imprint:"Note legali", privacy:"Privacy", terms:"Condizioni d’uso", copyright:"© 2026 mioseg qr. Tutti i diritti riservati." },
};

export default function Footer() {
  const pathname = usePathname() || "/";
  const firstSegment = pathname.split("/").filter(Boolean)[0] || "";
  const pathLocale = normalizeLocale(firstSegment);
  const [queryLocale, setQueryLocale] = useState<FooterLocale | null>(null);
  const currentSearch = typeof window === "undefined" ? "" : window.location.search;

  useEffect(() => {
    if (pathLocale) {
      setQueryLocale(null);
      return;
    }

    const params = new URLSearchParams(currentSearch);
    setQueryLocale(normalizeLocale(params.get("lang")));
  }, [currentSearch, pathLocale]);

  const locale = pathLocale ?? queryLocale ?? "de";
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
