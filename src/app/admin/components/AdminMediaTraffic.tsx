"use client";
import AdminMediaGuard from "./AdminMediaGuard";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import type { CostReport } from "@/lib/cloudflare-cost-monitor";
import type { CostSettings } from "@/lib/media-cost-model";
const box: CSSProperties = { padding: 18, borderRadius: 16, background: "#0b1324", border: "1px solid #334155", color: "#e2e8f0" };
const input: CSSProperties = { display: "block", marginTop: 6, width: "100%", boxSizing: "border-box", padding: 10, color: "#e2e8f0", background: "#172033", border: "1px solid #475569", borderRadius: 8 };
const number = (v: number | null | undefined) => v == null ? "Nicht verfügbar" : v.toLocaleString("de-DE", { maximumFractionDigits: 2 });
const bytes = (v: number | null | undefined) => v == null ? "Nicht verfügbar" : `${number(v / 1e9)} GB`;
async function request(action?: string, settings?: CostSettings): Promise<CostReport> {
 const response = await fetch("/api/admin/media-traffic", action ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, settings }), cache: "no-store" } : { cache: "no-store" });
 const result = await response.json();
 if (!response.ok || !result.cloudflare) throw new Error(result.error || "Kostenüberwachung konnte nicht geladen werden.");
 return result.cloudflare;
}
export default function AdminMediaTraffic() {
 const [report, setReport] = useState<CostReport | null>(null);
 const [settings, setSettings] = useState<CostSettings | null>(null);
 const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
 const load = useCallback(async (action?: string, values?: CostSettings) => {
  setBusy(true); setError(""); setMessage("");
  try { const r = await request(action, values); setReport(r); setSettings(r.settings); if (action === "save") setMessage("Einstellungen gespeichert. Der tägliche Prüfjob übernimmt die E-Mail-Warnungen."); }
  catch(e) { setError(e instanceof Error ? e.message : "Fehler beim Laden."); }
  finally { setBusy(false); }
 }, []);
 useEffect(() => { void load(); }, [load]);
 const update = <K extends keyof CostSettings>(key: K, value: CostSettings[K]) => setSettings(s => s ? { ...s, [key]: value } : s);
 const cards: [string, string][] = report ? [
  ["R2-Downloads diesen Monat*", bytes(report.metrics.bandwidth?.monthBytes)],
  ["Aktueller R2-Speicher", bytes(report.metrics.storage?.bytes)],
  ["Class-A-Operationen", number(report.metrics.operations?.classA)],
  ["Class-B-Operationen", number(report.metrics.operations?.classB)],
  ["Worker-Anfragen diesen Monat", number(report.metrics.workers?.monthRequests)],
  ["Worker-Fehler diesen Monat", number(report.metrics.workers?.monthErrors)],
  ["Kosten-Teilschätzung", report.costs ? `${number(report.costs.subtotalEur)} EUR` : "Nicht verfügbar"],
  ["Budget-Anteil der Teilschätzung", report.costs ? `${number(report.costs.budgetPercent)} %` : "Nicht verfügbar"],
 ] : [];
 return <section style={box}>
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><h2 style={{ margin: 0 }}>Cloudflare: Verbrauch & Kostenwarnungen</h2><button disabled={busy} onClick={() => void load("refresh")}>{busy ? "Wird geladen …" : "Messwerte aktualisieren"}</button></div>
  <p>Gesamtüberwachung für den Media-Bucket und Worker. Die QR-bezogenen Limits und Zustimmungen werden im separaten Abrufschutz darunter verwaltet.</p>
  {error && <p role="alert" style={{ color: "#fca5a5" }}>{error}</p>}{message && <p role="status" style={{ color: "#86efac" }}>{message}</p>}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>{cards.map(([label, value]) => <div key={label} style={box}><div style={{ color: "#94a3b8", marginBottom: 8 }}>{label}</div><strong style={{ fontSize: 22 }}>{value}</strong></div>)}</div>
  {report && <>
   <p>Messstand: {new Date(report.metrics.updatedAt).toLocaleString("de-DE")} · Bucket: {report.metrics.bucket} · Worker: {report.metrics.worker}</p>
   {report.metrics.errors.map(e => <p role="alert" key={e} style={{ color: "#fbbf24" }}>{e}</p>)}
   <details><summary>Berechnung und Grenzen der Messung*</summary><ul>{report.notes.map(n => <li key={n} style={{ marginTop: 8 }}>{n}</li>)}</ul></details>
  </>}
  {settings && <form onSubmit={e => { e.preventDefault(); void load("save", settings); }} style={{ marginTop: 24 }}>
   <h3>Warnungen einstellen</h3><p>Der Teilbetrag wird ohne gemeinsame Freibeträge geschätzt. Worker-CPU, Durable Objects des Abrufschutzes und weitere Dienste fehlen. Die Cloudflare-Rechnung bleibt maßgeblich.</p>
   <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
    <label>Monatliches Vergleichsbudget (EUR)<input style={input} required type="number" min="0.01" max="100000" step="0.01" value={settings.budget_eur} onChange={e => update("budget_eur", Number(e.target.value))}/></label>
    <label>Warnschwelle (%)<input style={input} required type="number" min="1" max="99" value={settings.warn_percent} onChange={e => update("warn_percent", Number(e.target.value))}/></label>
    <label>Kritische Schwelle (%)<input style={input} required type="number" min="2" max="100" value={settings.critical_percent} onChange={e => update("critical_percent", Number(e.target.value))}/></label>
    <label>Umrechnung: 1 USD in EUR<input style={input} required type="number" min="0.01" max="10" step="0.0001" value={settings.usd_to_eur} onChange={e => update("usd_to_eur", Number(e.target.value))}/></label>
    <label>Workers-Tarif<select style={input} value={settings.worker_plan} onChange={e => update("worker_plan", e.target.value as CostSettings["worker_plan"])}><option value="unknown">Noch nicht ausgewählt</option><option value="free">Free</option><option value="paid">Paid / Standard</option></select></label>
    <label>Deine Betreiber-E-Mail<input style={input} type="email" required={settings.email_enabled} value={settings.email_to} onChange={e => update("email_to", e.target.value)}/></label>
   </div>
   <p><label><input type="checkbox" checked={settings.email_enabled} onChange={e => update("email_enabled", e.target.checked)}/> E-Mail-Warnungen aktivieren</label></p>
   {!report?.emailReady && <p style={{ color: "#fbbf24" }}>Für den E-Mail-Versand fehlen noch RESEND_API_KEY und/oder MEDIA_COST_EMAIL_FROM.</p>}
   <p>Warnungen: Warnschwelle, kritische Schwelle und 100 %. Je erreichte Schwelle einmal pro Monat. Bei einem Sprung wird die höchste erreichte Schwelle gemeldet. Automatische Prüfung täglich nach Einrichtung des Cronjobs.</p>
   <button disabled={busy} type="submit">Einstellungen speichern</button>
  </form>}
 <AdminMediaGuard/>
 </section>;
}
