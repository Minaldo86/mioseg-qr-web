"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import AdminMediaWarnings, {
  type MediaActiveWarning,
  type MediaHealthRecommendation,
} from "./AdminMediaWarnings";

type MediaTrafficSummary = {
  eventCount?: number | null;
  totalBytes?: number | null;
  todayBytes?: number | null;
  weekBytes?: number | null;
  monthBytes?: number | null;
  mediaCount?: number | null;
  qrxCount?: number | null;
  estimatedCostCents?: number | null;
  estimatedMonthCostCents?: number | null;
  estimatedStorageCostCents?: number | null;
  estimatedTotalCostCents?: number | null;
  totalStorageBytes?: number | null;
  averageBytesPerEvent?: number | null;
  healthScore?: number | null;
  healthStatus?: string | null;
};

type MediaTrafficQrxItem = {
  qrxId: string | null;
  title: string | null;
  companyName: string | null;
  eventCount: number;
  totalBytes: number;
  monthBytes: number;
  estimatedTotalCostCents?: number;
};

type MediaTrafficMediaItem = {
  mediaId: string | null;
  qrxId: string | null;
  filename: string | null;
  variant: string | null;
  eventCount: number;
  totalBytes: number;
  monthBytes: number;
  estimatedTotalCostCents?: number;
};

type MediaTrafficStats = {
  ok: boolean;
  summary: MediaTrafficSummary;
  topQrx: MediaTrafficQrxItem[];
  topMedia: MediaTrafficMediaItem[];
  recommendations?: MediaHealthRecommendation[];
  activeWarnings?: MediaActiveWarning[];
  updatedAt: string;
};

type MediaOpenResult = {
  ok: boolean;
  openUrl?: string | null;
};

const styles: Record<string, CSSProperties> = {
  panel: {
    borderRadius: 22,
    background: "#0b1324",
    border: "1px solid #243044",
    padding: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  title: { margin: 0, color: "#e2e8f0", fontSize: 18, fontWeight: 900 },
  hint: { color: "#9fb1c8", fontSize: 12, lineHeight: 1.5, marginTop: 6 },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
  },
  metricCard: {
    borderRadius: 18,
    background: "linear-gradient(180deg, #111c31 0%, #0d1728 100%)",
    border: "1px solid #2a3952",
    padding: 15,
  },
  label: {
    color: "#93a5bd",
    fontSize: 11,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: { color: "#f8fafc", fontSize: 23, fontWeight: 950, marginTop: 7 },
  button: {
    border: "1px solid #2d3f59",
    borderRadius: 10,
    background: "#172133",
    color: "#f8fafc",
    padding: "9px 11px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12,
  },
  warningButton: {
    border: "1px solid #854d0e",
    borderRadius: 10,
    background: "#2c1806",
    color: "#fde68a",
    padding: "9px 11px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12,
  },
  row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 12,
    marginTop: 12,
  },
  list: { display: "grid", gap: 8, marginTop: 10 },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 13,
    border: "1px solid #243044",
    background: "#111827",
    padding: "10px 12px",
    color: "#cbd5e1",
    fontSize: 12,
  },
  error: {
    borderRadius: 14,
    border: "1px solid #991b1b",
    background: "#3f1111",
    color: "#fecaca",
    padding: 12,
    marginBottom: 12,
  },
};

function formatBytes(value?: number | null) {
  const bytes = Number(value ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  const digits = index === 0 ? 0 : size >= 100 ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(digits).replace(".", ",")} ${units[index]}`;
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("de-DE").format(Number(value ?? 0));
}

function formatCost(value?: number | null) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value ?? 0) / 100);
}

function healthLabel(status?: string | null) {
  if (status === "critical") return "Kritisch";
  if (status === "watch") return "Beobachten";
  if (status === "healthy") return "Gesund";
  return "Noch keine Daten";
}

export default function AdminMediaTraffic() {
  const [data, setData] = useState<MediaTrafficStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTraffic = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/media-traffic", {
        cache: "no-store",
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof payload === "object" && payload && "error" in payload
            ? String((payload as { error?: unknown }).error ?? "")
            : "";
        throw new Error(
          message || "Traffic-Statistiken konnten nicht geladen werden.",
        );
      }
      setData(payload as MediaTrafficStats);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Traffic-Statistiken konnten nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTraffic();
  }, [loadTraffic]);

  const summary = data?.summary;
  const openQrx = (qrxId?: string | null) => {
    if (!qrxId) return;
    window.open(`/qrx/${qrxId}`, "_blank", "noopener,noreferrer");
  };

  const openMedia = async (mediaId?: string | null) => {
    if (!mediaId) return;
    try {
      const response = await fetch(
        `/api/admin/media-open?mediaId=${encodeURIComponent(mediaId)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as MediaOpenResult & {
        error?: string;
      };
      if (!response.ok || !payload.openUrl)
        throw new Error(
          payload.error || "Medium konnte nicht geöffnet werden.",
        );
      window.open(payload.openUrl, "_blank", "noopener,noreferrer");
    } catch (openError: unknown) {
      window.alert(
        openError instanceof Error
          ? openError.message
          : "Medium konnte nicht geöffnet werden.",
      );
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Traffic · Kosten · Warnungen</h3>
          <div style={styles.hint}>
            Eigenständiges Modul: lädt, aktualisiert und bewertet seine Daten
            ohne Abhängigkeit von der Admin-Hauptseite.
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadTraffic()}
          disabled={loading}
          style={loading ? styles.button : styles.warningButton}
        >
          {loading ? "Lade…" : "Traffic aktualisieren"}
        </button>
      </div>

      {error ? <div style={styles.error}>⚠️ {error}</div> : null}

      <div style={styles.metricGrid}>
        {[
          [
            "Traffic heute",
            formatBytes(summary?.todayBytes),
            "Seit Tagesbeginn",
          ],
          [
            "Letzte 7 Tage",
            formatBytes(summary?.weekBytes),
            "Rollierender Wochenwert",
          ],
          [
            "Diesen Monat",
            formatBytes(summary?.monthBytes),
            "Aktueller Monatswert",
          ],
          [
            "Traffic gesamt",
            formatBytes(summary?.totalBytes),
            `${formatNumber(summary?.eventCount)} Events`,
          ],
          [
            "Gesamtkosten",
            formatCost(summary?.estimatedTotalCostCents),
            "Traffic plus Storage",
          ],
          [
            "QR-X / Medien",
            `${formatNumber(summary?.qrxCount)} / ${formatNumber(summary?.mediaCount)}`,
            "Erfasste Objekte",
          ],
          [
            "Health Score",
            `${formatNumber(summary?.healthScore)} / 100`,
            healthLabel(summary?.healthStatus),
          ],
          [
            "Ø je Event",
            formatBytes(summary?.averageBytesPerEvent),
            "Durchschnittliche Auslieferung",
          ],
        ].map(([label, value, hint]) => (
          <div key={label} style={styles.metricCard}>
            <div style={styles.label}>{label}</div>
            <div style={styles.value}>{value}</div>
            <div style={styles.hint}>{hint}</div>
          </div>
        ))}
      </div>

      <div style={styles.sectionGrid}>
        <div style={styles.panel}>
          <h3 style={styles.title}>Top QR-X</h3>
          <div style={styles.list}>
            {(data?.topQrx ?? []).slice(0, 8).map((item) => (
              <button
                key={item.qrxId ?? item.title ?? "qrx"}
                type="button"
                onClick={() => openQrx(item.qrxId)}
                style={{
                  ...styles.listItem,
                  cursor: item.qrxId ? "pointer" : "default",
                  textAlign: "left",
                }}
              >
                <span>
                  {item.companyName || item.title || item.qrxId || "Unbekannt"}
                </span>
                <span>{formatBytes(item.totalBytes)}</span>
              </button>
            ))}
            {(data?.topQrx ?? []).length === 0 ? (
              <div style={styles.hint}>Noch keine QR-X-Trafficdaten.</div>
            ) : null}
          </div>
        </div>

        <div style={styles.panel}>
          <h3 style={styles.title}>Top Medien</h3>
          <div style={styles.list}>
            {(data?.topMedia ?? []).slice(0, 8).map((item) => (
              <button
                key={item.mediaId ?? item.filename ?? "media"}
                type="button"
                onClick={() => void openMedia(item.mediaId)}
                style={{
                  ...styles.listItem,
                  cursor: item.mediaId ? "pointer" : "default",
                  textAlign: "left",
                }}
              >
                <span>{item.filename || item.mediaId || "Unbekannt"}</span>
                <span>{formatBytes(item.totalBytes)}</span>
              </button>
            ))}
            {(data?.topMedia ?? []).length === 0 ? (
              <div style={styles.hint}>Noch keine Medien-Trafficdaten.</div>
            ) : null}
          </div>
        </div>
      </div>

      <AdminMediaWarnings
        warnings={data?.activeWarnings ?? []}
        recommendations={data?.recommendations ?? []}
        updatedAt={data?.updatedAt}
      />
    </div>
  );
}
