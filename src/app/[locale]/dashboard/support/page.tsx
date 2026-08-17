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

const PROBLEM_TYPES: ProblemType[] = [
  "credits_wrong",
  "verification_waiting",
  "upload_problem",
  "transfer_problem",
  "qrx_report",
  "other",
];

const SUPPORT_LOCALES = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;
type SupportLocale = (typeof SUPPORT_LOCALES)[number];

function normalizeSupportLocale(value: string): SupportLocale {
  const raw = String(value || "").trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORT_LOCALES.includes(raw as SupportLocale) ? (raw as SupportLocale) : "de";
}

const SUPPORT_COPY = {
  de: {
    navAria:"Support Navigation", myQrx:"Meine QR-X", account:"Konto", title:"Support & Hilfe", subtitle:"Melde Probleme, stelle Fragen und prüfe den Status deiner bisherigen Support-Anfragen.", back:"Zurück zum Dashboard", closeForm:"Formular schließen", newRequest:"+ Neue Anfrage", overview:"Support Übersicht", open:"Offen", inReview:"In Bearbeitung", resolved:"Gelöst", email:"E-Mail", followUps:"Rückfragen", newSupport:"Neue Support-Anfrage", formHint:"Beschreibe dein Anliegen möglichst genau. Falls nötig melden wir uns per E-Mail bei dir.", newLabel:"Neu", category:"Kategorie", subject:"Betreff", subjectPlaceholder:"Kurze Beschreibung des Problems", description:"Beschreibung", descriptionPlaceholder:"Was ist passiert? Was hast du bereits versucht?", affectedQrx:"Betroffener QR-X (optional)", noSpecificQrx:"Kein bestimmter QR-X", notice:"Rückfragen und weitere Informationen erhältst du an die E-Mail-Adresse deines Mioseg-qr-Kontos.", sending:"Wird gesendet …", send:"Anfrage absenden", myRequests:"Meine Anfragen", requestsHint:"Hier siehst du Ticketnummer, Kategorie und Bearbeitungsstatus.", loading:"Lädt", tickets:"Tickets", loadingRequests:"Support-Anfragen werden geladen …", noRequests:"Noch keine Support-Anfragen", noRequestsHint:"Sobald du eine Anfrage sendest, erscheint sie hier und wird gleichzeitig im Adminbereich angezeigt.", supportTicket:"Support-Ticket", completion:"Abschluss:", waitingCustomer:"Warten auf deine Rückmeldung", other:"Sonstiges", untitledQrx:"Unbenannter QR-X", loginRequired:"Bitte melde dich zuerst an.", loadFailed:"Support-Anfragen konnten nicht geladen werden.", centerFailed:"Support-Center konnte nicht geladen werden.", subjectRequired:"Bitte gib einen aussagekräftigen Betreff ein.", descriptionRequired:"Bitte beschreibe dein Anliegen mit mindestens 10 Zeichen.", sendFailed:"Die Anfrage konnte nicht gesendet werden.", sent:"Deine Support-Anfrage wurde übermittelt. Bei Rückfragen kontaktieren wir dich per E-Mail.", creditsWrong:"Credits oder Zahlung", verificationWaiting:"Verifizierung", uploadProblem:"Upload oder Dateien", transferProblem:"QR-X-Transfer", qrxReport:"QR-X oder Inhalt melden"
  },
  en: {
    navAria:"Support navigation", myQrx:"My QR-X", account:"Account", title:"Support & Help", subtitle:"Report problems, ask questions and check the status of your previous support requests.", back:"Back to dashboard", closeForm:"Close form", newRequest:"+ New request", overview:"Support overview", open:"Open", inReview:"In review", resolved:"Resolved", email:"Email", followUps:"Follow-ups", newSupport:"New support request", formHint:"Describe your issue as precisely as possible. If necessary, we will contact you by email.", newLabel:"New", category:"Category", subject:"Subject", subjectPlaceholder:"Short description of the problem", description:"Description", descriptionPlaceholder:"What happened? What have you already tried?", affectedQrx:"Affected QR-X (optional)", noSpecificQrx:"No specific QR-X", notice:"Follow-up questions and further information will be sent to the email address of your Mioseg qr account.", sending:"Sending …", send:"Send request", myRequests:"My requests", requestsHint:"Here you can see the ticket number, category and processing status.", loading:"Loading", tickets:"tickets", loadingRequests:"Loading support requests …", noRequests:"No support requests yet", noRequestsHint:"As soon as you send a request, it will appear here and also in the admin area.", supportTicket:"Support ticket", completion:"Resolution:", waitingCustomer:"Waiting for your reply", other:"Other", untitledQrx:"Untitled QR-X", loginRequired:"Please sign in first.", loadFailed:"Support requests could not be loaded.", centerFailed:"Support center could not be loaded.", subjectRequired:"Please enter a meaningful subject.", descriptionRequired:"Please describe your issue using at least 10 characters.", sendFailed:"The request could not be sent.", sent:"Your support request has been submitted. We will contact you by email if we have questions.", creditsWrong:"Credits or payment", verificationWaiting:"Verification", uploadProblem:"Upload or files", transferProblem:"QR-X transfer", qrxReport:"Report QR-X or content"
  },
  tr: {
    navAria:"Destek navigasyonu", myQrx:"QR-X'lerim", account:"Hesap", title:"Destek ve Yardım", subtitle:"Sorunları bildirin, sorular sorun ve önceki destek taleplerinizin durumunu kontrol edin.", back:"Kontrol paneline dön", closeForm:"Formu kapat", newRequest:"+ Yeni talep", overview:"Destek özeti", open:"Açık", inReview:"İnceleniyor", resolved:"Çözüldü", email:"E-posta", followUps:"Geri dönüşler", newSupport:"Yeni destek talebi", formHint:"Talebinizi mümkün olduğunca ayrıntılı açıklayın. Gerekirse sizinle e-posta yoluyla iletişime geçeriz.", newLabel:"Yeni", category:"Kategori", subject:"Konu", subjectPlaceholder:"Sorunun kısa açıklaması", description:"Açıklama", descriptionPlaceholder:"Ne oldu? Şimdiye kadar neleri denediniz?", affectedQrx:"İlgili QR-X (isteğe bağlı)", noSpecificQrx:"Belirli bir QR-X yok", notice:"Sorular ve ek bilgiler Mioseg qr hesabınızdaki e-posta adresine gönderilir.", sending:"Gönderiliyor …", send:"Talebi gönder", myRequests:"Taleplerim", requestsHint:"Burada talep numarasını, kategoriyi ve işlem durumunu görebilirsiniz.", loading:"Yükleniyor", tickets:"talep", loadingRequests:"Destek talepleri yükleniyor …", noRequests:"Henüz destek talebi yok", noRequestsHint:"Bir talep gönderdiğinizde burada ve aynı zamanda yönetici alanında görünür.", supportTicket:"Destek talebi", completion:"Çözüm:", waitingCustomer:"Yanıtınız bekleniyor", other:"Diğer", untitledQrx:"Adsız QR-X", loginRequired:"Lütfen önce giriş yapın.", loadFailed:"Destek talepleri yüklenemedi.", centerFailed:"Destek merkezi yüklenemedi.", subjectRequired:"Lütfen açıklayıcı bir konu girin.", descriptionRequired:"Lütfen talebinizi en az 10 karakterle açıklayın.", sendFailed:"Talep gönderilemedi.", sent:"Destek talebiniz iletildi. Sorularımız olursa sizinle e-posta yoluyla iletişime geçeceğiz.", creditsWrong:"Credits veya ödeme", verificationWaiting:"Doğrulama", uploadProblem:"Yükleme veya dosyalar", transferProblem:"QR-X transferi", qrxReport:"QR-X veya içeriği bildir"
  },
  pl: {
    navAria:"Nawigacja pomocy", myQrx:"Moje QR-X", account:"Konto", title:"Pomoc i wsparcie", subtitle:"Zgłaszaj problemy, zadawaj pytania i sprawdzaj status wcześniejszych zgłoszeń.", back:"Wróć do panelu", closeForm:"Zamknij formularz", newRequest:"+ Nowe zgłoszenie", overview:"Przegląd wsparcia", open:"Otwarte", inReview:"W trakcie", resolved:"Rozwiązane", email:"E-mail", followUps:"Pytania zwrotne", newSupport:"Nowe zgłoszenie", formHint:"Opisz problem możliwie dokładnie. W razie potrzeby skontaktujemy się z Tobą e-mailem.", newLabel:"Nowe", category:"Kategoria", subject:"Temat", subjectPlaceholder:"Krótki opis problemu", description:"Opis", descriptionPlaceholder:"Co się stało? Czego już próbowałeś?", affectedQrx:"Dotyczący QR-X (opcjonalnie)", noSpecificQrx:"Brak konkretnego QR-X", notice:"Pytania i dalsze informacje otrzymasz na adres e-mail konta Mioseg qr.", sending:"Wysyłanie …", send:"Wyślij zgłoszenie", myRequests:"Moje zgłoszenia", requestsHint:"Tutaj zobaczysz numer zgłoszenia, kategorię i status.", loading:"Ładowanie", tickets:"zgłoszeń", loadingRequests:"Ładowanie zgłoszeń …", noRequests:"Brak zgłoszeń", noRequestsHint:"Po wysłaniu zgłoszenia pojawi się ono tutaj oraz w panelu administracyjnym.", supportTicket:"Zgłoszenie", completion:"Rozwiązanie:", waitingCustomer:"Oczekuje na Twoją odpowiedź", other:"Inne", untitledQrx:"QR-X bez nazwy", loginRequired:"Najpierw się zaloguj.", loadFailed:"Nie udało się załadować zgłoszeń.", centerFailed:"Nie udało się załadować centrum pomocy.", subjectRequired:"Wpisz konkretny temat.", descriptionRequired:"Opisz problem używając co najmniej 10 znaków.", sendFailed:"Nie udało się wysłać zgłoszenia.", sent:"Twoje zgłoszenie zostało przesłane. W razie pytań skontaktujemy się e-mailem.", creditsWrong:"Credits lub płatność", verificationWaiting:"Weryfikacja", uploadProblem:"Przesyłanie lub pliki", transferProblem:"Transfer QR-X", qrxReport:"Zgłoś QR-X lub treść"
  },
  ar: {
    navAria:"تنقل الدعم", myQrx:"QR-X الخاصة بي", account:"الحساب", title:"الدعم والمساعدة", subtitle:"أبلغ عن المشكلات واطرح الأسئلة وتحقق من حالة طلبات الدعم السابقة.", back:"العودة إلى لوحة التحكم", closeForm:"إغلاق النموذج", newRequest:"+ طلب جديد", overview:"نظرة عامة على الدعم", open:"مفتوح", inReview:"قيد المراجعة", resolved:"تم الحل", email:"البريد الإلكتروني", followUps:"استفسارات", newSupport:"طلب دعم جديد", formHint:"صف مشكلتك بأكبر قدر ممكن من الدقة. سنتواصل معك عبر البريد الإلكتروني عند الحاجة.", newLabel:"جديد", category:"الفئة", subject:"الموضوع", subjectPlaceholder:"وصف مختصر للمشكلة", description:"الوصف", descriptionPlaceholder:"ماذا حدث؟ ماذا جربت حتى الآن؟", affectedQrx:"QR-X المتأثر (اختياري)", noSpecificQrx:"لا يوجد QR-X محدد", notice:"ستتلقى الاستفسارات والمعلومات الإضافية على عنوان البريد الإلكتروني لحساب Mioseg qr.", sending:"جارٍ الإرسال …", send:"إرسال الطلب", myRequests:"طلباتي", requestsHint:"هنا ترى رقم الطلب والفئة وحالة المعالجة.", loading:"جارٍ التحميل", tickets:"طلبات", loadingRequests:"جارٍ تحميل طلبات الدعم …", noRequests:"لا توجد طلبات دعم بعد", noRequestsHint:"بمجرد إرسال طلب سيظهر هنا وفي منطقة الإدارة أيضًا.", supportTicket:"طلب دعم", completion:"الحل:", waitingCustomer:"بانتظار ردك", other:"أخرى", untitledQrx:"QR-X بدون اسم", loginRequired:"يرجى تسجيل الدخول أولاً.", loadFailed:"تعذر تحميل طلبات الدعم.", centerFailed:"تعذر تحميل مركز الدعم.", subjectRequired:"يرجى إدخال موضوع واضح.", descriptionRequired:"يرجى وصف طلبك بما لا يقل عن 10 أحرف.", sendFailed:"تعذر إرسال الطلب.", sent:"تم إرسال طلب الدعم. سنتواصل معك عبر البريد الإلكتروني إذا كانت لدينا أسئلة.", creditsWrong:"Credits أو الدفع", verificationWaiting:"التحقق", uploadProblem:"الرفع أو الملفات", transferProblem:"نقل QR-X", qrxReport:"الإبلاغ عن QR-X أو محتوى"
  },
  fr: {
    navAria:"Navigation assistance", myQrx:"Mes QR-X", account:"Compte", title:"Assistance et aide", subtitle:"Signalez des problèmes, posez des questions et consultez l’état de vos demandes précédentes.", back:"Retour au tableau de bord", closeForm:"Fermer le formulaire", newRequest:"+ Nouvelle demande", overview:"Aperçu de l’assistance", open:"Ouvert", inReview:"En cours", resolved:"Résolu", email:"E-mail", followUps:"Questions", newSupport:"Nouvelle demande d’assistance", formHint:"Décrivez votre problème aussi précisément que possible. Si nécessaire, nous vous contacterons par e-mail.", newLabel:"Nouveau", category:"Catégorie", subject:"Objet", subjectPlaceholder:"Brève description du problème", description:"Description", descriptionPlaceholder:"Que s’est-il passé ? Qu’avez-vous déjà essayé ?", affectedQrx:"QR-X concerné (facultatif)", noSpecificQrx:"Aucun QR-X particulier", notice:"Les questions et informations complémentaires seront envoyées à l’adresse e-mail de votre compte Mioseg qr.", sending:"Envoi …", send:"Envoyer la demande", myRequests:"Mes demandes", requestsHint:"Vous voyez ici le numéro, la catégorie et le statut de traitement.", loading:"Chargement", tickets:"demandes", loadingRequests:"Chargement des demandes …", noRequests:"Aucune demande pour le moment", noRequestsHint:"Dès que vous envoyez une demande, elle apparaît ici ainsi que dans l’espace d’administration.", supportTicket:"Demande d’assistance", completion:"Résolution :", waitingCustomer:"En attente de votre réponse", other:"Autre", untitledQrx:"QR-X sans nom", loginRequired:"Veuillez d’abord vous connecter.", loadFailed:"Impossible de charger les demandes d’assistance.", centerFailed:"Impossible de charger le centre d’assistance.", subjectRequired:"Veuillez saisir un objet explicite.", descriptionRequired:"Veuillez décrire votre demande avec au moins 10 caractères.", sendFailed:"La demande n’a pas pu être envoyée.", sent:"Votre demande d’assistance a été envoyée. Nous vous contacterons par e-mail si nécessaire.", creditsWrong:"Credits ou paiement", verificationWaiting:"Vérification", uploadProblem:"Téléversement ou fichiers", transferProblem:"Transfert QR-X", qrxReport:"Signaler un QR-X ou un contenu"
  },
  es: {
    navAria:"Navegación de soporte", myQrx:"Mis QR-X", account:"Cuenta", title:"Soporte y ayuda", subtitle:"Informa de problemas, haz preguntas y consulta el estado de tus solicitudes anteriores.", back:"Volver al panel", closeForm:"Cerrar formulario", newRequest:"+ Nueva solicitud", overview:"Resumen de soporte", open:"Abierto", inReview:"En revisión", resolved:"Resuelto", email:"Correo electrónico", followUps:"Consultas", newSupport:"Nueva solicitud de soporte", formHint:"Describe tu problema con la mayor precisión posible. Si es necesario, nos pondremos en contacto contigo por correo electrónico.", newLabel:"Nuevo", category:"Categoría", subject:"Asunto", subjectPlaceholder:"Breve descripción del problema", description:"Descripción", descriptionPlaceholder:"¿Qué ha ocurrido? ¿Qué has probado ya?", affectedQrx:"QR-X afectado (opcional)", noSpecificQrx:"Ningún QR-X específico", notice:"Las consultas y la información adicional se enviarán al correo electrónico de tu cuenta Mioseg qr.", sending:"Enviando …", send:"Enviar solicitud", myRequests:"Mis solicitudes", requestsHint:"Aquí puedes ver el número, la categoría y el estado de tramitación.", loading:"Cargando", tickets:"solicitudes", loadingRequests:"Cargando solicitudes de soporte …", noRequests:"Aún no hay solicitudes", noRequestsHint:"Cuando envíes una solicitud, aparecerá aquí y también en el área de administración.", supportTicket:"Solicitud de soporte", completion:"Resolución:", waitingCustomer:"Esperando tu respuesta", other:"Otro", untitledQrx:"QR-X sin nombre", loginRequired:"Inicia sesión primero.", loadFailed:"No se pudieron cargar las solicitudes de soporte.", centerFailed:"No se pudo cargar el centro de soporte.", subjectRequired:"Introduce un asunto descriptivo.", descriptionRequired:"Describe tu solicitud con al menos 10 caracteres.", sendFailed:"No se pudo enviar la solicitud.", sent:"Tu solicitud de soporte ha sido enviada. Si tenemos preguntas, nos pondremos en contacto contigo por correo electrónico.", creditsWrong:"Credits o pago", verificationWaiting:"Verificación", uploadProblem:"Carga o archivos", transferProblem:"Transferencia de QR-X", qrxReport:"Informar de QR-X o contenido"
  },
  it: {
    navAria:"Navigazione supporto", myQrx:"I miei QR-X", account:"Account", title:"Supporto e aiuto", subtitle:"Segnala problemi, fai domande e controlla lo stato delle richieste precedenti.", back:"Torna alla dashboard", closeForm:"Chiudi modulo", newRequest:"+ Nuova richiesta", overview:"Panoramica supporto", open:"Aperto", inReview:"In lavorazione", resolved:"Risolto", email:"E-mail", followUps:"Domande", newSupport:"Nuova richiesta di supporto", formHint:"Descrivi il problema nel modo più preciso possibile. Se necessario, ti contatteremo via e-mail.", newLabel:"Nuovo", category:"Categoria", subject:"Oggetto", subjectPlaceholder:"Breve descrizione del problema", description:"Descrizione", descriptionPlaceholder:"Cosa è successo? Cosa hai già provato?", affectedQrx:"QR-X interessato (opzionale)", noSpecificQrx:"Nessun QR-X specifico", notice:"Domande e ulteriori informazioni saranno inviate all’indirizzo e-mail del tuo account Mioseg qr.", sending:"Invio …", send:"Invia richiesta", myRequests:"Le mie richieste", requestsHint:"Qui puoi vedere numero, categoria e stato di elaborazione.", loading:"Caricamento", tickets:"richieste", loadingRequests:"Caricamento richieste di supporto …", noRequests:"Nessuna richiesta di supporto", noRequestsHint:"Quando invii una richiesta, apparirà qui e anche nell’area amministrativa.", supportTicket:"Richiesta di supporto", completion:"Risoluzione:", waitingCustomer:"In attesa della tua risposta", other:"Altro", untitledQrx:"QR-X senza nome", loginRequired:"Accedi prima.", loadFailed:"Impossibile caricare le richieste di supporto.", centerFailed:"Impossibile caricare il centro di supporto.", subjectRequired:"Inserisci un oggetto significativo.", descriptionRequired:"Descrivi la richiesta con almeno 10 caratteri.", sendFailed:"Impossibile inviare la richiesta.", sent:"La tua richiesta di supporto è stata inviata. Ti contatteremo via e-mail in caso di domande.", creditsWrong:"Credits o pagamento", verificationWaiting:"Verifica", uploadProblem:"Caricamento o file", transferProblem:"Trasferimento QR-X", qrxReport:"Segnala QR-X o contenuto"
  },
} as const;

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }
  return fallback;
}

function formatDateTime(value: string | null | undefined, locale: SupportLocale) {
  if (!value) return "–";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  const localeMap: Record<SupportLocale, string> = {
    de: "de-DE", en: "en-US", tr: "tr-TR", pl: "pl-PL",
    ar: "ar-SA", fr: "fr-FR", es: "es-ES", it: "it-IT",
  };
  return new Intl.DateTimeFormat(localeMap[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusMeta(status: string | null | undefined, ui: (typeof SUPPORT_COPY)[SupportLocale]) {
  if (status === "in_review") return { label: ui.inReview, color: "#fde68a", background: "rgba(245,158,11,0.13)", border: "1px solid rgba(253,230,138,0.18)" };
  if (status === "waiting_customer") return { label: ui.waitingCustomer, color: "#fde68a", background: "rgba(245,158,11,0.13)", border: "1px solid rgba(253,230,138,0.18)" };
  if (status === "resolved") return { label: ui.resolved, color: "#bbf7d0", background: "rgba(34,197,94,0.13)", border: "1px solid rgba(134,239,172,0.2)" };
  return { label: ui.open, color: "#bfdbfe", background: "rgba(59,130,246,0.13)", border: "1px solid rgba(147,197,253,0.18)" };
}

function getProblemLabel(value: string | null | undefined, ui: (typeof SUPPORT_COPY)[SupportLocale]) {
  const labels: Record<ProblemType, string> = {
    credits_wrong: ui.creditsWrong,
    verification_waiting: ui.verificationWaiting,
    upload_problem: ui.uploadProblem,
    transfer_problem: ui.transferProblem,
    qrx_report: ui.qrxReport,
    other: ui.other,
  };
  return labels[(value as ProblemType) || "other"] || ui.other;
}

function getQrxTitle(item: OwnQrx, ui: (typeof SUPPORT_COPY)[SupportLocale]) {
  return item.company_name?.trim() || item.title?.trim() || ui.untitledQrx;
}

export default function SupportPage() {
  const params = useParams();
  const locale = getParam(
    params?.locale as string | string[] | undefined,
    "de",
  );
  const supportLocale = normalizeSupportLocale(locale);
  const ui = SUPPORT_COPY[supportLocale];

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
      throw new Error(ui.loginRequired);
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
          payload?.error || ui.loadFailed,
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
          : ui.centerFailed,
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
      setErrorText(ui.subjectRequired);
      return;
    }

    if (description.trim().length < 10) {
      setErrorText(ui.descriptionRequired);
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
          payload?.error || ui.sendFailed,
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
      setMessage(ui.sent);
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : ui.sendFailed,
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

        <nav className={styles.nav} aria-label={ui.navAria}>
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/dashboard/qrx`}>{ui.myQrx}</Link>
          <Link href={`/${locale}/dashboard/account`}>{ui.account}</Link>
        </nav>
      </header>

      <div className="mioseg-support-content">
        <section className={styles.hero}>
          <div>
            <span className={styles.kicker}>Support</span>
            <h1>{ui.title}</h1>
            <p>{ui.subtitle}</p>
          </div>

          <div className={styles.heroActions}>
            <Link
              href={`/${locale}/dashboard`}
              className={styles.secondaryButton}
            >
              {ui.back}
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
              {formOpen ? ui.closeForm : ui.newRequest}
            </button>
          </div>
        </section>

        <section className={styles.statsGrid} aria-label={ui.overview}>
          <article className={styles.statCard}>
            <div className={styles.statIcon}>📨</div>
            <div>
              <div className={styles.statValue}>
                {loading ? "…" : counts.open}
              </div>
              <div className={styles.statLabel}>{ui.open}</div>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>🛠️</div>
            <div>
              <div className={styles.statValue}>
                {loading ? "…" : counts.inReview}
              </div>
              <div className={styles.statLabel}>{ui.inReview}</div>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div>
              <div className={styles.statValue}>
                {loading ? "…" : counts.resolved}
              </div>
              <div className={styles.statLabel}>{ui.resolved}</div>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>✉️</div>
            <div>
              <div className={styles.statValue}>{ui.email}</div>
              <div className={styles.statLabel}>{ui.followUps}</div>
            </div>
          </article>
        </section>

        {message ? <div style={successStyle}>{message}</div> : null}
        {errorText ? <div style={errorStyle}>{errorText}</div> : null}

        {formOpen ? (
          <section style={panelStyle}>
            <div className={styles.cardHeader}>
              <div>
                <h2>{ui.newSupport}</h2>
                <p>{ui.formHint}</p>
              </div>
              <span>{ui.newLabel}</span>
            </div>

            <form
              onSubmit={handleCreateTicket}
              style={{ display: "grid", gap: 13 }}
            >
              <label style={labelStyle}>
                {ui.category}
                <select
                  value={problemType}
                  onChange={(event) =>
                    setProblemType(event.target.value as ProblemType)
                  }
                  style={selectStyle}
                >
                  {PROBLEM_TYPES.map((item) => (
                    <option key={item} value={item} style={optionStyle}>
                      {getProblemLabel(item, ui)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                {ui.subject}
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={ui.subjectPlaceholder}
                  maxLength={140}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                {ui.description}
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={ui.descriptionPlaceholder}
                  rows={7}
                  maxLength={5000}
                  style={textareaStyle}
                />
              </label>

              <label style={labelStyle}>
                {ui.affectedQrx}
                <select
                  value={qrxId}
                  onChange={(event) => setQrxId(event.target.value)}
                  style={selectStyle}
                >
                  <option value="" style={optionStyle}>{ui.noSpecificQrx}</option>

                  {ownQrx.map((item) => (
                    <option key={item.id} value={item.id} style={optionStyle}>
                      {getQrxTitle(item, ui)}
                    </option>
                  ))}
                </select>
              </label>

              <div style={noticeStyle}>{ui.notice}</div>

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
                {creating ? ui.sending : ui.send}
              </button>
            </form>
          </section>
        ) : null}

        <section style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{ui.myRequests}</h2>
              <p>{ui.requestsHint}</p>
            </div>
            <span>{loading ? ui.loading : `${tickets.length} ${ui.tickets}`}</span>
          </div>

          {loading ? (
            <div style={loadingStyle}>{ui.loadingRequests}</div>
          ) : null}

          {!loading && tickets.length === 0 ? (
            <div style={emptyStyle}>
              <div style={emptyIconStyle}>🛟</div>
              <strong>{ui.noRequests}</strong>
              <span>{ui.noRequestsHint}</span>
            </div>
          ) : null}

          {!loading && tickets.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {tickets.map((ticket) => {
                const status = getStatusMeta(ticket.status, ui);

                return (
                  <article key={ticket.id} style={ticketStyle}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={ticketTopRowStyle}>
                        <span style={ticketNumberStyle}>
                          {ticket.ticket_number || ui.supportTicket}
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
                        <span>{getProblemLabel(ticket.problem_type, ui)}</span>
                        <span>·</span>
                        <span>{formatDateTime(ticket.created_at, supportLocale)}</span>
                      </div>

                      {ticket.description ? (
                        <p style={ticketDescriptionStyle}>
                          {ticket.description}
                        </p>
                      ) : null}

                      {ticket.status === "resolved" &&
                      ticket.resolution_note ? (
                        <div style={resolutionStyle}>
                          <strong>{ui.completion}</strong> {ticket.resolution_note}
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
