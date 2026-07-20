"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../dashboard.module.css";

type QrxType = "normal" | "business";

type LocationMode = "none" | "current" | "manual";

type NewsItem = { text: string; createdAt: string };

type CollectionCandidate = {
  id: string;
  title: string | null;
  company_name: string | null;
  type: QrxType | string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  source: "own" | "saved";
  custom_title?: string | null;
};

type SavedCollectionEntry = Omit<
  CollectionCandidate,
  "source" | "custom_title"
> & {
  deleted_at?: string | null;
  suspended?: boolean | null;
};

type SavedCollectionCandidateRow = {
  qrx_id: string | null;
  custom_title?: string | null;
  qr_x_entries: SavedCollectionEntry | SavedCollectionEntry[] | null;
};

const MAX_VISIBLE_NEWS = 5;

type BusinessCategory =
  | "praxis_gesundheit"
  | "gastronomie"
  | "unternehmen"
  | "dienstleistung"
  | "handwerk"
  | "event"
  | "verein"
  | "wohltaetigkeit"
  | "sehenswuerdigkeit"
  | "sonstiges";

const BUSINESS_CATEGORY_OPTIONS: Array<{
  value: BusinessCategory;
  label: string;
  icon: string;
}> = [
  { value: "praxis_gesundheit", label: "Praxis & Gesundheit", icon: "🏥" },
  { value: "gastronomie", label: "Gastronomie", icon: "🍽️" },
  { value: "unternehmen", label: "Unternehmen", icon: "🏢" },
  { value: "dienstleistung", label: "Dienstleistung", icon: "🛠️" },
  { value: "handwerk", label: "Handwerk", icon: "🔨" },
  { value: "event", label: "Event", icon: "📅" },
  { value: "verein", label: "Verein", icon: "👥" },
  { value: "wohltaetigkeit", label: "Wohltätigkeit", icon: "♡" },
  { value: "sehenswuerdigkeit", label: "Sehenswürdigkeit", icon: "📷" },
  { value: "sonstiges", label: "Sonstiges", icon: "▦" },
];

const QRX_VERIFICATION_BUCKET = "qrx-verification-documents";
const QRX_VERIFICATION_COST_CREDITS = 10;
const FREE_STORAGE_MB = 2;
const STORAGE_PACK_MB = 5;

type PrepareUploadResponse = {
  uploadUrl?: string;
  signedUrl?: string;
  signed_url?: string;
  url?: string;
  storagePath?: string;
  storage_path?: string;
  path?: string;
  charged_credits?: number;
  new_balance?: number;
};

type FinalizeUploadResponse = {
  publicUrl?: string;
  public_url?: string;
  url?: string;
  media?: {
    id?: string | null;
    url?: string | null;
  } | null;
};

type SelectedMediaFile = {
  id: string;
  file: File;
  previewUrl: string | null;
};

type SelectedVerificationDocument = {
  id: string;
  file: File;
  previewUrl: string | null;
  documentType: "image" | "pdf";
};

function pickFirstString(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 8) return fromName.toLowerCase();

  const fromType = file.type.split("/").pop();
  return fromType && fromType.trim() ? fromType : "jpg";
}

function buildUploadFilename(
  prefix: "logo" | "cover" | "gallery" | "file",
  file: File,
) {
  const ext = getFileExtension(file).replace(/[^a-z0-9]/gi, "") || "bin";
  return `${prefix}-${Date.now().toString()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;
}

function formatBytes(bytes: number | null | undefined) {
  const value = Number(bytes ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "–";

  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  }

  if (value >= 1024) {
    return `${(value / 1024).toFixed(1).replace(".", ",")} KB`;
  }

  return `${value} B`;
}

function formatMb(value: number) {
  return `${value.toFixed(1).replace(".", ",")} MB`;
}

function isImageMime(file: File) {
  return file.type.startsWith("image/");
}

function buildSelectedMediaFile(file: File): SelectedMediaFile {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

  return {
    id: `${Date.now().toString()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${safeName}`,
    file,
    previewUrl: isImageMime(file) ? URL.createObjectURL(file) : null,
  };
}

function revokeSelectedMediaPreview(item: SelectedMediaFile) {
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function buildSelectedVerificationDocument(
  file: File,
): SelectedVerificationDocument {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

  return {
    id: `${Date.now().toString()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${safeName}`,
    file,
    previewUrl: isImageMime(file) ? URL.createObjectURL(file) : null,
    documentType: isPdfFile(file) ? "pdf" : "image",
  };
}

function revokeVerificationDocumentPreview(
  item: SelectedVerificationDocument | null,
) {
  if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

function sanitizeFilename(value: string) {
  return (
    value
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `verification-${Date.now().toString()}`
  );
}

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim())
    return value[0];
  return fallback;
}

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalNumber(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(",", ".");
  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`${label} muss eine gültige Zahl sein.`);
  }

  return numberValue;
}

type ErrorLike = {
  message?: unknown;
  error_description?: unknown;
  details?: unknown;
  hint?: unknown;
};

function normalizeErrorMessage(error: unknown) {
  const errorLike = error as ErrorLike;

  return String(
    errorLike.message ??
      errorLike.error_description ??
      errorLike.details ??
      errorLike.hint ??
      error ??
      "Unbekannter Fehler",
  );
}

function isMissingColumnError(error: unknown, columnName: string) {
  return normalizeErrorMessage(error)
    .toLowerCase()
    .includes(columnName.toLowerCase());
}

type NewQrxDraft = {
  savedAt: string;
  qrxType: QrxType;
  title: string;
  companyName: string;
  category: BusinessCategory;
  description: string;
  newsDraft: string;
  newsItems: NewsItem[];
  locationMode: LocationMode;
  locationName: string;
  locationLat: string;
  locationLng: string;
  ctaPhone: string;
  ctaWebsite: string;
  ctaEmail: string;
  ctaNavigation: string;
  passwordProtected: boolean;
  wantsVerification: boolean;
  collectionQrxIds: string[];
};

const NEW_QRX_DRAFT_STORAGE_PREFIX = "mioseg.qrx.new.draft.v1";

function getNewQrxDraftStorageKey(locale: string) {
  return `${NEW_QRX_DRAFT_STORAGE_PREFIX}.${locale || "de"}`;
}

function isSafeBusinessCategory(value: unknown): value is BusinessCategory {
  return BUSINESS_CATEGORY_OPTIONS.some((item) => item.value === value);
}

function isSafeLocationMode(value: unknown): value is LocationMode {
  return value === "none" || value === "current" || value === "manual";
}

function isSafeQrxType(value: unknown): value is QrxType {
  return value === "normal" || value === "business";
}

function normalizeDraftNewsItems(value: unknown): NewsItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item) => typeof item?.text === "string" && item.text.trim().length > 0,
    )
    .map((item) => ({
      text: item.text.trim(),
      createdAt:
        typeof item.createdAt === "string" && item.createdAt.trim().length > 0
          ? item.createdAt
          : new Date().toISOString(),
    }));
}

export default function NewQrxPage() {
  const router = useRouter();
  const params = useParams();

  const locale = getParam(
    params?.locale as string | string[] | undefined,
    "de",
  );

  const [qrxType, setQrxType] = useState<QrxType>("normal");
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState<BusinessCategory>("unternehmen");
  const [description, setDescription] = useState("");
  const [newsDraft, setNewsDraft] = useState("");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [locationMode, setLocationMode] = useState<LocationMode>("none");
  const [locationName, setLocationName] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [ctaPhone, setCtaPhone] = useState("");
  const [ctaWebsite, setCtaWebsite] = useState("");
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaNavigation, setCtaNavigation] = useState("");
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [qrxPassword, setQrxPassword] = useState("");
  const [qrxPasswordRepeat, setQrxPasswordRepeat] = useState("");
  const [wantsVerification, setWantsVerification] = useState(false);
  const [verificationDocument, setVerificationDocument] =
    useState<SelectedVerificationDocument | null>(null);

  const [collectionCandidates, setCollectionCandidates] = useState<CollectionCandidate[]>([]);
  const [selectedCollectionQrxIds, setSelectedCollectionQrxIds] = useState<string[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [collectionTab, setCollectionTab] = useState<"own" | "saved">("own");
  const [collectionSearch, setCollectionSearch] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<SelectedMediaFile[]>([]);
  const [fileUploads, setFileUploads] = useState<SelectedMediaFile[]>([]);
  const logoPreviewRef = useRef<string | null>(null);
  const coverPreviewRef = useRef<string | null>(null);
  const galleryFilesRef = useRef<SelectedMediaFile[]>([]);
  const fileUploadsRef = useRef<SelectedMediaFile[]>([]);
  const verificationDocumentRef = useRef<SelectedVerificationDocument | null>(
    null,
  );

  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const draftHydratedRef = useRef(false);
  const draftSaveTimerRef = useRef<number | null>(null);
  const draftStorageKey = useMemo(
    () => getNewQrxDraftStorageKey(locale),
    [locale],
  );

  const [credits, setCredits] = useState<number | null>(null);
  const [normalQrxCount, setNormalQrxCount] = useState<number | null>(null);
  const [businessQrxCount, setBusinessQrxCount] = useState<number | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);

  const creationCostCredits = useMemo(() => {
    if (qrxType === "business") {
      if (businessQrxCount == null) return null;
      return businessQrxCount === 0 ? 2 : 7;
    }

    if (normalQrxCount == null) return null;
    return normalQrxCount === 0 ? 0 : 5;
  }, [qrxType, normalQrxCount, businessQrxCount]);

  const verificationCredits = useMemo(() => {
    return qrxType === "business" && wantsVerification
      ? QRX_VERIFICATION_COST_CREDITS
      : 0;
  }, [qrxType, wantsVerification]);

  const selectedStorageBytes = useMemo(() => {
    const logoBytes = logoFile?.size ?? 0;
    const coverBytes = coverFile?.size ?? 0;
    const galleryBytes = galleryFiles.reduce(
      (sum, item) => sum + item.file.size,
      0,
    );
    const fileBytes = fileUploads.reduce(
      (sum, item) => sum + item.file.size,
      0,
    );
    return logoBytes + coverBytes + galleryBytes + fileBytes;
  }, [logoFile, coverFile, galleryFiles, fileUploads]);

  const selectedStorageMb = useMemo(() => {
    return selectedStorageBytes / (1024 * 1024);
  }, [selectedStorageBytes]);

  const estimatedStorageCredits = useMemo(() => {
    const extraMb = Math.max(0, selectedStorageMb - FREE_STORAGE_MB);
    return Math.ceil(extraMb / STORAGE_PACK_MB);
  }, [selectedStorageMb]);

  const estimatedStorageLimitMb = useMemo(() => {
    return FREE_STORAGE_MB + estimatedStorageCredits * STORAGE_PACK_MB;
  }, [estimatedStorageCredits]);

  const totalCostCredits = useMemo(() => {
    if (creationCostCredits == null) return null;
    return creationCostCredits + verificationCredits + estimatedStorageCredits;
  }, [creationCostCredits, verificationCredits, estimatedStorageCredits]);

  const hasEnoughCredits =
    totalCostCredits != null && credits != null
      ? credits >= totalCostCredits
      : false;

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawDraft = window.localStorage.getItem(draftStorageKey);

      if (!rawDraft) {
        draftHydratedRef.current = true;
        return;
      }

      const draft = JSON.parse(rawDraft) as Partial<NewQrxDraft>;

      if (isSafeQrxType(draft.qrxType)) setQrxType(draft.qrxType);
      if (typeof draft.title === "string") setTitle(draft.title);
      if (typeof draft.companyName === "string")
        setCompanyName(draft.companyName);
      if (isSafeBusinessCategory(draft.category)) setCategory(draft.category);
      if (typeof draft.description === "string")
        setDescription(draft.description);
      if (typeof draft.newsDraft === "string") setNewsDraft(draft.newsDraft);
      setNewsItems(normalizeDraftNewsItems(draft.newsItems));
      if (isSafeLocationMode(draft.locationMode))
        setLocationMode(draft.locationMode);
      if (typeof draft.locationName === "string")
        setLocationName(draft.locationName);
      if (typeof draft.locationLat === "string")
        setLocationLat(draft.locationLat);
      if (typeof draft.locationLng === "string")
        setLocationLng(draft.locationLng);
      if (typeof draft.ctaPhone === "string") setCtaPhone(draft.ctaPhone);
      if (typeof draft.ctaWebsite === "string") setCtaWebsite(draft.ctaWebsite);
      if (typeof draft.ctaEmail === "string") setCtaEmail(draft.ctaEmail);
      if (typeof draft.ctaNavigation === "string")
        setCtaNavigation(draft.ctaNavigation);
      if (typeof draft.passwordProtected === "boolean")
        setPasswordProtected(draft.passwordProtected);
      if (typeof draft.wantsVerification === "boolean")
        setWantsVerification(draft.wantsVerification);
      if (Array.isArray(draft.collectionQrxIds)) {
        setSelectedCollectionQrxIds(
          draft.collectionQrxIds.filter((value): value is string => typeof value === "string" && value.trim().length > 0),
        );
      }

      setQrxPassword("");
      setQrxPasswordRepeat("");
      setDraftNotice(
        "Dein QR-X Entwurf wurde wiederhergestellt. Bitte wähle Logo, Cover, Galerie-Bilder, Dateien/PDFs und Verifizierungsnachweise bei Bedarf erneut aus.",
      );
    } catch (restoreError) {
      console.warn(
        "QR-X Entwurf konnte nicht wiederhergestellt werden:",
        restoreError,
      );
      try {
        window.localStorage.removeItem(draftStorageKey);
      } catch {
        // ignore
      }
    } finally {
      draftHydratedRef.current = true;
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !draftHydratedRef.current) return;

    if (draftSaveTimerRef.current) {
      window.clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = window.setTimeout(() => {
      const draft: NewQrxDraft = {
        savedAt: new Date().toISOString(),
        qrxType,
        title,
        companyName,
        category,
        description,
        newsDraft,
        newsItems,
        locationMode,
        locationName,
        locationLat,
        locationLng,
        ctaPhone,
        ctaWebsite,
        ctaEmail,
        ctaNavigation,
        passwordProtected,
        wantsVerification,
        collectionQrxIds: selectedCollectionQrxIds,
      };

      try {
        const hasTextDraft =
          title.trim().length > 0 ||
          companyName.trim().length > 0 ||
          description.trim().length > 0 ||
          newsDraft.trim().length > 0 ||
          newsItems.length > 0 ||
          locationName.trim().length > 0 ||
          locationLat.trim().length > 0 ||
          locationLng.trim().length > 0 ||
          ctaPhone.trim().length > 0 ||
          ctaWebsite.trim().length > 0 ||
          ctaEmail.trim().length > 0 ||
          ctaNavigation.trim().length > 0 ||
          qrxType !== "normal" ||
          passwordProtected ||
          wantsVerification ||
          selectedCollectionQrxIds.length > 0;

        if (hasTextDraft) {
          window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
        } else {
          window.localStorage.removeItem(draftStorageKey);
        }
      } catch (saveError) {
        console.warn(
          "QR-X Entwurf konnte nicht gespeichert werden:",
          saveError,
        );
      }
    }, 350);

    return () => {
      if (draftSaveTimerRef.current) {
        window.clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, [
    draftStorageKey,
    qrxType,
    title,
    companyName,
    category,
    description,
    newsDraft,
    newsItems,
    locationMode,
    locationName,
    locationLat,
    locationLng,
    ctaPhone,
    ctaWebsite,
    ctaEmail,
    ctaNavigation,
    passwordProtected,
    wantsVerification,
    selectedCollectionQrxIds,
  ]);

  useEffect(() => {
    void loadCreditAndPricingData();
    void loadCollectionCandidates();
  }, []);

  useEffect(() => {
    logoPreviewRef.current = logoPreview;
  }, [logoPreview]);

  useEffect(() => {
    coverPreviewRef.current = coverPreview;
  }, [coverPreview]);

  useEffect(() => {
    galleryFilesRef.current = galleryFiles;
  }, [galleryFiles]);

  useEffect(() => {
    fileUploadsRef.current = fileUploads;
  }, [fileUploads]);

  useEffect(() => {
    verificationDocumentRef.current = verificationDocument;
  }, [verificationDocument]);

  useEffect(() => {
    if (qrxType !== "business") {
      setWantsVerification(false);
      setVerificationDocument((current) => {
        revokeVerificationDocumentPreview(current);
        return null;
      });
    }
  }, [qrxType]);

  useEffect(() => {
    return () => {
      if (logoPreviewRef.current) URL.revokeObjectURL(logoPreviewRef.current);
      if (coverPreviewRef.current) URL.revokeObjectURL(coverPreviewRef.current);
      galleryFilesRef.current.forEach(revokeSelectedMediaPreview);
      fileUploadsRef.current.forEach(revokeSelectedMediaPreview);
      revokeVerificationDocumentPreview(verificationDocumentRef.current);
    };
  }, []);

  async function loadCollectionCandidates() {
    setCollectionLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        setCollectionCandidates([]);
        return;
      }

      const [ownResult, savedResult] = await Promise.all([
        supabase
          .from("qr_x_entries")
          .select("id,title,company_name,type,logo_url,cover_image_url")
          .eq("owner_user_id", user.id)
          .is("deleted_at", null)
          .or("suspended.is.null,suspended.eq.false")
          .order("created_at", { ascending: false }),
        supabase
          .from("qrx_saves")
          .select(`
            qrx_id,
            custom_title,
            qr_x_entries (
              id,title,company_name,type,logo_url,cover_image_url,deleted_at,suspended
            )
          `)
          .eq("user_id", user.id),
      ]);

      if (ownResult.error) throw ownResult.error;
      if (savedResult.error) throw savedResult.error;

      const ownItems: CollectionCandidate[] = (ownResult.data ?? []).map((item) => ({
        ...(item as Omit<CollectionCandidate, "source">),
        source: "own" as const,
      }));
      const ownIds = new Set(ownItems.map((item) => item.id));

      const savedRows = savedResult.data as unknown as SavedCollectionCandidateRow[] | null;

      const savedItems = (savedRows ?? []).reduce<CollectionCandidate[]>((items, row) => {
        const entry = Array.isArray(row.qr_x_entries)
          ? row.qr_x_entries[0] ?? null
          : row.qr_x_entries;

        if (
          !entry ||
          entry.deleted_at ||
          entry.suspended === true ||
          ownIds.has(entry.id)
        ) {
          return items;
        }

        items.push({
          id: entry.id,
          title: entry.title,
          company_name: entry.company_name,
          type: entry.type,
          logo_url: entry.logo_url,
          cover_image_url: entry.cover_image_url,
          source: "saved",
          custom_title: row.custom_title ?? null,
        });

        return items;
      }, []);

      setCollectionCandidates([...ownItems, ...savedItems]);
    } catch (error) {
      console.warn("QR-X Sammlung konnte nicht geladen werden:", error);
      setCollectionCandidates([]);
    } finally {
      setCollectionLoading(false);
    }
  }

  function toggleCollectionQrx(id: string) {
    setSelectedCollectionQrxIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function removeCollectionQrx(id: string) {
    setSelectedCollectionQrxIds((current) => current.filter((value) => value !== id));
  }

  async function saveCollectionItems(args: {
    collectionQrxId: string;
    userId: string;
  }) {
    if (selectedCollectionQrxIds.length === 0) return;

    const rows = selectedCollectionQrxIds.map((linkedQrxId, index) => ({
      collection_qrx_id: args.collectionQrxId,
      linked_qrx_id: linkedQrxId,
      added_by: args.userId,
      sort_order: index,
    }));

    const { error } = await supabase.from("qrx_collection_items").insert(rows);
    if (error) throw error;
  }

  async function loadCreditAndPricingData() {
    setPricingLoading(true);
    setErrorText(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setCredits(null);
        setNormalQrxCount(null);
        setBusinessQrxCount(null);
        return;
      }

      const [creditsRes, normalRes, businessRes] = await Promise.all([
        supabase
          .from("qrx_credits")
          .select("credits")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("qr_x_entries")
          .select("*", { count: "exact", head: true })
          .eq("owner_user_id", user.id)
          .eq("type", "normal"),
        supabase
          .from("qr_x_entries")
          .select("*", { count: "exact", head: true })
          .eq("owner_user_id", user.id)
          .eq("type", "business"),
      ]);

      if (creditsRes.error) throw creditsRes.error;
      if (normalRes.error) throw normalRes.error;
      if (businessRes.error) throw businessRes.error;

      if (!creditsRes.data) {
        const { data: inserted, error: insertCreditError } = await supabase
          .from("qrx_credits")
          .upsert(
            { user_id: user.id, credits: 0 },
            { onConflict: "user_id", ignoreDuplicates: false },
          )
          .select("credits")
          .maybeSingle();

        if (insertCreditError) throw insertCreditError;
        setCredits(Number(inserted?.credits ?? 0));
      } else {
        const creditRow = creditsRes.data as { credits?: number | null } | null;
        setCredits(Number(creditRow?.credits ?? 0));
      }

      setNormalQrxCount(
        typeof normalRes.count === "number" ? normalRes.count : 0,
      );
      setBusinessQrxCount(
        typeof businessRes.count === "number" ? businessRes.count : 0,
      );
    } catch (error) {
      console.error("QRX PRICING LOAD ERROR", error);
      setErrorText(
        normalizeErrorMessage(error) ||
          "Credits und QR-X-Kosten konnten nicht geladen werden.",
      );
    } finally {
      setPricingLoading(false);
    }
  }

  async function spendCredits(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return credits ?? 0;

    const { data, error } = await supabase.rpc("spend_credits", {
      p_amount: amount,
    });

    if (error) {
      throw new Error(
        normalizeErrorMessage(error) ||
          "Credits konnten nicht abgezogen werden.",
      );
    }

    const nextCredits =
      typeof data === "number" ? data : Math.max(0, (credits ?? 0) - amount);
    setCredits(nextCredits);
    return nextCredits;
  }

  async function addCredits(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return credits ?? 0;

    const { data, error } = await supabase.rpc("add_credits", {
      p_amount: amount,
    });

    if (error) {
      throw new Error(
        normalizeErrorMessage(error) ||
          "Credits konnten nicht zurückgebucht werden.",
      );
    }

    const nextCredits =
      typeof data === "number" ? data : (credits ?? 0) + amount;
    setCredits(nextCredits);
    return nextCredits;
  }

  async function deleteCreatedQrxIfNeeded(qrxId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      await supabase.functions.invoke("delete-qrx", {
        body: { qrxId },
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      });
    } catch (deleteError) {
      console.warn("QR-X Cleanup nach Fehler fehlgeschlagen:", deleteError);
    }
  }

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    const token = session?.access_token;
    if (!token) {
      throw new Error(
        "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
      );
    }

    return token;
  }

  async function prepareUpload(args: {
    qrxId: string;
    type: "image" | "file";
    filename: string;
    mimeType: string;
    bytes: number;
  }) {
    const token = await getAccessToken();

    const { data, error } = await supabase.functions.invoke(
      "qrx-media-prepare-upload",
      {
        body: {
          qrxId: args.qrxId,
          type: args.type,
          filename: args.filename,
          mimeType: args.mimeType,
          bytes: args.bytes,
        },
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (error) throw error;

    const response = (data ?? {}) as PrepareUploadResponse;
    const uploadUrl = pickFirstString(
      response.uploadUrl,
      response.signedUrl,
      response.signed_url,
      response.url,
    );
    const storagePath = pickFirstString(
      response.storagePath,
      response.storage_path,
      response.path,
    );

    if (!uploadUrl || !storagePath) {
      throw new Error("Prepare-Upload: uploadUrl oder storagePath fehlt.");
    }

    return {
      uploadUrl,
      storagePath,
      chargedCredits:
        typeof response.charged_credits === "number"
          ? response.charged_credits
          : null,
      newBalance:
        typeof response.new_balance === "number" ? response.new_balance : null,
    };
  }

  async function finalizeUpload(args: {
    qrxId: string;
    type: "image" | "file";
    filename: string;
    mimeType: string;
    bytes: number;
    storagePath: string;
  }) {
    const token = await getAccessToken();

    const { data, error } = await supabase.functions.invoke(
      "qrx-media-finalize-upload",
      {
        body: {
          qrxId: args.qrxId,
          type: args.type,
          filename: args.filename,
          mimeType: args.mimeType,
          bytes: args.bytes,
          storagePath: args.storagePath,
        },
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (error) throw error;

    const response = (data ?? {}) as FinalizeUploadResponse;
    const publicUrl = pickFirstString(
      response.publicUrl,
      response.public_url,
      response.url,
      response.media?.url,
    );

    if (!publicUrl) {
      throw new Error("Finalize-Upload: publicUrl fehlt.");
    }

    // Sicherheits-Fallback wie in der App:
    // Falls die Edge Function zwar die Datei finalisiert, aber keinen Datensatz
    // in qr_x_media zurückgibt, legen wir den Eintrag hier nachträglich an.
    // Dadurch landen Galerie-Bilder sicher als type="image" und Dateien/PDFs
    // sicher als type="file" in qr_x_media.
    if (!response.media?.id) {
      const { data: existingRow, error: existingError } = await supabase
        .from("qr_x_media")
        .select("id")
        .eq("qrx_id", args.qrxId)
        .eq("url", publicUrl)
        .eq("filename", args.filename)
        .maybeSingle();

      if (existingError) {
        console.warn(
          "qr_x_media existing check fehlgeschlagen:",
          existingError,
        );
      }

      if (!existingRow?.id) {
        const { error: mediaInsertError } = await supabase
          .from("qr_x_media")
          .insert({
            qrx_id: args.qrxId,
            type: args.type,
            url: publicUrl,
            filename: args.filename,
            bytes: args.bytes,
          });

        if (mediaInsertError) {
          console.warn(
            "qr_x_media fallback insert fehlgeschlagen:",
            mediaInsertError,
          );
        }
      }
    }

    return { publicUrl };
  }

  async function uploadQrxMedia(args: {
    qrxId: string;
    file: File;
    prefix: "logo" | "cover" | "gallery" | "file";
    mediaType?: "image" | "file";
  }) {
    const filename = buildUploadFilename(args.prefix, args.file);
    const mimeType =
      args.file.type ||
      (args.mediaType === "file" ? "application/octet-stream" : "image/jpeg");
    const bytes = args.file.size;

    const prepared = await prepareUpload({
      qrxId: args.qrxId,
      type: args.mediaType ?? "image",
      filename,
      mimeType,
      bytes,
    });

    const arrayBuffer = await args.file.arrayBuffer();
    const uploadResponse = await fetch(prepared.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: arrayBuffer,
    });

    if (!uploadResponse.ok) {
      const message = await uploadResponse.text().catch(() => "");
      throw new Error(
        `Upload fehlgeschlagen (${uploadResponse.status}): ${message || "Unbekannter Fehler"}`,
      );
    }

    const finalized = await finalizeUpload({
      qrxId: args.qrxId,
      type: args.mediaType ?? "image",
      filename,
      mimeType,
      bytes,
      storagePath: prepared.storagePath,
    });

    return {
      publicUrl: finalized.publicUrl,
      chargedCredits: prepared.chargedCredits ?? 0,
    };
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setCoverFile(file);

    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearLogoSelection() {
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  }

  function clearCoverSelection() {
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
  }

  function handleGalleryFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []).filter(
      isImageMime,
    );

    if (selectedFiles.length > 0) {
      setGalleryFiles((current) => [
        ...current,
        ...selectedFiles.map(buildSelectedMediaFile),
      ]);
    }

    event.target.value = "";
  }

  function handleFileUploadsChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length > 0) {
      setFileUploads((current) => [
        ...current,
        ...selectedFiles.map(buildSelectedMediaFile),
      ]);
    }

    event.target.value = "";
  }

  function removeGalleryFile(id: string) {
    setGalleryFiles((current) => {
      const itemToRemove = current.find((item) => item.id === id);
      if (itemToRemove) revokeSelectedMediaPreview(itemToRemove);
      return current.filter((item) => item.id !== id);
    });
  }

  function removeFileUpload(id: string) {
    setFileUploads((current) => {
      const itemToRemove = current.find((item) => item.id === id);
      if (itemToRemove) revokeSelectedMediaPreview(itemToRemove);
      return current.filter((item) => item.id !== id);
    });
  }

  function clearGalleryFiles() {
    setGalleryFiles((current) => {
      current.forEach(revokeSelectedMediaPreview);
      return [];
    });
  }

  function clearFileUploads() {
    setFileUploads((current) => {
      current.forEach(revokeSelectedMediaPreview);
      return [];
    });
  }

  function addNewsItem() {
    const text = newsDraft.trim();

    if (!text) {
      setErrorText("Bitte gib zuerst einen Text für die News ein.");
      return;
    }

    setNewsItems((current) => [
      { text, createdAt: new Date().toISOString() },
      ...current,
    ]);
    setNewsDraft("");
    setErrorText(null);
  }

  function removeNewsItem(indexToRemove: number) {
    setNewsItems((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  }

  function handleVerificationDocumentChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      event.target.value = "";
      return;
    }

    if (!isImageMime(file) && !isPdfFile(file)) {
      setErrorText(
        "Bitte lade für die Verifizierung nur ein Bild oder eine PDF-Datei hoch.",
      );
      event.target.value = "";
      return;
    }

    setVerificationDocument((current) => {
      revokeVerificationDocumentPreview(current);
      return buildSelectedVerificationDocument(file);
    });
    event.target.value = "";
  }

  function clearVerificationDocument() {
    setVerificationDocument((current) => {
      revokeVerificationDocumentPreview(current);
      return null;
    });
  }

  function clearSavedDraft() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(draftStorageKey);
      } catch (draftError) {
        console.warn("QR-X Entwurf konnte nicht gelöscht werden:", draftError);
      }
    }

    setDraftNotice(null);
  }

  async function uploadVerificationDocument(args: {
    userId: string;
    qrxId: string;
    document: SelectedVerificationDocument;
  }) {
    const safeFilename = sanitizeFilename(args.document.file.name);
    const storagePath = `${args.userId}/${args.qrxId}/${Date.now().toString()}-${safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from(QRX_VERIFICATION_BUCKET)
      .upload(storagePath, args.document.file, {
        contentType:
          args.document.file.type ||
          (args.document.documentType === "pdf"
            ? "application/pdf"
            : "application/octet-stream"),
        upsert: false,
      });

    if (uploadError) throw uploadError;

    return {
      storagePath,
      documentUrl: `storage://${QRX_VERIFICATION_BUCKET}/${storagePath}`,
    };
  }

  function handleLocationModeChange(nextMode: LocationMode) {
    setLocationMode(nextMode);

    if (nextMode === "none") {
      setLocationName("");
      setLocationLat("");
      setLocationLng("");
    }
  }

  async function getCurrentLocation() {
    setErrorText(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationMode("manual");
      setErrorText(
        "Standort konnte nicht automatisch ermittelt werden. Bitte gib die Koordinaten manuell ein.",
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationMode("current");
        setLocationLat(String(position.coords.latitude));
        setLocationLng(String(position.coords.longitude));
        setLocationLoading(false);
      },
      (geoError) => {
        console.warn("QRX GEOLOCATION ERROR", geoError);
        setLocationMode("manual");
        setLocationLoading(false);
        setErrorText(
          "Standort konnte nicht automatisch ermittelt werden. Bitte gib die Koordinaten manuell ein.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  async function saveQrxPasswordProtection(args: {
    qrxId: string;
    enabled: boolean;
    password: string;
  }) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const token = session?.access_token;

    if (!token) {
      throw new Error(
        "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
      );
    }

    const { error } = await supabase.functions.invoke("set-qrx-password", {
      body: {
        qrxId: args.qrxId,
        enabled: args.enabled,
        password: args.enabled ? args.password : "",
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (error) {
      throw error;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorText(null);
    setSuccessText(null);

    let chargedCreation = false;
    let chargedVerification = false;
    let chargedStorageCredits = 0;
    let createdQrxId: string | null = null;

    try {
      const nextTitle = title.trim();

      if (!nextTitle) {
        throw new Error("Bitte gib einen Titel ein.");
      }

      const nextPassword = qrxPassword.trim();
      const nextPasswordRepeat = qrxPasswordRepeat.trim();

      if (passwordProtected && nextPassword.length < 4) {
        throw new Error("Das Passwort muss mindestens 4 Zeichen lang sein.");
      }

      if (passwordProtected && nextPassword !== nextPasswordRepeat) {
        throw new Error("Die beiden Passwörter stimmen nicht überein.");
      }

      if (wantsVerification && qrxType !== "business") {
        throw new Error(
          "Eine Verifizierung ist nur für Business QR-X möglich.",
        );
      }

      if (
        qrxType === "business" &&
        wantsVerification &&
        !verificationDocument
      ) {
        throw new Error(
          "Bitte lade für die Verifizierung ein Dokument oder Bild hoch.",
        );
      }

      const lat = parseOptionalNumber(locationLat, "Breitengrad");
      const lng = parseOptionalNumber(locationLng, "Längengrad");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Bitte melde dich zuerst an.");
      }

      if (
        creationCostCredits == null ||
        totalCostCredits == null ||
        credits == null
      ) {
        throw new Error(
          "Credits und QR-X-Kosten werden noch geladen. Bitte versuche es gleich erneut.",
        );
      }

      if (totalCostCredits > 0 && credits < totalCostCredits) {
        throw new Error(
          `Nicht genug Credits. Benötigt: ${totalCostCredits}, vorhanden: ${credits}. Bitte kaufe zuerst Credits.`,
        );
      }

      if (creationCostCredits > 0) {
        await spendCredits(creationCostCredits);
        chargedCreation = true;
      }

      if (verificationCredits > 0) {
        await spendCredits(verificationCredits);
        chargedVerification = true;
      }

      const insertPayload = {
        category: qrxType === "business" ? category : null,
        owner_user_id: user.id,
        title: nextTitle,
        company_name: qrxType === "business" ? toNullable(companyName) : null,
        description: toNullable(description),
        news: newsItems.length > 0 ? newsItems : null,
        type: qrxType,
        location_name: toNullable(locationName),
        location_lat: lat,
        location_lng: lng,
        logo_url: null,
        cover_image_url: null,
        cta_phone: qrxType === "business" ? toNullable(ctaPhone) : null,
        cta_website: qrxType === "business" ? toNullable(ctaWebsite) : null,
        cta_email: qrxType === "business" ? toNullable(ctaEmail) : null,
        cta_navigation:
          qrxType === "business" ? toNullable(ctaNavigation) : null,
        verified: false,
        suspended: false,
        password_protected: false,
      };

      let insertResult = await supabase
        .from("qr_x_entries")
        .insert(insertPayload)
        .select("id")
        .single();

      if (
        insertResult.error &&
        isMissingColumnError(insertResult.error, "cta_email")
      ) {
        const fallbackPayload = {
          category: insertPayload.category,
          owner_user_id: insertPayload.owner_user_id,
          title: insertPayload.title,
          company_name: insertPayload.company_name,
          description: insertPayload.description,
          news: insertPayload.news,
          type: insertPayload.type,
          location_name: insertPayload.location_name,
          location_lat: insertPayload.location_lat,
          location_lng: insertPayload.location_lng,
          logo_url: insertPayload.logo_url,
          cover_image_url: insertPayload.cover_image_url,
          cta_phone: insertPayload.cta_phone,
          cta_website: insertPayload.cta_website,
          cta_navigation: insertPayload.cta_navigation,
          verified: insertPayload.verified,
          suspended: insertPayload.suspended,
          password_protected: insertPayload.password_protected,
        };

        insertResult = await supabase
          .from("qr_x_entries")
          .insert(fallbackPayload)
          .select("id")
          .single();
      }

      const { data, error } = insertResult;

      if (error) {
        throw error;
      }

      const newId = data?.id;
      createdQrxId = newId ?? null;

      if (newId && selectedCollectionQrxIds.length > 0) {
        await saveCollectionItems({
          collectionQrxId: newId,
          userId: user.id,
        });
      }

      if (passwordProtected && newId) {
        await saveQrxPasswordProtection({
          qrxId: newId,
          enabled: true,
          password: nextPassword,
        });
      }

      if (newId && logoFile) {
        const logoUpload = await uploadQrxMedia({
          qrxId: newId,
          file: logoFile,
          prefix: "logo",
        });

        const { error: logoUpdateError } = await supabase
          .from("qr_x_entries")
          .update({ logo_url: logoUpload.publicUrl })
          .eq("id", newId);

        if (logoUpdateError) throw logoUpdateError;
      }

      if (newId && qrxType === "business" && coverFile) {
        const coverUpload = await uploadQrxMedia({
          qrxId: newId,
          file: coverFile,
          prefix: "cover",
        });

        const { error: coverUpdateError } = await supabase
          .from("qr_x_entries")
          .update({ cover_image_url: coverUpload.publicUrl })
          .eq("id", newId);

        if (coverUpdateError) throw coverUpdateError;
      }

      if (newId && galleryFiles.length > 0) {
        for (const item of galleryFiles) {
          const galleryUpload = await uploadQrxMedia({
            qrxId: newId,
            file: item.file,
            prefix: "gallery",
            mediaType: "image",
          });
          chargedStorageCredits += Math.max(0, galleryUpload.chargedCredits);
        }
      }

      if (newId && fileUploads.length > 0) {
        for (const item of fileUploads) {
          const fileUpload = await uploadQrxMedia({
            qrxId: newId,
            file: item.file,
            prefix: "file",
            mediaType: "file",
          });
          chargedStorageCredits += Math.max(0, fileUpload.chargedCredits);
        }
      }

      if (
        newId &&
        user.id &&
        qrxType === "business" &&
        wantsVerification &&
        verificationDocument
      ) {
        const uploadedVerification = await uploadVerificationDocument({
          userId: user.id,
          qrxId: newId,
          document: verificationDocument,
        });

        const { error: verificationInsertError } = await supabase
          .from("qrx_verification_requests")
          .insert({
            qrx_id: newId,
            owner_user_id: user.id,
            status: "pending",
            credits_charged: verificationCredits,
            refund_done: false,
            document_url: uploadedVerification.documentUrl,
            document_path: uploadedVerification.storagePath,
            document_filename: verificationDocument.file.name,
            document_mime_type:
              verificationDocument.file.type ||
              (verificationDocument.documentType === "pdf"
                ? "application/pdf"
                : "application/octet-stream"),
            document_type: verificationDocument.documentType,
          });

        if (verificationInsertError) throw verificationInsertError;
      }

      clearGalleryFiles();
      clearFileUploads();
      setNewsItems([]);
      setNewsDraft("");
      clearVerificationDocument();
      setWantsVerification(false);
      setSelectedCollectionQrxIds([]);
      clearSavedDraft();
      await loadCreditAndPricingData();

      const totalCreditsUsed =
        creationCostCredits + verificationCredits + chargedStorageCredits;
      const costText =
        totalCreditsUsed > 0
          ? ` ${totalCreditsUsed} Credits wurden abgezogen.`
          : " Der erste normale QR-X ist kostenlos.";
      const storageText =
        chargedStorageCredits > 0
          ? ` Für zusätzlichen Speicher wurden ${chargedStorageCredits} Credit(s) abgezogen.`
          : "";
      const verificationText =
        wantsVerification && verificationCredits > 0
          ? " Der Verifizierungsantrag wurde eingereicht."
          : "";
      setSuccessText(
        passwordProtected
          ? `QR-X wurde erstellt und mit Passwort geschützt.${costText}${storageText}${verificationText}`
          : `QR-X wurde erstellt.${costText}${storageText}${verificationText}`,
      );

      window.setTimeout(() => {
        if (newId) {
          router.push(`/${locale}/dashboard/qrx/${newId}/edit`);
        } else {
          router.push(`/${locale}/dashboard/qrx`);
        }
      }, 700);
    } catch (error) {
      console.error("QRX CREATE ERROR", error);

      if (createdQrxId) {
        await deleteCreatedQrxIfNeeded(createdQrxId);
      }

      if (
        chargedCreation &&
        creationCostCredits != null &&
        creationCostCredits > 0
      ) {
        try {
          await addCredits(creationCostCredits);
        } catch (refundError) {
          console.warn(
            "Credit-Rückbuchung nach Fehler fehlgeschlagen:",
            refundError,
          );
        }
      }

      if (chargedVerification && verificationCredits > 0) {
        try {
          await addCredits(verificationCredits);
        } catch (refundError) {
          console.warn(
            "Credit-Rückbuchung Verifizierung nach Fehler fehlgeschlagen:",
            refundError,
          );
        }
      }

      if (chargedStorageCredits > 0) {
        try {
          await addCredits(chargedStorageCredits);
        } catch (refundError) {
          console.warn(
            "Credit-Rückbuchung Storage nach Fehler fehlgeschlagen:",
            refundError,
          );
        }
      }

      await loadCreditAndPricingData();
      setErrorText(
        normalizeErrorMessage(error) || "QR-X konnte nicht erstellt werden.",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedCollectionItems = selectedCollectionQrxIds
    .map((id) => collectionCandidates.find((item) => item.id === id))
    .filter((item): item is CollectionCandidate => Boolean(item));

  const visibleCollectionCandidates = collectionCandidates.filter((item) => {
    if (item.source !== collectionTab) return false;
    const search = collectionSearch.trim().toLowerCase();
    if (!search) return true;
    return [item.title, item.company_name, item.custom_title]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  const isBusiness = qrxType === "business";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="QR-X erstellen Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>QR-X erstellen</span>
          <h1>Neuen QR-X erstellen</h1>
          <p>
            Erstelle deinen QR-X inklusive Logo, Coverbild, Galerie-Bildern,
            Dateien/PDFs, Standort, Passwortschutz und Credit-Prüfung.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link
            href={`/${locale}/dashboard/qrx`}
            className={styles.secondaryButton}
          >
            Zurück zu Meine QR-X
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 880,
          margin: "0 auto",
          borderRadius: 30,
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
          padding: 22,
        }}
      >
        <div className={styles.cardHeader}>
          <div>
            <h2>Basisdaten</h2>
            <p>Wähle den Typ und trage die wichtigsten Informationen ein.</p>
          </div>
          <span>{isBusiness ? "Business QR-X" : "Normaler QR-X"}</span>
        </div>

        {errorText ? (
          <div
            style={{
              borderRadius: 22,
              padding: 16,
              marginBottom: 16,
              background: "rgba(239, 68, 68, 0.14)",
              border: "1px solid rgba(252, 165, 165, 0.22)",
              color: "#fecaca",
              fontWeight: 850,
              lineHeight: 1.55,
            }}
          >
            {errorText}
          </div>
        ) : null}

        {successText ? (
          <div
            style={{
              borderRadius: 22,
              padding: 16,
              marginBottom: 16,
              background: "rgba(34, 197, 94, 0.14)",
              border: "1px solid rgba(134, 239, 172, 0.22)",
              color: "#bbf7d0",
              fontWeight: 850,
              lineHeight: 1.55,
            }}
          >
            {successText}
          </div>
        ) : null}

        {draftNotice ? (
          <div
            style={{
              borderRadius: 22,
              padding: 16,
              marginBottom: 16,
              background: "rgba(59, 130, 246, 0.14)",
              border: "1px solid rgba(147, 197, 253, 0.24)",
              color: "#dbeafe",
              fontWeight: 850,
              lineHeight: 1.55,
              display: "grid",
              gap: 12,
            }}
          >
            <span>{draftNotice}</span>
            <button
              type="button"
              onClick={clearSavedDraft}
              style={dismissDraftButtonStyle}
            >
              Hinweis ausblenden
            </button>
          </div>
        ) : null}

        <div
          style={{
            borderRadius: 22,
            padding: 16,
            marginBottom: 16,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <strong style={{ color: "#ffffff", fontSize: 16 }}>
              Credit-Prüfung
            </strong>
            <div style={creditsHeaderActionsStyle}>
              <span style={{ color: "#cbd5e1", fontWeight: 900 }}>
                Aktuelle Credits: {pricingLoading ? "…" : (credits ?? 0)}
              </span>
              <button
                type="button"
                onClick={() => void loadCreditAndPricingData()}
                disabled={pricingLoading}
                style={refreshCreditsButtonStyle}
              >
                {pricingLoading ? "Aktualisiere …" : "Credits aktualisieren"}
              </button>
            </div>
          </div>

          <div
            style={{
              color: "#94a3b8",
              lineHeight: 1.55,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {pricingLoading || creationCostCredits == null ? (
              "Kosten werden geladen …"
            ) : qrxType === "normal" && creationCostCredits === 0 ? (
              "Dieser normale QR-X ist kostenlos, weil es dein erster normaler QR-X ist."
            ) : (
              <>
                Dieser {isBusiness ? "Business QR-X" : "normale QR-X"} kostet{" "}
                <strong style={{ color: "#ffffff" }}>
                  {creationCostCredits} Credits
                </strong>
                {verificationCredits > 0 ? (
                  <>
                    {" "}
                    + Verifizierung{" "}
                    <strong style={{ color: "#ffffff" }}>
                      {verificationCredits} Credits
                    </strong>
                  </>
                ) : null}
                .
              </>
            )}
          </div>

          {!pricingLoading &&
          creationCostCredits != null &&
          totalCostCredits != null &&
          credits != null &&
          credits < totalCostCredits ? (
            <div
              style={{ color: "#fecaca", fontWeight: 900, lineHeight: 1.55 }}
            >
              Nicht genügend Credits. Benötigt: {totalCostCredits}, vorhanden:{" "}
              {credits}.{" "}
              <Link
                href={`/${locale}/dashboard/credits`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#bfdbfe" }}
              >
                Credits kaufen
              </Link>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <button
              type="button"
              onClick={() => setQrxType("normal")}
              style={{
                minHeight: 74,
                borderRadius: 18,
                border:
                  qrxType === "normal"
                    ? "1px solid #bbf7d0"
                    : "1px solid rgba(148, 163, 184, 0.22)",
                background:
                  qrxType === "normal"
                    ? "rgba(34,197,94,0.16)"
                    : "rgba(255,255,255,0.06)",
                color: "#ffffff",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              ⌗ Normaler QR-X
            </button>

            <button
              type="button"
              onClick={() => setQrxType("business")}
              style={{
                minHeight: 74,
                borderRadius: 18,
                border:
                  qrxType === "business"
                    ? "1px solid #fed7aa"
                    : "1px solid rgba(148, 163, 184, 0.22)",
                background:
                  qrxType === "business"
                    ? "rgba(251,146,60,0.16)"
                    : "rgba(255,255,255,0.06)",
                color: "#ffffff",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              🏢 Business QR-X
            </button>
          </div>

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                Logo
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                Optional: Lade ein Logo hoch. Es wird später in deinem QR-X
                Profil angezeigt.
              </p>
            </div>

            {logoPreview ? (
              <div style={previewRowStyle}>
                <img
                  src={logoPreview}
                  alt="Logo Vorschau"
                  style={logoPreviewStyle}
                />
                <button
                  type="button"
                  onClick={clearLogoSelection}
                  className={styles.secondaryButton}
                  style={{ border: 0, cursor: "pointer" }}
                >
                  Logo entfernen
                </button>
              </div>
            ) : null}

            <label style={fileButtonStyle}>
              Logo auswählen
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {isBusiness ? (
            <div style={mediaSectionStyle}>
              <div>
                <h3
                  style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}
                >
                  Coverbild
                </h3>
                <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                  Optional: Das Coverbild erscheint später als großes Titelbild
                  deines Business QR-X.
                </p>
              </div>

              {coverPreview ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <img
                    src={coverPreview}
                    alt="Coverbild Vorschau"
                    style={coverPreviewStyle}
                  />
                  <button
                    type="button"
                    onClick={clearCoverSelection}
                    className={styles.secondaryButton}
                    style={{ border: 0, cursor: "pointer" }}
                  >
                    Coverbild entfernen
                  </button>
                </div>
              ) : null}

              <label style={fileButtonStyle}>
                Coverbild auswählen
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          ) : null}

          <label style={labelStyle}>
            Titel *
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              style={inputStyle}
              required
            />
          </label>

          {isBusiness ? (
            <>
              <label style={labelStyle}>
                Firmenname
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      color: "#ffffff",
                      fontSize: 18,
                    }}
                  >
                    Kategorie
                  </h3>
                  <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                    Hilft später für Explore, Karte und Rankings. Du kannst die
                    Kategorie später wieder ändern.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  {BUSINESS_CATEGORY_OPTIONS.map((item) => {
                    const active = category === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setCategory(item.value)}
                        style={{
                          minHeight: 58,
                          borderRadius: 16,
                          border: active
                            ? "1px solid #facc15"
                            : "1px solid rgba(148, 163, 184, 0.22)",
                          background: active
                            ? "linear-gradient(135deg, rgba(250,204,21,0.98), rgba(251,146,60,0.88))"
                            : "rgba(255,255,255,0.055)",
                          color: active ? "#111827" : "#ffffff",
                          fontWeight: 950,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "0 12px",
                        }}
                      >
                        <span aria-hidden="true">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}

          <label style={labelStyle}>
            Beschreibung
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              style={{
                ...inputStyle,
                minHeight: 140,
                paddingTop: 14,
                resize: "vertical",
              }}
            />
          </label>

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                News & Aktualisierung
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                Optional: Informiere Nutzer direkt beim Erstellen über
                Änderungen, Angebote, Öffnungszeiten oder wichtige Hinweise.
              </p>
            </div>

            <textarea
              value={newsDraft}
              onChange={(event) => setNewsDraft(event.target.value)}
              style={{
                ...inputStyle,
                minHeight: 110,
                paddingTop: 14,
                resize: "vertical",
              }}
              placeholder="z. B. Neue Speisekarte verfügbar, geänderte Öffnungszeiten oder aktuelles Angebot …"
            />

            <button type="button" onClick={addNewsItem} style={fileButtonStyle}>
              + News hinzufügen
            </button>

            {newsItems.length > 0 ? (
              <div style={newsSelectionBoxStyle}>
                <div style={selectionHeaderStyle}>
                  <strong>
                    {newsItems.length} News-Eintrag
                    {newsItems.length === 1 ? "" : "e"} angelegt
                  </strong>
                  {newsItems.length > MAX_VISIBLE_NEWS ? (
                    <span style={newsScrollHintStyle}>
                      Max. {MAX_VISIBLE_NEWS} sichtbar · Bereich ist scrollbar
                    </span>
                  ) : null}
                </div>

                <div style={newsPreviewListStyle(newsItems.length)}>
                  {newsItems.map((item, index) => (
                    <article
                      key={`${item.createdAt}-${index}`}
                      style={newsPreviewRowStyle}
                    >
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={newsPreviewTextStyle}>{item.text}</div>
                        <div style={newsPreviewDateStyle}>
                          {new Date(item.createdAt).toLocaleString("de-DE")}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeNewsItem(index)}
                        style={previewRemoveButtonStyle}
                      >
                        Löschen
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div style={mediaSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                  QR-X Sammlung
                </h3>
                <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                  Optional: Verknüpfe eigenständige QR-X, zum Beispiel Produkte, Theaterstücke oder Häuser eines Projekts.
                  Bilder, PDFs und Anleitungen gehören weiterhin in Medien und Dateien.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCollectionOpen((current) => !current)}
                style={fileButtonStyle}
              >
                {collectionOpen ? "Auswahl schließen" : "+ QR-X sammeln"}
              </button>
            </div>

            {selectedCollectionItems.length > 0 ? (
              <div style={collectionSelectedBoxStyle}>
                <div style={selectionHeaderStyle}>
                  <strong>
                    {selectedCollectionItems.length} QR-X verknüpft
                  </strong>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    Reihenfolge entspricht deiner Auswahl
                  </span>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {selectedCollectionItems.map((item, index) => {
                    const displayTitle = item.custom_title?.trim() || item.company_name?.trim() || item.title?.trim() || "Unbenannter QR-X";
                    const image = item.logo_url?.trim() || item.cover_image_url?.trim() || null;

                    return (
                      <div key={item.id} style={collectionSelectedRowStyle}>
                        <div style={collectionIndexStyle}>{index + 1}</div>
                        <div style={collectionThumbStyle}>
                          {image ? (
                            <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span>▣</span>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: "#ffffff", fontWeight: 950, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {displayTitle}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>
                            {item.source === "own" ? "Mein QR-X" : "Gespeicherter QR-X"} · {item.type === "business" ? "Business" : "Normal"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCollectionQrx(item.id)}
                          style={previewRemoveButtonStyle}
                        >
                          Entfernen
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={collectionEmptyStyle}>
                Noch keine QR-X verknüpft. Im öffentlichen Detailbereich bleibt die Sammlung deshalb ausgeblendet.
              </div>
            )}

            {collectionOpen ? (
              <div style={collectionPickerStyle}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setCollectionTab("own")}
                    style={collectionTabButtonStyle(collectionTab === "own")}
                  >
                    Meine QR-X ({collectionCandidates.filter((item) => item.source === "own").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectionTab("saved")}
                    style={collectionTabButtonStyle(collectionTab === "saved")}
                  >
                    Gespeicherte ({collectionCandidates.filter((item) => item.source === "saved").length})
                  </button>
                </div>

                <input
                  value={collectionSearch}
                  onChange={(event) => setCollectionSearch(event.target.value)}
                  style={inputStyle}
                  placeholder="QR-X durchsuchen …"
                />

                {collectionLoading ? (
                  <div style={collectionEmptyStyle}>QR-X werden geladen …</div>
                ) : visibleCollectionCandidates.length === 0 ? (
                  <div style={collectionEmptyStyle}>
                    In diesem Bereich wurden keine passenden QR-X gefunden.
                  </div>
                ) : (
                  <div style={collectionCandidateListStyle}>
                    {visibleCollectionCandidates.map((item) => {
                      const selected = selectedCollectionQrxIds.includes(item.id);
                      const displayTitle = item.custom_title?.trim() || item.company_name?.trim() || item.title?.trim() || "Unbenannter QR-X";
                      const image = item.logo_url?.trim() || item.cover_image_url?.trim() || null;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleCollectionQrx(item.id)}
                          style={collectionCandidateButtonStyle(selected)}
                        >
                          <span style={collectionCheckboxStyle(selected)}>{selected ? "✓" : ""}</span>
                          <span style={collectionThumbStyle}>
                            {image ? (
                              <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span>▣</span>
                            )}
                          </span>
                          <span style={{ minWidth: 0, textAlign: "left" }}>
                            <span style={{ display: "block", color: "#ffffff", fontWeight: 950, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {displayTitle}
                            </span>
                            <span style={{ display: "block", color: "#94a3b8", fontSize: 12, marginTop: 3 }}>
                              {item.type === "business" ? "Business QR-X" : "Normaler QR-X"}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                Standort
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                Lege fest, ob dieser QR-X ohne Standort gespeichert wird, den
                aktuellen Standort nutzt oder manuelle Koordinaten bekommt.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => handleLocationModeChange("none")}
                style={locationModeButtonStyle(locationMode === "none")}
              >
                Kein Standort
              </button>

              <button
                type="button"
                onClick={() => {
                  handleLocationModeChange("current");
                  void getCurrentLocation();
                }}
                style={locationModeButtonStyle(locationMode === "current")}
                disabled={locationLoading}
              >
                {locationLoading
                  ? "Standort wird geladen …"
                  : "Aktuellen Standort übernehmen"}
              </button>

              <button
                type="button"
                onClick={() => handleLocationModeChange("manual")}
                style={locationModeButtonStyle(locationMode === "manual")}
              >
                Koordinaten manuell eingeben
              </button>
            </div>

            {locationMode !== "none" ? (
              <>
                <label style={labelStyle}>
                  Standortname
                  <input
                    value={locationName}
                    onChange={(event) => setLocationName(event.target.value)}
                    style={inputStyle}
                    placeholder="z. B. Mioseg Köln"
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <label style={labelStyle}>
                    Breitengrad
                    <input
                      value={locationLat}
                      onChange={(event) => setLocationLat(event.target.value)}
                      style={inputStyle}
                      placeholder="z. B. 50.9375"
                    />
                  </label>

                  <label style={labelStyle}>
                    Längengrad
                    <input
                      value={locationLng}
                      onChange={(event) => setLocationLng(event.target.value)}
                      style={inputStyle}
                      placeholder="z. B. 6.9603"
                    />
                  </label>
                </div>
              </>
            ) : null}
          </div>

          {isBusiness ? (
            <>
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.09)",
                  margin: "4px 0",
                }}
              />

              <div>
                <h3
                  style={{ margin: "0 0 10px", color: "#ffffff", fontSize: 18 }}
                >
                  Kontakt & Aktionen
                </h3>
                <p
                  style={{
                    margin: "0 0 14px",
                    color: "#94a3b8",
                    lineHeight: 1.55,
                  }}
                >
                  Diese Angaben erscheinen später als Buttons in der QR-X
                  Webansicht.
                </p>
              </div>

              <label style={labelStyle}>
                Telefon
                <input
                  value={ctaPhone}
                  onChange={(event) => setCtaPhone(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Webseite
                <input
                  value={ctaWebsite}
                  onChange={(event) => setCtaWebsite(event.target.value)}
                  style={inputStyle}
                  placeholder="https://..."
                />
              </label>

              <label style={labelStyle}>
                E-Mail
                <input
                  value={ctaEmail}
                  onChange={(event) => setCtaEmail(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Navigation
                <input
                  value={ctaNavigation}
                  onChange={(event) => setCtaNavigation(event.target.value)}
                  style={inputStyle}
                  placeholder="Adresse oder Google-Maps-Link"
                />
              </label>
            </>
          ) : null}

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                Galerie-Bilder
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                Optional: Lade direkt beim Erstellen Bilder hoch, die später in
                der QR-X Galerie angezeigt werden.
              </p>
            </div>

            <label style={fileButtonStyle}>
              Galerie-Bilder auswählen
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryFilesChange}
                style={{ display: "none" }}
              />
            </label>

            {galleryFiles.length > 0 ? (
              <div style={selectionInfoStyle}>
                <div style={selectionHeaderStyle}>
                  <strong>{galleryFiles.length} Bild(er) ausgewählt</strong>
                  <button
                    type="button"
                    onClick={clearGalleryFiles}
                    style={miniDangerButtonStyle}
                  >
                    Alle Bilder entfernen
                  </button>
                </div>

                <div style={galleryPreviewGridStyle}>
                  {galleryFiles.map((item) => (
                    <div key={item.id} style={galleryPreviewCardStyle}>
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={`${item.file.name} Vorschau`}
                          style={galleryImagePreviewStyle}
                        />
                      ) : null}

                      <div style={previewFileMetaStyle}>
                        <strong>{item.file.name}</strong>
                        <span>{formatBytes(item.file.size)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeGalleryFile(item.id)}
                        style={previewRemoveButtonStyle}
                      >
                        Löschen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                Dateien / PDFs
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                Optional: Lade Dateien wie PDF, Preisliste, Speisekarte,
                Dokumente oder Bilder direkt mit hoch.
              </p>
            </div>

            <label style={fileButtonStyle}>
              Dateien auswählen
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,image/*,application/pdf"
                onChange={handleFileUploadsChange}
                style={{ display: "none" }}
              />
            </label>

            {fileUploads.length > 0 ? (
              <div style={selectionInfoStyle}>
                <div style={selectionHeaderStyle}>
                  <strong>{fileUploads.length} Datei(en) ausgewählt</strong>
                  <button
                    type="button"
                    onClick={clearFileUploads}
                    style={miniDangerButtonStyle}
                  >
                    Alle Dateien entfernen
                  </button>
                </div>

                <div style={filePreviewListStyle}>
                  {fileUploads.map((item) => (
                    <div key={item.id} style={filePreviewCardStyle}>
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={`${item.file.name} Vorschau`}
                          style={fileImagePreviewStyle}
                        />
                      ) : (
                        <div style={fileIconPreviewStyle}>
                          {item.file.type === "application/pdf" ||
                          item.file.name.toLowerCase().endsWith(".pdf")
                            ? "PDF"
                            : "FILE"}
                        </div>
                      )}

                      <div style={previewFileMetaStyle}>
                        <strong>{item.file.name}</strong>
                        <span>
                          {item.file.type || "Datei"} ·{" "}
                          {formatBytes(item.file.size)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFileUpload(item.id)}
                        style={previewRemoveButtonStyle}
                      >
                        Löschen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {isBusiness ? (
            <div style={verificationSectionStyle(wantsVerification)}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  color: "#ffffff",
                  fontWeight: 950,
                  cursor: "pointer",
                }}
              >
                <span>Business-Verifizierung beantragen</span>
                <input
                  type="checkbox"
                  checked={wantsVerification}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setWantsVerification(checked);
                    if (!checked) clearVerificationDocument();
                  }}
                  style={{ width: 20, height: 20, accentColor: "#facc15" }}
                />
              </label>

              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  lineHeight: 1.55,
                  fontSize: 13,
                }}
              >
                Lade ein Dokument oder Bild hoch, mit dem dein Business QR-X
                geprüft werden kann. Die Anfrage kostet{" "}
                {QRX_VERIFICATION_COST_CREDITS} Credits und wird in der
                Kommandozentrale geprüft.
              </p>

              {wantsVerification ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <label style={fileButtonStyle}>
                    Nachweis auswählen (Bild oder PDF)
                    <input
                      type="file"
                      accept="image/*,application/pdf,.pdf"
                      onChange={handleVerificationDocumentChange}
                      style={{ display: "none" }}
                    />
                  </label>

                  {verificationDocument ? (
                    <div style={verificationPreviewCardStyle}>
                      {verificationDocument.previewUrl ? (
                        <img
                          src={verificationDocument.previewUrl}
                          alt="Verifizierungsnachweis Vorschau"
                          style={fileImagePreviewStyle}
                        />
                      ) : (
                        <div style={fileIconPreviewStyle}>PDF</div>
                      )}

                      <div style={previewFileMetaStyle}>
                        <strong>{verificationDocument.file.name}</strong>
                        <span>
                          {verificationDocument.documentType.toUpperCase()} ·{" "}
                          {formatBytes(verificationDocument.file.size)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={clearVerificationDocument}
                        style={previewRemoveButtonStyle}
                      >
                        Löschen
                      </button>
                    </div>
                  ) : (
                    <div style={verificationHintStyle}>
                      Bitte lade einen Gewerbenachweis, eine Rechnung, ein
                      Schreiben, eine Speisekarte, ein Praxisschild oder einen
                      ähnlichen Nachweis hoch.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            style={{
              borderRadius: 22,
              padding: 16,
              background: passwordProtected
                ? "rgba(59,130,246,0.14)"
                : "rgba(255,255,255,0.045)",
              border: passwordProtected
                ? "1px solid rgba(147,197,253,0.28)"
                : "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: 12,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                color: "#ffffff",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              <span>QR-X mit Passwort schützen</span>
              <input
                type="checkbox"
                checked={passwordProtected}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setPasswordProtected(checked);
                  if (!checked) {
                    setQrxPassword("");
                    setQrxPasswordRepeat("");
                  }
                }}
                style={{ width: 20, height: 20, accentColor: "#60a5fa" }}
              />
            </label>

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                lineHeight: 1.55,
                fontSize: 13,
              }}
            >
              Wenn aktiviert, müssen Besucher vor dem Öffnen dieses QR-X ein
              Passwort eingeben.
            </p>

            {passwordProtected ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label style={labelStyle}>
                  Passwort *
                  <input
                    type="password"
                    value={qrxPassword}
                    onChange={(event) => setQrxPassword(event.target.value)}
                    style={inputStyle}
                    minLength={4}
                    required={passwordProtected}
                    autoComplete="new-password"
                  />
                </label>

                <label style={labelStyle}>
                  Passwort wiederholen *
                  <input
                    type="password"
                    value={qrxPasswordRepeat}
                    onChange={(event) =>
                      setQrxPasswordRepeat(event.target.value)
                    }
                    style={inputStyle}
                    minLength={4}
                    required={passwordProtected}
                    autoComplete="new-password"
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div style={storageBoxStyle}>
            <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
              Speicher-Kontingent
            </h3>
            <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
              {FREE_STORAGE_MB} MB sind pro QR-X inklusive. Danach kostet jedes
              weitere Paket mit {STORAGE_PACK_MB} MB genau 1 Credit.
            </p>
            <div style={storageGridStyle}>
              <div style={storageMetricStyle}>
                <span style={storageMetricLabelStyle}>Ausgewählt</span>
                <strong>{formatMb(selectedStorageMb)}</strong>
              </div>
              <div style={storageMetricStyle}>
                <span style={storageMetricLabelStyle}>
                  Kontingent nach Erstellung
                </span>
                <strong>{formatMb(estimatedStorageLimitMb)}</strong>
              </div>
              <div style={storageMetricStyle}>
                <span style={storageMetricLabelStyle}>Speicher-Credits</span>
                <strong>{estimatedStorageCredits}</strong>
              </div>
            </div>
            {estimatedStorageCredits > 0 ? (
              <p
                style={{
                  margin: 0,
                  color: "#fde68a",
                  lineHeight: 1.55,
                  fontWeight: 850,
                }}
              >
                Für den ausgewählten Speicher werden voraussichtlich{" "}
                {estimatedStorageCredits} Credit
                {estimatedStorageCredits === 1 ? "" : "s"} abgebucht. Das
                Kontingent bleibt diesem QR-X erhalten, auch wenn später Dateien
                gelöscht werden.
              </p>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: "#bbf7d0",
                  lineHeight: 1.55,
                  fontWeight: 850,
                }}
              >
                Voraussichtlich keine zusätzlichen Speicher-Credits nötig.
              </p>
            )}
          </div>

          <div
            style={totalCostBoxStyle(
              !pricingLoading &&
                totalCostCredits != null &&
                credits != null &&
                credits < totalCostCredits,
            )}
          >
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                Gesamtkosten
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                Übersicht der geschätzten Kosten vor dem Erstellen.
              </p>
            </div>

            <div style={costRowsStyle}>
              <div style={costRowStyle}>
                <span>QR-X Erstellung</span>
                <strong>
                  {pricingLoading || creationCostCredits == null
                    ? "…"
                    : `${creationCostCredits} Credits`}
                </strong>
              </div>
              <div style={costRowStyle}>
                <span>Verifizierung</span>
                <strong>{verificationCredits} Credits</strong>
              </div>
              <div style={costRowStyle}>
                <span>Zusätzlicher Speicher</span>
                <strong>{estimatedStorageCredits} Credits</strong>
              </div>
              <div style={costTotalRowStyle}>
                <span>Gesamt</span>
                <strong>
                  {pricingLoading || totalCostCredits == null
                    ? "…"
                    : `${totalCostCredits} Credits`}
                </strong>
              </div>
            </div>

            {!pricingLoading &&
            totalCostCredits != null &&
            credits != null &&
            credits < totalCostCredits ? (
              <p
                style={{
                  margin: 0,
                  color: "#fecaca",
                  lineHeight: 1.55,
                  fontWeight: 900,
                }}
              >
                Dir fehlen noch {totalCostCredits - credits} Credit
                {totalCostCredits - credits === 1 ? "" : "s"}.
              </p>
            ) : null}
          </div>

          <div style={creditsBuyBoxStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                Credits kaufen
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                Kaufe Credits für weitere QR-X und zusätzlichen Speicherplatz.
                Der Kauf öffnet in einem neuen Tab, damit deine Eingaben
                erhalten bleiben.
              </p>
            </div>

            <div style={creditsBuyActionsStyle}>
              <Link
                href={`/${locale}/dashboard/credits`}
                target="_blank"
                rel="noopener noreferrer"
                style={wideCreditLinkStyle}
              >
                💳 Credits kaufen
              </Link>
              <button
                type="button"
                onClick={() => void loadCreditAndPricingData()}
                disabled={pricingLoading}
                style={wideRefreshCreditsButtonStyle}
              >
                {pricingLoading ? "Aktualisiere …" : "Credits aktualisieren"}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 8,
            }}
          >
            <Link
              href={`/${locale}/dashboard/qrx`}
              className={styles.secondaryButton}
            >
              Abbrechen
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                pricingLoading ||
                creationCostCredits == null ||
                totalCostCredits == null ||
                credits == null ||
                !hasEnoughCredits
              }
              className={styles.primaryButton}
              style={{
                border: 0,
                cursor:
                  saving ||
                  pricingLoading ||
                  creationCostCredits == null ||
                  totalCostCredits == null ||
                  credits == null ||
                  !hasEnoughCredits
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  saving ||
                  pricingLoading ||
                  creationCostCredits == null ||
                  totalCostCredits == null ||
                  credits == null ||
                  !hasEnoughCredits
                    ? 0.72
                    : 1,
              }}
            >
              {saving
                ? "Erstellt & lädt Medien hoch …"
                : pricingLoading
                  ? "Kosten werden geladen …"
                  : !hasEnoughCredits
                    ? "Nicht genug Credits"
                    : "QR-X erstellen"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

const creditsHeaderActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const refreshCreditsButtonStyle: CSSProperties = {
  minHeight: 34,
  borderRadius: 999,
  border: "1px solid rgba(147,197,253,0.28)",
  background: "rgba(59,130,246,0.14)",
  color: "#bfdbfe",
  fontWeight: 950,
  cursor: "pointer",
  padding: "0 12px",
};

const creditsBuyActionsStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const wideRefreshCreditsButtonStyle: CSSProperties = {
  minHeight: 48,
  borderRadius: 16,
  border: "1px solid rgba(147,197,253,0.28)",
  background: "rgba(59,130,246,0.14)",
  color: "#bfdbfe",
  fontWeight: 950,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 18px",
};

function locationModeButtonStyle(active: boolean): CSSProperties {
  return {
    minHeight: 56,
    borderRadius: 16,
    border: active
      ? "1px solid #bbf7d0"
      : "1px solid rgba(148, 163, 184, 0.22)",
    background: active ? "rgba(34,197,94,0.16)" : "rgba(255,255,255,0.055)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
    padding: "0 14px",
  };
}

const mediaSectionStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const previewRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const logoPreviewStyle: CSSProperties = {
  width: 104,
  height: 104,
  objectFit: "cover",
  borderRadius: 26,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
};

const coverPreviewStyle: CSSProperties = {
  width: "100%",
  maxHeight: 260,
  objectFit: "cover",
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
};

const fileButtonStyle: CSSProperties = {
  minHeight: 48,
  borderRadius: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 18px",
  background: "rgba(255,255,255,0.075)",
  border: "1px solid rgba(148,163,184,0.22)",
  color: "#ffffff",
  fontWeight: 950,
  cursor: "pointer",
};

const storageBoxStyle: CSSProperties = {
  borderRadius: 18,
  padding: 16,
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.24)",
  display: "grid",
  gap: 12,
};

const storageGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
};

const storageMetricStyle: CSSProperties = {
  borderRadius: 14,
  padding: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  display: "grid",
  gap: 4,
  color: "#ffffff",
};

const storageMetricLabelStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 850,
};

const selectionInfoStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.55,
  wordBreak: "break-word",
  display: "grid",
  gap: 10,
};

const miniDangerButtonStyle: CSSProperties = {
  minHeight: 34,
  borderRadius: 12,
  border: "1px solid rgba(252,165,165,0.22)",
  background: "rgba(239,68,68,0.14)",
  color: "#fecaca",
  fontWeight: 950,
  cursor: "pointer",
  padding: "0 12px",
  justifySelf: "start",
};

const selectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const galleryPreviewGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: 12,
};

const galleryPreviewCardStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  borderRadius: 18,
  padding: 10,
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const galleryImagePreviewStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  borderRadius: 14,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const filePreviewListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const filePreviewCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "64px 1fr auto",
  alignItems: "center",
  gap: 12,
  borderRadius: 18,
  padding: 10,
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const fileImagePreviewStyle: CSSProperties = {
  width: 64,
  height: 64,
  objectFit: "cover",
  borderRadius: 14,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const fileIconPreviewStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e0f2fe",
  fontSize: 12,
  fontWeight: 950,
};

const previewFileMetaStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 4,
  color: "#dbeafe",
};

const previewRemoveButtonStyle: CSSProperties = {
  minHeight: 36,
  borderRadius: 12,
  border: "1px solid rgba(252,165,165,0.24)",
  background: "rgba(239,68,68,0.16)",
  color: "#fecaca",
  fontWeight: 950,
  cursor: "pointer",
  padding: "0 12px",
};

function verificationSectionStyle(active: boolean): CSSProperties {
  return {
    display: "grid",
    gap: 12,
    borderRadius: 22,
    padding: 16,
    background: active ? "rgba(250,204,21,0.12)" : "rgba(255,255,255,0.045)",
    border: active
      ? "1px solid rgba(250,204,21,0.32)"
      : "1px solid rgba(255,255,255,0.08)",
  };
}

const verificationPreviewCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "64px 1fr auto",
  alignItems: "center",
  gap: 12,
  borderRadius: 18,
  padding: 10,
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(250,204,21,0.2)",
};

const verificationHintStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(250,204,21,0.10)",
  border: "1px solid rgba(250,204,21,0.18)",
  color: "#fde68a",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.55,
};

const dismissDraftButtonStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 999,
  border: "1px solid rgba(147,197,253,0.34)",
  background: "rgba(15,23,42,0.54)",
  color: "#dbeafe",
  cursor: "pointer",
  fontWeight: 900,
  justifySelf: "start",
  padding: "0 14px",
};

const collectionSelectedBoxStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  borderRadius: 18,
  padding: 14,
  background: "rgba(37,99,235,0.10)",
  border: "1px solid rgba(147,197,253,0.20)",
};

const collectionSelectedRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "36px 46px minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 10,
  borderRadius: 16,
  padding: 10,
  background: "rgba(15,23,42,0.62)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const collectionIndexStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "rgba(250,204,21,0.92)",
  color: "#111827",
  fontWeight: 950,
};

const collectionThumbStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 13,
  overflow: "hidden",
  display: "inline-grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#dbeafe",
  flexShrink: 0,
};

const collectionEmptyStyle: CSSProperties = {
  borderRadius: 16,
  padding: 13,
  background: "rgba(255,255,255,0.04)",
  border: "1px dashed rgba(148,163,184,0.22)",
  color: "#94a3b8",
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1.55,
};

const collectionPickerStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  borderRadius: 20,
  padding: 14,
  background: "rgba(2,6,23,0.34)",
  border: "1px solid rgba(148,163,184,0.16)",
};

function collectionTabButtonStyle(active: boolean): CSSProperties {
  return {
    minHeight: 46,
    borderRadius: 14,
    border: active ? "1px solid rgba(147,197,253,0.42)" : "1px solid rgba(148,163,184,0.18)",
    background: active ? "linear-gradient(135deg, rgba(37,99,235,0.82), rgba(124,58,237,0.78))" : "rgba(255,255,255,0.05)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 950,
  };
}

const collectionCandidateListStyle: CSSProperties = {
  display: "grid",
  gap: 9,
  maxHeight: 390,
  overflowY: "auto",
  paddingRight: 5,
};

function collectionCandidateButtonStyle(selected: boolean): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "30px 46px minmax(0, 1fr)",
    alignItems: "center",
    gap: 10,
    width: "100%",
    borderRadius: 16,
    padding: 10,
    border: selected ? "1px solid rgba(134,239,172,0.38)" : "1px solid rgba(148,163,184,0.16)",
    background: selected ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.045)",
    cursor: "pointer",
  };
}

function collectionCheckboxStyle(selected: boolean): CSSProperties {
  return {
    width: 27,
    height: 27,
    borderRadius: 999,
    display: "inline-grid",
    placeItems: "center",
    background: selected ? "#22c55e" : "rgba(255,255,255,0.04)",
    border: selected ? "1px solid #86efac" : "1px solid rgba(148,163,184,0.32)",
    color: "#052e16",
    fontWeight: 950,
  };
}

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 52,
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.22)",
  background: "rgba(255,255,255,0.07)",
  color: "#ffffff",
  padding: "0 14px",
  fontSize: 15,
  fontWeight: 800,
  outline: "none",
  boxSizing: "border-box",
};

function newsPreviewListStyle(count: number): CSSProperties {
  const shouldScroll = count > MAX_VISIBLE_NEWS;

  return {
    display: "grid",
    gap: 10,
    maxHeight: shouldScroll ? 430 : "none",
    overflowY: shouldScroll ? "auto" : "visible",
    paddingRight: shouldScroll ? 8 : 0,
    overscrollBehavior: "contain",
    scrollbarWidth: "thin",
  };
}

function totalCostBoxStyle(warning: boolean): CSSProperties {
  return {
    borderRadius: 22,
    padding: 16,
    background: warning ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.045)",
    border: warning
      ? "1px solid rgba(252,165,165,0.24)"
      : "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 12,
  };
}

const newsSelectionBoxStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.55,
  display: "grid",
  gap: 10,
};

const newsScrollHintStyle: CSSProperties = {
  color: "#fde68a",
  fontSize: 12,
  fontWeight: 950,
};

const newsPreviewRowStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(15,23,42,0.62)",
  border: "1px solid rgba(148,163,184,0.18)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 12,
  alignItems: "start",
};

const newsPreviewTextStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 850,
  whiteSpace: "pre-wrap",
};

const newsPreviewDateStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 800,
};

const creditsBuyBoxStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 12,
};

const wideCreditLinkStyle: CSSProperties = {
  minHeight: 54,
  borderRadius: 16,
  padding: "0 18px",
  background: "rgba(255,255,255,0.075)",
  border: "1px solid rgba(148,163,184,0.22)",
  color: "#ffffff",
  fontWeight: 950,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const costRowsStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const costRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  color: "#cbd5e1",
  fontSize: 14,
  fontWeight: 850,
};

const costTotalRowStyle: CSSProperties = {
  ...costRowStyle,
  borderTop: "1px solid rgba(255,255,255,0.1)",
  paddingTop: 10,
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 950,
};
