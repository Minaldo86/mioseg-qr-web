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

type PricingPack = {
  id: string;
  credits: number;
  price_cents_launch: number | null;
  price_cents_regular: number | null;
  badge: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
};

type PricingConfig = {
  currency: string | null;
  launch_discount_enabled: boolean | null;
  free_storage_mb?: number | null;
  qrx_creation_credit_cost?: number | null;
  storage_pack_mb?: number | null;
  storage_pack_credit_cost?: number | null;
  max_upload_mb?: number | null;
  max_images_per_qrx?: number | null;
  max_documents_per_qrx?: number | null;
  max_updates?: number | null;
};

const FALLBACK_PACKAGES: PricingPack[] = [
  { id: "p10", credits: 10, price_cents_launch: 599, price_cents_regular: 999, badge: "Launch", is_active: true, sort_order: 1 },
  { id: "p25", credits: 25, price_cents_launch: 1299, price_cents_regular: 1999, badge: "Beliebt", is_active: true, sort_order: 2 },
  { id: "p50", credits: 50, price_cents_launch: 2299, price_cents_regular: 3499, badge: "Pro", is_active: true, sort_order: 3 },
  { id: "p100", credits: 100, price_cents_launch: 3999, price_cents_regular: 5999, badge: "Best Value", is_active: true, sort_order: 4 },
];

function getPackPriceCents(pack: PricingPack, config: PricingConfig | null) {
  const useLaunchPrice = Boolean(config?.launch_discount_enabled);
  const launch = Number(pack.price_cents_launch ?? 0);
  const regular = Number(pack.price_cents_regular ?? 0);

  if (useLaunchPrice && Number.isFinite(launch) && launch > 0) return launch;
  if (Number.isFinite(regular) && regular > 0) return regular;
  return Number.isFinite(launch) && launch > 0 ? launch : 0;
}

function getPackRegularCents(pack: PricingPack) {
  const regular = Number(pack.price_cents_regular ?? 0);
  return Number.isFinite(regular) && regular > 0 ? regular : 0;
}

function getPackBadge(pack: PricingPack) {
  const badge = pack.badge?.trim();
  if (badge) return badge;
  if (pack.id === "p10") return "Launch";
  if (pack.id === "p25") return "Beliebt";
  if (pack.id === "p50") return "Pro";
  if (pack.id === "p100") return "Best Value";
  return "Paket";
}

export default function CreditsPage() {
  const params = useParams();
  const locale = getParam(params?.locale as string | string[] | undefined, "de");

  const [credits, setCredits] = useState<number | "…">("…");
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutPack, setCheckoutPack] = useState<PricingPack | null>(null);
  const [immediatePerformanceConsent, setImmediatePerformanceConsent] = useState(false);
  const [withdrawalLossAcknowledged, setWithdrawalLossAcknowledged] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [pricingPacks, setPricingPacks] = useState<PricingPack[]>(FALLBACK_PACKAGES);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>({
    currency: "EUR",
    launch_discount_enabled: true,
    free_storage_mb: 2,
    qrx_creation_credit_cost: 1,
    storage_pack_mb: 5,
    storage_pack_credit_cost: 1,
    max_upload_mb: 50,
    max_images_per_qrx: 20,
    max_documents_per_qrx: 20,
    max_updates: 5,
  });

  useEffect(() => {
    void loadCredits();
    void loadPricing();
  }, []);

  async function loadPricing() {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Preise konnten nicht geladen werden.");
      }

      const packs = Array.isArray(data?.pricingPacks) ? data.pricingPacks : [];
      const activePacks = packs
        .filter((pack: PricingPack) => pack?.id && pack?.credits && pack.is_active !== false)
        .sort((a: PricingPack, b: PricingPack) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

      if (activePacks.length > 0) {
        setPricingPacks(activePacks);
      }

      setPricingConfig({
        currency: data?.pricingConfig?.currency || "EUR",
        launch_discount_enabled: Boolean(data?.pricingConfig?.launch_discount_enabled),
        free_storage_mb: Number(data?.pricingConfig?.free_storage_mb ?? 2),
        qrx_creation_credit_cost: Number(data?.pricingConfig?.qrx_creation_credit_cost ?? 1),
        storage_pack_mb: Number(data?.pricingConfig?.storage_pack_mb ?? 5),
        storage_pack_credit_cost: Number(data?.pricingConfig?.storage_pack_credit_cost ?? 1),
        max_upload_mb: Number(data?.pricingConfig?.max_upload_mb ?? 50),
        max_images_per_qrx: Number(data?.pricingConfig?.max_images_per_qrx ?? 20),
        max_documents_per_qrx: Number(data?.pricingConfig?.max_documents_per_qrx ?? 20),
        max_updates: Number(data?.pricingConfig?.max_updates ?? 5),
      });
    } catch (error) {
      console.warn("Pricing load error:", error);
    }
  }

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
      {
        label: "QR-X Erstellung",
        value: `${Number(pricingConfig?.qrx_creation_credit_cost ?? 1)} Credit`,
        icon: "▣",
      },
      {
        label: "Freier Speicher",
        value: `${Number(pricingConfig?.free_storage_mb ?? 2)} MB`,
        icon: "☁️",
      },
      { label: "Pakete", value: pricingPacks.length, icon: "🛒" },
    ],
    [credits, pricingPacks.length, pricingConfig?.qrx_creation_credit_cost, pricingConfig?.free_storage_mb]
  );

  function openCheckoutConfirmation(pack: PricingPack) {
    setCheckoutPack(pack);
    setImmediatePerformanceConsent(false);
    setWithdrawalLossAcknowledged(false);
  }

  function closeCheckoutConfirmation() {
    if (checkoutLoading) return;
    setCheckoutPack(null);
    setImmediatePerformanceConsent(false);
    setWithdrawalLossAcknowledged(false);
  }

  async function handleStripeCheckout(pack: PricingPack) {
    if (!immediatePerformanceConsent || !withdrawalLossAcknowledged) {
      alert("Bitte bestätige beide Hinweise zum sofortigen Leistungsbeginn und zum Widerrufsrecht.");
      return;
    }

    try {
      setCheckoutLoading(pack.id);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const user = session?.user;
      const accessToken = session?.access_token;

      if (!user || !accessToken) {
        alert("Bitte zuerst anmelden.");
        return;
      }

      const packId = pack.id;

      if (!packId) {
        throw new Error("Dieses Credit-Paket ist nicht bekannt.");
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          packId,
          immediatePerformanceConsent: true,
          withdrawalLossAcknowledged: true,
          consentLocale: locale,
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
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
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
            Credits werden für die Erstellung von QR-X und für zusätzlichen Speicher genutzt.
            Die Werte werden zentral im Adminbereich verwaltet.
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
              <p>Wähle ein Paket und starte den sicheren Checkout über Stripe. Die Preise werden live aus der Admin-Konfiguration geladen.</p>
            </div>
            <span>Pay-per-Use</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
            {pricingPacks.map((pack) => {
              return (
              <div
                key={pack.id}
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
                  {getPackBadge(pack) !== "Launch" ? (
                    <span
                      style={{
                        display: "inline-flex",
                        minHeight: 30,
                        alignItems: "center",
                        borderRadius: 999,
                        padding: "0 10px",
                        background: pack.id === "p25" ? "#fff7ed" : "rgba(255,255,255,0.06)",
                        color: pack.id === "p25" ? "#9a4f00" : "#cbd5e1",
                        fontSize: 12,
                        fontWeight: 950,
                      }}
                    >
                      {getPackBadge(pack)}
                    </span>
                  ) : null}
                </div>

                <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 30, fontWeight: 950 }}>
                  {pack.credits} Credits
                </h3>

                <p style={{ margin: "0 0 16px", color: "#94a3b8", lineHeight: 1.55 }}>
                  <strong style={{ color: "#ffffff", fontSize: 22 }}>
                    {formatEuro(getPackPriceCents(pack, pricingConfig), pricingConfig?.currency ?? "EUR")}
                  </strong>{" "}
                  {getPackRegularCents(pack) > getPackPriceCents(pack, pricingConfig) ? (
                    <span style={{ textDecoration: "line-through", opacity: 0.65 }}>
                      {formatEuro(getPackRegularCents(pack), pricingConfig?.currency ?? "EUR")}
                    </span>
                  ) : null}
                  <br />
                  inkl. Rechnung für deine Unterlagen.
                </p>

                <button
                  type="button"
                  onClick={() => openCheckoutConfirmation(pack)}
                  disabled={checkoutLoading === pack.id}
                  className={styles.primaryButton}
                  style={{
                    width: "100%",
                    border: 0,
                    cursor: checkoutLoading === pack.id ? "not-allowed" : "pointer",
                    opacity: checkoutLoading === pack.id ? 0.72 : 1,
                  }}
                >
                  {checkoutLoading === pack.id ? "Weiter zu Stripe..." : "Credits kaufen"}
                </button>
              </div>
            );
            })}
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
      {checkoutPack ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-confirmation-title"
          style={withdrawalOverlayStyle}
          onClick={closeCheckoutConfirmation}
        >
          <section
            style={withdrawalCardStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={withdrawalIconStyle}>€</div>

            <h2 id="checkout-confirmation-title" style={withdrawalTitleStyle}>
              Credit-Kauf bestätigen
            </h2>

            <p style={withdrawalIntroStyle}>
              Bitte prüfe deinen Kauf und bestätige die Hinweise, bevor du zu Stripe weitergeleitet wirst.
            </p>

            <div style={withdrawalOrderBoxStyle}>
              <div style={withdrawalOrderRowStyle}>
                <span>{checkoutPack.credits} Credits</span>
                <strong>
                  {formatEuro(
                    getPackPriceCents(checkoutPack, pricingConfig),
                    pricingConfig?.currency ?? "EUR",
                  )}
                </strong>
              </div>
              <div style={withdrawalTaxNoteStyle}>
                Gesamtpreis inkl. gesetzlich anfallender Umsatzsteuer, soweit diese anfällt.
              </div>
            </div>

            <label style={withdrawalCheckRowStyle}>
              <input
                type="checkbox"
                checked={immediatePerformanceConsent}
                onChange={(event) =>
                  setImmediatePerformanceConsent(event.target.checked)
                }
                style={withdrawalCheckboxStyle}
              />
              <span>
                Ich stimme ausdrücklich zu, dass mioseg qr vor Ablauf der
                Widerrufsfrist mit der Ausführung beginnt und die gekauften
                Credits nach erfolgreicher Zahlung unmittelbar meinem Konto
                gutschreibt.
              </span>
            </label>

            <label style={withdrawalCheckRowStyle}>
              <input
                type="checkbox"
                checked={withdrawalLossAcknowledged}
                onChange={(event) =>
                  setWithdrawalLossAcknowledged(event.target.checked)
                }
                style={withdrawalCheckboxStyle}
              />
              <span>
                Mir ist bekannt, dass mein Widerrufsrecht bei Vorliegen der
                gesetzlichen Voraussetzungen mit Beginn der Ausführung
                erlöschen kann.
              </span>
            </label>

            <p style={withdrawalFinePrintStyle}>
              Die Bestätigungen werden zusammen mit dem Kaufvorgang dokumentiert.
              Gesetzliche Rechte bleiben unberührt.
            </p>

            <div style={withdrawalButtonRowStyle}>
              <button
                type="button"
                onClick={closeCheckoutConfirmation}
                disabled={checkoutLoading === checkoutPack.id}
                style={withdrawalCancelButtonStyle}
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={() => void handleStripeCheckout(checkoutPack)}
                disabled={
                  checkoutLoading === checkoutPack.id ||
                  !immediatePerformanceConsent ||
                  !withdrawalLossAcknowledged
                }
                style={{
                  ...withdrawalContinueButtonStyle,
                  opacity:
                    checkoutLoading === checkoutPack.id ||
                    !immediatePerformanceConsent ||
                    !withdrawalLossAcknowledged
                      ? 0.45
                      : 1,
                  cursor:
                    checkoutLoading === checkoutPack.id ||
                    !immediatePerformanceConsent ||
                    !withdrawalLossAcknowledged
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {checkoutLoading === checkoutPack.id
                  ? "Weiterleitung zu Stripe …"
                  : "Zustimmen & weiter zu Stripe"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

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


const withdrawalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1200,
  display: "grid",
  placeItems: "center",
  padding: 18,
  background: "rgba(2,6,23,0.78)",
};

const withdrawalCardStyle: React.CSSProperties = {
  width: "min(620px, 100%)",
  maxHeight: "calc(100vh - 36px)",
  overflowY: "auto",
  borderRadius: 26,
  padding: 24,
  background: "#0f172a",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 32px 90px rgba(0,0,0,0.4)",
};

const withdrawalIconStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  margin: "0 auto 14px",
  borderRadius: 17,
  display: "grid",
  placeItems: "center",
  color: "#f8fafc",
  background: "rgba(37,99,235,0.18)",
  border: "1px solid rgba(96,165,250,0.22)",
  fontSize: 22,
  fontWeight: 950,
};

const withdrawalTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#fff",
  textAlign: "center",
  fontSize: 24,
  fontWeight: 950,
};

const withdrawalIntroStyle: React.CSSProperties = {
  margin: "9px 0 0",
  color: "#94a3b8",
  textAlign: "center",
  fontSize: 13,
  lineHeight: 1.6,
};

const withdrawalOrderBoxStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 15,
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const withdrawalOrderRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  color: "#f8fafc",
  fontSize: 16,
  fontWeight: 850,
};

const withdrawalTaxNoteStyle: React.CSSProperties = {
  marginTop: 7,
  color: "#718096",
  fontSize: 11,
  lineHeight: 1.5,
};

const withdrawalCheckRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 11,
  marginTop: 17,
  color: "#d6dee8",
  fontSize: 13,
  lineHeight: 1.6,
  cursor: "pointer",
};

const withdrawalCheckboxStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  marginTop: 2,
  flex: "0 0 auto",
  accentColor: "#f8fafc",
};

const withdrawalFinePrintStyle: React.CSSProperties = {
  margin: "16px 0 0",
  paddingTop: 13,
  borderTop: "1px solid rgba(148,163,184,0.12)",
  color: "#718096",
  fontSize: 11,
  lineHeight: 1.55,
};

const withdrawalButtonRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.3fr)",
  gap: 10,
  marginTop: 18,
};

const withdrawalCancelButtonStyle: React.CSSProperties = {
  minHeight: 48,
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(255,255,255,0.035)",
  color: "#d6dee8",
  fontWeight: 900,
  cursor: "pointer",
};

const withdrawalContinueButtonStyle: React.CSSProperties = {
  minHeight: 48,
  borderRadius: 14,
  border: 0,
  background: "#f8fafc",
  color: "#0f172a",
  fontWeight: 950,
};
