import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./dashboard.module.css";
import TermsReconsentGate from "./TermsReconsentGate";

const DASHBOARD_NAV = {
  de: { overview: "Übersicht", qrx: "Meine Mioseg QR", scans: "Meine Scans", credits: "Credits", aria: "Dashboard Navigation" },
  en: { overview: "Overview", qrx: "My Mioseg QR", scans: "My scans", credits: "Credits", aria: "Dashboard navigation" },
  tr: { overview: "Genel bakış", qrx: "Mioseg QR'lerim", scans: "Taramalarım", credits: "Krediler", aria: "Kontrol paneli navigasyonu" },
  pl: { overview: "Przegląd", qrx: "Moje Mioseg QR", scans: "Moje skany", credits: "Kredyty", aria: "Nawigacja panelu" },
  ar: { overview: "نظرة عامة", qrx: "Mioseg QR الخاص بي", scans: "عمليات المسح", credits: "الرصيد", aria: "تنقل لوحة التحكم" },
  fr: { overview: "Aperçu", qrx: "Mes Mioseg QR", scans: "Mes scans", credits: "Crédits", aria: "Navigation du tableau de bord" },
  es: { overview: "Resumen", qrx: "Mis Mioseg QR", scans: "Mis escaneos", credits: "Créditos", aria: "Navegación del panel" },
  it: { overview: "Panoramica", qrx: "I miei Mioseg QR", scans: "Le mie scansioni", credits: "Crediti", aria: "Navigazione dashboard" },
} as const;

type DashboardLocale = keyof typeof DASHBOARD_NAV;

function resolveLocale(value: string): DashboardLocale {
  return value in DASHBOARD_NAV ? (value as DashboardLocale) : "de";
}

type Props = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const locale = resolveLocale(resolvedParams.locale || "de");
  const ui = DASHBOARD_NAV[locale];

  return (
    <TermsReconsentGate locale={locale}>
      <div className={styles.dashboardLayoutShell}>
        <nav className={styles.dashboardSectionNav} aria-label={ui.aria}>
          <Link href={`/${locale}/dashboard`}>{ui.overview}</Link>
          <Link href={`/${locale}/dashboard/qrx`}>{ui.qrx}</Link>
          <Link href={`/${locale}/dashboard/scans`}>{ui.scans}</Link>
          <Link href={`/${locale}/dashboard/credits`}>{ui.credits}</Link>
        </nav>
        {children}
      </div>
    </TermsReconsentGate>
  );
}
