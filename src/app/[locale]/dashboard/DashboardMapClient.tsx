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
  addTo(map: LeafletMap): LeafletMarker;
  bindPopup(
    html: string,
    options?: { maxWidth?: number; className?: string },
  ): LeafletMarker;
  getLatLng(): LeafletLatLng;
  openPopup(): LeafletMarker;
  on(eventName: string, handler: () => void): LeafletMarker;
};

type LeafletMap = {
  setView: (center: [number, number] | LeafletLatLng, zoom: number, options?: { animate?: boolean }) => LeafletMap;
  getCenter?: () => { lat: number; lng: number };
  fitBounds: (bounds: [number, number][], options?: { padding?: [number, number]; maxZoom?: number }) => LeafletMap;
  flyTo?: (center: [number, number] | LeafletLatLng, zoom: number, options?: { animate?: boolean; duration?: number }) => LeafletMap;
  getZoom?: () => number;
  getBounds: () => LeafletBounds;
  on: (eventName: string, handler: () => void) => LeafletMap;
  off: (eventName: string, handler: () => void) => LeafletMap;
  removeLayer: (layer: unknown) => LeafletMap;
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

const LEGEND: Array<{ kind: MarkerKind; label: string; color: string }> = [
  { kind: "own_business", label: "Gold = Mein Business QR-X", color: "#f2b705" },
  { kind: "saved_business", label: "Dunkelgrün = Gespeichertes Business QR-X", color: "#059669" },
  { kind: "own_normal", label: "Hellgrün = Mein normaler QR-X", color: "#22c55e" },
  { kind: "saved_normal", label: "Lila = Gespeicherter QR-X", color: "#8b5cf6" },
  { kind: "scan", label: "Blau = Normaler Scan", color: "#2563eb" },
];

type FilterMode = "all" | "own" | "saved" | "business" | "normal" | "scan" | "verified";

type MapViewport = {
  south: number;
  west: number;
  north: number;
  east: number;
  zoom: number;
};

type MapCluster = {
  id: string;
  latitude: number;
  longitude: number;
  points: MapPoint[];
};

const CLUSTER_PIXEL_SIZE = 76;
const CLUSTER_MAX_ZOOM = 14;

function projectToWorldPixels(
  latitude: number,
  longitude: number,
  zoom: number,
) {
  const scale = 256 * 2 ** zoom;
  const clampedLatitude = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  const sinLatitude = Math.sin((clampedLatitude * Math.PI) / 180);

  return {
    x: ((longitude + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      scale,
  };
}

function clusterMapPoints(points: MapPoint[], zoom: number): MapCluster[] {
  if (zoom > CLUSTER_MAX_ZOOM) {
    return points.map((point) => ({
      id: `point:${point.id}`,
      latitude: point.latitude,
      longitude: point.longitude,
      points: [point],
    }));
  }

  const buckets = new Map<
    string,
    {
      latitudeTotal: number;
      longitudeTotal: number;
      points: MapPoint[];
    }
  >();

  points.forEach((point) => {
    const projected = projectToWorldPixels(
      point.latitude,
      point.longitude,
      zoom,
    );
    const bucketX = Math.floor(projected.x / CLUSTER_PIXEL_SIZE);
    const bucketY = Math.floor(projected.y / CLUSTER_PIXEL_SIZE);
    const key = `${bucketX}:${bucketY}`;

    const current = buckets.get(key);

    if (current) {
      current.latitudeTotal += point.latitude;
      current.longitudeTotal += point.longitude;
      current.points.push(point);
      return;
    }

    buckets.set(key, {
      latitudeTotal: point.latitude,
      longitudeTotal: point.longitude,
      points: [point],
    });
  });

  return Array.from(buckets.entries()).map(([key, bucket]) => ({
    id:
      bucket.points.length === 1
        ? `point:${bucket.points[0].id}`
        : `cluster:${zoom}:${key}`,
    latitude: bucket.latitudeTotal / bucket.points.length,
    longitude: bucket.longitudeTotal / bucket.points.length,
    points: bucket.points,
  }));
}

const DASHBOARD_MAP_STATE_KEY = "mioseg.dashboard.map-state.v1";
const VIEWPORT_DEBOUNCE_MS = 320;
const VIEWPORT_PADDING_FACTOR = 0.22;

function expandViewport(viewport: MapViewport): MapViewport {
  const latPadding = Math.max(
    0.03,
    (viewport.north - viewport.south) * VIEWPORT_PADDING_FACTOR,
  );
  const lngPadding = Math.max(
    0.03,
    (viewport.east - viewport.west) * VIEWPORT_PADDING_FACTOR,
  );

  return {
    south: Math.max(-90, viewport.south - latPadding),
    west: Math.max(-180, viewport.west - lngPadding),
    north: Math.min(90, viewport.north + latPadding),
    east: Math.min(180, viewport.east + lngPadding),
    zoom: viewport.zoom,
  };
}

function viewportFromMap(map: LeafletMap): MapViewport {
  const bounds = map.getBounds();

  return {
    south: bounds.getSouth(),
    west: bounds.getWest(),
    north: bounds.getNorth(),
    east: bounds.getEast(),
    zoom: map.getZoom?.() ?? 6,
  };
}

function readStoredMapState() {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_MAP_STATE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      center?: [number, number];
      zoom?: number;
    };

    const lat = parsed.center?.[0];
    const lng = parsed.center?.[1];
    const zoom = parsed.zoom;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      !Number.isFinite(zoom)
    ) {
      return null;
    }

    return {
      center: [lat as number, lng as number] as [number, number],
      zoom: Math.min(19, Math.max(2, zoom as number)),
    };
  } catch {
    return null;
  }
}

function storeMapState(map: LeafletMap) {
  try {
    const center = map.getCenter?.();
    const zoom = map.getZoom?.();

    if (!center || !Number.isFinite(zoom)) return;

    window.localStorage.setItem(
      DASHBOARD_MAP_STATE_KEY,
      JSON.stringify({
        center: [center.lat, center.lng],
        zoom,
      }),
    );
  } catch {
    // Optional browser storage.
  }
}

const FILTERS: Array<{ value: FilterMode; label: string }> = [
  { value: "all", label: "Alle" },
  { value: "own", label: "Meine QR-X" },
  { value: "saved", label: "Gespeicherte" },
  { value: "business", label: "Business" },
  { value: "normal", label: "Normal" },
  { value: "scan", label: "QR-Codes" },
  { value: "verified", label: "Verifiziert" },
];

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
  return LEGEND.find((item) => item.kind === kind)?.color ?? "#2563eb";
}

function getMarkerLabel(kind: MarkerKind) {
  return LEGEND.find((item) => item.kind === kind)?.label ?? "Marker";
}

function formatNumber(value: number | null | undefined) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return "0";
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(Math.max(0, parsed));
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

function getQrxTitle(entry: QrxEntry) {
  return entry.company_name?.trim() || entry.title?.trim() || "Unbenannter QR-X";
}

function getQrxDescription(entry: QrxEntry) {
  return entry.description?.trim() || entry.location_name?.trim() || "QR-X auf mioseg qr";
}

function isValidCoordinate(lat: unknown, lng: unknown): lat is number {
  return typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng);
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

function buildPopup(point: MapPoint) {
  const href = point.href
    ? `<a href="${escapeAttr(point.href)}" style="display:flex;align-items:center;justify-content:center;min-height:40px;border-radius:13px;background:linear-gradient(180deg,#0d1726 0%,#17304d 100%);color:#ffffff;text-decoration:none;font-weight:900;font-size:13px;">Öffnen →</a>`
    : "";

  return `
    <div style="width:240px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0e1726;">
      <div style="display:inline-flex;align-items:center;gap:8px;border-radius:999px;background:#eef4fb;color:#28496f;font-size:11px;font-weight:900;padding:7px 10px;margin-bottom:10px;">
        <span style="width:10px;height:10px;border-radius:999px;background:${escapeAttr(getMarkerColor(point.kind))};display:inline-block;"></span>
        ${escapeHtml(getMarkerLabel(point.kind))}
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

function createMarkerHtml(point: MapPoint) {
  const color = getMarkerColor(point.kind);

  return `
    <div class="mioseg-dashboard-marker" title="${escapeAttr(point.title)}" style="--marker-color:${escapeAttr(color)};">
      <span class="mioseg-dashboard-marker-shadow"></span>
      <span class="mioseg-dashboard-marker-pin">
        <span></span>
      </span>
    </div>
  `;
}

function createClusterHtml(cluster: MapCluster) {
  const count = cluster.points.length;
  const ownCount = cluster.points.filter(
    (point) =>
      point.kind === "own_business" || point.kind === "own_normal",
  ).length;
  const savedCount = cluster.points.filter(
    (point) =>
      point.kind === "saved_business" || point.kind === "saved_normal",
  ).length;

  const accent =
    ownCount > 0
      ? "#f2b705"
      : savedCount > 0
        ? "#059669"
        : "#2563eb";

  return `
    <div
      class="mioseg-dashboard-cluster"
      title="${count} Einträge"
      style="--cluster-accent:${escapeAttr(accent)};"
    >
      <span class="mioseg-dashboard-cluster-ring"></span>
      <strong>${count}</strong>
    </div>
  `;
}

export default function DashboardMapClient({ locale }: { locale: string }) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const filteredPointsRef = useRef<MapPoint[]>([]);
  const pendingFocusIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const savedQrxIdsRef = useRef<string[]>([]);
  const viewportTimerRef = useRef<number | null>(null);
  const viewportRequestRef = useRef(0);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [viewportLabel, setViewportLabel] = useState("Kartenausschnitt");
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    let cancelled = false;

    async function prepareViewportData() {
      setLoading(true);

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
        setAuthReady(true);
        return;
      }

      userIdRef.current = user.id;

      const { data: saveRows, error: savesError } = await supabase
        .from("qrx_saves")
        .select("qrx_id")
        .eq("user_id", user.id)
        .returns<SaveRow[]>();

      if (savesError) {
        console.warn("Dashboard map saves error:", savesError.message);
      }

      savedQrxIdsRef.current = Array.from(
        new Set((saveRows ?? []).map((row) => row.qrx_id).filter(Boolean)),
      ) as string[];

      if (!cancelled) {
        setLoading(false);
        setAuthReady(true);
      }
    }

    void prepareViewportData();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const loadPointsForViewport = useCallback(async (rawViewport: MapViewport) => {
    const userId = userIdRef.current;
    if (!userId) return;

    const requestId = ++viewportRequestRef.current;
    const viewport = expandViewport(rawViewport);

    setLoading(true);
    setViewportLabel(
      rawViewport.zoom >= 13
        ? "Nahbereich"
        : rawViewport.zoom >= 9
          ? "Region"
          : "Großer Kartenausschnitt",
    );

    const ownQuery = supabase
      .from("qr_x_entries")
      .select("id,title,company_name,description,type,owner_user_id,location_name,location_lat,location_lng,category,verified,follower_count,views_total,cover_image_url,deleted_at")
      .eq("owner_user_id", userId)
      .is("deleted_at", null)
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
            .select("id,title,company_name,description,type,owner_user_id,location_name,location_lat,location_lng,category,verified,follower_count,views_total,cover_image_url,deleted_at")
            .in("id", savedIds)
            .is("deleted_at", null)
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

    if (requestId != viewportRequestRef.current) return;

    if (ownQrxRes.error) console.warn("Dashboard viewport own QR-X error:", ownQrxRes.error.message);
    if (savedQrxRes.error) console.warn("Dashboard viewport saved QR-X error:", savedQrxRes.error.message);
    if (scansRes.error) console.warn("Dashboard viewport scans error:", scansRes.error.message);

    const ownPoints: MapPoint[] = (ownQrxRes.data ?? [])
      .filter((entry) => isValidCoordinate(entry.location_lat, entry.location_lng))
      .map((entry) => ({
        id: `own-${entry.id}`,
        rawId: entry.id,
        title: getQrxTitle(entry),
        description: getQrxDescription(entry),
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
      .filter((entry) => entry.owner_user_id !== userId)
      .filter((entry) => isValidCoordinate(entry.location_lat, entry.location_lng))
      .map((entry) => ({
        id: `saved-${entry.id}`,
        rawId: entry.id,
        title: getQrxTitle(entry),
        description: getQrxDescription(entry),
        href: `/qrx/${entry.id}`,
        editHref: null,
        latitude: entry.location_lat as number,
        longitude: entry.location_lng as number,
        kind: entry.type === "business" ? "saved_business" : "saved_normal",
        locationName: entry.location_name,
        category: entry.category,
        verified: Boolean(entry.verified),
        followerCount: Number(entry.follower_count ?? 0),
        viewCount: Number(entry.views_total ?? 0),
        coverUrl: entry.cover_image_url,
      }));

    const scanPoints: MapPoint[] = (scansRes.data ?? [])
      .filter((scan) => isValidCoordinate(scan.latitude, scan.longitude))
      .map((scan) => ({
        id: `scan-${scan.id}`,
        rawId: scan.id,
        title: scan.name?.trim() || "Normaler Scan",
        description: scan.data?.trim() || "Gespeicherter QR-Code",
        href:
          scan.data?.startsWith("http://") || scan.data?.startsWith("https://")
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
  }, [locale]);

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
    filteredPointsRef.current = filteredPoints;
  }, [filteredPoints]);

  const updateVisiblePoints = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const mapBounds = map.getBounds();
    setVisibleIds(
      filteredPointsRef.current
        .filter((point) =>
          mapBounds.contains(
            [point.latitude, point.longitude] as unknown as LeafletLatLng,
          ),
        )
        .map((point) => point.id),
    );
  }, []);

  const scheduleViewportLoad = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    updateVisiblePoints();
    storeMapState(map);
    setMapZoom(map.getZoom?.() ?? 6);

    if (viewportTimerRef.current) {
      window.clearTimeout(viewportTimerRef.current);
    }

    viewportTimerRef.current = window.setTimeout(() => {
      void loadPointsForViewport(viewportFromMap(map));
    }, VIEWPORT_DEBOUNCE_MS);
  }, [loadPointsForViewport, updateVisiblePoints]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    async function boot() {
      if (!mapElRef.current) return;
      const L = await ensureLeaflet();
      if (!L || cancelled || !mapElRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const storedMapState = readStoredMapState();
      const fallbackCenter: [number, number] =
        storedMapState?.center ?? [51.0, 9.0];

      const map = L.map(mapElRef.current, {
        scrollWheelZoom: true,
        zoomControl: true,
      }).setView(
        fallbackCenter,
        storedMapState?.zoom ?? 6,
      );

      mapRef.current = map;
      setMapZoom(map.getZoom?.() ?? 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = {};

      map.on("moveend", scheduleViewportLoad);
      map.on("zoomend", scheduleViewportLoad);

      await loadPointsForViewport(viewportFromMap(map));
      window.setTimeout(updateVisiblePoints, 120);
    }

    void boot();

    return () => {
      cancelled = true;
      if (viewportTimerRef.current) {
        window.clearTimeout(viewportTimerRef.current);
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [authReady, loadPointsForViewport, scheduleViewportLoad, updateVisiblePoints]);

  useEffect(() => {
    const map = mapRef.current;
    const L = getLeafletWindow().L;
    if (!map || !L) return;

    Object.values(markersRef.current).forEach((marker) => {
      try {
        map.removeLayer(marker);
      } catch (removeError) {
        console.warn("Dashboard marker could not be removed:", removeError);
      }
    });

    markersRef.current = {};

    clusteredPoints.forEach((cluster) => {
      if (cluster.points.length > 1) {
        const clusterIcon = L.divIcon({
          className: "",
          html: createClusterHtml(cluster),
          iconSize: [52, 52],
          iconAnchor: [26, 26],
        });

        const clusterMarker = L.marker(
          [cluster.latitude, cluster.longitude],
          { icon: clusterIcon },
        ).addTo(map);

        clusterMarker.on("click", () => {
          const nextZoom = Math.min(
            CLUSTER_MAX_ZOOM + 1,
            Math.max(mapZoom + 2, 8),
          );

          if (map.flyTo) {
            map.flyTo(
              [cluster.latitude, cluster.longitude],
              nextZoom,
              { animate: true, duration: 0.65 },
            );
          } else {
            map.setView(
              [cluster.latitude, cluster.longitude],
              nextZoom,
              { animate: true },
            );
          }
        });

        markersRef.current[cluster.id] = clusterMarker;
        return;
      }

      const point = cluster.points[0];
      const icon = L.divIcon({
        className: "",
        html: createMarkerHtml(point),
        iconSize: [42, 42],
        iconAnchor: [21, 39],
      });

      const marker: LeafletMarker = L.marker(
        [point.latitude, point.longitude],
        { icon },
      )
        .addTo(map)
        .bindPopup(buildPopup(point), {
          maxWidth: 280,
          className: "miosegDashboardPopup",
        });

      marker.on("click", () => setActiveId(point.id));
      marker.on("popupopen", () => setActiveId(point.id));
      markersRef.current[point.id] = marker;
    });

    updateVisiblePoints();

    const pendingFocusId = pendingFocusIdRef.current;
    if (pendingFocusId) {
      const pendingMarker = markersRef.current[pendingFocusId];

      if (pendingMarker) {
        pendingFocusIdRef.current = null;
        window.setTimeout(() => pendingMarker.openPopup(), 120);
      }
    }
  }, [clusteredPoints, mapZoom, updateVisiblePoints]);

  const visiblePoints = useMemo(() => {
    if (visibleIds.length === 0) return filteredPoints;
    const ids = new Set(visibleIds);
    return filteredPoints.filter((point) => ids.has(point.id));
  }, [filteredPoints, visibleIds]);

  const focusPoint = (point: MapPoint) => {
    const map = mapRef.current;
    if (!map) return;

    setActiveId(point.id);
    pendingFocusIdRef.current = point.id;

    const target: [number, number] = [
      point.latitude,
      point.longitude,
    ];
    const zoom = Math.max(
      CLUSTER_MAX_ZOOM + 1,
      map.getZoom ? map.getZoom() : CLUSTER_MAX_ZOOM + 1,
    );

    if (map.flyTo) {
      map.flyTo(target, zoom, { animate: true, duration: 0.75 });
    } else {
      map.setView(target, zoom, { animate: true });
    }

    const existingMarker = markersRef.current[point.id];
    if (existingMarker) {
      pendingFocusIdRef.current = null;
      window.setTimeout(() => existingMarker.openPopup(), 220);
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
          placeholder="QR-X, Ort oder Kategorie suchen …"
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
          {FILTERS.map((item) => {
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
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
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            color: "#94a3b8",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          <span>
            {clusteredPoints.length < filteredPoints.length
              ? `${clusteredPoints.length} Markergruppen für ${filteredPoints.length} Einträge`
              : `${filteredPoints.length} einzelne Marker`}
          </span>
          <span>
            Cluster lösen sich ab Zoom {CLUSTER_MAX_ZOOM + 1} vollständig auf.
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
          {loading ? (
            <div style={{
              position: "absolute", inset: 0, zIndex: 5, display: "grid", placeItems: "center",
              background: "rgba(15,23,42,0.72)", color: "#ffffff", fontWeight: 950
            }}>
              Karte wird geladen …
            </div>
          ) : null}

          {!loading && filteredPoints.length === 0 ? (
            <div style={{
              position: "absolute", inset: 0, zIndex: 5, display: "grid", placeItems: "center",
              padding: 24, textAlign: "center",
              background: "linear-gradient(135deg,#10213a 0%,#14253c 52%,#0a1424 100%)",
              color: "#cbd5e1", fontWeight: 850, lineHeight: 1.6
            }}>
              Im aktuellen Kartenausschnitt wurden keine passenden QR-X oder Scans gefunden.
            </div>
          ) : null}

          <div ref={mapElRef} style={{ width: "100%", height: 520, position: "relative", zIndex: 1 }} />
        </div>

        <aside className="mioseg-dashboard-visible-list">
          <div style={{
            padding: 16, borderBottom: "1px solid rgba(255,255,255,0.075)",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12
          }}>
            <div>
              <strong style={{ color: "#ffffff", fontSize: 18 }}>Sichtbare Einträge</strong>
              <div style={{ marginTop: 4, color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>
                {viewportLabel}
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
                Im aktuellen Ausschnitt ist kein passender Eintrag sichtbar.
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
                        {getMarkerLabel(point.kind)}
                      </span>
                    </div>

                    <strong style={{ display: "block", color: "#ffffff", fontSize: 15 }}>
                      {point.title}
                    </strong>

                    {point.locationName ? (
                      <div style={{ marginTop: 5, color: "#94a3b8", fontSize: 12 }}>📍 {point.locationName}</div>
                    ) : null}

                    <div style={{ marginTop: 8, display: "flex", gap: 9, flexWrap: "wrap", color: "#cbd5e1", fontSize: 11, fontWeight: 800 }}>
                      {point.verified ? <span>✓ Verifiziert</span> : null}
                      <span>👥 {formatNumber(point.followerCount)}</span>
                      <span>👁 {formatNumber(point.viewCount)}</span>
                    </div>

                    <div
                      onClick={(event) => event.stopPropagation()}
                      style={{
                        marginTop: 10, display: "grid",
                        gridTemplateColumns: point.editHref ? "1fr 1fr" : "1fr",
                        gap: 8
                      }}
                    >
                      {point.href ? (
                        <a href={point.href} className="mioseg-dashboard-list-button primary">Öffnen</a>
                      ) : null}
                      {point.editHref ? (
                        <a href={point.editHref} className="mioseg-dashboard-list-button">Bearbeiten</a>
                      ) : null}
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
          <strong style={{ color: "#ffffff", fontSize: "18px" }}>🗺️ Legende</strong>
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
            {legendOpen ? "Ausblenden" : "Einblenden"}
          </button>
        </div>

        {legendOpen ? (
          <div style={{ display: "grid", gap: "10px" }}>
            {LEGEND.map((item) => (
              <div
                key={item.kind}
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
                    background: item.color,
                    display: "inline-block",
                    boxShadow: "0 0 0 4px rgba(255,255,255,0.04)",
                  }}
                />
                <span>{item.label}</span>
                <span style={{ marginLeft: "auto", color: "#94a3b8" }}>{countByKind[item.kind]}</span>
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

.mioseg-dashboard-cluster {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #0f2138 0%, #142b49 100%);
  border: 3px solid #ffffff;
  color: #ffffff;
  box-shadow:
    0 15px 34px rgba(0,0,0,0.3),
    0 0 0 5px color-mix(in srgb, var(--cluster-accent) 24%, transparent);
  cursor: pointer;
}

.mioseg-dashboard-cluster strong {
  position: relative;
  z-index: 2;
  font-size: 15px;
  line-height: 1;
  font-weight: 950;
}

.mioseg-dashboard-cluster-ring {
  position: absolute;
  inset: 5px;
  border-radius: 999px;
  border: 2px solid var(--cluster-accent);
  opacity: 0.86;
}

.mioseg-dashboard-marker {
  position: relative;
  width: 42px;
  height: 42px;
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
}

.mioseg-dashboard-marker-pin {
  position: absolute;
  inset: 0;
  background: var(--marker-color);
  border: 3px solid #ffffff;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 16px 34px rgba(0,0,0,0.28);
}

.mioseg-dashboard-marker-pin span {
  position: absolute;
  inset: 9px;
  border-radius: 999px;
  background: rgba(15,23,42,0.18);
  border: 2px solid rgba(255,255,255,0.42);
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
