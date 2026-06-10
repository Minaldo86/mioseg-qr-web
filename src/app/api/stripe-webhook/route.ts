import Stripe from "stripe";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PdfPage = ReturnType<PDFDocument["addPage"]>;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt.");
  return new Stripe(key);
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string" ? session.payment_intent : null;
}

function getBillingDetails(session: Stripe.Checkout.Session) {
  const address = session.customer_details?.address;
  const metadata = session.metadata ?? {};

  return {
    customerName:
      clean(metadata.billing_name) ||
      clean(metadata.billing_company) ||
      session.customer_details?.name ||
      "Kunde",
    customerEmail:
      clean(metadata.billing_email) ||
      session.customer_details?.email ||
      session.customer_email ||
      null,
    customerStreet:
      clean(metadata.billing_street) ||
      [address?.line1, address?.line2].filter(Boolean).join(" "),
    customerPostalCode: clean(metadata.billing_postal_code) || address?.postal_code || "",
    customerCity: clean(metadata.billing_city) || address?.city || "",
    customerCountry:
      clean(metadata.billing_country_code).toUpperCase() ||
      clean(address?.country).toUpperCase() ||
      "DE",
    customerVatId: clean(metadata.billing_vat_id) || null,
  };
}

function formatMoney(cents: number, currency: string) {
  const value = (cents || 0) / 100;
  const ccy = (currency || "EUR").toUpperCase();
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: ccy,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${ccy}`;
  }
}

function uint8ToBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

const SELLER = {
  name: clean(process.env.SELLER_NAME) || "mioseg qr",
  street: clean(process.env.SELLER_STREET) || "",
  postalCode: clean(process.env.SELLER_POSTAL_CODE) || "",
  city: clean(process.env.SELLER_CITY) || "",
  country: clean(process.env.SELLER_COUNTRY) || "Deutschland",
  email: clean(process.env.SELLER_EMAIL) || "support@mioseg-qr.com",
  website: clean(process.env.SELLER_WEBSITE) || "www.mioseg-qr.com",
  vatId: clean(process.env.SELLER_VAT_ID) || "",
  taxNumber: clean(process.env.SELLER_TAX_NUMBER) || "",
};

const LOGO_URL =
  clean(process.env.INVOICE_LOGO_URL) ||
  "https://ljnuzfjlxsecsdcbcpny.supabase.co/storage/v1/object/public/invoices/mioseg-logo.png";

async function fetchBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Logo konnte nicht geladen werden: ${res.status}`);
  const ab = await res.arrayBuffer();
  return new Uint8Array(ab);
}

async function drawLogo(params: { pdf: PDFDocument; page: PdfPage; x: number; topY: number }) {
  try {
    const logoBytes = await fetchBytes(LOGO_URL);
    const logo = await params.pdf.embedPng(logoBytes);
    const targetWidth = 130;
    const scale = targetWidth / logo.width;
    const width = logo.width * scale;
    const height = logo.height * scale;
    params.page.drawImage(logo, { x: params.x, y: params.topY - height, width, height });
    return params.topY - height - 16;
  } catch {
    return params.topY;
  }
}

async function createInvoicePdfBytes(params: {
  invoiceNumber: string;
  dateISO: string;
  paymentIntentId: string | null;
  customerName: string;
  customerStreet: string;
  customerPostalCode: string;
  customerCity: string;
  customerCountry: string;
  customerEmail: string | null;
  packId: string;
  credits: number;
  netAmountCents: number;
  taxAmountCents: number;
  grossAmountCents: number;
  taxRate: number | null;
  currency: string;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageW = page.getWidth();
  const pageH = page.getHeight();
  const marginL = 50;
  const marginR = 50;
  const rightX = 330;
  const colorText = rgb(0.08, 0.08, 0.1);
  const colorMuted = rgb(0.4, 0.4, 0.45);
  const colorRule = rgb(0.88, 0.88, 0.9);

  const drawRule = (y: number) => {
    page.drawLine({
      start: { x: marginL, y },
      end: { x: pageW - marginR, y },
      thickness: 1,
      color: colorRule,
    });
  };

  const topY = pageH - 36;
  const titleY = await drawLogo({ pdf, page, x: marginL, topY });

  page.drawText("Rechnung", { x: marginL, y: titleY, size: 18, font: bold, color: colorText });

  const sellerLines = [
    SELLER.name,
    SELLER.street,
    [SELLER.postalCode, SELLER.city].filter(Boolean).join(" "),
    SELLER.country,
    SELLER.email ? `E-Mail: ${SELLER.email}` : "",
    SELLER.website,
    SELLER.vatId ? `USt-IdNr.: ${SELLER.vatId}` : SELLER.taxNumber ? `St.-Nr.: ${SELLER.taxNumber}` : "",
  ].filter(Boolean);

  sellerLines.forEach((line, i) => {
    page.drawText(line, {
      x: rightX,
      y: topY - 8 - i * 13,
      size: i === 0 ? 10.5 : 10,
      font: i === 0 ? bold : font,
      color: colorText,
    });
  });

  let y = titleY - 18;
  drawRule(y);
  y -= 24;

  const drawLeft = (text: string, size = 11, isBold = false, muted = false) => {
    page.drawText(text, {
      x: marginL,
      y,
      size,
      font: isBold ? bold : font,
      color: muted ? colorMuted : colorText,
    });
    y -= size + 6;
  };

  drawLeft(`Rechnungsnummer: ${params.invoiceNumber}`, 11, true);
  drawLeft(`Rechnungsdatum: ${params.dateISO}`, 11);
  drawLeft(`Leistungsdatum: ${params.dateISO} (Bereitstellung digitaler Nutzungscredits)`, 11);
  if (params.paymentIntentId) drawLeft(`Zahlungsreferenz (Stripe): ${params.paymentIntentId}`, 9, false, true);
  y -= 8;

  drawLeft("Rechnung an:", 11, true);
  drawLeft(params.customerName || "-", 11);
  drawLeft(params.customerStreet || "-", 11);
  drawLeft([params.customerPostalCode, params.customerCity].filter(Boolean).join(" ") || "-", 11);
  drawLeft(params.customerCountry || "-", 11);
  drawLeft(params.customerEmail || "-", 11);
  y -= 10;

  drawLeft("Leistungsposition", 11, true);
  drawLeft("Erwerb digitaler Nutzungscredits (QR-X Credits)", 11);
  drawLeft(`Paket: ${params.packId}`, 11);
  drawLeft(`Menge: ${params.credits} Credits`, 11);
  y -= 8;

  drawRule(y + 6);
  drawLeft(`Netto: ${formatMoney(params.netAmountCents, params.currency)}`, 11);
  const rateText = params.taxRate !== null && params.taxRate !== undefined ? ` (${Math.round(params.taxRate * 100)} %)` : "";
  drawLeft(`Umsatzsteuer${rateText}: ${formatMoney(params.taxAmountCents, params.currency)}`, 11);
  drawLeft(`Gesamtbetrag: ${formatMoney(params.grossAmountCents, params.currency)}`, 12, true);
  drawRule(y + 4);
  y -= 10;
  drawLeft("Hinweis:", 11, true);
  drawLeft("Der ausgewiesene Betrag enthält die gesetzliche Umsatzsteuer, soweit ausgewiesen.", 10, false, true);
  drawLeft("Die Leistung wird als digitale Bereitstellung von Nutzungscredits erbracht.", 10, false, true);

  const footerY = 34;
  drawRule(footerY + 16);
  const footerLeft = `${SELLER.name} · ${SELLER.street} · ${SELLER.postalCode} ${SELLER.city}`;
  page.drawText(footerLeft, { x: marginL, y: footerY + 6, size: 8.5, font, color: colorMuted });
  const pageLabel = "Seite 1/1";
  const pageLabelW = font.widthOfTextAtSize(pageLabel, 8.5);
  page.drawText(pageLabel, { x: pageW - marginR - pageLabelW, y: 14, size: 8.5, font, color: colorMuted });

  return await pdf.save();
}

async function sendInvoiceEmailResend(params: {
  toEmail: string;
  subject: string;
  text: string;
  filename: string;
  pdfBytes: Uint8Array;
}) {
  const resendApiKey = clean(process.env.RESEND_API_KEY);
  const fromEmail = clean(process.env.INVOICE_FROM_EMAIL);
  const bccEmail = clean(process.env.INVOICE_BCC_EMAIL);
  if (!resendApiKey) throw new Error("RESEND_API_KEY fehlt.");
  if (!fromEmail) throw new Error("INVOICE_FROM_EMAIL fehlt.");

const payload: {
  from: string;
  to: string[];
  subject: string;
  text: string;
  attachments: { filename: string; content: string }[];
  bcc?: string[];
} = {
  from: fromEmail,
  to: [params.toEmail],
  subject: params.subject,
  text: params.text,
  attachments: [{ filename: params.filename, content: uint8ToBase64(params.pdfBytes) }],
};

if (bccEmail) payload.bcc = [bccEmail];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend failed (${res.status}): ${JSON.stringify(data)}`);
  return data;
}

async function nextInvoiceNumber() {
  const { data, error } = await supabaseAdmin.rpc("qrx_next_invoice_number");
  if (error) {
    console.warn("qrx_next_invoice_number failed, fallback WEB:", error.message);
    return `WEB-${Date.now()}`;
  }
  const value = clean(data);
  return value || `WEB-${Date.now()}`;
}

async function writeAdminLog(input: { userId: string; amount: number; note: string }) {
  const { error } = await supabaseAdmin.from("admin_action_log").insert({
    action_type: "credits_purchased_stripe",
    target_user_id: input.userId,
    amount: input.amount,
    note: input.note,
  });
  if (error) console.warn("admin_action_log insert failed:", error.message);
}

async function getOrCreatePurchase(input: {
  userId: string;
  packId: string;
  credits: number;
  amountCents: number;
  currency: string;
  sessionId: string;
  paymentIntentId: string | null;
}) {
  if (input.paymentIntentId) {
    const { data, error } = await supabaseAdmin
      .from("qrx_credit_purchases")
      .select("id,status")
      .eq("stripe_payment_intent_id", input.paymentIntentId)
      .maybeSingle();
    if (error) console.warn("qrx_credit_purchases lookup by payment intent failed:", error.message);
    if (data) return data as { id: string; status: string | null };
  }

  const { data: bySession, error: sessionLookupError } = await supabaseAdmin
    .from("qrx_credit_purchases")
    .select("id,status")
    .eq("provider_transaction_id", input.sessionId)
    .maybeSingle();
  if (sessionLookupError) console.warn("qrx_credit_purchases lookup by session failed:", sessionLookupError.message);
  if (bySession) return bySession as { id: string; status: string | null };

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("qrx_credit_purchases")
    .insert({
      user_id: input.userId,
      pack_id: input.packId,
      credits: input.credits,
      amount_cents: input.amountCents,
      stripe_payment_intent_id: input.paymentIntentId,
      payment_provider: "stripe",
      provider_transaction_id: input.sessionId,
      currency: input.currency,
      status: "created",
    })
    .select("id,status")
    .single();
  if (insertError) throw new Error(`qrx_credit_purchases insert failed: ${insertError.message}`);
  return inserted as { id: string; status: string | null };
}

async function getOrCreateInvoice(input: {
  userId: string;
  purchaseId: string;
  sessionId: string;
  paymentIntentId: string | null;
  amountCents: number;
  netCents: number;
  taxCents: number;
  currency: string;
  packId: string;
  credits: number;
  billing: ReturnType<typeof getBillingDetails>;
}) {
  if (input.paymentIntentId) {
    const { data: existingInvoice, error: existingError } = await supabaseAdmin
      .from("qrx_invoices")
      .select("id,invoice_number,pdf_path,status")
      .eq("stripe_payment_intent_id", input.paymentIntentId)
      .eq("invoice_type", "invoice")
      .maybeSingle();
    if (existingError) console.warn("qrx_invoices lookup failed:", existingError.message);
    if (existingInvoice) return existingInvoice as { id: string; invoice_number: string; pdf_path: string | null; status: string | null };
  }

  const invoiceNumber = await nextInvoiceNumber();
  const pdfPath = `${input.userId}/${invoiceNumber}.pdf`;
  const { data: inserted, error: invoiceError } = await supabaseAdmin
    .from("qrx_invoices")
    .insert({
      invoice_number: invoiceNumber,
      user_id: input.userId,
      purchase_id: input.purchaseId,
      stripe_payment_intent_id: input.paymentIntentId,
      payment_provider: "stripe",
      provider_transaction_id: input.sessionId,
      amount_cents: input.amountCents,
      net_cents: input.netCents,
      tax_cents: input.taxCents,
      net_amount_cents: input.netCents,
      tax_amount_cents: input.taxCents,
      gross_amount_cents: input.amountCents,
      tax_rate: input.taxCents > 0 ? 0.19 : 0,
      tax_jurisdiction: input.billing.customerCountry || "DE",
      customer_country: input.billing.customerCountry || "DE",
      customer_type: input.billing.customerVatId ? "b2b" : "b2c",
      customer_vat_id: input.billing.customerVatId,
      reverse_charge: false,
      tax_behavior: "inclusive",
      currency: input.currency,
      billing_email: input.billing.customerEmail,
      billing_details: {
        billing_name: input.billing.customerName,
        billing_street: input.billing.customerStreet,
        billing_postal_code: input.billing.customerPostalCode,
        billing_city: input.billing.customerCity,
        billing_country_code: input.billing.customerCountry,
        billing_vat_id: input.billing.customerVatId,
        pack_id: input.packId,
        credits: input.credits,
      },
      invoice_type: "invoice",
      status: "creating",
      pdf_path: pdfPath,
      storage_bucket: "invoices",
    })
    .select("id,invoice_number,pdf_path,status")
    .single();
  if (invoiceError) throw new Error(`qrx_invoices insert failed: ${invoiceError.message}`);
  return inserted as { id: string; invoice_number: string; pdf_path: string | null; status: string | null };
}

async function finalizeInvoice(input: {
  invoiceId: string;
  invoiceNumber: string;
  pdfPath: string;
  paymentIntentId: string | null;
  billing: ReturnType<typeof getBillingDetails>;
  packId: string;
  credits: number;
  amountCents: number;
  netCents: number;
  taxCents: number;
  currency: string;
}) {
  if (!input.billing.customerEmail) throw new Error("Rechnungs-E-Mail fehlt.");
  const dateISO = new Date().toISOString().slice(0, 10);
  const pdfBytes = await createInvoicePdfBytes({
    invoiceNumber: input.invoiceNumber,
    dateISO,
    paymentIntentId: input.paymentIntentId,
    customerName: input.billing.customerName,
    customerStreet: input.billing.customerStreet,
    customerPostalCode: input.billing.customerPostalCode,
    customerCity: input.billing.customerCity,
    customerCountry: input.billing.customerCountry,
    customerEmail: input.billing.customerEmail,
    packId: input.packId,
    credits: input.credits,
    netAmountCents: input.netCents,
    taxAmountCents: input.taxCents,
    grossAmountCents: input.amountCents,
    taxRate: input.taxCents > 0 ? 0.19 : 0,
    currency: input.currency,
  });

  const upload = await supabaseAdmin.storage.from("invoices").upload(input.pdfPath, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (upload.error) {
    await supabaseAdmin.from("qrx_invoices").update({ status: "failed" }).eq("id", input.invoiceId);
    throw new Error(`Storage upload failed: ${upload.error.message}`);
  }

  const emailText =
    `Hallo,\n\n` +
    `vielen Dank für deinen Kauf bei mioseg qr.\n\n` +
    `Im Anhang findest du deine Rechnung ${input.invoiceNumber}.\n` +
    `Leistungsdatum: ${dateISO}.\n\n` +
    `Bei Fragen antworte einfach auf diese E-Mail oder kontaktiere uns unter ${SELLER.email}.\n\n` +
    `Freundliche Grüße\n` +
    `${SELLER.name}\n`;

  await sendInvoiceEmailResend({
    toEmail: input.billing.customerEmail,
    subject: `Rechnung ${input.invoiceNumber} – mioseg qr`,
    text: emailText,
    filename: `${input.invoiceNumber}.pdf`,
    pdfBytes,
  });

  const { error: updateError } = await supabaseAdmin
    .from("qrx_invoices")
    .update({ status: "sent", sent_at: new Date().toISOString(), pdf_path: input.pdfPath, storage_bucket: "invoices" })
    .eq("id", input.invoiceId);
  if (updateError) throw new Error(`Invoice status update failed: ${updateError.message}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;
  const sessionId = session.id;
  const userId = clean(session.metadata?.userId || session.metadata?.user_id);
  const packId = clean(session.metadata?.packId || session.metadata?.pack_id);
  const credits = Number(session.metadata?.credits || 0);
  const amountCents = Number(session.metadata?.amountCents || session.metadata?.amount_cents || session.amount_total || 0);
  const paymentIntentId = getPaymentIntentId(session);
  const billing = getBillingDetails(session);
  const currency = (session.currency || "eur").toUpperCase();

  if (!userId) throw new Error(`Stripe Session ${sessionId}: userId fehlt.`);
  if (!packId) throw new Error(`Stripe Session ${sessionId}: packId fehlt.`);
  if (!Number.isInteger(credits) || credits <= 0) throw new Error(`Stripe Session ${sessionId}: credits ungültig.`);

  const taxCents = typeof session.total_details?.amount_tax === "number" ? session.total_details.amount_tax : Math.round(amountCents - amountCents / 1.19);
  const netCents = Math.max(0, amountCents - taxCents);

  const purchase = await getOrCreatePurchase({ userId, packId, credits, amountCents, currency, sessionId, paymentIntentId });

  if (purchase.status !== "succeeded") {
    const { data: newCredits, error } = await supabaseAdmin.rpc("add_credits_admin", { p_user_id: userId, p_amount: credits });
    if (error) throw new Error(`Credits konnten nicht gutgeschrieben werden: ${error.message}`);
    const { error: updateError } = await supabaseAdmin
      .from("qrx_credit_purchases")
      .update({ status: "succeeded", stripe_payment_intent_id: paymentIntentId, provider_transaction_id: sessionId, payment_provider: "stripe" })
      .eq("id", purchase.id);
    if (updateError) throw new Error(`qrx_credit_purchases update failed: ${updateError.message}`);
    await writeAdminLog({ userId, amount: credits, note: `Stripe Web-Kauf erfolgreich. Session: ${sessionId}, Paket: ${packId}, Betrag: ${amountCents} Cent, neuer Stand: ${newCredits}` });
  }

  const invoice = await getOrCreateInvoice({ userId, purchaseId: purchase.id, sessionId, paymentIntentId, amountCents, netCents, taxCents, currency, packId, credits, billing });
  if (invoice.status === "sent" && invoice.pdf_path) return;
  const pdfPath = invoice.pdf_path || `${userId}/${invoice.invoice_number}.pdf`;

  try {
    await finalizeInvoice({ invoiceId: invoice.id, invoiceNumber: invoice.invoice_number, pdfPath, paymentIntentId, billing, packId, credits, amountCents, netCents, taxCents, currency });
  } catch (error) {
    console.error("Invoice generation/sending failed:", error);
    await supabaseAdmin.from("qrx_invoices").update({ status: "failed" }).eq("id", invoice.id);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return Response.json({ error: "STRIPE_WEBHOOK_SECRET fehlt." }, { status: 500 });
    const stripe = getStripe();
    const signature = req.headers.get("stripe-signature");
    if (!signature) return Response.json({ error: "Stripe Signatur fehlt." }, { status: 400 });
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    if (event.type === "checkout.session.completed") await handleCheckoutCompleted(event.data.object);
    return Response.json({ received: true });
  } catch (e: unknown) {
    console.error("stripe webhook error:", e);
    return Response.json({ error: e instanceof Error ? e.message : "Webhook error" }, { status: 400 });
  }
}
