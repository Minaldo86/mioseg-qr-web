import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PatchBody = {
  ticketId?: unknown;
  status?: unknown;
  internalNote?: unknown;
  eventType?: unknown;
  eventLabel?: unknown;
};

const ALLOWED_STATUSES = new Set([
  "open",
  "in_review",
  "waiting_customer",
  "resolved",
]);

function getEnvironment() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase-Umgebungsvariablen fehlen.");
  return { url, serviceKey };
}

function createAdminClient() {
  const { url, serviceKey } = getEnvironment();
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getAuthUsersById(admin: ReturnType<typeof createAdminClient>, userIds: string[]) {
  const result = new Map<string, string>();
  await Promise.all(
    userIds.map(async (userId) => {
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (!error && data.user?.email) result.set(userId, data.user.email);
    }),
  );
  return result;
}

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data: tickets, error } = await admin
      .from("support_tickets")
      .select("id,ticket_number,user_id,qrx_id,problem_type,status,title,description,resolution_note,internal_note,report_reason,reporter_email,report_weight,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    const rows = tickets ?? [];
    const userIds = Array.from(new Set(rows.map((row) => row.user_id).filter((value): value is string => Boolean(value))));
    const qrxIds = Array.from(new Set(rows.map((row) => row.qrx_id).filter((value): value is string => Boolean(value))));
    const ticketIds = rows.map((row) => row.id);

    const [emails, profilesResult, qrxResult, eventsResult] = await Promise.all([
      getAuthUsersById(admin, userIds),
      userIds.length
        ? admin.from("profiles").select("id,first_name,last_name,company_name,billing_name").in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      qrxIds.length
        ? admin.from("qr_x_entries").select("id,title,company_name").in("id", qrxIds)
        : Promise.resolve({ data: [], error: null }),
      ticketIds.length
        ? admin.from("support_ticket_events").select("id,ticket_id,event_type,event_label,created_at").in("ticket_id", ticketIds).order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

    const profiles = new Map<string, string>();
    for (const profile of profilesResult.data ?? []) {
      const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
      profiles.set(profile.id, fullName || profile.company_name || profile.billing_name || "");
    }

    const qrxTitles = new Map<string, string>();
    for (const qrx of qrxResult.data ?? []) {
      qrxTitles.set(qrx.id, qrx.company_name || qrx.title || "Unbenannter QR-X");
    }

    const eventsByTicket = new Map<string, Array<{ id: string; event_type: string; event_label: string; created_at: string }>>();
    for (const event of eventsResult.data ?? []) {
      const list = eventsByTicket.get(event.ticket_id) ?? [];
      list.push({ id: event.id, event_type: event.event_type, event_label: event.event_label, created_at: event.created_at });
      eventsByTicket.set(event.ticket_id, list);
    }

    return NextResponse.json(
      rows.map((ticket) => ({
        ...ticket,
        user_name: ticket.user_id ? profiles.get(ticket.user_id) || null : null,
        user_email: ticket.reporter_email || (ticket.user_id ? emails.get(ticket.user_id) || null : null),
        qrx_title: ticket.qrx_id ? qrxTitles.get(ticket.qrx_id) || null : null,
        events: eventsByTicket.get(ticket.id) ?? [],
      })),
    );
  } catch (error) {
    console.error("Admin support detail GET failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Support-Tickets konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as PatchBody;
    const ticketId = typeof body.ticketId === "string" ? body.ticketId.trim() : "";
    if (!ticketId) return NextResponse.json({ error: "ticketId fehlt." }, { status: 400 });

    const admin = createAdminClient();
    const updates: Record<string, string | null> = {};
    let eventType = typeof body.eventType === "string" ? body.eventType.trim() : "";
    let eventLabel = typeof body.eventLabel === "string" ? body.eventLabel.trim() : "";

    if (typeof body.status === "string") {
      const status = body.status.trim();
      if (!ALLOWED_STATUSES.has(status)) return NextResponse.json({ error: "Ungültiger Ticketstatus." }, { status: 400 });
      updates.status = status;
      updates.updated_at = new Date().toISOString();
      if (status === "resolved") updates.resolved_at = new Date().toISOString();
      else updates.resolved_at = null;
      eventType = "status_changed";
      eventLabel = status === "open" ? "Ticket geöffnet" : status === "in_review" ? "In Bearbeitung gesetzt" : status === "waiting_customer" ? "Warten auf Kunde" : "Ticket gelöst";
    }

    if (typeof body.internalNote === "string") {
      updates.internal_note = body.internalNote.trim() || null;
      updates.updated_at = new Date().toISOString();
      eventType = "internal_note_updated";
      eventLabel = "Interne Notiz aktualisiert";
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await admin.from("support_tickets").update(updates).eq("id", ticketId);
      if (error) throw error;
    }

    if (eventType && eventLabel) {
      const { error } = await admin.from("support_ticket_events").insert({ ticket_id: ticketId, event_type: eventType, event_label: eventLabel });
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin support detail PATCH failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Support-Ticket konnte nicht aktualisiert werden." }, { status: 500 });
  }
}
