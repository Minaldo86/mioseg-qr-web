"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../../dashboard.module.css";

type QrxType = "normal" | "business";

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
    url?: string | null;
  } | null;
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

function buildUploadFilename(prefix: "logo" | "cover", file: File) {
  const ext = getFileExtension(file).replace(/[^a-z0-9]/gi, "") || "jpg";
  return `${prefix}-${Date.now().toString()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;
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
  const [locationName, setLocationName] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [ctaPhone, setCtaPhone] = useState("");
  const [ctaWebsite, setCtaWebsite] = useState("");
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaNavigation, setCtaNavigation] = useState("");
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [qrxPassword, setQrxPassword] = useState("");
  const [qrxPasswordRepeat, setQrxPasswordRepeat] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

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

  const hasEnoughCredits =
    creationCostCredits != null && credits != null
      ? credits >= creationCostCredits
      : false;

  useEffect(() => {
    void loadCreditAndPricingData();
  }, []);

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

    return { publicUrl };
  }

  async function uploadQrxImage(args: {
    qrxId: string;
    file: File;
    prefix: "logo" | "cover";
  }) {
    const filename = buildUploadFilename(args.prefix, args.file);
    const mimeType = args.file.type || "image/jpeg";
    const bytes = args.file.size;

    const prepared = await prepareUpload({
      qrxId: args.qrxId,
      type: "image",
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
      type: "image",
      filename,
      mimeType,
      bytes,
      storagePath: prepared.storagePath,
    });

    return finalized.publicUrl;
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
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

      if (creationCostCredits == null || credits == null) {
        throw new Error(
          "Credits und QR-X-Kosten werden noch geladen. Bitte versuche es gleich erneut.",
        );
      }

      if (creationCostCredits > 0 && credits < creationCostCredits) {
        throw new Error(
          `Nicht genug Credits. Benötigt: ${creationCostCredits}, vorhanden: ${credits}. Bitte kaufe zuerst Credits.`,
        );
      }

      if (creationCostCredits > 0) {
        await spendCredits(creationCostCredits);
        chargedCreation = true;
      }

      const insertPayload = {
        category: qrxType === "business" ? category : null,
        owner_user_id: user.id,
        title: nextTitle,
        company_name: qrxType === "business" ? toNullable(companyName) : null,
        description: toNullable(description),
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

      if (passwordProtected && newId) {
        await saveQrxPasswordProtection({
          qrxId: newId,
          enabled: true,
          password: nextPassword,
        });
      }

      if (newId && logoFile) {
        const logoUrl = await uploadQrxImage({
          qrxId: newId,
          file: logoFile,
          prefix: "logo",
        });

        const { error: logoUpdateError } = await supabase
          .from("qr_x_entries")
          .update({ logo_url: logoUrl })
          .eq("id", newId);

        if (logoUpdateError) throw logoUpdateError;
      }

      if (newId && qrxType === "business" && coverFile) {
        const coverUrl = await uploadQrxImage({
          qrxId: newId,
          file: coverFile,
          prefix: "cover",
        });

        const { error: coverUpdateError } = await supabase
          .from("qr_x_entries")
          .update({ cover_image_url: coverUrl })
          .eq("id", newId);

        if (coverUpdateError) throw coverUpdateError;
      }

      await loadCreditAndPricingData();

      const costText =
        creationCostCredits > 0
          ? ` ${creationCostCredits} Credits wurden abgezogen.`
          : " Der erste normale QR-X ist kostenlos.";
      setSuccessText(
        passwordProtected
          ? `QR-X wurde erstellt und mit Passwort geschützt.${costText}`
          : `QR-X wurde erstellt.${costText}`,
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

      await loadCreditAndPricingData();
      setErrorText(
        normalizeErrorMessage(error) || "QR-X konnte nicht erstellt werden.",
      );
    } finally {
      setSaving(false);
    }
  }

  const isBusiness = qrxType === "business";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-white.png" alt="Mioseg qr Logo" />
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
            Erstelle eine schlanke erste Web-Version deines QR-X. Bilder,
            Dateien, Layouts und Credits ergänzen wir im nächsten Schritt.
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
            <span style={{ color: "#cbd5e1", fontWeight: 900 }}>
              Aktuelle Credits: {pricingLoading ? "…" : (credits ?? 0)}
            </span>
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
                .
              </>
            )}
          </div>

          {!pricingLoading &&
          creationCostCredits != null &&
          credits != null &&
          credits < creationCostCredits ? (
            <div
              style={{ color: "#fecaca", fontWeight: 900, lineHeight: 1.55 }}
            >
              Nicht genügend Credits. Benötigt: {creationCostCredits},
              vorhanden: {credits}.{" "}
              <Link
                href={`/${locale}/dashboard/credits`}
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

          <label style={labelStyle}>
            Standortname
            <input
              value={locationName}
              onChange={(event) => setLocationName(event.target.value)}
              style={inputStyle}
            />
          </label>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
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
                  credits == null ||
                  !hasEnoughCredits
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  saving ||
                  pricingLoading ||
                  creationCostCredits == null ||
                  credits == null ||
                  !hasEnoughCredits
                    ? 0.72
                    : 1,
              }}
            >
              {saving
                ? "Erstellt …"
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

const mediaSectionStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const previewRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const logoPreviewStyle: React.CSSProperties = {
  width: 104,
  height: 104,
  objectFit: "cover",
  borderRadius: 26,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
};

const coverPreviewStyle: React.CSSProperties = {
  width: "100%",
  maxHeight: 260,
  objectFit: "cover",
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
};

const fileButtonStyle: React.CSSProperties = {
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

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const inputStyle: React.CSSProperties = {
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
