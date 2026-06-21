"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type MarkerKind =
  | "own_business"
  | "saved_business"
  | "own_normal"
  | "saved_normal"
  | "scan";

type MapPoint = {
  id: string;
  title: string;
  description: string;
  href: string | null;
  latitude: number;
  longitude: number;
  kind: MarkerKind;
  locationName: string | null;
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

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (html: string, options?: { maxWidth?: number; className?: string }) => LeafletMarker;
  getLatLng: () => LeafletLatLng;
  openPopup: () => LeafletMarker;
};

type LeafletMap = {
  setView: (center: [number, number] | LeafletLatLng, zoom: number, options?: { animate?: boolean }) => LeafletMap;
  fitBounds: (bounds: [number, number][], options?: { padding?: [number, number]; maxZoom?: number }) => LeafletMap;
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

export default function DashboardMapClient({ locale }: { locale: string }) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [legendOpen, setLegendOpen] = useState(true);

  useEffect(() => {
    async function loadMapPoints() {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) console.warn("Dashboard map user error:", userError.message);

      if (!user) {
        setPoints([]);
        setLoading(false);
        return;
      }

      const userId = user.id;

      const [ownQrxRes, savesRes, scansRes] = await Promise.all([
        supabase
          .from("qr_x_entries")
          .select("id,title,company_name,description,type,owner_user_id,location_name,location_lat,location_lng")
          .eq("owner_user_id", userId)
          .returns<QrxEntry[]>(),

        supabase
          .from("qrx_saves")
          .select("qrx_id")
          .eq("user_id", userId)
          .returns<SaveRow[]>(),

        supabase
          .from("user_scans")
          .select("id,name,data,latitude,longitude")
          .eq("user_id", userId)
          .returns<UserScan[]>(),
      ]);

      if (ownQrxRes.error) console.warn("Dashboard map own QR-X error:", ownQrxRes.error.message);
      if (savesRes.error) console.warn("Dashboard map saves error:", savesRes.error.message);
      if (scansRes.error) console.warn("Dashboard map scans error:", scansRes.error.message);

      const savedQrxIds = Array.from(new Set((savesRes.data ?? []).map((row) => row.qrx_id).filter(Boolean))) as string[];

      let savedQrx: QrxEntry[] = [];

      if (savedQrxIds.length > 0) {
        const { data, error } = await supabase
          .from("qr_x_entries")
          .select("id,title,company_name,description,type,owner_user_id,location_name,location_lat,location_lng")
          .in("id", savedQrxIds)
          .returns<QrxEntry[]>();

        if (error) console.warn("Dashboard map saved QR-X details error:", error.message);
        savedQrx = data ?? [];
      }

      const ownPoints: MapPoint[] = (ownQrxRes.data ?? [])
        .filter((entry) => isValidCoordinate(entry.location_lat, entry.location_lng))
        .map((entry) => ({
          id: `own-${entry.id}`,
          title: getQrxTitle(entry),
          description: getQrxDescription(entry),
          href: `/qrx/${entry.id}`,
          latitude: entry.location_lat as number,
          longitude: entry.location_lng as number,
          kind: entry.type === "business" ? "own_business" : "own_normal",
          locationName: entry.location_name,
        }));

      const savedPoints: MapPoint[] = savedQrx
        .filter((entry) => entry.owner_user_id !== userId)
        .filter((entry) => isValidCoordinate(entry.location_lat, entry.location_lng))
        .map((entry) => ({
          id: `saved-${entry.id}`,
          title: getQrxTitle(entry),
          description: getQrxDescription(entry),
          href: `/qrx/${entry.id}`,
          latitude: entry.location_lat as number,
          longitude: entry.location_lng as number,
          kind: entry.type === "business" ? "saved_business" : "saved_normal",
          locationName: entry.location_name,
        }));

      const scanPoints: MapPoint[] = (scansRes.data ?? [])
        .filter((scan) => isValidCoordinate(scan.latitude, scan.longitude))
        .map((scan) => ({
          id: `scan-${scan.id}`,
          title: scan.name?.trim() || "Normaler Scan",
          description: scan.data?.trim() || "Gespeicherter QR-Code",
          href: scan.data?.startsWith("http://") || scan.data?.startsWith("https://") ? scan.data : null,
          latitude: scan.latitude as number,
          longitude: scan.longitude as number,
          kind: "scan",
          locationName: scan.name?.trim() || null,
        }));

      setPoints([...ownPoints, ...savedPoints, ...scanPoints]);
      setLoading(false);
    }

    void loadMapPoints();
  }, [locale]);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    async function boot() {
      if (!mapElRef.current) return;
      const L = await ensureLeaflet();
      if (!L || cancelled || !mapElRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const fallbackCenter: [number, number] =
        points.length > 0 ? [points[0].latitude, points[0].longitude] : [51.0, 9.0];

      const map = L.map(mapElRef.current, { scrollWheelZoom: true, zoomControl: true }).setView(
        fallbackCenter,
        points.length > 0 ? 10 : 6
      );

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const bounds: [number, number][] = [];

      points.forEach((point) => {
        const icon = L.divIcon({
          className: "",
          html: createMarkerHtml(point),
          iconSize: [42, 42],
          iconAnchor: [21, 39],
        });

        L.marker([point.latitude, point.longitude], { icon })
          .addTo(map)
          .bindPopup(buildPopup(point), { maxWidth: 280, className: "miosegDashboardPopup" });

        bounds.push([point.latitude, point.longitude]);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [44, 44], maxZoom: 13 });
      }
    }

    void boot();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading, points]);

  const countByKind = points.reduce<Record<MarkerKind, number>>(
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
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          minHeight: "460px",
          background: "#edf3f9",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {loading ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              display: "grid",
              placeItems: "center",
              background: "rgba(15, 23, 42, 0.72)",
              color: "#ffffff",
              fontWeight: 950,
            }}
          >
            Karte wird geladen …
          </div>
        ) : null}

        {!loading && points.length === 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              display: "grid",
              placeItems: "center",
              padding: "24px",
              textAlign: "center",
              background: "linear-gradient(135deg, #10213a 0%, #14253c 52%, #0a1424 100%)",
              color: "#cbd5e1",
              fontWeight: 850,
              lineHeight: 1.6,
            }}
          >
            Noch keine QR-X oder Scans mit Standortdaten vorhanden.
          </div>
        ) : null}

        <div ref={mapElRef} style={{ width: "100%", height: "460px", position: "relative", zIndex: 1 }} />
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
