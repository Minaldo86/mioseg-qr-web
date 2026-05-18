import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InvoiceRow = {
  id: string;
  invoice_number?: string | null;
  user_id?: string | null;
  purchase_id?: string | null;
  stripe_payment_intent_id?: string | null;
  payment_provider?: string | null;
  total_cents?: number | null;
  amount_cents?: number | null;
  gross_amount_cents?: number | null;
  tax_cents?: number | null;
  tax_amount_cents?: number | null;
  net_cents?: number | null;
  net_amount_cents?: number | null;
  currency?: string | null;
  billing_email?: string | null;
  billing_country_code?: string | null;
  pdf_path?: string | null;
  storage_path?: string | null;
  created_at?: string | null;
  sent_at?: string | null;
};

type PurchaseRow = {
  id: string;
  stripe_payment_intent_id?: string | null;
  refunded_cents?: number | null;
  refunded_amount_cents?: number | null;
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

function normalizeProvider(value: unknown) {
  const provider = typeof value === "string" && value.trim() ? value.trim().toLowerCase() : "stripe";
  if (provider === "apple" || provider === "google" || provider === "stripe") return provider;
  return provider;
}

function dateEndInclusive(date: string) {
  return `${date}T23:59:59.999Z`;
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const url = new URL(req.url);
    const from = url.searchParams.get("from") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const to = url.searchParams.get("to") || new Date().toISOString().slice(0, 10);
    const provider = url.searchParams.get("provider") || "all";

    const warnings: string[] = [];

    let invoiceQuery = supabaseAdmin
      .from("qrx_invoices")
      .select("*")
      .gte("created_at", `${from}T00:00:00.000Z`)
      .lte("created_at", dateEndInclusive(to))
      .order("created_at", { ascending: false })
      .limit(1000);

    if (provider !== "all") {
      invoiceQuery = invoiceQuery.eq("payment_provider", provider);
    }

    const { data: invoicesRaw, error: invoiceError } = await invoiceQuery;

    if (invoiceError) {
      return Response.json(
        {
          error: "Rechnungen konnten nicht geladen werden.",
          details: invoiceError.message,
          hint: "Prüfe, ob qrx_invoices existiert und die neuen Finance-Spalten vorhanden sind.",
        },
        { status: 500 }
      );
    }

    const invoices = (invoicesRaw ?? []) as InvoiceRow[];

    const { data: purchasesRaw, error: purchaseError } = await supabaseAdmin
      .from("qrx_credit_purchases")
      .select("id, stripe_payment_intent_id, refunded_cents, refunded_amount_cents, created_at")
      .gte("created_at", `${from}T00:00:00.000Z`)
      .lte("created_at", dateEndInclusive(to))
      .limit(1000);

    if (purchaseError) {
      warnings.push(`Kaufhistorie konnte nicht vollständig geladen werden: ${purchaseError.message}`);
    }

    const purchases = (purchasesRaw ?? []) as PurchaseRow[];

    const refundsByPaymentIntent = new Map<string, number>();
    const refundsByPurchaseId = new Map<string, number>();

    purchases.forEach((purchase) => {
      const refunded = toCents(purchase.refunded_cents) + toCents(purchase.refunded_amount_cents);

      if (purchase.id) refundsByPurchaseId.set(purchase.id, refunded);
      if (purchase.stripe_payment_intent_id) refundsByPaymentIntent.set(purchase.stripe_payment_intent_id, refunded);
    });

    const providerMap = new Map<string, {
      provider: string;
      invoiceCount: number;
      grossCents: number;
      netCents: number;
      taxCents: number;
      refundedCents: number;
    }>();

    function ensureProvider(providerName: string) {
      const key = normalizeProvider(providerName);
      const existing = providerMap.get(key);
      if (existing) return existing;

      const created = {
        provider: key,
        invoiceCount: 0,
        grossCents: 0,
        netCents: 0,
        taxCents: 0,
        refundedCents: 0,
      };

      providerMap.set(key, created);
      return created;
    }

    ["stripe", "apple", "google"].forEach(ensureProvider);

    invoices.forEach((invoice) => {
      const item = ensureProvider(normalizeProvider(invoice.payment_provider));
      const gross =
        toCents(invoice.total_cents) ||
        toCents(invoice.amount_cents) ||
        toCents(invoice.gross_amount_cents);

      const net =
        toCents(invoice.net_cents) ||
        toCents(invoice.net_amount_cents);

      const tax =
        toCents(invoice.tax_cents) ||
        toCents(invoice.tax_amount_cents);
      const refunded =
        (invoice.purchase_id ? refundsByPurchaseId.get(invoice.purchase_id) ?? 0 : 0) ||
        (invoice.stripe_payment_intent_id ? refundsByPaymentIntent.get(invoice.stripe_payment_intent_id) ?? 0 : 0);

      item.invoiceCount += 1;
      item.grossCents += gross;
      item.netCents += net;
      item.taxCents += tax;
      item.refundedCents += refunded;
    });

    const providerSummary = Array.from(providerMap.values());
    const totals = providerSummary.reduce(
      (acc, item) => {
        acc.invoiceCount += item.invoiceCount;
        acc.grossCents += item.grossCents;
        acc.netCents += item.netCents;
        acc.taxCents += item.taxCents;
        acc.refundedCents += item.refundedCents;
        return acc;
      },
      { invoiceCount: 0, grossCents: 0, netCents: 0, taxCents: 0, refundedCents: 0 }
    );

    return Response.json({
      ok: true,
      from,
      to,
      invoices: invoices.map((invoice) => ({
        ...invoice,
        total_cents:
          toCents(invoice.total_cents) ||
          toCents(invoice.amount_cents) ||
          toCents(invoice.gross_amount_cents),
        net_cents:
          toCents(invoice.net_cents) ||
          toCents(invoice.net_amount_cents),
        tax_cents:
          toCents(invoice.tax_cents) ||
          toCents(invoice.tax_amount_cents),
      })),
      providerSummary,
      totals,
      warnings,
    });
  } catch (error: unknown) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
