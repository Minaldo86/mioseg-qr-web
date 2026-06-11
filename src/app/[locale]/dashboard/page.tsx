import Link from "next/link";
import styles from "./dashboard.module.css";

import { defaultLocale, isValidLocale } from "../../../i18n/config";
import { getDictionary } from "../../../i18n/get-dictionary";
import DashboardClient from "./DashboardClient";
import DashboardMapClient from "./DashboardMapClient";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = isValidLocale(resolvedParams.locale)
    ? resolvedParams.locale
    : defaultLocale;

  const t = getDictionary(locale);

  const copy =
    locale === "de"
      ? {
          title: "Willkommen bei deinem Mioseg qr",
          subtitle:
            "Verwalte deine QR-X, gespeicherten Inhalte, Credits und später auch deine Rechnungen bequem im Browser.",
          credits: "Credits",
          createdQrx: "Erstellte QR-X",
          savedQrx: "Gespeicherte QR-X",
          savedQr: "Gespeicherte QR-Codes",
          mapTitle: "Deine QR-X Karte",
          mapHint:
            "Hier siehst du deine eigenen QR-X, gespeicherte QR-X und normale Scans mit Standort.",
          qrxButton: "Meine QR-X",
          scansButton: "Meine Scans",
          creditsButton: "Credits",
          supportButton: "Support",
          accountButton: "Konto",
          createButton: "QR-X erstellen",
          buyCreditsButton: "Credits kaufen",
          mapLabel: "Live",
          navHome: "Startseite",
          navExplore: "Explore",
        }
      : {
          title: "Welcome to your Mioseg qr",
          subtitle:
            "Manage your QR-X, saved content, credits and later your invoices conveniently in the browser.",
          credits: "Credits",
          createdQrx: "Created QR-X",
          savedQrx: "Saved QR-X",
          savedQr: "Saved QR codes",
          mapTitle: "Your QR-X map",
          mapHint:
            "Here you can see your own QR-X, saved QR-X and normal scans with location.",
          qrxButton: "My QR-X",
          scansButton: "My scans",
          creditsButton: "Credits",
          supportButton: "Support",
          accountButton: "Konto",
          createButton: "Create QR-X",
          buyCreditsButton: "Buy credits",
          mapLabel: "Live",
          navHome: "Home",
          navExplore: "Explore",
        };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}`} className={styles.brand}>
          <img src="/logo-white.png" alt={`${t.common.appName} Logo`} />
        </Link>

        <nav className={styles.nav} aria-label="Dashboard Navigation">
          <Link href={`/${locale}`}>{copy.navHome}</Link>
          <Link href={`/${locale}/explore`}>{copy.navExplore}</Link>
          <Link href={`/${locale}/dashboard/account`}>{copy.accountButton}</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Dashboard</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx/new`} className={styles.primaryButton}>
            + {copy.createButton}
          </Link>
          <Link href={`/${locale}/dashboard/credits`} className={styles.secondaryButton}>
            {copy.buyCreditsButton}
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="Dashboard Kennzahlen">
        <DashboardClient
          creditsLabel={copy.credits}
          createdQrxLabel={copy.createdQrx}
          savedQrxLabel={copy.savedQrx}
          savedQrLabel={copy.savedQr}
        />
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.mapCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{copy.mapTitle}</h2>
              <p>{copy.mapHint}</p>
            </div>
            <span>{copy.mapLabel}</span>
          </div>

          <DashboardMapClient locale={locale} />
        </article>

        <aside className={styles.sidePanel}>
          <Link href={`/${locale}/dashboard/qrx`} className={styles.sideLink}>
            <span>▣</span>
            <div>
              <strong>{copy.qrxButton}</strong>
              <p>QR-X erstellen, bearbeiten und verwalten.</p>
            </div>
          </Link>

          <Link href={`/${locale}/dashboard/scans`} className={styles.sideLink}>
            <span>⌗</span>
            <div>
              <strong>{copy.scansButton}</strong>
              <p>Gespeicherte QR-Codes und QR-X anzeigen.</p>
            </div>
          </Link>

          <Link href={`/${locale}/dashboard/credits`} className={styles.sideLink}>
            <span>💳</span>
            <div>
              <strong>{copy.creditsButton}</strong>
              <p>Credit-Stand anzeigen und später Credits kaufen.</p>
            </div>
          </Link>



          <Link href={`/${locale}/dashboard/account`} className={styles.sideLink}>
            <span>👤</span>
            <div>
              <strong>{copy.accountButton}</strong>
              <p>Konto- und Rechnungsdaten verwalten.</p>
            </div>
          </Link>

          <Link href={`/${locale}/dashboard/support`} className={styles.sideLink}>
            <span>🛟</span>
            <div>
              <strong>{copy.supportButton}</strong>
              <p>Kontakt, Hilfe und Support-Anfragen.</p>
            </div>
          </Link>
        </aside>
      </section>
    </main>
  );
}
