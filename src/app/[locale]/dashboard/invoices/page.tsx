"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../dashboard.module.css";

type InvoiceRow = {
  id: string;
  user_id: string;
  invoice_number: string | null;
  currency: string | null;
  amount_cents: number | null;
  gross_amount_cents: number | null;
  net_amount_cents: number | null;
  tax_amount_cents: number | null;
  billing_email: string | null;
  status: string | null;
  sent_at: string | null;
  created_at: string | null;
  pdf_path: string | null;
  storage_bucket: string | null;
  invoice_type: "invoice" | "credit_note" | string | null;
  original_invoice_number: string | null;
  payment_provider: string | null;
  provider_transaction_id: string | null;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
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

function formatMoney(cents: number | null | undefined, currency = "EUR") {
  const value = Number(cents ?? 0) / 100;

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
  }).format(value);
}

function getInvoiceAmount(invoice: InvoiceRow) {
  return invoice.gross_amount_cents ?? invoice.amount_cents ?? 0;
}

function getInvoiceTypeLabel(invoice: InvoiceRow) {
  if (invoice.invoice_type === "credit_note") return "Storno / Gutschrift";
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

export default function InvoicesPage() {
  const params = useParams();
  const locale = getParam(params?.locale as string | string[] | undefined, "de");

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    void loadInvoices();
  }, []);

  async function loadInvoices() {
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
      setErrorText("Bitte melde dich zuerst an, um deine Rechnungen zu sehen.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("qrx_invoices")
      .select(
        "id,user_id,invoice_number,currency,amount_cents,gross_amount_cents,net_amount_cents,tax_amount_cents,billing_email,status,sent_at,created_at,pdf_path,storage_bucket,invoice_type,original_invoice_number,payment_provider,provider_transaction_id"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<InvoiceRow[]>();

    if (error) {
      setErrorText(error.message);
      setInvoices([]);
    } else {
      setInvoices(data ?? []);
    }

    setLoading(false);
  }

  async function downloadInvoice(invoice: InvoiceRow) {
    if (!invoice.pdf_path) {
      alert("Für diese Rechnung ist noch kein PDF hinterlegt.");
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
      alert(error instanceof Error ? error.message : "Rechnung konnte nicht geöffnet werden.");
    } finally {
      setDownloadingId(null);
    }
  }

  const stats = useMemo(() => {
    const total = invoices.length;
    const sent = invoices.filter((invoice) => invoice.status === "sent").length;
    const created = invoices.filter((invoice) => invoice.status === "created").length;
    const creditNotes = invoices.filter((invoice) => invoice.invoice_type === "credit_note").length;

    return [
      { label: "Alle Rechnungen", value: total, icon: "🧾" },
      { label: "Versendet", value: sent, icon: "✉️" },
      { label: "Erstellt", value: created, icon: "📄" },
      { label: "Gutschriften", value: creditNotes, icon: "↩️" },
    ];
  }, [invoices]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-white.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="Rechnungen Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/credits`}>Credits</Link>
          <Link href={`/${locale}/dashboard/account`}>Konto</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Rechnungen</span>
          <h1>Deine Rechnungen</h1>
          <p>
            Hier findest du deine Rechnungen und Gutschriften zu Credit-Käufen. PDFs kannst du direkt
            öffnen und für deine Unterlagen oder Steuerberatung herunterladen.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/credits`} className={styles.primaryButton}>
            Credits kaufen
          </Link>
          <Link href={`/${locale}/dashboard`} className={styles.secondaryButton}>
            Zurück zum Dashboard
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="Rechnungen Kennzahlen">
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

      <section style={panelStyle}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Rechnungsliste</h2>
            <p>Alle Rechnungen aus deinem Konto, sortiert nach dem neuesten Eintrag.</p>
          </div>
          <span>{loading ? "Lädt ..." : `${invoices.length} Einträge`}</span>
        </div>

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}

        {loading ? (
          <div style={emptyStateStyle}>Rechnungen werden geladen …</div>
        ) : null}

        {!loading && !errorText && invoices.length === 0 ? (
          <div style={emptyStateStyle}>
            <div>
              <div style={{ fontSize: 42, marginBottom: 10 }}>🧾</div>
              <strong style={{ display: "block", color: "#ffffff", fontSize: 20, marginBottom: 8 }}>
                Noch keine Rechnungen vorhanden
              </strong>
              <span style={{ color: "#94a3b8", lineHeight: 1.55 }}>
                Nach deinem nächsten Credit-Kauf erscheint die Rechnung automatisch hier.
              </span>
            </div>
          </div>
        ) : null}

        {!loading && invoices.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {invoices.map((invoice) => {
              const amount = getInvoiceAmount(invoice);
              const isCreditNote = invoice.invoice_type === "credit_note";
              const statusLabel = getStatusLabel(invoice.status);

              return (
                <article key={invoice.id} style={invoiceCardStyle}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          minHeight: 30,
                          alignItems: "center",
                          borderRadius: 999,
                          padding: "0 10px",
                          background: isCreditNote ? "rgba(251,146,60,0.16)" : "rgba(37,99,235,0.18)",
                          color: isCreditNote ? "#fed7aa" : "#dbeafe",
                          fontSize: 12,
                          fontWeight: 950,
                        }}
                      >
                        {getInvoiceTypeLabel(invoice)}
                      </span>

                      <span
                        style={{
                          display: "inline-flex",
                          minHeight: 30,
                          alignItems: "center",
                          borderRadius: 999,
                          padding: "0 10px",
                          background:
                            invoice.status === "sent"
                              ? "rgba(34,197,94,0.16)"
                              : invoice.status === "failed"
                                ? "rgba(239,68,68,0.16)"
                                : "rgba(255,255,255,0.06)",
                          color:
                            invoice.status === "sent"
                              ? "#bbf7d0"
                              : invoice.status === "failed"
                                ? "#fecaca"
                                : "#cbd5e1",
                          fontSize: 12,
                          fontWeight: 950,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <h3 style={{ margin: 0, color: "#ffffff", fontSize: 20, fontWeight: 950 }}>
                      {invoice.invoice_number || "Ohne Rechnungsnummer"}
                    </h3>

                    {invoice.original_invoice_number ? (
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, fontWeight: 800 }}>
                        Bezug: {invoice.original_invoice_number}
                      </p>
                    ) : null}

                    <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, fontWeight: 800 }}>
                      Erstellt: {formatDate(invoice.created_at)}
                      {invoice.sent_at ? ` · Versendet: ${formatDate(invoice.sent_at)}` : ""}
                    </p>

                    {invoice.billing_email ? (
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, fontWeight: 800 }}>
                        Empfänger: {invoice.billing_email}
                      </p>
                    ) : null}
                  </div>

                  <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                    <strong style={{ color: "#ffffff", fontSize: 22, fontWeight: 950 }}>
                      {formatMoney(amount, invoice.currency ?? "EUR")}
                    </strong>

                    <button
                      type="button"
                      onClick={() => void downloadInvoice(invoice)}
                      disabled={downloadingId === invoice.id || !invoice.pdf_path}
                      className={styles.primaryButton}
                      style={{
                        border: 0,
                        cursor: downloadingId === invoice.id || !invoice.pdf_path ? "not-allowed" : "pointer",
                        opacity: downloadingId === invoice.id || !invoice.pdf_path ? 0.62 : 1,
                        minWidth: 170,
                      }}
                    >
                      {downloadingId === invoice.id ? "Öffnet …" : "PDF öffnen"}
                    </button>
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

const panelStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const invoiceCardStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 18,
  alignItems: "center",
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.085)",
};

const emptyStateStyle: React.CSSProperties = {
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  borderRadius: 22,
  padding: 18,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
  color: "#cbd5e1",
  fontWeight: 850,
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
