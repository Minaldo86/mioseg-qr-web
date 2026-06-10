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

type BillingProfile = {
  billing_email?: string | null;
  billing_company?: string | null;
  billing_name?: string | null;
  billing_street?: string | null;
  billing_postal_code?: string | null;
  billing_city?: string | null;
  billing_country_code?: string | null;
  billing_vat_id?: string | null;
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  console.warn("STRIPE MODE CHECK", {
  keyPrefix: key?.slice(0, 8),
});
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt.");
  return new Stripe(key);
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeCountryCode(value: unknown) {
  const country = clean(value).toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : "";
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

async function loadBillingProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      "billing_email,billing_company,billing_name,billing_street,billing_postal_code,billing_city,billing_country_code,billing_vat_id"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Rechnungsdaten konnten nicht geladen werden: ${error.message}`);
  }

  const profile = (data ?? {}) as BillingProfile;

  return {
    billingEmail: clean(profile.billing_email),
    billingCompany: clean(profile.billing_company),
    billingName: clean(profile.billing_name),
    billingStreet: clean(profile.billing_street),
    billingPostalCode: clean(profile.billing_postal_code),
    billingCity: clean(profile.billing_city),
    billingCountryCode: normalizeCountryCode(profile.billing_country_code),
    billingVatId: clean(profile.billing_vat_id),
  };
}

function validateBillingProfile(profile: Awaited<ReturnType<typeof loadBillingProfile>>) {
  const missing: string[] = [];

  if (!profile.billingEmail) missing.push("Rechnungs-E-Mail");
  if (!profile.billingName && !profile.billingCompany) missing.push("Name oder Firma");
  if (!profile.billingStreet) missing.push("Straße");
  if (!profile.billingPostalCode) missing.push("PLZ");
  if (!profile.billingCity) missing.push("Ort");
  if (!profile.billingCountryCode) missing.push("Land");

  return missing;
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

    const billing = await loadBillingProfile(userId);
    const missingBillingFields = validateBillingProfile(billing);

    if (missingBillingFields.length > 0) {
      return Response.json(
        {
          error: `Bitte vervollständige zuerst deine Rechnungsdaten im Konto: ${missingBillingFields.join(", ")}.`,
          missingBillingFields,
          redirectTo: "/dashboard/account",
        },
        { status: 400 }
      );
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

    const metadata = {
      userId,
      packId: pack.id,
      credits: String(pack.credits),
      amountCents: String(amount),

      user_id: userId,
      pack_id: pack.id,
      amount_cents: String(amount),
      source: "web_checkout",

      billing_email: billing.billingEmail,
      billing_company: billing.billingCompany,
      billing_name: billing.billingName || billing.billingCompany,
      billing_street: billing.billingStreet,
      billing_postal_code: billing.billingPostalCode,
      billing_city: billing.billingCity,
      billing_country_code: billing.billingCountryCode,
      billing_vat_id: billing.billingVatId,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      success_url: `${origin}/credits-test?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/credits-test?canceled=1`,

      client_reference_id: userId,
      metadata,

      billing_address_collection: "required",
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      tax_id_collection: { enabled: true },
      customer_email: billing.billingEmail || undefined,

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

      payment_intent_data: {
        metadata,
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