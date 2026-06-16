"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../../dashboard.module.css";

type QrxType = "normal" | "business";
type VerificationStatus = "pending" | "approved" | "rejected" | string;

const QRX_VERIFICATION_BUCKET = "qrx-verification-documents";
const QRX_VERIFICATION_COST_CREDITS = 10;

type QrxEntry = {
  id: string;
  owner_user_id: string | null;
  title: string | null;
  company_name: string | null;
  description: string | null;
  type: QrxType | string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_email: string | null;
  cta_navigation: string | null;
  verified: boolean | null;
  suspended: boolean | null;
  password_protected: boolean | null;
  logo_url: string | null;
  cover_image_url: string | null;
  storage_limit_mb: number | null;
};



type QrxMedia = {
  id: string;
  qrx_id: string;
  type: "image" | "file" | string;
  url: string;
  filename: string;
  bytes: number | null;
  storage_path?: string | null;
};

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
    id?: string;
    qrx_id?: string;
    type?: string;
    url?: string | null;
    filename?: string;
    bytes?: number | null;
  } | null;
};

type VerificationRequest = {
  id: string;
  qrx_id: string | null;
  owner_user_id: string | null;
  status: VerificationStatus | null;
  credits_charged: number | null;
  refund_done: boolean | null;
  document_filename: string | null;
  document_mime_type: string | null;
  document_type: "image" | "pdf" | string | null;
  created_at: string | null;
  updated_at: string | null;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
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

function formatOptionalNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return String(value);
}

function getSafeQrxType(value: string | null | undefined): QrxType {
  return value === "business" ? "business" : "normal";
}

function normalizeErrorMessage(error: unknown) {
  const errorLike = error as {
    message?: unknown;
    error_description?: unknown;
    details?: unknown;
    hint?: unknown;
  };

  return String(
    errorLike.message ??
      errorLike.error_description ??
      errorLike.details ??
      errorLike.hint ??
      error ??
      "Unbekannter Fehler",
  );
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

function sanitizeFilename(value: string) {

  return (
    value
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `verification-${Date.now().toString()}`
  );
}



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
  return fromType && fromType.trim() ? fromType : "bin";
}

function buildUploadFilename(prefix: "logo" | "cover" | "gallery" | "file", file: File) {
  const ext = getFileExtension(file).replace(/[^a-z0-9]/gi, "") || "bin";
  return `${prefix}-${Date.now().toString()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function getVerificationStatusLabel(status: VerificationStatus | null | undefined) {
  if (status === "pending") return "In Prüfung";
  if (status === "approved") return "Genehmigt";
  if (status === "rejected") return "Abgelehnt";
  return "Unbekannt";
}

function getVerificationStatusText(args: {
  isVerified: boolean;
  request: VerificationRequest | null;
}) {
  if (args.isVerified) return "Dieser Business QR-X ist verifiziert.";
  if (args.request?.status === "pending") return "Dein Verifizierungsantrag liegt vor und wird geprüft.";
  if (args.request?.status === "rejected") return "Dein letzter Verifizierungsantrag wurde abgelehnt. Du kannst einen neuen Antrag einreichen.";
  return "Noch nicht verifiziert.";
}

export default function EditQrxPage() {
  const router = useRouter();
  const params = useParams();

  const locale = getParam(params?.locale as string | string[] | undefined, "de");
  const qrxId = getParam(params?.id as string | string[] | undefined, "");

  const [loading, setLoading] = useState(true);
  const [qrxType, setQrxType] = useState<QrxType>("normal");
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [ctaPhone, setCtaPhone] = useState("");
  const [ctaWebsite, setCtaWebsite] = useState("");
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaNavigation, setCtaNavigation] = useState("");

  const [passwordProtected, setPasswordProtected] = useState(false);
  const [passwordWasProtected, setPasswordWasProtected] = useState(false);
  const [qrxPassword, setQrxPassword] = useState("");
  const [qrxPasswordRepeat, setQrxPasswordRepeat] = useState("");

  const [isVerified, setIsVerified] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [verificationSaving, setVerificationSaving] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);


  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [storageLimitMb, setStorageLimitMb] = useState(2);
  const [mediaItems, setMediaItems] = useState<QrxMedia[]>([]);
  const [usedBytes, setUsedBytes] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [fileUploads, setFileUploads] = useState<File[]>([]);
  const [mediaSaving, setMediaSaving] = useState(false);

  useEffect(() => {
    void loadQrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrxId]);

  async function getCurrentUserOrThrow() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("Bitte melde dich zuerst an.");
    return user;
  }

  async function loadCreditBalance(userId: string) {
    const { data, error } = await supabase
      .from("qrx_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from("qrx_credits")
        .upsert(
          { user_id: userId, credits: 0 },
          { onConflict: "user_id", ignoreDuplicates: false },
        )
        .select("credits")
        .maybeSingle();

      if (insertError) throw insertError;
      setCredits(Number(inserted?.credits ?? 0));
      return;
    }

    setCredits(Number((data as { credits?: number | null }).credits ?? 0));
  }

  async function loadLatestVerificationRequest(userId: string) {
    if (!qrxId) {
      setVerificationRequest(null);
      return;
    }

    const { data, error } = await supabase
      .from("qrx_verification_requests")
      .select(
        "id,qrx_id,owner_user_id,status,credits_charged,refund_done,document_filename,document_mime_type,document_type,created_at,updated_at",
      )
      .eq("qrx_id", qrxId)
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .returns<VerificationRequest>();

    if (error) throw error;
    setVerificationRequest(data ?? null);
  }



  async function loadMediaAndStorage() {
    if (!qrxId) {
      setMediaItems([]);
      setUsedBytes(0);
      return;
    }

    const { data, error } = await supabase
      .from("qr_x_media")
      .select("id,qrx_id,type,url,filename,bytes,storage_path")
      .eq("qrx_id", qrxId)
      .order("created_at", { ascending: false })
      .returns<QrxMedia[]>();

    if (error) throw error;

    const list = data ?? [];
    setMediaItems(list);
    setUsedBytes(list.reduce((sum, item) => sum + Number(item.bytes ?? 0), 0));
  }

  async function spendCredits(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return credits ?? 0;

    const { data, error } = await supabase.rpc("spend_credits", {
      p_amount: amount,
    });

    if (error) {
      throw new Error(normalizeErrorMessage(error) || "Credits konnten nicht abgezogen werden.");
    }

    const nextCredits = typeof data === "number" ? data : Math.max(0, (credits ?? 0) - amount);
    setCredits(nextCredits);
    return nextCredits;
  }

  async function addCredits(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return credits ?? 0;

    const { data, error } = await supabase.rpc("add_credits", {
      p_amount: amount,
    });

    if (error) {
      throw new Error(normalizeErrorMessage(error) || "Credits konnten nicht zurückgebucht werden.");
    }

    const nextCredits = typeof data === "number" ? data : (credits ?? 0) + amount;
    setCredits(nextCredits);
    return nextCredits;
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
      throw new Error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
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

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    const token = session?.access_token;
    if (!token) {
      throw new Error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
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

    const { data, error } = await supabase.functions.invoke("qrx-media-prepare-upload", {
      body: {
        qrxId: args.qrxId,
        type: args.type,
        filename: args.filename,
        mimeType: args.mimeType,
        bytes: args.bytes,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

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

    return { uploadUrl, storagePath };
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

    const { data, error } = await supabase.functions.invoke("qrx-media-finalize-upload", {
      body: {
        qrxId: args.qrxId,
        type: args.type,
        filename: args.filename,
        mimeType: args.mimeType,
        bytes: args.bytes,
        storagePath: args.storagePath,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

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

    return { publicUrl };
  }

  async function uploadQrxMedia(args: {
    qrxId: string;
    file: File;
    prefix: "logo" | "cover" | "gallery" | "file";
    mediaType: "image" | "file";
  }) {
    const filename = buildUploadFilename(args.prefix, args.file);
    const mimeType = args.file.type || (args.mediaType === "file" ? "application/octet-stream" : "image/jpeg");
    const bytes = args.file.size;

    const prepared = await prepareUpload({
      qrxId: args.qrxId,
      type: args.mediaType,
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
      throw new Error(`Upload fehlgeschlagen (${uploadResponse.status}): ${message || "Unbekannter Fehler"}`);
    }

    const finalized = await finalizeUpload({
      qrxId: args.qrxId,
      type: args.mediaType,
      filename,
      mimeType,
      bytes,
      storagePath: prepared.storagePath,
    });

    return finalized.publicUrl;
  }

  async function loadQrx() {
    setLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!qrxId) {
        throw new Error("QR-X ID fehlt.");
      }

      const user = await getCurrentUserOrThrow();

      const { data, error } = await supabase
        .from("qr_x_entries")
        .select(
          "id,owner_user_id,title,company_name,description,type,location_name,location_lat,location_lng,cta_phone,cta_website,cta_email,cta_navigation,verified,suspended,password_protected,logo_url,cover_image_url,storage_limit_mb",
        )
        .eq("id", qrxId)
        .maybeSingle()
        .returns<QrxEntry>();

      if (error) throw error;
      if (!data) throw new Error("QR-X wurde nicht gefunden.");
      if (data.owner_user_id !== user.id) throw new Error("Du darfst diesen QR-X nicht bearbeiten.");

      const safeType = getSafeQrxType(data.type);
      const isProtected = data.password_protected === true;

      setQrxType(safeType);
      setTitle(data.title ?? "");
      setCompanyName(data.company_name ?? "");
      setDescription(data.description ?? "");
      setLocationName(data.location_name ?? "");
      setLocationLat(formatOptionalNumber(data.location_lat));
      setLocationLng(formatOptionalNumber(data.location_lng));
      setCtaPhone(data.cta_phone ?? "");
      setCtaWebsite(data.cta_website ?? "");
      setCtaEmail(data.cta_email ?? "");
      setCtaNavigation(data.cta_navigation ?? "");
      setPasswordProtected(isProtected);
      setPasswordWasProtected(isProtected);
      setQrxPassword("");
      setQrxPasswordRepeat("");
      setIsVerified(data.verified === true);
      setVerificationDocument(null);
      setLogoUrl(data.logo_url ?? null);
      setCoverUrl(data.cover_image_url ?? null);
      setStorageLimitMb(Number(data.storage_limit_mb ?? 2));
      setLogoFile(null);
      setCoverFile(null);
      setGalleryFiles([]);
      setFileUploads([]);

      await Promise.all([loadCreditBalance(user.id), loadLatestVerificationRequest(user.id), loadMediaAndStorage()]);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "QR-X konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!qrxId) {
        throw new Error("QR-X ID fehlt.");
      }

      const nextTitle = title.trim();

      if (!nextTitle) {
        throw new Error("Bitte gib einen Titel ein.");
      }

      const nextPassword = qrxPassword.trim();
      const nextPasswordRepeat = qrxPasswordRepeat.trim();
      const passwordChanged = passwordProtected && nextPassword.length > 0;
      const passwordWasDisabled = passwordWasProtected && !passwordProtected;
      const passwordWasEnabled = !passwordWasProtected && passwordProtected;

      if ((passwordWasEnabled || passwordChanged) && nextPassword.length < 4) {
        throw new Error("Das Passwort muss mindestens 4 Zeichen lang sein.");
      }

      if ((passwordWasEnabled || passwordChanged) && nextPassword !== nextPasswordRepeat) {
        throw new Error("Die beiden Passwörter stimmen nicht überein.");
      }

      const lat = parseOptionalNumber(locationLat, "Breitengrad");
      const lng = parseOptionalNumber(locationLng, "Längengrad");

      const user = await getCurrentUserOrThrow();

      const { error } = await supabase
        .from("qr_x_entries")
        .update({
          title: nextTitle,
          company_name: qrxType === "business" ? toNullable(companyName) : null,
          description: toNullable(description),
          type: qrxType,
          location_name: toNullable(locationName),
          location_lat: lat,
          location_lng: lng,
          cta_phone: qrxType === "business" ? toNullable(ctaPhone) : null,
          cta_website: qrxType === "business" ? toNullable(ctaWebsite) : null,
          cta_email: qrxType === "business" ? toNullable(ctaEmail) : null,
          cta_navigation: qrxType === "business" ? toNullable(ctaNavigation) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", qrxId)
        .eq("owner_user_id", user.id);

      if (error) throw error;

      if (passwordWasDisabled) {
        await saveQrxPasswordProtection({ qrxId, enabled: false, password: "" });
        setPasswordWasProtected(false);
        setQrxPassword("");
        setQrxPasswordRepeat("");
      } else if (passwordWasEnabled || passwordChanged) {
        await saveQrxPasswordProtection({ qrxId, enabled: true, password: nextPassword });
        setPasswordWasProtected(true);
        setPasswordProtected(true);
        setQrxPassword("");
        setQrxPasswordRepeat("");
      }

      setSuccessText("QR-X wurde gespeichert.");
      router.refresh();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "QR-X konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  function handleVerificationFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setVerificationDocument(file);
    event.target.value = "";
  }

  async function handleSubmitVerificationRequest() {
    setVerificationSaving(true);
    setErrorText(null);
    setSuccessText(null);

    let chargedVerification = false;
    let uploadedStoragePath: string | null = null;

    try {
      if (!qrxId) throw new Error("QR-X ID fehlt.");
      if (qrxType !== "business") throw new Error("Nur Business QR-X können verifiziert werden.");
      if (isVerified) throw new Error("Dieser QR-X ist bereits verifiziert.");
      if (verificationRequest?.status === "pending") {
        throw new Error("Für diesen QR-X liegt bereits ein Verifizierungsantrag vor.");
      }
      if (!verificationDocument) {
        throw new Error("Bitte lade einen Nachweis als Bild oder PDF hoch.");
      }

      const allowed = verificationDocument.type.startsWith("image/") || verificationDocument.type === "application/pdf" || verificationDocument.name.toLowerCase().endsWith(".pdf");
      if (!allowed) {
        throw new Error("Bitte lade nur ein Bild oder eine PDF-Datei für die Verifizierung hoch.");
      }

      const user = await getCurrentUserOrThrow();
      await loadCreditBalance(user.id);

      if (credits != null && credits < QRX_VERIFICATION_COST_CREDITS) {
        throw new Error(
          `Nicht genug Credits. Benötigt: ${QRX_VERIFICATION_COST_CREDITS}, vorhanden: ${credits}.`,
        );
      }

      await spendCredits(QRX_VERIFICATION_COST_CREDITS);
      chargedVerification = true;

      const safeFilename = sanitizeFilename(verificationDocument.name);
      const storagePath = `${user.id}/${qrxId}/${Date.now().toString()}-${safeFilename}`;
      const documentType = verificationDocument.type === "application/pdf" || verificationDocument.name.toLowerCase().endsWith(".pdf") ? "pdf" : "image";

      const { error: uploadError } = await supabase.storage
        .from(QRX_VERIFICATION_BUCKET)
        .upload(storagePath, verificationDocument, {
          contentType: verificationDocument.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) throw uploadError;
      uploadedStoragePath = storagePath;

      const { error: insertError } = await supabase
        .from("qrx_verification_requests")
        .insert({
          qrx_id: qrxId,
          owner_user_id: user.id,
          status: "pending",
          credits_charged: QRX_VERIFICATION_COST_CREDITS,
          refund_done: false,
          document_url: `storage://${QRX_VERIFICATION_BUCKET}/${storagePath}`,
          document_path: storagePath,
          document_filename: verificationDocument.name,
          document_mime_type: verificationDocument.type || "application/octet-stream",
          document_type: documentType,
        });

      if (insertError) throw insertError;

      setVerificationDocument(null);
      await Promise.all([loadCreditBalance(user.id), loadLatestVerificationRequest(user.id)]);
      setSuccessText("Verifizierungsantrag wurde eingereicht. Dein QR-X wird nun geprüft.");
    } catch (error) {
      if (uploadedStoragePath) {
        try {
          await supabase.storage.from(QRX_VERIFICATION_BUCKET).remove([uploadedStoragePath]);
        } catch (removeError) {
          console.warn("Verifizierungsdokument-Cleanup fehlgeschlagen:", removeError);
        }
      }

      if (chargedVerification) {
        try {
          await addCredits(QRX_VERIFICATION_COST_CREDITS);
        } catch (refundError) {
          console.warn("Credit-Rückbuchung nach Verifizierungsfehler fehlgeschlagen:", refundError);
        }
      }

      setErrorText(normalizeErrorMessage(error) || "Verifizierungsantrag konnte nicht eingereicht werden.");
    } finally {
      setVerificationSaving(false);
    }
  }


  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && !isImageFile(file)) {
      setErrorText("Bitte wähle für das Logo ein Bild aus.");
      event.target.value = "";
      return;
    }
    setLogoFile(file);
    event.target.value = "";
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && !isImageFile(file)) {
      setErrorText("Bitte wähle für das Cover ein Bild aus.");
      event.target.value = "";
      return;
    }
    setCoverFile(file);
    event.target.value = "";
  }

  function handleGalleryFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).filter(isImageFile);
    if (selected.length > 0) setGalleryFiles((current) => [...current, ...selected]);
    event.target.value = "";
  }

  function handleFileUploadsChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length > 0) setFileUploads((current) => [...current, ...selected]);
    event.target.value = "";
  }

  async function handleSaveMedia() {
    setMediaSaving(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!qrxId) throw new Error("QR-X ID fehlt.");
      const user = await getCurrentUserOrThrow();

      if (logoFile) {
        const uploadedLogoUrl = await uploadQrxMedia({
          qrxId,
          file: logoFile,
          prefix: "logo",
          mediaType: "image",
        });

        const { error } = await supabase
          .from("qr_x_entries")
          .update({ logo_url: uploadedLogoUrl, updated_at: new Date().toISOString() })
          .eq("id", qrxId)
          .eq("owner_user_id", user.id);

        if (error) throw error;
        setLogoUrl(uploadedLogoUrl);
      }

      if (coverFile) {
        const uploadedCoverUrl = await uploadQrxMedia({
          qrxId,
          file: coverFile,
          prefix: "cover",
          mediaType: "image",
        });

        const { error } = await supabase
          .from("qr_x_entries")
          .update({ cover_image_url: uploadedCoverUrl, updated_at: new Date().toISOString() })
          .eq("id", qrxId)
          .eq("owner_user_id", user.id);

        if (error) throw error;
        setCoverUrl(uploadedCoverUrl);
      }

      for (const file of galleryFiles) {
        await uploadQrxMedia({ qrxId, file, prefix: "gallery", mediaType: "image" });
      }

      for (const file of fileUploads) {
        await uploadQrxMedia({ qrxId, file, prefix: "file", mediaType: "file" });
      }

      setLogoFile(null);
      setCoverFile(null);
      setGalleryFiles([]);
      setFileUploads([]);
      await Promise.all([loadQrx(), loadCreditBalance(user.id)]);
      setSuccessText("Medien wurden gespeichert.");
    } catch (error) {
      setErrorText(normalizeErrorMessage(error) || "Medien konnten nicht gespeichert werden.");
    } finally {
      setMediaSaving(false);
    }
  }

  async function handleDeleteMedia(media: QrxMedia) {
    const ok = window.confirm(`Möchtest du „${media.filename}“ wirklich löschen? Das gekaufte Speicherkontingent bleibt erhalten.`);
    if (!ok) return;

    setMediaSaving(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!qrxId) throw new Error("QR-X ID fehlt.");
      const user = await getCurrentUserOrThrow();

      const updates: Record<string, string | null> = {};
      if (logoUrl && media.url === logoUrl) updates.logo_url = null;
      if (coverUrl && media.url === coverUrl) updates.cover_image_url = null;

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("qr_x_entries")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", qrxId)
          .eq("owner_user_id", user.id);

        if (updateError) throw updateError;
      }

      const { error } = await supabase
        .from("qr_x_media")
        .delete()
        .eq("id", media.id)
        .eq("qrx_id", qrxId);

      if (error) throw error;

      if (media.url === logoUrl) setLogoUrl(null);
      if (media.url === coverUrl) setCoverUrl(null);
      await loadMediaAndStorage();
      setSuccessText("Medium wurde entfernt. Dein gekauftes Speicherlimit bleibt erhalten.");
    } catch (error) {
      setErrorText(normalizeErrorMessage(error) || "Medium konnte nicht gelöscht werden.");
    } finally {
      setMediaSaving(false);
    }
  }

  async function handleClearLogo() {
    if (!logoUrl) {
      setLogoFile(null);
      return;
    }

    const existing = mediaItems.find((item) => item.url === logoUrl);
    if (existing) {
      await handleDeleteMedia(existing);
      return;
    }

    const ok = window.confirm("Möchtest du das Logo wirklich entfernen?");
    if (!ok) return;

    const user = await getCurrentUserOrThrow();
    const { error } = await supabase
      .from("qr_x_entries")
      .update({ logo_url: null, updated_at: new Date().toISOString() })
      .eq("id", qrxId)
      .eq("owner_user_id", user.id);
    if (error) setErrorText(normalizeErrorMessage(error));
    else setLogoUrl(null);
  }

  async function handleClearCover() {
    if (!coverUrl) {
      setCoverFile(null);
      return;
    }

    const existing = mediaItems.find((item) => item.url === coverUrl);
    if (existing) {
      await handleDeleteMedia(existing);
      return;
    }

    const ok = window.confirm("Möchtest du das Coverbild wirklich entfernen?");
    if (!ok) return;

    const user = await getCurrentUserOrThrow();
    const { error } = await supabase
      .from("qr_x_entries")
      .update({ cover_image_url: null, updated_at: new Date().toISOString() })
      .eq("id", qrxId)
      .eq("owner_user_id", user.id);
    if (error) setErrorText(normalizeErrorMessage(error));
    else setCoverUrl(null);
  }

  const isBusiness = qrxType === "business";
  const canSubmitVerification =
    isBusiness &&
    !isVerified &&
    verificationRequest?.status !== "pending" &&
    !verificationSaving;

  const usedMb = usedBytes / 1024 / 1024;
  const freeMb = Math.max(storageLimitMb - usedMb, 0);
  const usagePercent = storageLimitMb > 0 ? Math.min((usedMb / storageLimitMb) * 100, 100) : 0;
  const visibleImageMedia = mediaItems.filter((item) => item.type === "image" && item.url !== logoUrl && item.url !== coverUrl);
  const visibleFileMedia = mediaItems.filter((item) => item.type === "file");
  const hasPendingMedia = Boolean(logoFile || coverFile || galleryFiles.length > 0 || fileUploads.length > 0);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-white.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="QR-X bearbeiten Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
          {qrxId ? <Link href={`/${locale}/qrx/${qrxId}`}>QR-X öffnen</Link> : null}
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>QR-X bearbeiten</span>
          <h1>{title.trim() || "QR-X bearbeiten"}</h1>
          <p>
            Bearbeite die Basisdaten deines QR-X, verwalte den Passwortschutz und beantrage für Business QR-X die Verifizierung.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx`} className={styles.secondaryButton}>
            Zurück zu Meine QR-X
          </Link>
        </div>
      </section>

      <section style={panelStyle}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Basisdaten</h2>
            <p>Ändere Typ, Titel, Beschreibung, Standort und Kontaktaktionen.</p>
          </div>
          <span>{isBusiness ? "Business QR-X" : "Normaler QR-X"}</span>
        </div>

        {loading ? <div style={loadingStyle}>QR-X wird geladen …</div> : null}

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}
        {successText ? <div style={successStyle}>{successText}</div> : null}

        {!loading ? (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                type="button"
                onClick={() => setQrxType("normal")}
                style={typeButtonStyle(qrxType === "normal", "normal")}
              >
                ⌗ Normaler QR-X
              </button>

              <button
                type="button"
                onClick={() => setQrxType("business")}
                style={typeButtonStyle(qrxType === "business", "business")}
              >
                🏢 Business QR-X
              </button>
            </div>

            <label style={labelStyle}>
              Titel *
              <input value={title} onChange={(event) => setTitle(event.target.value)} style={inputStyle} required />
            </label>

            {isBusiness ? (
              <label style={labelStyle}>
                Firmenname
                <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} style={inputStyle} />
              </label>
            ) : null}

            <label style={labelStyle}>
              Beschreibung
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                style={{ ...inputStyle, minHeight: 140, paddingTop: 14, resize: "vertical" }}
              />
            </label>

            <label style={labelStyle}>
              Standortname
              <input value={locationName} onChange={(event) => setLocationName(event.target.value)} style={inputStyle} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={labelStyle}>
                Breitengrad
                <input value={locationLat} onChange={(event) => setLocationLat(event.target.value)} style={inputStyle} placeholder="z. B. 50.9375" />
              </label>

              <label style={labelStyle}>
                Längengrad
                <input value={locationLng} onChange={(event) => setLocationLng(event.target.value)} style={inputStyle} placeholder="z. B. 6.9603" />
              </label>
            </div>

            {isBusiness ? (
              <>
                <div style={dividerStyle} />

                <div>
                  <h3 style={{ margin: "0 0 10px", color: "#ffffff", fontSize: 18 }}>Kontakt & Aktionen</h3>
                  <p style={{ margin: "0 0 14px", color: "#94a3b8", lineHeight: 1.55 }}>
                    Diese Angaben erscheinen später als Buttons in der QR-X Webansicht.
                  </p>
                </div>

                <label style={labelStyle}>
                  Telefon
                  <input value={ctaPhone} onChange={(event) => setCtaPhone(event.target.value)} style={inputStyle} />
                </label>

                <label style={labelStyle}>
                  Webseite
                  <input value={ctaWebsite} onChange={(event) => setCtaWebsite(event.target.value)} style={inputStyle} placeholder="https://..." />
                </label>

                <label style={labelStyle}>
                  E-Mail
                  <input value={ctaEmail} onChange={(event) => setCtaEmail(event.target.value)} style={inputStyle} />
                </label>

                <label style={labelStyle}>
                  Navigation
                  <input value={ctaNavigation} onChange={(event) => setCtaNavigation(event.target.value)} style={inputStyle} placeholder="Adresse oder Google-Maps-Link" />
                </label>
              </>
            ) : null}

            <div style={passwordBoxStyle(passwordProtected)}>
              <label style={passwordToggleStyle}>
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

              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55, fontSize: 13 }}>
                Wenn aktiviert, müssen Besucher vor dem Öffnen dieses QR-X ein Passwort eingeben.
                {passwordWasProtected && passwordProtected ? " Lasse die Felder leer, wenn du das bestehende Passwort behalten möchtest." : ""}
              </p>

              {passwordProtected ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={labelStyle}>
                    {passwordWasProtected ? "Neues Passwort" : "Passwort *"}
                    <input
                      type="password"
                      value={qrxPassword}
                      onChange={(event) => setQrxPassword(event.target.value)}
                      style={inputStyle}
                      minLength={4}
                      required={!passwordWasProtected}
                      autoComplete="new-password"
                    />
                  </label>

                  <label style={labelStyle}>
                    {passwordWasProtected ? "Neues Passwort wiederholen" : "Passwort wiederholen *"}
                    <input
                      type="password"
                      value={qrxPasswordRepeat}
                      onChange={(event) => setQrxPasswordRepeat(event.target.value)}
                      style={inputStyle}
                      minLength={4}
                      required={!passwordWasProtected}
                      autoComplete="new-password"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            {isBusiness ? (
              <div style={verificationBoxStyle(isVerified, verificationRequest?.status)}>
                <div style={verificationHeaderStyle}>
                  <div>
                    <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>Business-Verifizierung</h3>
                    <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                      {getVerificationStatusText({ isVerified, request: verificationRequest })}
                    </p>
                  </div>
                  <span style={verificationBadgeStyle(isVerified, verificationRequest?.status)}>
                    {isVerified ? "Verifiziert" : getVerificationStatusLabel(verificationRequest?.status)}
                  </span>
                </div>

                <div style={verificationInfoStyle}>
                  <strong>Kosten: {QRX_VERIFICATION_COST_CREDITS} Credits</strong>
                  <span>Aktuelle Credits: {credits == null ? "…" : credits}</span>
                </div>

                {verificationRequest ? (
                  <div style={requestSummaryStyle}>
                    <strong>Letzter Antrag</strong>
                    <span>Status: {getVerificationStatusLabel(verificationRequest.status)}</span>
                    {verificationRequest.document_filename ? <span>Dokument: {verificationRequest.document_filename}</span> : null}
                    {verificationRequest.credits_charged ? <span>Abgezogen: {verificationRequest.credits_charged} Credits</span> : null}
                  </div>
                ) : null}

                {!isVerified && verificationRequest?.status !== "pending" ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.55, fontSize: 13, fontWeight: 800 }}>
                      Lade einen Nachweis hoch, z. B. Gewerbeanmeldung, Handelsregisterauszug oder einen vergleichbaren offiziellen Nachweis. Erlaubt sind Bilder und PDF-Dateien.
                    </p>

                    <label style={fileButtonStyle}>
                      Nachweis auswählen
                      <input
                        type="file"
                        accept="image/*,application/pdf,.pdf"
                        onChange={handleVerificationFileChange}
                        style={{ display: "none" }}
                      />
                    </label>

                    {verificationDocument ? (
                      <div style={selectedDocumentStyle}>
                        <div>
                          <strong>{verificationDocument.name}</strong>
                          <span>{verificationDocument.type || "Datei"} · {formatBytes(verificationDocument.size)}</span>
                        </div>
                        <button type="button" onClick={() => setVerificationDocument(null)} style={miniDangerButtonStyle}>
                          Entfernen
                        </button>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleSubmitVerificationRequest}
                      disabled={!canSubmitVerification || !verificationDocument}
                      className={styles.primaryButton}
                      style={{
                        border: 0,
                        justifySelf: "start",
                        cursor: !canSubmitVerification || !verificationDocument ? "not-allowed" : "pointer",
                        opacity: !canSubmitVerification || !verificationDocument ? 0.7 : 1,
                      }}
                    >
                      {verificationSaving ? "Antrag wird eingereicht …" : "Verifizierung beantragen"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <Link href={`/${locale}/dashboard/qrx`} className={styles.secondaryButton}>
                Abbrechen
              </Link>

              <button type="submit" disabled={saving || verificationSaving} className={styles.primaryButton} style={{ border: 0, cursor: saving || verificationSaving ? "not-allowed" : "pointer", opacity: saving || verificationSaving ? 0.72 : 1 }}>
                {saving ? "Speichert …" : "QR-X speichern"}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {!loading ? (
        <section id="medien" style={{ ...panelStyle, marginTop: 22 }}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Bilder & Medien</h2>
              <p>Verwalte Logo, Coverbild, Galerie-Bilder und Dateien direkt auf dieser Bearbeitungsseite.</p>
            </div>
            <span>
              {usedMb.toFixed(1).replace(".", ",")} MB / {storageLimitMb} MB
            </span>
          </div>

          <div style={storageBoxStyle}>
            <div style={storageProgressTrackStyle}>
              <div style={storageProgressBarStyle(usagePercent)} />
            </div>
            <div style={storageMetaStyle}>
              <span>Verfügbar: {freeMb.toFixed(1).replace(".", ",")} MB</span>
              <span>2 MB kostenlos · danach +5 MB = 1 Credit</span>
            </div>
            <p style={{ margin: "10px 0 0", color: "#94a3b8", fontSize: 13, lineHeight: 1.5, fontWeight: 750 }}>
              Dein gekauftes Speicherkontingent bleibt erhalten, auch wenn du Bilder oder Dateien später löschst.
            </p>
          </div>

          <div style={mediaGridStyle}>
            <div style={mediaUploadBoxStyle}>
              <h3 style={mediaTitleStyle}>Logo</h3>
              {logoUrl ? <img src={logoUrl} alt="Aktuelles Logo" style={logoPreviewStyle} /> : <p style={emptyTextStyle}>Noch kein Logo hinterlegt.</p>}
              {logoFile ? <p style={selectedFileTextStyle}>Neu ausgewählt: {logoFile.name} · {formatBytes(logoFile.size)}</p> : null}
              <div style={mediaActionRowStyle}>
                <label style={fileButtonStyle}>
                  Logo auswählen
                  <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
                </label>
                {logoFile ? <button type="button" onClick={() => setLogoFile(null)} style={miniDangerButtonStyle}>Auswahl entfernen</button> : null}
                {logoUrl ? <button type="button" onClick={handleClearLogo} style={miniDangerButtonStyle}>Logo löschen</button> : null}
              </div>
            </div>

            <div style={mediaUploadBoxStyle}>
              <h3 style={mediaTitleStyle}>Coverbild</h3>
              {coverUrl ? <img src={coverUrl} alt="Aktuelles Coverbild" style={coverPreviewStyle} /> : <p style={emptyTextStyle}>Noch kein Coverbild hinterlegt.</p>}
              {coverFile ? <p style={selectedFileTextStyle}>Neu ausgewählt: {coverFile.name} · {formatBytes(coverFile.size)}</p> : null}
              <div style={mediaActionRowStyle}>
                <label style={fileButtonStyle}>
                  Cover auswählen
                  <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: "none" }} />
                </label>
                {coverFile ? <button type="button" onClick={() => setCoverFile(null)} style={miniDangerButtonStyle}>Auswahl entfernen</button> : null}
                {coverUrl ? <button type="button" onClick={handleClearCover} style={miniDangerButtonStyle}>Cover löschen</button> : null}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
            <div style={mediaUploadBoxStyle}>
              <h3 style={mediaTitleStyle}>Galerie-Bilder</h3>
              <p style={emptyTextStyle}>Du kannst mehrere Bilder gleichzeitig auswählen.</p>
              <label style={fileButtonStyle}>
                Bilder auswählen
                <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} style={{ display: "none" }} />
              </label>

              {galleryFiles.length > 0 ? (
                <div style={pendingListStyle}>
                  {galleryFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={selectedDocumentStyle}>
                      <span>{file.name} · {formatBytes(file.size)}</span>
                      <button type="button" onClick={() => setGalleryFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={miniDangerButtonStyle}>Entfernen</button>
                    </div>
                  ))}
                </div>
              ) : null}

              {visibleImageMedia.length > 0 ? (
                <div style={mediaCardGridStyle}>
                  {visibleImageMedia.map((item) => (
                    <div key={item.id} style={mediaCardStyle}>
                      <img src={item.url} alt={item.filename} style={mediaImageStyle} />
                      <strong style={mediaFilenameStyle}>{item.filename}</strong>
                      <span style={mediaSubTextStyle}>{formatBytes(item.bytes)}</span>
                      <button type="button" onClick={() => handleDeleteMedia(item)} style={miniDangerButtonStyle}>Löschen</button>
                    </div>
                  ))}
                </div>
              ) : <p style={emptyTextStyle}>Noch keine Galerie-Bilder vorhanden.</p>}
            </div>

            <div style={mediaUploadBoxStyle}>
              <h3 style={mediaTitleStyle}>Dateien & PDFs</h3>
              <p style={emptyTextStyle}>PDFs und andere Dateien werden als Datei-Medien gespeichert.</p>
              <label style={fileButtonStyle}>
                Dateien auswählen
                <input type="file" multiple onChange={handleFileUploadsChange} style={{ display: "none" }} />
              </label>

              {fileUploads.length > 0 ? (
                <div style={pendingListStyle}>
                  {fileUploads.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={selectedDocumentStyle}>
                      <span>{file.name} · {formatBytes(file.size)}</span>
                      <button type="button" onClick={() => setFileUploads((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={miniDangerButtonStyle}>Entfernen</button>
                    </div>
                  ))}
                </div>
              ) : null}

              {visibleFileMedia.length > 0 ? (
                <div style={pendingListStyle}>
                  {visibleFileMedia.map((item) => (
                    <div key={item.id} style={selectedDocumentStyle}>
                      <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", fontWeight: 950, textDecoration: "none" }}>
                        {item.filename}
                      </a>
                      <span>{formatBytes(item.bytes)}</span>
                      <button type="button" onClick={() => handleDeleteMedia(item)} style={miniDangerButtonStyle}>Löschen</button>
                    </div>
                  ))}
                </div>
              ) : <p style={emptyTextStyle}>Noch keine Dateien vorhanden.</p>}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            {hasPendingMedia ? (
              <button
                type="button"
                onClick={() => {
                  setLogoFile(null);
                  setCoverFile(null);
                  setGalleryFiles([]);
                  setFileUploads([]);
                }}
                style={miniDangerButtonStyle}
              >
                Auswahl leeren
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSaveMedia}
              disabled={!hasPendingMedia || mediaSaving || saving || verificationSaving}
              className={styles.primaryButton}
              style={{ border: 0, cursor: !hasPendingMedia || mediaSaving ? "not-allowed" : "pointer", opacity: !hasPendingMedia || mediaSaving ? 0.7 : 1 }}
            >
              {mediaSaving ? "Medien werden gespeichert …" : "Medien speichern"}
            </button>
          </div>
        </section>
      ) : null}

    </main>
  );
}

function typeButtonStyle(active: boolean, type: QrxType): CSSProperties {
  return {
    minHeight: 74,
    borderRadius: 18,
    border: active
      ? type === "business"
        ? "1px solid #fed7aa"
        : "1px solid #bbf7d0"
      : "1px solid rgba(148, 163, 184, 0.22)",
    background: active
      ? type === "business"
        ? "rgba(251,146,60,0.16)"
        : "rgba(34,197,94,0.16)"
      : "rgba(255,255,255,0.06)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
  };
}

const panelStyle: CSSProperties = {
  maxWidth: 880,
  margin: "0 auto",
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

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

const dividerStyle: CSSProperties = {
  height: 1,
  background: "rgba(255,255,255,0.09)",
  margin: "4px 0",
};

const loadingStyle: CSSProperties = {
  minHeight: 160,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  fontWeight: 950,
};

const errorStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  marginBottom: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const successStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  marginBottom: 16,
  background: "rgba(34, 197, 94, 0.14)",
  border: "1px solid rgba(134, 239, 172, 0.22)",
  color: "#bbf7d0",
  fontWeight: 850,
  lineHeight: 1.55,
};

function passwordBoxStyle(active: boolean): CSSProperties {
  return {
    borderRadius: 22,
    padding: 16,
    background: active ? "rgba(59,130,246,0.14)" : "rgba(255,255,255,0.045)",
    border: active ? "1px solid rgba(147,197,253,0.28)" : "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 12,
  };
}

const passwordToggleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  color: "#ffffff",
  fontWeight: 950,
  cursor: "pointer",
};

function verificationBoxStyle(isVerified: boolean, status: VerificationStatus | null | undefined): CSSProperties {
  const active = isVerified || status === "pending";
  return {
    borderRadius: 22,
    padding: 16,
    background: isVerified ? "rgba(34,197,94,0.14)" : active ? "rgba(250,204,21,0.12)" : "rgba(255,255,255,0.045)",
    border: isVerified ? "1px solid rgba(134,239,172,0.28)" : active ? "1px solid rgba(253,224,71,0.24)" : "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 14,
  };
}

const verificationHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
};

function verificationBadgeStyle(isVerified: boolean, status: VerificationStatus | null | undefined): CSSProperties {
  return {
    borderRadius: 999,
    padding: "8px 12px",
    background: isVerified ? "rgba(34,197,94,0.2)" : status === "pending" ? "rgba(250,204,21,0.18)" : "rgba(148,163,184,0.14)",
    border: isVerified ? "1px solid rgba(134,239,172,0.34)" : status === "pending" ? "1px solid rgba(253,224,71,0.32)" : "1px solid rgba(148,163,184,0.22)",
    color: isVerified ? "#bbf7d0" : status === "pending" ? "#fef08a" : "#cbd5e1",
    fontSize: 12,
    fontWeight: 950,
  };
}

const verificationInfoStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(148,163,184,0.14)",
  color: "#dbeafe",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  fontSize: 13,
  fontWeight: 850,
};

const requestSummaryStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
  display: "grid",
  gap: 5,
  fontSize: 13,
  fontWeight: 800,
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
  justifySelf: "start",
};

const selectedDocumentStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#bfdbfe",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  fontSize: 13,
  fontWeight: 850,
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
};


const storageBoxStyle: CSSProperties = {
  borderRadius: 20,
  padding: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  marginBottom: 18,
};

const storageProgressTrackStyle: CSSProperties = {
  height: 12,
  borderRadius: 999,
  overflow: "hidden",
  background: "rgba(255,255,255,0.08)",
};

function storageProgressBarStyle(percent: number): CSSProperties {
  return {
    width: `${percent}%`,
    height: "100%",
    background: percent > 90 ? "#ef4444" : percent > 75 ? "#f59e0b" : "#22c55e",
    transition: "width .2s ease",
  };
}

const storageMetaStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 12,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const mediaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const mediaUploadBoxStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 12,
};

const mediaTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 950,
};

const emptyTextStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
  lineHeight: 1.55,
  fontWeight: 750,
};

const selectedFileTextStyle: CSSProperties = {
  margin: 0,
  color: "#bfdbfe",
  fontSize: 13,
  lineHeight: 1.55,
  fontWeight: 850,
};

const mediaActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

const logoPreviewStyle: CSSProperties = {
  width: 96,
  height: 96,
  objectFit: "cover",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(15,23,42,0.55)",
};

const coverPreviewStyle: CSSProperties = {
  width: "100%",
  maxHeight: 180,
  objectFit: "cover",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(15,23,42,0.55)",
};

const pendingListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const mediaCardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

const mediaCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 10,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(148,163,184,0.14)",
  display: "grid",
  gap: 8,
};

const mediaImageStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
};

const mediaFilenameStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 900,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const mediaSubTextStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 800,
};
