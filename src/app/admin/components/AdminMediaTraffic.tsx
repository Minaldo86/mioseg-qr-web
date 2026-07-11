"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import AdminMediaWarnings from "./AdminMediaWarnings";
import type { MediaTrafficStats } from "../types";
import { formatBytes, formatCost, formatNumber } from "../utils/mediaFormat";
import { fetchMediaTrafficStats } from "../services/mediaTraffic.service";
import { openAdminMedia } from "../services/mediaOpen.service";

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
      const payload = await fetchMediaTrafficStats();
      setData(payload);
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
    try {
      await openAdminMedia(mediaId);
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
