"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../../dashboard.module.css";

type QrxEntry = {
  id: string;
  title: string | null;
  company_name: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  owner_user_id: string | null;
};

type QrxMedia = {
  id: string;
  qrx_id: string;
  type: "image" | "file" | "logo" | string;
  url: string;
  filename: string;
  bytes: number | null;
  created_at?: string | null;
};

type MediaUploadKind = "image" | "file" | "logo";

type PrepareUploadResponse = {
  uploadUrl?: string;
  signedUrl?: string;
  signed_url?: string;
  url?: string;
  storagePath?: string;
  storage_path?: string;
  path?: string;
};

type FinalizeUploadResponse = {
  publicUrl?: string;
  public_url?: string;
  url?: string;
  media?: {
    url?: string | null;
  } | null;
};

type MediaAnalyticsSummary = {
  qrx_id: string;
  media_count: number | string | null;
  image_views_total: number | string | null;
  image_views_7d: number | string | null;
  image_views_30d: number | string | null;
  unique_image_viewers_total: number | string | null;
  unique_image_viewers_7d: number | string | null;
  unique_image_viewers_30d: number | string | null;
  last_image_view_at: string | null;
  file_opens_total: number | string | null;
  file_opens_7d: number | string | null;
  file_opens_30d: number | string | null;
  unique_file_openers_total: number | string | null;
  unique_file_openers_7d: number | string | null;
  unique_file_openers_30d: number | string | null;
  last_file_open_at: string | null;
  file_downloads_total: number | string | null;
  file_downloads_7d: number | string | null;
  file_downloads_30d: number | string | null;
  unique_file_downloaders_total: number | string | null;
  unique_file_downloaders_7d: number | string | null;
  unique_file_downloaders_30d: number | string | null;
  last_file_download_at: string | null;
  variant_delivery_total: number | string | null;
  variant_delivery_7d: number | string | null;
  variant_delivery_30d: number | string | null;
  thumb_events_total: number | string | null;
  medium_events_total: number | string | null;
  large_events_total: number | string | null;
  original_events_total: number | string | null;
};

type MediaAnalyticsItem = {
  media_id: string;
  media_type: string;
  filename: string;
  views_total: number | string | null;
  views_7d: number | string | null;
  views_30d: number | string | null;
  unique_viewers_total: number | string | null;
  unique_viewers_7d: number | string | null;
  unique_viewers_30d: number | string | null;
  last_view_at: string | null;
  opens_total: number | string | null;
  opens_7d: number | string | null;
  opens_30d: number | string | null;
  unique_openers_total: number | string | null;
  unique_openers_7d: number | string | null;
  unique_openers_30d: number | string | null;
  last_open_at: string | null;
  downloads_total: number | string | null;
  downloads_7d: number | string | null;
  downloads_30d: number | string | null;
  unique_downloaders_total: number | string | null;
  unique_downloaders_7d: number | string | null;
  unique_downloaders_30d: number | string | null;
  last_download_at: string | null;
  thumb_events_total: number | string | null;
  medium_events_total: number | string | null;
  large_events_total: number | string | null;
  original_events_total: number | string | null;
  thumb_events_30d: number | string | null;
  medium_events_30d: number | string | null;
  large_events_30d: number | string | null;
  original_events_30d: number | string | null;
  total_interactions: number | string | null;
  last_interaction_at: string | null;
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
  return fromType && fromType.trim() ? fromType : "bin";
}

function buildUploadFilename(prefix: string, file: File) {
  const ext = getFileExtension(file).replace(/[^a-z0-9]/gi, "") || "bin";
  const safePrefix = prefix.replace(/[^a-z0-9_-]/gi, "") || "upload";

  return `${safePrefix}-${Date.now().toString()}-${Math.random()
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

function toAnalyticsNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatAnalyticsNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
  }).format(toAnalyticsNumber(value));
}

function formatAnalyticsDate(value: string | null | undefined) {
  if (!value) return "Noch keine Aktivität";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Noch keine Aktivität";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isImageMime(file: File) {
  return file.type.startsWith("image/");
}


function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getTitle(entry: QrxEntry | null) {
  if (!entry) return "QR-X Medien";
  return entry.company_name?.trim() || entry.title?.trim() || "QR-X Medien";
}

export default function QrxMediaPage() {
  const router = useRouter();
  const params = useParams();

  const locale = getParam(params?.locale as string | string[] | undefined, "de");
  const qrxId = getParam(params?.id as string | string[] | undefined, "");

  const [loading, setLoading] = useState(true);
  const [uploadingBase, setUploadingBase] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [entry, setEntry] = useState<QrxEntry | null>(null);
  const [media, setMedia] = useState<QrxMedia[]>([]);
  const [analyticsSummary, setAnalyticsSummary] =
    useState<MediaAnalyticsSummary | null>(null);
  const [analyticsItems, setAnalyticsItems] = useState<MediaAnalyticsItem[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [fileUploads, setFileUploads] = useState<File[]>([]);

  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  useEffect(() => {
    void loadMediaPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrxId]);

  async function loadMediaPage() {
    setLoading(true);
    setErrorText(null);
    setSuccessText(null);

    if (!qrxId) {
      setErrorText("QR-X ID fehlt.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorText(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setErrorText("Bitte melde dich zuerst an.");
      setLoading(false);
      return;
    }

    const { data: entryData, error: entryError } = await supabase
      .from("qr_x_entries")
      .select("id,title,company_name,cover_image_url,logo_url,owner_user_id")
      .eq("id", qrxId)
      .maybeSingle()
      .returns<QrxEntry>();

    if (entryError) {
      setErrorText(entryError.message);
      setLoading(false);
      return;
    }

    if (!entryData) {
      setErrorText("QR-X wurde nicht gefunden.");
      setLoading(false);
      return;
    }

    if (entryData.owner_user_id !== user.id) {
      setErrorText("Du darfst diesen QR-X nicht bearbeiten.");
      setLoading(false);
      return;
    }

    const { data: mediaData, error: mediaError } = await supabase
      .from("qr_x_media")
      .select("id,qrx_id,type,url,filename,bytes,created_at")
      .eq("qrx_id", qrxId)
      .in("type", ["image", "file"])
      .order("created_at", { ascending: false })
      .returns<QrxMedia[]>();

    if (mediaError) {
      setErrorText(mediaError.message);
      setLoading(false);
      return;
    }

    setEntry(entryData);
    setMedia(mediaData ?? []);
    setLoading(false);
    await loadAnalytics(qrxId);
  }


  async function loadAnalytics(qrxIdInner: string) {
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    try {
      const [summaryResult, itemsResult] = await Promise.all([
        supabase.rpc("get_qrx_media_analytics_summary", {
          p_qrx_id: qrxIdInner,
        }),
        supabase.rpc("get_qrx_media_analytics_items", {
          p_qrx_id: qrxIdInner,
        }),
      ]);

      if (summaryResult.error) throw summaryResult.error;
      if (itemsResult.error) throw itemsResult.error;

      const summaryRows = (summaryResult.data ?? []) as MediaAnalyticsSummary[];
      const itemRows = (itemsResult.data ?? []) as MediaAnalyticsItem[];

      setAnalyticsSummary(summaryRows[0] ?? null);
      setAnalyticsItems(itemRows);
    } catch (error) {
      console.warn("Media analytics load error:", error);
      setAnalyticsSummary(null);
      setAnalyticsItems([]);
      setAnalyticsError(
        error instanceof Error
          ? error.message
          : "Media Analytics konnten nicht geladen werden.",
      );
    } finally {
      setAnalyticsLoading(false);
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
    type: MediaUploadKind;
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
    type: MediaUploadKind;
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

  async function uploadMediaFile(args: {
    file: File;
    type: MediaUploadKind;
    prefix: string;
  }) {
    if (!entry) throw new Error("QR-X konnte nicht geladen werden.");

    const filename = buildUploadFilename(args.prefix, args.file);
    const mimeType = args.file.type || "application/octet-stream";
    const bytes = args.file.size;

    const prepared = await prepareUpload({
      qrxId: entry.id,
      type: args.type,
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
      qrxId: entry.id,
      type: args.type,
      filename,
      mimeType,
      bytes,
      storagePath: prepared.storagePath,
    });

    return finalized.publicUrl;
  }

  function handleCoverFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setCoverFile(file);

    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleGalleryFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter(isImageMime);
    setGalleryFiles(files);
  }

  function handleFileUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileUploads(Array.from(event.target.files ?? []));
  }

  async function handleUploadBaseImages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadingBase(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!entry) throw new Error("QR-X konnte nicht geladen werden.");
      if (!coverFile && !logoFile) {
        throw new Error("Bitte wähle ein Coverbild oder Logo aus.");
      }

      const updates: Partial<Pick<QrxEntry, "cover_image_url" | "logo_url">> & {
        updated_at?: string;
      } = {
        updated_at: new Date().toISOString(),
      };

      if (coverFile) {
        updates.cover_image_url = await uploadMediaFile({
          file: coverFile,
          type: "image",
          prefix: "cover",
        });
      }

      if (logoFile) {
        updates.logo_url = await uploadMediaFile({
          file: logoFile,
          type: "image",
          prefix: "logo",
        });
      }

      const { error } = await supabase
        .from("qr_x_entries")
        .update(updates)
        .eq("id", entry.id)
        .eq("owner_user_id", entry.owner_user_id);

      if (error) throw error;

      setCoverFile(null);
      setLogoFile(null);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setCoverPreview(null);
      setLogoPreview(null);

      setSuccessText("Coverbild und/oder Logo wurden hochgeladen.");
      router.refresh();
      await loadMediaPage();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Medien konnten nicht hochgeladen werden.");
    } finally {
      setUploadingBase(false);
    }
  }

  async function handleUploadGalleryImages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadingGallery(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!entry) throw new Error("QR-X konnte nicht geladen werden.");
      if (galleryFiles.length === 0) {
        throw new Error("Bitte wähle mindestens ein Bild aus.");
      }

      for (const file of galleryFiles) {
        await uploadMediaFile({
          file,
          type: "image",
          prefix: "gallery",
        });
      }

      setGalleryFiles([]);
      setSuccessText(`${galleryFiles.length} Galerie-Bild(er) wurden hochgeladen.`);
      await loadMediaPage();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Galerie-Bilder konnten nicht hochgeladen werden.");
    } finally {
      setUploadingGallery(false);
    }
  }

  async function handleUploadFiles(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadingFiles(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!entry) throw new Error("QR-X konnte nicht geladen werden.");
      if (fileUploads.length === 0) {
        throw new Error("Bitte wähle mindestens eine Datei aus.");
      }

      for (const file of fileUploads) {
        await uploadMediaFile({
          file,
          type: "file",
          prefix: "file",
        });
      }

      setFileUploads([]);
      setSuccessText(`${fileUploads.length} Datei(en) wurden hochgeladen.`);
      await loadMediaPage();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Dateien konnten nicht hochgeladen werden.");
    } finally {
      setUploadingFiles(false);
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    const confirmed = window.confirm("Diesen Eintrag aus QR-X Medien entfernen?");
    if (!confirmed) return;

    setDeletingId(mediaId);
    setErrorText(null);
    setSuccessText(null);

    try {
      const { error } = await supabase.from("qr_x_media").delete().eq("id", mediaId);
      if (error) throw error;

      setSuccessText("Medium wurde entfernt.");
      await loadMediaPage();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Medium konnte nicht entfernt werden.");
    } finally {
      setDeletingId(null);
    }
  }

  const analyticsByMediaId = new Map(
    analyticsItems.map((item) => [item.media_id, item]),
  );

  const totalUniqueVisitors = Math.max(
    toAnalyticsNumber(analyticsSummary?.unique_image_viewers_total),
    toAnalyticsNumber(analyticsSummary?.unique_file_openers_total),
    toAnalyticsNumber(analyticsSummary?.unique_file_downloaders_total),
  );

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="QR-X Medien Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Bilder & Medien</span>
          <h1>{getTitle(entry)}</h1>
          <p>
            Lade Coverbild, Logo, Galerie-Bilder und Dateien direkt im Web hoch. Die Uploads laufen über Supabase Storage und deine QR-X Medienlogik.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx/${qrxId}/edit`} className={styles.secondaryButton}>
            Basisdaten bearbeiten
          </Link>
          <Link href={`/${locale}/qrx/${qrxId}`} className={styles.secondaryButton}>
            QR-X öffnen
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        {loading ? (
          <div style={panelStyle}>
            <div style={{ minHeight: 220, display: "grid", placeItems: "center", color: "#cbd5e1", fontWeight: 950 }}>
              Medien werden geladen …
            </div>
          </div>
        ) : null}

        {errorText ? (
          <div style={errorStyle}>{errorText}</div>
        ) : null}

        {successText ? (
          <div style={successStyle}>{successText}</div>
        ) : null}

        {!loading && entry ? (
          <section style={panelStyle} aria-label="Media Analytics">
            <div className={styles.cardHeader}>
              <div>
                <h2>Media Analytics</h2>
                <p>
                  Aufrufe, Öffnungen und Downloads deiner QR-X-Medien. Automatisch
                  geladene Vorschaubilder werden nicht als Bildaufruf gezählt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadAnalytics(entry.id)}
                disabled={analyticsLoading}
                className={styles.secondaryButton}
                style={{
                  border: 0,
                  cursor: analyticsLoading ? "not-allowed" : "pointer",
                  opacity: analyticsLoading ? 0.72 : 1,
                }}
              >
                {analyticsLoading ? "Aktualisiert …" : "Aktualisieren"}
              </button>
            </div>

            {analyticsError ? (
              <div style={analyticsWarningStyle}>
                <strong>Analytics konnten nicht geladen werden.</strong>
                <span>{analyticsError}</span>
              </div>
            ) : null}

            <div style={analyticsSummaryGridStyle}>
              <AnalyticsSummaryCard
                icon="👁️"
                label="Bildaufrufe"
                value={analyticsSummary?.image_views_total}
                detail={`${formatAnalyticsNumber(
                  analyticsSummary?.image_views_30d,
                )} in 30 Tagen`}
              />
              <AnalyticsSummaryCard
                icon="📄"
                label="Dateiöffnungen"
                value={analyticsSummary?.file_opens_total}
                detail={`${formatAnalyticsNumber(
                  analyticsSummary?.file_opens_30d,
                )} in 30 Tagen`}
              />
              <AnalyticsSummaryCard
                icon="⬇️"
                label="Downloads"
                value={analyticsSummary?.file_downloads_total}
                detail={`${formatAnalyticsNumber(
                  analyticsSummary?.file_downloads_30d,
                )} in 30 Tagen`}
              />
              <AnalyticsSummaryCard
                icon="👤"
                label="Eindeutige Besucher"
                value={totalUniqueVisitors}
                detail="Datenschutzfreundlich gezählt"
              />
            </div>

            <div style={analyticsPeriodsGridStyle}>
              <AnalyticsPeriodCard
                title="Letzte 7 Tage"
                rows={[
                  ["Bildaufrufe", analyticsSummary?.image_views_7d],
                  ["Dateiöffnungen", analyticsSummary?.file_opens_7d],
                  ["Downloads", analyticsSummary?.file_downloads_7d],
                ]}
              />
              <AnalyticsPeriodCard
                title="Letzte 30 Tage"
                rows={[
                  ["Bildaufrufe", analyticsSummary?.image_views_30d],
                  ["Dateiöffnungen", analyticsSummary?.file_opens_30d],
                  ["Downloads", analyticsSummary?.file_downloads_30d],
                ]}
              />
              <AnalyticsPeriodCard
                title="Varianten gesamt"
                rows={[
                  ["Thumb", analyticsSummary?.thumb_events_total],
                  ["Medium", analyticsSummary?.medium_events_total],
                  ["Large", analyticsSummary?.large_events_total],
                  ["Original", analyticsSummary?.original_events_total],
                ]}
              />
            </div>

            <div style={lastActivityGridStyle}>
              <AnalyticsActivity
                label="Letzter Bildaufruf"
                value={analyticsSummary?.last_image_view_at}
              />
              <AnalyticsActivity
                label="Letzte Dateiöffnung"
                value={analyticsSummary?.last_file_open_at}
              />
              <AnalyticsActivity
                label="Letzter Download"
                value={analyticsSummary?.last_file_download_at}
              />
            </div>
          </section>
        ) : null}

        {!loading && entry ? (
          <>
            <form onSubmit={handleUploadBaseImages} style={panelStyle}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Coverbild & Logo hochladen</h2>
                  <p>Diese Bilder werden direkt in der QR-X Webansicht verwendet.</p>
                </div>
                <span>Basis</span>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={uploadBoxStyle}>
                    <strong style={{ color: "#ffffff" }}>Coverbild</strong>
                    <p style={smallTextStyle}>Großes Titelbild für deinen QR-X.</p>
                    {entry.cover_image_url ? <PreviewImage url={entry.cover_image_url} label="Aktuelles Coverbild" /> : null}
                    {coverPreview ? <PreviewImage url={coverPreview} label="Neue Cover-Vorschau" /> : null}
                    <label style={fileButtonStyle}>
                      Coverbild auswählen
                      <input type="file" accept="image/*" onChange={handleCoverFileChange} style={{ display: "none" }} />
                    </label>
                  </div>

                  <div style={uploadBoxStyle}>
                    <strong style={{ color: "#ffffff" }}>Logo</strong>
                    <p style={smallTextStyle}>Logo oder Profilbild für den QR-X.</p>
                    {entry.logo_url ? <PreviewImage url={entry.logo_url} label="Aktuelles Logo" compact /> : null}
                    {logoPreview ? <PreviewImage url={logoPreview} label="Neue Logo-Vorschau" compact /> : null}
                    <label style={fileButtonStyle}>
                      Logo auswählen
                      <input type="file" accept="image/*" onChange={handleLogoFileChange} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={uploadingBase}
                    className={styles.primaryButton}
                    style={{ border: 0, cursor: uploadingBase ? "not-allowed" : "pointer", opacity: uploadingBase ? 0.72 : 1 }}
                  >
                    {uploadingBase ? "Lädt hoch …" : "Cover & Logo hochladen"}
                  </button>
                </div>
              </div>
            </form>

            <form onSubmit={handleUploadGalleryImages} style={panelStyle}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Galerie-Bilder hochladen</h2>
                  <p>Wähle ein oder mehrere Bilder aus, die später in der QR-X Galerie erscheinen.</p>
                </div>
                <span>{media.filter((item) => item.type === "image").length} Bilder</span>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <label style={fileButtonStyle}>
                  Bilder auswählen
                  <input type="file" accept="image/*" multiple onChange={handleGalleryFileChange} style={{ display: "none" }} />
                </label>

                {galleryFiles.length > 0 ? (
                  <div style={selectionInfoStyle}>
                    Ausgewählt: {galleryFiles.map((file) => file.name).join(", ")}
                  </div>
                ) : null}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={uploadingGallery}
                    className={styles.primaryButton}
                    style={{ border: 0, cursor: uploadingGallery ? "not-allowed" : "pointer", opacity: uploadingGallery ? 0.72 : 1 }}
                  >
                    {uploadingGallery ? "Lädt hoch …" : "Galerie-Bilder hochladen"}
                  </button>
                </div>
              </div>
            </form>

            <form onSubmit={handleUploadFiles} style={panelStyle}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Dateien / PDFs hochladen</h2>
                  <p>Lade PDFs, Preislisten, Speisekarten oder andere Dateien für deinen QR-X hoch.</p>
                </div>
                <span>{media.filter((item) => item.type === "file").length} Dateien</span>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <label style={fileButtonStyle}>
                  Dateien auswählen
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,image/*,application/pdf"
                    onChange={handleFileUploadChange}
                    style={{ display: "none" }}
                  />
                </label>

                {fileUploads.length > 0 ? (
                  <div style={selectionInfoStyle}>
                    Ausgewählt: {fileUploads.map((file) => file.name).join(", ")}
                  </div>
                ) : null}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={uploadingFiles}
                    className={styles.primaryButton}
                    style={{ border: 0, cursor: uploadingFiles ? "not-allowed" : "pointer", opacity: uploadingFiles ? 0.72 : 1 }}
                  >
                    {uploadingFiles ? "Lädt hoch …" : "Dateien hochladen"}
                  </button>
                </div>
              </div>
            </form>

            <div style={panelStyle}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Galerie</h2>
                  <p>Diese Bilder sind aktuell mit deinem QR-X verknüpft.</p>
                </div>
                <span>{media.filter((item) => item.type === "image").length} Einträge</span>
              </div>

              {media.filter((item) => item.type === "image").length === 0 ? (
                <EmptyBox text="Noch keine Galerie-Bilder vorhanden." />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  {media.filter((item) => item.type === "image").map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      deletingId={deletingId}
                      analytics={analyticsByMediaId.get(item.id) ?? null}
                      onDelete={() => void handleDeleteMedia(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={panelStyle}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Dateien</h2>
                  <p>Diese Dateien sind aktuell mit deinem QR-X verknüpft.</p>
                </div>
                <span>{media.filter((item) => item.type === "file").length} Einträge</span>
              </div>

              {media.filter((item) => item.type === "file").length === 0 ? (
                <EmptyBox text="Noch keine Dateien vorhanden." />
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {media.filter((item) => item.type === "file").map((item) => (
                    <FileRow
                      key={item.id}
                      item={item}
                      deletingId={deletingId}
                      analytics={analyticsByMediaId.get(item.id) ?? null}
                      onDelete={() => void handleDeleteMedia(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function PreviewImage({ url, label, compact }: { url: string; label: string; compact?: boolean }) {
  return (
    <div
      style={{
        borderRadius: 22,
        padding: 12,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.075)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 900, marginBottom: 8 }}>{label}</div>
      <div style={{ height: compact ? 110 : 210, borderRadius: 16, overflow: "hidden", background: "#e2e8f0" }}>
        <img
          src={url}
          alt={label}
          style={{ width: "100%", height: "100%", objectFit: compact ? "contain" : "cover", display: "block" }}
        />
      </div>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div
      style={{
        minHeight: 180,
        display: "grid",
        placeItems: "center",
        color: "#94a3b8",
        textAlign: "center",
        borderRadius: 22,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.075)",
        fontWeight: 850,
      }}
    >
      {text}
    </div>
  );
}

function MediaCard({
  item,
  deletingId,
  analytics,
  onDelete,
}: {
  item: QrxMedia;
  deletingId: string | null;
  analytics: MediaAnalyticsItem | null;
  onDelete: () => void;
}) {
  return (
    <article
      style={{
        overflow: "hidden",
        borderRadius: 22,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.085)",
      }}
    >
      <div style={{ height: 150, background: "#e2e8f0", overflow: "hidden" }}>
        <img
          src={item.url}
          alt={item.filename}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <div style={{ padding: 12, display: "grid", gap: 10 }}>
        <strong style={{ color: "#ffffff", fontSize: 14, wordBreak: "break-word" }}>{item.filename}</strong>
        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850 }}>{formatBytes(item.bytes)}</span>
        <MediaItemAnalytics analytics={analytics} kind="image" />
        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", fontSize: 12, fontWeight: 900 }}>
          Bild öffnen
        </a>
        <DeleteButton deleting={deletingId === item.id} onDelete={onDelete} />
      </div>
    </article>
  );
}

function FileRow({
  item,
  deletingId,
  analytics,
  onDelete,
}: {
  item: QrxMedia;
  deletingId: string | null;
  analytics: MediaAnalyticsItem | null;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "center",
        borderRadius: 18,
        padding: 14,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.085)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <strong style={{ color: "#ffffff", wordBreak: "break-word" }}>📄 {item.filename}</strong>
        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850, marginTop: 4 }}>{formatBytes(item.bytes)}</div>
        <MediaItemAnalytics analytics={analytics} kind="file" />
        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", fontSize: 12, fontWeight: 900 }}>
          Datei öffnen
        </a>
      </div>

      <DeleteButton deleting={deletingId === item.id} onDelete={onDelete} />
    </div>
  );
}


function AnalyticsSummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: number | string | null | undefined;
  detail: string;
}) {
  return (
    <article style={analyticsSummaryCardStyle}>
      <span style={analyticsSummaryIconStyle}>{icon}</span>
      <div>
        <strong style={analyticsSummaryValueStyle}>
          {formatAnalyticsNumber(value)}
        </strong>
        <span style={analyticsSummaryLabelStyle}>{label}</span>
        <small style={analyticsSummaryDetailStyle}>{detail}</small>
      </div>
    </article>
  );
}

function AnalyticsPeriodCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, number | string | null | undefined]>;
}) {
  return (
    <article style={analyticsPeriodCardStyle}>
      <strong style={{ color: "#ffffff" }}>{title}</strong>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={analyticsPeriodRowStyle}>
            <span>{label}</span>
            <strong>{formatAnalyticsNumber(value)}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function AnalyticsActivity({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div style={analyticsActivityStyle}>
      <span>{label}</span>
      <strong>{formatAnalyticsDate(value)}</strong>
    </div>
  );
}

function MediaItemAnalytics({
  analytics,
  kind,
}: {
  analytics: MediaAnalyticsItem | null;
  kind: "image" | "file";
}) {
  if (!analytics) {
    return (
      <div style={mediaAnalyticsEmptyStyle}>
        Noch keine Analytics für dieses Medium.
      </div>
    );
  }

  const mainRows =
    kind === "image"
      ? [
          ["Aufrufe", analytics.views_total],
          ["7 Tage", analytics.views_7d],
          ["30 Tage", analytics.views_30d],
          ["Eindeutig", analytics.unique_viewers_total],
        ]
      : [
          ["Geöffnet", analytics.opens_total],
          ["Downloads", analytics.downloads_total],
          ["Öffnungen 30 Tage", analytics.opens_30d],
          ["Downloads 30 Tage", analytics.downloads_30d],
        ];

  return (
    <div style={mediaAnalyticsBoxStyle}>
      <div style={mediaAnalyticsGridStyle}>
        {mainRows.map(([label, value]) => (
          <div key={label} style={mediaAnalyticsMetricStyle}>
            <span>{label}</span>
            <strong>{formatAnalyticsNumber(value)}</strong>
          </div>
        ))}
      </div>

      <div style={mediaAnalyticsVariantStyle}>
        <span>Thumb {formatAnalyticsNumber(analytics.thumb_events_total)}</span>
        <span>Medium {formatAnalyticsNumber(analytics.medium_events_total)}</span>
        <span>Large {formatAnalyticsNumber(analytics.large_events_total)}</span>
        <span>Original {formatAnalyticsNumber(analytics.original_events_total)}</span>
      </div>

      <div style={mediaAnalyticsLastStyle}>
        {kind === "image" ? "Letzter Aufruf" : "Letzte Aktivität"}:{" "}
        {formatAnalyticsDate(
          kind === "image"
            ? analytics.last_view_at
            : analytics.last_interaction_at,
        )}
      </div>
    </div>
  );
}

function DeleteButton({ deleting, onDelete }: { deleting: boolean; onDelete: () => void }) {
  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={deleting}
      style={{
        minHeight: 38,
        borderRadius: 12,
        border: "1px solid rgba(252,165,165,0.22)",
        background: "rgba(239,68,68,0.14)",
        color: "#fecaca",
        fontWeight: 950,
        cursor: deleting ? "not-allowed" : "pointer",
        padding: "0 12px",
      }}
    >
      {deleting ? "Entfernt …" : "Entfernen"}
    </button>
  );
}

const panelStyle: React.CSSProperties = {
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};


const fileButtonStyle: React.CSSProperties = {
  minHeight: 52,
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.22)",
  background: "rgba(255,255,255,0.07)",
  color: "#ffffff",
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 900,
  textAlign: "center",
};

const uploadBoxStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  borderRadius: 22,
  padding: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const smallTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
  lineHeight: 1.55,
  fontWeight: 800,
};

const selectionInfoStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.55,
  wordBreak: "break-word",
};


const analyticsSummaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
};

const analyticsSummaryCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  borderRadius: 20,
  padding: 15,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.085)",
};

const analyticsSummaryIconStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  display: "grid",
  placeItems: "center",
  borderRadius: 16,
  background: "rgba(59,130,246,0.14)",
  fontSize: 20,
};

const analyticsSummaryValueStyle: React.CSSProperties = {
  display: "block",
  color: "#ffffff",
  fontSize: 24,
  fontWeight: 950,
};

const analyticsSummaryLabelStyle: React.CSSProperties = {
  display: "block",
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const analyticsSummaryDetailStyle: React.CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 800,
  marginTop: 3,
};

const analyticsPeriodsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 14,
};

const analyticsPeriodCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  borderRadius: 20,
  padding: 15,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const analyticsPeriodRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 850,
};

const lastActivityGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const analyticsActivityStyle: React.CSSProperties = {
  display: "grid",
  gap: 5,
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.08)",
  border: "1px solid rgba(147,197,253,0.16)",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 850,
};

const analyticsWarningStyle: React.CSSProperties = {
  display: "grid",
  gap: 5,
  borderRadius: 16,
  padding: 12,
  marginBottom: 14,
  background: "rgba(245,158,11,0.12)",
  border: "1px solid rgba(253,230,138,0.18)",
  color: "#fde68a",
  fontSize: 13,
  fontWeight: 850,
};

const mediaAnalyticsBoxStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  borderRadius: 14,
  padding: 10,
  background: "rgba(59,130,246,0.08)",
  border: "1px solid rgba(147,197,253,0.14)",
};

const mediaAnalyticsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 7,
};

const mediaAnalyticsMetricStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  color: "#94a3b8",
  fontSize: 10,
  fontWeight: 850,
};

const mediaAnalyticsVariantStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 7,
  color: "#bfdbfe",
  fontSize: 10,
  fontWeight: 850,
};

const mediaAnalyticsLastStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 10,
  fontWeight: 800,
  lineHeight: 1.45,
};

const mediaAnalyticsEmptyStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: 9,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 800,
};

const errorStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const successStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(34, 197, 94, 0.14)",
  border: "1px solid rgba(134, 239, 172, 0.22)",
  color: "#bbf7d0",
  fontWeight: 850,
  lineHeight: 1.55,
};
