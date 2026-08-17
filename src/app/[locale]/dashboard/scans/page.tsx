"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../dashboard.module.css";

type UserScan = {
  id: string;
  name: string | null;
  data: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
};


const SUPPORTED_SCAN_LANGUAGES = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;
type ScanLanguage = (typeof SUPPORTED_SCAN_LANGUAGES)[number];

type ScanCopy = {
  savedScan: string;
  loginRequired: string;
  copyFailed: string;
  deleteConfirm: string;
  loginAgain: string;
  deleteFailed: string;
  allScans: string;
  withLocation: string;
  links: string;
  withoutLocation: string;
  navLabel: string;
  myQrx: string;
  explore: string;
  myScans: string;
  heroText: string;
  openMyQrx: string;
  backDashboard: string;
  statsLabel: string;
  sectionTitle: string;
  sectionText: string;
  loadingShort: string;
  entries: string;
  emptyTitle: string;
  emptyText: string;
  loadingScans: string;
  noContent: string;
  scanned: string;
  locationSaved: string;
  open: string;
  copied: string;
  copy: string;
  share: string;
  deleting: string;
  deleteScan: string;
};

const SCAN_TEXT: Record<ScanLanguage, ScanCopy> = {
  de: {
    savedScan: "Gespeicherter Scan",
    loginRequired: "Bitte melde dich zuerst an, um deine Scans zu sehen.",
    copyFailed: "Link konnte nicht kopiert werden.",
    deleteConfirm: "Möchtest du diesen Scan wirklich löschen?",
    loginAgain: "Bitte melde dich erneut an.",
    deleteFailed: "Scan konnte nicht gelöscht werden.",
    allScans: "Alle Scans",
    withLocation: "Mit Standort",
    links: "Links",
    withoutLocation: "Ohne Standort",
    navLabel: "Scans Navigation",
    myQrx: "Meine QR-X",
    explore: "Explore",
    myScans: "Meine Scans",
    heroText: "Hier findest du normale QR-Codes und Links, die du mit der App gescannt hast. Wenn beim Scannen ein Standort gespeichert wurde, erscheint der Scan auch auf deiner Dashboard-Karte.",
    openMyQrx: "Meine QR-X öffnen",
    backDashboard: "Zurück zum Dashboard",
    statsLabel: "Meine Scans Kennzahlen",
    sectionTitle: "Normale QR-Codes & Links",
    sectionText: "Alle normalen Scans aus deiner App, sortiert nach dem neuesten Eintrag.",
    loadingShort: "Lädt ...",
    entries: "Einträge",
    emptyTitle: "Noch keine normalen Scans gespeichert",
    emptyText: "Sobald du mit der App einen normalen QR-Code scannst und speicherst, erscheint er hier.",
    loadingScans: "Scans werden geladen …",
    noContent: "Kein Inhalt gespeichert.",
    scanned: "Gescannt",
    locationSaved: "Standort gespeichert",
    open: "Öffnen",
    copied: "Kopiert",
    copy: "Kopieren",
    share: "Teilen",
    deleting: "Löscht …",
    deleteScan: "Scan löschen",
  },
  en: {
    savedScan: "Saved scan",
    loginRequired: "Please sign in first to view your scans.",
    copyFailed: "The link could not be copied.",
    deleteConfirm: "Do you really want to delete this scan?",
    loginAgain: "Please sign in again.",
    deleteFailed: "The scan could not be deleted.",
    allScans: "All scans",
    withLocation: "With location",
    links: "Links",
    withoutLocation: "Without location",
    navLabel: "Scans navigation",
    myQrx: "My QR-X",
    explore: "Explore",
    myScans: "My scans",
    heroText: "Here you can find regular QR codes and links that you scanned with the app. If a location was saved while scanning, the scan also appears on your dashboard map.",
    openMyQrx: "Open my QR-X",
    backDashboard: "Back to dashboard",
    statsLabel: "My scans statistics",
    sectionTitle: "Regular QR codes & links",
    sectionText: "All regular scans from your app, sorted by newest first.",
    loadingShort: "Loading ...",
    entries: "entries",
    emptyTitle: "No regular scans saved yet",
    emptyText: "As soon as you scan and save a regular QR code with the app, it will appear here.",
    loadingScans: "Loading scans …",
    noContent: "No content saved.",
    scanned: "Scanned",
    locationSaved: "Location saved",
    open: "Open",
    copied: "Copied",
    copy: "Copy",
    share: "Share",
    deleting: "Deleting …",
    deleteScan: "Delete scan",
  },
  tr: {
    savedScan: "Kaydedilmiş tarama",
    loginRequired: "Taramalarınızı görmek için lütfen önce giriş yapın.",
    copyFailed: "Bağlantı kopyalanamadı.",
    deleteConfirm: "Bu taramayı gerçekten silmek istiyor musunuz?",
    loginAgain: "Lütfen tekrar giriş yapın.",
    deleteFailed: "Tarama silinemedi.",
    allScans: "Tüm taramalar",
    withLocation: "Konumlu",
    links: "Bağlantılar",
    withoutLocation: "Konumsuz",
    navLabel: "Tarama navigasyonu",
    myQrx: "QR-X'lerim",
    explore: "Keşfet",
    myScans: "Taramalarım",
    heroText: "Uygulamayla taradığınız normal QR kodlarını ve bağlantıları burada bulabilirsiniz. Tarama sırasında konum kaydedildiyse tarama, kontrol paneli haritanızda da görünür.",
    openMyQrx: "QR-X'lerimi aç",
    backDashboard: "Kontrol paneline dön",
    statsLabel: "Tarama istatistiklerim",
    sectionTitle: "Normal QR kodları ve bağlantılar",
    sectionText: "Uygulamanızdaki tüm normal taramalar, en yeniden eskiye sıralanır.",
    loadingShort: "Yükleniyor ...",
    entries: "kayıt",
    emptyTitle: "Henüz normal tarama kaydedilmedi",
    emptyText: "Uygulamayla normal bir QR kodunu tarayıp kaydettiğinizde burada görünür.",
    loadingScans: "Taramalar yükleniyor …",
    noContent: "İçerik kaydedilmedi.",
    scanned: "Tarandı",
    locationSaved: "Konum kaydedildi",
    open: "Aç",
    copied: "Kopyalandı",
    copy: "Kopyala",
    share: "Paylaş",
    deleting: "Siliniyor …",
    deleteScan: "Taramayı sil",
  },
  pl: {
    savedScan: "Zapisany skan",
    loginRequired: "Zaloguj się najpierw, aby zobaczyć swoje skany.",
    copyFailed: "Nie udało się skopiować linku.",
    deleteConfirm: "Czy na pewno chcesz usunąć ten skan?",
    loginAgain: "Zaloguj się ponownie.",
    deleteFailed: "Nie udało się usunąć skanu.",
    allScans: "Wszystkie skany",
    withLocation: "Z lokalizacją",
    links: "Linki",
    withoutLocation: "Bez lokalizacji",
    navLabel: "Nawigacja skanów",
    myQrx: "Moje QR-X",
    explore: "Odkrywaj",
    myScans: "Moje skany",
    heroText: "Tutaj znajdziesz zwykłe kody QR i linki zeskanowane w aplikacji. Jeśli podczas skanowania zapisano lokalizację, skan pojawi się również na mapie panelu.",
    openMyQrx: "Otwórz moje QR-X",
    backDashboard: "Wróć do panelu",
    statsLabel: "Statystyki moich skanów",
    sectionTitle: "Zwykłe kody QR i linki",
    sectionText: "Wszystkie zwykłe skany z aplikacji, posortowane od najnowszych.",
    loadingShort: "Ładowanie ...",
    entries: "wpisów",
    emptyTitle: "Nie zapisano jeszcze zwykłych skanów",
    emptyText: "Gdy zeskanujesz i zapiszesz zwykły kod QR w aplikacji, pojawi się on tutaj.",
    loadingScans: "Ładowanie skanów …",
    noContent: "Brak zapisanej zawartości.",
    scanned: "Zeskanowano",
    locationSaved: "Lokalizacja zapisana",
    open: "Otwórz",
    copied: "Skopiowano",
    copy: "Kopiuj",
    share: "Udostępnij",
    deleting: "Usuwanie …",
    deleteScan: "Usuń skan",
  },
  ar: {
    savedScan: "مسح محفوظ",
    loginRequired: "يرجى تسجيل الدخول أولاً لعرض عمليات المسح.",
    copyFailed: "تعذر نسخ الرابط.",
    deleteConfirm: "هل تريد حقًا حذف عملية المسح هذه؟",
    loginAgain: "يرجى تسجيل الدخول مرة أخرى.",
    deleteFailed: "تعذر حذف عملية المسح.",
    allScans: "كل عمليات المسح",
    withLocation: "مع الموقع",
    links: "الروابط",
    withoutLocation: "بدون موقع",
    navLabel: "تنقل عمليات المسح",
    myQrx: "QR-X الخاصة بي",
    explore: "استكشاف",
    myScans: "عمليات المسح الخاصة بي",
    heroText: "ستجد هنا رموز QR العادية والروابط التي مسحتها باستخدام التطبيق. إذا تم حفظ موقع أثناء المسح، فستظهر العملية أيضًا على خريطة لوحة التحكم.",
    openMyQrx: "فتح QR-X الخاصة بي",
    backDashboard: "العودة إلى لوحة التحكم",
    statsLabel: "إحصاءات عمليات المسح",
    sectionTitle: "رموز QR العادية والروابط",
    sectionText: "جميع عمليات المسح العادية من تطبيقك، مرتبة من الأحدث إلى الأقدم.",
    loadingShort: "جارٍ التحميل ...",
    entries: "إدخالات",
    emptyTitle: "لا توجد عمليات مسح عادية محفوظة بعد",
    emptyText: "عندما تمسح رمز QR عاديًا وتحفظه باستخدام التطبيق، سيظهر هنا.",
    loadingScans: "جارٍ تحميل عمليات المسح …",
    noContent: "لا يوجد محتوى محفوظ.",
    scanned: "تم المسح",
    locationSaved: "تم حفظ الموقع",
    open: "فتح",
    copied: "تم النسخ",
    copy: "نسخ",
    share: "مشاركة",
    deleting: "جارٍ الحذف …",
    deleteScan: "حذف المسح",
  },
  fr: {
    savedScan: "Scan enregistré",
    loginRequired: "Connectez-vous d'abord pour voir vos scans.",
    copyFailed: "Le lien n'a pas pu être copié.",
    deleteConfirm: "Voulez-vous vraiment supprimer ce scan ?",
    loginAgain: "Veuillez vous reconnecter.",
    deleteFailed: "Le scan n'a pas pu être supprimé.",
    allScans: "Tous les scans",
    withLocation: "Avec localisation",
    links: "Liens",
    withoutLocation: "Sans localisation",
    navLabel: "Navigation des scans",
    myQrx: "Mes QR-X",
    explore: "Explorer",
    myScans: "Mes scans",
    heroText: "Vous trouverez ici les codes QR classiques et les liens scannés avec l'application. Si une localisation a été enregistrée lors du scan, celui-ci apparaît également sur la carte de votre tableau de bord.",
    openMyQrx: "Ouvrir mes QR-X",
    backDashboard: "Retour au tableau de bord",
    statsLabel: "Statistiques de mes scans",
    sectionTitle: "Codes QR classiques et liens",
    sectionText: "Tous les scans classiques de votre application, triés du plus récent au plus ancien.",
    loadingShort: "Chargement ...",
    entries: "entrées",
    emptyTitle: "Aucun scan classique enregistré",
    emptyText: "Dès que vous scannez et enregistrez un code QR classique avec l'application, il apparaît ici.",
    loadingScans: "Chargement des scans …",
    noContent: "Aucun contenu enregistré.",
    scanned: "Scanné",
    locationSaved: "Localisation enregistrée",
    open: "Ouvrir",
    copied: "Copié",
    copy: "Copier",
    share: "Partager",
    deleting: "Suppression …",
    deleteScan: "Supprimer le scan",
  },
  es: {
    savedScan: "Escaneo guardado",
    loginRequired: "Inicia sesión primero para ver tus escaneos.",
    copyFailed: "No se pudo copiar el enlace.",
    deleteConfirm: "¿Realmente quieres eliminar este escaneo?",
    loginAgain: "Vuelve a iniciar sesión.",
    deleteFailed: "No se pudo eliminar el escaneo.",
    allScans: "Todos los escaneos",
    withLocation: "Con ubicación",
    links: "Enlaces",
    withoutLocation: "Sin ubicación",
    navLabel: "Navegación de escaneos",
    myQrx: "Mis QR-X",
    explore: "Explorar",
    myScans: "Mis escaneos",
    heroText: "Aquí encontrarás códigos QR normales y enlaces que has escaneado con la aplicación. Si se guardó una ubicación durante el escaneo, también aparecerá en el mapa de tu panel.",
    openMyQrx: "Abrir mis QR-X",
    backDashboard: "Volver al panel",
    statsLabel: "Estadísticas de mis escaneos",
    sectionTitle: "Códigos QR normales y enlaces",
    sectionText: "Todos los escaneos normales de tu aplicación, ordenados del más reciente al más antiguo.",
    loadingShort: "Cargando ...",
    entries: "entradas",
    emptyTitle: "Aún no hay escaneos normales guardados",
    emptyText: "Cuando escanees y guardes un código QR normal con la aplicación, aparecerá aquí.",
    loadingScans: "Cargando escaneos …",
    noContent: "No hay contenido guardado.",
    scanned: "Escaneado",
    locationSaved: "Ubicación guardada",
    open: "Abrir",
    copied: "Copiado",
    copy: "Copiar",
    share: "Compartir",
    deleting: "Eliminando …",
    deleteScan: "Eliminar escaneo",
  },
  it: {
    savedScan: "Scansione salvata",
    loginRequired: "Accedi prima per vedere le tue scansioni.",
    copyFailed: "Impossibile copiare il link.",
    deleteConfirm: "Vuoi davvero eliminare questa scansione?",
    loginAgain: "Accedi di nuovo.",
    deleteFailed: "Impossibile eliminare la scansione.",
    allScans: "Tutte le scansioni",
    withLocation: "Con posizione",
    links: "Link",
    withoutLocation: "Senza posizione",
    navLabel: "Navigazione scansioni",
    myQrx: "I miei QR-X",
    explore: "Esplora",
    myScans: "Le mie scansioni",
    heroText: "Qui trovi i normali codici QR e i link scansionati con l'app. Se durante la scansione è stata salvata una posizione, la scansione appare anche sulla mappa della dashboard.",
    openMyQrx: "Apri i miei QR-X",
    backDashboard: "Torna alla dashboard",
    statsLabel: "Statistiche delle mie scansioni",
    sectionTitle: "Codici QR normali e link",
    sectionText: "Tutte le scansioni normali della tua app, ordinate dalla più recente.",
    loadingShort: "Caricamento ...",
    entries: "voci",
    emptyTitle: "Nessuna scansione normale salvata",
    emptyText: "Quando scansioni e salvi un normale codice QR con l'app, apparirà qui.",
    loadingScans: "Caricamento scansioni …",
    noContent: "Nessun contenuto salvato.",
    scanned: "Scansionato",
    locationSaved: "Posizione salvata",
    open: "Apri",
    copied: "Copiato",
    copy: "Copia",
    share: "Condividi",
    deleting: "Eliminazione …",
    deleteScan: "Elimina scansione",
  },
};

function normalizeScanLanguage(value: unknown): ScanLanguage {
  const locale = getLocaleFromParams(value).toLowerCase().split("-")[0];
  return SUPPORTED_SCAN_LANGUAGES.includes(locale as ScanLanguage)
    ? (locale as ScanLanguage)
    : "de";
}

function getLocaleFromParams(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return "de";
}

function formatDate(value: string | null, language: ScanLanguage) {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat(language, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getScanTitle(scan: UserScan, ui: ScanCopy) {
  return scan.name?.trim() || ui.savedScan;
}

function getScanTarget(scan: UserScan) {
  return scan.data?.trim() || "";
}

function hasLocation(scan: UserScan) {
  return (
    typeof scan.latitude === "number" &&
    typeof scan.longitude === "number" &&
    Number.isFinite(scan.latitude) &&
    Number.isFinite(scan.longitude)
  );
}

function isOpenableUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function shortText(value: string, max = 90) {
  const v = value.trim();
  if (v.length <= max) return v;
  return `${v.slice(0, max - 1)}…`;
}

export default function DashboardScansPage() {
  const params = useParams();
  const locale = getLocaleFromParams(params?.locale);
  const language = normalizeScanLanguage(params?.locale);
  const ui = SCAN_TEXT[language];

  const [items, setItems] = useState<UserScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void loadScans();
  }, []);

  async function loadScans() {
    setLoading(true);
    setErrorText(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorText(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setItems([]);
      setErrorText(ui.loginRequired);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_scans")
      .select("id,name,data,latitude,longitude,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<UserScan[]>();

    if (error) {
      setErrorText(error.message);
      setItems([]);
    } else {
      setItems(data ?? []);
    }

    setLoading(false);
  }

  async function handleShare(scan: UserScan) {
    const target = getScanTarget(scan);
    if (!target) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: getScanTitle(scan, ui),
          text: target,
          url: isOpenableUrl(target) ? target : undefined,
        });
        return;
      }

      await navigator.clipboard.writeText(target);
      setCopiedId(scan.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      try {
        await navigator.clipboard.writeText(target);
        setCopiedId(scan.id);
        window.setTimeout(() => setCopiedId(null), 1800);
      } catch {
        alert(ui.copyFailed);
      }
    }
  }

  function handleOpen(scan: UserScan) {
    const target = getScanTarget(scan);
    if (!target) return;

    if (isOpenableUrl(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    void navigator.clipboard.writeText(target);
    setCopiedId(scan.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  async function handleDelete(scan: UserScan) {
    const confirmed = window.confirm(
      `${ui.deleteConfirm}\n\n${getScanTitle(scan, ui)}`,
    );

    if (!confirmed) return;

    setDeletingId(scan.id);
    setErrorText(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error(ui.loginAgain);

      const { error } = await supabase
        .from("user_scans")
        .delete()
        .eq("id", scan.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setItems((current) => current.filter((item) => item.id !== scan.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : ui.deleteFailed;
      setErrorText(message);
      alert(message);
    } finally {
      setDeletingId(null);
    }
  }

  const stats = useMemo(() => {
    const withLocation = items.filter((item) => hasLocation(item)).length;
    const links = items.filter((item) => isOpenableUrl(getScanTarget(item))).length;

    return [
      { label: ui.allScans, value: items.length, icon: "⌗" },
      { label: ui.withLocation, value: withLocation, icon: "📍" },
      { label: ui.links, value: links, icon: "🔗" },
      { label: ui.withoutLocation, value: items.length - withLocation, icon: "○" },
    ];
  }, [items, ui]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label={ui.navLabel}>
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>{ui.myQrx}</Link>
          <Link href={`/${locale}/explore`}>{ui.explore}</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>{ui.myScans}</span>
          <h1>{ui.myScans}</h1>
          <p>{ui.heroText}</p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx`} className={styles.primaryButton}>
            {ui.openMyQrx}
          </Link>
          <Link href={`/${locale}/dashboard`} className={styles.secondaryButton}>
            {ui.backDashboard}
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label={ui.statsLabel}>
        {stats.map((item) => (
          <article key={item.label} className={styles.statCard}>
            <div className={styles.statIcon}>{item.icon}</div>
            <div>
              <div className={styles.statValue}>{item.value}</div>
              <div className={styles.statLabel}>{item.label}</div>
            </div>
          </article>
        ))}
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          borderRadius: 30,
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
          padding: 18,
        }}
      >
        <div className={styles.cardHeader}>
          <div>
            <h2>{ui.sectionTitle}</h2>
            <p>{ui.sectionText}</p>
          </div>
          <span>{loading ? ui.loadingShort : `${items.length} ${ui.entries}`}</span>
        </div>

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}

        {!loading && !errorText && items.length === 0 ? (
          <div style={emptyStyle}>
            <div>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⌗</div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 24 }}>
                {ui.emptyTitle}
              </h3>
              <p style={{ margin: "0 auto 18px", color: "#94a3b8", maxWidth: 560, lineHeight: 1.6 }}>
                {ui.emptyText}
              </p>
            </div>
          </div>
        ) : null}

        {loading ? <div style={loadingStyle}>{ui.loadingScans}</div> : null}

        {!loading && items.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {items.map((scan) => {
              const title = getScanTitle(scan, ui);
              const target = getScanTarget(scan);
              const locationSaved = hasLocation(scan);

              return (
                <article key={scan.id} style={cardStyle}>
                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 18,
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(180deg, #ffffff, #dbeafe)",
                        color: "#07101f",
                        fontSize: 22,
                        fontWeight: 950,
                        marginBottom: 14,
                      }}
                    >
                      {isOpenableUrl(target) ? "🔗" : "⌗"}
                    </div>

                    <h3
                      style={{
                        margin: "0 0 8px",
                        color: "#ffffff",
                        fontSize: 22,
                        lineHeight: 1.18,
                        fontWeight: 950,
                        letterSpacing: "-0.35px",
                      }}
                    >
                      {title}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "#94a3b8",
                        fontSize: 13,
                        lineHeight: 1.55,
                        minHeight: 42,
                        wordBreak: "break-word",
                      }}
                    >
                      {target ? shortText(target, 120) : ui.noContent}
                    </p>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      <span style={pillStyle}>{ui.scanned}: {formatDate(scan.created_at, language)}</span>

                      {locationSaved ? (
                        <span style={locationPillStyle}>📍 {ui.locationSaved}</span>
                      ) : (
                        <span style={pillStyle}>{ui.withoutLocation}</span>
                      )}
                    </div>

                    {locationSaved ? (
                      <div
                        style={{
                          borderRadius: 16,
                          padding: 12,
                          background: "rgba(37,99,235,0.12)",
                          border: "1px solid rgba(147,197,253,0.18)",
                          color: "#bfdbfe",
                          fontSize: 12,
                          fontWeight: 850,
                          marginBottom: 14,
                          wordBreak: "break-word",
                        }}
                      >
                        {scan.latitude?.toFixed(6)}, {scan.longitude?.toFixed(6)}
                      </div>
                    ) : null}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpen(scan)}
                        className={styles.primaryButton}
                        style={{ border: 0, cursor: "pointer" }}
                      >
                        {isOpenableUrl(target) ? ui.open : copiedId === scan.id ? ui.copied : ui.copy}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleShare(scan)}
                        className={styles.secondaryButton}
                        style={{ cursor: "pointer" }}
                      >
                        {copiedId === scan.id ? ui.copied : ui.share}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(scan)}
                        className={styles.secondaryButton}
                        disabled={deletingId === scan.id}
                        style={{
                          gridColumn: "1 / -1",
                          cursor: deletingId === scan.id ? "not-allowed" : "pointer",
                          border: "1px solid rgba(248,113,113,0.35)",
                          background: "rgba(239,68,68,0.14)",
                          color: "#fecaca",
                          opacity: deletingId === scan.id ? 0.72 : 1,
                        }}
                      >
                        {deletingId === scan.id ? ui.deleting : `🗑️ ${ui.deleteScan}`}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  overflow: "hidden",
  borderRadius: 26,
  background: "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045))",
  border: "1px solid rgba(255,255,255,0.105)",
  boxShadow: "0 18px 46px rgba(0,0,0,0.14)",
};

const pillStyle: React.CSSProperties = {
  minHeight: 30,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(255,255,255,0.06)",
  color: "#cbd5e1",
  fontSize: 12,
  fontWeight: 850,
};

const locationPillStyle: React.CSSProperties = {
  ...pillStyle,
  background: "rgba(37,99,235,0.16)",
  color: "#bfdbfe",
  border: "1px solid rgba(147,197,253,0.18)",
};

const errorStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 18,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const emptyStyle: React.CSSProperties = {
  borderRadius: 24,
  minHeight: 260,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  padding: 24,
  background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
  border: "1px solid rgba(255,255,255,0.08)",
};

const loadingStyle: React.CSSProperties = {
  borderRadius: 24,
  minHeight: 260,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
  border: "1px solid rgba(255,255,255,0.08)",
  fontWeight: 950,
};
