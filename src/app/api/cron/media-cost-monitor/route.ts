import { NextResponse } from "next/server";
import { isMediaCostCron } from "@/lib/media-cost-auth";
import { readCostReport, sendCostAlert } from "@/lib/cloudflare-cost-monitor";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(req: Request) {
 if (!isMediaCostCron(req)) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
 try {
  const report = await readCostReport(true);
  const alert = await sendCostAlert(report);
  return NextResponse.json({ ok: true, alert, metricsErrors: report.metrics.errors, updatedAt: report.metrics.updatedAt }, { headers: { "Cache-Control": "no-store" } });
 } catch(error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Kostenprüfung fehlgeschlagen." }, { status: 503 }); }
}
