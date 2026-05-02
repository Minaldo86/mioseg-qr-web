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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return;
  }

  const sessionId = session.id;

  if (await wasSessionAlreadyProcessed(sessionId)) {
    return;
  }

  const userId = String(session.metadata?.userId || "").trim();
  const packId = String(session.metadata?.packId || "").trim();
  const credits = Number(session.metadata?.credits || 0);
  const amountCents = Number(session.metadata?.amountCents || 0);

  if (!userId) {
    throw new Error(`Stripe Session ${sessionId}: userId fehlt.`);
  }

  if (!Number.isInteger(credits) || credits <= 0) {
    throw new Error(`Stripe Session ${sessionId}: credits ungültig.`);
  }

  const { data: newCredits, error } = await supabaseAdmin.rpc("add_credits_admin", {
    p_user_id: userId,
    p_amount: credits,
  });

  if (error) {
    throw new Error(`Credits konnten nicht gutgeschrieben werden: ${error.message}`);
  }

  await writeAdminLog({
    userId,
    amount: credits,
    note: `Stripe Test/Web-Kauf erfolgreich. Session: ${sessionId}, Paket: ${packId}, Betrag: ${amountCents} Cent, neuer Stand: ${newCredits}`,
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
