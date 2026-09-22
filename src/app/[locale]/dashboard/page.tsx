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
    kicker: "Dashboard",
    subtitle: "Verwalte deine Mioseg QR, gespeicherten Inhalte, Credits und später auch deine Rechnungen bequem im Browser.",
    credits: "Credits",
    createdQrx: "Erstellte Mioseg QR",
    savedQrx: "Gespeicherte Mioseg QR",
    savedQr: "Gespeicherte QR-Codes",
    mapTitle: "Deine Mioseg QR Karte",
    mapHint: "Hier siehst du deine eigenen Mioseg QR, gespeicherte Mioseg QR und normale Scans mit Standort.",
    qrxButton: "Meine Mioseg QR",
    scansButton: "Meine Scans",
    creditsButton: "Credits",
    supportButton: "Support",
    accountButton: "Konto",
    createButton: "Mioseg QR erstellen",
    buyCreditsButton: "Credits kaufen",
    mapLabel: "Live",
    navHome: "Startseite",
    navExplore: "Explore",
    toolQrx: "Erstellen und verwalten",
    toolScans: "QR-Codes und Mioseg QR",
    toolCredits: "Guthaben verwalten",
    toolAccount: "Konto und Rechnungen",
    toolSupport: "Kontakt und Hilfe",
    statsAria: "Dashboard Kennzahlen",
    toolsAria: "Dashboard Werkzeuge",
    activityTitle: "Letzte Aktivitäten",
    activityText: "Änderungen an Mioseg QR, die du gespeichert hast.",
  },
  en: {
    title: "Welcome to your Mioseg qr",
    kicker: "Dashboard",
    subtitle: "Manage your Mioseg QR, saved content, credits and later your invoices conveniently in the browser.",
    credits: "Credits",
    createdQrx: "Created Mioseg QR",
    savedQrx: "Saved Mioseg QR",
    savedQr: "Saved QR codes",
    mapTitle: "Your Mioseg QR map",
    mapHint: "Here you can see your own Mioseg QR, saved Mioseg QR and normal scans with location.",
    qrxButton: "My Mioseg QR",
    scansButton: "My scans",
    creditsButton: "Credits",
    supportButton: "Support",
    accountButton: "Account",
    createButton: "Create Mioseg QR",
    buyCreditsButton: "Buy credits",
    mapLabel: "Live",
    navHome: "Home",
    navExplore: "Explore",
    toolQrx: "Create and manage",
    toolScans: "QR codes and Mioseg QR",
    toolCredits: "Manage balance",
    toolAccount: "Account and invoices",
    toolSupport: "Contact and help",
    statsAria: "Dashboard metrics",
    toolsAria: "Dashboard tools",
    activityTitle: "Recent activity",
    activityText: "Changes to Mioseg QR that you have saved.",
  },
  tr: {
    title: "Mioseg qr hesabına hoş geldin",
    kicker: "Kontrol paneli",
    subtitle: "Mioseg QR'lerini, kaydettiğin içerikleri, Credits bakiyeni ve ileride faturalarını tarayıcıdan kolayca yönet.",
    credits: "Credits",
    createdQrx: "Oluşturulan Mioseg QR",
    savedQrx: "Kaydedilen Mioseg QR",
    savedQr: "Kaydedilen QR kodları",
    mapTitle: "Mioseg QR haritan",
    mapHint: "Burada kendi Mioseg QR'lerini, kaydettiğin Mioseg QR'leri ve konumlu normal taramaları görebilirsin.",
    qrxButton: "Mioseg QR'lerim",
    scansButton: "Taramalarım",
    creditsButton: "Credits",
    supportButton: "Destek",
    accountButton: "Hesap",
    createButton: "Mioseg QR oluştur",
    buyCreditsButton: "Credits satın al",
    mapLabel: "Canlı",
    navHome: "Ana sayfa",
    navExplore: "Keşfet",
    toolQrx: "Oluştur ve yönet",
    toolScans: "QR kodları ve Mioseg QR",
    toolCredits: "Bakiyeyi yönet",
    toolAccount: "Hesap ve faturalar",
    toolSupport: "İletişim ve yardım",
    statsAria: "Dashboard göstergeleri",
    toolsAria: "Dashboard araçları",
    activityTitle: "Son etkinlikler",
    activityText: "Kaydettiğin Mioseg QR'lerdeki değişiklikler.",
  },
  pl: {
    title: "Witaj w swoim Mioseg qr",
    kicker: "Panel",
    subtitle: "Wygodnie zarządzaj Mioseg QR, zapisanymi treściami, Credits oraz później fakturami w przeglądarce.",
    credits: "Credits",
    createdQrx: "Utworzone Mioseg QR",
    savedQrx: "Zapisane Mioseg QR",
    savedQr: "Zapisane kody QR",
    mapTitle: "Twoja mapa Mioseg QR",
    mapHint: "Tutaj zobaczysz własne Mioseg QR, zapisane Mioseg QR oraz zwykłe skany z lokalizacją.",
    qrxButton: "Moje Mioseg QR",
    scansButton: "Moje skany",
    creditsButton: "Credits",
    supportButton: "Pomoc",
    accountButton: "Konto",
    createButton: "Utwórz Mioseg QR",
    buyCreditsButton: "Kup Credits",
    mapLabel: "Na żywo",
    navHome: "Strona główna",
    navExplore: "Explore",
    toolQrx: "Twórz i zarządzaj",
    toolScans: "Kody QR i Mioseg QR",
    toolCredits: "Zarządzaj saldem",
    toolAccount: "Konto i faktury",
    toolSupport: "Kontakt i pomoc",
    statsAria: "Statystyki panelu",
    toolsAria: "Narzędzia panelu",
    activityTitle: "Ostatnia aktywność",
    activityText: "Zmiany w zapisanych przez Ciebie Mioseg QR.",
  },
  ar: {
    title: "مرحبًا بك في Mioseg qr",
    kicker: "لوحة التحكم",
    subtitle: "أدر Mioseg QR والمحتوى المحفوظ وCredits وفواتيرك لاحقًا بسهولة من المتصفح.",
    credits: "Credits",
    createdQrx: "Mioseg QR التي أنشأتها",
    savedQrx: "Mioseg QR المحفوظة",
    savedQr: "رموز QR المحفوظة",
    mapTitle: "خريطة Mioseg QR الخاصة بك",
    mapHint: "هنا ترى Mioseg QR الخاصة بك وMioseg QR المحفوظة وعمليات المسح العادية التي تحتوي على موقع.",
    qrxButton: "Mioseg QR الخاصة بي",
    scansButton: "عمليات المسح",
    creditsButton: "Credits",
    supportButton: "الدعم",
    accountButton: "الحساب",
    createButton: "إنشاء Mioseg QR",
    buyCreditsButton: "شراء Credits",
    mapLabel: "مباشر",
    navHome: "الرئيسية",
    navExplore: "استكشاف",
    toolQrx: "إنشاء وإدارة",
    toolScans: "رموز QR وMioseg QR",
    toolCredits: "إدارة الرصيد",
    toolAccount: "الحساب والفواتير",
    toolSupport: "التواصل والمساعدة",
    statsAria: "إحصاءات لوحة التحكم",
    toolsAria: "أدوات لوحة التحكم",
    activityTitle: "آخر الأنشطة",
    activityText: "التغييرات على Mioseg QR التي حفظتها.",
  },
  fr: {
    title: "Bienvenue dans votre Mioseg qr",
    kicker: "Tableau de bord",
    subtitle: "Gérez facilement vos Mioseg QR, contenus enregistrés, Credits et plus tard vos factures depuis le navigateur.",
    credits: "Credits",
    createdQrx: "Mioseg QR créés",
    savedQrx: "Mioseg QR enregistrés",
    savedQr: "Codes QR enregistrés",
    mapTitle: "Votre carte Mioseg QR",
    mapHint: "Vous voyez ici vos propres Mioseg QR, les Mioseg QR enregistrés et les scans classiques avec localisation.",
    qrxButton: "Mes Mioseg QR",
    scansButton: "Mes scans",
    creditsButton: "Credits",
    supportButton: "Assistance",
    accountButton: "Compte",
    createButton: "Créer un Mioseg QR",
    buyCreditsButton: "Acheter des Credits",
    mapLabel: "En direct",
    navHome: "Accueil",
    navExplore: "Explore",
    toolQrx: "Créer et gérer",
    toolScans: "Codes QR et Mioseg QR",
    toolCredits: "Gérer le solde",
    toolAccount: "Compte et factures",
    toolSupport: "Contact et aide",
    statsAria: "Indicateurs du tableau de bord",
    toolsAria: "Outils du tableau de bord",
    activityTitle: "Activité récente",
    activityText: "Modifications des Mioseg QR que vous avez enregistrés.",
  },
  es: {
    title: "Bienvenido a tu Mioseg qr",
    kicker: "Panel",
    subtitle: "Gestiona cómodamente tus Mioseg QR, contenido guardado, Credits y más adelante tus facturas desde el navegador.",
    credits: "Credits",
    createdQrx: "Mioseg QR creados",
    savedQrx: "Mioseg QR guardados",
    savedQr: "Códigos QR guardados",
    mapTitle: "Tu mapa Mioseg QR",
    mapHint: "Aquí puedes ver tus propios Mioseg QR, los Mioseg QR guardados y escaneos normales con ubicación.",
    qrxButton: "Mis Mioseg QR",
    scansButton: "Mis escaneos",
    creditsButton: "Credits",
    supportButton: "Soporte",
    accountButton: "Cuenta",
    createButton: "Crear Mioseg QR",
    buyCreditsButton: "Comprar Credits",
    mapLabel: "En vivo",
    navHome: "Inicio",
    navExplore: "Explore",
    toolQrx: "Crear y gestionar",
    toolScans: "Códigos QR y Mioseg QR",
    toolCredits: "Gestionar saldo",
    toolAccount: "Cuenta y facturas",
    toolSupport: "Contacto y ayuda",
    statsAria: "Indicadores del panel",
    toolsAria: "Herramientas del panel",
    activityTitle: "Actividad reciente",
    activityText: "Cambios en los Mioseg QR que has guardado.",
  },
  it: {
    title: "Benvenuto nel tuo Mioseg qr",
    kicker: "Dashboard",
    subtitle: "Gestisci comodamente Mioseg QR, contenuti salvati, Credits e in seguito le fatture dal browser.",
    credits: "Credits",
    createdQrx: "Mioseg QR creati",
    savedQrx: "Mioseg QR salvati",
    savedQr: "Codici QR salvati",
    mapTitle: "La tua mappa Mioseg QR",
    mapHint: "Qui puoi vedere i tuoi Mioseg QR, quelli salvati e le scansioni normali con posizione.",
    qrxButton: "I miei Mioseg QR",
    scansButton: "Le mie scansioni",
    creditsButton: "Credits",
    supportButton: "Supporto",
    accountButton: "Account",
    createButton: "Crea Mioseg QR",
    buyCreditsButton: "Acquista Credits",
    mapLabel: "Live",
    navHome: "Home",
    navExplore: "Explore",
    toolQrx: "Crea e gestisci",
    toolScans: "Codici QR e Mioseg QR",
    toolCredits: "Gestisci saldo",
    toolAccount: "Account e fatture",
    toolSupport: "Contatti e assistenza",
    statsAria: "Metriche dashboard",
    toolsAria: "Strumenti dashboard",
    activityTitle: "Attività recenti",
    activityText: "Modifiche ai Mioseg QR che hai salvato.",
  },
} as const;

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
          <span className={styles.kicker}>{copy.kicker}</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx/new`} className={styles.primaryButton}>
            + {copy.createButton}
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
