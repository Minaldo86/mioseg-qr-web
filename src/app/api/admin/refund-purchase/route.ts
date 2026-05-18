import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PurchaseRow = {
  id: string;
  user_id: string;
  credits: number | null;
  amount_cents: number | null;
  currency: string | null;
  status: string | null;
  stripe_payment_intent_id: string | null;
  refunded_cents?: number | null;
  refunded_amount_cents?: number | null;
  refunded_credits?: number | null;
  refunded_at?: string | null;
  stripe_refund_id?: string | null;
  updated_at?: string | null;
};

type CreditRow = {
  credits: number | null;
};

type StripeRefundLike = {
  id?: string;
  amount?: number;
  status?: string | null;
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

    return (
      username === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    );
  } catch {
    return false;
  }
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY fehlt.");
  }

  return new Stripe(key);
}

function isPaidStatus(status: string | null | undefined) {
  const value = String(status || "").trim().toLowerCase();
  return value === "paid" || value === "succeeded" || value === "completed";
}

function isAlreadyRefunded(purchase: PurchaseRow) {
  const status = String(purchase.status || "").trim().toLowerCase();
  return Boolean(
    status === "refunded" ||
      purchase.stripe_refund_id ||
      purchase.refunded_at ||
      (typeof purchase.refunded_cents === "number" && purchase.refunded_cents > 0) ||
      (typeof purchase.refunded_amount_cents === "number" && purchase.refunded_amount_cents > 0)
  );
}

function stripeErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const maybe = error as { code?: unknown; raw?: { code?: unknown } };
  return String(maybe.code || maybe.raw?.code || "");
}

function stripeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== "object") return "Stripe error";
  const maybe = error as { message?: unknown; raw?: { message?: unknown } };
  return String(maybe.message || maybe.raw?.message || "Stripe error");
}

async function writeAdminLog(input: {
  actionType?: string;
  userId: string;
  amount: number | null;
  note: string;
}) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: input.actionType || "credit_purchase_refund_note",
    target_user_id: input.userId,
    amount: input.amount,
    note: input.note,
  });

  if (error) {
    console.warn("admin_action_log insert failed:", error.message);
  }
}

async function loadPurchase(purchaseId: string) {
  const { data, error } = await supabaseAdmin
    .from("qrx_credit_purchases")
    .select("*")
    .eq("id", purchaseId)
    .maybeSingle<PurchaseRow>();

  if (error) {
    throw new Error(`Kauf konnte nicht geladen werden: ${error.message}`);
  }

  return data;
}

async function loadCurrentCredits(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("qrx_credits")
    .select("credits")
    .eq("user_id", userId)
    .maybeSingle<CreditRow>();

  if (error) {
    throw new Error(`Credit-Stand konnte nicht geladen werden: ${error.message}`);
  }

  return typeof data?.credits === "number" ? data.credits : 0;
}

async function markPurchaseRefunded(input: {
  purchase: PurchaseRow;
  refundId: string | null;
  amountToRefund: number;
  creditsToRevoke: number;
}) {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("qrx_credit_purchases")
    .update({
      status: "refunded",
      refunded_cents: input.amountToRefund,
      refunded_credits: input.creditsToRevoke,
      refunded_at: nowIso,
      stripe_refund_id: input.refundId,
      updated_at: nowIso,
    })
    .eq("id", input.purchase.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Kaufstatus konnte nicht aktualisiert werden: ${error.message}`);
  }

  return data;
}

async function subtractCredits(input: {
  userId: string;
  creditsToRevoke: number;
}) {
  const currentCredits = await loadCurrentCredits(input.userId);

  if (currentCredits < input.creditsToRevoke) {
    throw new Error(
      `Erstattung blockiert: Nutzer hat nur ${currentCredits} Credits, es müssten aber ${input.creditsToRevoke} Credits entfernt werden.`
    );
  }

  const nextCredits = currentCredits - input.creditsToRevoke;

  const { error } = await supabaseAdmin
    .from("qrx_credits")
    .update({
      credits: nextCredits,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", input.userId);

  if (error) {
    throw new Error(`Credits konnten nicht abgezogen werden: ${error.message}`);
  }

  return nextCredits;
}

async function findExistingRefund(stripe: Stripe, paymentIntentId: string) {
  const refunds = await stripe.refunds.list({
    payment_intent: paymentIntentId,
    limit: 10,
  });

  const first = refunds.data.find((refund) => {
    return refund.status !== "failed" && refund.status !== "canceled";
  });

  if (!first) return null;

  return {
    id: first.id,
    amount: first.amount,
    status: first.status,
  } satisfies StripeRefundLike;
}

export async function POST(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const body = await req.json();
    const purchaseId = String(body?.purchaseId || "").trim();
    const note =
      typeof body?.note === "string" && body.note.trim().length > 0
        ? body.note.trim()
        : "Admin-Erstattung";

    if (!purchaseId) {
      return Response.json({ error: "purchaseId fehlt." }, { status: 400 });
    }

    const purchase = await loadPurchase(purchaseId);

    if (!purchase) {
      return Response.json({ error: "Kauf wurde nicht gefunden." }, { status: 404 });
    }

    if (isAlreadyRefunded(purchase)) {
      return Response.json({
        ok: true,
        alreadyRefunded: true,
        purchase,
        refundId: purchase.stripe_refund_id ?? null,
        revokedCredits: purchase.refunded_credits ?? purchase.credits ?? 0,
        refundedCents:
          purchase.refunded_cents ?? purchase.refunded_amount_cents ?? purchase.amount_cents ?? 0,
        message: "Dieser Kauf war bereits als erstattet markiert.",
      });
    }

    if (!isPaidStatus(purchase.status)) {
      return Response.json(
        { error: `Dieser Kauf ist nicht erstattbar. Status: ${purchase.status || "unbekannt"}` },
        { status: 400 }
      );
    }

    const creditsToRevoke = typeof purchase.credits === "number" ? purchase.credits : 0;
    const amountToRefund =
      typeof purchase.amount_cents === "number" ? purchase.amount_cents : 0;

    if (!purchase.stripe_payment_intent_id) {
      return Response.json(
        { error: "Für diesen Kauf fehlt die Stripe PaymentIntent-ID." },
        { status: 400 }
      );
    }

    if (creditsToRevoke <= 0 || amountToRefund <= 0) {
      return Response.json(
        { error: "Kauf hat ungültige Credits oder Betrag." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    let refundId: string | null = null;
    let refundAmount = amountToRefund;
    let stripeRefundWasAlreadyPresent = false;

    try {
      const refund = await stripe.refunds.create({
        payment_intent: purchase.stripe_payment_intent_id,
        amount: amountToRefund,
        metadata: {
          purchase_id: purchase.id,
          user_id: purchase.user_id,
          credits_revoked: String(creditsToRevoke),
          source: "admin_refund",
        },
      });

      refundId = refund.id;
      refundAmount = refund.amount;
    } catch (error: unknown) {
      const code = stripeErrorCode(error);

      if (code !== "charge_already_refunded") {
        throw new Error(stripeErrorMessage(error));
      }

      const existingRefund = await findExistingRefund(stripe, purchase.stripe_payment_intent_id);

      if (!existingRefund?.id) {
        await writeAdminLog({
          actionType: "credit_purchase_refund_requires_manual_check",
          userId: purchase.user_id,
          amount: null,
          note: `Stripe meldet charge_already_refunded, aber die Refund-ID konnte nicht automatisch gefunden werden. Kauf: ${purchase.id}. PaymentIntent: ${purchase.stripe_payment_intent_id}`,
        });

        return Response.json(
          {
            error:
              "Stripe meldet, dass die Zahlung bereits erstattet wurde. Die Refund-ID konnte aber nicht automatisch gefunden werden. Bitte Kauf manuell prüfen.",
          },
          { status: 409 }
        );
      }

      refundId = existingRefund.id;
      refundAmount = existingRefund.amount ?? amountToRefund;
      stripeRefundWasAlreadyPresent = true;
    }

    const currentCredits = await loadCurrentCredits(purchase.user_id);

    if (currentCredits < creditsToRevoke) {
      await writeAdminLog({
        actionType: "credit_purchase_refund_credit_subtract_blocked",
        userId: purchase.user_id,
        amount: null,
        note: `Stripe-Erstattung ${refundId} vorhanden, aber Credits wurden nicht abgezogen. Nutzer hat nur ${currentCredits}, benötigt wären ${creditsToRevoke}. Kauf: ${purchase.id}`,
      });

      return Response.json(
        {
          error: `Stripe-Erstattung ist vorhanden, aber Credits wurden nicht abgezogen: Nutzer hat nur ${currentCredits} Credits, benötigt wären ${creditsToRevoke}.`,
          refundId,
        },
        { status: 409 }
      );
    }

    const newCredits = await subtractCredits({
      userId: purchase.user_id,
      creditsToRevoke,
    });

    const updatedPurchase = await markPurchaseRefunded({
      purchase,
      refundId,
      amountToRefund: refundAmount,
      creditsToRevoke,
    });

    await writeAdminLog({
      actionType: stripeRefundWasAlreadyPresent
        ? "credit_purchase_refund_synced"
        : "credit_purchase_refunded",
      userId: purchase.user_id,
      amount: -creditsToRevoke,
      note: `${note}. ${
        stripeRefundWasAlreadyPresent ? "Bereits vorhandene Stripe-Erstattung synchronisiert" : "Stripe-Erstattung durchgeführt"
      }: ${refundId}. Kauf: ${purchase.id}. Betrag: ${refundAmount} Cent. Credits entfernt: ${creditsToRevoke}. Neuer Stand: ${newCredits}.`,
    });

    return Response.json({
      ok: true,
      alreadyRefunded: stripeRefundWasAlreadyPresent,
      refundId,
      purchase: updatedPurchase,
      revokedCredits: creditsToRevoke,
      refundedCents: refundAmount,
      newCredits,
    });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
