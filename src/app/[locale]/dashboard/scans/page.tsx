"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../dashboard.module.css";

type UserScan = {
  id: string;
  name: string | null;
  data: string | null;
  title?: string | null;
  url?: string | null;
  kind?: "scan" | "qr-x" | string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
};

function getLocaleFromParams(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return "de";
}

function formatDate(value: string | null) {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getScanTitle(scan: UserScan) {
  return scan.name?.trim() || scan.title?.trim() || "Gespeicherter Scan";
}

function getScanTarget(scan: UserScan) {
  return scan.url?.trim() || scan.data?.trim() || "";
}

function hasLocation(scan: UserScan) {
  return (
    typeof scan.latitude === "number" &&
    typeof scan.longitude === "number" &&
    Number.isFinite(scan.latitude) &&
    Number.isFinite(scan.longitude)
  );
}

function isOpenableUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function shortText(value: string, max = 90) {
  const v = value.trim();
  if (v.length <= max) return v;
  return `${v.slice(0, max - 1)}…`;
}

export default function DashboardScansPage() {
  const params = useParams();
  const locale = getLocaleFromParams(params?.locale);

  const [items, setItems] = useState<UserScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void loadScans();
  }, []);

  async function loadScans() {
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
      setErrorText("Bitte melde dich zuerst an, um deine Scans zu sehen.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_scans")
      .select("id,name,title,url,data,kind,latitude,longitude,created_at")
      .eq("user_id", user.id)
      .eq("kind", "scan")
      .order("created_at", { ascending: false })
      .returns<UserScan[]>();

    if (error) {
      setErrorText(error.message);
      setItems([]);
    } else {
      setItems(data ?? []);
    }

    setLoading(false);
  }

  async function handleShare(scan: UserScan) {
    const target = getScanTarget(scan);
    if (!target) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: getScanTitle(scan),
          text: target,
          url: isOpenableUrl(target) ? target : undefined,
        });
        return;
      }

      await navigator.clipboard.writeText(target);
      setCopiedId(scan.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      try {
        await navigator.clipboard.writeText(target);
        setCopiedId(scan.id);
        window.setTimeout(() => setCopiedId(null), 1800);
      } catch {
        alert("Link konnte nicht kopiert werden.");
      }
    }
  }

  function handleOpen(scan: UserScan) {
    const target = getScanTarget(scan);
    if (!target) return;

    if (isOpenableUrl(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    void navigator.clipboard.writeText(target);
    setCopiedId(scan.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  async function handleDelete(scan: UserScan) {
    const confirmed = window.confirm(
      `Möchtest du diesen Scan wirklich löschen?\n\n${getScanTitle(scan)}`,
    );

    if (!confirmed) return;

    setDeletingId(scan.id);
    setErrorText(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Bitte melde dich erneut an.");

      const { error } = await supabase
        .from("user_scans")
        .delete()
        .eq("id", scan.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setItems((current) => current.filter((item) => item.id !== scan.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Scan konnte nicht gelöscht werden.";
      setErrorText(message);
      alert(message);
    } finally {
      setDeletingId(null);
    }
  }

  const stats = useMemo(() => {
    const withLocation = items.filter((item) => hasLocation(item)).length;
    const links = items.filter((item) => isOpenableUrl(getScanTarget(item))).length;

    return [
      { label: "Alle Scans", value: items.length, icon: "⌗" },
      { label: "Mit Standort", value: withLocation, icon: "📍" },
      { label: "Links", value: links, icon: "🔗" },
      { label: "Ohne Standort", value: items.length - withLocation, icon: "○" },
    ];
  }, [items]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="Scans Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
          <Link href={`/${locale}/explore`}>Explore</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Meine Scans</span>
          <h1>Meine Scans</h1>
          <p>
            Hier findest du normale QR-Codes und Links, die du mit der App gescannt hast.
            Wenn beim Scannen ein Standort gespeichert wurde, erscheint der Scan auch auf deiner Dashboard-Karte.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx`} className={styles.primaryButton}>
            Meine QR-X öffnen
          </Link>
          <Link href={`/${locale}/dashboard`} className={styles.secondaryButton}>
            Zurück zum Dashboard
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="Meine Scans Kennzahlen">
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
            <h2>Normale QR-Codes & Links</h2>
            <p>Alle normalen Scans aus deiner App, sortiert nach dem neuesten Eintrag.</p>
          </div>
          <span>{loading ? "Lädt ..." : `${items.length} Einträge`}</span>
        </div>

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}

        {!loading && !errorText && items.length === 0 ? (
          <div style={emptyStyle}>
            <div>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⌗</div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 24 }}>
                Noch keine normalen Scans gespeichert
              </h3>
              <p style={{ margin: "0 auto 18px", color: "#94a3b8", maxWidth: 560, lineHeight: 1.6 }}>
                Sobald du mit der App einen normalen QR-Code scannst und speicherst, erscheint er hier.
              </p>
            </div>
          </div>
        ) : null}

        {loading ? <div style={loadingStyle}>Scans werden geladen …</div> : null}

        {!loading && items.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {items.map((scan) => {
              const title = getScanTitle(scan);
              const target = getScanTarget(scan);
              const locationSaved = hasLocation(scan);

              return (
                <article key={scan.id} style={cardStyle}>
                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 18,
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(180deg, #ffffff, #dbeafe)",
                        color: "#07101f",
                        fontSize: 22,
                        fontWeight: 950,
                        marginBottom: 14,
                      }}
                    >
                      {isOpenableUrl(target) ? "🔗" : "⌗"}
                    </div>

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
                        wordBreak: "break-word",
                      }}
                    >
                      {target ? shortText(target, 120) : "Kein Inhalt gespeichert."}
                    </p>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      <span style={pillStyle}>Gescannt: {formatDate(scan.created_at)}</span>

                      {locationSaved ? (
                        <span style={locationPillStyle}>📍 Standort gespeichert</span>
                      ) : (
                        <span style={pillStyle}>Ohne Standort</span>
                      )}
                    </div>

                    {locationSaved ? (
                      <div
                        style={{
                          borderRadius: 16,
                          padding: 12,
                          background: "rgba(37,99,235,0.12)",
                          border: "1px solid rgba(147,197,253,0.18)",
                          color: "#bfdbfe",
                          fontSize: 12,
                          fontWeight: 850,
                          marginBottom: 14,
                          wordBreak: "break-word",
                        }}
                      >
                        {scan.latitude?.toFixed(6)}, {scan.longitude?.toFixed(6)}
                      </div>
                    ) : null}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpen(scan)}
                        className={styles.primaryButton}
                        style={{ border: 0, cursor: "pointer" }}
                      >
                        {isOpenableUrl(target) ? "Öffnen" : copiedId === scan.id ? "Kopiert" : "Kopieren"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleShare(scan)}
                        className={styles.secondaryButton}
                        style={{ cursor: "pointer" }}
                      >
                        {copiedId === scan.id ? "Kopiert" : "Teilen"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(scan)}
                        className={styles.secondaryButton}
                        disabled={deletingId === scan.id}
                        style={{
                          gridColumn: "1 / -1",
                          cursor: deletingId === scan.id ? "not-allowed" : "pointer",
                          border: "1px solid rgba(248,113,113,0.35)",
                          background: "rgba(239,68,68,0.14)",
                          color: "#fecaca",
                          opacity: deletingId === scan.id ? 0.72 : 1,
                        }}
                      >
                        {deletingId === scan.id ? "Löscht …" : "🗑️ Scan löschen"}
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

const cardStyle: React.CSSProperties = {
  overflow: "hidden",
  borderRadius: 26,
  background: "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045))",
  border: "1px solid rgba(255,255,255,0.105)",
  boxShadow: "0 18px 46px rgba(0,0,0,0.14)",
};

const pillStyle: React.CSSProperties = {
  minHeight: 30,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(255,255,255,0.06)",
  color: "#cbd5e1",
  fontSize: 12,
  fontWeight: 850,
};

const locationPillStyle: React.CSSProperties = {
  ...pillStyle,
  background: "rgba(37,99,235,0.16)",
  color: "#bfdbfe",
  border: "1px solid rgba(147,197,253,0.18)",
};

const errorStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 18,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const emptyStyle: React.CSSProperties = {
  borderRadius: 24,
  minHeight: 260,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  padding: 24,
  background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
  border: "1px solid rgba(255,255,255,0.08)",
};

const loadingStyle: React.CSSProperties = {
  borderRadius: 24,
  minHeight: 260,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
  border: "1px solid rgba(255,255,255,0.08)",
  fontWeight: 950,
};
