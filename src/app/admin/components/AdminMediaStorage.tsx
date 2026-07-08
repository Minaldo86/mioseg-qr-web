"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";

type StorageMediaStats = {
  topLargest?: any[];
  topSavings?: any[];
  mediaItems?: any[];
  statusCounts?: Record<string, number>;
};

type AdminMediaStorageProps = {
  styles: Record<string, any>;
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
  renderStorageMediaTable: (title: string, description: string, items: any[]) => ReactNode;
  renderStorageMediaDetailPanel: () => ReactNode;
  formatStorageStatus: (status: string) => string;
  formatNumber: (value?: number | null) => string;
};

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
  return (
    <>
      <div style={styles.storagePanel}>
        <h3 style={styles.storagePanelTitle}>Speicherfresser finden</h3>
        <p style={{ ...styles.storageMetricHint, marginTop: -4, marginBottom: 12 }}>
          Filtere große Dateien, fehlerhafte Medien oder Dateien mit besonders hohem Einsparpotenzial.
        </p>

        <div style={styles.storageFilterGrid}>
          <label style={styles.storageFilterLabel}>
            Suche
            <input
              value={storageMediaSearch}
              onChange={(event) => setStorageMediaSearch(event.target.value)}
              placeholder="Dateiname oder QR-X-ID…"
              style={styles.storageFilterInput}
            />
          </label>

          <label style={styles.storageFilterLabel}>
            Typ
            <select
              value={storageMediaTypeFilter}
              onChange={(event) => setStorageMediaTypeFilter(event.target.value)}
              style={styles.storageFilterSelect}
            >
              <option value="all">Alle</option>
              <option value="image">Bilder</option>
              <option value="logo">Logos</option>
              <option value="file">Dateien</option>
            </select>
          </label>

          <label style={styles.storageFilterLabel}>
            Status
            <select
              value={storageMediaStatusFilter}
              onChange={(event) => setStorageMediaStatusFilter(event.target.value)}
              style={styles.storageFilterSelect}
            >
              <option value="all">Alle</option>
              <option value="ready">Optimiert / Ready</option>
              <option value="pending">Wartet</option>
              <option value="processing">In Verarbeitung</option>
              <option value="failed">Fehler</option>
              <option value="unknown">Unbekannt</option>
            </select>
          </label>

          <label style={styles.storageFilterLabel}>
            Mindestgröße in MB
            <input
              value={storageMediaMinMb}
              onChange={(event) => setStorageMediaMinMb(event.target.value)}
              placeholder="z. B. 10"
              inputMode="decimal"
              style={styles.storageFilterInput}
            />
          </label>

          <label style={styles.storageFilterLabel}>
            Sortierung
            <select
              value={storageMediaSort}
              onChange={(event) => setStorageMediaSort(event.target.value)}
              style={styles.storageFilterSelect}
            >
              <option value="largest">Größte Originaldateien</option>
              <option value="savings">Größte Einsparungen</option>
              <option value="worst">Schlechteste Komprimierung</option>
              <option value="failed">Fehler zuerst</option>
            </select>
          </label>

          <div style={styles.storageFilterActions}>
            <button
              type="button"
              onClick={fetchStorageMediaStats}
              disabled={storageMediaLoading}
              style={styles.refreshButton}
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
              style={styles.smallButton}
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

      <div style={styles.storageDetailGrid}>
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

      <div style={styles.storageSectionGrid}>
        <div style={styles.storagePanel}>
          <h3 style={styles.storagePanelTitle}>Media Health</h3>
          <div style={styles.storageHealthGrid}>
            {Object.entries(storageMediaStats?.statusCounts ?? {}).length === 0 ? (
              <div style={styles.storageMiniCard}>
                <div style={styles.storageMiniLabel}>Status</div>
                <div style={styles.storageMiniValue}>—</div>
              </div>
            ) : (
              Object.entries(storageMediaStats?.statusCounts ?? {}).map(([status, count]) => (
                <div key={status} style={styles.storageMiniCard}>
                  <div style={styles.storageMiniLabel}>{formatStorageStatus(status)}</div>
                  <div style={styles.storageMiniValue}>{formatNumber(count)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
