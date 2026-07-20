"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import CollectionPreview, { type QrxCollectionPreviewItem } from "@/components/qrx/CollectionPreview";
import QrxActionsSection from "@/components/qrx/QrxActionsSection";
import QrxHeroSection from "@/components/qrx/QrxHeroSection";
import QrxMediaSection, { type QrxMediaDisplayItem } from "@/components/qrx/QrxMediaSection";
import QrxNewsSection from "@/components/qrx/QrxNewsSection";
import QrxStatsSection from "@/components/qrx/QrxStatsSection";
import { getBestMediaUrl, getMediaById } from "@/lib/media";
import { supabase } from "@/lib/supabase";
import styles from "../../dashboard/dashboard.module.css";

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

type NewsItem = {
  text: string;
  createdAt: string;
};

const BUSINESS_CATEGORY_OPTIONS: Array<{
  value: BusinessCategory;
  label: string;
  icon: string;
}> = [
  { value: "praxis_gesundheit", label: "Praxis & Gesundheit", icon: "🏥" },
  { value: "gastronomie", label: "Gastronomie", icon: "🍽️" },
  { value: "unternehmen", label: "Unternehmen", icon: "🏢" },
  { value: "dienstleistung", label: "Dienstleistung", icon: "🛠️" },
  { value: "handwerk", label: "Handwerk", icon: "🔨" },
  { value: "event", label: "Event", icon: "📅" },
  { value: "verein", label: "Verein", icon: "👥" },
  { value: "wohltaetigkeit", label: "Wohltätigkeit", icon: "♡" },
  { value: "sehenswuerdigkeit", label: "Sehenswürdigkeit", icon: "📷" },
  { value: "sonstiges", label: "Sonstiges", icon: "▦" },
];

function getBusinessCategoryMeta(value: string | null | undefined) {
  if (!value) return null;
  return BUSINESS_CATEGORY_OPTIONS.find((item) => item.value === value) ?? null;
}

type QrxEntry = {
  id: string;
  owner_user_id: string | null;
  title: string | null;
  company_name: string | null;
  description: string | null;
  news: NewsItem[] | null;
  type: "normal" | "business" | string | null;
  category: string | null;
  verified: boolean | null;
  suspended: boolean | null;
  deleted_at: string | null;
  cover_image_url: string | null;
  cover_media_id?: string | null;
  logo_url: string | null;
  logo_media_id?: string | null;
  force_original_quality?: boolean | null;
  location_name: string | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_email: string | null;
  cta_navigation: string | null;
  views_total: number | null;
  follower_count: number | null;
  created_at: string | null;
};

type MediaAnalyticsEvent =
  "image_view" | "file_open" | "file_download" | "variant_delivery";

type MediaVariant = "thumb" | "medium" | "large" | "original";

type QrxMedia = {
  id: string;
  type: "image" | "file" | string;
  url: string;
  filename: string | null;
  bytes?: number | null;
  original_url?: string | null;
  large_url?: string | null;
  medium_url?: string | null;
  thumb_url?: string | null;
};

type TransferHistoryItem = {
  id?: string;
  transfer_id?: string;
  qrx_id?: string;
  status?: string;
  created_at?: string;
  accepted_at?: string | null;
  expires_at?: string | null;
  from_user_id?: string | null;
  from_name?: string | null;
  to_user_id?: string | null;
  to_name?: string | null;
  recipient_email?: string | null;
};

type CollectionRow = {
  linked_qrx_id: string;
  sort_order: number | null;
  custom_title: string | null;
  qr_x_entries: QrxCollectionPreviewItem | QrxCollectionPreviewItem[] | null;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim())
    return value[0];
  return fallback;
}

function getDisplayTitle(entry: QrxEntry | null) {
  if (!entry) return "QR-X";
  return entry.company_name?.trim() || entry.title?.trim() || "QR-X";
}

function getSubtitleTitle(entry: QrxEntry | null) {
  if (!entry) return null;
  const company = entry.company_name?.trim();
  const title = entry.title?.trim();

  if (company && title && company !== title) return title;
  return null;
}

function normalizeUrl(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeNavigationUrl(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

function formatNumber(value: number | null | undefined) {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "0";

  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, numberValue));
}

function formatDate(value: string | null | undefined) {
  if (!value) return "–";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeNewsItems(value: NewsItem[] | null | undefined) {
  const raw = Array.isArray(value) ? value : [];

  return raw
    .filter(
      (item) => typeof item?.text === "string" && item.text.trim().length > 0,
    )
    .map((item, index) => ({
      id: `${item.createdAt ?? "news"}-${index}`,
      text: item.text.trim(),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
    }))
    .sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });
}

function getAnalyticsSessionId() {
  if (typeof window === "undefined") return null;

  const storageKey = "mioseg_qrx_media_session_id";
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.sessionStorage.setItem(storageKey, generated);
  return generated;
}

function getMediaVariant(
  mediaItem: QrxMedia,
  purpose: "gallery" | "fullscreen",
  forceOriginal: boolean,
): MediaVariant {
  if (forceOriginal) return "original";

  if (purpose === "gallery") {
    if (mediaItem.medium_url) return "medium";
    if (mediaItem.large_url) return "large";
    if (mediaItem.thumb_url) return "thumb";
    return "original";
  }

  if (mediaItem.large_url) return "large";
  if (mediaItem.medium_url) return "medium";
  if (mediaItem.thumb_url) return "thumb";
  return "original";
}

function shouldTrackMediaEvent(
  eventType: MediaAnalyticsEvent,
  mediaId: string,
  variant: MediaVariant,
) {
  if (typeof window === "undefined") return false;

  const key = `mioseg_media_event:${eventType}:${mediaId}:${variant}`;
  const now = Date.now();
  const previous = Number(window.sessionStorage.getItem(key) ?? 0);
  const dedupeWindowMs = 30 * 60 * 1000;

  if (Number.isFinite(previous) && now - previous < dedupeWindowMs) {
    return false;
  }

  window.sessionStorage.setItem(key, String(now));
  return true;
}

export default function PublicQrxDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = getParam(
    params?.locale as string | string[] | undefined,
    "de",
  );
  const qrxId = getParam(params?.id as string | string[] | undefined, "");
  const parentQrxId = searchParams.get("parentQrxId");
  const parentQrxTitle = searchParams.get("parentQrxTitle");

  const [entry, setEntry] = useState<QrxEntry | null>(null);
  const [media, setMedia] = useState<QrxMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveCount, setSaveCount] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [collectionItems, setCollectionItems] = useState<QrxCollectionPreviewItem[]>([]);

  useEffect(() => {
    void loadQrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrxId]);

  async function loadQrx() {
    setLoading(true);
    setErrorText(null);

    try {
      if (!qrxId) throw new Error("QR-X ID fehlt.");

      const { data: userData } = await supabase.auth.getUser();
      setCurrentUserId(userData.user?.id ?? null);

      const { data, error } = await supabase
        .from("qr_x_entries")
        .select(
          "id,owner_user_id,title,company_name,description,news,type,category,verified,suspended,deleted_at,cover_image_url,cover_media_id,logo_url,logo_media_id,force_original_quality,location_name,cta_phone,cta_website,cta_email,cta_navigation,views_total,follower_count,created_at",
        )
        .eq("id", qrxId)
        .maybeSingle()
        .returns<QrxEntry>();

      if (error) throw error;
      if (!data || data.deleted_at)
        throw new Error("Dieser QR-X wurde nicht gefunden.");
      if (data.suspended)
        throw new Error("Dieser QR-X ist aktuell nicht verfügbar.");

      setEntry(data);

      const { data: mediaData, error: mediaError } = await supabase
        .from("qr_x_media")
        .select(
          "id,type,url,filename,bytes,original_url,large_url,medium_url,thumb_url",
        )
        .eq("qrx_id", qrxId)
        .returns<QrxMedia[]>();

      if (mediaError) {
        console.warn("QR-X media load error:", mediaError);
        setMedia([]);
      } else {
        setMedia(mediaData ?? []);
      }

      const { data: collectionData, error: collectionError } = await supabase
        .from("qrx_collection_items")
        .select(`
          linked_qrx_id,
          sort_order,
          custom_title,
          qr_x_entries!qrx_collection_items_linked_qrx_id_fkey (
            id,
            title,
            company_name,
            description,
            type,
            logo_url,
            cover_image_url,
            location_name,
            verified,
            deleted_at,
            suspended
          )
        `)
        .eq("collection_qrx_id", qrxId)
        .order("sort_order", { ascending: true });

      if (collectionError) {
        console.warn("QR-X collection load error:", collectionError);
        setCollectionItems([]);
      } else {
        const items = ((collectionData ?? []) as CollectionRow[]).reduce<QrxCollectionPreviewItem[]>(
          (accumulator, row) => {
            const relation = row.qr_x_entries;
            const child = Array.isArray(relation) ? relation[0] ?? null : relation;
            const childWithVisibility = child as (QrxCollectionPreviewItem & {
              deleted_at?: string | null;
              suspended?: boolean | null;
            }) | null;

            if (!childWithVisibility || childWithVisibility.deleted_at || childWithVisibility.suspended === true) {
              return accumulator;
            }

            accumulator.push({
              ...childWithVisibility,
              custom_title: row.custom_title ?? null,
            });
            return accumulator;
          },
          [],
        );

        setCollectionItems(items);
      }
    } catch (error) {
      setEntry(null);
      setMedia([]);
      setCollectionItems([]);
      setErrorText(
        error instanceof Error
          ? error.message
          : "QR-X konnte nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSaveInfo(qrxIdInner: string, userId: string | null) {
    try {
      setSaveLoading(true);

      if (userId) {
        const { data, error } = await supabase.rpc("qrx_save_info", {
          p_qrx_id: qrxIdInner,
        });

        if (!error && Array.isArray(data) && data.length > 0) {
          setSaveCount(Number(data[0]?.total_count ?? 0));
          setHasSaved(Boolean(data[0]?.has_saved));
          return;
        }
      }

      const { count } = await supabase
        .from("qrx_saves")
        .select("*", { count: "exact", head: true })
        .eq("qrx_id", qrxIdInner);

      setSaveCount(typeof count === "number" ? count : 0);

      if (userId) {
        const { data: savedRow } = await supabase
          .from("qrx_saves")
          .select("qrx_id")
          .eq("qrx_id", qrxIdInner)
          .eq("user_id", userId)
          .maybeSingle();

        setHasSaved(Boolean(savedRow));
      } else {
        setHasSaved(false);
      }
    } catch (error) {
      console.warn("qrx save info load error:", error);
      setSaveCount(entry?.follower_count ?? 0);
      setHasSaved(false);
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleToggleSave() {
    if (!qrxId) return;

    if (!currentUserId) {
      setErrorText("Bitte melde dich an, um diesem QR-X zu folgen.");
      return;
    }

    if (entry?.owner_user_id && entry.owner_user_id === currentUserId) {
      setErrorText(null);
      return;
    }

    try {
      setSaveLoading(true);
      setErrorText(null);

      if (hasSaved) {
        const { error } = await supabase
          .from("qrx_saves")
          .delete()
          .eq("qrx_id", qrxId)
          .eq("user_id", currentUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("qrx_saves")
          .upsert(
            { qrx_id: qrxId, user_id: currentUserId },
            { onConflict: "qrx_id,user_id" },
          );

        if (error) throw error;
      }

      await loadSaveInfo(qrxId, currentUserId);
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Folgen konnte nicht geändert werden.",
      );
    } finally {
      setSaveLoading(false);
    }
  }

  async function loadTransferHistory(qrxIdInner: string) {
    try {
      setHistoryLoading(true);

      const { data, error } = await supabase.rpc("get_qrx_transfer_history", {
        p_qrx_id: qrxIdInner,
      });

      if (error) {
        console.warn("get_qrx_transfer_history error:", error);
        setTransferHistory([]);
        return;
      }

      const list = (data ?? []) as TransferHistoryItem[];
      setTransferHistory(
        [...list].sort((a, b) => {
          const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        }),
      );
    } catch (error) {
      console.warn("transfer history load error:", error);
      setTransferHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  function getPublicQrxUrl() {
    if (!qrxId) return "";
    if (typeof window === "undefined")
      return `https://mioseg-qr.com/qrx/${qrxId}`;
    return `${window.location.origin}/qrx/${qrxId}`;
  }

  async function handleCopyPublicLink() {
    const url = getPublicQrxUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("QR-X Link kopieren", url);
    }
  }

  async function trackMediaEvent(
    eventType: MediaAnalyticsEvent,
    mediaItem: QrxMedia,
    variant: MediaVariant,
  ) {
    if (!qrxId || !mediaItem.id) return;
    if (!shouldTrackMediaEvent(eventType, mediaItem.id, variant)) return;

    try {
      await fetch("/api/media/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: eventType,
          qrx_id: qrxId,
          media_id: mediaItem.id,
          media_type: mediaItem.type,
          variant,
          session_id: getAnalyticsSessionId(),
          source: "web_qrx_detail",
        }),
        keepalive: true,
      });
    } catch (error) {
      console.warn("media analytics tracking error:", error);
    }
  }

  function handleImageOpen(mediaItem: QrxMedia) {
    const variant = getMediaVariant(
      mediaItem,
      "fullscreen",
      forceOriginalQuality,
    );
    void trackMediaEvent("image_view", mediaItem, variant);
  }

  function handleFileOpen(mediaItem: QrxMedia) {
    void trackMediaEvent("file_open", mediaItem, "original");
  }

  function handleFileDownload(mediaItem: QrxMedia) {
    void trackMediaEvent("file_download", mediaItem, "original");
  }

  async function handleDownloadQrImage() {
    const url = getPublicQrxUrl();
    if (!url) return;

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&margin=28&data=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `mioseg-qrx-${qrxId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(qrImageUrl, "_blank", "noopener,noreferrer");
    }
  }

  useEffect(() => {
    if (!entry?.id) return;
    void loadSaveInfo(entry.id, currentUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id, currentUserId]);

  useEffect(() => {
    if (!entry?.id || !currentUserId || entry.owner_user_id !== currentUserId)
      return;
    void loadTransferHistory(entry.id);
  }, [entry?.id, entry?.owner_user_id, currentUserId]);

  const title = getDisplayTitle(entry);
  const subtitleTitle = getSubtitleTitle(entry);
  const description =
    entry?.description?.trim() ||
    entry?.location_name?.trim() ||
    "QR-X auf mioseg qr";
  const forceOriginalQuality = Boolean(entry?.force_original_quality);
  const coverMedia = getMediaById(media, entry?.cover_media_id);
  const logoMedia = getMediaById(media, entry?.logo_media_id);
  const cover =
    getBestMediaUrl({
      media: coverMedia,
      purpose: "hero",
      forceOriginal: forceOriginalQuality,
    }) ||
    entry?.cover_image_url?.trim() ||
    null;
  const logo =
    getBestMediaUrl({
      media: logoMedia,
      purpose: "medium",
      forceOriginal: forceOriginalQuality,
    }) ||
    entry?.logo_url?.trim() ||
    null;
  const isBusiness = entry?.type === "business";
  const website = normalizeUrl(entry?.cta_website ?? null);
  const navigation = normalizeNavigationUrl(entry?.cta_navigation ?? null);
  const categoryMeta = getBusinessCategoryMeta(entry?.category);
  const newsItems = useMemo(
    () => normalizeNewsItems(entry?.news),
    [entry?.news],
  );
  const imageMedia = media.filter((item) => {
    const isLogoById =
      !!entry?.logo_media_id && item.id === entry.logo_media_id;
    const isCoverById =
      !!entry?.cover_media_id && item.id === entry.cover_media_id;
    const urls = [
      item.url,
      item.original_url,
      item.large_url,
      item.medium_url,
      item.thumb_url,
    ];
    return (
      item.type === "image" &&
      !isLogoById &&
      !isCoverById &&
      !urls.includes(logo) &&
      !urls.includes(cover)
    );
  });
  const fileMedia = media.filter((item) => item.type === "file");
  const isOwner = Boolean(
    entry?.owner_user_id &&
    currentUserId &&
    entry.owner_user_id === currentUserId,
  );
  const publicQrxUrl = qrxId
    ? typeof window === "undefined"
      ? `https://mioseg-qr.com/qrx/${qrxId}`
      : `${window.location.origin}/qrx/${qrxId}`
    : "";
  const qrImageUrl = publicQrxUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=18&data=${encodeURIComponent(publicQrxUrl)}`
    : "";

  const imageDisplayItems: QrxMediaDisplayItem[] = imageMedia.map((item) => ({
    id: item.id,
    type: item.type,
    url: item.url,
    filename: item.filename,
    displayUrl:
      getBestMediaUrl({
        media: item,
        purpose: "gallery",
        forceOriginal: forceOriginalQuality,
      }) || item.url,
    fullscreenUrl:
      getBestMediaUrl({
        media: item,
        purpose: "fullscreen",
        forceOriginal: forceOriginalQuality,
      }) || item.url,
  }));

  const fileDisplayItems: QrxMediaDisplayItem[] = fileMedia.map((item) => ({
    id: item.id,
    type: item.type,
    url: item.url,
    filename: item.filename,
    displayUrl: item.url,
    fullscreenUrl: item.url,
  }));

  const stats = [
    {
      label: "Follower",
      value: formatNumber(saveCount ?? entry?.follower_count),
      icon: "👥",
    },
    {
      label: "Medien",
      value: formatNumber(media.length),
      icon: "🖼️",
    },
    {
      label: "Updates",
      value: formatNumber(newsItems.length),
      icon: "📰",
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>
        <nav className={styles.nav} aria-label="QR-X Navigation">
          <Link href={`/${locale}`}>Startseite</Link>
          <Link href={`/${locale}/explore`}>Explore</Link>
        </nav>
      </header>

      <section style={panelStyle}>
        {loading ? <div style={loadingStyle}>QR-X wird geladen …</div> : null}
        {!loading && errorText ? (
          <div style={errorStyle}>{errorText}</div>
        ) : null}

        {!loading && entry ? (
          <>
            {parentQrxId && parentQrxTitle ? (
              <Link
                href={`/${locale}/qrx/${parentQrxId}`}
                style={collectionBackLinkStyle}
              >
                ← Zurück zur Sammlung „{parentQrxTitle}“
              </Link>
            ) : null}

            <QrxHeroSection
              title={title}
              subtitleTitle={subtitleTitle}
              description={description}
              cover={cover}
              logo={logo}
              isBusiness={isBusiness}
              categoryMeta={categoryMeta}
              verified={entry.verified === true}
            />

            <QrxStatsSection stats={stats} />

            <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
              {entry.location_name?.trim() ? (
                <InfoRow title="📍 Standort" text={entry.location_name.trim()} />
              ) : null}

              {categoryMeta ? (
                <InfoRow title="▦ Kategorie" text={`${categoryMeta.icon} ${categoryMeta.label}`} />
              ) : null}

              {entry.created_at ? <InfoRow title="🕒 Erstellt" text={formatDate(entry.created_at)} /> : null}

              {isBusiness ? (
                <div style={ctaGridStyle}>
                  {entry.cta_phone?.trim() ? <a href={`tel:${entry.cta_phone.trim()}`} className={styles.primaryButton}>Telefon</a> : null}
                  {website ? <a href={website} target="_blank" rel="noreferrer" className={styles.secondaryButton}>Webseite öffnen</a> : null}
                  {entry.cta_email?.trim() ? <a href={`mailto:${entry.cta_email.trim()}`} className={styles.secondaryButton}>E-Mail schreiben</a> : null}
                  {navigation ? <a href={navigation} target="_blank" rel="noreferrer" className={styles.secondaryButton}>Navigation öffnen</a> : null}
                </div>
              ) : null}
            </div>

            <QrxActionsSection
              isOwner={isOwner}
              hasSaved={hasSaved}
              currentUserId={currentUserId}
              saveLoading={saveLoading}
              followerCount={`${formatNumber(saveCount ?? entry.follower_count)} Nutzer${Number(saveCount ?? entry.follower_count ?? 0) === 1 ? "" : "n"}`}
              qrImageUrl={qrImageUrl}
              title={title}
              onToggleSave={handleToggleSave}
              onDownloadQr={handleDownloadQrImage}
              onCopyLink={handleCopyPublicLink}
            />
          </>
        ) : null}
      </section>

      {!loading && entry ? (
        <QrxNewsSection items={newsItems} formatDate={formatDate} />
      ) : null}

      {!loading && entry && collectionItems.length > 0 ? (
        <section style={panelStyle}>
          <CollectionPreview
            parentQrxId={entry.id}
            parentQrxTitle={title}
            items={collectionItems}
            locale={locale}
          />
        </section>
      ) : null}

      {!loading && entry && isOwner ? (
        <section style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Transfer</h2>
              <p>Verlauf der QR-X-Übertragungen für diesen QR-X.</p>
            </div>
            <button
              type="button"
              onClick={() => loadTransferHistory(entry.id)}
              className={styles.secondaryButton}
              style={{ border: 0 }}
            >
              {historyLoading ? "Lädt …" : "Neu laden"}
            </button>
          </div>

          {transferHistory.length > 0 ? (
            <div style={transferListStyle}>
              {transferHistory.map((item, index) => (
                <article
                  key={
                    item.id ?? item.transfer_id ?? `${item.created_at}-${index}`
                  }
                  style={transferCardStyle}
                >
                  <div style={transferTopLineStyle}>
                    <strong>{item.status ?? "Transfer"}</strong>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  {item.recipient_email ? (
                    <span>Empfänger: {item.recipient_email}</span>
                  ) : null}
                  {item.from_name ? <span>Von: {item.from_name}</span> : null}
                  {item.to_name ? <span>An: {item.to_name}</span> : null}
                  {item.accepted_at ? (
                    <span>Angenommen: {formatDate(item.accepted_at)}</span>
                  ) : null}
                  {item.expires_at ? (
                    <span>Ablauf: {formatDate(item.expires_at)}</span>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <strong>Noch kein Transfer-Verlauf vorhanden.</strong>
              <span>
                Wenn dieser QR-X übertragen wird, erscheint der Verlauf hier.
              </span>
            </div>
          )}
        </section>
      ) : null}

      {!loading ? (
        <QrxMediaSection
          imageItems={imageDisplayItems}
          fileItems={fileDisplayItems}
          totalCount={media.length}
          onImageOpen={(id) => {
            const item = media.find((mediaItem) => mediaItem.id === id);
            if (item) handleImageOpen(item);
          }}
          onFileOpen={(id) => {
            const item = media.find((mediaItem) => mediaItem.id === id);
            if (item) handleFileOpen(item);
          }}
          onFileDownload={(id) => {
            const item = media.find((mediaItem) => mediaItem.id === id);
            if (item) handleFileDownload(item);
          }}
        />
      ) : null}
    </main>
  );
}

function InfoRow({ title, text }: { title: string; text: string }) {
  return (
    <div style={infoRowStyle}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

const collectionBackLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 42,
  marginBottom: 14,
  borderRadius: 999,
  padding: "0 14px",
  background: "rgba(37,99,235,0.14)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#dbeafe",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 950,
};

const panelStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 18px",
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const loadingStyle: CSSProperties = {
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  fontWeight: 950,
};

const errorStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const coverStyle: CSSProperties = {
  minHeight: 360,
  borderRadius: 28,
  overflow: "hidden",
  position: "relative",
  background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))",
};

const coverImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 360,
  objectFit: "cover",
  display: "block",
};

const coverPlaceholderStyle: CSSProperties = {
  minHeight: 360,
  display: "grid",
  placeItems: "center",
  color: "rgba(255,255,255,0.18)",
  fontSize: 72,
  fontWeight: 950,
};

const coverOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(6,12,21,0.1) 0%, rgba(6,12,21,0.88) 100%)",
};

const coverContentStyle: CSSProperties = {
  position: "absolute",
  left: 24,
  right: 24,
  bottom: 24,
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const logoStyle: CSSProperties = {
  width: 92,
  height: 92,
  objectFit: "cover",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.24)",
  background: "#fff",
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 10,
};

function badgeStyle(isBusiness: boolean): CSSProperties {
  return {
    minHeight: 32,
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "0 10px",
    background: isBusiness ? "#fff7ed" : "#ecfdf3",
    color: isBusiness ? "#9a4f00" : "#166534",
    fontSize: 12,
    fontWeight: 950,
    border: isBusiness ? "1px solid #fed7aa" : "1px solid #bbf7d0",
  };
}

const categoryBadgeStyle: CSSProperties = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(59,130,246,0.18)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 950,
  border: "1px solid rgba(147,197,253,0.28)",
};

const verifiedBadgeStyle: CSSProperties = {
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
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  color: "#fff",
  fontSize: 42,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-0.04em",
};

const subtitleTitleStyle: CSSProperties = {
  marginTop: 8,
  color: "#bfdbfe",
  fontSize: 16,
  fontWeight: 950,
};

const heroDescriptionStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "#dbeafe",
  lineHeight: 1.6,
  maxWidth: 760,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const statCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const statIconStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.08)",
  fontSize: 20,
};

const statValueStyle: CSSProperties = {
  display: "block",
  color: "#ffffff",
  fontSize: 22,
  fontWeight: 950,
};

const statLabelStyle: CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 850,
};

const infoRowStyle: CSSProperties = {
  display: "grid",
  gap: 5,
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
};

const ctaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const newsListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const newsCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 8,
};

const newsDateStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 950,
};

const newsTextStyle: CSSProperties = {
  margin: 0,
  color: "#dbeafe",
  lineHeight: 1.65,
  fontWeight: 750,
  whiteSpace: "pre-wrap",
};

const emptyStateStyle: CSSProperties = {
  borderRadius: 22,
  padding: 18,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#94a3b8",
  display: "grid",
  gap: 6,
};

const sectionSubTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 950,
};

const galleryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const galleryItemStyle: CSSProperties = {
  display: "block",
  borderRadius: 22,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.105)",
  background: "rgba(255,255,255,0.055)",
};

const galleryImageStyle: CSSProperties = {
  width: "100%",
  height: 190,
  objectFit: "cover",
  display: "block",
};

const fileListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const fileItemStyle: CSSProperties = {
  minHeight: 54,
  borderRadius: 18,
  padding: "0 14px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  fontWeight: 900,
};

const fileActionRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const fileActionLinkStyle: CSSProperties = {
  color: "#bfdbfe",
  textDecoration: "none",
  fontWeight: 950,
};

const actionsLayoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
  marginTop: 20,
};

const followBoxStyle: CSSProperties = {
  borderRadius: 24,
  padding: 18,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  display: "grid",
  gap: 14,
};

const qrDownloadBoxStyle: CSSProperties = {
  borderRadius: 24,
  padding: 18,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "grid",
  gap: 14,
};

const boxTitleStyle: CSSProperties = {
  margin: "0 0 6px",
  color: "#ffffff",
  fontSize: 20,
  fontWeight: 950,
};

const boxHintStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  lineHeight: 1.55,
  fontSize: 13,
  fontWeight: 760,
};

const saveCountStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 900,
};

const qrImageStyle: CSSProperties = {
  width: 180,
  height: 180,
  borderRadius: 22,
  background: "#ffffff",
  padding: 12,
  justifySelf: "center",
};

const qrButtonRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const transferListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const transferCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
  display: "grid",
  gap: 6,
  fontSize: 13,
  fontWeight: 800,
};

const transferTopLineStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "#ffffff",
};
