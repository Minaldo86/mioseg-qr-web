// src/lib/media.ts
// Zentrale Media Engine Hilfsfunktionen für Mioseg QR.
// Smart Image Delivery:
// - Karten/Listen/Explore nutzen immer kleine Varianten.
// - Detail/Hero/Galerie nutzen optimierte Varianten.
// - Bei force_original_quality wird Detail/Hero/Galerie auf Originalqualität umgestellt.
// - Download nutzt immer Original.

export type MediaUrlPurpose =
  | "thumb"
  | "medium"
  | "large"
  | "original"
  | "card"
  | "map"
  | "hero"
  | "gallery"
  | "detail"
  | "fullscreen"
  | "download";

export type MediaLike = {
  id?: string | null;
  url?: string | null;
  original_url?: string | null;
  large_url?: string | null;
  medium_url?: string | null;
  thumb_url?: string | null;
  is_original_private?: boolean | null;
  processing_status?: string | null;
};

export type BestMediaUrlOptions = {
  media: MediaLike | MediaLike[] | null | undefined;
  purpose?: MediaUrlPurpose;
  forceOriginal?: boolean | null;
};

export type DownloadMediaUrlOptions = {
  isOwner?: boolean;
  allowOriginalForOwner?: boolean;
  forceOriginal?: boolean | null;
};

export function normalizeMedia<T extends MediaLike>(media: T | T[] | null | undefined): T | null {
  if (Array.isArray(media)) return media[0] ?? null;
  return media ?? null;
}

function firstUrl(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed.length > 0) return trimmed;
  }
  return null;
}

function getOriginalUrl(media: MediaLike) {
  return firstUrl(media.original_url, media.url);
}

function getThumbUrl(media: MediaLike) {
  const original = getOriginalUrl(media);
  return firstUrl(media.thumb_url, media.medium_url, media.large_url, original);
}

function getMediumUrl(media: MediaLike) {
  const original = getOriginalUrl(media);
  return firstUrl(media.medium_url, media.large_url, media.thumb_url, original);
}

function getLargeUrl(media: MediaLike) {
  const original = getOriginalUrl(media);
  return firstUrl(media.large_url, media.medium_url, original, media.thumb_url);
}

function getForcedOriginalUrl(media: MediaLike) {
  const original = getOriginalUrl(media);
  return firstUrl(original, media.large_url, media.medium_url, media.thumb_url);
}

export function getBestMediaUrl(
  mediaInputOrOptions: MediaLike | MediaLike[] | BestMediaUrlOptions | null | undefined,
  legacyPurpose: MediaUrlPurpose = "medium",
  legacyForceOriginal = false
): string | null {
  const isOptionsObject =
    !!mediaInputOrOptions &&
    !Array.isArray(mediaInputOrOptions) &&
    typeof mediaInputOrOptions === "object" &&
    "media" in mediaInputOrOptions;

  const mediaInput = isOptionsObject
    ? (mediaInputOrOptions as BestMediaUrlOptions).media
    : (mediaInputOrOptions as MediaLike | MediaLike[] | null | undefined);

  const purpose = isOptionsObject
    ? (mediaInputOrOptions as BestMediaUrlOptions).purpose ?? "medium"
    : legacyPurpose;

  const forceOriginal = isOptionsObject
    ? Boolean((mediaInputOrOptions as BestMediaUrlOptions).forceOriginal)
    : Boolean(legacyForceOriginal);

  const media = normalizeMedia(mediaInput);
  if (!media) return null;

  // Wichtig: Explore, Karten und Listen dürfen niemals Originalbilder laden.
  // Auch dann nicht, wenn force_original_quality aktiv ist.
  if (purpose === "thumb" || purpose === "card" || purpose === "map") {
    return getThumbUrl(media);
  }

  if (purpose === "download" || purpose === "original") {
    return getForcedOriginalUrl(media);
  }

  if (
    forceOriginal &&
    (purpose === "hero" ||
      purpose === "gallery" ||
      purpose === "detail" ||
      purpose === "fullscreen" ||
      purpose === "large")
  ) {
    return getForcedOriginalUrl(media);
  }

  if (purpose === "medium" || purpose === "detail") {
    return getMediumUrl(media);
  }

  if (purpose === "hero" || purpose === "gallery" || purpose === "fullscreen" || purpose === "large") {
    return getLargeUrl(media);
  }

  return getMediumUrl(media);
}

export function getCardMediaUrl(media: MediaLike | MediaLike[] | null | undefined) {
  return getBestMediaUrl({ media, purpose: "card" });
}

export function getMapMediaUrl(media: MediaLike | MediaLike[] | null | undefined) {
  return getBestMediaUrl({ media, purpose: "map" });
}

export function getHeroMediaUrl(
  media: MediaLike | MediaLike[] | null | undefined,
  forceOriginal = false
) {
  return getBestMediaUrl({ media, purpose: "hero", forceOriginal });
}

export function getGalleryMediaUrl(
  media: MediaLike | MediaLike[] | null | undefined,
  forceOriginal = false
) {
  return getBestMediaUrl({ media, purpose: "gallery", forceOriginal });
}

export function getDetailMediaUrl(
  media: MediaLike | MediaLike[] | null | undefined,
  forceOriginal = false
) {
  return getBestMediaUrl({ media, purpose: "detail", forceOriginal });
}

export function getDownloadMediaUrl(
  media: MediaLike | MediaLike[] | null | undefined,
  opts?: DownloadMediaUrlOptions
) {
  // Backward compatibility:
  // allowOriginalForOwner=false wird z. B. in der App für normales Öffnen genutzt.
  // Dann liefern wir keine Originaldatei, sondern die große optimierte Variante.
  if (opts?.allowOriginalForOwner === false && !opts?.forceOriginal) {
    return getBestMediaUrl({ media, purpose: "fullscreen", forceOriginal: false });
  }

  return getBestMediaUrl({ media, purpose: "download" });
}

// Backward compatibility für bestehende App-Aufrufe.
export function getMediaDisplayUrl(
  media: MediaLike | MediaLike[] | null | undefined,
  forceOriginal = false
) {
  return getBestMediaUrl({ media, purpose: "detail", forceOriginal });
}

export function getMediaById<T extends MediaLike>(
  mediaList: T[] | null | undefined,
  mediaId: string | null | undefined
): T | null {
  if (!mediaId || !Array.isArray(mediaList)) return null;
  return mediaList.find((item) => item.id === mediaId) ?? null;
}
