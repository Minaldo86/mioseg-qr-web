import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WITHDRAWAL_CONSENT_VERSION = "1.0";
const IMMEDIATE_PERFORMANCE_CONSENT_TEXT =
  "Ich stimme ausdrücklich zu, dass mioseg qr vor Ablauf der Widerrufsfrist mit der Ausführung beginnt und die gekauften Credits nach erfolgreicher Zahlung unmittelbar meinem Konto gutschreibt.";
const WITHDRAWAL_LOSS_ACKNOWLEDGEMENT_TEXT =
  "Mir ist bekannt, dass mein Widerrufsrecht bei Vorliegen der gesetzlichen Voraussetzungen mit Beginn der Ausführung erlöschen kann.";

type PricingConfig = {
  launch_discount_enabled?: boolean | null;
  currency?: string | null;
  free_storage_mb?: number | null;
  qrx_creation_credit_cost?: number | null;
  storage_pack_mb?: number | null;
  storage_pack_credit_cost?: number | null;
  max_upload_mb?: number | null;
  max_images_per_qrx?: number | null;
  max_documents_per_qrx?: number | null;
  max_updates?: number | null;
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

  console.log("STRIPE KEY PREFIX:", key?.substring(0, 12));

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
  const raw = value as PricingConfig;

  return {
    launch_discount_enabled: Boolean(raw.launch_discount_enabled),
    currency: raw.currency || "EUR",
    free_storage_mb: Number(raw.free_storage_mb ?? 2),
    qrx_creation_credit_cost: Number(raw.qrx_creation_credit_cost ?? 1),
    storage_pack_mb: Number(raw.storage_pack_mb ?? 5),
    storage_pack_credit_cost: Number(raw.storage_pack_credit_cost ?? 1),
    max_upload_mb: Number(raw.max_upload_mb ?? 50),
    max_images_per_qrx: Number(raw.max_images_per_qrx ?? 20),
    max_documents_per_qrx: Number(raw.max_documents_per_qrx ?? 20),
    max_updates: Number(raw.max_updates ?? 5),
  };
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

    const packId = String(body?.packId || "").trim();
    const quantity = Number(body?.quantity ?? 1);
    const immediatePerformanceConsent =
      body?.immediatePerformanceConsent === true;
    const withdrawalLossAcknowledged =
      body?.withdrawalLossAcknowledged === true;
    const consentLocale = clean(body?.consentLocale || "de").slice(0, 10) || "de";

    if (!packId) {
      return Response.json({ error: "Paket-ID fehlt." }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return Response.json(
        { error: "Die Menge muss zwischen 1 und 100 liegen." },
        { status: 400 },
      );
    }

    if (!immediatePerformanceConsent || !withdrawalLossAcknowledged) {
      return Response.json(
        {
          error:
            "Die erforderlichen Bestätigungen zum sofortigen Leistungsbeginn und zum Widerrufsrecht fehlen.",
        },
        { status: 400 },
      );
    }

    const authorization = req.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!token) {
      return Response.json({ error: "Anmeldung erforderlich." }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user?.id) {
      return Response.json({ error: "Ungültige oder abgelaufene Sitzung." }, { status: 401 });
    }

    const userId = user.id;

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

    const totalCredits = pack.credits * quantity;
    const totalAmount = amount * quantity;
    const acceptedAt = new Date().toISOString();

    const { data: consentRow, error: consentInsertError } = await supabaseAdmin
      .from("purchase_legal_acceptances")
      .insert({
        user_id: userId,
        purchase_channel: "web_stripe",
        pack_id: pack.id,
        credits: totalCredits,
        amount_cents: totalAmount,
        currency: currency.toUpperCase(),
        immediate_performance_consent: true,
        withdrawal_loss_acknowledged: true,
        consent_version: WITHDRAWAL_CONSENT_VERSION,
        immediate_performance_text: IMMEDIATE_PERFORMANCE_CONSENT_TEXT,
        withdrawal_loss_text: WITHDRAWAL_LOSS_ACKNOWLEDGEMENT_TEXT,
        accepted_locale: consentLocale,
        accepted_at: acceptedAt,
        checkout_status: "initiated",
      })
      .select("id")
      .single();

    if (consentInsertError || !consentRow?.id) {
      console.error("purchase_legal_acceptances insert failed:", consentInsertError);
      return Response.json(
        { error: "Die Kaufbestätigung konnte nicht dokumentiert werden. Bitte versuche es erneut." },
        { status: 500 },
      );
    }

    const consentId = String(consentRow.id);

    const stripe = getStripe();
    const origin = getOrigin(req);

    const metadata = {
      userId,
      packId: pack.id,
      credits: String(totalCredits),
      amountCents: String(totalAmount),
      quantity: String(quantity),

      user_id: userId,
      pack_id: pack.id,
      amount_cents: String(totalAmount),
      quantity_count: String(quantity),
      source: "web_checkout",

      legal_acceptance_id: consentId,
      withdrawal_consent_version: WITHDRAWAL_CONSENT_VERSION,
      immediate_performance_consent: "true",
      withdrawal_loss_acknowledged: "true",
      legal_accepted_at: acceptedAt,
      legal_accepted_locale: consentLocale,

      billing_email: billing.billingEmail,
      billing_company: billing.billingCompany,
      billing_name: billing.billingName || billing.billingCompany,
      billing_street: billing.billingStreet,
      billing_postal_code: billing.billingPostalCode,
      billing_city: billing.billingCity,
      billing_country_code: billing.billingCountryCode,
      billing_vat_id: billing.billingVatId,
    };

    let session: Stripe.Checkout.Session;

    try {
      session = await stripe.checkout.sessions.create({
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
          quantity,
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

      const { error: consentUpdateError } = await supabaseAdmin
        .from("purchase_legal_acceptances")
        .update({
          stripe_checkout_session_id: session.id,
          checkout_status: "stripe_session_created",
        })
        .eq("id", consentId)
        .eq("user_id", userId);

      if (consentUpdateError) {
        console.error("purchase_legal_acceptances session update failed:", consentUpdateError);
      }
    } catch (stripeError) {
      await supabaseAdmin
        .from("purchase_legal_acceptances")
        .update({ checkout_status: "stripe_session_failed" })
        .eq("id", consentId)
        .eq("user_id", userId);

      throw stripeError;
    }

    return Response.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
      legalAcceptanceId: consentId,
    });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}