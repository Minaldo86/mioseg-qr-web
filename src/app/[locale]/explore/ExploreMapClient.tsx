"use client";

import { useEffect, useRef } from "react";

type MapPoint = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  verified: boolean;
  followerCount: number;
  href: string;
  coverUrl: string | null;
  locationName: string | null;
  latitude: number;
  longitude: number;
};

type LeafletLatLng = unknown;

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (html: string, options?: { maxWidth?: number; className?: string }) => LeafletMarker;
  openPopup: () => LeafletMarker;
  getLatLng: () => LeafletLatLng;
  on: (eventName: string, handler: () => void) => LeafletMarker;
};

type LeafletBounds = {
  contains: (latLng: LeafletLatLng) => boolean;
};

type LeafletMap = {
  setView: (center: [number, number] | LeafletLatLng, zoom: number, options?: { animate?: boolean }) => LeafletMap;
  fitBounds: (bounds: [number, number][], options?: { padding?: [number, number]; maxZoom?: number }) => LeafletMap;
  getBounds: () => LeafletBounds;
  on: (eventName: string, handler: () => void) => LeafletMap;
  off: (eventName: string, handler: () => void) => LeafletMap;
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

declare global {
  interface Window {
    L?: LeafletApi;
    focusMarker?: (id: string) => void;
  }
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

async function ensureLeaflet(): Promise<LeafletApi | null> {
  if (typeof window === "undefined") return null;
  if (window.L) return window.L;

  if (!document.querySelector('link[data-mioseg-leaflet="true"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.setAttribute("data-mioseg-leaflet", "true");
    document.head.appendChild(link);
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-mioseg-leaflet="true"]');
    if (existingScript) {
      if (window.L) resolve();
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Leaflet load failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.setAttribute("data-mioseg-leaflet", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Leaflet load failed"));
    document.body.appendChild(script);
  });

  return window.L ?? null;
}

function buildPopup(point: MapPoint) {
  const imageHtml = point.coverUrl
    ? `<div style="height:118px;border-radius:18px;overflow:hidden;background:#eef4fb;margin-bottom:12px;"><img src="${escapeAttr(
        point.coverUrl
      )}" alt="${escapeAttr(point.title)}" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>`
    : `<div style="height:92px;border-radius:18px;background:linear-gradient(180deg,#edf3f9 0%,#dfe8f2 100%);display:flex;align-items:center;justify-content:center;font-size:34px;margin-bottom:12px;">${escapeHtml(
        point.categoryIcon
      )}</div>`;

  return `
    <div style="width:250px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0e1726;">
      ${imageHtml}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
        <span style="display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:#eef4fb;color:#28496f;font-size:11px;font-weight:800;padding:7px 9px;">
          ${escapeHtml(point.categoryIcon)} ${escapeHtml(point.category)}
        </span>
        ${
          point.verified
            ? '<span style="display:inline-flex;align-items:center;border-radius:999px;background:#0d1726;color:#ffffff;font-size:11px;font-weight:900;padding:7px 9px;">✓ Verifiziert</span>'
            : ""
        }
        <span style="display:inline-flex;align-items:center;border-radius:999px;background:#fff7ed;color:#9a4f00;font-size:11px;font-weight:900;padding:7px 9px;">👥 ${escapeHtml(String(point.followerCount))}</span>
      </div>
      <div style="font-weight:900;font-size:17px;line-height:1.25;margin-bottom:7px;">${escapeHtml(point.title)}</div>
      <div style="color:#5d6b7d;font-size:13px;line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(
        point.description
      )}</div>
      ${
        point.locationName
          ? `<div style="color:#5d6b7d;font-size:12px;font-weight:700;margin-bottom:12px;">📍 ${escapeHtml(point.locationName)}</div>`
          : ""
      }
      <a href="${escapeAttr(
        point.href
      )}" style="display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:13px;background:linear-gradient(180deg,#0d1726 0%,#17304d 100%);color:#ffffff;text-decoration:none;font-weight:900;font-size:13px;box-shadow:0 10px 24px rgba(13,23,38,0.18);">QR-X öffnen →</a>
    </div>
  `;
}


function dispatchVisibleMapPoints(map: LeafletMap, markers: Record<string, LeafletMarker>, activeId?: string) {
  const bounds = map.getBounds();
  const visibleIds = Object.entries(markers)
    .filter(([, marker]) => bounds.contains(marker.getLatLng()))
    .map(([id]) => id);

  window.dispatchEvent(
    new CustomEvent("mioseg-visible-qrx", {
      detail: { visibleIds, activeId: activeId ?? null },
    })
  );
}

function dispatchActiveMapPoint(id: string) {
  window.dispatchEvent(
    new CustomEvent("mioseg-active-qrx", {
      detail: { activeId: id },
    })
  );
}

export default function ExploreMapClient({
  points,
  hasUserLocation,
  userLat,
  userLng,
}: {
  points: MapPoint[];
  hasUserLocation: boolean;
  userLat: number | null;
  userLng: number | null;
}) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!mapElRef.current) return;
      const L = await ensureLeaflet();
      if (!L || cancelled || !mapElRef.current) return;

      const fallbackCenter: [number, number] =
        points.length > 0 ? [points[0].latitude, points[0].longitude] : [51.0, 9.0];

      const center: [number, number] =
        hasUserLocation && userLat != null && userLng != null ? [userLat, userLng] : fallbackCenter;

      const map = L.map(mapElRef.current, { scrollWheelZoom: true, zoomControl: true }).setView(
        center,
        hasUserLocation ? 12 : 6
      );

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const bounds: [number, number][] = [];

      if (hasUserLocation && userLat != null && userLng != null) {
        const userIcon = L.divIcon({
          className: "",
          html: `
            <div style="
              width:26px;
              height:26px;
              border-radius:999px;
              background:#2563eb;
              border:4px solid #ffffff;
              box-shadow:0 0 0 8px rgba(37,99,235,0.16),0 12px 28px rgba(13,23,38,0.22);
            "></div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<div style="font-weight:900;color:#0e1726;">Dein Standort</div>');

        bounds.push([userLat, userLng]);
      }

      points.forEach((point) => {
        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              position:relative;
              width:48px;
              height:48px;
              border-radius:18px;
              background:linear-gradient(180deg,#0d1726 0%,#17304d 100%);
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:21px;
              border:2px solid #ffffff;
              box-shadow:0 16px 34px rgba(0,0,0,0.26);
              transform:translateY(-2px);
            ">
              ${escapeHtml(point.categoryIcon)}
              ${
                point.verified
                  ? '<span style="position:absolute;right:-4px;top:-5px;width:18px;height:18px;border-radius:999px;background:#22c55e;border:2px solid #ffffff;color:#ffffff;font-size:11px;line-height:14px;text-align:center;font-weight:900;">✓</span>'
                  : ""
              }
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        const marker = L.marker([point.latitude, point.longitude], { icon }).addTo(map);

        markersRef.current[point.id] = marker;
        marker.bindPopup(buildPopup(point), { maxWidth: 290, className: "miosegExplorePopup" });
        marker.on("popupopen", () => {
          dispatchActiveMapPoint(point.id);
          dispatchVisibleMapPoints(map, markersRef.current, point.id);
        });

        bounds.push([point.latitude, point.longitude]);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [44, 44], maxZoom: 14 });
      }

      const updateVisiblePoints = () => {
        dispatchVisibleMapPoints(map, markersRef.current);
      };

      map.on("moveend", updateVisiblePoints);
      map.on("zoomend", updateVisiblePoints);
      setTimeout(updateVisiblePoints, 250);

      window.focusMarker = (id: string) => {
        const marker = markersRef.current[id];
        if (!marker) return;

        marker.openPopup();
        dispatchActiveMapPoint(id);
        dispatchVisibleMapPoints(map, markersRef.current, id);
        map.setView(marker.getLatLng(), 15, { animate: true });
      };
    };

    boot();

    return () => {
      cancelled = true;
      window.focusMarker = undefined;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
  }, [points, hasUserLocation, userLat, userLng]);

  return (
    <div
      className="mioseg-explore-map-shell"
      style={{
        position: "relative",
        zIndex: 0,
        isolation: "isolate",
        width: "100%",
        height: "clamp(420px, 58vw, 620px)",
        borderRadius: "30px",
        overflow: "hidden",
        background: "#edf3f9",
      }}
    >
      <div ref={mapElRef} style={{ position: "relative", zIndex: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
