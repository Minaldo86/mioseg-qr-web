import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InvoiceRow = {
  id: string;
  invoice_number?: string | null;
  invoice_type?: string | null;
  user_id?: string | null;
  purchase_id?: string | null;
  stripe_payment_intent_id?: string | null;
  payment_provider?: string | null;
  provider_transaction_id?: string | null;
  amount_cents?: number | null;
  total_cents?: number | null;
  gross_amount_cents?: number | null;
  net_cents?: number | null;
  net_amount_cents?: number | null;
  tax_cents?: number | null;
  tax_amount_cents?: number | null;
  tax_rate?: number | null;
  currency?: string | null;
  billing_email?: string | null;
  billing_country_code?: string | null;
  customer_country?: string | null;
  customer_type?: string | null;
  reverse_charge?: boolean | null;
  tax_behavior?: string | null;
  pdf_path?: string | null;
  storage_path?: string | null;
  created_at?: string | null;
  sent_at?: string | null;
  refunded_at?: string | null;
  stripe_refund_id?: string | null;
  original_invoice_number?: string | null;
  credit_note_reason?: string | null;
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

function formatEuroCents(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function normalizeProvider(value: unknown) {
  const provider = typeof value === "string" && value.trim() ? value.trim().toLowerCase() : "stripe";
  if (provider === "apple") return "Apple App Store";
  if (provider === "google") return "Google Play";
  if (provider === "stripe") return "Stripe Web";
  return provider;
}

function dateEndInclusive(date: string) {
  return `${date}T23:59:59.999Z`;
}

function csvEscape(value: unknown) {
  const str = String(value ?? "");
  return `"${str.replaceAll('"', '""')}"`;
}

function buildCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return "Keine Daten\n";
  }

  const headers = Object.keys(rows[0]);

  return [
    headers.map(csvEscape).join(";"),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(";")),
  ].join("\n");
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const url = new URL(req.url);
    const from =
      url.searchParams.get("from") ||
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const to = url.searchParams.get("to") || new Date().toISOString().slice(0, 10);
    const provider = url.searchParams.get("provider") || "all";

    let query = supabaseAdmin
      .from("qrx_invoices")
      .select("*")
      .gte("created_at", `${from}T00:00:00.000Z`)
      .lte("created_at", dateEndInclusive(to))
      .order("created_at", { ascending: true })
      .limit(5000);

    if (provider !== "all") {
      query = query.eq("payment_provider", provider);
    }

    const { data, error } = await query;

    if (error) {
      return Response.json(
        { error: "Rechnungen konnten nicht exportiert werden.", details: error.message },
        { status: 500 }
      );
    }

    const invoices = (data ?? []) as InvoiceRow[];

    const rows = invoices.map((invoice) => {
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

      const type = invoice.invoice_type === "credit_note" || invoice.invoice_number?.startsWith("CN-")
        ? "Gutschrift"
        : "Rechnung";

      return {
        "Typ": type,
        "Rechnungsnummer": invoice.invoice_number || invoice.id,
        "Datum": invoice.created_at ? new Date(invoice.created_at).toLocaleString("de-DE") : "",
        "Zahlungsquelle": normalizeProvider(invoice.payment_provider),
        "Währung": invoice.currency || "EUR",
        "Brutto EUR": formatEuroCents(gross),
        "Netto EUR": formatEuroCents(net),
        "MwSt EUR": formatEuroCents(tax),
        "MwSt Satz": typeof invoice.tax_rate === "number" ? String(invoice.tax_rate).replace(".", ",") : "",
        "Reverse Charge": invoice.reverse_charge ? "ja" : "nein",
        "Steuerverhalten": invoice.tax_behavior || "",
        "Kundenland": invoice.billing_country_code || invoice.customer_country || "",
        "Kundentyp": invoice.customer_type || "",
        "E-Mail": invoice.billing_email || "",
        "User ID": invoice.user_id || "",
        "Purchase ID": invoice.purchase_id || "",
        "Stripe PaymentIntent": invoice.stripe_payment_intent_id || "",
        "Provider Transaction ID": invoice.provider_transaction_id || "",
        "Originalrechnung": invoice.original_invoice_number || "",
        "Gutschrift Grund": invoice.credit_note_reason || "",
        "PDF Pfad": invoice.pdf_path || invoice.storage_path || "",
      };
    });

    const csv = buildCsv(rows);
    const filename = `mioseg-steuer-export-${from}-bis-${to}.csv`;

    return new Response(`\ufeff${csv}`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
