import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    return (
      username === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    );
  } catch {
    return false;
  }
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const url = new URL(req.url);
    const userId = String(url.searchParams.get("userId") || "").trim();

    if (!userId) {
      return Response.json({ error: "User-ID fehlt." }, { status: 400 });
    }

    const { data: creditRow, error: creditError } = await supabaseAdmin
      .from("qrx_credits")
      .select("user_id, credits, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (creditError) {
      return Response.json(
        {
          error: "Aktueller Credit-Stand konnte nicht geladen werden.",
          details: creditError.message,
        },
        { status: 500 }
      );
    }

    const { data: purchases, error: purchasesError } = await supabaseAdmin
      .from("qrx_credit_purchases")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (purchasesError) {
      return Response.json(
        {
          error: "Kaufhistorie konnte nicht geladen werden.",
          details: purchasesError.message,
        },
        { status: 500 }
      );
    }

    const { data: actionLog, error: logError } = await supabaseAdmin
      .from("admin_action_log")
      .select("id, action_type, amount, note, qrx_id, created_at")
      .eq("target_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (logError) {
      return Response.json(
        {
          error: "Credit-Log konnte nicht geladen werden.",
          details: logError.message,
        },
        { status: 500 }
      );
    }

    let invoices: unknown[] = [];
    let invoiceLoadWarning: string | null = null;

    const invoiceByUser = await supabaseAdmin
      .from("qrx_invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (invoiceByUser.error) {
      invoiceLoadWarning = invoiceByUser.error.message;
    } else {
      invoices = invoiceByUser.data ?? [];
    }

    const purchaseRows = Array.isArray(purchases) ? purchases : [];

    const totalPurchasedCredits = purchaseRows.reduce((sum, row: Record<string, unknown>) => {
      const status = String(row.status || "").toLowerCase();
      if (status && !["paid", "succeeded", "completed"].includes(status)) return sum;
      return sum + toNumber(row.credits);
    }, 0);

    const totalPaidCents = purchaseRows.reduce((sum, row: Record<string, unknown>) => {
      const status = String(row.status || "").toLowerCase();
      if (status && !["paid", "succeeded", "completed"].includes(status)) return sum;
      return sum + toNumber(row.amount_cents);
    }, 0);

    const totalRefundedCents = purchaseRows.reduce((sum, row: Record<string, unknown>) => {
      return sum + toNumber(row.refunded_cents) + toNumber(row.refunded_amount_cents);
    }, 0);

    return Response.json({
      ok: true,
      userId,
      currentCredits:
        typeof creditRow?.credits === "number" ? creditRow.credits : null,
      creditUpdatedAt: creditRow?.updated_at ?? null,
      purchases: purchaseRows,
      invoices,
      invoiceLoadWarning,
      history: actionLog ?? [],
      summary: {
        purchaseCount: purchaseRows.length,
        invoiceCount: Array.isArray(invoices) ? invoices.length : 0,
        totalPurchasedCredits,
        totalPaidCents,
        totalRefundedCents,
      },
    });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
