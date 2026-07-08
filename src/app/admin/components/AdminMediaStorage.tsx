"use client";

import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";

type StyleMap = Record<string, unknown>;

export type StorageMediaItem = {
  id: string;
  qrx_id: string | null;
  filename: string | null;
  type: string | null;
  processing_status: string | null;
  originalBytes: number;
  optimizedBytes: number;
  savedBytes: number;
  savingsPercent: number;
};

type StorageMediaStats = {
  topLargest?: StorageMediaItem[];
  topSavings?: StorageMediaItem[];
  mediaItems?: StorageMediaItem[];
  statusCounts?: Record<string, number>;
};

type AdminMediaStorageProps = {
  styles: StyleMap;
  storageMediaStats: StorageMediaStats | null;
  storageMediaLoading: boolean;
  storageMediaSearch: string;
  setStorageMediaSearch: Dispatch<SetStateAction<string>>;
  storageMediaTypeFilter: string;
  setStorageMediaTypeFilter: Dispatch<SetStateAction<string>>;
  storageMediaStatusFilter: string;
  setStorageMediaStatusFilter: Dispatch<SetStateAction<string>>;
  storageMediaMinMb: string;
  setStorageMediaMinMb: Dispatch<SetStateAction<string>>;
  storageMediaSort: string;
  setStorageMediaSort: Dispatch<SetStateAction<string>>;
  fetchStorageMediaStats: () => void | Promise<void>;
  renderStorageMediaTable: (title: string, description: string, items: StorageMediaItem[]) => ReactNode;
  renderStorageMediaDetailPanel: () => ReactNode;
  formatStorageStatus: (status: string) => string;
  formatNumber: (value?: number | null) => string;
};

function styleOf(styles: StyleMap, key: string): CSSProperties {
  return (styles[key] ?? {}) as CSSProperties;
}

export default function AdminMediaStorage({
  styles,
  storageMediaStats,
  storageMediaLoading,
  storageMediaSearch,
  setStorageMediaSearch,
  storageMediaTypeFilter,
  setStorageMediaTypeFilter,
  storageMediaStatusFilter,
  setStorageMediaStatusFilter,
  storageMediaMinMb,
  setStorageMediaMinMb,
  storageMediaSort,
  setStorageMediaSort,
  fetchStorageMediaStats,
  renderStorageMediaTable,
  renderStorageMediaDetailPanel,
  formatStorageStatus,
  formatNumber,
}: AdminMediaStorageProps) {
  const sx = (key: string) => styleOf(styles, key);

  return (
    <>
      <div style={sx("storagePanel")}>
        <h3 style={sx("storagePanelTitle")}>Speicherfresser finden</h3>
        <p style={{ ...sx("storageMetricHint"), marginTop: -4, marginBottom: 12 }}>
          Filtere große Dateien, fehlerhafte Medien oder Dateien mit besonders hohem Einsparpotenzial.
        </p>

        <div style={sx("storageFilterGrid")}>
          <label style={sx("storageFilterLabel")}>
            Suche
            <input
              value={storageMediaSearch}
              onChange={(event) => setStorageMediaSearch(event.target.value)}
              placeholder="Dateiname oder QR-X-ID…"
              style={sx("storageFilterInput")}
            />
          </label>

          <label style={sx("storageFilterLabel")}>
            Typ
            <select
              value={storageMediaTypeFilter}
              onChange={(event) => setStorageMediaTypeFilter(event.target.value)}
              style={sx("storageFilterSelect")}
            >
              <option value="all">Alle</option>
              <option value="image">Bilder</option>
              <option value="logo">Logos</option>
              <option value="file">Dateien</option>
            </select>
          </label>

          <label style={sx("storageFilterLabel")}>
            Status
            <select
              value={storageMediaStatusFilter}
              onChange={(event) => setStorageMediaStatusFilter(event.target.value)}
              style={sx("storageFilterSelect")}
            >
              <option value="all">Alle</option>
              <option value="ready">Optimiert / Ready</option>
              <option value="pending">Wartet</option>
              <option value="processing">In Verarbeitung</option>
              <option value="failed">Fehler</option>
              <option value="unknown">Unbekannt</option>
            </select>
          </label>

          <label style={sx("storageFilterLabel")}>
            Mindestgröße in MB
            <input
              value={storageMediaMinMb}
              onChange={(event) => setStorageMediaMinMb(event.target.value)}
              placeholder="z. B. 10"
              inputMode="decimal"
              style={sx("storageFilterInput")}
            />
          </label>

          <label style={sx("storageFilterLabel")}>
            Sortierung
            <select
              value={storageMediaSort}
              onChange={(event) => setStorageMediaSort(event.target.value)}
              style={sx("storageFilterSelect")}
            >
              <option value="largest">Größte Originaldateien</option>
              <option value="savings">Größte Einsparungen</option>
              <option value="worst">Schlechteste Komprimierung</option>
              <option value="failed">Fehler zuerst</option>
            </select>
          </label>

          <div style={sx("storageFilterActions")}>
            <button
              type="button"
              onClick={() => void fetchStorageMediaStats()}
              disabled={storageMediaLoading}
              style={sx("refreshButton")}
            >
              {storageMediaLoading ? "Filter lädt…" : "Filter anwenden"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStorageMediaSearch("");
                setStorageMediaTypeFilter("all");
                setStorageMediaStatusFilter("all");
                setStorageMediaMinMb("10");
                setStorageMediaSort("largest");
                setTimeout(() => void fetchStorageMediaStats(), 0);
              }}
              style={sx("smallButton")}
            >
              Zurücksetzen
            </button>
          </div>
        </div>

        {renderStorageMediaTable(
          "Gefilterte Speicherfresser",
          "Bis zu 100 passende Medien nach deinen Filtern.",
          storageMediaStats?.mediaItems ?? []
        )}

        {renderStorageMediaDetailPanel()}
      </div>

      <div style={sx("storageDetailGrid")}>
        {renderStorageMediaTable(
          "Größte Medien",
          "Die größten Originaldateien. Diese Dateien sind besonders wichtig für Speicheroptimierung.",
          storageMediaStats?.topLargest ?? []
        )}

        {renderStorageMediaTable(
          "Größte Einsparungen",
          "Medien mit der größten absoluten Speicherersparnis durch Optimierung.",
          storageMediaStats?.topSavings ?? []
        )}
      </div>

      <div style={sx("storageSectionGrid")}>
        <div style={sx("storagePanel")}>
          <h3 style={sx("storagePanelTitle")}>Media Health</h3>
          <div style={sx("storageHealthGrid")}>
            {Object.entries(storageMediaStats?.statusCounts ?? {}).length === 0 ? (
              <div style={sx("storageMiniCard")}>
                <div style={sx("storageMiniLabel")}>Status</div>
                <div style={sx("storageMiniValue")}>—</div>
              </div>
            ) : (
              Object.entries(storageMediaStats?.statusCounts ?? {}).map(([status, count]) => (
                <div key={status} style={sx("storageMiniCard")}>
                  <div style={sx("storageMiniLabel")}>{formatStorageStatus(status)}</div>
                  <div style={sx("storageMiniValue")}>{formatNumber(count)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
