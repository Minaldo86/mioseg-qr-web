import Link from "next/link";
import styles from "../[locale]/home-page.module.css";
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

function buildExploreHref(category: string, q: string) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (q.trim()) params.set("q", q.trim());
  const qs = params.toString();
  return qs ? `/explore?${qs}` : "/explore";
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

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const selectedCategory = getFirst(sp.category) || "all";
  const query = getFirst(sp.q).trim().toLowerCase();
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

  const mapPoints = items
    .filter((entry) => entry.location_lat != null && entry.location_lng != null)
    .map((entry) => ({
      id: entry.id,
      title: getEntryTitle(entry),
      description: getEntryText(entry),
      category: getCategoryLabel(entry.category),
      categoryIcon: getCategoryIcon(entry.category),
      verified: !!entry.verified,
      href: `/qrx/${entry.id}`,
      coverUrl: entry.cover_image_url || entry.logo_url || null,
      locationName: entry.location_name ?? null,
      latitude: entry.location_lat as number,
      longitude: entry.location_lng as number,
    }));

  const renderExploreCard = (
    entry: ExploreEntry,
    opts?: { keyPrefix?: string; distanceLabel?: string | null }
  ) => {
    const image = entry.cover_image_url || entry.logo_url || null;
    const key = `${opts?.keyPrefix ?? "card"}-${entry.id}`;

    return (
      <div
        key={key}
        onClick={() => {
          if (typeof window !== "undefined" && (window as any).focusMarker) {
            (window as any).focusMarker(entry.id);
          }
        }}
      >
        <Link
          href={`/qrx/${entry.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
        <div
          className={styles.valueCard}
          style={{
            height: "100%",
            padding: "14px",
            borderRadius: "28px",
            boxShadow: "0 18px 40px rgba(14, 23, 38, 0.08)",
            transition: "transform 160ms ease, box-shadow 160ms ease",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 10",
              borderRadius: "22px",
              overflow: "hidden",
              background: "linear-gradient(180deg, #edf3f9 0%, #dfe8f2 100%)",
              border: "1px solid #dde7f2",
              marginBottom: "16px",
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
                  width: "84px",
                  height: "84px",
                  borderRadius: "24px",
                  background: "linear-gradient(180deg, #ffffff 0%, #eef4fb 100%)",
                  border: "1px solid #d5e0ec",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "38px",
                  boxShadow: "0 10px 24px rgba(14, 23, 38, 0.08)",
                }}
              >
                {getCategoryIcon(entry.category)}
              </div>
            )}

            <div
              style={{
                position: "absolute",
                left: "14px",
                top: "14px",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
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
                  fontWeight: 800,
                  background: "rgba(255,255,255,0.9)",
                  color: "#28496f",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.85)",
                }}
              >
                {getCategoryIcon(entry.category)} {getCategoryLabel(entry.category)}
              </div>

              {entry.verified ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "34px",
                    padding: "0 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 900,
                    background: "rgba(13,23,38,0.82)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.14)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  ✓ Verified
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <h3
                className={styles.featureTitle}
                style={{
                  marginBottom: "10px",
                  fontSize: "24px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.4px",
                }}
              >
                {getEntryTitle(entry)}
              </h3>
              <p
                className={styles.featureText}
                style={{
                  fontSize: "15px",
                  lineHeight: 1.75,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  minHeight: "78px",
                }}
              >
                {getEntryText(entry)}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "4px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {entry.location_name?.trim() ? (
                  <div
                    style={{
                      color: "#5d6b7d",
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                  >
                    📍 {entry.location_name.trim()}
                  </div>
                ) : null}

                {opts?.distanceLabel ? (
                  <div
                    style={{
                      color: "#28496f",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    {opts.distanceLabel}
                  </div>
                ) : null}
              </div>

              <div
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
                  fontWeight: 800,
                  boxShadow: "0 10px 24px rgba(13, 23, 38, 0.16)",
                }}
              >
                Ansehen →
              </div>
            </div>
          </div>
        </div>
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
                  gap: "8px",
                  minHeight: "34px",
                  padding: "0 14px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                  color: "#d9e8fb",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                🧭 Explore
              </span>
            </div>

            <h1 className={styles.heroTitle}>Entdecke starke QR-X in deiner Nähe</h1>
            <p className={styles.heroText}>
              Finde Restaurants, Praxen, Unternehmen, Dienstleistungen und besondere Orte.
              Alle Einträge kommen direkt aus deinen echten Business QR-X Daten.
            </p>

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
                <div className={styles.factNumber}>{categoryCounts.filter((c) => c.count > 0).length}</div>
                <div className={styles.factLabel}>aktive Kategorien</div>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualStage}>
              <div className={styles.glowOne} />
              <div className={styles.glowTwo} />
              <div className={styles.phoneMockup}>
                <div className={styles.phoneHeader}>
                  <div className={styles.phoneDot} />
                  <div className={styles.phoneDot} />
                  <div className={styles.phoneDot} />
                </div>

                <div className={styles.phoneCardPrimary}>
                  <p className={styles.phoneOverline}>Live Explore</p>
                  <h3 className={styles.phoneCardTitle}>Echte Business QR-X</h3>
                  <p className={styles.phoneCardText}>
                    Suche, filtere und öffne direkt die aktuell verfügbaren Einträge auf mioseg qr web.
                  </p>
                </div>

                <div className={styles.phoneActionRow}>
                  <span className={styles.phoneActionChip}>Suche</span>
                  <span className={styles.phoneActionChip}>Kategorien</span>
                  <span className={styles.phoneActionChip}>Live Daten</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Explore Filter</span>
          <h2 className={styles.sectionTitle}>Suche und filtere echte Einträge</h2>
          <p className={styles.sectionText}>
            Suche nach Namen, Ort oder Kategorie. Alles basiert direkt auf deinen Business QR-X Daten.
          </p>
        </div>

        <form action="/explore" method="get" style={{ display: "grid", gap: "14px", marginBottom: "22px" }}>
          <input
            type="text"
            name="q"
            defaultValue={getFirst(sp.q)}
            placeholder="z. B. Restaurant, Praxis, Geilenkirchen ..."
            style={{
              width: "100%",
              minHeight: "52px",
              padding: "0 16px",
              borderRadius: "16px",
              border: "1px solid #d9e5f2",
              background: "#ffffff",
              color: "#0e1726",
              fontSize: "15px",
              fontWeight: 600,
              outline: "none",
            }}
          />

          <div className={styles.heroButtons}>
            <button type="submit" className={styles.primaryButton}>
              Suche starten
            </button>
            <button
              type="button"
              id="nearbyBtn"
              className={styles.secondaryButtonDark}
              data-query={getFirst(sp.q)}
              data-category={selectedCategory}
            >
              {hasUserLocation ? "Standort aktiv" : "In meiner Nähe"}
            </button>
            <Link href="/explore" className={styles.secondaryButtonDark}>
              Filter zurücksetzen
            </Link>
          </div>
        </form>

        <div className={styles.heroButtons}>
          <Link
            href={buildExploreHref("all", getFirst(sp.q))}
            className={selectedCategory === "all" ? styles.primaryButton : styles.secondaryButtonDark}
          >
            Alle
          </Link>

          {categoryCounts.map((item) => (
            <Link
              key={item.value}
              href={buildExploreHref(item.value, getFirst(sp.q))}
              className={selectedCategory === item.value ? styles.primaryButton : styles.secondaryButtonDark}
            >
              {item.icon} {item.label} ({item.count})
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Explore Map</span>
          <h2 className={styles.sectionTitle}>Echte Karte mit deinen Business QR-X</h2>
          <p className={styles.sectionText}>
            Zoome, bewege die Karte und öffne Business QR-X direkt aus dem Marker-Popup.
          </p>
        </div>

        <ExploreMapClient points={mapPoints} hasUserLocation={hasUserLocation} userLat={userLat} userLng={userLng} />
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

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>Neu auf Explore</span>
          <h2 className={styles.sectionTitle}>Direkt aus deiner Datenbank</h2>
          <p className={styles.sectionText}>
            Diese Karten werden automatisch aus qr_x_entries geladen und auf /qrx/[id] verlinkt.
          </p>
        </div>

        {error ? (
          <div className={styles.compareCardFeatured}>
            <h3 className={styles.compareTitleFeatured}>Fehler beim Laden</h3>
            <p style={{ margin: 0, color: "#dbe7f6", lineHeight: 1.7 }}>{error.message}</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.compareCard}>
            <h3 className={styles.compareTitle}>Keine Treffer gefunden</h3>
            <p className={styles.featureText}>
              Es wurden aktuell keine Business QR-X gefunden, die zu deiner Suche passen.
            </p>
          </div>
        ) : (
          <div className={styles.valueGrid}>{items.map((entry) => renderExploreCard(entry))}</div>
        )}
      </section>

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  var btn = document.getElementById("nearbyBtn");
  if(!btn) return;

  btn.addEventListener("click", function(){
    if(!navigator.geolocation){
      alert("Standort wird von diesem Browser nicht unterstützt.");
      return;
    }

    var query = btn.getAttribute("data-query") || "";
    var category = btn.getAttribute("data-category") || "all";

    navigator.geolocation.getCurrentPosition(function(pos){
      var params = new URLSearchParams(window.location.search);
      if(query) params.set("q", query); else params.delete("q");
      if(category && category !== "all") params.set("category", category); else params.delete("category");
      params.set("lat", String(pos.coords.latitude));
      params.set("lng", String(pos.coords.longitude));
      window.location.href = "/explore?" + params.toString();
    }, function(){
      alert("Standort konnte nicht abgerufen werden.");
    }, { enableHighAccuracy: true, timeout: 10000 });
  });
})();`.trim(),
        }}
      />
    </div>
  );
}
