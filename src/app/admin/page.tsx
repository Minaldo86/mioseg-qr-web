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
};

type PricingConfig = {
  id?: string | number | null;
  launch_discount_enabled?: boolean | null;
  currency?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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

function formatProblemType(value: string) {
  switch (value) {
    case "credits_wrong":
      return "Credits falsch abgezogen";
    case "verification_waiting":
      return "Verifizierung hängt";
    case "upload_problem":
      return "Upload Problem";
    case "transfer_problem":
      return "Transfer Problem";
    case "qrx_report":
      return "QR-X Meldung";
    default:
      return "Sonstiges";
  }
}

function formatTicketStatus(value: string) {
  switch (value) {
    case "in_review":
      return "In Prüfung";
    case "resolved":
      return "Gelöst";
    default:
      return "Offen";
  }
}

function formatModerationStatus(value: string | null | undefined) {
  switch (value) {
    case "flagged":
      return "Zur Prüfung markiert";
    case "auto_suspended":
      return "Automatisch gesperrt";
    case "ok":
      return "OK";
    default:
      return "Unbekannt";
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

function formatAdminAction(value: string) {
  switch (value) {
    case "credits_added":
      return "Credits gutgeschrieben";
    case "credits_refunded_from_ticket":
      return "Ticket-Credits erstattet";
    case "support_ticket_resolved_with_credit":
      return "Ticket mit Credits gelöst";
    case "support_ticket_created":
      return "Supportfall angelegt";
    case "support_ticket_in_review":
      return "Supportfall in Prüfung";
    case "support_ticket_resolved":
      return "Supportfall gelöst";
    case "support_ticket_open":
      return "Supportfall geöffnet";
    case "verification_approved":
      return "QR-X verifiziert";
    case "verification_rejected":
      return "QR-X abgelehnt";
    case "qrx_soft_deleted":
      return "QR-X gelöscht";
    case "qrx_restored":
      return "QR-X wiederhergestellt";
    default:
      return value.replaceAll("_", " ");
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
  const [qrxReportDetails, setQrxReportDetails] = useState<Record<string, QrxAdminItem>>({});
  const [reportedQrx, setReportedQrx] = useState<QrxAdminItem[]>([]);
  const [reportedQrxLoading, setReportedQrxLoading] = useState(false);
  const [reviewingQrxId, setReviewingQrxId] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("overview");

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


  const adminTabs: Array<{ key: AdminTab; label: string; hint: string }> = [
    { key: "overview", label: "Übersicht", hint: "Kennzahlen und wichtigste offene Punkte" },
    { key: "verifications", label: "Verifizierungen", hint: "Business-QR-X Nachweise prüfen" },
    { key: "reports", label: "Meldungen", hint: "Gemeldete und gesperrte QR-X moderieren" },
    { key: "support", label: "Support", hint: "Tickets und Reklamationen bearbeiten" },
    { key: "users", label: "Nutzer", hint: "Nutzer suchen und QR-X zuordnen" },
    { key: "credits", label: "Credits", hint: "Gutschriften und Credit-Historie" },
    { key: "finance", label: "Finanzen", hint: "Rechnungen, Umsatz und Steuerexport vorbereiten" },
    { key: "prices", label: "Preise", hint: "Credit-Pakete und Preis-Konfiguration lesen" },
    { key: "logs", label: "Logs", hint: "Letzte Admin-Aktionen prüfen" },
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
        return "Bezahlt";
      case "pending":
        return "Offen";
      case "failed":
        return "Fehlgeschlagen";
      case "refunded":
        return "Erstattet";
      case "canceled":
      case "cancelled":
        return "Abgebrochen";
      default:
        return status || "Unbekannt";
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
    if (!financeData?.invoices?.length) {
      alert("Keine Rechnungen für den Export geladen.");
      return;
    }

    const rows = financeData.invoices.map((invoice) => ({
      invoice_number: invoice.invoice_number || "",
      created_at: invoice.created_at || "",
      provider: formatProvider(invoice.payment_provider),
      user_id: invoice.user_id || "",
      billing_email: invoice.billing_email || "",
      country: invoice.billing_country_code || "",
      gross_cents: invoice.total_cents ?? invoice.amount_cents ?? 0,
      net_cents: invoice.net_cents ?? "",
      tax_cents: invoice.tax_cents ?? "",
      currency: invoice.currency || "EUR",
      purchase_id: invoice.purchase_id || "",
      stripe_payment_intent_id: invoice.stripe_payment_intent_id || "",
      pdf_path: invoice.pdf_path || invoice.storage_path || "",
    }));

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(";"),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = String(row[header as keyof typeof row] ?? "");
            return `"${value.replaceAll('"', '""')}"`;
          })
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mioseg-finance-${financeFrom}-bis-${financeTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        throw new Error(data?.error || "Finanzdaten konnten nicht geladen werden.");
      }

      setFinanceData(data);
    } catch (error: unknown) {
      console.error("fetchFinance error:", error);
      setFinanceError(error instanceof Error ? error.message : "Finanzdaten konnten nicht geladen werden.");
    } finally {
      setFinanceLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      setPricingLoading(true);

      const res = await fetch("/api/admin/credits", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Preise konnten nicht geladen werden.");
      }

      const packs = Array.isArray(data?.pricingPacks) ? data.pricingPacks : [];

      setPricingData({
        pricingConfig: data?.pricingConfig ?? null,
        pricingPacks: packs,
        limits: data?.limits ?? undefined,
      });

      setPricingDrafts(
        packs.reduce((acc: Record<string, PricingPackDraft>, pack: PricingPack) => {
          acc[pack.id] = {
            price_cents_launch:
              typeof pack.price_cents_launch === "number" ? String(pack.price_cents_launch) : "",
            price_cents_regular:
              typeof pack.price_cents_regular === "number" ? String(pack.price_cents_regular) : "",
            badge: pack.badge || "",
            is_active: Boolean(pack.is_active),
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
          .filter((qrxId): qrxId is string => Boolean(qrxId))
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
        formatAdminAction(entry.action_type),
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
  }, [adminActions, adminLogSearch, adminLogTypeFilter]);

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
        throw new Error("Bitte einen kurzen Titel für den Supportfall eintragen.");
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
        throw new Error(data?.error || "Supportfall konnte nicht angelegt werden.");
      }

      setTicketResult(`Supportfall angelegt: ${data.ticket?.ticket_number || data.ticket?.id || "OK"}`);
      setTicketTitle("");
      setTicketDescription("");
      setTicketQrxId("");
      await fetchTickets();
      await fetchAdminActions();
    } catch (error: unknown) {
      console.error("handleCreateTicket error:", error);
      alert(error instanceof Error ? error.message : "Supportfall konnte nicht angelegt werden.");
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
        throw new Error(data?.error || "Supportfall konnte nicht aktualisiert werden.");
      }

      if (refundAmount && refundAmount > 0) {
        setTicketRefundAmounts((prev) => ({ ...prev, [ticketId]: "" }));
        setCreditResult(
          `Supportfall gelöst und +${refundAmount} Credits erstattet. Neuer Stand: ${data.newCredits ?? "unbekannt"} Credits.`
        );
      }

      await fetchTickets();
      await fetchAdminActions();
      await handleFetchCreditHistory();
    } catch (error: unknown) {
      console.error("handleUpdateTicketStatus error:", error);
      alert(error instanceof Error ? error.message : "Supportfall konnte nicht aktualisiert werden.");
    }
  };

  const handleResolveTicketWithCredits = async (ticket: SupportTicket) => {
    const rawAmount = ticketRefundAmounts[ticket.id] ?? "";
    const amount = Number(rawAmount);

    if (!ticket.user_id) {
      alert("Dieser Supportfall hat keine User-ID. Bitte User-ID im Ticket hinterlegen.");
      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      alert("Bitte eine gültige Credit-Anzahl für die Erstattung eintragen.");
      return;
    }

    if (amount > 100) {
      alert("Maximal 100 Credits pro Erstattung erlaubt.");
      return;
    }

    await handleUpdateTicketStatus(ticket.id, "resolved", amount);
  };


  const handleSuspendTicketQrx = async (ticket: SupportTicket) => {
    try {
      if (!ticket.qrx_id) {
        alert("Dieses Ticket hat keine QR-X-ID.");
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
        throw new Error(data?.error || "QR-X konnte nicht gesperrt werden.");
      }

      setQrxAdminItem(data.qrx);
      setQrxLookupId(data.qrx?.id || ticket.qrx_id);
      setQrxSuspendReason(data.qrx?.suspended_reason || "");

      await fetchTickets();
      await fetchAdminActions();

      alert("QR-X wurde gesperrt.");
    } catch (error: unknown) {
      console.error("handleSuspendTicketQrx error:", error);
      alert(error instanceof Error ? error.message : "QR-X konnte nicht gesperrt werden.");
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

      setQrxAdminItem(data.qrx);
      setQrxLookupId(data.qrx?.id || qrxId);
      setQrxSuspendReason(data.qrx?.suspended_reason || "");
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

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.title}>Admin – Kommandozentrale</h1>
            <p style={styles.subtitle}>
              Prüfe Business-QR-X, verwalte Verifizierungen und buche Credits bei Kulanz oder Erstattung.
            </p>
          </div>
        </div>

        <div style={styles.tabsWrap}>
          {adminTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveAdminTab(tab.key)}
              title={tab.hint}
              style={activeAdminTab === tab.key ? styles.tabButtonActive : styles.tabButton}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: activeAdminTab === "overview" ? "block" : "none" }}>
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
              <div style={styles.metricLabel}>Gemeldete QR-X</div>
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
                    ? formatAdminAction(lastAdminAction.action_type)
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
                <option value="all">Alle</option>
                <option value="stripe">Stripe Web</option>
                <option value="apple">Apple App Store</option>
                <option value="google">Google Play</option>
              </select>
            </label>

            <button type="button" onClick={fetchFinance} disabled={financeLoading} style={{ ...styles.refreshButton, opacity: financeLoading ? 0.65 : 1 }}>
              {financeLoading ? "Lade…" : "Finanzen laden"}
            </button>

            <button type="button" onClick={downloadFinanceCsv} disabled={!financeData?.invoices?.length} style={financeData?.invoices?.length ? styles.creditButton : styles.disabledSmallButton}>
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

          <div style={styles.tableWrap}>
            <table style={styles.dataTable}>
              <thead>
                <tr>
                  <th style={styles.tableTh}>Rechnung</th>
                  <th style={styles.tableTh}>Datum</th>
                  <th style={styles.tableTh}>Quelle</th>
                  <th style={styles.tableTh}>E-Mail</th>
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
                  <div style={styles.infoLabel}>E-Mail</div>
                  <div style={styles.infoValue}>{userLookupResult.email || "–"}</div>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>Status</div>
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
                  <div style={styles.lookupMiniLabel}>Offene Tickets</div>
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
                  <h3 style={styles.panelTitle}>Letzte QR-X</h3>
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
                  {formatModerationStatus(qrxAdminItem.moderation_status)}
                </div>
                <div style={styles.counterBadge}>
                  Meldungen: {qrxAdminItem.report_count ?? 0}
                </div>
                <div style={styles.counterBadge}>
                  Score: {qrxAdminItem.report_score ?? 0}
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
                  <option value="all">Alle</option>
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
                            {entry.note || formatAdminAction(entry.action_type) || "Keine Notiz"}
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
              <h2 style={styles.panelTitle}>Gemeldete QR-X</h2>
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
                      {formatModerationStatus(qrx.moderation_status)}
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
                            {formatProblemType(ticket.problem_type)} · {new Date(ticket.created_at).toLocaleString("de-DE")}
                          </div>
                        </div>
                        <div style={getTicketStatusStyle(ticket.status)}>
                          {formatTicketStatus(ticket.status)}
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
                            {formatModerationStatus(qrxReportDetails[ticket.qrx_id].moderation_status)}
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
              <h2 style={styles.panelTitle}>Preis-/Credit-Konfiguration</h2>
              <p style={{ ...styles.subtleText, marginTop: 0, marginBottom: 10 }}>
Bearbeite Credit-Pakete kontrolliert. Änderungen wirken direkt, sobald App/Web die Preise aus Supabase laden.
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
                  <div style={styles.metricLabel}>Launch-Rabatt</div>
                  <div style={styles.metricValue}>
                    {pricingData.pricingConfig?.launch_discount_enabled ? "Aktiv" : "Inaktiv"}
                  </div>
                  <div style={styles.metricHint}>Steuert, ob Launch- oder Normalpreise relevant sind.</div>
                </div>

                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>Währung</div>
                  <div style={styles.metricValue}>{pricingData.pricingConfig?.currency || "EUR"}</div>
                  <div style={styles.metricHint}>Währung aus der Pricing-Konfiguration.</div>
                </div>

                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>Aktive Pakete</div>
                  <div style={styles.metricValue}>
                    {pricingData.pricingPacks.filter((pack) => pack.is_active).length}
                  </div>
                  <div style={styles.metricHint}>Pakete, die aktuell aktiv markiert sind.</div>
                </div>

                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>Tageslimit Admin-Credits</div>
                  <div style={styles.metricValue}>
                    {pricingData.limits
                      ? `${pricingData.limits.remainingCreditsToday}/${pricingData.limits.maxDailyCreditGrant}`
                      : "–"}
                  </div>
                  <div style={styles.metricHint}>Heute noch manuell gutzuschreibende Credits.</div>
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
                              {pack.credits} Credits
                              {pack.badge ? ` · ${pack.badge}` : ""}
                            </div>
                            <div style={styles.ticketMeta}>
                              ID: {pack.id} · Sortierung: {pack.sort_order ?? "–"}
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
                                placeholder="z. B. Beliebt"
                                style={styles.input}
                              />
                            </label>
                          </div>

                          <label style={{ ...styles.filterLabel, display: "flex", alignItems: "center", gap: 10 }}>
                            <input
                              type="checkbox"
                              checked={Boolean(pricingDrafts[pack.id]?.is_active)}
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
                            Aktualisiert: {pack.updated_at ? new Date(pack.updated_at).toLocaleString("de-DE") : "–"}
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
              <h2 style={styles.panelTitle}>Admin-Aktionslog</h2>
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
              <div style={styles.metricLabel}>Geladene Aktionen</div>
              <div style={styles.metricValue}>{adminActionsLoading ? "…" : adminActions.length}</div>
              <div style={styles.metricHint}>Aktuell geladene Einträge aus dem Admin-Log.</div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Heute</div>
              <div style={styles.metricValue}>{adminActionsLoading ? "…" : todayAdminActionsCount}</div>
              <div style={styles.metricHint}>Admin-Aktionen am heutigen Tag.</div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Gefiltert</div>
              <div style={styles.metricValue}>{adminActionsLoading ? "…" : filteredAdminActions.length}</div>
              <div style={styles.metricHint}>Einträge passend zu Suche und Filter.</div>
            </div>
          </div>

          <div style={styles.actionsRow}>
            <input
              value={adminLogSearch}
              onChange={(e) => setAdminLogSearch(e.target.value)}
              placeholder="Suche nach User-ID, QR-X-ID, Notiz, Aktion…"
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
                <option value="all">Alle Aktionen</option>
                {adminActionTypes.map((actionType) => (
                  <option key={actionType} value={actionType}>
                    {formatAdminAction(actionType)}
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
                        {formatAdminAction(entry.action_type)}
                        {entry.amount != null ? ` · ${entry.amount > 0 ? "+" : ""}${entry.amount} Credits` : ""}
                      </div>
                      <div style={styles.ticketMeta}>
                        {new Date(entry.created_at).toLocaleString("de-DE")}
                        {entry.target_user_id ? ` · User: ${entry.target_user_id}` : ""}
                        {entry.qrx_id ? ` · QR-X: ${entry.qrx_id}` : ""}
                      </div>
                    </div>

                    <div style={styles.counterBadge}>{entry.action_type}</div>
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
                            <div style={styles.infoLabel}>Titel</div>
                            <div style={styles.infoValue}>{qrxTitle}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>Firma</div>
                            <div style={styles.infoValue}>{companyName}</div>
                          </div>
                          <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>Kategorie</div>
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
                        <h2 style={styles.panelTitle}>Aktionen</h2>
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
