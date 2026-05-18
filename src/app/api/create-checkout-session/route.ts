import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PricingConfig = {
  launch_discount_enabled?: boolean | null;
  currency?: string | null;
};

type PricingPack = {
  id: string;
  credits: number;
  is_active: boolean | null;
  price_cents_launch: number | null;
  price_cents_regular: number | null;
  badge: string | null;
  sort_order: number | null;
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY fehlt.");
  }

  return new Stripe(key);
}

function getOrigin(req: Request) {
  const origin = req.headers.get("origin");

  if (origin) return origin;

  const host = req.headers.get("host");

  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function asPricingConfig(value: unknown): PricingConfig | null {
  if (!value || typeof value !== "object") return null;
  return value as PricingConfig;
}

function asPricingPacks(value: unknown): PricingPack[] {
  if (!Array.isArray(value)) return [];
  return value as PricingPack[];
}

async function loadPricing() {
  const { data: configData, error: configError } = await supabaseAdmin
    .from("qrx_pricing_config")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (configError) {
    throw new Error(`Pricing Config konnte nicht geladen werden: ${configError.message}`);
  }

  const { data: packsData, error: packsError } = await supabaseAdmin
    .from("qrx_pricing_packs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (packsError) {
    throw new Error(`Pricing Packs konnten nicht geladen werden: ${packsError.message}`);
  }

  return {
    config: asPricingConfig(configData),
    packs: asPricingPacks(packsData),
  };
}

export async function GET() {
  try {
    const { config, packs } = await loadPricing();

    return Response.json({
      ok: true,
      pricingConfig: config,
      pricingPacks: packs,
    });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = String(body?.userId || "").trim();
    const packId = String(body?.packId || "").trim();

    if (!userId) {
      return Response.json({ error: "User-ID fehlt." }, { status: 400 });
    }

    if (!packId) {
      return Response.json({ error: "Paket-ID fehlt." }, { status: 400 });
    }

    const { config, packs } = await loadPricing();
    const pack = packs.find((item) => item.id === packId);

    if (!pack) {
      return Response.json(
        { error: "Credit-Paket wurde nicht gefunden oder ist nicht aktiv." },
        { status: 404 }
      );
    }

    const currency = String(config?.currency || "EUR").toLowerCase();
    const useLaunchPrice = Boolean(config?.launch_discount_enabled);
    const amount = useLaunchPrice ? pack.price_cents_launch : pack.price_cents_regular;

    if (!Number.isInteger(amount) || amount == null || amount <= 0) {
      return Response.json(
        { error: "Für dieses Paket ist kein gültiger Preis hinterlegt." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin = getOrigin(req);

const session = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"],

  success_url: `${origin}/credits-test?success=1&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/credits-test?canceled=1`,

  client_reference_id: userId,

  // 🔥 WICHTIG für Rechnung
  billing_address_collection: "required",
  customer_creation: "always",
  phone_number_collection: { enabled: true },
  tax_id_collection: { enabled: true },

  line_items: [
    {
      quantity: 1,
      price_data: {
        currency,
        unit_amount: amount,
        product_data: {
          name: `${pack.credits} mioseg qr Credits`,
          description: pack.badge
            ? `Paket ${pack.id} · ${pack.badge}`
            : `Paket ${pack.id}`,
        },
      },
    },
  ],

  // 🔥 GANZ WICHTIG: payment_intent_data
  payment_intent_data: {
    metadata: {
      user_id: userId,
      pack_id: pack.id,
      credits: String(pack.credits),
      amount_cents: String(amount),
      source: "web_checkout",

      // Diese werden später aus Stripe ergänzt
      billing_email: "",
      billing_name: "",
      billing_street: "",
      billing_postal_code: "",
      billing_city: "",
      billing_country_code: "",
    },
  },
});

    return Response.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
