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


type InvoiceLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

type InvoiceCopy = {
  navLabel:string; dashboard:string; credits:string; account:string; kicker:string; heroTitle:string; heroText:string;
  buyCredits:string; backDashboard:string; statsLabel:string; allInvoices:string; sent:string; created:string; creditNotes:string;
  listTitle:string; listText:string; loadingShort:string; entries:string; invoicesLoading:string; emptyTitle:string; emptyText:string;
  invoice:string; creditNote:string; statusCreating:string; failed:string; refunded:string; partiallyRefunded:string; unknown:string;
  loginRequired:string; pdfMissing:string; downloadLinkFailed:string; invoiceOpenFailed:string; noInvoiceNumber:string; reference:string;
  createdLabel:string; sentLabel:string; recipient:string; opening:string; openPdf:string;
};

const INVOICE_TEXT: Record<InvoiceLocale, InvoiceCopy> = {
  de:{navLabel:"Rechnungen Navigation",dashboard:"Dashboard",credits:"Credits",account:"Konto",kicker:"Rechnungen",heroTitle:"Deine Rechnungen",heroText:"Hier findest du deine Rechnungen und Gutschriften zu Credit-Käufen. PDFs kannst du direkt öffnen und für deine Unterlagen oder Steuerberatung herunterladen.",buyCredits:"Credits kaufen",backDashboard:"Zurück zum Dashboard",statsLabel:"Rechnungen Kennzahlen",allInvoices:"Alle Rechnungen",sent:"Versendet",created:"Erstellt",creditNotes:"Gutschriften",listTitle:"Rechnungsliste",listText:"Alle Rechnungen aus deinem Konto, sortiert nach dem neuesten Eintrag.",loadingShort:"Lädt ...",entries:"Einträge",invoicesLoading:"Rechnungen werden geladen …",emptyTitle:"Noch keine Rechnungen vorhanden",emptyText:"Nach deinem nächsten Credit-Kauf erscheint die Rechnung automatisch hier.",invoice:"Rechnung",creditNote:"Storno / Gutschrift",statusCreating:"Wird erstellt",failed:"Fehlgeschlagen",refunded:"Erstattet",partiallyRefunded:"Teilweise erstattet",unknown:"Unbekannt",loginRequired:"Bitte melde dich zuerst an, um deine Rechnungen zu sehen.",pdfMissing:"Für diese Rechnung ist noch kein PDF hinterlegt.",downloadLinkFailed:"Download-Link konnte nicht erstellt werden.",invoiceOpenFailed:"Rechnung konnte nicht geöffnet werden.",noInvoiceNumber:"Ohne Rechnungsnummer",reference:"Bezug",createdLabel:"Erstellt",sentLabel:"Versendet",recipient:"Empfänger",opening:"Öffnet …",openPdf:"PDF öffnen"},
  en:{navLabel:"Invoices navigation",dashboard:"Dashboard",credits:"Credits",account:"Account",kicker:"Invoices",heroTitle:"Your invoices",heroText:"Here you can find invoices and credit notes for credit purchases. You can open PDFs directly and download them for your records or tax adviser.",buyCredits:"Buy credits",backDashboard:"Back to dashboard",statsLabel:"Invoice statistics",allInvoices:"All invoices",sent:"Sent",created:"Created",creditNotes:"Credit notes",listTitle:"Invoice list",listText:"All invoices from your account, sorted by newest first.",loadingShort:"Loading ...",entries:"entries",invoicesLoading:"Loading invoices …",emptyTitle:"No invoices yet",emptyText:"After your next credit purchase, the invoice will automatically appear here.",invoice:"Invoice",creditNote:"Cancellation / credit note",statusCreating:"Being created",failed:"Failed",refunded:"Refunded",partiallyRefunded:"Partially refunded",unknown:"Unknown",loginRequired:"Please sign in first to view your invoices.",pdfMissing:"No PDF has been stored for this invoice yet.",downloadLinkFailed:"The download link could not be created.",invoiceOpenFailed:"The invoice could not be opened.",noInvoiceNumber:"No invoice number",reference:"Reference",createdLabel:"Created",sentLabel:"Sent",recipient:"Recipient",opening:"Opening …",openPdf:"Open PDF"},
  tr:{navLabel:"Fatura navigasyonu",dashboard:"Kontrol paneli",credits:"Credits",account:"Hesap",kicker:"Faturalar",heroTitle:"Faturaların",heroText:"Credit satın alımlarına ait faturalarını ve alacak notlarını burada bulabilirsin. PDF'leri doğrudan açabilir ve kayıtların veya vergi danışmanın için indirebilirsin.",buyCredits:"Credits satın al",backDashboard:"Kontrol paneline dön",statsLabel:"Fatura istatistikleri",allInvoices:"Tüm faturalar",sent:"Gönderildi",created:"Oluşturuldu",creditNotes:"Alacak notları",listTitle:"Fatura listesi",listText:"Hesabındaki tüm faturalar, en yeniden eskiye sıralanır.",loadingShort:"Yükleniyor ...",entries:"kayıt",invoicesLoading:"Faturalar yükleniyor …",emptyTitle:"Henüz fatura yok",emptyText:"Bir sonraki Credit satın alımından sonra fatura otomatik olarak burada görünür.",invoice:"Fatura",creditNote:"İptal / alacak notu",statusCreating:"Oluşturuluyor",failed:"Başarısız",refunded:"İade edildi",partiallyRefunded:"Kısmen iade edildi",unknown:"Bilinmiyor",loginRequired:"Faturalarını görmek için lütfen önce giriş yap.",pdfMissing:"Bu fatura için henüz PDF yok.",downloadLinkFailed:"İndirme bağlantısı oluşturulamadı.",invoiceOpenFailed:"Fatura açılamadı.",noInvoiceNumber:"Fatura numarası yok",reference:"Referans",createdLabel:"Oluşturuldu",sentLabel:"Gönderildi",recipient:"Alıcı",opening:"Açılıyor …",openPdf:"PDF'yi aç"},
  pl:{navLabel:"Nawigacja faktur",dashboard:"Panel",credits:"Credits",account:"Konto",kicker:"Faktury",heroTitle:"Twoje faktury",heroText:"Tutaj znajdziesz faktury i noty uznaniowe dotyczące zakupów Credits. Pliki PDF możesz otworzyć bezpośrednio i pobrać do dokumentacji lub dla doradcy podatkowego.",buyCredits:"Kup Credits",backDashboard:"Wróć do panelu",statsLabel:"Statystyki faktur",allInvoices:"Wszystkie faktury",sent:"Wysłano",created:"Utworzono",creditNotes:"Noty uznaniowe",listTitle:"Lista faktur",listText:"Wszystkie faktury z Twojego konta, posortowane od najnowszych.",loadingShort:"Ładowanie ...",entries:"wpisów",invoicesLoading:"Ładowanie faktur …",emptyTitle:"Brak faktur",emptyText:"Po następnym zakupie Credits faktura automatycznie pojawi się tutaj.",invoice:"Faktura",creditNote:"Storno / nota uznaniowa",statusCreating:"Tworzenie",failed:"Niepowodzenie",refunded:"Zwrócono",partiallyRefunded:"Częściowo zwrócono",unknown:"Nieznany",loginRequired:"Zaloguj się najpierw, aby zobaczyć faktury.",pdfMissing:"Dla tej faktury nie zapisano jeszcze pliku PDF.",downloadLinkFailed:"Nie udało się utworzyć linku pobierania.",invoiceOpenFailed:"Nie udało się otworzyć faktury.",noInvoiceNumber:"Brak numeru faktury",reference:"Odniesienie",createdLabel:"Utworzono",sentLabel:"Wysłano",recipient:"Odbiorca",opening:"Otwieranie …",openPdf:"Otwórz PDF"},
  ar:{navLabel:"تنقل الفواتير",dashboard:"لوحة التحكم",credits:"Credits",account:"الحساب",kicker:"الفواتير",heroTitle:"فواتيرك",heroText:"ستجد هنا فواتيرك وإشعارات الدائن المتعلقة بشراء Credits. يمكنك فتح ملفات PDF مباشرة وتنزيلها لسجلاتك أو لمستشارك الضريبي.",buyCredits:"شراء Credits",backDashboard:"العودة إلى لوحة التحكم",statsLabel:"إحصاءات الفواتير",allInvoices:"كل الفواتير",sent:"تم الإرسال",created:"تم الإنشاء",creditNotes:"إشعارات الدائن",listTitle:"قائمة الفواتير",listText:"كل الفواتير في حسابك مرتبة من الأحدث إلى الأقدم.",loadingShort:"جارٍ التحميل ...",entries:"إدخالات",invoicesLoading:"جارٍ تحميل الفواتير …",emptyTitle:"لا توجد فواتير بعد",emptyText:"بعد شراء Credits التالي ستظهر الفاتورة هنا تلقائيًا.",invoice:"فاتورة",creditNote:"إلغاء / إشعار دائن",statusCreating:"جارٍ الإنشاء",failed:"فشل",refunded:"تم رد المبلغ",partiallyRefunded:"تم رد جزء من المبلغ",unknown:"غير معروف",loginRequired:"يرجى تسجيل الدخول أولاً لعرض فواتيرك.",pdfMissing:"لا يوجد ملف PDF لهذه الفاتورة حتى الآن.",downloadLinkFailed:"تعذر إنشاء رابط التنزيل.",invoiceOpenFailed:"تعذر فتح الفاتورة.",noInvoiceNumber:"بدون رقم فاتورة",reference:"مرجع",createdLabel:"تم الإنشاء",sentLabel:"تم الإرسال",recipient:"المستلم",opening:"جارٍ الفتح …",openPdf:"فتح PDF"},
  fr:{navLabel:"Navigation des factures",dashboard:"Tableau de bord",credits:"Credits",account:"Compte",kicker:"Factures",heroTitle:"Vos factures",heroText:"Vous trouverez ici vos factures et notes de crédit liées aux achats de Credits. Vous pouvez ouvrir les PDF directement et les télécharger pour vos archives ou votre conseiller fiscal.",buyCredits:"Acheter des Credits",backDashboard:"Retour au tableau de bord",statsLabel:"Statistiques des factures",allInvoices:"Toutes les factures",sent:"Envoyées",created:"Créées",creditNotes:"Notes de crédit",listTitle:"Liste des factures",listText:"Toutes les factures de votre compte, triées de la plus récente à la plus ancienne.",loadingShort:"Chargement ...",entries:"entrées",invoicesLoading:"Chargement des factures …",emptyTitle:"Aucune facture pour le moment",emptyText:"Après votre prochain achat de Credits, la facture apparaîtra automatiquement ici.",invoice:"Facture",creditNote:"Annulation / note de crédit",statusCreating:"Création en cours",failed:"Échec",refunded:"Remboursée",partiallyRefunded:"Partiellement remboursée",unknown:"Inconnu",loginRequired:"Veuillez vous connecter pour voir vos factures.",pdfMissing:"Aucun PDF n’est encore associé à cette facture.",downloadLinkFailed:"Le lien de téléchargement n’a pas pu être créé.",invoiceOpenFailed:"La facture n’a pas pu être ouverte.",noInvoiceNumber:"Sans numéro de facture",reference:"Référence",createdLabel:"Créée",sentLabel:"Envoyée",recipient:"Destinataire",opening:"Ouverture …",openPdf:"Ouvrir le PDF"},
  es:{navLabel:"Navegación de facturas",dashboard:"Panel",credits:"Credits",account:"Cuenta",kicker:"Facturas",heroTitle:"Tus facturas",heroText:"Aquí encontrarás tus facturas y notas de crédito de compras de Credits. Puedes abrir los PDF directamente y descargarlos para tus archivos o asesor fiscal.",buyCredits:"Comprar Credits",backDashboard:"Volver al panel",statsLabel:"Estadísticas de facturas",allInvoices:"Todas las facturas",sent:"Enviadas",created:"Creadas",creditNotes:"Notas de crédito",listTitle:"Lista de facturas",listText:"Todas las facturas de tu cuenta, ordenadas de la más reciente a la más antigua.",loadingShort:"Cargando ...",entries:"entradas",invoicesLoading:"Cargando facturas …",emptyTitle:"Aún no hay facturas",emptyText:"Después de tu próxima compra de Credits, la factura aparecerá aquí automáticamente.",invoice:"Factura",creditNote:"Anulación / nota de crédito",statusCreating:"Creándose",failed:"Fallida",refunded:"Reembolsada",partiallyRefunded:"Reembolso parcial",unknown:"Desconocido",loginRequired:"Inicia sesión primero para ver tus facturas.",pdfMissing:"Esta factura todavía no tiene un PDF asociado.",downloadLinkFailed:"No se pudo crear el enlace de descarga.",invoiceOpenFailed:"No se pudo abrir la factura.",noInvoiceNumber:"Sin número de factura",reference:"Referencia",createdLabel:"Creada",sentLabel:"Enviada",recipient:"Destinatario",opening:"Abriendo …",openPdf:"Abrir PDF"},
  it:{navLabel:"Navigazione fatture",dashboard:"Dashboard",credits:"Credits",account:"Account",kicker:"Fatture",heroTitle:"Le tue fatture",heroText:"Qui trovi fatture e note di credito relative agli acquisti di Credits. Puoi aprire i PDF direttamente e scaricarli per i tuoi documenti o per il consulente fiscale.",buyCredits:"Acquista Credits",backDashboard:"Torna alla dashboard",statsLabel:"Statistiche fatture",allInvoices:"Tutte le fatture",sent:"Inviate",created:"Create",creditNotes:"Note di credito",listTitle:"Elenco fatture",listText:"Tutte le fatture del tuo account, ordinate dalla più recente.",loadingShort:"Caricamento ...",entries:"voci",invoicesLoading:"Caricamento fatture …",emptyTitle:"Nessuna fattura ancora",emptyText:"Dopo il prossimo acquisto di Credits, la fattura apparirà automaticamente qui.",invoice:"Fattura",creditNote:"Storno / nota di credito",statusCreating:"In creazione",failed:"Non riuscita",refunded:"Rimborsata",partiallyRefunded:"Parzialmente rimborsata",unknown:"Sconosciuto",loginRequired:"Accedi prima per vedere le tue fatture.",pdfMissing:"Non è ancora disponibile un PDF per questa fattura.",downloadLinkFailed:"Impossibile creare il link di download.",invoiceOpenFailed:"Impossibile aprire la fattura.",noInvoiceNumber:"Senza numero fattura",reference:"Riferimento",createdLabel:"Creata",sentLabel:"Inviata",recipient:"Destinatario",opening:"Apertura …",openPdf:"Apri PDF"}
};

function normalizeInvoiceLocale(value: string): InvoiceLocale {
  return (["de","en","tr","pl","ar","fr","es","it"] as const).includes(value as InvoiceLocale)
    ? (value as InvoiceLocale)
    : "de";
}

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function formatDate(value: string | null, locale: InvoiceLocale = "de") {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMoney(cents: number | null | undefined, currency = "EUR", locale: InvoiceLocale = "de") {
  const value = Number(cents ?? 0) / 100;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "EUR",
  }).format(value);
}

function getInvoiceAmount(invoice: InvoiceRow) {
  return invoice.gross_amount_cents ?? invoice.amount_cents ?? 0;
}

function getInvoiceTypeLabel(invoice: InvoiceRow, ui: InvoiceCopy) {
  if (invoice.invoice_type === "credit_note") return ui.creditNote;
  return ui.invoice;
}

function getStatusLabel(status: string | null, ui: InvoiceCopy) {
  switch (status) {
    case "sent":
      return ui.sent;
    case "created":
      return ui.created;
    case "creating":
      return ui.statusCreating;
    case "failed":
      return ui.failed;
    case "refunded":
      return ui.refunded;
    case "partially_refunded":
      return ui.partiallyRefunded;
    default:
      return status || ui.unknown;
  }
}

export default function InvoicesPage() {
  const params = useParams();
  const locale = getParam(params?.locale as string | string[] | undefined, "de");
  const invoiceLocale = normalizeInvoiceLocale(locale);
  const ui = INVOICE_TEXT[invoiceLocale];

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
      setErrorText(ui.loginRequired);
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
      alert(ui.pdfMissing);
      return;
    }

    setDownloadingId(invoice.id);

    try {
      const bucket = invoice.storage_bucket || "invoices";
      const pdfPath = invoice.pdf_path.replace(/^\/+/, "");

      const { data } = supabase.storage.from(bucket).getPublicUrl(pdfPath);

      if (!data?.publicUrl) {
        throw new Error(ui.downloadLinkFailed);
      }

      window.open(data.publicUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      alert(error instanceof Error ? error.message : ui.invoiceOpenFailed);
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
      { label: ui.allInvoices, value: total, icon: "🧾" },
      { label: ui.sent, value: sent, icon: "✉️" },
      { label: ui.created, value: created, icon: "📄" },
      { label: ui.creditNotes, value: creditNotes, icon: "↩️" },
    ];
  }, [invoices, ui]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label={ui.navLabel}>
          <Link href={`/${locale}/dashboard`}>{ui.dashboard}</Link>
          <Link href={`/${locale}/dashboard/credits`}>{ui.credits}</Link>
          <Link href={`/${locale}/dashboard/account`}>{ui.account}</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>{ui.kicker}</span>
          <h1>{ui.heroTitle}</h1>
          <p>{ui.heroText}</p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/credits`} className={styles.primaryButton}>
            {ui.buyCredits}
          </Link>
          <Link href={`/${locale}/dashboard`} className={styles.secondaryButton}>
            {ui.backDashboard}
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label={ui.statsLabel}>
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
            <h2>{ui.listTitle}</h2>
            <p>{ui.listText}</p>
          </div>
          <span>{loading ? ui.loadingShort : `${invoices.length} ${ui.entries}`}</span>
        </div>

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}

        {loading ? (
          <div style={emptyStateStyle}>{ui.invoicesLoading}</div>
        ) : null}

        {!loading && !errorText && invoices.length === 0 ? (
          <div style={emptyStateStyle}>
            <div>
              <div style={{ fontSize: 42, marginBottom: 10 }}>🧾</div>
              <strong style={{ display: "block", color: "#ffffff", fontSize: 20, marginBottom: 8 }}>
                {ui.emptyTitle}
              </strong>
              <span style={{ color: "#94a3b8", lineHeight: 1.55 }}>
                {ui.emptyText}
              </span>
            </div>
          </div>
        ) : null}

        {!loading && invoices.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {invoices.map((invoice) => {
              const amount = getInvoiceAmount(invoice);
              const isCreditNote = invoice.invoice_type === "credit_note";
              const statusLabel = getStatusLabel(invoice.status, ui);

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
                        {getInvoiceTypeLabel(invoice, ui)}
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
                      {invoice.invoice_number || ui.noInvoiceNumber}
                    </h3>

                    {invoice.original_invoice_number ? (
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, fontWeight: 800 }}>
                        {ui.reference}: {invoice.original_invoice_number}
                      </p>
                    ) : null}

                    <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, fontWeight: 800 }}>
                      {ui.createdLabel}: {formatDate(invoice.created_at, invoiceLocale)}
                      {invoice.sent_at ? ` · ${ui.sentLabel}: ${formatDate(invoice.sent_at, invoiceLocale)}` : ""}
                    </p>

                    {invoice.billing_email ? (
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, fontWeight: 800 }}>
                        {ui.recipient}: {invoice.billing_email}
                      </p>
                    ) : null}
                  </div>

                  <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                    <strong style={{ color: "#ffffff", fontSize: 22, fontWeight: 950 }}>
                      {formatMoney(amount, invoice.currency ?? "EUR", invoiceLocale)}
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
                      {downloadingId === invoice.id ? ui.opening : ui.openPdf}
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
