import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY fehlt.");
  }

  return new Stripe(key);
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string" ? session.payment_intent : null;
}

function getBillingDetails(session: Stripe.Checkout.Session) {
  const address = session.customer_details?.address;

  return {
    customerName: session.customer_details?.name || "Kunde",
    customerEmail: session.customer_details?.email || session.customer_email || null,
    customerStreet: [address?.line1, address?.line2].filter(Boolean).join(" "),
    customerPostalCode: address?.postal_code || "",
    customerCity: address?.city || "",
    customerCountry: address?.country || "",
  };
}

async function wasSessionAlreadyProcessed(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("admin_action_log")
    .select("id")
    .ilike("note", `%${sessionId}%`)
    .limit(1);

  if (error) {
    console.warn("Stripe idempotency check failed:", error.message);
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}

async function writeAdminLog(input: {
  userId: string;
  amount: number;
  note: string;
}) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: "credits_purchased_stripe",
    target_user_id: input.userId,
    amount: input.amount,
    note: input.note,
  });

  if (error) {
    console.warn("admin_action_log insert failed:", error.message);
  }
}

async function getOrCreatePurchase(input: {
  userId: string;
  packId: string;
  credits: number;
  amountCents: number;
  currency: string;
  sessionId: string;
  paymentIntentId: string | null;
}) {
  if (input.paymentIntentId) {
    const { data, error } = await supabaseAdmin
      .from("qrx_credit_purchases")
      .select("id,status")
      .eq("stripe_payment_intent_id", input.paymentIntentId)
      .maybeSingle();

    if (error) {
      console.warn("qrx_credit_purchases lookup by payment intent failed:", error.message);
    }

    if (data) return data as { id: string; status: string | null };
  }

  const { data: bySession, error: sessionLookupError } = await supabaseAdmin
    .from("qrx_credit_purchases")
    .select("id,status")
    .eq("provider_transaction_id", input.sessionId)
    .maybeSingle();

  if (sessionLookupError) {
    console.warn("qrx_credit_purchases lookup by session failed:", sessionLookupError.message);
  }

  if (bySession) return bySession as { id: string; status: string | null };

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("qrx_credit_purchases")
    .insert({
      user_id: input.userId,
      pack_id: input.packId,
      credits: input.credits,
      amount_cents: input.amountCents,
      stripe_payment_intent_id: input.paymentIntentId,
      payment_provider: "stripe",
      provider_transaction_id: input.sessionId,
      currency: input.currency,
      status: "created",
    })
    .select("id,status")
    .single();

  if (insertError) {
    throw new Error(`qrx_credit_purchases insert failed: ${insertError.message}`);
  }

  return inserted as { id: string; status: string | null };
}

async function createInvoiceRow(input: {
  userId: string;
  purchaseId: string;
  sessionId: string;
  paymentIntentId: string | null;
  amountCents: number;
  netCents: number;
  taxCents: number;
  currency: string;
  billingEmail: string | null;
  billingDetails: ReturnType<typeof getBillingDetails>;
}) {
  if (input.paymentIntentId) {
    const { data: existingInvoice, error: existingError } = await supabaseAdmin
      .from("qrx_invoices")
      .select("id")
      .eq("stripe_payment_intent_id", input.paymentIntentId)
      .eq("invoice_type", "invoice")
      .maybeSingle();

    if (existingError) {
      console.warn("qrx_invoices lookup failed:", existingError.message);
    }

    if (existingInvoice) return;
  }

  const invoiceNumber = `WEB-${Date.now()}`;

  const { error: invoiceError } = await supabaseAdmin
    .from("qrx_invoices")
    .insert({
      invoice_number: invoiceNumber,
      user_id: input.userId,
      purchase_id: input.purchaseId,
      stripe_payment_intent_id: input.paymentIntentId,
      payment_provider: "stripe",
      provider_transaction_id: input.sessionId,

      amount_cents: input.amountCents,
      net_cents: input.netCents,
      tax_cents: input.taxCents,
      net_amount_cents: input.netCents,
      tax_amount_cents: input.taxCents,
      gross_amount_cents: input.amountCents,
      currency: input.currency,

      billing_email: input.billingEmail,
      billing_details: {
        customerName: input.billingDetails.customerName,
        customerEmail: input.billingDetails.customerEmail,
        customerStreet: input.billingDetails.customerStreet,
        customerPostalCode: input.billingDetails.customerPostalCode,
        customerCity: input.billingDetails.customerCity,
        customerCountry: input.billingDetails.customerCountry,
      },

      customer_country: input.billingDetails.customerCountry || null,
      invoice_type: "invoice",
      status: "created",
      storage_bucket: "invoices",
    });

  if (invoiceError) {
    console.warn("qrx_invoices insert failed:", invoiceError.message);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return;
  }

  const sessionId = session.id;

  if (await wasSessionAlreadyProcessed(sessionId)) {
    return;
  }

  const userId = clean(session.metadata?.userId);
  const packId = clean(session.metadata?.packId);
  const credits = Number(session.metadata?.credits || 0);
  const amountCents = Number(session.metadata?.amountCents || session.amount_total || 0);
  const paymentIntentId = getPaymentIntentId(session);
  const billingDetails = getBillingDetails(session);
  const currency = (session.currency || "eur").toUpperCase();

  if (!userId) {
    throw new Error(`Stripe Session ${sessionId}: userId fehlt.`);
  }

  if (!packId) {
    throw new Error(`Stripe Session ${sessionId}: packId fehlt.`);
  }

  if (!Number.isInteger(credits) || credits <= 0) {
    throw new Error(`Stripe Session ${sessionId}: credits ungültig.`);
  }

  const taxCents =
    typeof session.total_details?.amount_tax === "number"
      ? session.total_details.amount_tax
      : 0;

  const netCents = Math.max(0, amountCents - taxCents);

  const purchase = await getOrCreatePurchase({
    userId,
    packId,
    credits,
    amountCents,
    currency,
    sessionId,
    paymentIntentId,
  });

  if (purchase.status !== "succeeded") {
    const { data: newCredits, error } = await supabaseAdmin.rpc("add_credits_admin", {
      p_user_id: userId,
      p_amount: credits,
    });

    if (error) {
      throw new Error(`Credits konnten nicht gutgeschrieben werden: ${error.message}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from("qrx_credit_purchases")
      .update({
        status: "succeeded",
        stripe_payment_intent_id: paymentIntentId,
        provider_transaction_id: sessionId,
        payment_provider: "stripe",
      })
      .eq("id", purchase.id);

    if (updateError) {
      throw new Error(`qrx_credit_purchases update failed: ${updateError.message}`);
    }

    await writeAdminLog({
      userId,
      amount: credits,
      note: `Stripe Web-Kauf erfolgreich. Session: ${sessionId}, Paket: ${packId}, Betrag: ${amountCents} Cent, neuer Stand: ${newCredits}`,
    });
  }

  await createInvoiceRow({
    userId,
    purchaseId: purchase.id,
    sessionId,
    paymentIntentId,
    amountCents,
    netCents,
    taxCents,
    currency,
    billingEmail: billingDetails.customerEmail,
    billingDetails,
  });
}

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return Response.json(
        { error: "STRIPE_WEBHOOK_SECRET fehlt." },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return Response.json({ error: "Stripe Signatur fehlt." }, { status: 400 });
    }

    const rawBody = await req.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object);
    }

    return Response.json({ received: true });
  } catch (e: unknown) {
    console.error("stripe webhook error:", e);

    return Response.json(
      { error: e instanceof Error ? e.message : "Webhook error" },
      { status: 400 }
    );
  }
}
