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

const LEGEND: Array<{ kind: MarkerKind; label: string; color: string }> = [
  { kind: "own_business", label: "Gold = Mein Business QR-X", color: "#f2b705" },
  { kind: "saved_business", label: "Dunkelgrün = Gespeichertes Business QR-X", color: "#059669" },
  { kind: "own_normal", label: "Hellgrün = Mein normaler QR-X", color: "#22c55e" },
  { kind: "saved_normal", label: "Lila = Gespeicherter QR-X", color: "#8b5cf6" },
  { kind: "scan", label: "Blau = Normaler Scan", color: "#2563eb" },
];

type FilterMode = "all" | "own" | "saved" | "business" | "normal" | "scan" | "verified";

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

function requestUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Standortbestimmung wird von diesem Browser nicht unterstützt."));
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
          reject(new Error("Der Standortzugriff wurde nicht erlaubt."));
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error("Dein Standort konnte nicht bestimmt werden."));
          return;
        }

        if (error.code === error.TIMEOUT) {
          reject(new Error("Die Standortabfrage hat zu lange gedauert."));
          return;
        }

        reject(new Error("Dein Standort konnte nicht bestimmt werden."));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  });
}

function createUserLocationHtml() {
  return `
    <div class="mioseg-dashboard-user-location" title="Du bist hier">
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

export default function DashboardMapClient({ locale }: { locale: string }) {
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
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
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
          "id,title,company_name,description,type,owner_user_id,location_name,location_lat,location_lng,category,verified,follower_count,views_total,cover_image_url,deleted_at",
        )
        .eq("owner_user_id", userId)
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
                "id,title,company_name,description,type,owner_user_id,location_name,location_lat,location_lng,category,verified,follower_count,views_total,cover_image_url,deleted_at",
              )
              .in("id", savedIds)
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
        .filter((entry) =>
          isValidCoordinate(entry.location_lat, entry.location_lng),
        )
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
        .filter((entry) =>
          isValidCoordinate(entry.location_lat, entry.location_lng),
        )
        .map((entry) => ({
          id: `saved-${entry.id}`,
          rawId: entry.id,
          title: getQrxTitle(entry),
          description: getQrxDescription(entry),
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
          title: scan.name?.trim() || "Normaler Scan",
          description: scan.data?.trim() || "Gespeicherter QR-Code",
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
    [locale],
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

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const loadCurrentViewport = () => {
        const bounds = map.getBounds();
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
      const removableMarker = marker as LeafletMarker & {
        remove?: () => void;
      };
      removableMarker.remove?.();
    });

    markersRef.current = {};

    filteredPoints.forEach((point) => {
      const icon = L.divIcon({
        className: "",
        html: createMarkerHtml(point),
        iconSize: [42, 42],
        iconAnchor: [21, 39],
      });

      const marker = L.marker([point.latitude, point.longitude], { icon })
        .addTo(map)
        .bindPopup(buildPopup(point), {
          maxWidth: 280,
          className: "miosegDashboardPopup",
        });

      marker.on("click", () => setActiveId(point.id));
      marker.on("popupopen", () => setActiveId(point.id));
      markersRef.current[point.id] = marker;
    });

    const mapBounds = map.getBounds();
    const ids = Object.entries(markersRef.current)
      .filter(([, marker]) => mapBounds.contains(marker.getLatLng()))
      .map(([id]) => id);

    setVisibleIds(ids);
  }, [filteredPoints]);


  const visiblePoints = useMemo(() => {
    if (visibleIds.length === 0) return filteredPoints;
    const ids = new Set(visibleIds);
    return filteredPoints.filter((point) => ids.has(point.id));
  }, [filteredPoints, visibleIds]);

  const focusPoint = (point: MapPoint) => {
    const map = mapRef.current;
    const marker = markersRef.current[point.id];
    if (!map || !marker) return;

    setActiveId(point.id);
    const zoom = Math.max(15, map.getZoom ? map.getZoom() : 15);
    if (map.flyTo) {
      map.flyTo(marker.getLatLng(), zoom, { animate: true, duration: 0.75 });
    } else {
      map.setView(marker.getLatLng(), zoom, { animate: true });
    }
    window.setTimeout(() => marker.openPopup(), 220);
  };

  const handleLocateUser = async () => {
    const map = mapRef.current;
    const L = leafletRef.current;

    if (!map || !L || locatingUser) return;

    setLocatingUser(true);
    setLocationError(null);

    try {
      const location = await requestUserLocation();

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
        html: createUserLocationHtml(),
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker(target, { icon })
        .addTo(map)
        .bindPopup(
          '<div style="font-family:Inter,system-ui,sans-serif;font-weight:900;color:#0f172a;">Du bist hier</div>',
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
          : "Dein Standort konnte nicht bestimmt werden.",
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
            title="Meine Position anzeigen"
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
            {locatingUser ? "Standort wird gesucht …" : "◎ Meine Position"}
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
              Karte wird geladen …
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
                Im aktuellen Kartenausschnitt wurden keine passenden QR-X oder Scans gefunden.
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
              <strong style={{ color: "#ffffff", fontSize: 18 }}>Sichtbare Einträge</strong>
              <div style={{ marginTop: 4, color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>
                Aktueller Kartenausschnitt
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
