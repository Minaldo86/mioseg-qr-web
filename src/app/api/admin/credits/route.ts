import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_SINGLE_CREDIT_GRANT = 100;
const MAX_DAILY_CREDIT_GRANT = 500;

type AdminActionAmountRow = {
  amount: number | null;
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

function getTodayStartIso() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

async function getCreditsGrantedToday() {
  const todayStartIso = getTodayStartIso();

  const { data, error } = await supabaseAdmin
    .from("admin_action_log")
    .select("amount")
    .in("action_type", [
      "credits_added",
      "credits_refunded_from_ticket",
      "support_ticket_resolved_with_credit",
    ])
    .gte("created_at", todayStartIso)
    .returns<AdminActionAmountRow[]>();

  if (error) {
    console.warn("credits daily limit check failed:", error.message);
    return 0;
  }

  return (data ?? []).reduce((sum, row) => {
    const amount = typeof row?.amount === "number" ? row.amount : 0;
    return sum + Math.max(0, amount);
  }, 0);
}

async function writeAdminLog(input: {
  actionType: string;
  targetUserId?: string | null;
  amount?: number | null;
  note?: string | null;
}) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: input.actionType,
    target_user_id: input.targetUserId ?? null,
    amount: input.amount ?? null,
    note: input.note ?? null,
  });

  if (error) {
    console.warn("admin_action_log insert failed:", error.message);
  }
}

function normalizeOptionalText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function normalizeCentAmount(value: unknown, fieldName: string) {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`${fieldName} muss ein positiver Cent-Betrag sein.`);
  }

  if (amount > 999999) {
    throw new Error(`${fieldName} ist ungewöhnlich hoch.`);
  }

  return amount;
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const { data: pricingConfig, error: configError } = await supabaseAdmin
      .from("qrx_pricing_config")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (configError) {
      return Response.json(
        {
          error: "Preis-Konfiguration konnte nicht geladen werden",
          details: configError.message,
        },
        { status: 500 }
      );
    }

    const { data: pricingPacks, error: packsError } = await supabaseAdmin
      .from("qrx_pricing_packs")
      .select("*")
      .order("sort_order", { ascending: true });

    if (packsError) {
      return Response.json(
        {
          error: "Credit-Pakete konnten nicht geladen werden",
          details: packsError.message,
        },
        { status: 500 }
      );
    }

    const creditsGrantedToday = await getCreditsGrantedToday();

    return Response.json({
      ok: true,
      pricingConfig,
      pricingPacks: pricingPacks ?? [],
      limits: {
        maxSingleCreditGrant: MAX_SINGLE_CREDIT_GRANT,
        maxDailyCreditGrant: MAX_DAILY_CREDIT_GRANT,
        creditsGrantedToday,
        remainingCreditsToday: Math.max(
          0,
          MAX_DAILY_CREDIT_GRANT - creditsGrantedToday
        ),
      },
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
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const body = await req.json();

    const userId = String(body?.userId || "").trim();
    const amount = Number(body?.amount);
    const note = typeof body?.note === "string" ? body.note.trim() : null;

    if (!userId) {
      return Response.json({ error: "User-ID fehlt" }, { status: 400 });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      return Response.json(
        { error: "amount muss eine positive ganze Zahl sein" },
        { status: 400 }
      );
    }

    if (amount > MAX_SINGLE_CREDIT_GRANT) {
      return Response.json(
        {
          error: `Maximal ${MAX_SINGLE_CREDIT_GRANT} Credits pro einzelner Admin-Buchung erlaubt.`,
        },
        { status: 400 }
      );
    }

    const creditsGrantedToday = await getCreditsGrantedToday();

    if (creditsGrantedToday + amount > MAX_DAILY_CREDIT_GRANT) {
      return Response.json(
        {
          error: `Tageslimit überschritten. Heute bereits gebucht: ${creditsGrantedToday} Credits. Tageslimit: ${MAX_DAILY_CREDIT_GRANT} Credits.`,
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc("add_credits_admin", {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) {
      return Response.json(
        {
          error: "Credits konnten nicht gebucht werden",
          details: error.message,
        },
        { status: 500 }
      );
    }

    await writeAdminLog({
      actionType: "credits_added",
      targetUserId: userId,
      amount,
      note: note || `Manuelle Admin-Gutschrift: +${amount} Credits`,
    });

    return Response.json({
      ok: true,
      userId,
      amount,
      newCredits: data,
      dailyLimit: MAX_DAILY_CREDIT_GRANT,
      creditsGrantedToday: creditsGrantedToday + amount,
    });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const body = await req.json();
    const type = String(body?.type || "").trim();

    if (type === "config") {
      const launchDiscountEnabled = Boolean(body?.launch_discount_enabled);

      const { data: existingConfig, error: existingError } = await supabaseAdmin
        .from("qrx_pricing_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (existingError) {
        return Response.json(
          {
            error: "Preis-Konfiguration konnte nicht geladen werden",
            details: existingError.message,
          },
          { status: 500 }
        );
      }

      if (!existingConfig?.id) {
        return Response.json(
          { error: "Keine Preis-Konfiguration gefunden." },
          { status: 404 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("qrx_pricing_config")
        .update({
          launch_discount_enabled: launchDiscountEnabled,

          free_storage_mb: Number(body?.free_storage_mb ?? existingConfig.free_storage_mb),
          qrx_creation_credit_cost: Number(body?.qrx_creation_credit_cost ?? existingConfig.qrx_creation_credit_cost),

          storage_pack_mb: Number(body?.storage_pack_mb ?? existingConfig.storage_pack_mb),
          storage_pack_credit_cost: Number(body?.storage_pack_credit_cost ?? existingConfig.storage_pack_credit_cost),

          max_upload_mb: Number(body?.max_upload_mb ?? existingConfig.max_upload_mb),
          max_images_per_qrx: Number(body?.max_images_per_qrx ?? existingConfig.max_images_per_qrx),
          max_documents_per_qrx: Number(body?.max_documents_per_qrx ?? existingConfig.max_documents_per_qrx),
          max_updates: Number(body?.max_updates ?? existingConfig.max_updates),

          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConfig.id)
        .select("*")
        .single();

      if (error) {
        return Response.json(
          {
            error: "Preis-Konfiguration konnte nicht aktualisiert werden",
            details: error.message,
          },
          { status: 500 }
        );
      }

      await writeAdminLog({
        actionType: "pricing_config_updated",
        note: `Launch-Rabatt ${launchDiscountEnabled ? "aktiviert" : "deaktiviert"}.`,
      });

      return Response.json({ ok: true, pricingConfig: data });
    }

    if (type === "pack") {
      const id = String(body?.id || "").trim();

      if (!id) {
        return Response.json({ error: "Paket-ID fehlt" }, { status: 400 });
      }

      const priceCentsLaunch = normalizeCentAmount(
        body?.price_cents_launch,
        "Launch-Preis"
      );
      const priceCentsRegular = normalizeCentAmount(
        body?.price_cents_regular,
        "Normalpreis"
      );

      const badge = normalizeOptionalText(body?.badge);
      const isActive = Boolean(body?.is_active);

      const { data: existingPack, error: existingError } = await supabaseAdmin
        .from("qrx_pricing_packs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (existingError) {
        return Response.json(
          {
            error: "Credit-Paket konnte nicht geladen werden",
            details: existingError.message,
          },
          { status: 500 }
        );
      }

      if (!existingPack) {
        return Response.json(
          { error: "Credit-Paket wurde nicht gefunden." },
          { status: 404 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("qrx_pricing_packs")
        .update({
          price_cents_launch: priceCentsLaunch,
          price_cents_regular: priceCentsRegular,
          badge,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        return Response.json(
          {
            error: "Credit-Paket konnte nicht aktualisiert werden",
            details: error.message,
          },
          { status: 500 }
        );
      }

      await writeAdminLog({
        actionType: "pricing_pack_updated",
        note: `Paket ${id} aktualisiert: Launch ${priceCentsLaunch} Cent, Normal ${priceCentsRegular} Cent, aktiv: ${isActive ? "ja" : "nein"}, Badge: ${badge || "–"}.`,
      });

      return Response.json({ ok: true, pricingPack: data });
    }

    return Response.json({ error: "Ungültiger Aktualisierungstyp" }, { status: 400 });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
