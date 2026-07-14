import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = { invoiceId?: unknown };

type InvoiceRow = {
  id: string;
  user_id: string;
  invoice_number: string;
  status: string | null;
  pdf_path: string | null;
  storage_bucket: string | null;
};

function getEnvironment() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    throw new Error(
      "SUPABASE_URL, SUPABASE_ANON_KEY oder SUPABASE_SERVICE_ROLE_KEY fehlt.",
    );
  }

  return { url, anonKey, serviceKey };
}

function sanitizeFilename(value: string) {
  return value
    .trim()
    .replace(/[\r\n"]/g, "_")
    .replace(/[\\/:*?<>|]/g, "_")
    .slice(0, 180);
}

function buildContentDisposition(filename: string) {
  const safe = sanitizeFilename(filename || "Rechnung.pdf");
  const ascii = safe.normalize("NFKD").replace(/[^\x20-\x7E]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") || "";

    if (!authorization.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as RequestBody;
    const invoiceId =
      typeof body.invoiceId === "string" ? body.invoiceId.trim() : "";

    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId wird benötigt." },
        { status: 400 },
      );
    }

    const { url, anonKey, serviceKey } = getEnvironment();

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Deine Sitzung ist ungültig oder abgelaufen." },
        { status: 401 },
      );
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await admin
      .from("qrx_invoices")
      .select("id,user_id,invoice_number,status,pdf_path,storage_bucket")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .eq("invoice_type", "invoice")
      .maybeSingle<InvoiceRow>();

    if (error) {
      console.error("Invoice lookup failed:", error);
      return NextResponse.json(
        { error: "Rechnung konnte nicht geprüft werden." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Rechnung wurde nicht gefunden." },
        { status: 404 },
      );
    }

    if (!data.pdf_path) {
      return NextResponse.json(
        { error: "Für diese Rechnung ist noch keine PDF-Datei verfügbar." },
        { status: 409 },
      );
    }

    const bucket = data.storage_bucket?.trim() || "invoices";
    const { data: fileData, error: downloadError } = await admin.storage
      .from(bucket)
      .download(data.pdf_path);

    if (downloadError || !fileData) {
      console.error("Invoice storage download failed:", downloadError);
      return NextResponse.json(
        { error: "Die Rechnungs-PDF konnte nicht geladen werden." },
        { status: 502 },
      );
    }

    const bytes = await fileData.arrayBuffer();
    const filename = `${data.invoice_number || "Rechnung"}.pdf`;

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": buildContentDisposition(filename),
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Invoice download route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Die Rechnung konnte nicht heruntergeladen werden.",
      },
      { status: 500 },
    );
  }
}
