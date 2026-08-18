"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../../dashboard.module.css";

type QrxEntry = {
  id: string;
  title: string | null;
  company_name: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  owner_user_id: string | null;
};

type QrxMedia = {
  id: string;
  qrx_id: string;
  type: "image" | "file" | "logo" | string;
  url: string;
  filename: string;
  bytes: number | null;
  created_at?: string | null;
};

type MediaAnalyticsSummary = {
  qrx_id: string;
  media_count: number | string | null;
  image_views_total: number | string | null;
  image_views_7d: number | string | null;
  image_views_30d: number | string | null;
  unique_image_viewers_total: number | string | null;
  unique_image_viewers_7d: number | string | null;
  unique_image_viewers_30d: number | string | null;
  last_image_view_at: string | null;
  file_opens_total: number | string | null;
  file_opens_7d: number | string | null;
  file_opens_30d: number | string | null;
  unique_file_openers_total: number | string | null;
  unique_file_openers_7d: number | string | null;
  unique_file_openers_30d: number | string | null;
  last_file_open_at: string | null;
  file_downloads_total: number | string | null;
  file_downloads_7d: number | string | null;
  file_downloads_30d: number | string | null;
  unique_file_downloaders_total: number | string | null;
  unique_file_downloaders_7d: number | string | null;
  unique_file_downloaders_30d: number | string | null;
  last_file_download_at: string | null;
  variant_delivery_total: number | string | null;
  variant_delivery_7d: number | string | null;
  variant_delivery_30d: number | string | null;
  thumb_events_total: number | string | null;
  medium_events_total: number | string | null;
  large_events_total: number | string | null;
  original_events_total: number | string | null;
};

type MediaAnalyticsItem = {
  media_id: string;
  media_type: string;
  filename: string;
  views_total: number | string | null;
  views_7d: number | string | null;
  views_30d: number | string | null;
  unique_viewers_total: number | string | null;
  unique_viewers_7d: number | string | null;
  unique_viewers_30d: number | string | null;
  last_view_at: string | null;
  opens_total: number | string | null;
  opens_7d: number | string | null;
  opens_30d: number | string | null;
  unique_openers_total: number | string | null;
  unique_openers_7d: number | string | null;
  unique_openers_30d: number | string | null;
  last_open_at: string | null;
  downloads_total: number | string | null;
  downloads_7d: number | string | null;
  downloads_30d: number | string | null;
  unique_downloaders_total: number | string | null;
  unique_downloaders_7d: number | string | null;
  unique_downloaders_30d: number | string | null;
  last_download_at: string | null;
  thumb_events_total: number | string | null;
  medium_events_total: number | string | null;
  large_events_total: number | string | null;
  original_events_total: number | string | null;
  thumb_events_30d: number | string | null;
  medium_events_30d: number | string | null;
  large_events_30d: number | string | null;
  original_events_30d: number | string | null;
  total_interactions: number | string | null;
  last_interaction_at: string | null;
};


type QrxWebLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

function normalizeQrxLocale(value: string): QrxWebLocale {
  const normalized = value.trim().toLowerCase().split(/[-_]/)[0];
  return (["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const).includes(normalized as QrxWebLocale)
    ? (normalized as QrxWebLocale)
    : "de";
}

const QR_MEDIA_TEXT = {
  de: {
    dashboard: "Dashboard",
    noActivity: "Noch keine Aktivität",
    mediaTitle: "QR-X Medien",
    missingId: "QR-X ID fehlt.",
    login: "Bitte melde dich zuerst an.",
    notFound: "QR-X wurde nicht gefunden.",
    forbidden: "Du darfst diesen QR-X nicht bearbeiten.",
    analyticsLoadFailed: "Media Analytics konnten nicht geladen werden.",
    removeConfirm: "Diesen Eintrag aus QR-X Medien entfernen?",
    removed: "Medium wurde entfernt.",
    removeFailed: "Medium konnte nicht entfernt werden.",
    myQrx: "Meine QR-X",
    mediaAnalytics: "Medien & Analytics",
    heroText: "Analysiere Aufrufe, Öffnungen und Downloads deiner Bilder und Dateien. Neue Medien lädst du ausschließlich über „Basisdaten bearbeiten“ hoch, damit die Credit-Berechnung korrekt durchgeführt wird.",
    editBase: "Basisdaten bearbeiten",
    openQrx: "QR-X öffnen",
    loading: "Medien werden geladen …",
    analyticsText: "Aufrufe, Öffnungen und Downloads deiner QR-X-Medien. Automatisch geladene Vorschaubilder werden nicht als Bildaufruf gezählt.",
    refreshing: "Aktualisiert …",
    refresh: "Aktualisieren",
    analyticsUnavailable: "Analytics konnten nicht geladen werden.",
    imageViews: "Bildaufrufe",
    fileOpens: "Dateiöffnungen",
    downloads: "Downloads",
    uniqueVisitors: "Eindeutige Besucher",
    in30: "{{count}} in 30 Tagen",
    privacy: "Datenschutzfreundlich gezählt",
    last7: "Letzte 7 Tage",
    last30: "Letzte 30 Tage",
    variants: "Varianten gesamt",
    lastImage: "Letzter Bildaufruf",
    lastFile: "Letzte Dateiöffnung",
    lastDownload: "Letzter Download",
    gallery: "Galerie",
    galleryText: "Diese Bilder sind aktuell mit deinem QR-X verknüpft.",
    entries: "{{count}} Einträge",
    noGallery: "Noch keine Galerie-Bilder vorhanden.",
    files: "Dateien",
    filesText: "Diese Dateien sind aktuell mit deinem QR-X verknüpft.",
    noFiles: "Noch keine Dateien vorhanden.",
    openImage: "Bild öffnen",
    openFile: "Datei öffnen",
    noAnalytics: "Noch keine Analytics für dieses Medium.",
    views: "Aufrufe",
    days7: "7 Tage",
    days30: "30 Tage",
    unique: "Eindeutig",
    opened: "Geöffnet",
    opens30: "Öffnungen 30 Tage",
    downloads30: "Downloads 30 Tage",
    lastView: "Letzter Aufruf",
    lastActivity: "Letzte Aktivität",
    removing: "Entfernt …",
    remove: "Entfernen",
  },
  en: {
    dashboard: "Dashboard",
    noActivity: "No activity yet",
    mediaTitle: "QR-X media",
    missingId: "QR-X ID is missing.",
    login: "Please sign in first.",
    notFound: "QR-X was not found.",
    forbidden: "You are not allowed to edit this QR-X.",
    analyticsLoadFailed: "Media analytics could not be loaded.",
    removeConfirm: "Remove this item from QR-X media?",
    removed: "Media item removed.",
    removeFailed: "Media item could not be removed.",
    myQrx: "My QR-X",
    mediaAnalytics: "Media & analytics",
    heroText: "Analyze views, opens and downloads of your images and files. Upload new media only through “Edit basic data” so Credit calculation stays correct.",
    editBase: "Edit basic data",
    openQrx: "Open QR-X",
    loading: "Loading media …",
    analyticsText: "Views, opens and downloads of your QR-X media. Automatically loaded preview images are not counted as image views.",
    refreshing: "Refreshing …",
    refresh: "Refresh",
    analyticsUnavailable: "Analytics could not be loaded.",
    imageViews: "Image views",
    fileOpens: "File opens",
    downloads: "Downloads",
    uniqueVisitors: "Unique visitors",
    in30: "{{count}} in 30 days",
    privacy: "Counted with privacy in mind",
    last7: "Last 7 days",
    last30: "Last 30 days",
    variants: "Variants total",
    lastImage: "Last image view",
    lastFile: "Last file open",
    lastDownload: "Last download",
    gallery: "Gallery",
    galleryText: "These images are currently linked to your QR-X.",
    entries: "{{count}} entries",
    noGallery: "No gallery images yet.",
    files: "Files",
    filesText: "These files are currently linked to your QR-X.",
    noFiles: "No files yet.",
    openImage: "Open image",
    openFile: "Open file",
    noAnalytics: "No analytics for this media item yet.",
    views: "Views",
    days7: "7 days",
    days30: "30 days",
    unique: "Unique",
    opened: "Opened",
    opens30: "Opens 30 days",
    downloads30: "Downloads 30 days",
    lastView: "Last view",
    lastActivity: "Last activity",
    removing: "Removing …",
    remove: "Remove",
  },
  tr: {
    dashboard: "Kontrol paneli",
    noActivity: "Henüz etkinlik yok",
    mediaTitle: "QR-X medyası",
    missingId: "QR-X kimliği eksik.",
    login: "Lütfen önce giriş yap.",
    notFound: "QR-X bulunamadı.",
    forbidden: "Bu QR-X'i düzenleme iznin yok.",
    analyticsLoadFailed: "Medya analitiği yüklenemedi.",
    removeConfirm: "Bu öğeyi QR-X medyasından kaldırmak istiyor musun?",
    removed: "Medya kaldırıldı.",
    removeFailed: "Medya kaldırılamadı.",
    myQrx: "QR-X'lerim",
    mediaAnalytics: "Medya ve analitik",
    heroText: "Görsellerin ve dosyaların görüntülenme, açılma ve indirilme verilerini analiz et. Credit hesabının doğru olması için yeni medyayı yalnızca “Temel bilgileri düzenle” bölümünden yükle.",
    editBase: "Temel bilgileri düzenle",
    openQrx: "QR-X'i aç",
    loading: "Medya yükleniyor …",
    analyticsText: "QR-X medyanın görüntülenme, açılma ve indirilme verileri. Otomatik yüklenen önizlemeler görsel görüntüleme olarak sayılmaz.",
    refreshing: "Güncelleniyor …",
    refresh: "Güncelle",
    analyticsUnavailable: "Analitik yüklenemedi.",
    imageViews: "Görsel görüntüleme",
    fileOpens: "Dosya açma",
    downloads: "İndirmeler",
    uniqueVisitors: "Benzersiz ziyaretçiler",
    in30: "30 günde {{count}}",
    privacy: "Gizliliğe uygun sayım",
    last7: "Son 7 gün",
    last30: "Son 30 gün",
    variants: "Toplam varyant",
    lastImage: "Son görsel görüntüleme",
    lastFile: "Son dosya açma",
    lastDownload: "Son indirme",
    gallery: "Galeri",
    galleryText: "Bu görseller şu anda QR-X'inle bağlantılı.",
    entries: "{{count}} öğe",
    noGallery: "Henüz galeri görseli yok.",
    files: "Dosyalar",
    filesText: "Bu dosyalar şu anda QR-X'inle bağlantılı.",
    noFiles: "Henüz dosya yok.",
    openImage: "Görseli aç",
    openFile: "Dosyayı aç",
    noAnalytics: "Bu medya için henüz analitik yok.",
    views: "Görüntüleme",
    days7: "7 gün",
    days30: "30 gün",
    unique: "Benzersiz",
    opened: "Açıldı",
    opens30: "30 günlük açılma",
    downloads30: "30 günlük indirme",
    lastView: "Son görüntüleme",
    lastActivity: "Son etkinlik",
    removing: "Kaldırılıyor …",
    remove: "Kaldır",
  },
  pl: {
    dashboard: "Panel",
    noActivity: "Brak aktywności",
    mediaTitle: "Media QR-X",
    missingId: "Brak ID QR-X.",
    login: "Najpierw się zaloguj.",
    notFound: "Nie znaleziono QR-X.",
    forbidden: "Nie możesz edytować tego QR-X.",
    analyticsLoadFailed: "Nie udało się wczytać analityki mediów.",
    removeConfirm: "Usunąć ten element z mediów QR-X?",
    removed: "Medium zostało usunięte.",
    removeFailed: "Nie udało się usunąć medium.",
    myQrx: "Moje QR-X",
    mediaAnalytics: "Media i analityka",
    heroText: "Analizuj wyświetlenia, otwarcia i pobrania obrazów oraz plików. Nowe media przesyłaj wyłącznie przez „Edytuj dane podstawowe”, aby prawidłowo naliczać Credits.",
    editBase: "Edytuj dane podstawowe",
    openQrx: "Otwórz QR-X",
    loading: "Ładowanie mediów …",
    analyticsText: "Wyświetlenia, otwarcia i pobrania mediów QR-X. Automatycznie ładowane podglądy nie są liczone jako wyświetlenia obrazu.",
    refreshing: "Odświeżanie …",
    refresh: "Odśwież",
    analyticsUnavailable: "Nie udało się wczytać analityki.",
    imageViews: "Wyświetlenia obrazów",
    fileOpens: "Otwarcia plików",
    downloads: "Pobrania",
    uniqueVisitors: "Unikalni odwiedzający",
    in30: "{{count}} w 30 dni",
    privacy: "Zliczane z poszanowaniem prywatności",
    last7: "Ostatnie 7 dni",
    last30: "Ostatnie 30 dni",
    variants: "Łącznie warianty",
    lastImage: "Ostatnie wyświetlenie obrazu",
    lastFile: "Ostatnie otwarcie pliku",
    lastDownload: "Ostatnie pobranie",
    gallery: "Galeria",
    galleryText: "Te obrazy są obecnie powiązane z Twoim QR-X.",
    entries: "{{count}} elementów",
    noGallery: "Brak obrazów w galerii.",
    files: "Pliki",
    filesText: "Te pliki są obecnie powiązane z Twoim QR-X.",
    noFiles: "Brak plików.",
    openImage: "Otwórz obraz",
    openFile: "Otwórz plik",
    noAnalytics: "Brak analityki dla tego medium.",
    views: "Wyświetlenia",
    days7: "7 dni",
    days30: "30 dni",
    unique: "Unikalne",
    opened: "Otwarto",
    opens30: "Otwarcia 30 dni",
    downloads30: "Pobrania 30 dni",
    lastView: "Ostatnie wyświetlenie",
    lastActivity: "Ostatnia aktywność",
    removing: "Usuwanie …",
    remove: "Usuń",
  },
  ar: {
    dashboard: "لوحة التحكم",
    noActivity: "لا يوجد نشاط بعد",
    mediaTitle: "وسائط QR-X",
    missingId: "معرّف QR-X مفقود.",
    login: "يرجى تسجيل الدخول أولًا.",
    notFound: "لم يتم العثور على QR-X.",
    forbidden: "لا يُسمح لك بتعديل QR-X هذا.",
    analyticsLoadFailed: "تعذر تحميل تحليلات الوسائط.",
    removeConfirm: "هل تريد إزالة هذا العنصر من وسائط QR-X؟",
    removed: "تمت إزالة الوسيط.",
    removeFailed: "تعذر إزالة الوسيط.",
    myQrx: "QR-X الخاصة بي",
    mediaAnalytics: "الوسائط والتحليلات",
    heroText: "حلّل المشاهدات والفتح والتنزيل لصورك وملفاتك. حمّل الوسائط الجديدة فقط عبر «تعديل البيانات الأساسية» لضمان احتساب Credits بشكل صحيح.",
    editBase: "تعديل البيانات الأساسية",
    openQrx: "فتح QR-X",
    loading: "جارٍ تحميل الوسائط …",
    analyticsText: "مشاهدات وفتح وتنزيل وسائط QR-X. صور المعاينة التي تُحمّل تلقائيًا لا تُحسب كمشاهدات صور.",
    refreshing: "جارٍ التحديث …",
    refresh: "تحديث",
    analyticsUnavailable: "تعذر تحميل التحليلات.",
    imageViews: "مشاهدات الصور",
    fileOpens: "فتح الملفات",
    downloads: "التنزيلات",
    uniqueVisitors: "زوار فريدون",
    in30: "{{count}} خلال 30 يومًا",
    privacy: "إحصاء يحترم الخصوصية",
    last7: "آخر 7 أيام",
    last30: "آخر 30 يومًا",
    variants: "إجمالي النسخ",
    lastImage: "آخر مشاهدة صورة",
    lastFile: "آخر فتح ملف",
    lastDownload: "آخر تنزيل",
    gallery: "المعرض",
    galleryText: "هذه الصور مرتبطة حاليًا بـ QR-X الخاص بك.",
    entries: "{{count}} عناصر",
    noGallery: "لا توجد صور في المعرض بعد.",
    files: "الملفات",
    filesText: "هذه الملفات مرتبطة حاليًا بـ QR-X الخاص بك.",
    noFiles: "لا توجد ملفات بعد.",
    openImage: "فتح الصورة",
    openFile: "فتح الملف",
    noAnalytics: "لا توجد تحليلات لهذا الوسيط بعد.",
    views: "المشاهدات",
    days7: "7 أيام",
    days30: "30 يومًا",
    unique: "فريد",
    opened: "تم الفتح",
    opens30: "فتح خلال 30 يومًا",
    downloads30: "تنزيلات 30 يومًا",
    lastView: "آخر مشاهدة",
    lastActivity: "آخر نشاط",
    removing: "جارٍ الإزالة …",
    remove: "إزالة",
  },
  fr: {
    dashboard: "Tableau de bord",
    noActivity: "Aucune activité",
    mediaTitle: "Médias QR-X",
    missingId: "ID QR-X manquant.",
    login: "Connectez-vous d’abord.",
    notFound: "QR-X introuvable.",
    forbidden: "Vous ne pouvez pas modifier ce QR-X.",
    analyticsLoadFailed: "Les statistiques des médias n’ont pas pu être chargées.",
    removeConfirm: "Retirer cet élément des médias QR-X ?",
    removed: "Média retiré.",
    removeFailed: "Le média n’a pas pu être retiré.",
    myQrx: "Mes QR-X",
    mediaAnalytics: "Médias et statistiques",
    heroText: "Analysez les vues, ouvertures et téléchargements de vos images et fichiers. Ajoutez de nouveaux médias uniquement via « Modifier les données de base » afin de calculer correctement les Credits.",
    editBase: "Modifier les données de base",
    openQrx: "Ouvrir le QR-X",
    loading: "Chargement des médias …",
    analyticsText: "Vues, ouvertures et téléchargements de vos médias QR-X. Les aperçus chargés automatiquement ne comptent pas comme vues.",
    refreshing: "Actualisation …",
    refresh: "Actualiser",
    analyticsUnavailable: "Les statistiques n’ont pas pu être chargées.",
    imageViews: "Vues des images",
    fileOpens: "Ouvertures de fichiers",
    downloads: "Téléchargements",
    uniqueVisitors: "Visiteurs uniques",
    in30: "{{count}} sur 30 jours",
    privacy: "Comptage respectueux de la vie privée",
    last7: "7 derniers jours",
    last30: "30 derniers jours",
    variants: "Total des variantes",
    lastImage: "Dernière vue image",
    lastFile: "Dernière ouverture de fichier",
    lastDownload: "Dernier téléchargement",
    gallery: "Galerie",
    galleryText: "Ces images sont actuellement liées à votre QR-X.",
    entries: "{{count}} éléments",
    noGallery: "Aucune image dans la galerie.",
    files: "Fichiers",
    filesText: "Ces fichiers sont actuellement liés à votre QR-X.",
    noFiles: "Aucun fichier.",
    openImage: "Ouvrir l’image",
    openFile: "Ouvrir le fichier",
    noAnalytics: "Aucune statistique pour ce média.",
    views: "Vues",
    days7: "7 jours",
    days30: "30 jours",
    unique: "Uniques",
    opened: "Ouvert",
    opens30: "Ouvertures 30 jours",
    downloads30: "Téléchargements 30 jours",
    lastView: "Dernière vue",
    lastActivity: "Dernière activité",
    removing: "Retrait …",
    remove: "Retirer",
  },
  es: {
    dashboard: "Panel",
    noActivity: "Sin actividad todavía",
    mediaTitle: "Medios de QR-X",
    missingId: "Falta el ID de QR-X.",
    login: "Inicia sesión primero.",
    notFound: "No se encontró el QR-X.",
    forbidden: "No puedes editar este QR-X.",
    analyticsLoadFailed: "No se pudieron cargar las analíticas de medios.",
    removeConfirm: "¿Quitar este elemento de los medios de QR-X?",
    removed: "Medio eliminado.",
    removeFailed: "No se pudo eliminar el medio.",
    myQrx: "Mis QR-X",
    mediaAnalytics: "Medios y analíticas",
    heroText: "Analiza las vistas, aperturas y descargas de tus imágenes y archivos. Sube nuevos medios solo desde «Editar datos básicos» para que el cálculo de Credits sea correcto.",
    editBase: "Editar datos básicos",
    openQrx: "Abrir QR-X",
    loading: "Cargando medios …",
    analyticsText: "Vistas, aperturas y descargas de tus medios QR-X. Las miniaturas cargadas automáticamente no cuentan como vistas de imagen.",
    refreshing: "Actualizando …",
    refresh: "Actualizar",
    analyticsUnavailable: "No se pudieron cargar las analíticas.",
    imageViews: "Vistas de imágenes",
    fileOpens: "Aperturas de archivos",
    downloads: "Descargas",
    uniqueVisitors: "Visitantes únicos",
    in30: "{{count}} en 30 días",
    privacy: "Contado respetando la privacidad",
    last7: "Últimos 7 días",
    last30: "Últimos 30 días",
    variants: "Variantes totales",
    lastImage: "Última vista de imagen",
    lastFile: "Última apertura de archivo",
    lastDownload: "Última descarga",
    gallery: "Galería",
    galleryText: "Estas imágenes están vinculadas actualmente a tu QR-X.",
    entries: "{{count}} elementos",
    noGallery: "Todavía no hay imágenes en la galería.",
    files: "Archivos",
    filesText: "Estos archivos están vinculados actualmente a tu QR-X.",
    noFiles: "Todavía no hay archivos.",
    openImage: "Abrir imagen",
    openFile: "Abrir archivo",
    noAnalytics: "Todavía no hay analíticas para este medio.",
    views: "Vistas",
    days7: "7 días",
    days30: "30 días",
    unique: "Únicos",
    opened: "Abierto",
    opens30: "Aperturas 30 días",
    downloads30: "Descargas 30 días",
    lastView: "Última vista",
    lastActivity: "Última actividad",
    removing: "Quitando …",
    remove: "Quitar",
  },
  it: {
    dashboard: "Dashboard",
    noActivity: "Nessuna attività",
    mediaTitle: "Media QR-X",
    missingId: "ID QR-X mancante.",
    login: "Accedi prima.",
    notFound: "QR-X non trovato.",
    forbidden: "Non puoi modificare questo QR-X.",
    analyticsLoadFailed: "Impossibile caricare le analytics dei media.",
    removeConfirm: "Rimuovere questo elemento dai media QR-X?",
    removed: "Media rimosso.",
    removeFailed: "Impossibile rimuovere il media.",
    myQrx: "I miei QR-X",
    mediaAnalytics: "Media e analytics",
    heroText: "Analizza visualizzazioni, aperture e download di immagini e file. Carica nuovi media solo tramite «Modifica dati di base» per mantenere corretto il calcolo dei Credits.",
    editBase: "Modifica dati di base",
    openQrx: "Apri QR-X",
    loading: "Caricamento media …",
    analyticsText: "Visualizzazioni, aperture e download dei media QR-X. Le anteprime caricate automaticamente non vengono conteggiate come visualizzazioni.",
    refreshing: "Aggiornamento …",
    refresh: "Aggiorna",
    analyticsUnavailable: "Impossibile caricare le analytics.",
    imageViews: "Visualizzazioni immagini",
    fileOpens: "Aperture file",
    downloads: "Download",
    uniqueVisitors: "Visitatori unici",
    in30: "{{count}} in 30 giorni",
    privacy: "Conteggio rispettoso della privacy",
    last7: "Ultimi 7 giorni",
    last30: "Ultimi 30 giorni",
    variants: "Varianti totali",
    lastImage: "Ultima visualizzazione immagine",
    lastFile: "Ultima apertura file",
    lastDownload: "Ultimo download",
    gallery: "Galleria",
    galleryText: "Queste immagini sono attualmente collegate al tuo QR-X.",
    entries: "{{count}} elementi",
    noGallery: "Nessuna immagine in galleria.",
    files: "File",
    filesText: "Questi file sono attualmente collegati al tuo QR-X.",
    noFiles: "Nessun file.",
    openImage: "Apri immagine",
    openFile: "Apri file",
    noAnalytics: "Nessuna analytics per questo media.",
    views: "Visualizzazioni",
    days7: "7 giorni",
    days30: "30 giorni",
    unique: "Unici",
    opened: "Aperto",
    opens30: "Aperture 30 giorni",
    downloads30: "Download 30 giorni",
    lastView: "Ultima visualizzazione",
    lastActivity: "Ultima attività",
    removing: "Rimozione …",
    remove: "Rimuovi",
  },
} as const;

function formatBytes(bytes: number | null | undefined) {
  const value = Number(bytes ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "–";

  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  }

  if (value >= 1024) {
    return `${(value / 1024).toFixed(1).replace(".", ",")} KB`;
  }

  return `${value} B`;
}

function toAnalyticsNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatAnalyticsNumber(value: number | string | null | undefined, locale: QrxWebLocale = "de") {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : locale, {
    maximumFractionDigits: 0,
  }).format(toAnalyticsNumber(value));
}

function formatAnalyticsDate(value: string | null | undefined, ui: (typeof QR_MEDIA_TEXT)[QrxWebLocale], locale: QrxWebLocale = "de") {
  if (!value) return ui.noActivity;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return ui.noActivity;

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function getTitle(entry: QrxEntry | null, fallback: string) {
  if (!entry) return fallback;
  return entry.company_name?.trim() || entry.title?.trim() || fallback;
}

export default function QrxMediaPage() {
  const router = useRouter();
  const params = useParams();

  const locale = getParam(params?.locale as string | string[] | undefined, "de");
  const qrxLocale = normalizeQrxLocale(locale);
  const ui = QR_MEDIA_TEXT[qrxLocale];
  const qrxId = getParam(params?.id as string | string[] | undefined, "");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [entry, setEntry] = useState<QrxEntry | null>(null);
  const [media, setMedia] = useState<QrxMedia[]>([]);
  const [analyticsSummary, setAnalyticsSummary] =
    useState<MediaAnalyticsSummary | null>(null);
  const [analyticsItems, setAnalyticsItems] = useState<MediaAnalyticsItem[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  useEffect(() => {
    void loadMediaPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrxId]);

  async function loadMediaPage() {
    setLoading(true);
    setErrorText(null);
    setSuccessText(null);

    if (!qrxId) {
      setErrorText(ui.missingId);
      setLoading(false);
      return;
    }

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
      setErrorText(ui.login);
      setLoading(false);
      return;
    }

    const { data: entryData, error: entryError } = await supabase
      .from("qr_x_entries")
      .select("id,title,company_name,cover_image_url,logo_url,owner_user_id")
      .eq("id", qrxId)
      .maybeSingle()
      .returns<QrxEntry>();

    if (entryError) {
      setErrorText(entryError.message);
      setLoading(false);
      return;
    }

    if (!entryData) {
      setErrorText(ui.notFound);
      setLoading(false);
      return;
    }

    if (entryData.owner_user_id !== user.id) {
      setErrorText(ui.forbidden);
      setLoading(false);
      return;
    }

    const { data: mediaData, error: mediaError } = await supabase
      .from("qr_x_media")
      .select("id,qrx_id,type,url,filename,bytes,created_at")
      .eq("qrx_id", qrxId)
      .in("type", ["image", "file"])
      .order("created_at", { ascending: false })
      .returns<QrxMedia[]>();

    if (mediaError) {
      setErrorText(mediaError.message);
      setLoading(false);
      return;
    }

    setEntry(entryData);
    setMedia(mediaData ?? []);
    setLoading(false);
    await loadAnalytics(qrxId);
  }

  async function loadAnalytics(qrxIdInner: string) {
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    try {
      const [summaryResult, itemsResult] = await Promise.all([
        supabase.rpc("get_qrx_media_analytics_summary", {
          p_qrx_id: qrxIdInner,
        }),
        supabase.rpc("get_qrx_media_analytics_items", {
          p_qrx_id: qrxIdInner,
        }),
      ]);

      if (summaryResult.error) throw summaryResult.error;
      if (itemsResult.error) throw itemsResult.error;

      const summaryRows = (summaryResult.data ?? []) as MediaAnalyticsSummary[];
      const itemRows = (itemsResult.data ?? []) as MediaAnalyticsItem[];

      setAnalyticsSummary(summaryRows[0] ?? null);
      setAnalyticsItems(itemRows);
    } catch (error) {
      console.warn("Media analytics load error:", error);
      setAnalyticsSummary(null);
      setAnalyticsItems([]);
      setAnalyticsError(
        error instanceof Error
          ? error.message
          : ui.analyticsLoadFailed,
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    const confirmed = window.confirm(ui.removeConfirm);
    if (!confirmed) return;

    setDeletingId(mediaId);
    setErrorText(null);
    setSuccessText(null);

    try {
      const { error } = await supabase.from("qr_x_media").delete().eq("id", mediaId);
      if (error) throw error;

      setSuccessText(ui.removed);
      await loadMediaPage();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : ui.removeFailed);
    } finally {
      setDeletingId(null);
    }
  }

  const analyticsByMediaId = new Map(
    analyticsItems.map((item) => [item.media_id, item]),
  );

  const totalUniqueVisitors = Math.max(
    toAnalyticsNumber(analyticsSummary?.unique_image_viewers_total),
    toAnalyticsNumber(analyticsSummary?.unique_file_openers_total),
    toAnalyticsNumber(analyticsSummary?.unique_file_downloaders_total),
  );

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label={ui.mediaTitle}>
          <Link href={`/${locale}/dashboard`}>{ui.dashboard}</Link>
          <Link href={`/${locale}/dashboard/qrx`}>{ui.myQrx}</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>{ui.mediaAnalytics}</span>
          <h1>{getTitle(entry, ui.mediaTitle)}</h1>
          <p>
            {ui.heroText}
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx/${qrxId}/edit`} className={styles.secondaryButton}>
            {ui.editBase}
          </Link>
          <Link href={`/${locale}/qrx/${qrxId}`} className={styles.secondaryButton}>
            {ui.openQrx}
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        {loading ? (
          <div style={panelStyle}>
            <div style={{ minHeight: 220, display: "grid", placeItems: "center", color: "#cbd5e1", fontWeight: 950 }}>
              {ui.loading}
            </div>
          </div>
        ) : null}

        {errorText ? (
          <div style={errorStyle}>{errorText}</div>
        ) : null}

        {successText ? (
          <div style={successStyle}>{successText}</div>
        ) : null}

        {!loading && entry ? (
          <section style={panelStyle} aria-label={ui.mediaAnalytics}>
            <div className={styles.cardHeader}>
              <div>
                <h2>{ui.mediaAnalytics}</h2>
                <p>
                  {ui.analyticsText}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadAnalytics(entry.id)}
                disabled={analyticsLoading}
                className={styles.secondaryButton}
                style={{
                  border: 0,
                  cursor: analyticsLoading ? "not-allowed" : "pointer",
                  opacity: analyticsLoading ? 0.72 : 1,
                }}
              >
                {analyticsLoading ? ui.refreshing : ui.refresh}
              </button>
            </div>

            {analyticsError ? (
              <div style={analyticsWarningStyle}>
                <strong>{ui.analyticsUnavailable}</strong>
                <span>{analyticsError}</span>
              </div>
            ) : null}

            <div style={analyticsSummaryGridStyle}>
              <AnalyticsSummaryCard
                icon="👁️"
                label={ui.imageViews}
                value={analyticsSummary?.image_views_total}
                detail={ui.in30.replace("{{count}}", formatAnalyticsNumber(analyticsSummary?.image_views_30d, qrxLocale))}
              />
              <AnalyticsSummaryCard
                icon="📄"
                label={ui.fileOpens}
                value={analyticsSummary?.file_opens_total}
                detail={ui.in30.replace("{{count}}", formatAnalyticsNumber(analyticsSummary?.file_opens_30d, qrxLocale))}
              />
              <AnalyticsSummaryCard
                icon="⬇️"
                label={ui.downloads}
                value={analyticsSummary?.file_downloads_total}
                detail={ui.in30.replace("{{count}}", formatAnalyticsNumber(analyticsSummary?.file_downloads_30d, qrxLocale))}
              />
              <AnalyticsSummaryCard
                icon="👤"
                label={ui.uniqueVisitors}
                value={totalUniqueVisitors}
                detail={ui.privacy}
              />
            </div>

            <div style={analyticsPeriodsGridStyle}>
              <AnalyticsPeriodCard
                title={ui.last7}
                rows={[
                  [ui.imageViews, analyticsSummary?.image_views_7d],
                  [ui.fileOpens, analyticsSummary?.file_opens_7d],
                  [ui.downloads, analyticsSummary?.file_downloads_7d],
                ]}
              />
              <AnalyticsPeriodCard
                title={ui.last30}
                rows={[
                  [ui.imageViews, analyticsSummary?.image_views_30d],
                  [ui.fileOpens, analyticsSummary?.file_opens_30d],
                  [ui.downloads, analyticsSummary?.file_downloads_30d],
                ]}
              />
              <AnalyticsPeriodCard
                title={ui.variants}
                rows={[
                  ["Thumb", analyticsSummary?.thumb_events_total],
                  ["Medium", analyticsSummary?.medium_events_total],
                  ["Large", analyticsSummary?.large_events_total],
                  ["Original", analyticsSummary?.original_events_total],
                ]}
              />
            </div>

            <div style={lastActivityGridStyle}>
              <AnalyticsActivity
                label={ui.lastImage}
                value={analyticsSummary?.last_image_view_at}
                ui={ui}
                locale={qrxLocale}
              />
              <AnalyticsActivity
                label={ui.lastFile}
                value={analyticsSummary?.last_file_open_at}
                ui={ui}
                locale={qrxLocale}
              />
              <AnalyticsActivity
                label={ui.lastDownload}
                value={analyticsSummary?.last_file_download_at}
                ui={ui}
                locale={qrxLocale}
              />
            </div>
          </section>
        ) : null}

        {!loading && entry ? (
          <>
            <div style={panelStyle}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>{ui.gallery}</h2>
                  <p>{ui.galleryText}</p>
                </div>
                <span>{ui.entries.replace("{{count}}", String(media.filter((item) => item.type === "image").length))}</span>
              </div>

              {media.filter((item) => item.type === "image").length === 0 ? (
                <EmptyBox text={ui.noGallery} />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  {media.filter((item) => item.type === "image").map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      deletingId={deletingId}
                      analytics={analyticsByMediaId.get(item.id) ?? null}
                      ui={ui}
                      locale={qrxLocale}
                      onDelete={() => void handleDeleteMedia(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={panelStyle}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>{ui.files}</h2>
                  <p>{ui.filesText}</p>
                </div>
                <span>{ui.entries.replace("{{count}}", String(media.filter((item) => item.type === "file").length))}</span>
              </div>

              {media.filter((item) => item.type === "file").length === 0 ? (
                <EmptyBox text={ui.noFiles} />
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {media.filter((item) => item.type === "file").map((item) => (
                    <FileRow
                      key={item.id}
                      item={item}
                      deletingId={deletingId}
                      analytics={analyticsByMediaId.get(item.id) ?? null}
                      ui={ui}
                      locale={qrxLocale}
                      onDelete={() => void handleDeleteMedia(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div
      style={{
        minHeight: 180,
        display: "grid",
        placeItems: "center",
        color: "#94a3b8",
        textAlign: "center",
        borderRadius: 22,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.075)",
        fontWeight: 850,
      }}
    >
      {text}
    </div>
  );
}

function MediaCard({
  item,
  deletingId,
  analytics,
  ui,
  locale,
  onDelete,
}: {
  item: QrxMedia;
  deletingId: string | null;
  analytics: MediaAnalyticsItem | null;
  ui: (typeof QR_MEDIA_TEXT)[QrxWebLocale];
  locale: QrxWebLocale;
  onDelete: () => void;
}) {
  return (
    <article
      style={{
        overflow: "hidden",
        borderRadius: 22,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.085)",
      }}
    >
      <div style={{ height: 150, background: "#e2e8f0", overflow: "hidden" }}>
        <img
          src={item.url}
          alt={item.filename}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <div style={{ padding: 12, display: "grid", gap: 10 }}>
        <strong style={{ color: "#ffffff", fontSize: 14, wordBreak: "break-word" }}>{item.filename}</strong>
        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850 }}>{formatBytes(item.bytes)}</span>
        <MediaItemAnalytics analytics={analytics} kind="image" ui={ui} locale={locale} />
        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", fontSize: 12, fontWeight: 900 }}>
          {ui.openImage}
        </a>
        <DeleteButton deleting={deletingId === item.id} onDelete={onDelete} ui={ui} />
      </div>
    </article>
  );
}

function FileRow({
  item,
  deletingId,
  analytics,
  ui,
  locale,
  onDelete,
}: {
  item: QrxMedia;
  deletingId: string | null;
  analytics: MediaAnalyticsItem | null;
  ui: (typeof QR_MEDIA_TEXT)[QrxWebLocale];
  locale: QrxWebLocale;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "center",
        borderRadius: 18,
        padding: 14,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.085)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <strong style={{ color: "#ffffff", wordBreak: "break-word" }}>📄 {item.filename}</strong>
        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850, marginTop: 4 }}>{formatBytes(item.bytes)}</div>
        <MediaItemAnalytics analytics={analytics} kind="file" ui={ui} locale={locale} />
        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", fontSize: 12, fontWeight: 900 }}>
          {ui.openFile}
        </a>
      </div>

      <DeleteButton deleting={deletingId === item.id} onDelete={onDelete} ui={ui} />
    </div>
  );
}

function AnalyticsSummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: number | string | null | undefined;
  detail: string;
}) {
  return (
    <article style={analyticsSummaryCardStyle}>
      <span style={analyticsSummaryIconStyle}>{icon}</span>
      <div>
        <strong style={analyticsSummaryValueStyle}>
          {formatAnalyticsNumber(value)}
        </strong>
        <span style={analyticsSummaryLabelStyle}>{label}</span>
        <small style={analyticsSummaryDetailStyle}>{detail}</small>
      </div>
    </article>
  );
}

function AnalyticsPeriodCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, number | string | null | undefined]>;
}) {
  return (
    <article style={analyticsPeriodCardStyle}>
      <strong style={{ color: "#ffffff" }}>{title}</strong>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={analyticsPeriodRowStyle}>
            <span>{label}</span>
            <strong>{formatAnalyticsNumber(value)}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function AnalyticsActivity({
  label,
  value,
  ui,
  locale,
}: {
  label: string;
  value: string | null | undefined;
  ui: (typeof QR_MEDIA_TEXT)[QrxWebLocale];
  locale: QrxWebLocale;
}) {
  return (
    <div style={analyticsActivityStyle}>
      <span>{label}</span>
      <strong>{formatAnalyticsDate(value, ui, locale)}</strong>
    </div>
  );
}

function MediaItemAnalytics({
  analytics,
  kind,
  ui,
  locale,
}: {
  analytics: MediaAnalyticsItem | null;
  kind: "image" | "file";
  ui: (typeof QR_MEDIA_TEXT)[QrxWebLocale];
  locale: QrxWebLocale;
}) {
  if (!analytics) {
    return (
      <div style={mediaAnalyticsEmptyStyle}>
        {ui.noAnalytics}
      </div>
    );
  }

  const mainRows =
    kind === "image"
      ? [
          [ui.views, analytics.views_total],
          [ui.days7, analytics.views_7d],
          [ui.days30, analytics.views_30d],
          [ui.unique, analytics.unique_viewers_total],
        ]
      : [
          [ui.opened, analytics.opens_total],
          [ui.downloads, analytics.downloads_total],
          [ui.opens30, analytics.opens_30d],
          [ui.downloads30, analytics.downloads_30d],
        ];

  return (
    <div style={mediaAnalyticsBoxStyle}>
      <div style={mediaAnalyticsGridStyle}>
        {mainRows.map(([label, value]) => (
          <div key={label} style={mediaAnalyticsMetricStyle}>
            <span>{label}</span>
            <strong>{formatAnalyticsNumber(value)}</strong>
          </div>
        ))}
      </div>

      <div style={mediaAnalyticsVariantStyle}>
        <span>Thumb {formatAnalyticsNumber(analytics.thumb_events_total)}</span>
        <span>Medium {formatAnalyticsNumber(analytics.medium_events_total)}</span>
        <span>Large {formatAnalyticsNumber(analytics.large_events_total)}</span>
        <span>Original {formatAnalyticsNumber(analytics.original_events_total)}</span>
      </div>

      <div style={mediaAnalyticsLastStyle}>
        {kind === "image" ? ui.lastView : ui.lastActivity}:{" "}
        {formatAnalyticsDate(
          kind === "image" ? analytics.last_view_at : analytics.last_interaction_at,
          ui,
          locale,
        )}
      </div>
    </div>
  );
}

function DeleteButton({ deleting, onDelete, ui }: { deleting: boolean; onDelete: () => void; ui: (typeof QR_MEDIA_TEXT)[QrxWebLocale] }) {
  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={deleting}
      style={{
        minHeight: 38,
        borderRadius: 12,
        border: "1px solid rgba(252,165,165,0.22)",
        background: "rgba(239,68,68,0.14)",
        color: "#fecaca",
        fontWeight: 950,
        cursor: deleting ? "not-allowed" : "pointer",
        padding: "0 12px",
      }}
    >
      {deleting ? ui.removing : ui.remove}
    </button>
  );
}

const panelStyle: React.CSSProperties = {
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const analyticsSummaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
};

const analyticsSummaryCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  borderRadius: 20,
  padding: 15,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.085)",
};

const analyticsSummaryIconStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  display: "grid",
  placeItems: "center",
  borderRadius: 16,
  background: "rgba(59,130,246,0.14)",
  fontSize: 20,
};

const analyticsSummaryValueStyle: React.CSSProperties = {
  display: "block",
  color: "#ffffff",
  fontSize: 24,
  fontWeight: 950,
};

const analyticsSummaryLabelStyle: React.CSSProperties = {
  display: "block",
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const analyticsSummaryDetailStyle: React.CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 800,
  marginTop: 3,
};

const analyticsPeriodsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 14,
};

const analyticsPeriodCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  borderRadius: 20,
  padding: 15,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const analyticsPeriodRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 850,
};

const lastActivityGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const analyticsActivityStyle: React.CSSProperties = {
  display: "grid",
  gap: 5,
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.08)",
  border: "1px solid rgba(147,197,253,0.16)",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 850,
};

const analyticsWarningStyle: React.CSSProperties = {
  display: "grid",
  gap: 5,
  borderRadius: 16,
  padding: 12,
  marginBottom: 14,
  background: "rgba(245,158,11,0.12)",
  border: "1px solid rgba(253,230,138,0.18)",
  color: "#fde68a",
  fontSize: 13,
  fontWeight: 850,
};

const mediaAnalyticsBoxStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  borderRadius: 14,
  padding: 10,
  background: "rgba(59,130,246,0.08)",
  border: "1px solid rgba(147,197,253,0.14)",
};

const mediaAnalyticsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 7,
};

const mediaAnalyticsMetricStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  color: "#94a3b8",
  fontSize: 10,
  fontWeight: 850,
};

const mediaAnalyticsVariantStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 7,
  color: "#bfdbfe",
  fontSize: 10,
  fontWeight: 850,
};

const mediaAnalyticsLastStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 10,
  fontWeight: 800,
  lineHeight: 1.45,
};

const mediaAnalyticsEmptyStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: 9,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 800,
};

const errorStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const successStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(34, 197, 94, 0.14)",
  border: "1px solid rgba(134, 239, 172, 0.22)",
  color: "#bbf7d0",
  fontWeight: 850,
  lineHeight: 1.55,
};
