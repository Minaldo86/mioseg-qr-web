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


type CreditLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

type CreditCopy = {
  navLabel: string;
  dashboard: string;
  myQrx: string;
  invoices: string;
  heroTitle: string;
  heroText: string;
  openInvoices: string;
  backDashboard: string;
  statsLabel: string;
  currentCredits: string;
  qrxCreation: string;
  freeStorage: string;
  packages: string;
  payPerUse: string;
  launchLabel: string;
  packagesTitle: string;
  packagesText: string;
  invoiceIncluded: string;
  buyCredits: string;
  goStripe: string;
  historyTitle: string;
  historyText: string;
  loading: string;
  noPurchases: string;
  receiptsLoading: string;
  creditNote: string;
  package: string;
  invoice: string;
  sent: string;
  created: string;
  creating: string;
  failed: string;
  refunded: string;
  partiallyRefunded: string;
  unknown: string;
  noReceiptNumber: string;
  sentLower: string;
  reference: string;
  opening: string;
  openCreditNote: string;
  openInvoice: string;
  showAllInvoices: string;
  loginRequired: string;
  loginFirst: string;
  pricesLoadFailed: string;
  confirmBoth: string;
  unknownPack: string;
  checkoutFailed: string;
  checkoutUrlMissing: string;
  pdfMissing: string;
  downloadLinkFailed: string;
  pdfOpenFailed: string;
  popular: string;
  packageFallback: string;
  purchaseConfirmTitle: string;
  purchaseConfirmText: string;
  totalTaxNote: string;
  immediateConsent: string;
  withdrawalAcknowledgement: string;
  legalFinePrint: string;
  cancel: string;
  redirectStripe: string;
  agreeStripe: string;
};

const CREDIT_TEXT: Record<CreditLocale, CreditCopy> = {
  de: {
    navLabel:"Credits Navigation", dashboard:"Dashboard", myQrx:"Meine QR-X", invoices:"Rechnungen",
    heroTitle:"Credits verwalten", heroText:"Behalte dein Guthaben im Blick und kaufe neue Credits direkt über Stripe. Credits werden für die Erstellung von QR-X und für zusätzlichen Speicher genutzt. Die Werte werden zentral im Adminbereich verwaltet.",
    openInvoices:"Rechnungen öffnen", backDashboard:"Zurück zum Dashboard", statsLabel:"Credit Kennzahlen",
    currentCredits:"Aktuelle Credits", qrxCreation:"QR-X Erstellung", freeStorage:"Freier Speicher", packages:"Pakete", payPerUse:"Nutzungsabhängig", launchLabel:"Einführung",
    packagesTitle:"Credit-Pakete", packagesText:"Wähle ein Paket und starte den sicheren Checkout über Stripe. Die Preise werden live aus der Admin-Konfiguration geladen.",
    invoiceIncluded:"inkl. Rechnung für deine Unterlagen.", buyCredits:"Credits kaufen", goStripe:"Weiter zu Stripe...",
    historyTitle:"Kaufhistorie", historyText:"Deine letzten Rechnungen und Gutschriften zu Credit-Käufen.", loading:"Lädt",
    noPurchases:"Noch keine Käufe vorhanden. Nach deinem ersten Credit-Kauf erscheint der Beleg hier.", receiptsLoading:"Belege werden geladen …",
    creditNote:"Gutschrift", package:"Paket", invoice:"Rechnung", sent:"Versendet", created:"Erstellt", creating:"Wird erstellt", failed:"Fehlgeschlagen", refunded:"Erstattet", partiallyRefunded:"Teilweise erstattet", unknown:"Unbekannt",
    noReceiptNumber:"Ohne Belegnummer", sentLower:"versendet", reference:"Bezug", opening:"Öffnet …", openCreditNote:"Gutschrift öffnen", openInvoice:"Rechnung öffnen", showAllInvoices:"Alle Rechnungen anzeigen",
    loginRequired:"Bitte melde dich zuerst an.", loginFirst:"Bitte zuerst anmelden.", pricesLoadFailed:"Preise konnten nicht geladen werden.",
    confirmBoth:"Bitte bestätige beide Hinweise zum sofortigen Leistungsbeginn und zum Widerrufsrecht.", unknownPack:"Dieses Credit-Paket ist nicht bekannt.", checkoutFailed:"Checkout konnte nicht gestartet werden.", checkoutUrlMissing:"Stripe Checkout URL fehlt.",
    pdfMissing:"Für diesen Beleg ist noch kein PDF hinterlegt.", downloadLinkFailed:"Download-Link konnte nicht erstellt werden.", pdfOpenFailed:"PDF konnte nicht geöffnet werden.",
    popular:"Beliebt", packageFallback:"Paket",
    purchaseConfirmTitle:"Credit-Kauf bestätigen", purchaseConfirmText:"Bitte prüfe deinen Kauf und bestätige die Hinweise, bevor du zu Stripe weitergeleitet wirst.",
    totalTaxNote:"Gesamtpreis inkl. gesetzlich anfallender Umsatzsteuer, soweit diese anfällt.",
    immediateConsent:"Ich stimme ausdrücklich zu, dass mioseg qr vor Ablauf der Widerrufsfrist mit der Ausführung beginnt und die gekauften Credits nach erfolgreicher Zahlung unmittelbar meinem Konto gutschreibt.",
    withdrawalAcknowledgement:"Mir ist bekannt, dass mein Widerrufsrecht bei Vorliegen der gesetzlichen Voraussetzungen mit Beginn der Ausführung erlöschen kann.",
    legalFinePrint:"Die Bestätigungen werden zusammen mit dem Kaufvorgang dokumentiert. Gesetzliche Rechte bleiben unberührt.",
    cancel:"Abbrechen", redirectStripe:"Weiterleitung zu Stripe …", agreeStripe:"Zustimmen & weiter zu Stripe"
  },
  en: {
    navLabel:"Credits navigation", dashboard:"Dashboard", myQrx:"My QR-X", invoices:"Invoices",
    heroTitle:"Manage credits", heroText:"Keep track of your balance and buy new credits directly via Stripe. Credits are used to create QR-X and for additional storage. The values are managed centrally in the admin area.",
    openInvoices:"Open invoices", backDashboard:"Back to dashboard", statsLabel:"Credit statistics",
    currentCredits:"Current credits", qrxCreation:"QR-X creation", freeStorage:"Free storage", packages:"Packages", payPerUse:"Pay per use", launchLabel:"Launch",
    packagesTitle:"Credit packages", packagesText:"Choose a package and start secure checkout via Stripe. Prices are loaded live from the admin configuration.",
    invoiceIncluded:"including an invoice for your records.", buyCredits:"Buy credits", goStripe:"Continue to Stripe...",
    historyTitle:"Purchase history", historyText:"Your latest invoices and credit notes for credit purchases.", loading:"Loading",
    noPurchases:"No purchases yet. After your first credit purchase, the receipt will appear here.", receiptsLoading:"Loading receipts …",
    creditNote:"Credit note", package:"Package", invoice:"Invoice", sent:"Sent", created:"Created", creating:"Being created", failed:"Failed", refunded:"Refunded", partiallyRefunded:"Partially refunded", unknown:"Unknown",
    noReceiptNumber:"No document number", sentLower:"sent", reference:"Reference", opening:"Opening …", openCreditNote:"Open credit note", openInvoice:"Open invoice", showAllInvoices:"Show all invoices",
    loginRequired:"Please sign in first.", loginFirst:"Please sign in first.", pricesLoadFailed:"Prices could not be loaded.",
    confirmBoth:"Please confirm both notices regarding immediate performance and the right of withdrawal.", unknownPack:"This credit package is not known.", checkoutFailed:"Checkout could not be started.", checkoutUrlMissing:"Stripe Checkout URL is missing.",
    pdfMissing:"No PDF has been stored for this document yet.", downloadLinkFailed:"The download link could not be created.", pdfOpenFailed:"The PDF could not be opened.",
    popular:"Popular", packageFallback:"Package",
    purchaseConfirmTitle:"Confirm credit purchase", purchaseConfirmText:"Please review your purchase and confirm the notices before you are redirected to Stripe.",
    totalTaxNote:"Total price including any legally applicable VAT.",
    immediateConsent:"I expressly agree that mioseg qr may begin performance before the withdrawal period expires and credit the purchased credits to my account immediately after successful payment.",
    withdrawalAcknowledgement:"I understand that, where the legal requirements are met, my right of withdrawal may expire when performance begins.",
    legalFinePrint:"The confirmations are documented together with the purchase process. Statutory rights remain unaffected.",
    cancel:"Cancel", redirectStripe:"Redirecting to Stripe …", agreeStripe:"Agree & continue to Stripe"
  },
  tr: {
    navLabel:"Credits navigasyonu", dashboard:"Kontrol paneli", myQrx:"QR-X'lerim", invoices:"Faturalar",
    heroTitle:"Credits yönetimi", heroText:"Bakiyeni takip et ve Stripe üzerinden doğrudan yeni Credits satın al. Credits, QR-X oluşturmak ve ek depolama için kullanılır. Değerler yönetici alanından merkezi olarak yönetilir.",
    openInvoices:"Faturaları aç", backDashboard:"Kontrol paneline dön", statsLabel:"Credit istatistikleri",
    currentCredits:"Mevcut Credits", qrxCreation:"QR-X oluşturma", freeStorage:"Ücretsiz depolama", packages:"Paketler", payPerUse:"Kullandıkça öde", launchLabel:"Lansman",
    packagesTitle:"Credit paketleri", packagesText:"Bir paket seç ve Stripe üzerinden güvenli ödeme sürecini başlat. Fiyatlar yönetici yapılandırmasından canlı olarak yüklenir.",
    invoiceIncluded:"kayıtların için fatura dahil.", buyCredits:"Credits satın al", goStripe:"Stripe'a devam et...",
    historyTitle:"Satın alma geçmişi", historyText:"Credit satın alımlarına ait son faturaların ve alacak notların.", loading:"Yükleniyor",
    noPurchases:"Henüz satın alma yok. İlk Credit satın alımından sonra belge burada görünür.", receiptsLoading:"Belgeler yükleniyor …",
    creditNote:"Alacak notu", package:"Paket", invoice:"Fatura", sent:"Gönderildi", created:"Oluşturuldu", creating:"Oluşturuluyor", failed:"Başarısız", refunded:"İade edildi", partiallyRefunded:"Kısmen iade edildi", unknown:"Bilinmiyor",
    noReceiptNumber:"Belge numarası yok", sentLower:"gönderildi", reference:"Referans", opening:"Açılıyor …", openCreditNote:"Alacak notunu aç", openInvoice:"Faturayı aç", showAllInvoices:"Tüm faturaları göster",
    loginRequired:"Lütfen önce giriş yapın.", loginFirst:"Lütfen önce giriş yapın.", pricesLoadFailed:"Fiyatlar yüklenemedi.",
    confirmBoth:"Lütfen hizmetin hemen başlaması ve cayma hakkıyla ilgili iki bildirimi de onaylayın.", unknownPack:"Bu Credit paketi bilinmiyor.", checkoutFailed:"Ödeme işlemi başlatılamadı.", checkoutUrlMissing:"Stripe Checkout URL'si eksik.",
    pdfMissing:"Bu belge için henüz PDF yok.", downloadLinkFailed:"İndirme bağlantısı oluşturulamadı.", pdfOpenFailed:"PDF açılamadı.",
    popular:"Popüler", packageFallback:"Paket",
    purchaseConfirmTitle:"Credit satın alımını onayla", purchaseConfirmText:"Stripe'a yönlendirilmeden önce satın alımını kontrol et ve bildirimleri onayla.",
    totalTaxNote:"Yasal olarak uygulanıyorsa KDV dahil toplam fiyat.",
    immediateConsent:"mioseg qr'ın cayma süresi dolmadan hizmeti sunmaya başlamasını ve satın alınan Credits'in başarılı ödemeden hemen sonra hesabıma aktarılmasını açıkça kabul ediyorum.",
    withdrawalAcknowledgement:"Yasal şartlar oluştuğunda hizmetin başlamasıyla cayma hakkımın sona erebileceğini biliyorum.",
    legalFinePrint:"Onaylar satın alma işlemiyle birlikte kaydedilir. Yasal haklar etkilenmez.",
    cancel:"İptal", redirectStripe:"Stripe'a yönlendiriliyor …", agreeStripe:"Onayla ve Stripe'a devam et"
  },
  pl: {
    navLabel:"Nawigacja Credits", dashboard:"Panel", myQrx:"Moje QR-X", invoices:"Faktury",
    heroTitle:"Zarządzaj Credits", heroText:"Kontroluj saldo i kupuj nowe Credits bezpośrednio przez Stripe. Credits służą do tworzenia QR-X i dodatkowej przestrzeni. Wartości są zarządzane centralnie w panelu administratora.",
    openInvoices:"Otwórz faktury", backDashboard:"Wróć do panelu", statsLabel:"Statystyki Credits",
    currentCredits:"Aktualne Credits", qrxCreation:"Tworzenie QR-X", freeStorage:"Bezpłatna przestrzeń", packages:"Pakiety", payPerUse:"Płatność za użycie", launchLabel:"Start",
    packagesTitle:"Pakiety Credits", packagesText:"Wybierz pakiet i rozpocznij bezpieczną płatność przez Stripe. Ceny są pobierane na żywo z konfiguracji administratora.",
    invoiceIncluded:"z fakturą do Twojej dokumentacji.", buyCredits:"Kup Credits", goStripe:"Przejdź do Stripe...",
    historyTitle:"Historia zakupów", historyText:"Twoje ostatnie faktury i noty uznaniowe za zakupy Credits.", loading:"Ładowanie",
    noPurchases:"Nie ma jeszcze zakupów. Po pierwszym zakupie Credits dokument pojawi się tutaj.", receiptsLoading:"Ładowanie dokumentów …",
    creditNote:"Nota uznaniowa", package:"Pakiet", invoice:"Faktura", sent:"Wysłano", created:"Utworzono", creating:"Tworzenie", failed:"Niepowodzenie", refunded:"Zwrócono", partiallyRefunded:"Częściowo zwrócono", unknown:"Nieznany",
    noReceiptNumber:"Brak numeru dokumentu", sentLower:"wysłano", reference:"Odniesienie", opening:"Otwieranie …", openCreditNote:"Otwórz notę uznaniową", openInvoice:"Otwórz fakturę", showAllInvoices:"Pokaż wszystkie faktury",
    loginRequired:"Najpierw się zaloguj.", loginFirst:"Najpierw się zaloguj.", pricesLoadFailed:"Nie udało się wczytać cen.",
    confirmBoth:"Potwierdź oba oświadczenia dotyczące natychmiastowego rozpoczęcia świadczenia i prawa odstąpienia.", unknownPack:"Ten pakiet Credits jest nieznany.", checkoutFailed:"Nie udało się uruchomić płatności.", checkoutUrlMissing:"Brakuje adresu URL Stripe Checkout.",
    pdfMissing:"Dla tego dokumentu nie zapisano jeszcze pliku PDF.", downloadLinkFailed:"Nie udało się utworzyć linku pobierania.", pdfOpenFailed:"Nie udało się otworzyć pliku PDF.",
    popular:"Popularny", packageFallback:"Pakiet",
    purchaseConfirmTitle:"Potwierdź zakup Credits", purchaseConfirmText:"Sprawdź zakup i potwierdź informacje przed przekierowaniem do Stripe.",
    totalTaxNote:"Łączna cena z uwzględnieniem ustawowo należnego VAT, jeśli ma zastosowanie.",
    immediateConsent:"Wyraźnie zgadzam się, aby mioseg qr rozpoczęło świadczenie przed upływem terminu odstąpienia i przypisało zakupione Credits do mojego konta bezpośrednio po skutecznej płatności.",
    withdrawalAcknowledgement:"Przyjmuję do wiadomości, że po spełnieniu ustawowych warunków moje prawo odstąpienia może wygasnąć z chwilą rozpoczęcia świadczenia.",
    legalFinePrint:"Potwierdzenia są dokumentowane wraz z procesem zakupu. Prawa ustawowe pozostają nienaruszone.",
    cancel:"Anuluj", redirectStripe:"Przekierowanie do Stripe …", agreeStripe:"Zgadzam się i przechodzę do Stripe"
  },
  ar: {
    navLabel:"تنقل Credits", dashboard:"لوحة التحكم", myQrx:"QR-X الخاصة بي", invoices:"الفواتير",
    heroTitle:"إدارة Credits", heroText:"تابع رصيدك واشترِ Credits جديدة مباشرة عبر Stripe. تُستخدم Credits لإنشاء QR-X وللتخزين الإضافي. تتم إدارة القيم مركزيًا من لوحة الإدارة.",
    openInvoices:"فتح الفواتير", backDashboard:"العودة إلى لوحة التحكم", statsLabel:"إحصاءات Credits",
    currentCredits:"Credits الحالية", qrxCreation:"إنشاء QR-X", freeStorage:"التخزين المجاني", packages:"الحزم", payPerUse:"الدفع حسب الاستخدام", launchLabel:"إطلاق",
    packagesTitle:"حزم Credits", packagesText:"اختر حزمة وابدأ الدفع الآمن عبر Stripe. يتم تحميل الأسعار مباشرة من إعدادات الإدارة.",
    invoiceIncluded:"مع فاتورة لسجلاتك.", buyCredits:"شراء Credits", goStripe:"المتابعة إلى Stripe...",
    historyTitle:"سجل المشتريات", historyText:"أحدث الفواتير وإشعارات الدائن لعمليات شراء Credits.", loading:"جارٍ التحميل",
    noPurchases:"لا توجد مشتريات بعد. بعد أول شراء Credits سيظهر المستند هنا.", receiptsLoading:"جارٍ تحميل المستندات …",
    creditNote:"إشعار دائن", package:"حزمة", invoice:"فاتورة", sent:"تم الإرسال", created:"تم الإنشاء", creating:"جارٍ الإنشاء", failed:"فشل", refunded:"تم رد المبلغ", partiallyRefunded:"تم رد جزء من المبلغ", unknown:"غير معروف",
    noReceiptNumber:"بدون رقم مستند", sentLower:"تم الإرسال", reference:"مرجع", opening:"جارٍ الفتح …", openCreditNote:"فتح الإشعار الدائن", openInvoice:"فتح الفاتورة", showAllInvoices:"عرض كل الفواتير",
    loginRequired:"يرجى تسجيل الدخول أولاً.", loginFirst:"يرجى تسجيل الدخول أولاً.", pricesLoadFailed:"تعذر تحميل الأسعار.",
    confirmBoth:"يرجى تأكيد الإشعارين المتعلقين ببدء الأداء فورًا وحق الانسحاب.", unknownPack:"حزمة Credits هذه غير معروفة.", checkoutFailed:"تعذر بدء عملية الدفع.", checkoutUrlMissing:"عنوان Stripe Checkout غير موجود.",
    pdfMissing:"لا يوجد ملف PDF لهذا المستند حتى الآن.", downloadLinkFailed:"تعذر إنشاء رابط التنزيل.", pdfOpenFailed:"تعذر فتح ملف PDF.",
    popular:"شائع", packageFallback:"حزمة",
    purchaseConfirmTitle:"تأكيد شراء Credits", purchaseConfirmText:"راجع عملية الشراء وأكّد الإشعارات قبل تحويلك إلى Stripe.",
    totalTaxNote:"السعر الإجمالي شامل ضريبة القيمة المضافة القانونية حيثما تنطبق.",
    immediateConsent:"أوافق صراحةً على أن يبدأ mioseg qr في تنفيذ الخدمة قبل انتهاء فترة الانسحاب وأن تتم إضافة Credits المشتراة إلى حسابي فور نجاح الدفع.",
    withdrawalAcknowledgement:"أقر بأن حقي في الانسحاب قد ينقضي عند بدء التنفيذ إذا تحققت الشروط القانونية.",
    legalFinePrint:"يتم توثيق التأكيدات مع عملية الشراء. تبقى الحقوق القانونية دون مساس.",
    cancel:"إلغاء", redirectStripe:"جارٍ التحويل إلى Stripe …", agreeStripe:"موافق والمتابعة إلى Stripe"
  },
  fr: {
    navLabel:"Navigation des Credits", dashboard:"Tableau de bord", myQrx:"Mes QR-X", invoices:"Factures",
    heroTitle:"Gérer les Credits", heroText:"Gardez un œil sur votre solde et achetez de nouveaux Credits directement via Stripe. Les Credits servent à créer des QR-X et à obtenir du stockage supplémentaire. Les valeurs sont gérées de manière centralisée dans l’administration.",
    openInvoices:"Ouvrir les factures", backDashboard:"Retour au tableau de bord", statsLabel:"Statistiques des Credits",
    currentCredits:"Credits actuels", qrxCreation:"Création de QR-X", freeStorage:"Stockage gratuit", packages:"Packs", payPerUse:"Paiement à l’usage", launchLabel:"Lancement",
    packagesTitle:"Packs de Credits", packagesText:"Choisissez un pack et lancez le paiement sécurisé via Stripe. Les prix sont chargés en direct depuis la configuration d’administration.",
    invoiceIncluded:"avec une facture pour vos archives.", buyCredits:"Acheter des Credits", goStripe:"Continuer vers Stripe...",
    historyTitle:"Historique des achats", historyText:"Vos dernières factures et notes de crédit pour vos achats de Credits.", loading:"Chargement",
    noPurchases:"Aucun achat pour le moment. Après votre premier achat de Credits, le document apparaîtra ici.", receiptsLoading:"Chargement des documents …",
    creditNote:"Note de crédit", package:"Pack", invoice:"Facture", sent:"Envoyée", created:"Créée", creating:"Création en cours", failed:"Échec", refunded:"Remboursée", partiallyRefunded:"Partiellement remboursée", unknown:"Inconnu",
    noReceiptNumber:"Sans numéro de document", sentLower:"envoyée", reference:"Référence", opening:"Ouverture …", openCreditNote:"Ouvrir la note de crédit", openInvoice:"Ouvrir la facture", showAllInvoices:"Afficher toutes les factures",
    loginRequired:"Veuillez d’abord vous connecter.", loginFirst:"Veuillez d’abord vous connecter.", pricesLoadFailed:"Les prix n’ont pas pu être chargés.",
    confirmBoth:"Veuillez confirmer les deux avis relatifs au début immédiat de l’exécution et au droit de rétractation.", unknownPack:"Ce pack de Credits est inconnu.", checkoutFailed:"Le paiement n’a pas pu être lancé.", checkoutUrlMissing:"L’URL Stripe Checkout est manquante.",
    pdfMissing:"Aucun PDF n’est encore associé à ce document.", downloadLinkFailed:"Le lien de téléchargement n’a pas pu être créé.", pdfOpenFailed:"Le PDF n’a pas pu être ouvert.",
    popular:"Populaire", packageFallback:"Pack",
    purchaseConfirmTitle:"Confirmer l’achat de Credits", purchaseConfirmText:"Vérifiez votre achat et confirmez les informations avant d’être redirigé vers Stripe.",
    totalTaxNote:"Prix total incluant la TVA légalement applicable, le cas échéant.",
    immediateConsent:"J’accepte expressément que mioseg qr commence l’exécution avant la fin du délai de rétractation et crédite immédiatement les Credits achetés sur mon compte après le paiement réussi.",
    withdrawalAcknowledgement:"Je reconnais que, lorsque les conditions légales sont remplies, mon droit de rétractation peut s’éteindre au début de l’exécution.",
    legalFinePrint:"Les confirmations sont documentées avec le processus d’achat. Les droits légaux restent inchangés.",
    cancel:"Annuler", redirectStripe:"Redirection vers Stripe …", agreeStripe:"Accepter et continuer vers Stripe"
  },
  es: {
    navLabel:"Navegación de Credits", dashboard:"Panel", myQrx:"Mis QR-X", invoices:"Facturas",
    heroTitle:"Gestionar Credits", heroText:"Controla tu saldo y compra nuevos Credits directamente mediante Stripe. Los Credits se utilizan para crear QR-X y para almacenamiento adicional. Los valores se gestionan de forma centralizada en el área de administración.",
    openInvoices:"Abrir facturas", backDashboard:"Volver al panel", statsLabel:"Estadísticas de Credits",
    currentCredits:"Credits actuales", qrxCreation:"Creación de QR-X", freeStorage:"Almacenamiento gratuito", packages:"Paquetes", payPerUse:"Pago por uso", launchLabel:"Lanzamiento",
    packagesTitle:"Paquetes de Credits", packagesText:"Elige un paquete e inicia el pago seguro mediante Stripe. Los precios se cargan en directo desde la configuración de administración.",
    invoiceIncluded:"incluye factura para tus archivos.", buyCredits:"Comprar Credits", goStripe:"Continuar a Stripe...",
    historyTitle:"Historial de compras", historyText:"Tus últimas facturas y notas de crédito de compras de Credits.", loading:"Cargando",
    noPurchases:"Aún no hay compras. Tras tu primera compra de Credits, el documento aparecerá aquí.", receiptsLoading:"Cargando documentos …",
    creditNote:"Nota de crédito", package:"Paquete", invoice:"Factura", sent:"Enviada", created:"Creada", creating:"Creándose", failed:"Fallida", refunded:"Reembolsada", partiallyRefunded:"Reembolso parcial", unknown:"Desconocido",
    noReceiptNumber:"Sin número de documento", sentLower:"enviada", reference:"Referencia", opening:"Abriendo …", openCreditNote:"Abrir nota de crédito", openInvoice:"Abrir factura", showAllInvoices:"Mostrar todas las facturas",
    loginRequired:"Inicia sesión primero.", loginFirst:"Inicia sesión primero.", pricesLoadFailed:"No se pudieron cargar los precios.",
    confirmBoth:"Confirma ambos avisos sobre el inicio inmediato de la prestación y el derecho de desistimiento.", unknownPack:"Este paquete de Credits no es conocido.", checkoutFailed:"No se pudo iniciar el pago.", checkoutUrlMissing:"Falta la URL de Stripe Checkout.",
    pdfMissing:"Este documento todavía no tiene un PDF asociado.", downloadLinkFailed:"No se pudo crear el enlace de descarga.", pdfOpenFailed:"No se pudo abrir el PDF.",
    popular:"Popular", packageFallback:"Paquete",
    purchaseConfirmTitle:"Confirmar compra de Credits", purchaseConfirmText:"Revisa tu compra y confirma los avisos antes de ser redirigido a Stripe.",
    totalTaxNote:"Precio total incluido el IVA legalmente aplicable, cuando corresponda.",
    immediateConsent:"Acepto expresamente que mioseg qr comience la prestación antes de que termine el plazo de desistimiento y que los Credits comprados se abonen en mi cuenta inmediatamente después del pago correcto.",
    withdrawalAcknowledgement:"Reconozco que, cuando se cumplan los requisitos legales, mi derecho de desistimiento puede extinguirse al comenzar la prestación.",
    legalFinePrint:"Las confirmaciones se documentan junto con el proceso de compra. Los derechos legales no se ven afectados.",
    cancel:"Cancelar", redirectStripe:"Redirigiendo a Stripe …", agreeStripe:"Aceptar y continuar a Stripe"
  },
  it: {
    navLabel:"Navigazione Credits", dashboard:"Dashboard", myQrx:"I miei QR-X", invoices:"Fatture",
    heroTitle:"Gestisci Credits", heroText:"Tieni sotto controllo il saldo e acquista nuovi Credits direttamente tramite Stripe. I Credits vengono utilizzati per creare QR-X e per spazio di archiviazione aggiuntivo. I valori sono gestiti centralmente nell’area amministrativa.",
    openInvoices:"Apri fatture", backDashboard:"Torna alla dashboard", statsLabel:"Statistiche Credits",
    currentCredits:"Credits attuali", qrxCreation:"Creazione QR-X", freeStorage:"Spazio gratuito", packages:"Pacchetti", payPerUse:"Pagamento a consumo", launchLabel:"Lancio",
    packagesTitle:"Pacchetti Credits", packagesText:"Scegli un pacchetto e avvia il checkout sicuro tramite Stripe. I prezzi vengono caricati in tempo reale dalla configurazione amministrativa.",
    invoiceIncluded:"fattura inclusa per i tuoi documenti.", buyCredits:"Acquista Credits", goStripe:"Continua su Stripe...",
    historyTitle:"Cronologia acquisti", historyText:"Le tue ultime fatture e note di credito per gli acquisti di Credits.", loading:"Caricamento",
    noPurchases:"Nessun acquisto ancora. Dopo il primo acquisto di Credits, il documento apparirà qui.", receiptsLoading:"Caricamento documenti …",
    creditNote:"Nota di credito", package:"Pacchetto", invoice:"Fattura", sent:"Inviata", created:"Creata", creating:"In creazione", failed:"Non riuscita", refunded:"Rimborsata", partiallyRefunded:"Parzialmente rimborsata", unknown:"Sconosciuto",
    noReceiptNumber:"Senza numero documento", sentLower:"inviata", reference:"Riferimento", opening:"Apertura …", openCreditNote:"Apri nota di credito", openInvoice:"Apri fattura", showAllInvoices:"Mostra tutte le fatture",
    loginRequired:"Accedi prima.", loginFirst:"Accedi prima.", pricesLoadFailed:"Impossibile caricare i prezzi.",
    confirmBoth:"Conferma entrambi gli avvisi sull’inizio immediato della prestazione e sul diritto di recesso.", unknownPack:"Questo pacchetto Credits non è noto.", checkoutFailed:"Impossibile avviare il checkout.", checkoutUrlMissing:"Manca l’URL di Stripe Checkout.",
    pdfMissing:"Non è ancora disponibile un PDF per questo documento.", downloadLinkFailed:"Impossibile creare il link di download.", pdfOpenFailed:"Impossibile aprire il PDF.",
    popular:"Popolare", packageFallback:"Pacchetto",
    purchaseConfirmTitle:"Conferma acquisto Credits", purchaseConfirmText:"Controlla l’acquisto e conferma gli avvisi prima di essere reindirizzato a Stripe.",
    totalTaxNote:"Prezzo totale comprensivo dell’IVA legalmente applicabile, se dovuta.",
    immediateConsent:"Acconsento espressamente che mioseg qr inizi la prestazione prima della scadenza del periodo di recesso e accrediti immediatamente i Credits acquistati sul mio account dopo il pagamento riuscito.",
    withdrawalAcknowledgement:"Sono consapevole che, se ricorrono i requisiti di legge, il mio diritto di recesso può estinguersi con l’inizio della prestazione.",
    legalFinePrint:"Le conferme vengono documentate insieme al processo di acquisto. I diritti di legge restano invariati.",
    cancel:"Annulla", redirectStripe:"Reindirizzamento a Stripe …", agreeStripe:"Accetta e continua su Stripe"
  },
};

function normalizeCreditLocale(value: string): CreditLocale {
  return (["de","en","tr","pl","ar","fr","es","it"] as const).includes(value as CreditLocale)
    ? (value as CreditLocale)
    : "de";
}

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function formatEuro(cents: number | null | undefined, currency = "EUR", locale: CreditLocale = "de") {
  const value = Number(cents ?? 0) / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "EUR",
  }).format(value);
}

function formatDate(value: string | null, locale: CreditLocale = "de") {
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

function getDocumentTypeLabel(invoice: InvoiceRow, ui: CreditCopy) {
  if (invoice.invoice_type === "credit_note") return ui.creditNote;
  return ui.invoice;
}

function getStatusLabel(status: string | null, ui: CreditCopy) {
  switch (status) {
    case "sent":
      return ui.sent;
    case "created":
      return ui.created;
    case "creating":
      return ui.creating;
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

function getPackBadge(pack: PricingPack, ui: CreditCopy) {
  const badge = pack.badge?.trim();
  if (badge) return badge;
  if (pack.id === "p10") return ui.launchLabel;
  if (pack.id === "p25") return ui.popular;
  if (pack.id === "p50") return "Pro";
  if (pack.id === "p100") return "Best Value";
  return ui.packageFallback;
}

export default function CreditsPage() {
  const params = useParams();
  const locale = getParam(params?.locale as string | string[] | undefined, "de");
  const creditLocale = normalizeCreditLocale(locale);
  const ui = CREDIT_TEXT[creditLocale];

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
        throw new Error(data?.error || ui.pricesLoadFailed);
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
      setErrorText(ui.loginRequired);
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
      { label: ui.currentCredits, value: credits, icon: "💳" },
      {
        label: ui.qrxCreation,
        value: `${Number(pricingConfig?.qrx_creation_credit_cost ?? 1)} Credit`,
        icon: "▣",
      },
      {
        label: ui.freeStorage,
        value: `${Number(pricingConfig?.free_storage_mb ?? 2)} MB`,
        icon: "☁️",
      },
      { label: ui.packages, value: pricingPacks.length, icon: "🛒" },
    ],
    [credits, pricingPacks.length, pricingConfig?.qrx_creation_credit_cost, pricingConfig?.free_storage_mb, ui]
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
      alert(ui.confirmBoth);
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
        alert(ui.loginFirst);
        return;
      }

      const packId = pack.id;

      if (!packId) {
        throw new Error(ui.unknownPack);
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
        throw new Error(result.error || ui.checkoutFailed);
      }

      if (!result.url) {
        throw new Error(ui.checkoutUrlMissing);
      }

      window.location.href = result.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : ui.checkoutFailed);
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function openInvoicePdf(invoice: InvoiceRow) {
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
      alert(error instanceof Error ? error.message : ui.pdfOpenFailed);
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

        <nav className={styles.nav} aria-label={ui.navLabel}>
          <Link href={`/${locale}/dashboard`}>{ui.dashboard}</Link>
          <Link href={`/${locale}/dashboard/qrx`}>{ui.myQrx}</Link>
          <Link href={`/${locale}/dashboard/invoices`}>{ui.invoices}</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Credits</span>
          <h1>{ui.heroTitle}</h1>
          <p>{ui.heroText}</p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/invoices`} className={styles.primaryButton}>
            {ui.openInvoices}
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
              <h2>{ui.packagesTitle}</h2>
              <p>{ui.packagesText}</p>
            </div>
            <span>{ui.payPerUse}</span>
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
                    {ui.launchLabel}
                  </span>
                  {getPackBadge(pack, ui) !== ui.launchLabel ? (
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
                      {getPackBadge(pack, ui)}
                    </span>
                  ) : null}
                </div>

                <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 30, fontWeight: 950 }}>
                  {pack.credits} Credits
                </h3>

                <p style={{ margin: "0 0 16px", color: "#94a3b8", lineHeight: 1.55 }}>
                  <strong style={{ color: "#ffffff", fontSize: 22 }}>
                    {formatEuro(getPackPriceCents(pack, pricingConfig), pricingConfig?.currency ?? "EUR", creditLocale)}
                  </strong>{" "}
                  {getPackRegularCents(pack) > getPackPriceCents(pack, pricingConfig) ? (
                    <span style={{ textDecoration: "line-through", opacity: 0.65 }}>
                      {formatEuro(getPackRegularCents(pack), pricingConfig?.currency ?? "EUR", creditLocale)}
                    </span>
                  ) : null}
                  <br />
                  {ui.invoiceIncluded}
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
                  {checkoutLoading === pack.id ? ui.goStripe : ui.buyCredits}
                </button>
              </div>
            );
            })}
          </div>
        </article>

        <aside style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{ui.historyTitle}</h2>
              <p>{ui.historyText}</p>
            </div>
            <span>{loading ? ui.loading : invoices.length}</span>
          </div>

          {errorText ? <div style={errorStyle}>{errorText}</div> : null}

          {!loading && invoices.length === 0 ? (
            <div style={emptyStateStyle}>
              {ui.noPurchases}
            </div>
          ) : null}

          {loading ? <div style={loadingStyle}>{ui.receiptsLoading}</div> : null}

          {!loading && invoices.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {invoices.map((invoice) => {
                const isCreditNote = invoice.invoice_type === "credit_note";
                const creditsFromBilling = getBillingNumber(invoice, "credits");
                const packId = getBillingText(invoice, "pack_id", isCreditNote ? ui.creditNote : ui.package);
                const amount = getDocumentAmount(invoice);
                const statusLabel = getStatusLabel(invoice.status, ui);

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
                        {getDocumentTypeLabel(invoice, ui)}
                      </span>

                      <span style={{ ...documentBadgeStyle, ...getStatusStyle(invoice.status) }}>
                        {statusLabel}
                      </span>
                    </div>

                    <strong style={{ display: "block", color: "#ffffff", marginTop: 8, marginBottom: 4 }}>
                      {invoice.invoice_number || ui.noReceiptNumber}
                    </strong>

                    <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850, lineHeight: 1.55 }}>
                      {creditsFromBilling > 0 ? `${creditsFromBilling} Credits` : packId}
                      {" · "}
                      {formatEuro(amount, invoice.currency ?? "EUR", creditLocale)}
                      <br />
                      {formatDate(invoice.created_at, creditLocale)}
                      {invoice.sent_at ? ` · ${ui.sentLower} ${formatDate(invoice.sent_at, creditLocale)}` : ""}
                      {invoice.original_invoice_number ? (
                        <>
                          <br />
                          {ui.reference}: {invoice.original_invoice_number}
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
                      {downloadingId === invoice.id ? ui.opening : isCreditNote ? ui.openCreditNote : ui.openInvoice}
                    </button>
                  </div>
                );
              })}

              <Link
                href={`/${locale}/dashboard/invoices`}
                className={styles.secondaryButton}
                style={{ textAlign: "center", justifyContent: "center" }}
              >
                {ui.showAllInvoices}
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
              {ui.purchaseConfirmTitle}
            </h2>

            <p style={withdrawalIntroStyle}>
              {ui.purchaseConfirmText}
            </p>

            <div style={withdrawalOrderBoxStyle}>
              <div style={withdrawalOrderRowStyle}>
                <span>{checkoutPack.credits} Credits</span>
                <strong>
                  {formatEuro(
                    getPackPriceCents(checkoutPack, pricingConfig),
                    pricingConfig?.currency ?? "EUR",
                    creditLocale,
                  )}
                </strong>
              </div>
              <div style={withdrawalTaxNoteStyle}>
                {ui.totalTaxNote}
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
                {ui.immediateConsent}
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
                {ui.withdrawalAcknowledgement}
              </span>
            </label>

            <p style={withdrawalFinePrintStyle}>
              {ui.legalFinePrint}
            </p>

            <div style={withdrawalButtonRowStyle}>
              <button
                type="button"
                onClick={closeCheckoutConfirmation}
                disabled={checkoutLoading === checkoutPack.id}
                style={withdrawalCancelButtonStyle}
              >
                {ui.cancel}
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
                {checkoutLoading === checkoutPack.id ? ui.redirectStripe : ui.agreeStripe}
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
