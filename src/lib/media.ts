// src/lib/media.ts
// Zentrale Media Engine Hilfsfunktionen für Mioseg QR Web.
// Gleiche Logik wie in der App: kleine Bilder für Karten/Listen, größere für Hero/Galerie.

export type MediaUrlPurpose =
  | "thumb"
  | "medium"
  | "large"
  | "original"
  | "card"
  | "map"
  | "hero"
  | "gallery"
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

export function normalizeMedia<T extends MediaLike>(media: T | T[] | null | undefined): T | null {
  if (Array.isArray(media)) return media[0] ?? null;
  return media ?? null;
}

export function getBestMediaUrl(
  mediaInput: MediaLike | MediaLike[] | null | undefined,
  purpose: MediaUrlPurpose = "medium"
): string | null {
  const media = normalizeMedia(mediaInput);
  if (!media) return null;

  const original = media.original_url || media.url || null;

  if (purpose === "thumb" || purpose === "card" || purpose === "map") {
    return media.thumb_url || media.medium_url || media.large_url || original;
  }

  if (purpose === "medium") {
    return media.medium_url || media.large_url || media.thumb_url || original;
  }

  if (purpose === "hero" || purpose === "gallery" || purpose === "large") {
    return media.large_url || media.medium_url || media.original_url || media.url || media.thumb_url || null;
  }

  if (purpose === "download") {
    return media.large_url || media.medium_url || media.original_url || media.url || media.thumb_url || null;
  }

  return media.original_url || media.large_url || media.medium_url || media.url || media.thumb_url || null;
}

export function getCardMediaUrl(media: MediaLike | MediaLike[] | null | undefined) {
  return getBestMediaUrl(media, "card");
}

export function getMapMediaUrl(media: MediaLike | MediaLike[] | null | undefined) {
  return getBestMediaUrl(media, "map");
}

export function getHeroMediaUrl(media: MediaLike | MediaLike[] | null | undefined) {
  return getBestMediaUrl(media, "hero");
}

export function getMediaById<T extends MediaLike>(
  mediaList: T[] | null | undefined,
  mediaId: string | null | undefined
): T | null {
  if (!mediaId || !Array.isArray(mediaList)) return null;
  return mediaList.find((item) => item.id === mediaId) ?? null;
}
