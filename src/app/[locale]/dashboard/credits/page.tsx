"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../dashboard.module.css";

type CreditRow = {
  credits: number | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  currency: string | null;
  amount_cents: number | null;
  gross_amount_cents: number | null;
  status: string | null;
  created_at: string | null;
  sent_at: string | null;
  pdf_path: string | null;
  storage_bucket: string | null;
  invoice_type: "invoice" | "credit_note" | string | null;
  original_invoice_number: string | null;
  billing_details: unknown;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function formatEuro(cents: number | null | undefined, currency = "EUR") {
  const value = Number(cents ?? 0) / 100;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
  }).format(value);
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getBillingNumber(invoice: InvoiceRow, key: string) {
  const details = asRecord(invoice.billing_details);
  const value = details[key];

  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }

  return 0;
}

function getBillingText(invoice: InvoiceRow, key: string, fallback = "") {
  const details = asRecord(invoice.billing_details);
  const value = details[key];

  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getDocumentAmount(invoice: InvoiceRow) {
  return invoice.gross_amount_cents ?? invoice.amount_cents ?? 0;
}

function getDocumentTypeLabel(invoice: InvoiceRow) {
  if (invoice.invoice_type === "credit_note") return "Gutschrift";
  return "Rechnung";
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "sent":
      return "Versendet";
    case "created":
      return "Erstellt";
    case "creating":
      return "Wird erstellt";
    case "failed":
      return "Fehlgeschlagen";
    case "refunded":
      return "Erstattet";
    case "partially_refunded":
      return "Teilweise erstattet";
    default:
      return status || "Unbekannt";
  }
}

function getStatusStyle(status: string | null): React.CSSProperties {
  if (status === "sent") {
    return {
      background: "rgba(34,197,94,0.16)",
      color: "#bbf7d0",
      border: "1px solid rgba(34,197,94,0.22)",
    };
  }

  if (status === "refunded" || status === "partially_refunded") {
    return {
      background: "rgba(251,146,60,0.16)",
      color: "#fed7aa",
      border: "1px solid rgba(251,146,60,0.22)",
    };
  }

  if (status === "failed") {
    return {
      background: "rgba(239,68,68,0.16)",
      color: "#fecaca",
      border: "1px solid rgba(239,68,68,0.22)",
    };
  }

  return {
    background: "rgba(255,255,255,0.06)",
    color: "#cbd5e1",
    border: "1px solid rgba(255,255,255,0.08)",
  };
}

const PACKAGES = [
  { credits: 10, price: 5.99, regularPrice: 9.99, label: "Launch" },
  { credits: 25, price: 12.99, regularPrice: 19.99, label: "Beliebt" },
  { credits: 50, price: 22.99, regularPrice: 34.99, label: "Pro" },
  { credits: 100, price: 39.99, regularPrice: 59.99, label: "Best Value" },
];

export default function CreditsPage() {
  const params = useParams();
  const locale = getParam(params?.locale as string | string[] | undefined, "de");

  const [credits, setCredits] = useState<number | "…">("…");
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    void loadCredits();
  }, []);

  async function loadCredits() {
    setLoading(true);
    setErrorText(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorText(userError.message);
      setCredits(0);
      setLoading(false);
      return;
    }

    if (!user) {
      setErrorText("Bitte melde dich zuerst an.");
      setCredits(0);
      setLoading(false);
      return;
    }

    const [creditsRes, invoicesRes] = await Promise.all([
      supabase
        .from("qrx_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle()
        .returns<CreditRow>(),

      supabase
        .from("qrx_invoices")
        .select(
          "id,invoice_number,currency,amount_cents,gross_amount_cents,status,created_at,sent_at,pdf_path,storage_bucket,invoice_type,original_invoice_number,billing_details"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .returns<InvoiceRow[]>(),
    ]);

    if (creditsRes.error) {
      console.warn("Credits load error:", creditsRes.error.message);
    }

    if (invoicesRes.error) {
      console.warn("Invoices load error:", invoicesRes.error.message);
      setErrorText(invoicesRes.error.message);
    }

    setCredits(Number(creditsRes.data?.credits ?? 0));
    setInvoices(invoicesRes.data ?? []);
    setLoading(false);
  }

  const stats = useMemo(
    () => [
      { label: "Aktuelle Credits", value: credits, icon: "💳" },
      { label: "Kosten pro QR-X", value: "1", icon: "▣" },
      { label: "Freier Speicher", value: "15 MB", icon: "☁️" },
      { label: "Pakete", value: PACKAGES.length, icon: "🛒" },
    ],
    [credits]
  );

  async function handleStripeCheckout(creditAmount: number) {
    try {
      setCheckoutLoading(creditAmount);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Bitte zuerst anmelden.");
        return;
      }

      const packMap: Record<number, string> = {
        10: "p10",
        25: "p25",
        50: "p50",
        100: "p100",
      };

      const packId = packMap[creditAmount];

      if (!packId) {
        throw new Error("Dieses Credit-Paket ist nicht bekannt.");
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          packId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Checkout konnte nicht gestartet werden.");
      }

      if (!result.url) {
        throw new Error("Stripe Checkout URL fehlt.");
      }

      window.location.href = result.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Checkout konnte nicht gestartet werden.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function openInvoicePdf(invoice: InvoiceRow) {
    if (!invoice.pdf_path) {
      alert("Für diesen Beleg ist noch kein PDF hinterlegt.");
      return;
    }

    setDownloadingId(invoice.id);

    try {
      const bucket = invoice.storage_bucket || "invoices";
      const pdfPath = invoice.pdf_path.replace(/^\/+/, "");

      const { data } = supabase.storage.from(bucket).getPublicUrl(pdfPath);

      if (!data?.publicUrl) {
        throw new Error("Download-Link konnte nicht erstellt werden.");
      }

      window.open(data.publicUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      alert(error instanceof Error ? error.message : "PDF konnte nicht geöffnet werden.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-white.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="Credits Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
          <Link href={`/${locale}/dashboard/invoices`}>Rechnungen</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Credits</span>
          <h1>Credits verwalten</h1>
          <p>
            Behalte dein Guthaben im Blick und kaufe neue Credits direkt über Stripe.
            1 Credit entspricht 1 Euro.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/invoices`} className={styles.primaryButton}>
            Rechnungen öffnen
          </Link>
          <Link href={`/${locale}/dashboard`} className={styles.secondaryButton}>
            Zurück zum Dashboard
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="Credit Kennzahlen">
        {stats.map((item) => (
          <article key={item.label} className={styles.statCard}>
            <div className={styles.statIcon}>{item.icon}</div>
            <div>
              <div className={styles.statValue}>{String(item.value)}</div>
              <div className={styles.statLabel}>{item.label}</div>
            </div>
          </article>
        ))}
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 420px)",
          gap: 18,
          alignItems: "start",
        }}
      >
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Credit-Pakete</h2>
              <p>Wähle ein Paket und starte den sicheren Checkout über Stripe.</p>
            </div>
            <span>Pay-per-Use</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
            {PACKAGES.map((item) => (
              <div
                key={item.credits}
                style={{
                  borderRadius: 24,
                  padding: 18,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045))",
                  border: "1px solid rgba(255,255,255,0.105)",
                  boxShadow: "0 18px 46px rgba(0,0,0,0.14)",
                }}
              >
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      minHeight: 30,
                      alignItems: "center",
                      borderRadius: 999,
                      padding: "0 10px",
                      background: "rgba(37, 99, 235, 0.18)",
                      color: "#dbeafe",
                      fontSize: 12,
                      fontWeight: 950,
                    }}
                  >
                    Launch
                  </span>
                  {item.label !== "Launch" ? (
                    <span
                      style={{
                        display: "inline-flex",
                        minHeight: 30,
                        alignItems: "center",
                        borderRadius: 999,
                        padding: "0 10px",
                        background: item.credits === 25 ? "#fff7ed" : "rgba(255,255,255,0.06)",
                        color: item.credits === 25 ? "#9a4f00" : "#cbd5e1",
                        fontSize: 12,
                        fontWeight: 950,
                      }}
                    >
                      {item.label}
                    </span>
                  ) : null}
                </div>

                <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 30, fontWeight: 950 }}>
                  {item.credits} Credits
                </h3>

                <p style={{ margin: "0 0 16px", color: "#94a3b8", lineHeight: 1.55 }}>
                  <strong style={{ color: "#ffffff", fontSize: 22 }}>{item.price.toFixed(2).replace(".", ",")} €</strong>{" "}
                  <span style={{ textDecoration: "line-through", opacity: 0.65 }}>
                    {item.regularPrice.toFixed(2).replace(".", ",")} €
                  </span>
                  <br />
                  inkl. Rechnung für deine Unterlagen.
                </p>

                <button
                  type="button"
                  onClick={() => void handleStripeCheckout(item.credits)}
                  disabled={checkoutLoading === item.credits}
                  className={styles.primaryButton}
                  style={{
                    width: "100%",
                    border: 0,
                    cursor: checkoutLoading === item.credits ? "not-allowed" : "pointer",
                    opacity: checkoutLoading === item.credits ? 0.72 : 1,
                  }}
                >
                  {checkoutLoading === item.credits ? "Weiter zu Stripe..." : "Credits kaufen"}
                </button>
              </div>
            ))}
          </div>
        </article>

        <aside style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Kaufhistorie</h2>
              <p>Deine letzten Rechnungen und Gutschriften zu Credit-Käufen.</p>
            </div>
            <span>{loading ? "Lädt" : invoices.length}</span>
          </div>

          {errorText ? <div style={errorStyle}>{errorText}</div> : null}

          {!loading && invoices.length === 0 ? (
            <div style={emptyStateStyle}>
              Noch keine Käufe vorhanden. Nach deinem ersten Credit-Kauf erscheint der Beleg hier.
            </div>
          ) : null}

          {loading ? <div style={loadingStyle}>Belege werden geladen …</div> : null}

          {!loading && invoices.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {invoices.map((invoice) => {
                const isCreditNote = invoice.invoice_type === "credit_note";
                const creditsFromBilling = getBillingNumber(invoice, "credits");
                const packId = getBillingText(invoice, "pack_id", isCreditNote ? "Gutschrift" : "Paket");
                const amount = getDocumentAmount(invoice);
                const statusLabel = getStatusLabel(invoice.status);

                return (
                  <div key={invoice.id} style={invoiceHistoryCardStyle}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span
                        style={{
                          ...documentBadgeStyle,
                          background: isCreditNote ? "rgba(251,146,60,0.16)" : "rgba(37,99,235,0.18)",
                          color: isCreditNote ? "#fed7aa" : "#dbeafe",
                        }}
                      >
                        {getDocumentTypeLabel(invoice)}
                      </span>

                      <span style={{ ...documentBadgeStyle, ...getStatusStyle(invoice.status) }}>
                        {statusLabel}
                      </span>
                    </div>

                    <strong style={{ display: "block", color: "#ffffff", marginTop: 8, marginBottom: 4 }}>
                      {invoice.invoice_number || "Ohne Belegnummer"}
                    </strong>

                    <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850, lineHeight: 1.55 }}>
                      {creditsFromBilling > 0 ? `${creditsFromBilling} Credits` : packId}
                      {" · "}
                      {formatEuro(amount, invoice.currency ?? "EUR")}
                      <br />
                      {formatDate(invoice.created_at)}
                      {invoice.sent_at ? ` · versendet ${formatDate(invoice.sent_at)}` : ""}
                      {invoice.original_invoice_number ? (
                        <>
                          <br />
                          Bezug: {invoice.original_invoice_number}
                        </>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => void openInvoicePdf(invoice)}
                      disabled={downloadingId === invoice.id || !invoice.pdf_path}
                      className={styles.primaryButton}
                      style={{
                        width: "100%",
                        marginTop: 10,
                        border: 0,
                        cursor: downloadingId === invoice.id || !invoice.pdf_path ? "not-allowed" : "pointer",
                        opacity: downloadingId === invoice.id || !invoice.pdf_path ? 0.62 : 1,
                      }}
                    >
                      {downloadingId === invoice.id ? "Öffnet …" : isCreditNote ? "Gutschrift öffnen" : "Rechnung öffnen"}
                    </button>
                  </div>
                );
              })}

              <Link
                href={`/${locale}/dashboard/invoices`}
                className={styles.secondaryButton}
                style={{ textAlign: "center", justifyContent: "center" }}
              >
                Alle Rechnungen anzeigen
              </Link>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const errorStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: 16,
  marginBottom: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const emptyStateStyle: React.CSSProperties = {
  minHeight: 180,
  display: "grid",
  placeItems: "center",
  borderRadius: 22,
  padding: 18,
  textAlign: "center",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
  color: "#94a3b8",
  fontWeight: 850,
  lineHeight: 1.55,
};

const loadingStyle: React.CSSProperties = {
  minHeight: 180,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  fontWeight: 950,
};

const invoiceHistoryCardStyle: React.CSSProperties = {
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const documentBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  minHeight: 28,
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  fontSize: 12,
  fontWeight: 950,
};
