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
  viewCount: number;
  href: string;
  // Bereits durch Media Engine optimierte URL, bevorzugt Thumbnail/Card-Bild.
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
  closePopup?: () => LeafletMarker;
  getLatLng: () => LeafletLatLng;
  on: (eventName: string, handler: () => void) => LeafletMarker;
};

type LeafletBounds = {
  contains: (latLng: LeafletLatLng) => boolean;
};

type LeafletMap = {
  setView: (center: [number, number] | LeafletLatLng, zoom: number, options?: { animate?: boolean }) => LeafletMap;
  fitBounds: (bounds: [number, number][], options?: { padding?: [number, number]; maxZoom?: number }) => LeafletMap;
  flyTo?: (center: [number, number] | LeafletLatLng, zoom: number, options?: { animate?: boolean; duration?: number }) => LeafletMap;
  getZoom?: () => number;
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
      )}" alt="${escapeAttr(point.title)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>`
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
        <span style="display:inline-flex;align-items:center;border-radius:999px;background:#eef4ff;color:#1d4ed8;font-size:11px;font-weight:900;padding:7px 9px;">👁️ ${escapeHtml(String(point.viewCount))}</span>
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
      <div style="display:grid;grid-template-columns:1fr;gap:8px;">
        <a href="${escapeAttr(
          point.href
        )}" style="display:flex;align-items:center;justify-content:center;min-height:40px;border-radius:13px;background:linear-gradient(180deg,#0d1726 0%,#17304d 100%);color:#ffffff;text-decoration:none;font-weight:900;font-size:13px;box-shadow:0 10px 24px rgba(13,23,38,0.18);">QR-X öffnen →</a>
        <div style="text-align:center;color:#64748b;font-size:11px;font-weight:800;">Marker ausgewählt · Ergebnisse unten aktualisiert</div>
      </div>
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

function dispatchInactiveMapPoint(id: string) {
  window.dispatchEvent(
    new CustomEvent("mioseg-inactive-qrx", {
      detail: { activeId: id },
    })
  );
}

function setActiveMarkerElement(id: string | null) {
  if (typeof document === "undefined") return;

  document.querySelectorAll<HTMLElement>("[data-mioseg-marker]").forEach((element) => {
    element.classList.toggle("is-active", Boolean(id) && element.getAttribute("data-mioseg-marker") === id);
  });
}

function dispatchMapIsMoving(isMoving: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("mioseg-map-moving", { detail: { isMoving } }));
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
  const activeIdRef = useRef<string | null>(null);

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
        hasUserLocation ? 14 : 6
      );

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const bounds: [number, number][] = [];

      const activatePoint = (point: MapPoint, options?: { openPopup?: boolean; scrollCard?: boolean }) => {
        activeIdRef.current = point.id;
        const marker = markersRef.current[point.id];

        setActiveMarkerElement(point.id);
        dispatchActiveMapPoint(point.id);
        dispatchVisibleMapPoints(map, markersRef.current, point.id);

        if (options?.openPopup && marker) {
          marker.openPopup();
        }

        if (options?.scrollCard && typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("mioseg-scroll-qrx-card", {
              detail: { activeId: point.id },
            })
          );
        }
      };

      const deactivatePoint = (point: MapPoint) => {
        if (activeIdRef.current === point.id) return;
        dispatchInactiveMapPoint(point.id);
      };

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
            <div class="mioseg-premium-marker" data-mioseg-marker="${escapeAttr(point.id)}" title="${escapeAttr(point.title)}">
              <span class="mioseg-marker-ring"></span>
              <span class="mioseg-marker-core">
                <span class="mioseg-marker-icon">${escapeHtml(point.categoryIcon)}</span>
                <span class="mioseg-marker-spark"></span>
                ${
                  point.verified
                    ? '<span class="mioseg-marker-verified">✓</span>'
                    : ""
                }
              </span>
              ${
                point.followerCount >= 10 || point.viewCount >= 100
                  ? '<span class="mioseg-marker-popular">🔥</span>'
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
          activatePoint(point, { scrollCard: true });
        });

        marker.on("click", () => {
          activatePoint(point, { openPopup: false, scrollCard: true });
        });

        marker.on("mouseover", () => {
          activatePoint(point, { openPopup: false, scrollCard: false });
        });

        marker.on("mouseout", () => {
          deactivatePoint(point);
        });

        bounds.push([point.latitude, point.longitude]);
      });

      if (hasUserLocation && userLat != null && userLng != null) {
        map.setView([userLat, userLng], 14, { animate: true });
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [44, 44], maxZoom: 14 });
      }

      const updateVisiblePoints = () => {
        dispatchVisibleMapPoints(map, markersRef.current);
      };

      const handleMoveStart = () => dispatchMapIsMoving(true);
      const handleMoveEnd = () => {
        dispatchMapIsMoving(false);
        updateVisiblePoints();
      };

      map.on("movestart", handleMoveStart);
      map.on("zoomstart", handleMoveStart);
      map.on("moveend", handleMoveEnd);
      map.on("zoomend", handleMoveEnd);
      setTimeout(updateVisiblePoints, 250);

      window.focusMarker = (id: string) => {
        const marker = markersRef.current[id];
        if (!marker) return;

        setActiveMarkerElement(id);
        const targetZoom = Math.max(15, map.getZoom ? map.getZoom() : 15);

        if (map.flyTo) {
          map.flyTo(marker.getLatLng(), targetZoom, { animate: true, duration: 0.85 });
        } else {
          map.setView(marker.getLatLng(), targetZoom, { animate: true });
        }

        window.setTimeout(() => {
          marker.openPopup();
          setActiveMarkerElement(id);
          dispatchActiveMapPoint(id);
          dispatchVisibleMapPoints(map, markersRef.current, id);
          window.dispatchEvent(
            new CustomEvent("mioseg-scroll-qrx-card", {
              detail: { activeId: id },
            })
          );
        }, 260);
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
      activeIdRef.current = null;
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
        height: "clamp(460px, 64vw, 700px)",
        borderRadius: "30px",
        overflow: "hidden",
        background: "#edf3f9",
      }}
    >
      <div className="mioseg-map-live-badge" aria-hidden="true">
        <span></span>
        Live Explore
      </div>
      <div ref={mapElRef} style={{ position: "relative", zIndex: 0, width: "100%", height: "100%" }} />

      <style
        dangerouslySetInnerHTML={{
          __html: `
.mioseg-map-live-badge {
  position: absolute;
  left: 16px;
  top: 16px;
  z-index: 800;
  min-height: 36px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(218,228,240,0.92);
  box-shadow: 0 14px 32px rgba(14,23,38,0.12);
  color: #17304d;
  font-size: 12px;
  font-weight: 950;
  backdrop-filter: blur(14px);
  pointer-events: none;
}

.mioseg-map-live-badge span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34,197,94,0.42);
  animation: miosegLivePulse 1.8s ease-in-out infinite;
}

.mioseg-premium-marker {
  position: relative;
  width: 52px;
  height: 52px;
  transform: translateY(-4px);
  transition: transform 180ms ease, filter 180ms ease;
}

.mioseg-marker-ring {
  position: absolute;
  inset: 3px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(37,99,235,0.22), rgba(124,58,237,0.18));
  filter: blur(8px);
  opacity: 0.72;
  transition: opacity 180ms ease, transform 180ms ease;
}

.mioseg-marker-core {
  position: absolute;
  inset: 2px;
  border-radius: 20px;
  background: linear-gradient(180deg,#0d1726 0%,#17304d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  box-shadow: 0 16px 34px rgba(0,0,0,0.26);
  overflow: visible;
}

.mioseg-marker-icon {
  font-size: 22px;
  line-height: 1;
  position: relative;
  z-index: 2;
}

.mioseg-marker-spark {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #60a5fa;
  box-shadow: 0 0 18px rgba(96,165,250,0.9);
}

.mioseg-marker-verified {
  position: absolute;
  right: -5px;
  top: -6px;
  width: 19px;
  height: 19px;
  border-radius: 999px;
  background: #22c55e;
  border: 2px solid #ffffff;
  color: #ffffff;
  font-size: 11px;
  line-height: 15px;
  text-align: center;
  font-weight: 950;
  z-index: 3;
}

.mioseg-marker-popular {
  position: absolute;
  left: -7px;
  top: -8px;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #fff7ed;
  border: 2px solid #ffffff;
  font-size: 12px;
  box-shadow: 0 10px 22px rgba(154,79,0,0.18);
  z-index: 3;
}

.mioseg-premium-marker:hover {
  transform: translateY(-8px) scale(1.06);
  filter: drop-shadow(0 16px 28px rgba(13,23,38,0.28));
}

.mioseg-premium-marker:hover .mioseg-marker-ring,
.mioseg-premium-marker.is-active .mioseg-marker-ring {
  opacity: 1;
  transform: scale(1.28);
}

.mioseg-premium-marker.is-active {
  transform: translateY(-10px) scale(1.1);
  z-index: 9999;
}

.mioseg-premium-marker.is-active .mioseg-marker-core {
  background: linear-gradient(180deg,#0d6efd 0%,#7c3aed 100%);
  box-shadow: 0 20px 44px rgba(37,99,235,0.32);
}

.mioseg-premium-marker.is-active::after {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 28px;
  border: 2px solid rgba(37,99,235,0.36);
  animation: miosegMarkerPulse 1.65s ease-in-out infinite;
}

.miosegExplorePopup .leaflet-popup-content-wrapper {
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(13,23,38,0.22);
}

.miosegExplorePopup .leaflet-popup-content {
  margin: 14px;
}

@keyframes miosegMarkerPulse {
  0% { transform: scale(0.86); opacity: 0.78; }
  100% { transform: scale(1.22); opacity: 0; }
}

@keyframes miosegLivePulse {
  0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.42); }
  70% { box-shadow: 0 0 0 9px rgba(34,197,94,0); }
  100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
}
          `.trim(),
        }}
      />
    </div>
  );
}
