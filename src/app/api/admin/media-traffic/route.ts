import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isMediaCostAdmin } from "@/lib/media-cost-auth";
import { readCostReport } from "@/lib/cloudflare-cost-monitor";
import { validateSettings } from "@/lib/media-cost-model";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
function denied() { return json({ error: "Admin-Anmeldung erforderlich." }, 401); }
function envelope(report: Awaited<ReturnType<typeof readCostReport>>) {
 return { ok: true, cloudflare: report, summary: {
  totalBytes: null, todayBytes: report.metrics.bandwidth?.todayBytes ?? null,
  weekBytes: report.metrics.bandwidth?.weekBytes ?? null, monthBytes: report.metrics.bandwidth?.monthBytes ?? null,
  estimatedTrafficCostCents: null, estimatedStorageCostCents: null, estimatedTotalCostCents: null,
 }, topQrx: [], topMedia: [], topQrxWeek: [], topMediaWeek: [], topCostQrx: [], topCostMedia: [], topVariants: [], recommendations: [], activeWarnings: [], updatedAt: report.metrics.updatedAt };
}
export async function GET(req: Request) {
 if (!isMediaCostAdmin(req)) return denied();
 try { return json(envelope(await readCostReport())); }
 catch (error) { return json({ error: error instanceof Error ? error.message : "Kostenüberwachung nicht verfügbar." }, 503); }
}
export async function POST(req: Request) {
 if (!isMediaCostAdmin(req)) return denied();
 const origin = req.headers.get("origin");
 if (origin && origin !== new URL(req.url).origin) return json({ error: "Ungültiger Ursprung." }, 403);
 if (!req.headers.get("content-type")?.includes("application/json")) return json({ error: "JSON erforderlich." }, 415);
 let body;
 try { body = await req.json(); } catch { return json({ error: "Ungültiges JSON." }, 400); }
 if (body?.action === "save") {
  let settings;
  try { settings = validateSettings(body.settings); } catch(error) { return json({ error: error instanceof Error ? error.message : "Ungültige Einstellungen." }, 400); }
  const { error } = await supabaseAdmin.from("qrx_media_cost_settings").update({ ...settings, updated_at: new Date().toISOString() }).eq("id", 1);
  if (error) return json({ error: "Einstellungen konnten nicht gespeichert werden." }, 503);
 } else if (body?.action !== "refresh") return json({ error: "Unbekannte Aktion." }, 400);
 try { return json(envelope(await readCostReport(body.action === "refresh"))); }
 catch(error) { return json({ error: error instanceof Error ? error.message : "Kostenüberwachung nicht verfügbar." }, 503); }
}
