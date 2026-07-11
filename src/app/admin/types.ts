export type MediaWarningSeverity = "info" | "warning" | "critical";

export type MediaWarningCategory =
  | "traffic"
  | "storage"
  | "cost"
  | "quality"
  | "jobs";

export type MediaHealthRecommendation = {
  id: string;
  severity: MediaWarningSeverity;
  category: MediaWarningCategory;
  title: string;
  description: string;
  actionLabel?: string;
  qrxId?: string | null;
  mediaId?: string | null;
  estimatedSavingsBytes?: number;
  estimatedSavingsCostCents?: number;
};

export type MediaActiveWarning = MediaHealthRecommendation & {
  priority: number;
  status: "active";
  detectedAt: string;
};

export type MediaTrafficSummary = {
  eventCount?: number | null;
  totalBytes?: number | null;
  todayBytes?: number | null;
  weekBytes?: number | null;
  monthBytes?: number | null;
  mediaCount?: number | null;
  qrxCount?: number | null;
  estimatedCostCents?: number | null;
  estimatedTodayCostCents?: number | null;
  estimatedWeekCostCents?: number | null;
  estimatedMonthCostCents?: number | null;
  estimatedStorageCostCents?: number | null;
  estimatedTotalCostCents?: number | null;
  totalStorageBytes?: number | null;
  trafficEgressCostCentsPerGb?: number | null;
  storageCostCentsPerGbMonth?: number | null;
  largestQrxBytes?: number | null;
  largestMediaBytes?: number | null;
  largestQrxSharePercent?: number | null;
  largestMediaSharePercent?: number | null;
  averageBytesPerEvent?: number | null;
  optimizedMediaCount?: number | null;
  optimizedSharePercent?: number | null;
  failedMediaCount?: number | null;
  failedSharePercent?: number | null;
  largeOriginalMediaCount?: number | null;
  largeOriginalBytes?: number | null;
  originalLikeBytes?: number | null;
  originalLikeSharePercent?: number | null;
  healthScore?: number | null;
  healthGrade?: "excellent" | "healthy" | "watch" | "critical" | string;
  healthStatus?: "empty" | "healthy" | "watch" | "critical" | string;
};

export type MediaTrafficQrxItem = {
  qrxId: string | null;
  title: string | null;
  companyName: string | null;
  eventCount: number;
  totalBytes: number;
  todayBytes?: number;
  weekBytes?: number;
  monthBytes: number;
  storageBytes?: number;
  estimatedTrafficCostCents?: number;
  estimatedStorageCostCents?: number;
  estimatedTotalCostCents?: number;
  lastSeenAt?: string | null;
};

export type MediaTrafficMediaItem = {
  mediaId: string | null;
  qrxId: string | null;
  filename: string | null;
  variant: string | null;
  eventCount: number;
  totalBytes: number;
  todayBytes?: number;
  weekBytes?: number;
  monthBytes: number;
  storageBytes?: number;
  estimatedTrafficCostCents?: number;
  estimatedStorageCostCents?: number;
  estimatedTotalCostCents?: number;
  lastSeenAt?: string | null;
};

export type MediaTrafficVariantItem = {
  variant: string;
  eventCount: number;
  totalBytes: number;
  todayBytes: number;
  weekBytes: number;
  monthBytes: number;
  sharePercent: number;
};

export type MediaTrafficStats = {
  ok: boolean;
  summary: MediaTrafficSummary;
  topQrx: MediaTrafficQrxItem[];
  topMedia: MediaTrafficMediaItem[];
  topQrxWeek?: MediaTrafficQrxItem[];
  topMediaWeek?: MediaTrafficMediaItem[];
  topCostQrx?: MediaTrafficQrxItem[];
  topCostMedia?: MediaTrafficMediaItem[];
  topVariants?: MediaTrafficVariantItem[];
  recommendations?: MediaHealthRecommendation[];
  activeWarnings?: MediaActiveWarning[];
  updatedAt: string;
};

export type MediaJobStatus = "queued" | "processing" | "done" | "failed" | string;

export type MediaJobEntry = {
  id: string;
  media_id: string;
  qrx_id: string | null;
  job_type: string | null;
  status: MediaJobStatus | null;
  reason: string | null;
  attempts: number | null;
  processing_error: string | null;
  created_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  updated_at: string | null;
};

export type MediaJobsResult = {
  ok: boolean;
  jobs: MediaJobEntry[];
  summary: {
    totalLoaded: number;
    queued: number;
    processing: number;
    done: number;
    failed: number;
  };
  updatedAt: string;
};

export type BulkPreviewItem = {
  id: string;
  qrx_id: string | null;
  filename: string | null;
  type: string | null;
  mime_type: string | null;
  processing_status: string | null;
  original_bytes: number | null;
};

export type BulkMediaPreviewResult = {
  ok: boolean;
  dryRun: boolean;
  matchedCount: number;
  createdCount?: number;
  sample?: BulkPreviewItem[];
};

export type StorageMediaItem = {
  id: string;
  qrx_id: string | null;
  filename: string | null;
  type: string | null;
  processing_status: string | null;
  originalBytes: number;
  optimizedBytes: number;
  savedBytes: number;
  savingsPercent: number;
};

export type StorageMediaStats = {
  ok: boolean;
  totals: {
    mediaCount: number;
    imageCount: number;
    fileCount: number;
    optimizedCount: number;
    processingCount: number;
    failedCount: number;
    originalBytes: number;
    optimizedBytes: number;
    savedBytes: number;
    savingsPercent: number;
    averageOriginalBytes: number;
    averageOptimizedBytes: number;
    averageSavingsPercent: number;
    largestOriginalBytes: number;
  };
  topLargest: StorageMediaItem[];
  topSavings: StorageMediaItem[];
  mediaItems: StorageMediaItem[];
  statusCounts: Record<string, number>;
  updatedAt: string;
};
