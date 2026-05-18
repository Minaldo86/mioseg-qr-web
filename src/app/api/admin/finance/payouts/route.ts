import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PayoutBatchRow = {
  id: string;
  payment_provider: string;
  provider_payout_id: string | null;
  payout_reference: string | null;
  period_start: string | null;
  period_end: string | null;
  paid_at: string | null;
  currency: string | null;
  gross_cents: number | null;
  fee_cents: number | null;
  refund_cents: number | null;
  net_payout_cents: number | null;
  invoice_count: number | null;
  purchase_count: number | null;
  refund_count: number | null;
  status: string | null;
  note: string | null;
  created_at: string | null;
};

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function isAdminRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const [scheme, encoded] = authHeader.split(" ");
  if (scheme !== "Basic" || !encoded) return false;

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return false;

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    return username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

function toCents(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function dateEndInclusive(date: string) {
  return `${date}T23:59:59.999Z`;
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) return unauthorized();

    const url = new URL(req.url);
    const from =
      url.searchParams.get("from") ||
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const to = url.searchParams.get("to") || new Date().toISOString().slice(0, 10);
    const provider = url.searchParams.get("provider") || "all";

    let query = supabaseAdmin
      .from("qrx_payout_batches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (provider !== "all") {
      query = query.eq("payment_provider", provider);
    }

    query = query.or(
      `and(period_start.gte.${from},period_start.lte.${to}),and(paid_at.gte.${from}T00:00:00.000Z,paid_at.lte.${dateEndInclusive(to)}),and(created_at.gte.${from}T00:00:00.000Z,created_at.lte.${dateEndInclusive(to)})`
    );

    const { data, error } = await query;

    if (error) {
      return Response.json(
        { error: "Payout-Batches konnten nicht geladen werden.", details: error.message },
        { status: 500 }
      );
    }

    const payouts = (data ?? []) as PayoutBatchRow[];

    const totals = payouts.reduce(
      (acc, payout) => {
        acc.batchCount += 1;
        acc.grossCents += toCents(payout.gross_cents);
        acc.feeCents += toCents(payout.fee_cents);
        acc.refundCents += toCents(payout.refund_cents);
        acc.netPayoutCents += toCents(payout.net_payout_cents);
        acc.invoiceCount += toCents(payout.invoice_count);
        acc.purchaseCount += toCents(payout.purchase_count);
        acc.refundCount += toCents(payout.refund_count);
        return acc;
      },
      {
        batchCount: 0,
        grossCents: 0,
        feeCents: 0,
        refundCents: 0,
        netPayoutCents: 0,
        invoiceCount: 0,
        purchaseCount: 0,
        refundCount: 0,
      }
    );

    return Response.json({
      ok: true,
      from,
      to,
      provider,
      payouts,
      totals,
    });
  } catch (error: unknown) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
