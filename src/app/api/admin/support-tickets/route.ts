import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_SINGLE_TICKET_REFUND = 100;
const MAX_DAILY_CREDIT_GRANT = 500;

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

function normalizeProblemType(value: unknown) {
  const allowed = new Set([
    "credits_wrong",
    "verification_waiting",
    "upload_problem",
    "transfer_problem",
    "qrx_report",
    "other",
  ]);

  const text = String(value || "other");
  return allowed.has(text) ? text : "other";
}

function normalizeStatus(value: unknown) {
  const allowed = new Set(["open", "in_review", "resolved"]);
  const text = String(value || "open");
  return allowed.has(text) ? text : "open";
}

function getTodayStartIso() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

async function getCreditsGrantedToday() {
  const { data, error } = await supabaseAdmin
    .from("admin_action_log")
    .select("amount")
    .in("action_type", [
      "credits_added",
      "credits_refunded_from_ticket",
      "support_ticket_resolved_with_credit",
    ])
    .gte("created_at", getTodayStartIso());

  if (error) {
    console.warn("ticket refund daily limit check failed:", error.message);
    return 0;
  }

  return (data ?? []).reduce((sum, row: { amount?: number | null }) => {
    const amount = typeof row?.amount === "number" ? row.amount : 0;
    return sum + Math.max(0, amount);
  }, 0);
}

async function nextTicketNumber() {
  const year = new Date().getFullYear();
  const prefix = `SUP-${year}-`;

  const { count, error } = await supabaseAdmin
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01T00:00:00.000Z`)
    .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);

  if (error) {
    console.warn("ticket count failed:", error.message);
  }

  const next = (count ?? 0) + 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}

async function writeAdminLog(input: {
  actionType: string;
  targetUserId?: string | null;
  qrxId?: string | null;
  amount?: number | null;
  note?: string | null;
}) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: input.actionType,
    target_user_id: input.targetUserId ?? null,
    qrx_id: input.qrxId ?? null,
    amount: input.amount ?? null,
    note: input.note ?? null,
  });

  if (error) {
    console.warn("admin_action_log insert failed:", error.message);
  }
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const { data, error } = await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return Response.json(
        {
          error: "Supportfälle konnten nicht geladen werden",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json(data ?? []);
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

    const userId = String(body?.userId || "").trim() || null;
    const qrxId = String(body?.qrxId || "").trim() || null;
    const problemType = normalizeProblemType(body?.problemType);
    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim() || null;

    if (!title) {
      return Response.json({ error: "Titel fehlt" }, { status: 400 });
    }

    const ticketNumber = await nextTicketNumber();

    const { data, error } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        ticket_number: ticketNumber,
        user_id: userId,
        qrx_id: qrxId,
        problem_type: problemType,
        status: "open",
        title,
        description,
      })
      .select("*")
      .single();

    if (error) {
      return Response.json(
        {
          error: "Supportfall konnte nicht angelegt werden",
          details: error.message,
        },
        { status: 500 }
      );
    }

    await writeAdminLog({
      actionType: "support_ticket_created",
      targetUserId: userId,
      qrxId,
      note: `${ticketNumber}: ${title}`,
    });

    return Response.json({ ok: true, ticket: data });
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

    const ticketId = String(body?.ticketId || "").trim();
    const status = normalizeStatus(body?.status);
    const refundAmountRaw = body?.refundAmount;
    const refundAmount =
      refundAmountRaw === null ||
      refundAmountRaw === undefined ||
      refundAmountRaw === ""
        ? 0
        : Number(refundAmountRaw);

    const resolutionNote =
      typeof body?.resolutionNote === "string"
        ? body.resolutionNote.trim()
        : null;

    if (!ticketId) {
      return Response.json({ error: "ticketId fehlt" }, { status: 400 });
    }

    if (
      !Number.isFinite(refundAmount) ||
      refundAmount < 0 ||
      !Number.isInteger(refundAmount)
    ) {
      return Response.json(
        { error: "refundAmount muss eine positive ganze Zahl sein" },
        { status: 400 }
      );
    }

    if (refundAmount > MAX_SINGLE_TICKET_REFUND) {
      return Response.json(
        {
          error: `Maximal ${MAX_SINGLE_TICKET_REFUND} Credits pro Ticket-Erstattung erlaubt.`,
        },
        { status: 400 }
      );
    }

    if (refundAmount > 0) {
      const creditsGrantedToday = await getCreditsGrantedToday();

      if (creditsGrantedToday + refundAmount > MAX_DAILY_CREDIT_GRANT) {
        return Response.json(
          {
            error: `Tageslimit überschritten. Heute bereits gebucht: ${creditsGrantedToday} Credits. Tageslimit: ${MAX_DAILY_CREDIT_GRANT} Credits.`,
          },
          { status: 400 }
        );
      }
    }

    const { data: existingTicket, error: existingError } = await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (existingError || !existingTicket) {
      return Response.json(
        {
          error: "Supportfall nicht gefunden",
          details: existingError?.message,
        },
        { status: 404 }
      );
    }

    let newCredits: number | null = null;

    if (refundAmount > 0) {
      if (!existingTicket.user_id) {
        return Response.json(
          {
            error:
              "Für eine Credit-Erstattung braucht der Supportfall eine User-ID.",
          },
          { status: 400 }
        );
      }

      const { data: creditData, error: creditError } = await supabaseAdmin.rpc(
        "add_credits_admin",
        {
          p_user_id: existingTicket.user_id,
          p_amount: refundAmount,
        }
      );

      if (creditError) {
        return Response.json(
          {
            error: "Credits konnten nicht erstattet werden",
            details: creditError.message,
          },
          { status: 500 }
        );
      }

      newCredits = typeof creditData === "number" ? creditData : null;
    }

    const nowIso = new Date().toISOString();

    const payload: Record<string, string | null> = {
      status,
      updated_at: nowIso,
    };

    if (status === "resolved") {
      payload.resolved_at = nowIso;
      payload.resolution_note =
        resolutionNote ||
        (refundAmount > 0
          ? `Gelöst mit Credit-Erstattung: +${refundAmount} Credits.`
          : existingTicket.resolution_note);
    } else {
      payload.resolved_at = null;
    }

    const { data, error } = await supabaseAdmin
      .from("support_tickets")
      .update(payload)
      .eq("id", ticketId)
      .select("*")
      .single();

    if (error) {
      return Response.json(
        {
          error: "Supportfall konnte nicht aktualisiert werden",
          details: error.message,
        },
        { status: 500 }
      );
    }

    await writeAdminLog({
      actionType:
        refundAmount > 0
          ? "support_ticket_resolved_with_credit"
          : `support_ticket_${status}`,
      targetUserId: data.user_id,
      qrxId: data.qrx_id,
      amount: refundAmount > 0 ? refundAmount : null,
      note:
        refundAmount > 0
          ? `${data.ticket_number || data.id}: +${refundAmount} Credits erstattet und Ticket gelöst`
          : `${data.ticket_number || data.id}: Status auf ${status} gesetzt`,
    });

    if (refundAmount > 0) {
      await writeAdminLog({
        actionType: "credits_refunded_from_ticket",
        targetUserId: data.user_id,
        qrxId: data.qrx_id,
        amount: refundAmount,
        note: `${data.ticket_number || data.id}: Credit-Erstattung aus Supportfall`,
      });
    }

    return Response.json({
      ok: true,
      ticket: data,
      refundedAmount: refundAmount,
      newCredits,
    });
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}