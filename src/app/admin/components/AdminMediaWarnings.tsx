"use client";

import { useMemo, useState, type CSSProperties } from "react";

export type MediaWarningSeverity = "info" | "warning" | "critical";
export type MediaWarningCategory =
  | "traffic"
  | "storage"
  | "cost"
  | "quality"
  | "jobs";

export type MediaHealthRecommendation = {
  id: string;
  severity: MediaWarningSeverity;
  category: MediaWarningCategory;
  title: string;
  description: string;
  qrxId?: string | null;
  mediaId?: string | null;
  estimatedSavingsBytes?: number;
  estimatedSavingsCostCents?: number;
};

export type MediaActiveWarning = MediaHealthRecommendation & {
  priority: number;
  status: "active";
  detectedAt: string;
};

type WarningFilter = "all" | MediaWarningSeverity;

type AdminMediaWarningsProps = {
  warnings?: MediaActiveWarning[];
  recommendations?: MediaHealthRecommendation[];
  updatedAt?: string | null;
};

type MediaOpenResult = {
  ok: boolean;
  openUrl?: string | null;
  error?: string;
};

const styles: Record<string, CSSProperties> = {
  panel: {
    borderRadius: 22,
    background: "#0b1324",
    border: "1px solid #243044",
    padding: 16,
    marginTop: 12,
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
  label: {
    color: "#93a5bd",
    fontSize: 11,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: { color: "#f8fafc", fontSize: 16, fontWeight: 950, marginTop: 7 },
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 10,
    marginTop: 12,
  },
  card: {
    borderRadius: 16,
    padding: 13,
    border: "1px solid #243044",
    background: "#111827",
  },
  savings: {
    marginTop: 8,
    color: "#bbf7d0",
    fontSize: 12,
    lineHeight: 1.45,
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

function formatCost(value?: number | null) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value ?? 0) / 100);
}

function filterLabel(filter: WarningFilter) {
  if (filter === "all") return "Alle";
  if (filter === "critical") return "Kritisch";
  if (filter === "warning") return "Warnung";
  return "Info";
}

export default function AdminMediaWarnings({
  warnings = [],
  recommendations = [],
  updatedAt,
}: AdminMediaWarningsProps) {
  const [warningFilter, setWarningFilter] = useState<WarningFilter>("all");

  const filteredWarnings = useMemo(
    () =>
      warnings.filter(
        (item) => warningFilter === "all" || item.severity === warningFilter,
      ),
    [warnings, warningFilter],
  );

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
      const payload = (await response.json()) as MediaOpenResult;
      if (!response.ok || !payload.openUrl) {
        throw new Error(
          payload.error || "Medium konnte nicht geöffnet werden.",
        );
      }
      window.open(payload.openUrl, "_blank", "noopener,noreferrer");
    } catch (openError: unknown) {
      window.alert(
        openError instanceof Error
          ? openError.message
          : "Medium konnte nicht geöffnet werden.",
      );
    }
  };

  const displayedWarnings: MediaActiveWarning[] = filteredWarnings.length
    ? filteredWarnings
    : [
        {
          id: "empty",
          severity: "info",
          category: "storage",
          title: "Keine aktiven Warnungen",
          description:
            "Aktuell wurden keine passenden Auffälligkeiten erkannt.",
          priority: 0,
          status: "active",
          detectedAt: updatedAt ?? "",
        },
      ];

  return (
    <>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Aktive Warnungen</h3>
            <div style={styles.hint}>
              Automatisch priorisierte Auffälligkeiten aus Traffic, Kosten,
              Qualität und Media-Jobs.
            </div>
          </div>

          <div style={styles.row}>
            {(["all", "critical", "warning", "info"] as WarningFilter[]).map(
              (filter) => {
                const count =
                  filter === "all"
                    ? warnings.length
                    : warnings.filter((item) => item.severity === filter)
                        .length;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setWarningFilter(filter)}
                    style={
                      warningFilter === filter
                        ? styles.warningButton
                        : styles.button
                    }
                  >
                    {filterLabel(filter)} ({count})
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div style={styles.grid}>
          {displayedWarnings.slice(0, 12).map((item) => {
            const critical = item.severity === "critical";
            const warning = item.severity === "warning";
            return (
              <div
                key={item.id}
                style={{
                  ...styles.card,
                  borderColor: critical
                    ? "#991b1b"
                    : warning
                      ? "#854d0e"
                      : "#243044",
                  background: critical
                    ? "#3f1111"
                    : warning
                      ? "#2c1806"
                      : "#111827",
                }}
              >
                <div style={styles.label}>
                  {item.severity.toUpperCase()} · {item.category}
                </div>
                <div style={styles.value}>{item.title}</div>
                <div style={styles.hint}>{item.description}</div>

                {item.estimatedSavingsBytes ||
                item.estimatedSavingsCostCents ? (
                  <div style={styles.savings}>
                    Mögliches Potenzial:{" "}
                    {formatBytes(item.estimatedSavingsBytes)}
                    {item.estimatedSavingsCostCents
                      ? ` · ${formatCost(item.estimatedSavingsCostCents)}`
                      : ""}
                  </div>
                ) : null}

                <div style={{ ...styles.row, marginTop: 10 }}>
                  {item.qrxId ? (
                    <button
                      type="button"
                      onClick={() => openQrx(item.qrxId)}
                      style={styles.button}
                    >
                      QR-X öffnen
                    </button>
                  ) : null}
                  {item.mediaId ? (
                    <button
                      type="button"
                      onClick={() => void openMedia(item.mediaId)}
                      style={styles.button}
                    >
                      Medium öffnen
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.panel}>
        <h3 style={styles.title}>Empfehlungen</h3>
        <div style={styles.grid}>
          {recommendations.slice(0, 8).map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.label}>{item.category}</div>
              <div style={styles.value}>{item.title}</div>
              <div style={styles.hint}>{item.description}</div>

              {item.estimatedSavingsBytes || item.estimatedSavingsCostCents ? (
                <div style={styles.savings}>
                  Mögliches Potenzial: {formatBytes(item.estimatedSavingsBytes)}
                  {item.estimatedSavingsCostCents
                    ? ` · ${formatCost(item.estimatedSavingsCostCents)}`
                    : ""}
                </div>
              ) : null}

              <div style={{ ...styles.row, marginTop: 10 }}>
                {item.qrxId ? (
                  <button
                    type="button"
                    onClick={() => openQrx(item.qrxId)}
                    style={styles.button}
                  >
                    QR-X öffnen
                  </button>
                ) : null}
                {item.mediaId ? (
                  <button
                    type="button"
                    onClick={() => void openMedia(item.mediaId)}
                    style={styles.button}
                  >
                    Medium öffnen
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {recommendations.length === 0 ? (
            <div style={styles.hint}>
              Aktuell liegen keine Empfehlungen vor.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
