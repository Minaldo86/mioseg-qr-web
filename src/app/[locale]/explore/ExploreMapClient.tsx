"use client";

import { useEffect, useRef } from "react";

type MapPoint = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  verified: boolean;
  href: string;
  coverUrl: string | null;
  locationName: string | null;
  latitude: number;
  longitude: number;
};

type LeafletLatLng = unknown;

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (html: string) => LeafletMarker;
  openPopup: () => LeafletMarker;
  getLatLng: () => LeafletLatLng;
};

type LeafletMap = {
  setView: (center: [number, number] | LeafletLatLng, zoom: number, options?: { animate?: boolean }) => LeafletMap;
  fitBounds: (bounds: [number, number][], options?: { padding?: [number, number] }) => LeafletMap;
  remove: () => void;
};

type LeafletApi = {
  map: (element: HTMLElement) => LeafletMap;
  tileLayer: (url: string) => { addTo: (map: LeafletMap) => unknown };
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

async function ensureLeaflet(): Promise<LeafletApi | null> {
  if (typeof window === "undefined") return null;
  if (window.L) return window.L;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Leaflet load failed"));
    document.body.appendChild(script);
  });

  return window.L ?? null;
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
      if (!L || cancelled) return;

      const fallbackCenter: [number, number] =
        points.length > 0 ? [points[0].latitude, points[0].longitude] : [51.0, 9.0];

      const center: [number, number] =
        hasUserLocation && userLat != null && userLng != null ? [userLat, userLng] : fallbackCenter;

      const map = L.map(mapElRef.current).setView(center, hasUserLocation ? 11 : 6);

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      const bounds: [number, number][] = [];

      points.forEach((point) => {
        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              width:44px;
              height:44px;
              border-radius:16px;
              background:linear-gradient(180deg,#0d1726 0%,#17304d 100%);
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:20px;
              border:2px solid #ffffff;
              box-shadow:0 12px 30px rgba(0,0,0,0.25);
            ">
              ${escapeHtml(point.categoryIcon)}
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const marker = L.marker([point.latitude, point.longitude], { icon }).addTo(map);

        markersRef.current[point.id] = marker;

        marker.bindPopup(`
          <div style="font-weight:800;">${escapeHtml(point.title)}</div>
        `);

        bounds.push([point.latitude, point.longitude]);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      window.focusMarker = (id: string) => {
        const marker = markersRef.current[id];
        if (!marker) return;

        marker.openPopup();
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
      style={{
        width: "100%",
        height: "560px",
        borderRadius: "28px",
        overflow: "hidden",
      }}
    >
      <div ref={mapElRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
