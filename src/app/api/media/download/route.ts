import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MediaRow = {
  id: string;
  qrx_id: string;
  url: string | null;
  filename: string | null;
  type: string | null;
};

function sanitizeFilename(value: string | null | undefined) {
  const trimmed = value?.trim() || "download";
  return trimmed.replace(/[\r\n"]/g, "_").slice(0, 180);
}

function encodeContentDispositionFilename(filename: string) {
  const asciiFallback = filename
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/[\\/:*?"<>|]/g, "_");

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(
    filename,
  )}`;
}

export async function GET(request: NextRequest) {
  const qrxId = request.nextUrl.searchParams.get("qrxId")?.trim();
  const mediaId = request.nextUrl.searchParams.get("mediaId")?.trim();
  const requestedFilename = request.nextUrl.searchParams
    .get("filename")
    ?.trim();

  if (!qrxId || !mediaId) {
    return NextResponse.json(
      { error: "qrxId und mediaId werden benötigt." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("qr_x_media")
    .select("id,qrx_id,url,filename,type")
    .eq("id", mediaId)
    .eq("qrx_id", qrxId)
    .maybeSingle()
    .returns<MediaRow>();

  if (error) {
    console.error("Media download lookup error:", error);
    return NextResponse.json(
      { error: "Datei konnte nicht geladen werden." },
      { status: 500 },
    );
  }

  if (!data?.url || data.type !== "file") {
    return NextResponse.json(
      { error: "Datei wurde nicht gefunden." },
      { status: 404 },
    );
  }

  let sourceResponse: Response;

  try {
    sourceResponse = await fetch(data.url, {
      cache: "no-store",
      redirect: "follow",
    });
  } catch (error) {
    console.error("Media source fetch error:", error);
    return NextResponse.json(
      { error: "Datei konnte nicht heruntergeladen werden." },
      { status: 502 },
    );
  }

  if (!sourceResponse.ok || !sourceResponse.body) {
    return NextResponse.json(
      { error: "Dateiquelle ist nicht verfügbar." },
      { status: 502 },
    );
  }

  const filename = sanitizeFilename(requestedFilename || data.filename);
  const headers = new Headers();

  headers.set(
    "Content-Type",
    sourceResponse.headers.get("content-type") || "application/octet-stream",
  );
  headers.set(
    "Content-Disposition",
    encodeContentDispositionFilename(filename),
  );
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");

  const contentLength = sourceResponse.headers.get("content-length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new NextResponse(sourceResponse.body, {
    status: 200,
    headers,
  });
}
