"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import { getBestMediaUrl } from "@/lib/media";
import styles from "../dashboard.module.css";


type QrxWebLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

function normalizeQrxLocale(value: string): QrxWebLocale {
  const normalized = value.trim().toLowerCase().split(/[-_]/)[0];
  return (["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const).includes(normalized as QrxWebLocale)
    ? (normalized as QrxWebLocale)
    : "de";
}

const QRLIST_TEXT = {
  de: {
    navLabel: "QR-X Navigation",
    dashboard: "Dashboard",
    explore: "Explore",
    shareText: "QR-X: {{title}}",
    untitled: "Unbenannter QR-X",
    qrxFallback: "QR-X auf mioseg qr",
    loginRequired: "Bitte melde dich zuerst an, um deine QR-X zu sehen.",
    copyFailed: "Link konnte nicht kopiert werden.",
    deleteConfirm: "Möchtest du diesen QR-X wirklich löschen?\n\n{{title}}\n\nDer QR-X wird aus deinem Konto entfernt.",
    sessionExpired: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
    deleteFailed: "QR-X konnte nicht gelöscht werden.",
    removeSavedConfirm: "Möchtest du diesen gespeicherten QR-X entfernen?\n\n{{title}}",
    loginAgain: "Bitte melde dich erneut an.",
    removeFailed: "QR-X konnte nicht entfernt werden.",
    ownQrx: "Eigene QR-X",
    savedQrx: "Gespeicherte QR-X",
    businessQrx: "Business QR-X",
    normalQrx: "Normale QR-X",
    verified: "Verifiziert",
    createdTitle: "Deine erstellten QR-X",
    savedTitle: "Deine gespeicherten QR-X",
    createdText: "Alle QR-X aus deinem Konto, sortiert nach dem neuesten Eintrag.",
    savedText: "Alle QR-X, denen du folgst. Änderungen werden automatisch mit der App synchronisiert.",
    myQrx: "Meine QR-X",
    heroText: "Verwalte deine eigenen QR-X und gespeicherten QR-X bequem im Browser.",
    create: "QR-X erstellen",
    backDashboard: "Zurück zum Dashboard",
    loading: "Lädt ...",
    count: "{{filtered}} von {{total}} Einträgen",
    search: "QR-X suchen",
    searchPlaceholder: "Titel, Firma, Ort oder Kategorie suchen …",
    clearSearch: "Suche löschen",
    noneOwn: "Noch keine QR-X erstellt",
    noneSaved: "Noch keine QR-X gespeichert",
    noneOwnText: "Sobald du deinen ersten QR-X erstellt hast, erscheint er hier in deiner Web-Verwaltung.",
    noneSavedText: "Sobald du einem QR-X folgst, erscheint er hier automatisch.",
    openExplore: "Explore öffnen",
    noMatch: "Kein passender QR-X gefunden",
    noMatchText: "Prüfe den Suchbegriff oder lösche die Suche.",
    loadingQrx: "QR-X werden geladen …",
    businessBadge: "🏢 Business QR-X",
    normalBadge: "⌗ Normaler QR-X",
    created: "Erstellt",
    views: "QR-X Aufrufe",
    followers: "Follower",
    imageViews: "Bildaufrufe",
    downloads: "Downloads",
    fileOpens: "{{count}} Dateiöffnungen",
    analyticsBuilding: "Analytics werden aufgebaut",
    open: "Öffnen",
    copied: "Kopiert",
    share: "Teilen",
    edit: "Bearbeiten",
    mediaAnalytics: "📷 Medien & Analytics",
    deleting: "Löscht …",
    delete: "🗑️ Löschen",
    removing: "Entfernt …",
    removeSaved: "✕ Aus gespeicherten entfernen",
    catHealth: "Praxis & Gesundheit",
    catFood: "Gastronomie",
    catCompany: "Unternehmen",
    catService: "Dienstleistung",
    catCraft: "Handwerk",
    catEvent: "Event",
    catClub: "Verein",
    catCharity: "Wohltätigkeit",
    catSight: "Sehenswürdigkeit",
    catOther: "Sonstiges",
  },
  en: {
    navLabel: "QR-X navigation",
    dashboard: "Dashboard",
    explore: "Explore",
    shareText: "QR-X: {{title}}",
    untitled: "Untitled QR-X",
    qrxFallback: "QR-X on mioseg qr",
    loginRequired: "Please sign in first to view your QR-X.",
    copyFailed: "The link could not be copied.",
    deleteConfirm: "Do you really want to delete this QR-X?\n\n{{title}}\n\nThe QR-X will be removed from your account.",
    sessionExpired: "Your session has expired. Please sign in again.",
    deleteFailed: "The QR-X could not be deleted.",
    removeSavedConfirm: "Do you want to remove this saved QR-X?\n\n{{title}}",
    loginAgain: "Please sign in again.",
    removeFailed: "The QR-X could not be removed.",
    ownQrx: "My QR-X",
    savedQrx: "Saved QR-X",
    businessQrx: "Business QR-X",
    normalQrx: "Normal QR-X",
    verified: "Verified",
    createdTitle: "Your created QR-X",
    savedTitle: "Your saved QR-X",
    createdText: "All QR-X in your account, sorted by newest first.",
    savedText: "All QR-X you follow. Changes are automatically synced with the app.",
    myQrx: "My QR-X",
    heroText: "Manage your own and saved QR-X conveniently in the browser.",
    create: "Create QR-X",
    backDashboard: "Back to dashboard",
    loading: "Loading ...",
    count: "{{filtered}} of {{total}} entries",
    search: "Search QR-X",
    searchPlaceholder: "Search title, company, location or category …",
    clearSearch: "Clear search",
    noneOwn: "No QR-X created yet",
    noneSaved: "No QR-X saved yet",
    noneOwnText: "Once you create your first QR-X, it will appear here in your web management.",
    noneSavedText: "Once you follow a QR-X, it will appear here automatically.",
    openExplore: "Open Explore",
    noMatch: "No matching QR-X found",
    noMatchText: "Check the search term or clear the search.",
    loadingQrx: "Loading QR-X …",
    businessBadge: "🏢 Business QR-X",
    normalBadge: "⌗ Normal QR-X",
    created: "Created",
    views: "QR-X views",
    followers: "Followers",
    imageViews: "Image views",
    downloads: "Downloads",
    fileOpens: "{{count}} file opens",
    analyticsBuilding: "Analytics are being built",
    open: "Open",
    copied: "Copied",
    share: "Share",
    edit: "Edit",
    mediaAnalytics: "📷 Media & analytics",
    deleting: "Deleting …",
    delete: "🗑️ Delete",
    removing: "Removing …",
    removeSaved: "✕ Remove from saved",
    catHealth: "Health & practice",
    catFood: "Food & dining",
    catCompany: "Company",
    catService: "Services",
    catCraft: "Trades",
    catEvent: "Event",
    catClub: "Club",
    catCharity: "Charity",
    catSight: "Attraction",
    catOther: "Other",
  },
  tr: {
    navLabel: "QR-X navigasyonu",
    dashboard: "Kontrol paneli",
    explore: "Explore",
    shareText: "QR-X: {{title}}",
    untitled: "Adsız QR-X",
    qrxFallback: "mioseg qr üzerinde QR-X",
    loginRequired: "QR-X'lerini görmek için önce giriş yap.",
    copyFailed: "Bağlantı kopyalanamadı.",
    deleteConfirm: "Bu QR-X'i gerçekten silmek istiyor musun?\n\n{{title}}\n\nQR-X hesabından kaldırılacak.",
    sessionExpired: "Oturumunun süresi doldu. Lütfen tekrar giriş yap.",
    deleteFailed: "QR-X silinemedi.",
    removeSavedConfirm: "Bu kayıtlı QR-X'i kaldırmak istiyor musun?\n\n{{title}}",
    loginAgain: "Lütfen tekrar giriş yap.",
    removeFailed: "QR-X kaldırılamadı.",
    ownQrx: "QR-X'lerim",
    savedQrx: "Kayıtlı QR-X'ler",
    businessQrx: "Business QR-X",
    normalQrx: "Normal QR-X",
    verified: "Doğrulandı",
    createdTitle: "Oluşturduğun QR-X'ler",
    savedTitle: "Kaydettiğin QR-X'ler",
    createdText: "Hesabındaki tüm QR-X'ler, en yeniler önce.",
    savedText: "Takip ettiğin tüm QR-X'ler. Değişiklikler uygulamayla otomatik senkronize edilir.",
    myQrx: "QR-X'lerim",
    heroText: "Kendi ve kayıtlı QR-X'lerini tarayıcıdan kolayca yönet.",
    create: "QR-X oluştur",
    backDashboard: "Kontrol paneline dön",
    loading: "Yükleniyor ...",
    count: "{{total}} kayıttan {{filtered}} tanesi",
    search: "QR-X ara",
    searchPlaceholder: "Başlık, firma, konum veya kategori ara …",
    clearSearch: "Aramayı temizle",
    noneOwn: "Henüz QR-X oluşturulmadı",
    noneSaved: "Henüz QR-X kaydedilmedi",
    noneOwnText: "İlk QR-X'ini oluşturduğunda burada görünecek.",
    noneSavedText: "Bir QR-X'i takip ettiğinde burada otomatik görünecek.",
    openExplore: "Explore'u aç",
    noMatch: "Eşleşen QR-X bulunamadı",
    noMatchText: "Arama terimini kontrol et veya aramayı temizle.",
    loadingQrx: "QR-X yükleniyor …",
    businessBadge: "🏢 Business QR-X",
    normalBadge: "⌗ Normal QR-X",
    created: "Oluşturuldu",
    views: "QR-X görüntüleme",
    followers: "Takipçiler",
    imageViews: "Görsel görüntüleme",
    downloads: "İndirmeler",
    fileOpens: "{{count}} dosya açma",
    analyticsBuilding: "Analitik hazırlanıyor",
    open: "Aç",
    copied: "Kopyalandı",
    share: "Paylaş",
    edit: "Düzenle",
    mediaAnalytics: "📷 Medya ve analitik",
    deleting: "Siliniyor …",
    delete: "🗑️ Sil",
    removing: "Kaldırılıyor …",
    removeSaved: "✕ Kayıtlardan kaldır",
    catHealth: "Sağlık & muayenehane",
    catFood: "Yeme & içme",
    catCompany: "Şirket",
    catService: "Hizmetler",
    catCraft: "Zanaat",
    catEvent: "Etkinlik",
    catClub: "Dernek",
    catCharity: "Yardım kuruluşu",
    catSight: "Gezilecek yer",
    catOther: "Diğer",
  },
  pl: {
    navLabel: "Nawigacja QR-X",
    dashboard: "Panel",
    explore: "Explore",
    shareText: "QR-X: {{title}}",
    untitled: "QR-X bez nazwy",
    qrxFallback: "QR-X w mioseg qr",
    loginRequired: "Najpierw się zaloguj, aby zobaczyć swoje QR-X.",
    copyFailed: "Nie udało się skopiować linku.",
    deleteConfirm: "Czy na pewno chcesz usunąć ten QR-X?\n\n{{title}}\n\nQR-X zostanie usunięty z Twojego konta.",
    sessionExpired: "Sesja wygasła. Zaloguj się ponownie.",
    deleteFailed: "Nie udało się usunąć QR-X.",
    removeSavedConfirm: "Czy chcesz usunąć ten zapisany QR-X?\n\n{{title}}",
    loginAgain: "Zaloguj się ponownie.",
    removeFailed: "Nie udało się usunąć QR-X.",
    ownQrx: "Moje QR-X",
    savedQrx: "Zapisane QR-X",
    businessQrx: "Business QR-X",
    normalQrx: "Zwykłe QR-X",
    verified: "Zweryfikowane",
    createdTitle: "Utworzone QR-X",
    savedTitle: "Zapisane QR-X",
    createdText: "Wszystkie QR-X na Twoim koncie, od najnowszych.",
    savedText: "Wszystkie obserwowane QR-X. Zmiany są automatycznie synchronizowane z aplikacją.",
    myQrx: "Moje QR-X",
    heroText: "Zarządzaj własnymi i zapisanymi QR-X wygodnie w przeglądarce.",
    create: "Utwórz QR-X",
    backDashboard: "Wróć do panelu",
    loading: "Ładowanie ...",
    count: "{{filtered}} z {{total}} wpisów",
    search: "Szukaj QR-X",
    searchPlaceholder: "Szukaj tytułu, firmy, miejsca lub kategorii …",
    clearSearch: "Wyczyść wyszukiwanie",
    noneOwn: "Nie utworzono jeszcze QR-X",
    noneSaved: "Nie zapisano jeszcze QR-X",
    noneOwnText: "Po utworzeniu pierwszego QR-X pojawi się on tutaj.",
    noneSavedText: "Gdy zaczniesz obserwować QR-X, pojawi się tutaj automatycznie.",
    openExplore: "Otwórz Explore",
    noMatch: "Nie znaleziono pasującego QR-X",
    noMatchText: "Sprawdź wyszukiwane hasło lub wyczyść wyszukiwanie.",
    loadingQrx: "Ładowanie QR-X …",
    businessBadge: "🏢 Business QR-X",
    normalBadge: "⌗ Zwykły QR-X",
    created: "Utworzono",
    views: "Wyświetlenia QR-X",
    followers: "Obserwujący",
    imageViews: "Wyświetlenia obrazów",
    downloads: "Pobrania",
    fileOpens: "{{count}} otwarć plików",
    analyticsBuilding: "Analityka jest przygotowywana",
    open: "Otwórz",
    copied: "Skopiowano",
    share: "Udostępnij",
    edit: "Edytuj",
    mediaAnalytics: "📷 Media i analityka",
    deleting: "Usuwanie …",
    delete: "🗑️ Usuń",
    removing: "Usuwanie …",
    removeSaved: "✕ Usuń z zapisanych",
    catHealth: "Zdrowie i praktyka",
    catFood: "Gastronomia",
    catCompany: "Firma",
    catService: "Usługi",
    catCraft: "Rzemiosło",
    catEvent: "Wydarzenie",
    catClub: "Klub",
    catCharity: "Organizacja charytatywna",
    catSight: "Atrakcja",
    catOther: "Inne",
  },
  ar: {
    navLabel: "تنقل QR-X",
    dashboard: "لوحة التحكم",
    explore: "Explore",
    shareText: "QR-X: {{title}}",
    untitled: "QR-X بلا عنوان",
    qrxFallback: "QR-X على mioseg qr",
    loginRequired: "يرجى تسجيل الدخول أولًا لعرض QR-X الخاصة بك.",
    copyFailed: "تعذر نسخ الرابط.",
    deleteConfirm: "هل تريد حقًا حذف QR-X هذا؟\n\n{{title}}\n\nستتم إزالته من حسابك.",
    sessionExpired: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    deleteFailed: "تعذر حذف QR-X.",
    removeSavedConfirm: "هل تريد إزالة QR-X المحفوظ هذا؟\n\n{{title}}",
    loginAgain: "يرجى تسجيل الدخول مرة أخرى.",
    removeFailed: "تعذر إزالة QR-X.",
    ownQrx: "QR-X الخاصة بي",
    savedQrx: "QR-X المحفوظة",
    businessQrx: "Business QR-X",
    normalQrx: "QR-X عادية",
    verified: "موثّق",
    createdTitle: "QR-X التي أنشأتها",
    savedTitle: "QR-X المحفوظة لديك",
    createdText: "كل QR-X في حسابك مرتبة من الأحدث.",
    savedText: "كل QR-X التي تتابعها. تتم مزامنة التغييرات تلقائيًا مع التطبيق.",
    myQrx: "QR-X الخاصة بي",
    heroText: "أدر QR-X الخاصة بك والمحفوظة بسهولة من المتصفح.",
    create: "إنشاء QR-X",
    backDashboard: "العودة إلى لوحة التحكم",
    loading: "جارٍ التحميل ...",
    count: "{{filtered}} من {{total}} عناصر",
    search: "بحث QR-X",
    searchPlaceholder: "ابحث بالعنوان أو الشركة أو الموقع أو الفئة …",
    clearSearch: "مسح البحث",
    noneOwn: "لم يتم إنشاء QR-X بعد",
    noneSaved: "لا توجد QR-X محفوظة بعد",
    noneOwnText: "عند إنشاء أول QR-X سيظهر هنا.",
    noneSavedText: "عند متابعة QR-X سيظهر هنا تلقائيًا.",
    openExplore: "فتح Explore",
    noMatch: "لم يتم العثور على QR-X مطابق",
    noMatchText: "تحقق من عبارة البحث أو امسح البحث.",
    loadingQrx: "جارٍ تحميل QR-X …",
    businessBadge: "🏢 Business QR-X",
    normalBadge: "⌗ QR-X عادية",
    created: "تم الإنشاء",
    views: "مشاهدات QR-X",
    followers: "المتابعون",
    imageViews: "مشاهدات الصور",
    downloads: "التنزيلات",
    fileOpens: "{{count}} فتح ملف",
    analyticsBuilding: "جارٍ إعداد التحليلات",
    open: "فتح",
    copied: "تم النسخ",
    share: "مشاركة",
    edit: "تعديل",
    mediaAnalytics: "📷 الوسائط والتحليلات",
    deleting: "جارٍ الحذف …",
    delete: "🗑️ حذف",
    removing: "جارٍ الإزالة …",
    removeSaved: "✕ إزالة من المحفوظات",
    catHealth: "الصحة والعيادات",
    catFood: "المطاعم",
    catCompany: "شركة",
    catService: "خدمات",
    catCraft: "حِرف",
    catEvent: "فعالية",
    catClub: "نادي",
    catCharity: "خيري",
    catSight: "معلم سياحي",
    catOther: "أخرى",
  },
  fr: {
    navLabel: "Navigation QR-X",
    dashboard: "Tableau de bord",
    explore: "Explore",
    shareText: "QR-X : {{title}}",
    untitled: "QR-X sans titre",
    qrxFallback: "QR-X sur mioseg qr",
    loginRequired: "Connectez-vous pour voir vos QR-X.",
    copyFailed: "Le lien n’a pas pu être copié.",
    deleteConfirm: "Voulez-vous vraiment supprimer ce QR-X ?\n\n{{title}}\n\nLe QR-X sera supprimé de votre compte.",
    sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
    deleteFailed: "Le QR-X n’a pas pu être supprimé.",
    removeSavedConfirm: "Voulez-vous retirer ce QR-X enregistré ?\n\n{{title}}",
    loginAgain: "Veuillez vous reconnecter.",
    removeFailed: "Le QR-X n’a pas pu être retiré.",
    ownQrx: "Mes QR-X",
    savedQrx: "QR-X enregistrés",
    businessQrx: "Business QR-X",
    normalQrx: "QR-X normaux",
    verified: "Vérifié",
    createdTitle: "Vos QR-X créés",
    savedTitle: "Vos QR-X enregistrés",
    createdText: "Tous les QR-X de votre compte, du plus récent au plus ancien.",
    savedText: "Tous les QR-X que vous suivez. Les modifications sont automatiquement synchronisées avec l’application.",
    myQrx: "Mes QR-X",
    heroText: "Gérez facilement vos QR-X et ceux enregistrés dans le navigateur.",
    create: "Créer un QR-X",
    backDashboard: "Retour au tableau de bord",
    loading: "Chargement ...",
    count: "{{filtered}} sur {{total}} éléments",
    search: "Rechercher un QR-X",
    searchPlaceholder: "Rechercher par titre, entreprise, lieu ou catégorie …",
    clearSearch: "Effacer la recherche",
    noneOwn: "Aucun QR-X créé",
    noneSaved: "Aucun QR-X enregistré",
    noneOwnText: "Après avoir créé votre premier QR-X, il apparaîtra ici.",
    noneSavedText: "Lorsque vous suivez un QR-X, il apparaît automatiquement ici.",
    openExplore: "Ouvrir Explore",
    noMatch: "Aucun QR-X correspondant",
    noMatchText: "Vérifiez le terme recherché ou effacez la recherche.",
    loadingQrx: "Chargement des QR-X …",
    businessBadge: "🏢 Business QR-X",
    normalBadge: "⌗ QR-X normal",
    created: "Créé",
    views: "Vues QR-X",
    followers: "Abonnés",
    imageViews: "Vues des images",
    downloads: "Téléchargements",
    fileOpens: "{{count}} ouvertures de fichiers",
    analyticsBuilding: "Les statistiques sont en cours de préparation",
    open: "Ouvrir",
    copied: "Copié",
    share: "Partager",
    edit: "Modifier",
    mediaAnalytics: "📷 Médias et statistiques",
    deleting: "Suppression …",
    delete: "🗑️ Supprimer",
    removing: "Retrait …",
    removeSaved: "✕ Retirer des enregistrés",
    catHealth: "Santé & cabinet",
    catFood: "Restauration",
    catCompany: "Entreprise",
    catService: "Services",
    catCraft: "Artisanat",
    catEvent: "Événement",
    catClub: "Association",
    catCharity: "Caritatif",
    catSight: "Attraction",
    catOther: "Autre",
  },
  es: {
    navLabel: "Navegación QR-X",
    dashboard: "Panel",
    explore: "Explore",
    shareText: "QR-X: {{title}}",
    untitled: "QR-X sin título",
    qrxFallback: "QR-X en mioseg qr",
    loginRequired: "Inicia sesión para ver tus QR-X.",
    copyFailed: "No se pudo copiar el enlace.",
    deleteConfirm: "¿Quieres eliminar realmente este QR-X?\n\n{{title}}\n\nEl QR-X se eliminará de tu cuenta.",
    sessionExpired: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    deleteFailed: "No se pudo eliminar el QR-X.",
    removeSavedConfirm: "¿Quieres quitar este QR-X guardado?\n\n{{title}}",
    loginAgain: "Vuelve a iniciar sesión.",
    removeFailed: "No se pudo quitar el QR-X.",
    ownQrx: "Mis QR-X",
    savedQrx: "QR-X guardados",
    businessQrx: "Business QR-X",
    normalQrx: "QR-X normales",
    verified: "Verificado",
    createdTitle: "Tus QR-X creados",
    savedTitle: "Tus QR-X guardados",
    createdText: "Todos los QR-X de tu cuenta, ordenados del más reciente.",
    savedText: "Todos los QR-X que sigues. Los cambios se sincronizan automáticamente con la app.",
    myQrx: "Mis QR-X",
    heroText: "Gestiona tus QR-X propios y guardados cómodamente en el navegador.",
    create: "Crear QR-X",
    backDashboard: "Volver al panel",
    loading: "Cargando ...",
    count: "{{filtered}} de {{total}} elementos",
    search: "Buscar QR-X",
    searchPlaceholder: "Buscar por título, empresa, lugar o categoría …",
    clearSearch: "Borrar búsqueda",
    noneOwn: "Aún no hay QR-X creados",
    noneSaved: "Aún no hay QR-X guardados",
    noneOwnText: "Cuando crees tu primer QR-X aparecerá aquí.",
    noneSavedText: "Cuando sigas un QR-X aparecerá aquí automáticamente.",
    openExplore: "Abrir Explore",
    noMatch: "No se encontró ningún QR-X",
    noMatchText: "Comprueba el término o borra la búsqueda.",
    loadingQrx: "Cargando QR-X …",
    businessBadge: "🏢 Business QR-X",
    normalBadge: "⌗ QR-X normal",
    created: "Creado",
    views: "Vistas de QR-X",
    followers: "Seguidores",
    imageViews: "Vistas de imágenes",
    downloads: "Descargas",
    fileOpens: "{{count}} aperturas de archivos",
    analyticsBuilding: "Preparando analíticas",
    open: "Abrir",
    copied: "Copiado",
    share: "Compartir",
    edit: "Editar",
    mediaAnalytics: "📷 Medios y analíticas",
    deleting: "Eliminando …",
    delete: "🗑️ Eliminar",
    removing: "Quitando …",
    removeSaved: "✕ Quitar de guardados",
    catHealth: "Salud y consulta",
    catFood: "Gastronomía",
    catCompany: "Empresa",
    catService: "Servicios",
    catCraft: "Oficios",
    catEvent: "Evento",
    catClub: "Club",
    catCharity: "Beneficencia",
    catSight: "Atracción",
    catOther: "Otros",
  },
  it: {
    navLabel: "Navigazione QR-X",
    dashboard: "Dashboard",
    explore: "Explore",
    shareText: "QR-X: {{title}}",
    untitled: "QR-X senza titolo",
    qrxFallback: "QR-X su mioseg qr",
    loginRequired: "Accedi per vedere i tuoi QR-X.",
    copyFailed: "Impossibile copiare il link.",
    deleteConfirm: "Vuoi davvero eliminare questo QR-X?\n\n{{title}}\n\nIl QR-X verrà rimosso dal tuo account.",
    sessionExpired: "La sessione è scaduta. Accedi di nuovo.",
    deleteFailed: "Impossibile eliminare il QR-X.",
    removeSavedConfirm: "Vuoi rimuovere questo QR-X salvato?\n\n{{title}}",
    loginAgain: "Accedi di nuovo.",
    removeFailed: "Impossibile rimuovere il QR-X.",
    ownQrx: "I miei QR-X",
    savedQrx: "QR-X salvati",
    businessQrx: "Business QR-X",
    normalQrx: "QR-X normali",
    verified: "Verificato",
    createdTitle: "I tuoi QR-X creati",
    savedTitle: "I tuoi QR-X salvati",
    createdText: "Tutti i QR-X del tuo account, ordinati dal più recente.",
    savedText: "Tutti i QR-X che segui. Le modifiche vengono sincronizzate automaticamente con l’app.",
    myQrx: "I miei QR-X",
    heroText: "Gestisci comodamente dal browser i tuoi QR-X e quelli salvati.",
    create: "Crea QR-X",
    backDashboard: "Torna alla dashboard",
    loading: "Caricamento ...",
    count: "{{filtered}} di {{total}} elementi",
    search: "Cerca QR-X",
    searchPlaceholder: "Cerca titolo, azienda, luogo o categoria …",
    clearSearch: "Cancella ricerca",
    noneOwn: "Nessun QR-X creato",
    noneSaved: "Nessun QR-X salvato",
    noneOwnText: "Quando crei il tuo primo QR-X apparirà qui.",
    noneSavedText: "Quando segui un QR-X apparirà automaticamente qui.",
    openExplore: "Apri Explore",
    noMatch: "Nessun QR-X corrispondente",
    noMatchText: "Controlla il termine di ricerca o cancella la ricerca.",
    loadingQrx: "Caricamento QR-X …",
    businessBadge: "🏢 Business QR-X",
    normalBadge: "⌗ QR-X normale",
    created: "Creato",
    views: "Visualizzazioni QR-X",
    followers: "Follower",
    imageViews: "Visualizzazioni immagini",
    downloads: "Download",
    fileOpens: "{{count}} aperture file",
    analyticsBuilding: "Preparazione analytics",
    open: "Apri",
    copied: "Copiato",
    share: "Condividi",
    edit: "Modifica",
    mediaAnalytics: "📷 Media e analytics",
    deleting: "Eliminazione …",
    delete: "🗑️ Elimina",
    removing: "Rimozione …",
    removeSaved: "✕ Rimuovi dai salvati",
    catHealth: "Salute e studio",
    catFood: "Ristorazione",
    catCompany: "Azienda",
    catService: "Servizi",
    catCraft: "Artigianato",
    catEvent: "Evento",
    catClub: "Associazione",
    catCharity: "Beneficenza",
    catSight: "Attrazione",
    catOther: "Altro",
  },
} as const;

type BusinessCategory =
  | "praxis_gesundheit"
  | "gastronomie"
  | "unternehmen"
  | "dienstleistung"
  | "handwerk"
  | "event"
  | "verein"
  | "wohltaetigkeit"
  | "sehenswuerdigkeit"
  | "sonstiges";

type QrxTab = "own" | "saved";

const BUSINESS_CATEGORY_OPTIONS: Array<{
  value: BusinessCategory;
  label: string;
}> = [
  { value: "praxis_gesundheit", label: "Praxis & Gesundheit" },
  { value: "gastronomie", label: "Gastronomie" },
  { value: "unternehmen", label: "Unternehmen" },
  { value: "dienstleistung", label: "Dienstleistung" },
  { value: "handwerk", label: "Handwerk" },
  { value: "event", label: "Event" },
  { value: "verein", label: "Verein" },
  { value: "wohltaetigkeit", label: "Wohltätigkeit" },
  { value: "sehenswuerdigkeit", label: "Sehenswürdigkeit" },
  { value: "sonstiges", label: "Sonstiges" },
];

function getBusinessCategoryLabel(value: string | null | undefined, ui: (typeof QRLIST_TEXT)[QrxWebLocale]) {
  if (!value) return null;
  return (
    ({
      praxis_gesundheit: ui.catHealth, gastronomie: ui.catFood, unternehmen: ui.catCompany,
      dienstleistung: ui.catService, handwerk: ui.catCraft, event: ui.catEvent, verein: ui.catClub,
      wohltaetigkeit: ui.catCharity, sehenswuerdigkeit: ui.catSight, sonstiges: ui.catOther,
    } as Record<string, string>)[value] ?? value
  );
}

type QrxMedia = {
  id: string;
  url: string | null;
  original_url?: string | null;
  large_url?: string | null;
  medium_url?: string | null;
  thumb_url?: string | null;
};

type QrxEntry = {
  id: string;
  title: string | null;
  company_name: string | null;
  description: string | null;
  type: "normal" | "business" | null;
  category: BusinessCategory | null;
  verified: boolean | null;
  cover_image_url: string | null;
  cover_media_id?: string | null;
  cover_media?: QrxMedia | QrxMedia[] | null;
  logo_url: string | null;
  logo_media_id?: string | null;
  logo_media?: QrxMedia | QrxMedia[] | null;
  location_name: string | null;
  views_total: number | null;
  follower_count: number | null;
  created_at: string | null;
  deleted_at?: string | null;
};

type SavedQrxRow = {
  qrx_id: string | null;
  qr_x_entries: QrxEntry | null;
};

type QrxMediaAnalyticsSummary = {
  qrx_id: string;
  image_views_total: number | string | null;
  file_opens_total: number | string | null;
  file_downloads_total: number | string | null;
};

function getLocaleFromParams(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim())
    return value[0];
  return "de";
}

function getQrxTitle(entry: QrxEntry, fallback = "Unbenannter QR-X") {
  return (
    entry.company_name?.trim() || entry.title?.trim() || fallback
  );
}

function getQrxText(entry: QrxEntry, fallback = "QR-X auf mioseg qr") {
  return (
    entry.description?.trim() ||
    entry.location_name?.trim() ||
    "QR-X auf mioseg qr"
  );
}

function getQrxCardImage(entry: QrxEntry) {
  const cover = getBestMediaUrl(entry.cover_media, "card");
  if (cover) return cover;
  if (entry.cover_image_url?.trim()) return entry.cover_image_url.trim();
  const logo = getBestMediaUrl(entry.logo_media, "card");
  if (logo) return logo;
  return entry.logo_url?.trim() || null;
}

function formatNumber(value: number | null | undefined) {
  const n = Math.max(0, Number(value ?? 0));
  if (n >= 1000000)
    return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(".", ",")} Mio.`;
  if (n >= 1000)
    return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")} Tsd.`;
  return String(n);
}

function formatDate(value: string | null, locale: QrxWebLocale = "de") {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function DashboardQrxPage() {
  const params = useParams();
  const locale = getLocaleFromParams(params?.locale);
  const qrxLocale = normalizeQrxLocale(locale);
  const ui = QRLIST_TEXT[qrxLocale];

  const [activeTab, setActiveTab] = useState<QrxTab>("own");
  const [searchQuery, setSearchQuery] = useState("");
  const [ownItems, setOwnItems] = useState<QrxEntry[]>([]);
  const [savedItems, setSavedItems] = useState<QrxEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mediaAnalyticsByQrxId, setMediaAnalyticsByQrxId] = useState<
    Record<string, QrxMediaAnalyticsSummary>
  >({});

  useEffect(() => {
    void loadQrx();
  }, []);

  async function loadMediaAnalyticsForOwnQrx(items: QrxEntry[]) {
    if (items.length === 0) {
      setMediaAnalyticsByQrxId({});
      return;
    }

    const results = await Promise.all(
      items.map(async (item) => {
        const { data, error } = await supabase.rpc(
          "get_qrx_media_analytics_summary",
          {
            p_qrx_id: item.id,
          },
        );

        if (error) {
          console.warn(
            `Media Analytics konnten für QR-X ${item.id} nicht geladen werden:`,
            error,
          );
          return null;
        }

        const rows = (data ?? []) as QrxMediaAnalyticsSummary[];
        const summary = rows[0];

        return summary ? ([item.id, summary] as const) : null;
      }),
    );

    const nextMap: Record<string, QrxMediaAnalyticsSummary> = {};

    for (const result of results) {
      if (!result) continue;
      nextMap[result[0]] = result[1];
    }

    setMediaAnalyticsByQrxId(nextMap);
  }

  async function loadQrx() {
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
      setOwnItems([]);
      setSavedItems([]);
      setErrorText(ui.loginRequired);
      setLoading(false);
      return;
    }

    const [ownRes, savedRes] = await Promise.all([
      supabase
        .from("qr_x_entries")
        .select(
          "id,title,company_name,description,type,category,verified,cover_image_url,cover_media_id,cover_media:cover_media_id(id,url,original_url,large_url,medium_url,thumb_url),logo_url,logo_media_id,logo_media:logo_media_id(id,url,original_url,large_url,medium_url,thumb_url),location_name,views_total,follower_count,created_at,deleted_at",
        )
        .eq("owner_user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .returns<QrxEntry[]>(),

      supabase
        .from("qrx_saves")
        .select(
          `
          qrx_id,
          qr_x_entries (
            id,title,company_name,description,type,category,verified,
            cover_image_url,cover_media_id,cover_media:cover_media_id(id,url,original_url,large_url,medium_url,thumb_url),
            logo_url,logo_media_id,logo_media:logo_media_id(id,url,original_url,large_url,medium_url,thumb_url),location_name,views_total,
            follower_count,created_at,deleted_at
          )
        `,
        )
        .eq("user_id", user.id)
        .is("qr_x_entries.deleted_at", null)
        .returns<SavedQrxRow[]>(),
    ]);

    if (ownRes.error) {
      setErrorText(ownRes.error.message);
      setOwnItems([]);
      setMediaAnalyticsByQrxId({});
    } else {
      const ownData = ownRes.data ?? [];
      setOwnItems(ownData);
      await loadMediaAnalyticsForOwnQrx(ownData);
    }

    if (savedRes.error) {
      setErrorText(savedRes.error.message);
      setSavedItems([]);
    } else {
      const mapped = (savedRes.data ?? [])
        .map((row) => row.qr_x_entries)
        .filter((entry): entry is QrxEntry => Boolean(entry))
        .filter((entry) => !entry.deleted_at)
        .filter(
          (entry) =>
            entry.id && !(ownRes.data ?? []).some((own) => own.id === entry.id),
        );

      setSavedItems(mapped);
    }

    setLoading(false);
  }

  async function handleShare(entry: QrxEntry) {
    const url = `${window.location.origin}/qrx/${entry.id}`;
    const title = getQrxTitle(entry, ui.untitled);

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: ui.shareText.replace("{{title}}", title),
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(entry.id);
        window.setTimeout(() => setCopiedId(null), 1800);
      } catch {
        alert(ui.copyFailed);
      }
    }
  }

  async function handleDeleteOwn(entry: QrxEntry) {
    const title = getQrxTitle(entry, ui.untitled);

    const confirmed = window.confirm(
      ui.deleteConfirm.replace("{{title}}", title),
    );

    if (!confirmed) return;

    setDeletingId(entry.id);
    setErrorText(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const token = session?.access_token;
      if (!token) {
        throw new Error(
          ui.sessionExpired,
        );
      }

      const { data, error } = await supabase.functions.invoke("delete-qrx", {
        body: {
          qrxId: entry.id,
          reason: "Vom Ersteller im Web-Dashboard gelöscht",
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;

      const response = (data ?? {}) as {
        success?: boolean;
        error?: string;
        step?: string;
      };
      if (response.error || response.success === false) {
        throw new Error(response.error || ui.deleteFailed);
      }

      setOwnItems((current) => current.filter((item) => item.id !== entry.id));
      setSavedItems((current) =>
        current.filter((item) => item.id !== entry.id),
      );
    } catch (error) {
      console.error("QR-X DELETE ERROR", error);
      const message =
        error instanceof Error
          ? error.message
          : ui.deleteFailed;
      setErrorText(message);
      alert(message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRemoveSaved(entry: QrxEntry) {
    const confirmed = window.confirm(
      ui.removeSavedConfirm.replace("{{title}}", getQrxTitle(entry, ui.untitled)),
    );

    if (!confirmed) return;

    setDeletingId(entry.id);
    setErrorText(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error(ui.loginAgain);

      const { error } = await supabase
        .from("qrx_saves")
        .delete()
        .eq("user_id", user.id)
        .eq("qrx_id", entry.id);

      if (error) throw error;

      setSavedItems((current) =>
        current.filter((item) => item.id !== entry.id),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : ui.removeFailed;
      setErrorText(message);
      alert(message);
    } finally {
      setDeletingId(null);
    }
  }

  const items = activeTab === "own" ? ownItems : savedItems;

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const categoryLabel = getBusinessCategoryLabel(item.category, ui) ?? "";
      const searchableText = [
        item.title ?? "",
        item.company_name ?? "",
        item.description ?? "",
        item.location_name ?? "",
        categoryLabel,
        item.type === "business" ? "business" : "normal",
        item.verified ? "verifiziert" : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [items, searchQuery]);

  const stats = useMemo(() => {
    const business = items.filter((item) => item.type === "business").length;
    const normal = items.length - business;
    const verified = items.filter((item) => item.verified).length;

    return [
      {
        label: activeTab === "own" ? ui.ownQrx : ui.savedQrx,
        value: items.length,
        icon: "▣",
      },
      { label: ui.businessQrx, value: business, icon: "🏢" },
      { label: ui.normalQrx, value: normal, icon: "⌗" },
      { label: ui.verified, value: verified, icon: "✓" },
    ];
  }, [items, activeTab]);

  const sectionTitle =
    activeTab === "own" ? ui.createdTitle : ui.savedTitle;
  const sectionText =
    activeTab === "own" ? ui.createdText : ui.savedText;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label={ui.navLabel}>
          <Link href={`/${locale}/dashboard`}>{ui.dashboard}</Link>
          <Link href={`/${locale}/explore`}>{ui.explore}</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>{ui.myQrx}</span>
          <h1>{ui.myQrx}</h1>
          <p>
            {ui.heroText}
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link
            href={`/${locale}/dashboard/qrx/new`}
            className={styles.primaryButton}
          >
            + {ui.create}
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className={styles.secondaryButton}
          >
            {ui.backDashboard}
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto 18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab("own");
            setSearchQuery("");
          }}
          style={tabButtonStyle(activeTab === "own")}
        >
          {ui.ownQrx}
          <span style={tabBadgeStyle}>{ownItems.length}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("saved");
            setSearchQuery("");
          }}
          style={tabButtonStyle(activeTab === "saved")}
        >
          {ui.savedQrx}
          <span style={tabBadgeStyle}>{savedItems.length}</span>
        </button>
      </section>

      <section className={styles.statsGrid} aria-label={ui.myQrx}>
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
            <h2>{sectionTitle}</h2>
            <p>{sectionText}</p>
          </div>
          <span>
            {loading
              ? ui.loading
              : ui.count.replace("{{filtered}}", String(filteredItems.length)).replace("{{total}}", String(items.length))}
          </span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="qrx-search"
            style={{
              display: "block",
              marginBottom: 8,
              color: "#cbd5e1",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {ui.search}
          </label>
          <div style={{ position: "relative" }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: 16,
              }}
            >
              🔎
            </span>
            <input
              id="qrx-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={ui.searchPlaceholder}
              style={{
                width: "100%",
                minHeight: 48,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.045)",
                color: "#ffffff",
                padding: "0 46px 0 44px",
                outline: "none",
                fontSize: 14,
                fontWeight: 750,
                boxSizing: "border-box",
              }}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={ui.clearSearch}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  border: 0,
                  background: "rgba(255,255,255,0.07)",
                  color: "#cbd5e1",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        {errorText ? (
          <div
            style={{
              borderRadius: 22,
              padding: 18,
              background: "rgba(239, 68, 68, 0.14)",
              border: "1px solid rgba(252, 165, 165, 0.22)",
              color: "#fecaca",
              fontWeight: 850,
              lineHeight: 1.55,
              marginBottom: 14,
            }}
          >
            {errorText}
          </div>
        ) : null}

        {!loading && !errorText && items.length === 0 ? (
          <div
            style={{
              borderRadius: 24,
              minHeight: 260,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: 24,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div>
              <div style={{ fontSize: 44, marginBottom: 12 }}>▣</div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 24 }}>
                {activeTab === "own"
                  ? ui.noneOwn
                  : ui.noneSaved}
              </h3>
              <p
                style={{
                  margin: "0 auto 18px",
                  color: "#94a3b8",
                  maxWidth: 520,
                  lineHeight: 1.6,
                }}
              >
                {activeTab === "own"
                  ? ui.noneOwnText
                  : ui.noneSavedText}
              </p>
              {activeTab === "own" ? (
                <Link
                  href={`/${locale}/dashboard/qrx/new`}
                  className={styles.primaryButton}
                >
                  + {ui.create}
                </Link>
              ) : (
                <Link
                  href={`/${locale}/explore`}
                  className={styles.primaryButton}
                >
                  {ui.openExplore}
                </Link>
              )}
            </div>
          </div>
        ) : null}

        {!loading &&
        !errorText &&
        items.length > 0 &&
        filteredItems.length === 0 ? (
          <div
            style={{
              borderRadius: 24,
              minHeight: 220,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: 24,
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.075)",
            }}
          >
            <div>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔎</div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 22 }}>
                {ui.noMatch}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.6 }}>
                {ui.noMatchText}
              </p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div
            style={{
              borderRadius: 24,
              minHeight: 260,
              display: "grid",
              placeItems: "center",
              color: "#cbd5e1",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
              border: "1px solid rgba(255,255,255,0.08)",
              fontWeight: 950,
            }}
          >
            {ui.loadingQrx}
          </div>
        ) : null}

        {!loading && filteredItems.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {filteredItems.map((entry) => {
              const title = getQrxTitle(entry, ui.untitled);
              const image = getQrxCardImage(entry);
              const isBusiness = entry.type === "business";
              const categoryLabel = getBusinessCategoryLabel(entry.category, ui);
              const openHref = `/qrx/${entry.id}`;
              const editHref = `/${locale}/dashboard/qrx/${entry.id}/edit`;
              const mediaHref = `/${locale}/dashboard/qrx/${entry.id}/media`;
              const mediaAnalytics = mediaAnalyticsByQrxId[entry.id];

              return (
                <article
                  key={entry.id}
                  style={{
                    overflow: "hidden",
                    borderRadius: 26,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045))",
                    border: "1px solid rgba(255,255,255,0.105)",
                    boxShadow: "0 18px 46px rgba(0,0,0,0.14)",
                  }}
                >
                  <div
                    style={{
                      height: 174,
                      position: "relative",
                      background:
                        "radial-gradient(circle at 30% 20%, #ffffff 0%, #edf4fb 45%, #dce7f3 100%)",
                      overflow: "hidden",
                    }}
                  >
                    {image ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={image}
                        alt={title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 46,
                          color: "#0d1726",
                          fontWeight: 950,
                        }}
                      >
                        ▣
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: image
                          ? "linear-gradient(180deg, rgba(6,12,21,0.06) 0%, rgba(6,12,21,0.62) 100%)"
                          : "transparent",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                        right: 12,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          minHeight: 32,
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 999,
                          padding: "0 10px",
                          background: isBusiness ? "#fff7ed" : "#ecfdf3",
                          color: isBusiness ? "#9a4f00" : "#166534",
                          fontSize: 12,
                          fontWeight: 950,
                          border: isBusiness
                            ? "1px solid #fed7aa"
                            : "1px solid #bbf7d0",
                        }}
                      >
                        {isBusiness ? ui.businessBadge : ui.normalBadge}
                      </span>

                      {entry.verified ? (
                        <span
                          style={{
                            minHeight: 32,
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: 999,
                            padding: "0 10px",
                            background: "rgba(13,23,38,0.86)",
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: 950,
                            border: "1px solid rgba(255,255,255,0.18)",
                          }}
                        >
                          ✓ {ui.verified}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ padding: 16 }}>
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
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {getQrxText(entry, ui.qrxFallback)}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 14,
                      }}
                    >
                      {entry.location_name?.trim() ? (
                        <span
                          style={{
                            minHeight: 30,
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: 999,
                            padding: "0 10px",
                            background: "rgba(255,255,255,0.06)",
                            color: "#cbd5e1",
                            fontSize: 12,
                            fontWeight: 850,
                          }}
                        >
                          📍 {entry.location_name.trim()}
                        </span>
                      ) : null}

                      {isBusiness && categoryLabel ? (
                        <span
                          style={{
                            minHeight: 30,
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: 999,
                            padding: "0 10px",
                            background: "rgba(251,146,60,0.14)",
                            color: "#fed7aa",
                            fontSize: 12,
                            fontWeight: 900,
                            border: "1px solid rgba(253,186,116,0.18)",
                          }}
                        >
                          ▦ {categoryLabel}
                        </span>
                      ) : null}

                      <span
                        style={{
                          minHeight: 30,
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 999,
                          padding: "0 10px",
                          background: "rgba(255,255,255,0.06)",
                          color: "#cbd5e1",
                          fontSize: 12,
                          fontWeight: 850,
                        }}
                      >
                        {ui.created}: {formatDate(entry.created_at, qrxLocale)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          activeTab === "own"
                            ? "repeat(2, minmax(0, 1fr))"
                            : "1fr 1fr",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <MetricCard
                        value={entry.views_total}
                        label={ui.views}
                      />
                      <MetricCard
                        value={entry.follower_count}
                        label={ui.followers}
                      />

                      {activeTab === "own" ? (
                        <>
                          <MetricCard
                            value={mediaAnalytics?.image_views_total}
                            label={ui.imageViews}
                          />
                          <MetricCard
                            value={mediaAnalytics?.file_downloads_total}
                            label={ui.downloads}
                            detail={
                              mediaAnalytics
                                ? ui.fileOpens.replace("{{count}}", formatNumber(Number(mediaAnalytics.file_opens_total ?? 0)))
                                : ui.analyticsBuilding
                            }
                          />
                        </>
                      ) : null}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <Link href={openHref} className={styles.primaryButton}>
                        {ui.open}
                      </Link>

                      <button
                        type="button"
                        onClick={() => void handleShare(entry)}
                        className={styles.secondaryButton}
                        style={{ cursor: "pointer" }}
                      >
                        {copiedId === entry.id ? ui.copied : ui.share}
                      </button>

                      {activeTab === "own" ? (
                        <>
                          <Link
                            href={editHref}
                            className={styles.secondaryButton}
                          >
                            {ui.edit}
                          </Link>

                          <Link
                            href={mediaHref}
                            className={styles.secondaryButton}
                            style={{ gridColumn: "1 / -1" }}
                          >
                            {ui.mediaAnalytics}
                          </Link>

                          <button
                            type="button"
                            onClick={() => void handleDeleteOwn(entry)}
                            className={styles.secondaryButton}
                            disabled={deletingId === entry.id}
                            style={{
                              cursor:
                                deletingId === entry.id
                                  ? "not-allowed"
                                  : "pointer",
                              border: "1px solid rgba(248,113,113,0.35)",
                              background: "rgba(239,68,68,0.14)",
                              color: "#fecaca",
                              opacity: deletingId === entry.id ? 0.72 : 1,
                            }}
                          >
                            {deletingId === entry.id
                              ? ui.deleting
                              : ui.delete}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleRemoveSaved(entry)}
                          className={styles.secondaryButton}
                          disabled={deletingId === entry.id}
                          style={{
                            gridColumn: "1 / -1",
                            cursor:
                              deletingId === entry.id
                                ? "not-allowed"
                                : "pointer",
                            border: "1px solid rgba(248,113,113,0.35)",
                            background: "rgba(239,68,68,0.14)",
                            color: "#fecaca",
                            opacity: deletingId === entry.id ? 0.72 : 1,
                          }}
                        >
                          {deletingId === entry.id
                            ? ui.removing
                            : ui.removeSaved}
                        </button>
                      )}
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

function MetricCard({
  value,
  label,
  detail,
}: {
  value: number | string | null | undefined;
  label: string;
  detail?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 12,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ color: "#ffffff", fontSize: 20, fontWeight: 950 }}>
        {formatNumber(Number(value ?? 0))}
      </div>
      <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850 }}>
        {label}
      </div>
      {detail ? (
        <div
          style={{
            color: "#64748b",
            fontSize: 10,
            fontWeight: 800,
            lineHeight: 1.35,
            marginTop: 3,
          }}
        >
          {detail}
        </div>
      ) : null}
    </div>
  );
}

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    minHeight: 58,
    borderRadius: 20,
    border: active
      ? "1px solid rgba(147,197,253,0.35)"
      : "1px solid rgba(255,255,255,0.08)",
    background: active
      ? "linear-gradient(135deg, rgba(37,99,235,0.78), rgba(124,58,237,0.78))"
      : "rgba(255,255,255,0.045)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  };
}

const tabBadgeStyle: React.CSSProperties = {
  minWidth: 28,
  height: 28,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.16)",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 950,
};
