"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "../dashboard.module.css";

type ProfileRow = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  created_at?: string | null;

  first_name?: string | null;
  last_name?: string | null;
  street?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  company_name?: string | null;
  vat_id?: string | null;
  language?: string | null;
  account_type?: string | null;

  billing_email?: string | null;
  billing_company?: string | null;
  billing_name?: string | null;
  billing_street?: string | null;
  billing_postal_code?: string | null;
  billing_city?: string | null;
  billing_country_code?: string | null;
  billing_vat_id?: string | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  created_at: string | null;
  status: string | null;
  invoice_type: string | null;
  amount_cents: number | null;
  gross_amount_cents: number | null;
  currency: string | null;
  pdf_path: string | null;
  storage_bucket: string | null;
};

type SecurityInfo = {
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  provider: string;
  browser: string;
  platform: string;
};



type AccountLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

const ACCOUNT_LOCALE: Record<AccountLocale, string> = {
  de: "de-DE", en: "en-GB", tr: "tr-TR", pl: "pl-PL",
  ar: "ar", fr: "fr-FR", es: "es-ES", it: "it-IT",
};

const ACCOUNT_TEXT = {
  de: {
    navAccount: "Konto Navigation",
    dashboard: "Dashboard",
    myQrx: "Meine QR-X",
    credits: "Credits",
    account: "Konto",
    heroText: "Verwalte deine Kontodaten, Rechnungen und Sicherheit an einem Ort.",
    backDashboard: "Zurück zum Dashboard",
    signingOut: "Meldet ab …",
    signOut: "Abmelden",
    accountOverview: "Konto Übersicht",
    active: "Aktiv",
    accountStatus: "Konto-Status",
    creditSystem: "Credit-System",
    invoices: "Rechnungen",
    authLogin: "Supabase Login",
    accountSections: "Kontobereiche",
    overview: "Übersicht",
    profile: "Profil",
    security: "Sicherheit",
    accountData: "Kontodaten",
    accountDataText: "Diese Daten kommen direkt aus deiner Supabase-Anmeldung und dem Profil.",
    loading: "Lädt",
    live: "Live",
    loadingAccount: "Konto wird geladen …",
    displayName: "Name / Anzeige",
    email: "E-Mail",
    userId: "User-ID",
    registeredSince: "Registriert seit",
    editProfile: "Profil bearbeiten",
    editProfileText: "Diese Angaben werden für dein Konto, Support-Anfragen und spätere Profilfunktionen verwendet. Die Login-E-Mail bleibt in Supabase Auth.",
    firstName: "Vorname",
    lastName: "Nachname",
    accountType: "Kontotyp",
    privatePerson: "Privatperson",
    company: "Unternehmen",
    companyField: "Firma",
    optional: "Optional",
    street: "Straße und Hausnummer",
    postalCode: "PLZ",
    city: "Ort",
    country: "Land",
    language: "Sprache",
    vatId: "USt.-ID",
    vatPlaceholder: "Optional, z. B. DE123456789",
    saving: "Speichert …",
    saveProfile: "Profil speichern",
    profileSaved: "Profil gespeichert.",
    error: "Fehler",
    userFallback: "mioseg qr Nutzer",
  },
  en: {
    navAccount: "Account navigation",
    dashboard: "Dashboard",
    myQrx: "My QR-X",
    credits: "Credits",
    account: "Account",
    heroText: "Manage your account details, invoices and security in one place.",
    backDashboard: "Back to dashboard",
    signingOut: "Signing out …",
    signOut: "Sign out",
    accountOverview: "Account overview",
    active: "Active",
    accountStatus: "Account status",
    creditSystem: "Credit system",
    invoices: "Invoices",
    authLogin: "Supabase login",
    accountSections: "Account sections",
    overview: "Overview",
    profile: "Profile",
    security: "Security",
    accountData: "Account details",
    accountDataText: "This information comes directly from your Supabase sign-in and profile.",
    loading: "Loading",
    live: "Live",
    loadingAccount: "Loading account …",
    displayName: "Name / display",
    email: "Email",
    userId: "User ID",
    registeredSince: "Registered since",
    editProfile: "Edit profile",
    editProfileText: "These details are used for your account, support requests and future profile features. Your login email remains in Supabase Auth.",
    firstName: "First name",
    lastName: "Last name",
    accountType: "Account type",
    privatePerson: "Private individual",
    company: "Business",
    companyField: "Company",
    optional: "Optional",
    street: "Street and house number",
    postalCode: "Postal code",
    city: "City",
    country: "Country",
    language: "Language",
    vatId: "VAT ID",
    vatPlaceholder: "Optional, e.g. DE123456789",
    saving: "Saving …",
    saveProfile: "Save profile",
    profileSaved: "Profile saved.",
    error: "Error",
    userFallback: "mioseg qr user",
  },
  tr: {
    navAccount: "Hesap navigasyonu",
    dashboard: "Kontrol paneli",
    myQrx: "QR-X'lerim",
    credits: "Credits",
    account: "Hesap",
    heroText: "Hesap bilgilerini, faturaları ve güvenliği tek bir yerden yönet.",
    backDashboard: "Kontrol paneline dön",
    signingOut: "Çıkış yapılıyor …",
    signOut: "Çıkış yap",
    accountOverview: "Hesap özeti",
    active: "Aktif",
    accountStatus: "Hesap durumu",
    creditSystem: "Credit sistemi",
    invoices: "Faturalar",
    authLogin: "Supabase girişi",
    accountSections: "Hesap bölümleri",
    overview: "Genel bakış",
    profile: "Profil",
    security: "Güvenlik",
    accountData: "Hesap bilgileri",
    accountDataText: "Bu bilgiler doğrudan Supabase girişinden ve profilinden alınır.",
    loading: "Yükleniyor",
    live: "Canlı",
    loadingAccount: "Hesap yükleniyor …",
    displayName: "Ad / görünen ad",
    email: "E-posta",
    userId: "Kullanıcı kimliği",
    registeredSince: "Kayıt tarihi",
    editProfile: "Profili düzenle",
    editProfileText: "Bu bilgiler hesabın, destek taleplerin ve gelecekteki profil özellikleri için kullanılır. Giriş e-postan Supabase Auth'ta kalır.",
    firstName: "Ad",
    lastName: "Soyad",
    accountType: "Hesap türü",
    privatePerson: "Bireysel",
    company: "Şirket",
    companyField: "Firma",
    optional: "İsteğe bağlı",
    street: "Sokak ve bina numarası",
    postalCode: "Posta kodu",
    city: "Şehir",
    country: "Ülke",
    language: "Dil",
    vatId: "KDV No.",
    vatPlaceholder: "İsteğe bağlı, örn. DE123456789",
    saving: "Kaydediliyor …",
    saveProfile: "Profili kaydet",
    profileSaved: "Profil kaydedildi.",
    error: "Hata",
    userFallback: "mioseg qr kullanıcısı",
  },
  pl: {
    navAccount: "Nawigacja konta",
    dashboard: "Panel",
    myQrx: "Moje QR-X",
    credits: "Credits",
    account: "Konto",
    heroText: "Zarządzaj danymi konta, fakturami i bezpieczeństwem w jednym miejscu.",
    backDashboard: "Wróć do panelu",
    signingOut: "Wylogowywanie …",
    signOut: "Wyloguj",
    accountOverview: "Przegląd konta",
    active: "Aktywne",
    accountStatus: "Status konta",
    creditSystem: "System Credits",
    invoices: "Faktury",
    authLogin: "Logowanie Supabase",
    accountSections: "Sekcje konta",
    overview: "Przegląd",
    profile: "Profil",
    security: "Bezpieczeństwo",
    accountData: "Dane konta",
    accountDataText: "Te dane pochodzą bezpośrednio z logowania Supabase i Twojego profilu.",
    loading: "Ładowanie",
    live: "Aktywne",
    loadingAccount: "Ładowanie konta …",
    displayName: "Nazwa / wyświetlana nazwa",
    email: "E-mail",
    userId: "ID użytkownika",
    registeredSince: "Zarejestrowany od",
    editProfile: "Edytuj profil",
    editProfileText: "Te dane są używane dla konta, zgłoszeń do pomocy i przyszłych funkcji profilu. E-mail logowania pozostaje w Supabase Auth.",
    firstName: "Imię",
    lastName: "Nazwisko",
    accountType: "Typ konta",
    privatePerson: "Osoba prywatna",
    company: "Firma",
    companyField: "Firma",
    optional: "Opcjonalnie",
    street: "Ulica i numer domu",
    postalCode: "Kod pocztowy",
    city: "Miejscowość",
    country: "Kraj",
    language: "Język",
    vatId: "NIP UE",
    vatPlaceholder: "Opcjonalnie, np. DE123456789",
    saving: "Zapisywanie …",
    saveProfile: "Zapisz profil",
    profileSaved: "Profil zapisany.",
    error: "Błąd",
    userFallback: "użytkownik mioseg qr",
  },
  ar: {
    navAccount: "التنقل في الحساب",
    dashboard: "لوحة التحكم",
    myQrx: "QR-X الخاصة بي",
    credits: "Credits",
    account: "الحساب",
    heroText: "أدر بيانات حسابك وفواتيرك وإعدادات الأمان في مكان واحد.",
    backDashboard: "العودة إلى لوحة التحكم",
    signingOut: "جارٍ تسجيل الخروج …",
    signOut: "تسجيل الخروج",
    accountOverview: "نظرة عامة على الحساب",
    active: "نشط",
    accountStatus: "حالة الحساب",
    creditSystem: "نظام Credits",
    invoices: "الفواتير",
    authLogin: "تسجيل دخول Supabase",
    accountSections: "أقسام الحساب",
    overview: "نظرة عامة",
    profile: "الملف الشخصي",
    security: "الأمان",
    accountData: "بيانات الحساب",
    accountDataText: "تأتي هذه البيانات مباشرة من تسجيل الدخول في Supabase ومن ملفك الشخصي.",
    loading: "جارٍ التحميل",
    live: "مباشر",
    loadingAccount: "جارٍ تحميل الحساب …",
    displayName: "الاسم / اسم العرض",
    email: "البريد الإلكتروني",
    userId: "معرّف المستخدم",
    registeredSince: "مسجل منذ",
    editProfile: "تعديل الملف الشخصي",
    editProfileText: "تُستخدم هذه البيانات لحسابك وطلبات الدعم وميزات الملف الشخصي المستقبلية. يبقى بريد تسجيل الدخول في Supabase Auth.",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    accountType: "نوع الحساب",
    privatePerson: "فرد",
    company: "شركة",
    companyField: "الشركة",
    optional: "اختياري",
    street: "الشارع ورقم المنزل",
    postalCode: "الرمز البريدي",
    city: "المدينة",
    country: "الدولة",
    language: "اللغة",
    vatId: "رقم ضريبة القيمة المضافة",
    vatPlaceholder: "اختياري، مثال DE123456789",
    saving: "جارٍ الحفظ …",
    saveProfile: "حفظ الملف الشخصي",
    profileSaved: "تم حفظ الملف الشخصي.",
    error: "خطأ",
    userFallback: "مستخدم mioseg qr",
  },
  fr: {
    navAccount: "Navigation du compte",
    dashboard: "Tableau de bord",
    myQrx: "Mes QR-X",
    credits: "Credits",
    account: "Compte",
    heroText: "Gérez vos données de compte, vos factures et votre sécurité au même endroit.",
    backDashboard: "Retour au tableau de bord",
    signingOut: "Déconnexion …",
    signOut: "Se déconnecter",
    accountOverview: "Aperçu du compte",
    active: "Actif",
    accountStatus: "Statut du compte",
    creditSystem: "Système de Credits",
    invoices: "Factures",
    authLogin: "Connexion Supabase",
    accountSections: "Sections du compte",
    overview: "Aperçu",
    profile: "Profil",
    security: "Sécurité",
    accountData: "Données du compte",
    accountDataText: "Ces données proviennent directement de votre connexion Supabase et de votre profil.",
    loading: "Chargement",
    live: "En direct",
    loadingAccount: "Chargement du compte …",
    displayName: "Nom / affichage",
    email: "E-mail",
    userId: "ID utilisateur",
    registeredSince: "Inscrit depuis",
    editProfile: "Modifier le profil",
    editProfileText: "Ces informations sont utilisées pour votre compte, les demandes d’assistance et les futures fonctions de profil. L’e-mail de connexion reste dans Supabase Auth.",
    firstName: "Prénom",
    lastName: "Nom",
    accountType: "Type de compte",
    privatePerson: "Particulier",
    company: "Entreprise",
    companyField: "Entreprise",
    optional: "Facultatif",
    street: "Rue et numéro",
    postalCode: "Code postal",
    city: "Ville",
    country: "Pays",
    language: "Langue",
    vatId: "N° TVA",
    vatPlaceholder: "Facultatif, p. ex. DE123456789",
    saving: "Enregistrement …",
    saveProfile: "Enregistrer le profil",
    profileSaved: "Profil enregistré.",
    error: "Erreur",
    userFallback: "utilisateur mioseg qr",
  },
  es: {
    navAccount: "Navegación de la cuenta",
    dashboard: "Panel",
    myQrx: "Mis QR-X",
    credits: "Credits",
    account: "Cuenta",
    heroText: "Gestiona los datos de tu cuenta, facturas y seguridad en un solo lugar.",
    backDashboard: "Volver al panel",
    signingOut: "Cerrando sesión …",
    signOut: "Cerrar sesión",
    accountOverview: "Resumen de la cuenta",
    active: "Activa",
    accountStatus: "Estado de la cuenta",
    creditSystem: "Sistema de Credits",
    invoices: "Facturas",
    authLogin: "Inicio de sesión Supabase",
    accountSections: "Secciones de la cuenta",
    overview: "Resumen",
    profile: "Perfil",
    security: "Seguridad",
    accountData: "Datos de la cuenta",
    accountDataText: "Estos datos proceden directamente de tu inicio de sesión en Supabase y de tu perfil.",
    loading: "Cargando",
    live: "En vivo",
    loadingAccount: "Cargando cuenta …",
    displayName: "Nombre / visualización",
    email: "Correo electrónico",
    userId: "ID de usuario",
    registeredSince: "Registrado desde",
    editProfile: "Editar perfil",
    editProfileText: "Estos datos se utilizan para tu cuenta, solicitudes de soporte y futuras funciones del perfil. El correo de inicio de sesión permanece en Supabase Auth.",
    firstName: "Nombre",
    lastName: "Apellidos",
    accountType: "Tipo de cuenta",
    privatePerson: "Particular",
    company: "Empresa",
    companyField: "Empresa",
    optional: "Opcional",
    street: "Calle y número",
    postalCode: "Código postal",
    city: "Ciudad",
    country: "País",
    language: "Idioma",
    vatId: "N.º IVA",
    vatPlaceholder: "Opcional, p. ej. DE123456789",
    saving: "Guardando …",
    saveProfile: "Guardar perfil",
    profileSaved: "Perfil guardado.",
    error: "Error",
    userFallback: "usuario de mioseg qr",
  },
  it: {
    navAccount: "Navigazione account",
    dashboard: "Dashboard",
    myQrx: "I miei QR-X",
    credits: "Credits",
    account: "Account",
    heroText: "Gestisci dati dell’account, fatture e sicurezza in un unico posto.",
    backDashboard: "Torna alla dashboard",
    signingOut: "Disconnessione …",
    signOut: "Disconnetti",
    accountOverview: "Panoramica account",
    active: "Attivo",
    accountStatus: "Stato account",
    creditSystem: "Sistema Credits",
    invoices: "Fatture",
    authLogin: "Accesso Supabase",
    accountSections: "Sezioni account",
    overview: "Panoramica",
    profile: "Profilo",
    security: "Sicurezza",
    accountData: "Dati account",
    accountDataText: "Questi dati provengono direttamente dall’accesso Supabase e dal tuo profilo.",
    loading: "Caricamento",
    live: "Live",
    loadingAccount: "Caricamento account …",
    displayName: "Nome / visualizzazione",
    email: "E-mail",
    userId: "ID utente",
    registeredSince: "Registrato dal",
    editProfile: "Modifica profilo",
    editProfileText: "Questi dati vengono utilizzati per l’account, le richieste di assistenza e le future funzioni del profilo. L’e-mail di accesso rimane in Supabase Auth.",
    firstName: "Nome",
    lastName: "Cognome",
    accountType: "Tipo di account",
    privatePerson: "Privato",
    company: "Azienda",
    companyField: "Azienda",
    optional: "Facoltativo",
    street: "Via e numero civico",
    postalCode: "CAP",
    city: "Città",
    country: "Paese",
    language: "Lingua",
    vatId: "P. IVA",
    vatPlaceholder: "Facoltativo, es. DE123456789",
    saving: "Salvataggio …",
    saveProfile: "Salva profilo",
    profileSaved: "Profilo salvato.",
    error: "Errore",
    userFallback: "utente mioseg qr",
  },
} as const;

const ACCOUNT_BILLING_TEXT = {
  de: {
    billingData: "Rechnungsdaten",
    billingText: "Diese Daten werden für Rechnungen, PDF-Erstellung und den automatischen E-Mail-Versand nach Credit-Käufen verwendet.",
    billingBadge: "Rechnung",
    contactName: "Ansprechpartner / Name",
    billingEmail: "Rechnungs-E-Mail",
    saveBilling: "Rechnungsdaten speichern",
    billingSaved: "Rechnungsdaten gespeichert.",
    myInvoices: "Meine Rechnungen",
    myInvoicesText: "Hier findest du deine Rechnungen für Credit-Käufe und kannst verfügbare PDF-Dateien sicher herunterladen.",
    noInvoices: "Keine Rechnungen",
    oneInvoice: "1 Rechnung",
    invoiceCount: "{{count}} Rechnungen",
    loadingInvoices: "Rechnungen werden geladen …",
    noInvoicesYet: "Noch keine Rechnungen",
    noInvoicesText: "Nach jedem erfolgreichen Credit-Kauf wird deine Rechnung automatisch erstellt und hier dauerhaft gespeichert.",
    pdfDownload: "PDF herunterladen",
    invoiceNumber: "Rechnungsnummer",
    paymentDate: "Zahlungsdatum",
    amountStatus: "Betrag und Status",
    pdfUnavailable: "PDF nicht verfügbar",
    invoiceDownloadFailed: "Die Rechnung konnte nicht heruntergeladen werden.",
    invoiceFileFallback: "Rechnung",
    statusSent: "Versendet",
    statusCreated: "Erstellt",
    statusCreating: "Wird erstellt",
    statusFailed: "Fehlgeschlagen",
    statusRefunded: "Erstattet",
    statusUnknown: "Unbekannt",
  },
  en: {
    billingData: "Billing details",
    billingText: "These details are used for invoices, PDF generation and automatic email delivery after Credit purchases.",
    billingBadge: "Billing",
    contactName: "Contact person / Name",
    billingEmail: "Billing email",
    saveBilling: "Save billing details",
    billingSaved: "Billing details saved.",
    myInvoices: "My invoices",
    myInvoicesText: "Here you can find your invoices for Credit purchases and securely download available PDF files.",
    noInvoices: "No invoices",
    oneInvoice: "1 invoice",
    invoiceCount: "{{count}} invoices",
    loadingInvoices: "Loading invoices …",
    noInvoicesYet: "No invoices yet",
    noInvoicesText: "After each successful Credit purchase, your invoice is created automatically and stored here permanently.",
    pdfDownload: "Download PDF",
    invoiceNumber: "Invoice number",
    paymentDate: "Payment date",
    amountStatus: "Amount and status",
    pdfUnavailable: "PDF unavailable",
    invoiceDownloadFailed: "The invoice could not be downloaded.",
    invoiceFileFallback: "Invoice",
    statusSent: "Sent",
    statusCreated: "Created",
    statusCreating: "Creating",
    statusFailed: "Failed",
    statusRefunded: "Refunded",
    statusUnknown: "Unknown",
  },
  tr: {
    billingData: "Fatura bilgileri",
    billingText: "Bu bilgiler faturalar, PDF oluşturma ve Credit satın alımlarından sonra otomatik e-posta gönderimi için kullanılır.",
    billingBadge: "Fatura",
    contactName: "Yetkili kişi / Ad",
    billingEmail: "Fatura e-postası",
    saveBilling: "Fatura bilgilerini kaydet",
    billingSaved: "Fatura bilgileri kaydedildi.",
    myInvoices: "Faturalarım",
    myInvoicesText: "Credit satın alımlarına ait faturalarını burada bulabilir ve mevcut PDF dosyalarını güvenle indirebilirsin.",
    noInvoices: "Fatura yok",
    oneInvoice: "1 fatura",
    invoiceCount: "{{count}} fatura",
    loadingInvoices: "Faturalar yükleniyor …",
    noInvoicesYet: "Henüz fatura yok",
    noInvoicesText: "Her başarılı Credit satın alımından sonra faturan otomatik olarak oluşturulur ve burada kalıcı olarak saklanır.",
    pdfDownload: "PDF indir",
    invoiceNumber: "Fatura numarası",
    paymentDate: "Ödeme tarihi",
    amountStatus: "Tutar ve durum",
    pdfUnavailable: "PDF mevcut değil",
    invoiceDownloadFailed: "Fatura indirilemedi.",
    invoiceFileFallback: "Fatura",
    statusSent: "Gönderildi",
    statusCreated: "Oluşturuldu",
    statusCreating: "Oluşturuluyor",
    statusFailed: "Başarısız",
    statusRefunded: "İade edildi",
    statusUnknown: "Bilinmiyor",
  },
  pl: {
    billingData: "Dane do faktury",
    billingText: "Dane te są używane do faktur, tworzenia plików PDF i automatycznej wysyłki e-mail po zakupach Credits.",
    billingBadge: "Faktura",
    contactName: "Osoba kontaktowa / Nazwa",
    billingEmail: "E-mail do faktur",
    saveBilling: "Zapisz dane do faktury",
    billingSaved: "Dane do faktury zapisano.",
    myInvoices: "Moje faktury",
    myInvoicesText: "Tutaj znajdziesz faktury za zakupy Credits i bezpiecznie pobierzesz dostępne pliki PDF.",
    noInvoices: "Brak faktur",
    oneInvoice: "1 faktura",
    invoiceCount: "{{count}} faktur",
    loadingInvoices: "Ładowanie faktur …",
    noInvoicesYet: "Brak faktur",
    noInvoicesText: "Po każdym udanym zakupie Credits faktura jest tworzona automatycznie i trwale zapisywana tutaj.",
    pdfDownload: "Pobierz PDF",
    invoiceNumber: "Numer faktury",
    paymentDate: "Data płatności",
    amountStatus: "Kwota i status",
    pdfUnavailable: "PDF niedostępny",
    invoiceDownloadFailed: "Nie udało się pobrać faktury.",
    invoiceFileFallback: "Faktura",
    statusSent: "Wysłano",
    statusCreated: "Utworzono",
    statusCreating: "Tworzenie",
    statusFailed: "Niepowodzenie",
    statusRefunded: "Zwrócono",
    statusUnknown: "Nieznany",
  },
  ar: {
    billingData: "بيانات الفوترة",
    billingText: "تُستخدم هذه البيانات للفواتير وإنشاء ملفات PDF والإرسال التلقائي للبريد الإلكتروني بعد شراء Credits.",
    billingBadge: "الفاتورة",
    contactName: "جهة الاتصال / الاسم",
    billingEmail: "بريد الفوترة",
    saveBilling: "حفظ بيانات الفوترة",
    billingSaved: "تم حفظ بيانات الفوترة.",
    myInvoices: "فواتيري",
    myInvoicesText: "هنا يمكنك العثور على فواتير مشتريات Credits وتنزيل ملفات PDF المتاحة بأمان.",
    noInvoices: "لا توجد فواتير",
    oneInvoice: "فاتورة واحدة",
    invoiceCount: "{{count}} فواتير",
    loadingInvoices: "جارٍ تحميل الفواتير …",
    noInvoicesYet: "لا توجد فواتير بعد",
    noInvoicesText: "بعد كل عملية شراء ناجحة لـ Credits، يتم إنشاء فاتورتك تلقائيًا وحفظها هنا بشكل دائم.",
    pdfDownload: "تنزيل PDF",
    invoiceNumber: "رقم الفاتورة",
    paymentDate: "تاريخ الدفع",
    amountStatus: "المبلغ والحالة",
    pdfUnavailable: "ملف PDF غير متاح",
    invoiceDownloadFailed: "تعذر تنزيل الفاتورة.",
    invoiceFileFallback: "فاتورة",
    statusSent: "تم الإرسال",
    statusCreated: "تم الإنشاء",
    statusCreating: "جارٍ الإنشاء",
    statusFailed: "فشل",
    statusRefunded: "تم رد المبلغ",
    statusUnknown: "غير معروف",
  },
  fr: {
    billingData: "Données de facturation",
    billingText: "Ces données sont utilisées pour les factures, la création des PDF et l’envoi automatique d’e-mails après les achats de Credits.",
    billingBadge: "Facture",
    contactName: "Contact / Nom",
    billingEmail: "E-mail de facturation",
    saveBilling: "Enregistrer les données de facturation",
    billingSaved: "Données de facturation enregistrées.",
    myInvoices: "Mes factures",
    myInvoicesText: "Vous trouverez ici vos factures pour les achats de Credits et pourrez télécharger les PDF disponibles en toute sécurité.",
    noInvoices: "Aucune facture",
    oneInvoice: "1 facture",
    invoiceCount: "{{count}} factures",
    loadingInvoices: "Chargement des factures …",
    noInvoicesYet: "Aucune facture pour le moment",
    noInvoicesText: "Après chaque achat de Credits réussi, votre facture est créée automatiquement et conservée ici.",
    pdfDownload: "Télécharger le PDF",
    invoiceNumber: "Numéro de facture",
    paymentDate: "Date de paiement",
    amountStatus: "Montant et statut",
    pdfUnavailable: "PDF indisponible",
    invoiceDownloadFailed: "La facture n’a pas pu être téléchargée.",
    invoiceFileFallback: "Facture",
    statusSent: "Envoyée",
    statusCreated: "Créée",
    statusCreating: "Création en cours",
    statusFailed: "Échec",
    statusRefunded: "Remboursée",
    statusUnknown: "Inconnu",
  },
  es: {
    billingData: "Datos de facturación",
    billingText: "Estos datos se utilizan para facturas, creación de PDF y envío automático de correos tras compras de Credits.",
    billingBadge: "Factura",
    contactName: "Persona de contacto / Nombre",
    billingEmail: "Correo de facturación",
    saveBilling: "Guardar datos de facturación",
    billingSaved: "Datos de facturación guardados.",
    myInvoices: "Mis facturas",
    myInvoicesText: "Aquí encontrarás tus facturas de compras de Credits y podrás descargar de forma segura los PDF disponibles.",
    noInvoices: "Sin facturas",
    oneInvoice: "1 factura",
    invoiceCount: "{{count}} facturas",
    loadingInvoices: "Cargando facturas …",
    noInvoicesYet: "Todavía no hay facturas",
    noInvoicesText: "Después de cada compra de Credits realizada con éxito, tu factura se crea automáticamente y se guarda aquí de forma permanente.",
    pdfDownload: "Descargar PDF",
    invoiceNumber: "Número de factura",
    paymentDate: "Fecha de pago",
    amountStatus: "Importe y estado",
    pdfUnavailable: "PDF no disponible",
    invoiceDownloadFailed: "No se pudo descargar la factura.",
    invoiceFileFallback: "Factura",
    statusSent: "Enviada",
    statusCreated: "Creada",
    statusCreating: "Creando",
    statusFailed: "Fallida",
    statusRefunded: "Reembolsada",
    statusUnknown: "Desconocido",
  },
  it: {
    billingData: "Dati di fatturazione",
    billingText: "Questi dati vengono utilizzati per fatture, creazione dei PDF e invio automatico di e-mail dopo gli acquisti di Credits.",
    billingBadge: "Fattura",
    contactName: "Referente / Nome",
    billingEmail: "E-mail di fatturazione",
    saveBilling: "Salva dati di fatturazione",
    billingSaved: "Dati di fatturazione salvati.",
    myInvoices: "Le mie fatture",
    myInvoicesText: "Qui trovi le fatture degli acquisti di Credits e puoi scaricare in sicurezza i PDF disponibili.",
    noInvoices: "Nessuna fattura",
    oneInvoice: "1 fattura",
    invoiceCount: "{{count}} fatture",
    loadingInvoices: "Caricamento fatture …",
    noInvoicesYet: "Ancora nessuna fattura",
    noInvoicesText: "Dopo ogni acquisto di Credits completato con successo, la fattura viene creata automaticamente e salvata qui in modo permanente.",
    pdfDownload: "Scarica PDF",
    invoiceNumber: "Numero fattura",
    paymentDate: "Data di pagamento",
    amountStatus: "Importo e stato",
    pdfUnavailable: "PDF non disponibile",
    invoiceDownloadFailed: "Impossibile scaricare la fattura.",
    invoiceFileFallback: "Fattura",
    statusSent: "Inviata",
    statusCreated: "Creata",
    statusCreating: "Creazione in corso",
    statusFailed: "Non riuscita",
    statusRefunded: "Rimborsata",
    statusUnknown: "Sconosciuto",
  },
} as const;

const ACCOUNT_SECURITY_TEXT = {
  de: {
    securityTitle: "Sicherheit",
    securityText: "Prüfe deine aktuelle Anmeldung und ändere bei Bedarf dein Passwort.",
    secure: "Sicher",
    loginEmail: "Login-E-Mail",
    confirmedOn: "Bestätigt am",
    emailNotConfirmed: "E-Mail noch nicht bestätigt",
    loginProvider: "Login-Provider",
    supabaseEmail: "Supabase E-Mail",
    authActive: "Authentifizierung aktiv",
    thisDevice: "Dieses Gerät",
    currentBrowserSession: "Aktuelle Browsersitzung",
    lastLogin: "Letzte Anmeldung",
    reportedBySupabase: "Von Supabase Auth gemeldet",
    password: "Passwort",
    passwordHint: "Verwende mindestens acht Zeichen, Groß- und Kleinbuchstaben sowie eine Zahl.",
    changePassword: "Passwort ändern",
    deleteAccount: "Konto dauerhaft löschen",
    deleteAccountText: "Diese Aktion kann nicht rückgängig gemacht werden. Deine Kontodaten, Credits und Zugänge werden entfernt; eigene QR-X werden deaktiviert.",
    enableDelete: "Ich möchte die dauerhafte Kontolöschung freischalten.",
    deletePrompt: "Zur Bestätigung bitte KONTO LÖSCHEN eingeben",
    deletePhrase: "KONTO LÖSCHEN",
    deletingAccount: "Konto wird gelöscht …",
    deleteConfirmError: "Bitte bestätige die Löschung mit Checkbox und dem Text KONTO LÖSCHEN.",
    deleteConfirmDialog: "Möchtest du dein Konto wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    deleteFailed: "Konto konnte nicht gelöscht werden.",
    sessionExpired: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
    signInFirst: "Bitte melde dich zuerst an.",
    securityKicker: "SICHERHEIT",
    closeWindow: "Fenster schließen",
    currentPassword: "Aktuelles Passwort",
    newPassword: "Neues Passwort",
    repeatPassword: "Neues Passwort wiederholen",
    ruleLength: "Mindestens 8 Zeichen",
    ruleUpper: "Mindestens ein Großbuchstabe",
    ruleLower: "Mindestens ein Kleinbuchstabe",
    ruleNumber: "Mindestens eine Zahl",
    cancel: "Abbrechen",
    changing: "Wird geändert …",
    savePassword: "Passwort speichern",
    passwordChanged: "Passwort erfolgreich geändert.",
    noEmail: "Für dieses Konto ist keine E-Mail-Adresse verfügbar.",
    enterCurrentPassword: "Bitte gib dein aktuelles Passwort ein.",
    passwordMismatch: "Die neuen Passwörter stimmen nicht überein.",
    passwordDifferent: "Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.",
    currentPasswordWrong: "Das aktuelle Passwort ist nicht korrekt.",
    passwordChangeFailed: "Das Passwort konnte nicht geändert werden.",
    passwordTooShort: "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
    passwordNeedsUpper: "Das neue Passwort muss mindestens einen Großbuchstaben enthalten.",
    passwordNeedsLower: "Das neue Passwort muss mindestens einen Kleinbuchstaben enthalten.",
    passwordNeedsNumber: "Das neue Passwort muss mindestens eine Zahl enthalten.",
    unknownBrowser: "Unbekannter Browser",
    unknownDevice: "Unbekanntes Gerät",
  },
  en: {
    securityTitle: "Security",
    securityText: "Check your current sign-in and change your password if needed.",
    secure: "Secure",
    loginEmail: "Login email",
    confirmedOn: "Confirmed on",
    emailNotConfirmed: "Email not yet confirmed",
    loginProvider: "Login provider",
    supabaseEmail: "Supabase email",
    authActive: "Authentication active",
    thisDevice: "This device",
    currentBrowserSession: "Current browser session",
    lastLogin: "Last sign-in",
    reportedBySupabase: "Reported by Supabase Auth",
    password: "Password",
    passwordHint: "Use at least eight characters, upper- and lowercase letters and a number.",
    changePassword: "Change password",
    deleteAccount: "Permanently delete account",
    deleteAccountText: "This action cannot be undone. Your account data, Credits and access will be removed; your own QR-X will be disabled.",
    enableDelete: "I want to enable permanent account deletion.",
    deletePrompt: "To confirm, enter DELETE ACCOUNT",
    deletePhrase: "DELETE ACCOUNT",
    deletingAccount: "Deleting account …",
    deleteConfirmError: "Please confirm deletion with the checkbox and the text DELETE ACCOUNT.",
    deleteConfirmDialog: "Do you really want to permanently delete your account? This action cannot be undone.",
    deleteFailed: "The account could not be deleted.",
    sessionExpired: "Your session has expired. Please sign in again.",
    signInFirst: "Please sign in first.",
    securityKicker: "SECURITY",
    closeWindow: "Close window",
    currentPassword: "Current password",
    newPassword: "New password",
    repeatPassword: "Repeat new password",
    ruleLength: "At least 8 characters",
    ruleUpper: "At least one uppercase letter",
    ruleLower: "At least one lowercase letter",
    ruleNumber: "At least one number",
    cancel: "Cancel",
    changing: "Changing …",
    savePassword: "Save password",
    passwordChanged: "Password changed successfully.",
    noEmail: "No email address is available for this account.",
    enterCurrentPassword: "Please enter your current password.",
    passwordMismatch: "The new passwords do not match.",
    passwordDifferent: "The new password must be different from the current password.",
    currentPasswordWrong: "The current password is incorrect.",
    passwordChangeFailed: "The password could not be changed.",
    passwordTooShort: "The new password must be at least 8 characters long.",
    passwordNeedsUpper: "The new password must contain at least one uppercase letter.",
    passwordNeedsLower: "The new password must contain at least one lowercase letter.",
    passwordNeedsNumber: "The new password must contain at least one number.",
    unknownBrowser: "Unknown browser",
    unknownDevice: "Unknown device",
  },
  tr: {
    securityTitle: "Güvenlik",
    securityText: "Mevcut oturumunu kontrol et ve gerekirse şifreni değiştir.",
    secure: "Güvenli",
    loginEmail: "Giriş e-postası",
    confirmedOn: "Onay tarihi",
    emailNotConfirmed: "E-posta henüz doğrulanmadı",
    loginProvider: "Giriş sağlayıcısı",
    supabaseEmail: "Supabase e-posta",
    authActive: "Kimlik doğrulama aktif",
    thisDevice: "Bu cihaz",
    currentBrowserSession: "Mevcut tarayıcı oturumu",
    lastLogin: "Son giriş",
    reportedBySupabase: "Supabase Auth tarafından bildirildi",
    password: "Şifre",
    passwordHint: "En az sekiz karakter, büyük ve küçük harf ile bir sayı kullan.",
    changePassword: "Şifreyi değiştir",
    deleteAccount: "Hesabı kalıcı olarak sil",
    deleteAccountText: "Bu işlem geri alınamaz. Hesap verilerin, Credits ve erişimlerin kaldırılır; kendi QR-X'lerin devre dışı bırakılır.",
    enableDelete: "Kalıcı hesap silmeyi etkinleştirmek istiyorum.",
    deletePrompt: "Onaylamak için HESABI SİL yaz",
    deletePhrase: "HESABI SİL",
    deletingAccount: "Hesap siliniyor …",
    deleteConfirmError: "Lütfen kutuyu işaretleyip HESABI SİL yazarak silme işlemini onayla.",
    deleteConfirmDialog: "Hesabını gerçekten kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.",
    deleteFailed: "Hesap silinemedi.",
    sessionExpired: "Oturumunun süresi doldu. Lütfen tekrar giriş yap.",
    signInFirst: "Lütfen önce giriş yap.",
    securityKicker: "GÜVENLİK",
    closeWindow: "Pencereyi kapat",
    currentPassword: "Mevcut şifre",
    newPassword: "Yeni şifre",
    repeatPassword: "Yeni şifreyi tekrarla",
    ruleLength: "En az 8 karakter",
    ruleUpper: "En az bir büyük harf",
    ruleLower: "En az bir küçük harf",
    ruleNumber: "En az bir sayı",
    cancel: "İptal",
    changing: "Değiştiriliyor …",
    savePassword: "Şifreyi kaydet",
    passwordChanged: "Şifre başarıyla değiştirildi.",
    noEmail: "Bu hesap için e-posta adresi mevcut değil.",
    enterCurrentPassword: "Lütfen mevcut şifreni gir.",
    passwordMismatch: "Yeni şifreler eşleşmiyor.",
    passwordDifferent: "Yeni şifre mevcut şifreden farklı olmalıdır.",
    currentPasswordWrong: "Mevcut şifre yanlış.",
    passwordChangeFailed: "Şifre değiştirilemedi.",
    passwordTooShort: "Yeni şifre en az 8 karakter olmalıdır.",
    passwordNeedsUpper: "Yeni şifre en az bir büyük harf içermelidir.",
    passwordNeedsLower: "Yeni şifre en az bir küçük harf içermelidir.",
    passwordNeedsNumber: "Yeni şifre en az bir sayı içermelidir.",
    unknownBrowser: "Bilinmeyen tarayıcı",
    unknownDevice: "Bilinmeyen cihaz",
  },
  pl: {
    securityTitle: "Bezpieczeństwo",
    securityText: "Sprawdź bieżące logowanie i w razie potrzeby zmień hasło.",
    secure: "Bezpieczne",
    loginEmail: "E-mail logowania",
    confirmedOn: "Potwierdzono",
    emailNotConfirmed: "E-mail nie został jeszcze potwierdzony",
    loginProvider: "Dostawca logowania",
    supabaseEmail: "E-mail Supabase",
    authActive: "Uwierzytelnianie aktywne",
    thisDevice: "To urządzenie",
    currentBrowserSession: "Bieżąca sesja przeglądarki",
    lastLogin: "Ostatnie logowanie",
    reportedBySupabase: "Zgłoszone przez Supabase Auth",
    password: "Hasło",
    passwordHint: "Użyj co najmniej ośmiu znaków, wielkich i małych liter oraz cyfry.",
    changePassword: "Zmień hasło",
    deleteAccount: "Trwale usuń konto",
    deleteAccountText: "Tej operacji nie można cofnąć. Dane konta, Credits i dostępy zostaną usunięte; własne QR-X zostaną wyłączone.",
    enableDelete: "Chcę włączyć trwałe usunięcie konta.",
    deletePrompt: "Aby potwierdzić, wpisz USUŃ KONTO",
    deletePhrase: "USUŃ KONTO",
    deletingAccount: "Usuwanie konta …",
    deleteConfirmError: "Potwierdź usunięcie zaznaczając pole i wpisując USUŃ KONTO.",
    deleteConfirmDialog: "Czy na pewno chcesz trwale usunąć konto? Tej operacji nie można cofnąć.",
    deleteFailed: "Nie udało się usunąć konta.",
    sessionExpired: "Sesja wygasła. Zaloguj się ponownie.",
    signInFirst: "Najpierw się zaloguj.",
    securityKicker: "BEZPIECZEŃSTWO",
    closeWindow: "Zamknij okno",
    currentPassword: "Aktualne hasło",
    newPassword: "Nowe hasło",
    repeatPassword: "Powtórz nowe hasło",
    ruleLength: "Co najmniej 8 znaków",
    ruleUpper: "Co najmniej jedna wielka litera",
    ruleLower: "Co najmniej jedna mała litera",
    ruleNumber: "Co najmniej jedna cyfra",
    cancel: "Anuluj",
    changing: "Zmiana …",
    savePassword: "Zapisz hasło",
    passwordChanged: "Hasło zostało zmienione.",
    noEmail: "Dla tego konta nie ma dostępnego adresu e-mail.",
    enterCurrentPassword: "Wpisz aktualne hasło.",
    passwordMismatch: "Nowe hasła nie są zgodne.",
    passwordDifferent: "Nowe hasło musi różnić się od aktualnego.",
    currentPasswordWrong: "Aktualne hasło jest nieprawidłowe.",
    passwordChangeFailed: "Nie udało się zmienić hasła.",
    passwordTooShort: "Nowe hasło musi mieć co najmniej 8 znaków.",
    passwordNeedsUpper: "Nowe hasło musi zawierać co najmniej jedną wielką literę.",
    passwordNeedsLower: "Nowe hasło musi zawierać co najmniej jedną małą literę.",
    passwordNeedsNumber: "Nowe hasło musi zawierać co najmniej jedną cyfrę.",
    unknownBrowser: "Nieznana przeglądarka",
    unknownDevice: "Nieznane urządzenie",
  },
  ar: {
    securityTitle: "الأمان",
    securityText: "تحقق من تسجيل الدخول الحالي وغيّر كلمة المرور عند الحاجة.",
    secure: "آمن",
    loginEmail: "بريد تسجيل الدخول",
    confirmedOn: "تم التأكيد في",
    emailNotConfirmed: "لم يتم تأكيد البريد بعد",
    loginProvider: "موفر تسجيل الدخول",
    supabaseEmail: "بريد Supabase",
    authActive: "المصادقة مفعلة",
    thisDevice: "هذا الجهاز",
    currentBrowserSession: "جلسة المتصفح الحالية",
    lastLogin: "آخر تسجيل دخول",
    reportedBySupabase: "تم الإبلاغ بواسطة Supabase Auth",
    password: "كلمة المرور",
    passwordHint: "استخدم ثمانية أحرف على الأقل، مع أحرف كبيرة وصغيرة ورقم.",
    changePassword: "تغيير كلمة المرور",
    deleteAccount: "حذف الحساب نهائيًا",
    deleteAccountText: "لا يمكن التراجع عن هذا الإجراء. ستتم إزالة بيانات حسابك وCredits ووسائل الوصول؛ وسيتم تعطيل QR-X الخاصة بك.",
    enableDelete: "أريد تفعيل الحذف الدائم للحساب.",
    deletePrompt: "للتأكيد، اكتب حذف الحساب",
    deletePhrase: "حذف الحساب",
    deletingAccount: "جارٍ حذف الحساب …",
    deleteConfirmError: "يرجى تأكيد الحذف بتحديد المربع وكتابة حذف الحساب.",
    deleteConfirmDialog: "هل تريد حقًا حذف حسابك نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.",
    deleteFailed: "تعذر حذف الحساب.",
    sessionExpired: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    signInFirst: "يرجى تسجيل الدخول أولًا.",
    securityKicker: "الأمان",
    closeWindow: "إغلاق النافذة",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    repeatPassword: "تكرار كلمة المرور الجديدة",
    ruleLength: "8 أحرف على الأقل",
    ruleUpper: "حرف كبير واحد على الأقل",
    ruleLower: "حرف صغير واحد على الأقل",
    ruleNumber: "رقم واحد على الأقل",
    cancel: "إلغاء",
    changing: "جارٍ التغيير …",
    savePassword: "حفظ كلمة المرور",
    passwordChanged: "تم تغيير كلمة المرور بنجاح.",
    noEmail: "لا يوجد عنوان بريد إلكتروني متاح لهذا الحساب.",
    enterCurrentPassword: "يرجى إدخال كلمة المرور الحالية.",
    passwordMismatch: "كلمتا المرور الجديدتان غير متطابقتين.",
    passwordDifferent: "يجب أن تختلف كلمة المرور الجديدة عن الحالية.",
    currentPasswordWrong: "كلمة المرور الحالية غير صحيحة.",
    passwordChangeFailed: "تعذر تغيير كلمة المرور.",
    passwordTooShort: "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.",
    passwordNeedsUpper: "يجب أن تحتوي كلمة المرور الجديدة على حرف كبير واحد على الأقل.",
    passwordNeedsLower: "يجب أن تحتوي كلمة المرور الجديدة على حرف صغير واحد على الأقل.",
    passwordNeedsNumber: "يجب أن تحتوي كلمة المرور الجديدة على رقم واحد على الأقل.",
    unknownBrowser: "متصفح غير معروف",
    unknownDevice: "جهاز غير معروف",
  },
  fr: {
    securityTitle: "Sécurité",
    securityText: "Vérifiez votre connexion actuelle et modifiez votre mot de passe si nécessaire.",
    secure: "Sécurisé",
    loginEmail: "E-mail de connexion",
    confirmedOn: "Confirmé le",
    emailNotConfirmed: "E-mail pas encore confirmé",
    loginProvider: "Fournisseur de connexion",
    supabaseEmail: "E-mail Supabase",
    authActive: "Authentification active",
    thisDevice: "Cet appareil",
    currentBrowserSession: "Session de navigateur actuelle",
    lastLogin: "Dernière connexion",
    reportedBySupabase: "Signalé par Supabase Auth",
    password: "Mot de passe",
    passwordHint: "Utilisez au moins huit caractères, des majuscules, des minuscules et un chiffre.",
    changePassword: "Modifier le mot de passe",
    deleteAccount: "Supprimer définitivement le compte",
    deleteAccountText: "Cette action est irréversible. Vos données de compte, Credits et accès seront supprimés ; vos propres QR-X seront désactivés.",
    enableDelete: "Je souhaite activer la suppression définitive du compte.",
    deletePrompt: "Pour confirmer, saisissez SUPPRIMER LE COMPTE",
    deletePhrase: "SUPPRIMER LE COMPTE",
    deletingAccount: "Suppression du compte …",
    deleteConfirmError: "Confirmez la suppression en cochant la case et en saisissant SUPPRIMER LE COMPTE.",
    deleteConfirmDialog: "Voulez-vous vraiment supprimer définitivement votre compte ? Cette action est irréversible.",
    deleteFailed: "Le compte n’a pas pu être supprimé.",
    sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
    signInFirst: "Veuillez d’abord vous connecter.",
    securityKicker: "SÉCURITÉ",
    closeWindow: "Fermer la fenêtre",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    repeatPassword: "Répéter le nouveau mot de passe",
    ruleLength: "Au moins 8 caractères",
    ruleUpper: "Au moins une majuscule",
    ruleLower: "Au moins une minuscule",
    ruleNumber: "Au moins un chiffre",
    cancel: "Annuler",
    changing: "Modification …",
    savePassword: "Enregistrer le mot de passe",
    passwordChanged: "Mot de passe modifié avec succès.",
    noEmail: "Aucune adresse e-mail n’est disponible pour ce compte.",
    enterCurrentPassword: "Saisissez votre mot de passe actuel.",
    passwordMismatch: "Les nouveaux mots de passe ne correspondent pas.",
    passwordDifferent: "Le nouveau mot de passe doit être différent du mot de passe actuel.",
    currentPasswordWrong: "Le mot de passe actuel est incorrect.",
    passwordChangeFailed: "Le mot de passe n’a pas pu être modifié.",
    passwordTooShort: "Le nouveau mot de passe doit comporter au moins 8 caractères.",
    passwordNeedsUpper: "Le nouveau mot de passe doit contenir au moins une majuscule.",
    passwordNeedsLower: "Le nouveau mot de passe doit contenir au moins une minuscule.",
    passwordNeedsNumber: "Le nouveau mot de passe doit contenir au moins un chiffre.",
    unknownBrowser: "Navigateur inconnu",
    unknownDevice: "Appareil inconnu",
  },
  es: {
    securityTitle: "Seguridad",
    securityText: "Comprueba tu inicio de sesión actual y cambia la contraseña si es necesario.",
    secure: "Seguro",
    loginEmail: "Correo de acceso",
    confirmedOn: "Confirmado el",
    emailNotConfirmed: "Correo todavía no confirmado",
    loginProvider: "Proveedor de acceso",
    supabaseEmail: "Correo de Supabase",
    authActive: "Autenticación activa",
    thisDevice: "Este dispositivo",
    currentBrowserSession: "Sesión actual del navegador",
    lastLogin: "Último acceso",
    reportedBySupabase: "Informado por Supabase Auth",
    password: "Contraseña",
    passwordHint: "Utiliza al menos ocho caracteres, mayúsculas, minúsculas y un número.",
    changePassword: "Cambiar contraseña",
    deleteAccount: "Eliminar cuenta permanentemente",
    deleteAccountText: "Esta acción no se puede deshacer. Se eliminarán los datos de tu cuenta, Credits y accesos; tus propios QR-X se desactivarán.",
    enableDelete: "Quiero habilitar la eliminación permanente de la cuenta.",
    deletePrompt: "Para confirmar, escribe ELIMINAR CUENTA",
    deletePhrase: "ELIMINAR CUENTA",
    deletingAccount: "Eliminando cuenta …",
    deleteConfirmError: "Confirma la eliminación marcando la casilla y escribiendo ELIMINAR CUENTA.",
    deleteConfirmDialog: "¿Realmente quieres eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.",
    deleteFailed: "No se pudo eliminar la cuenta.",
    sessionExpired: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    signInFirst: "Inicia sesión primero.",
    securityKicker: "SEGURIDAD",
    closeWindow: "Cerrar ventana",
    currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña",
    repeatPassword: "Repetir nueva contraseña",
    ruleLength: "Al menos 8 caracteres",
    ruleUpper: "Al menos una mayúscula",
    ruleLower: "Al menos una minúscula",
    ruleNumber: "Al menos un número",
    cancel: "Cancelar",
    changing: "Cambiando …",
    savePassword: "Guardar contraseña",
    passwordChanged: "Contraseña cambiada correctamente.",
    noEmail: "No hay ninguna dirección de correo disponible para esta cuenta.",
    enterCurrentPassword: "Introduce tu contraseña actual.",
    passwordMismatch: "Las nuevas contraseñas no coinciden.",
    passwordDifferent: "La nueva contraseña debe ser diferente de la actual.",
    currentPasswordWrong: "La contraseña actual no es correcta.",
    passwordChangeFailed: "No se pudo cambiar la contraseña.",
    passwordTooShort: "La nueva contraseña debe tener al menos 8 caracteres.",
    passwordNeedsUpper: "La nueva contraseña debe contener al menos una mayúscula.",
    passwordNeedsLower: "La nueva contraseña debe contener al menos una minúscula.",
    passwordNeedsNumber: "La nueva contraseña debe contener al menos un número.",
    unknownBrowser: "Navegador desconocido",
    unknownDevice: "Dispositivo desconocido",
  },
  it: {
    securityTitle: "Sicurezza",
    securityText: "Controlla l’accesso attuale e modifica la password se necessario.",
    secure: "Sicuro",
    loginEmail: "E-mail di accesso",
    confirmedOn: "Confermata il",
    emailNotConfirmed: "E-mail non ancora confermata",
    loginProvider: "Provider di accesso",
    supabaseEmail: "E-mail Supabase",
    authActive: "Autenticazione attiva",
    thisDevice: "Questo dispositivo",
    currentBrowserSession: "Sessione browser corrente",
    lastLogin: "Ultimo accesso",
    reportedBySupabase: "Segnalato da Supabase Auth",
    password: "Password",
    passwordHint: "Usa almeno otto caratteri, lettere maiuscole e minuscole e un numero.",
    changePassword: "Cambia password",
    deleteAccount: "Elimina definitivamente l’account",
    deleteAccountText: "Questa azione non può essere annullata. I dati dell’account, i Credits e gli accessi verranno rimossi; i tuoi QR-X saranno disattivati.",
    enableDelete: "Voglio abilitare l’eliminazione permanente dell’account.",
    deletePrompt: "Per confermare, inserisci ELIMINA ACCOUNT",
    deletePhrase: "ELIMINA ACCOUNT",
    deletingAccount: "Eliminazione account …",
    deleteConfirmError: "Conferma l’eliminazione selezionando la casella e inserendo ELIMINA ACCOUNT.",
    deleteConfirmDialog: "Vuoi davvero eliminare definitivamente il tuo account? Questa azione non può essere annullata.",
    deleteFailed: "Impossibile eliminare l’account.",
    sessionExpired: "La sessione è scaduta. Accedi di nuovo.",
    signInFirst: "Accedi prima di continuare.",
    securityKicker: "SICUREZZA",
    closeWindow: "Chiudi finestra",
    currentPassword: "Password attuale",
    newPassword: "Nuova password",
    repeatPassword: "Ripeti nuova password",
    ruleLength: "Almeno 8 caratteri",
    ruleUpper: "Almeno una lettera maiuscola",
    ruleLower: "Almeno una lettera minuscola",
    ruleNumber: "Almeno un numero",
    cancel: "Annulla",
    changing: "Modifica …",
    savePassword: "Salva password",
    passwordChanged: "Password modificata con successo.",
    noEmail: "Nessun indirizzo e-mail disponibile per questo account.",
    enterCurrentPassword: "Inserisci la password attuale.",
    passwordMismatch: "Le nuove password non corrispondono.",
    passwordDifferent: "La nuova password deve essere diversa da quella attuale.",
    currentPasswordWrong: "La password attuale non è corretta.",
    passwordChangeFailed: "Impossibile modificare la password.",
    passwordTooShort: "La nuova password deve contenere almeno 8 caratteri.",
    passwordNeedsUpper: "La nuova password deve contenere almeno una lettera maiuscola.",
    passwordNeedsLower: "La nuova password deve contenere almeno una lettera minuscola.",
    passwordNeedsNumber: "La nuova password deve contenere almeno un numero.",
    unknownBrowser: "Browser sconosciuto",
    unknownDevice: "Dispositivo sconosciuto",
  },
} as const;

function normalizeAccountLocale(value: string): AccountLocale {
  const normalized = value.trim().toLowerCase().split(/[-_]/)[0];
  return (["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const).includes(
    normalized as AccountLocale,
  )
    ? (normalized as AccountLocale)
    : "de";
}

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim())
    return value[0];
  return fallback;
}

function formatDate(
  value: string | null | undefined,
  locale: AccountLocale = "de",
) {
  if (!value) return "–";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat(ACCOUNT_LOCALE[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}


function formatMoney(
  cents: number | null | undefined,
  currency: string | null | undefined,
  locale: AccountLocale = "de",
) {
  const value = Number(cents ?? 0);
  const safeValue = Number.isFinite(value) ? value / 100 : 0;
  return new Intl.NumberFormat(ACCOUNT_LOCALE[locale], {
    style: "currency",
    currency: (currency || "EUR").toUpperCase(),
  }).format(safeValue);
}

function getInvoiceStatusLabel(
  status: string | null | undefined,
  locale: AccountLocale = "de",
) {
  const text = ACCOUNT_BILLING_TEXT[locale];
  if (status === "sent") return text.statusSent;
  if (status === "created") return text.statusCreated;
  if (status === "creating") return text.statusCreating;
  if (status === "failed") return text.statusFailed;
  if (status === "refunded") return text.statusRefunded;
  return status?.trim() || text.statusUnknown;
}

function getInvoiceStatusStyle(status: string | null | undefined): React.CSSProperties {
  const success = status === "sent" || status === "created";
  const failed = status === "failed";
  const refunded = status === "refunded";

  return {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 28,
    borderRadius: 999,
    padding: "0 10px",
    background: failed
      ? "rgba(239,68,68,0.14)"
      : refunded
        ? "rgba(245,158,11,0.14)"
        : success
          ? "rgba(34,197,94,0.14)"
          : "rgba(59,130,246,0.14)",
    border: failed
      ? "1px solid rgba(252,165,165,0.22)"
      : refunded
        ? "1px solid rgba(253,230,138,0.2)"
        : success
          ? "1px solid rgba(134,239,172,0.22)"
          : "1px solid rgba(147,197,253,0.2)",
    color: failed
      ? "#fecaca"
      : refunded
        ? "#fde68a"
        : success
          ? "#bbf7d0"
          : "#bfdbfe",
    fontSize: 11,
    fontWeight: 900,
  };
}


function formatDateTime(
  value: string | null | undefined,
  locale: AccountLocale = "de",
) {
  if (!value) return "–";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat(ACCOUNT_LOCALE[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getBrowserName(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/OPR\//i.test(userAgent)) return "Opera";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Chrome\//i.test(userAgent)) return "Google Chrome";
  if (/Safari\//i.test(userAgent)) return "Safari";
  return "Unbekannter Browser";
}

function getPlatformName(platform: string, userAgent: string) {
  if (/Windows/i.test(platform) || /Windows/i.test(userAgent)) return "Windows";
  if (/Mac/i.test(platform) || /Macintosh/i.test(userAgent)) return "macOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Linux/i.test(platform) || /Linux/i.test(userAgent)) return "Linux";
  return platform || "Unbekanntes Gerät";
}

function validateNewPassword(
  value: string,
  locale: AccountLocale = "de",
) {
  const text = ACCOUNT_SECURITY_TEXT[locale];
  if (value.length < 8) return text.passwordTooShort;
  if (!/[A-ZÄÖÜ]/.test(value)) return text.passwordNeedsUpper;
  if (!/[a-zäöüß]/.test(value)) return text.passwordNeedsLower;
  if (!/[0-9]/.test(value)) return text.passwordNeedsNumber;
  return null;
}

function normalizeCountryCode(value: string) {
  return value.trim().toUpperCase().slice(0, 2) || "DE";
}

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();

  const locale = getParam(
    params?.locale as string | string[] | undefined,
    "de",
  );

  const accountLocale = normalizeAccountLocale(locale);
  const ui = ACCOUNT_TEXT[accountLocale];
  const billingUi = ACCOUNT_BILLING_TEXT[accountLocale];
  const securityUi = ACCOUNT_SECURITY_TEXT[accountLocale];

  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "billing" | "security">("overview");

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("DE");
  const [companyName, setCompanyName] = useState("");
  const [vatId, setVatId] = useState("");
  const [language, setLanguage] = useState("de");
  const [accountType, setAccountType] = useState("private");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [billingEmail, setBillingEmail] = useState("");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCountryCode, setBillingCountryCode] = useState("DE");
  const [billingVatId, setBillingVatId] = useState("");

  const [savingBilling, setSavingBilling] = useState(false);
  const [billingMessage, setBillingMessage] = useState("");

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  const [securityInfo, setSecurityInfo] = useState<SecurityInfo>({
    lastSignInAt: null,
    emailConfirmedAt: null,
    provider: "E-Mail",
    browser: "",
    platform: "",
  });
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    void loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    setErrorText(null);
    setBillingMessage("");
    setProfileMessage("");
    setInvoiceError(null);
    setLoadingInvoices(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorText(userError.message);
      setLoading(false);
      setLoadingInvoices(false);
      return;
    }

    if (!user) {
      setErrorText(securityUi.signInFirst);
      setLoading(false);
      setLoadingInvoices(false);
      return;
    }

    setUserId(user.id);
    setEmail(user.email ?? "");
    setCreatedAt(user.created_at ?? null);

    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";
    const platform =
      typeof navigator !== "undefined" ? navigator.platform : "";

    setSecurityInfo({
      lastSignInAt: user.last_sign_in_at ?? null,
      emailConfirmedAt: user.email_confirmed_at ?? null,
      provider:
        typeof user.app_metadata?.provider === "string"
          ? user.app_metadata.provider
          : "email",
      browser: getBrowserName(userAgent) === "Unbekannter Browser" ? securityUi.unknownBrowser : getBrowserName(userAgent),
      platform: getPlatformName(platform, userAgent) === "Unbekanntes Gerät" ? securityUi.unknownDevice : getPlatformName(platform, userAgent),
    });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.warn("Profile konnte nicht geladen werden:", error.message);
    }

    const { data: invoiceRows, error: invoicesError } = await supabase
      .from("qrx_invoices")
      .select(
        "id,invoice_number,created_at,status,invoice_type,amount_cents,gross_amount_cents,currency,pdf_path,storage_bucket",
      )
      .eq("user_id", user.id)
      .eq("invoice_type", "invoice")
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<InvoiceRow[]>();

    if (invoicesError) {
      console.warn("Rechnungen konnten nicht geladen werden:", invoicesError.message);
      setInvoices([]);
      setInvoiceError(invoicesError.message);
    } else {
      setInvoices(invoiceRows ?? []);
    }

    setLoadingInvoices(false);

    const profileData = (data ?? { id: user.id }) as ProfileRow;

    setProfile(profileData);
    setFirstName(profileData.first_name ?? "");
    setLastName(profileData.last_name ?? "");
    setStreet(profileData.street ?? "");
    setPostalCode(profileData.postal_code ?? "");
    setCity(profileData.city ?? "");
    setCountry(profileData.country ?? "DE");
    setCompanyName(profileData.company_name ?? "");
    setVatId(profileData.vat_id ?? "");
    setLanguage(profileData.language ?? "de");
    setAccountType(profileData.account_type ?? "private");
    setBillingEmail(profileData.billing_email ?? user.email ?? "");
    setBillingCompany(profileData.billing_company ?? "");
    setBillingName(profileData.billing_name ?? "");
    setBillingStreet(profileData.billing_street ?? "");
    setBillingPostalCode(profileData.billing_postal_code ?? "");
    setBillingCity(profileData.billing_city ?? "");
    setBillingCountryCode(profileData.billing_country_code ?? "DE");
    setBillingVatId(profileData.billing_vat_id ?? "");
    setLoading(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    setErrorText(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorText(error.message);
      setSigningOut(false);
      return;
    }

    router.push(`/${locale}/login`);
  }

  async function handleDeleteAccount() {
    if (deletingAccount) return;

    setErrorText(null);
    setDeleteMessage("");

    if (!deleteChecked || deleteConfirm !== securityUi.deletePhrase) {
      setDeleteMessage(
        "Bitte bestätige die Löschung mit Checkbox und dem Text KONTO LÖSCHEN.",
      );
      return;
    }

    const reallyDelete = window.confirm(
      "Möchtest du dein Konto wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    );

    if (!reallyDelete) return;

    setDeletingAccount(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error(
          "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
        );
      }

      const { data, error } = await supabase.functions.invoke(
        "delete-account",
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      );

      if (error) throw error;

      const response = data as {
        ok?: boolean;
        error?: string;
        details?: string;
        step?: string;
      } | null;

      if (response && response.ok === false) {
        throw new Error(
          response.details ||
            response.error ||
            response.step ||
            "Konto konnte nicht gelöscht werden.",
        );
      }

      await supabase.auth.signOut();
      router.replace(`/${locale}/login`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Konto konnte nicht gelöscht werden.";
      setDeleteMessage(message);
      setDeletingAccount(false);
    }
  }

  async function handleDownloadInvoice(invoice: InvoiceRow) {
    if (downloadingInvoiceId) return;

    setDownloadingInvoiceId(invoice.id);
    setInvoiceError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
      }

      const response = await fetch("/api/account/invoices/download", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || billingUi.invoiceDownloadFailed);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${invoice.invoice_number || billingUi.invoiceFileFallback}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setInvoiceError(
        error instanceof Error
          ? error.message
          : billingUi.invoiceDownloadFailed,
      );
    } finally {
      setDownloadingInvoiceId(null);
    }
  }

  function closePasswordModal() {
    if (changingPassword) return;

    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setRepeatPassword("");
    setPasswordMessage("");
  }

  async function handleChangePassword() {
    if (changingPassword) return;

    setPasswordMessage("");

    if (!email) {
      setPasswordMessage("Für dieses Konto ist keine E-Mail-Adresse verfügbar.");
      return;
    }

    if (!currentPassword) {
      setPasswordMessage("Bitte gib dein aktuelles Passwort ein.");
      return;
    }

    const passwordError = validateNewPassword(newPassword, accountLocale);
    if (passwordError) {
      setPasswordMessage(passwordError);
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordMessage("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage(
        "Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.",
      );
      return;
    }

    setChangingPassword(true);

    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (reauthError) {
        throw new Error("Das aktuelle Passwort ist nicht korrekt.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setPasswordMessage("Passwort erfolgreich geändert.");

      window.setTimeout(() => {
        setPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setRepeatPassword("");
        setPasswordMessage("");
      }, 1400);
    } catch (error) {
      setPasswordMessage(
        error instanceof Error
          ? error.message
          : "Das Passwort konnte nicht geändert werden.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function saveProfile() {
    if (!userId) return;

    setSavingProfile(true);
    setProfileMessage("");

    const payload = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      street: street.trim() || null,
      postal_code: postalCode.trim() || null,
      city: city.trim() || null,
      country: normalizeCountryCode(country),
      company_name: companyName.trim() || null,
      vat_id: vatId.trim() || null,
      language: language.trim() || "de",
      account_type: accountType.trim() || "private",
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          ...payload,
        },
        { onConflict: "id" },
      );

    if (error) {
      setProfileMessage(`${ui.error}: ${error.message}`);
    } else {
      setProfileMessage(ui.profileSaved);
      await loadAccount();

      if (language !== locale) {
        router.replace(`/${language}/dashboard/account`);
      }
    }

    setSavingProfile(false);
  }

  async function saveBillingData() {
    if (!userId) return;

    setSavingBilling(true);
    setBillingMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        billing_email: billingEmail.trim() || null,
        billing_company: billingCompany.trim() || null,
        billing_name: billingName.trim() || null,
        billing_street: billingStreet.trim() || null,
        billing_postal_code: billingPostalCode.trim() || null,
        billing_city: billingCity.trim() || null,
        billing_country_code: normalizeCountryCode(billingCountryCode),
        billing_vat_id: billingVatId.trim() || null,
      })
      .eq("id", userId);

    if (error) {
      setBillingMessage(`${ui.error}: ${error.message}`);
    } else {
      setBillingMessage(billingUi.billingSaved);
      await loadAccount();
    }

    setSavingBilling(false);
  }

  const displayName =
    `${firstName} ${lastName}`.trim() ||
    companyName.trim() ||
    profile?.display_name?.trim() ||
    profile?.full_name?.trim() ||
    billingName.trim() ||
    email ||
    ui.userFallback;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label={ui.navAccount}>
          <Link href={`/${locale}/dashboard`}>{ui.dashboard}</Link>
          <Link href={`/${locale}/dashboard/qrx`}>{ui.myQrx}</Link>
          <Link href={`/${locale}/dashboard/credits`}>{ui.credits}</Link>
        </nav>
      </header>

      <div className="mioseg-account-page-content">
      <section
        className={styles.hero}
        style={{
          minHeight: 0,
          paddingTop: 24,
          paddingBottom: 24,
        }}
      >
        <div>
          <span className={styles.kicker}>{ui.account}</span>
          <h1 style={{ marginBottom: 10 }}>{ui.account}</h1>
          <p style={{ maxWidth: 760 }}>
            {ui.heroText}
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link
            href={`/${locale}/dashboard`}
            className={styles.secondaryButton}
          >
            {ui.backDashboard}
          </Link>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className={styles.primaryButton}
            style={{
              border: 0,
              cursor: signingOut ? "not-allowed" : "pointer",
              opacity: signingOut ? 0.72 : 1,
            }}
          >
            {signingOut ? ui.signingOut : ui.signOut}
          </button>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label={ui.accountOverview}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>👤</div>
          <div>
            <div className={styles.statValue}>{loading ? "…" : ui.active}</div>
            <div className={styles.statLabel}>{ui.accountStatus}</div>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>💳</div>
          <div>
            <div className={styles.statValue}>Pay</div>
            <div className={styles.statLabel}>{ui.creditSystem}</div>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>🧾</div>
          <div>
            <div className={styles.statValue}>{loadingInvoices ? "…" : invoices.length}</div>
            <div className={styles.statLabel}>{ui.invoices}</div>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>🔐</div>
          <div>
            <div className={styles.statValue}>Auth</div>
            <div className={styles.statLabel}>{ui.authLogin}</div>
          </div>
        </article>
      </section>

      <nav className="mioseg-account-tabs" aria-label={ui.accountSections}>
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={activeTab === "overview" ? "is-active" : ""}
        >
          <span>◉</span>
          {ui.overview}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={activeTab === "profile" ? "is-active" : ""}
        >
          <span>👤</span>
          {ui.profile}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={activeTab === "billing" ? "is-active" : ""}
        >
          <span>🧾</span>
          {ui.invoices}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={activeTab === "security" ? "is-active" : ""}
        >
          <span>🔐</span>
          {ui.security}
        </button>
      </nav>


      <section
        className="mioseg-account-content"
        style={{
          width: "100%",
          display: "grid",
          gap: 18,
          boxSizing: "border-box",
        }}
      >
        {activeTab === "overview" ? (
          <>
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{ui.accountData}</h2>
              <p>
                {ui.accountDataText}
              </p>
            </div>
            <span>{loading ? ui.loading : ui.live}</span>
          </div>

          {errorText ? <div style={errorStyle}>{errorText}</div> : null}

          {loading ? (
            <div
              style={{
                minHeight: 220,
                display: "grid",
                placeItems: "center",
                color: "#cbd5e1",
                fontWeight: 950,
              }}
            >
              {ui.loadingAccount}
            </div>
          ) : null}

          {!loading && !errorText ? (
            <div style={{ display: "grid", gap: 12 }}>
              <InfoRow label={ui.displayName} value={displayName} />
              <InfoRow label={ui.email} value={email || "–"} />
              <InfoRow label={ui.userId} value={userId || "–"} monospace />
              <InfoRow label={ui.registeredSince} value={formatDate(createdAt, accountLocale)} />
            </div>
          ) : null}
        </article>
          </>
        ) : null}

        {activeTab === "profile" ? (
          <>
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{ui.editProfile}</h2>
              <p>
                {ui.editProfileText}
              </p>
            </div>
            <span>{ui.profile}</span>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div className="mioseg-account-grid-2">
              <label style={labelStyle}>
                {ui.firstName}
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder={ui.firstName}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                {ui.lastName}
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder={ui.lastName}
                  style={inputStyle}
                />
              </label>
            </div>

            <label style={labelStyle}>
              {ui.accountType}
              <select
                value={accountType}
                onChange={(event) => setAccountType(event.target.value)}
                style={selectStyle}
              >
                <option value="private" style={optionStyle}>{ui.privatePerson}</option>
                <option value="business" style={optionStyle}>{ui.company}</option>
              </select>
            </label>

            <label style={labelStyle}>
              {ui.companyField}
              <input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder={ui.optional}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              {ui.street}
              <input
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder={ui.street}
                style={inputStyle}
              />
            </label>

            <div className="mioseg-account-grid-postal">
              <label style={labelStyle}>
                {ui.postalCode}
                <input
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  placeholder={ui.postalCode}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                {ui.city}
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder={ui.city}
                  style={inputStyle}
                />
              </label>
            </div>

            <div className="mioseg-account-grid-2">
              <label style={labelStyle}>
                {ui.country}
                <input
                  value={country}
                  onChange={(event) =>
                    setCountry(normalizeCountryCode(event.target.value))
                  }
                  placeholder="DE"
                  maxLength={2}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                {ui.language}
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  style={selectStyle}
                >
                  <option value="de" style={optionStyle}>Deutsch</option>
                  <option value="en" style={optionStyle}>English</option>
                  <option value="tr" style={optionStyle}>Türkçe</option>
                  <option value="pl" style={optionStyle}>Polski</option>
                  <option value="ar" style={optionStyle}>العربية</option>
                  <option value="fr" style={optionStyle}>Français</option>
                  <option value="es" style={optionStyle}>Español</option>
                  <option value="it" style={optionStyle}>Italiano</option>
                </select>
              </label>
            </div>

            <label style={labelStyle}>
              {ui.vatId}
              <input
                value={vatId}
                onChange={(event) => setVatId(event.target.value)}
                placeholder={ui.vatPlaceholder}
                style={inputStyle}
              />
            </label>

            {profileMessage ? (
              <div
                style={{
                  borderRadius: 16,
                  padding: "12px 14px",
                  background: profileMessage.startsWith(`${ui.error}:`)
                    ? "rgba(239, 68, 68, 0.14)"
                    : "rgba(34, 197, 94, 0.14)",
                  border: profileMessage.startsWith(`${ui.error}:`)
                    ? "1px solid rgba(252, 165, 165, 0.22)"
                    : "1px solid rgba(134, 239, 172, 0.22)",
                  color: profileMessage.startsWith(`${ui.error}:`)
                    ? "#fecaca"
                    : "#bbf7d0",
                  fontWeight: 850,
                }}
              >
                {profileMessage}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={savingProfile}
              className={styles.primaryButton}
              style={{
                border: 0,
                cursor: savingProfile ? "not-allowed" : "pointer",
                opacity: savingProfile ? 0.72 : 1,
              }}
            >
              {savingProfile ? ui.saving : ui.saveProfile}
            </button>
          </div>
        </article>
          </>
        ) : null}

        {activeTab === "billing" ? (
          <>
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{billingUi.billingData}</h2>
              <p>
                {billingUi.billingText}
              </p>
            </div>
            <span>{billingUi.billingBadge}</span>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <label style={labelStyle}>
              {ui.companyField}
              <input
                value={billingCompany}
                onChange={(event) => setBillingCompany(event.target.value)}
                placeholder={ui.companyField}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              {billingUi.contactName}
              <input
                value={billingName}
                onChange={(event) => setBillingName(event.target.value)}
                placeholder="Max Mustermann"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              {billingUi.billingEmail}
              <input
                value={billingEmail}
                onChange={(event) => setBillingEmail(event.target.value)}
                placeholder="rechnung@example.com"
                style={inputStyle}
                type="email"
              />
            </label>

            <label style={labelStyle}>
              {ui.street}
              <input
                value={billingStreet}
                onChange={(event) => setBillingStreet(event.target.value)}
                placeholder="Musterstraße 1"
                style={inputStyle}
              />
            </label>

            <div className="mioseg-account-grid-postal">
              <label style={labelStyle}>
                {ui.postalCode}
                <input
                  value={billingPostalCode}
                  onChange={(event) => setBillingPostalCode(event.target.value)}
                  placeholder="52511"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                {ui.city}
                <input
                  value={billingCity}
                  onChange={(event) => setBillingCity(event.target.value)}
                  placeholder="Geilenkirchen"
                  style={inputStyle}
                />
              </label>
            </div>

            <label style={labelStyle}>
              {ui.country}
              <input
                value={billingCountryCode}
                onChange={(event) =>
                  setBillingCountryCode(
                    normalizeCountryCode(event.target.value),
                  )
                }
                placeholder="DE"
                maxLength={2}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              {ui.vatId}
              <input
                value={billingVatId}
                onChange={(event) => setBillingVatId(event.target.value)}
                placeholder={ui.vatPlaceholder}
                style={inputStyle}
              />
            </label>

            {billingMessage ? (
              <div
                style={{
                  borderRadius: 16,
                  padding: "12px 14px",
                  background: billingMessage.startsWith(`${ui.error}:`)
                    ? "rgba(239, 68, 68, 0.14)"
                    : "rgba(34, 197, 94, 0.14)",
                  border: billingMessage.startsWith(`${ui.error}:`)
                    ? "1px solid rgba(252, 165, 165, 0.22)"
                    : "1px solid rgba(134, 239, 172, 0.22)",
                  color: billingMessage.startsWith(`${ui.error}:`)
                    ? "#fecaca"
                    : "#bbf7d0",
                  fontWeight: 850,
                }}
              >
                {billingMessage}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void saveBillingData()}
              disabled={savingBilling}
              className={styles.primaryButton}
              style={{
                border: 0,
                cursor: savingBilling ? "not-allowed" : "pointer",
                opacity: savingBilling ? 0.72 : 1,
              }}
            >
              {savingBilling ? ui.saving : billingUi.saveBilling}
            </button>
          </div>
        </article>

        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{billingUi.myInvoices}</h2>
              <p>
                {billingUi.myInvoicesText}
              </p>
            </div>
            <span>
              {loadingInvoices
                ? ui.loading
                : invoices.length === 0
                  ? billingUi.noInvoices
                  : invoices.length === 1
                    ? billingUi.oneInvoice
                    : billingUi.invoiceCount.replace("{{count}}", String(invoices.length))}
            </span>
          </div>

          {invoiceError ? <div style={errorStyle}>{invoiceError}</div> : null}

          {loadingInvoices ? (
            <div
              style={{
                minHeight: 140,
                display: "grid",
                placeItems: "center",
                color: "#cbd5e1",
                fontWeight: 900,
              }}
            >
              {billingUi.loadingInvoices}
            </div>
          ) : null}

          {!loadingInvoices && invoices.length === 0 ? (
            <div style={emptyInvoiceStyle}>
              <div style={emptyInvoiceIconStyle}>🧾</div>
              <strong style={{ color: "#ffffff", fontSize: 17 }}>
                {billingUi.noInvoicesYet}
              </strong>
              <span>
                {billingUi.noInvoicesText}
              </span>

              <div style={emptyInvoiceFeatureGridStyle}>
                <span>✓ {billingUi.pdfDownload}</span>
                <span>✓ {billingUi.invoiceNumber}</span>
                <span>✓ {billingUi.paymentDate}</span>
                <span>✓ {billingUi.amountStatus}</span>
              </div>
            </div>
          ) : null}

          {!loadingInvoices && invoices.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {invoices.map((invoice) => {
                const amount = invoice.gross_amount_cents ?? invoice.amount_cents ?? 0;
                const canDownload =
                  Boolean(invoice.pdf_path) &&
                  ["created", "sent", "refunded"].includes(invoice.status || "");
                const downloading = downloadingInvoiceId === invoice.id;

                return (
                  <article key={invoice.id} style={invoiceRowStyle}>
                    <div style={invoiceMainStyle}>
                      <div style={invoiceIconStyle}>🧾</div>
                      <div style={{ minWidth: 0 }}>
                        <strong style={invoiceNumberStyle}>{invoice.invoice_number}</strong>
                        <div style={invoiceMetaStyle}>
                          {formatDate(invoice.created_at, accountLocale)} · {formatMoney(amount, invoice.currency, accountLocale)}
                        </div>
                      </div>
                    </div>

                    <div style={invoiceActionsStyle}>
                      <span style={getInvoiceStatusStyle(invoice.status)}>
                        {getInvoiceStatusLabel(invoice.status, accountLocale)}
                      </span>

                      <button
                        type="button"
                        onClick={() => void handleDownloadInvoice(invoice)}
                        disabled={!canDownload || downloading}
                        style={{
                          ...invoiceDownloadButtonStyle,
                          cursor: !canDownload || downloading ? "not-allowed" : "pointer",
                          opacity: !canDownload || downloading ? 0.5 : 1,
                        }}
                      >
                        {downloading
                          ? ui.loading
                          : canDownload
                            ? billingUi.pdfDownload
                            : billingUi.pdfUnavailable}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </article>
          </>
        ) : null}

        {activeTab === "security" ? (
          <>
        <article style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{securityUi.securityTitle}</h2>
              <p>
                {securityUi.securityText}
              </p>
            </div>
            <span>{securityUi.secure}</span>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div className="mioseg-security-grid">
              <SecurityInfoCard
                icon="✉️"
                label={securityUi.loginEmail}
                value={email || "–"}
                detail={
                  securityInfo.emailConfirmedAt
                    ? `${securityUi.confirmedOn} ${formatDateTime(
                        securityInfo.emailConfirmedAt,
                        accountLocale,
                      )}`
                    : securityUi.emailNotConfirmed
                }
                positive={Boolean(securityInfo.emailConfirmedAt)}
              />

              <SecurityInfoCard
                icon="🔐"
                label={securityUi.loginProvider}
                value={
                  securityInfo.provider === "email"
                    ? securityUi.supabaseEmail
                    : securityInfo.provider
                }
                detail={securityUi.authActive}
                positive
              />

              <SecurityInfoCard
                icon="💻"
                label={securityUi.thisDevice}
                value={`${securityInfo.browser} · ${securityInfo.platform}`}
                detail={securityUi.currentBrowserSession}
                positive
              />

              <SecurityInfoCard
                icon="🕘"
                label={securityUi.lastLogin}
                value={formatDateTime(securityInfo.lastSignInAt, accountLocale)}
                detail={securityUi.reportedBySupabase}
                positive
              />
            </div>

            <div style={securityActionCardStyle}>
              <div>
                <strong style={{ color: "#ffffff", fontSize: 16 }}>
                  {securityUi.password}
                </strong>
                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#94a3b8",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {securityUi.passwordHint}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPasswordMessage("");
                  setPasswordModalOpen(true);
                }}
                style={securityPrimaryButtonStyle}
              >
                {securityUi.changePassword}
              </button>
            </div>

          </div>
        </article>


        <article style={dangerPanelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2
                style={{
                  color: "#cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: 18,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ color: "#f87171", opacity: 0.8 }}
                >
                  🛡️
                </span>
                {securityUi.deleteAccount}
              </h2>
              <p style={{ maxWidth: 820 }}>
                {securityUi.deleteAccountText}
              </p>
            </div>
            <span
              style={{
                color: "#94a3b8",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(148,163,184,0.12)",
              }}
            >
              {ui.optional}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gap: 13,
              paddingTop: 4,
            }}
          >
            <label style={deleteCheckboxStyle}>
              <input
                type="checkbox"
                checked={deleteChecked}
                onChange={(event) => setDeleteChecked(event.target.checked)}
                disabled={deletingAccount}
                style={{ width: 18, height: 18, accentColor: "#ef4444" }}
              />
              <span>
                {securityUi.enableDelete}
              </span>
            </label>

            <label style={labelStyle}>
              {securityUi.deletePrompt}
              <input
                value={deleteConfirm}
                onChange={(event) => setDeleteConfirm(event.target.value)}
                placeholder={securityUi.deletePhrase}
                disabled={deletingAccount}
                style={inputStyle}
              />
            </label>

            {deleteMessage ? (
              <div style={errorStyle}>{deleteMessage}</div>
            ) : null}

            <button
              type="button"
              onClick={() => void handleDeleteAccount()}
              disabled={
                deletingAccount ||
                !deleteChecked ||
                deleteConfirm !== securityUi.deletePhrase
              }
              style={{
                minHeight: 44,
                justifySelf: "end",
                border: "1px solid rgba(248,113,113,0.24)",
                borderRadius: 13,
                background: "rgba(127,29,29,0.12)",
                color: "#fca5a5",
                padding: "0 16px",
                fontSize: 13,
                fontWeight: 900,
                cursor:
                  deletingAccount ||
                  !deleteChecked ||
                  deleteConfirm !== securityUi.deletePhrase
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  deletingAccount ||
                  !deleteChecked ||
                  deleteConfirm !== securityUi.deletePhrase
                    ? 0.52
                    : 1,
              }}
            >
              {deletingAccount
                ? securityUi.deletingAccount
                : securityUi.deleteAccount}
            </button>
          </div>
        </article>
          </>
        ) : null}


      </section>

      </div>

      {passwordModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
          style={modalBackdropStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePasswordModal();
            }
          }}
        >
          <div style={modalCardStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <span style={modalKickerStyle}>{securityUi.securityKicker}</span>
                <h2
                  id="password-modal-title"
                  style={{ margin: "7px 0 0", color: "#ffffff" }}
                >
                  {securityUi.changePassword}
                </h2>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={changingPassword}
                aria-label={securityUi.closeWindow}
                style={modalCloseButtonStyle}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 13 }}>
              <label style={labelStyle}>
                {securityUi.currentPassword}
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                {securityUi.newPassword}
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                {securityUi.repeatPassword}
                <input
                  type="password"
                  value={repeatPassword}
                  onChange={(event) => setRepeatPassword(event.target.value)}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </label>

              <div style={passwordRulesStyle}>
                <span>{securityUi.ruleLength}</span>
                <span>{securityUi.ruleUpper}</span>
                <span>{securityUi.ruleLower}</span>
                <span>{securityUi.ruleNumber}</span>
              </div>

              {passwordMessage ? (
                <div
                  style={
                    passwordMessage === securityUi.passwordChanged
                      ? successStyle
                      : errorStyle
                  }
                >
                  {passwordMessage}
                </div>
              ) : null}

              <div style={modalActionRowStyle}>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  style={modalSecondaryButtonStyle}
                >
                  {securityUi.cancel}
                </button>

                <button
                  type="button"
                  onClick={() => void handleChangePassword()}
                  disabled={changingPassword}
                  style={{
                    ...securityPrimaryButtonStyle,
                    cursor: changingPassword ? "not-allowed" : "pointer",
                    opacity: changingPassword ? 0.65 : 1,
                  }}
                >
                  {changingPassword ? securityUi.changing : securityUi.savePassword}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style
        dangerouslySetInnerHTML={{
          __html: `
.mioseg-account-page-content {
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  box-sizing: border-box;
}

.mioseg-account-page-content > section {
  width: 100%;
  box-sizing: border-box;
}

.mioseg-account-content {
  width: 100%;
  box-sizing: border-box;
}

.mioseg-account-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mioseg-account-grid-postal {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(0, 2fr);
  gap: 12px;
}


.mioseg-account-tabs {
  width: 100%;
  display: flex;
  gap: 8px;
  margin: 0 0 18px;
  padding: 0 0 8px;
  border-bottom: 1px solid rgba(148,163,184,0.14);
  overflow-x: auto;
  scrollbar-width: none;
}

.mioseg-account-tabs::-webkit-scrollbar {
  display: none;
}

.mioseg-account-tabs button {
  min-height: 44px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #94a3b8;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}

.mioseg-account-tabs button:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.03);
}

.mioseg-account-tabs button.is-active {
  color: #ffffff;
  border-bottom-color: #60a5fa;
}

.mioseg-security-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 760px) {
  .mioseg-account-grid-2,
  .mioseg-account-grid-postal,
  .mioseg-security-grid {
    grid-template-columns: 1fr;
  }
}
          `.trim(),
        }}
      />
    </main>
  );
}

function InfoRow({
  label,
  value,
  monospace,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: 12,
        alignItems: "center",
        borderRadius: 18,
        padding: 14,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.075)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 900 }}>
        {label}
      </div>
      <div
        style={{
          color: "#ffffff",
          fontSize: 14,
          fontWeight: 850,
          wordBreak: "break-word",
          fontFamily: monospace
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SecurityInfoCard({
  icon,
  label,
  value,
  detail,
  positive,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div style={securityInfoCardStyle}>
      <div style={securityInfoIconStyle}>{icon}</div>

      <div style={{ minWidth: 0 }}>
        <span style={securityInfoLabelStyle}>{label}</span>
        <strong style={securityInfoValueStyle}>{value}</strong>
        <span
          style={{
            ...securityInfoDetailStyle,
            color: positive ? "#86efac" : "#fca5a5",
          }}
        >
          {positive ? "● " : "● "}
          {detail}
        </span>
      </div>
    </div>
  );
}

const securityInfoCardStyle: React.CSSProperties = {
  minHeight: 112,
  borderRadius: 20,
  padding: 15,
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const securityInfoIconStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  flex: "0 0 auto",
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(180deg,#ffffff,#dbeafe)",
  color: "#07101f",
  fontSize: 19,
};

const securityInfoLabelStyle: React.CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const securityInfoValueStyle: React.CSSProperties = {
  display: "block",
  marginTop: 5,
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 950,
  lineHeight: 1.35,
  wordBreak: "break-word",
};

const securityInfoDetailStyle: React.CSSProperties = {
  display: "block",
  marginTop: 6,
  fontSize: 11,
  fontWeight: 800,
  lineHeight: 1.4,
};

const securityActionCardStyle: React.CSSProperties = {
  borderRadius: 20,
  padding: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  background: "rgba(59,130,246,0.07)",
  border: "1px solid rgba(147,197,253,0.14)",
};

const securityPrimaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  border: 0,
  borderRadius: 14,
  padding: "0 16px",
  background: "linear-gradient(180deg,#2563eb,#7c3aed)",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 950,
  cursor: "pointer",
};




const modalBackdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  padding: 20,
  display: "grid",
  placeItems: "center",
  background: "rgba(2,6,23,0.78)",
  backdropFilter: "blur(10px)",
};

const modalCardStyle: React.CSSProperties = {
  width: "min(100%, 560px)",
  maxHeight: "calc(100vh - 40px)",
  overflowY: "auto",
  borderRadius: 26,
  padding: 22,
  background: "#0f1a2a",
  border: "1px solid rgba(148,163,184,0.2)",
  boxShadow: "0 30px 90px rgba(0,0,0,0.48)",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 18,
};

const modalKickerStyle: React.CSSProperties = {
  display: "inline-flex",
  minHeight: 27,
  alignItems: "center",
  borderRadius: 999,
  padding: "0 9px",
  background: "rgba(59,130,246,0.13)",
  border: "1px solid rgba(147,197,253,0.16)",
  color: "#bfdbfe",
  fontSize: 10,
  fontWeight: 950,
  letterSpacing: "0.06em",
};

const modalCloseButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 13,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#ffffff",
  fontSize: 24,
  lineHeight: 1,
  cursor: "pointer",
};

const passwordRulesStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 13,
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 7,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 800,
};

const modalActionRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const modalSecondaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: 14,
  padding: "0 16px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
};

const successStyle: React.CSSProperties = {
  borderRadius: 18,
  padding: 14,
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(134,239,172,0.22)",
  color: "#bbf7d0",
  fontWeight: 850,
  lineHeight: 1.5,
};

const emptyInvoiceIconStyle: React.CSSProperties = {
  width: 58,
  height: 58,
  display: "grid",
  placeItems: "center",
  borderRadius: 20,
  background: "linear-gradient(180deg,#ffffff,#dbeafe)",
  color: "#07101f",
  fontSize: 25,
  boxShadow: "0 14px 34px rgba(37,99,235,0.12)",
};

const emptyInvoiceFeatureGridStyle: React.CSSProperties = {
  width: "min(100%, 520px)",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
  marginTop: 6,
  color: "#cbd5e1",
  fontSize: 12,
  fontWeight: 800,
};

const invoiceRowStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 20,
  padding: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const invoiceMainStyle: React.CSSProperties = {
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const invoiceIconStyle: React.CSSProperties = {
  width: 46,
  height: 46,
  flex: "0 0 auto",
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(180deg,#ffffff,#dbeafe)",
  color: "#07101f",
  fontSize: 20,
};

const invoiceNumberStyle: React.CSSProperties = {
  display: "block",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 950,
  wordBreak: "break-word",
};

const invoiceMetaStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 750,
};

const invoiceActionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const invoiceDownloadButtonStyle: React.CSSProperties = {
  minHeight: 40,
  border: 0,
  borderRadius: 13,
  padding: "0 14px",
  background: "linear-gradient(180deg,#2563eb,#7c3aed)",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 950,
};

const emptyInvoiceStyle: React.CSSProperties = {
  minHeight: 220,
  borderRadius: 22,
  padding: 24,
  display: "grid",
  placeItems: "center",
  gap: 10,
  textAlign: "center",
  background:
    "linear-gradient(180deg, rgba(59,130,246,0.06), rgba(255,255,255,0.025))",
  border: "1px solid rgba(147,197,253,0.12)",
  color: "#94a3b8",
  lineHeight: 1.55,
  fontWeight: 800,
};

const panelStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 28,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const dangerPanelStyle: React.CSSProperties = {
  ...panelStyle,
  marginTop: 2,
  background: "rgba(15, 23, 42, 0.48)",
  border: "1px solid rgba(248, 113, 113, 0.1)",
  boxShadow: "none",
  padding: 18,
};

const deleteCheckboxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.45,
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
  minHeight: 50,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  padding: "12px 14px",
  fontSize: 14,
  fontWeight: 750,
  outline: "none",
  boxSizing: "border-box",
};


const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "#ffffff",
  colorScheme: "dark",
};

const optionStyle: React.CSSProperties = {
  background: "#111827",
  color: "#ffffff",
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
