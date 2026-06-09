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
  type: "image" | "file" | string;
  url: string;
  filename: string;
  bytes: number | null;
  created_at?: string | null;
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
  const [savingBase, setSavingBase] = useState(false);
  const [addingImage, setAddingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [entry, setEntry] = useState<QrxEntry | null>(null);
  const [media, setMedia] = useState<QrxMedia[]>([]);

  const [coverUrl, setCoverUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFilename, setImageFilename] = useState("");

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
      .eq("type", "image")
      .order("created_at", { ascending: false })
      .returns<QrxMedia[]>();

    if (mediaError) {
      setErrorText(mediaError.message);
      setLoading(false);
      return;
    }

    setEntry(entryData);
    setCoverUrl(entryData.cover_image_url ?? "");
    setLogoUrl(entryData.logo_url ?? "");
    setMedia(mediaData ?? []);
    setLoading(false);
  }

  async function handleSaveBaseImages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingBase(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!entry) throw new Error("QR-X konnte nicht geladen werden.");

      const { error } = await supabase
        .from("qr_x_entries")
        .update({
          cover_image_url: toNullable(coverUrl),
          logo_url: toNullable(logoUrl),
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id)
        .eq("owner_user_id", entry.owner_user_id);

      if (error) throw error;

      setSuccessText("Coverbild und Logo wurden gespeichert.");
      router.refresh();
      await loadMediaPage();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Medien konnten nicht gespeichert werden.");
    } finally {
      setSavingBase(false);
    }
  }

  async function handleAddImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddingImage(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!entry) throw new Error("QR-X konnte nicht geladen werden.");

      const url = imageUrl.trim();
      if (!url) throw new Error("Bitte gib eine Bild-URL ein.");

      const filename = imageFilename.trim() || `bild-${Date.now()}.jpg`;

      const { error } = await supabase.from("qr_x_media").insert({
        qrx_id: entry.id,
        type: "image",
        url,
        filename,
        bytes: null,
      });

      if (error) throw error;

      setImageUrl("");
      setImageFilename("");
      setSuccessText("Bild wurde hinzugefügt.");
      await loadMediaPage();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Bild konnte nicht hinzugefügt werden.");
    } finally {
      setAddingImage(false);
    }
  }

  async function handleDeleteImage(mediaId: string) {
    const confirmed = window.confirm("Dieses Bild aus der Galerie entfernen?");
    if (!confirmed) return;

    setDeletingId(mediaId);
    setErrorText(null);
    setSuccessText(null);

    try {
      const { error } = await supabase.from("qr_x_media").delete().eq("id", mediaId);
      if (error) throw error;

      setSuccessText("Bild wurde entfernt.");
      await loadMediaPage();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Bild konnte nicht entfernt werden.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-white.png" alt="Mioseg qr Logo" />
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
            Ergänze Coverbild, Logo und Galerie-Bilder per URL. Upload über Storage bauen wir danach sauber mit Credits.
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
          <>
            <form onSubmit={handleSaveBaseImages} style={panelStyle}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Coverbild & Logo</h2>
                  <p>Diese URLs werden direkt in der QR-X Webansicht verwendet.</p>
                </div>
                <span>Basis</span>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <label style={labelStyle}>
                  Coverbild-URL
                  <input
                    value={coverUrl}
                    onChange={(event) => setCoverUrl(event.target.value)}
                    style={inputStyle}
                    placeholder="https://..."
                  />
                </label>

                {coverUrl.trim() ? (
                  <PreviewImage url={coverUrl} label="Coverbild Vorschau" />
                ) : null}

                <label style={labelStyle}>
                  Logo-URL
                  <input
                    value={logoUrl}
                    onChange={(event) => setLogoUrl(event.target.value)}
                    style={inputStyle}
                    placeholder="https://..."
                  />
                </label>

                {logoUrl.trim() ? (
                  <PreviewImage url={logoUrl} label="Logo Vorschau" compact />
                ) : null}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={savingBase}
                    className={styles.primaryButton}
                    style={{ border: 0, cursor: savingBase ? "not-allowed" : "pointer", opacity: savingBase ? 0.72 : 1 }}
                  >
                    {savingBase ? "Speichert …" : "Cover & Logo speichern"}
                  </button>
                </div>
              </div>
            </form>

            <form onSubmit={handleAddImage} style={panelStyle}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Galerie-Bild hinzufügen</h2>
                  <p>Füge zusätzliche Bilder hinzu, die unter „Bilder“ in der QR-X Webansicht erscheinen.</p>
                </div>
                <span>{media.length} Bilder</span>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <label style={labelStyle}>
                  Bild-URL *
                  <input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    style={inputStyle}
                    placeholder="https://..."
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Dateiname / Bezeichnung
                  <input
                    value={imageFilename}
                    onChange={(event) => setImageFilename(event.target.value)}
                    style={inputStyle}
                    placeholder="restaurant-innen.jpg"
                  />
                </label>

                {imageUrl.trim() ? <PreviewImage url={imageUrl} label="Neues Bild Vorschau" /> : null}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={addingImage}
                    className={styles.primaryButton}
                    style={{ border: 0, cursor: addingImage ? "not-allowed" : "pointer", opacity: addingImage ? 0.72 : 1 }}
                  >
                    {addingImage ? "Fügt hinzu …" : "Bild hinzufügen"}
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
                <span>{media.length} Einträge</span>
              </div>

              {media.length === 0 ? (
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
                  Noch keine Galerie-Bilder vorhanden.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  {media.map((item) => (
                    <article
                      key={item.id}
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
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", fontSize: 12, fontWeight: 900 }}>
                          Bild öffnen
                        </a>
                        <button
                          type="button"
                          onClick={() => void handleDeleteImage(item.id)}
                          disabled={deletingId === item.id}
                          style={{
                            minHeight: 38,
                            borderRadius: 12,
                            border: "1px solid rgba(252,165,165,0.22)",
                            background: "rgba(239,68,68,0.14)",
                            color: "#fecaca",
                            fontWeight: 950,
                            cursor: deletingId === item.id ? "not-allowed" : "pointer",
                          }}
                        >
                          {deletingId === item.id ? "Entfernt …" : "Entfernen"}
                        </button>
                      </div>
                    </article>
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

const panelStyle: React.CSSProperties = {
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
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
