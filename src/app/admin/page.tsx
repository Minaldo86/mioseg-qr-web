"use client";

import { useEffect, useMemo, useState } from "react";

type VerificationRequest = {
  id: string;
  qrx_id: string;
  owner_user_id: string;
  status: string;
  document_filename: string;
  document_type: string;
  document_path: string;
  created_at: string;
  signed_document_url: string | null;
  qrx_title: string | null;
  company_name: string | null;
  category: string | null;
  qrx_verified: boolean | null;
  qrx_web_url: string | null;
  waiting_days: number;
  waiting_label: string;
};

type SortMode = "oldest" | "newest" | "company" | "title";
type WaitFilter = "all" | "7" | "14";

type AdminTab =
  | "overview"
  | "verifications"
  | "reports"
  | "support"
  | "users"
  | "credits"
  | "finance"
  | "prices"
  | "logs";

type CreditHistoryEntry = {
  id: string;
  action_type: string;
  amount: number | null;
  note: string | null;
  qrx_id?: string | null;
  created_at: string;
};

type CreditPurchaseEntry = {
  id: string;
  user_id: string;
  pack_id: string | null;
  credits: number | null;
  amount_cents: number | null;
  currency: string | null;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  status: string | null;
  created_at: string | null;
  paid_at: string | null;
  billing_email: string | null;
  billing_country_code: string | null;
  billing_country_name: string | null;
  refunded_cents?: number | null;
  refunded_amount_cents?: number | null;
  refunded_credits?: number | null;
  refunded_at?: string | null;
  stripe_refund_id?: string | null;
};

type CreditInvoiceEntry = {
  id: string;
  invoice_number?: string | null;
  user_id?: string | null;
  purchase_id?: string | null;
  stripe_payment_intent_id?: string | null;
  total_cents?: number | null;
  amount_cents?: number | null;
  currency?: string | null;
  billing_email?: string | null;
  pdf_path?: string | null;
  storage_path?: string | null;
  created_at?: string | null;
  sent_at?: string | null;
};

type CreditHistoryResult = {
  userId: string;
  currentCredits: number | null;
  creditUpdatedAt?: string | null;
  purchases: CreditPurchaseEntry[];
  invoices: CreditInvoiceEntry[];
  invoiceLoadWarning?: string | null;
  history: CreditHistoryEntry[];
  summary: {
    purchaseCount: number;
    invoiceCount: number;
    totalPurchasedCredits: number;
    totalPaidCents: number;
    totalRefundedCents: number;
  };
};

type SupportTicket = {
  id: string;
  ticket_number: string | null;
  user_id: string | null;
  qrx_id: string | null;
  problem_type: string;
  status: string;
  title: string;
  description: string | null;
  resolution_note: string | null;
  report_reason?: string | null;
  reporter_email?: string | null;
  report_weight?: number | null;
  created_at: string;
  updated_at: string;
};

type TicketProblemType =
  | "credits_wrong"
  | "verification_waiting"
  | "upload_problem"
  | "transfer_problem"
  | "qrx_report"
  | "other";

type TicketStatus = "open" | "in_review" | "resolved";

type UserLookupResult = {
  query: string;
  userId: string | null;
  email: string | null;
  currentCredits: number | null;
  qrxCount: number;
  businessQrxCount: number;
  verifiedBusinessQrxCount: number;
  openTicketsCount: number;
  openVerificationsCount: number;
  recentTickets: SupportTicket[];
  recentQrx: Array<{
    id: string;
    title: string | null;
    type: string | null;
    verified: boolean | null;
    created_at: string | null;
    suspended?: boolean | null;
    suspended_reason?: string | null;
    deleted_at?: string | null;
    deleted_reason?: string | null;
    deleted_by_admin?: boolean | null;
  }>;
  qrxList: Array<{
    id: string;
    title: string | null;
    type: string | null;
    verified: boolean | null;
    created_at: string | null;
    suspended?: boolean | null;
    suspended_reason?: string | null;
    deleted_at?: string | null;
    deleted_reason?: string | null;
    deleted_by_admin?: boolean | null;
    company_name?: string | null;
    category?: string | null;
  }>;
  userBlocked?: boolean;
  bannedUntil?: string | null;
};

type AdminActionLogEntry = {
  id: string;
  action_type: string;
  target_user_id: string | null;
  qrx_id: string | null;
  amount: number | null;
  note: string | null;
  created_at: string;
};

type QrxAdminItem = {
  id: string;
  owner_user_id: string;
  title: string | null;
  type: string | null;
  verified: boolean | null;
  company_name: string | null;
  category: string | null;
  created_at: string | null;
  updated_at: string | null;
  suspended: boolean | null;
  suspended_reason: string | null;
  suspended_at: string | null;
  report_count?: number | null;
  report_score?: number | null;
  moderation_status?: string | null;
  moderation_flagged_at?: string | null;
  auto_suspended_at?: string | null;
  deleted_at?: string | null;
  deleted_reason?: string | null;
  deleted_by_admin?: boolean | null;
  follower_count?: number | null;
  views_total?: number | null;
  views_unique_total?: number | null;
  manual_follower_boost?: number | null;
  manual_view_boost?: number | null;
  manual_unique_view_boost?: number | null;
  real_follower_count?: number | null;
  force_original_quality?: boolean | null;
};


type FinancePayoutBatch = {
  id: string;
  payment_provider: string | null;
  provider_payout_id: string | null;
  payout_reference: string | null;
  period_start: string | null;
  period_end: string | null;
  paid_at: string | null;
  currency: string | null;
  gross_cents: number | null;
  fee_cents: number | null;
  refund_cents: number | null;
  net_payout_cents: number | null;
  invoice_count: number | null;
  purchase_count: number | null;
  refund_count: number | null;
  status: string | null;
  note: string | null;
  created_at: string | null;
};

type FinancePayoutResult = {
  ok: boolean;
  from: string;
  to: string;
  provider: string;
  payouts: FinancePayoutBatch[];
  totals: {
    batchCount: number;
    grossCents: number;
    feeCents: number;
    refundCents: number;
    netPayoutCents: number;
    invoiceCount: number;
    purchaseCount: number;
    refundCount: number;
  };
};

type PricingConfig = {
  id?: string | number | null;
  launch_discount_enabled?: boolean | null;
  currency?: string | null;
  free_storage_mb?: number | null;
  qrx_creation_credit_cost?: number | null;
  storage_pack_mb?: number | null;
  storage_pack_credit_cost?: number | null;
  max_upload_mb?: number | null;
  max_images_per_qrx?: number | null;
  max_documents_per_qrx?: number | null;
  max_updates?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type PricingConfigDraft = {
  free_storage_mb: string;
  qrx_creation_credit_cost: string;
  storage_pack_mb: string;
  storage_pack_credit_cost: string;
  max_upload_mb: string;
  max_images_per_qrx: string;
  max_documents_per_qrx: string;
  max_updates: string;
};

type PricingPack = {
  id: string;
  credits: number;
  sort_order: number | null;
  is_active: boolean | null;
  price_cents_launch: number | null;
  price_cents_regular: number | null;
  badge: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PricingPackDraft = {
  price_cents_launch: string;
  price_cents_regular: string;
  badge: string;
  is_active: boolean;
};

type MediaJobEntry = {
  id: string;
  media_id: string;
  qrx_id: string | null;
  job_type: string | null;
  status: string | null;
  reason: string | null;
  attempts: number | null;
  processing_error: string | null;
  created_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  updated_at: string | null;
};

type BulkMediaPreviewResult = {
  ok: boolean;
  dryRun: boolean;
  matchedCount: number;
  sample?: Array<{
    id: string;
    qrx_id: string | null;
    filename: string | null;
    type: string | null;
    mime_type: string | null;
    processing_status: string | null;
    original_bytes: number | null;
  }>;
};

type MediaJobsResult = {
  ok: boolean;
  jobs: MediaJobEntry[];
  summary: {
    totalLoaded: number;
    queued: number;
    processing: number;
    done: number;
    failed: number;
  };
  updatedAt: string;
};

type StorageMediaItem = {
  id: string;
  qrx_id: string | null;
  filename: string | null;
  type: string | null;
  processing_status: string | null;
  originalBytes: number;
  optimizedBytes: number;
  savedBytes: number;
  savingsPercent: number;
};

type StorageMediaStats = {
  ok: boolean;
  totals: {
    mediaCount: number;
    imageCount: number;
    fileCount: number;
    optimizedCount: number;
    processingCount: number;
    failedCount: number;
    originalBytes: number;
    optimizedBytes: number;
    savedBytes: number;
    savingsPercent: number;
    averageOriginalBytes: number;
    averageOptimizedBytes: number;
    averageSavingsPercent: number;
    largestOriginalBytes: number;
  };
  topLargest: StorageMediaItem[];
  topSavings: StorageMediaItem[];
  mediaItems: StorageMediaItem[];
  statusCounts: Record<string, number>;
  updatedAt: string;
};

type MediaTrafficQrxItem = {
  qrxId: string | null;
  title: string | null;
  companyName: string | null;
  eventCount: number;
  totalBytes: number;
  todayBytes: number;
  monthBytes: number;
  weekBytes?: number;
  storageBytes?: number;
  estimatedTrafficCostCents?: number;
  estimatedStorageCostCents?: number;
  estimatedTotalCostCents?: number;
  lastSeenAt: string | null;
};

type MediaTrafficMediaItem = {
  mediaId: string | null;
  qrxId: string | null;
  filename: string | null;
  variant: string | null;
  eventCount: number;
  totalBytes: number;
  todayBytes: number;
  monthBytes: number;
  weekBytes?: number;
  storageBytes?: number;
  estimatedTrafficCostCents?: number;
  estimatedStorageCostCents?: number;
  estimatedTotalCostCents?: number;
  lastSeenAt: string | null;
};

type MediaHealthRecommendation = {
  id: string;
  severity: "info" | "warning" | "critical";
  category: "traffic" | "storage" | "cost" | "quality" | "jobs";
  title: string;
  description: string;
  actionLabel?: string;
  qrxId?: string | null;
  mediaId?: string | null;
  estimatedSavingsBytes?: number;
  estimatedSavingsCostCents?: number;
};

type MediaActiveWarning = MediaHealthRecommendation & {
  priority: number;
  status: "active";
  detectedAt: string;
};

type MediaTrafficStats = {
  ok: boolean;
  summary: {
    eventCount: number;
    totalBytes: number;
    todayBytes: number;
    monthBytes: number;
    weekBytes?: number;
    mediaCount: number;
    qrxCount: number;
    estimatedCostCents: number;
    estimatedTodayCostCents?: number;
    estimatedWeekCostCents?: number;
    estimatedMonthCostCents?: number;
    estimatedStorageCostCents?: number;
    estimatedTotalCostCents?: number;
    totalStorageBytes?: number;
    trafficEgressCostCentsPerGb?: number;
    storageCostCentsPerGbMonth?: number;
    largestQrxBytes?: number;
    largestMediaBytes?: number;
    largestQrxSharePercent?: number;
    largestMediaSharePercent?: number;
    averageBytesPerEvent?: number;
    optimizedMediaCount?: number;
    optimizedSharePercent?: number;
    failedMediaCount?: number;
    failedSharePercent?: number;
    largeOriginalMediaCount?: number;
    largeOriginalBytes?: number;
    originalLikeBytes?: number;
    originalLikeSharePercent?: number;
    healthScore?: number;
    healthGrade?: "excellent" | "healthy" | "watch" | "critical" | string;
    healthStatus?: "empty" | "healthy" | "watch" | "critical" | string;
  };
  topQrx: MediaTrafficQrxItem[];
  topMedia: MediaTrafficMediaItem[];
  topQrxWeek?: MediaTrafficQrxItem[];
  topMediaWeek?: MediaTrafficMediaItem[];
  topCostQrx?: MediaTrafficQrxItem[];
  topCostMedia?: MediaTrafficMediaItem[];
  topVariants?: Array<{
    variant: string;
    eventCount: number;
    totalBytes: number;
    todayBytes: number;
    weekBytes: number;
    monthBytes: number;
    sharePercent: number;
  }>;
  recommendations?: MediaHealthRecommendation[];
  activeWarnings?: MediaActiveWarning[];
  updatedAt: string;
};


type FinanceInvoiceEntry = {
  id: string;
  invoice_number: string | null;
  user_id: string | null;
  purchase_id: string | null;
  stripe_payment_intent_id: string | null;
  payment_provider: string | null;
  total_cents: number | null;
  amount_cents: number | null;
  tax_cents: number | null;
  net_cents: number | null;
  currency: string | null;
  billing_email: string | null;
  billing_country_code: string | null;
  pdf_path: string | null;
  storage_path: string | null;
  created_at: string | null;
  sent_at: string | null;
};

type FinanceProviderSummary = {
  provider: string;
  invoiceCount: number;
  grossCents: number;
  netCents: number;
  taxCents: number;
  refundedCents: number;
};

type FinanceResult = {
  ok: boolean;
  from: string;
  to: string;
  invoices: FinanceInvoiceEntry[];
  providerSummary: FinanceProviderSummary[];
  totals: {
    invoiceCount: number;
    grossCents: number;
    netCents: number;
    taxCents: number;
    refundedCents: number;
  };
  warnings?: string[];
};

type PricingResult = {
  pricingConfig: PricingConfig | null;
  pricingPacks: PricingPack[];
  limits?: {
    maxSingleCreditGrant: number;
    maxDailyCreditGrant: number;
    creditsGrantedToday: number;
    remainingCreditsToday: number;
  };
};

const CREDIT_PRESETS = [5, 10, 25, 50, 100];

type AdminLanguage = "de" | "en";
type AdminTranslationKey = keyof typeof ADMIN_I18N.de;

const ADMIN_I18N = {
  de: {
    language_de: "Deutsch",
    language_en: "English",

    admin_title: "Admin – Kommandozentrale",
    admin_subtitle:
      "Prüfe Business-QR-X, verwalte Verifizierungen und buche Credits bei Kulanz oder Erstattung.",

    tab_overview: "Übersicht",
    tab_overview_hint: "Kennzahlen und wichtigste offene Punkte",
    tab_verifications: "Verifizierungen",
    tab_verifications_hint: "Business-QR-X Nachweise prüfen",
    tab_reports: "Meldungen",
    tab_reports_hint: "Gemeldete und gesperrte QR-X moderieren",
    tab_support: "Support",
    tab_support_hint: "Tickets und Reklamationen bearbeiten",
    tab_users: "Nutzer",
    tab_users_hint: "Nutzer suchen und QR-X zuordnen",
    tab_credits: "Credits",
    tab_credits_hint: "Gutschriften und Credit-Historie",
    tab_finance: "Finanzen",
    tab_finance_hint: "Rechnungen, Umsatz und Steuerexport vorbereiten",
    tab_prices: "Preise",
    tab_prices_hint: "Credit-Pakete und Preis-Konfiguration lesen",
    tab_logs: "Logs",
    tab_logs_hint: "Letzte Admin-Aktionen prüfen",

    problem_credits_wrong: "Credits falsch abgezogen",
    problem_verification_waiting: "Verifizierung hängt",
    problem_upload_problem: "Upload Problem",
    problem_transfer_problem: "Transfer Problem",
    problem_qrx_report: "QR-X Meldung",
    problem_other: "Sonstiges",

    ticket_status_open: "Offen",
    ticket_status_in_review: "In Prüfung",
    ticket_status_resolved: "Gelöst",

    moderation_flagged: "Zur Prüfung markiert",
    moderation_auto_suspended: "Automatisch gesperrt",
    moderation_ok: "OK",
    moderation_unknown: "Unbekannt",

    admin_action_credits_added: "Credits gutgeschrieben",
    admin_action_credits_refunded_from_ticket: "Ticket-Credits erstattet",
    admin_action_support_ticket_resolved_with_credit: "Ticket mit Credits gelöst",
    admin_action_support_ticket_created: "Supportfall angelegt",
    admin_action_support_ticket_in_review: "Supportfall in Prüfung",
    admin_action_support_ticket_resolved: "Supportfall gelöst",
    admin_action_support_ticket_open: "Supportfall geöffnet",
    admin_action_verification_approved: "QR-X verifiziert",
    admin_action_verification_rejected: "QR-X abgelehnt",
    admin_action_qrx_soft_deleted: "QR-X gelöscht",
    admin_action_qrx_restored: "QR-X wiederhergestellt",

    purchase_status_paid: "Bezahlt",
    purchase_status_pending: "Offen",
    purchase_status_failed: "Fehlgeschlagen",
    purchase_status_refunded: "Erstattet",
    purchase_status_canceled: "Abgebrochen",
    purchase_status_unknown: "Unbekannt",
  

    section_reports_title: "Meldungen / Moderation",
    section_reports_hint:
      "Prüfe gemeldete QR-X, markiere geprüfte Einträge oder sperre problematische Inhalte.",
    section_support_title: "Support / Tickets",
    section_support_hint:
      "Lege Supportfälle an, prüfe Reklamationen und buche bei Bedarf Credits zurück.",
    section_users_title: "Nutzerverwaltung",
    section_users_hint:
      "Suche Nutzer per User-ID, QR-X-ID oder E-Mail und prüfe zugehörige QR-X.",
    section_qrx_status_title: "QR-X Status prüfen",
    section_qrx_status_hint:
      "Lade einzelne QR-X, sperre sie, stelle sie wieder her oder markiere sie als geprüft.",

    btn_refresh: "Aktualisieren",
    btn_load: "Laden",
    btn_loading: "Lade…",
    btn_search: "Suchen",
    btn_check: "Prüfen",
    btn_open: "Öffnen",
    btn_save: "Speichern",
    btn_cancel: "Abbrechen",
    btn_delete: "Löschen",
    btn_restore: "Wiederherstellen",
    btn_suspend: "Sperren",
    btn_release: "Freigeben",
    btn_mark_reviewed: "Als geprüft markieren",
    btn_create_ticket: "Supportfall anlegen",
    btn_set_in_review: "In Prüfung setzen",
    btn_resolve: "Als gelöst markieren",
    btn_refund_credits: "Credits erstatten",
    btn_suspend_qrx: "QR-X sperren",
    btn_show_all_qrx: "Alle QR-X anzeigen",
    btn_hide_qrx: "QR-X ausblenden",

    table_qrx: "QR-X",
    table_title: "Titel",
    table_user: "Nutzer",
    table_status: "Status",
    table_reports: "Meldungen",
    table_score: "Score",
    table_created: "Erstellt",
    table_updated: "Aktualisiert",
    table_actions: "Aktionen",
    table_type: "Typ",
    table_company: "Firma",
    table_category: "Kategorie",
    table_verified: "Verifiziert",
    table_deleted: "Gelöscht",
    table_reason: "Grund",
    table_ticket: "Ticket",
    table_problem: "Problem",
    table_description: "Beschreibung",
    table_email: "E-Mail",
    table_amount: "Betrag",
    table_note: "Notiz",
    table_date: "Datum",

    input_search_reports_placeholder: "QR-X, Titel, Firma, User-ID oder Grund suchen…",
    input_user_lookup_placeholder: "User-ID, QR-X-ID oder E-Mail eingeben…",
    input_qrx_lookup_placeholder: "QR-X-ID eingeben…",
    input_suspend_reason_placeholder: "Sperr-/Löschgrund eintragen…",
    input_ticket_title_placeholder: "Kurzer Titel für den Supportfall…",
    input_ticket_description_placeholder: "Beschreibung / interne Notiz…",
    input_refund_credits_placeholder: "Credits",

    label_reported_qrx: "Gemeldete QR-X",
    label_auto_suspended: "Automatisch gesperrt",
    label_open_tickets: "Offene Tickets",
    label_recent_tickets: "Letzte Tickets",
    label_recent_qrx: "Letzte QR-X",
    label_user_blocked: "Nutzer gesperrt",
    label_user_active: "Nutzer aktiv",
    label_suspended: "Gesperrt",
    label_not_suspended: "Nicht gesperrt",
    label_soft_deleted: "Soft gelöscht",
    label_not_deleted: "Nicht gelöscht",
    label_yes: "Ja",
    label_no: "Nein",
    label_none: "–",
    label_all: "Alle",
    label_all_actions: "Alle Aktionen",

    empty_reports: "Keine gemeldeten QR-X vorhanden.",
    empty_tickets: "Keine Supportfälle vorhanden.",
    empty_user_result: "Noch kein Nutzer geladen.",
    empty_qrx_result: "Noch kein QR-X geladen.",
    loading_reports: "Meldungen werden geladen…",
    loading_tickets: "Supportfälle werden geladen…",
    loading_user: "Nutzer wird geladen…",
    loading_qrx: "QR-X wird geladen…",

    qrx_report_count: "{{count}} Meldung(en)",
    qrx_report_score: "Report-Score: {{score}}",
    qrx_owner: "Owner",
    qrx_open_web: "Web öffnen",
    qrx_current_status: "Aktueller Status",
    qrx_moderation_status: "Moderationsstatus",

    ticket_create_title: "Neuen Supportfall anlegen",
    ticket_list_title: "Supportfälle",
    ticket_credit_refund_title: "Credit-Erstattung",
    ticket_reporter_email: "Reporter-E-Mail",
    ticket_report_reason: "Meldegrund",
    ticket_resolution_note: "Lösungsnotiz",

    user_lookup_title: "Nutzer suchen",
    user_lookup_summary: "Nutzerübersicht",
    user_current_credits: "Aktuelle Credits",
    user_qrx_count: "QR-X gesamt",
    user_business_qrx_count: "Business QR-X",
    user_verified_qrx_count: "Verifiziert",
    user_open_tickets_count: "Offene Tickets",
    user_open_verifications_count: "Offene Verifizierungen",
    user_ban: "Nutzer sperren",
    user_unban: "Nutzer entsperren",
    user_suspend_all_qrx: "Alle QR-X sperren",
    user_unsuspend_all_qrx: "Alle QR-X freigeben",

    filter_all: "Alle",
    filter_open: "Offen",
    filter_in_review: "In Prüfung",
    filter_resolved: "Gelöst",

    ticket_create_failed: "Supportfall konnte nicht angelegt werden.",
    ticket_update_failed: "Supportfall konnte nicht aktualisiert werden.",
    ticket_no_user_id: "Dieser Supportfall hat keine User-ID. Bitte User-ID im Ticket hinterlegen.",
    ticket_refund_amount_invalid: "Bitte eine gültige Credit-Anzahl für die Erstattung eintragen.",
    ticket_refund_max: "Maximal 100 Credits pro Erstattung erlaubt.",
    ticket_no_qrx_id: "Dieses Ticket hat keine QR-X-ID.",
    qrx_suspend_failed: "QR-X konnte nicht gesperrt werden.",
    qrx_suspended_success: "QR-X wurde gesperrt.",

    ticket_title_required: "Bitte einen kurzen Titel für den Supportfall eintragen.",
    finance_title: "Finanzübersicht",
    finance_export_csv: "CSV Export",
    finance_provider: "Zahlungsanbieter",
    finance_period: "Zeitraum",
    finance_total_revenue: "Gesamtumsatz",
    finance_net_revenue: "Netto-Umsatz",
    finance_tax: "Steuern / MwSt",
    finance_refunds: "Erstattungen",
    finance_payouts: "Auszahlungen",
    finance_invoices: "Rechnungen",
    finance_invoice_count: "Rechnungen gesamt",
    finance_purchase_count: "Käufe gesamt",
    finance_refund_count: "Refunds gesamt",
    finance_load_error: "Finanzdaten konnten nicht geladen werden.",
    finance_payout_error: "Auszahlungen konnten nicht geladen werden.",

    pricing_title: "Preisverwaltung",
    pricing_launch_discount: "Launch-Rabatt",
    pricing_credit_packs: "Credit-Pakete",
    pricing_active: "Aktiv",
    pricing_inactive: "Inaktiv",
    pricing_save_success: "Preis-Paket wurde gespeichert.",
    pricing_save_failed: "Paket konnte nicht gespeichert werden.",
    pricing_load_error: "Preise konnten nicht geladen werden.",

    credits_history_title: "Credit-Historie",
    credits_current_balance: "Aktuelle Credits",
    credits_total_purchased: "Gekaufte Credits",
    credits_total_refunded: "Erstattete Credits",
    credits_granted_today: "Heute gutgeschrieben",


    logs_title: "Admin-Aktionslog",
    logs_hint: "Durchsuche kritische Änderungen: Preise, Credits, QR-X Sperren, Support und Verifizierungen.",
    logs_refresh: "Aktionen aktualisieren",
    logs_loaded_actions: "Geladene Aktionen",
    logs_today: "Heute",
    logs_filtered: "Gefiltert",
    logs_loaded_hint: "Aktuell geladene Einträge aus dem Admin-Log.",
    logs_today_hint: "Admin-Aktionen am heutigen Tag.",
    logs_filtered_hint: "Einträge passend zu Suche und Filter.",
    logs_search_placeholder: "Suche nach User-ID, QR-X-ID, Notiz, Aktion…",
    logs_action_label: "Aktion",
    logs_open_user: "Nutzer öffnen",
    logs_open_qrx: "QR-X öffnen",
    logs_load_moderation: "In Moderation laden",
    admin_action_all_qrx_unsuspended: "Alle QR-X freigegeben",
    admin_action_all_qrx_suspended: "Alle QR-X gesperrt",
    admin_action_user_unbanned: "Nutzer entsperrt",
    admin_action_user_banned: "Nutzer gesperrt",
    admin_action_qrx_suspended: "QR-X gesperrt",
    admin_action_qrx_unsuspended: "QR-X freigegeben",
    admin_action_pricing_updated: "Preis aktualisiert",
    admin_action_launch_discount_updated: "Launch-Rabatt geändert",
    admin_action_refund_created: "Erstattung erstellt",
    admin_action_unknown: "{{action}}",

    prices_section_title: "Preis-/Credit-Konfiguration",
    prices_section_hint: "Bearbeite Credit-Pakete kontrolliert. Änderungen wirken direkt, sobald App/Web die Preise aus Supabase laden.",
    prices_refresh: "Preise aktualisieren",
    prices_disable_launch_discount: "Launch-Rabatt deaktivieren",
    prices_enable_launch_discount: "Launch-Rabatt aktivieren",
    prices_launch_discount_card: "Launch-Rabatt",
    prices_currency_card: "Währung",
    prices_active_packs_card: "Aktive Pakete",
    prices_daily_limit_card: "Tageslimit Admin-Credits",
    prices_launch_discount_active: "Aktiv",
    prices_launch_discount_inactive: "Inaktiv",
    prices_launch_discount_hint: "Steuert, ob Launch- oder Normalpreise relevant sind.",
    prices_currency_hint: "Währung aus der Pricing-Konfiguration.",
    prices_active_packs_hint: "Pakete, die aktuell aktiv markiert sind.",
    prices_daily_limit_hint: "Heute noch manuell gutzuschreibende Credits.",
    prices_launch_price_cents: "Launch-Preis in Cent",
    prices_regular_price_cents: "Normalpreis in Cent",
    prices_badge: "Badge",
    prices_badge_placeholder: "z. B. Beliebt",
    prices_pack_active: "Paket aktiv",
    prices_save_pack: "Paket speichern",
    prices_updated_at: "Aktualisiert",
    prices_id: "ID",
    prices_sorting: "Sortierung",
    prices_credits_label: "Credits",
},
  en: {
    language_de: "Deutsch",
    language_en: "English",

    admin_title: "Admin – Command Center",
    admin_subtitle:
      "Review Business QR-X requests, manage verifications and grant credits for goodwill or refunds.",

    tab_overview: "Overview",
    tab_overview_hint: "Key metrics and most important open items",
    tab_verifications: "Verifications",
    tab_verifications_hint: "Review Business QR-X proof documents",
    tab_reports: "Reports",
    tab_reports_hint: "Moderate reported and suspended QR-X",
    tab_support: "Support",
    tab_support_hint: "Handle tickets and complaints",
    tab_users: "Users",
    tab_users_hint: "Search users and assign QR-X",
    tab_credits: "Credits",
    tab_credits_hint: "Credit grants and credit history",
    tab_finance: "Finance",
    tab_finance_hint: "Prepare invoices, revenue and tax exports",
    tab_prices: "Prices",
    tab_prices_hint: "View credit packs and pricing configuration",
    tab_logs: "Logs",
    tab_logs_hint: "Review recent admin actions",

    problem_credits_wrong: "Credits charged incorrectly",
    problem_verification_waiting: "Verification pending too long",
    problem_upload_problem: "Upload problem",
    problem_transfer_problem: "Transfer problem",
    problem_qrx_report: "QR-X report",
    problem_other: "Other",

    ticket_status_open: "Open",
    ticket_status_in_review: "In review",
    ticket_status_resolved: "Resolved",

    moderation_flagged: "Marked for review",
    moderation_auto_suspended: "Automatically suspended",
    moderation_ok: "OK",
    moderation_unknown: "Unknown",

    admin_action_credits_added: "Credits granted",
    admin_action_credits_refunded_from_ticket: "Ticket credits refunded",
    admin_action_support_ticket_resolved_with_credit: "Ticket resolved with credits",
    admin_action_support_ticket_created: "Support ticket created",
    admin_action_support_ticket_in_review: "Support ticket in review",
    admin_action_support_ticket_resolved: "Support ticket resolved",
    admin_action_support_ticket_open: "Support ticket reopened",
    admin_action_verification_approved: "QR-X verified",
    admin_action_verification_rejected: "QR-X rejected",
    admin_action_qrx_soft_deleted: "QR-X deleted",
    admin_action_qrx_restored: "QR-X restored",

    purchase_status_paid: "Paid",
    purchase_status_pending: "Pending",
    purchase_status_failed: "Failed",
    purchase_status_refunded: "Refunded",
    purchase_status_canceled: "Canceled",
    purchase_status_unknown: "Unknown",
  

    section_reports_title: "Reports / Moderation",
    section_reports_hint:
      "Review reported QR-X, mark entries as reviewed or suspend problematic content.",
    section_support_title: "Support / Tickets",
    section_support_hint:
      "Create support cases, review complaints and refund credits when needed.",
    section_users_title: "User management",
    section_users_hint:
      "Search users by user ID, QR-X ID or email and review their QR-X.",
    section_qrx_status_title: "Check QR-X status",
    section_qrx_status_hint:
      "Load individual QR-X, suspend them, restore them or mark them as reviewed.",

    btn_refresh: "Refresh",
    btn_load: "Load",
    btn_loading: "Loading…",
    btn_search: "Search",
    btn_check: "Check",
    btn_open: "Open",
    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_delete: "Delete",
    btn_restore: "Restore",
    btn_suspend: "Suspend",
    btn_release: "Release",
    btn_mark_reviewed: "Mark as reviewed",
    btn_create_ticket: "Create support case",
    btn_set_in_review: "Set in review",
    btn_resolve: "Mark resolved",
    btn_refund_credits: "Refund credits",
    btn_suspend_qrx: "Suspend QR-X",
    btn_show_all_qrx: "Show all QR-X",
    btn_hide_qrx: "Hide QR-X",

    table_qrx: "QR-X",
    table_title: "Title",
    table_user: "User",
    table_status: "Status",
    table_reports: "Reports",
    table_score: "Score",
    table_created: "Created",
    table_updated: "Updated",
    table_actions: "Actions",
    table_type: "Type",
    table_company: "Company",
    table_category: "Category",
    table_verified: "Verified",
    table_deleted: "Deleted",
    table_reason: "Reason",
    table_ticket: "Ticket",
    table_problem: "Problem",
    table_description: "Description",
    table_email: "Email",
    table_amount: "Amount",
    table_note: "Note",
    table_date: "Date",

    input_search_reports_placeholder: "Search QR-X, title, company, user ID or reason…",
    input_user_lookup_placeholder: "Enter user ID, QR-X ID or email…",
    input_qrx_lookup_placeholder: "Enter QR-X ID…",
    input_suspend_reason_placeholder: "Enter suspension/deletion reason…",
    input_ticket_title_placeholder: "Short title for the support case…",
    input_ticket_description_placeholder: "Description / internal note…",
    input_refund_credits_placeholder: "Credits",

    label_reported_qrx: "Reported QR-X",
    label_auto_suspended: "Automatically suspended",
    label_open_tickets: "Open tickets",
    label_recent_tickets: "Recent tickets",
    label_recent_qrx: "Recent QR-X",
    label_user_blocked: "User blocked",
    label_user_active: "User active",
    label_suspended: "Suspended",
    label_not_suspended: "Not suspended",
    label_soft_deleted: "Soft deleted",
    label_not_deleted: "Not deleted",
    label_yes: "Yes",
    label_no: "No",
    label_none: "–",
    label_all: "All",
    label_all_actions: "All actions",

    empty_reports: "No reported QR-X available.",
    empty_tickets: "No support cases available.",
    empty_user_result: "No user loaded yet.",
    empty_qrx_result: "No QR-X loaded yet.",
    loading_reports: "Loading reports…",
    loading_tickets: "Loading support cases…",
    loading_user: "Loading user…",
    loading_qrx: "Loading QR-X…",

    qrx_report_count: "{{count}} report(s)",
    qrx_report_score: "Report score: {{score}}",
    qrx_owner: "Owner",
    qrx_open_web: "Open web",
    qrx_current_status: "Current status",
    qrx_moderation_status: "Moderation status",

    ticket_create_title: "Create new support case",
    ticket_list_title: "Support cases",
    ticket_credit_refund_title: "Credit refund",
    ticket_reporter_email: "Reporter email",
    ticket_report_reason: "Report reason",
    ticket_resolution_note: "Resolution note",

    user_lookup_title: "Search user",
    user_lookup_summary: "User overview",
    user_current_credits: "Current credits",
    user_qrx_count: "QR-X total",
    user_business_qrx_count: "Business QR-X",
    user_verified_qrx_count: "Verified",
    user_open_tickets_count: "Open tickets",
    user_open_verifications_count: "Open verifications",
    user_ban: "Ban user",
    user_unban: "Unban user",
    user_suspend_all_qrx: "Suspend all QR-X",
    user_unsuspend_all_qrx: "Release all QR-X",

    filter_all: "All",
    filter_open: "Open",
    filter_in_review: "In review",
    filter_resolved: "Resolved",

    ticket_create_failed: "Support case could not be created.",
    ticket_update_failed: "Support case could not be updated.",
    ticket_no_user_id: "This support case has no user ID. Please add a user ID to the ticket.",
    ticket_refund_amount_invalid: "Please enter a valid credit amount for the refund.",
    ticket_refund_max: "Maximum 100 credits per refund allowed.",
    ticket_no_qrx_id: "This ticket has no QR-X ID.",
    qrx_suspend_failed: "QR-X could not be suspended.",
    qrx_suspended_success: "QR-X has been suspended.",

    ticket_title_required: "Please enter a short title for the support case.",
    finance_title: "Finance overview",
    finance_export_csv: "CSV export",
    finance_provider: "Payment provider",
    finance_period: "Period",
    finance_total_revenue: "Total revenue",
    finance_net_revenue: "Net revenue",
    finance_tax: "Taxes / VAT",
    finance_refunds: "Refunds",
    finance_payouts: "Payouts",
    finance_invoices: "Invoices",
    finance_invoice_count: "Total invoices",
    finance_purchase_count: "Total purchases",
    finance_refund_count: "Total refunds",
    finance_load_error: "Finance data could not be loaded.",
    finance_payout_error: "Payouts could not be loaded.",

    pricing_title: "Pricing management",
    pricing_launch_discount: "Launch discount",
    pricing_credit_packs: "Credit packs",
    pricing_active: "Active",
    pricing_inactive: "Inactive",
    pricing_save_success: "Pricing pack was saved.",
    pricing_save_failed: "Pricing pack could not be saved.",
    pricing_load_error: "Pricing data could not be loaded.",

    credits_history_title: "Credit history",
    credits_current_balance: "Current credits",
    credits_total_purchased: "Purchased credits",
    credits_total_refunded: "Refunded credits",
    credits_granted_today: "Granted today",


    logs_title: "Admin action log",
    logs_hint: "Search critical changes: prices, credits, QR-X suspensions, support and verifications.",
    logs_refresh: "Refresh actions",
    logs_loaded_actions: "Loaded actions",
    logs_today: "Today",
    logs_filtered: "Filtered",
    logs_loaded_hint: "Currently loaded entries from the admin log.",
    logs_today_hint: "Admin actions today.",
    logs_filtered_hint: "Entries matching search and filters.",
    logs_search_placeholder: "Search by user ID, QR-X ID, note, action…",
    logs_action_label: "Action",
    logs_open_user: "Open user",
    logs_open_qrx: "Open QR-X",
    logs_load_moderation: "Load in moderation",
    admin_action_all_qrx_unsuspended: "All QR-X released",
    admin_action_all_qrx_suspended: "All QR-X suspended",
    admin_action_user_unbanned: "User unbanned",
    admin_action_user_banned: "User banned",
    admin_action_qrx_suspended: "QR-X suspended",
    admin_action_qrx_unsuspended: "QR-X released",
    admin_action_pricing_updated: "Pricing updated",
    admin_action_launch_discount_updated: "Launch discount changed",
    admin_action_refund_created: "Refund created",
    admin_action_unknown: "{{action}}",

    prices_section_title: "Price / credit configuration",
    prices_section_hint: "Manage credit packs carefully. Changes apply directly once app/web load prices from Supabase.",
    prices_refresh: "Refresh prices",
    prices_disable_launch_discount: "Disable launch discount",
    prices_enable_launch_discount: "Enable launch discount",
    prices_launch_discount_card: "Launch discount",
    prices_currency_card: "Currency",
    prices_active_packs_card: "Active packs",
    prices_daily_limit_card: "Daily admin credit limit",
    prices_launch_discount_active: "Active",
    prices_launch_discount_inactive: "Inactive",
    prices_launch_discount_hint: "Controls whether launch or regular prices are relevant.",
    prices_currency_hint: "Currency from the pricing configuration.",
    prices_active_packs_hint: "Packs currently marked as active.",
    prices_daily_limit_hint: "Credits that can still be granted manually today.",
    prices_launch_price_cents: "Launch price in cents",
    prices_regular_price_cents: "Regular price in cents",
    prices_badge: "Badge",
    prices_badge_placeholder: "e.g. Popular",
    prices_pack_active: "Pack active",
    prices_save_pack: "Save pack",
    prices_updated_at: "Updated",
    prices_id: "ID",
    prices_sorting: "Sort order",
    prices_credits_label: "Credits",
},
} as const;


const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #08111f 0%, #0b1323 100%)",
    color: "#f8fafc",
    padding: "32px 20px 56px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  } as const,
  container: {
    maxWidth: 1240,
    margin: "0 auto",
  } as const,
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap" as const,
    marginBottom: 22,
  },
  title: {
    fontSize: 34,
    fontWeight: 800,
    margin: 0,
    letterSpacing: -0.5,
  } as const,
  subtitle: {
    color: "#94a3b8",
    marginTop: 8,
    marginBottom: 0,
    fontSize: 17,
    lineHeight: 1.5,
  } as const,
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
    marginBottom: 18,
  } as const,
  storageDashboard: {
    borderRadius: 28,
    background:
      "radial-gradient(circle at top left, rgba(245,197,66,0.18), transparent 36%), linear-gradient(180deg, #0f172a 0%, #0b1324 100%)",
    border: "1px solid #26364f",
    padding: 20,
    marginBottom: 18,
    boxShadow: "0 22px 70px rgba(0,0,0,0.22)",
  } as const,
  storageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap" as const,
    marginBottom: 16,
  } as const,
  storageEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 11px",
    borderRadius: 999,
    background: "rgba(245,197,66,0.13)",
    border: "1px solid rgba(245,197,66,0.26)",
    color: "#fde68a",
    fontSize: 12,
    fontWeight: 900,
    marginBottom: 10,
  } as const,
  storageTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: 950,
    letterSpacing: -0.35,
  } as const,
  storageSubtitle: {
    margin: "8px 0 0",
    color: "#9fb1c8",
    fontSize: 14,
    lineHeight: 1.55,
    maxWidth: 780,
  } as const,
  storageStatusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    padding: "9px 12px",
    background: "#10291c",
    border: "1px solid #14532d",
    color: "#bbf7d0",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap" as const,
  } as const,
  storageMetricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 12,
    marginBottom: 12,
  } as const,
  storageMetricCard: {
    position: "relative" as const,
    overflow: "hidden",
    borderRadius: 20,
    background: "linear-gradient(180deg, #111c31 0%, #0d1728 100%)",
    border: "1px solid #2a3952",
    padding: 16,
    minHeight: 132,
  } as const,
  storageMetricIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0b1324",
    border: "1px solid #2a3952",
    marginBottom: 12,
    fontSize: 19,
  } as const,
  storageMetricLabel: {
    color: "#93a5bd",
    fontSize: 12,
    fontWeight: 900,
    marginBottom: 7,
    textTransform: "uppercase" as const,
    letterSpacing: 0.45,
  } as const,
  storageMetricValue: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: 950,
    letterSpacing: -0.35,
  } as const,
  storageMetricHint: {
    color: "#9fb1c8",
    fontSize: 12,
    lineHeight: 1.45,
    marginTop: 7,
  } as const,
  storageSectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
    marginTop: 12,
  } as const,
  storagePanel: {
    borderRadius: 22,
    background: "#0b1324",
    border: "1px solid #243044",
    padding: 16,
  } as const,
  storagePanelTitle: {
    margin: "0 0 12px",
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: 950,
  } as const,
  storageMiniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  } as const,
  storageMiniCard: {
    borderRadius: 16,
    background: "#111827",
    border: "1px solid #243044",
    padding: 12,
  } as const,
  storageMiniLabel: {
    color: "#93a5bd",
    fontSize: 11,
    fontWeight: 900,
    marginBottom: 6,
  } as const,
  storageMiniValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: 950,
  } as const,
  storageProgressTrack: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    background: "#111827",
    border: "1px solid #243044",
    marginTop: 12,
  } as const,
  storageProgressBar: {
    height: "100%",
    width: "0%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #f5c542, #22c55e)",
  } as const,
  storageTodoList: {
    display: "grid",
    gap: 8,
    marginTop: 8,
  } as const,
  storageTodoItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    borderRadius: 14,
    border: "1px solid #243044",
    background: "#111827",
    padding: "10px 12px",
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 800,
  } as const,
  storageDetailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 12,
    marginTop: 12,
  } as const,
  storageTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
    minWidth: 680,
  } as const,
  storageTableWrap: {
    width: "100%",
    overflowX: "auto",
    borderRadius: 16,
    border: "1px solid #243044",
    background: "#0b1324",
  } as const,
  storageTableTh: {
    textAlign: "left" as const,
    color: "#93a5bd",
    padding: "10px 10px",
    fontSize: 11,
    fontWeight: 950,
    borderBottom: "1px solid #243044",
    whiteSpace: "nowrap" as const,
  } as const,
  storageTableTd: {
    color: "#e2e8f0",
    padding: "10px 10px",
    fontSize: 12,
    borderBottom: "1px solid #172133",
    verticalAlign: "top" as const,
    whiteSpace: "nowrap" as const,
  } as const,
  storageFilename: {
    display: "inline-block",
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    color: "#f8fafc",
    fontWeight: 850,
  } as const,
  storageStatusPill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 8px",
    background: "#111827",
    border: "1px solid #243044",
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: 900,
  } as const,
  storageHealthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 10,
    marginTop: 10,
  } as const,
  storageFilterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    marginTop: 12,
    marginBottom: 12,
  } as const,
  storageFilterLabel: {
    display: "grid",
    gap: 6,
    color: "#93a5bd",
    fontSize: 12,
    fontWeight: 900,
  } as const,
  storageFilterInput: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #2d3f59",
    background: "#0b1324",
    color: "#f8fafc",
    padding: "10px 11px",
    fontSize: 13,
    boxSizing: "border-box" as const,
    outline: "none",
  } as const,
  storageFilterSelect: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #2d3f59",
    background: "#0b1324",
    color: "#f8fafc",
    padding: "10px 11px",
    fontSize: 13,
    boxSizing: "border-box" as const,
    outline: "none",
  } as const,
  storageFilterActions: {
    display: "flex",
    gap: 10,
    alignItems: "end",
    flexWrap: "wrap" as const,
  } as const,
  storageActionRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap" as const,
  } as const,
  storageIconButton: {
    border: "1px solid #2d3f59",
    borderRadius: 10,
    background: "#172133",
    color: "#f8fafc",
    padding: "8px 10px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12,
  } as const,
  storageWarningButton: {
    border: "1px solid #854d0e",
    borderRadius: 10,
    background: "#2c1806",
    color: "#fde68a",
    padding: "8px 10px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12,
  } as const,
  storageDetailPanel: {
    borderRadius: 22,
    background: "linear-gradient(180deg, #101b30 0%, #0b1324 100%)",
    border: "1px solid #2a3952",
    padding: 16,
    marginTop: 12,
  } as const,
  storageDetailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap" as const,
    marginBottom: 14,
  } as const,
  storageDetailTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: 950,
    letterSpacing: -0.2,
  } as const,
  storageDetailSub: {
    margin: "6px 0 0",
    color: "#93a5bd",
    fontSize: 12,
    lineHeight: 1.45,
    wordBreak: "break-word" as const,
  } as const,
  storageDetailGridInner: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  } as const,
  storageDetailMetric: {
    borderRadius: 16,
    border: "1px solid #243044",
    background: "#111827",
    padding: 12,
  } as const,
  storageDetailLabel: {
    color: "#93a5bd",
    fontSize: 11,
    fontWeight: 950,
    marginBottom: 6,
    textTransform: "uppercase" as const,
    letterSpacing: 0.4,
  } as const,
  storageDetailValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: 950,
    wordBreak: "break-word" as const,
  } as const,
  storageDetailHintBox: {
    borderRadius: 16,
    border: "1px solid #243044",
    background: "#0b1324",
    padding: 12,
    color: "#9fb1c8",
    fontSize: 12,
    lineHeight: 1.55,
    marginTop: 12,
  } as const,
  qualityExceptionBox: {
    marginTop: 14,
    borderRadius: 16,
    border: "1px solid #854d0e",
    background: "linear-gradient(180deg, #2c1806 0%, #1c1207 100%)",
    padding: 16,
  } as const,
  qualityExceptionTitle: {
    margin: "0 0 6px",
    color: "#fde68a",
    fontSize: 15,
    fontWeight: 950,
  } as const,
  qualityExceptionText: {
    margin: 0,
    color: "#fed7aa",
    fontSize: 12,
    lineHeight: 1.55,
  } as const,
  qualityExceptionStatus: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "7px 10px",
    background: "#0b1324",
    border: "1px solid #2d3f59",
    color: "#f8fafc",
    fontWeight: 900,
    fontSize: 12,
  } as const,

  metricCard: {
    borderRadius: 18,
    background: "#0f172a",
    border: "1px solid #243044",
    padding: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.14)",
  } as const,
  metricLabel: {
    color: "#93a5bd",
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 8,
  } as const,
  metricValue: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: -0.3,
  } as const,
  metricHint: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 1.45,
    marginTop: 6,
  } as const,
  commandGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 390px)",
    gap: 14,
    alignItems: "start",
    marginBottom: 18,
  } as const,
  commandPanel: {
    borderRadius: 20,
    background: "#0f172a",
    border: "1px solid #243044",
    padding: 16,
  } as const,
  actionsRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap" as const,
    marginBottom: 14,
  },
  refreshButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer",
  } as const,
  counterBadge: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "#111827",
    border: "1px solid #243044",
    color: "#cbd5e1",
    fontWeight: 700,
    fontSize: 14,
  } as const,
  filterWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#111827",
    border: "1px solid #243044",
  } as const,
  filterLabel: {
    color: "#cbd5e1",
    fontWeight: 700,
    fontSize: 14,
  } as const,
  filterSelect: {
    background: "#0b1324",
    color: "#f8fafc",
    border: "1px solid #2d3f59",
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 14,
    fontWeight: 700,
  } as const,
  searchInput: {
    minWidth: 240,
    flex: 1,
    background: "#0b1324",
    color: "#f8fafc",
    border: "1px solid #2d3f59",
    borderRadius: 12,
    padding: "11px 12px",
    fontSize: 14,
    outline: "none",
  } as const,
  stateCard: {
    padding: 22,
    borderRadius: 18,
    background: "#111827",
    border: "1px solid #1f2937",
    color: "#cbd5e1",
  } as const,
  grid: {
    display: "grid",
    gap: 18,
  } as const,
  card: {
    borderRadius: 20,
    background: "#0f172a",
    border: "1px solid #1f2937",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  } as const,
  cardBody: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 1fr) minmax(280px, 360px)",
    gap: 18,
    padding: 18,
  } as const,
  leftCol: {
    display: "grid",
    gap: 14,
  } as const,
  panel: {
    borderRadius: 16,
    border: "1px solid #223146",
    background: "#111b31",
    padding: 16,
  } as const,
  panelTitle: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: 800,
    marginBottom: 10,
  } as const,
  infoGrid: {
    display: "grid",
    gap: 10,
  } as const,
  infoRow: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: 10,
    alignItems: "start",
  } as const,
  infoLabel: {
    color: "#93a5bd",
    fontWeight: 700,
    fontSize: 13,
  } as const,
  infoValue: {
    color: "#f8fafc",
    fontSize: 15,
    lineHeight: 1.45,
    wordBreak: "break-word" as const,
  } as const,
  previewWrap: {
    borderRadius: 16,
    border: "1px dashed #30435f",
    background: "#0b1324",
    minHeight: 260,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  } as const,
  previewImage: {
    width: "100%",
    height: "auto",
    display: "block",
  } as const,
  pdfPreview: {
    width: "100%",
    height: 420,
    border: "none",
    background: "#fff",
  } as const,
  previewEmpty: {
    color: "#94a3b8",
    fontSize: 14,
    padding: 24,
    textAlign: "center" as const,
    lineHeight: 1.5,
  } as const,
  tabsWrap: {
    position: "sticky" as const,
    top: 0,
    zIndex: 20,
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    padding: "12px 0 16px",
    marginBottom: 10,
    background: "linear-gradient(180deg, rgba(8,17,31,0.98) 0%, rgba(8,17,31,0.86) 100%)",
    backdropFilter: "blur(12px)",
  },
  tabButton: {
    border: "1px solid #2a3952",
    background: "#0f172a",
    color: "#cbd5e1",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  tabButtonActive: {
    border: "1px solid #93c5fd",
    background: "#dbeafe",
    color: "#08111f",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  qrxButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    background: "#1d4ed8",
    color: "#eff6ff",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 800,
  } as const,
  secondaryLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    background: "#172133",
    color: "#f8fafc",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    border: "1px solid #2a3952",
  } as const,
  noteArea: {
    width: "100%",
    minHeight: 88,
    borderRadius: 14,
    border: "1px solid #2d3f59",
    background: "#0b1324",
    color: "#f8fafc",
    padding: 12,
    resize: "vertical" as const,
    fontSize: 14,
    lineHeight: 1.5,
    boxSizing: "border-box" as const,
  } as const,
  bottomRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
    marginTop: 12,
  },
  approveButton: {
    background: "#22c55e",
    color: "#052e16",
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer",
  } as const,
  rejectButton: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer",
  } as const,
  subtleText: {
    color: "#93a5bd",
    fontSize: 13,
    lineHeight: 1.45,
  } as const,
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#0b1324",
    border: "1px solid #28374f",
    color: "#dbeafe",
    fontWeight: 700,
    fontSize: 13,
  } as const,
  waitBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#2c1806",
    border: "1px solid #854d0e",
    color: "#fde68a",
    fontWeight: 800,
    fontSize: 13,
  } as const,
  formGrid: {
    display: "grid",
    gap: 10,
  } as const,
  input: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #2d3f59",
    background: "#0b1324",
    color: "#f8fafc",
    padding: "11px 12px",
    fontSize: 14,
    boxSizing: "border-box" as const,
    outline: "none",
  } as const,
  presetRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
  } as const,
  presetButton: {
    border: "1px solid #2d3f59",
    borderRadius: 12,
    background: "#172133",
    color: "#f8fafc",
    padding: "9px 12px",
    fontWeight: 800,
    cursor: "pointer",
  } as const,
  creditButton: {
    border: "none",
    borderRadius: 12,
    background: "#fbbf24",
    color: "#111827",
    padding: "12px 14px",
    fontWeight: 900,
    cursor: "pointer",
  } as const,
  historyBox: {
    marginTop: 14,
    borderTop: "1px solid #243044",
    paddingTop: 14,
  } as const,
  historyList: {
    display: "grid",
    gap: 8,
    marginTop: 10,
  } as const,
  historyItem: {
    borderRadius: 12,
    border: "1px solid #243044",
    background: "#0b1324",
    padding: 10,
  } as const,
  historyTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap" as const,
    color: "#f8fafc",
    fontWeight: 800,
    fontSize: 13,
  } as const,
  historyNote: {
    marginTop: 5,
    color: "#93a5bd",
    fontSize: 12,
    lineHeight: 1.45,
  } as const,
  ticketList: {
    display: "grid",
    gap: 10,
    marginTop: 12,
  } as const,
  ticketItem: {
    borderRadius: 14,
    border: "1px solid #243044",
    background: "#0b1324",
    padding: 12,
  } as const,
  ticketTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap" as const,
    alignItems: "center",
    marginBottom: 8,
  } as const,
  ticketTitle: {
    color: "#f8fafc",
    fontWeight: 900,
    fontSize: 14,
  } as const,
  ticketMeta: {
    color: "#93a5bd",
    fontSize: 12,
    lineHeight: 1.45,
  } as const,
  ticketStatusOpen: {
    borderRadius: 999,
    padding: "6px 10px",
    background: "#2c1806",
    border: "1px solid #854d0e",
    color: "#fde68a",
    fontSize: 12,
    fontWeight: 900,
  } as const,
  ticketStatusReview: {
    borderRadius: 999,
    padding: "6px 10px",
    background: "#102044",
    border: "1px solid #1d4ed8",
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: 900,
  } as const,
  ticketStatusResolved: {
    borderRadius: 999,
    padding: "6px 10px",
    background: "#10291c",
    border: "1px solid #14532d",
    color: "#bbf7d0",
    fontSize: 12,
    fontWeight: 900,
  } as const,
  lookupGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 10,
    marginTop: 12,
  } as const,
  lookupMiniCard: {
    borderRadius: 14,
    border: "1px solid #243044",
    background: "#0b1324",
    padding: 12,
  } as const,
  lookupMiniLabel: {
    color: "#93a5bd",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 6,
  } as const,
  lookupMiniValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: 900,
  } as const,

  tableWrap: {
    width: "100%",
    overflowX: "auto",
    borderRadius: 16,
    border: "1px solid #243044",
    background: "#0b1324",
  } as const,
  dataTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
    minWidth: 980,
  } as const,
  tableTh: {
    textAlign: "left" as const,
    padding: "12px 12px",
    color: "#93a5bd",
    fontSize: 12,
    fontWeight: 900,
    borderBottom: "1px solid #243044",
    whiteSpace: "nowrap" as const,
  } as const,
  tableTd: {
    padding: "12px 12px",
    color: "#e2e8f0",
    fontSize: 13,
    borderBottom: "1px solid #172133",
    verticalAlign: "top" as const,
    whiteSpace: "nowrap" as const,
  } as const,
  smallButton: {
    border: "1px solid #2d3f59",
    borderRadius: 10,
    background: "#172133",
    color: "#f8fafc",
    padding: "8px 10px",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 12,
  } as const,
  disabledSmallButton: {
    border: "1px solid #243044",
    borderRadius: 10,
    background: "#111827",
    color: "#64748b",
    padding: "8px 10px",
    fontWeight: 800,
    cursor: "not-allowed",
    fontSize: 12,
  } as const,

  resultBox: {
    borderRadius: 12,
    padding: 12,
    background: "#10291c",
    border: "1px solid #14532d",
    color: "#bbf7d0",
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.45,
  } as const,
};

function formatCategory(value: string | null) {
  if (!value) return "–";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatProblemType(value: string, t: (key: AdminTranslationKey) => string) {
  switch (value) {
    case "credits_wrong":
      return t("problem_credits_wrong");
    case "verification_waiting":
      return t("problem_verification_waiting");
    case "upload_problem":
      return t("problem_upload_problem");
    case "transfer_problem":
      return t("problem_transfer_problem");
    case "qrx_report":
      return t("problem_qrx_report");
    default:
      return t("problem_other");
  }
}

function formatTicketStatus(value: string, t: (key: AdminTranslationKey) => string) {
  switch (value) {
    case "in_review":
      return t("ticket_status_in_review");
    case "resolved":
      return t("ticket_status_resolved");
    default:
      return t("ticket_status_open");
  }
}

function formatModerationStatus(value: string | null | undefined, t: (key: AdminTranslationKey) => string) {
  switch (value) {
    case "flagged":
      return t("moderation_flagged");
    case "auto_suspended":
      return t("moderation_auto_suspended");
    case "ok":
      return t("moderation_ok");
    default:
      return t("moderation_unknown");
  }
}

function getModerationBadgeStyle(value: string | null | undefined) {
  if (value === "auto_suspended") {
    return {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 999,
      padding: "7px 10px",
      background: "#3f1111",
      border: "1px solid #991b1b",
      color: "#fecaca",
      fontWeight: 900,
      fontSize: 12,
    } as const;
  }

  if (value === "flagged") {
    return {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 999,
      padding: "7px 10px",
      background: "#2c1806",
      border: "1px solid #854d0e",
      color: "#fde68a",
      fontWeight: 900,
      fontSize: 12,
    } as const;
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "7px 10px",
    background: "#10291c",
    border: "1px solid #14532d",
    color: "#bbf7d0",
    fontWeight: 900,
    fontSize: 12,
  } as const;
}

function getTicketStatusStyle(value: string) {
  if (value === "resolved") return styles.ticketStatusResolved;
  if (value === "in_review") return styles.ticketStatusReview;
  return styles.ticketStatusOpen;
}

function formatAdminAction(value: string, t: (key: AdminTranslationKey) => string) {
  switch (value) {
    case "credits_added":
      return t("admin_action_credits_added");
    case "credits_refunded_from_ticket":
      return t("admin_action_credits_refunded_from_ticket");
    case "support_ticket_resolved_with_credit":
      return t("admin_action_support_ticket_resolved_with_credit");
    case "support_ticket_created":
      return t("admin_action_support_ticket_created");
    case "support_ticket_in_review":
      return t("admin_action_support_ticket_in_review");
    case "support_ticket_resolved":
      return t("admin_action_support_ticket_resolved");
    case "support_ticket_open":
      return t("admin_action_support_ticket_open");
    case "verification_approved":
      return t("admin_action_verification_approved");
    case "verification_rejected":
      return t("admin_action_verification_rejected");
    case "qrx_soft_deleted":
      return t("admin_action_qrx_soft_deleted");
    case "qrx_restored":
      return t("admin_action_qrx_restored");
    case "all_qrx_unsuspended":
      return t("admin_action_all_qrx_unsuspended");
    case "all_qrx_suspended":
      return t("admin_action_all_qrx_suspended");
    case "user_unbanned":
      return t("admin_action_user_unbanned");
    case "user_banned":
      return t("admin_action_user_banned");
    case "qrx_suspended":
      return t("admin_action_qrx_suspended");
    case "qrx_unsuspended":
      return t("admin_action_qrx_unsuspended");
    case "pricing_updated":
      return t("admin_action_pricing_updated");
    case "launch_discount_updated":
      return t("admin_action_launch_discount_updated");
    case "refund_created":
      return t("admin_action_refund_created");
    default:
      return t("admin_action_unknown").replace("{{action}}", value.replaceAll("_", " "));
  }
}

function getAverageWaitingDays(items: VerificationRequest[]) {
  if (items.length === 0) return 0;
  const sum = items.reduce((total, item) => total + (item.waiting_days || 0), 0);
  return Math.round((sum / items.length) * 10) / 10;
}

export default function AdminPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [sortMode, setSortMode] = useState<SortMode>("oldest");
  const [waitFilter, setWaitFilter] = useState<WaitFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [creditUserId, setCreditUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState("10");
  const [creditNote, setCreditNote] = useState("");
  const [creditWorking, setCreditWorking] = useState(false);
  const [creditResult, setCreditResult] = useState<string | null>(null);

  const [historyUserId, setHistoryUserId] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [creditHistory, setCreditHistory] = useState<CreditHistoryResult | null>(null);
  const [refundWorkingPurchaseId, setRefundWorkingPurchaseId] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingData, setPricingData] = useState<PricingResult | null>(null);
  const [pricingDrafts, setPricingDrafts] = useState<Record<string, PricingPackDraft>>({});
  const [pricingConfigDraft, setPricingConfigDraft] = useState<PricingConfigDraft>({
    free_storage_mb: "2",
    qrx_creation_credit_cost: "1",
    storage_pack_mb: "5",
    storage_pack_credit_cost: "1",
    max_upload_mb: "50",
    max_images_per_qrx: "20",
    max_documents_per_qrx: "20",
    max_updates: "5",
  });
  const [pricingSavingId, setPricingSavingId] = useState<string | null>(null);
  const [pricingConfigSaving, setPricingConfigSaving] = useState(false);
  const [pricingMessage, setPricingMessage] = useState<string | null>(null);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketWorking, setTicketWorking] = useState(false);
  const [ticketUserId, setTicketUserId] = useState("");
  const [ticketQrxId, setTicketQrxId] = useState("");
  const [ticketProblemType, setTicketProblemType] = useState<TicketProblemType>("credits_wrong");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketResult, setTicketResult] = useState<string | null>(null);
  const [ticketRefundAmounts, setTicketRefundAmounts] = useState<Record<string, string>>({});

  const [userLookupQuery, setUserLookupQuery] = useState("");
  const [userLookupLoading, setUserLookupLoading] = useState(false);
  const [userLookupResult, setUserLookupResult] = useState<UserLookupResult | null>(null);
  const [showUserQrxList, setShowUserQrxList] = useState(false);
  const [userModerationWorking, setUserModerationWorking] = useState(false);

  const [adminActions, setAdminActions] = useState<AdminActionLogEntry[]>([]);
  const [adminActionsLoading, setAdminActionsLoading] = useState(false);
  const [adminLogSearch, setAdminLogSearch] = useState("");
  const [adminLogTypeFilter, setAdminLogTypeFilter] = useState("all");

  const [qrxLookupId, setQrxLookupId] = useState("");
  const [qrxLookupLoading, setQrxLookupLoading] = useState(false);
  const [qrxAdminItem, setQrxAdminItem] = useState<QrxAdminItem | null>(null);
  const [qrxSuspendReason, setQrxSuspendReason] = useState("");
  const [qrxActionWorking, setQrxActionWorking] = useState(false);
  const [qrxStatsFollowerBoost, setQrxStatsFollowerBoost] = useState("0");
  const [qrxStatsViewBoost, setQrxStatsViewBoost] = useState("0");
  const [qrxStatsUniqueViewBoost, setQrxStatsUniqueViewBoost] = useState("0");
  const [qrxStatsWorking, setQrxStatsWorking] = useState(false);
  const [qrxStatsMessage, setQrxStatsMessage] = useState<string | null>(null);
  const [qrxQualityWorking, setQrxQualityWorking] = useState(false);
  const [qrxQualityMessage, setQrxQualityMessage] = useState<string | null>(null);
  const [qrxReportDetails, setQrxReportDetails] = useState<Record<string, QrxAdminItem>>({});
  const [reportedQrx, setReportedQrx] = useState<QrxAdminItem[]>([]);
  const [reportedQrxLoading, setReportedQrxLoading] = useState(false);
  const [reviewingQrxId, setReviewingQrxId] = useState<string | null>(null);
  const [storageMediaStats, setStorageMediaStats] = useState<StorageMediaStats | null>(null);
  const [storageMediaLoading, setStorageMediaLoading] = useState(false);
  const [storageMediaError, setStorageMediaError] = useState<string | null>(null);
  const [mediaTrafficStats, setMediaTrafficStats] = useState<MediaTrafficStats | null>(null);
  const [mediaTrafficLoading, setMediaTrafficLoading] = useState(false);
  const [mediaTrafficError, setMediaTrafficError] = useState<string | null>(null);
  const [mediaWarningFilter, setMediaWarningFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [mediaDashboardSection, setMediaDashboardSection] = useState<"overview" | "traffic" | "storage" | "jobs">("overview");
  const [storageMediaSearch, setStorageMediaSearch] = useState("");
  const [storageMediaTypeFilter, setStorageMediaTypeFilter] = useState("all");
  const [storageMediaStatusFilter, setStorageMediaStatusFilter] = useState("all");
  const [storageMediaMinMb, setStorageMediaMinMb] = useState("10");
  const [storageMediaSort, setStorageMediaSort] = useState("largest");
  const [selectedStorageMedia, setSelectedStorageMedia] = useState<StorageMediaItem | null>(null);
  const [storageReprocessWorkingId, setStorageReprocessWorkingId] = useState<string | null>(null);
  const [storageReprocessMessage, setStorageReprocessMessage] = useState<string | null>(null);
  const [mediaJobsData, setMediaJobsData] = useState<MediaJobsResult | null>(null);
  const [mediaJobsLoading, setMediaJobsLoading] = useState(false);
  const [mediaJobsProcessing, setMediaJobsProcessing] = useState(false);
  const [mediaJobsMessage, setMediaJobsMessage] = useState<string | null>(null);
  const [mediaJobRetryWorkingId, setMediaJobRetryWorkingId] = useState<string | null>(null);
  const [bulkMediaType, setBulkMediaType] = useState("image");
  const [bulkMediaStatus, setBulkMediaStatus] = useState("failed");
  const [bulkMediaMinMb, setBulkMediaMinMb] = useState("0");
  const [bulkMediaSearch, setBulkMediaSearch] = useState("");
  const [bulkMediaLimit, setBulkMediaLimit] = useState("100");
  const [bulkMediaPreview, setBulkMediaPreview] = useState<BulkMediaPreviewResult | null>(null);
  const [bulkMediaWorking, setBulkMediaWorking] = useState(false);
  const [bulkMediaMessage, setBulkMediaMessage] = useState<string | null>(null);
  const [mediaQueueAutoRun, setMediaQueueAutoRun] = useState(false);
  const [mediaQueueAutoRefresh, setMediaQueueAutoRefresh] = useState(false);
  const [mediaQueueLastRunAt, setMediaQueueLastRunAt] = useState<string | null>(null);

  const formatBytes = (bytes: number | null | undefined) => {
    const value = Number(bytes ?? 0);
    if (!Number.isFinite(value) || value <= 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = value;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size = size / 1024;
      unitIndex += 1;
    }

    const fractionDigits = unitIndex === 0 ? 0 : size >= 100 ? 0 : size >= 10 ? 1 : 2;
    return `${size.toFixed(fractionDigits).replace(".", ",")} ${units[unitIndex]}`;
  };

  const formatPercent = (value: number | null | undefined) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return "0 %";
    return `${num.toFixed(num >= 10 ? 1 : 2).replace(".", ",")} %`;
  };

  const formatNumber = (value: number | null | undefined) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return "0";
    return new Intl.NumberFormat("de-DE").format(Math.round(num));
  };

  const formatStorageStatus = (value: string | null | undefined) => {
    const status = String(value || "unknown").toLowerCase();
    if (status === "ready" || status === "done" || status === "optimized") return "Optimiert";
    if (status === "pending") return "Wartet";
    if (status === "processing") return "In Verarbeitung";
    if (status === "failed" || status === "error") return "Fehler";
    return status === "unknown" ? "Unbekannt" : status;
  };

  const getStorageStatusStyle = (value: string | null | undefined) => {
    const status = String(value || "").toLowerCase();

    if (status === "failed" || status === "error") {
      return {
        ...styles.storageStatusPill,
        background: "#3f1111",
        border: "1px solid #991b1b",
        color: "#fecaca",
      };
    }

    if (status === "pending" || status === "processing") {
      return {
        ...styles.storageStatusPill,
        background: "#2c1806",
        border: "1px solid #854d0e",
        color: "#fde68a",
      };
    }

    if (status === "ready" || status === "done" || status === "optimized") {
      return {
        ...styles.storageStatusPill,
        background: "#10291c",
        border: "1px solid #14532d",
        color: "#bbf7d0",
      };
    }

    return styles.storageStatusPill;
  };

  const fetchStorageMediaStats = async () => {
    try {
      setStorageMediaLoading(true);
      setStorageMediaError(null);

      const params = new URLSearchParams();
      if (storageMediaSearch.trim()) params.set("search", storageMediaSearch.trim());
      if (storageMediaTypeFilter !== "all") params.set("type", storageMediaTypeFilter);
      if (storageMediaStatusFilter !== "all") params.set("status", storageMediaStatusFilter);
      if (storageMediaMinMb.trim()) params.set("minMb", storageMediaMinMb.trim());
      params.set("sort", storageMediaSort);

      const query = params.toString();
      const res = await fetch(`/api/admin/media-stats${query ? `?${query}` : ""}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Media-Statistiken konnten nicht geladen werden.");
      }

      setStorageMediaStats(data as StorageMediaStats);
    } catch (error) {
      console.error("fetchStorageMediaStats error:", error);
      setStorageMediaError(
        error instanceof Error ? error.message : "Media-Statistiken konnten nicht geladen werden."
      );
    } finally {
      setStorageMediaLoading(false);
    }
  };

  const fetchMediaTrafficStats = async () => {
    try {
      setMediaTrafficLoading(true);
      setMediaTrafficError(null);

      const res = await fetch("/api/admin/media-traffic", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Traffic-Statistiken konnten nicht geladen werden.");
      }

      setMediaTrafficStats(data as MediaTrafficStats);
    } catch (error) {
      console.error("fetchMediaTrafficStats error:", error);
      setMediaTrafficError(
        error instanceof Error ? error.message : "Traffic-Statistiken konnten nicht geladen werden."
      );
    } finally {
      setMediaTrafficLoading(false);
    }
  };

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("overview");

  const [adminLanguage, setAdminLanguage] = useState<AdminLanguage>("de");
  const tAdmin = (
    key: AdminTranslationKey,
    values?: Record<string, string | number | null | undefined>
  ) => {
    const template = ADMIN_I18N[adminLanguage][key];

    if (!values) return template;

    return template.replace(/\{\{(\w+)\}\}/g, (_match: string, name: string) => {
      const value = values[name];
      return value == null ? "" : String(value);
    });
  };


  const syncQrxStatsDraft = (qrx: QrxAdminItem | null) => {
    setQrxStatsFollowerBoost(String(Math.max(0, Number(qrx?.manual_follower_boost ?? 0))));
    setQrxStatsViewBoost(String(Math.max(0, Number(qrx?.manual_view_boost ?? 0))));
    setQrxStatsUniqueViewBoost(String(Math.max(0, Number(qrx?.manual_unique_view_boost ?? 0))));
    setQrxStatsMessage(null);
    setQrxQualityMessage(null);
  };

  const todayIsoDate = new Date().toISOString().slice(0, 10);
  const monthStartIsoDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [financeFrom, setFinanceFrom] = useState(monthStartIsoDate);
  const [financeTo, setFinanceTo] = useState(todayIsoDate);
  const [financeProvider, setFinanceProvider] = useState("all");
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeData, setFinanceData] = useState<FinanceResult | null>(null);
  const [financeError, setFinanceError] = useState<string | null>(null);

  const [financePayoutLoading, setFinancePayoutLoading] = useState(false);
  const [financePayoutData, setFinancePayoutData] = useState<FinancePayoutResult | null>(null);
  const [financePayoutError, setFinancePayoutError] = useState<string | null>(null);



  const adminTabs: Array<{
    key: AdminTab;
    labelKey: AdminTranslationKey;
    hintKey: AdminTranslationKey;
  }> = [
    { key: "overview", labelKey: "tab_overview", hintKey: "tab_overview_hint" },
    { key: "verifications", labelKey: "tab_verifications", hintKey: "tab_verifications_hint" },
    { key: "reports", labelKey: "tab_reports", hintKey: "tab_reports_hint" },
    { key: "support", labelKey: "tab_support", hintKey: "tab_support_hint" },
    { key: "users", labelKey: "tab_users", hintKey: "tab_users_hint" },
    { key: "credits", labelKey: "tab_credits", hintKey: "tab_credits_hint" },
    { key: "finance", labelKey: "tab_finance", hintKey: "tab_finance_hint" },
    { key: "prices", labelKey: "tab_prices", hintKey: "tab_prices_hint" },
    { key: "logs", labelKey: "tab_logs", hintKey: "tab_logs_hint" },
  ];

  const formatPrice = (cents: number | null | undefined, currency?: string | null) => {
    if (typeof cents !== "number") return "–";

    const safeCurrency = currency || "EUR";

    try {
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: safeCurrency,
      }).format(cents / 100);
    } catch {
      return `${(cents / 100).toFixed(2).replace(".", ",")} ${safeCurrency}`;
    }
  };

  const formatCost = (cents: number | null | undefined) => formatPrice(cents, "EUR");

  const findInvoiceForPurchase = (purchase: CreditPurchaseEntry) => {
    return (creditHistory?.invoices ?? []).find((invoice) => {
      if (invoice.purchase_id && invoice.purchase_id === purchase.id) return true;
      if (
        purchase.stripe_payment_intent_id &&
        invoice.stripe_payment_intent_id === purchase.stripe_payment_intent_id
      ) {
        return true;
      }
      return false;
    });
  };

  const formatCreditPurchaseStatus = (status: string | null | undefined) => {
    const value = String(status || "").toLowerCase();

    switch (value) {
      case "paid":
      case "succeeded":
      case "completed":
        return tAdmin("purchase_status_paid");
      case "pending":
        return tAdmin("purchase_status_pending");
      case "failed":
        return tAdmin("purchase_status_failed");
      case "refunded":
        return tAdmin("purchase_status_refunded");
      case "canceled":
      case "cancelled":
        return tAdmin("purchase_status_canceled");
      default:
        return status || tAdmin("purchase_status_unknown");
    }
  };


  const formatProvider = (value: string | null | undefined) => {
    const provider = String(value || "stripe").toLowerCase();

    if (provider === "apple") return "Apple App Store";
    if (provider === "google") return "Google Play";
    if (provider === "stripe") return "Stripe Web";
    return provider;
  };

  const downloadFinanceCsv = () => {
    const params = new URLSearchParams();
    params.set("from", financeFrom);
    params.set("to", financeTo);
    if (financeProvider !== "all") params.set("provider", financeProvider);

    window.open(`/api/admin/finance/export-csv?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  const fetchFinance = async () => {
    try {
      setFinanceLoading(true);
      setFinanceError(null);

      const params = new URLSearchParams();
      params.set("from", financeFrom);
      params.set("to", financeTo);
      if (financeProvider !== "all") params.set("provider", financeProvider);

      const res = await fetch(`/api/admin/finance?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || tAdmin("finance_load_error"));
      }

      setFinanceData(data);
    } catch (error: unknown) {
      console.error("fetchFinance error:", error);
      setFinanceError(error instanceof Error ? error.message : tAdmin("finance_load_error"));
    } finally {
      setFinanceLoading(false);
    }
  };


  const fetchFinancePayouts = async () => {
    try {
      setFinancePayoutLoading(true);
      setFinancePayoutError(null);

      const params = new URLSearchParams();
      params.set("from", financeFrom);
      params.set("to", financeTo);
      if (financeProvider !== "all") params.set("provider", financeProvider);

      const res = await fetch(`/api/admin/finance/payouts?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || tAdmin("finance_payout_error"));
      }

      setFinancePayoutData(data);
    } catch (error: unknown) {
      console.error("fetchFinancePayouts error:", error);
      setFinancePayoutError(error instanceof Error ? error.message : tAdmin("finance_payout_error"));
    } finally {
      setFinancePayoutLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      setPricingLoading(true);

      const res = await fetch("/api/admin/credits", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || tAdmin("pricing_load_error"));
      }

      const packs = Array.isArray(data?.pricingPacks) ? data.pricingPacks : [];

      const loadedConfig = data?.pricingConfig ?? null;

      setPricingData({
        pricingConfig: loadedConfig,
        pricingPacks: packs,
        limits: data?.limits ?? undefined,
      });

      setPricingConfigDraft({
        free_storage_mb: String(Number(loadedConfig?.free_storage_mb ?? 2)),
        qrx_creation_credit_cost: String(Number(loadedConfig?.qrx_creation_credit_cost ?? 1)),
        storage_pack_mb: String(Number(loadedConfig?.storage_pack_mb ?? 5)),
        storage_pack_credit_cost: String(Number(loadedConfig?.storage_pack_credit_cost ?? 1)),
        max_upload_mb: String(Number(loadedConfig?.max_upload_mb ?? 50)),
        max_images_per_qrx: String(Number(loadedConfig?.max_images_per_qrx ?? 20)),
        max_documents_per_qrx: String(Number(loadedConfig?.max_documents_per_qrx ?? 20)),
        max_updates: String(Number(loadedConfig?.max_updates ?? 5)),
      });

      setPricingDrafts(
        packs.reduce((acc: Record<string, PricingPackDraft>, pack: PricingPack) => {
          acc[pack.id] = {
            price_cents_launch:
              typeof pack.price_cents_launch === "number" ? String(pack.price_cents_launch) : "",
            price_cents_regular:
              typeof pack.price_cents_regular === "number" ? String(pack.price_cents_regular) : "",
            badge: pack.badge || "",
            is_active: pack.is_active ? true : false,
          };
          return acc;
        }, {})
      );
      setPricingMessage(null);
    } catch (error) {
      console.error("fetchPricing error:", error);
    } finally {
      setPricingLoading(false);
    }
  };

  const handleToggleLaunchDiscount = async () => {
    try {
      if (!pricingData?.pricingConfig) {
        throw new Error("Preis-Konfiguration ist noch nicht geladen.");
      }

      const nextValue = !pricingData.pricingConfig.launch_discount_enabled;

      const confirmed = window.confirm(
        `Launch-Rabatt wirklich ${nextValue ? "aktivieren" : "deaktivieren"}?`
      );

      if (!confirmed) return;

      setPricingConfigSaving(true);
      setPricingMessage(null);

      const res = await fetch("/api/admin/credits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "config",
          launch_discount_enabled: nextValue,
          free_storage_mb: Number(pricingConfigDraft.free_storage_mb || 2),
          qrx_creation_credit_cost: Number(pricingConfigDraft.qrx_creation_credit_cost || 1),
          storage_pack_mb: Number(pricingConfigDraft.storage_pack_mb || 5),
          storage_pack_credit_cost: Number(pricingConfigDraft.storage_pack_credit_cost || 1),
          max_upload_mb: Number(pricingConfigDraft.max_upload_mb || 50),
          max_images_per_qrx: Number(pricingConfigDraft.max_images_per_qrx || 20),
          max_documents_per_qrx: Number(pricingConfigDraft.max_documents_per_qrx || 20),
          max_updates: Number(pricingConfigDraft.max_updates || 5),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Launch-Rabatt konnte nicht geändert werden.");
      }

      setPricingMessage(`Launch-Rabatt wurde ${nextValue ? "aktiviert" : "deaktiviert"}.`);
      await fetchPricing();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Launch-Rabatt konnte nicht geändert werden.");
    } finally {
      setPricingConfigSaving(false);
    }
  };

  const handlePricingDraftChange = (
    packId: string,
    field: keyof PricingPackDraft,
    value: string | boolean
  ) => {
    setPricingDrafts((prev) => ({
      ...prev,
      [packId]: {
        ...(prev[packId] || {
          price_cents_launch: "",
          price_cents_regular: "",
          badge: "",
          is_active: true,
        }),
        [field]: value,
      },
    }));
  };

  const handlePricingConfigDraftChange = (field: keyof PricingConfigDraft, value: string) => {
    setPricingConfigDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const parsePricingConfigNumber = (field: keyof PricingConfigDraft, label: string, minValue: number) => {
    const value = Number(pricingConfigDraft[field]);

    if (!Number.isInteger(value) || value < minValue) {
      throw new Error(`${label} muss eine ganze Zahl ab ${minValue} sein.`);
    }

    return value;
  };

  const handleSavePricingConfig = async () => {
    try {
      if (!pricingData?.pricingConfig) {
        throw new Error("Preis-Konfiguration ist noch nicht geladen.");
      }

      const payload = {
        free_storage_mb: parsePricingConfigNumber("free_storage_mb", "Freier Speicher", 0),
        qrx_creation_credit_cost: parsePricingConfigNumber("qrx_creation_credit_cost", "QR-X Erstellung", 0),
        storage_pack_mb: parsePricingConfigNumber("storage_pack_mb", "Speicherpaket-Größe", 1),
        storage_pack_credit_cost: parsePricingConfigNumber("storage_pack_credit_cost", "Speicherpaket-Kosten", 1),
        max_upload_mb: parsePricingConfigNumber("max_upload_mb", "Max. Upload", 1),
        max_images_per_qrx: parsePricingConfigNumber("max_images_per_qrx", "Max. Bilder", 0),
        max_documents_per_qrx: parsePricingConfigNumber("max_documents_per_qrx", "Max. Dateien", 0),
        max_updates: parsePricingConfigNumber("max_updates", "Max. Updates", 0),
      };

      const confirmed = window.confirm(
        `Plattform-Konfiguration wirklich speichern?\n\nFreier Speicher: ${payload.free_storage_mb} MB\nQR-X Erstellung: ${payload.qrx_creation_credit_cost} Credit(s)\nSpeicherpaket: ${payload.storage_pack_mb} MB = ${payload.storage_pack_credit_cost} Credit(s)`
      );

      if (!confirmed) return;

      setPricingConfigSaving(true);
      setPricingMessage(null);

      const res = await fetch("/api/admin/credits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "config",
          ...payload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Plattform-Konfiguration konnte nicht gespeichert werden.");
      }

      setPricingMessage("Plattform-Konfiguration wurde gespeichert.");
      await fetchPricing();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Plattform-Konfiguration konnte nicht gespeichert werden.");
    } finally {
      setPricingConfigSaving(false);
    }
  };

  const handleSavePricingPack = async (pack: PricingPack) => {
    try {
      const draft = pricingDrafts[pack.id];

      if (!draft) {
        throw new Error("Keine Änderungen gefunden.");
      }

      const launchCents = Number(draft.price_cents_launch);
      const regularCents = Number(draft.price_cents_regular);

      if (!Number.isInteger(launchCents) || launchCents < 0) {
        throw new Error("Launch-Preis muss als Cent-Betrag angegeben werden, z. B. 599 für 5,99 €.");
      }

      if (!Number.isInteger(regularCents) || regularCents < 0) {
        throw new Error("Normalpreis muss als Cent-Betrag angegeben werden, z. B. 999 für 9,99 €.");
      }

      const confirmed = window.confirm(
        `Preis-Paket "${pack.id}" wirklich speichern?\\n\\nLaunch: ${formatPrice(launchCents, pricingData?.pricingConfig?.currency)}\\nNormal: ${formatPrice(regularCents, pricingData?.pricingConfig?.currency)}\\nStatus: ${draft.is_active ? "Aktiv" : "Inaktiv"}`
      );

      if (!confirmed) return;

      setPricingSavingId(pack.id);
      setPricingMessage(null);

      const res = await fetch("/api/admin/credits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "pack",
          id: pack.id,
          price_cents_launch: launchCents,
          price_cents_regular: regularCents,
          badge: draft.badge.trim() || null,
          is_active: draft.is_active,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Paket konnte nicht gespeichert werden.");
      }

      setPricingMessage(`Paket ${pack.id} wurde gespeichert.`);
      await fetchPricing();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Paket konnte nicht gespeichert werden.");
    } finally {
      setPricingSavingId(null);
    }
  };

  const fetchReportedQrx = async () => {
    try {
      setReportedQrxLoading(true);

      const res = await fetch("/api/admin/qrx-status?reported=1", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Gemeldete QR-X konnten nicht geladen werden.");
      }

      setReportedQrx(Array.isArray(data?.qrx) ? data.qrx : []);
    } catch (error) {
      console.error("fetchReportedQrx error:", error);
    } finally {
      setReportedQrxLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/requests", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Fehler beim Laden");
      }

      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("fetchRequests error:", error);
      alert("Verifizierungsanträge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQrxReportDetailsForTickets = async (ticketList: SupportTicket[]) => {
    const qrxIds = Array.from(
      new Set(
        ticketList
          .map((ticket) => ticket.qrx_id)
          .filter((qrxId): qrxId is string => typeof qrxId === "string" && qrxId.length > 0)
      )
    ).slice(0, 20);

    if (qrxIds.length === 0) {
      setQrxReportDetails({});
      return;
    }

    const entries: Record<string, QrxAdminItem> = {};

    await Promise.all(
      qrxIds.map(async (qrxId) => {
        try {
          const res = await fetch(
            `/api/admin/qrx-status?qrxId=${encodeURIComponent(qrxId)}`,
            { cache: "no-store" }
          );

          const data = await res.json();

          if (res.ok && data?.qrx?.id) {
            entries[data.qrx.id] = data.qrx;
          }
        } catch (error) {
          console.error("fetchQrxReportDetailsForTickets item error:", error);
        }
      })
    );

    setQrxReportDetails(entries);
  };

  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const res = await fetch("/api/admin/support-tickets", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Supportfälle konnten nicht geladen werden.");
      }

      const nextTickets = Array.isArray(data) ? data : [];
      setTickets(nextTickets);
      await fetchQrxReportDetailsForTickets(nextTickets);
    } catch (error) {
      console.error("fetchTickets error:", error);
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchAdminActions = async () => {
    try {
      setAdminActionsLoading(true);
      const res = await fetch("/api/admin/action-log", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Admin-Aktionen konnten nicht geladen werden.");
      }

      setAdminActions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("fetchAdminActions error:", error);
    } finally {
      setAdminActionsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTickets();
    fetchReportedQrx();
    fetchPricing();
    fetchFinance();
    fetchFinancePayouts();
    fetchAdminActions();
  }, []);

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return requests.filter((item) => {
      if (waitFilter === "7" && (item.waiting_days || 0) < 7) return false;
      if (waitFilter === "14" && (item.waiting_days || 0) < 14) return false;

      if (!term) return true;

      const haystack = [
        item.id,
        item.qrx_id,
        item.owner_user_id,
        item.qrx_title,
        item.company_name,
        item.category,
        item.document_filename,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [requests, searchTerm, waitFilter]);

  const sortedRequests = useMemo(() => {
    const list = [...filteredRequests];

    switch (sortMode) {
      case "newest":
        list.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "company":
        list.sort((a, b) =>
          (a.company_name || "").localeCompare(b.company_name || "", "de", {
            sensitivity: "base",
          })
        );
        break;
      case "title":
        list.sort((a, b) =>
          (a.qrx_title || "").localeCompare(b.qrx_title || "", "de", {
            sensitivity: "base",
          })
        );
        break;
      case "oldest":
      default:
        list.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
    }

    return list;
  }, [filteredRequests, sortMode]);

  const oldestWaitingText = useMemo(() => {
    if (loading || requests.length === 0) return null;
    const maxDays = Math.max(...requests.map((item) => item.waiting_days || 0));
    return `Ältester offener Antrag: ${maxDays} ${maxDays === 1 ? "Tag" : "Tage"} in Prüfung`;
  }, [loading, requests]);

  const openCountText = useMemo(() => {
    if (loading) return "Lade offene Anträge…";
    if (requests.length === 0) return "Keine offenen Anträge";
    return `${requests.length} offene${requests.length === 1 ? "r Antrag" : " Anträge"}`;
  }, [loading, requests.length]);

  const avgWaitingDays = useMemo(() => getAverageWaitingDays(requests), [requests]);
  const olderThanSevenCount = useMemo(
    () => requests.filter((item) => (item.waiting_days || 0) >= 7).length,
    [requests]
  );

  const openTicketCount = useMemo(
    () => tickets.filter((ticket) => ticket.status !== "resolved").length,
    [tickets]
  );

  const reportedQrxCount = useMemo(
    () => reportedQrx.filter((qrx) => (qrx.report_count ?? 0) > 0 || qrx.moderation_status !== "ok").length,
    [reportedQrx]
  );

  const autoSuspendedQrxCount = useMemo(
    () => reportedQrx.filter((qrx) => qrx.suspended || qrx.moderation_status === "auto_suspended").length,
    [reportedQrx]
  );

  const activePricingPackCount = useMemo(
    () => pricingData?.pricingPacks.filter((pack) => pack.is_active).length ?? 0,
    [pricingData]
  );

  const creditsGrantedToday = pricingData?.limits?.creditsGrantedToday ?? 0;
  const lastAdminAction = adminActions[0] ?? null;

  const adminActionTypes = useMemo(() => {
    return Array.from(new Set(adminActions.map((entry) => entry.action_type))).sort();
  }, [adminActions]);

  const todayAdminActionsCount = useMemo(() => {
    const today = new Date().toDateString();

    return adminActions.filter((entry) => {
      return new Date(entry.created_at).toDateString() === today;
    }).length;
  }, [adminActions]);

  const filteredAdminActions = useMemo(() => {
    const term = adminLogSearch.trim().toLowerCase();

    return adminActions.filter((entry) => {
      if (adminLogTypeFilter !== "all" && entry.action_type !== adminLogTypeFilter) {
        return false;
      }

      if (!term) return true;

      const haystack = [
        entry.action_type,
        formatAdminAction(entry.action_type, tAdmin),
        entry.target_user_id || "",
        entry.qrx_id || "",
        entry.note || "",
        entry.amount != null ? String(entry.amount) : "",
        entry.created_at,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [adminActions, adminLogSearch, adminLogTypeFilter, adminLanguage]);

  const handleReview = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    try {
      setWorkingId(requestId);

      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          action,
          reviewNote: notes[requestId]?.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Review fehlgeschlagen");
      }

      setNotes((prev) => ({ ...prev, [requestId]: "" }));
      await fetchRequests();
    } catch (error: unknown) {
      console.error("handleReview error:", error);
      alert(error instanceof Error ? error.message : "Aktion fehlgeschlagen");
    } finally {
      setWorkingId(null);
    }
  };

  const handleAddCredits = async () => {
    try {
      setCreditWorking(true);
      setCreditResult(null);

      const amount = Number(creditAmount);

      if (!creditUserId.trim()) {
        throw new Error("Bitte eine User-ID eintragen.");
      }

      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("Bitte eine gültige Credit-Anzahl eintragen.");
      }

      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: creditUserId.trim(),
          amount,
          note: creditNote.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Credits konnten nicht gebucht werden.");
      }

      setCreditResult(
        `Gebucht: +${amount} Credits. Neuer Stand: ${data.newCredits ?? "unbekannt"} Credits.`
      );
      setCreditNote("");
      await fetchAdminActions();
    } catch (error: unknown) {
      console.error("handleAddCredits error:", error);
      alert(error instanceof Error ? error.message : "Credits konnten nicht gebucht werden.");
    } finally {
      setCreditWorking(false);
    }
  };

  const handleFetchCreditHistory = async () => {
    try {
      const userId = (historyUserId.trim() || creditUserId.trim()).trim();

      if (!userId) {
        throw new Error("Bitte eine User-ID für die Historie eintragen.");
      }

      setHistoryLoading(true);
      setCreditHistory(null);

      const res = await fetch(
        `/api/admin/credit-history?userId=${encodeURIComponent(userId)}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Credit-Historie konnte nicht geladen werden.");
      }

      setCreditHistory(data);
    } catch (error: unknown) {
      console.error("handleFetchCreditHistory error:", error);
      alert(error instanceof Error ? error.message : "Credit-Historie konnte nicht geladen werden.");
    } finally {
      setHistoryLoading(false);
    }
  };


  const handleRefundPurchase = async (purchase: CreditPurchaseEntry) => {
    try {
      if (!purchase.id) {
        throw new Error("Purchase-ID fehlt.");
      }

      const confirmed = window.confirm(
        `Diesen Kauf wirklich vollständig erstatten?\n\nCredits: ${purchase.credits ?? "–"}\nBetrag: ${formatPrice(purchase.amount_cents, purchase.currency || "EUR")}\n\nDie Credits werden dem Nutzer wieder abgezogen.`
      );

      if (!confirmed) return;

      setRefundWorkingPurchaseId(purchase.id);

      const res = await fetch("/api/admin/refund-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseId: purchase.id,
          note: "Admin-Erstattung aus Kaufhistorie",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erstattung konnte nicht durchgeführt werden.");
      }

      alert(
        `Erstattung durchgeführt.\nRefund: ${data.refundId}\nCredits entfernt: ${data.revokedCredits}\nNeuer Stand: ${data.newCredits}`
      );

      await handleFetchCreditHistory();
      await fetchAdminActions();
    } catch (error: unknown) {
      console.error("handleRefundPurchase error:", error);
      alert(error instanceof Error ? error.message : "Erstattung konnte nicht durchgeführt werden.");
    } finally {
      setRefundWorkingPurchaseId(null);
    }
  };

  const handleCreateTicket = async () => {
    try {
      setTicketWorking(true);
      setTicketResult(null);

      if (!ticketTitle.trim()) {
        throw new Error(tAdmin("ticket_title_required"));
      }

      const res = await fetch("/api/admin/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: ticketUserId.trim() || null,
          qrxId: ticketQrxId.trim() || null,
          problemType: ticketProblemType,
          title: ticketTitle.trim(),
          description: ticketDescription.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || tAdmin("ticket_create_failed"));
      }

      setTicketResult(`Supportfall angelegt: ${data.ticket?.ticket_number || data.ticket?.id || "OK"}`);
      setTicketTitle("");
      setTicketDescription("");
      setTicketQrxId("");
      await fetchTickets();
      await fetchAdminActions();
    } catch (error: unknown) {
      console.error("handleCreateTicket error:", error);
      alert(error instanceof Error ? error.message : tAdmin("ticket_create_failed"));
    } finally {
      setTicketWorking(false);
    }
  };

  const handleUpdateTicketStatus = async (
    ticketId: string,
    status: TicketStatus,
    refundAmount?: number
  ) => {
    try {
      const res = await fetch("/api/admin/support-tickets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          status,
          refundAmount: refundAmount ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || tAdmin("ticket_update_failed"));
      }

      if (refundAmount && refundAmount > 0) {
        setTicketRefundAmounts((prev) => ({ ...prev, [ticketId]: "" }));
        setCreditResult(
          `Supportfall gelöst und +${refundAmount} Credits erstattet. Neuer Stand: ${data.newCredits ?? "unbekannt"} Credits.`
        );
      }

     await fetchTickets();
await fetchAdminActions();

if (refundAmount && refundAmount > 0) {
  await handleFetchCreditHistory();
}
    } catch (error: unknown) {
      console.error("handleUpdateTicketStatus error:", error);
      alert(error instanceof Error ? error.message : tAdmin("ticket_update_failed"));
    }
  };

  const handleResolveTicketWithCredits = async (ticket: SupportTicket) => {
    const rawAmount = ticketRefundAmounts[ticket.id] ?? "";
    const amount = Number(rawAmount);

    if (!ticket.user_id) {
      alert(tAdmin("ticket_no_user_id"));
      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      alert(tAdmin("ticket_refund_amount_invalid"));
      return;
    }

    if (amount > 100) {
      alert(tAdmin("ticket_refund_max"));
      return;
    }

    await handleUpdateTicketStatus(ticket.id, "resolved", amount);
  };


  const handleSuspendTicketQrx = async (ticket: SupportTicket) => {
    try {
      if (!ticket.qrx_id) {
        alert(tAdmin("ticket_no_qrx_id"));
        return;
      }

      const reason =
        ticket.title?.trim() ||
        "QR-X wurde aufgrund einer Support-/Nutzermeldung zur Prüfung gesperrt.";

      const res = await fetch("/api/admin/qrx-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId: ticket.qrx_id,
          suspended: true,
          reason: `Aus Support-Ticket gesperrt: ${reason}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || tAdmin("qrx_suspend_failed"));
      }

      setQrxAdminItem(data.qrx);
      setQrxLookupId(data.qrx?.id || ticket.qrx_id);
      setQrxSuspendReason(data.qrx?.suspended_reason || "");

      await fetchTickets();
      await fetchAdminActions();

      alert(tAdmin("qrx_suspended_success"));
    } catch (error: unknown) {
      console.error("handleSuspendTicketQrx error:", error);
      alert(error instanceof Error ? error.message : tAdmin("qrx_suspend_failed"));
    }
  };


  const handleUserLookup = async () => {
    try {
      const query = userLookupQuery.trim();

      if (!query) {
        throw new Error("Bitte User-ID, QR-X-ID oder E-Mail eingeben.");
      }

      setUserLookupLoading(true);
      setUserLookupResult(null);

      const res = await fetch(
        `/api/admin/user-lookup?q=${encodeURIComponent(query)}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Nutzer konnte nicht gefunden werden.");
      }

      setUserLookupResult(data);
      setShowUserQrxList(false);

      if (data?.userId) {
        setCreditUserId(data.userId);
        setHistoryUserId(data.userId);
        setTicketUserId(data.userId);
      }
    } catch (error: unknown) {
      console.error("handleUserLookup error:", error);
      alert(error instanceof Error ? error.message : "Nutzer konnte nicht gefunden werden.");
    } finally {
      setUserLookupLoading(false);
    }
  };


  const handleUserModerationAction = async (
    action: "ban_user" | "unban_user" | "suspend_all_qrx" | "unsuspend_all_qrx"
  ) => {
    try {
      if (!userLookupResult?.userId) {
        throw new Error("Bitte zuerst einen Nutzer laden.");
      }

      const actionLabel =
        action === "ban_user"
          ? "Nutzer sperren"
          : action === "unban_user"
            ? "Nutzer entsperren"
            : action === "suspend_all_qrx"
              ? "Alle QR-X sperren"
              : "Alle QR-X freigeben";

      const confirmed = window.confirm(
        `${actionLabel} wirklich durchführen?`
      );

      if (!confirmed) return;

      let reason = "Admin-Aktion";

      if (action !== "unban_user") {
        reason =
          window.prompt(
            "Bitte Grund eingeben:",
            action === "suspend_all_qrx"
              ? "Missbrauch / gefährliche Inhalte"
              : action === "unsuspend_all_qrx"
                ? "Nach Prüfung wieder freigegeben"
                : "Wiederholter Missbrauch"
          ) || "Admin-Aktion";
      }

      setUserModerationWorking(true);

      const res = await fetch("/api/admin/user-lookup", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userLookupResult.userId,
          action,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Aktion konnte nicht durchgeführt werden.");
      }

      alert(`${actionLabel} erfolgreich durchgeführt.`);

      await handleUserLookup();
      await fetchAdminActions();
    } catch (error: unknown) {
      console.error("handleUserModerationAction error:", error);
      alert(error instanceof Error ? error.message : "Aktion konnte nicht durchgeführt werden.");
    } finally {
      setUserModerationWorking(false);
    }
  };

  const handleQrxLookup = async (forcedId?: string) => {
    try {
      const qrxId = (forcedId || qrxLookupId).trim();

      if (!qrxId) {
        throw new Error("Bitte eine QR-X-ID eingeben.");
      }

      setActiveAdminTab("reports");
      setQrxLookupLoading(true);
      setQrxAdminItem(null);

      const res = await fetch(
        `/api/admin/qrx-status?qrxId=${encodeURIComponent(qrxId)}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "QR-X konnte nicht geladen werden.");
      }

      let loadedQrx = (data.qrx ?? null) as QrxAdminItem | null;

      if (loadedQrx?.id) {
        try {
          const qualityRes = await fetch(
            `/api/admin/qrx-quality?qrxId=${encodeURIComponent(loadedQrx.id)}`,
            { cache: "no-store" }
          );
          const qualityData = await qualityRes.json();

          if (qualityRes.ok && qualityData?.qrx) {
            loadedQrx = {
              ...loadedQrx,
              force_original_quality: qualityData.qrx.force_original_quality ? true : false,
            };
          }
        } catch (qualityError) {
          console.warn("qrx-quality load skipped:", qualityError);
        }
      }

      setQrxAdminItem(loadedQrx);
      syncQrxStatsDraft(loadedQrx ?? null);
      setQrxLookupId(loadedQrx?.id || qrxId);
      setQrxSuspendReason(loadedQrx?.suspended_reason || "");
    } catch (error: unknown) {
      console.error("handleQrxLookup error:", error);
      alert(error instanceof Error ? error.message : "QR-X konnte nicht geladen werden.");
    } finally {
      setQrxLookupLoading(false);
    }
  };

  const handleMarkQrxReviewed = async (qrxId: string) => {
    try {
      setReviewingQrxId(qrxId);

      const res = await fetch("/api/admin/qrx-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId,
          moderationAction: "mark_reviewed",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "QR-X konnte nicht als geprüft markiert werden.");
      }

      setQrxAdminItem(data.qrx);
      setQrxReportDetails((prev) => ({
        ...prev,
        [data.qrx.id]: data.qrx,
      }));

      await fetchReportedQrx();
      await fetchTickets();
      await fetchAdminActions();

      alert("QR-X wurde als geprüft markiert.");
    } catch (error: unknown) {
      console.error("handleMarkQrxReviewed error:", error);
      alert(error instanceof Error ? error.message : "QR-X konnte nicht als geprüft markiert werden.");
    } finally {
      setReviewingQrxId(null);
    }
  };

  const handleSetQrxOriginalQuality = async (forceOriginalQuality: boolean) => {
    try {
      if (!qrxAdminItem?.id) {
        throw new Error("Bitte zuerst einen QR-X laden.");
      }

      const confirmed = window.confirm(
        forceOriginalQuality
          ? `Originalqualität für diesen QR-X erzwingen?

Nur für Ausnahmefälle verwenden. Explore, Karten und Listen bleiben weiterhin optimiert. Detailansicht, Galerie und Vollbild bevorzugen danach Originalbilder.`
          : `Originalqualität für diesen QR-X wieder ausschalten?

Danach nutzt der QR-X wieder die normale optimierte Bildauslieferung.`
      );

      if (!confirmed) return;

      setQrxQualityWorking(true);
      setQrxQualityMessage(null);

      const res = await fetch("/api/admin/qrx-quality", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId: qrxAdminItem.id,
          forceOriginalQuality,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Bildqualität konnte nicht geändert werden.");
      }

      const nextValue = data?.qrx?.force_original_quality ? true : false;

      setQrxAdminItem((prev) =>
        prev?.id === qrxAdminItem.id
          ? {
              ...prev,
              force_original_quality: nextValue,
            }
          : prev
      );

      setQrxReportDetails((prev) => ({
        ...prev,
        [qrxAdminItem.id]: {
          ...(prev[qrxAdminItem.id] ?? qrxAdminItem),
          force_original_quality: nextValue,
        },
      }));

      setQrxQualityMessage(
        nextValue
          ? "Originalqualität ist für diesen QR-X aktiv."
          : "Optimierte Bildauslieferung ist für diesen QR-X wieder aktiv."
      );

      await fetchAdminActions();
    } catch (error: unknown) {
      console.error("handleSetQrxOriginalQuality error:", error);
      alert(error instanceof Error ? error.message : "Bildqualität konnte nicht geändert werden.");
    } finally {
      setQrxQualityWorking(false);
    }
  };

  const handleSetQrxSuspended = async (suspended: boolean) => {
    try {
      if (!qrxAdminItem?.id) {
        throw new Error("Bitte zuerst einen QR-X laden.");
      }

      if (suspended && !qrxSuspendReason.trim()) {
        throw new Error("Bitte einen Sperrgrund eintragen.");
      }

      setQrxActionWorking(true);

      const res = await fetch("/api/admin/qrx-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId: qrxAdminItem.id,
          suspended,
          reason: suspended ? qrxSuspendReason.trim() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "QR-X Status konnte nicht geändert werden.");
      }

      setQrxAdminItem(data.qrx);
      syncQrxStatsDraft(data.qrx ?? null);
      setQrxSuspendReason(data.qrx?.suspended_reason || "");
      await fetchReportedQrx();
      await fetchAdminActions();
    } catch (error: unknown) {
      console.error("handleSetQrxSuspended error:", error);
      alert(error instanceof Error ? error.message : "QR-X Status konnte nicht geändert werden.");
    } finally {
      setQrxActionWorking(false);
    }
  };

  const handleSetQrxDeleted = async (deleteAction: "soft_delete" | "restore") => {
    try {
      if (!qrxAdminItem?.id) {
        throw new Error("Bitte zuerst einen QR-X laden.");
      }

      const isDelete = deleteAction === "soft_delete";

      if (isDelete && !qrxSuspendReason.trim()) {
        throw new Error("Bitte einen Löschgrund eintragen.");
      }

      const confirmed = window.confirm(
        isDelete
          ? "Diesen QR-X wirklich löschen? Er wird öffentlich ausgeblendet, bleibt aber in der Datenbank und kann wiederhergestellt werden."
          : "Diesen QR-X wirklich wiederherstellen?"
      );

      if (!confirmed) return;

      setQrxActionWorking(true);

      const res = await fetch("/api/admin/qrx-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId: qrxAdminItem.id,
          deleteAction,
          reason: isDelete ? qrxSuspendReason.trim() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            (isDelete ? "QR-X konnte nicht gelöscht werden." : "QR-X konnte nicht wiederhergestellt werden.")
        );
      }

      setQrxAdminItem(data.qrx);
      syncQrxStatsDraft(data.qrx ?? null);
      setQrxSuspendReason(data.qrx?.suspended_reason || data.qrx?.deleted_reason || "");

      await fetchReportedQrx();
      await fetchAdminActions();

      alert(isDelete ? "QR-X wurde gelöscht." : "QR-X wurde wiederhergestellt.");
    } catch (error: unknown) {
      console.error("handleSetQrxDeleted error:", error);
      alert(error instanceof Error ? error.message : "QR-X Aktion konnte nicht durchgeführt werden.");
    } finally {
      setQrxActionWorking(false);
    }
  };


  const handleSaveQrxStatsBoost = async () => {
    try {
      if (!qrxAdminItem?.id) {
        throw new Error("Bitte zuerst einen QR-X laden.");
      }

      const manualFollowerBoost = Number(qrxStatsFollowerBoost);
      const manualViewBoost = Number(qrxStatsViewBoost);
      const manualUniqueViewBoost = Number(qrxStatsUniqueViewBoost);

      if (
        !Number.isInteger(manualFollowerBoost) ||
        !Number.isInteger(manualViewBoost) ||
        !Number.isInteger(manualUniqueViewBoost) ||
        manualFollowerBoost < 0 ||
        manualViewBoost < 0 ||
        manualUniqueViewBoost < 0
      ) {
        throw new Error("Bitte nur ganze Zahlen ab 0 eintragen.");
      }

      const confirmed = window.confirm(
        `Statistik-Boost für diesen QR-X speichern?\n\n+${manualFollowerBoost} Follower\n+${manualViewBoost} Aufrufe\n+${manualUniqueViewBoost} eindeutige Aufrufe`
      );

      if (!confirmed) return;

      setQrxStatsWorking(true);
      setQrxStatsMessage(null);

      const res = await fetch("/api/admin/qrx-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId: qrxAdminItem.id,
          statsAction: "update_boosts",
          manualFollowerBoost,
          manualViewBoost,
          manualUniqueViewBoost,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "QR-X Statistik-Boost konnte nicht gespeichert werden.");
      }

      setQrxAdminItem(data.qrx);
      syncQrxStatsDraft(data.qrx ?? null);
      setQrxStatsMessage("Statistik-Boost wurde gespeichert.");
      await fetchAdminActions();
    } catch (error: unknown) {
      console.error("handleSaveQrxStatsBoost error:", error);
      alert(error instanceof Error ? error.message : "QR-X Statistik-Boost konnte nicht gespeichert werden.");
    } finally {
      setQrxStatsWorking(false);
    }
  };


  useEffect(() => {
    void fetchStorageMediaStats();
    void fetchMediaJobs();
    void fetchMediaTrafficStats();
  }, []);

  useEffect(() => {
    if (!mediaQueueAutoRefresh) return;

    const timer = window.setInterval(() => {
      void fetchMediaJobs();
      void fetchStorageMediaStats();
      void fetchMediaTrafficStats();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [mediaQueueAutoRefresh]);

  useEffect(() => {
    if (!mediaQueueAutoRun) return;

    const timer = window.setInterval(() => {
      void runMediaQueueBatch(3);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [mediaQueueAutoRun, mediaJobsProcessing]);

  const storageTotals = storageMediaStats?.totals;

  const storagePrimaryMetrics = [
    {
      icon: "💾",
      label: "Originalspeicher",
      value: storageMediaLoading ? "Lade…" : formatBytes(storageTotals?.originalBytes),
      hint: "Summe aller hochgeladenen Originaldateien aus qr_x_media.original_bytes.",
    },
    {
      icon: "⚡",
      label: "Optimierter Speicher",
      value: storageMediaLoading ? "Lade…" : formatBytes(storageTotals?.optimizedBytes),
      hint: "Summe der optimierten Medien, die an Nutzer ausgeliefert werden.",
    },
    {
      icon: "📉",
      label: "Gesamte Ersparnis",
      value: storageMediaLoading ? "Lade…" : formatBytes(storageTotals?.savedBytes),
      hint: "Differenz zwischen Originalen und optimierten Medien.",
    },
    {
      icon: "📊",
      label: "Komprimierungsrate",
      value: storageMediaLoading ? "Lade…" : formatPercent(storageTotals?.savingsPercent),
      hint: "Prozentuale Speicherersparnis durch die Media Engine.",
    },
  ];

  const storageLiveMetrics = [
    { label: "Bilder gesamt", value: storageMediaLoading ? "…" : formatNumber(storageTotals?.imageCount) },
    { label: "Dateien gesamt", value: storageMediaLoading ? "…" : formatNumber(storageTotals?.fileCount) },
    { label: "Optimierte Medien", value: storageMediaLoading ? "…" : formatNumber(storageTotals?.optimizedCount) },
    {
      label: "Fehler / Queue",
      value: storageMediaLoading
        ? "…"
        : `${formatNumber(storageTotals?.failedCount)} / ${formatNumber(storageTotals?.processingCount)}`,
    },
  ];

  const storagePerformanceMetrics = [
    { label: "Ø Original", value: storageMediaLoading ? "…" : formatBytes(storageTotals?.averageOriginalBytes) },
    { label: "Ø Optimiert", value: storageMediaLoading ? "…" : formatBytes(storageTotals?.averageOptimizedBytes) },
    { label: "Ø Ersparnis", value: storageMediaLoading ? "…" : formatPercent(storageTotals?.averageSavingsPercent) },
    { label: "Größte Datei", value: storageMediaLoading ? "…" : formatBytes(storageTotals?.largestOriginalBytes) },
  ];

  const storageSavingsProgress = Math.max(0, Math.min(100, Number(storageTotals?.savingsPercent ?? 0)));

  const renderStorageMediaTable = (
    title: string,
    description: string,
    rows: StorageMediaItem[]
  ) => (
    <div style={styles.storagePanel}>
      <h3 style={styles.storagePanelTitle}>{title}</h3>
      <p style={{ ...styles.storageMetricHint, marginTop: -4, marginBottom: 12 }}>{description}</p>

      {rows.length === 0 ? (
        <div style={styles.stateCard}>Noch keine Media-Daten vorhanden.</div>
      ) : (
        <div style={styles.storageTableWrap}>
          <table style={styles.storageTable}>
            <thead>
              <tr>
                <th style={styles.storageTableTh}>Datei</th>
                <th style={styles.storageTableTh}>Typ</th>
                <th style={styles.storageTableTh}>Original</th>
                <th style={styles.storageTableTh}>Optimiert</th>
                <th style={styles.storageTableTh}>Ersparnis</th>
                <th style={styles.storageTableTh}>Status</th>
                <th style={styles.storageTableTh}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={`${title}-${item.id}`}>
                  <td style={styles.storageTableTd}>
                    <span title={item.filename || item.id} style={styles.storageFilename}>
                      {item.filename || item.id}
                    </span>
                  </td>
                  <td style={styles.storageTableTd}>{item.type || "–"}</td>
                  <td style={styles.storageTableTd}>{formatBytes(item.originalBytes)}</td>
                  <td style={styles.storageTableTd}>{formatBytes(item.optimizedBytes)}</td>
                  <td style={styles.storageTableTd}>
                    {formatBytes(item.savedBytes)} · {formatPercent(item.savingsPercent)}
                  </td>
                  <td style={styles.storageTableTd}>
                    <span style={getStorageStatusStyle(item.processing_status)}>
                      {formatStorageStatus(item.processing_status)}
                    </span>
                  </td>
                  <td style={styles.storageTableTd}>
                    <div style={styles.storageActionRow}>
                      <button
                        type="button"
                        onClick={() => setSelectedStorageMedia(item)}
                        style={styles.storageIconButton}
                        title="Details anzeigen"
                      >
                        👁 Details
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReprocessStorageMedia(item)}
                        disabled={storageReprocessWorkingId === item.id}
                        style={styles.storageWarningButton}
                        title="Reprocessing starten"
                      >
                        {storageReprocessWorkingId === item.id ? "Läuft…" : "🔄 Reprocess"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const fetchMediaJobs = async () => {
    try {
      setMediaJobsLoading(true);
      setMediaJobsMessage(null);

      const res = await fetch("/api/admin/media-jobs", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Media Jobs konnten nicht geladen werden.");
      }

      setMediaJobsData(data as MediaJobsResult);
    } catch (error) {
      setMediaJobsMessage(error instanceof Error ? error.message : "Media Jobs konnten nicht geladen werden.");
    } finally {
      setMediaJobsLoading(false);
    }
  };

  const processNextMediaJob = async () => {
    try {
      setMediaJobsProcessing(true);
      setMediaJobsMessage(null);

      const res = await fetch("/api/admin/media-jobs/process", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Media Job konnte nicht verarbeitet werden.");
      }

      setMediaQueueLastRunAt(new Date().toISOString());
      setMediaJobsMessage(data?.processed ? "Ein Media Job wurde verarbeitet." : "Keine wartenden Media Jobs vorhanden.");
      await fetchMediaJobs();
      await fetchStorageMediaStats();

      return data?.processed ? true : false;
    } catch (error) {
      setMediaJobsMessage(error instanceof Error ? error.message : "Media Job konnte nicht verarbeitet werden.");
      return false;
    } finally {
      setMediaJobsProcessing(false);
    }
  };

  const runMediaQueueBatch = async (maxJobs = 5) => {
    if (mediaJobsProcessing) return;

    try {
      setMediaJobsProcessing(true);
      setMediaJobsMessage(null);

      let processedCount = 0;

      for (let index = 0; index < maxJobs; index += 1) {
        const res = await fetch("/api/admin/media-jobs/process", {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Media Job konnte nicht verarbeitet werden.");
        }

        if (!data?.processed) break;
        processedCount += 1;
      }

      setMediaQueueLastRunAt(new Date().toISOString());
      setMediaJobsMessage(
        processedCount > 0
          ? `${processedCount} Media Job(s) wurden verarbeitet.`
          : "Keine wartenden Media Jobs vorhanden."
      );

      await fetchMediaJobs();
      await fetchStorageMediaStats();
    } catch (error) {
      setMediaJobsMessage(error instanceof Error ? error.message : "Media Queue konnte nicht verarbeitet werden.");
    } finally {
      setMediaJobsProcessing(false);
    }
  };

  const handleReprocessStorageMedia = async (media: StorageMediaItem) => {
    try {
      setStorageReprocessWorkingId(media.id);
      setStorageReprocessMessage(null);

      const res = await fetch("/api/admin/media-reprocess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: media.id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Reprocessing konnte nicht gestartet werden.");
      }

      setStorageReprocessMessage(`Reprocessing-Job wurde für ${media.filename || media.id} angelegt.`);
      await fetchStorageMediaStats();
      await fetchMediaJobs();

      setSelectedStorageMedia((prev) =>
        prev?.id === media.id ? { ...prev, processing_status: "queued" } : prev
      );
    } catch (error) {
      setStorageReprocessMessage(
        error instanceof Error ? error.message : "Reprocessing konnte nicht gestartet werden."
      );
    } finally {
      setStorageReprocessWorkingId(null);
    }
  };

  const renderStorageMediaDetailPanel = () => {
    if (!selectedStorageMedia) {
      return (
        <div style={styles.storageDetailPanel}>
          <div style={styles.storageDetailHeader}>
            <div>
              <h3 style={styles.storageDetailTitle}>Media Detailpanel</h3>
              <p style={styles.storageDetailSub}>
                Wähle in der Tabelle eine Datei über „Details“ aus, um Speicherwerte, QR-X-ID und Status genauer zu prüfen.
              </p>
            </div>
          </div>
          <div style={styles.storageDetailHintBox}>
            Noch keine Datei ausgewählt. Das Panel ist vorbereitet für spätere Funktionen wie Reprocessing,
            Cache leeren, Download-Analyse und Traffic-Verursacher.
          </div>
        </div>
      );
    }

    return (
      <div style={styles.storageDetailPanel}>
        <div style={styles.storageDetailHeader}>
          <div>
            <h3 style={styles.storageDetailTitle}>
              {selectedStorageMedia.filename || "Unbenanntes Medium"}
            </h3>
            <p style={styles.storageDetailSub}>
              Media-ID: {selectedStorageMedia.id}
              <br />
              QR-X-ID: {selectedStorageMedia.qrx_id || "–"}
            </p>
          </div>

          <div style={styles.storageActionRow}>
            <button
              type="button"
              onClick={() => void handleReprocessStorageMedia(selectedStorageMedia)}
              disabled={storageReprocessWorkingId === selectedStorageMedia.id}
              style={styles.storageWarningButton}
            >
              {storageReprocessWorkingId === selectedStorageMedia.id ? "Läuft…" : "🔄 Reprocessing starten"}
            </button>
            <button type="button" onClick={() => setSelectedStorageMedia(null)} style={styles.smallButton}>
              Schließen
            </button>
          </div>
        </div>

        <div style={styles.storageDetailGridInner}>
          <div style={styles.storageDetailMetric}>
            <div style={styles.storageDetailLabel}>Typ</div>
            <div style={styles.storageDetailValue}>{selectedStorageMedia.type || "–"}</div>
          </div>
          <div style={styles.storageDetailMetric}>
            <div style={styles.storageDetailLabel}>Status</div>
            <div style={styles.storageDetailValue}>
              <span style={getStorageStatusStyle(selectedStorageMedia.processing_status)}>
                {formatStorageStatus(selectedStorageMedia.processing_status)}
              </span>
            </div>
          </div>
          <div style={styles.storageDetailMetric}>
            <div style={styles.storageDetailLabel}>Originalgröße</div>
            <div style={styles.storageDetailValue}>{formatBytes(selectedStorageMedia.originalBytes)}</div>
          </div>
          <div style={styles.storageDetailMetric}>
            <div style={styles.storageDetailLabel}>Optimierte Größe</div>
            <div style={styles.storageDetailValue}>{formatBytes(selectedStorageMedia.optimizedBytes)}</div>
          </div>
          <div style={styles.storageDetailMetric}>
            <div style={styles.storageDetailLabel}>Ersparnis</div>
            <div style={styles.storageDetailValue}>{formatBytes(selectedStorageMedia.savedBytes)}</div>
          </div>
          <div style={styles.storageDetailMetric}>
            <div style={styles.storageDetailLabel}>Ersparnis in %</div>
            <div style={styles.storageDetailValue}>{formatPercent(selectedStorageMedia.savingsPercent)}</div>
          </div>
        </div>

        {storageReprocessMessage ? (
          <div style={styles.storageDetailHintBox}>{storageReprocessMessage}</div>
        ) : (
          <div style={styles.storageDetailHintBox}>
            Reprocessing setzt dieses Medium auf „queued“ und startet anschließend den bestehenden Image-Processor.
            Dadurch wird dieselbe Media Engine genutzt wie beim normalen Upload.
          </div>
        )}
      </div>
    );
  };

  const buildBulkMediaPayload = (dryRun: boolean) => ({
    type: bulkMediaType,
    status: bulkMediaStatus,
    minMb: bulkMediaMinMb,
    search: bulkMediaSearch,
    limit: bulkMediaLimit,
    dryRun,
  });

  const previewBulkMediaJobs = async () => {
    try {
      setBulkMediaWorking(true);
      setBulkMediaMessage(null);

      const res = await fetch("/api/admin/media-jobs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBulkMediaPayload(true)),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Bulk-Vorschau konnte nicht geladen werden.");
      }

      setBulkMediaPreview(data as BulkMediaPreviewResult);
      setBulkMediaMessage(`${formatNumber(data?.matchedCount)} Medien passen zu den Filtern.`);
    } catch (error) {
      setBulkMediaMessage(error instanceof Error ? error.message : "Bulk-Vorschau konnte nicht geladen werden.");
    } finally {
      setBulkMediaWorking(false);
    }
  };

  const createBulkMediaJobs = async () => {
    try {
      setBulkMediaWorking(true);
      setBulkMediaMessage(null);

      const res = await fetch("/api/admin/media-jobs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBulkMediaPayload(false)),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Bulk-Reprocess konnte nicht gestartet werden.");
      }

      setBulkMediaMessage(`${formatNumber(data?.createdCount)} Bulk Job(s) wurden angelegt.`);
      await fetchMediaJobs();
      await fetchStorageMediaStats();
      await previewBulkMediaJobs();
    } catch (error) {
      setBulkMediaMessage(error instanceof Error ? error.message : "Bulk-Reprocess konnte nicht gestartet werden.");
    } finally {
      setBulkMediaWorking(false);
    }
  };

  const retryFailedMediaJob = async (jobId: string) => {
    try {
      setMediaJobRetryWorkingId(jobId);
      setMediaJobsMessage(null);

      const res = await fetch("/api/admin/media-jobs/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Media Job konnte nicht erneut gestartet werden.");
      }

      setMediaJobsMessage("Fehlgeschlagener Media Job wurde zurück in die Queue gesetzt.");
      await fetchMediaJobs();
      await fetchStorageMediaStats();
    } catch (error) {
      setMediaJobsMessage(
        error instanceof Error ? error.message : "Media Job konnte nicht erneut gestartet werden."
      );
    } finally {
      setMediaJobRetryWorkingId(null);
    }
  };

  const renderBulkMediaJobsPanel = () => (
    <div style={styles.storagePanel}>
      <div style={styles.storageDetailHeader}>
        <div>
          <h3 style={styles.storagePanelTitle}>Bulk Media Jobs</h3>
          <p style={{ ...styles.storageMetricHint, marginTop: -4 }}>
            Erzeuge viele Reprocess-Jobs auf einmal. Die Queue verarbeitet sie danach kontrolliert nacheinander.
          </p>
        </div>
      </div>

      <div style={styles.storageFilterGrid}>
        <label style={styles.storageFilterLabel}>
          Typ
          <select
            value={bulkMediaType}
            onChange={(event) => setBulkMediaType(event.target.value)}
            style={styles.storageFilterSelect}
          >
            <option value="all">Alle Bilder/Logos</option>
            <option value="image">Nur Bilder</option>
            <option value="logo">Nur Logos</option>
          </select>
        </label>

        <label style={styles.storageFilterLabel}>
          Status
          <select
            value={bulkMediaStatus}
            onChange={(event) => setBulkMediaStatus(event.target.value)}
            style={styles.storageFilterSelect}
          >
            <option value="failed">Nur fehlgeschlagene</option>
            <option value="queued">Nur wartende</option>
            <option value="ready">Bereits optimierte</option>
            <option value="not_optimized">Noch nicht optimierte</option>
            <option value="all">Alle</option>
          </select>
        </label>

        <label style={styles.storageFilterLabel}>
          Mindestgröße MB
          <input
            value={bulkMediaMinMb}
            onChange={(event) => setBulkMediaMinMb(event.target.value)}
            inputMode="decimal"
            style={styles.storageFilterInput}
          />
        </label>

        <label style={styles.storageFilterLabel}>
          Limit
          <input
            value={bulkMediaLimit}
            onChange={(event) => setBulkMediaLimit(event.target.value)}
            inputMode="numeric"
            style={styles.storageFilterInput}
          />
        </label>

        <label style={styles.storageFilterLabel}>
          Suche
          <input
            value={bulkMediaSearch}
            onChange={(event) => setBulkMediaSearch(event.target.value)}
            placeholder="Dateiname oder QR-X-ID…"
            style={styles.storageFilterInput}
          />
        </label>

        <div style={styles.storageFilterActions}>
          <button
            type="button"
            onClick={previewBulkMediaJobs}
            disabled={bulkMediaWorking}
            style={styles.smallButton}
          >
            {bulkMediaWorking ? "Lade…" : "Vorschau"}
          </button>
          <button
            type="button"
            onClick={createBulkMediaJobs}
            disabled={bulkMediaWorking}
            style={styles.storageWarningButton}
          >
            {bulkMediaWorking ? "Erstelle…" : "Bulk-Reprocess starten"}
          </button>
        </div>
      </div>

      {bulkMediaMessage ? <div style={styles.storageDetailHintBox}>{bulkMediaMessage}</div> : null}

      {bulkMediaPreview ? (
        <div style={{ ...styles.storageTableWrap, marginTop: 12 }}>
          <table style={styles.storageTable}>
            <thead>
              <tr>
                <th style={styles.storageTableTh}>Datei</th>
                <th style={styles.storageTableTh}>Typ</th>
                <th style={styles.storageTableTh}>Status</th>
                <th style={styles.storageTableTh}>Original</th>
                <th style={styles.storageTableTh}>QR-X</th>
              </tr>
            </thead>
            <tbody>
              {(bulkMediaPreview.sample ?? []).map((item) => (
                <tr key={item.id}>
                  <td style={styles.storageTableTd}>
                    <span style={styles.storageFilename} title={item.filename || item.id}>
                      {item.filename || item.id}
                    </span>
                  </td>
                  <td style={styles.storageTableTd}>{item.type || "–"}</td>
                  <td style={styles.storageTableTd}>
                    <span style={getStorageStatusStyle(item.processing_status)}>
                      {formatStorageStatus(item.processing_status)}
                    </span>
                  </td>
                  <td style={styles.storageTableTd}>{formatBytes(item.original_bytes)}</td>
                  <td style={styles.storageTableTd}>
                    <span style={styles.storageFilename} title={item.qrx_id || ""}>
                      {item.qrx_id || "–"}
                    </span>
                  </td>
                </tr>
              ))}

              {(bulkMediaPreview.sample ?? []).length === 0 ? (
                <tr>
                  <td style={styles.storageTableTd} colSpan={5}>Keine passenden Medien gefunden.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );

  const renderMediaJobsPanel = () => {
    const summary = mediaJobsData?.summary;
    const queued = Number(summary?.queued ?? 0);
    const processing = Number(summary?.processing ?? 0);
    const failed = Number(summary?.failed ?? 0);
    const workerState = mediaJobsProcessing ? "Working" : queued > 0 ? "Idle · Jobs warten" : "Idle";
    const lastRunLabel = mediaQueueLastRunAt
      ? new Date(mediaQueueLastRunAt).toLocaleTimeString("de-DE")
      : "Noch nicht gestartet";

    return (
      <div style={styles.storagePanel}>
        <div style={styles.storageDetailHeader}>
          <div>
            <h3 style={styles.storagePanelTitle}>Media Queue Manager</h3>
            <p style={{ ...styles.storageMetricHint, marginTop: -4 }}>
              Kontrolliere die Warteschlange für Reprocessing, spätere Bulk-Jobs und Media Engine Aufgaben.
            </p>
          </div>

          <div style={styles.storageActionRow}>
            <button
              type="button"
              onClick={() => setMediaQueueAutoRun((value) => !value)}
              style={mediaQueueAutoRun ? styles.approveButton : styles.storageWarningButton}
            >
              {mediaQueueAutoRun ? "🟢 Auto Queue: EIN" : "⚪ Auto Queue: AUS"}
            </button>

            <button
              type="button"
              onClick={() => setMediaQueueAutoRefresh((value) => !value)}
              style={mediaQueueAutoRefresh ? styles.approveButton : styles.smallButton}
            >
              {mediaQueueAutoRefresh ? "↻ Auto Refresh: EIN" : "↻ Auto Refresh: AUS"}
            </button>
          </div>
        </div>

        <div style={styles.storageHealthGrid}>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Worker Status</div>
            <div style={styles.storageMiniValue}>{workerState}</div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Letzter Lauf</div>
            <div style={styles.storageMiniValue}>{lastRunLabel}</div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Offen</div>
            <div style={styles.storageMiniValue}>{formatNumber(queued)}</div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Fehler</div>
            <div style={styles.storageMiniValue}>{formatNumber(failed)}</div>
          </div>
        </div>

        <div style={{ ...styles.storageHealthGrid, marginBottom: 12 }}>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Queued</div>
            <div style={styles.storageMiniValue}>{formatNumber(summary?.queued)}</div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Processing</div>
            <div style={styles.storageMiniValue}>{formatNumber(processing)}</div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Done</div>
            <div style={styles.storageMiniValue}>{formatNumber(summary?.done)}</div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Geladen</div>
            <div style={styles.storageMiniValue}>{formatNumber(summary?.totalLoaded)}</div>
          </div>
        </div>

        <div style={styles.storageActionRow}>
          <button
            type="button"
            onClick={fetchMediaJobs}
            disabled={mediaJobsLoading}
            style={styles.smallButton}
          >
            {mediaJobsLoading ? "Lade…" : "Jobs aktualisieren"}
          </button>
          <button
            type="button"
            onClick={processNextMediaJob}
            disabled={mediaJobsProcessing}
            style={styles.storageWarningButton}
          >
            {mediaJobsProcessing ? "Verarbeitet…" : "Nächsten Job verarbeiten"}
          </button>
          <button
            type="button"
            onClick={() => void runMediaQueueBatch(5)}
            disabled={mediaJobsProcessing}
            style={styles.refreshButton}
          >
            {mediaJobsProcessing ? "Batch läuft…" : "Bis zu 5 Jobs verarbeiten"}
          </button>
        </div>

        {mediaJobsMessage ? <div style={styles.storageDetailHintBox}>{mediaJobsMessage}</div> : null}

        <div style={{ ...styles.storageTableWrap, marginTop: 12 }}>
          <table style={styles.storageTable}>
            <thead>
              <tr>
                <th style={styles.storageTableTh}>Job</th>
                <th style={styles.storageTableTh}>Media</th>
                <th style={styles.storageTableTh}>Status</th>
                <th style={styles.storageTableTh}>Versuche</th>
                <th style={styles.storageTableTh}>Grund</th>
                <th style={styles.storageTableTh}>Erstellt</th>
                <th style={styles.storageTableTh}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {(mediaJobsData?.jobs ?? []).slice(0, 12).map((job) => (
                <tr key={job.id}>
                  <td style={styles.storageTableTd}>
                    <span style={styles.storageFilename} title={job.id}>{job.id}</span>
                  </td>
                  <td style={styles.storageTableTd}>
                    <span style={styles.storageFilename} title={job.media_id}>{job.media_id}</span>
                  </td>
                  <td style={styles.storageTableTd}>
                    <span style={getStorageStatusStyle(job.status)}>{formatStorageStatus(job.status)}</span>
                  </td>
                  <td style={styles.storageTableTd}>{formatNumber(job.attempts)}</td>
                  <td style={styles.storageTableTd}>{job.reason || "–"}</td>
                  <td style={styles.storageTableTd}>
                    {job.created_at ? new Date(job.created_at).toLocaleString("de-DE") : "–"}
                  </td>
                  <td style={styles.storageTableTd}>
                    {String(job.status || "").toLowerCase() === "failed" ? (
                      <button
                        type="button"
                        onClick={() => void retryFailedMediaJob(job.id)}
                        disabled={mediaJobRetryWorkingId === job.id}
                        style={styles.storageWarningButton}
                      >
                        {mediaJobRetryWorkingId === job.id ? "Retry…" : "Retry"}
                      </button>
                    ) : (
                      <span style={styles.subtleText}>–</span>
                    )}
                  </td>
                </tr>
              ))}

              {(mediaJobsData?.jobs ?? []).length === 0 ? (
                <tr>
                  <td style={styles.storageTableTd} colSpan={7}>Noch keine Media Jobs vorhanden.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMediaTrafficDashboard = () => {
    const findStorageMediaById = (mediaId: string | null | undefined) => {
  if (!mediaId) return null;
  return (storageMediaStats?.mediaItems ?? []).find((item) => item.id === mediaId) ?? null;
};

const handleWarningOpenQrx = (qrxId: string | null | undefined) => {
  if (!qrxId) return;
  window.open(`https://mioseg-qr.com/qrx/${qrxId}`, "_blank", "noopener,noreferrer");
};

const handleWarningLoadQrxModeration = async (qrxId: string | null | undefined) => {
  if (!qrxId) return;
  await handleQrxLookup(qrxId);
};

const handleWarningOpenMedia = (mediaId: string | null | undefined) => {
  const media = findStorageMediaById(mediaId);

  if (!media) {
    alert("Medium wurde in der aktuellen Speicherliste nicht gefunden. Bitte Storage-Daten aktualisieren.");
    return;
  }

  setSelectedStorageMedia(media);
};

const handleWarningReprocessMedia = async (mediaId: string | null | undefined) => {
  const media = findStorageMediaById(mediaId);

  if (!media) {
    alert("Medium wurde in der aktuellen Speicherliste nicht gefunden. Bitte Storage-Daten aktualisieren.");
    return;
  }

  await handleReprocessStorageMedia(media);
};

const handleWarningOpenMediaJobs = async () => {
  setActiveAdminTab("overview");
  await fetchMediaJobs();
};
    const summary = mediaTrafficStats?.summary;
    const topQrx = mediaTrafficStats?.topQrx ?? [];
    const topMedia = mediaTrafficStats?.topMedia ?? [];
    const topQrxWeek = mediaTrafficStats?.topQrxWeek ?? [];
    const topMediaWeek = mediaTrafficStats?.topMediaWeek ?? [];
    const topCostQrx = mediaTrafficStats?.topCostQrx ?? [];
    const topCostMedia = mediaTrafficStats?.topCostMedia ?? [];
    const topVariants = mediaTrafficStats?.topVariants ?? [];
    const recommendations = mediaTrafficStats?.recommendations ?? [];
    const activeWarnings = mediaTrafficStats?.activeWarnings ?? [];
    const filteredActiveWarnings = activeWarnings.filter((item) =>
      mediaWarningFilter === "all" ? true : item.severity === mediaWarningFilter
    );
    const activeCriticalCount = activeWarnings.filter((item) => item.severity === "critical").length;
    const activeWarningCount = activeWarnings.filter((item) => item.severity === "warning").length;
    const activeInfoCount = activeWarnings.filter((item) => item.severity === "info").length;
    const maxQrxBytes = Math.max(...topQrx.map((item) => item.totalBytes || 0), 1);
    const maxMediaBytes = Math.max(...topMedia.map((item) => item.totalBytes || 0), 1);
    const topQrxOne = topQrx[0];
    const topMediaOne = topMedia[0];
    const topQrxWeekOne = topQrxWeek[0];
    const topMediaWeekOne = topMediaWeek[0];
    const topCostQrxOne = topCostQrx[0];
    const topCostMediaOne = topCostMedia[0];
    const totalGb = (summary?.totalBytes ?? 0) / 1024 / 1024 / 1024;
    const estimatedCost = ((summary?.estimatedCostCents ?? 0) / 100).toFixed(2).replace(".", ",");
    const estimatedMonthCost = ((summary?.estimatedMonthCostCents ?? 0) / 100).toFixed(2).replace(".", ",");
    const estimatedWeekCost = ((summary?.estimatedWeekCostCents ?? 0) / 100).toFixed(2).replace(".", ",");
    const estimatedStorageCost = formatCost(summary?.estimatedStorageCostCents);
    const estimatedTotalCost = formatCost(summary?.estimatedTotalCostCents);
    const healthStatus = summary?.healthStatus ?? "empty";
    const healthLabel =
      healthStatus === "critical"
        ? "Kritisch · ein QR-X dominiert den Traffic"
        : healthStatus === "watch"
          ? "Beobachten · Traffic konzentriert sich stark"
          : healthStatus === "healthy"
            ? "Gesund · Traffic ist verteilt"
            : "Noch keine Daten";
    const healthScore = summary?.healthScore ?? 0;
    const healthGrade = summary?.healthGrade ?? "empty";
    const healthScoreLabel =
      healthGrade === "excellent"
        ? "Exzellent"
        : healthGrade === "healthy"
          ? "Gut"
          : healthGrade === "watch"
            ? "Beobachten"
            : healthGrade === "critical"
              ? "Kritisch"
              : "Noch keine Daten";

    const trafficInsightCards = [
      {
        label: "Traffic gesamt",
        value: formatBytes(summary?.totalBytes),
        hint: "Alle bisher getrackten Medien-Auslieferungen.",
      },
      {
        label: "Heute",
        value: formatBytes(summary?.todayBytes),
        hint: "Traffic seit Tagesbeginn.",
      },
      {
        label: "Letzte 7 Tage",
        value: formatBytes(summary?.weekBytes),
        hint: "Rollierender Wochenwert für schnelle Ausreißer-Erkennung.",
      },
      {
        label: "Diesen Monat",
        value: formatBytes(summary?.monthBytes),
        hint: "Monatswert als Grundlage für Kostenkontrolle.",
      },
      {
        label: "Top QR-X",
        value: topQrxOne ? formatBytes(topQrxOne.totalBytes) : "–",
        hint: topQrxOne ? topQrxOne.companyName || topQrxOne.title || topQrxOne.qrxId || "Unbekannt" : "Noch keine Daten.",
      },
      {
        label: "geschätzte Egress-Kosten",
        value: `${estimatedCost} €`,
        hint: `${totalGb.toFixed(2).replace(".", ",")} GB · grobe Schätzung, später konfigurierbar.`,
      },
      {
        label: "Monatskosten",
        value: `${estimatedMonthCost} €`,
        hint: "Geschätzter Egress-Anteil für den aktuellen Monat.",
      },
      {
        label: "Speicher gesamt",
        value: formatBytes(summary?.totalStorageBytes),
        hint: "Originale plus erzeugte Derivate, soweit in qr_x_media erfasst.",
      },
      {
        label: "Speicherkosten",
        value: estimatedStorageCost,
        hint: `Grobe Schätzung bei ${summary?.storageCostCentsPerGbMonth ?? 2} Cent pro GB/Monat.`,
      },
      {
        label: "Gesamtkosten Monat",
        value: estimatedTotalCost,
        hint: "Aktueller Monats-Traffic plus geschätzte Speicherkosten.",
      },
      {
        label: "Ø pro Event",
        value: formatBytes(summary?.averageBytesPerEvent),
        hint: "Durchschnittlich ausgelieferte Datenmenge je Media-Event.",
      },
      {
        label: "Storage Health Score",
        value: summary?.eventCount || summary?.totalStorageBytes ? `${healthScore} / 100` : "–",
        hint: `${healthScoreLabel} · Bewertung aus Traffic-Verteilung, Fehlern, Kosten und großen Varianten.`,
      },
      {
        label: "Optimierte Medien",
        value: summary?.optimizedSharePercent != null ? `${summary.optimizedSharePercent}%` : "–",
        hint: `${formatNumber(summary?.optimizedMediaCount)} Medien mit optimiertem Status oder optimierter Größe.`,
      },
      {
        label: "Fehlerhafte Medien",
        value: formatNumber(summary?.failedMediaCount),
        hint: summary?.failedMediaCount ? "Bitte Retry/Bulk-Reprocess prüfen." : "Keine fehlerhaften Media-Jobs in der Analyse.",
      },
      {
        label: "Große Originale",
        value: formatNumber(summary?.largeOriginalMediaCount),
        hint: `${formatBytes(summary?.largeOriginalBytes)} Originaldaten größer als 10 MB.`,
      },
      {
        label: "Traffic Health",
        value: healthLabel,
        hint: `${summary?.largestQrxSharePercent ?? 0}% Anteil beim größten QR-X.`,
      },
    ];

    return (
      <div style={styles.storagePanel}>
        <div style={styles.storageDetailHeader}>
          <div>
            <h3 style={styles.storagePanelTitle}>Top-Traffic Dashboard</h3>
            <p style={{ ...styles.storageMetricHint, marginTop: -4 }}>
              Phase 2D.5.1: Zeigt Traffic, Speicherverbrauch, Kosten, Health-Empfehlungen und aktive Warnungen nach QR-X und Medien. So erkennst du früh,
              welche Profile, Bilder oder Varianten später deine Betriebskosten treiben.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMediaTrafficStats}
            disabled={mediaTrafficLoading}
            style={styles.smallButton}
          >
            {mediaTrafficLoading ? "Lade…" : "Traffic aktualisieren"}
          </button>
        </div>

        {mediaTrafficError ? <div style={styles.storageDetailHintBox}>⚠️ {mediaTrafficError}</div> : null}

        <div style={styles.storageHealthGrid}>
          {trafficInsightCards.map((card) => (
            <div key={card.label} style={styles.storageMiniCard}>
              <div style={styles.storageMiniLabel}>{card.label}</div>
              <div style={styles.storageMiniValue}>{card.value}</div>
              <div style={styles.storageMetricHint}>{card.hint}</div>
            </div>
          ))}
        </div>

        <div style={{ ...styles.storageDetailHintBox, borderColor: "#854d0e", background: "#2c1806", color: "#fed7aa" }}>
          <strong style={{ color: "#fde68a" }}>Traffic Health:</strong>{" "}
          {summary?.eventCount
            ? `${healthLabel}. Es wurden ${formatNumber(summary.eventCount)} Media-Events erfasst. Der größte QR-X verursacht ${topQrxOne ? formatBytes(topQrxOne.totalBytes) : "0 B"} (${summary.largestQrxSharePercent ?? 0}%).`
            : "Noch keine echten Media-Traffic-Daten vorhanden. Werte erscheinen, sobald App/Web die Tracking-API beim Bildladen aufrufen."}
        </div>

        <div style={styles.storagePanel}>
          <div style={styles.storageDetailHeader}>
            <div>
              <h3 style={styles.storagePanelTitle}>🚨 Aktive Warnungen</h3>
              <p style={{ ...styles.storageMetricHint, marginTop: -4 }}>
                Phase 2D.5.1: Kritische und warnwürdige Media-Auffälligkeiten werden priorisiert angezeigt. So siehst du sofort, wo du zuerst prüfen solltest.
              </p>
            </div>
            <div style={styles.storageActionRow}>
              {[
                { key: "all", label: `Alle (${activeWarnings.length})` },
                { key: "critical", label: `Kritisch (${activeCriticalCount})` },
                { key: "warning", label: `Warnung (${activeWarningCount})` },
                { key: "info", label: `Info (${activeInfoCount})` },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setMediaWarningFilter(filter.key as "all" | "critical" | "warning" | "info")}
                  style={mediaWarningFilter === filter.key ? styles.storageWarningButton : styles.storageIconButton}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.storageHealthGrid}>
            {(filteredActiveWarnings.length ? filteredActiveWarnings : activeWarnings.length ? [] : [
              {
                id: "no-active-warnings-ui",
                severity: "info" as const,
                category: "storage" as const,
                title: "Keine aktiven Warnungen",
                description: summary?.eventCount
                  ? "Aktuell wurden keine kritischen oder warnwürdigen Media-Auffälligkeiten erkannt."
                  : "Noch keine Traffic-Daten vorhanden. Sobald Media-Events eintreffen, werden Warnungen automatisch bewertet.",
                priority: 0,
                status: "active" as const,
                detectedAt: mediaTrafficStats?.updatedAt ?? "",
              },
            ]).slice(0, 12).map((item) => {
              const borderColor = item.severity === "critical" ? "#991b1b" : item.severity === "warning" ? "#854d0e" : "#243044";
              const bg = item.severity === "critical" ? "#3f1111" : item.severity === "warning" ? "#2c1806" : "#111827";
              const titleColor = item.severity === "critical" ? "#fecaca" : item.severity === "warning" ? "#fde68a" : "#e2e8f0";
              return (
                <div key={item.id} style={{ ...styles.storageMiniCard, borderColor, background: bg }}>
                  <div style={{ ...styles.storageMiniLabel, color: titleColor }}>
                    {item.severity === "critical" ? "🔴 Kritisch" : item.severity === "warning" ? "🟡 Warnung" : "🟢 Info"} · {item.category} · Priorität {item.priority ?? 0}
                  </div>
                  <div style={{ ...styles.storageMiniValue, fontSize: 16, color: titleColor }}>{item.title}</div>
                  <div style={styles.storageMetricHint}>{item.description}</div>
                  {item.estimatedSavingsBytes || item.estimatedSavingsCostCents ? (
                    <div style={{ ...styles.storageMetricHint, color: "#bbf7d0" }}>
                      mögliches Potenzial: {item.estimatedSavingsBytes ? formatBytes(item.estimatedSavingsBytes) : "–"}
                      {item.estimatedSavingsCostCents ? ` · ${formatCost(item.estimatedSavingsCostCents)}` : ""}
                    </div>
                  ) : null}
                  <div style={{ ...styles.storageActionRow, marginTop: 10 }}>
  {item.qrxId ? (
    <>
      <button
        type="button"
        onClick={() => handleWarningOpenQrx(item.qrxId)}
        style={styles.storageIconButton}
      >
        QR-X öffnen
      </button>

      <button
        type="button"
        onClick={() => void handleWarningLoadQrxModeration(item.qrxId)}
        style={styles.storageWarningButton}
      >
        In Moderation laden
      </button>
    </>
  ) : null}

  {item.mediaId ? (
    <>
      <button
        type="button"
        onClick={() => handleWarningOpenMedia(item.mediaId)}
        style={styles.storageIconButton}
      >
        Medium prüfen
      </button>

      <button
        type="button"
        onClick={() => void handleWarningReprocessMedia(item.mediaId)}
        disabled={storageReprocessWorkingId === item.mediaId}
        style={styles.storageWarningButton}
      >
        {storageReprocessWorkingId === item.mediaId ? "Reprocess…" : "Neu optimieren"}
      </button>
    </>
  ) : null}

  {item.category === "jobs" ? (
    <button
      type="button"
      onClick={() => void handleWarningOpenMediaJobs()}
      style={styles.storageWarningButton}
    >
      Media Jobs öffnen
    </button>
  ) : null}
</div>
                  {item.qrxId || item.mediaId ? (
                    <div style={styles.storageMetricHint}>
                      {item.qrxId ? `QR-X: ${item.qrxId}` : ""}
                      {item.qrxId && item.mediaId ? " · " : ""}
                      {item.mediaId ? `Medium: ${item.mediaId}` : ""}
                    </div>
                  ) : null}
                  {item.actionLabel ? <div style={{ ...styles.storageMetricHint, fontWeight: 900 }}>{item.actionLabel}</div> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.storagePanel}>
          <div style={styles.storageDetailHeader}>
            <div>
              <h3 style={styles.storagePanelTitle}>Storage Health & Empfehlungen</h3>
              <p style={{ ...styles.storageMetricHint, marginTop: -4 }}>
                Phase 2D.4: Das System bewertet Traffic, Speicher, Kosten und Media-Jobs automatisch und zeigt dir konkrete Handlungsempfehlungen.
              </p>
            </div>
            <span style={styles.storageStatusBadge}>{healthScoreLabel} · {healthScore || 0}/100</span>
          </div>

          <div style={styles.storageHealthGrid}>
            {(recommendations.length ? recommendations : []).slice(0, 6).map((item) => {
              const borderColor = item.severity === "critical" ? "#991b1b" : item.severity === "warning" ? "#854d0e" : "#243044";
              const bg = item.severity === "critical" ? "#3f1111" : item.severity === "warning" ? "#2c1806" : "#111827";
              const titleColor = item.severity === "critical" ? "#fecaca" : item.severity === "warning" ? "#fde68a" : "#e2e8f0";
              return (
                <div key={item.id} style={{ ...styles.storageMiniCard, borderColor, background: bg }}>
                  <div style={{ ...styles.storageMiniLabel, color: titleColor }}>
                    {item.severity === "critical" ? "Kritisch" : item.severity === "warning" ? "Empfehlung" : "Hinweis"} · {item.category}
                  </div>
                  <div style={{ ...styles.storageMiniValue, fontSize: 16, color: titleColor }}>{item.title}</div>
                  <div style={styles.storageMetricHint}>{item.description}</div>
                  {item.estimatedSavingsBytes || item.estimatedSavingsCostCents ? (
                    <div style={{ ...styles.storageMetricHint, color: "#bbf7d0" }}>
                      Potenzial: {item.estimatedSavingsBytes ? formatBytes(item.estimatedSavingsBytes) : "–"}
                      {item.estimatedSavingsCostCents ? ` · ${formatCost(item.estimatedSavingsCostCents)}` : ""}
                    </div>
                  ) : null}
                  {item.actionLabel ? <div style={{ ...styles.storageMetricHint, fontWeight: 900 }}>{item.actionLabel}</div> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.storageDetailGrid}>
          <div>
            <h3 style={styles.storagePanelTitle}>Top QR-X nach Traffic</h3>
            <div style={styles.storageTableWrap}>
              <table style={styles.storageTable}>
                <thead>
                  <tr>
                    <th style={styles.storageTableTh}>Rang</th>
                    <th style={styles.storageTableTh}>QR-X</th>
                    <th style={styles.storageTableTh}>Traffic</th>
                    <th style={styles.storageTableTh}>7 Tage</th>
                    <th style={styles.storageTableTh}>Heute</th>
                    <th style={styles.storageTableTh}>Events</th>
                  </tr>
                </thead>
                <tbody>
                  {topQrx.slice(0, 12).map((item, index) => {
                    const width = Math.max(4, Math.round(((item.totalBytes || 0) / maxQrxBytes) * 100));
                    return (
                      <tr key={item.qrxId || `unknown-qrx-${index}`}>
                        <td style={styles.storageTableTd}>{index + 1}</td>
                        <td style={styles.storageTableTd}>
                          <div style={{ display: "grid", gap: 6, minWidth: 180 }}>
                            <span style={styles.storageFilename} title={item.qrxId || ""}>
                              {item.companyName || item.title || item.qrxId || "Unbekannt"}
                            </span>
                            <div style={styles.storageProgressTrack}>
                              <div style={{ ...styles.storageProgressBar, width: `${width}%` }} />
                            </div>
                          </div>
                        </td>
                        <td style={styles.storageTableTd}>{formatBytes(item.totalBytes)}</td>
                        <td style={styles.storageTableTd}>{formatBytes(item.weekBytes)}</td>
                        <td style={styles.storageTableTd}>{formatBytes(item.todayBytes)}</td>
                        <td style={styles.storageTableTd}>{formatNumber(item.eventCount)}</td>
                      </tr>
                    );
                  })}
                  {topQrx.length === 0 ? (
                    <tr>
                      <td style={styles.storageTableTd} colSpan={6}>Noch keine Traffic-Daten vorhanden.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={styles.storagePanelTitle}>Top Medien nach Traffic</h3>
            <div style={styles.storageTableWrap}>
              <table style={styles.storageTable}>
                <thead>
                  <tr>
                    <th style={styles.storageTableTh}>Rang</th>
                    <th style={styles.storageTableTh}>Medium</th>
                    <th style={styles.storageTableTh}>Variante</th>
                    <th style={styles.storageTableTh}>Traffic</th>
                    <th style={styles.storageTableTh}>Events</th>
                  </tr>
                </thead>
                <tbody>
                  {topMedia.slice(0, 12).map((item, index) => {
                    const width = Math.max(4, Math.round(((item.totalBytes || 0) / maxMediaBytes) * 100));
                    return (
                      <tr key={`${item.mediaId || "unknown"}-${item.variant || "variant"}-${index}`}>
                        <td style={styles.storageTableTd}>{index + 1}</td>
                        <td style={styles.storageTableTd}>
                          <div style={{ display: "grid", gap: 6, minWidth: 180 }}>
                            <span style={styles.storageFilename} title={item.mediaId || ""}>
                              {item.filename || item.mediaId || "Unbekannt"}
                            </span>
                            <div style={styles.storageProgressTrack}>
                              <div style={{ ...styles.storageProgressBar, width: `${width}%` }} />
                            </div>
                          </div>
                        </td>
                        <td style={styles.storageTableTd}>{item.variant || "–"}</td>
                        <td style={styles.storageTableTd}>{formatBytes(item.totalBytes)}</td>
                        <td style={styles.storageTableTd}>{formatNumber(item.eventCount)}</td>
                      </tr>
                    );
                  })}
                  {topMedia.length === 0 ? (
                    <tr>
                      <td style={styles.storageTableTd} colSpan={5}>Noch keine Media-Traffic-Daten vorhanden.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={styles.storageDetailGrid}>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Wochen-Spitzenreiter QR-X</div>
            <div style={styles.storageMiniValue}>{topQrxWeekOne ? formatBytes(topQrxWeekOne.weekBytes) : "–"}</div>
            <div style={styles.storageMetricHint}>
              {topQrxWeekOne ? topQrxWeekOne.companyName || topQrxWeekOne.title || topQrxWeekOne.qrxId || "Unbekannt" : "Noch keine Wochendaten."}
            </div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Wochen-Spitzenreiter Medium</div>
            <div style={styles.storageMiniValue}>{topMediaWeekOne ? formatBytes(topMediaWeekOne.weekBytes) : "–"}</div>
            <div style={styles.storageMetricHint}>
              {topMediaWeekOne ? topMediaWeekOne.filename || topMediaWeekOne.mediaId || "Unbekannt" : "Noch keine Wochendaten."}
            </div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Kosten letzte 7 Tage</div>
            <div style={styles.storageMiniValue}>{estimatedWeekCost} €</div>
            <div style={styles.storageMetricHint}>Grobe Egress-Schätzung auf Basis der getrackten Events.</div>
          </div>
        </div>

        <div style={styles.storageDetailGrid}>
          <div>
            <h3 style={styles.storagePanelTitle}>Top QR-X nach geschätzten Kosten</h3>
            <div style={styles.storageTableWrap}>
              <table style={styles.storageTable}>
                <thead>
                  <tr>
                    <th style={styles.storageTableTh}>Rang</th>
                    <th style={styles.storageTableTh}>QR-X</th>
                    <th style={styles.storageTableTh}>Gesamt</th>
                    <th style={styles.storageTableTh}>Traffic</th>
                    <th style={styles.storageTableTh}>Storage</th>
                    <th style={styles.storageTableTh}>Speicher</th>
                  </tr>
                </thead>
                <tbody>
                  {topCostQrx.slice(0, 10).map((item, index) => (
                    <tr key={`cost-qrx-${item.qrxId || index}`}>
                      <td style={styles.storageTableTd}>{index + 1}</td>
                      <td style={styles.storageTableTd}>
                        <span style={styles.storageFilename} title={item.qrxId || ""}>
                          {item.companyName || item.title || item.qrxId || "Unbekannt"}
                        </span>
                      </td>
                      <td style={styles.storageTableTd}>{formatCost(item.estimatedTotalCostCents)}</td>
                      <td style={styles.storageTableTd}>{formatCost(item.estimatedTrafficCostCents)}</td>
                      <td style={styles.storageTableTd}>{formatCost(item.estimatedStorageCostCents)}</td>
                      <td style={styles.storageTableTd}>{formatBytes(item.storageBytes)}</td>
                    </tr>
                  ))}

                  {topCostQrx.length === 0 ? (
                    <tr>
                      <td style={styles.storageTableTd} colSpan={6}>Noch keine Kostendaten vorhanden.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={styles.storagePanelTitle}>Top Medien nach geschätzten Kosten</h3>
            <div style={styles.storageTableWrap}>
              <table style={styles.storageTable}>
                <thead>
                  <tr>
                    <th style={styles.storageTableTh}>Rang</th>
                    <th style={styles.storageTableTh}>Medium</th>
                    <th style={styles.storageTableTh}>Gesamt</th>
                    <th style={styles.storageTableTh}>Traffic</th>
                    <th style={styles.storageTableTh}>Storage</th>
                    <th style={styles.storageTableTh}>Speicher</th>
                  </tr>
                </thead>
                <tbody>
                  {topCostMedia.slice(0, 10).map((item, index) => (
                    <tr key={`cost-media-${item.mediaId || index}-${item.variant || "variant"}`}>
                      <td style={styles.storageTableTd}>{index + 1}</td>
                      <td style={styles.storageTableTd}>
                        <span style={styles.storageFilename} title={item.mediaId || ""}>
                          {item.filename || item.mediaId || "Unbekannt"}
                        </span>
                      </td>
                      <td style={styles.storageTableTd}>{formatCost(item.estimatedTotalCostCents)}</td>
                      <td style={styles.storageTableTd}>{formatCost(item.estimatedTrafficCostCents)}</td>
                      <td style={styles.storageTableTd}>{formatCost(item.estimatedStorageCostCents)}</td>
                      <td style={styles.storageTableTd}>{formatBytes(item.storageBytes)}</td>
                    </tr>
                  ))}

                  {topCostMedia.length === 0 ? (
                    <tr>
                      <td style={styles.storageTableTd} colSpan={6}>Noch keine Media-Kostendaten vorhanden.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={styles.storageDetailGrid}>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Teuerster QR-X</div>
            <div style={styles.storageMiniValue}>{topCostQrxOne ? formatCost(topCostQrxOne.estimatedTotalCostCents) : "–"}</div>
            <div style={styles.storageMetricHint}>
              {topCostQrxOne ? topCostQrxOne.companyName || topCostQrxOne.title || topCostQrxOne.qrxId || "Unbekannt" : "Noch keine Kostendaten."}
            </div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Teuerstes Medium</div>
            <div style={styles.storageMiniValue}>{topCostMediaOne ? formatCost(topCostMediaOne.estimatedTotalCostCents) : "–"}</div>
            <div style={styles.storageMetricHint}>
              {topCostMediaOne ? topCostMediaOne.filename || topCostMediaOne.mediaId || "Unbekannt" : "Noch keine Kostendaten."}
            </div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Kostensatz</div>
            <div style={styles.storageMiniValue}>{summary?.trafficEgressCostCentsPerGb ?? 9} / {summary?.storageCostCentsPerGbMonth ?? 2} Cent</div>
            <div style={styles.storageMetricHint}>Traffic pro GB / Storage pro GB-Monat. Später konfigurierbar.</div>
          </div>
        </div>

        <div style={styles.storageDetailGrid}>
          <div>
            <h3 style={styles.storagePanelTitle}>Traffic nach Varianten</h3>
            <div style={styles.storageTableWrap}>
              <table style={styles.storageTable}>
                <thead>
                  <tr>
                    <th style={styles.storageTableTh}>Variante</th>
                    <th style={styles.storageTableTh}>Traffic</th>
                    <th style={styles.storageTableTh}>Anteil</th>
                    <th style={styles.storageTableTh}>7 Tage</th>
                    <th style={styles.storageTableTh}>Events</th>
                  </tr>
                </thead>
                <tbody>
                  {topVariants.slice(0, 8).map((item) => (
                    <tr key={item.variant}>
                      <td style={styles.storageTableTd}>{item.variant || "unknown"}</td>
                      <td style={styles.storageTableTd}>{formatBytes(item.totalBytes)}</td>
                      <td style={styles.storageTableTd}>{item.sharePercent}%</td>
                      <td style={styles.storageTableTd}>{formatBytes(item.weekBytes)}</td>
                      <td style={styles.storageTableTd}>{formatNumber(item.eventCount)}</td>
                    </tr>
                  ))}

                  {topVariants.length === 0 ? (
                    <tr>
                      <td style={styles.storageTableTd} colSpan={5}>Noch keine Varianten-Daten vorhanden.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Schnellbewertung</div>
            <div style={styles.storageMiniValue}>{healthLabel}</div>
            <div style={styles.storageMetricHint}>
              {healthStatus === "critical"
                ? "Prüfe den größten QR-X zeitnah. Ein einzelnes Profil verursacht den Großteil des Traffics."
                : healthStatus === "watch"
                  ? "Behalte die Top-QR-X im Blick. Der Traffic ist noch nicht kritisch, aber konzentriert."
                  : healthStatus === "healthy"
                    ? "Die Traffic-Verteilung sieht aktuell gesund aus."
                    : "Sobald Tracking-Events ankommen, erscheint hier eine automatische Bewertung."}
            </div>
          </div>
        </div>

        <div style={styles.storageDetailGrid}>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Teuerstes Medium</div>
            <div style={styles.storageMiniValue}>{topMediaOne ? formatBytes(topMediaOne.totalBytes) : "–"}</div>
            <div style={styles.storageMetricHint}>
              {topMediaOne ? topMediaOne.filename || topMediaOne.mediaId || "Unbekannt" : "Noch keine Daten."}
            </div>
          </div>
          <div style={styles.storageMiniCard}>
            <div style={styles.storageMiniLabel}>Tracking-Abdeckung</div>
            <div style={styles.storageMiniValue}>{formatNumber(summary?.mediaCount)} Medien</div>
            <div style={styles.storageMetricHint}>
              {formatNumber(summary?.qrxCount)} QR-X mit mindestens einem Traffic-Event.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStorageAndMediaDashboard = () => (
    <section style={styles.storageDashboard} aria-label="Storage and Media Dashboard">
      <div style={styles.storageHeader}>
        <div>
          <div style={styles.storageEyebrow}>Phase 2A.1 · Storage & Media</div>
          <h2 style={styles.storageTitle}>Storage & Media Dashboard</h2>
          <p style={styles.storageSubtitle}>
            Übersicht über Originalspeicher, optimierte Medien und Einsparungen der Media Engine.
            Die Kennzahlen werden direkt aus qr_x_media berechnet.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={fetchStorageMediaStats}
            disabled={storageMediaLoading}
            style={styles.smallButton}
          >
            {storageMediaLoading ? "Lade…" : "Media-Daten aktualisieren"}
          </button>
          <div style={styles.storageStatusBadge}>
            {storageMediaError ? "⚠️ Fehler" : storageMediaStats ? "✅ Live-Daten aktiv" : "✅ Oberfläche vorbereitet"}
          </div>
        </div>
      </div>

      {storageMediaError ? (
        <div style={styles.stateCard}>
          Media-Statistiken konnten nicht geladen werden: {storageMediaError}
        </div>
      ) : null}

      <div style={styles.storageMetricGrid}>
        {storagePrimaryMetrics.map((metric) => (
          <div key={metric.label} style={styles.storageMetricCard}>
            <div style={styles.storageMetricIcon}>{metric.icon}</div>
            <div style={styles.storageMetricLabel}>{metric.label}</div>
            <div style={styles.storageMetricValue}>{metric.value}</div>
            <div style={styles.storageMetricHint}>{metric.hint}</div>
          </div>
        ))}
      </div>

      <div style={styles.storageSectionGrid}>
        <div style={styles.storagePanel}>
          <h3 style={styles.storagePanelTitle}>Live Media Statistik</h3>
          <div style={styles.storageMiniGrid}>
            {storageLiveMetrics.map((metric) => (
              <div key={metric.label} style={styles.storageMiniCard}>
                <div style={styles.storageMiniLabel}>{metric.label}</div>
                <div style={styles.storageMiniValue}>{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.storagePanel}>
          <h3 style={styles.storagePanelTitle}>Performance</h3>
          <div style={styles.storageMiniGrid}>
            {storagePerformanceMetrics.map((metric) => (
              <div key={metric.label} style={styles.storageMiniCard}>
                <div style={styles.storageMiniLabel}>{metric.label}</div>
                <div style={styles.storageMiniValue}>{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.storagePanel}>
          <h3 style={styles.storagePanelTitle}>Nächste Datenanbindung</h3>
          <div style={styles.storageTodoList}>
            <div style={styles.storageTodoItem}>
              <span>qr_x_media aggregieren</span>
              <span>{storageMediaStats ? "aktiv" : "bereit"}</span>
            </div>
            <div style={styles.storageTodoItem}>
              <span>Original vs. optimiert berechnen</span>
              <span>{storageMediaStats ? "aktiv" : "bereit"}</span>
            </div>
            <div style={styles.storageTodoItem}>
              <span>Fehler / Queue anzeigen</span>
              <span>{storageMediaStats ? "aktiv" : "bereit"}</span>
            </div>
          </div>
          <div style={styles.storageProgressTrack}>
            <div style={{ ...styles.storageProgressBar, width: `${storageSavingsProgress}%` }} />
          </div>
          <div style={styles.storageMetricHint}>
            Danach können Diagramme, Reprocessing und monatliche Ersparnisse ergänzt werden.
          </div>
        </div>
      </div>

      <div style={styles.storagePanel}>
        <div style={styles.storageDetailHeader}>
          <div>
            <h3 style={styles.storagePanelTitle}>Media & Storage Bereiche</h3>
            <p style={{ ...styles.storageMetricHint, marginTop: -4 }}>
              Der Media-Bereich ist jetzt in Unterbereiche aufgeteilt, damit Übersicht, Preise, Credits, Finanzen und Logs nicht mehr nach unten gedrückt werden.
            </p>
          </div>
        </div>

        <div style={styles.storageActionRow}>
          {[
            { key: "overview", label: "Übersicht" },
            { key: "traffic", label: "Traffic · Kosten · Warnungen" },
            { key: "storage", label: "Speicherfresser" },
            { key: "jobs", label: "Media Jobs · Reprocess" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMediaDashboardSection(tab.key as "overview" | "traffic" | "storage" | "jobs")}
              style={mediaDashboardSection === tab.key ? styles.storageWarningButton : styles.storageIconButton}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {mediaDashboardSection === "overview" ? (
        <div style={styles.storagePanel}>
          <h3 style={styles.storagePanelTitle}>Kurzübersicht</h3>
          <p style={{ ...styles.storageMetricHint, marginTop: -4 }}>
            Hier bleiben nur die wichtigsten Media-Kennzahlen sichtbar. Tiefe Analysen findest du über die Unterbereiche oben.
          </p>
          <div style={styles.storageHealthGrid}>
            <div style={styles.storageMiniCard}>
              <div style={styles.storageMiniLabel}>Gesparte Daten</div>
              <div style={styles.storageMiniValue}>{formatBytes(storageTotals?.savedBytes ?? 0)}</div>
              <div style={styles.storageMetricHint}>Durch Optimierung eingesparte Speichermenge.</div>
            </div>
            <div style={styles.storageMiniCard}>
              <div style={styles.storageMiniLabel}>Fehlerhafte Medien</div>
              <div style={styles.storageMiniValue}>{formatNumber(storageTotals?.failedCount ?? 0)}</div>
              <div style={styles.storageMetricHint}>Bei Fehlern den Bereich „Media Jobs · Reprocess“ öffnen.</div>
            </div>
            <div style={styles.storageMiniCard}>
              <div style={styles.storageMiniLabel}>Traffic diesen Monat</div>
              <div style={styles.storageMiniValue}>{formatBytes(mediaTrafficStats?.summary?.monthBytes)}</div>
              <div style={styles.storageMetricHint}>Für Details den Bereich „Traffic · Kosten · Warnungen“ öffnen.</div>
            </div>
          </div>
        </div>
      ) : null}

      {mediaDashboardSection === "traffic" ? renderMediaTrafficDashboard() : null}

      {mediaDashboardSection === "storage" ? (
        <>
          <div style={styles.storagePanel}>
            <h3 style={styles.storagePanelTitle}>Speicherfresser finden</h3>
        <p style={{ ...styles.storageMetricHint, marginTop: -4, marginBottom: 12 }}>
          Filtere große Dateien, fehlerhafte Medien oder Dateien mit besonders hohem Einsparpotenzial.
        </p>

        <div style={styles.storageFilterGrid}>
          <label style={styles.storageFilterLabel}>
            Suche
            <input
              value={storageMediaSearch}
              onChange={(event) => setStorageMediaSearch(event.target.value)}
              placeholder="Dateiname oder QR-X-ID…"
              style={styles.storageFilterInput}
            />
          </label>

          <label style={styles.storageFilterLabel}>
            Typ
            <select
              value={storageMediaTypeFilter}
              onChange={(event) => setStorageMediaTypeFilter(event.target.value)}
              style={styles.storageFilterSelect}
            >
              <option value="all">Alle</option>
              <option value="image">Bilder</option>
              <option value="logo">Logos</option>
              <option value="file">Dateien</option>
            </select>
          </label>

          <label style={styles.storageFilterLabel}>
            Status
            <select
              value={storageMediaStatusFilter}
              onChange={(event) => setStorageMediaStatusFilter(event.target.value)}
              style={styles.storageFilterSelect}
            >
              <option value="all">Alle</option>
              <option value="ready">Optimiert / Ready</option>
              <option value="pending">Wartet</option>
              <option value="processing">In Verarbeitung</option>
              <option value="failed">Fehler</option>
              <option value="unknown">Unbekannt</option>
            </select>
          </label>

          <label style={styles.storageFilterLabel}>
            Mindestgröße in MB
            <input
              value={storageMediaMinMb}
              onChange={(event) => setStorageMediaMinMb(event.target.value)}
              placeholder="z. B. 10"
              inputMode="decimal"
              style={styles.storageFilterInput}
            />
          </label>

          <label style={styles.storageFilterLabel}>
            Sortierung
            <select
              value={storageMediaSort}
              onChange={(event) => setStorageMediaSort(event.target.value)}
              style={styles.storageFilterSelect}
            >
              <option value="largest">Größte Originaldateien</option>
              <option value="savings">Größte Einsparungen</option>
              <option value="worst">Schlechteste Komprimierung</option>
              <option value="failed">Fehler zuerst</option>
            </select>
          </label>

          <div style={styles.storageFilterActions}>
            <button
              type="button"
              onClick={fetchStorageMediaStats}
              disabled={storageMediaLoading}
              style={styles.refreshButton}
            >
              {storageMediaLoading ? "Filter lädt…" : "Filter anwenden"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStorageMediaSearch("");
                setStorageMediaTypeFilter("all");
                setStorageMediaStatusFilter("all");
                setStorageMediaMinMb("10");
                setStorageMediaSort("largest");
                setTimeout(() => void fetchStorageMediaStats(), 0);
              }}
              style={styles.smallButton}
            >
              Zurücksetzen
            </button>
          </div>
        </div>

        {renderStorageMediaTable(
          "Gefilterte Speicherfresser",
          "Bis zu 100 passende Medien nach deinen Filtern.",
          storageMediaStats?.mediaItems ?? []
        )}

        {renderStorageMediaDetailPanel()}
      </div>

        </>
      ) : null}

      {mediaDashboardSection === "jobs" ? (
        <>
          {renderBulkMediaJobsPanel()}

          {renderMediaJobsPanel()}
        </>
      ) : null}

      {mediaDashboardSection === "storage" ? (
        <>
          <div style={styles.storageDetailGrid}>
        {renderStorageMediaTable(
          "Größte Medien",
          "Die größten Originaldateien. Diese Dateien sind besonders wichtig für Speicheroptimierung.",
          storageMediaStats?.topLargest ?? []
        )}

        {renderStorageMediaTable(
          "Größte Einsparungen",
          "Medien mit der größten absoluten Speicherersparnis durch Optimierung.",
          storageMediaStats?.topSavings ?? []
        )}
      </div>

          <div style={styles.storageSectionGrid}>
            <div style={styles.storagePanel}>
              <h3 style={styles.storagePanelTitle}>Media Health</h3>
              <div style={styles.storageHealthGrid}>
                {Object.entries(storageMediaStats?.statusCounts ?? {}).length === 0 ? (
                  <div style={styles.storageMiniCard}>
                    <div style={styles.storageMiniLabel}>Status</div>
                    <div style={styles.storageMiniValue}>—</div>
                  </div>
                ) : (
                  Object.entries(storageMediaStats?.statusCounts ?? {}).map(([status, count]) => (
                    <div key={status} style={styles.storageMiniCard}>
                      <div style={styles.storageMiniLabel}>{formatStorageStatus(status)}</div>
                      <div style={styles.storageMiniValue}>{formatNumber(count)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );


  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.title}>{tAdmin("admin_title")}</h1>
            <p style={styles.subtitle}>{tAdmin("admin_subtitle")}</p>
          </div>
          <select
            value={adminLanguage}
            onChange={(event) => setAdminLanguage(event.target.value as AdminLanguage)}
            style={styles.filterSelect}
            aria-label="Admin language"
          >
            <option value="de">{tAdmin("language_de")}</option>
            <option value="en">{tAdmin("language_en")}</option>
          </select>
        </div>

        <div style={styles.tabsWrap}>
          {adminTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveAdminTab(tab.key)}
              title={tAdmin(tab.hintKey)}
              style={activeAdminTab === tab.key ? styles.tabButtonActive : styles.tabButton}
            >
              {tAdmin(tab.labelKey)}
            </button>
          ))}
        </div>

        <div style={{ display: activeAdminTab === "overview" ? "block" : "none" }}>
          {renderStorageAndMediaDashboard()}

          <div style={styles.dashboardGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Offene Verifizierungen</div>
              <div style={styles.metricValue}>{loading ? "…" : requests.length}</div>
              <div style={styles.metricHint}>Business-QR-X, die noch geprüft werden müssen.</div>
              <button
                type="button"
                onClick={() => setActiveAdminTab("verifications")}
                style={{ ...styles.secondaryLink, marginTop: 12 }}
              >
                Verifizierungen öffnen
              </button>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>{tAdmin("label_reported_qrx")}</div>
              <div style={styles.metricValue}>{reportedQrxLoading ? "…" : reportedQrxCount}</div>
              <div style={styles.metricHint}>
                Davon gesperrt/auto-gesperrt: {reportedQrxLoading ? "…" : autoSuspendedQrxCount}
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminTab("reports")}
                style={{ ...styles.secondaryLink, marginTop: 12 }}
              >
                Meldungen öffnen
              </button>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Offene Supportfälle</div>
              <div style={styles.metricValue}>{ticketsLoading ? "…" : openTicketCount}</div>
              <div style={styles.metricHint}>Tickets mit Status Offen oder In Prüfung.</div>
              <button
                type="button"
                onClick={() => setActiveAdminTab("support")}
                style={{ ...styles.secondaryLink, marginTop: 12 }}
              >
                Support öffnen
              </button>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Heute gutgeschriebene Credits</div>
              <div style={styles.metricValue}>{pricingLoading ? "…" : creditsGrantedToday}</div>
              <div style={styles.metricHint}>
                Tageslimit: {pricingData?.limits?.maxDailyCreditGrant ?? "–"} · Rest: {pricingData?.limits?.remainingCreditsToday ?? "–"}
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminTab("credits")}
                style={{ ...styles.secondaryLink, marginTop: 12 }}
              >
                Credits öffnen
              </button>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Aktive Preis-Pakete</div>
              <div style={styles.metricValue}>{pricingLoading ? "…" : activePricingPackCount}</div>
              <div style={styles.metricHint}>
                Launch-Rabatt: {pricingData?.pricingConfig?.launch_discount_enabled ? "aktiv" : "inaktiv"}
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminTab("prices")}
                style={{ ...styles.secondaryLink, marginTop: 12 }}
              >
                Preise öffnen
              </button>
            </div>


            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Finanzen aktueller Zeitraum</div>
              <div style={styles.metricValue}>
                {financeLoading ? "…" : formatPrice(financeData?.totals?.grossCents ?? 0, "EUR")}
              </div>
              <div style={styles.metricHint}>
                Rechnungen: {financeData?.totals?.invoiceCount ?? 0} · Refunds: {formatPrice(financeData?.totals?.refundedCents ?? 0, "EUR")}
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminTab("finance")}
                style={{ ...styles.secondaryLink, marginTop: 12 }}
              >
                Finanzen öffnen
              </button>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Letzte Admin-Aktion</div>
              <div style={{ ...styles.metricValue, fontSize: 18 }}>
                {adminActionsLoading
                  ? "…"
                  : lastAdminAction
                    ? formatAdminAction(lastAdminAction.action_type, tAdmin)
                    : "–"}
              </div>
              <div style={styles.metricHint}>
                {lastAdminAction
                  ? new Date(lastAdminAction.created_at).toLocaleString("de-DE")
                  : "Noch keine Aktion geladen."}
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminTab("logs")}
                style={{ ...styles.secondaryLink, marginTop: 12 }}
              >
                Logs öffnen
              </button>
            </div>
          </div>

          <div style={{ ...styles.commandPanel, marginBottom: 18 }}>
            <h2 style={styles.panelTitle}>Schnellstatus</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Ältester Verifizierungsantrag</div>
                <div style={styles.infoValue}>
                  {loading || requests.length === 0
                    ? "–"
                    : `${Math.max(...requests.map((item) => item.waiting_days || 0))} Tage`}
                </div>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Ø Wartezeit Verifizierung</div>
                <div style={styles.infoValue}>
                  {loading || requests.length === 0 ? "–" : `${avgWaitingDays} Tage`}
                </div>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Kritisch &gt; 7 Tage</div>
                <div style={styles.infoValue}>{loading ? "…" : olderThanSevenCount}</div>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Preis-Währung</div>
                <div style={styles.infoValue}>{pricingData?.pricingConfig?.currency || "EUR"}</div>
              </div>
            </div>
          </div>
        </div>


        <div style={{ ...styles.commandPanel, marginBottom: 18, display: activeAdminTab === "finance" ? "block" : "none" }}>
          <h2 style={styles.panelTitle}>Finanzen / Steuer</h2>
          <p style={{ ...styles.subtleText, marginTop: 0 }}>
            Vorbereitung für Steuerberater-Export, Rechnungsprüfung und spätere Apple-/Google-Zahlungen.
            Stripe ist bereits vorgesehen; Apple App Store und Google Play sind als Zahlungsquellen vorbereitet.
          </p>

          <div style={styles.actionsRow}>
            <label style={styles.filterWrap}>
              <span style={styles.filterLabel}>Von</span>
              <input type="date" value={financeFrom} onChange={(e) => setFinanceFrom(e.target.value)} style={styles.filterSelect} />
            </label>

            <label style={styles.filterWrap}>
              <span style={styles.filterLabel}>Bis</span>
              <input type="date" value={financeTo} onChange={(e) => setFinanceTo(e.target.value)} style={styles.filterSelect} />
            </label>

            <label style={styles.filterWrap}>
              <span style={styles.filterLabel}>Quelle</span>
              <select value={financeProvider} onChange={(e) => setFinanceProvider(e.target.value)} style={styles.filterSelect}>
                <option value="all">{tAdmin("label_all")}</option>
                <option value="stripe">Stripe Web</option>
                <option value="apple">Apple App Store</option>
                <option value="google">Google Play</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                fetchFinance();
                fetchFinancePayouts();
              }}
              disabled={financeLoading || financePayoutLoading}
              style={{ ...styles.refreshButton, opacity: financeLoading || financePayoutLoading ? 0.65 : 1 }}
            >
              {financeLoading || financePayoutLoading ? "Lade…" : "Finanzen laden"}
            </button>

            <button type="button" onClick={downloadFinanceCsv} style={styles.creditButton}>
              CSV exportieren
            </button>
          </div>

          {financeError ? (
            <div style={{ ...styles.resultBox, background: "#3f1111", borderColor: "#991b1b", color: "#fecaca", marginBottom: 14 }}>
              {financeError}
            </div>
          ) : null}

          <div style={styles.dashboardGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Brutto Umsatz</div>
              <div style={styles.metricValue}>{formatPrice(financeData?.totals?.grossCents ?? 0, "EUR")}</div>
              <div style={styles.metricHint}>Summe aus geladenen Rechnungen im Zeitraum.</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Netto</div>
              <div style={styles.metricValue}>{formatPrice(financeData?.totals?.netCents ?? 0, "EUR")}</div>
              <div style={styles.metricHint}>Falls vorhanden aus qrx_invoices; sonst 0 bis DB erweitert ist.</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>MwSt / Steuer</div>
              <div style={styles.metricValue}>{formatPrice(financeData?.totals?.taxCents ?? 0, "EUR")}</div>
              <div style={styles.metricHint}>Vorbereitet für Steuerberater-Export.</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Erstattungen</div>
              <div style={styles.metricValue}>{formatPrice(financeData?.totals?.refundedCents ?? 0, "EUR")}</div>
              <div style={styles.metricHint}>Aus Kaufhistorie, soweit vorhanden.</div>
            </div>
          </div>

          <div style={{ ...styles.commandPanel, marginBottom: 14 }}>
            <h3 style={styles.panelTitle}>Umsatz nach Zahlungsquelle</h3>
            <div style={styles.dashboardGrid}>
              {(financeData?.providerSummary ?? [
                { provider: "stripe", invoiceCount: 0, grossCents: 0, netCents: 0, taxCents: 0, refundedCents: 0 },
                { provider: "apple", invoiceCount: 0, grossCents: 0, netCents: 0, taxCents: 0, refundedCents: 0 },
                { provider: "google", invoiceCount: 0, grossCents: 0, netCents: 0, taxCents: 0, refundedCents: 0 },
              ]).map((item) => (
                <div key={item.provider} style={styles.lookupMiniCard}>
                  <div style={styles.lookupMiniLabel}>{formatProvider(item.provider)}</div>
                  <div style={styles.lookupMiniValue}>{formatPrice(item.grossCents, "EUR")}</div>
                  <div style={styles.historyNote}>
                    Rechnungen: {item.invoiceCount} · Netto: {formatPrice(item.netCents, "EUR")} · Steuer: {formatPrice(item.taxCents, "EUR")}
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div style={{ ...styles.commandPanel, marginBottom: 14 }}>
            <h3 style={styles.panelTitle}>Auszahlungen / Payouts</h3>
            <p style={{ ...styles.subtleText, marginTop: 0 }}>
              Vorbereitung für spätere Stripe-, Apple- und Google-Auszahlungen. Aktuell ist die Struktur vorbereitet; echte Payout-Batches können später automatisch oder manuell erzeugt werden.
            </p>

            {financePayoutError ? (
              <div style={{ ...styles.resultBox, background: "#3f1111", borderColor: "#991b1b", color: "#fecaca", marginBottom: 14 }}>
                {financePayoutError}
              </div>
            ) : null}

            <div style={styles.dashboardGrid}>
              <div style={styles.lookupMiniCard}>
                <div style={styles.lookupMiniLabel}>Payout-Batches</div>
                <div style={styles.lookupMiniValue}>{financePayoutLoading ? "…" : financePayoutData?.totals?.batchCount ?? 0}</div>
                <div style={styles.historyNote}>Geladene Auszahlungsgruppen im Zeitraum.</div>
              </div>

              <div style={styles.lookupMiniCard}>
                <div style={styles.lookupMiniLabel}>Brutto in Payouts</div>
                <div style={styles.lookupMiniValue}>{formatPrice(financePayoutData?.totals?.grossCents ?? 0, "EUR")}</div>
                <div style={styles.historyNote}>Summe zugeordneter Umsätze.</div>
              </div>

              <div style={styles.lookupMiniCard}>
                <div style={styles.lookupMiniLabel}>Gebühren</div>
                <div style={styles.lookupMiniValue}>{formatPrice(financePayoutData?.totals?.feeCents ?? 0, "EUR")}</div>
                <div style={styles.historyNote}>Stripe/Apple/Google Gebühren, sobald zugeordnet.</div>
              </div>

              <div style={styles.lookupMiniCard}>
                <div style={styles.lookupMiniLabel}>Netto-Auszahlung</div>
                <div style={styles.lookupMiniValue}>{formatPrice(financePayoutData?.totals?.netPayoutCents ?? 0, "EUR")}</div>
                <div style={styles.historyNote}>Tatsächlich ausgezahlter Betrag.</div>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={styles.tableTh}>Provider</th>
                    <th style={styles.tableTh}>Referenz</th>
                    <th style={styles.tableTh}>Zeitraum</th>
                    <th style={styles.tableTh}>Ausgezahlt am</th>
                    <th style={styles.tableTh}>Brutto</th>
                    <th style={styles.tableTh}>Gebühr</th>
                    <th style={styles.tableTh}>Refunds</th>
                    <th style={styles.tableTh}>Netto Auszahlung</th>
                    <th style={styles.tableTh}>{tAdmin("table_status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(financePayoutData?.payouts ?? []).length === 0 ? (
                    <tr>
                      <td style={styles.tableTd} colSpan={9}>
                        Noch keine Payout-Batches vorhanden. Das ist aktuell normal.
                      </td>
                    </tr>
                  ) : (
                    (financePayoutData?.payouts ?? []).map((payout) => (
                      <tr key={payout.id}>
                        <td style={styles.tableTd}>{formatProvider(payout.payment_provider)}</td>
                        <td style={styles.tableTd}>{payout.provider_payout_id || payout.payout_reference || payout.id}</td>
                        <td style={styles.tableTd}>
                          {(payout.period_start || "–") + " bis " + (payout.period_end || "–")}
                        </td>
                        <td style={styles.tableTd}>
                          {payout.paid_at ? new Date(payout.paid_at).toLocaleString("de-DE") : "–"}
                        </td>
                        <td style={styles.tableTd}>{formatPrice(payout.gross_cents ?? 0, payout.currency || "EUR")}</td>
                        <td style={styles.tableTd}>{formatPrice(payout.fee_cents ?? 0, payout.currency || "EUR")}</td>
                        <td style={styles.tableTd}>{formatPrice(payout.refund_cents ?? 0, payout.currency || "EUR")}</td>
                        <td style={styles.tableTd}>{formatPrice(payout.net_payout_cents ?? 0, payout.currency || "EUR")}</td>
                        <td style={styles.tableTd}>{payout.status || "draft"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.dataTable}>
              <thead>
                <tr>
                  <th style={styles.tableTh}>Rechnung</th>
                  <th style={styles.tableTh}>{tAdmin("table_date")}</th>
                  <th style={styles.tableTh}>Quelle</th>
                  <th style={styles.tableTh}>{tAdmin("table_email")}</th>
                  <th style={styles.tableTh}>Land</th>
                  <th style={styles.tableTh}>Brutto</th>
                  <th style={styles.tableTh}>Netto</th>
                  <th style={styles.tableTh}>Steuer</th>
                  <th style={styles.tableTh}>PDF</th>
                </tr>
              </thead>
              <tbody>
                {(financeData?.invoices ?? []).length === 0 ? (
                  <tr>
                    <td style={styles.tableTd} colSpan={9}>Noch keine Rechnungen geladen oder keine Treffer im Zeitraum.</td>
                  </tr>
                ) : (
                  (financeData?.invoices ?? []).map((invoice) => {
                    const pdfPath = invoice.pdf_path || invoice.storage_path;
                    return (
                      <tr key={invoice.id}>
                        <td style={styles.tableTd}>{invoice.invoice_number || invoice.id}</td>
                        <td style={styles.tableTd}>{invoice.created_at ? new Date(invoice.created_at).toLocaleString("de-DE") : "–"}</td>
                        <td style={styles.tableTd}>{formatProvider(invoice.payment_provider)}</td>
                        <td style={styles.tableTd}>{invoice.billing_email || "–"}</td>
                        <td style={styles.tableTd}>{invoice.billing_country_code || "–"}</td>
                        <td style={styles.tableTd}>{formatPrice(invoice.total_cents ?? invoice.amount_cents ?? 0, invoice.currency || "EUR")}</td>
                        <td style={styles.tableTd}>{formatPrice(invoice.net_cents ?? 0, invoice.currency || "EUR")}</td>
                        <td style={styles.tableTd}>{formatPrice(invoice.tax_cents ?? 0, invoice.currency || "EUR")}</td>
                        <td style={styles.tableTd}>
                          {pdfPath ? (
                            <a href={`/api/admin/finance/invoice-pdf?id=${encodeURIComponent(invoice.id)}`} target="_blank" rel="noreferrer" style={styles.secondaryLink}>PDF öffnen</a>
                          ) : (
                            <span style={styles.subtleText}>Kein PDF</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {financeData?.warnings?.length ? (
            <div style={{ ...styles.historyBox, color: "#fde68a" }}>Hinweise: {financeData.warnings.join(" · ")}</div>
          ) : null}
        </div>


        <div style={{ ...styles.commandPanel, marginBottom: 18, display: activeAdminTab === "users" ? "block" : "none" }}>
          <h2 style={styles.panelTitle}>Nutzer-Suche</h2>
          <p style={{ ...styles.subtleText, marginTop: 0 }}>
            Suche nach User-ID, QR-X-ID oder E-Mail. Danach kannst du direkt Credits buchen, Historie laden oder ein Ticket anlegen.
          </p>

          <div style={styles.actionsRow}>
            <input
              value={userLookupQuery}
              onChange={(e) => setUserLookupQuery(e.target.value)}
              placeholder="User-ID, QR-X-ID oder E-Mail"
              style={styles.searchInput}
            />
            <button
              type="button"
              onClick={handleUserLookup}
              disabled={userLookupLoading}
              style={{
                ...styles.refreshButton,
                opacity: userLookupLoading ? 0.65 : 1,
              }}
            >
              {userLookupLoading ? "Suche…" : "Nutzer suchen"}
            </button>
          </div>

          {userLookupResult ? (
            <div>
              <div style={styles.infoGrid}>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>User-ID</div>
                  <div style={styles.infoValue}>{userLookupResult.userId || "–"}</div>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>{tAdmin("table_email")}</div>
                  <div style={styles.infoValue}>{userLookupResult.email || "–"}</div>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>{tAdmin("table_status")}</div>
                  <div style={styles.infoValue}>
                    {userLookupResult.userBlocked ? "Gesperrt" : "Aktiv"}
                  </div>
                </div>
              </div>

              <div style={{ ...styles.bottomRow, marginBottom: 18 }}>
                {!userLookupResult.userBlocked ? (
                  <button
                    type="button"
                    onClick={() => handleUserModerationAction("ban_user")}
                    disabled={userModerationWorking}
                    style={{
                      ...styles.rejectButton,
                      opacity: userModerationWorking ? 0.65 : 1,
                    }}
                  >
                    Nutzer sperren
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUserModerationAction("unban_user")}
                    disabled={userModerationWorking}
                    style={{
                      ...styles.approveButton,
                      opacity: userModerationWorking ? 0.65 : 1,
                    }}
                  >
                    Nutzer entsperren
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleUserModerationAction("suspend_all_qrx")}
                  disabled={userModerationWorking}
                  style={{
                    ...styles.secondaryLink,
                    opacity: userModerationWorking ? 0.65 : 1,
                  }}
                >
                  Alle QR-X sperren
                </button>

                <button
                  type="button"
                  onClick={() => handleUserModerationAction("unsuspend_all_qrx")}
                  disabled={userModerationWorking}
                  style={{
                    ...styles.secondaryLink,
                    opacity: userModerationWorking ? 0.65 : 1,
                  }}
                >
                  Alle QR-X freigeben
                </button>
              </div>

              <div style={{ ...styles.historyNote, marginBottom: 14 }}>
                Hinweis: „Nutzer entsperren“ gibt nur den Zugang frei. QR-X bleiben gesperrt, bis du sie separat über „Alle QR-X freigeben“ wieder aktivierst.
              </div>

              <div style={styles.lookupGrid}>
                <div style={styles.lookupMiniCard}>
                  <div style={styles.lookupMiniLabel}>Credits</div>
                  <div style={styles.lookupMiniValue}>{userLookupResult.currentCredits ?? "–"}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUserQrxList((prev) => !prev)}
                  style={{
                    ...styles.lookupMiniCard,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={styles.lookupMiniLabel}>QR-X gesamt</div>
                  <div style={styles.lookupMiniValue}>{userLookupResult.qrxCount}</div>
                  <div style={styles.ticketMeta}>
                    {showUserQrxList ? "Liste ausblenden" : "Liste anzeigen"}
                  </div>
                </button>
                <div style={styles.lookupMiniCard}>
                  <div style={styles.lookupMiniLabel}>Business QR-X</div>
                  <div style={styles.lookupMiniValue}>{userLookupResult.businessQrxCount}</div>
                </div>
                <div style={styles.lookupMiniCard}>
                  <div style={styles.lookupMiniLabel}>Verifiziert</div>
                  <div style={styles.lookupMiniValue}>{userLookupResult.verifiedBusinessQrxCount}</div>
                </div>
                <div style={styles.lookupMiniCard}>
                  <div style={styles.lookupMiniLabel}>{tAdmin("label_open_tickets")}</div>
                  <div style={styles.lookupMiniValue}>{userLookupResult.openTicketsCount}</div>
                </div>
                <div style={styles.lookupMiniCard}>
                  <div style={styles.lookupMiniLabel}>Offene Prüfungen</div>
                  <div style={styles.lookupMiniValue}>{userLookupResult.openVerificationsCount}</div>
                </div>
              </div>

              {showUserQrxList ? (
                <div style={{ marginTop: 14 }}>
                  <h3 style={styles.panelTitle}>Alle QR-X dieses Nutzers</h3>

                  {userLookupResult.qrxList.length === 0 ? (
                    <div style={styles.stateCard}>Dieser Nutzer hat keine QR-X.</div>
                  ) : (
                    <div style={styles.ticketList}>
                      {userLookupResult.qrxList.map((qrx) => (
                        <div key={qrx.id} style={styles.ticketItem}>
                          <div style={styles.ticketTop}>
                            <div>
                              <div style={styles.ticketTitle}>{qrx.title || "Ohne Titel"}</div>
                              <div style={styles.ticketMeta}>
                                {qrx.type || "normal"} · {qrx.verified ? "verifiziert" : "nicht verifiziert"} · {qrx.suspended ? "gesperrt" : "aktiv"}
                              </div>
                              <div style={styles.ticketMeta}>
                                QR-X ID: {qrx.id}
                              </div>
                              {qrx.company_name ? (
                                <div style={styles.ticketMeta}>Firma: {qrx.company_name}</div>
                              ) : null}
                            </div>
                            <div style={qrx.suspended ? styles.ticketStatusOpen : styles.ticketStatusResolved}>
                              {qrx.suspended ? "Gesperrt" : "Aktiv"}
                            </div>
                          </div>

                          {qrx.suspended_reason ? (
                            <div style={styles.historyNote}>Sperrgrund: {qrx.suspended_reason}</div>
                          ) : null}

                          <div style={styles.bottomRow}>
                            <a
                              href={`https://mioseg-qr.com/qrx/${qrx.id}`}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.qrxButton}
                            >
                              QR-X öffnen
                            </a>
                            <button
                              type="button"
                              onClick={() => handleQrxLookup(qrx.id)}
                              style={styles.secondaryLink}
                            >
                              In Moderation laden
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {userLookupResult.recentQrx.length > 0 ? (
                <div style={{ marginTop: 14 }}>
                  <h3 style={styles.panelTitle}>{tAdmin("label_recent_qrx")}</h3>
                  <div style={styles.ticketList}>
                    {userLookupResult.recentQrx.map((qrx) => (
                      <div key={qrx.id} style={styles.ticketItem}>
                        <div style={styles.ticketTop}>
                          <div>
                            <div style={styles.ticketTitle}>{qrx.title || "Ohne Titel"}</div>
                            <div style={styles.ticketMeta}>
                              {qrx.type || "normal"} · {qrx.verified ? "verifiziert" : "nicht verifiziert"} · {qrx.deleted_at ? "gelöscht" : qrx.suspended ? "gesperrt" : "aktiv"} · {qrx.id}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQrxLookup(qrx.id)}
                            style={styles.secondaryLink}
                          >
                            In Moderation laden
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div style={{ ...styles.commandPanel, marginBottom: 18, display: activeAdminTab === "reports" ? "block" : "none" }}>
          <h2 style={styles.panelTitle}>QR-X sperren / entsperren</h2>
          <p style={{ ...styles.subtleText, marginTop: 0 }}>
            Für Fake, Spam, gemeldete Inhalte oder Soft Delete. Beim Löschen bleiben die Daten erhalten und können wiederhergestellt werden.
          </p>

          <div style={styles.actionsRow}>
            <input
              value={qrxLookupId}
              onChange={(e) => setQrxLookupId(e.target.value)}
              placeholder="QR-X-ID"
              style={styles.searchInput}
            />
            <button
              type="button"
              onClick={() => handleQrxLookup()}
              disabled={qrxLookupLoading}
              style={{
                ...styles.refreshButton,
                opacity: qrxLookupLoading ? 0.65 : 1,
              }}
            >
              {qrxLookupLoading ? "Lade…" : "QR-X laden"}
            </button>
          </div>

          {qrxAdminItem ? (
            <div style={styles.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <h3 style={{ ...styles.panelTitle, marginBottom: 6 }}>
                    {qrxAdminItem.title || "Ohne Titel"}
                  </h3>
                  <div style={styles.ticketMeta}>
                    {qrxAdminItem.type || "normal"} · {qrxAdminItem.company_name || "Keine Firma"} · User: {qrxAdminItem.owner_user_id}
                  </div>
                  <div style={styles.ticketMeta}>
                    QR-X: {qrxAdminItem.id}
                  </div>
                </div>
                <div style={qrxAdminItem.deleted_at ? styles.ticketStatusOpen : qrxAdminItem.suspended ? styles.ticketStatusOpen : styles.ticketStatusResolved}>
                  {qrxAdminItem.deleted_at ? "Gelöscht" : qrxAdminItem.suspended ? "Gesperrt" : "Aktiv"}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <div style={getModerationBadgeStyle(qrxAdminItem.moderation_status)}>
                  {formatModerationStatus(qrxAdminItem.moderation_status, tAdmin)}
                </div>
                <div style={styles.counterBadge}>
                  Meldungen: {qrxAdminItem.report_count ?? 0}
                </div>
                <div style={styles.counterBadge}>
                  Score: {qrxAdminItem.report_score ?? 0}
                </div>
              </div>

              <div style={styles.qualityExceptionBox}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ maxWidth: 760 }}>
                    <h3 style={styles.qualityExceptionTitle}>Bildqualität Ausnahme</h3>
                    <p style={styles.qualityExceptionText}>
                      Standard ist die optimierte Bildauslieferung. Aktiviere Originalqualität nur bei besonderen QR-X,
                      z. B. wenn ein Premium-Unternehmen hochwertige Fotos ohne Qualitätsverlust in Detailansicht,
                      Galerie und Vollbild wünscht. Explore, Karten und Listen bleiben weiterhin Thumbnail-sicher.
                    </p>
                  </div>
                  <div style={styles.qualityExceptionStatus}>
                    {qrxAdminItem.force_original_quality
                      ? "Originalqualität aktiv"
                      : "Optimiert aktiv"}
                  </div>
                </div>

                <div style={styles.bottomRow}>
                  {qrxAdminItem.force_original_quality ? (
                    <button
                      type="button"
                      onClick={() => handleSetQrxOriginalQuality(false)}
                      disabled={qrxQualityWorking}
                      style={{
                        ...styles.approveButton,
                        opacity: qrxQualityWorking ? 0.65 : 1,
                      }}
                    >
                      {qrxQualityWorking ? "Speichere…" : "Optimierte Auslieferung wieder aktivieren"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetQrxOriginalQuality(true)}
                      disabled={qrxQualityWorking}
                      style={{
                        ...styles.storageWarningButton,
                        opacity: qrxQualityWorking ? 0.65 : 1,
                      }}
                    >
                      {qrxQualityWorking ? "Speichere…" : "Originalqualität erzwingen"}
                    </button>
                  )}
                </div>

                {qrxQualityMessage ? <div style={styles.resultBox}>{qrxQualityMessage}</div> : null}
              </div>

              <div
                style={{
                  marginTop: 14,
                  borderRadius: 16,
                  border: "1px solid #223146",
                  background: "#0b1324",
                  padding: 16,
                }}
              >
                <h3 style={{ ...styles.panelTitle, marginBottom: 6 }}>QR-X Statistik Boost</h3>
                <p style={{ ...styles.subtleText, marginTop: 0 }}>
                  Diese Werte werden nur addiert. Echte Saves, echte Views und Analytics bleiben unverändert.
                </p>

                <div style={styles.lookupGrid}>
                  <div style={styles.lookupMiniCard}>
                    <div style={styles.lookupMiniLabel}>Echte Follower</div>
                    <div style={styles.lookupMiniValue}>
                      {Math.max(0, Number(qrxAdminItem.real_follower_count ?? qrxAdminItem.follower_count ?? 0))}
                    </div>
                  </div>
                  <div style={styles.lookupMiniCard}>
                    <div style={styles.lookupMiniLabel}>Follower Boost</div>
                    <div style={styles.lookupMiniValue}>
                      +{Math.max(0, Number(qrxAdminItem.manual_follower_boost ?? 0))}
                    </div>
                  </div>
                  <div style={styles.lookupMiniCard}>
                    <div style={styles.lookupMiniLabel}>Sichtbare Follower</div>
                    <div style={styles.lookupMiniValue}>
                      {Math.max(0, Number(qrxAdminItem.real_follower_count ?? qrxAdminItem.follower_count ?? 0)) +
                        Math.max(0, Number(qrxAdminItem.manual_follower_boost ?? 0))}
                    </div>
                  </div>
                  <div style={styles.lookupMiniCard}>
                    <div style={styles.lookupMiniLabel}>Echte Aufrufe</div>
                    <div style={styles.lookupMiniValue}>
                      {Math.max(0, Number(qrxAdminItem.views_total ?? 0))}
                    </div>
                  </div>
                  <div style={styles.lookupMiniCard}>
                    <div style={styles.lookupMiniLabel}>Aufruf Boost</div>
                    <div style={styles.lookupMiniValue}>
                      +{Math.max(0, Number(qrxAdminItem.manual_view_boost ?? 0))}
                    </div>
                  </div>
                  <div style={styles.lookupMiniCard}>
                    <div style={styles.lookupMiniLabel}>Sichtbare Aufrufe</div>
                    <div style={styles.lookupMiniValue}>
                      {Math.max(0, Number(qrxAdminItem.views_total ?? 0)) +
                        Math.max(0, Number(qrxAdminItem.manual_view_boost ?? 0))}
                    </div>
                  </div>
                  <div style={styles.lookupMiniCard}>
                    <div style={styles.lookupMiniLabel}>Eindeutige Aufrufe</div>
                    <div style={styles.lookupMiniValue}>
                      {Math.max(0, Number(qrxAdminItem.views_unique_total ?? 0))}
                    </div>
                  </div>
                  <div style={styles.lookupMiniCard}>
                    <div style={styles.lookupMiniLabel}>Unique Boost</div>
                    <div style={styles.lookupMiniValue}>
                      +{Math.max(0, Number(qrxAdminItem.manual_unique_view_boost ?? 0))}
                    </div>
                  </div>
                  <div style={styles.lookupMiniCard}>
                    <div style={styles.lookupMiniLabel}>Sichtbare Unique Views</div>
                    <div style={styles.lookupMiniValue}>
                      {Math.max(0, Number(qrxAdminItem.views_unique_total ?? 0)) +
                        Math.max(0, Number(qrxAdminItem.manual_unique_view_boost ?? 0))}
                    </div>
                  </div>
                </div>

                <div style={{ ...styles.formGrid, marginTop: 14 }}>
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid #223146",
                      background: "#111b31",
                      padding: 12,
                    }}
                  >
                    <div style={{ ...styles.lookupMiniLabel, marginBottom: 8 }}>
                      Follower Boost
                    </div>
                    <input
                      value={qrxStatsFollowerBoost}
                      onChange={(e) => setQrxStatsFollowerBoost(e.target.value)}
                      placeholder="z. B. 100"
                      inputMode="numeric"
                      style={styles.input}
                    />
                    <div style={{ ...styles.historyNote, marginTop: 8 }}>
                      Wird zu den echten Followern addiert. Beispiel: 1 echter Follower + 100 Boost = 101 sichtbare Follower.
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid #223146",
                      background: "#111b31",
                      padding: 12,
                    }}
                  >
                    <div style={{ ...styles.lookupMiniLabel, marginBottom: 8 }}>
                      Aufruf Boost
                    </div>
                    <input
                      value={qrxStatsViewBoost}
                      onChange={(e) => setQrxStatsViewBoost(e.target.value)}
                      placeholder="z. B. 500"
                      inputMode="numeric"
                      style={styles.input}
                    />
                    <div style={{ ...styles.historyNote, marginTop: 8 }}>
                      Wird zu den echten Aufrufen addiert und beeinflusst Explore-Badges sowie Ranking.
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid #223146",
                      background: "#111b31",
                      padding: 12,
                    }}
                  >
                    <div style={{ ...styles.lookupMiniLabel, marginBottom: 8 }}>
                      Unique Aufruf Boost
                    </div>
                    <input
                      value={qrxStatsUniqueViewBoost}
                      onChange={(e) => setQrxStatsUniqueViewBoost(e.target.value)}
                      placeholder="z. B. 300"
                      inputMode="numeric"
                      style={styles.input}
                    />
                    <div style={{ ...styles.historyNote, marginTop: 8 }}>
                      Wird zu den eindeutigen Aufrufen addiert. Die echten Analytics bleiben unverändert.
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid #243044",
                      background: "#0f172a",
                      padding: 12,
                    }}
                  >
                    <div style={{ ...styles.lookupMiniLabel, marginBottom: 8 }}>
                      Vorschau nach dem Speichern
                    </div>
                    <div style={{ ...styles.historyNote, marginTop: 0 }}>
                      Sichtbare Follower: {Math.max(0, Number(qrxAdminItem.real_follower_count ?? qrxAdminItem.follower_count ?? 0)) + Math.max(0, Number(qrxStatsFollowerBoost || 0))} · Sichtbare Aufrufe: {Math.max(0, Number(qrxAdminItem.views_total ?? 0)) + Math.max(0, Number(qrxStatsViewBoost || 0))} · Sichtbare Unique Views: {Math.max(0, Number(qrxAdminItem.views_unique_total ?? 0)) + Math.max(0, Number(qrxStatsUniqueViewBoost || 0))}
                    </div>
                  </div>

                  <div style={styles.bottomRow}>
                    <button
                      type="button"
                      onClick={handleSaveQrxStatsBoost}
                      disabled={qrxStatsWorking}
                      style={{ ...styles.creditButton, opacity: qrxStatsWorking ? 0.65 : 1 }}
                    >
                      {qrxStatsWorking ? "Speichere…" : "Statistik-Boost speichern"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQrxStatsFollowerBoost("0");
                        setQrxStatsViewBoost("0");
                        setQrxStatsUniqueViewBoost("0");
                      }}
                      disabled={qrxStatsWorking}
                      style={styles.secondaryLink}
                    >
                      Boost auf 0 setzen
                    </button>
                  </div>

                  {qrxStatsMessage ? <div style={styles.resultBox}>{qrxStatsMessage}</div> : null}
                </div>
              </div>

              {qrxAdminItem.suspended_reason ? (
                <div style={{ ...styles.historyNote, marginTop: 10 }}>
                  Sperrgrund: {qrxAdminItem.suspended_reason}
                </div>
              ) : null}

              {qrxAdminItem.deleted_at ? (
                <div style={{ ...styles.historyNote, marginTop: 10 }}>
                  Gelöscht am: {new Date(qrxAdminItem.deleted_at).toLocaleString("de-DE")}
                  {qrxAdminItem.deleted_reason ? ` · Grund: ${qrxAdminItem.deleted_reason}` : ""}
                </div>
              ) : null}

              <div style={{ ...styles.formGrid, marginTop: 14 }}>
                <textarea
                  value={qrxSuspendReason}
                  onChange={(e) => setQrxSuspendReason(e.target.value)}
                  placeholder="Sperrgrund, z. B. Fake Business / Missbrauch / Spam"
                  style={styles.noteArea}
                />

                <div style={styles.bottomRow}>
                  <button
                    type="button"
                    onClick={() => handleSetQrxSuspended(true)}
                    disabled={qrxActionWorking}
                    style={{
                      ...styles.rejectButton,
                      opacity: qrxActionWorking ? 0.65 : 1,
                    }}
                  >
                    {qrxActionWorking ? "Bitte warten…" : "QR-X sperren"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetQrxSuspended(false)}
                    disabled={qrxActionWorking}
                    style={{
                      ...styles.approveButton,
                      opacity: qrxActionWorking ? 0.65 : 1,
                    }}
                  >
                    {qrxActionWorking ? "Bitte warten…" : "QR-X entsperren"}
                  </button>

                  {!qrxAdminItem.deleted_at ? (
                    <button
                      type="button"
                      onClick={() => handleSetQrxDeleted("soft_delete")}
                      disabled={qrxActionWorking}
                      style={{
                        ...styles.rejectButton,
                        opacity: qrxActionWorking ? 0.65 : 1,
                      }}
                    >
                      {qrxActionWorking ? "Bitte warten…" : "QR-X löschen"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetQrxDeleted("restore")}
                      disabled={qrxActionWorking}
                      style={{
                        ...styles.approveButton,
                        opacity: qrxActionWorking ? 0.65 : 1,
                      }}
                    >
                      {qrxActionWorking ? "Bitte warten…" : "QR-X wiederherstellen"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleMarkQrxReviewed(qrxAdminItem.id)}
                    disabled={reviewingQrxId === qrxAdminItem.id}
                    style={{
                      ...styles.secondaryLink,
                      opacity: reviewingQrxId === qrxAdminItem.id ? 0.65 : 1,
                    }}
                  >
                    {reviewingQrxId === qrxAdminItem.id ? "Bitte warten…" : "Als geprüft markieren"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ ...styles.commandGrid, display: activeAdminTab === "verifications" || activeAdminTab === "credits" ? "grid" : "none" }}>
          <div style={{ ...styles.commandPanel, display: activeAdminTab === "verifications" ? "block" : "none" }}>
            <h2 style={styles.panelTitle}>Verifizierungs-Zentrale</h2>

            <div style={styles.actionsRow}>
              <button onClick={fetchRequests} style={styles.refreshButton}>
                Aktualisieren
              </button>
              <div style={styles.counterBadge}>{openCountText}</div>
              {oldestWaitingText ? <div style={styles.counterBadge}>{oldestWaitingText}</div> : null}
            </div>

            <div style={styles.actionsRow}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Suchen nach Firma, Titel, User-ID, QR-X-ID..."
                style={styles.searchInput}
              />

              <div style={styles.filterWrap}>
                <label htmlFor="verification-sort" style={styles.filterLabel}>
                  Sortierung
                </label>
                <select
                  id="verification-sort"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  style={styles.filterSelect}
                >
                  <option value="oldest">Am längsten wartend</option>
                  <option value="newest">Neueste zuerst</option>
                  <option value="company">Firma A–Z</option>
                  <option value="title">Titel A–Z</option>
                </select>
              </div>

              <div style={styles.filterWrap}>
                <label htmlFor="wait-filter" style={styles.filterLabel}>
                  Wartezeit
                </label>
                <select
                  id="wait-filter"
                  value={waitFilter}
                  onChange={(e) => setWaitFilter(e.target.value as WaitFilter)}
                  style={styles.filterSelect}
                >
                  <option value="all">{tAdmin("label_all")}</option>
                  <option value="7">Ab 7 Tagen</option>
                  <option value="14">Ab 14 Tagen</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ ...styles.commandPanel, display: activeAdminTab === "credits" ? "block" : "none" }}>
            <h2 style={styles.panelTitle}>Credits-Verwaltung</h2>
            <p style={{ ...styles.subtleText, marginTop: 0 }}>
              Für Kulanz, Erstattung oder manuelle Gutschriften. Nutze die User-ID aus dem Antrag.
            </p>

            <div style={styles.formGrid}>
              <input
                value={creditUserId}
                onChange={(e) => setCreditUserId(e.target.value)}
                placeholder="User-ID"
                style={styles.input}
              />

              <div style={styles.presetRow}>
                {CREDIT_PRESETS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setCreditAmount(String(amount))}
                    style={{
                      ...styles.presetButton,
                      borderColor: creditAmount === String(amount) ? "#fbbf24" : "#2d3f59",
                      color: creditAmount === String(amount) ? "#fbbf24" : "#f8fafc",
                    }}
                  >
                    +{amount}
                  </button>
                ))}
              </div>

              <input
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Anzahl Credits"
                inputMode="numeric"
                style={styles.input}
              />

              <textarea
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                placeholder="Notiz, z. B. Kulanz wegen Upload-Problem"
                style={styles.noteArea}
              />

              <button
                type="button"
                onClick={handleAddCredits}
                disabled={creditWorking}
                style={{
                  ...styles.creditButton,
                  opacity: creditWorking ? 0.65 : 1,
                }}
              >
                {creditWorking ? "Buche Credits…" : "Credits gutschreiben"}
              </button>

              {creditResult ? <div style={styles.resultBox}>{creditResult}</div> : null}
            </div>

            <div style={styles.historyBox}>
              <h2 style={styles.panelTitle}>Credit-Historie prüfen</h2>
              <p style={{ ...styles.subtleText, marginTop: 0 }}>
                Zeigt den aktuellen Credit-Stand, Stripe-Käufe, Rechnungsstatus und Admin-Gutschriften für einen Nutzer.
              </p>

              <div style={styles.formGrid}>
                <input
                  value={historyUserId}
                  onChange={(e) => setHistoryUserId(e.target.value)}
                  placeholder="User-ID für Historie"
                  style={styles.input}
                />

                <button
                  type="button"
                  onClick={handleFetchCreditHistory}
                  disabled={historyLoading}
                  style={{
                    ...styles.presetButton,
                    opacity: historyLoading ? 0.65 : 1,
                  }}
                >
                  {historyLoading ? "Lade Historie…" : "Historie laden"}
                </button>

                {creditHistory ? (
                  <div style={styles.historyList}>
                    <div style={styles.dashboardGrid}>
                      <div style={styles.metricCard}>
                        <div style={styles.metricLabel}>Aktueller Stand</div>
                        <div style={styles.metricValue}>
                          {creditHistory.currentCredits ?? "unbekannt"}
                        </div>
                        <div style={styles.metricHint}>Credits aktuell in qrx_credits.</div>
                      </div>

                      <div style={styles.metricCard}>
                        <div style={styles.metricLabel}>Käufe</div>
                        <div style={styles.metricValue}>{creditHistory.summary.purchaseCount}</div>
                        <div style={styles.metricHint}>Geladene Einträge aus qrx_credit_purchases.</div>
                      </div>

                      <div style={styles.metricCard}>
                        <div style={styles.metricLabel}>Gekaufte Credits</div>
                        <div style={styles.metricValue}>
                          {creditHistory.summary.totalPurchasedCredits}
                        </div>
                        <div style={styles.metricHint}>Summe bezahlter/abgeschlossener Käufe.</div>
                      </div>

                      <div style={styles.metricCard}>
                        <div style={styles.metricLabel}>Umsatz brutto</div>
                        <div style={styles.metricValue}>
                          {formatPrice(creditHistory.summary.totalPaidCents, "EUR")}
                        </div>
                        <div style={styles.metricHint}>
                          Erstattet: {formatPrice(creditHistory.summary.totalRefundedCents, "EUR")}
                        </div>
                      </div>
                    </div>

                    {creditHistory.invoiceLoadWarning ? (
                      <div style={styles.historyItem}>
                        <div style={styles.historyNote}>
                          Hinweis: Rechnungen konnten nicht vollständig geladen werden: {creditHistory.invoiceLoadWarning}
                        </div>
                      </div>
                    ) : null}

                    <div style={styles.historyItem}>
                      <div style={styles.historyTop}>
                        <span>Kaufhistorie</span>
                        <span>{creditHistory.purchases.length} Einträge</span>
                      </div>
                    </div>

                    {creditHistory.purchases.length === 0 ? (
                      <div style={styles.historyItem}>
                        <div style={styles.historyNote}>Noch keine Käufe für diesen Nutzer gefunden.</div>
                      </div>
                    ) : (
                      creditHistory.purchases.map((purchase) => {
                        const invoice = findInvoiceForPurchase(purchase);
                        const refundedCents =
                          (purchase.refunded_cents ?? 0) + (purchase.refunded_amount_cents ?? 0);
                        const currency = purchase.currency || "EUR";

                        return (
                          <div key={purchase.id} style={styles.historyItem}>
                            <div style={styles.historyTop}>
                              <span>
                                {purchase.credits ?? "–"} Credits · {formatPrice(purchase.amount_cents, currency)}
                              </span>
                              <span>
                                {purchase.paid_at
                                  ? new Date(purchase.paid_at).toLocaleString("de-DE")
                                  : purchase.created_at
                                    ? new Date(purchase.created_at).toLocaleString("de-DE")
                                    : "–"}
                              </span>
                            </div>

                            <div style={styles.historyNote}>
                              Status: {formatCreditPurchaseStatus(purchase.status)} · Paket: {purchase.pack_id || "–"} · Rechnung: {invoice ? "vorhanden" : "nicht gefunden"}
                              {purchase.billing_email ? ` · E-Mail: ${purchase.billing_email}` : ""}
                              {refundedCents > 0 ? ` · Erstattet: ${formatPrice(refundedCents, currency)}` : ""}
                            </div>

                            <div style={styles.ticketMeta}>
                              Purchase-ID: {purchase.id}
                              {purchase.stripe_payment_intent_id ? ` · PaymentIntent: ${purchase.stripe_payment_intent_id}` : ""}
                              {purchase.stripe_customer_id ? ` · Customer: ${purchase.stripe_customer_id}` : ""}
                              {invoice?.invoice_number ? ` · Rechnung: ${invoice.invoice_number}` : ""}
                            </div>

                            <div style={styles.bottomRow}>
                              {formatCreditPurchaseStatus(purchase.status) === "Bezahlt" && !purchase.stripe_refund_id ? (
                                <button
                                  type="button"
                                  onClick={() => handleRefundPurchase(purchase)}
                                  disabled={refundWorkingPurchaseId === purchase.id}
                                  style={{
                                    ...styles.rejectButton,
                                    opacity: refundWorkingPurchaseId === purchase.id ? 0.65 : 1,
                                  }}
                                >
                                  {refundWorkingPurchaseId === purchase.id ? "Erstatte…" : "Kauf erstatten"}
                                </button>
                              ) : null}

                              {purchase.stripe_refund_id ? (
                                <div style={styles.counterBadge}>Refund: {purchase.stripe_refund_id}</div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}

                    <div style={styles.historyItem}>
                      <div style={styles.historyTop}>
                        <span>Admin-/System-Log</span>
                        <span>{creditHistory.history.length} Einträge</span>
                      </div>
                    </div>

                    {creditHistory.history.length === 0 ? (
                      <div style={styles.historyItem}>
                        <div style={styles.historyNote}>Noch keine Creditbuchungen im Admin-Log vorhanden.</div>
                      </div>
                    ) : (
                      creditHistory.history.map((entry) => (
                        <div key={entry.id} style={styles.historyItem}>
                          <div style={styles.historyTop}>
                            <span>
                              {entry.amount != null && entry.amount > 0 ? "+" : ""}
                              {entry.amount ?? "–"} Credits
                            </span>
                            <span>{new Date(entry.created_at).toLocaleString("de-DE")}</span>
                          </div>
                          <div style={styles.historyNote}>
                            {entry.note || formatAdminAction(entry.action_type, tAdmin) || "Keine Notiz"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}              </div>
            </div>
          </div>
        </div>

        <div style={{ ...styles.commandPanel, marginBottom: 18, display: activeAdminTab === "reports" ? "block" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h2 style={styles.panelTitle}>{tAdmin("label_reported_qrx")}</h2>
              <p style={{ ...styles.subtleText, marginTop: 0, marginBottom: 10 }}>
                QR-X mit Meldungen oder automatischer Moderation. Hier kannst du direkt öffnen, sperren oder nach Prüfung zurücksetzen.
              </p>
            </div>
            <button type="button" onClick={fetchReportedQrx} style={styles.secondaryLink}>
              Gemeldete QR-X aktualisieren
            </button>
          </div>

          {reportedQrxLoading ? (
            <div style={styles.stateCard}>Lade gemeldete QR-X…</div>
          ) : reportedQrx.length === 0 ? (
            <div style={styles.stateCard}>Keine gemeldeten QR-X mit offenem Moderationsstatus.</div>
          ) : (
            <div style={styles.ticketList}>
              {reportedQrx.map((qrx) => (
                <div key={qrx.id} style={styles.ticketItem}>
                  <div style={styles.ticketTop}>
                    <div>
                      <div style={styles.ticketTitle}>{qrx.title || "Ohne Titel"}</div>
                      <div style={styles.ticketMeta}>
                        {qrx.type || "normal"} · {qrx.company_name || "Keine Firma"} · User: {qrx.owner_user_id}
                      </div>
                      <div style={styles.ticketMeta}>QR-X: {qrx.id}</div>
                    </div>
                    <div style={getModerationBadgeStyle(qrx.moderation_status)}>
                      {formatModerationStatus(qrx.moderation_status, tAdmin)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <div style={styles.counterBadge}>Meldungen: {qrx.report_count ?? 0}</div>
                    <div style={styles.counterBadge}>Score: {qrx.report_score ?? 0}</div>
                    <div style={qrx.suspended ? styles.ticketStatusOpen : styles.ticketStatusResolved}>
                      {qrx.suspended ? "Gesperrt" : "Aktiv"}
                    </div>
                  </div>

                  {qrx.suspended_reason ? (
                    <div style={styles.historyNote}>Sperrgrund: {qrx.suspended_reason}</div>
                  ) : null}

                  <div style={styles.bottomRow}>
                    <a
                      href={`https://mioseg-qr.com/qrx/${qrx.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.qrxButton}
                    >
                      QR-X öffnen
                    </a>

                    <button
                      type="button"
                      onClick={() => handleQrxLookup(qrx.id)}
                      style={styles.secondaryLink}
                    >
                      In Moderation laden
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setQrxAdminItem(qrx);
                        setQrxLookupId(qrx.id);
                        setQrxSuspendReason(
                          qrx.suspended_reason ||
                            `Manuell gesperrt nach Meldungen. Meldungen: ${qrx.report_count ?? 0}, Score: ${qrx.report_score ?? 0}`
                        );
                      }}
                      style={styles.rejectButton}
                    >
                      Sperrgrund übernehmen
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMarkQrxReviewed(qrx.id)}
                      disabled={reviewingQrxId === qrx.id}
                      style={{
                        ...styles.approveButton,
                        opacity: reviewingQrxId === qrx.id ? 0.65 : 1,
                      }}
                    >
                      {reviewingQrxId === qrx.id ? "Bitte warten…" : "Als geprüft markieren"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...styles.commandPanel, marginBottom: 18, display: activeAdminTab === "support" ? "block" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h2 style={styles.panelTitle}>Support-Tickets</h2>
              <p style={{ ...styles.subtleText, marginTop: 0, marginBottom: 10 }}>
                Lege Fälle an, wenn Nutzer Credits, Uploads, Verifizierung oder Transfer melden. So bleibt jede Kulanzentscheidung nachvollziehbar.
              </p>
            </div>
            <button type="button" onClick={fetchTickets} style={styles.secondaryLink}>
              Tickets aktualisieren
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 390px) minmax(0, 1fr)", gap: 16 }}>
            <div style={styles.formGrid}>
              <input
                value={ticketUserId}
                onChange={(e) => setTicketUserId(e.target.value)}
                placeholder="User-ID optional"
                style={styles.input}
              />

              <input
                value={ticketQrxId}
                onChange={(e) => setTicketQrxId(e.target.value)}
                placeholder="QR-X ID optional"
                style={styles.input}
              />

              <select
                value={ticketProblemType}
                onChange={(e) => setTicketProblemType(e.target.value as TicketProblemType)}
                style={styles.filterSelect}
              >
                <option value="credits_wrong">Credits falsch abgezogen</option>
                <option value="verification_waiting">Verifizierung hängt</option>
                <option value="upload_problem">Upload Problem</option>
                <option value="transfer_problem">Transfer Problem</option>
                <option value="other">Sonstiges</option>
              </select>

              <input
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="Kurzer Titel, z. B. 5 Credits zu viel abgezogen"
                style={styles.input}
              />

              <textarea
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Beschreibung / Notiz"
                style={styles.noteArea}
              />

              <button
                type="button"
                onClick={handleCreateTicket}
                disabled={ticketWorking}
                style={{
                  ...styles.creditButton,
                  opacity: ticketWorking ? 0.65 : 1,
                }}
              >
                {ticketWorking ? "Lege Fall an…" : "Supportfall anlegen"}
              </button>

              {ticketResult ? <div style={styles.resultBox}>{ticketResult}</div> : null}
            </div>

            <div>
              {ticketsLoading ? (
                <div style={styles.stateCard}>Lade Supportfälle…</div>
              ) : tickets.length === 0 ? (
                <div style={styles.stateCard}>Noch keine Supportfälle vorhanden.</div>
              ) : (
                <div style={styles.ticketList}>
                  {tickets.map((ticket) => (
                    <div key={ticket.id} style={styles.ticketItem}>
                      <div style={styles.ticketTop}>
                        <div>
                          <div style={styles.ticketTitle}>
                            {ticket.ticket_number || "Supportfall"} · {ticket.title}
                          </div>
                          <div style={styles.ticketMeta}>
                            {formatProblemType(ticket.problem_type, tAdmin)} · {new Date(ticket.created_at).toLocaleString("de-DE")}
                          </div>
                        </div>
                        <div style={getTicketStatusStyle(ticket.status)}>
                          {formatTicketStatus(ticket.status, tAdmin)}
                        </div>
                      </div>

                      <div style={styles.ticketMeta}>
                        {ticket.user_id ? `User: ${ticket.user_id}` : "User: –"}
                        {ticket.qrx_id ? ` · QR-X: ${ticket.qrx_id}` : ""}
                      </div>

                      {ticket.description ? (
                        <div style={styles.historyNote}>{ticket.description}</div>
                      ) : null}

                      {ticket.qrx_id && qrxReportDetails[ticket.qrx_id] ? (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                          <div style={getModerationBadgeStyle(qrxReportDetails[ticket.qrx_id].moderation_status)}>
                            {formatModerationStatus(qrxReportDetails[ticket.qrx_id].moderation_status, tAdmin)}
                          </div>
                          <div style={styles.counterBadge}>
                            Meldungen: {qrxReportDetails[ticket.qrx_id].report_count ?? 0}
                          </div>
                          <div style={styles.counterBadge}>
                            Score: {qrxReportDetails[ticket.qrx_id].report_score ?? 0}
                          </div>
                        </div>
                      ) : null}

                      {ticket.qrx_id ? (
                        <div style={styles.bottomRow}>
                          <a
                            href={`https://mioseg-qr.com/qrx/${ticket.qrx_id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.qrxButton}
                          >
                            QR-X öffnen
                          </a>

                          <button
                            type="button"
                            onClick={() => handleQrxLookup(ticket.qrx_id || "")}
                            style={styles.secondaryLink}
                          >
                            In Moderation laden
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSuspendTicketQrx(ticket)}
                            style={styles.rejectButton}
                          >
                            QR-X sperren
                          </button>
                        </div>
                      ) : null}

                      <div style={styles.bottomRow}>
                        <button
                          type="button"
                          onClick={() => handleUpdateTicketStatus(ticket.id, "in_review")}
                          style={styles.presetButton}
                        >
                          In Prüfung
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateTicketStatus(ticket.id, "resolved")}
                          style={styles.presetButton}
                        >
                          Gelöst
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateTicketStatus(ticket.id, "open")}
                          style={styles.presetButton}
                        >
                          Wieder öffnen
                        </button>
                      </div>

                      <div style={{ ...styles.formGrid, marginTop: 12 }}>
                        <div style={styles.ticketMeta}>
                          Ticket direkt mit Credit-Erstattung lösen
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <input
                            value={ticketRefundAmounts[ticket.id] ?? ""}
                            onChange={(e) =>
                              setTicketRefundAmounts((prev) => ({
                                ...prev,
                                [ticket.id]: e.target.value,
                              }))
                            }
                            placeholder="Credits, z. B. 5"
                            inputMode="numeric"
                            style={{ ...styles.input, maxWidth: 160 }}
                          />
                          <button
                            type="button"
                            onClick={() => handleResolveTicketWithCredits(ticket)}
                            style={styles.creditButton}
                          >
                            Credits erstatten & lösen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ ...styles.commandPanel, marginBottom: 18, display: activeAdminTab === "prices" ? "block" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h2 style={styles.panelTitle}>{tAdmin("prices_section_title")}</h2>
              <p style={{ ...styles.subtleText, marginTop: 0, marginBottom: 10 }}>
{tAdmin("prices_section_hint")}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={fetchPricing} style={styles.secondaryLink}>
                Preise aktualisieren
              </button>
              <button
                type="button"
                onClick={handleToggleLaunchDiscount}
                disabled={pricingConfigSaving || !pricingData?.pricingConfig}
                style={{
                  ...styles.qrxButton,
                  opacity: pricingConfigSaving || !pricingData?.pricingConfig ? 0.65 : 1,
                }}
              >
                {pricingConfigSaving
                  ? "Speichere…"
                  : pricingData?.pricingConfig?.launch_discount_enabled
                    ? "Launch-Rabatt deaktivieren"
                    : "Launch-Rabatt aktivieren"}
              </button>
            </div>
          </div>

          {pricingMessage ? <div style={styles.resultBox}>{pricingMessage}</div> : null}

          {pricingLoading ? (
            <div style={styles.stateCard}>Lade Preis-Konfiguration…</div>
          ) : !pricingData ? (
            <div style={styles.stateCard}>Noch keine Preis-Konfiguration geladen.</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={styles.dashboardGrid}>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>{tAdmin("prices_launch_discount_card")}</div>
                  <div style={styles.metricValue}>
                    {pricingData.pricingConfig?.launch_discount_enabled ? "Aktiv" : "Inaktiv"}
                  </div>
                  <div style={styles.metricHint}>{tAdmin("prices_launch_discount_hint")}</div>
                </div>

                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>{tAdmin("prices_currency_card")}</div>
                  <div style={styles.metricValue}>{pricingData.pricingConfig?.currency || "EUR"}</div>
                  <div style={styles.metricHint}>{tAdmin("prices_currency_hint")}</div>
                </div>

                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>{tAdmin("prices_active_packs_card")}</div>
                  <div style={styles.metricValue}>
                    {pricingData.pricingPacks.filter((pack) => pack.is_active).length}
                  </div>
                  <div style={styles.metricHint}>{tAdmin("prices_active_packs_hint")}</div>
                </div>

                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>QR-X Erstellung</div>
                  <div style={styles.metricValue}>{pricingData.pricingConfig?.qrx_creation_credit_cost ?? 1} Credit</div>
                  <div style={styles.metricHint}>Kosten für die Erstellung eines QR-X.</div>
                </div>

                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>Freier Speicher</div>
                  <div style={styles.metricValue}>{pricingData.pricingConfig?.free_storage_mb ?? 2} MB</div>
                  <div style={styles.metricHint}>Kostenloser Speicher pro QR-X vor Zusatzpaketen.</div>
                </div>

                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>{tAdmin("prices_daily_limit_card")}</div>
                  <div style={styles.metricValue}>
                    {pricingData.limits
                      ? `${pricingData.limits.remainingCreditsToday}/${pricingData.limits.maxDailyCreditGrant}`
                      : "–"}
                  </div>
                  <div style={styles.metricHint}>{tAdmin("prices_daily_limit_hint")}</div>
                </div>
              </div>

              <div style={styles.ticketItem}>
                <div style={styles.ticketTop}>
                  <div>
                    <div style={styles.ticketTitle}>Plattform-Konfiguration</div>
                    <div style={styles.ticketMeta}>
                      Zentrale Werte für QR-X-Erstellung, freien Speicher, Speicherpakete und Upload-Limits.
                    </div>
                  </div>
                  <div style={styles.ticketStatusReview}>Zentral</div>
                </div>

                <div style={{ ...styles.formGrid, marginTop: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                    <label style={styles.filterLabel}>
                      Freier Speicher in MB
                      <input
                        value={pricingConfigDraft.free_storage_mb}
                        onChange={(e) => handlePricingConfigDraftChange("free_storage_mb", e.target.value)}
                        inputMode="numeric"
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.filterLabel}>
                      QR-X Erstellung in Credits
                      <input
                        value={pricingConfigDraft.qrx_creation_credit_cost}
                        onChange={(e) => handlePricingConfigDraftChange("qrx_creation_credit_cost", e.target.value)}
                        inputMode="numeric"
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.filterLabel}>
                      Speicherpaket in MB
                      <input
                        value={pricingConfigDraft.storage_pack_mb}
                        onChange={(e) => handlePricingConfigDraftChange("storage_pack_mb", e.target.value)}
                        inputMode="numeric"
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.filterLabel}>
                      Credits pro Speicherpaket
                      <input
                        value={pricingConfigDraft.storage_pack_credit_cost}
                        onChange={(e) => handlePricingConfigDraftChange("storage_pack_credit_cost", e.target.value)}
                        inputMode="numeric"
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.filterLabel}>
                      Max. Upload in MB
                      <input
                        value={pricingConfigDraft.max_upload_mb}
                        onChange={(e) => handlePricingConfigDraftChange("max_upload_mb", e.target.value)}
                        inputMode="numeric"
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.filterLabel}>
                      Max. Bilder pro QR-X
                      <input
                        value={pricingConfigDraft.max_images_per_qrx}
                        onChange={(e) => handlePricingConfigDraftChange("max_images_per_qrx", e.target.value)}
                        inputMode="numeric"
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.filterLabel}>
                      Max. Dateien pro QR-X
                      <input
                        value={pricingConfigDraft.max_documents_per_qrx}
                        onChange={(e) => handlePricingConfigDraftChange("max_documents_per_qrx", e.target.value)}
                        inputMode="numeric"
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.filterLabel}>
                      Max. News/Updates
                      <input
                        value={pricingConfigDraft.max_updates}
                        onChange={(e) => handlePricingConfigDraftChange("max_updates", e.target.value)}
                        inputMode="numeric"
                        style={styles.input}
                      />
                    </label>
                  </div>

                  <div style={styles.bottomRow}>
                    <button
                      type="button"
                      onClick={handleSavePricingConfig}
                      disabled={pricingConfigSaving}
                      style={{
                        ...styles.creditButton,
                        opacity: pricingConfigSaving ? 0.65 : 1,
                      }}
                    >
                      {pricingConfigSaving ? "Speichere…" : "Plattform-Konfiguration speichern"}
                    </button>
                  </div>
                </div>
              </div>

              {pricingData.pricingPacks.length === 0 ? (
                <div style={styles.stateCard}>Keine Credit-Pakete gefunden.</div>
              ) : (
                <div style={styles.ticketList}>
                  {pricingData.pricingPacks.map((pack) => {
                    const currency = pricingData.pricingConfig?.currency || "EUR";

                    return (
                      <div key={pack.id} style={styles.ticketItem}>
                        <div style={styles.ticketTop}>
                          <div>
                            <div style={styles.ticketTitle}>
                              {pack.credits} {tAdmin("prices_credits_label")}
                              {pack.badge ? ` · ${pack.badge}` : ""}
                            </div>
                            <div style={styles.ticketMeta}>
                              {tAdmin("prices_id")}: {pack.id} · {tAdmin("prices_sorting")}: {pack.sort_order ?? "–"}
                            </div>
                          </div>
                          <div style={pack.is_active ? styles.ticketStatusResolved : styles.ticketStatusOpen}>
                            {pack.is_active ? "Aktiv" : "Inaktiv"}
                          </div>
                        </div>

                        <div style={{ ...styles.formGrid, marginTop: 12 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                            <label style={styles.filterLabel}>
                              Launch-Preis in Cent
                              <input
                                value={pricingDrafts[pack.id]?.price_cents_launch ?? ""}
                                onChange={(e) =>
                                  handlePricingDraftChange(pack.id, "price_cents_launch", e.target.value)
                                }
                                placeholder="z. B. 599"
                                inputMode="numeric"
                                style={styles.input}
                              />
                              <span style={styles.ticketMeta}>
                                {formatPrice(Number(pricingDrafts[pack.id]?.price_cents_launch || 0), currency)}
                              </span>
                            </label>

                            <label style={styles.filterLabel}>
                              Normalpreis in Cent
                              <input
                                value={pricingDrafts[pack.id]?.price_cents_regular ?? ""}
                                onChange={(e) =>
                                  handlePricingDraftChange(pack.id, "price_cents_regular", e.target.value)
                                }
                                placeholder="z. B. 999"
                                inputMode="numeric"
                                style={styles.input}
                              />
                              <span style={styles.ticketMeta}>
                                {formatPrice(Number(pricingDrafts[pack.id]?.price_cents_regular || 0), currency)}
                              </span>
                            </label>

                            <label style={styles.filterLabel}>
                              Badge
                              <input
                                value={pricingDrafts[pack.id]?.badge ?? ""}
                                onChange={(e) =>
                                  handlePricingDraftChange(pack.id, "badge", e.target.value)
                                }
                                placeholder={tAdmin("prices_badge_placeholder")}
                                style={styles.input}
                              />
                            </label>
                          </div>

                          <label style={{ ...styles.filterLabel, display: "flex", alignItems: "center", gap: 10 }}>
                            <input
                              type="checkbox"
                              checked={pricingDrafts[pack.id]?.is_active ? true : false}
                              onChange={(e) =>
                                handlePricingDraftChange(pack.id, "is_active", e.target.checked)
                              }
                            />
                            Paket aktiv
                          </label>

                          <div style={styles.bottomRow}>
                            <button
                              type="button"
                              onClick={() => handleSavePricingPack(pack)}
                              disabled={pricingSavingId === pack.id}
                              style={{
                                ...styles.creditButton,
                                opacity: pricingSavingId === pack.id ? 0.65 : 1,
                              }}
                            >
                              {pricingSavingId === pack.id ? "Speichere…" : "Paket speichern"}
                            </button>
                          </div>

                          <div style={styles.ticketMeta}>
                            {tAdmin("prices_updated_at")}: {pack.updated_at ? new Date(pack.updated_at).toLocaleString("de-DE") : "–"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ ...styles.commandPanel, marginBottom: 18, display: activeAdminTab === "logs" ? "block" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h2 style={styles.panelTitle}>{tAdmin("logs_title")}</h2>
              <p style={{ ...styles.subtleText, marginTop: 0, marginBottom: 10 }}>
                Durchsuche kritische Änderungen: Preise, Credits, QR-X Sperren, Support und Verifizierungen.
              </p>
            </div>
            <button type="button" onClick={fetchAdminActions} style={styles.secondaryLink}>
              Aktionen aktualisieren
            </button>
          </div>

          <div style={styles.dashboardGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>{tAdmin("logs_loaded_actions")}</div>
              <div style={styles.metricValue}>{adminActionsLoading ? "…" : adminActions.length}</div>
              <div style={styles.metricHint}>Aktuell geladene Einträge aus dem Admin-Log.</div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>{tAdmin("logs_today")}</div>
              <div style={styles.metricValue}>{adminActionsLoading ? "…" : todayAdminActionsCount}</div>
              <div style={styles.metricHint}>Admin-Aktionen am heutigen Tag.</div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>{tAdmin("logs_filtered")}</div>
              <div style={styles.metricValue}>{adminActionsLoading ? "…" : filteredAdminActions.length}</div>
              <div style={styles.metricHint}>Einträge passend zu Suche und Filter.</div>
            </div>
          </div>

          <div style={styles.actionsRow}>
            <input
              value={adminLogSearch}
              onChange={(e) => setAdminLogSearch(e.target.value)}
              placeholder={tAdmin("logs_search_placeholder")}
              style={styles.searchInput}
            />

            <div style={styles.filterWrap}>
              <label htmlFor="admin-log-filter" style={styles.filterLabel}>
                Aktion
              </label>
              <select
                id="admin-log-filter"
                value={adminLogTypeFilter}
                onChange={(e) => setAdminLogTypeFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">{tAdmin("label_all_actions")}</option>
                {adminActionTypes.map((actionType) => (
                  <option key={actionType} value={actionType}>
                    {formatAdminAction(actionType, tAdmin)}
                  </option>
                ))}
              </select>
            </div>

            {(adminLogSearch || adminLogTypeFilter !== "all") ? (
              <button
                type="button"
                onClick={() => {
                  setAdminLogSearch("");
                  setAdminLogTypeFilter("all");
                }}
                style={styles.secondaryLink}
              >
                Filter zurücksetzen
              </button>
            ) : null}
          </div>

          {adminActionsLoading ? (
            <div style={styles.stateCard}>Lade Admin-Aktionen…</div>
          ) : adminActions.length === 0 ? (
            <div style={styles.stateCard}>Noch keine Admin-Aktionen im Log vorhanden.</div>
          ) : filteredAdminActions.length === 0 ? (
            <div style={styles.stateCard}>Keine Aktionen passend zum aktuellen Filter.</div>
          ) : (
            <div style={styles.ticketList}>
              {filteredAdminActions.map((entry) => (
                <div key={entry.id} style={styles.ticketItem}>
                  <div style={styles.ticketTop}>
                    <div>
                      <div style={styles.ticketTitle}>
                        {formatAdminAction(entry.action_type, tAdmin)}
                        {entry.amount != null ? ` · ${entry.amount > 0 ? "+" : ""}${entry.amount} Credits` : ""}
                      </div>
                      <div style={styles.ticketMeta}>
                        {new Date(entry.created_at).toLocaleString("de-DE")}
                        {entry.target_user_id ? ` · User: ${entry.target_user_id}` : ""}
                        {entry.qrx_id ? ` · QR-X: ${entry.qrx_id}` : ""}
                      </div>
                    </div>

                    <div style={styles.counterBadge}>{formatAdminAction(entry.action_type, tAdmin)}</div>
                  </div>

                  {entry.note ? <div style={styles.historyNote}>{entry.note}</div> : null}

                  <div style={styles.bottomRow}>
                    {entry.target_user_id ? (
                      <button
                        type="button"
                        onClick={() => {
                          setUserLookupQuery(entry.target_user_id || "");
                          setActiveAdminTab("users");
                        }}
                        style={styles.secondaryLink}
                      >
                        Nutzer öffnen
                      </button>
                    ) : null}

                    {entry.qrx_id ? (
                      <>
                        <a
                          href={`https://mioseg-qr.com/qrx/${entry.qrx_id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.qrxButton}
                        >
                          QR-X öffnen
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            handleQrxLookup(entry.qrx_id || "");
                            setActiveAdminTab("reports");
                          }}
                          style={styles.secondaryLink}
                        >
                          In Moderation laden
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeAdminTab === "verifications" ? (
          <>
        {loading ? (
          <div style={styles.stateCard}>Lade…</div>
        ) : sortedRequests.length === 0 ? (
          <div style={styles.stateCard}>
            Keine passenden offenen Verifizierungsanträge.
          </div>
        ) : (
          <div style={styles.grid}>
            {sortedRequests.map((item) => {
              const isPdf = item.document_type === "pdf";
              const noteValue = notes[item.id] ?? "";
              const qrxTitle = item.qrx_title?.trim() || "Ohne Titel";
              const companyName = item.company_name?.trim() || "–";

              return (
                <section key={item.id} style={styles.card}>
                  <div style={styles.cardBody}>
                    <div style={styles.leftCol}>
                      <div style={styles.panel}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                          <h2 style={{ ...styles.panelTitle, marginBottom: 0 }}>QR-X Übersicht</h2>
                          <div style={styles.waitBadge}>{`${item.waiting_days} ${item.waiting_days === 1 ? "Tag" : "Tage"} in Prüfung`}</div>
                        </div>

                        <div style={styles.infoGrid}>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>{tAdmin("table_title")}</div>
                            <div style={styles.infoValue}>{qrxTitle}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>{tAdmin("table_company")}</div>
                            <div style={styles.infoValue}>{companyName}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>{tAdmin("table_category")}</div>
                            <div style={styles.infoValue}>{formatCategory(item.category)}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>Wartezeit</div>
                            <div style={styles.infoValue}>{`${item.waiting_days} ${item.waiting_days === 1 ? "Tag" : "Tage"} in Prüfung`}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>Request-ID</div>
                            <div style={styles.infoValue}>{item.id}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>QR-X ID</div>
                            <div style={styles.infoValue}>{item.qrx_id}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>User-ID</div>
                            <div style={styles.infoValue}>{item.owner_user_id}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>Datei</div>
                            <div style={styles.infoValue}>{item.document_filename}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>Erstellt</div>
                            <div style={styles.infoValue}>
                              {new Date(item.created_at).toLocaleString("de-DE")}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={styles.panel}>
                        <h2 style={styles.panelTitle}>{tAdmin("table_actions")}</h2>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {item.qrx_web_url ? (
                            <a
                              href={item.qrx_web_url}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.qrxButton}
                            >
                              QR-X öffnen
                            </a>
                          ) : null}

                          {item.signed_document_url ? (
                            <a
                              href={item.signed_document_url}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.secondaryLink}
                            >
                              Nachweis öffnen
                            </a>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => {
                              setCreditUserId(item.owner_user_id);
                              setHistoryUserId(item.owner_user_id);
                              setTicketUserId(item.owner_user_id);
                              setTicketQrxId(item.qrx_id);
                            }}
                            style={styles.secondaryLink}
                          >
                            User-ID für Credits übernehmen
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 14 }}>
                      <div style={styles.panel}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                          <h2 style={{ ...styles.panelTitle, marginBottom: 0 }}>Nachweis-Vorschau</h2>
                          <div style={styles.badge}>
                            <span>Typ:</span>
                            <span>{isPdf ? "PDF" : "Bild"}</span>
                          </div>
                        </div>

                        <div style={styles.previewWrap}>
                          {item.signed_document_url ? (
                            isPdf ? (
                              <iframe
                                title={`Dokument ${item.document_filename}`}
                                src={item.signed_document_url}
                                style={styles.pdfPreview}
                              />
                            ) : (
                              <img
                                src={item.signed_document_url}
                                alt={item.document_filename}
                                style={styles.previewImage}
                              />
                            )
                          ) : (
                            <div style={styles.previewEmpty}>
                              Keine Vorschau verfügbar. Öffne den Nachweis über den Button oben.
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={styles.panel}>
                        <h2 style={styles.panelTitle}>Review-Notiz</h2>
                        <textarea
                          value={noteValue}
                          onChange={(e) =>
                            setNotes((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder="Optional: Grund für Ablehnung oder interne Notiz"
                          style={styles.noteArea}
                        />

                        <div style={styles.bottomRow}>
                          <button
                            onClick={() => handleReview(item.id, "approve")}
                            disabled={workingId === item.id}
                            style={{
                              ...styles.approveButton,
                              opacity: workingId === item.id ? 0.6 : 1,
                            }}
                          >
                            {workingId === item.id ? "Bitte warten…" : "Freigeben"}
                          </button>

                          <button
                            onClick={() => handleReview(item.id, "reject")}
                            disabled={workingId === item.id}
                            style={{
                              ...styles.rejectButton,
                              opacity: workingId === item.id ? 0.6 : 1,
                            }}
                          >
                            {workingId === item.id ? "Bitte warten…" : "Ablehnen"}
                          </button>
                        </div>

                        <p style={{ ...styles.subtleText, marginTop: 10, marginBottom: 0 }}>
                          Bei Ablehnung werden die Verifizierungs-Credits automatisch zurückgebucht.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

          </>
        ) : null}
      </div>
    </main>
  );
}
