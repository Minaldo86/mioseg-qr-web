import Link from "next/link";
import styles from "../home-page.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getBestMediaUrl } from "@/lib/media";
import ExploreMapClient from "./ExploreMapClient";
import ExploreFollowClient from "./ExploreFollowClient";

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

type ExploreMedia = {
  id: string;
  url: string | null;
  original_url?: string | null;
  large_url?: string | null;
  medium_url?: string | null;
  thumb_url?: string | null;
};

type ExploreEntry = {
  id: string;
  title: string | null;
  description: string | null;
  company_name: string | null;
  category: BusinessCategory | null;
  type: "normal" | "business" | null;
  verified: boolean | null;
  cover_image_url: string | null;
  cover_media_id?: string | null;
  cover_media?: ExploreMedia | ExploreMedia[] | null;
  logo_url: string | null;
  logo_media_id?: string | null;
  logo_media?: ExploreMedia | ExploreMedia[] | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string | null;
  follower_count: number | null;
  views_total: number | null;
  views_unique_total: number | null;
  manual_follower_boost: number | null;
  manual_view_boost: number | null;
  manual_unique_view_boost: number | null;
  force_original_quality: boolean | null;
  deleted_at: string | null;
  suspended: boolean | null;
};

type SearchParams = Record<string, string | string[] | undefined>;
type RouteParams = { locale?: string };

const CATEGORY_OPTIONS: Array<{ value: BusinessCategory; label: string; icon: string }> = [
  { value: "praxis_gesundheit", label: "Praxis & Gesundheit", icon: "🩺" },
  { value: "gastronomie", label: "Gastronomie", icon: "🍽️" },
  { value: "unternehmen", label: "Unternehmen", icon: "🏢" },
  { value: "dienstleistung", label: "Dienstleistung", icon: "🛠️" },
  { value: "handwerk", label: "Handwerk", icon: "🔨" },
  { value: "event", label: "Event", icon: "✨" },
  { value: "verein", label: "Verein", icon: "👥" },
  { value: "wohltaetigkeit", label: "Wohltätigkeit", icon: "❤️" },
  { value: "sehenswuerdigkeit", label: "Sehenswürdigkeit", icon: "📷" },
  { value: "sonstiges", label: "Sonstiges", icon: "🧭" },
];

function getFirst(param: string | string[] | undefined): string {
  return Array.isArray(param) ? param[0] ?? "" : param ?? "";
}

function getCategoryLabel(category: BusinessCategory | null | undefined) {
  return CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? "Sonstiges";
}

function getCategoryIcon(category: BusinessCategory | null | undefined) {
  return CATEGORY_OPTIONS.find((item) => item.value === category)?.icon ?? "🧭";
}

function getEntryTitle(entry: ExploreEntry) {
  return entry.company_name?.trim() || entry.title?.trim() || "Unbenannter QR-X";
}

function getEntryText(entry: ExploreEntry) {
  return entry.description?.trim() || entry.location_name?.trim() || "Business QR-X auf mioseg qr";
}

function getExploreImage(entry: ExploreEntry, purpose: "card" | "map" | "hero" = "card") {
  const coverFromMedia = getBestMediaUrl(entry.cover_media, purpose);
  if (coverFromMedia) return coverFromMedia;

  const legacyCover = entry.cover_image_url?.trim();
  if (legacyCover) return legacyCover;

  const logoFromMedia = getBestMediaUrl(entry.logo_media, purpose);
  if (logoFromMedia) return logoFromMedia;

  const legacyLogo = entry.logo_url?.trim();
  if (legacyLogo) return legacyLogo;

  return null;
}

function buildExploreHref(locale: string, category: string, q: string) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (q.trim()) params.set("q", q.trim());
  const qs = params.toString();
  return qs ? `/${locale}/explore?${qs}` : `/${locale}/explore`;
}

function parseNumberParam(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m entfernt`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km entfernt`;
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
function formatExactMetric(value: number | null | undefined) {
  const count = Math.max(0, Number(value ?? 0));
  return new Intl.NumberFormat("de-DE").format(count);
}

function formatCompactMetric(value: number | null | undefined) {
  const count = Math.max(0, Number(value ?? 0));

  if (count >= 1000000) {
    const valueInMillions = count / 1000000;
    return `${valueInMillions.toFixed(count >= 10000000 ? 0 : 1).replace(".", ",")} M`;
  }

  if (count >= 1000) {
    const valueInThousands = count / 1000;
    return `${valueInThousands.toFixed(count >= 10000 ? 0 : 1).replace(".", ",")} K`;
  }

  return String(count);
}

function formatFollowerCount(value: number | null | undefined) {
  const count = Math.max(0, Number(value ?? 0));
  return `${formatCompactMetric(count)} ${count === 1 ? "Follower" : "Follower"}`;
}

function formatViewCount(value: number | null | undefined) {
  const count = Math.max(0, Number(value ?? 0));
  return `${formatCompactMetric(count)} ${count === 1 ? "Aufruf" : "Aufrufe"}`;
}

function formatFollowerCountExact(value: number | null | undefined) {
  const count = Math.max(0, Number(value ?? 0));
  return `${formatExactMetric(count)} ${count === 1 ? "Follower" : "Follower"}`;
}

function formatViewCountExact(value: number | null | undefined) {
  const count = Math.max(0, Number(value ?? 0));
  return `${formatExactMetric(count)} ${count === 1 ? "Aufruf" : "Aufrufe"}`;
}

function getExploreRankScore(entry: ExploreEntry, followerCount: number, viewCount: number) {
  const followers = Math.max(0, Number(followerCount ?? 0));
  const views = Math.max(0, Number(viewCount ?? 0));
  const verifiedBonus = entry.verified ? 250 : 0;
  const createdTime = entry.created_at ? new Date(entry.created_at).getTime() : 0;
  const daysOld = createdTime > 0 ? Math.max(0, (Date.now() - createdTime) / 86400000) : 365;
  const freshnessBonus = Math.max(0, 120 - Math.min(120, daysOld));
  return Math.round(followers * 10 + views * 0.2 + verifiedBonus + freshnessBonus);
}

function getSocialProofBadges(entry: ExploreEntry, followerCount: number, viewCount: number, uniqueViewCount: number) {
  const badges: Array<{ label: string; background: string; color: string; border: string }> = [];

  if (followerCount >= 10) {
    badges.push({
      label: "🔥 Beliebt",
      background: "#fff7ed",
      color: "#9a4f00",
      border: "#fed7aa",
    });
  }

  if (viewCount >= 100) {
    badges.push({
      label: "📈 Starkes Interesse",
      background: "#eef4ff",
      color: "#1d4ed8",
      border: "#bfdbfe",
    });
  }

  if (uniqueViewCount >= 50) {
    badges.push({
      label: "👀 Viele Besucher",
      background: "#f5f3ff",
      color: "#5b21b6",
      border: "#ddd6fe",
    });
  }

  if (entry.verified && (followerCount >= 5 || viewCount >= 50)) {
    badges.push({
      label: "⭐ Vertrauensprofil",
      background: "#ecfdf3",
      color: "#166534",
      border: "#bbf7d0",
    });
  }

  if (viewCount >= 500 || followerCount >= 50) {
    badges.unshift({
      label: "🚀 Sehr gefragt",
      background: "#0d1726",
      color: "#ffffff",
      border: "#17304d",
    });
  }

  return badges.slice(0, 3);
}


export const dynamic = "force-dynamic";

export default async function ExplorePage({
  params,
  searchParams,
}: {
  params?: Promise<RouteParams>;
  searchParams?: Promise<SearchParams>;
}) {
  const routeParams = (await params) ?? {};
  const locale = routeParams.locale || "de";
  const explorePath = `/${locale}/explore`;

  const sp = (await searchParams) ?? {};
  const selectedCategory = getFirst(sp.category) || "all";
  const queryRaw = getFirst(sp.q);
  const query = queryRaw.trim().toLowerCase();
  const userLat = parseNumberParam(sp.lat);
  const userLng = parseNumberParam(sp.lng);
  const hasUserLocation = userLat != null && userLng != null;

  const supabase = await createSupabaseServerClient();;

  const { data, error } = await supabase
    .from("qr_x_entries")
    .select(
      "id, title, description, company_name, category, type, verified, cover_image_url, cover_media_id, cover_media:cover_media_id(id,url,original_url,large_url,medium_url,thumb_url), logo_url, logo_media_id, logo_media:logo_media_id(id,url,original_url,large_url,medium_url,thumb_url), location_name, location_lat, location_lng, created_at, follower_count, views_total, views_unique_total, manual_follower_boost, manual_view_boost, manual_unique_view_boost, force_original_quality, deleted_at, suspended"
    )
    .eq("type", "business")
    .is("deleted_at", null)
    .or("suspended.is.null,suspended.eq.false")
    .order("created_at", { ascending: false })
    .limit(120)
    .returns<ExploreEntry[]>();

  // Zweite Sicherheitsstufe: Auch wenn sich Query/RLS später ändert,
  // dürfen gelöschte oder gesperrte QR-X niemals in Explore gelangen.
  const publicEntries = (data ?? []).filter(
    (entry) => entry.deleted_at == null && entry.suspended !== true
  );

  const qrxIds = publicEntries.map((entry) => entry.id);
  let saveRows: Array<{ qrx_id: string | null }> = [];

  if (qrxIds.length > 0) {
    const { data: qrxSaveRows } = await supabase
      .from("qrx_saves")
      .select("qrx_id")
      .in("qrx_id", qrxIds)
      .returns<Array<{ qrx_id: string | null }>>();

    saveRows = qrxSaveRows ?? [];
  }

  const followerCountByQrxId = new Map<string, number>();

  saveRows.forEach((row) => {
    if (!row.qrx_id) return;
    followerCountByQrxId.set(row.qrx_id, (followerCountByQrxId.get(row.qrx_id) ?? 0) + 1);
  });

  const getRealFollowerCountForEntry = (entry: ExploreEntry) =>
    Math.max(0, Number(entry.follower_count ?? 0), followerCountByQrxId.get(entry.id) ?? 0);

  const getFollowerCountForEntry = (entry: ExploreEntry) =>
    Math.max(0, Number(entry.manual_follower_boost ?? 0)) + getRealFollowerCountForEntry(entry);

  const getViewTotalForEntry = (entry: ExploreEntry) =>
    Math.max(0, Number(entry.views_total ?? 0)) + Math.max(0, Number(entry.manual_view_boost ?? 0));

  const getUniqueViewCountForEntry = (entry: ExploreEntry) =>
    Math.max(0, Number(entry.views_unique_total ?? 0)) +
    Math.max(0, Number(entry.manual_unique_view_boost ?? 0));

  const items = publicEntries.filter((item) => {
    const categoryOk = selectedCategory === "all" || item.category === selectedCategory;
    if (!categoryOk) return false;

    if (!query) return true;

    const haystack = [item.title, item.company_name, item.description, item.location_name, item.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  const nearbyItems = hasUserLocation
    ? items
        .filter((item) => item.location_lat != null && item.location_lng != null)
        .map((item) => ({
          ...item,
          distanceKm: haversineKm(userLat as number, userLng as number, item.location_lat as number, item.location_lng as number),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 6)
    : [];

  const categoryCounts = CATEGORY_OPTIONS.map((option) => ({
    ...option,
    count: publicEntries.filter((item) => item.category === option.value).length,
  }));

  const activeCategoryCount = categoryCounts.filter((c) => c.count > 0).length;
  const verifiedCount = publicEntries.filter((entry) => entry.verified).length;
  const entriesWithLocationCount = publicEntries.filter((entry) => entry.location_lat != null && entry.location_lng != null).length;
  const totalFollowerCount = publicEntries.reduce((sum, entry) => sum + getFollowerCountForEntry(entry), 0);
  const totalViewCount = publicEntries.reduce((sum, entry) => sum + getViewTotalForEntry(entry), 0);

  const mapPoints = items
    .filter((entry) => entry.location_lat != null && entry.location_lng != null)
    .map((entry) => ({
      id: entry.id,
      title: getEntryTitle(entry),
      description: getEntryText(entry),
      category: getCategoryLabel(entry.category),
      categoryIcon: getCategoryIcon(entry.category),
      verified: !!entry.verified,
      followerCount: getFollowerCountForEntry(entry),
      viewCount: getViewTotalForEntry(entry),
      href: `/qrx/${entry.id}`,
      coverUrl: getExploreImage(entry, "map"),
      locationName: entry.location_name ?? null,
      latitude: entry.location_lat as number,
      longitude: entry.location_lng as number,
    }));

  const INITIAL_VISIBLE_QRX = 12;

  const mapVisibleEntries = items
    .filter((entry) => entry.location_lat != null && entry.location_lng != null)
    .sort(
      (a, b) =>
        getExploreRankScore(b, getFollowerCountForEntry(b), getViewTotalForEntry(b)) -
        getExploreRankScore(a, getFollowerCountForEntry(a), getViewTotalForEntry(a))
    );

  const newMapEntries = items
    .filter((entry) => entry.location_lat != null && entry.location_lng != null)
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

  const nearbyTabEntries = hasUserLocation ? nearbyItems : [];

  const renderExploreCard = (
    entry: ExploreEntry,
    opts?: { keyPrefix?: string; distanceLabel?: string | null }
  ) => {
    const image = getExploreImage(entry, "card");
    const key = `${opts?.keyPrefix ?? "card"}-${entry.id}`;
    const createdLabel = formatDate(entry.created_at);
    const followerCount = getFollowerCountForEntry(entry);
    const viewCount = getViewTotalForEntry(entry);
    const uniqueViewCount = getUniqueViewCountForEntry(entry);
    const socialProofBadges = getSocialProofBadges(entry, followerCount, viewCount, uniqueViewCount);

    return (
      <div
        key={key}
        data-focus-marker={entry.id}
        style={{
          height: "100%",
          cursor: entry.location_lat != null && entry.location_lng != null ? "pointer" : "default",
        }}
      >
        <article
            className={`${styles.valueCard} mioseg-qrx-card`}
            data-qrx-card={entry.id}
            style={{
              height: "100%",
              padding: "12px",
              borderRadius: "30px",
              border: "1px solid rgba(218, 228, 240, 0.95)",
              background: "linear-gradient(180deg, #ffffff 0%, #f9fbfe 100%)",
              boxShadow: "0 18px 46px rgba(14, 23, 38, 0.08)",
              transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 10",
                borderRadius: "24px",
                overflow: "hidden",
                background: "radial-gradient(circle at 30% 20%, #ffffff 0%, #edf4fb 45%, #dce7f3 100%)",
                border: "1px solid #dde7f2",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt={getEntryTitle(entry)}
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: "92px",
                    height: "92px",
                    borderRadius: "28px",
                    background: "linear-gradient(180deg, #ffffff 0%, #eef4fb 100%)",
                    border: "1px solid #d5e0ec",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "42px",
                    boxShadow: "0 16px 34px rgba(14, 23, 38, 0.12)",
                  }}
                >
                  {getCategoryIcon(entry.category)}
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: image
                    ? "linear-gradient(180deg, rgba(6, 12, 21, 0.05) 0%, rgba(6, 12, 21, 0.55) 100%)"
                    : "transparent",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "14px",
                  right: "14px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    minHeight: "34px",
                    padding: "0 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 900,
                    background: "rgba(255,255,255,0.92)",
                    color: "#17304d",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 8px 20px rgba(14, 23, 38, 0.08)",
                  }}
                >
                  <span>{getCategoryIcon(entry.category)}</span>
                  <span>{getCategoryLabel(entry.category)}</span>
                </div>

                {entry.verified ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      minHeight: "34px",
                      padding: "0 12px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 900,
                      background: "rgba(13, 23, 38, 0.86)",
                      color: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 10px 24px rgba(13, 23, 38, 0.18)",
                    }}
                  >
                    <span>✓</span>
                    <span>Verifiziert</span>
                  </div>
                ) : null}
              </div>

              {entry.location_name?.trim() ? (
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    right: "14px",
                    bottom: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "fit-content",
                    maxWidth: "calc(100% - 28px)",
                    minHeight: "34px",
                    padding: "0 12px",
                    borderRadius: "999px",
                    color: "#ffffff",
                    background: "rgba(13, 23, 38, 0.72)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    backdropFilter: "blur(12px)",
                    fontSize: "12px",
                    fontWeight: 800,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  📍 {entry.location_name.trim()}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "0 6px 6px" }}>
              <div>
                <h3
                  className={styles.featureTitle}
                  style={{
                    marginBottom: "10px",
                    fontSize: "23px",
                    lineHeight: 1.18,
                    letterSpacing: "-0.45px",
                  }}
                >
                  {getEntryTitle(entry)}
                </h3>
                <p
                  className={styles.featureText}
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.72,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    minHeight: "76px",
                  }}
                >
                  {getEntryText(entry)}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                {opts?.distanceLabel ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: "32px",
                      padding: "0 10px",
                      borderRadius: "999px",
                      background: "#eef4fb",
                      color: "#28496f",
                      fontSize: "12px",
                      fontWeight: 900,
                    }}
                  >
                    {opts.distanceLabel}
                  </span>
                ) : null}

                <span
                  title={formatFollowerCountExact(followerCount)}
                  aria-label={formatFollowerCountExact(followerCount)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "32px",
                    padding: "0 10px",
                    borderRadius: "999px",
                    background: "#fff7ed",
                    color: "#9a4f00",
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  👥 {formatFollowerCount(followerCount)}
                </span>

                <span
                  title={`${formatViewCountExact(viewCount)}${uniqueViewCount > 0 ? ` · ${formatExactMetric(uniqueViewCount)} eindeutige Besucher` : ""}`}
                  aria-label={`${formatViewCountExact(viewCount)}${uniqueViewCount > 0 ? ` · ${formatExactMetric(uniqueViewCount)} eindeutige Besucher` : ""}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "32px",
                    padding: "0 10px",
                    borderRadius: "999px",
                    background: "#eef4ff",
                    color: "#1d4ed8",
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  👁️ {formatViewCount(viewCount)}
                  {uniqueViewCount > 0 ? ` · ${formatCompactMetric(uniqueViewCount)} eindeutig` : ""}
                </span>

                {entry.verified ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: "32px",
                      padding: "0 10px",
                      borderRadius: "999px",
                      background: "#ecfdf3",
                      color: "#166534",
                      fontSize: "12px",
                      fontWeight: 900,
                    }}
                  >
                    ✓ Verifiziert
                  </span>
                ) : null}

                {createdLabel ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: "32px",
                      padding: "0 10px",
                      borderRadius: "999px",
                      background: "#f4f7fb",
                      color: "#5d6b7d",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    Neu seit {createdLabel}
                  </span>
                ) : null}
              </div>

              {socialProofBadges.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "18px",
                    background: "linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%)",
                    border: "1px solid #edf2f7",
                  }}
                >
                  {socialProofBadges.map((badge) => (
                    <span
                      key={badge.label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: "30px",
                        padding: "0 10px",
                        borderRadius: "999px",
                        background: badge.background,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        fontSize: "12px",
                        fontWeight: 900,
                        boxShadow: "0 8px 18px rgba(14, 23, 38, 0.04)",
                      }}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid #edf2f7",
                  paddingTop: "14px",
                  marginTop: "2px",
                }}
              >
                <span style={{ color: "#6b788a", fontSize: "13px", fontWeight: 800 }}>
                  {entry.location_lat != null && entry.location_lng != null ? "Tippen zeigt Marker" : "Ohne Standortdaten"}
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <ExploreFollowClient
                    qrxId={entry.id}
                    locale={locale}
                    compact
                  />

                  <Link
                    href={`/qrx/${entry.id}`}
                    data-qrx-open-button="true"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "42px",
                      padding: "0 16px",
                      borderRadius: "14px",
                      background: "linear-gradient(180deg, #0d1726 0%, #17304d 100%)",
                      color: "#ffffff",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 900,
                      boxShadow: "0 12px 26px rgba(13, 23, 38, 0.18)",
                    }}
                  >
                    QR-X öffnen →
                  </Link>
                </div>
              </div>
            </div>
          </article>
      </div>
    );
  };

  return (
    <div
      className={`${styles.page} mioseg-explore-page`}
      style={{
        background:
          "linear-gradient(180deg, #08111d 0%, #0d1726 18%, #13243a 32%, #eaf1f8 48%, #f7fafc 100%)",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 82% 10%, rgba(77, 132, 201, 0.18) 0%, rgba(77, 132, 201, 0) 32%), radial-gradient(circle at 12% 42%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 28%)",
        }}
      />
      <header className="mioseg-explore-topbar">
        <Link href={`/${locale}`} className="mioseg-explore-brand">
          <img src="/logo-wwhite.png" alt="Mioseg qr" />
        </Link>

        <nav aria-label="Explore Navigation">
          <Link href={`/${locale}`}>Startseite</Link>
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/account`}>Konto</Link>
        </nav>
      </header>

      <section
        className={styles.heroSection}
        style={{
          position: "relative",
          zIndex: 2,
          paddingBottom: "86px",
        }}
      >
        <div className={styles.heroContent}>
          <div className={styles.heroTextWrap}>
            <div className={styles.brandBadgeWrap}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  minHeight: "38px",
                  padding: "0 16px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#e8f2ff",
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span>🧭</span>
                <span>mioseg qr Explore</span>
              </span>
            </div>

            <h1 className={styles.heroTitle}>Entdecke Business QR-X in deiner Nähe</h1>
            <p className={styles.heroText}>
              Finde Restaurants, Praxen, Unternehmen, Dienstleistungen und besondere Orte auf einer modernen öffentlichen
              Karte. Jeder Eintrag führt direkt zur passenden QR-X Webansicht.
            </p>

            <div className={styles.heroButtons} style={{ marginBottom: "24px" }}>
              <Link href="#explore-results" className={styles.primaryButton}>
                Einträge ansehen
              </Link>
              <Link href="#explore-map" className={styles.secondaryButton}>
                Karte öffnen
              </Link>
            </div>

            <div className={styles.heroFacts}>
              <div className={styles.factCard}>
                <div className={styles.factNumber}>{publicEntries.length}</div>
                <div className={styles.factLabel}>Business QR-X insgesamt</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factNumber}>{items.length}</div>
                <div className={styles.factLabel}>sichtbare Treffer</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factNumber}>{activeCategoryCount}</div>
                <div className={styles.factLabel}>aktive Kategorien</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factNumber}>{verifiedCount}</div>
                <div className={styles.factLabel}>verifizierte Profile</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factNumber} title={formatFollowerCountExact(totalFollowerCount)}>
                  {formatFollowerCount(totalFollowerCount).replace(" Follower", "")}
                </div>
                <div className={styles.factLabel}>Follower insgesamt</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factNumber} title={formatViewCountExact(totalViewCount)}>
                  {formatCompactMetric(totalViewCount)}
                </div>
                <div className={styles.factLabel}>Aufrufe insgesamt</div>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualStage}>
              <div className={styles.glowOne} />
              <div className={styles.glowTwo} />
              <div className={styles.phoneMockup} style={{ maxWidth: "410px" }}>
                <div className={styles.phoneHeader}>
                  <div className={styles.phoneDot} />
                  <div className={styles.phoneDot} />
                  <div className={styles.phoneDot} />
                </div>

                <div
                  className={styles.phoneCardPrimary}
                  style={{
                    background: "linear-gradient(180deg, #1b3351 0%, #28486e 62%, #355f8b 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <p className={styles.phoneOverline}>Live Explore</p>
                  <h3 className={styles.phoneCardTitle}>Öffentliche Business-Karte</h3>
                  <p className={styles.phoneCardText}>
                    Suche, filtere und öffne öffentliche Business QR-X direkt auf der Karte. Entdecke neue Orte,
                    Unternehmen und Angebote in deiner Umgebung.
                  </p>
                </div>

                <div style={{ display: "grid", gap: "10px", marginBottom: "14px" }}>
                  {categoryCounts.slice(0, 4).map((item) => (
                    <div
                      key={item.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        minHeight: "44px",
                        padding: "0 14px",
                        borderRadius: "16px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#ffffff",
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: 800 }}>
                        {item.icon} {item.label}
                      </span>
                      <span style={{ fontSize: "12px", color: "#b7c5d7", fontWeight: 900 }}>{item.count}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.phoneActionRow}>
                  <span className={styles.phoneActionChip}>Suche</span>
                  <span className={styles.phoneActionChip}>Karte</span>
                  <span className={styles.phoneActionChip}>Verifiziert</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        aria-hidden="true"
        style={{
          height: "36px",
          marginTop: "-36px",
          background:
  "linear-gradient(180deg, rgba(13, 23, 38, 0) 0%, rgba(13, 23, 38, 0.45) 52%, rgba(13, 23, 38, 0.72) 100%)",
          pointerEvents: "none",
        }}
      />

      <nav className="mioseg-explore-section-nav" aria-label="Explore Bereiche">
        <a href="#explore-map">🗺️ Karte</a>
        <a href="#explore-hub">🔥 Ergebnisse</a>
      </nav>

      <section
        id="explore-map"
        className={`${styles.sectionAlt} mioseg-discover-section mioseg-map-section`}
        style={{
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          width: "min(1240px, calc(100% - 32px))",
          maxWidth: "1240px",
          margin: "0 auto",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(241,246,251,0.98) 100%)",
          border: "1px solid rgba(218, 228, 240, 0.9)",
          boxShadow: "0 24px 70px rgba(14, 23, 38, 0.07)",
        }}
      >
        <div className="mioseg-section-topline">
          <span>01</span>
          <strong>Karte</strong>
          <em>Suche, bewege und entdecke QR-X live</em>
        </div>
        <div className="mioseg-explore-compact-head">
          <div className={styles.sectionIntro} style={{ marginBottom: 0 }}>
            <span className={styles.sectionEyebrow}>Explore Map</span>
            <h2 className={styles.sectionTitle}>QR-X Karte</h2>
            <p className={styles.sectionText}>
              Suche echte QR-X, springe zu deinem Standort oder bewege die Karte – die Ergebnisse darunter reagieren live auf den Kartenausschnitt.
            </p>

            <div
              style={{
                marginTop: "16px",
                borderRadius: "24px",
                padding: "12px",
                background: "linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%)",
                border: "1px solid #dce8f4",
                boxShadow: "0 16px 38px rgba(14, 23, 38, 0.06)",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              <form action={explorePath} method="get" className="mioseg-map-search-form">
                <div className="mioseg-map-search-row">
                  <div style={{ position: "relative", minWidth: 0 }}>
                    <input
                      id="exploreMapSearchInput"
                      type="text"
                      name="q"
                      defaultValue={queryRaw}
                      autoComplete="off"
                      placeholder="QR-X suchen"
                      style={{
                        width: "100%",
                        minHeight: "56px",
                        padding: "0 18px",
                        borderRadius: "18px",
                        border: "1px solid #d9e5f2",
                        background: "#ffffff",
                        color: "#0e1726",
                        fontSize: "15px",
                        fontWeight: 800,
                        outline: "none",
                        boxShadow: "inset 0 1px 0 rgba(14,23,38,0.02)",
                      }}
                    />

                    <div
                      id="exploreMapSuggestions"
                      style={{
                        display: "none",
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "calc(100% + 10px)",
                        zIndex: 20,
                        borderRadius: "22px",
                        padding: "10px",
                        background: "#ffffff",
                        border: "1px solid #dce8f4",
                        boxShadow: "0 24px 60px rgba(14,23,38,0.16)",
                      }}
                    >
                      {publicEntries
                        .filter((entry) => entry.location_lat != null && entry.location_lng != null)
                        .slice(0, 120)
                        .map((entry) => (
                          <button
                            key={`suggest-${entry.id}`}
                            type="button"
                            className="mioseg-qrx-suggestion"
                            data-suggest-id={entry.id}
                            data-suggest-title={getEntryTitle(entry)}
                            data-suggest-search={[
                              getEntryTitle(entry),
                              getEntryText(entry),
                              getCategoryLabel(entry.category),
                              entry.location_name ?? "",
                            ]
                              .join(" ")
                              .toLowerCase()}
                            style={{
                              width: "100%",
                              border: 0,
                              cursor: "pointer",
                              display: "none",
                              textAlign: "left",
                              gap: "12px",
                              alignItems: "center",
                              padding: "10px",
                              borderRadius: "16px",
                              background: "transparent",
                              color: "#0e1726",
                            }}
                          >
                            <span
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "15px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#eef4fb",
                                fontSize: "20px",
                                flex: "0 0 auto",
                              }}
                            >
                              {getCategoryIcon(entry.category)}
                            </span>
                            <span style={{ display: "grid", gap: "2px", minWidth: 0 }}>
                              <strong style={{ fontSize: "14px", lineHeight: 1.2, color: "#0e1726" }}>
                                {getEntryTitle(entry)}
                              </strong>
                              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 800 }}>
                                {getCategoryLabel(entry.category)}
                                {entry.location_name?.trim() ? ` · ${entry.location_name.trim()}` : ""}
                              </span>
                            </span>
                          </button>
                        ))}

                      <div
                        id="exploreMapSuggestionsEmpty"
                        style={{
                          display: "none",
                          padding: "14px",
                          color: "#64748b",
                          fontSize: "13px",
                          fontWeight: 800,
                        }}
                      >
                        Keine passenden QR-X gefunden.
                      </div>
                    </div>
                  </div>

                  <button type="submit" className={styles.primaryButton} style={{ border: 0, cursor: "pointer" }}>
                    Suche starten
                  </button>

                  <button
                    type="button"
                    id="nearbyBtn"
                    className={styles.secondaryButtonDark}
                    data-query={queryRaw}
                    data-category={selectedCategory}
                    data-explore-path={explorePath}
                    aria-label="In meiner Nähe"
                    title="In meiner Nähe"
                    style={{ color: "#0d1726", borderColor: "#d9e5f2", cursor: "pointer" }}
                  >
                    {hasUserLocation ? "Standort aktiv" : "In meiner Nähe"}
                  </button>
                </div>
              </form>

              <div className="mioseg-map-category-row" aria-label="Explore Kategorien">
                <Link
                  href={buildExploreHref(locale, "all", queryRaw)}
                  className={`mioseg-category-chip ${selectedCategory === "all" ? "is-active" : ""}`}
                >
                  Alle <span>{publicEntries.length}</span>
                </Link>

                {categoryCounts.map((item) => (
                  <Link
                    key={item.value}
                    href={buildExploreHref(locale, item.value, queryRaw)}
                    className={`mioseg-category-chip ${selectedCategory === item.value ? "is-active" : ""}`}
                  >
                    {item.icon} {item.label} <span>{item.count}</span>
                  </Link>
                ))}

                {(query || selectedCategory !== "all" || hasUserLocation) ? (
                  <Link href={explorePath} className="mioseg-category-chip mioseg-reset-chip">
                    Zurücksetzen
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <div className="mioseg-map-status-pills">
              <span>🗺️ {entriesWithLocationCount} mit Standort</span>
              <span>📌 <strong id="visibleMapCount">{mapPoints.length}</strong> sichtbar</span>
              <span>🔥 Top zuerst</span>
            </div>
            <div id="mapMovingNotice" className="mioseg-map-moving-notice">
              Karte wird aktualisiert …
            </div>
          </div>
        </div>

        <div
          style={{
            borderRadius: "32px",
            padding: "8px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(232,240,249,0.98) 100%)",
            border: "1px solid rgba(206, 220, 236, 0.96)",
            boxShadow: "0 26px 74px rgba(14, 23, 38, 0.12)",
          }}
        >
          <ExploreMapClient points={mapPoints} hasUserLocation={hasUserLocation} userLat={userLat} userLng={userLng} />
        </div>

        <div id="explore-hub" className="mioseg-explore-hub">
          <div className="mioseg-explore-hub-head">
            <div>
              <span className="mioseg-section-anchor">Ergebnisse im aktuellen Kartenausschnitt</span>
              <h2 className={styles.sectionTitle} style={{ fontSize: "30px", marginTop: "14px" }}>
                Wähle, welche QR-X du sehen möchtest
              </h2>
              <p className={styles.sectionText}>
                Standardmäßig zeigen wir die beliebtesten Einträge. Du kannst jederzeit auf Nähe oder neue QR-X wechseln.
              </p>
            </div>

            <div className="mioseg-live-section-pills">
              <span><strong id="visibleMapCountHub">{mapPoints.length}</strong> sichtbar</span>
              <span>{hasUserLocation ? "📍 Standort aktiv" : "📍 Standort optional"}</span>
              <span id="newMapScopeLabel">Aktueller Kartenausschnitt</span>
            </div>
          </div>

          <input className="mioseg-explore-tab-input" type="radio" name="miosegExploreTab" id="miosegTabPopular" defaultChecked />
          <input className="mioseg-explore-tab-input" type="radio" name="miosegExploreTab" id="miosegTabNearby" />
          <input className="mioseg-explore-tab-input" type="radio" name="miosegExploreTab" id="miosegTabNew" />

          <div className="mioseg-explore-tabs" aria-label="Explore Ergebnis-Tabs">
            <label htmlFor="miosegTabPopular" className="mioseg-explore-tab mioseg-tab-popular">
              <strong>🔥 Beliebt <span data-tab-count="popular">{mapVisibleEntries.length}</span></strong>
              <em>Ranking im Kartenausschnitt</em>
            </label>

            <label htmlFor="miosegTabNearby" className={`mioseg-explore-tab mioseg-tab-nearby ${hasUserLocation ? "" : "is-disabled"}`}>
              <strong>📍 In deiner Nähe <span data-tab-count="nearby">{nearbyTabEntries.length}</span></strong>
              <em>{hasUserLocation ? "Nach Entfernung sortiert" : "Standort aktivieren"}</em>
            </label>

            <label htmlFor="miosegTabNew" className="mioseg-explore-tab mioseg-tab-new">
              <strong>🆕 Neu <span data-tab-count="new">{newMapEntries.length}</span></strong>
              <em>Gerade erstellt</em>
            </label>
          </div>

          <div
            id="activeMapQrx"
            className={styles.compareCardFeatured}
            style={{
              display: "none",
              borderRadius: "30px",
              marginBottom: "20px",
              background: "linear-gradient(180deg, #0d1726 0%, #17304d 100%)",
            }}
          >
            <div className={styles.compareLabelFeatured}>QR-X aktuell ausgewählt</div>
            <h3 id="activeMapQrxTitle" className={styles.compareTitleFeatured}>QR-X ausgewählt</h3>
            <p id="activeMapQrxText" style={{ margin: 0, color: "#dbe7f6", lineHeight: 1.7 }}>
              Wähle einen Marker, um den passenden Eintrag hier hervorzuheben.
            </p>
          </div>

          <div id="visibleMapEmpty" className={styles.compareCard} style={{ display: "none", borderRadius: "28px" }}>
            <h3 className={styles.compareTitle}>Keine QR-X im sichtbaren Bereich</h3>
            <p className={styles.featureText}>
              Verschiebe die Karte oder zoome heraus, um wieder Business QR-X im aktuellen Kartenausschnitt zu sehen.
            </p>
          </div>

          <div className="mioseg-explore-tab-panels">
            <section className="mioseg-explore-tab-panel mioseg-panel-popular" aria-label="Beliebt im Kartenausschnitt">
              <div className="mioseg-panel-title-row">
                <div>
                  <h3>🔥 Beliebt im Kartenausschnitt</h3>
                  <p>Sortiert nach Followern, Aufrufen, Verifizierung und Aktualität.</p>
                </div>
                <span>👑 Top QR-X zuerst</span>
              </div>

              {mapVisibleEntries.length > 0 ? (
                <div id="visibleMapResults" className={styles.valueGrid}>
                  {mapVisibleEntries.map((entry, index) => (
                    <div
                      key={`visible-wrap-${entry.id}`}
                      data-visible-map-card={entry.id}
                      data-visible-title={getEntryTitle(entry)}
                      data-visible-category={getCategoryLabel(entry.category)}
                      data-visible-followers={getFollowerCountForEntry(entry)}
                      data-visible-followers-label={formatFollowerCount(getFollowerCountForEntry(entry))}
                      data-visible-views={getViewTotalForEntry(entry)}
                      data-visible-views-label={formatViewCount(getViewTotalForEntry(entry))}
                      data-visible-social-label={
                        getSocialProofBadges(
                          entry,
                          getFollowerCountForEntry(entry),
                          getViewTotalForEntry(entry),
                          getUniqueViewCountForEntry(entry)
                        )[0]?.label ?? ""
                      }
                      data-visible-score={getExploreRankScore(entry, getFollowerCountForEntry(entry), getViewTotalForEntry(entry))}
                      style={{ order: index, display: index < INITIAL_VISIBLE_QRX ? "" : "none" }}
                    >
                      {renderExploreCard(entry, { keyPrefix: "map-visible" })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.compareCard} style={{ borderRadius: "28px" }}>
                  <h3 className={styles.compareTitle}>Keine beliebten QR-X gefunden</h3>
                  <p className={styles.featureText}>Verschiebe die Karte oder ändere deine Filter.</p>
                </div>
              )}

              {mapVisibleEntries.length > INITIAL_VISIBLE_QRX ? (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "28px" }}>
                  <button type="button" id="showMoreVisibleQrx" className={styles.primaryButton} style={{ border: 0, cursor: "pointer" }}>
                    Mehr anzeigen ({mapVisibleEntries.length - INITIAL_VISIBLE_QRX}+)
                  </button>
                </div>
              ) : null}
            </section>

            <section className="mioseg-explore-tab-panel mioseg-panel-nearby" aria-label="In deiner Nähe">
              <div className="mioseg-panel-title-row">
                <div>
                  <h3>📍 In deiner Nähe</h3>
                  <p>{hasUserLocation ? "Nach Entfernung zu deinem Standort sortiert." : "Aktiviere deinen Standort, um QR-X in deiner Nähe zu sehen."}</p>
                </div>
                <span>{hasUserLocation ? "📍 Standort aktiv" : "Standort optional"}</span>
              </div>

              {hasUserLocation && nearbyTabEntries.length > 0 ? (
                <div className={styles.valueGrid}>
                  {nearbyTabEntries.map((entry) =>
                    renderExploreCard(entry, {
                      keyPrefix: "nearby-tab",
                      distanceLabel: `📍 ${formatDistance(entry.distanceKm)}`,
                    })
                  )}
                </div>
              ) : (
                <div className={styles.compareCard} style={{ borderRadius: "28px" }}>
                  <h3 className={styles.compareTitle}>Standort aktivieren</h3>
                  <p className={styles.featureText}>
                    Klicke auf „In meiner Nähe“, damit die nächsten Business QR-X direkt hier angezeigt werden.
                  </p>
                </div>
              )}
            </section>

            <section className="mioseg-explore-tab-panel mioseg-panel-new" aria-label="Neue QR-X">
              <div className="mioseg-panel-title-row">
                <div>
                  <h3>🆕 Neu im Kartenausschnitt</h3>
                  <p>Die neuesten Business QR-X im aktuellen Kartenbereich.</p>
                </div>
                <span><strong id="newMapCount">{newMapEntries.length}</strong> neue Treffer</span>
              </div>

              {error ? (
                <div className={styles.compareCardFeatured} style={{ borderRadius: "30px" }}>
                  <div className={styles.compareLabelFeatured}>Fehlerzustand</div>
                  <h3 className={styles.compareTitleFeatured}>Fehler beim Laden</h3>
                  <p style={{ margin: 0, color: "#dbe7f6", lineHeight: 1.7 }}>
                    Die Explore-Einträge konnten gerade nicht geladen werden. Technische Meldung: {error.message}
                  </p>
                </div>
              ) : newMapEntries.length === 0 ? (
                <div className={styles.compareCard} style={{ borderRadius: "28px" }}>
                  <h3 className={styles.compareTitle}>Keine neuen QR-X gefunden</h3>
                  <p className={styles.featureText}>Verschiebe die Karte oder ändere deine Filter.</p>
                </div>
              ) : (
                <>
                  <div id="newQrxGrid" className={styles.valueGrid}>
                    {newMapEntries.map((entry, index) => (
                      <div
                        key={`new-${entry.id}`}
                        data-new-qrx-card={entry.id}
                        data-new-created={entry.created_at ? new Date(entry.created_at).getTime() : 0}
                        style={{ display: index < INITIAL_VISIBLE_QRX ? "" : "none" }}
                      >
                        {renderExploreCard(entry, { keyPrefix: "new-tab" })}
                      </div>
                    ))}
                  </div>

                  {newMapEntries.length > INITIAL_VISIBLE_QRX ? (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                      <button type="button" id="showMoreNewQrx" className={styles.primaryButton} style={{ border: 0, cursor: "pointer" }}>
                        Mehr anzeigen ({newMapEntries.length - INITIAL_VISIBLE_QRX}+)
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.mioseg-explore-page,
.mioseg-explore-page * {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}


.mioseg-explore-compact-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: end;
  margin-bottom: 14px;
}

.mioseg-map-status-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-bottom: 6px;
}

.mioseg-map-moving-notice {
  display: none;
  width: fit-content;
  margin: 8px 0 0 auto;
  min-height: 34px;
  align-items: center;
  border-radius: 999px;
  padding: 0 12px;
  background: #eef4ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  font-size: 12px;
  font-weight: 950;
  box-shadow: 0 10px 24px rgba(37,99,235,0.08);
}

.mioseg-map-moving-notice.is-visible {
  display: inline-flex;
}

.mioseg-map-status-pills span {
  min-height: 36px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #ffffff;
  color: #28496f;
  border: 1px solid #e5edf5;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
  box-shadow: 0 10px 24px rgba(14, 23, 38, 0.045);
}

.mioseg-map-search-form {
  gap: 10px !important;
}

.mioseg-map-search-row {
  grid-template-columns: minmax(0, 1fr) auto auto !important;
  gap: 10px !important;
}

.mioseg-map-search-row button {
  min-height: 50px !important;
  border-radius: 16px !important;
}

.mioseg-map-category-row {
  display: flex !important;
  flex-wrap: nowrap !important;
  gap: 8px !important;
  align-items: center !important;
  margin-top: 10px !important;
  overflow-x: auto !important;
  padding: 2px 2px 8px !important;
  scrollbar-width: thin;
  scroll-snap-type: x proximity;
}

.mioseg-category-chip {
  scroll-snap-align: start;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 0 12px;
  background: #ffffff;
  color: #0d1726;
  border: 1px solid #d9e5f2;
  font-size: 12px;
  font-weight: 950;
  text-decoration: none;
  box-shadow: 0 8px 18px rgba(14, 23, 38, 0.04);
}

.mioseg-category-chip span {
  min-width: 22px;
  min-height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: #eef4fb;
  color: #28496f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.mioseg-category-chip.is-active {
  background: linear-gradient(180deg, #0d1726 0%, #17304d 100%);
  border-color: #17304d;
  color: #ffffff;
}

.mioseg-category-chip.is-active span {
  background: rgba(255,255,255,0.16);
  color: #ffffff;
}

.mioseg-reset-chip {
  color: #6b7280;
}




.mioseg-explore-topbar {
  position: relative;
  z-index: 5;
  width: min(1240px, calc(100% - 32px));
  min-height: 78px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.mioseg-explore-brand {
  display: inline-flex;
  align-items: center;
}

.mioseg-explore-brand img {
  width: 112px;
  height: auto;
  display: block;
}

.mioseg-explore-topbar nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mioseg-explore-topbar nav a {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 13px;
  border-radius: 999px;
  color: #dbe7f6;
  text-decoration: none;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  transition: background 160ms ease, border-color 160ms ease;
}

.mioseg-explore-topbar nav a:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.22);
}

@media (max-width: 680px) {
  .mioseg-explore-topbar {
    min-height: 68px;
  }

  .mioseg-explore-topbar nav a:first-child {
    display: none;
  }

  .mioseg-explore-brand img {
    width: 96px;
  }
}

.mioseg-explore-section-nav {
  position: sticky;
  top: 12px;
  z-index: 35;
  max-width: 1180px;
  margin: -10px auto 18px;
  padding: 8px;
  display: flex;
  gap: 8px;
  justify-content: center;
  width: fit-content;
  max-width: calc(100% - 32px);
  border-radius: 999px;
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(218, 228, 240, 0.85);
  box-shadow: 0 18px 46px rgba(14, 23, 38, 0.10);
  backdrop-filter: blur(18px);
}

.mioseg-explore-section-nav a {
  min-height: 38px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  color: #17304d;
  background: transparent;
  text-decoration: none;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.mioseg-explore-section-nav a:hover {
  background: #eef4fb;
}

.mioseg-discover-section {
  scroll-margin-top: 92px;
}

.mioseg-map-section::before,
.mioseg-new-section::before,
.mioseg-nearby-section::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 7% 8%, rgba(77,132,201,0.09), transparent 24%),
    radial-gradient(circle at 92% 14%, rgba(13,23,38,0.05), transparent 22%);
}

.mioseg-section-topline {
  position: relative;
  z-index: 2;
  min-height: 44px;
  margin: 0 0 20px;
  padding: 9px 12px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(180deg, rgba(13,23,38,0.96) 0%, rgba(23,48,77,0.96) 100%);
  color: #ffffff;
  box-shadow: 0 16px 38px rgba(13,23,38,0.14);
}

.mioseg-section-topline span {
  min-width: 34px;
  height: 28px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.14);
  color: #ffffff;
  font-size: 12px;
  font-weight: 950;
}

.mioseg-section-topline strong {
  font-size: 13px;
  font-weight: 950;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.mioseg-section-topline em {
  font-style: normal;
  color: rgba(255,255,255,0.72);
  font-size: 12px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mioseg-subsection-topline {
  margin-top: 4px;
  margin-bottom: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%);
  color: #0d1726;
  border: 1px solid #dce8f4;
  box-shadow: 0 12px 30px rgba(14,23,38,0.07);
}

.mioseg-subsection-topline span {
  background: #fff7ed;
  color: #9a4f00;
}

.mioseg-subsection-topline em {
  color: #64748b;
}

.mioseg-discover-subsection {
  width: 100%;
  max-width: 100%;
  margin-top: 30px;
  border-radius: 32px;
  padding: 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(248,251,254,0.94) 100%);
  border: 1px solid rgba(218, 228, 240, 0.86);
  box-shadow: 0 20px 54px rgba(14,23,38,0.07);
}

.mioseg-trending-subsection {
  border-top: 0 !important;
}

.mioseg-new-section {
  scroll-margin-top: 92px;
}

@media (max-width: 768px) {
  .mioseg-explore-section-nav {
    justify-content: flex-start;
    overflow-x: auto;
    width: auto;
    max-width: calc(100% - 22px);
    margin-left: 11px;
    margin-right: 11px;
  }

  .mioseg-section-topline {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .mioseg-section-topline em {
    width: 100%;
    white-space: normal;
    padding-left: 44px;
  }

  .mioseg-discover-subsection {
    padding: 16px;
    border-radius: 26px;
  }
}


.mioseg-live-section-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;
  margin-bottom: 24px;
}

.mioseg-live-section-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.mioseg-live-section-pills span {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0 13px;
  background: #ffffff;
  color: #28496f;
  border: 1px solid #e5edf5;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
  box-shadow: 0 10px 24px rgba(14, 23, 38, 0.045);
}

.mioseg-live-section-pills strong {
  margin-right: 4px;
}

.mioseg-new-hidden-by-map {
  display: none !important;
}

.mioseg-new-map-empty {
  border-radius: 30px;
  text-align: center;
  padding: 42px 26px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%);
  border: 1px solid #dce8f4;
  box-shadow: 0 18px 46px rgba(14, 23, 38, 0.06);
}

@media (max-width: 900px) {
  .mioseg-live-section-head {
    grid-template-columns: 1fr;
  }

  .mioseg-live-section-pills {
    justify-content: flex-start;
  }
}

.mioseg-section-anchor {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #0d1726;
  color: #ffffff;
  font-size: 12px;
  font-weight: 950;
  box-shadow: 0 12px 28px rgba(13, 23, 38, 0.16);
}

@media (max-width: 900px) {
  .mioseg-explore-compact-head {
    grid-template-columns: 1fr;
  }

  .mioseg-map-status-pills {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .mioseg-map-search-row {
    grid-template-columns: 1fr !important;
  }
}

.mioseg-map-search-form {
  display: grid;
  gap: 14px;
}

.mioseg-map-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: center;
}

.mioseg-map-category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 14px;
}

.mioseg-qrx-suggestion:hover {
  background: #f4f8fd !important;
}

.mioseg-qrx-suggestion.is-visible {
  display: flex !important;
}

@media (max-width: 768px) {
  .mioseg-map-search-row {
    grid-template-columns: 1fr !important;
  }

  .mioseg-map-search-row > button {
    width: 100% !important;
    justify-content: center !important;
    min-height: 56px !important;
  }

  #exploreMapSuggestions {
    position: relative !important;
    top: auto !important;
    margin-top: 10px !important;
  }
}


.mioseg-search-grid {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
}

@media (max-width: 768px) {
  .mioseg-search-grid {
    grid-template-columns: 1fr !important;
  }

  .mioseg-search-grid > input {
    width: 100% !important;
    min-width: 0 !important;
  }

  .mioseg-search-grid > button {
    width: 100% !important;
    justify-content: center !important;
  }

  .mioseg-search-grid > button:nth-of-type(1),
  .mioseg-search-grid > button:nth-of-type(2) {
    min-height: 56px !important;
  }
}

.mioseg-explore-map-shell,
.mioseg-explore-map-shell .leaflet-container {
  position: relative;
  z-index: 0 !important;
}

.mioseg-explore-map-shell .leaflet-pane {
  z-index: 1 !important;
}

.mioseg-explore-map-shell .leaflet-tile-pane {
  z-index: 1 !important;
}

.mioseg-explore-map-shell .leaflet-overlay-pane {
  z-index: 2 !important;
}

.mioseg-explore-map-shell .leaflet-shadow-pane {
  z-index: 3 !important;
}

.mioseg-explore-map-shell .leaflet-marker-pane {
  z-index: 4 !important;
}

.mioseg-explore-map-shell .leaflet-tooltip-pane {
  z-index: 5 !important;
}

.mioseg-explore-map-shell .leaflet-popup-pane {
  z-index: 6 !important;
}

.mioseg-explore-map-shell .leaflet-control-container {
  position: relative;
  z-index: 7 !important;
}

header,
nav,
[data-header],
.site-header {
  position: relative;
  z-index: 50;
}

/* Mobile Explore compact fix */
@media (max-width: 640px) {
  #explore-map {
    overflow: hidden !important;
  }

  #explore-map .mioseg-explore-compact-head {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    margin-bottom: 12px !important;
  }

  #explore-map .mioseg-map-search-form {
    width: 100% !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }

  #explore-map .mioseg-map-search-row {
    grid-template-columns: 1fr !important;
    width: 100% !important;
    min-width: 0 !important;
    gap: 10px !important;
  }

  #explore-map .mioseg-map-search-row > div,
  #explore-map .mioseg-map-search-row input,
  #explore-map .mioseg-map-search-row button,
  #explore-map .mioseg-map-search-row a {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }

  #explore-map .mioseg-map-search-row button {
    justify-content: center !important;
    min-height: 52px !important;
    white-space: normal !important;
    text-align: center !important;
  }

  #exploreMapSearchInput {
    min-height: 54px !important;
    font-size: 14px !important;
    padding: 0 14px !important;
    text-overflow: ellipsis !important;
  }

  #exploreMapSuggestions {
    position: relative !important;
    top: auto !important;
    margin-top: 10px !important;
    max-height: 280px !important;
    overflow-y: auto !important;
  }

  #explore-map .mioseg-map-category-row {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 2px 2px 10px !important;
    gap: 8px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }

  #explore-map .mioseg-map-category-row::-webkit-scrollbar {
    display: none !important;
  }

  #explore-map .mioseg-category-chip {
    flex: 0 0 auto !important;
    max-width: 78vw !important;
    min-height: 40px !important;
    padding: 0 12px !important;
    font-size: 12px !important;
    white-space: nowrap !important;
  }

  #explore-map .mioseg-map-status-pills {
    width: 100% !important;
    justify-content: flex-start !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    padding-bottom: 8px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }

  #explore-map .mioseg-map-status-pills::-webkit-scrollbar {
    display: none !important;
  }

  #explore-map .mioseg-map-status-pills span {
    flex: 0 0 auto !important;
    min-height: 38px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 430px) {
  #explore-map {
    padding-left: 14px !important;
    padding-right: 14px !important;
  }

  #explore-map h2 {
    font-size: clamp(30px, 9vw, 44px) !important;
    line-height: 1.05 !important;
  }

  #explore-map p {
    max-width: 100% !important;
  }
}


/* HARD FIX: Explore mobile-safe toolbar, also works if mobile browser uses a wide layout viewport */
#explore-map,
#explore-map * {
  box-sizing: border-box;
}

#explore-map .mioseg-map-search-form {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow: hidden !important;
}

#explore-map .mioseg-map-search-row {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 10px !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

#explore-map .mioseg-map-search-row > div,
#explore-map .mioseg-map-search-row input,
#explore-map .mioseg-map-search-row button {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

#explore-map .mioseg-map-search-row button {
  min-height: 50px !important;
  justify-content: center !important;
  text-align: center !important;
}

#exploreMapSearchInput {
  min-height: 52px !important;
  padding-left: 14px !important;
  padding-right: 14px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

#explore-map .mioseg-map-category-row {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  gap: 8px !important;
  padding: 2px 2px 10px !important;
  -webkit-overflow-scrolling: touch !important;
  scrollbar-width: none !important;
}

#explore-map .mioseg-map-category-row::-webkit-scrollbar {
  display: none !important;
}

#explore-map .mioseg-category-chip {
  flex: 0 0 auto !important;
  max-width: 82vw !important;
  min-height: 40px !important;
  white-space: nowrap !important;
}

#explore-map .mioseg-map-status-pills {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  width: 100% !important;
  max-width: 100% !important;
  justify-content: flex-start !important;
  padding-bottom: 8px !important;
  -webkit-overflow-scrolling: touch !important;
  scrollbar-width: none !important;
}

#explore-map .mioseg-map-status-pills::-webkit-scrollbar {
  display: none !important;
}

#explore-map .mioseg-map-status-pills span {
  flex: 0 0 auto !important;
}

@media (min-width: 900px) {
  #explore-map .mioseg-map-search-row {
    grid-template-columns: minmax(0, 1fr) auto auto !important;
  }

  #explore-map .mioseg-map-search-row button {
    width: auto !important;
    min-width: 138px !important;
  }
}


/* MOBILE DISCOVER MODE: Karte in den Fokus, kein seitliches Überlaufen */
@media (max-width: 820px) {
  html,
  body {
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  .mioseg-explore-page {
    width: 100vw !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  .mioseg-explore-section-nav {
    display: none !important;
  }

  #explore-map {
    width: 100vw !important;
    max-width: 100vw !important;
    margin-left: 50% !important;
    transform: translateX(-50%) !important;
    padding: 16px 12px 18px !important;
    border-radius: 0 !important;
    border-left: 0 !important;
    border-right: 0 !important;
    overflow: hidden !important;
  }

  #explore-map,
  #explore-map * {
    box-sizing: border-box !important;
  }

  #explore-map > * {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }

  #explore-map .mioseg-section-topline {
    min-height: 34px !important;
    margin-bottom: 10px !important;
    padding: 7px 9px !important;
    border-radius: 14px !important;
  }

  #explore-map .mioseg-section-topline span {
    min-width: 28px !important;
    height: 24px !important;
    font-size: 10px !important;
  }

  #explore-map .mioseg-section-topline strong {
    font-size: 11px !important;
  }

  #explore-map .mioseg-section-topline em {
    display: none !important;
  }

  #explore-map .mioseg-explore-compact-head {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 10px !important;
  }

  #explore-map .mioseg-explore-compact-head h2 {
    max-width: 100% !important;
    margin-bottom: 8px !important;
    font-size: 30px !important;
    line-height: 1.04 !important;
    letter-spacing: -0.04em !important;
    overflow-wrap: anywhere !important;
  }

  #explore-map .mioseg-explore-compact-head p {
    max-width: 100% !important;
    margin-bottom: 12px !important;
    font-size: 14px !important;
    line-height: 1.45 !important;
  }

  #explore-map .mioseg-map-search-form {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }

  #explore-map .mioseg-map-search-row {
    display: grid !important;
    grid-template-columns: 1fr 48px !important;
    grid-template-areas:
      "search near"
      "submit submit" !important;
    gap: 8px !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }

  #explore-map .mioseg-map-search-row > div {
    grid-area: search !important;
    width: 100% !important;
    min-width: 0 !important;
  }

  #explore-map .mioseg-map-search-row button[type="submit"] {
    grid-area: submit !important;
    width: 100% !important;
    max-width: 100% !important;
    min-height: 44px !important;
  }

  #nearbyBtn {
    grid-area: near !important;
    width: 48px !important;
    min-width: 48px !important;
    max-width: 48px !important;
    height: 48px !important;
    min-height: 48px !important;
    padding: 0 !important;
    overflow: hidden !important;
    color: transparent !important;
    font-size: 0 !important;
    border-radius: 16px !important;
    position: relative !important;
  }

  #nearbyBtn::after {
    content: "📍";
    color: #0d1726;
    font-size: 19px;
    line-height: 1;
  }

  #exploreMapSearchInput {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    min-height: 48px !important;
    padding: 0 13px !important;
    font-size: 14px !important;
    border-radius: 16px !important;
  }

  #explore-map .mioseg-map-category-row {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    gap: 8px !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    padding: 4px 0 8px !important;
    margin-top: 9px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }

  #explore-map .mioseg-map-category-row::-webkit-scrollbar {
    display: none !important;
  }

  #explore-map .mioseg-category-chip {
    flex: 0 0 auto !important;
    max-width: 72vw !important;
    min-height: 36px !important;
    padding: 0 10px !important;
    font-size: 11px !important;
    white-space: nowrap !important;
  }

  #explore-map .mioseg-category-chip span {
    min-width: 19px !important;
    min-height: 19px !important;
    font-size: 10px !important;
    padding: 0 6px !important;
  }

  #explore-map .mioseg-map-status-pills {
    width: 100% !important;
    max-width: 100% !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    gap: 7px !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    justify-content: flex-start !important;
    padding: 0 0 8px !important;
    margin: 4px 0 8px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }

  #explore-map .mioseg-map-status-pills::-webkit-scrollbar {
    display: none !important;
  }

  #explore-map .mioseg-map-status-pills span {
    flex: 0 0 auto !important;
    min-height: 34px !important;
    padding: 0 10px !important;
    font-size: 11px !important;
  }

  #explore-map .mioseg-map-moving-notice {
    display: none !important;
  }

  #explore-map .mioseg-explore-map-shell,
  #explore-map [class*="map"] {
    max-width: 100% !important;
  }

  #explore-map .mioseg-discover-subsection {
    margin-top: 16px !important;
    padding: 14px !important;
    border-radius: 20px !important;
  }
}


/* Mobile Explore interaction fixes */
@media (max-width: 820px) {
  #explore-map .mioseg-map-category-row,
  #explore-map .mioseg-map-status-pills {
    touch-action: pan-x !important;
    overscroll-behavior-x: contain !important;
    cursor: grab !important;
  }

  #explore-map .mioseg-map-category-row > *,
  #explore-map .mioseg-map-status-pills > * {
    width: auto !important;
    max-width: none !important;
  }

  #explore-map .mioseg-category-chip {
    width: auto !important;
    max-width: none !important;
  }

  #explore-map .mioseg-category-chip span {
    width: auto !important;
  }

  #explore-map .mioseg-map-search-row > button:not(#nearbyBtn) {
    width: 100% !important;
  }
}

/* Desktop/tablet: both result sections stay the same visual width */
#visibleMapResults,
#newQrxGrid {
  width: 100% !important;
  max-width: 100% !important;
}

#visibleMapResults > *,
#newQrxGrid > * {
  max-width: 100% !important;
}


/* Final Explore interaction/layout fix */
#explore-map .mioseg-map-category-row,
#explore-map .mioseg-map-status-pills {
  overflow-x: auto !important;
  overflow-y: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  scroll-behavior: smooth !important;
  scrollbar-width: thin !important;
  touch-action: pan-x !important;
  overscroll-behavior-x: contain !important;
}

#explore-map .mioseg-map-category-row {
  cursor: grab !important;
  user-select: none !important;
  padding-bottom: 12px !important;
}

#explore-map .mioseg-map-category-row.is-dragging {
  cursor: grabbing !important;
}

#explore-map .mioseg-map-category-row > a,
#explore-map .mioseg-map-status-pills > span {
  flex: 0 0 auto !important;
  width: auto !important;
}

#explore-map .mioseg-category-chip {
  width: auto !important;
  max-width: none !important;
}

.mioseg-equal-result-section,
.mioseg-trending-subsection,
.mioseg-new-section {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

#visibleMapResults,
#newQrxGrid,
#visibleMapResults > *,
#newQrxGrid > * {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

@media (max-width: 820px) {
  #explore-map .mioseg-map-category-row {
    scrollbar-width: none !important;
  }

  #explore-map .mioseg-map-category-row::-webkit-scrollbar {
    display: none !important;
  }

  #explore-map .mioseg-category-chip {
    max-width: 72vw !important;
  }
}


/* Compact section headers: 02 Beliebt / 04 Neu */
.mioseg-section-topline {
  min-height: 36px !important;
  padding: 7px 10px !important;
  margin-bottom: 14px !important;
  border-radius: 14px !important;
  gap: 8px !important;
}

.mioseg-section-topline span {
  min-width: 30px !important;
  height: 24px !important;
  font-size: 10px !important;
  padding: 0 7px !important;
}

.mioseg-section-topline strong {
  font-size: 11px !important;
  letter-spacing: 0.035em !important;
}

.mioseg-section-topline em {
  font-size: 11px !important;
}

.mioseg-subsection-topline {
  margin-bottom: 12px !important;
}

.mioseg-section-anchor {
  min-height: 32px !important;
  padding: 0 11px !important;
  font-size: 11px !important;
  border-radius: 999px !important;
}

.mioseg-discover-subsection {
  margin-top: 20px !important;
  padding: 16px !important;
  border-radius: 24px !important;
}

.mioseg-live-section-head {
  margin-bottom: 16px !important;
}

.mioseg-live-section-pills span {
  min-height: 32px !important;
  padding: 0 11px !important;
  font-size: 11px !important;
}

@media (max-width: 820px) {
  .mioseg-section-topline {
    min-height: 32px !important;
    padding: 6px 8px !important;
    margin-bottom: 10px !important;
    border-radius: 12px !important;
  }

  .mioseg-section-topline span {
    min-width: 26px !important;
    height: 22px !important;
    font-size: 9px !important;
  }

  .mioseg-section-topline strong {
    font-size: 10px !important;
  }

  .mioseg-section-topline em {
    display: none !important;
  }

  .mioseg-section-anchor {
    min-height: 30px !important;
    padding: 0 10px !important;
    font-size: 10px !important;
  }

  .mioseg-discover-subsection {
    margin-top: 14px !important;
    padding: 12px !important;
    border-radius: 18px !important;
  }

  .mioseg-live-section-head {
    margin-bottom: 12px !important;
  }
}


@media (max-width: 820px) {
  #nearbyBtn {
    pointer-events: auto !important;
    touch-action: manipulation !important;
    opacity: 1 !important;
  }

  #nearbyBtn::after {
    content: "📍" !important;
    color: #0d1726 !important;
    font-size: 20px !important;
    line-height: 1 !important;
  }
}


/* Match 02 Beliebt + 04 Neu to the slimmer 03 In deiner Nähe width */
.mioseg-trending-subsection {
  width: min(100%, 1180px) !important;
  max-width: 1180px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}

.mioseg-new-section {
  width: min(100%, 1180px) !important;
  max-width: 1180px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}

.mioseg-new-section .mioseg-live-section-head,
.mioseg-new-section #newQrxGrid,
.mioseg-new-section #newQrxMapEmpty,
.mioseg-trending-subsection #visibleMapResults,
.mioseg-trending-subsection #visibleMapEmpty {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

@media (max-width: 820px) {
  .mioseg-trending-subsection,
  .mioseg-new-section {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
    border-radius: 20px !important;
  }
}


/* Targeted mobile fixes: scroll trap + search suggestions */
@media (max-width: 820px) {
  #explore-map .mioseg-map-status-pills {
    touch-action: pan-y pinch-zoom !important;
    overflow-x: visible !important;
    overflow-y: visible !important;
    flex-wrap: wrap !important;
  }

  #explore-map .mioseg-map-category-row {
    touch-action: pan-x pan-y pinch-zoom !important;
  }

  #exploreMapSuggestions {
    display: none;
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    position: absolute !important;
    left: 0 !important;
    right: 0 !important;
    top: calc(100% + 8px) !important;
    z-index: 999 !important;
    max-height: 260px !important;
    overflow-y: auto !important;
    border-radius: 18px !important;
  }

  #exploreMapSuggestions.is-visible {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }
}


/* Strong search suggestion visibility */
#exploreMapSuggestions.is-visible {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

#exploreMapSuggestions .mioseg-qrx-suggestion.is-visible {
  display: flex !important;
}


/* Smart suggestion dropdown: stable on desktop + mobile */
#explore-map .mioseg-map-search-form,
#explore-map .mioseg-map-search-row,
#explore-map .mioseg-map-search-row > div {
  overflow: visible !important;
}

#exploreMapSuggestions {
  position: relative !important;
  left: auto !important;
  right: auto !important;
  top: auto !important;
  width: 100% !important;
  max-width: 100% !important;
  margin-top: 10px !important;
  z-index: 90 !important;
  border-radius: 18px !important;
  overflow: hidden !important;
}

#exploreMapSuggestions.is-visible {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

#exploreMapSuggestions .mioseg-qrx-suggestion {
  min-height: 58px !important;
  align-items: center !important;
}

#exploreMapSuggestions .mioseg-qrx-suggestion.is-visible {
  display: flex !important;
}

@media (max-width: 820px) {
  #exploreMapSuggestions {
    max-height: 235px !important;
    overflow-y: auto !important;
    box-shadow: none !important;
    border-radius: 16px !important;
  }

  #exploreMapSuggestions .mioseg-qrx-suggestion {
    padding: 9px !important;
    min-height: 54px !important;
  }

  #exploreMapSuggestions .mioseg-qrx-suggestion span:first-child {
    width: 38px !important;
    height: 38px !important;
    border-radius: 13px !important;
    font-size: 18px !important;
  }
}



.mioseg-map-section,
.mioseg-discover-section,
.mioseg-nearby-section,
.mioseg-new-section {
  width: min(1240px, calc(100% - 32px));
  max-width: 1240px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.mioseg-qrx-card,
[data-visible-map-card],
[data-new-qrx-card] {
  transition: transform 190ms ease, box-shadow 190ms ease, border-color 190ms ease, filter 190ms ease;
}

.mioseg-qrx-card.is-map-active,
[data-visible-map-card].is-map-active .mioseg-qrx-card,
[data-new-qrx-card].is-map-active .mioseg-qrx-card {
  transform: translateY(-4px) scale(1.012);
  border-color: rgba(245,197,66,0.95) !important;
  box-shadow: 0 24px 68px rgba(224,161,6,0.18), 0 16px 46px rgba(14,23,38,0.11) !important;
}

[data-visible-map-card].is-map-active::before,
[data-new-qrx-card].is-map-active::before {
  content: "Gerade auf der Karte ausgewählt";
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  margin-bottom: 10px;
  border-radius: 999px;
  background: #fff7ed;
  color: #9a4f00;
  border: 1px solid #fed7aa;
  font-size: 12px;
  font-weight: 950;
  box-shadow: 0 10px 24px rgba(224,161,6,0.14);
}

.mioseg-map-moving-notice {
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 180ms ease, transform 180ms ease;
}

.mioseg-map-moving-notice.is-visible {
  opacity: 1;
  transform: translateY(0);
}



.mioseg-explore-hub {
  margin-top: 30px;
  border-radius: 32px;
  padding: 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(248,251,254,0.96) 100%);
  border: 1px solid rgba(218,228,240,0.9);
  box-shadow: 0 22px 60px rgba(14,23,38,0.075);
}

.mioseg-explore-hub-head {
  display: grid;
  grid-template-columns: minmax(0,1fr) auto;
  gap: 18px;
  align-items: end;
  margin-bottom: 18px;
}

.mioseg-explore-tab-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.mioseg-explore-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 22px;
  padding: 8px;
  border-radius: 26px;
  background: #eef4fb;
  border: 1px solid #dce8f4;
}

.mioseg-explore-tab {
  position: relative;
  z-index: 1;
  min-height: 74px;
  border-radius: 20px;
  padding: 13px 14px;
  display: grid;
  gap: 4px;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid rgba(218,228,240,0.92);
  box-shadow: 0 10px 24px rgba(14,23,38,0.045);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
}

.mioseg-explore-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(14,23,38,0.08);
}

.mioseg-explore-tab strong {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #0d1726;
  font-size: 14px;
  font-weight: 950;
}

.mioseg-explore-tab strong span {
  min-width: 28px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef4fb;
  color: #28496f;
  font-size: 12px;
}

.mioseg-explore-tab em {
  font-style: normal;
  color: #64748b;
  font-size: 12px;
  font-weight: 850;
}

.mioseg-explore-tab.is-disabled {
  opacity: 0.72;
}

#miosegTabPopular:checked ~ .mioseg-explore-tabs .mioseg-tab-popular,
#miosegTabNearby:checked ~ .mioseg-explore-tabs .mioseg-tab-nearby,
#miosegTabNew:checked ~ .mioseg-explore-tabs .mioseg-tab-new {
  background: linear-gradient(180deg, #0d1726 0%, #17304d 100%);
  border-color: #f5c542;
  box-shadow: 0 18px 44px rgba(13,23,38,0.18);
  transform: translateY(-2px);
}

#miosegTabPopular:checked ~ .mioseg-explore-tabs .mioseg-tab-popular strong,
#miosegTabNearby:checked ~ .mioseg-explore-tabs .mioseg-tab-nearby strong,
#miosegTabNew:checked ~ .mioseg-explore-tabs .mioseg-tab-new strong {
  color: #ffffff;
}

#miosegTabPopular:checked ~ .mioseg-explore-tabs .mioseg-tab-popular em,
#miosegTabNearby:checked ~ .mioseg-explore-tabs .mioseg-tab-nearby em,
#miosegTabNew:checked ~ .mioseg-explore-tabs .mioseg-tab-new em {
  color: rgba(255,255,255,0.72);
}

#miosegTabPopular:checked ~ .mioseg-explore-tabs .mioseg-tab-popular strong span,
#miosegTabNearby:checked ~ .mioseg-explore-tabs .mioseg-tab-nearby strong span,
#miosegTabNew:checked ~ .mioseg-explore-tabs .mioseg-tab-new strong span {
  background: rgba(255,255,255,0.16);
  color: #ffffff;
}

.mioseg-explore-tab-panels {
  position: relative;
}

.mioseg-explore-tab-panel {
  display: none;
  animation: miosegExplorePanelIn 180ms ease both;
}

#miosegTabPopular:checked ~ .mioseg-explore-tab-panels .mioseg-panel-popular,
#miosegTabNearby:checked ~ .mioseg-explore-tab-panels .mioseg-panel-nearby,
#miosegTabNew:checked ~ .mioseg-explore-tab-panels .mioseg-panel-new {
  display: block;
}

.mioseg-panel-title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 18px;
}

.mioseg-panel-title-row h3 {
  margin: 0 0 6px;
  color: #0d1726;
  font-size: 24px;
  font-weight: 950;
  letter-spacing: -0.35px;
}

.mioseg-panel-title-row p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.55;
}

.mioseg-panel-title-row > span {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #0d1726;
  color: #ffffff;
  font-size: 13px;
  font-weight: 950;
  box-shadow: 0 14px 30px rgba(13,23,38,0.16);
}

@keyframes miosegExplorePanelIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 800px) {
  .mioseg-explore-hub {
    padding: 16px;
    border-radius: 26px;
  }

  .mioseg-explore-hub-head {
    grid-template-columns: 1fr;
  }

  .mioseg-explore-tabs {
    grid-template-columns: 1fr;
  }

  .mioseg-explore-tab {
    min-height: 64px;
  }
}



[title] {
  cursor: help;
}

          `.trim(),
        }}
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  var btn = document.getElementById("nearbyBtn");

  if(btn){
    btn.addEventListener("click", function(){
      if(!navigator.geolocation){
        alert("Standort wird von diesem Browser nicht unterstützt.");
        return;
      }

      var query = btn.getAttribute("data-query") || "";
      var category = btn.getAttribute("data-category") || "all";
      var explorePath = btn.getAttribute("data-explore-path") || window.location.pathname;

      navigator.geolocation.getCurrentPosition(function(pos){
        var params = new URLSearchParams(window.location.search);
        if(query) params.set("q", query); else params.delete("q");
        if(category && category !== "all") params.set("category", category); else params.delete("category");
        params.set("lat", String(pos.coords.latitude));
        params.set("lng", String(pos.coords.longitude));
        window.location.href = explorePath + "?" + params.toString() + "#explore-map";
      }, function(){
        alert("Standort konnte nicht abgerufen werden.");
      }, { enableHighAccuracy: true, timeout: 10000 });
    });
  }

  function getVisibleCardMeta(id){
    if(!id) return null;
    var card = document.querySelector('[data-visible-map-card="' + CSS.escape(id) + '"]');
    if(!card) return null;
    return {
      id: id,
      title: card.getAttribute("data-visible-title") || "QR-X",
      category: card.getAttribute("data-visible-category") || "Business QR-X",
      followersLabel: card.getAttribute("data-visible-followers-label") || "0 Follower",
      viewsLabel: card.getAttribute("data-visible-views-label") || "0 Aufrufe",
      socialLabel: card.getAttribute("data-visible-social-label") || ""
    };
  }

  function setActiveMapQrx(id){
    var active = document.getElementById("activeMapQrx");
    var title = document.getElementById("activeMapQrxTitle");
    var text = document.getElementById("activeMapQrxText");
    var allCards = document.querySelectorAll("[data-visible-map-card]");

    allCards.forEach(function(card){
      var isActive = card.getAttribute("data-visible-map-card") === id;
      card.style.outline = isActive ? "3px solid rgba(37, 99, 235, 0.55)" : "";
      card.style.borderRadius = isActive ? "32px" : "";
    });

    var meta = getVisibleCardMeta(id);
    if(!active || !title || !text || !meta) return;

    active.style.display = "";
    title.textContent = meta.title;
    text.textContent = meta.category + " · " + meta.followersLabel + " · " + meta.viewsLabel + (meta.socialLabel ? " · " + meta.socialLabel : "") + " · Dieser QR-X ist gerade auf der Karte ausgewählt.";
  }


  function updateNewQrxCardsForMap(visibleIds){
    var grid = document.getElementById("newQrxGrid");
    var count = document.getElementById("newMapCount");
    var scopeLabel = document.getElementById("newMapScopeLabel");
    var showMoreNewBtn = document.getElementById("showMoreNewQrx");

    if(!grid) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-new-qrx-card]"));
    var visibleSet = new Set(Array.isArray(visibleIds) ? visibleIds : []);
    var filteredCards = [];

    cards.forEach(function(card){
      var id = card.getAttribute("data-new-qrx-card");
      var shouldShow = visibleSet.size === 0 ? true : visibleSet.has(id);
      card.classList.toggle("mioseg-new-hidden-by-map", !shouldShow);
      if(shouldShow) filteredCards.push(card);
    });

    filteredCards.sort(function(a, b){
      var createdA = Number(a.getAttribute("data-new-created") || "0");
      var createdB = Number(b.getAttribute("data-new-created") || "0");
      return createdB - createdA;
    });

    filteredCards.forEach(function(card, index){
      card.style.order = String(index);
      card.style.display = index < newLimit ? "" : "none";
    });

    if(count) count.textContent = String(filteredCards.length);

    if(scopeLabel){
      scopeLabel.textContent = visibleSet.size > 0 ? "Aktueller Kartenausschnitt" : "Alle sichtbaren QR-X";
    }

    if(showMoreNewBtn){
      showMoreNewBtn.style.display = filteredCards.length > newLimit ? "" : "none";
      showMoreNewBtn.textContent = filteredCards.length > newLimit
        ? "Mehr anzeigen (" + (filteredCards.length - newLimit) + "+)"
        : "Mehr anzeigen";
    }

    if(filteredCards.length === 0){
      grid.style.display = "none";
      var empty = document.getElementById("newQrxMapEmpty");
      if(!empty){
        empty = document.createElement("div");
        empty.id = "newQrxMapEmpty";
        empty.className = "mioseg-new-map-empty";
        empty.innerHTML = '<div style="font-size:42px;margin-bottom:10px;">🗺️</div><h3 style="margin:0 0 8px;color:#0d1726;font-size:24px;">Keine neuen QR-X in diesem Kartenausschnitt</h3><p style="margin:0;color:#64748b;font-weight:800;line-height:1.6;">Bewege die Karte oder zoome heraus, um neue Business QR-X in einem anderen Bereich zu entdecken.</p>';
        grid.parentNode.insertBefore(empty, grid);
      }
      empty.style.display = "";
    } else {
      grid.style.display = "";
      var existingEmpty = document.getElementById("newQrxMapEmpty");
      if(existingEmpty) existingEmpty.style.display = "none";
    }
  }


  function updateVisibleMapCards(visibleIds, activeId){
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-visible-map-card]"));
    var results = document.getElementById("visibleMapResults");
    var empty = document.getElementById("visibleMapEmpty");
    var count = document.getElementById("visibleMapCount");
    var showMoreVisibleBtn = document.getElementById("showMoreVisibleQrx");

    if(!cards.length) return;

    var visibleSet = new Set(Array.isArray(visibleIds) ? visibleIds : []);
    if(activeId) visibleSet.add(activeId);

    var visibleCards = [];
    var activeCard = null;

    cards.forEach(function(card){
      var id = card.getAttribute("data-visible-map-card");
      var shouldShow = visibleSet.has(id);

      if(shouldShow){
        visibleCards.push(card);
        if(activeId && id === activeId) activeCard = card;
      }

      card.style.display = "none";
      card.removeAttribute("data-visible-rank");
    });

    visibleCards.sort(function(a, b){
      if(activeId){
        var aActive = a.getAttribute("data-visible-map-card") === activeId;
        var bActive = b.getAttribute("data-visible-map-card") === activeId;
        if(aActive && !bActive) return -1;
        if(!aActive && bActive) return 1;
      }

      var scoreA = Number(a.getAttribute("data-visible-score") || "0");
      var scoreB = Number(b.getAttribute("data-visible-score") || "0");
      return scoreB - scoreA;
    });

    visibleCards.forEach(function(card, index){
      card.style.order = String(index);
      card.setAttribute("data-visible-rank", String(index + 1));

      var badge = card.querySelector("[data-dynamic-top-badge]");
      var isActive = activeId && card.getAttribute("data-visible-map-card") === activeId;

      if(index === 0){
        if(!badge){
          badge = document.createElement("div");
          badge.setAttribute("data-dynamic-top-badge", "true");
          badge.setAttribute("style", "margin-bottom:12px;display:inline-flex;align-items:center;gap:8px;min-height:34px;padding:0 12px;border-radius:999px;background:#fff7ed;color:#9a4f00;font-size:12px;font-weight:900;border:1px solid #fed7aa;");
          card.prepend(badge);
        }
        badge.textContent = isActive ? "📍 Ausgewählter QR-X" : "👑 Platz 1 im aktuellen Kartenausschnitt";
      } else if(badge) {
        badge.remove();
      }

      card.style.display = index < visibleLimit ? "" : "none";
    });

    if(count) count.textContent = String(visibleCards.length);

    if(results && empty){
      results.style.display = visibleCards.length > 0 ? "" : "none";
      empty.style.display = visibleCards.length > 0 ? "none" : "";
    }

    if(showMoreVisibleBtn){
      if(visibleCards.length > visibleLimit){
        showMoreVisibleBtn.style.display = "";
        showMoreVisibleBtn.textContent = "Mehr anzeigen (" + (visibleCards.length - visibleLimit) + "+)";
      } else {
        showMoreVisibleBtn.style.display = "none";
      }
    }

    var preferredActiveId = activeId || (visibleCards[0] ? visibleCards[0].getAttribute("data-visible-map-card") : null);
    if(preferredActiveId) setActiveMapQrx(preferredActiveId);
  }

  var exploreMapSearchInput = document.getElementById("exploreMapSearchInput");
  var exploreMapSuggestions = document.getElementById("exploreMapSuggestions");
  var exploreMapSuggestionsEmpty = document.getElementById("exploreMapSuggestionsEmpty");

  function updateExploreMapSuggestions(){
    if(!exploreMapSearchInput || !exploreMapSuggestions) return;

    var raw = String(exploreMapSearchInput.value || "").trim().toLowerCase();
    var suggestions = Array.prototype.slice.call(document.querySelectorAll(".mioseg-qrx-suggestion"));

    if(!raw){
      exploreMapSuggestions.style.display = "none";
      suggestions.forEach(function(item){
        item.classList.remove("is-visible");
      });
      if(exploreMapSuggestionsEmpty) exploreMapSuggestionsEmpty.style.display = "none";
      return;
    }

    var visibleCount = 0;
    suggestions.forEach(function(item){
      var haystack = item.getAttribute("data-suggest-search") || "";
      var isMatch = haystack.indexOf(raw) !== -1;
      var shouldShow = isMatch && visibleCount < 8;

      if(shouldShow){
        visibleCount += 1;
        item.classList.add("is-visible");
      } else {
        item.classList.remove("is-visible");
      }
    });

    exploreMapSuggestions.style.display = "block";
    if(exploreMapSuggestionsEmpty){
      exploreMapSuggestionsEmpty.style.display = visibleCount > 0 ? "none" : "block";
    }
  }

  if(exploreMapSearchInput){
    exploreMapSearchInput.addEventListener("input", updateExploreMapSuggestions);
    exploreMapSearchInput.addEventListener("focus", updateExploreMapSuggestions);
  }

  if(exploreMapSuggestions){
    exploreMapSuggestions.addEventListener("click", function(event){
      var target = event.target;
      if(!(target instanceof Element)) return;

      var item = target.closest(".mioseg-qrx-suggestion");
      if(!item) return;

      var id = item.getAttribute("data-suggest-id");
      var title = item.getAttribute("data-suggest-title") || "";

      if(exploreMapSearchInput) exploreMapSearchInput.value = title;
      exploreMapSuggestions.style.display = "none";

      if(id){
        var mapSection = document.getElementById("explore-map");
        if(mapSection){
          mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        window.setTimeout(function(){
          setActiveMapQrx(id);
          if(window.focusMarker) window.focusMarker(id);
        }, 260);
      }
    });
  }

  document.addEventListener("click", function(event){
    if(!exploreMapSuggestions || !exploreMapSearchInput) return;
    var target = event.target;
    if(!(target instanceof Element)) return;
    if(target === exploreMapSearchInput || target.closest("#exploreMapSuggestions")) return;
    exploreMapSuggestions.style.display = "none";
  });


  function focusQrxCardOnMap(id){
    if(!id) return;

    setActiveMapQrx(id);

    var mapSection = document.getElementById("explore-map");
    if(mapSection){
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.setTimeout(function(){
      if(window.focusMarker) window.focusMarker(id);
    }, 260);
  }

  document.addEventListener("click", function(event){
    var target = event.target;
    if(!(target instanceof Element)) return;

    var openButton = target.closest("[data-qrx-open-button]");
    if(openButton) return;

    var card = target.closest("[data-focus-marker]");
    if(!card) return;

    var id = card.getAttribute("data-focus-marker");
    if(!id) return;

    event.preventDefault();
    event.stopPropagation();

    focusQrxCardOnMap(id);
  }, true);

  window.addEventListener("mioseg-visible-qrx", function(event){
    var detail = event.detail || {};
    updateVisibleMapCards(detail.visibleIds || [], detail.activeId || null);
    updateNewQrxCardsForMap(detail.visibleIds || []);
  });

  window.addEventListener("mioseg-active-qrx", function(event){
    var detail = event.detail || {};
    if(detail.activeId) setActiveMapQrx(detail.activeId);
  });

  window.addEventListener("mioseg-map-moving", function(event){
    var notice = document.getElementById("mapMovingNotice");
    if(!notice) return;
    var detail = event.detail || {};
    notice.classList.toggle("is-visible", !!detail.isMoving);
  });

  var visibleLimit = 12;
  var newLimit = 12;

  var showMoreVisibleBtn = document.getElementById("showMoreVisibleQrx");
  if(showMoreVisibleBtn){
    showMoreVisibleBtn.addEventListener("click", function(){
      visibleLimit += 12;
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-visible-map-card][data-visible-rank]"))
        .sort(function(a, b){
          return Number(a.getAttribute("data-visible-rank") || "9999") - Number(b.getAttribute("data-visible-rank") || "9999");
        });

      cards.forEach(function(card, index){
        card.style.display = index < visibleLimit ? "" : "none";
      });

      if(cards.length <= visibleLimit){
        showMoreVisibleBtn.style.display = "none";
      } else {
        showMoreVisibleBtn.textContent = "Mehr anzeigen (" + (cards.length - visibleLimit) + "+)";
      }
    });
  }

  var showMoreNewBtn = document.getElementById("showMoreNewQrx");
  if(showMoreNewBtn){
    showMoreNewBtn.addEventListener("click", function(){
      newLimit += 12;
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-new-qrx-card]"))
        .filter(function(card){ return !card.classList.contains("mioseg-new-hidden-by-map"); });

      cards.forEach(function(card, index){
        card.style.display = index < newLimit ? "" : "none";
      });

      if(cards.length <= newLimit){
        showMoreNewBtn.style.display = "none";
      } else {
        showMoreNewBtn.textContent = "Mehr anzeigen (" + (cards.length - newLimit) + "+)";
      }
    });
  }

  updateNewQrxCardsForMap([]);


  var nearbyBtn = document.getElementById("nearbyBtn");
  if(nearbyBtn && !nearbyBtn.dataset.miosegNearbyBound){
    nearbyBtn.dataset.miosegNearbyBound = "1";
    nearbyBtn.addEventListener("click", function(){
      if(!navigator.geolocation){
        window.location.href = nearbyBtn.getAttribute("data-fallback") || "/de/explore";
        return;
      }

      nearbyBtn.disabled = true;
      var oldText = nearbyBtn.textContent;
      nearbyBtn.textContent = "Standort ...";

      navigator.geolocation.getCurrentPosition(function(position){
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var url = new URL(window.location.href);
        url.searchParams.set("lat", String(lat));
        url.searchParams.set("lng", String(lng));
        url.searchParams.set("near", "1");
        window.location.href = url.toString();
      }, function(){
        nearbyBtn.disabled = false;
        nearbyBtn.textContent = oldText || "In meiner Nähe";
        alert("Standort konnte nicht abgerufen werden. Bitte Standortfreigabe im Browser erlauben.");
      }, {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 30000
      });
    });
  }


  function bindMiosegExploreInteractions(){
    var nearby = document.getElementById("nearbyBtn");

    if(nearby && !nearby.dataset.miosegNearbyReady){
      nearby.dataset.miosegNearbyReady = "1";
      nearby.addEventListener("click", function(event){
        event.preventDefault();
        event.stopPropagation();

        if(!navigator.geolocation){
          alert("Standort wird von diesem Browser nicht unterstützt.");
          return;
        }

        var oldText = nearby.textContent || "In meiner Nähe";
        nearby.disabled = true;
        nearby.textContent = "Standort wird geladen ...";

        navigator.geolocation.getCurrentPosition(function(pos){
          var url = new URL(window.location.href);
          url.searchParams.set("lat", String(pos.coords.latitude));
          url.searchParams.set("lng", String(pos.coords.longitude));
          url.searchParams.set("near", "1");

          var query = nearby.getAttribute("data-query") || "";
          var category = nearby.getAttribute("data-category") || "all";

          if(query) url.searchParams.set("q", query);
          if(category && category !== "all") url.searchParams.set("category", category);

          url.hash = "explore-map";
          window.location.href = url.toString();
        }, function(error){
          nearby.disabled = false;
          nearby.textContent = oldText;
          alert("Standort konnte nicht abgerufen werden. Bitte erlaube den Standortzugriff im Browser.");
          console.warn("mioseg nearby geolocation error", error);
        }, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 15000
        });
      }, true);
    }

    var rows = document.querySelectorAll(".mioseg-map-category-row");
    rows.forEach(function(row){
      if(row.dataset.miosegDragReady) return;
      row.dataset.miosegDragReady = "1";

      row.addEventListener("wheel", function(event){
        if(Math.abs(event.deltaY) > Math.abs(event.deltaX)){
          row.scrollLeft += event.deltaY;
          event.preventDefault();
        }
      }, { passive: false });

      var isDown = false;
      var startX = 0;
      var startLeft = 0;
      var moved = false;

      row.addEventListener("pointerdown", function(event){
        isDown = true;
        moved = false;
        startX = event.clientX;
        startLeft = row.scrollLeft;
        row.classList.add("is-dragging");
      });

      row.addEventListener("pointermove", function(event){
        if(!isDown) return;
        var dx = event.clientX - startX;
        if(Math.abs(dx) > 4) moved = true;
        row.scrollLeft = startLeft - dx;
      });

      function endDrag(){
        isDown = false;
        row.classList.remove("is-dragging");
      }

      row.addEventListener("pointerup", endDrag);
      row.addEventListener("pointerleave", endDrag);
      row.addEventListener("click", function(event){
        if(moved){
          event.preventDefault();
          event.stopPropagation();
        }
      }, true);
    });
  }

  bindMiosegExploreInteractions();
  window.addEventListener("pageshow", bindMiosegExploreInteractions);


  function miosegBindNearbyButtonFinal(){
    var btn = document.getElementById("nearbyBtn");
    if(!btn || btn.dataset.miosegFinalNearby === "1") return;
    btn.dataset.miosegFinalNearby = "1";

    btn.addEventListener("click", function(event){
      event.preventDefault();
      event.stopPropagation();

      if(!navigator.geolocation){
        alert("Standort wird von diesem Browser nicht unterstützt.");
        return;
      }

      var oldText = btn.textContent || "In meiner Nähe";
      btn.disabled = true;
      btn.textContent = "Standort ...";

      navigator.geolocation.getCurrentPosition(function(pos){
        var url = new URL(window.location.href);
        url.searchParams.set("lat", String(pos.coords.latitude));
        url.searchParams.set("lng", String(pos.coords.longitude));
        url.searchParams.set("near", "1");

        var query = btn.getAttribute("data-query") || "";
        var category = btn.getAttribute("data-category") || "all";
        if(query) url.searchParams.set("q", query); else url.searchParams.delete("q");
        if(category && category !== "all") url.searchParams.set("category", category); else url.searchParams.delete("category");

        url.hash = "explore-map";
        window.location.assign(url.toString());
      }, function(error){
        btn.disabled = false;
        btn.textContent = oldText;
        alert("Standort konnte nicht abgerufen werden. Bitte Standortfreigabe im Browser erlauben.");
        console.warn("mioseg nearby final error", error);
      }, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    }, true);
  }

  miosegBindNearbyButtonFinal();
  document.addEventListener("DOMContentLoaded", miosegBindNearbyButtonFinal);
  window.addEventListener("pageshow", miosegBindNearbyButtonFinal);


  function bindMiosegSearchSuggestionsStable(){
    var input = document.getElementById("exploreMapSearchInput");
    var suggestions = document.getElementById("exploreMapSuggestions");
    if(!input || !suggestions || input.dataset.miosegSuggestionsStable === "1") return;

    input.dataset.miosegSuggestionsStable = "1";

    function update(){
      var hasValue = (input.value || "").trim().length > 0;
      suggestions.classList.toggle("is-visible", hasValue);
      suggestions.style.display = hasValue ? "block" : "none";
      suggestions.style.visibility = hasValue ? "visible" : "hidden";
      suggestions.style.opacity = hasValue ? "1" : "0";
      suggestions.style.pointerEvents = hasValue ? "auto" : "none";
    }

    input.addEventListener("input", update);
    input.addEventListener("keyup", update);
    input.addEventListener("focus", update);

    document.addEventListener("click", function(event){
      var target = event.target;
      if(!(target instanceof Element)) return;
      if(target === input || suggestions.contains(target)) return;
      suggestions.classList.remove("is-visible");
      suggestions.style.display = "none";
      suggestions.style.visibility = "hidden";
      suggestions.style.opacity = "0";
      suggestions.style.pointerEvents = "none";
    });

    update();
  }

  bindMiosegSearchSuggestionsStable();
  document.addEventListener("DOMContentLoaded", bindMiosegSearchSuggestionsStable);
  window.addEventListener("pageshow", bindMiosegSearchSuggestionsStable);


  function bindMiosegSearchSuggestionsStrong(){
    var input = document.getElementById("exploreMapSearchInput");
    var box = document.getElementById("exploreMapSuggestions");
    var empty = document.getElementById("exploreMapSuggestionsEmpty");
    if(!input || !box || input.dataset.miosegSuggestionsStrong === "1") return;

    input.dataset.miosegSuggestionsStrong = "1";

    function normalize(value){
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    function setBoxVisible(visible){
      box.classList.toggle("is-visible", visible);
      box.style.display = visible ? "block" : "none";
      box.style.visibility = visible ? "visible" : "hidden";
      box.style.opacity = visible ? "1" : "0";
      box.style.pointerEvents = visible ? "auto" : "none";
    }

    function update(){
      var raw = normalize(input.value);
      var items = Array.prototype.slice.call(document.querySelectorAll(".mioseg-qrx-suggestion"));

      if(!raw){
        setBoxVisible(false);
        items.forEach(function(item){
          item.classList.remove("is-visible");
          item.style.display = "none";
        });
        if(empty) empty.style.display = "none";
        return;
      }

      var visibleCount = 0;

      items.forEach(function(item){
        var haystack = normalize(item.getAttribute("data-suggest-search") || "");
        var title = normalize(item.getAttribute("data-suggest-title") || "");
        var isMatch = haystack.indexOf(raw) !== -1 || title.indexOf(raw) !== -1;
        var shouldShow = isMatch && visibleCount < 8;

        if(shouldShow){
          visibleCount += 1;
          item.classList.add("is-visible");
          item.style.display = "flex";
        } else {
          item.classList.remove("is-visible");
          item.style.display = "none";
        }
      });

      setBoxVisible(true);
      if(empty) empty.style.display = visibleCount > 0 ? "none" : "block";
    }

    input.addEventListener("input", update);
    input.addEventListener("keyup", update);
    input.addEventListener("focus", update);
    input.addEventListener("change", update);

    box.addEventListener("click", function(event){
      var target = event.target;
      if(!(target instanceof Element)) return;

      var item = target.closest(".mioseg-qrx-suggestion");
      if(!item) return;

      var id = item.getAttribute("data-suggest-id");
      var title = item.getAttribute("data-suggest-title") || "";

      input.value = title;
      setBoxVisible(false);

      if(id){
        var mapSection = document.getElementById("explore-map");
        if(mapSection){
          mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        window.setTimeout(function(){
          if(window.setActiveMapQrx) window.setActiveMapQrx(id);
          if(window.focusMarker) window.focusMarker(id);
        }, 260);
      }
    }, true);

    document.addEventListener("click", function(event){
      var target = event.target;
      if(!(target instanceof Element)) return;
      if(target === input || box.contains(target)) return;
      setBoxVisible(false);
    });

    update();
  }

  bindMiosegSearchSuggestionsStrong();
  document.addEventListener("DOMContentLoaded", bindMiosegSearchSuggestionsStrong);
  window.addEventListener("pageshow", bindMiosegSearchSuggestionsStrong);


  function bindMiosegSearchSuggestionsClean(){
    var input = document.getElementById("exploreMapSearchInput");
    var box = document.getElementById("exploreMapSuggestions");
    var empty = document.getElementById("exploreMapSuggestionsEmpty");
    if(!input || !box) return;

    if(input.dataset.miosegSuggestionsClean === "1") return;
    input.dataset.miosegSuggestionsClean = "1";

    function normalize(value){
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    function closeBox(){
      box.classList.remove("is-visible");
      box.style.display = "none";
      box.style.visibility = "hidden";
      box.style.opacity = "0";
      box.style.pointerEvents = "none";

      Array.prototype.slice.call(document.querySelectorAll(".mioseg-qrx-suggestion")).forEach(function(item){
        item.classList.remove("is-visible");
        item.style.display = "none";
      });

      if(empty) empty.style.display = "none";
    }

    function openBox(){
      box.classList.add("is-visible");
      box.style.display = "block";
      box.style.visibility = "visible";
      box.style.opacity = "1";
      box.style.pointerEvents = "auto";
    }

    function update(){
      var raw = normalize(input.value);
      var items = Array.prototype.slice.call(document.querySelectorAll(".mioseg-qrx-suggestion"));

      if(raw.length < 1){
        closeBox();
        return;
      }

      var visibleCount = 0;

      items.forEach(function(item){
        var haystack = normalize(item.getAttribute("data-suggest-search") || "");
        var title = normalize(item.getAttribute("data-suggest-title") || "");
        var isMatch = haystack.indexOf(raw) !== -1 || title.indexOf(raw) !== -1;
        var show = isMatch && visibleCount < 6;

        if(show){
          visibleCount += 1;
          item.classList.add("is-visible");
          item.style.display = "flex";
        } else {
          item.classList.remove("is-visible");
          item.style.display = "none";
        }
      });

      openBox();
      if(empty) empty.style.display = visibleCount > 0 ? "none" : "block";
    }

    input.addEventListener("input", update);
    input.addEventListener("keyup", update);
    input.addEventListener("focus", update);
    input.addEventListener("change", update);

    box.addEventListener("click", function(event){
      var target = event.target;
      if(!(target instanceof Element)) return;

      var item = target.closest(".mioseg-qrx-suggestion");
      if(!item) return;

      var id = item.getAttribute("data-suggest-id");
      var title = item.getAttribute("data-suggest-title") || "";

      input.value = title;
      closeBox();

      if(id){
        var mapSection = document.getElementById("explore-map");
        if(mapSection){
          mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        window.setTimeout(function(){
          if(window.setActiveMapQrx) window.setActiveMapQrx(id);
          if(window.focusMarker) window.focusMarker(id);
        }, 260);
      }
    }, true);

    document.addEventListener("click", function(event){
      var target = event.target;
      if(!(target instanceof Element)) return;
      if(target === input || box.contains(target)) return;
      closeBox();
    });

    closeBox();
  }

  bindMiosegSearchSuggestionsClean();
  document.addEventListener("DOMContentLoaded", bindMiosegSearchSuggestionsClean);
  window.addEventListener("pageshow", bindMiosegSearchSuggestionsClean);

})();`.trim(),
        }}
      />
    </div>
  );
}
