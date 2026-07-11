import type { MediaTrafficStats } from "../types";

type ApiErrorPayload = {
  error?: unknown;
};

export async function fetchMediaTrafficStats(): Promise<MediaTrafficStats> {
  const response = await fetch("/api/admin/media-traffic", {
    cache: "no-store",
  });

  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as ApiErrorPayload).error ?? "")
        : "";

    throw new Error(
      message || "Traffic-Statistiken konnten nicht geladen werden.",
    );
  }

  return payload as MediaTrafficStats;
}
