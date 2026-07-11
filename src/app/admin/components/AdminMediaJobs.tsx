"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { BulkMediaPreviewResult, MediaJobsResult } from "../types";
import { formatBytes, formatNumber } from "../utils/mediaFormat";


type ApiError = { error?: string };
type ProcessResult = { processed?: boolean; error?: string };

type JobFilter = "all" | "queued" | "processing" | "done" | "failed";

const styles: Record<string, CSSProperties> = {
  panel: { borderRadius: 22, background: "#0b1324", border: "1px solid #243044", padding: 16 },
  section: { marginTop: 12 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14 },
  title: { margin: 0, color: "#e2e8f0", fontSize: 18, fontWeight: 900 },
  hint: { color: "#9fb1c8", fontSize: 12, lineHeight: 1.5, marginTop: 6 },
  row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 },
  card: { borderRadius: 16, background: "#111827", border: "1px solid #243044", padding: 12 },
  label: { color: "#93a5bd", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.4 },
  value: { color: "#f8fafc", fontSize: 20, fontWeight: 950, marginTop: 6 },
  button: { border: "1px solid #2d3f59", borderRadius: 10, background: "#172133", color: "#f8fafc", padding: "9px 11px", fontWeight: 900, cursor: "pointer", fontSize: 12 },
  warningButton: { border: "1px solid #854d0e", borderRadius: 10, background: "#2c1806", color: "#fde68a", padding: "9px 11px", fontWeight: 900, cursor: "pointer", fontSize: 12 },
  approveButton: { border: "1px solid #14532d", borderRadius: 10, background: "#10291c", color: "#bbf7d0", padding: "9px 11px", fontWeight: 900, cursor: "pointer", fontSize: 12 },
  disabled: { opacity: 0.55, cursor: "not-allowed" },
  message: { borderRadius: 14, border: "1px solid #2d3f59", background: "#111827", color: "#cbd5e1", padding: 12, marginTop: 12, fontSize: 12, lineHeight: 1.5 },
  error: { borderRadius: 14, border: "1px solid #991b1b", background: "#3f1111", color: "#fecaca", padding: 12, marginTop: 12, fontSize: 12 },
  filterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 12 },
  labelWrap: { display: "grid", gap: 6, color: "#93a5bd", fontSize: 12, fontWeight: 900 },
  input: { width: "100%", borderRadius: 12, border: "1px solid #2d3f59", background: "#0b1324", color: "#f8fafc", padding: "10px 11px", fontSize: 13, boxSizing: "border-box", outline: "none" },
  tableWrap: { width: "100%", overflowX: "auto", borderRadius: 16, border: "1px solid #243044", background: "#0b1324", marginTop: 12 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 980 },
  th: { textAlign: "left", color: "#93a5bd", padding: "10px", fontSize: 11, fontWeight: 950, borderBottom: "1px solid #243044", whiteSpace: "nowrap" },
  td: { color: "#e2e8f0", padding: "10px", fontSize: 12, borderBottom: "1px solid #172133", verticalAlign: "top", whiteSpace: "nowrap" },
  mono: { display: "inline-block", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#f8fafc", fontWeight: 800 },
  status: { display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "5px 8px", border: "1px solid #243044", fontSize: 11, fontWeight: 900 },
  previewGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 12 },
};


function statusLabel(status?: string | null) {
  const value = String(status || "unknown").toLowerCase();
  if (value === "queued") return "Wartet";
  if (value === "processing") return "In Verarbeitung";
  if (value === "done") return "Erledigt";
  if (value === "failed") return "Fehlgeschlagen";
  return value;
}

function statusStyle(status?: string | null): CSSProperties {
  const value = String(status || "unknown").toLowerCase();
  if (value === "done") return { ...styles.status, background: "#10291c", borderColor: "#14532d", color: "#bbf7d0" };
  if (value === "failed") return { ...styles.status, background: "#3f1111", borderColor: "#991b1b", color: "#fecaca" };
  if (value === "processing") return { ...styles.status, background: "#102044", borderColor: "#1d4ed8", color: "#bfdbfe" };
  return { ...styles.status, background: "#2c1806", borderColor: "#854d0e", color: "#fde68a" };
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export default function AdminMediaJobs() {
  const [data, setData] = useState<MediaJobsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryWorkingId, setRetryWorkingId] = useState<string | null>(null);
  const [autoRun, setAutoRun] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [jobFilter, setJobFilter] = useState<JobFilter>("all");
  const [jobSearch, setJobSearch] = useState("");

  const [bulkType, setBulkType] = useState("image");
  const [bulkStatus, setBulkStatus] = useState("failed");
  const [bulkMinMb, setBulkMinMb] = useState("0");
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkLimit, setBulkLimit] = useState("100");
  const [bulkPreview, setBulkPreview] = useState<BulkMediaPreviewResult | null>(null);
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/media-jobs", { cache: "no-store" });
      const payload = await readJson<MediaJobsResult & ApiError>(response);
      if (!response.ok) throw new Error(payload.error || "Media Jobs konnten nicht geladen werden.");
      setData(payload);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Media Jobs konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = window.setInterval(() => void loadJobs(), 10000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, loadJobs]);

  const processBatch = useCallback(async (maxJobs: number) => {
    if (processing) return;
    try {
      setProcessing(true);
      setMessage(null);
      setError(null);
      let processedCount = 0;
      for (let index = 0; index < maxJobs; index += 1) {
        const response = await fetch("/api/admin/media-jobs/process", { method: "POST" });
        const payload = await readJson<ProcessResult>(response);
        if (!response.ok) throw new Error(payload.error || "Media Job konnte nicht verarbeitet werden.");
        if (!payload.processed) break;
        processedCount += 1;
      }
      setLastRunAt(new Date().toISOString());
      setMessage(processedCount > 0 ? `${processedCount} Media Job(s) wurden verarbeitet.` : "Keine wartenden Media Jobs vorhanden.");
      await loadJobs();
    } catch (processError: unknown) {
      setError(processError instanceof Error ? processError.message : "Media Queue konnte nicht verarbeitet werden.");
    } finally {
      setProcessing(false);
    }
  }, [loadJobs, processing]);

  useEffect(() => {
    if (!autoRun) return;
    const timer = window.setInterval(() => void processBatch(5), 15000);
    return () => window.clearInterval(timer);
  }, [autoRun, processBatch]);

  const retryJob = async (jobId: string) => {
    try {
      setRetryWorkingId(jobId);
      setMessage(null);
      setError(null);
      const response = await fetch("/api/admin/media-jobs/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const payload = await readJson<ApiError>(response);
      if (!response.ok) throw new Error(payload.error || "Media Job konnte nicht erneut gestartet werden.");
      setMessage("Fehlgeschlagener Media Job wurde zurück in die Queue gesetzt.");
      await loadJobs();
    } catch (retryError: unknown) {
      setError(retryError instanceof Error ? retryError.message : "Media Job konnte nicht erneut gestartet werden.");
    } finally {
      setRetryWorkingId(null);
    }
  };

  const bulkPayload = (dryRun: boolean) => ({
    type: bulkType,
    status: bulkStatus,
    minMb: bulkMinMb,
    search: bulkSearch,
    limit: bulkLimit,
    dryRun,
  });

  const previewBulk = async () => {
    try {
      setBulkWorking(true);
      setBulkMessage(null);
      const response = await fetch("/api/admin/media-jobs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulkPayload(true)),
      });
      const payload = await readJson<BulkMediaPreviewResult & ApiError>(response);
      if (!response.ok) throw new Error(payload.error || "Bulk-Vorschau konnte nicht geladen werden.");
      setBulkPreview(payload);
      setBulkMessage(`${formatNumber(payload.matchedCount)} Medien passen zu den Filtern.`);
    } catch (previewError: unknown) {
      setBulkMessage(previewError instanceof Error ? previewError.message : "Bulk-Vorschau konnte nicht geladen werden.");
    } finally {
      setBulkWorking(false);
    }
  };

  const createBulk = async () => {
    try {
      setBulkWorking(true);
      setBulkMessage(null);
      const response = await fetch("/api/admin/media-jobs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulkPayload(false)),
      });
      const payload = await readJson<BulkMediaPreviewResult & ApiError>(response);
      if (!response.ok) throw new Error(payload.error || "Bulk-Reprocess konnte nicht gestartet werden.");
      setBulkMessage(`${formatNumber(payload.createdCount)} Bulk Job(s) wurden angelegt.`);
      await loadJobs();
      await previewBulk();
    } catch (bulkError: unknown) {
      setBulkMessage(bulkError instanceof Error ? bulkError.message : "Bulk-Reprocess konnte nicht gestartet werden.");
    } finally {
      setBulkWorking(false);
    }
  };

  const filteredJobs = useMemo(() => {
    const needle = jobSearch.trim().toLowerCase();
    return (data?.jobs ?? []).filter((job) => {
      const statusMatches = jobFilter === "all" || String(job.status || "").toLowerCase() === jobFilter;
      const searchMatches = !needle || [job.id, job.media_id, job.qrx_id, job.reason, job.processing_error, job.job_type]
        .some((value) => String(value || "").toLowerCase().includes(needle));
      return statusMatches && searchMatches;
    });
  }, [data?.jobs, jobFilter, jobSearch]);

  const summary = data?.summary;
  const queued = Number(summary?.queued ?? 0);
  const workerState = processing ? "Working" : queued > 0 ? "Idle · Jobs warten" : "Idle";
  const lastRunLabel = lastRunAt ? new Date(lastRunAt).toLocaleTimeString("de-DE") : "Noch nicht gestartet";

  return (
    <>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Media Queue Manager</h3>
            <div style={styles.hint}>Eigenständiges Modul für Queue, Retry, Auto-Run und Fehlerkontrolle.</div>
          </div>
          <div style={styles.row}>
            <button type="button" onClick={() => setAutoRun((value) => !value)} style={autoRun ? styles.approveButton : styles.warningButton}>
              {autoRun ? "🟢 Auto Queue: EIN" : "⚪ Auto Queue: AUS"}
            </button>
            <button type="button" onClick={() => setAutoRefresh((value) => !value)} style={autoRefresh ? styles.approveButton : styles.button}>
              {autoRefresh ? "↻ Auto Refresh: EIN" : "↻ Auto Refresh: AUS"}
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {[
            ["Worker Status", workerState], ["Letzter Lauf", lastRunLabel], ["Queued", formatNumber(summary?.queued)],
            ["Processing", formatNumber(summary?.processing)], ["Done", formatNumber(summary?.done)], ["Fehler", formatNumber(summary?.failed)],
          ].map(([label, value]) => (
            <div key={label} style={styles.card}><div style={styles.label}>{label}</div><div style={styles.value}>{value}</div></div>
          ))}
        </div>

        <div style={{ ...styles.row, marginTop: 12 }}>
          <button type="button" onClick={() => void loadJobs()} disabled={loading} style={{ ...styles.button, ...(loading ? styles.disabled : {}) }}>{loading ? "Lade…" : "Jobs aktualisieren"}</button>
          <button type="button" onClick={() => void processBatch(1)} disabled={processing} style={{ ...styles.warningButton, ...(processing ? styles.disabled : {}) }}>{processing ? "Verarbeitet…" : "Nächsten Job verarbeiten"}</button>
          <button type="button" onClick={() => void processBatch(5)} disabled={processing} style={{ ...styles.button, ...(processing ? styles.disabled : {}) }}>{processing ? "Batch läuft…" : "Bis zu 5 Jobs verarbeiten"}</button>
        </div>

        {message ? <div style={styles.message}>{message}</div> : null}
        {error ? <div style={styles.error}>⚠️ {error}</div> : null}

        <div style={styles.filterGrid}>
          <label style={styles.labelWrap}>Suche<input value={jobSearch} onChange={(event) => setJobSearch(event.target.value)} placeholder="Job, Medium, QR-X, Fehler…" style={styles.input} /></label>
          <label style={styles.labelWrap}>Status<select value={jobFilter} onChange={(event) => setJobFilter(event.target.value as JobFilter)} style={styles.input}><option value="all">Alle</option><option value="queued">Wartet</option><option value="processing">In Verarbeitung</option><option value="done">Erledigt</option><option value="failed">Fehlgeschlagen</option></select></label>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Job</th><th style={styles.th}>Media</th><th style={styles.th}>QR-X</th><th style={styles.th}>Status</th><th style={styles.th}>Versuche</th><th style={styles.th}>Grund / Fehler</th><th style={styles.th}>Erstellt</th><th style={styles.th}>Aktionen</th></tr></thead>
            <tbody>
              {filteredJobs.slice(0, 50).map((job) => (
                <tr key={job.id}>
                  <td style={styles.td}><span style={styles.mono} title={job.id}>{job.id}</span></td>
                  <td style={styles.td}><span style={styles.mono} title={job.media_id}>{job.media_id}</span></td>
                  <td style={styles.td}><span style={styles.mono} title={job.qrx_id || ""}>{job.qrx_id || "–"}</span></td>
                  <td style={styles.td}><span style={statusStyle(job.status)}>{statusLabel(job.status)}</span></td>
                  <td style={styles.td}>{formatNumber(job.attempts)}</td>
                  <td style={styles.td}><span title={job.processing_error || job.reason || ""}>{job.processing_error || job.reason || "–"}</span></td>
                  <td style={styles.td}>{job.created_at ? new Date(job.created_at).toLocaleString("de-DE") : "–"}</td>
                  <td style={styles.td}>{String(job.status || "").toLowerCase() === "failed" ? <button type="button" onClick={() => void retryJob(job.id)} disabled={retryWorkingId === job.id} style={{ ...styles.warningButton, ...(retryWorkingId === job.id ? styles.disabled : {}) }}>{retryWorkingId === job.id ? "Retry…" : "Retry"}</button> : "–"}</td>
                </tr>
              ))}
              {filteredJobs.length === 0 ? <tr><td style={styles.td} colSpan={8}>Keine passenden Media Jobs vorhanden.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...styles.panel, ...styles.section }}>
        <div style={styles.header}>
          <div><h3 style={styles.title}>Bulk Media Jobs</h3><div style={styles.hint}>Vorschau prüfen und anschließend kontrolliert Reprocess-Jobs anlegen.</div></div>
          <div style={styles.row}>
            <button type="button" onClick={() => void previewBulk()} disabled={bulkWorking} style={{ ...styles.button, ...(bulkWorking ? styles.disabled : {}) }}>{bulkWorking ? "Lade…" : "Vorschau"}</button>
            <button type="button" onClick={() => void createBulk()} disabled={bulkWorking} style={{ ...styles.warningButton, ...(bulkWorking ? styles.disabled : {}) }}>{bulkWorking ? "Erstelle…" : "Bulk-Reprocess starten"}</button>
          </div>
        </div>

        <div style={styles.filterGrid}>
          <label style={styles.labelWrap}>Typ<select value={bulkType} onChange={(event) => setBulkType(event.target.value)} style={styles.input}><option value="image">Bilder</option><option value="logo">Logos</option><option value="all">Alle optimierbaren Medien</option></select></label>
          <label style={styles.labelWrap}>Status<select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} style={styles.input}><option value="failed">Fehlgeschlagen</option><option value="ready">Optimiert</option><option value="queued">Wartet</option><option value="all">Alle</option></select></label>
          <label style={styles.labelWrap}>Mindestgröße (MB)<input value={bulkMinMb} onChange={(event) => setBulkMinMb(event.target.value)} inputMode="decimal" style={styles.input} /></label>
          <label style={styles.labelWrap}>Suche<input value={bulkSearch} onChange={(event) => setBulkSearch(event.target.value)} placeholder="Dateiname oder QR-X-ID…" style={styles.input} /></label>
          <label style={styles.labelWrap}>Limit<input value={bulkLimit} onChange={(event) => setBulkLimit(event.target.value)} inputMode="numeric" style={styles.input} /></label>
        </div>

        {bulkMessage ? <div style={styles.message}>{bulkMessage}</div> : null}

        {bulkPreview ? (
          <div style={styles.previewGrid}>
            <div style={styles.card}><div style={styles.label}>Treffer</div><div style={styles.value}>{formatNumber(bulkPreview.matchedCount)}</div></div>
            {(bulkPreview.sample ?? []).slice(0, 12).map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.label}>{item.type || "Medium"} · {item.processing_status || "–"}</div>
                <div style={{ ...styles.value, fontSize: 14 }}>{item.filename || item.id}</div>
                <div style={styles.hint}>QR-X: {item.qrx_id || "–"} · {formatBytes(item.original_bytes)}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
