"use client";

import { useCallback, useEffect, useState } from "react";
import type { StorageMediaStats } from "../types";
import {
  getMediaStorageStats,
  type MediaStorageFilters,
} from "../services/mediaStorage.service";

const DEFAULT_FILTERS: Required<MediaStorageFilters> = {
  search: "",
  type: "all",
  status: "all",
  minMb: "10",
  sort: "largest",
};

export function useMediaStorage() {
  const [data, setData] = useState<StorageMediaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(DEFAULT_FILTERS.search);
  const [type, setType] = useState(DEFAULT_FILTERS.type);
  const [status, setStatus] = useState(DEFAULT_FILTERS.status);
  const [minMb, setMinMb] = useState(DEFAULT_FILTERS.minMb);
  const [sort, setSort] = useState(DEFAULT_FILTERS.sort);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getMediaStorageStats({
        search,
        type,
        status,
        minMb,
        sort,
      });

      setData(result);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Media-Statistiken konnten nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }, [minMb, search, sort, status, type]);

  const resetFilters = useCallback(() => {
    setSearch(DEFAULT_FILTERS.search);
    setType(DEFAULT_FILTERS.type);
    setStatus(DEFAULT_FILTERS.status);
    setMinMb(DEFAULT_FILTERS.minMb);
    setSort(DEFAULT_FILTERS.sort);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
    minMb,
    setMinMb,
    sort,
    setSort,
    load,
    resetFilters,
  };
}
