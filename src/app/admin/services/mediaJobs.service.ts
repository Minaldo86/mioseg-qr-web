import type { BulkMediaPreviewResult, MediaJobsResult } from "../types";

type ApiError = { error?: string };
type ProcessResult = { processed?: boolean; error?: string };

export type BulkMediaRequest = {
  type: string;
  status: string;
  minMb: string;
  search: string;
  limit: string;
  dryRun: boolean;
};

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function apiMessage(payload: ApiError, fallback: string): string {
  return payload.error || fallback;
}

export async function fetchMediaJobs(): Promise<MediaJobsResult> {
  const response = await fetch("/api/admin/media-jobs", { cache: "no-store" });
  const payload = await readJson<MediaJobsResult & ApiError>(response);

  if (!response.ok) {
    throw new Error(apiMessage(payload, "Media Jobs konnten nicht geladen werden."));
  }

  return payload;
}

export async function processNextMediaJob(): Promise<boolean> {
  const response = await fetch("/api/admin/media-jobs/process", { method: "POST" });
  const payload = await readJson<ProcessResult>(response);

  if (!response.ok) {
    throw new Error(payload.error || "Media Job konnte nicht verarbeitet werden.");
  }

  return Boolean(payload.processed);
}

export async function processMediaJobBatch(maxJobs: number): Promise<number> {
  const safeMaxJobs = Math.max(1, Math.min(25, Math.trunc(maxJobs)));
  let processedCount = 0;

  for (let index = 0; index < safeMaxJobs; index += 1) {
    const processed = await processNextMediaJob();
    if (!processed) break;
    processedCount += 1;
  }

  return processedCount;
}

export async function retryMediaJob(jobId: string): Promise<void> {
  const response = await fetch("/api/admin/media-jobs/retry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId }),
  });
  const payload = await readJson<ApiError>(response);

  if (!response.ok) {
    throw new Error(apiMessage(payload, "Media Job konnte nicht erneut gestartet werden."));
  }
}

export async function runBulkMediaJobs(
  request: BulkMediaRequest,
): Promise<BulkMediaPreviewResult> {
  const response = await fetch("/api/admin/media-jobs/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const payload = await readJson<BulkMediaPreviewResult & ApiError>(response);

  if (!response.ok) {
    throw new Error(
      apiMessage(
        payload,
        request.dryRun
          ? "Bulk-Vorschau konnte nicht geladen werden."
          : "Bulk-Reprocess konnte nicht gestartet werden.",
      ),
    );
  }

  return payload;
}
