"use client";

import { useState } from "react";

type QrxReportLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

const REPORT_TEXT = {
  de:{fake:"Betrug / Fake",wrongBusiness:"Falsche Unternehmensangaben",spam:"Spam / Werbung",illegal:"Illegale oder gefährliche Inhalte",copyright:"Urheberrecht / fremde Inhalte",other:"Sonstiges",min:"Bitte beschreibe das Problem mit mindestens 20 Zeichen.",failed:"Meldung konnte nicht gesendet werden.",link:"Inhalt beanstanden",aria:"QR-X melden",title:"QR-X melden",hint:"Melde diesen QR-X nur, wenn du ein echtes Problem erkennst. Eine Meldung sperrt den QR-X nicht automatisch.",thanks:"Danke. Deine Meldung wurde an die Moderation weitergeleitet.",reason:"Grund",description:"Beschreibung",descriptionPlaceholder:"Beschreibe kurz, was an diesem QR-X problematisch ist.",email:"E-Mail für Rückfragen (optional)",cancel:"Abbrechen",sending:"Sende…",send:"Meldung senden"},
  en:{fake:"Fraud / fake",wrongBusiness:"Incorrect business information",spam:"Spam / advertising",illegal:"Illegal or dangerous content",copyright:"Copyright / third-party content",other:"Other",min:"Please describe the problem using at least 20 characters.",failed:"The report could not be sent.",link:"Report content",aria:"Report QR-X",title:"Report QR-X",hint:"Only report this QR-X if you identify a genuine problem. A report does not automatically block the QR-X.",thanks:"Thank you. Your report has been forwarded to moderation.",reason:"Reason",description:"Description",descriptionPlaceholder:"Briefly describe what is problematic about this QR-X.",email:"Email for follow-up questions (optional)",cancel:"Cancel",sending:"Sending…",send:"Send report"},
  tr:{fake:"Dolandırıcılık / sahte",wrongBusiness:"Yanlış işletme bilgileri",spam:"Spam / reklam",illegal:"Yasadışı veya tehlikeli içerik",copyright:"Telif hakkı / başkasına ait içerik",other:"Diğer",min:"Lütfen sorunu en az 20 karakterle açıklayın.",failed:"Bildirim gönderilemedi.",link:"İçeriği bildir",aria:"QR-X'i bildir",title:"QR-X'i bildir",hint:"Bu QR-X'i yalnızca gerçek bir sorun görüyorsanız bildirin. Bildirim QR-X'i otomatik olarak engellemez.",thanks:"Teşekkürler. Bildiriminiz moderasyona iletildi.",reason:"Neden",description:"Açıklama",descriptionPlaceholder:"Bu QR-X'te neyin sorunlu olduğunu kısaca açıklayın.",email:"Sorular için e-posta (isteğe bağlı)",cancel:"İptal",sending:"Gönderiliyor…",send:"Bildirimi gönder"},
  pl:{fake:"Oszustwo / fałszywe",wrongBusiness:"Nieprawidłowe dane firmy",spam:"Spam / reklama",illegal:"Treści nielegalne lub niebezpieczne",copyright:"Prawa autorskie / cudze treści",other:"Inne",min:"Opisz problem używając co najmniej 20 znaków.",failed:"Nie udało się wysłać zgłoszenia.",link:"Zgłoś treść",aria:"Zgłoś QR-X",title:"Zgłoś QR-X",hint:"Zgłoś ten QR-X tylko wtedy, gdy widzisz rzeczywisty problem. Zgłoszenie nie blokuje QR-X automatycznie.",thanks:"Dziękujemy. Zgłoszenie zostało przekazane do moderacji.",reason:"Powód",description:"Opis",descriptionPlaceholder:"Krótko opisz, co jest problematyczne w tym QR-X.",email:"E-mail do pytań zwrotnych (opcjonalnie)",cancel:"Anuluj",sending:"Wysyłanie…",send:"Wyślij zgłoszenie"},
  ar:{fake:"احتيال / مزيف",wrongBusiness:"بيانات شركة غير صحيحة",spam:"رسائل مزعجة / إعلان",illegal:"محتوى غير قانوني أو خطير",copyright:"حقوق النشر / محتوى للغير",other:"أخرى",min:"يرجى وصف المشكلة بما لا يقل عن 20 حرفًا.",failed:"تعذر إرسال البلاغ.",link:"الإبلاغ عن المحتوى",aria:"الإبلاغ عن QR-X",title:"الإبلاغ عن QR-X",hint:"أبلغ عن QR-X هذا فقط إذا لاحظت مشكلة حقيقية. البلاغ لا يؤدي تلقائيًا إلى حظر QR-X.",thanks:"شكرًا. تم إرسال بلاغك إلى فريق الإشراف.",reason:"السبب",description:"الوصف",descriptionPlaceholder:"اشرح باختصار ما المشكلة في QR-X هذا.",email:"البريد الإلكتروني للاستفسارات (اختياري)",cancel:"إلغاء",sending:"جارٍ الإرسال…",send:"إرسال البلاغ"},
  fr:{fake:"Fraude / faux",wrongBusiness:"Informations d’entreprise incorrectes",spam:"Spam / publicité",illegal:"Contenu illégal ou dangereux",copyright:"Droit d’auteur / contenu tiers",other:"Autre",min:"Décrivez le problème avec au moins 20 caractères.",failed:"Le signalement n’a pas pu être envoyé.",link:"Signaler le contenu",aria:"Signaler le QR-X",title:"Signaler le QR-X",hint:"Signalez ce QR-X uniquement si vous constatez un réel problème. Un signalement ne bloque pas automatiquement le QR-X.",thanks:"Merci. Votre signalement a été transmis à la modération.",reason:"Motif",description:"Description",descriptionPlaceholder:"Décrivez brièvement ce qui pose problème dans ce QR-X.",email:"E-mail pour les questions (facultatif)",cancel:"Annuler",sending:"Envoi…",send:"Envoyer le signalement"},
  es:{fake:"Fraude / falso",wrongBusiness:"Datos empresariales incorrectos",spam:"Spam / publicidad",illegal:"Contenido ilegal o peligroso",copyright:"Derechos de autor / contenido ajeno",other:"Otros",min:"Describe el problema con al menos 20 caracteres.",failed:"No se pudo enviar el reporte.",link:"Reportar contenido",aria:"Reportar QR-X",title:"Reportar QR-X",hint:"Reporta este QR-X solo si detectas un problema real. Un reporte no bloquea automáticamente el QR-X.",thanks:"Gracias. Tu reporte se ha enviado a moderación.",reason:"Motivo",description:"Descripción",descriptionPlaceholder:"Describe brevemente qué problema tiene este QR-X.",email:"Correo para consultas (opcional)",cancel:"Cancelar",sending:"Enviando…",send:"Enviar reporte"},
  it:{fake:"Frode / falso",wrongBusiness:"Dati aziendali errati",spam:"Spam / pubblicità",illegal:"Contenuti illegali o pericolosi",copyright:"Copyright / contenuti altrui",other:"Altro",min:"Descrivi il problema con almeno 20 caratteri.",failed:"Impossibile inviare la segnalazione.",link:"Segnala contenuto",aria:"Segnala QR-X",title:"Segnala QR-X",hint:"Segnala questo QR-X solo se riscontri un problema reale. Una segnalazione non blocca automaticamente il QR-X.",thanks:"Grazie. La segnalazione è stata inoltrata alla moderazione.",reason:"Motivo",description:"Descrizione",descriptionPlaceholder:"Descrivi brevemente cosa c’è di problematico in questo QR-X.",email:"E-mail per domande (facoltativa)",cancel:"Annulla",sending:"Invio…",send:"Invia segnalazione"},
} as const;


type Props = {
  qrxId: string;
  locale?: QrxReportLocale;
};

type ReportReason =
  | "fake_or_fraud"
  | "wrong_business_info"
  | "spam"
  | "illegal_or_dangerous"
  | "copyright"
  | "other";

const REASONS: ReportReason[] = [
  "fake_or_fraud",
  "wrong_business_info",
  "spam",
  "illegal_or_dangerous",
  "copyright",
  "other",
];

export default function QrxReportForm({ qrxId, locale = "de" }: Props) {
  const ui = REPORT_TEXT[locale];
  const reasonLabels: Record<ReportReason, string> = {
    fake_or_fraud: ui.fake,
    wrong_business_info: ui.wrongBusiness,
    spam: ui.spam,
    illegal_or_dangerous: ui.illegal,
    copyright: ui.copyright,
    other: ui.other,
  };
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("fake_or_fraud");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetAndClose = () => {
    setOpen(false);
    setError(null);
    setDone(false);
    setDescription("");
    setEmail("");
    setReason("fake_or_fraud");
  };

  const submitReport = async () => {
    try {
      setWorking(true);
      setError(null);

      const trimmedDescription = description.trim();

      if (trimmedDescription.length < 20) {
        throw new Error(ui.min);
      }

      const res = await fetch("/api/report-qrx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrxId,
          reason,
          description: trimmedDescription,
          reporterEmail: email.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || ui.failed);
      }

      setDone(true);
      setDescription("");
      setEmail("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : ui.failed);
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div style={reportFooterWrap}>
        <button type="button" onClick={() => setOpen(true)} style={reportLink}>
          {ui.link}
        </button>
      </div>

      {open ? (
        <div style={overlay} role="dialog" aria-modal="true" aria-label={ui.aria}>
          <div style={modal}>
            <div style={modalTop}>
              <div>
                <h2 style={title}>{ui.title}</h2>
                <p style={sub}>
                  {ui.hint}
                </p>
              </div>

              <button type="button" onClick={resetAndClose} style={closeButton}>
                ×
              </button>
            </div>

            {done ? (
              <div style={successBox}>
                {ui.thanks}
              </div>
            ) : (
              <div style={formGrid}>
                <label style={label}>
                  {ui.reason}
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    style={select}
                  >
                    {REASONS.map((item) => (
                      <option key={item} value={item}>
                        {reasonLabels[item]}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={label}>
                  {ui.description}
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={ui.descriptionPlaceholder}
                    style={textarea}
                  />
                </label>

                <label style={label}>
                  {ui.email}
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    type="email"
                    style={input}
                  />
                </label>

                {error ? <div style={errorBox}>{error}</div> : null}

                <div style={buttonRow}>
                  <button type="button" onClick={resetAndClose} style={secondaryButton}>
                    {ui.cancel}
                  </button>

                  <button
                    type="button"
                    onClick={submitReport}
                    disabled={working}
                    style={{
                      ...primaryButton,
                      opacity: working ? 0.65 : 1,
                    }}
                  >
                    {working ? ui.sending : ui.send}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

const reportFooterWrap: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginTop: 8,
  marginBottom: 0,
};

const reportLink: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "rgba(255,255,255,0.34)",
  fontSize: 10,
  fontWeight: 500,
  textDecoration: "none",
  cursor: "pointer",
  padding: "4px 6px",
  lineHeight: "14px",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(0,0,0,0.72)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#111827",
  color: "white",
  padding: 20,
  boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
};

const modalTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
};

const sub: React.CSSProperties = {
  margin: "8px 0 0 0",
  color: "rgba(255,255,255,0.68)",
  fontSize: 13,
  lineHeight: "19px",
};

const closeButton: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  borderRadius: 12,
  width: 36,
  height: 36,
  cursor: "pointer",
  fontSize: 24,
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const label: React.CSSProperties = {
  display: "grid",
  gap: 7,
  color: "rgba(255,255,255,0.82)",
  fontSize: 13,
  fontWeight: 700,
};

const select: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b1220",
  color: "white",
  padding: "12px 12px",
  fontWeight: 700,
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: 110,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b1220",
  color: "white",
  padding: 12,
  resize: "vertical",
  fontFamily: "inherit",
};

const input: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b1220",
  color: "white",
  padding: "12px 12px",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  background: "white",
  color: "#111827",
  padding: "12px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  color: "white",
  padding: "12px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(127,29,29,0.35)",
  color: "#fecaca",
  padding: 12,
};

const successBox: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(34,197,94,0.35)",
  background: "rgba(20,83,45,0.35)",
  color: "#bbf7d0",
  padding: 14,
  fontWeight: 800,
};
