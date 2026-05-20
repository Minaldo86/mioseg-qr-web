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
      "id, title, description, company_name, category, type, verified, cover_image_url, logo_url, location_name, location_lat, location_lng, created_at"
    )
    .eq("type", "business")
    .order("created_at", { ascending: false })
    .limit(120)
    .returns<ExploreEntry[]>();

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

  const mapPoints = items
    .filter((entry) => entry.location_lat != null && entry.location_lng != null)
    .map((entry) => ({
      id: entry.id,
      title: getEntryTitle(entry),
      description: getEntryText(entry),
      category: getCategoryLabel(entry.category),
      categoryIcon: getCategoryIcon(entry.category),
      verified: !!entry.verified,
      href: `/${locale}/qrx/${entry.id}`,
      coverUrl: entry.cover_image_url || entry.logo_url || null,
      locationName: entry.location_name ?? null,
      latitude: entry.location_lat as number,
      longitude: entry.location_lng as number,
    }));

  const mapVisibleEntries = items.filter((entry) => entry.location_lat != null && entry.location_lng != null);

  const renderExploreCard = (
    entry: ExploreEntry,
    opts?: { keyPrefix?: string; distanceLabel?: string | null }
  ) => {
    const image = entry.cover_image_url || entry.logo_url || null;
    const key = `${opts?.keyPrefix ?? "card"}-${entry.id}`;
    const createdLabel = formatDate(entry.created_at);

    return (
      <div
        key={key}
        data-focus-marker={entry.id}
        style={{
          height: "100%",
          cursor: entry.location_lat != null && entry.location_lng != null ? "pointer" : "default",
        }}
      >
        <Link href={`/${locale}/qrx/${entry.id}`} style={{ textDecoration: "none", color: "inherit" }}>
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
                  {entry.location_lat != null && entry.location_lng != null ? "Auf der Karte verfügbar" : "Ohne Standortdaten"}
                </span>

                <span
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
    <div className={styles.page}>
      <section className={styles.heroSection}>
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
                    Suche, filtere und öffne echte Business QR-X direkt aus Supabase. Perfekt für Nutzer, die neue Orte
                    und Angebote entdecken möchten.
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

      <section className={styles.section}>
        <div
          style={{
            borderRadius: "32px",
            padding: "26px",
            background: "linear-gradient(180deg, #ffffff 0%, #f7fafc 100%)",
            border: "1px solid #e5edf5",
            boxShadow: "0 18px 46px rgba(14, 23, 38, 0.06)",
          }}
        >
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>Explore Filter</span>
            <h2 className={styles.sectionTitle}>Suche und filtere echte Einträge</h2>
            <p className={styles.sectionText}>
              Suche nach Namen, Ort oder Kategorie. Die Ergebnisse basieren direkt auf deinen Business QR-X Daten.
            </p>
          </div>

          <form action={explorePath} method="get" style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                name="q"
                defaultValue={queryRaw}
                placeholder="z. B. Restaurant, Praxis, Geilenkirchen ..."
                style={{
                  width: "100%",
                  minHeight: "56px",
                  padding: "0 18px",
                  borderRadius: "18px",
                  border: "1px solid #d9e5f2",
                  background: "#ffffff",
                  color: "#0e1726",
                  fontSize: "15px",
                  fontWeight: 700,
                  outline: "none",
                  boxShadow: "inset 0 1px 0 rgba(14,23,38,0.02)",
                }}
              />

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

            <div className={styles.heroButtons} style={{ marginBottom: 0 }}>
              <Link href={explorePath} className={styles.secondaryButtonDark} style={{ color: "#0d1726", borderColor: "#d9e5f2" }}>
                Filter zurücksetzen
              </Link>
              {query ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "48px",
                    padding: "0 16px",
                    borderRadius: "14px",
                    background: "#eef4fb",
                    color: "#28496f",
                    fontSize: "14px",
                    fontWeight: 900,
                  }}
                >
                  Suche: „{queryRaw.trim()}“
                </span>
              ) : null}
            </div>
          </form>

          <div className={styles.heroButtons} style={{ marginBottom: 0 }}>
            <Link
              href={buildExploreHref(locale, "all", queryRaw)}
              className={selectedCategory === "all" ? styles.primaryButton : styles.secondaryButtonDark}
              style={selectedCategory === "all" ? undefined : { color: "#0d1726", borderColor: "#d9e5f2" }}
            >
              Alle ({(data ?? []).length})
            </Link>

            {categoryCounts.map((item) => (
              <Link
                key={item.value}
                href={buildExploreHref(locale, item.value, queryRaw)}
                className={selectedCategory === item.value ? styles.primaryButton : styles.secondaryButtonDark}
                style={selectedCategory === item.value ? undefined : { color: "#0d1726", borderColor: "#d9e5f2" }}
              >
                {item.icon} {item.label} ({item.count})
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="explore-map" className={styles.sectionAlt} style={{ position: "relative", zIndex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className={styles.sectionIntro} style={{ marginBottom: "24px" }}>
            <span className={styles.sectionEyebrow}>Explore Map</span>
            <h2 className={styles.sectionTitle}>Business QR-X auf der Karte</h2>
            <p className={styles.sectionText}>
              Zoome, bewege die Karte und öffne Business QR-X direkt aus dem Marker-Popup.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                minHeight: "42px",
                padding: "0 14px",
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "999px",
                background: "#ffffff",
                color: "#28496f",
                border: "1px solid #e5edf5",
                fontSize: "13px",
                fontWeight: 900,
              }}
            >
              🗺️ {entriesWithLocationCount} mit Standort
            </span>
            <span
              style={{
                minHeight: "42px",
                padding: "0 14px",
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "999px",
                background: "#ffffff",
                color: "#28496f",
                border: "1px solid #e5edf5",
                fontSize: "13px",
                fontWeight: 900,
              }}
            >
              📌 <span id="visibleMapCount">{mapPoints.length}</span> aktuell im Kartenausschnitt
            </span>
          </div>
        </div>

        <div
          style={{
            borderRadius: "34px",
            padding: "12px",
            background: "linear-gradient(180deg, #ffffff 0%, #eef4fb 100%)",
            border: "1px solid #dce8f4",
            boxShadow: "0 22px 60px rgba(14, 23, 38, 0.1)",
          }}
        >
          <ExploreMapClient points={mapPoints} hasUserLocation={hasUserLocation} userLat={userLat} userLng={userLng} />
        </div>

        {mapVisibleEntries.length > 0 ? (
          <div
            style={{
              marginTop: "30px",
              borderTop: "1px solid #dce8f4",
              paddingTop: "28px",
            }}
          >
            <div className={styles.sectionIntro} style={{ marginBottom: "22px" }}>
              <span className={styles.sectionEyebrow}>Im Kartenausschnitt</span>
              <h2 className={styles.sectionTitle} style={{ fontSize: "30px" }}>QR-X, die du gerade auf der Karte siehst</h2>
              <p className={styles.sectionText}>
                Wenn du die Karte verschiebst oder zoomst, aktualisiert sich diese Auswahl automatisch.
              </p>
            </div>

            <div id="visibleMapEmpty" className={styles.compareCard} style={{ display: "none", borderRadius: "28px" }}>
              <h3 className={styles.compareTitle}>Keine QR-X im sichtbaren Bereich</h3>
              <p className={styles.featureText}>
                Verschiebe die Karte oder zoome heraus, um wieder Business QR-X im aktuellen Kartenausschnitt zu sehen.
              </p>
            </div>

            <div id="visibleMapResults" className={styles.valueGrid}>
              {mapVisibleEntries.map((entry) => (
                <div key={`visible-wrap-${entry.id}`} data-visible-map-card={entry.id}>
                  {renderExploreCard(entry, { keyPrefix: "map-visible" })}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {hasUserLocation && nearbyItems.length > 0 ? (
        <section className={styles.section}>
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

      <section id="explore-results" className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Neu auf Explore</span>
          <h2 className={styles.sectionTitle}>Direkt aus deiner Datenbank</h2>
          <p className={styles.sectionText}>
            Diese Karten werden automatisch aus qr_x_entries geladen und auf /qrx/[id] verlinkt.
          </p>
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
          <div className={styles.valueGrid}>{items.map((entry) => renderExploreCard(entry))}</div>
        )}
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
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
        window.location.href = explorePath + "?" + params.toString();
      }, function(){
        alert("Standort konnte nicht abgerufen werden.");
      }, { enableHighAccuracy: true, timeout: 10000 });
    });
  }

  function updateVisibleMapCards(visibleIds){
    var cards = document.querySelectorAll("[data-visible-map-card]");
    var results = document.getElementById("visibleMapResults");
    var empty = document.getElementById("visibleMapEmpty");
    var count = document.getElementById("visibleMapCount");

    if(!cards.length) return;

    var visibleSet = new Set(Array.isArray(visibleIds) ? visibleIds : []);
    var visibleCount = 0;

    cards.forEach(function(card){
      var id = card.getAttribute("data-visible-map-card");
      var shouldShow = visibleSet.has(id);
      card.style.display = shouldShow ? "" : "none";
      if(shouldShow) visibleCount++;
    });

    if(count) count.textContent = String(visibleCount);

    if(results && empty){
      results.style.display = visibleCount > 0 ? "" : "none";
      empty.style.display = visibleCount > 0 ? "none" : "";
    }
  }

  window.addEventListener("mioseg-visible-qrx", function(event){
    var detail = event.detail || {};
    updateVisibleMapCards(detail.visibleIds || []);
  });

  var cards = document.querySelectorAll("[data-focus-marker]");
  cards.forEach(function(card){
    card.addEventListener("mouseenter", function(){
      var id = card.getAttribute("data-focus-marker");
      if(id && window.focusMarker) window.focusMarker(id);
    });
  });
})();`.trim(),
        }}
      />
    </div>
  );
}
