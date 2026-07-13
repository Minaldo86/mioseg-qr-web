import Link from "next/link";
import styles from "./dashboard.module.css";

import { defaultLocale, isValidLocale } from "../../../i18n/config";
import { getDictionary } from "../../../i18n/get-dictionary";
import DashboardClient from "./DashboardClient";
import DashboardMapClient from "./DashboardMapClient";
import DashboardActivityClient from "./DashboardActivityClient";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

function DashboardToolLink({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      style={{
        minHeight: "86px",
        borderRadius: "20px",
        padding: "14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.075)",
        textDecoration: "none",
        transition: "transform 160ms ease, border-color 160ms ease",
      }}
    >
      <span
        style={{
          width: "44px",
          height: "44px",
          flex: "0 0 auto",
          borderRadius: "15px",
          display: "grid",
          placeItems: "center",
          background: "#eef4fb",
          color: "#0f172a",
          fontSize: "20px",
        }}
      >
        {icon}
      </span>

      <span style={{ minWidth: 0 }}>
        <strong
          style={{
            display: "block",
            color: "#ffffff",
            fontSize: "14px",
            lineHeight: 1.25,
          }}
        >
          {title}
        </strong>
        <span
          style={{
            display: "block",
            marginTop: "4px",
            color: "#94a3b8",
            fontSize: "11px",
            lineHeight: 1.35,
          }}
        >
          {text}
        </span>
      </span>
    </Link>
  );
}

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
          accountButton: "Account",
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
          <img src="/logo-wwhite.png" alt={`${t.common.appName} Logo`} />
        </Link>

        <nav className={styles.nav} aria-label="Dashboard Navigation">
          <Link href={`/${locale}`}>{copy.navHome}</Link>
          <Link href={`/${locale}/explore`}>{copy.navExplore}</Link>
          <Link href={`/${locale}/dashboard/account`}>{copy.accountButton}</Link>
        </nav>
      </header>

      <div className="mioseg-dashboard-content">
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
          <Link href={`/${locale}/dashboard/account`} className={styles.secondaryButton}>
            👤 {copy.accountButton}
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

      <section
        aria-label="Dashboard Werkzeuge"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: "12px",
          margin: "0 auto 16px",
          width: "100%",
          maxWidth: "1160px",
        }}
        className="mioseg-dashboard-tools"
      >
        <DashboardToolLink
          href={`/${locale}/dashboard/qrx`}
          icon="▣"
          title={copy.qrxButton}
          text="Erstellen und verwalten"
        />
        <DashboardToolLink
          href={`/${locale}/dashboard/scans`}
          icon="⌗"
          title={copy.scansButton}
          text="QR-Codes und QR-X"
        />
        <DashboardToolLink
          href={`/${locale}/dashboard/credits`}
          icon="💳"
          title={copy.creditsButton}
          text="Guthaben verwalten"
        />
        <DashboardToolLink
          href={`/${locale}/dashboard/account`}
          icon="👤"
          title={copy.accountButton}
          text="Konto und Rechnungen"
        />
        <DashboardToolLink
          href={`/${locale}/dashboard/support`}
          icon="🛟"
          title={copy.supportButton}
          text="Kontakt und Hilfe"
        />
      </section>

      <section
        style={{
          width: "100%",
          maxWidth: "1160px",
          margin: "0 auto",
        }}
      >
        <article className={styles.mapCard} style={{ width: "100%" }}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{copy.mapTitle}</h2>
              <p>{copy.mapHint}</p>
            </div>
            <span>{copy.mapLabel}</span>
          </div>

          <DashboardMapClient locale={locale} />
        </article>
      </section>

      <section
        style={{
          width: "100%",
          maxWidth: "1160px",
          margin: "16px auto 0",
          borderRadius: "28px",
          padding: "20px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.075)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "28px",
                borderRadius: "999px",
                padding: "0 10px",
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(147,197,253,0.16)",
                color: "#bfdbfe",
                fontSize: "11px",
                fontWeight: 950,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Live
            </span>
            <h2 style={{ margin: "10px 0 4px", color: "#ffffff" }}>
              Letzte Aktivitäten
            </h2>
            <p style={{ margin: 0, color: "#94a3b8" }}>
              Änderungen an QR-X, die du gespeichert hast.
            </p>
          </div>
        </div>

        <DashboardActivityClient locale={locale} />
      </section>

      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.mioseg-dashboard-content {
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  box-sizing: border-box;
}

.mioseg-dashboard-content > section {
  box-sizing: border-box;
}

.mioseg-dashboard-tools {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

@media (max-width: 1050px) {
  .mioseg-dashboard-tools {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 680px) {
  .mioseg-dashboard-tools {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 430px) {
  .mioseg-dashboard-tools {
    grid-template-columns: 1fr !important;
  }
}
          `.trim(),
        }}
      />
    </main>
  );
}
