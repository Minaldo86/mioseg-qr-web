import type { StorageMediaStats } from "../types";

export type MediaStorageFilters = {
  search?: string;
  type?: string;
  status?: string;
  minMb?: string;
  sort?: string;
};

type ApiErrorPayload = {
  error?: unknown;
};

function buildMediaStorageQuery(filters: MediaStorageFilters): string {
  const params = new URLSearchParams();

  const search = filters.search?.trim();
  const type = filters.type?.trim();
  const status = filters.status?.trim();
  const minMb = filters.minMb?.trim();
  const sort = filters.sort?.trim();

  if (search) params.set("search", search);
  if (type && type !== "all") params.set("type", type);
  if (status && status !== "all") params.set("status", status);
  if (minMb) params.set("minMb", minMb);
  if (sort) params.set("sort", sort);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getMediaStorageStats(
  filters: MediaStorageFilters,
): Promise<StorageMediaStats> {
  const response = await fetch(
    `/api/admin/media-stats${buildMediaStorageQuery(filters)}`,
    { cache: "no-store" },
  );

  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload
        ? String((payload as ApiErrorPayload).error ?? "")
        : "";

    throw new Error(
      message || "Media-Statistiken konnten nicht geladen werden.",
    );
  }

  return payload as StorageMediaStats;
}
