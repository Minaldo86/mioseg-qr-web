import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_PROBLEM_TYPES = new Set([
  "credits_wrong",
  "verification_waiting",
  "upload_problem",
  "transfer_problem",
  "qrx_report",
  "other",
]);

type CreateTicketBody = {
  problemType?: unknown;
  title?: unknown;
  description?: unknown;
  qrxId?: unknown;
};

function getEnvironment() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    throw new Error(
      "Supabase-Umgebungsvariablen sind nicht vollständig konfiguriert.",
    );
  }

  return { url, anonKey, serviceKey };
}

async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return { user: null, error: "Nicht angemeldet." };
  }

  const { url, anonKey } = getEnvironment();

  const client = createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: "Deine Sitzung ist ungültig oder abgelaufen.",
    };
  }

  return { user, error: null };
}

type AdminClient = {
  from: ReturnType<typeof createClient>["from"];
};

async function nextTicketNumber(admin: AdminClient) {
  const year = new Date().getFullYear();
  const prefix = `SUP-${year}-`;

  const { count, error } = await admin
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01T00:00:00.000Z`)
    .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);

  if (error) {
    console.warn("Support ticket count failed:", error.message);
  }

  return `${prefix}${String((count ?? 0) + 1).padStart(5, "0")}`;
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth.user) {
      return NextResponse.json(
        { error: auth.error || "Nicht angemeldet." },
        { status: 401 },
      );
    }

    const { url, serviceKey } = getEnvironment();
    const admin = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await admin
      .from("support_tickets")
      .select(
        "id,ticket_number,user_id,qrx_id,problem_type,status,title,description,resolution_note,created_at,updated_at,resolved_at",
      )
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("User support tickets load failed:", error);

      return NextResponse.json(
        { error: "Support-Anfragen konnten nicht geladen werden." },
        { status: 500 },
      );
    }

    return NextResponse.json({ tickets: data ?? [] });
  } catch (error) {
    console.error("User support GET failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Support-Anfragen konnten nicht geladen werden.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth.user) {
      return NextResponse.json(
        { error: auth.error || "Nicht angemeldet." },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as CreateTicketBody;

    const problemTypeRaw = String(body.problemType || "other");
    const problemType = ALLOWED_PROBLEM_TYPES.has(problemTypeRaw)
      ? problemTypeRaw
      : "other";

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const qrxId = String(body.qrxId || "").trim() || null;

    if (title.length < 4 || title.length > 140) {
      return NextResponse.json(
        { error: "Der Betreff muss zwischen 4 und 140 Zeichen lang sein." },
        { status: 400 },
      );
    }

    if (description.length < 10 || description.length > 5000) {
      return NextResponse.json(
        {
          error:
            "Die Beschreibung muss zwischen 10 und 5.000 Zeichen lang sein.",
        },
        { status: 400 },
      );
    }

    const { url, serviceKey } = getEnvironment();
    const admin = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (qrxId) {
      const { data: qrx, error: qrxError } = await admin
        .from("qr_x_entries")
        .select("id,owner_user_id")
        .eq("id", qrxId)
        .eq("owner_user_id", auth.user.id)
        .is("deleted_at", null)
        .maybeSingle();

      if (qrxError || !qrx) {
        return NextResponse.json(
          { error: "Der ausgewählte QR-X gehört nicht zu deinem Konto." },
          { status: 400 },
        );
      }
    }

    const ticketNumber = await nextTicketNumber(admin);

    const { data, error } = await admin
      .from("support_tickets")
      .insert({
        ticket_number: ticketNumber,
        user_id: auth.user.id,
        qrx_id: qrxId,
        problem_type: problemType,
        status: "open",
        title,
        description,
      })
      .select(
        "id,ticket_number,user_id,qrx_id,problem_type,status,title,description,resolution_note,created_at,updated_at,resolved_at",
      )
      .single();

    if (error) {
      console.error("User support ticket creation failed:", error);

      return NextResponse.json(
        { error: "Die Support-Anfrage konnte nicht gespeichert werden." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, ticket: data }, { status: 201 });
  } catch (error) {
    console.error("User support POST failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Die Support-Anfrage konnte nicht gespeichert werden.",
      },
      { status: 500 },
    );
  }
}
