import { supabaseAdmin } from "@/lib/supabase-admin";

type ReportReason =
  | "fake_or_fraud"
  | "wrong_business_info"
  | "spam"
  | "illegal_or_dangerous"
  | "copyright"
  | "other";

const REASON_LABELS: Record<ReportReason, string> = {
  fake_or_fraud: "Betrug / Fake",
  wrong_business_info: "Falsche Unternehmensangaben",
  spam: "Spam / Werbung",
  illegal_or_dangerous: "Illegale oder gefährliche Inhalte",
  copyright: "Urheberrecht / fremde Inhalte",
  other: "Sonstiges",
};

function normalizeReason(value: unknown): ReportReason {
  const text = String(value || "other");

  if (
    text === "fake_or_fraud" ||
    text === "wrong_business_info" ||
    text === "spam" ||
    text === "illegal_or_dangerous" ||
    text === "copyright" ||
    text === "other"
  ) {
    return text;
  }

  return "other";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function cleanEmail(value: unknown) {
  const text = String(value || "").trim();

  if (!text) return null;
  if (text.length > 180) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return null;

  return text;
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
  targetUserId?: string | null;
  qrxId?: string | null;
  note?: string | null;
}) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: "qrx_report_created",
    target_user_id: input.targetUserId ?? null,
    qrx_id: input.qrxId ?? null,
    note: input.note ?? null,
  });

  if (error) {
    console.warn("admin_action_log insert failed:", error.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const qrxId = String(body?.qrxId || "").trim();
    const reason = normalizeReason(body?.reason);
    const description = String(body?.description || "").trim();
    const reporterEmail = cleanEmail(body?.reporterEmail);

    if (!qrxId || !isUuid(qrxId)) {
      return Response.json({ error: "Ungültige QR-X-ID" }, { status: 400 });
    }

    if (description.length < 20) {
      return Response.json(
        { error: "Bitte beschreibe das Problem mit mindestens 20 Zeichen." },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return Response.json(
        { error: "Die Beschreibung ist zu lang. Maximal 2000 Zeichen." },
        { status: 400 }
      );
    }

    const { data: qrx, error: qrxError } = await supabaseAdmin
      .from("qr_x_entries")
      .select("id, owner_user_id, title, company_name")
      .eq("id", qrxId)
      .maybeSingle();

    if (qrxError || !qrx) {
      return Response.json(
        { error: "QR-X wurde nicht gefunden." },
        { status: 404 }
      );
    }

    const ticketNumber = await nextTicketNumber();
    const reasonLabel = REASON_LABELS[reason];

    const fullDescription = [
      "Öffentliche QR-X Meldung",
      `Grund: ${reasonLabel}`,
      `QR-X Titel: ${qrx.title || "Ohne Titel"}`,
      qrx.company_name ? `Firma: ${qrx.company_name}` : null,
      reporterEmail ? `Reporter E-Mail: ${reporterEmail}` : "Reporter E-Mail: nicht angegeben",
      "",
      "Beschreibung:",
      description,
    ]
      .filter(Boolean)
      .join("\\n");

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        ticket_number: ticketNumber,
        user_id: qrx.owner_user_id,
        qrx_id: qrx.id,
        problem_type: "other",
        status: "open",
        title: `QR-X Meldung: ${reasonLabel}`,
        description: fullDescription,
      })
      .select("*")
      .single();

    if (ticketError) {
      return Response.json(
        {
          error: "Meldung konnte nicht gespeichert werden.",
          details: ticketError.message,
        },
        { status: 500 }
      );
    }

    await writeAdminLog({
      targetUserId: qrx.owner_user_id,
      qrxId: qrx.id,
      note: `${ticketNumber}: QR-X Meldung (${reasonLabel})`,
    });

    return Response.json({
      ok: true,
      ticketNumber,
      ticketId: ticket.id,
    });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
