"use client";

import type { CSSProperties } from "react";

type StyleMap = Record<string, unknown>;

type MediaTrafficSummary = {
  eventCount?: number | null;
  totalBytes?: number | null;
  todayBytes?: number | null;
  weekBytes?: number | null;
  monthBytes?: number | null;
  estimatedCostCents?: number | null;
  estimatedTodayCostCents?: number | null;
  estimatedWeekCostCents?: number | null;
  estimatedMonthCostCents?: number | null;
  estimatedStorageCostCents?: number | null;
  estimatedTotalCostCents?: number | null;
  totalStorageBytes?: number | null;
  largestQrxSharePercent?: number | null;
  largestMediaSharePercent?: number | null;
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
  todayBytes: number;
  monthBytes: number;
  weekBytes?: number;
  estimatedTrafficCostCents?: number;
  estimatedStorageCostCents?: number;
  estimatedTotalCostCents?: number;
  lastSeenAt: string | null;
};

type MediaTrafficMediaItem = {
  mediaId: string | null;
  qrxId: string | null;
  filename: string | null;
  variant: string | null;
  eventCount: number;
  totalBytes: number;
  todayBytes: number;
  monthBytes: number;
  weekBytes?: number;
  estimatedTrafficCostCents?: number;
  estimatedStorageCostCents?: number;
  estimatedTotalCostCents?: number;
  lastSeenAt: string | null;
};

type MediaHealthRecommendation = {
  id: string;
  severity: "info" | "warning" | "critical";
  category: "traffic" | "storage" | "cost" | "quality" | "jobs";
  title: string;
  description: string;
  qrxId?: string | null;
  mediaId?: string | null;
  estimatedSavingsBytes?: number;
  estimatedSavingsCostCents?: number;
};

type MediaActiveWarning = MediaHealthRecommendation & {
  priority: number;
  status: "active";
  detectedAt: string;
};

type MediaTrafficVariantItem = {
  variant: string;
  eventCount: number;
  totalBytes: number;
  todayBytes: number;
  weekBytes: number;
  monthBytes: number;
  sharePercent: number;
};

type MediaTrafficStats = {
  ok: boolean;
  summary: MediaTrafficSummary;
  topQrx: MediaTrafficQrxItem[];
  topMedia: MediaTrafficMediaItem[];
  topQrxWeek?: MediaTrafficQrxItem[];
  topMediaWeek?: MediaTrafficMediaItem[];
  topCostQrx?: MediaTrafficQrxItem[];
  topCostMedia?: MediaTrafficMediaItem[];
  topVariants?: MediaTrafficVariantItem[];
  recommendations?: MediaHealthRecommendation[];
  activeWarnings?: MediaActiveWarning[];
  updatedAt: string;
};

type AdminMediaTrafficProps = {
  styles: StyleMap;
  mediaTrafficStats: MediaTrafficStats | null;
  mediaTrafficLoading: boolean;
  onRefresh: () => void | Promise<void>;
  formatBytes: (value?: number | null) => string;
  formatNumber: (value?: number | null) => string;
  formatCost: (value?: number | null) => string;
};

function styleOf(styles: StyleMap, key: string): CSSProperties {
  return (styles[key] ?? {}) as CSSProperties;
}

function healthLabel(status?: string | null) {
  if (!status) return "Noch keine Bewertung";
  if (status === "critical") return "Kritisch";
  if (status === "watch") return "Beobachten";
  if (status === "healthy") return "Gesund";
  if (status === "empty") return "Noch keine Daten";
  return status;
}

export default function AdminMediaTraffic({
  styles,
  mediaTrafficStats,
  mediaTrafficLoading,
  onRefresh,
  formatBytes,
  formatNumber,
  formatCost,
}: AdminMediaTrafficProps) {
  const sx = (key: string) => styleOf(styles, key);
  const summary = mediaTrafficStats?.summary;
  const topQrx = mediaTrafficStats?.topQrx ?? [];
  const topMedia = mediaTrafficStats?.topMedia ?? [];
  const warnings = mediaTrafficStats?.activeWarnings ?? [];
  const recommendations = mediaTrafficStats?.recommendations ?? [];

  return (
    <div style={sx("storagePanel")}>
      <div style={sx("storageDetailHeader")}>
        <div>
          <h3 style={sx("storagePanelTitle")}>Traffic · Kosten · Warnungen</h3>
          <p style={{ ...sx("storageMetricHint"), marginTop: -4 }}>
            Phase 3C ist jetzt als eigenes Traffic-Modul vorbereitet. Die Detailtabellen werden Schritt für
            Schritt aus der großen Admin-Seite hierher verschoben.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={mediaTrafficLoading}
          style={mediaTrafficLoading ? sx("disabledSmallButton") : sx("storageWarningButton")}
        >
          {mediaTrafficLoading ? "Lade…" : "Traffic aktualisieren"}
        </button>
      </div>

      <div style={sx("storageMetricGrid")}>
        <div style={sx("storageMetricCard")}>
          <div style={sx("storageMetricIcon")}>🌐</div>
          <div style={sx("storageMetricLabel")}>Traffic gesamt</div>
          <div style={sx("storageMetricValue")}>{formatBytes(summary?.totalBytes ?? 0)}</div>
          <div style={sx("storageMetricHint")}>{formatNumber(summary?.eventCount ?? 0)} Events erfasst.</div>
        </div>

        <div style={sx("storageMetricCard")}>
          <div style={sx("storageMetricIcon")}>📅</div>
          <div style={sx("storageMetricLabel")}>Dieser Monat</div>
          <div style={sx("storageMetricValue")}>{formatBytes(summary?.monthBytes ?? 0)}</div>
          <div style={sx("storageMetricHint")}>Heute: {formatBytes(summary?.todayBytes ?? 0)}</div>
        </div>

        <div style={sx("storageMetricCard")}>
          <div style={sx("storageMetricIcon")}>💰</div>
          <div style={sx("storageMetricLabel")}>Geschätzte Kosten</div>
          <div style={sx("storageMetricValue")}>{formatCost(summary?.estimatedTotalCostCents ?? 0)}</div>
          <div style={sx("storageMetricHint")}>
            Traffic: {formatCost(summary?.estimatedMonthCostCents ?? summary?.estimatedCostCents ?? 0)} · Storage:{" "}
            {formatCost(summary?.estimatedStorageCostCents ?? 0)}
          </div>
        </div>

        <div style={sx("storageMetricCard")}>
          <div style={sx("storageMetricIcon")}>🩺</div>
          <div style={sx("storageMetricLabel")}>Health</div>
          <div style={sx("storageMetricValue")}>{summary?.healthScore ?? 0}/100</div>
          <div style={sx("storageMetricHint")}>{healthLabel(summary?.healthStatus)}</div>
        </div>
      </div>

      <div style={sx("storageDetailGrid")}>
        <div style={sx("storagePanel")}>
          <h3 style={sx("storagePanelTitle")}>Top QR-X nach Traffic</h3>
          <div style={sx("storageTodoList")}>
            {topQrx.slice(0, 5).map((item) => (
              <div key={item.qrxId ?? item.title ?? "qrx"} style={sx("storageTodoItem")}>
                <span>{item.companyName || item.title || item.qrxId || "Unbekannt"}</span>
                <span>{formatBytes(item.totalBytes)}</span>
              </div>
            ))}
            {topQrx.length === 0 ? <div style={sx("storageMetricHint")}>Noch keine QR-X-Trafficdaten.</div> : null}
          </div>
        </div>

        <div style={sx("storagePanel")}>
          <h3 style={sx("storagePanelTitle")}>Top Medien nach Traffic</h3>
          <div style={sx("storageTodoList")}>
            {topMedia.slice(0, 5).map((item) => (
              <div key={item.mediaId ?? item.filename ?? "media"} style={sx("storageTodoItem")}>
                <span>{item.filename || item.mediaId || "Unbekannt"}</span>
                <span>{formatBytes(item.totalBytes)}</span>
              </div>
            ))}
            {topMedia.length === 0 ? <div style={sx("storageMetricHint")}>Noch keine Medien-Trafficdaten.</div> : null}
          </div>
        </div>
      </div>

      <div style={{ ...sx("storageHealthGrid"), marginTop: 12 }}>
        <div style={sx("storageMiniCard")}>
          <div style={sx("storageMiniLabel")}>Aktive Warnungen</div>
          <div style={sx("storageMiniValue")}>{formatNumber(warnings.length)}</div>
          <div style={sx("storageMetricHint")}>Details werden im nächsten Migrationsschritt ausgelagert.</div>
        </div>
        <div style={sx("storageMiniCard")}>
          <div style={sx("storageMiniLabel")}>Empfehlungen</div>
          <div style={sx("storageMiniValue")}>{formatNumber(recommendations.length)}</div>
          <div style={sx("storageMetricHint")}>Die Empfehlungskarten folgen im nächsten Schritt.</div>
        </div>
      </div>
    </div>
  );
}
