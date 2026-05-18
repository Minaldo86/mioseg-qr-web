import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    return username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Invoice-ID fehlt." }, { status: 400 });
    }

    const { data: invoice, error } = await supabaseAdmin
      .from("qrx_invoices")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return Response.json(
        { error: "Rechnung konnte nicht geladen werden.", details: error.message },
        { status: 500 }
      );
    }

    if (!invoice) {
      return Response.json({ error: "Rechnung nicht gefunden." }, { status: 404 });
    }

    const path =
      typeof invoice.pdf_path === "string" && invoice.pdf_path
        ? invoice.pdf_path
        : typeof invoice.storage_path === "string" && invoice.storage_path
          ? invoice.storage_path
          : null;

    const normalizedPath = path
      ?.replace(/^qrx-invoices\//, "")
      ?.replace(/^\/+/g, "");

    if (!path) {
      return Response.json({ error: "Für diese Rechnung ist noch kein PDF-Pfad hinterlegt." }, { status: 404 });
    }

    const bucket =
      typeof invoice.storage_bucket === "string" && invoice.storage_bucket
        ? invoice.storage_bucket
        : "qrx-invoices";

    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(normalizedPath, 60 * 10);

    if (signedError || !signed?.signedUrl) {
      return Response.json(
        { error: "PDF konnte nicht signiert werden.", details: signedError?.message ?? null, bucket, path },
        { status: 500 }
      );
    }

    return Response.redirect(signed.signedUrl, 302);
  } catch (error: unknown) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
