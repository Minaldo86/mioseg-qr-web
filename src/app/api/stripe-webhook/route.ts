import Stripe from "stripe";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
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

type DocumentLanguage = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

function normalizeDocumentLanguage(value: unknown): DocumentLanguage {
  const raw = clean(value).toLowerCase();
  const base = raw.split(/[-_]/)[0];

  return (["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const).includes(
    base as DocumentLanguage,
  )
    ? (base as DocumentLanguage)
    : "de";
}

type MailCopy = {
  invoiceSubject: (invoiceNumber: string) => string;
  invoiceBody: (args: {
    invoiceNumber: string;
    serviceDate: string;
    sellerEmail: string;
    sellerName: string;
    legalConfirmationText: string;
  }) => string;
  creditSubject: (creditNumber: string) => string;
  creditBody: (args: {
    originalInvoiceNumber: string;
    creditNumber: string;
    amount: string;
    sellerEmail: string;
    sellerName: string;
  }) => string;
};

const MAIL_COPY: Record<DocumentLanguage, MailCopy> = {
  de: {
    invoiceSubject: (n) => `Rechnung ${n} – mioseg qr`,
    invoiceBody: ({ invoiceNumber, serviceDate, sellerEmail, sellerName, legalConfirmationText }) =>
      `Hallo,\n\n` +
      `vielen Dank für deinen Kauf bei mioseg qr.\n\n` +
      `Im Anhang findest du deine Rechnung ${invoiceNumber}.\n` +
      `Leistungsdatum: ${serviceDate}.\n` +
      legalConfirmationText +
      `\nBei Fragen antworte einfach auf diese E-Mail oder kontaktiere uns unter ${sellerEmail}.\n\n` +
      `Freundliche Grüße\n${sellerName}\n`,
    creditSubject: (n) => `Gutschrift ${n} – mioseg qr`,
    creditBody: ({ originalInvoiceNumber, creditNumber, amount, sellerEmail, sellerName }) =>
      `Hallo,\n\n` +
      `zu deiner Rechnung ${originalInvoiceNumber} wurde eine Gutschrift erstellt.\n\n` +
      `Im Anhang findest du deine Gutschrift ${creditNumber}.\n` +
      `Betrag: ${amount}.\n\n` +
      `Bei Fragen antworte einfach auf diese E-Mail oder kontaktiere uns unter ${sellerEmail}.\n\n` +
      `Freundliche Grüße\n${sellerName}\n`,
  },
  en: {
    invoiceSubject: (n) => `Invoice ${n} – mioseg qr`,
    invoiceBody: ({ invoiceNumber, serviceDate, sellerEmail, sellerName, legalConfirmationText }) =>
      `Hello,\n\n` +
      `thank you for your purchase from mioseg qr.\n\n` +
      `Your invoice ${invoiceNumber} is attached.\n` +
      `Service date: ${serviceDate}.\n` +
      legalConfirmationText +
      `\nIf you have any questions, reply to this email or contact us at ${sellerEmail}.\n\n` +
      `Kind regards\n${sellerName}\n`,
    creditSubject: (n) => `Credit note ${n} – mioseg qr`,
    creditBody: ({ originalInvoiceNumber, creditNumber, amount, sellerEmail, sellerName }) =>
      `Hello,\n\n` +
      `a credit note has been created for invoice ${originalInvoiceNumber}.\n\n` +
      `Your credit note ${creditNumber} is attached.\n` +
      `Amount: ${amount}.\n\n` +
      `If you have any questions, reply to this email or contact us at ${sellerEmail}.\n\n` +
      `Kind regards\n${sellerName}\n`,
  },
  tr: {
    invoiceSubject: (n) => `Fatura ${n} – mioseg qr`,
    invoiceBody: ({ invoiceNumber, serviceDate, sellerEmail, sellerName, legalConfirmationText }) =>
      `Merhaba,\n\n` +
      `mioseg qr satın alımınız için teşekkür ederiz.\n\n` +
      `${invoiceNumber} numaralı faturanız ektedir.\n` +
      `Hizmet tarihi: ${serviceDate}.\n` +
      legalConfirmationText +
      `\nSorularınız için bu e-postayı yanıtlayabilir veya ${sellerEmail} adresinden bize ulaşabilirsiniz.\n\n` +
      `Saygılarımızla\n${sellerName}\n`,
    creditSubject: (n) => `Alacak dekontu ${n} – mioseg qr`,
    creditBody: ({ originalInvoiceNumber, creditNumber, amount, sellerEmail, sellerName }) =>
      `Merhaba,\n\n` +
      `${originalInvoiceNumber} numaralı faturanız için bir alacak dekontu oluşturuldu.\n\n` +
      `${creditNumber} numaralı alacak dekontunuz ektedir.\n` +
      `Tutar: ${amount}.\n\n` +
      `Sorularınız için bu e-postayı yanıtlayabilir veya ${sellerEmail} adresinden bize ulaşabilirsiniz.\n\n` +
      `Saygılarımızla\n${sellerName}\n`,
  },
  pl: {
    invoiceSubject: (n) => `Faktura ${n} – mioseg qr`,
    invoiceBody: ({ invoiceNumber, serviceDate, sellerEmail, sellerName, legalConfirmationText }) =>
      `Dzień dobry,\n\n` +
      `dziękujemy za zakup w mioseg qr.\n\n` +
      `W załączniku znajduje się faktura ${invoiceNumber}.\n` +
      `Data świadczenia: ${serviceDate}.\n` +
      legalConfirmationText +
      `\nW razie pytań odpowiedz na tę wiadomość lub skontaktuj się z nami pod adresem ${sellerEmail}.\n\n` +
      `Pozdrawiamy\n${sellerName}\n`,
    creditSubject: (n) => `Nota uznaniowa ${n} – mioseg qr`,
    creditBody: ({ originalInvoiceNumber, creditNumber, amount, sellerEmail, sellerName }) =>
      `Dzień dobry,\n\n` +
      `dla faktury ${originalInvoiceNumber} została utworzona nota uznaniowa.\n\n` +
      `W załączniku znajduje się nota ${creditNumber}.\n` +
      `Kwota: ${amount}.\n\n` +
      `W razie pytań odpowiedz na tę wiadomość lub skontaktuj się z nami pod adresem ${sellerEmail}.\n\n` +
      `Pozdrawiamy\n${sellerName}\n`,
  },
  ar: {
    invoiceSubject: (n) => `فاتورة ${n} – mioseg qr`,
    invoiceBody: ({ invoiceNumber, serviceDate, sellerEmail, sellerName, legalConfirmationText }) =>
      `مرحبًا،\n\n` +
      `شكرًا لشرائك من mioseg qr.\n\n` +
      `ستجد الفاتورة ${invoiceNumber} مرفقة بهذه الرسالة.\n` +
      `تاريخ الخدمة: ${serviceDate}.\n` +
      legalConfirmationText +
      `\nإذا كانت لديك أي أسئلة، يمكنك الرد على هذه الرسالة أو التواصل معنا عبر ${sellerEmail}.\n\n` +
      `مع أطيب التحيات\n${sellerName}\n`,
    creditSubject: (n) => `إشعار دائن ${n} – mioseg qr`,
    creditBody: ({ originalInvoiceNumber, creditNumber, amount, sellerEmail, sellerName }) =>
      `مرحبًا،\n\n` +
      `تم إنشاء إشعار دائن للفاتورة ${originalInvoiceNumber}.\n\n` +
      `ستجد الإشعار الدائن ${creditNumber} مرفقًا بهذه الرسالة.\n` +
      `المبلغ: ${amount}.\n\n` +
      `إذا كانت لديك أي أسئلة، يمكنك الرد على هذه الرسالة أو التواصل معنا عبر ${sellerEmail}.\n\n` +
      `مع أطيب التحيات\n${sellerName}\n`,
  },
  fr: {
    invoiceSubject: (n) => `Facture ${n} – mioseg qr`,
    invoiceBody: ({ invoiceNumber, serviceDate, sellerEmail, sellerName, legalConfirmationText }) =>
      `Bonjour,\n\n` +
      `merci pour votre achat chez mioseg qr.\n\n` +
      `Votre facture ${invoiceNumber} est jointe à cet e-mail.\n` +
      `Date de prestation : ${serviceDate}.\n` +
      legalConfirmationText +
      `\nPour toute question, répondez à cet e-mail ou contactez-nous à ${sellerEmail}.\n\n` +
      `Cordialement\n${sellerName}\n`,
    creditSubject: (n) => `Avoir ${n} – mioseg qr`,
    creditBody: ({ originalInvoiceNumber, creditNumber, amount, sellerEmail, sellerName }) =>
      `Bonjour,\n\n` +
      `un avoir a été créé pour votre facture ${originalInvoiceNumber}.\n\n` +
      `Votre avoir ${creditNumber} est joint à cet e-mail.\n` +
      `Montant : ${amount}.\n\n` +
      `Pour toute question, répondez à cet e-mail ou contactez-nous à ${sellerEmail}.\n\n` +
      `Cordialement\n${sellerName}\n`,
  },
  es: {
    invoiceSubject: (n) => `Factura ${n} – mioseg qr`,
    invoiceBody: ({ invoiceNumber, serviceDate, sellerEmail, sellerName, legalConfirmationText }) =>
      `Hola,\n\n` +
      `gracias por tu compra en mioseg qr.\n\n` +
      `Adjuntamos tu factura ${invoiceNumber}.\n` +
      `Fecha de prestación: ${serviceDate}.\n` +
      legalConfirmationText +
      `\nSi tienes alguna pregunta, responde a este correo o contacta con nosotros en ${sellerEmail}.\n\n` +
      `Un saludo\n${sellerName}\n`,
    creditSubject: (n) => `Abono ${n} – mioseg qr`,
    creditBody: ({ originalInvoiceNumber, creditNumber, amount, sellerEmail, sellerName }) =>
      `Hola,\n\n` +
      `se ha creado un abono para tu factura ${originalInvoiceNumber}.\n\n` +
      `Adjuntamos tu abono ${creditNumber}.\n` +
      `Importe: ${amount}.\n\n` +
      `Si tienes alguna pregunta, responde a este correo o contacta con nosotros en ${sellerEmail}.\n\n` +
      `Un saludo\n${sellerName}\n`,
  },
  it: {
    invoiceSubject: (n) => `Fattura ${n} – mioseg qr`,
    invoiceBody: ({ invoiceNumber, serviceDate, sellerEmail, sellerName, legalConfirmationText }) =>
      `Ciao,\n\n` +
      `grazie per il tuo acquisto su mioseg qr.\n\n` +
      `In allegato trovi la fattura ${invoiceNumber}.\n` +
      `Data della prestazione: ${serviceDate}.\n` +
      legalConfirmationText +
      `\nPer qualsiasi domanda, rispondi a questa e-mail o contattaci all’indirizzo ${sellerEmail}.\n\n` +
      `Cordiali saluti\n${sellerName}\n`,
    creditSubject: (n) => `Nota di credito ${n} – mioseg qr`,
    creditBody: ({ originalInvoiceNumber, creditNumber, amount, sellerEmail, sellerName }) =>
      `Ciao,\n\n` +
      `è stata creata una nota di credito per la fattura ${originalInvoiceNumber}.\n\n` +
      `In allegato trovi la nota di credito ${creditNumber}.\n` +
      `Importo: ${amount}.\n\n` +
      `Per qualsiasi domanda, rispondi a questa e-mail o contattaci all’indirizzo ${sellerEmail}.\n\n` +
      `Cordiali saluti\n${sellerName}\n`,
  },

};

type PurchaseLegalAcceptance = {
  id: string;
  user_id: string;
  consent_version: string;
  immediate_performance_text: string;
  withdrawal_loss_text: string;
  accepted_locale: string | null;
  accepted_at: string;
  checkout_status: string | null;
  stripe_checkout_session_id: string | null;
};

type PdfCopy = {
  invoiceTitle: string;
  creditTitle: string;
  invoiceNumber: string;
  creditNumber: string;
  date: string;
  serviceDate: string;
  serviceDescription: string;
  invoiceReference: string;
  paymentReference: string;
  refundReference: string;
  invoiceRecipient: string;
  creditRecipient: string;
  positionTitle: string;
  creditPositionTitle: string;
  invoicePosition: string;
  creditPosition: string;
  package: string;
  quantity: string;
  net: string;
  vat: string;
  total: string;
  creditTotal: string;
  note: string;
  invoiceHint1: string;
  invoiceHint2: string;
  creditHint1: string;
  creditHint2: string;
  email: string;
  vatId: string;
  taxNumber: string;
  page: string;
  legalTitle: string;
  consentOn: string;
  version: string;
  evidenceId: string;
};

const PDF_COPY: Record<DocumentLanguage, PdfCopy> = {
  de: {
    invoiceTitle: "Rechnung", creditTitle: "Gutschrift",
    invoiceNumber: "Rechnungsnummer", creditNumber: "Gutschriftsnummer",
    date: "Datum", serviceDate: "Leistungsdatum",
    serviceDescription: "Bereitstellung digitaler Nutzungscredits",
    invoiceReference: "Bezug auf Rechnung",
    paymentReference: "Zahlungsreferenz (Stripe)",
    refundReference: "Rückerstattungsreferenz (Stripe)",
    invoiceRecipient: "Rechnung an:", creditRecipient: "Gutschrift an:",
    positionTitle: "Leistungsposition", creditPositionTitle: "Gutschriftsposition",
    invoicePosition: "Erwerb digitaler Nutzungscredits (QR-X Credits)",
    creditPosition: "Gutschrift zur Rückerstattung digitaler Nutzungscredits (QR-X Credits)",
    package: "Paket", quantity: "Menge", net: "Netto", vat: "Umsatzsteuer",
    total: "Gesamtbetrag", creditTotal: "Gutschriftbetrag", note: "Hinweis",
    invoiceHint1: "Der ausgewiesene Betrag enthält die gesetzliche Umsatzsteuer, soweit ausgewiesen.",
    invoiceHint2: "Die Leistung wird als digitale Bereitstellung von Nutzungscredits erbracht.",
    creditHint1: "Diese Gutschrift bezieht sich auf die oben genannte Originalrechnung.",
    creditHint2: "Der ausgewiesene Betrag korrigiert die ursprüngliche Bereitstellung digitaler Nutzungscredits.",
    email: "E-Mail", vatId: "USt-IdNr.", taxNumber: "St.-Nr.", page: "Seite",
    legalTitle: "Bestätigung zum sofortigen Leistungsbeginn / Widerrufsrecht:",
    consentOn: "Zustimmung vom", version: "Version", evidenceId: "Nachweis-ID",
  },
  en: {
    invoiceTitle: "Invoice", creditTitle: "Credit note",
    invoiceNumber: "Invoice number", creditNumber: "Credit note number",
    date: "Date", serviceDate: "Service date",
    serviceDescription: "Provision of digital usage credits",
    invoiceReference: "Reference to invoice",
    paymentReference: "Payment reference (Stripe)",
    refundReference: "Refund reference (Stripe)",
    invoiceRecipient: "Invoice to:", creditRecipient: "Credit note to:",
    positionTitle: "Item", creditPositionTitle: "Credit item",
    invoicePosition: "Purchase of digital usage credits (QR-X Credits)",
    creditPosition: "Credit for refunded digital usage credits (QR-X Credits)",
    package: "Package", quantity: "Quantity", net: "Net", vat: "VAT",
    total: "Total amount", creditTotal: "Credit amount", note: "Note",
    invoiceHint1: "The stated amount includes statutory VAT where shown.",
    invoiceHint2: "The service is provided as digital usage credits.",
    creditHint1: "This credit note refers to the original invoice stated above.",
    creditHint2: "The stated amount corrects the original provision of digital usage credits.",
    email: "Email", vatId: "VAT ID", taxNumber: "Tax no.", page: "Page",
    legalTitle: "Confirmation of immediate performance / withdrawal right:",
    consentOn: "Consent on", version: "Version", evidenceId: "Evidence ID",
  },
  tr: {
    invoiceTitle: "Fatura", creditTitle: "Alacak dekontu",
    invoiceNumber: "Fatura numarası", creditNumber: "Alacak dekontu numarası",
    date: "Tarih", serviceDate: "Hizmet tarihi",
    serviceDescription: "Dijital kullanım kredilerinin sağlanması",
    invoiceReference: "İlgili fatura",
    paymentReference: "Ödeme referansı (Stripe)",
    refundReference: "İade referansı (Stripe)",
    invoiceRecipient: "Fatura alıcısı:", creditRecipient: "Alacak dekontu alıcısı:",
    positionTitle: "Kalem", creditPositionTitle: "Alacak kalemi",
    invoicePosition: "Dijital kullanım kredisi satın alımı (QR-X Credits)",
    creditPosition: "İade edilen dijital kullanım kredileri için alacak (QR-X Credits)",
    package: "Paket", quantity: "Miktar", net: "Net", vat: "KDV",
    total: "Toplam tutar", creditTotal: "Alacak tutarı", note: "Not",
    invoiceHint1: "Belirtilen tutar, gösterildiği ölçüde yasal KDV'yi içerir.",
    invoiceHint2: "Hizmet dijital kullanım kredileri olarak sağlanır.",
    creditHint1: "Bu alacak dekontu yukarıda belirtilen asıl faturaya ilişkindir.",
    creditHint2: "Belirtilen tutar, dijital kullanım kredilerinin ilk sağlanmasını düzeltir.",
    email: "E-posta", vatId: "KDV No.", taxNumber: "Vergi No.", page: "Sayfa",
    legalTitle: "Hizmetin derhal başlaması / cayma hakkı onayı:",
    consentOn: "Onay tarihi", version: "Sürüm", evidenceId: "Kanıt kimliği",
  },
  pl: {
    invoiceTitle: "Faktura", creditTitle: "Nota uznaniowa",
    invoiceNumber: "Numer faktury", creditNumber: "Numer noty uznaniowej",
    date: "Data", serviceDate: "Data świadczenia",
    serviceDescription: "Udostępnienie cyfrowych kredytów użytkowych",
    invoiceReference: "Odniesienie do faktury",
    paymentReference: "Referencja płatności (Stripe)",
    refundReference: "Referencja zwrotu (Stripe)",
    invoiceRecipient: "Nabywca:", creditRecipient: "Nota uznaniowa dla:",
    positionTitle: "Pozycja", creditPositionTitle: "Pozycja noty uznaniowej",
    invoicePosition: "Zakup cyfrowych kredytów użytkowych (QR-X Credits)",
    creditPosition: "Zwrot cyfrowych kredytów użytkowych (QR-X Credits)",
    package: "Pakiet", quantity: "Ilość", net: "Netto", vat: "VAT",
    total: "Kwota całkowita", creditTotal: "Kwota uznania", note: "Informacja",
    invoiceHint1: "Wskazana kwota zawiera ustawowy VAT, o ile został wykazany.",
    invoiceHint2: "Usługa jest świadczona w formie cyfrowych kredytów użytkowych.",
    creditHint1: "Niniejsza nota uznaniowa odnosi się do wskazanej powyżej faktury pierwotnej.",
    creditHint2: "Wskazana kwota koryguje pierwotne udostępnienie cyfrowych kredytów użytkowych.",
    email: "E-mail", vatId: "NIP UE", taxNumber: "Nr podatkowy", page: "Strona",
    legalTitle: "Potwierdzenie natychmiastowego rozpoczęcia świadczenia / prawa odstąpienia:",
    consentOn: "Zgoda z dnia", version: "Wersja", evidenceId: "ID potwierdzenia",
  },
  ar: {
    invoiceTitle: "فاتورة", creditTitle: "إشعار دائن",
    invoiceNumber: "رقم الفاتورة", creditNumber: "رقم الإشعار الدائن",
    date: "التاريخ", serviceDate: "تاريخ الخدمة",
    serviceDescription: "توفير أرصدة استخدام رقمية",
    invoiceReference: "مرجع الفاتورة",
    paymentReference: "مرجع الدفع (Stripe)",
    refundReference: "مرجع الاسترداد (Stripe)",
    invoiceRecipient: "الفاتورة إلى:", creditRecipient: "الإشعار الدائن إلى:",
    positionTitle: "البند", creditPositionTitle: "بند الإشعار الدائن",
    invoicePosition: "شراء أرصدة استخدام رقمية (QR-X Credits)",
    creditPosition: "إشعار دائن لاسترداد أرصدة استخدام رقمية (QR-X Credits)",
    package: "الباقة", quantity: "الكمية", net: "الصافي", vat: "ضريبة القيمة المضافة",
    total: "المبلغ الإجمالي", creditTotal: "مبلغ الإشعار الدائن", note: "ملاحظة",
    invoiceHint1: "يتضمن المبلغ الموضح ضريبة القيمة المضافة القانونية حيثما تم بيانها.",
    invoiceHint2: "يتم تقديم الخدمة في صورة أرصدة استخدام رقمية.",
    creditHint1: "يشير هذا الإشعار الدائن إلى الفاتورة الأصلية المذكورة أعلاه.",
    creditHint2: "يصحح المبلغ الموضح التوفير الأصلي لأرصدة الاستخدام الرقمية.",
    email: "البريد الإلكتروني", vatId: "رقم ضريبة القيمة المضافة", taxNumber: "الرقم الضريبي", page: "الصفحة",
    legalTitle: "تأكيد البدء الفوري في تقديم الخدمة / حق الانسحاب:",
    consentOn: "تاريخ الموافقة", version: "الإصدار", evidenceId: "معرّف الإثبات",
  },
  fr: {
    invoiceTitle: "Facture", creditTitle: "Avoir",
    invoiceNumber: "Numéro de facture", creditNumber: "Numéro d’avoir",
    date: "Date", serviceDate: "Date de prestation",
    serviceDescription: "Mise à disposition de crédits d’utilisation numériques",
    invoiceReference: "Référence à la facture",
    paymentReference: "Référence de paiement (Stripe)",
    refundReference: "Référence de remboursement (Stripe)",
    invoiceRecipient: "Facturé à :", creditRecipient: "Avoir pour :",
    positionTitle: "Poste", creditPositionTitle: "Poste de l’avoir",
    invoicePosition: "Achat de crédits d’utilisation numériques (QR-X Credits)",
    creditPosition: "Avoir pour remboursement de crédits d’utilisation numériques (QR-X Credits)",
    package: "Forfait", quantity: "Quantité", net: "Net", vat: "TVA",
    total: "Montant total", creditTotal: "Montant de l’avoir", note: "Remarque",
    invoiceHint1: "Le montant indiqué comprend la TVA légale lorsqu’elle est mentionnée.",
    invoiceHint2: "La prestation est fournie sous forme de crédits d’utilisation numériques.",
    creditHint1: "Cet avoir se rapporte à la facture d’origine indiquée ci-dessus.",
    creditHint2: "Le montant indiqué corrige la mise à disposition initiale des crédits d’utilisation numériques.",
    email: "E-mail", vatId: "N° TVA", taxNumber: "N° fiscal", page: "Page",
    legalTitle: "Confirmation du début immédiat de l’exécution / droit de rétractation :",
    consentOn: "Consentement du", version: "Version", evidenceId: "ID de preuve",
  },
  es: {
    invoiceTitle: "Factura", creditTitle: "Abono",
    invoiceNumber: "Número de factura", creditNumber: "Número de abono",
    date: "Fecha", serviceDate: "Fecha de prestación",
    serviceDescription: "Suministro de créditos de uso digitales",
    invoiceReference: "Referencia a la factura",
    paymentReference: "Referencia de pago (Stripe)",
    refundReference: "Referencia de reembolso (Stripe)",
    invoiceRecipient: "Facturar a:", creditRecipient: "Abono para:",
    positionTitle: "Concepto", creditPositionTitle: "Concepto del abono",
    invoicePosition: "Compra de créditos de uso digitales (QR-X Credits)",
    creditPosition: "Abono por reembolso de créditos de uso digitales (QR-X Credits)",
    package: "Paquete", quantity: "Cantidad", net: "Neto", vat: "IVA",
    total: "Importe total", creditTotal: "Importe del abono", note: "Nota",
    invoiceHint1: "El importe indicado incluye el IVA legal cuando se muestra.",
    invoiceHint2: "El servicio se presta mediante créditos de uso digitales.",
    creditHint1: "Este abono se refiere a la factura original indicada anteriormente.",
    creditHint2: "El importe indicado corrige el suministro original de créditos de uso digitales.",
    email: "Correo electrónico", vatId: "N.º IVA", taxNumber: "N.º fiscal", page: "Página",
    legalTitle: "Confirmación del inicio inmediato de la prestación / derecho de desistimiento:",
    consentOn: "Consentimiento del", version: "Versión", evidenceId: "ID de prueba",
  },
  it: {
    invoiceTitle: "Fattura", creditTitle: "Nota di credito",
    invoiceNumber: "Numero fattura", creditNumber: "Numero nota di credito",
    date: "Data", serviceDate: "Data della prestazione",
    serviceDescription: "Fornitura di crediti di utilizzo digitali",
    invoiceReference: "Riferimento alla fattura",
    paymentReference: "Riferimento pagamento (Stripe)",
    refundReference: "Riferimento rimborso (Stripe)",
    invoiceRecipient: "Fattura a:", creditRecipient: "Nota di credito a:",
    positionTitle: "Voce", creditPositionTitle: "Voce nota di credito",
    invoicePosition: "Acquisto di crediti di utilizzo digitali (QR-X Credits)",
    creditPosition: "Nota di credito per rimborso di crediti di utilizzo digitali (QR-X Credits)",
    package: "Pacchetto", quantity: "Quantità", net: "Netto", vat: "IVA",
    total: "Importo totale", creditTotal: "Importo nota di credito", note: "Nota",
    invoiceHint1: "L’importo indicato comprende l’IVA prevista dalla legge, se riportata.",
    invoiceHint2: "La prestazione viene fornita sotto forma di crediti di utilizzo digitali.",
    creditHint1: "Questa nota di credito si riferisce alla fattura originale indicata sopra.",
    creditHint2: "L’importo indicato rettifica la fornitura originale dei crediti di utilizzo digitali.",
    email: "E-mail", vatId: "P. IVA", taxNumber: "N. fiscale", page: "Pagina",
    legalTitle: "Conferma dell’inizio immediato della prestazione / diritto di recesso:",
    consentOn: "Consenso del", version: "Versione", evidenceId: "ID prova",
  },
};

const MONEY_LOCALE: Record<DocumentLanguage, string> = {
  de: "de-DE",
  en: "en-GB",
  tr: "tr-TR",
  pl: "pl-PL",
  ar: "ar",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
};

function buildLegalAcceptancePdfLines(
  acceptance: PurchaseLegalAcceptance,
  language: DocumentLanguage,
) {
  const copy = PDF_COPY[language];
  return [
    copy.legalTitle,
    `${copy.consentOn} ${new Date(acceptance.accepted_at).toLocaleString(MONEY_LOCALE[language])} (${copy.version} ${acceptance.consent_version}).`,
    acceptance.immediate_performance_text,
    acceptance.withdrawal_loss_text,
    `${copy.evidenceId}: ${acceptance.id}`,
  ];
}

function buildLegalAcceptanceEmailText(
  acceptance: PurchaseLegalAcceptance | null,
  language: DocumentLanguage,
) {
  if (!acceptance) return "";
  return `\n${buildLegalAcceptancePdfLines(acceptance, language).join("\n")}\n`;
}

async function getUserDocumentLanguage(
  userId: string,
  preferredLocale?: unknown,
): Promise<DocumentLanguage> {
  const preferred = clean(preferredLocale);
  if (preferred) return normalizeDocumentLanguage(preferred);

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("language")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("profiles.language lookup failed:", error.message);
    return "de";
  }

  return normalizeDocumentLanguage(data?.language);
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


async function getPurchaseLegalAcceptance(
  session: Stripe.Checkout.Session,
  userId: string,
): Promise<PurchaseLegalAcceptance | null> {
  const metadata = session.metadata ?? {};
  const legalAcceptanceId = clean(metadata.legal_acceptance_id);

  if (!legalAcceptanceId) {
    console.warn("Stripe checkout has no legal_acceptance_id metadata.", {
      sessionId: session.id,
      userId,
    });
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("purchase_legal_acceptances")
    .select(
      "id,user_id,consent_version,immediate_performance_text,withdrawal_loss_text,accepted_locale,accepted_at,checkout_status,stripe_checkout_session_id",
    )
    .eq("id", legalAcceptanceId)
    .eq("user_id", userId)
    .maybeSingle<PurchaseLegalAcceptance>();

  if (error) {
    throw new Error(
      `purchase_legal_acceptances lookup failed: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      `Keine Kaufzustimmung für Stripe Session ${session.id} gefunden.`,
    );
  }

  if (
    data.stripe_checkout_session_id &&
    data.stripe_checkout_session_id !== session.id
  ) {
    throw new Error(
      `Kaufzustimmung ${data.id} gehört nicht zu Stripe Session ${session.id}.`,
    );
  }

  return data;
}

function formatMoney(
  cents: number,
  currency: string,
  language: DocumentLanguage = "de",
) {
  const value = (cents || 0) / 100;
  const ccy = (currency || "EUR").toUpperCase();
  try {
    return new Intl.NumberFormat(MONEY_LOCALE[language], {
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

const INVOICE_FONT_REGULAR_URL = clean(process.env.INVOICE_FONT_REGULAR_URL);
const INVOICE_FONT_BOLD_URL = clean(process.env.INVOICE_FONT_BOLD_URL);
const INVOICE_FONT_ARABIC_REGULAR_URL = clean(
  process.env.INVOICE_FONT_ARABIC_REGULAR_URL,
);
const INVOICE_FONT_ARABIC_BOLD_URL = clean(
  process.env.INVOICE_FONT_ARABIC_BOLD_URL,
);

function needsUnicodeFont(language: DocumentLanguage) {
  return language === "tr" || language === "pl" || language === "ar";
}

function getInvoiceFontUrls(language: DocumentLanguage) {
  if (language === "ar") {
    return {
      regular: INVOICE_FONT_ARABIC_REGULAR_URL,
      bold: INVOICE_FONT_ARABIC_BOLD_URL,
    };
  }

  return {
    regular: INVOICE_FONT_REGULAR_URL,
    bold: INVOICE_FONT_BOLD_URL,
  };
}

async function loadInvoiceFonts(
  pdf: PDFDocument,
  language: DocumentLanguage,
): Promise<{
  font: PDFFont;
  bold: PDFFont;
  effectiveLanguage: DocumentLanguage;
  unicode: boolean;
}> {
  const urls = getInvoiceFontUrls(language);

  if (urls.regular && urls.bold) {
    try {
      pdf.registerFontkit(fontkit);

      const [regularBytes, boldBytes] = await Promise.all([
        fetchBytes(urls.regular),
        fetchBytes(urls.bold),
      ]);

      const [font, bold] = await Promise.all([
        pdf.embedFont(regularBytes, { subset: true }),
        pdf.embedFont(boldBytes, { subset: true }),
      ]);

      return { font, bold, effectiveLanguage: language, unicode: true };
    } catch (error) {
      console.warn("Unicode invoice font loading failed; using safe fallback.", {
        language,
        regularFontConfigured: Boolean(urls.regular),
        boldFontConfigured: Boolean(urls.bold),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Helvetica/WinAnsi cannot safely encode Polish, Turkish or Arabic.
  // Keep purchases functional by falling back to English PDF copy if the
  // required Unicode font cannot be loaded.
  const effectiveLanguage = needsUnicodeFont(language) ? "en" : language;

  return { font, bold, effectiveLanguage, unicode: false };
}

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
  documentTitle?: string;
  numberLabel?: string;
  recipientLabel?: string;
  positionTitle?: string;
  positionDescription?: string;
  totalLabel?: string;
  originalInvoiceNumber?: string | null;
  refundId?: string | null;
  extraHintLines?: string[];
  language?: DocumentLanguage;
}) {
  const requestedLanguage = params.language ?? "de";
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const loadedFonts = await loadInvoiceFonts(pdf, requestedLanguage);
  const { font, bold, effectiveLanguage, unicode } = loadedFonts;
  const copy = PDF_COPY[effectiveLanguage];
  const isRtl = effectiveLanguage === "ar" && unicode;
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

  const documentTitle =
    params.documentTitle ||
    (params.originalInvoiceNumber ? copy.creditTitle : copy.invoiceTitle);
  const titleWidth = bold.widthOfTextAtSize(documentTitle, 18);
  page.drawText(documentTitle, {
    x: isRtl ? pageW - marginR - titleWidth : marginL,
    y: titleY,
    size: 18,
    font: bold,
    color: colorText,
  });

  const sellerLines = [
    SELLER.name,
    SELLER.street,
    [SELLER.postalCode, SELLER.city].filter(Boolean).join(" "),
    SELLER.country,
    SELLER.email ? `${copy.email}: ${SELLER.email}` : "",
    SELLER.website,
    SELLER.vatId ? `${copy.vatId}: ${SELLER.vatId}` : SELLER.taxNumber ? `${copy.taxNumber}: ${SELLER.taxNumber}` : "",
  ].filter(Boolean);

  sellerLines.forEach((line, i) => {
    const lineFont = i === 0 ? bold : font;
    const lineSize = i === 0 ? 10.5 : 10;
    const lineWidth = lineFont.widthOfTextAtSize(line, lineSize);
    page.drawText(line, {
      x: isRtl ? pageW - marginR - lineWidth : rightX,
      y: topY - 8 - i * 13,
      size: lineSize,
      font: lineFont,
      color: colorText,
    });
  });

  let y = titleY - 18;
  drawRule(y);
  y -= 24;

  const drawLeft = (value: string, size = 11, isBold = false, muted = false) => {
    const activeFont = isBold ? bold : font;
    const textWidth = activeFont.widthOfTextAtSize(value, size);
    page.drawText(value, {
      x: isRtl ? pageW - marginR - textWidth : marginL,
      y,
      size,
      font: activeFont,
      color: muted ? colorMuted : colorText,
    });
    y -= size + 6;
  };

  drawLeft(`${params.numberLabel || (params.originalInvoiceNumber ? copy.creditNumber : copy.invoiceNumber)}: ${params.invoiceNumber}`, 11, true);
  drawLeft(`${copy.date}: ${params.dateISO}`, 11);
  drawLeft(`${copy.serviceDate}: ${params.dateISO} (${copy.serviceDescription})`, 11);
  if (params.originalInvoiceNumber) drawLeft(`${copy.invoiceReference}: ${params.originalInvoiceNumber}`, 9, false, true);
  if (params.paymentIntentId) drawLeft(`${copy.paymentReference}: ${params.paymentIntentId}`, 9, false, true);
  if (params.refundId) drawLeft(`${copy.refundReference}: ${params.refundId}`, 9, false, true);
  y -= 8;

  drawLeft(params.recipientLabel || (params.originalInvoiceNumber ? copy.creditRecipient : copy.invoiceRecipient), 11, true);
  drawLeft(params.customerName || "-", 11);
  drawLeft(params.customerStreet || "-", 11);
  drawLeft([params.customerPostalCode, params.customerCity].filter(Boolean).join(" ") || "-", 11);
  drawLeft(params.customerCountry || "-", 11);
  drawLeft(params.customerEmail || "-", 11);
  y -= 10;

  drawLeft(params.positionTitle || (params.originalInvoiceNumber ? copy.creditPositionTitle : copy.positionTitle), 11, true);
  drawLeft(params.positionDescription || (params.originalInvoiceNumber ? copy.creditPosition : copy.invoicePosition), 11);
  drawLeft(`${copy.package}: ${params.packId}`, 11);
  drawLeft(`${copy.quantity}: ${params.credits} Credits`, 11);
  y -= 8;

  drawRule(y + 6);
  drawLeft(`${copy.net}: ${formatMoney(params.netAmountCents, params.currency, effectiveLanguage)}`, 11);
  const rateText = params.taxRate !== null && params.taxRate !== undefined ? ` (${Math.round(params.taxRate * 100)} %)` : "";
  drawLeft(`${copy.vat}${rateText}: ${formatMoney(params.taxAmountCents, params.currency, effectiveLanguage)}`, 11);
  drawLeft(`${params.totalLabel || (params.originalInvoiceNumber ? copy.creditTotal : copy.total)}: ${formatMoney(params.grossAmountCents, params.currency, effectiveLanguage)}`, 12, true);
  drawRule(y + 4);
  y -= 10;
  drawLeft(`${copy.note}:`, 11, true);
  const hintLines =
    params.extraHintLines && params.extraHintLines.length > 0
      ? params.extraHintLines
      : [copy.invoiceHint1, copy.invoiceHint2];
  const wrapHintLine = (value: string, maxWidth = pageW - marginL - marginR) => {
    const words = value.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, 10);

      if (width <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }

    if (current) lines.push(current);
    return lines;
  };

  hintLines.forEach((line) => {
    wrapHintLine(line).forEach((wrapped) => drawLeft(wrapped, 10, false, true));
  });

  const footerY = 34;
  drawRule(footerY + 16);
  const footerLeft = `${SELLER.name} · ${SELLER.street} · ${SELLER.postalCode} ${SELLER.city}`;
  page.drawText(footerLeft, { x: marginL, y: footerY + 6, size: 8.5, font, color: colorMuted });
  const pageLabel = `${copy.page} 1/1`;
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
  language: DocumentLanguage;
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
        language: input.language,
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
  legalAcceptance: PurchaseLegalAcceptance | null;
  language: DocumentLanguage;
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
    extraHintLines: input.legalAcceptance
      ? buildLegalAcceptancePdfLines(input.legalAcceptance, input.language)
      : undefined,
    language: input.language,
  });

  const upload = await supabaseAdmin.storage.from("invoices").upload(input.pdfPath, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (upload.error) {
    await supabaseAdmin.from("qrx_invoices").update({ status: "failed" }).eq("id", input.invoiceId);
    throw new Error(`Storage upload failed: ${upload.error.message}`);
  }

  const legalConfirmationText = buildLegalAcceptanceEmailText(
    input.legalAcceptance,
    input.language,
  );

  const copy = MAIL_COPY[input.language];
  const emailText = copy.invoiceBody({
    invoiceNumber: input.invoiceNumber,
    serviceDate: dateISO,
    sellerEmail: SELLER.email,
    sellerName: SELLER.name,
    legalConfirmationText,
  });

  await sendInvoiceEmailResend({
    toEmail: input.billing.customerEmail,
    subject: copy.invoiceSubject(input.invoiceNumber),
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


type CreditPurchaseRefundRow = {
  id: string;
  user_id: string;
  credits: number | null;
  amount_cents: number | null;
  status: string | null;
  refunded_cents: number | null;
  refunded_amount_cents: number | null;
  refunded_credits: number | null;
};

async function syncCreditPurchaseRefund(input: {
  charge: Stripe.Charge;
  paymentIntentId: string;
  refundId: string | null;
  refundAmountCents: number;
}) {
  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from("qrx_credit_purchases")
    .select(
      "id,user_id,credits,amount_cents,status,refunded_cents,refunded_amount_cents,refunded_credits",
    )
    .eq("stripe_payment_intent_id", input.paymentIntentId)
    .maybeSingle<CreditPurchaseRefundRow>();

  if (purchaseError) {
    throw new Error(
      `Refund-Kauf konnte nicht geladen werden: ${purchaseError.message}`,
    );
  }

  if (!purchase?.id || !purchase.user_id) {
    console.warn("Refund purchase not found.", {
      paymentIntentId: input.paymentIntentId,
      refundId: input.refundId,
    });
    return;
  }

  const purchaseCredits =
    typeof purchase.credits === "number" && purchase.credits > 0
      ? purchase.credits
      : 0;
  const purchaseAmountCents =
    typeof purchase.amount_cents === "number" && purchase.amount_cents > 0
      ? purchase.amount_cents
      : 0;

  if (purchaseCredits <= 0 || purchaseAmountCents <= 0) {
    throw new Error(
      `Refund-Kauf ${purchase.id} enthält ungültige Credits oder einen ungültigen Betrag.`,
    );
  }

  // Stripe liefert bei charge.refunded den kumuliert erstatteten Betrag.
  const stripeRefundedTotal =
    typeof input.charge.amount_refunded === "number" &&
    input.charge.amount_refunded > 0
      ? input.charge.amount_refunded
      : input.refundAmountCents;

  const refundedAmountCentsTotal = Math.min(
    purchaseAmountCents,
    Math.max(0, stripeRefundedTotal),
  );

  if (refundedAmountCentsTotal <= 0) {
    console.warn("Refund amount is zero; purchase refund sync skipped.", {
      purchaseId: purchase.id,
      paymentIntentId: input.paymentIntentId,
    });
    return;
  }

  const fullyRefunded = refundedAmountCentsTotal >= purchaseAmountCents;
  const ratio = refundedAmountCentsTotal / purchaseAmountCents;

  const targetRefundedCredits = fullyRefunded
    ? purchaseCredits
    : Math.floor(purchaseCredits * ratio);

  const alreadyRefundedCredits =
    typeof purchase.refunded_credits === "number" &&
    purchase.refunded_credits > 0
      ? purchase.refunded_credits
      : 0;

  const creditsDelta = Math.max(
    0,
    targetRefundedCredits - alreadyRefundedCredits,
  );

  if (creditsDelta > 0) {
    const { data: newCredits, error: adjustError } = await supabaseAdmin.rpc(
      "adjust_credits_admin",
      {
        p_user_id: purchase.user_id,
        p_delta: -creditsDelta,
        p_reason: "refund",
        p_ref: input.refundId || input.paymentIntentId,
      },
    );

    if (adjustError) {
      throw new Error(
        `Refund-Credits konnten nicht entfernt werden: ${adjustError.message}`,
      );
    }

    console.log("Refund credits revoked.", {
      purchaseId: purchase.id,
      userId: purchase.user_id,
      creditsDelta,
      newCredits,
    });
  }

  const refundedAt = new Date().toISOString();
  const refundStatus = fullyRefunded ? "refunded" : "partially_refunded";

  const { error: updatePurchaseError } = await supabaseAdmin
    .from("qrx_credit_purchases")
    .update({
      status: refundStatus,
      refunded_cents: refundedAmountCentsTotal,
      refunded_amount_cents: refundedAmountCentsTotal,
      refunded_credits: targetRefundedCredits,
      refunded_at: refundedAt,
      stripe_refund_id: input.refundId,
      refund_reason: "Stripe refund webhook",
      updated_at: refundedAt,
    })
    .eq("id", purchase.id);

  if (updatePurchaseError) {
    throw new Error(
      `Refund-Kaufstatus konnte nicht aktualisiert werden: ${updatePurchaseError.message}`,
    );
  }

  const { error: logError } = await supabaseAdmin
    .from("admin_action_log")
    .insert({
      action_type: "credits_refunded_stripe",
      target_user_id: purchase.user_id,
      amount: creditsDelta > 0 ? -creditsDelta : 0,
      note:
        `Stripe-Rückerstattung synchronisiert. Kauf: ${purchase.id}. ` +
        `PaymentIntent: ${input.paymentIntentId}. Refund: ${input.refundId || "-"}. ` +
        `Erstatteter Betrag kumuliert: ${refundedAmountCentsTotal} Cent. ` +
        `Erstattete Credits kumuliert: ${targetRefundedCredits}.`,
    });

  if (logError) {
    console.warn("Refund admin log insert failed:", logError.message);
  }
}

type InvoiceLookupRow = {
  id: string;
  user_id: string;
  purchase_id: string | null;
  invoice_number: string | null;
  stripe_payment_intent_id: string | null;
  provider_transaction_id: string | null;
  amount_cents: number | null;
  gross_amount_cents: number | null;
  net_amount_cents: number | null;
  tax_amount_cents: number | null;
  currency: string | null;
  billing_email: string | null;
  billing_details: unknown;
  status: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringFromRecord(record: Record<string, unknown>, key: string, fallback = "") {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberFromRecord(record: Record<string, unknown>, key: string, fallback = 0) {
  const value = record[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function billingFromInvoice(invoice: InvoiceLookupRow) {
  const details = asRecord(invoice.billing_details);

  return {
    customerName: stringFromRecord(details, "billing_name", "Kunde"),
    customerEmail: stringFromRecord(details, "billing_email") || invoice.billing_email || null,
    customerStreet: stringFromRecord(details, "billing_street"),
    customerPostalCode: stringFromRecord(details, "billing_postal_code"),
    customerCity: stringFromRecord(details, "billing_city"),
    customerCountry: stringFromRecord(details, "billing_country_code", "DE").toUpperCase(),
    customerVatId: stringFromRecord(details, "billing_vat_id") || null,
    packId: stringFromRecord(details, "pack_id", "refund"),
    credits: numberFromRecord(details, "credits", 0),
  };
}

async function languageFromInvoice(invoice: InvoiceLookupRow): Promise<DocumentLanguage> {
  const details = asRecord(invoice.billing_details);
  const storedLanguage = stringFromRecord(details, "language");

  if (storedLanguage) {
    return normalizeDocumentLanguage(storedLanguage);
  }

  return getUserDocumentLanguage(invoice.user_id);
}


function getPaymentIntentIdFromCharge(charge: Stripe.Charge) {
  if (typeof charge.payment_intent === "string") return charge.payment_intent;
  if (charge.payment_intent && typeof charge.payment_intent === "object") return charge.payment_intent.id;
  return null;
}

async function getLatestRefundFromCharge(
  stripe: Stripe,
  charge: Stripe.Charge,
) {
  const embeddedRefunds = charge.refunds?.data ?? [];
  let usableRefunds = embeddedRefunds.filter(
    (refund) => refund.status !== "failed" && refund.status !== "canceled",
  );

  // Einige Stripe-Webhook-Payloads enthalten keine vollständige Refund-Liste.
  // In diesem Fall fragen wir Stripe serverseitig nach der Refund-ID.
  if (usableRefunds.length === 0) {
    try {
      const listed = await stripe.refunds.list({
        charge: charge.id,
        limit: 10,
      });

      usableRefunds = listed.data.filter(
        (refund) => refund.status !== "failed" && refund.status !== "canceled",
      );
    } catch (error) {
      console.warn("Stripe refund lookup by charge failed:", {
        chargeId: charge.id,
        error: error instanceof Error ? error.message : String(error),
      });

      const paymentIntentId = getPaymentIntentIdFromCharge(charge);

      if (paymentIntentId) {
        try {
          const listed = await stripe.refunds.list({
            payment_intent: paymentIntentId,
            limit: 10,
          });

          usableRefunds = listed.data.filter(
            (refund) =>
              refund.status !== "failed" && refund.status !== "canceled",
          );
        } catch (fallbackError) {
          console.warn("Stripe refund lookup by payment intent failed:", {
            paymentIntentId,
            error:
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError),
          });
        }
      }
    }
  }

  const latest = [...usableRefunds].sort(
    (a, b) => (b.created || 0) - (a.created || 0),
  )[0];

  return {
    refundId: latest?.id || null,
    refundAmountCents:
      typeof charge.amount_refunded === "number" && charge.amount_refunded > 0
        ? charge.amount_refunded
        : typeof latest?.amount === "number" && latest.amount > 0
          ? latest.amount
          : 0,
  };
}

async function nextCreditNoteNumber() {
  const year = new Date().getFullYear();
  const prefix = `CN-${year}-`;

  const { data, error } = await supabaseAdmin
    .from("qrx_invoices")
    .select("invoice_number")
    .eq("invoice_type", "credit_note")
    .like("invoice_number", `${prefix}%`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.warn("credit note number lookup failed:", error.message);
    return `${prefix}${Date.now()}`;
  }

  const maxNumber = (data ?? []).reduce((max, row: { invoice_number: string | null }) => {
    const raw = clean(row.invoice_number);
    const suffix = raw.startsWith(prefix) ? Number(raw.slice(prefix.length)) : 0;
    return Number.isFinite(suffix) && suffix > max ? suffix : max;
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(6, "0")}`;
}

async function findOriginalInvoiceByPaymentIntent(paymentIntentId: string) {
  const { data, error } = await supabaseAdmin
    .from("qrx_invoices")
    .select(
      "id,user_id,purchase_id,invoice_number,stripe_payment_intent_id,provider_transaction_id,amount_cents,gross_amount_cents,net_amount_cents,tax_amount_cents,currency,billing_email,billing_details,status"
    )
    .eq("stripe_payment_intent_id", paymentIntentId)
    .eq("invoice_type", "invoice")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<InvoiceLookupRow>();

  if (error) throw new Error(`Originalrechnung konnte nicht geladen werden: ${error.message}`);
  return data;
}

async function existingCreditNote(refundId: string | null, originalInvoiceId: string) {
  let query = supabaseAdmin
    .from("qrx_invoices")
    .select("id,invoice_number,pdf_path,status")
    .eq("invoice_type", "credit_note")
    .eq("original_invoice_id", originalInvoiceId)
    .limit(1);

  if (refundId) query = query.eq("stripe_refund_id", refundId);

  const { data, error } = await query.maybeSingle<{
    id: string;
    invoice_number: string | null;
    pdf_path: string | null;
    status: string | null;
  }>();

  if (error) {
    console.warn("credit note lookup failed:", error.message);
    return null;
  }

  return data;
}

function calculateRefundTax(input: {
  refundAmountCents: number;
  originalGrossCents: number;
  originalTaxCents: number;
}) {
  if (input.originalTaxCents <= 0) {
    return { netCents: input.refundAmountCents, taxCents: 0 };
  }

  if (input.originalGrossCents > 0 && input.refundAmountCents !== input.originalGrossCents) {
    const taxCents = Math.round((input.originalTaxCents * input.refundAmountCents) / input.originalGrossCents);
    return { netCents: input.refundAmountCents - taxCents, taxCents };
  }

  const netCents = Math.round(input.refundAmountCents / 1.19);
  return { netCents, taxCents: input.refundAmountCents - netCents };
}

async function createCreditNoteForRefund(input: {
  charge: Stripe.Charge;
  paymentIntentId: string;
  refundId: string | null;
  refundAmountCents: number;
}) {
  const originalInvoice = await findOriginalInvoiceByPaymentIntent(input.paymentIntentId);

  if (!originalInvoice?.id) {
    console.warn("No original invoice found for refund.", {
      paymentIntentId: input.paymentIntentId,
      refundId: input.refundId,
    });
    return;
  }

  const existing = await existingCreditNote(input.refundId, originalInvoice.id);
  if (existing?.status === "sent" && existing.pdf_path) return;

  const billing = billingFromInvoice(originalInvoice);
  const language = await languageFromInvoice(originalInvoice);
  const copy = MAIL_COPY[language];
  const pdfCopy = PDF_COPY[language];
  if (!billing.customerEmail) throw new Error("E-Mail für Gutschrift fehlt.");

  const originalGrossCents = originalInvoice.gross_amount_cents ?? originalInvoice.amount_cents ?? input.refundAmountCents;
  const originalTaxCents = originalInvoice.tax_amount_cents ?? 0;
  const { netCents, taxCents } = calculateRefundTax({
    refundAmountCents: input.refundAmountCents,
    originalGrossCents,
    originalTaxCents,
  });

  const currency = (originalInvoice.currency || input.charge.currency || "eur").toUpperCase();
  const creditNoteNumber = existing?.invoice_number || (await nextCreditNoteNumber());
  const pdfPath = `${originalInvoice.user_id}/${creditNoteNumber}.pdf`;
  const nowIso = new Date().toISOString();
  const dateISO = nowIso.slice(0, 10);
  let creditNoteId = existing?.id ?? "";

  if (!creditNoteId) {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("qrx_invoices")
      .insert({
        invoice_number: creditNoteNumber,
        user_id: originalInvoice.user_id,
        purchase_id: originalInvoice.purchase_id,
        stripe_payment_intent_id: input.paymentIntentId,
        payment_provider: "stripe",
        provider_transaction_id: originalInvoice.provider_transaction_id,
        amount_cents: input.refundAmountCents,
        net_cents: netCents,
        tax_cents: taxCents,
        net_amount_cents: netCents,
        tax_amount_cents: taxCents,
        gross_amount_cents: input.refundAmountCents,
        tax_rate: taxCents > 0 ? 0.19 : 0,
        tax_jurisdiction: billing.customerCountry || "DE",
        customer_country: billing.customerCountry || "DE",
        customer_type: billing.customerVatId ? "b2b" : "b2c",
        customer_vat_id: billing.customerVatId,
        reverse_charge: false,
        tax_behavior: "inclusive",
        currency,
        billing_email: billing.customerEmail,
        billing_details: {
          billing_name: billing.customerName,
          billing_street: billing.customerStreet,
          billing_postal_code: billing.customerPostalCode,
          billing_city: billing.customerCity,
          billing_country_code: billing.customerCountry,
          billing_vat_id: billing.customerVatId,
          pack_id: billing.packId,
          credits: billing.credits,
          language,
        },
        invoice_type: "credit_note",
        original_invoice_id: originalInvoice.id,
        original_invoice_number: originalInvoice.invoice_number,
        credit_note_reason: "Rückerstattung über Stripe",
        stripe_refund_id: input.refundId,
        refunded_at: nowIso,
        status: "creating",
        pdf_path: pdfPath,
        storage_bucket: "invoices",
      })
      .select("id")
      .single();

    if (insertError) throw new Error(`Gutschrift konnte nicht angelegt werden: ${insertError.message}`);
    creditNoteId = inserted.id;
  }

  const pdfBytes = await createInvoicePdfBytes({
    invoiceNumber: creditNoteNumber,
    dateISO,
    paymentIntentId: input.paymentIntentId,
    customerName: billing.customerName,
    customerStreet: billing.customerStreet,
    customerPostalCode: billing.customerPostalCode,
    customerCity: billing.customerCity,
    customerCountry: billing.customerCountry,
    customerEmail: billing.customerEmail,
    packId: billing.packId,
    credits: billing.credits,
    netAmountCents: netCents,
    taxAmountCents: taxCents,
    grossAmountCents: input.refundAmountCents,
    taxRate: taxCents > 0 ? 0.19 : 0,
    currency,
    documentTitle: pdfCopy.creditTitle,
    numberLabel: pdfCopy.creditNumber,
    recipientLabel: pdfCopy.creditRecipient,
    positionTitle: pdfCopy.creditPositionTitle,
    positionDescription: pdfCopy.creditPosition,
    totalLabel: pdfCopy.creditTotal,
    originalInvoiceNumber: originalInvoice.invoice_number,
    refundId: input.refundId,
    extraHintLines: [pdfCopy.creditHint1, pdfCopy.creditHint2],
    language,
  });

  const upload = await supabaseAdmin.storage.from("invoices").upload(pdfPath, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (upload.error) {
    await supabaseAdmin.from("qrx_invoices").update({ status: "failed" }).eq("id", creditNoteId);
    throw new Error(`Gutschrift-Upload fehlgeschlagen: ${upload.error.message}`);
  }

  const emailText = copy.creditBody({
    originalInvoiceNumber: originalInvoice.invoice_number || "-",
    creditNumber: creditNoteNumber,
    amount: formatMoney(input.refundAmountCents, currency, language),
    sellerEmail: SELLER.email,
    sellerName: SELLER.name,
  });

  await sendInvoiceEmailResend({
    toEmail: billing.customerEmail,
    subject: copy.creditSubject(creditNoteNumber),
    text: emailText,
    filename: `${creditNoteNumber}.pdf`,
    pdfBytes,
  });

  const sentAt = new Date().toISOString();

  const { error: creditNoteUpdateError } = await supabaseAdmin
    .from("qrx_invoices")
    .update({
      status: "sent",
      sent_at: sentAt,
      pdf_path: pdfPath,
      storage_bucket: "invoices",
      refunded_at: sentAt,
      stripe_refund_id: input.refundId,
    })
    .eq("id", creditNoteId);

  if (creditNoteUpdateError) {
    throw new Error(`Gutschriftstatus konnte nicht aktualisiert werden: ${creditNoteUpdateError.message}`);
  }

  const { error: originalUpdateError } = await supabaseAdmin
    .from("qrx_invoices")
    .update({
      status: "refunded",
      refunded_at: sentAt,
      stripe_refund_id: input.refundId,
    })
    .eq("id", originalInvoice.id);

  if (originalUpdateError) {
    console.warn("Originalrechnung konnte nicht als erstattet markiert werden:", originalUpdateError.message);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const stripe = getStripe();
  const paymentIntentId = getPaymentIntentIdFromCharge(charge);
  if (!paymentIntentId) {
    console.warn("Refund ignored: payment_intent missing on charge.", { chargeId: charge.id });
    return;
  }

  const { refundId, refundAmountCents } =
    await getLatestRefundFromCharge(stripe, charge);

  if (refundAmountCents <= 0) {
    console.warn("Refund ignored: refund amount missing.", { chargeId: charge.id, refundId });
    return;
  }

  await syncCreditPurchaseRefund({
    charge,
    paymentIntentId,
    refundId,
    refundAmountCents,
  });

  await createCreditNoteForRefund({
    charge,
    paymentIntentId,
    refundId,
    refundAmountCents,
  });
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
  const legalAcceptance = await getPurchaseLegalAcceptance(session, userId);
  const language = await getUserDocumentLanguage(
    userId,
    legalAcceptance?.accepted_locale ||
      session.metadata?.language ||
      session.metadata?.locale,
  );
  const currency = (session.currency || "eur").toUpperCase();

  if (!userId) throw new Error(`Stripe Session ${sessionId}: userId fehlt.`);
  if (!packId) throw new Error(`Stripe Session ${sessionId}: packId fehlt.`);
  if (!Number.isInteger(credits) || credits <= 0) throw new Error(`Stripe Session ${sessionId}: credits ungültig.`);

 const stripeTax =
  typeof session.total_details?.amount_tax === "number"
    ? session.total_details.amount_tax
    : 0;

let taxCents: number;
let netCents: number;

if (stripeTax > 0) {
  taxCents = stripeTax;
  netCents = amountCents - taxCents;
} else {
  netCents = Math.round(amountCents / 1.19);
  taxCents = amountCents - netCents;
}

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

  const invoice = await getOrCreateInvoice({ userId, purchaseId: purchase.id, sessionId, paymentIntentId, amountCents, netCents, taxCents, currency, packId, credits, billing, language });

  if (invoice.status === "sent" && invoice.pdf_path) {
    if (legalAcceptance?.id) {
      await supabaseAdmin
        .from("purchase_legal_acceptances")
        .update({ checkout_status: "completed" })
        .eq("id", legalAcceptance.id)
        .eq("user_id", userId);
    }
    return;
  }
  const pdfPath = invoice.pdf_path || `${userId}/${invoice.invoice_number}.pdf`;

  try {
    await finalizeInvoice({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      pdfPath,
      paymentIntentId,
      billing,
      packId,
      credits,
      amountCents,
      netCents,
      taxCents,
      currency,
      legalAcceptance,
      language,
    });
  } catch (error) {
    console.error("Invoice generation/sending failed:", error);
    await supabaseAdmin.from("qrx_invoices").update({ status: "failed" }).eq("id", invoice.id);
    throw error;
  }

  if (legalAcceptance?.id) {
    const { error: legalUpdateError } = await supabaseAdmin
      .from("purchase_legal_acceptances")
      .update({ checkout_status: "completed" })
      .eq("id", legalAcceptance.id)
      .eq("user_id", userId);

    if (legalUpdateError) {
      console.warn(
        "purchase_legal_acceptances completion update failed:",
        legalUpdateError.message,
      );
    }
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
    if (event.type === "charge.refunded") await handleChargeRefunded(event.data.object);
    return Response.json({ received: true });
  } catch (e: unknown) {
    console.error("stripe webhook error:", e);
    return Response.json({ error: e instanceof Error ? e.message : "Webhook error" }, { status: 400 });
  }
}
