type MediaOpenResult = {
  ok: boolean;
  openUrl?: string | null;
  error?: string;
};

export async function fetchMediaOpenUrl(mediaId: string): Promise<string> {
  const response = await fetch(
    `/api/admin/media-open?mediaId=${encodeURIComponent(mediaId)}`,
    { cache: "no-store" },
  );

  const payload = (await response.json()) as MediaOpenResult;

  if (!response.ok || !payload.openUrl) {
    throw new Error(payload.error || "Medium konnte nicht geöffnet werden.");
  }

  return payload.openUrl;
}

export async function openAdminMedia(mediaId?: string | null): Promise<void> {
  if (!mediaId) return;
  const openUrl = await fetchMediaOpenUrl(mediaId);
  window.open(openUrl, "_blank", "noopener,noreferrer");
}
