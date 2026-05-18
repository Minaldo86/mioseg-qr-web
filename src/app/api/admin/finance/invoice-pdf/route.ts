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

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim())
    )
  );
}

function normalizeStoragePath(path: string) {
  return path
    .replace(/^\/+/, "")
    .replace(/^invoices\//, "")
    .replace(/^qrx-invoices\//, "")
    .replace(/^qrx_invoice\//, "")
    .replace(/^qrx-invoice\//, "");
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

    const rawPath =
      typeof invoice.pdf_path === "string" && invoice.pdf_path
        ? invoice.pdf_path
        : typeof invoice.storage_path === "string" && invoice.storage_path
          ? invoice.storage_path
          : null;

    if (!rawPath) {
      return Response.json(
        { error: "Für diese Rechnung ist noch kein PDF-Pfad hinterlegt." },
        { status: 404 }
      );
    }

    const normalizedPath = normalizeStoragePath(rawPath);
    const fileName = normalizedPath.split("/").filter(Boolean).pop() || normalizedPath;

    const userId =
      typeof invoice.user_id === "string" && invoice.user_id
        ? invoice.user_id
        : null;

    const invoiceNumber =
      typeof invoice.invoice_number === "string" && invoice.invoice_number
        ? invoice.invoice_number
        : null;

    const storageBucket =
      typeof invoice.storage_bucket === "string" && invoice.storage_bucket
        ? invoice.storage_bucket
        : null;

    // Wichtig: Deine PDFs liegen laut Supabase Storage im Bucket "invoices".
    // Deshalb steht "invoices" bewusst vor alten/falschen Bucket-Namen.
    const bucketCandidates = uniqueValues([
      "invoices",
      storageBucket,
      "qrx-invoices",
      "qrx_invoice",
      "qrx-invoice",
    ]);

    const pathCandidates = uniqueValues([
      rawPath,
      normalizedPath,
      fileName,
      userId ? `${userId}/${fileName}` : null,
      invoiceNumber && userId ? `${userId}/${invoiceNumber}.pdf` : null,
      invoiceNumber ? `${invoiceNumber}.pdf` : null,
    ]);

    const attempts: Array<{
      bucket: string;
      path: string;
      error: string | null;
    }> = [];

    for (const bucket of bucketCandidates) {
      for (const path of pathCandidates) {
        const cleanPath = normalizeStoragePath(path);

        const { data: signed, error: signedError } = await supabaseAdmin.storage
          .from(bucket)
          .createSignedUrl(cleanPath, 60 * 10);

        if (signed?.signedUrl && !signedError) {
          return Response.redirect(signed.signedUrl, 302);
        }

        attempts.push({
          bucket,
          path: cleanPath,
          error: signedError?.message ?? "Object not found",
        });
      }
    }

    return Response.json(
      {
        error: "PDF konnte nicht im Storage gefunden werden.",
        invoiceId: id,
        invoiceNumber,
        rawPath,
        storageBucket,
        attempted: attempts.slice(0, 40),
        hint:
          "Die Rechnung existiert, aber die Datei wurde unter keinem getesteten Storage-Pfad gefunden. Prüfe Bucket 'invoices' und den exakten Objektpfad.",
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
