import Link from "next/link";
import styles from "./dashboard.module.css";

import { defaultLocale, isValidLocale } from "../../../i18n/config";
import { getDictionary } from "../../../i18n/get-dictionary";
import DashboardClient from "./DashboardClient";
import DashboardMapClient from "./DashboardMapClient";
import DashboardActivityClient from "./DashboardActivityClient";

const DASHBOARD_COPY = {
  de: {
    title: "Willkommen bei deinem Mioseg qr",
    subtitle: "Verwalte deine QR-X, gespeicherten Inhalte, Credits und später auch deine Rechnungen bequem im Browser.",
    credits: "Credits",
    createdQrx: "Erstellte QR-X",
    savedQrx: "Gespeicherte QR-X",
    savedQr: "Gespeicherte QR-Codes",
    mapTitle: "Deine QR-X Karte",
    mapHint: "Hier siehst du deine eigenen QR-X, gespeicherte QR-X und normale Scans mit Standort.",
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
    toolQrx: "Erstellen und verwalten",
    toolScans: "QR-Codes und QR-X",
    toolCredits: "Guthaben verwalten",
    toolAccount: "Konto und Rechnungen",
    toolSupport: "Kontakt und Hilfe",
    statsAria: "Dashboard Kennzahlen",
    toolsAria: "Dashboard Werkzeuge",
    activityTitle: "Letzte Aktivitäten",
    activityText: "Änderungen an QR-X, die du gespeichert hast.",
  },
  en: {
    title: "Welcome to your Mioseg qr",
    subtitle: "Manage your QR-X, saved content, credits and later your invoices conveniently in the browser.",
    credits: "Credits",
    createdQrx: "Created QR-X",
    savedQrx: "Saved QR-X",
    savedQr: "Saved QR codes",
    mapTitle: "Your QR-X map",
    mapHint: "Here you can see your own QR-X, saved QR-X and normal scans with location.",
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
    toolQrx: "Create and manage",
    toolScans: "QR codes and QR-X",
    toolCredits: "Manage balance",
    toolAccount: "Account and invoices",
    toolSupport: "Contact and help",
    statsAria: "Dashboard metrics",
    toolsAria: "Dashboard tools",
    activityTitle: "Recent activity",
    activityText: "Changes to QR-X that you have saved.",
  },
  tr: {
    title: "Mioseg qr hesabına hoş geldin",
    subtitle: "QR-X'lerini, kaydettiğin içerikleri, Credits bakiyeni ve ileride faturalarını tarayıcıdan kolayca yönet.",
    credits: "Credits",
    createdQrx: "Oluşturulan QR-X",
    savedQrx: "Kaydedilen QR-X",
    savedQr: "Kaydedilen QR kodları",
    mapTitle: "QR-X haritan",
    mapHint: "Burada kendi QR-X'lerini, kaydettiğin QR-X'leri ve konumlu normal taramaları görebilirsin.",
    qrxButton: "QR-X'lerim",
    scansButton: "Taramalarım",
    creditsButton: "Credits",
    supportButton: "Destek",
    accountButton: "Hesap",
    createButton: "QR-X oluştur",
    buyCreditsButton: "Credits satın al",
    mapLabel: "Canlı",
    navHome: "Ana sayfa",
    navExplore: "Keşfet",
    toolQrx: "Oluştur ve yönet",
    toolScans: "QR kodları ve QR-X",
    toolCredits: "Bakiyeyi yönet",
    toolAccount: "Hesap ve faturalar",
    toolSupport: "İletişim ve yardım",
    statsAria: "Dashboard göstergeleri",
    toolsAria: "Dashboard araçları",
    activityTitle: "Son etkinlikler",
    activityText: "Kaydettiğin QR-X'lerdeki değişiklikler.",
  },
  pl: {
    title: "Witaj w swoim Mioseg qr",
    subtitle: "Wygodnie zarządzaj QR-X, zapisanymi treściami, Credits oraz później fakturami w przeglądarce.",
    credits: "Credits",
    createdQrx: "Utworzone QR-X",
    savedQrx: "Zapisane QR-X",
    savedQr: "Zapisane kody QR",
    mapTitle: "Twoja mapa QR-X",
    mapHint: "Tutaj zobaczysz własne QR-X, zapisane QR-X oraz zwykłe skany z lokalizacją.",
    qrxButton: "Moje QR-X",
    scansButton: "Moje skany",
    creditsButton: "Credits",
    supportButton: "Pomoc",
    accountButton: "Konto",
    createButton: "Utwórz QR-X",
    buyCreditsButton: "Kup Credits",
    mapLabel: "Na żywo",
    navHome: "Strona główna",
    navExplore: "Explore",
    toolQrx: "Twórz i zarządzaj",
    toolScans: "Kody QR i QR-X",
    toolCredits: "Zarządzaj saldem",
    toolAccount: "Konto i faktury",
    toolSupport: "Kontakt i pomoc",
    statsAria: "Statystyki panelu",
    toolsAria: "Narzędzia panelu",
    activityTitle: "Ostatnia aktywność",
    activityText: "Zmiany w zapisanych przez Ciebie QR-X.",
  },
  ar: {
    title: "مرحبًا بك في Mioseg qr",
    subtitle: "أدر QR-X والمحتوى المحفوظ وCredits وفواتيرك لاحقًا بسهولة من المتصفح.",
    credits: "Credits",
    createdQrx: "QR-X التي أنشأتها",
    savedQrx: "QR-X المحفوظة",
    savedQr: "رموز QR المحفوظة",
    mapTitle: "خريطة QR-X الخاصة بك",
    mapHint: "هنا ترى QR-X الخاصة بك وQR-X المحفوظة وعمليات المسح العادية التي تحتوي على موقع.",
    qrxButton: "QR-X الخاصة بي",
    scansButton: "عمليات المسح",
    creditsButton: "Credits",
    supportButton: "الدعم",
    accountButton: "الحساب",
    createButton: "إنشاء QR-X",
    buyCreditsButton: "شراء Credits",
    mapLabel: "مباشر",
    navHome: "الرئيسية",
    navExplore: "استكشاف",
    toolQrx: "إنشاء وإدارة",
    toolScans: "رموز QR وQR-X",
    toolCredits: "إدارة الرصيد",
    toolAccount: "الحساب والفواتير",
    toolSupport: "التواصل والمساعدة",
    statsAria: "إحصاءات لوحة التحكم",
    toolsAria: "أدوات لوحة التحكم",
    activityTitle: "آخر الأنشطة",
    activityText: "التغييرات على QR-X التي حفظتها.",
  },
  fr: {
    title: "Bienvenue dans votre Mioseg qr",
    subtitle: "Gérez facilement vos QR-X, contenus enregistrés, Credits et plus tard vos factures depuis le navigateur.",
    credits: "Credits",
    createdQrx: "QR-X créés",
    savedQrx: "QR-X enregistrés",
    savedQr: "Codes QR enregistrés",
    mapTitle: "Votre carte QR-X",
    mapHint: "Vous voyez ici vos propres QR-X, les QR-X enregistrés et les scans classiques avec localisation.",
    qrxButton: "Mes QR-X",
    scansButton: "Mes scans",
    creditsButton: "Credits",
    supportButton: "Assistance",
    accountButton: "Compte",
    createButton: "Créer un QR-X",
    buyCreditsButton: "Acheter des Credits",
    mapLabel: "En direct",
    navHome: "Accueil",
    navExplore: "Explore",
    toolQrx: "Créer et gérer",
    toolScans: "Codes QR et QR-X",
    toolCredits: "Gérer le solde",
    toolAccount: "Compte et factures",
    toolSupport: "Contact et aide",
    statsAria: "Indicateurs du tableau de bord",
    toolsAria: "Outils du tableau de bord",
    activityTitle: "Activité récente",
    activityText: "Modifications des QR-X que vous avez enregistrés.",
  },
  es: {
    title: "Bienvenido a tu Mioseg qr",
    subtitle: "Gestiona cómodamente tus QR-X, contenido guardado, Credits y más adelante tus facturas desde el navegador.",
    credits: "Credits",
    createdQrx: "QR-X creados",
    savedQrx: "QR-X guardados",
    savedQr: "Códigos QR guardados",
    mapTitle: "Tu mapa QR-X",
    mapHint: "Aquí puedes ver tus propios QR-X, los QR-X guardados y escaneos normales con ubicación.",
    qrxButton: "Mis QR-X",
    scansButton: "Mis escaneos",
    creditsButton: "Credits",
    supportButton: "Soporte",
    accountButton: "Cuenta",
    createButton: "Crear QR-X",
    buyCreditsButton: "Comprar Credits",
    mapLabel: "En vivo",
    navHome: "Inicio",
    navExplore: "Explore",
    toolQrx: "Crear y gestionar",
    toolScans: "Códigos QR y QR-X",
    toolCredits: "Gestionar saldo",
    toolAccount: "Cuenta y facturas",
    toolSupport: "Contacto y ayuda",
    statsAria: "Indicadores del panel",
    toolsAria: "Herramientas del panel",
    activityTitle: "Actividad reciente",
    activityText: "Cambios en los QR-X que has guardado.",
  },
  it: {
    title: "Benvenuto nel tuo Mioseg qr",
    subtitle: "Gestisci comodamente QR-X, contenuti salvati, Credits e in seguito le fatture dal browser.",
    credits: "Credits",
    createdQrx: "QR-X creati",
    savedQrx: "QR-X salvati",
    savedQr: "Codici QR salvati",
    mapTitle: "La tua mappa QR-X",
    mapHint: "Qui puoi vedere i tuoi QR-X, quelli salvati e le scansioni normali con posizione.",
    qrxButton: "I miei QR-X",
    scansButton: "Le mie scansioni",
    creditsButton: "Credits",
    supportButton: "Supporto",
    accountButton: "Account",
    createButton: "Crea QR-X",
    buyCreditsButton: "Acquista Credits",
    mapLabel: "Live",
    navHome: "Home",
    navExplore: "Explore",
    toolQrx: "Crea e gestisci",
    toolScans: "Codici QR e QR-X",
    toolCredits: "Gestisci saldo",
    toolAccount: "Account e fatture",
    toolSupport: "Contatti e assistenza",
    statsAria: "Metriche dashboard",
    toolsAria: "Strumenti dashboard",
    activityTitle: "Attività recenti",
    activityText: "Modifiche ai QR-X che hai salvato.",
  },
} as const;

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

  const copy = DASHBOARD_COPY[locale];

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt={`${t.common.appName} Logo`} />
        </Link>

        <nav className={styles.nav} aria-label={copy.toolsAria}>
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

      <section className={styles.statsGrid} aria-label={copy.statsAria}>
        <DashboardClient
          creditsLabel={copy.credits}
          createdQrxLabel={copy.createdQrx}
          savedQrxLabel={copy.savedQrx}
          savedQrLabel={copy.savedQr}
        />
      </section>

      <section
        aria-label={copy.toolsAria}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: "12px",
          margin: "0 0 16px",
          width: "100%",
        }}
        className="mioseg-dashboard-tools"
      >
        <DashboardToolLink
          href={`/${locale}/dashboard/qrx`}
          icon="▣"
          title={copy.qrxButton}
          text={copy.toolQrx}
        />
        <DashboardToolLink
          href={`/${locale}/dashboard/scans`}
          icon="⌗"
          title={copy.scansButton}
          text={copy.toolScans}
        />
        <DashboardToolLink
          href={`/${locale}/dashboard/credits`}
          icon="💳"
          title={copy.creditsButton}
          text={copy.toolCredits}
        />
        <DashboardToolLink
          href={`/${locale}/dashboard/account`}
          icon="👤"
          title={copy.accountButton}
          text={copy.toolAccount}
        />
        <DashboardToolLink
          href={`/${locale}/dashboard/support`}
          icon="🛟"
          title={copy.supportButton}
          text={copy.toolSupport}
        />
      </section>

      <section
        style={{
          width: "100%",
          margin: 0,
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
          margin: "16px 0 0",
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
              {copy.mapLabel}
            </span>
            <h2 style={{ margin: "10px 0 4px", color: "#ffffff" }}>
              {copy.activityTitle}
            </h2>
            <p style={{ margin: 0, color: "#94a3b8" }}>
              {copy.activityText}
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
