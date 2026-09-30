import { supabaseAdmin } from "@/lib/supabase-admin";
import { classifyOperations, estimateCosts, nonnegative, type CloudflareRow, type CostSettings } from "./media-cost-model";

type Metrics = {
  periodStart: string; updatedAt: string; source: "cloudflare_graphql";
  bucket: string; worker: string; errors: string[];
  operations: ReturnType<typeof classifyOperations> | null;
  storage: { bytes: number; objects: number; measuredAt: string | null } | null;
  workers: { monthRequests: number; monthErrors: number; todayAccountRequests: number } | null;
  bandwidth: { monthBytes: number; todayBytes: number; weekBytes: number } | null;
};
export type CostReport = { settings: CostSettings; metrics: Metrics; costs: ReturnType<typeof estimateCosts> | null; emailReady: boolean; notes: string[] };
const GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql";
async function graphql(query: string, variables: Record<string, string>) {
  const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_ANALYTICS_TOKEN fehlt in den Server-Umgebungsvariablen.");
  const response = await fetch(GRAPHQL_URL, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`Cloudflare Analytics HTTP ${response.status}. Token und Berechtigungen prüfen.`);
  const payload = await response.json();
  if (payload.errors?.length) {
    // Never forward headers, tokens or full responses to browser/logs.
    throw new Error(`Cloudflare Analytics: ${String(payload.errors[0]?.message ?? "Abfrage fehlgeschlagen").slice(0, 300)}`);
  }
  const account = payload.data?.viewer?.accounts?.[0];
  if (!account) throw new Error("Kein Cloudflare-Konto für die konfigurierte Account-ID gefunden.");
  return account as Record<string, CloudflareRow[]>;
}
const R2_QUERY = `query R2Costs($account: string!, $start: Time!, $end: Time!, $bucket: string!) {
 viewer { accounts(filter: {accountTag: $account}) {
  operations: r2OperationsAdaptiveGroups(limit: 100, filter: {datetime_geq: $start, datetime_lt: $end, bucketName: $bucket}) {
   sum { requests } dimensions { actionType }
  }
  storage: r2StorageAdaptiveGroups(limit: 1, filter: {datetime_geq: $start, datetime_lt: $end, bucketName: $bucket}, orderBy: [datetime_DESC]) {
   max { payloadSize metadataSize objectCount } dimensions { datetime }
  }
 } }
}`;
const WORKER_QUERY = `query WorkerCosts($account: string!, $start: string!, $today: string!, $end: string!, $worker: string!) {
 viewer { accounts(filter: {accountTag: $account}) {
  worker: workersInvocationsAdaptive(limit: 100, filter: {scriptName: $worker, datetime_geq: $start, datetime_leq: $end}) { sum { requests errors } }
  accountToday: workersInvocationsAdaptive(limit: 100, filter: {datetime_geq: $today, datetime_leq: $end}) { sum { requests } }
 } }
}`;
const BANDWIDTH_QUERY = `query Bandwidth($account: string!, $start: Time!, $end: Time!, $bucket: string!) {
 viewer { accounts(filter: {accountTag: $account}) {
  bandwidth: r2BandwidthUsageAdaptiveGroups(limit: 1000, filter: {datetime_geq: $start, datetime_lt: $end, bucketName: $bucket}, orderBy: [datetimeHour_ASC]) {
   sum { bytesDownload } dimensions { datetimeHour }
  }
 } }
}`;
export async function readCostSettings(): Promise<CostSettings> {
  const { data, error } = await supabaseAdmin.from("qrx_media_cost_settings").select("*").eq("id", 1).single();
  if (error || !data) throw new Error("Kostenüberwachung noch nicht eingerichtet. Bitte zuerst die neue SQL-Migration ausführen.");
  return { ...data, budget_eur: Number(data.budget_eur), usd_to_eur: Number(data.usd_to_eur) } as CostSettings;
}
export async function readCostReport(force = false): Promise<CostReport> {
  const settings = await readCostSettings();
  const now = new Date(), end = now.toISOString();
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const week = new Date(today.getTime() - 6 * 86400000);
  const period = month.toISOString().slice(0, 10);
  const { data: cached, error: cacheError } = await supabaseAdmin.from("qrx_media_cost_snapshots").select("payload,updated_at").eq("period_start", period).maybeSingle();
  if (cacheError) throw new Error("Kosten-Snapshot konnte nicht geladen werden.");
  let metrics: Metrics;
  if (!force && cached && now.getTime() - new Date(cached.updated_at).getTime() < 10 * 60000) {
    metrics = cached.payload as Metrics;
  } else {
    const account = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
    if (!/^[a-f0-9]{32}$/i.test(account)) throw new Error("CLOUDFLARE_ACCOUNT_ID fehlt oder ist ungültig.");
    const bucket = process.env.CLOUDFLARE_R2_BUCKET || "mioseg-qr-media";
    const worker = process.env.CLOUDFLARE_MEDIA_WORKER || "mioseg-qr-media";
    const results = await Promise.allSettled([
      graphql(R2_QUERY, { account, start: month.toISOString(), end, bucket }),
      graphql(WORKER_QUERY, { account, start: month.toISOString(), today: today.toISOString(), end, worker }),
      graphql(BANDWIDTH_QUERY, { account, start: new Date(Math.min(month.getTime(), week.getTime())).toISOString(), end, bucket }),
    ]);
    const errors: string[] = [];
    const section = (i: number, label: string) => {
      const result = results[i];
      if (result.status === "fulfilled") return result.value;
      errors.push(`${label}: ${result.reason instanceof Error ? result.reason.message : "nicht verfügbar"}`); return null;
    };
    const r2 = section(0, "R2"), workers = section(1, "Worker"), bw = section(2, "Bandbreite");
   if ((r2?.operations?.length ?? 0) >= 100) { errors.push("R2: Ergebnislimit erreicht; Kosten unvollständig."); }
    const storageRow = r2?.storage?.[0];
    const bandwidthRows = bw?.bandwidth;
    const bytesAfter = (start: number) => bandwidthRows?.reduce((sum, r) => new Date(r.dimensions?.datetimeHour ?? "").getTime() >= start ? sum + nonnegative(r.sum?.bytesDownload) : sum, 0) ?? 0;
    metrics = {
      periodStart: period, updatedAt: end, source: "cloudflare_graphql", bucket, worker, errors,
      operations: r2 && (r2.operations?.length ?? 0) < 100 ? classifyOperations(r2.operations ?? []) : null,
      storage: storageRow ? { bytes: nonnegative(storageRow.max?.payloadSize) + nonnegative(storageRow.max?.metadataSize), objects: nonnegative(storageRow.max?.objectCount), measuredAt: storageRow.dimensions?.datetime ?? null } : null,
      workers: workers && (workers.worker?.length ?? 0) < 100 && (workers.accountToday?.length ?? 0) < 100 ? {
        monthRequests: (workers.worker ?? []).reduce((sum, r) => sum + nonnegative(r.sum?.requests), 0),
        monthErrors: (workers.worker ?? []).reduce((sum, r) => sum + nonnegative(r.sum?.errors), 0),
        todayAccountRequests: (workers.accountToday ?? []).reduce((sum, r) => sum + nonnegative(r.sum?.requests), 0),
      } : null,
      bandwidth: bw && (bandwidthRows?.length ?? 0) < 1000 ? { monthBytes: bytesAfter(month.getTime()), todayBytes: bytesAfter(today.getTime()), weekBytes: bytesAfter(week.getTime()) } : null,
    };
    if (!metrics.storage) errors.push("Noch kein R2-Speicher-Messpunkt verfügbar.");
    if (!metrics.workers) errors.push("Worker-Messwerte fehlen oder Ergebnislimit erreicht.");
    if (!metrics.bandwidth) errors.push("Bandbreiten-Messwerte fehlen oder Ergebnislimit erreicht.");
    const { error } = await supabaseAdmin.from("qrx_media_cost_snapshots").upsert({ period_start: period, payload: metrics, updated_at: end });
    if (error) throw new Error("Kosten-Snapshot konnte nicht gespeichert werden.");
  }
  const costs = metrics.operations && metrics.storage && (settings.worker_plan === "unknown" || metrics.workers) ? estimateCosts({ ...metrics.operations, storageBytes: metrics.storage.bytes, workerRequests: metrics.workers?.monthRequests ?? 0 }, settings) : null;
  const notes = [
    "Messwerte können verzögert oder statistisch hochgerechnet sein. Abrechnungszeitraum: Kalendermonat UTC.",
    "Die Bandbreitenstatistik enthält keine Übertragungen unter 100 KiB. Sie misst R2-Downloads, nicht garantiert vollständig beim Nutzer empfangene Bytes.",
    "Kosten sind ein Brutto-Teilbetrag ohne Freibeträge: R2-Operationen seit Monatsbeginn plus aktueller Speicher auf einen ganzen Monat hochgerechnet; bei Paid zusätzlich Worker-Grundpreis und Anfragen.",
    "Worker-CPU, andere Buckets/Worker, Supabase, Vercel, Steuern und Abrechnungsrundung fehlen. Keine Gesamtrechnung oder Kostenobergrenze. Hohe Abrufzahlen können weiterhin Operationskosten verursachen.",
    "Budgetwarnungen beziehen sich auf diesen Teilbetrag und begrenzen die Rechnung nicht. Es werden keine Nutzer-Credits abgebucht.",
  ];
  if (settings.worker_plan === "unknown") notes.push("Worker-Tarif noch auswählen: Worker-Kosten sind bis dahin nicht enthalten.");
  if (metrics.operations?.unknown) notes.push("Unbekannte R2-Operationen vorsorglich mit dem Class-A-Preis geschätzt.");
  return { settings, metrics, costs, emailReady: !!(process.env.RESEND_API_KEY && process.env.MEDIA_COST_EMAIL_FROM), notes };
}
export async function sendCostAlert(report: CostReport) {
  const { settings, metrics, costs } = report;
  if (!settings.email_enabled || !settings.email_to) return { sent: false, reason: "disabled" };
  const apiKey = process.env.RESEND_API_KEY, from = process.env.MEDIA_COST_EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY oder MEDIA_COST_EMAIL_FROM fehlt.");
  if (!costs) return { sent: false, reason: "metrics_unavailable" };
  const reached = [settings.warn_percent, settings.critical_percent, 100].filter(x => costs.budgetPercent >= x);
  if (!reached.length) return { sent: false, reason: "below_threshold" };
  const threshold = Math.max(...reached), period_start = metrics.periodStart, claimed_at = new Date().toISOString();
  let emailPayload = { from, to: [settings.email_to], subject: `Mioseg QR: Kostenwarnung ab ${threshold} %`, text: `Die Kosten-Teilschätzung liegt bei ${costs.subtotalEur.toFixed(2)} EUR (${costs.budgetPercent.toFixed(1)} % des Budgets von ${settings.budget_eur} EUR).\n\nDies ist keine Gesamtrechnung und kein Kostenlimit. Worker-CPU und weitere Dienste sind nicht enthalten. Öffne den Admin-Bereich und prüfe die aktuelle Cloudflare-Abrechnung. Nutzer-Credits wurden nicht abgebucht.` };
  const { error: insertError } = await supabaseAdmin.from("qrx_media_cost_alerts").insert({ period_start, threshold, status: "processing", claimed_at, email_payload: emailPayload });
  if (insertError) {
    if (insertError.code !== "23505") throw new Error("Warnung konnte nicht reserviert werden.");
    const cutoff = new Date(Date.now() - 10 * 60000).toISOString();
    const { data: claim, error } = await supabaseAdmin.from("qrx_media_cost_alerts")
      .update({ status: "processing", claimed_at, last_error: null })
      .eq("period_start", period_start).eq("threshold", threshold)
      .or(`status.eq.failed,and(status.eq.processing,claimed_at.lt.${cutoff})`).select("threshold,email_payload");
    if (error) throw new Error("Warnung konnte nicht erneut reserviert werden.");
    if (!claim?.length) return { sent: false, reason: "already_sent_or_processing" };
    if (claim[0].email_payload) emailPayload = claim[0].email_payload;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `media-cost-${period_start}-${threshold}` },
      body: JSON.stringify(emailPayload),
    });
    if (!response.ok) throw new Error(`E-Mail-Versand HTTP ${response.status}.`);
    const { error } = await supabaseAdmin.from("qrx_media_cost_alerts").update({ status: "sent", sent_at: new Date().toISOString(), last_error: null }).eq("period_start", period_start).eq("threshold", threshold).eq("claimed_at", claimed_at);
    if (error) throw new Error("E-Mail versandt, Status konnte nicht gespeichert werden.");
    return { sent: true, threshold };
  } catch (error) {
    await supabaseAdmin.from("qrx_media_cost_alerts").update({ status: "failed", last_error: error instanceof Error ? error.message : "Versand fehlgeschlagen" }).eq("period_start", period_start).eq("threshold", threshold).eq("claimed_at", claimed_at);
    throw error;
  }
}
