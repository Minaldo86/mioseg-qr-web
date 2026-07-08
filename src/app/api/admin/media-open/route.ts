import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const BUCKET = "qrx_media";

type MediaVariant = "auto" | "original" | "large" | "medium" | "thumb";

type MediaRow = {
  id: string;
  type: string | null;
  filename: string | null;
  url: string | null;
  storage_path: string | null;
  original_url: string | null;
  original_storage_path: string | null;
  large_url: string | null;
  large_storage_path: string | null;
  medium_url: string | null;
  medium_storage_path: string | null;
  thumb_url: string | null;
  thumb_storage_path: string | null;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

function pickFirst(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function withDownload(url: string, filename: string | null) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("download", filename?.trim() || "download");
    return parsed.toString();
  } catch {
    const glue = url.includes("?") ? "&" : "?";
    return `${url}${glue}download=${encodeURIComponent(filename?.trim() || "download")}`;
  }
}

async function publicUrlFromPath(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  path: string | null | undefined
) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

function normalizeVariant(value: string | null): MediaVariant {
  if (value === "original" || value === "large" || value === "medium" || value === "thumb") {
    return value;
  }
  return "auto";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId")?.trim();
    const variant = normalizeVariant(searchParams.get("variant"));

    if (!mediaId) {
      return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("qr_x_media")
      .select(
        "id, type, filename, url, storage_path, original_url, original_storage_path, large_url, large_storage_path, medium_url, medium_storage_path, thumb_url, thumb_storage_path"
      )
      .eq("id", mediaId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const media = data as MediaRow;
    const mediaType = String(media.type || "").toLowerCase();
    const isImage = mediaType === "image" || mediaType === "logo" || mediaType === "cover";

    const originalUrl = pickFirst(
      media.original_url,
      media.url,
      await publicUrlFromPath(supabase, media.original_storage_path || media.storage_path)
    );

    const largeUrl = pickFirst(
      media.large_url,
      await publicUrlFromPath(supabase, media.large_storage_path)
    );

    const mediumUrl = pickFirst(
      media.medium_url,
      await publicUrlFromPath(supabase, media.medium_storage_path)
    );

    const thumbUrl = pickFirst(
      media.thumb_url,
      await publicUrlFromPath(supabase, media.thumb_storage_path)
    );

    const variantUrls = {
      original: originalUrl,
      large: largeUrl,
      medium: mediumUrl,
      thumb: thumbUrl,
    };

    const requestedVariantUrl =
      variant === "original"
        ? originalUrl
        : variant === "large"
          ? largeUrl
          : variant === "medium"
            ? mediumUrl
            : variant === "thumb"
              ? thumbUrl
              : null;

    const openUrl = requestedVariantUrl || (isImage
      ? pickFirst(largeUrl, mediumUrl, originalUrl, thumbUrl)
      : pickFirst(originalUrl, media.url));

    if (!openUrl) {
      return NextResponse.json(
        { error: "No public URL or storage path found for this media" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: media.id,
      type: media.type,
      filename: media.filename,
      variant,
      openUrl,
      downloadUrl: withDownload(originalUrl || openUrl, media.filename),
      variantUrls,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
