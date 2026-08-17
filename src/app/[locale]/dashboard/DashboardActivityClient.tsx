"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";


const SUPPORTED_ACTIVITY_LOCALES = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;
type ActivityLocale = (typeof SUPPORTED_ACTIVITY_LOCALES)[number];

type ActivityCopy = {
  untitledQrx: string;
  unknownTime: string;
  changedTitle: string;
  changedDescription: string;
  changedNews: string;
  changedImages: string;
  changedFiles: string;
  changedSuffix: string;
  contentChanged: string;
  savedQrx: string;
  loading: string;
  empty: string;
  changedBadge: string;
};

const ACTIVITY_TEXT: Record<ActivityLocale, ActivityCopy> = {
  de: {
    untitledQrx: "Unbenannter QR-X",
    unknownTime: "Unbekannter Zeitpunkt",
    changedTitle: "Titel",
    changedDescription: "Beschreibung",
    changedNews: "News",
    changedImages: "Bilder",
    changedFiles: "Dateien",
    changedSuffix: "geändert",
    contentChanged: "Inhalt geändert",
    savedQrx: "Gespeicherter QR-X",
    loading: "Änderungen werden geladen …",
    empty: "Seit dem Speichern gab es noch keine Änderungen an deinen gespeicherten QR-X.",
    changedBadge: "Gespeicherter QR-X geändert",
  },
  en: {
    untitledQrx: "Untitled QR-X",
    unknownTime: "Unknown time",
    changedTitle: "Title",
    changedDescription: "Description",
    changedNews: "News",
    changedImages: "Images",
    changedFiles: "Files",
    changedSuffix: "changed",
    contentChanged: "Content changed",
    savedQrx: "Saved QR-X",
    loading: "Loading changes …",
    empty: "There have been no changes to your saved QR-X since you saved them.",
    changedBadge: "Saved QR-X changed",
  },
  tr: {
    untitledQrx: "Adsız QR-X",
    unknownTime: "Bilinmeyen zaman",
    changedTitle: "Başlık",
    changedDescription: "Açıklama",
    changedNews: "Haberler",
    changedImages: "Görseller",
    changedFiles: "Dosyalar",
    changedSuffix: "değiştirildi",
    contentChanged: "İçerik değiştirildi",
    savedQrx: "Kaydedilen QR-X",
    loading: "Değişiklikler yükleniyor …",
    empty: "Kaydettiğinizden beri kayıtlı QR-X'lerinizde herhangi bir değişiklik olmadı.",
    changedBadge: "Kaydedilen QR-X değiştirildi",
  },
  pl: {
    untitledQrx: "QR-X bez nazwy",
    unknownTime: "Nieznany czas",
    changedTitle: "Tytuł",
    changedDescription: "Opis",
    changedNews: "Aktualności",
    changedImages: "Obrazy",
    changedFiles: "Pliki",
    changedSuffix: "zmieniono",
    contentChanged: "Zmieniono zawartość",
    savedQrx: "Zapisany QR-X",
    loading: "Ładowanie zmian …",
    empty: "Od momentu zapisania nie było żadnych zmian w zapisanych QR-X.",
    changedBadge: "Zapisany QR-X został zmieniony",
  },
  ar: {
    untitledQrx: "QR-X بدون اسم",
    unknownTime: "وقت غير معروف",
    changedTitle: "العنوان",
    changedDescription: "الوصف",
    changedNews: "الأخبار",
    changedImages: "الصور",
    changedFiles: "الملفات",
    changedSuffix: "تم التغيير",
    contentChanged: "تم تغيير المحتوى",
    savedQrx: "QR-X محفوظ",
    loading: "جارٍ تحميل التغييرات …",
    empty: "لم تحدث أي تغييرات على QR-X المحفوظة منذ حفظها.",
    changedBadge: "تم تغيير QR-X محفوظ",
  },
  fr: {
    untitledQrx: "QR-X sans titre",
    unknownTime: "Heure inconnue",
    changedTitle: "Titre",
    changedDescription: "Description",
    changedNews: "Actualités",
    changedImages: "Images",
    changedFiles: "Fichiers",
    changedSuffix: "modifié",
    contentChanged: "Contenu modifié",
    savedQrx: "QR-X enregistré",
    loading: "Chargement des modifications …",
    empty: "Aucune modification n’a été apportée à vos QR-X enregistrés depuis leur enregistrement.",
    changedBadge: "QR-X enregistré modifié",
  },
  es: {
    untitledQrx: "QR-X sin título",
    unknownTime: "Hora desconocida",
    changedTitle: "Título",
    changedDescription: "Descripción",
    changedNews: "Noticias",
    changedImages: "Imágenes",
    changedFiles: "Archivos",
    changedSuffix: "modificado",
    contentChanged: "Contenido modificado",
    savedQrx: "QR-X guardado",
    loading: "Cargando cambios …",
    empty: "No ha habido cambios en tus QR-X guardados desde que los guardaste.",
    changedBadge: "QR-X guardado modificado",
  },
  it: {
    untitledQrx: "QR-X senza titolo",
    unknownTime: "Ora sconosciuta",
    changedTitle: "Titolo",
    changedDescription: "Descrizione",
    changedNews: "Novità",
    changedImages: "Immagini",
    changedFiles: "File",
    changedSuffix: "modificato",
    contentChanged: "Contenuto modificato",
    savedQrx: "QR-X salvato",
    loading: "Caricamento modifiche …",
    empty: "Non ci sono state modifiche ai QR-X salvati da quando li hai salvati.",
    changedBadge: "QR-X salvato modificato",
  },
};

function normalizeActivityLocale(value: string): ActivityLocale {
  return SUPPORTED_ACTIVITY_LOCALES.includes(value as ActivityLocale)
    ? (value as ActivityLocale)
    : "de";
}


type ActivityItem = {
  id: string;
  qrxId: string;
  title: string;
  occurredAt: string;
  detail: string;
};

type SavedQrxRow = {
  qrx_id: string;
  created_at: string;
};

type QrxEntryRow = {
  id: string;
  title: string | null;
  company_name: string | null;
  owner_user_id: string | null;
  deleted_at: string | null;
};

type QrxUpdateRow = {
  id: string;
  qrx_id: string;
  created_at: string;
  changed_title: boolean | null;
  changed_description: boolean | null;
  changed_news: boolean | null;
  changed_images: boolean | null;
  changed_files: boolean | null;
};

function getTitle(row: QrxEntryRow, ui: ActivityCopy) {
  return row.company_name?.trim() || row.title?.trim() || ui.untitledQrx;
}

function formatDate(value: string, locale: ActivityLocale, ui: ActivityCopy) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return ui.unknownTime;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildUpdateDetail(row: QrxUpdateRow, ui: ActivityCopy) {
  const parts: string[] = [];

  if (row.changed_title) parts.push(ui.changedTitle);
  if (row.changed_description) parts.push(ui.changedDescription);
  if (row.changed_news) parts.push(ui.changedNews);
  if (row.changed_images) parts.push(ui.changedImages);
  if (row.changed_files) parts.push(ui.changedFiles);

  return parts.length > 0
    ? `${parts.join(", ")} ${ui.changedSuffix}`
    : ui.contentChanged;
}

export default function DashboardActivityClient({
  locale,
}: {
  locale: string;
}) {
  const activityLocale = normalizeActivityLocale(locale);
  const ui = ACTIVITY_TEXT[activityLocale];
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.warn("Dashboard activities user error:", userError.message);
    }

    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: saveRows, error: savesError } = await supabase
      .from("qrx_saves")
      .select("qrx_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<SavedQrxRow[]>();

    if (savesError) {
      console.warn("Dashboard saved QR-X error:", savesError.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const saves = saveRows ?? [];
    const savedIds = Array.from(
      new Set(saves.map((row) => row.qrx_id).filter(Boolean)),
    );

    if (savedIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const savedAtMap = new Map(
      saves.map((row) => [row.qrx_id, new Date(row.created_at).getTime()]),
    );

    const { data: entryRows, error: entriesError } = await supabase
      .from("qr_x_entries")
      .select("id,title,company_name,owner_user_id,deleted_at")
      .in("id", savedIds)
      .is("deleted_at", null)
      .returns<QrxEntryRow[]>();

    if (entriesError) {
      console.warn("Dashboard saved entries error:", entriesError.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const foreignEntries = (entryRows ?? []).filter(
      (entry) => entry.owner_user_id !== user.id,
    );
    const foreignIds = foreignEntries.map((entry) => entry.id);

    if (foreignIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const titleMap = new Map(
      foreignEntries.map((entry) => [entry.id, getTitle(entry, ui)]),
    );

    const { data: updateRows, error: updatesError } = await supabase
      .from("qrx_updates")
      .select(
        "id,qrx_id,created_at,changed_title,changed_description,changed_news,changed_images,changed_files",
      )
      .in("qrx_id", foreignIds)
      .order("created_at", { ascending: false })
      .limit(60)
      .returns<QrxUpdateRow[]>();

    if (updatesError) {
      console.warn("Dashboard saved updates error:", updatesError.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const activities: ActivityItem[] = (updateRows ?? [])
      .filter((row) => {
        const savedAt = savedAtMap.get(row.qrx_id) ?? 0;
        const updatedAt = new Date(row.created_at).getTime();
        return Number.isFinite(updatedAt) && updatedAt > savedAt;
      })
      .map((row) => ({
        id: `saved-update-${row.id}`,
        qrxId: row.qrx_id,
        title: titleMap.get(row.qrx_id) || ui.savedQrx,
        occurredAt: row.created_at,
        detail: buildUpdateDetail(row, ui),
      }))
      .slice(0, 12);

    setItems(activities);
    setLoading(false);
  }

  const empty = useMemo(() => !loading && items.length === 0, [loading, items]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "120px",
          display: "grid",
          placeItems: "center",
          color: "#94a3b8",
          fontWeight: 850,
        }}
      >
        {ui.loading}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        style={{
          borderRadius: "20px",
          padding: "18px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#94a3b8",
          lineHeight: 1.55,
          fontWeight: 800,
        }}
      >
        {ui.empty}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "10px",
      }}
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/${activityLocale}/qrx/${item.qrxId}`}
          style={{
            minHeight: "94px",
            borderRadius: "20px",
            padding: "14px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.075)",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: "42px",
              height: "42px",
              flex: "0 0 auto",
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              background: "rgba(245,158,11,0.11)",
              color: "#fde68a",
              fontSize: "18px",
              fontWeight: 950,
            }}
          >
            ↻
          </span>

          <span style={{ minWidth: 0, flex: 1 }}>
            <span
              style={{
                display: "block",
                color: "#fde68a",
                fontSize: "10px",
                fontWeight: 950,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {ui.changedBadge}
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "4px",
                color: "#ffffff",
                fontSize: "14px",
                lineHeight: 1.3,
              }}
            >
              {item.title}
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "4px",
                color: "#94a3b8",
                fontSize: "11px",
                lineHeight: 1.4,
              }}
            >
              {item.detail} · {formatDate(item.occurredAt, activityLocale, ui)}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
