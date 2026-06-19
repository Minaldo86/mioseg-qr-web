"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../dashboard.module.css";

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

const BUSINESS_CATEGORY_OPTIONS: Array<{ value: BusinessCategory; label: string }> = [
  { value: "praxis_gesundheit", label: "Praxis & Gesundheit" },
  { value: "gastronomie", label: "Gastronomie" },
  { value: "unternehmen", label: "Unternehmen" },
  { value: "dienstleistung", label: "Dienstleistung" },
  { value: "handwerk", label: "Handwerk" },
  { value: "event", label: "Event" },
  { value: "verein", label: "Verein" },
  { value: "wohltaetigkeit", label: "Wohltätigkeit" },
  { value: "sehenswuerdigkeit", label: "Sehenswürdigkeit" },
  { value: "sonstiges", label: "Sonstiges" },
];

function getBusinessCategoryLabel(value: string | null | undefined) {
  if (!value) return null;
  return BUSINESS_CATEGORY_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

type QrxEntry = {
  id: string;
  title: string | null;
  company_name: string | null;
  description: string | null;
  type: "normal" | "business" | null;
  category: BusinessCategory | null;
  verified: boolean | null;
  cover_image_url: string | null;
  logo_url: string | null;
  location_name: string | null;
  views_total: number | null;
  follower_count: number | null;
  created_at: string | null;
  deleted_at?: string | null;
};

function getLocaleFromParams(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return "de";
}

function getQrxTitle(entry: QrxEntry) {
  return entry.company_name?.trim() || entry.title?.trim() || "Unbenannter QR-X";
}

function getQrxText(entry: QrxEntry) {
  return entry.description?.trim() || entry.location_name?.trim() || "QR-X auf mioseg qr";
}

function formatNumber(value: number | null | undefined) {
  const n = Math.max(0, Number(value ?? 0));
  if (n >= 1000000) return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(".", ",")} Mio.`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")} Tsd.`;
  return String(n);
}

function formatDate(value: string | null) {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function DashboardQrxPage() {
  const params = useParams();
  const locale = getLocaleFromParams(params?.locale);

  const [items, setItems] = useState<QrxEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void loadMyQrx();
  }, []);

  async function loadMyQrx() {
    setLoading(true);
    setErrorText(null);

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
      setItems([]);
      setErrorText("Bitte melde dich zuerst an, um deine QR-X zu sehen.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("qr_x_entries")
      .select(
        "id,title,company_name,description,type,category,verified,cover_image_url,logo_url,location_name,views_total,follower_count,created_at,deleted_at"
      )
      .eq("owner_user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .returns<QrxEntry[]>();

    if (error) {
      setErrorText(error.message);
      setItems([]);
    } else {
      setItems(data ?? []);
    }

    setLoading(false);
  }

  async function handleShare(entry: QrxEntry) {
    const url = `${window.location.origin}/qrx/${entry.id}`;
    const title = getQrxTitle(entry);

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `QR-X: ${title}`,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(entry.id);
        window.setTimeout(() => setCopiedId(null), 1800);
      } catch {
        alert("Link konnte nicht kopiert werden.");
      }
    }
  }

  async function handleDelete(entry: QrxEntry) {
    const title = getQrxTitle(entry);

    const confirmed = window.confirm(
      `Möchtest du diesen QR-X wirklich löschen?\n\n${title}\n\nDer QR-X wird nur deaktiviert und kann später wiederhergestellt werden. Medien und Dateien werden nicht endgültig gelöscht.`,
    );

    if (!confirmed) return;

    setDeletingId(entry.id);
    setErrorText(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const token = session?.access_token;
      if (!token) {
        throw new Error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
      }

      const { data, error } = await supabase.functions.invoke("delete-qrx", {
        body: {
          qrxId: entry.id,
          reason: "Vom Ersteller im Web-Dashboard gelöscht",
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;

      const response = (data ?? {}) as { success?: boolean; error?: string; step?: string };
      if (response.error || response.success === false) {
        throw new Error(response.error || "QR-X konnte nicht gelöscht werden.");
      }

      setItems((current) => current.filter((item) => item.id !== entry.id));
    } catch (error) {
      console.error("QR-X DELETE ERROR", error);
      const message = error instanceof Error ? error.message : "QR-X konnte nicht gelöscht werden.";
      setErrorText(message);
      alert(message);
    } finally {
      setDeletingId(null);
    }
  }

  const stats = useMemo(() => {
    const business = items.filter((item) => item.type === "business").length;
    const normal = items.length - business;
    const verified = items.filter((item) => item.verified).length;

    return [
      { label: "Alle QR-X", value: items.length, icon: "▣" },
      { label: "Business QR-X", value: business, icon: "🏢" },
      { label: "Normale QR-X", value: normal, icon: "⌗" },
      { label: "Verifiziert", value: verified, icon: "✓" },
    ];
  }, [items]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="QR-X Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/explore`}>Explore</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Meine QR-X</span>
          <h1>Meine QR-X</h1>
          <p>
            Verwalte deine erstellten QR-X bequem im Browser. Öffnen, Teilen und Bearbeiten
            funktionieren jetzt als erste schlanke Web-Version.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx/new`} className={styles.primaryButton}>
            + QR-X erstellen
          </Link>
          <Link href={`/${locale}/dashboard`} className={styles.secondaryButton}>
            Zurück zum Dashboard
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="Meine QR-X Kennzahlen">
        {stats.map((item) => (
          <article key={item.label} className={styles.statCard}>
            <div className={styles.statIcon}>{item.icon}</div>
            <div>
              <div className={styles.statValue}>{item.value}</div>
              <div className={styles.statLabel}>{item.label}</div>
            </div>
          </article>
        ))}
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          borderRadius: 30,
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
          padding: 18,
        }}
      >
        <div className={styles.cardHeader}>
          <div>
            <h2>Deine erstellten QR-X</h2>
            <p>Alle QR-X aus deinem Konto, sortiert nach dem neuesten Eintrag.</p>
          </div>
          <span>{loading ? "Lädt ..." : `${items.length} Einträge`}</span>
        </div>

        {errorText ? (
          <div
            style={{
              borderRadius: 22,
              padding: 18,
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

        {!loading && !errorText && items.length === 0 ? (
          <div
            style={{
              borderRadius: 24,
              minHeight: 260,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: 24,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div>
              <div style={{ fontSize: 44, marginBottom: 12 }}>▣</div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 24 }}>
                Noch keine QR-X erstellt
              </h3>
              <p style={{ margin: "0 auto 18px", color: "#94a3b8", maxWidth: 520, lineHeight: 1.6 }}>
                Sobald du deinen ersten QR-X erstellt hast, erscheint er hier in deiner Web-Verwaltung.
              </p>
              <Link href={`/${locale}/dashboard/qrx/new`} className={styles.primaryButton}>
                + QR-X erstellen
              </Link>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div
            style={{
              borderRadius: 24,
              minHeight: 260,
              display: "grid",
              placeItems: "center",
              color: "#cbd5e1",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
              border: "1px solid rgba(255,255,255,0.08)",
              fontWeight: 950,
            }}
          >
            QR-X werden geladen …
          </div>
        ) : null}

        {!loading && items.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {items.map((entry) => {
              const title = getQrxTitle(entry);
              const image = entry.cover_image_url?.trim() || entry.logo_url?.trim() || null;
              const isBusiness = entry.type === "business";
              const categoryLabel = getBusinessCategoryLabel(entry.category);
              const openHref = `/qrx/${entry.id}`;
              const editHref = `/${locale}/dashboard/qrx/${entry.id}/edit`;

              return (
                <article
                  key={entry.id}
                  style={{
                    overflow: "hidden",
                    borderRadius: 26,
                    background: "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045))",
                    border: "1px solid rgba(255,255,255,0.105)",
                    boxShadow: "0 18px 46px rgba(0,0,0,0.14)",
                  }}
                >
                  <div
                    style={{
                      height: 174,
                      position: "relative",
                      background:
                        "radial-gradient(circle at 30% 20%, #ffffff 0%, #edf4fb 45%, #dce7f3 100%)",
                      overflow: "hidden",
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 46,
                          color: "#0d1726",
                          fontWeight: 950,
                        }}
                      >
                        ▣
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: image
                          ? "linear-gradient(180deg, rgba(6,12,21,0.06) 0%, rgba(6,12,21,0.62) 100%)"
                          : "transparent",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                        right: 12,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          minHeight: 32,
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 999,
                          padding: "0 10px",
                          background: isBusiness ? "#fff7ed" : "#ecfdf3",
                          color: isBusiness ? "#9a4f00" : "#166534",
                          fontSize: 12,
                          fontWeight: 950,
                          border: isBusiness ? "1px solid #fed7aa" : "1px solid #bbf7d0",
                        }}
                      >
                        {isBusiness ? "🏢 Business QR-X" : "⌗ Normaler QR-X"}
                      </span>

                      {entry.verified ? (
                        <span
                          style={{
                            minHeight: 32,
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: 999,
                            padding: "0 10px",
                            background: "rgba(13,23,38,0.86)",
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: 950,
                            border: "1px solid rgba(255,255,255,0.18)",
                          }}
                        >
                          ✓ Verifiziert
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ padding: 16 }}>
                    <h3
                      style={{
                        margin: "0 0 8px",
                        color: "#ffffff",
                        fontSize: 22,
                        lineHeight: 1.18,
                        fontWeight: 950,
                        letterSpacing: "-0.35px",
                      }}
                    >
                      {title}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "#94a3b8",
                        fontSize: 13,
                        lineHeight: 1.55,
                        minHeight: 42,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {getQrxText(entry)}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 14,
                      }}
                    >
                      {entry.location_name?.trim() ? (
                        <span
                          style={{
                            minHeight: 30,
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: 999,
                            padding: "0 10px",
                            background: "rgba(255,255,255,0.06)",
                            color: "#cbd5e1",
                            fontSize: 12,
                            fontWeight: 850,
                          }}
                        >
                          📍 {entry.location_name.trim()}
                        </span>
                      ) : null}

                      {isBusiness && categoryLabel ? (
                        <span
                          style={{
                            minHeight: 30,
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: 999,
                            padding: "0 10px",
                            background: "rgba(251,146,60,0.14)",
                            color: "#fed7aa",
                            fontSize: 12,
                            fontWeight: 900,
                            border: "1px solid rgba(253,186,116,0.18)",
                          }}
                        >
                          ▦ {categoryLabel}
                        </span>
                      ) : null}

                      <span
                        style={{
                          minHeight: 30,
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 999,
                          padding: "0 10px",
                          background: "rgba(255,255,255,0.06)",
                          color: "#cbd5e1",
                          fontSize: 12,
                          fontWeight: 850,
                        }}
                      >
                        Erstellt: {formatDate(entry.created_at)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          borderRadius: 18,
                          padding: 12,
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <div style={{ color: "#ffffff", fontSize: 20, fontWeight: 950 }}>
                          {formatNumber(entry.views_total)}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850 }}>Aufrufe</div>
                      </div>

                      <div
                        style={{
                          borderRadius: 18,
                          padding: 12,
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <div style={{ color: "#ffffff", fontSize: 20, fontWeight: 950 }}>
                          {formatNumber(entry.follower_count)}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850 }}>Follower</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <Link href={openHref} className={styles.primaryButton}>
                        Öffnen
                      </Link>

                      <button
                        type="button"
                        onClick={() => void handleShare(entry)}
                        className={styles.secondaryButton}
                        style={{ cursor: "pointer" }}
                      >
                        {copiedId === entry.id ? "Kopiert" : "Teilen"}
                      </button>

                      <Link
                        href={editHref}
                        className={styles.secondaryButton}
                      >
                        Bearbeiten
                      </Link>

                      <button
                        type="button"
                        onClick={() => void handleDelete(entry)}
                        className={styles.secondaryButton}
                        disabled={deletingId === entry.id}
                        style={{
                          cursor: deletingId === entry.id ? "not-allowed" : "pointer",
                          border: "1px solid rgba(248,113,113,0.35)",
                          background: "rgba(239,68,68,0.14)",
                          color: "#fecaca",
                          opacity: deletingId === entry.id ? 0.72 : 1,
                        }}
                      >
                        {deletingId === entry.id ? "Löscht …" : "🗑️ Löschen"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
