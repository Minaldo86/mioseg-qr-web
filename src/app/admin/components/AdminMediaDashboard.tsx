"use client";

import type { CSSProperties, Dispatch, SetStateAction } from "react";

export type AdminMediaDashboardSection = "overview" | "traffic" | "storage" | "jobs";

type StyleMap = Record<string, unknown>;

type StorageTotals = {
  savedBytes?: number | null;
  failedCount?: number | null;
};

type MediaTrafficSummary = {
  monthBytes?: number | null;
};

type AdminMediaDashboardProps = {
  styles: StyleMap;
  activeSection: AdminMediaDashboardSection;
  onSectionChange: Dispatch<SetStateAction<AdminMediaDashboardSection>>;
  storageTotals?: StorageTotals | null;
  mediaTrafficSummary?: MediaTrafficSummary | null;
  formatBytes: (value?: number | null) => string;
  formatNumber: (value?: number | null) => string;
};

const MEDIA_TABS: Array<{ key: AdminMediaDashboardSection; label: string }> = [
  { key: "overview", label: "Übersicht" },
  { key: "traffic", label: "Traffic · Kosten · Warnungen" },
  { key: "storage", label: "Speicherfresser" },
  { key: "jobs", label: "Media Jobs · Reprocess" },
];

function styleOf(styles: StyleMap, key: string): CSSProperties {
  return (styles[key] ?? {}) as CSSProperties;
}

export default function AdminMediaDashboard({
  styles,
  activeSection,
  onSectionChange,
  storageTotals,
  mediaTrafficSummary,
  formatBytes,
  formatNumber,
}: AdminMediaDashboardProps) {
  const sx = (key: string) => styleOf(styles, key);

  return (
    <>
      <div style={sx("storagePanel")}>
        <div style={sx("storageDetailHeader")}>
          <div>
            <h3 style={sx("storagePanelTitle")}>Media & Storage Bereiche</h3>
            <p style={{ ...sx("storageMetricHint"), marginTop: -4 }}>
              Der Media-Bereich ist jetzt in Unterbereiche aufgeteilt, damit Übersicht, Preise, Credits,
              Finanzen und Logs nicht mehr nach unten gedrückt werden.
            </p>
          </div>
        </div>

        <div style={sx("storageActionRow")}>
          {MEDIA_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSectionChange(tab.key)}
              style={activeSection === tab.key ? sx("storageWarningButton") : sx("storageIconButton")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "overview" ? (
        <div style={sx("storagePanel")}>
          <h3 style={sx("storagePanelTitle")}>Kurzübersicht</h3>
          <p style={{ ...sx("storageMetricHint"), marginTop: -4 }}>
            Hier bleiben nur die wichtigsten Media-Kennzahlen sichtbar. Tiefe Analysen findest du über die
            Unterbereiche oben.
          </p>
          <div style={sx("storageHealthGrid")}>
            <div style={sx("storageMiniCard")}>
              <div style={sx("storageMiniLabel")}>Gesparte Daten</div>
              <div style={sx("storageMiniValue")}>{formatBytes(storageTotals?.savedBytes ?? 0)}</div>
              <div style={sx("storageMetricHint")}>Durch Optimierung eingesparte Speichermenge.</div>
            </div>
            <div style={sx("storageMiniCard")}>
              <div style={sx("storageMiniLabel")}>Fehlerhafte Medien</div>
              <div style={sx("storageMiniValue")}>{formatNumber(storageTotals?.failedCount ?? 0)}</div>
              <div style={sx("storageMetricHint")}>Bei Fehlern den Bereich „Media Jobs · Reprocess“ öffnen.</div>
            </div>
            <div style={sx("storageMiniCard")}>
              <div style={sx("storageMiniLabel")}>Traffic diesen Monat</div>
              <div style={sx("storageMiniValue")}>{formatBytes(mediaTrafficSummary?.monthBytes ?? 0)}</div>
              <div style={sx("storageMetricHint")}>
                Für Details den Bereich „Traffic · Kosten · Warnungen“ öffnen.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
