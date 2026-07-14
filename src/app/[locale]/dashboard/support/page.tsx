"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import styles from "../dashboard.module.css";

type SupportTicket = {
  id: string;
  ticket_number: string | null;
  user_id: string | null;
  qrx_id: string | null;
  problem_type: string | null;
  status: string | null;
  title: string;
  description: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string | null;
  resolved_at: string | null;
};

type OwnQrx = {
  id: string;
  title: string | null;
  company_name: string | null;
};

type ProblemType =
  | "credits_wrong"
  | "verification_waiting"
  | "upload_problem"
  | "transfer_problem"
  | "qrx_report"
  | "other";

const PROBLEM_TYPES: Array<{ value: ProblemType; label: string }> = [
  { value: "credits_wrong", label: "Credits oder Zahlung" },
  { value: "verification_waiting", label: "Verifizierung" },
  { value: "upload_problem", label: "Upload oder Dateien" },
  { value: "transfer_problem", label: "QR-X-Transfer" },
  { value: "qrx_report", label: "QR-X oder Inhalt melden" },
  { value: "other", label: "Sonstiges" },
];

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }
  return fallback;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "–";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusMeta(status: string | null | undefined) {
  if (status === "in_review") {
    return {
      label: "In Bearbeitung",
      color: "#fde68a",
      background: "rgba(245,158,11,0.13)",
      border: "1px solid rgba(253,230,138,0.18)",
    };
  }

  if (status === "waiting_customer") {
    return {
      label: "Warten auf deine Rückmeldung",
      color: "#fde68a",
      background: "rgba(245,158,11,0.13)",
      border: "1px solid rgba(253,230,138,0.18)",
    };
  }

  if (status === "resolved") {
    return {
      label: "Gelöst",
      color: "#bbf7d0",
      background: "rgba(34,197,94,0.13)",
      border: "1px solid rgba(134,239,172,0.2)",
    };
  }

  return {
    label: "Offen",
    color: "#bfdbfe",
    background: "rgba(59,130,246,0.13)",
    border: "1px solid rgba(147,197,253,0.18)",
  };
}

function getProblemLabel(value: string | null | undefined) {
  return (
    PROBLEM_TYPES.find((item) => item.value === value)?.label || "Sonstiges"
  );
}

function getQrxTitle(item: OwnQrx) {
  return item.company_name?.trim() || item.title?.trim() || "Unbenannter QR-X";
}

export default function SupportPage() {
  const params = useParams();
  const locale = getParam(
    params?.locale as string | string[] | undefined,
    "de",
  );

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ownQrx, setOwnQrx] = useState<OwnQrx[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [problemType, setProblemType] =
    useState<ProblemType>("other");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [qrxId, setQrxId] = useState("");

  const [errorText, setErrorText] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadSupportCenter();
  }, []);

  const counts = useMemo(() => {
    return tickets.reduce(
      (acc, ticket) => {
        if (ticket.status === "resolved") acc.resolved += 1;
        else if (ticket.status === "in_review" || ticket.status === "waiting_customer") acc.inReview += 1;
        else acc.open += 1;
        return acc;
      },
      { open: 0, inReview: 0, resolved: 0 },
    );
  }, [tickets]);

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    if (!session?.access_token) {
      throw new Error("Bitte melde dich zuerst an.");
    }

    return session.access_token;
  }

  async function loadSupportCenter() {
    setLoading(true);

    setErrorText(null);

    try {
      const token = await getAccessToken();

      const [ticketResponse, qrxResponse] = await Promise.all([
        fetch("/api/support/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }),
        supabase
          .from("qr_x_entries")
          .select("id,title,company_name")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .returns<OwnQrx[]>(),
      ]);

      if (!ticketResponse.ok) {
        const payload = (await ticketResponse.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(
          payload?.error || "Support-Anfragen konnten nicht geladen werden.",
        );
      }

      const ticketPayload = (await ticketResponse.json()) as {
        tickets?: SupportTicket[];
      };

      if (qrxResponse.error) {
        console.warn(
          "Eigene QR-X konnten nicht geladen werden:",
          qrxResponse.error.message,
        );
      }

      setTickets(ticketPayload.tickets ?? []);
      setOwnQrx(qrxResponse.data ?? []);
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Support-Center konnte nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (creating) return;

    setErrorText(null);
    setMessage(null);

    if (title.trim().length < 4) {
      setErrorText("Bitte gib einen aussagekräftigen Betreff ein.");
      return;
    }

    if (description.trim().length < 10) {
      setErrorText(
        "Bitte beschreibe dein Anliegen mit mindestens 10 Zeichen.",
      );
      return;
    }

    setCreating(true);

    try {
      const token = await getAccessToken();

      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemType,
          title: title.trim(),
          description: description.trim(),
          qrxId: qrxId || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        ticket?: SupportTicket;
      } | null;

      if (!response.ok) {
        throw new Error(
          payload?.error || "Die Anfrage konnte nicht gesendet werden.",
        );
      }

      if (payload?.ticket) {
        setTickets((current) => [payload.ticket as SupportTicket, ...current]);
      }

      setProblemType("other");
      setTitle("");
      setDescription("");
      setQrxId("");
      setFormOpen(false);
      setMessage(
        "Deine Support-Anfrage wurde übermittelt. Bei Rückfragen kontaktieren wir dich per E-Mail.",
      );
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Die Anfrage konnte nicht gesendet werden.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label="Support Navigation">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>Meine QR-X</Link>
          <Link href={`/${locale}/dashboard/account`}>Konto</Link>
        </nav>
      </header>

      <div className="mioseg-support-content">
        <section className={styles.hero}>
          <div>
            <span className={styles.kicker}>Support</span>
            <h1>Support & Hilfe</h1>
            <p>
              Melde Probleme, stelle Fragen und prüfe den Status deiner
              bisherigen Support-Anfragen.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Link
              href={`/${locale}/dashboard`}
              className={styles.secondaryButton}
            >
              Zurück zum Dashboard
            </Link>

            <button
              type="button"
              onClick={() => {
                setErrorText(null);
                setMessage(null);
                setFormOpen((value) => !value);
              }}
              className={styles.primaryButton}
              style={{ border: 0, cursor: "pointer" }}
            >
              {formOpen ? "Formular schließen" : "+ Neue Anfrage"}
            </button>
          </div>
        </section>

        <section className={styles.statsGrid} aria-label="Support Übersicht">
          <article className={styles.statCard}>
            <div className={styles.statIcon}>📨</div>
            <div>
              <div className={styles.statValue}>
                {loading ? "…" : counts.open}
              </div>
              <div className={styles.statLabel}>Offen</div>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>🛠️</div>
            <div>
              <div className={styles.statValue}>
                {loading ? "…" : counts.inReview}
              </div>
              <div className={styles.statLabel}>In Bearbeitung</div>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div>
              <div className={styles.statValue}>
                {loading ? "…" : counts.resolved}
              </div>
              <div className={styles.statLabel}>Gelöst</div>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>✉️</div>
            <div>
              <div className={styles.statValue}>E-Mail</div>
              <div className={styles.statLabel}>Rückfragen</div>
            </div>
          </article>
        </section>

        {message ? <div style={successStyle}>{message}</div> : null}
        {errorText ? <div style={errorStyle}>{errorText}</div> : null}

        {formOpen ? (
          <section style={panelStyle}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Neue Support-Anfrage</h2>
                <p>
                  Beschreibe dein Anliegen möglichst genau. Falls nötig melden
                  wir uns per E-Mail bei dir.
                </p>
              </div>
              <span>Neu</span>
            </div>

            <form
              onSubmit={handleCreateTicket}
              style={{ display: "grid", gap: 13 }}
            >
              <label style={labelStyle}>
                Kategorie
                <select
                  value={problemType}
                  onChange={(event) =>
                    setProblemType(event.target.value as ProblemType)
                  }
                  style={selectStyle}
                >
                  {PROBLEM_TYPES.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                      style={optionStyle}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Betreff
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Kurze Beschreibung des Problems"
                  maxLength={140}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Beschreibung
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Was ist passiert? Was hast du bereits versucht?"
                  rows={7}
                  maxLength={5000}
                  style={textareaStyle}
                />
              </label>

              <label style={labelStyle}>
                Betroffener QR-X (optional)
                <select
                  value={qrxId}
                  onChange={(event) => setQrxId(event.target.value)}
                  style={selectStyle}
                >
                  <option value="" style={optionStyle}>
                    Kein bestimmter QR-X
                  </option>

                  {ownQrx.map((item) => (
                    <option key={item.id} value={item.id} style={optionStyle}>
                      {getQrxTitle(item)}
                    </option>
                  ))}
                </select>
              </label>

              <div style={noticeStyle}>
                Rückfragen und weitere Informationen erhältst du an die
                E-Mail-Adresse deines Mioseg-qr-Kontos.
              </div>

              <button
                type="submit"
                disabled={creating}
                className={styles.primaryButton}
                style={{
                  border: 0,
                  cursor: creating ? "not-allowed" : "pointer",
                  opacity: creating ? 0.65 : 1,
                }}
              >
                {creating ? "Wird gesendet …" : "Anfrage absenden"}
              </button>
            </form>
          </section>
        ) : null}

        <section style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Meine Anfragen</h2>
              <p>
                Hier siehst du Ticketnummer, Kategorie und Bearbeitungsstatus.
              </p>
            </div>
            <span>{loading ? "Lädt" : `${tickets.length} Tickets`}</span>
          </div>

          {loading ? (
            <div style={loadingStyle}>Support-Anfragen werden geladen …</div>
          ) : null}

          {!loading && tickets.length === 0 ? (
            <div style={emptyStyle}>
              <div style={emptyIconStyle}>🛟</div>
              <strong>Noch keine Support-Anfragen</strong>
              <span>
                Sobald du eine Anfrage sendest, erscheint sie hier und wird
                gleichzeitig im Adminbereich angezeigt.
              </span>
            </div>
          ) : null}

          {!loading && tickets.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {tickets.map((ticket) => {
                const status = getStatusMeta(ticket.status);

                return (
                  <article key={ticket.id} style={ticketStyle}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={ticketTopRowStyle}>
                        <span style={ticketNumberStyle}>
                          {ticket.ticket_number || "Support-Ticket"}
                        </span>

                        <span
                          style={{
                            ...statusBadgeStyle,
                            color: status.color,
                            background: status.background,
                            border: status.border,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>

                      <h3 style={ticketTitleStyle}>{ticket.title}</h3>

                      <div style={ticketMetaStyle}>
                        <span>{getProblemLabel(ticket.problem_type)}</span>
                        <span>·</span>
                        <span>{formatDateTime(ticket.created_at)}</span>
                      </div>

                      {ticket.description ? (
                        <p style={ticketDescriptionStyle}>
                          {ticket.description}
                        </p>
                      ) : null}

                      {ticket.status === "resolved" &&
                      ticket.resolution_note ? (
                        <div style={resolutionStyle}>
                          <strong>Abschluss:</strong> {ticket.resolution_note}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.mioseg-support-content {
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  box-sizing: border-box;
}
          `.trim(),
        }}
      />
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 28,
  padding: 22,
  marginBottom: 18,
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(148,163,184,0.16)",
  boxShadow: "0 22px 62px rgba(0,0,0,0.17)",
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
  boxSizing: "border-box",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#ffffff",
  padding: "12px 14px",
  fontSize: 14,
  fontWeight: 750,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 150,
  resize: "vertical",
  fontFamily: "inherit",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  colorScheme: "dark",
};

const optionStyle: React.CSSProperties = {
  background: "#111827",
  color: "#ffffff",
};

const noticeStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: "12px 14px",
  background: "rgba(59,130,246,0.1)",
  border: "1px solid rgba(147,197,253,0.15)",
  color: "#bfdbfe",
  fontSize: 12,
  fontWeight: 800,
  lineHeight: 1.5,
};

const successStyle: React.CSSProperties = {
  borderRadius: 20,
  padding: 15,
  marginBottom: 16,
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(134,239,172,0.22)",
  color: "#bbf7d0",
  fontWeight: 850,
};

const errorStyle: React.CSSProperties = {
  borderRadius: 20,
  padding: 15,
  marginBottom: 16,
  background: "rgba(239,68,68,0.14)",
  border: "1px solid rgba(252,165,165,0.22)",
  color: "#fecaca",
  fontWeight: 850,
};

const loadingStyle: React.CSSProperties = {
  minHeight: 140,
  display: "grid",
  placeItems: "center",
  color: "#94a3b8",
  fontWeight: 850,
};

const emptyStyle: React.CSSProperties = {
  minHeight: 210,
  borderRadius: 22,
  padding: 24,
  display: "grid",
  placeItems: "center",
  gap: 10,
  textAlign: "center",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#94a3b8",
  lineHeight: 1.5,
  fontWeight: 800,
};

const emptyIconStyle: React.CSSProperties = {
  width: 58,
  height: 58,
  borderRadius: 20,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(180deg,#ffffff,#dbeafe)",
  color: "#07101f",
  fontSize: 25,
};

const ticketStyle: React.CSSProperties = {
  borderRadius: 20,
  padding: 16,
  display: "flex",
  gap: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const ticketTopRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const ticketNumberStyle: React.CSSProperties = {
  color: "#93c5fd",
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: "0.05em",
};

const statusBadgeStyle: React.CSSProperties = {
  minHeight: 29,
  borderRadius: 999,
  padding: "0 10px",
  display: "inline-flex",
  alignItems: "center",
  fontSize: 11,
  fontWeight: 900,
};

const ticketTitleStyle: React.CSSProperties = {
  margin: "9px 0 0",
  color: "#ffffff",
  fontSize: 17,
  lineHeight: 1.35,
};

const ticketMetaStyle: React.CSSProperties = {
  marginTop: 6,
  display: "flex",
  gap: 7,
  flexWrap: "wrap",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 800,
};

const ticketDescriptionStyle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#cbd5e1",
  fontSize: 13,
  lineHeight: 1.55,
  whiteSpace: "pre-wrap",
};

const resolutionStyle: React.CSSProperties = {
  marginTop: 12,
  borderRadius: 15,
  padding: "11px 13px",
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(134,239,172,0.15)",
  color: "#bbf7d0",
  fontSize: 12,
  lineHeight: 1.5,
};
