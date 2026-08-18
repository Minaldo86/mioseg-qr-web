"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type MarkerKind =
  | "own_business"
  | "saved_business"
  | "own_normal"
  | "saved_normal"
  | "scan";

type MapPoint = {
  id: string;
  rawId: string;
  title: string;
  description: string;
  href: string | null;
  editHref: string | null;
  latitude: number;
  longitude: number;
  kind: MarkerKind;
  locationName: string | null;
  category: string | null;
  verified: boolean;
  followerCount: number;
  viewCount: number;
  coverUrl: string | null;
};

type QrxEntry = {
  id: string;
  title: string | null;
  company_name: string | null;
  description: string | null;
  type: "normal" | "business" | null;
  owner_user_id: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  category: string | null;
  verified: boolean | null;
  follower_count: number | null;
  views_total: number | null;
  cover_image_url: string | null;
  deleted_at: string | null;
  suspended: boolean | null;
};

type UserScan = {
  id: string;
  name: string | null;
  data: string | null;
  latitude: number | null;
  longitude: number | null;
};

type SaveRow = {
  qrx_id: string | null;
};

type LeafletLatLng = unknown;

type LeafletBounds = {
  contains: (latLng: LeafletLatLng) => boolean;
  getSouth: () => number;
  getWest: () => number;
  getNorth: () => number;
  getEast: () => number;
};

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (html: string, options?: { maxWidth?: number; className?: string }) => LeafletMarker;
  getLatLng: () => LeafletLatLng;
  openPopup: () => LeafletMarker;
  on: (eventName: string, handler: () => void) => LeafletMarker;
};

type LeafletMap = {
  setView: (center: [number, number] | LeafletLatLng, zoom: number, options?: { animate?: boolean }) => LeafletMap;
  fitBounds: (bounds: [number, number][], options?: { padding?: [number, number]; maxZoom?: number }) => LeafletMap;
  flyTo?: (center: [number, number] | LeafletLatLng, zoom: number, options?: { animate?: boolean; duration?: number }) => LeafletMap;
  getZoom?: () => number;
  getCenter?: () => { lat: number; lng: number };
  getBounds: () => LeafletBounds;
  on: (eventName: string, handler: () => void) => LeafletMap;
  off: (eventName: string, handler: () => void) => LeafletMap;
  removeLayer: (layer: LeafletMarker) => LeafletMap;
  remove: () => void;
};

type LeafletApi = {
  map: (element: HTMLElement, options?: { scrollWheelZoom?: boolean; zoomControl?: boolean }) => LeafletMap;
  tileLayer: (url: string, options?: { attribution?: string; maxZoom?: number }) => { addTo: (map: LeafletMap) => unknown };
  divIcon: (options: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  }) => unknown;
  marker: (latLng: [number, number], options?: { icon?: unknown }) => LeafletMarker;
};

type WindowWithLeaflet = Window & {
  L?: LeafletApi;
};

const LEGEND_COLORS: Record<MarkerKind, string> = {
  own_business: "#f2b705",
  saved_business: "#059669",
  own_normal: "#22c55e",
  saved_normal: "#8b5cf6",
  scan: "#2563eb",
};

type FilterMode = "all" | "own" | "saved" | "business" | "normal" | "scan" | "verified";

const FILTERS: FilterMode[] = [
  "all",
  "own",
  "saved",
  "business",
  "normal",
  "scan",
  "verified",
];

type MapLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

const MAP_TEXT = {
  de: {
    legendOwnBusiness: "Gold = Mein Business QR-X",
    legendSavedBusiness: "Dunkelgrün = Gespeichertes Business QR-X",
    legendOwnNormal: "Hellgrün = Mein normaler QR-X",
    legendSavedNormal: "Lila = Gespeicherter QR-X",
    legendScan: "Blau = Normaler Scan",
    filterAll: "Alle",
    filterOwn: "Meine QR-X",
    filterSaved: "Gespeicherte",
    filterBusiness: "Business",
    filterNormal: "Normal",
    filterScan: "QR-Codes",
    filterVerified: "Verifiziert",
    marker: "Marker",
    untitledQrx: "Unbenannter QR-X",
    qrxFallback: "QR-X auf mioseg qr",
    geoUnsupported: "Standortbestimmung wird von diesem Browser nicht unterstützt.",
    geoDenied: "Der Standortzugriff wurde nicht erlaubt.",
    geoUnavailable: "Der Standort ist derzeit nicht verfügbar.",
    geoTimeout: "Die Standortabfrage hat zu lange gedauert.",
    youAreHere: "Du bist hier",
    open: "Öffnen",
    normalScan: "Normaler Scan",
    savedQrCode: "Gespeicherter QR-Code",
    clusterEntries: "{{count}} Einträge",
    searchPlaceholder: "QR-X, Ort oder Kategorie suchen …",
    entry: "Eintrag",
    entries: "Einträge",
    loaded: "geladen",
    singleMarkers: "Einzelne Marker",
    groupedMarkers: "Zu {{count}} Markern gruppiert",
    showMyPosition: "Meine Position anzeigen",
    locating: "Standort wird gesucht …",
    myPosition: "Meine Position",
    mapLoading: "Karte wird geladen …",
    mapEmpty: "Im aktuellen Kartenausschnitt wurden keine passenden QR-X oder Scans gefunden.",
    visibleEntries: "Sichtbare Einträge",
    currentMapArea: "Aktueller Kartenausschnitt",
    noVisible: "Im aktuellen Ausschnitt ist kein passender Eintrag sichtbar.",
    verified: "Verifiziert",
    edit: "Bearbeiten",
    navigation: "Navigation",
    linkCopied: "Link kopiert",
    share: "Teilen",
    legend: "Legende",
    hide: "Ausblenden",
    show: "Einblenden",
  },
  en: {
    legendOwnBusiness: "Gold = My Business QR-X",
    legendSavedBusiness: "Dark green = Saved Business QR-X",
    legendOwnNormal: "Light green = My normal QR-X",
    legendSavedNormal: "Purple = Saved QR-X",
    legendScan: "Blue = Normal scan",
    filterAll: "All",
    filterOwn: "My QR-X",
    filterSaved: "Saved",
    filterBusiness: "Business",
    filterNormal: "Normal",
    filterScan: "QR codes",
    filterVerified: "Verified",
    marker: "Marker",
    untitledQrx: "Untitled QR-X",
    qrxFallback: "QR-X on mioseg qr",
    geoUnsupported: "Location services are not supported by this browser.",
    geoDenied: "Location access was not allowed.",
    geoUnavailable: "Your location could not be determined.",
    geoTimeout: "The location request took too long.",
    youAreHere: "You are here",
    open: "Open",
    normalScan: "Normal scan",
    savedQrCode: "Saved QR code",
    clusterEntries: "{{count}} entries",
    searchPlaceholder: "Search QR-X, place or category …",
    entry: "entry",
    entries: "entries",
    loaded: "loaded",
    singleMarkers: "Individual markers",
    groupedMarkers: "Grouped into {{count}} markers",
    showMyPosition: "Show my position",
    locating: "Finding location …",
    myPosition: "My position",
    mapLoading: "Loading map …",
    mapEmpty: "No matching QR-X or scans were found in the current map area.",
    visibleEntries: "Visible entries",
    currentMapArea: "Current map area",
    noVisible: "No matching entry is visible in the current area.",
    verified: "Verified",
    edit: "Edit",
    navigation: "Navigation",
    linkCopied: "Link copied",
    share: "Share",
    legend: "Legend",
    hide: "Hide",
    show: "Show",
  },
  tr: {
    legendOwnBusiness: "Altın = Benim Business QR-X",
    legendSavedBusiness: "Koyu yeşil = Kaydedilen Business QR-X",
    legendOwnNormal: "Açık yeşil = Benim normal QR-X",
    legendSavedNormal: "Mor = Kaydedilen QR-X",
    legendScan: "Mavi = Normal tarama",
    filterAll: "Tümü",
    filterOwn: "QR-X'lerim",
    filterSaved: "Kaydedilen",
    filterBusiness: "Business",
    filterNormal: "Normal",
    filterScan: "QR kodları",
    filterVerified: "Doğrulanmış",
    marker: "İşaretçi",
    untitledQrx: "Adsız QR-X",
    qrxFallback: "mioseg qr üzerindeki QR-X",
    geoUnsupported: "Bu tarayıcı konum belirlemeyi desteklemiyor.",
    geoDenied: "Konum erişimine izin verilmedi.",
    geoUnavailable: "Konumun belirlenemedi.",
    geoTimeout: "Konum isteği çok uzun sürdü.",
    youAreHere: "Buradasın",
    open: "Aç",
    normalScan: "Normal tarama",
    savedQrCode: "Kaydedilen QR kodu",
    clusterEntries: "{{count}} kayıt",
    searchPlaceholder: "QR-X, yer veya kategori ara …",
    entry: "kayıt",
    entries: "kayıt",
    loaded: "yüklendi",
    singleMarkers: "Tekil işaretçiler",
    groupedMarkers: "{{count}} işaretçide gruplandı",
    showMyPosition: "Konumumu göster",
    locating: "Konum aranıyor …",
    myPosition: "Konumum",
    mapLoading: "Harita yükleniyor …",
    mapEmpty: "Mevcut harita alanında eşleşen QR-X veya tarama bulunamadı.",
    visibleEntries: "Görünür kayıtlar",
    currentMapArea: "Mevcut harita alanı",
    noVisible: "Mevcut alanda eşleşen kayıt görünmüyor.",
    verified: "Doğrulanmış",
    edit: "Düzenle",
    navigation: "Navigasyon",
    linkCopied: "Bağlantı kopyalandı",
    share: "Paylaş",
    legend: "Gösterge",
    hide: "Gizle",
    show: "Göster",
  },
  pl: {
    legendOwnBusiness: "Złoty = Mój Business QR-X",
    legendSavedBusiness: "Ciemnozielony = Zapisany Business QR-X",
    legendOwnNormal: "Jasnozielony = Mój zwykły QR-X",
    legendSavedNormal: "Fioletowy = Zapisany QR-X",
    legendScan: "Niebieski = Zwykły skan",
    filterAll: "Wszystkie",
    filterOwn: "Moje QR-X",
    filterSaved: "Zapisane",
    filterBusiness: "Business",
    filterNormal: "Normalne",
    filterScan: "Kody QR",
    filterVerified: "Zweryfikowane",
    marker: "Znacznik",
    untitledQrx: "QR-X bez nazwy",
    qrxFallback: "QR-X w mioseg qr",
    geoUnsupported: "Ta przeglądarka nie obsługuje lokalizacji.",
    geoDenied: "Nie zezwolono na dostęp do lokalizacji.",
    geoUnavailable: "Nie udało się ustalić Twojej lokalizacji.",
    geoTimeout: "Żądanie lokalizacji trwało zbyt długo.",
    youAreHere: "Jesteś tutaj",
    open: "Otwórz",
    normalScan: "Zwykły skan",
    savedQrCode: "Zapisany kod QR",
    clusterEntries: "{{count}} wpisów",
    searchPlaceholder: "Szukaj QR-X, miejsca lub kategorii …",
    entry: "wpis",
    entries: "wpisów",
    loaded: "wczytano",
    singleMarkers: "Pojedyncze znaczniki",
    groupedMarkers: "Zgrupowano w {{count}} znaczników",
    showMyPosition: "Pokaż moją pozycję",
    locating: "Ustalanie lokalizacji …",
    myPosition: "Moja pozycja",
    mapLoading: "Ładowanie mapy …",
    mapEmpty: "W bieżącym obszarze mapy nie znaleziono pasujących QR-X ani skanów.",
    visibleEntries: "Widoczne wpisy",
    currentMapArea: "Bieżący obszar mapy",
    noVisible: "W bieżącym obszarze nie ma pasującego widocznego wpisu.",
    verified: "Zweryfikowane",
    edit: "Edytuj",
    navigation: "Nawigacja",
    linkCopied: "Link skopiowany",
    share: "Udostępnij",
    legend: "Legenda",
    hide: "Ukryj",
    show: "Pokaż",
  },
  ar: {
    legendOwnBusiness: "ذهبي = Business QR-X الخاصة بي",
    legendSavedBusiness: "أخضر داكن = Business QR-X محفوظة",
    legendOwnNormal: "أخضر فاتح = QR-X عادية خاصة بي",
    legendSavedNormal: "بنفسجي = QR-X محفوظة",
    legendScan: "أزرق = مسح عادي",
    filterAll: "الكل",
    filterOwn: "QR-X الخاصة بي",
    filterSaved: "المحفوظة",
    filterBusiness: "Business",
    filterNormal: "عادي",
    filterScan: "رموز QR",
    filterVerified: "موثّق",
    marker: "علامة",
    untitledQrx: "QR-X بدون اسم",
    qrxFallback: "QR-X على mioseg qr",
    geoUnsupported: "هذا المتصفح لا يدعم تحديد الموقع.",
    geoDenied: "لم يتم السماح بالوصول إلى الموقع.",
    geoUnavailable: "تعذر تحديد موقعك.",
    geoTimeout: "استغرق طلب الموقع وقتًا طويلًا.",
    youAreHere: "أنت هنا",
    open: "فتح",
    normalScan: "مسح عادي",
    savedQrCode: "رمز QR محفوظ",
    clusterEntries: "{{count}} إدخالات",
    searchPlaceholder: "ابحث عن QR-X أو موقع أو فئة …",
    entry: "إدخال",
    entries: "إدخالات",
    loaded: "تم التحميل",
    singleMarkers: "علامات منفردة",
    groupedMarkers: "مجمعة في {{count}} علامات",
    showMyPosition: "إظهار موقعي",
    locating: "جارٍ تحديد الموقع …",
    myPosition: "موقعي",
    mapLoading: "جارٍ تحميل الخريطة …",
    mapEmpty: "لم يتم العثور على QR-X أو عمليات مسح مطابقة في منطقة الخريطة الحالية.",
    visibleEntries: "الإدخالات الظاهرة",
    currentMapArea: "منطقة الخريطة الحالية",
    noVisible: "لا يوجد إدخال مطابق ظاهر في المنطقة الحالية.",
    verified: "موثّق",
    edit: "تعديل",
    navigation: "التنقل",
    linkCopied: "تم نسخ الرابط",
    share: "مشاركة",
    legend: "وسيلة الإيضاح",
    hide: "إخفاء",
    show: "إظهار",
  },
  fr: {
    legendOwnBusiness: "Or = Mon Business QR-X",
    legendSavedBusiness: "Vert foncé = Business QR-X enregistré",
    legendOwnNormal: "Vert clair = Mon QR-X normal",
    legendSavedNormal: "Violet = QR-X enregistré",
    legendScan: "Bleu = Scan normal",
    filterAll: "Tous",
    filterOwn: "Mes QR-X",
    filterSaved: "Enregistrés",
    filterBusiness: "Business",
    filterNormal: "Normal",
    filterScan: "Codes QR",
    filterVerified: "Vérifiés",
    marker: "Marqueur",
    untitledQrx: "QR-X sans titre",
    qrxFallback: "QR-X sur mioseg qr",
    geoUnsupported: "La localisation n’est pas prise en charge par ce navigateur.",
    geoDenied: "L’accès à la localisation n’a pas été autorisé.",
    geoUnavailable: "Votre position n’a pas pu être déterminée.",
    geoTimeout: "La demande de localisation a pris trop de temps.",
    youAreHere: "Vous êtes ici",
    open: "Ouvrir",
    normalScan: "Scan normal",
    savedQrCode: "Code QR enregistré",
    clusterEntries: "{{count}} entrées",
    searchPlaceholder: "Rechercher un QR-X, un lieu ou une catégorie …",
    entry: "entrée",
    entries: "entrées",
    loaded: "chargées",
    singleMarkers: "Marqueurs individuels",
    groupedMarkers: "Regroupés en {{count}} marqueurs",
    showMyPosition: "Afficher ma position",
    locating: "Recherche de la position …",
    myPosition: "Ma position",
    mapLoading: "Chargement de la carte …",
    mapEmpty: "Aucun QR-X ou scan correspondant n’a été trouvé dans la zone actuelle.",
    visibleEntries: "Entrées visibles",
    currentMapArea: "Zone actuelle de la carte",
    noVisible: "Aucune entrée correspondante n’est visible dans la zone actuelle.",
    verified: "Vérifié",
    edit: "Modifier",
    navigation: "Navigation",
    linkCopied: "Lien copié",
    share: "Partager",
    legend: "Légende",
    hide: "Masquer",
    show: "Afficher",
  },
  es: {
    legendOwnBusiness: "Dorado = Mi Business QR-X",
    legendSavedBusiness: "Verde oscuro = Business QR-X guardado",
    legendOwnNormal: "Verde claro = Mi QR-X normal",
    legendSavedNormal: "Morado = QR-X guardado",
    legendScan: "Azul = Escaneo normal",
    filterAll: "Todos",
    filterOwn: "Mis QR-X",
    filterSaved: "Guardados",
    filterBusiness: "Business",
    filterNormal: "Normal",
    filterScan: "Códigos QR",
    filterVerified: "Verificados",
    marker: "Marcador",
    untitledQrx: "QR-X sin título",
    qrxFallback: "QR-X en mioseg qr",
    geoUnsupported: "Este navegador no admite la ubicación.",
    geoDenied: "No se permitió el acceso a la ubicación.",
    geoUnavailable: "No se pudo determinar tu ubicación.",
    geoTimeout: "La solicitud de ubicación tardó demasiado.",
    youAreHere: "Estás aquí",
    open: "Abrir",
    normalScan: "Escaneo normal",
    savedQrCode: "Código QR guardado",
    clusterEntries: "{{count}} entradas",
    searchPlaceholder: "Buscar QR-X, lugar o categoría …",
    entry: "entrada",
    entries: "entradas",
    loaded: "cargadas",
    singleMarkers: "Marcadores individuales",
    groupedMarkers: "Agrupados en {{count}} marcadores",
    showMyPosition: "Mostrar mi posición",
    locating: "Buscando ubicación …",
    myPosition: "Mi posición",
    mapLoading: "Cargando mapa …",
    mapEmpty: "No se encontraron QR-X ni escaneos coincidentes en el área actual del mapa.",
    visibleEntries: "Entradas visibles",
    currentMapArea: "Área actual del mapa",
    noVisible: "No hay ninguna entrada coincidente visible en el área actual.",
    verified: "Verificado",
    edit: "Editar",
    navigation: "Navegación",
    linkCopied: "Enlace copiado",
    share: "Compartir",
    legend: "Leyenda",
    hide: "Ocultar",
    show: "Mostrar",
  },
  it: {
    legendOwnBusiness: "Oro = Il mio Business QR-X",
    legendSavedBusiness: "Verde scuro = Business QR-X salvato",
    legendOwnNormal: "Verde chiaro = Il mio QR-X normale",
    legendSavedNormal: "Viola = QR-X salvato",
    legendScan: "Blu = Scansione normale",
    filterAll: "Tutti",
    filterOwn: "I miei QR-X",
    filterSaved: "Salvati",
    filterBusiness: "Business",
    filterNormal: "Normale",
    filterScan: "Codici QR",
    filterVerified: "Verificati",
    marker: "Indicatore",
    untitledQrx: "QR-X senza titolo",
    qrxFallback: "QR-X su mioseg qr",
    geoUnsupported: "Questo browser non supporta la localizzazione.",
    geoDenied: "L’accesso alla posizione non è stato consentito.",
    geoUnavailable: "Non è stato possibile determinare la tua posizione.",
    geoTimeout: "La richiesta della posizione ha impiegato troppo tempo.",
    youAreHere: "Sei qui",
    open: "Apri",
    normalScan: "Scansione normale",
    savedQrCode: "Codice QR salvato",
    clusterEntries: "{{count}} elementi",
    searchPlaceholder: "Cerca QR-X, luogo o categoria …",
    entry: "elemento",
    entries: "elementi",
    loaded: "caricati",
    singleMarkers: "Indicatori singoli",
    groupedMarkers: "Raggruppati in {{count}} indicatori",
    showMyPosition: "Mostra la mia posizione",
    locating: "Ricerca posizione …",
    myPosition: "La mia posizione",
    mapLoading: "Caricamento mappa …",
    mapEmpty: "Nell’area corrente della mappa non sono stati trovati QR-X o scansioni corrispondenti.",
    visibleEntries: "Elementi visibili",
    currentMapArea: "Area corrente della mappa",
    noVisible: "Nell’area corrente non è visibile alcun elemento corrispondente.",
    verified: "Verificato",
    edit: "Modifica",
    navigation: "Navigazione",
    linkCopied: "Link copiato",
    share: "Condividi",
    legend: "Legenda",
    hide: "Nascondi",
    show: "Mostra",
  },
} as const;

function normalizeMapLocale(value: string): MapLocale {
  return (["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const).includes(
    value as MapLocale,
  )
    ? (value as MapLocale)
    : "de";
}

function interpolate(value: string, count: number) {
  return value.replace("{{count}}", String(count));
}
function getLeafletWindow() {
  return window as WindowWithLeaflet;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function getMarkerColor(kind: MarkerKind) {
  return LEGEND_COLORS[kind] ?? "#2563eb";
}

function getMarkerLabel(kind: MarkerKind, text: (typeof MAP_TEXT)[MapLocale]) {
  if (kind === "own_business") return text.legendOwnBusiness;
  if (kind === "saved_business") return text.legendSavedBusiness;
  if (kind === "own_normal") return text.legendOwnNormal;
  if (kind === "saved_normal") return text.legendSavedNormal;
  if (kind === "scan") return text.legendScan;
  return text.marker;
}

function formatNumber(value: number | null | undefined, locale: MapLocale) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return "0";
  return new Intl.NumberFormat(
    locale === "ar" ? "ar" : locale,
    { maximumFractionDigits: 0 },
  ).format(Math.max(0, parsed));
}

function matchesFilter(point: MapPoint, filter: FilterMode) {
  if (filter === "all") return true;
  if (filter === "own") return point.kind === "own_business" || point.kind === "own_normal";
  if (filter === "saved") return point.kind === "saved_business" || point.kind === "saved_normal";
  if (filter === "business") return point.kind === "own_business" || point.kind === "saved_business";
  if (filter === "normal") return point.kind === "own_normal" || point.kind === "saved_normal";
  if (filter === "scan") return point.kind === "scan";
  if (filter === "verified") return point.verified;
  return true;
}

function getQrxTitle(entry: QrxEntry, text: (typeof MAP_TEXT)[MapLocale]) {
  return entry.company_name?.trim() || entry.title?.trim() || text.untitledQrx;
}

function getQrxDescription(entry: QrxEntry, text: (typeof MAP_TEXT)[MapLocale]) {
  return entry.description?.trim() || entry.location_name?.trim() || text.qrxFallback;
}

function isValidCoordinate(lat: unknown, lng: unknown): lat is number {
  return typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng);
}

type MapViewport = {
  south: number;
  west: number;
  north: number;
  east: number;
};

function viewportFromBounds(bounds: LeafletBounds): MapViewport {
  return {
    south: bounds.getSouth(),
    west: bounds.getWest(),
    north: bounds.getNorth(),
    east: bounds.getEast(),
  };
}


const DASHBOARD_MAP_STATE_KEY = "mioseg.dashboard.map-state.v1";

type StoredMapState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

function readStoredMapState(): StoredMapState | null {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_MAP_STATE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredMapState;

    if (
      !Number.isFinite(parsed.latitude) ||
      !Number.isFinite(parsed.longitude) ||
      !Number.isFinite(parsed.zoom)
    ) {
      return null;
    }

    return {
      latitude: Math.max(-90, Math.min(90, parsed.latitude)),
      longitude: Math.max(-180, Math.min(180, parsed.longitude)),
      zoom: Math.max(2, Math.min(19, parsed.zoom)),
    };
  } catch (error) {
    console.warn("Dashboard map state could not be read:", error);
    return null;
  }
}

function saveMapState(map: LeafletMap) {
  try {
    const center = map.getCenter?.();
    const zoomValue = map.getZoom?.();

    if (
      !center ||
      typeof zoomValue !== "number" ||
      !Number.isFinite(zoomValue)
    ) {
      return;
    }

    const state: StoredMapState = {
      latitude: center.lat,
      longitude: center.lng,
      zoom: zoomValue,
    };

    window.localStorage.setItem(
      DASHBOARD_MAP_STATE_KEY,
      JSON.stringify(state),
    );
  } catch (error) {
    console.warn("Dashboard map state could not be saved:", error);
  }
}

type UserLocation = {
  latitude: number;
  longitude: number;
};

function requestUserLocation(text: (typeof MAP_TEXT)[MapLocale]): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(text.geoUnsupported));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error(text.geoDenied));
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error(text.geoUnavailable));
          return;
        }

        if (error.code === error.TIMEOUT) {
          reject(new Error(text.geoTimeout));
          return;
        }

        reject(new Error(text.geoUnavailable));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  });
}

function createUserLocationHtml(text: (typeof MAP_TEXT)[MapLocale]) {
  return `
    <div class="mioseg-dashboard-user-location" title="${escapeAttr(text.youAreHere)}">
      <span class="mioseg-dashboard-user-location-pulse"></span>
      <span class="mioseg-dashboard-user-location-dot"></span>
    </div>
  `;
}

async function ensureLeaflet(): Promise<LeafletApi | null> {
  if (typeof window === "undefined") return null;

  const leafletWindow = getLeafletWindow();

  if (leafletWindow.L) return leafletWindow.L;

  if (!document.querySelector('link[data-mioseg-dashboard-leaflet="true"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.setAttribute("data-mioseg-dashboard-leaflet", "true");
    document.head.appendChild(link);
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-mioseg-dashboard-leaflet="true"]');
    if (existingScript) {
      if (leafletWindow.L) resolve();
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Leaflet load failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.setAttribute("data-mioseg-dashboard-leaflet", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Leaflet load failed"));
    document.body.appendChild(script);
  });

  return leafletWindow.L ?? null;
}

function buildPopup(point: MapPoint, text: (typeof MAP_TEXT)[MapLocale]) {
  const href = point.href
    ? `<a href="${escapeAttr(point.href)}" style="display:flex;align-items:center;justify-content:center;min-height:40px;border-radius:13px;background:linear-gradient(180deg,#0d1726 0%,#17304d 100%);color:#ffffff;text-decoration:none;font-weight:900;font-size:13px;">${escapeHtml(text.open)} →</a>`
    : "";

  return `
    <div style="width:240px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0e1726;">
      <div style="display:inline-flex;align-items:center;gap:8px;border-radius:999px;background:#eef4fb;color:#28496f;font-size:11px;font-weight:900;padding:7px 10px;margin-bottom:10px;">
        <span style="width:10px;height:10px;border-radius:999px;background:${escapeAttr(getMarkerColor(point.kind))};display:inline-block;"></span>
        ${escapeHtml(getMarkerLabel(point.kind, text))}
      </div>
      <div style="font-weight:950;font-size:17px;line-height:1.25;margin-bottom:7px;">${escapeHtml(point.title)}</div>
      <div style="
  color:#5d6b7d;
  font-size:13px;
  line-height:1.55;
  margin-bottom:10px;
  display:-webkit-box;
  -webkit-line-clamp:5;
  -webkit-box-orient:vertical;
  overflow:hidden;
  text-overflow:ellipsis;
">
  ${escapeHtml(point.description)}
</div>
      ${
        point.locationName
          ? `<div style="color:#5d6b7d;font-size:12px;font-weight:800;margin-bottom:12px;">📍 ${escapeHtml(point.locationName)}</div>`
          : ""
      }
      ${href}
    </div>
  `;
}

function createMarkerHtml(point: MapPoint, active = false) {
  const color = getMarkerColor(point.kind);
  const activeClass = active ? " is-active" : "";

  return `
    <div
      class="mioseg-dashboard-marker${activeClass}"
      title="${escapeAttr(point.title)}"
      style="--marker-color:${escapeAttr(color)};"
    >
      <span class="mioseg-dashboard-marker-focus-ring"></span>
      <span class="mioseg-dashboard-marker-shadow"></span>
      <span class="mioseg-dashboard-marker-pin">
        <span></span>
      </span>
    </div>
  `;
}


type MapCluster = {
  id: string;
  latitude: number;
  longitude: number;
  points: MapPoint[];
};

const CLUSTER_EXPAND_ZOOM = 15;

function getClusterCellSize(zoom: number) {
  if (zoom >= CLUSTER_EXPAND_ZOOM) return 0;

  const degreesPerTile = 360 / Math.pow(2, Math.max(2, zoom));
  return Math.max(0.001, degreesPerTile * 0.72);
}

function clusterMapPoints(points: MapPoint[], zoom: number): MapCluster[] {
  const cellSize = getClusterCellSize(zoom);

  if (cellSize <= 0) {
    return points.map((point) => ({
      id: `point-${point.id}`,
      latitude: point.latitude,
      longitude: point.longitude,
      points: [point],
    }));
  }

  const buckets = new Map<string, MapPoint[]>();

  for (const point of points) {
    const latCell = Math.floor((point.latitude + 90) / cellSize);
    const lngCell = Math.floor((point.longitude + 180) / cellSize);
    const key = `${latCell}:${lngCell}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.push(point);
    } else {
      buckets.set(key, [point]);
    }
  }

  return Array.from(buckets.entries()).map(([key, bucket]) => ({
    id: bucket.length === 1 ? `point-${bucket[0].id}` : `cluster-${key}`,
    latitude:
      bucket.reduce((sum, point) => sum + point.latitude, 0) / bucket.length,
    longitude:
      bucket.reduce((sum, point) => sum + point.longitude, 0) / bucket.length,
    points: bucket,
  }));
}

function createClusterHtml(count: number, text: (typeof MAP_TEXT)[MapLocale]) {
  const size = count >= 100 ? 58 : count >= 10 ? 52 : 46;

  return `
    <div
      class="mioseg-dashboard-cluster"
      title="${escapeAttr(interpolate(text.clusterEntries, count))}"
      style="width:${size}px;height:${size}px;"
    >
      <span>${count}</span>
    </div>
  `;
}


function getNavigationUrl(point: MapPoint) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${point.latitude},${point.longitude}`,
  )}`;
}

async function shareMapPoint(point: MapPoint) {
  const shareUrl =
    point.href && typeof window !== "undefined"
      ? new URL(point.href, window.location.origin).toString()
      : typeof window !== "undefined"
        ? window.location.href
        : "";

  const shareData = {
    title: point.title,
    text: point.locationName
      ? `${point.title} – ${point.locationName}`
      : point.title,
    url: shareUrl,
  };

  if (navigator.share) {
    await navigator.share(shareData);
    return "shared" as const;
  }

  if (shareUrl && navigator.clipboard) {
    await navigator.clipboard.writeText(shareUrl);
    return "copied" as const;
  }

  return "unavailable" as const;
}

export default function DashboardMapClient({ locale }: { locale: string }) {
  const mapLocale = normalizeMapLocale(locale);
  const ui = MAP_TEXT[mapLocale];
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletApi | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const userLocationMarkerRef = useRef<LeafletMarker | null>(null);
  const userIdRef = useRef<string | null>(null);
  const savedQrxIdsRef = useRef<string[]>([]);
  const viewportTimerRef = useRef<number | null>(null);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapZoom, setMapZoom] = useState(6);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shareFeedbackId, setShareFeedbackId] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepareUser() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.warn("Dashboard map user error:", userError.message);
      }

      if (!user || cancelled) {
        setPoints([]);
        setLoading(false);
        return;
      }

      userIdRef.current = user.id;

      const { data, error } = await supabase
        .from("qrx_saves")
        .select("qrx_id")
        .eq("user_id", user.id)
        .returns<SaveRow[]>();

      if (error) {
        console.warn("Dashboard map saves error:", error.message);
        savedQrxIdsRef.current = [];
      } else {
        savedQrxIdsRef.current = Array.from(
          new Set((data ?? []).map((row) => row.qrx_id).filter(Boolean)),
        ) as string[];
      }

      setMapReady(true);
    }

    void prepareUser();

    return () => {
      cancelled = true;
    };
  }, []);


  const loadPointsForViewport = useCallback(
    async (viewport: MapViewport) => {
      const userId = userIdRef.current;
      if (!userId) return;

      setLoading(true);

      const ownQuery = supabase
        .from("qr_x_entries")
        .select(
          "id,title,company_name,description,type,owner_user_id,location_name,location_lat,location_lng,category,verified,follower_count,views_total,cover_image_url,deleted_at,suspended",
        )
        .eq("owner_user_id", userId)
        .is("deleted_at", null)
        .or("suspended.is.null,suspended.eq.false")
        .gte("location_lat", viewport.south)
        .lte("location_lat", viewport.north)
        .gte("location_lng", viewport.west)
        .lte("location_lng", viewport.east);

      const scansQuery = supabase
        .from("user_scans")
        .select("id,name,data,latitude,longitude")
        .eq("user_id", userId)
        .gte("latitude", viewport.south)
        .lte("latitude", viewport.north)
        .gte("longitude", viewport.west)
        .lte("longitude", viewport.east);

      const savedIds = savedQrxIdsRef.current;
      const savedPromise =
        savedIds.length > 0
          ? supabase
              .from("qr_x_entries")
              .select(
                "id,title,company_name,description,type,owner_user_id,location_name,location_lat,location_lng,category,verified,follower_count,views_total,cover_image_url,deleted_at,suspended",
              )
              .in("id", savedIds)
              .is("deleted_at", null)
              .or("suspended.is.null,suspended.eq.false")
              .gte("location_lat", viewport.south)
              .lte("location_lat", viewport.north)
              .gte("location_lng", viewport.west)
              .lte("location_lng", viewport.east)
              .returns<QrxEntry[]>()
          : Promise.resolve({ data: [] as QrxEntry[], error: null });

      const [ownQrxRes, savedQrxRes, scansRes] = await Promise.all([
        ownQuery.returns<QrxEntry[]>(),
        savedPromise,
        scansQuery.returns<UserScan[]>(),
      ]);

      if (ownQrxRes.error) {
        console.warn(
          "Dashboard map own QR-X viewport error:",
          ownQrxRes.error.message,
        );
      }
      if (savedQrxRes.error) {
        console.warn(
          "Dashboard map saved QR-X viewport error:",
          savedQrxRes.error.message,
        );
      }
      if (scansRes.error) {
        console.warn(
          "Dashboard map scans viewport error:",
          scansRes.error.message,
        );
      }

      const ownPoints: MapPoint[] = (ownQrxRes.data ?? [])
        .filter((entry) => entry.deleted_at == null && entry.suspended !== true)
        .filter((entry) =>
          isValidCoordinate(entry.location_lat, entry.location_lng),
        )
        .map((entry) => ({
          id: `own-${entry.id}`,
          rawId: entry.id,
          title: getQrxTitle(entry, ui),
          description: getQrxDescription(entry, ui),
          href: `/qrx/${entry.id}`,
          editHref: `/${locale}/dashboard/qrx/${entry.id}/edit`,
          latitude: entry.location_lat as number,
          longitude: entry.location_lng as number,
          kind: entry.type === "business" ? "own_business" : "own_normal",
          locationName: entry.location_name,
          category: entry.category,
          verified: Boolean(entry.verified),
          followerCount: Number(entry.follower_count ?? 0),
          viewCount: Number(entry.views_total ?? 0),
          coverUrl: entry.cover_image_url,
        }));

      const savedPoints: MapPoint[] = (savedQrxRes.data ?? [])
        .filter((entry) => entry.deleted_at == null && entry.suspended !== true)
        .filter((entry) => entry.owner_user_id !== userId)
        .filter((entry) =>
          isValidCoordinate(entry.location_lat, entry.location_lng),
        )
        .map((entry) => ({
          id: `saved-${entry.id}`,
          rawId: entry.id,
          title: getQrxTitle(entry, ui),
          description: getQrxDescription(entry, ui),
          href: `/qrx/${entry.id}`,
          editHref: null,
          latitude: entry.location_lat as number,
          longitude: entry.location_lng as number,
          kind:
            entry.type === "business" ? "saved_business" : "saved_normal",
          locationName: entry.location_name,
          category: entry.category,
          verified: Boolean(entry.verified),
          followerCount: Number(entry.follower_count ?? 0),
          viewCount: Number(entry.views_total ?? 0),
          coverUrl: entry.cover_image_url,
        }));

      const scanPoints: MapPoint[] = (scansRes.data ?? [])
        .filter((scan) =>
          isValidCoordinate(scan.latitude, scan.longitude),
        )
        .map((scan) => ({
          id: `scan-${scan.id}`,
          rawId: scan.id,
          title: scan.name?.trim() || ui.normalScan,
          description: scan.data?.trim() || ui.savedQrCode,
          href:
            scan.data?.startsWith("http://") ||
            scan.data?.startsWith("https://")
              ? scan.data
              : null,
          editHref: null,
          latitude: scan.latitude as number,
          longitude: scan.longitude as number,
          kind: "scan",
          locationName: scan.name?.trim() || null,
          category: null,
          verified: false,
          followerCount: 0,
          viewCount: 0,
          coverUrl: null,
        }));

      setPoints([...ownPoints, ...savedPoints, ...scanPoints]);
      setLoading(false);
    },
    [locale, ui],
  );

  const filteredPoints = useMemo(() => {
    const query = search.trim().toLowerCase();
    return points.filter((point) => {
      if (!matchesFilter(point, filter)) return false;
      if (!query) return true;
      return [point.title, point.description, point.locationName ?? "", point.category ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [points, filter, search]);

  const clusteredPoints = useMemo(
    () => clusterMapPoints(filteredPoints, mapZoom),
    [filteredPoints, mapZoom],
  );

  useEffect(() => {
    if (!mapReady) return;

    let cancelled = false;

    async function bootMap() {
      if (!mapElRef.current) return;

      const L = await ensureLeaflet();
      if (!L || cancelled || !mapElRef.current) return;

      leafletRef.current = L;

      const storedMapState = readStoredMapState();
      const initialCenter: [number, number] = storedMapState
        ? [storedMapState.latitude, storedMapState.longitude]
        : [51.0, 9.0];
      const initialZoom = storedMapState?.zoom ?? 6;

      const map = L.map(mapElRef.current, {
        scrollWheelZoom: true,
        zoomControl: true,
      }).setView(initialCenter, initialZoom);

      mapRef.current = map;
      setMapZoom(initialZoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const loadCurrentViewport = () => {
        const bounds = map.getBounds();
        setMapZoom(map.getZoom?.() ?? initialZoom);
        saveMapState(map);

        if (viewportTimerRef.current) {
          window.clearTimeout(viewportTimerRef.current);
        }

        viewportTimerRef.current = window.setTimeout(() => {
          void loadPointsForViewport(viewportFromBounds(bounds));
        }, 250);
      };

      map.on("moveend", loadCurrentViewport);
      map.on("zoomend", loadCurrentViewport);

      loadCurrentViewport();
    }

    void bootMap();

    return () => {
      cancelled = true;

      if (viewportTimerRef.current) {
        window.clearTimeout(viewportTimerRef.current);
      }

      if (mapRef.current) {
        if (userLocationMarkerRef.current) {
          mapRef.current.removeLayer(userLocationMarkerRef.current);
          userLocationMarkerRef.current = null;
        }

        saveMapState(mapRef.current);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loadPointsForViewport, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;

    if (!map || !L) return;

    Object.values(markersRef.current).forEach((marker) => {
      map.removeLayer(marker);
    });

    markersRef.current = {};

    clusteredPoints.forEach((cluster) => {
      const isSinglePoint = cluster.points.length === 1;
      const point = cluster.points[0];

      const icon = L.divIcon({
        className: "",
        html: isSinglePoint
          ? createMarkerHtml(point, activeId === point.id)
          : createClusterHtml(cluster.points.length, ui),
        iconSize: isSinglePoint ? [42, 42] : [58, 58],
        iconAnchor: isSinglePoint ? [21, 39] : [29, 29],
      });

      const marker = L.marker(
        [cluster.latitude, cluster.longitude],
        { icon },
      ).addTo(map);

      if (isSinglePoint) {
        marker.bindPopup(buildPopup(point, ui), {
          maxWidth: 280,
          className: "miosegDashboardPopup",
        });

        marker.on("click", () => setActiveId(point.id));
        marker.on("popupopen", () => setActiveId(point.id));
        markersRef.current[point.id] = marker;
        return;
      }

      marker.on("click", () => {
        setActiveId(null);

        const bounds = cluster.points.map(
          (clusterPoint) =>
            [
              clusterPoint.latitude,
              clusterPoint.longitude,
            ] as [number, number],
        );

        map.fitBounds(bounds, {
          padding: [54, 54],
          maxZoom: CLUSTER_EXPAND_ZOOM,
        });
      });

      markersRef.current[cluster.id] = marker;
    });

    const mapBounds = map.getBounds();
    const ids = filteredPoints
      .filter(
        (point) =>
          point.latitude >= mapBounds.getSouth() &&
          point.latitude <= mapBounds.getNorth() &&
          point.longitude >= mapBounds.getWest() &&
          point.longitude <= mapBounds.getEast(),
      )
      .map((point) => point.id);

    setVisibleIds(ids);

    if (activeId) {
      const activeMarker = markersRef.current[activeId];
      if (activeMarker) {
        window.setTimeout(() => activeMarker.openPopup(), 80);
      }
    }
  }, [activeId, clusteredPoints, filteredPoints, ui]);


  const visiblePoints = useMemo(() => {
    if (visibleIds.length === 0) return filteredPoints;
    const ids = new Set(visibleIds);
    return filteredPoints.filter((point) => ids.has(point.id));
  }, [filteredPoints, visibleIds]);

  const focusPoint = (point: MapPoint) => {
    const map = mapRef.current;
    if (!map) return;

    setActiveId(point.id);

    const target: [number, number] = [
      point.latitude,
      point.longitude,
    ];
    const zoom = Math.max(
      CLUSTER_EXPAND_ZOOM,
      map.getZoom?.() ?? CLUSTER_EXPAND_ZOOM,
    );

    if (map.flyTo) {
      map.flyTo(target, zoom, {
        animate: true,
        duration: 0.75,
      });
    } else {
      map.setView(target, zoom, { animate: true });
    }
  };

  const handleSharePoint = async (point: MapPoint) => {
    try {
      const result = await shareMapPoint(point);

      if (result === "copied") {
        setShareFeedbackId(point.id);
        window.setTimeout(() => {
          setShareFeedbackId((current) =>
            current === point.id ? null : current,
          );
        }, 1800);
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.warn("Dashboard share error:", error);
    }
  };

  const handleLocateUser = async () => {
    const map = mapRef.current;
    const L = leafletRef.current;

    if (!map || !L || locatingUser) return;

    setLocatingUser(true);
    setLocationError(null);

    try {
      const location = await requestUserLocation(ui);

      const target: [number, number] = [
        location.latitude,
        location.longitude,
      ];

      if (userLocationMarkerRef.current) {
        map.removeLayer(userLocationMarkerRef.current);
        userLocationMarkerRef.current = null;
      }

      const icon = L.divIcon({
        className: "",
        html: createUserLocationHtml(ui),
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker(target, { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,system-ui,sans-serif;font-weight:900;color:#0f172a;">${escapeHtml(ui.youAreHere)}</div>`,
          {
            maxWidth: 220,
            className: "miosegDashboardPopup",
          },
        );

      userLocationMarkerRef.current = marker;

      const zoom = Math.max(15, map.getZoom?.() ?? 15);

      if (map.flyTo) {
        map.flyTo(target, zoom, {
          animate: true,
          duration: 0.75,
        });
      } else {
        map.setView(target, zoom, { animate: true });
      }

      window.setTimeout(() => marker.openPopup(), 260);
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : ui.geoUnavailable,
      );
    } finally {
      setLocatingUser(false);
    }
  };

  const countByKind = filteredPoints.reduce<Record<MarkerKind, number>>(
    (acc, point) => {
      acc[point.kind] += 1;
      return acc;
    },
    {
      own_business: 0,
      saved_business: 0,
      own_normal: 0,
      saved_normal: 0,
      scan: 0,
    }
  );

  return (
    <div>
      <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={ui.searchPlaceholder}
          style={{
            width: "100%",
            minHeight: 46,
            borderRadius: 15,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.045)",
            color: "#ffffff",
            padding: "0 14px",
            outline: "none",
            fontWeight: 750,
          }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {FILTERS.map((value) => {
            const active = filter === value;
            const label =
              value === "all" ? ui.filterAll :
              value === "own" ? ui.filterOwn :
              value === "saved" ? ui.filterSaved :
              value === "business" ? ui.filterBusiness :
              value === "normal" ? ui.filterNormal :
              value === "scan" ? ui.filterScan : ui.filterVerified;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                style={{
                  minHeight: 38,
                  borderRadius: 999,
                  border: active ? "1px solid #ffffff" : "1px solid rgba(255,255,255,0.1)",
                  background: active ? "#ffffff" : "rgba(255,255,255,0.045)",
                  color: active ? "#0f172a" : "#cbd5e1",
                  padding: "0 13px",
                  cursor: "pointer",
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            color: "#94a3b8",
            fontSize: 11,
            fontWeight: 850,
          }}
        >
          <span>
            {filteredPoints.length} {filteredPoints.length === 1 ? ui.entry : ui.entries} {ui.loaded}
          </span>
          <span>
            {mapZoom >= CLUSTER_EXPAND_ZOOM
              ? ui.singleMarkers
              : interpolate(ui.groupedMarkers, clusteredPoints.length)}
          </span>
        </div>
      </div>

      <div className="mioseg-dashboard-map-grid">
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            minHeight: 520,
            background: "#edf3f9",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            type="button"
            onClick={() => void handleLocateUser()}
            disabled={locatingUser || !mapReady}
            title={ui.showMyPosition}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              zIndex: 6,
              minHeight: 42,
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.16)",
              background: "#ffffff",
              color: "#0f172a",
              padding: "0 14px",
              cursor: locatingUser ? "wait" : "pointer",
              fontWeight: 900,
              boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
              opacity: !mapReady ? 0.55 : 1,
            }}
          >
            {locatingUser ? ui.locating : `◎ ${ui.myPosition}`}
          </button>

          {locationError ? (
            <div
              role="alert"
              style={{
                position: "absolute",
                top: 64,
                right: 14,
                zIndex: 6,
                maxWidth: 290,
                borderRadius: 14,
                padding: "10px 12px",
                background: "rgba(127,29,29,0.94)",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 800,
                lineHeight: 1.4,
                boxShadow: "0 12px 28px rgba(15,23,42,0.2)",
              }}
            >
              {locationError}
            </div>
          ) : null}

          {loading ? (
            <div style={{
              position: "absolute", inset: 0, zIndex: 5, display: "grid", placeItems: "center",
              background: "rgba(15,23,42,0.72)", color: "#ffffff", fontWeight: 950
            }}>
              {ui.mapLoading}
            </div>
          ) : null}

          {!loading && filteredPoints.length === 0 ? (
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                bottom: 16,
                zIndex: 5,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  maxWidth: 520,
                  borderRadius: 16,
                  padding: "11px 14px",
                  textAlign: "center",
                  background: "rgba(15,23,42,0.88)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#cbd5e1",
                  fontWeight: 850,
                  lineHeight: 1.45,
                  boxShadow: "0 12px 28px rgba(15,23,42,0.22)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {ui.mapEmpty}
              </div>
            </div>
          ) : null}

          <div
            ref={mapElRef}
            style={{
              width: "100%",
              height: 520,
              position: "relative",
              zIndex: 1,
              background: "#dbeafe",
            }}
          />
        </div>

        <aside className="mioseg-dashboard-visible-list">
          <div style={{
            padding: 16, borderBottom: "1px solid rgba(255,255,255,0.075)",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12
          }}>
            <div>
              <strong style={{ color: "#ffffff", fontSize: 18 }}>{ui.visibleEntries}</strong>
              <div style={{ marginTop: 4, color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>
                {ui.currentMapArea}
              </div>
            </div>
            <span style={{
              minWidth: 34, height: 34, borderRadius: 999, display: "grid", placeItems: "center",
              background: "rgba(59,130,246,0.14)", border: "1px solid rgba(147,197,253,0.16)",
              color: "#bfdbfe", fontWeight: 950
            }}>
              {visiblePoints.length}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "grid", alignContent: "start", gap: 10 }}>
            {visiblePoints.length === 0 ? (
              <div style={{
                borderRadius: 18, padding: 18, background: "rgba(255,255,255,0.035)",
                color: "#94a3b8", lineHeight: 1.55, fontWeight: 800
              }}>
                {ui.noVisible}
              </div>
            ) : (
              visiblePoints.map((point) => {
                const active = activeId === point.id;
                return (
                  <article
                    key={point.id}
                    onClick={() => focusPoint(point)}
                    style={{
                      cursor: "pointer", borderRadius: 18, padding: 12,
                      background: active
                        ? "linear-gradient(180deg,rgba(37,99,235,0.18),rgba(124,58,237,0.12))"
                        : "rgba(255,255,255,0.045)",
                      border: active
                        ? "1px solid rgba(147,197,253,0.34)"
                        : "1px solid rgba(255,255,255,0.075)",
                    }}
                  >
                    {point.coverUrl ? (
                      <img
                        src={point.coverUrl}
                        alt={point.title}
                        style={{ width: "100%", height: 92, objectFit: "cover", borderRadius: 14, marginBottom: 10 }}
                      />
                    ) : null}

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: getMarkerColor(point.kind) }} />
                      <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>
                        {getMarkerLabel(point.kind, ui)}
                      </span>
                    </div>

                    <strong style={{ display: "block", color: "#ffffff", fontSize: 15 }}>
                      {point.title}
                    </strong>

                    {point.locationName ? (
                      <div style={{ marginTop: 5, color: "#94a3b8", fontSize: 12 }}>📍 {point.locationName}</div>
                    ) : null}

                    <div style={{ marginTop: 8, display: "flex", gap: 9, flexWrap: "wrap", color: "#cbd5e1", fontSize: 11, fontWeight: 800 }}>
                      {point.verified ? <span>✓ {ui.verified}</span> : null}
                      <span>👥 {formatNumber(point.followerCount, mapLocale)}</span>
                      <span>👁 {formatNumber(point.viewCount, mapLocale)}</span>
                    </div>

                    <div
                      onClick={(event) => event.stopPropagation()}
                      className="mioseg-dashboard-quick-actions"
                    >
                      {point.href ? (
                        <a
                          href={point.href}
                          className="mioseg-dashboard-list-button primary"
                        >
                          {ui.open}
                        </a>
                      ) : null}

                      {point.editHref ? (
                        <a
                          href={point.editHref}
                          className="mioseg-dashboard-list-button"
                        >
                          {ui.edit}
                        </a>
                      ) : null}

                      <a
                        href={getNavigationUrl(point)}
                        target="_blank"
                        rel="noreferrer"
                        className="mioseg-dashboard-list-button"
                      >
                        {ui.navigation}
                      </a>

                      <button
                        type="button"
                        onClick={() => void handleSharePoint(point)}
                        className="mioseg-dashboard-list-button"
                      >
                        {shareFeedbackId === point.id
                          ? ui.linkCopied
                          : ui.share}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </aside>
      </div>

      <div
        style={{
          marginTop: "14px",
          borderRadius: "22px",
          padding: "16px",
          background: "rgba(255,255,255,0.045)",
          border: "1px solid rgba(255,255,255,0.075)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            marginBottom: legendOpen ? "14px" : 0,
          }}
        >
          <strong style={{ color: "#ffffff", fontSize: "18px" }}>🗺️ {ui.legend}</strong>
          <button
            type="button"
            onClick={() => setLegendOpen((value) => !value)}
            style={{
              border: 0,
              background: "transparent",
              color: "#bfdbfe",
              cursor: "pointer",
              fontWeight: 950,
            }}
          >
            {legendOpen ? ui.hide : ui.show}
          </button>
        </div>

        {legendOpen ? (
          <div style={{ display: "grid", gap: "10px" }}>
            {([
              ["own_business", ui.legendOwnBusiness],
              ["saved_business", ui.legendSavedBusiness],
              ["own_normal", ui.legendOwnNormal],
              ["saved_normal", ui.legendSavedNormal],
              ["scan", ui.legendScan],
            ] as const).map(([kind, label]) => (
              <div
                key={kind}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#cbd5e1",
                  fontSize: "14px",
                  fontWeight: 850,
                }}
              >
                <span
                  style={{
                    width: "13px",
                    height: "13px",
                    borderRadius: "999px",
                    background: getMarkerColor(kind),
                    display: "inline-block",
                    boxShadow: "0 0 0 4px rgba(255,255,255,0.04)",
                  }}
                />
                <span>{label}</span>
                <span style={{ marginLeft: "auto", color: "#94a3b8" }}>{countByKind[kind]}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.mioseg-dashboard-map-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.85fr);
  gap: 14px;
  align-items: stretch;
}

.mioseg-dashboard-visible-list {
  min-height: 520px;
  max-height: 520px;
  overflow: hidden;
  border-radius: 24px;
  background: rgba(255,255,255,0.045);
  border: 1px solid rgba(255,255,255,0.075);
  display: flex;
  flex-direction: column;
}

.mioseg-dashboard-quick-actions {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.mioseg-dashboard-quick-actions button {
  font: inherit;
  cursor: pointer;
}

.mioseg-dashboard-list-button {
  min-height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  color: #ffffff;
  text-decoration: none;
  font-weight: 900;
  font-size: 12px;
  padding: 0 10px;
  cursor: pointer;
}

.mioseg-dashboard-list-button.primary {
  background: linear-gradient(180deg,#2563eb,#7c3aed);
  border-color: transparent;
}

@media (max-width: 980px) {
  .mioseg-dashboard-map-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .mioseg-dashboard-quick-actions {
    grid-template-columns: 1fr;
  }
}

.mioseg-dashboard-user-location {
  position: relative;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
}

.mioseg-dashboard-user-location-pulse {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(37,99,235,0.2);
  animation: mioseg-dashboard-location-pulse 1.8s ease-out infinite;
}

.mioseg-dashboard-user-location-dot {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #2563eb;
  border: 3px solid #ffffff;
  box-shadow: 0 8px 20px rgba(37,99,235,0.42);
}

@keyframes mioseg-dashboard-location-pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.mioseg-dashboard-cluster {
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(145deg,#2563eb,#7c3aed);
  border: 4px solid rgba(255,255,255,0.96);
  color: #ffffff;
  font-size: 15px;
  font-weight: 950;
  cursor: pointer;
  box-shadow:
    0 16px 34px rgba(0,0,0,0.30),
    0 0 0 7px rgba(59,130,246,0.16);
  transform-origin: center;
  transition: transform 150ms ease;
}

.mioseg-dashboard-cluster:hover {
  transform: scale(1.08);
}

.mioseg-dashboard-cluster span {
  display: grid;
  place-items: center;
  min-width: 28px;
  min-height: 28px;
}

.mioseg-dashboard-marker {
  position: relative;
  width: 42px;
  height: 42px;
  transform-origin: 50% 90%;
  animation: mioseg-dashboard-marker-enter 220ms ease-out both;
}

.mioseg-dashboard-marker-focus-ring {
  position: absolute;
  inset: -7px;
  border-radius: 999px;
  border: 3px solid rgba(255,255,255,0);
  background: rgba(59,130,246,0);
  transform: scale(0.76);
  opacity: 0;
  transition:
    transform 180ms ease,
    opacity 180ms ease,
    border-color 180ms ease,
    background 180ms ease;
}

.mioseg-dashboard-marker-shadow {
  position: absolute;
  left: 7px;
  right: 7px;
  bottom: 0;
  height: 10px;
  border-radius: 999px;
  background: rgba(15,23,42,0.26);
  filter: blur(5px);
  transition: transform 180ms ease, opacity 180ms ease;
}

.mioseg-dashboard-marker-pin {
  position: absolute;
  inset: 0;
  background: var(--marker-color);
  border: 3px solid #ffffff;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 16px 34px rgba(0,0,0,0.28);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.mioseg-dashboard-marker-pin span {
  position: absolute;
  inset: 9px;
  border-radius: 999px;
  background: rgba(15,23,42,0.18);
  border: 2px solid rgba(255,255,255,0.42);
}

.mioseg-dashboard-marker:hover .mioseg-dashboard-marker-pin {
  transform: rotate(-45deg) scale(1.08);
  box-shadow: 0 20px 40px rgba(0,0,0,0.34);
}

.mioseg-dashboard-marker.is-active {
  z-index: 20;
}

.mioseg-dashboard-marker.is-active .mioseg-dashboard-marker-focus-ring {
  opacity: 1;
  transform: scale(1);
  border-color: rgba(255,255,255,0.96);
  background: rgba(59,130,246,0.18);
  box-shadow:
    0 0 0 7px rgba(59,130,246,0.16),
    0 0 26px rgba(96,165,250,0.72);
  animation: mioseg-dashboard-active-ring 1.7s ease-in-out infinite;
}

.mioseg-dashboard-marker.is-active .mioseg-dashboard-marker-pin {
  transform: rotate(-45deg) scale(1.14);
  box-shadow:
    0 20px 44px rgba(0,0,0,0.38),
    0 0 24px rgba(96,165,250,0.62);
  filter: saturate(1.12) brightness(1.06);
}

.mioseg-dashboard-marker.is-active .mioseg-dashboard-marker-shadow {
  transform: scale(1.16);
  opacity: 0.88;
}

@keyframes mioseg-dashboard-marker-enter {
  from {
    opacity: 0;
    transform: translateY(-7px) scale(0.82);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes mioseg-dashboard-active-ring {
  0%,
  100% {
    box-shadow:
      0 0 0 5px rgba(59,130,246,0.14),
      0 0 20px rgba(96,165,250,0.52);
  }
  50% {
    box-shadow:
      0 0 0 9px rgba(59,130,246,0.08),
      0 0 30px rgba(96,165,250,0.78);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mioseg-dashboard-marker,
  .mioseg-dashboard-marker.is-active .mioseg-dashboard-marker-focus-ring {
    animation: none;
  }

  .mioseg-dashboard-marker-pin,
  .mioseg-dashboard-marker-shadow,
  .mioseg-dashboard-marker-focus-ring {
    transition: none;
  }
}

.miosegDashboardPopup .leaflet-popup-content-wrapper {
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(13,23,38,0.22);
}

.miosegDashboardPopup .leaflet-popup-content {
  margin: 14px;
}
          `.trim(),
        }}
      />
    </div>
  );
}
