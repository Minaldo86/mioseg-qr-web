import Link from "next/link";
import styles from "../home-page.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ExploreMapClient from "./ExploreMapClient";

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

type ExploreEntry = {
  id: string;
  title: string | null;
  description: string | null;
  company_name: string | null;
  category: BusinessCategory | null;
  type: "normal" | "business" | null;
  verified: boolean | null;
  cover_image_url: string | null;
  logo_url: string | null;
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
function formatCompactMetric(value: number | null | undefined) {
  const count = Math.max(0, Number(value ?? 0));
  if (count >= 1000000) return `${(count / 1000000).toFixed(count >= 10000000 ? 0 : 1).replace(".", ",")} Mio.`;
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(".", ",")} Tsd.`;
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

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("qr_x_entries")
    .select(
      "id, title, description, company_name, category, type, verified, cover_image_url, logo_url, location_name, location_lat, location_lng, created_at, follower_count, views_total, views_unique_total, manual_follower_boost, manual_view_boost, manual_unique_view_boost"
    )
    .eq("type", "business")
    .order("created_at", { ascending: false })
    .limit(120)
    .returns<ExploreEntry[]>();

  const qrxIds = (data ?? []).map((entry) => entry.id);
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

  const items = (data ?? []).filter((item) => {
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
    count: (data ?? []).filter((item) => item.category === option.value).length,
  }));

  const activeCategoryCount = categoryCounts.filter((c) => c.count > 0).length;
  const verifiedCount = (data ?? []).filter((entry) => entry.verified).length;
  const entriesWithLocationCount = (data ?? []).filter((entry) => entry.location_lat != null && entry.location_lng != null).length;
  const totalFollowerCount = (data ?? []).reduce((sum, entry) => sum + getFollowerCountForEntry(entry), 0);
  const totalViewCount = (data ?? []).reduce((sum, entry) => sum + getViewTotalForEntry(entry), 0);

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
      coverUrl: entry.cover_image_url || entry.logo_url || null,
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

  const renderExploreCard = (
    entry: ExploreEntry,
    opts?: { keyPrefix?: string; distanceLabel?: string | null }
  ) => {
    const image = entry.cover_image_url || entry.logo_url || null;
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
        <Link href={`/qrx/${entry.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <article
            className={styles.valueCard}
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

                <span
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
                    fontSize: "13px",
                    fontWeight: 900,
                    boxShadow: "0 12px 26px rgba(13, 23, 38, 0.18)",
                  }}
                >
                  QR-X öffnen →
                </span>
              </div>
            </div>
          </article>
        </Link>
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
                <div className={styles.factNumber}>{(data ?? []).length}</div>
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
                <div className={styles.factNumber}>{formatFollowerCount(totalFollowerCount).replace(" Follower", "")}</div>
                <div className={styles.factLabel}>Follower insgesamt</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factNumber}>{formatCompactMetric(totalViewCount)}</div>
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
        <a href="#visibleMapResults">🔥 Beliebt</a>
        <a href="#explore-results">🆕 Neu</a>
      </nav>

      <section
        id="explore-map"
        className={`${styles.sectionAlt} mioseg-discover-section mioseg-map-section`}
        style={{
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
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
            <h2 className={styles.sectionTitle}>Business QR-X auf der Karte</h2>
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
                      placeholder="Name, Verein, Sehenswürdigkeit, Unternehmen oder Kategorie suchen ..."
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
                      {(data ?? [])
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
                  Alle <span>{(data ?? []).length}</span>
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

        {mapVisibleEntries.length > 0 ? (
          <div className="mioseg-discover-subsection mioseg-trending-subsection">
            <div className="mioseg-section-topline mioseg-subsection-topline">
              <span>02</span>
              <strong>Beliebt</strong>
              <em>Ranking im sichtbaren Kartenausschnitt</em>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "22px" }}>
              <div className={styles.sectionIntro} style={{ marginBottom: 0 }}>
                <span className="mioseg-section-anchor">🔥 Beliebt im Kartenausschnitt</span>
                <h2 className={styles.sectionTitle} style={{ fontSize: "30px" }}>Beliebte QR-X, die du gerade auf der Karte siehst</h2>
                <p className={styles.sectionText}>
                  Die Reihenfolge basiert auf sichtbarem Kartenbereich, Followern, Aufrufen, Verifizierung und Aktualität.
                </p>
              </div>

              <div
                style={{
                  minHeight: "46px",
                  padding: "0 16px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#0d1726",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 900,
                  boxShadow: "0 14px 30px rgba(13, 23, 38, 0.18)",
                }}
              >
                👑 Top QR-X zuerst
              </div>
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
              <div className={styles.compareLabelFeatured}>Gerade ausgewählt</div>
              <h3 id="activeMapQrxTitle" className={styles.compareTitleFeatured}>QR-X ausgewählt</h3>
              <p id="activeMapQrxText" style={{ margin: 0, color: "#dbe7f6", lineHeight: 1.7 }}>
                Wähle einen Marker oder tippe auf eine QR-X Karte, um den passenden Eintrag hier hervorzuheben.
              </p>
            </div>

            <div id="visibleMapEmpty" className={styles.compareCard} style={{ display: "none", borderRadius: "28px" }}>
              <h3 className={styles.compareTitle}>Keine QR-X im sichtbaren Bereich</h3>
              <p className={styles.featureText}>
                Verschiebe die Karte oder zoome heraus, um wieder Business QR-X im aktuellen Kartenausschnitt zu sehen.
              </p>
            </div>

            <div id="visibleMapResults" className={styles.valueGrid}>
              {mapVisibleEntries.slice(0, INITIAL_VISIBLE_QRX).map((entry, index) => (
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
                  style={{ order: index }}
                >
                  {index === 0 ? (
                    <div
                      style={{
                        marginBottom: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        minHeight: "34px",
                        padding: "0 12px",
                        borderRadius: "999px",
                        background: "#fff7ed",
                        color: "#9a4f00",
                        fontSize: "12px",
                        fontWeight: 900,
                        border: "1px solid #fed7aa",
                      }}
                    >
                      👑 Aktuell stärkstes Profil
                    </div>
                  ) : null}
                  {renderExploreCard(entry, { keyPrefix: "map-visible" })}
                </div>
              ))}
            </div>

            {mapVisibleEntries.length > INITIAL_VISIBLE_QRX ? (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "28px" }}>
                <button
                  type="button"
                  id="showMoreVisibleQrx"
                  className={styles.primaryButton}
                  style={{ border: 0, cursor: "pointer" }}
                >
                  Mehr anzeigen ({mapVisibleEntries.length - INITIAL_VISIBLE_QRX}+)
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {hasUserLocation && nearbyItems.length > 0 ? (
        <section className={`${styles.section} mioseg-discover-section mioseg-nearby-section`}>
          <div className="mioseg-section-topline">
            <span>03</span>
            <strong>In deiner Nähe</strong>
            <em>Nach Entfernung sortiert</em>
          </div>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>In deiner Nähe</span>
            <h2 className={styles.sectionTitle}>Die nächsten Business QR-X</h2>
            <p className={styles.sectionText}>
              Diese Einträge wurden anhand deines aktuellen Standorts nach Entfernung sortiert.
            </p>
          </div>

          <div className={styles.valueGrid}>
            {nearbyItems.map((entry) =>
              renderExploreCard(entry, {
                keyPrefix: "nearby",
                distanceLabel: `📍 ${formatDistance(entry.distanceKm)}`,
              })
            )}
          </div>
        </section>
      ) : null}

      <section
        id="explore-results"
        className={`${styles.sectionAlt} mioseg-discover-section mioseg-new-section`}
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,250,252,0.99) 100%)",
          border: "1px solid rgba(218, 228, 240, 0.86)",
          boxShadow: "0 22px 62px rgba(14, 23, 38, 0.055)",
        }}
      >
        <div className="mioseg-section-topline">
          <span>04</span>
          <strong>Neu</strong>
          <em>Automatisch aus dem aktuellen Kartenausschnitt</em>
        </div>
        <div className="mioseg-live-section-head">
          <div className={styles.sectionIntro} style={{ marginBottom: 0 }}>
            <span className="mioseg-section-anchor">🆕 Neu im Kartenausschnitt</span>
            <h2 className={styles.sectionTitle}>Was gerade in diesem Bereich neu ist</h2>
            <p className={styles.sectionText}>
              Bewege oder zoome die Karte. Diese Liste zeigt automatisch die neuesten QR-X aus dem aktuell sichtbaren Bereich.
            </p>
          </div>

          <div className="mioseg-live-section-pills">
            <span><strong id="newMapCount">{items.length}</strong> neue Treffer</span>
            <span id="newMapScopeLabel">Aktueller Kartenausschnitt</span>
          </div>
        </div>

        {error ? (
          <div className={styles.compareCardFeatured} style={{ borderRadius: "30px" }}>
            <div className={styles.compareLabelFeatured}>Fehlerzustand</div>
            <h3 className={styles.compareTitleFeatured}>Fehler beim Laden</h3>
            <p style={{ margin: 0, color: "#dbe7f6", lineHeight: 1.7 }}>
              Die Explore-Einträge konnten gerade nicht geladen werden. Technische Meldung: {error.message}
            </p>
          </div>
        ) : items.length === 0 ? (
          <div
            className={styles.compareCard}
            style={{
              borderRadius: "30px",
              textAlign: "center",
              padding: "42px 26px",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%)",
            }}
          >
            <div style={{ fontSize: "46px", marginBottom: "12px" }}>🔎</div>
            <h3 className={styles.compareTitle}>Keine passenden Business QR-X gefunden</h3>
            <p className={styles.featureText} style={{ maxWidth: "620px", margin: "0 auto 18px" }}>
              Es gibt aktuell keine Einträge, die zu deiner Suche oder Kategorie passen. Entferne den Filter oder versuche
              einen allgemeineren Suchbegriff.
            </p>
            <Link href={explorePath} className={styles.primaryButton}>
              Alle Einträge anzeigen
            </Link>
          </div>
        ) : (
  <>
    <div id="newQrxGrid" className={styles.valueGrid}>
      {items.map((entry, index) => (
        <div
          key={entry.id}
          data-new-qrx-card={entry.id}
          data-new-created={entry.created_at ? new Date(entry.created_at).getTime() : 0}
          style={{ display: index < INITIAL_VISIBLE_QRX ? "" : "none" }}
        >
          {renderExploreCard(entry)}
        </div>
      ))}
    </div>

    {items.length > INITIAL_VISIBLE_QRX ? (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "30px",
        }}
      >
        <button
          type="button"
          id="showMoreNewQrx"
          className={styles.primaryButton}
          style={{ border: 0, cursor: "pointer" }}
        >
          Mehr anzeigen ({items.length - INITIAL_VISIBLE_QRX}+)
        </button>
      </div>
    ) : null}
  </>
)}
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

    if(!cards.length) return;

    var visibleSet = new Set(Array.isArray(visibleIds) ? visibleIds : []);
    var visibleCards = [];

    cards.forEach(function(card){
      var id = card.getAttribute("data-visible-map-card");
      var shouldShow = visibleSet.has(id);
      card.style.display = shouldShow ? "" : "none";
      if(shouldShow) visibleCards.push(card);
    });

    visibleCards.sort(function(a, b){
      var scoreA = Number(a.getAttribute("data-visible-score") || "0");
      var scoreB = Number(b.getAttribute("data-visible-score") || "0");
      return scoreB - scoreA;
    });

    visibleCards.forEach(function(card, index){
      card.style.order = String(index);
      card.setAttribute("data-visible-rank", String(index + 1));

      var badge = card.querySelector("[data-dynamic-top-badge]");
      if(index === 0){
        if(!badge){
          badge = document.createElement("div");
          badge.setAttribute("data-dynamic-top-badge", "true");
          badge.textContent = "👑 Platz 1 im aktuellen Kartenausschnitt";
          badge.setAttribute("style", "margin-bottom:12px;display:inline-flex;align-items:center;gap:8px;min-height:34px;padding:0 12px;border-radius:999px;background:#fff7ed;color:#9a4f00;font-size:12px;font-weight:900;border:1px solid #fed7aa;");
          card.prepend(badge);
        } else {
          badge.textContent = "👑 Platz 1 im aktuellen Kartenausschnitt";
        }
      } else if(badge) {
        badge.remove();
      }
    });

    if(count) count.textContent = String(visibleCards.length);

    if(results && empty){
      results.style.display = visibleCards.length > 0 ? "" : "none";
      empty.style.display = visibleCards.length > 0 ? "none" : "";
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
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-visible-map-card]"));
      cards.forEach(function(card, index){
        if(index < visibleLimit){
          card.style.display = "";
        }
      });

      if(cards.length <= visibleLimit){
        showMoreVisibleBtn.style.display = "none";
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

})();`.trim(),
        }}
      />
    </div>
  );
}
