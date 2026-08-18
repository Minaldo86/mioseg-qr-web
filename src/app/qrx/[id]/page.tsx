import type { CSSProperties } from "react";
import styles from "./page.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import TrackViewClient from "./TrackViewClient";
import QrxReportForm from "./QrxReportForm";
import QrxPasswordGate from "./QrxPasswordGate";
import QrxCodeCanvas from "./QrxCodeCanvas";
import MediaInteractionLink from "./MediaInteractionLink";
import CollectionPreview, { type QrxCollectionPreviewItem } from "@/components/qrx/CollectionPreview";

type NewsItem = { text: string; createdAt: string };

type BusinessCategory =
  | "praxis_gesundheit"
  | "gastronomie"
  | "unternehmen"
  | "dienstleistung"
  | "handwerk"
  | "event"
  | "verein"
  | "wohltaetigkeit"
  | "sehenswuerdigkeit"
  | "sonstiges";

const BUSINESS_CATEGORY_OPTIONS: Array<{
  value: BusinessCategory;
  icon: string;
}> = [
  { value: "praxis_gesundheit", icon: "⚕️" },
  { value: "gastronomie", icon: "🍽️" },
  { value: "unternehmen", icon: "🏢" },
  { value: "dienstleistung", icon: "🛠️" },
  { value: "handwerk", icon: "🔨" },
  { value: "event", icon: "📅" },
  { value: "verein", icon: "👥" },
  { value: "wohltaetigkeit", icon: "♡" },
  { value: "sehenswuerdigkeit", icon: "📷" },
  { value: "sonstiges", icon: "▦" },
];

function getBusinessCategoryMeta(
  value: string | null | undefined,
  labels: Record<BusinessCategory, string>,
) {
  if (!value) return null;
  const item = BUSINESS_CATEGORY_OPTIONS.find((option) => option.value === value);
  return item ? { ...item, label: labels[item.value] } : null;
}

type QrxEntry = {
  id: string;
  owner_user_id: string | null;
  title: string;
  description: string | null;
  news: NewsItem[] | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  logo_url: string | null;
  type: "normal" | "business" | null;
  category: string | null;
  verified: boolean | null;
  cover_image_url: string | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_email: string | null;
  cta_navigation: string | null;
  company_name: string | null;
  suspended: boolean | null;
  suspended_reason: string | null;
  deleted_at: string | null;
  deleted_reason: string | null;
  deleted_by_admin: boolean | null;
  password_protected: boolean | null;
  views_total: number | null;
  follower_count: number | null;
  created_at: string | null;
  collection_title: string | null;
  collection_description: string | null;
};

type QrxMedia = {
  id: string;
  qrx_id: string;
  type: "image" | "file" | string;
  url: string;
  filename: string;
  bytes?: number | null;
};

type TransferHistoryItem = {
  id?: string;
  transfer_id?: string;
  qrx_id?: string;
  status?: string;
  created_at?: string;
  accepted_at?: string | null;
  expires_at?: string | null;
  from_user_id?: string | null;
  from_name?: string | null;
  to_user_id?: string | null;
  to_name?: string | null;
  recipient_email?: string | null;
};


type LegacyQrxLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

const LEGACY_QRX_LOCALES: LegacyQrxLocale[] = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"];

function resolveLegacyQrxLocale(acceptLanguage: string | null): LegacyQrxLocale {
  const candidates = String(acceptLanguage || "")
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase().split(/[-_]/)[0])
    .filter(Boolean);

  for (const candidate of candidates) {
    if (LEGACY_QRX_LOCALES.includes(candidate as LegacyQrxLocale)) {
      return candidate as LegacyQrxLocale;
    }
  }

  return "de";
}

const LEGACY_QRX_TEXT = {
  de: {
    notFound: "QR-X wurde nicht gefunden oder wurde gelöscht.", unavailableTitle: "QR-X nicht verfügbar", unavailable: "Dieser QR-X ist nicht mehr verfügbar.",
    restrictedOwnerTitle: "QR-X eingeschränkt", restrictedOwnerText: "Dieser QR-X wurde aufgrund einer Moderationsentscheidung eingeschränkt und ist derzeit nicht öffentlich verfügbar.", restrictedPublicText: "Dieser QR-X ist derzeit nicht verfügbar.",
    reason: "Grund", noReason: "Es wurde kein näherer Grund angegeben.", reviewHint: "Wenn du der Meinung bist, dass diese Entscheidung überprüft werden sollte, kannst du eine erneute Prüfung anfordern.",
    reviewRequested: "Überprüfung angefordert. Deine Anfrage wurde an den Support übermittelt.", reviewExisting: "Für diese Entscheidung gibt es bereits eine offene Überprüfung.", reviewError: "Die Anfrage konnte nicht gespeichert werden. Bitte versuche es später erneut.", reviewButton: "Entscheidung überprüfen lassen", reviewDisclaimer: "Die Anfrage führt nicht automatisch zur Aufhebung der Sperrung.",
    backCollection: "← Zurück zur Sammlung „{{title}}“", normalQrx: "Normaler QR-X", businessVerified: "Verifiziertes Unternehmen", businessQrx: "Business QR-X", verified: "Verifiziert", follower: "FOLLOWER", mediaStat: "MEDIEN", updatesStat: "UPDATES",
    openApp: "App öffnen", website: "Website", call: "Anrufen", email: "E-Mail", navigation: "Navigation", appMissing: "App nicht installiert?", downloadHere: "Hier herunterladen",
    title: "Titel", description: "Beschreibung", noDescription: "Keine Beschreibung vorhanden.", news: "News / Updates", noNews: "Noch keine News vorhanden.",
    images: "Bilder", noImages: "Keine Bilder vorhanden.", imageOpenAria: "Bild {{name}} öffnen", tapImage: "Zum Öffnen Bild antippen",
    files: "Dateien", fileOpenAria: "Datei {{name}} öffnen", fileDownloadAria: "Datei {{name}} herunterladen", open: "Öffnen", download: "Herunterladen",
    location: "Ort", noLocation: "Kein Ort hinterlegt.", googleMaps: "In Google Maps öffnen", navigationOpen: "Navigation öffnen",
    transfer: "Transfer", transferHint: "Verlauf und aktueller Transferstatus dieses QR-X.", noTransfer: "Noch kein Transfer vorhanden.", recipient: "Empfänger", from: "Von", to: "An", accepted: "Angenommen", expires: "Ablauf",
    followed: "Gefolgt", ownerText: "Du bist der Besitzer dieses QR-X.", ownQrx: "Eigener QR-X", savedText: "Dieser QR-X ist aktuell in deinen gespeicherten Einträgen.", followHint: "Folge diesem QR-X, um ihn schneller wiederzufinden.", unfollow: "Folgen beenden", follow: "Folgen", loginFollow: "Melde dich an, um diesem QR-X zu folgen.", savedByOne: "Gespeichert von {{count}} Nutzer", savedByMany: "Gespeichert von {{count}} Nutzern",
    collection: { untitled:"Unbenannter QR-X", business:"Business QR-X", normal:"Normaler QR-X", collection:"Sammlung", one:"Eintrag", many:"Einträge", verified:"Verifiziert", part:"Sammlung", open:"Öffnen →" },
    categories: { praxis_gesundheit:"Praxis & Gesundheit", gastronomie:"Gastronomie", unternehmen:"Unternehmen", dienstleistung:"Dienstleistung", handwerk:"Handwerk", event:"Event", verein:"Verein", wohltaetigkeit:"Wohltätigkeit", sehenswuerdigkeit:"Sehenswürdigkeit", sonstiges:"Sonstiges" },
  },
  en: {
    notFound: "QR-X was not found or has been deleted.", unavailableTitle: "QR-X unavailable", unavailable: "This QR-X is no longer available.",
    restrictedOwnerTitle: "QR-X restricted", restrictedOwnerText: "This QR-X has been restricted due to a moderation decision and is currently not publicly available.", restrictedPublicText: "This QR-X is currently unavailable.",
    reason: "Reason", noReason: "No further reason was provided.", reviewHint: "If you believe this decision should be reviewed, you can request another review.",
    reviewRequested: "Review requested. Your request has been sent to support.", reviewExisting: "There is already an open review for this decision.", reviewError: "The request could not be saved. Please try again later.", reviewButton: "Request review of decision", reviewDisclaimer: "The request does not automatically lift the restriction.",
    backCollection: "← Back to collection “{{title}}”", normalQrx: "Normal QR-X", businessVerified: "Verified business", businessQrx: "Business QR-X", verified: "Verified", follower: "FOLLOWERS", mediaStat: "MEDIA", updatesStat: "UPDATES",
    openApp: "Open app", website: "Website", call: "Call", email: "Email", navigation: "Navigation", appMissing: "App not installed?", downloadHere: "Download here",
    title: "Title", description: "Description", noDescription: "No description available.", news: "News / Updates", noNews: "No news yet.",
    images: "Images", noImages: "No images available.", imageOpenAria: "Open image {{name}}", tapImage: "Tap image to open",
    files: "Files", fileOpenAria: "Open file {{name}}", fileDownloadAria: "Download file {{name}}", open: "Open", download: "Download",
    location: "Location", noLocation: "No location saved.", googleMaps: "Open in Google Maps", navigationOpen: "Open navigation",
    transfer: "Transfer", transferHint: "History and current transfer status for this QR-X.", noTransfer: "No transfer yet.", recipient: "Recipient", from: "From", to: "To", accepted: "Accepted", expires: "Expires",
    followed: "Following", ownerText: "You are the owner of this QR-X.", ownQrx: "My QR-X", savedText: "This QR-X is currently in your saved items.", followHint: "Follow this QR-X to find it again more quickly.", unfollow: "Unfollow", follow: "Follow", loginFollow: "Sign in to follow this QR-X.", savedByOne: "Saved by {{count}} user", savedByMany: "Saved by {{count}} users",
    collection: { untitled:"Untitled QR-X", business:"Business QR-X", normal:"Normal QR-X", collection:"Collection", one:"item", many:"items", verified:"Verified", part:"Collection", open:"Open →" },
    categories: { praxis_gesundheit:"Practice & Health", gastronomie:"Food & Hospitality", unternehmen:"Company", dienstleistung:"Service", handwerk:"Trade", event:"Event", verein:"Association", wohltaetigkeit:"Charity", sehenswuerdigkeit:"Attraction", sonstiges:"Other" },
  },
  tr: {
    notFound:"QR-X bulunamadı veya silindi.", unavailableTitle:"QR-X kullanılamıyor", unavailable:"Bu QR-X artık kullanılamıyor.", restrictedOwnerTitle:"QR-X kısıtlandı", restrictedOwnerText:"Bu QR-X bir moderasyon kararı nedeniyle kısıtlandı ve şu anda herkese açık değil.", restrictedPublicText:"Bu QR-X şu anda kullanılamıyor.",
    reason:"Neden", noReason:"Daha ayrıntılı bir neden belirtilmedi.", reviewHint:"Bu kararın yeniden incelenmesi gerektiğini düşünüyorsanız yeniden inceleme talep edebilirsiniz.", reviewRequested:"İnceleme talep edildi. Talebiniz desteğe iletildi.", reviewExisting:"Bu karar için zaten açık bir inceleme var.", reviewError:"Talep kaydedilemedi. Lütfen daha sonra tekrar deneyin.", reviewButton:"Kararın incelenmesini iste", reviewDisclaimer:"Bu talep kısıtlamayı otomatik olarak kaldırmaz.",
    backCollection:"← “{{title}}” koleksiyonuna dön", normalQrx:"Normal QR-X", businessVerified: "Doğrulanmış işletme", businessQrx: "Business QR-X", verified:"Doğrulandı", follower:"TAKİPÇİ", mediaStat:"MEDYA", updatesStat:"GÜNCELLEMELER", openApp:"Uygulamayı aç", website:"Web sitesi", call:"Ara", email:"E-posta", navigation:"Navigasyon", appMissing:"Uygulama yüklü değil mi?", downloadHere:"Buradan indir",
    title:"Başlık", description:"Açıklama", noDescription:"Açıklama yok.", news:"Haberler / Güncellemeler", noNews:"Henüz haber yok.", images:"Görseller", noImages:"Görsel yok.", imageOpenAria:"{{name}} görselini aç", tapImage:"Açmak için görsele dokun", files:"Dosyalar", fileOpenAria:"{{name}} dosyasını aç", fileDownloadAria:"{{name}} dosyasını indir", open:"Aç", download:"İndir",
    location:"Konum", noLocation:"Konum kaydedilmemiş.", googleMaps:"Google Maps'te aç", navigationOpen:"Navigasyonu aç", transfer:"Transfer", transferHint:"Bu QR-X'in transfer geçmişi ve mevcut durumu.", noTransfer:"Henüz transfer yok.", recipient:"Alıcı", from:"Kimden", to:"Kime", accepted:"Kabul edildi", expires:"Bitiş",
    followed:"Takip", ownerText:"Bu QR-X'in sahibisiniz.", ownQrx:"Kendi QR-X'im", savedText:"Bu QR-X şu anda kayıtlı öğelerinizde.", followHint:"Daha hızlı bulmak için bu QR-X'i takip edin.", unfollow:"Takibi bırak", follow:"Takip et", loginFollow:"Bu QR-X'i takip etmek için giriş yapın.", savedByOne:"{{count}} kullanıcı kaydetti", savedByMany:"{{count}} kullanıcı kaydetti",
    collection:{untitled:"Adsız QR-X",business:"Business QR-X",normal:"Normal QR-X",collection:"Koleksiyon",one:"öğe",many:"öğe",verified:"Doğrulandı",part:"Koleksiyon",open:"Aç →"},
    categories:{praxis_gesundheit:"Muayenehane & Sağlık",gastronomie:"Gastronomi",unternehmen:"Şirket",dienstleistung:"Hizmet",handwerk:"Zanaat",event:"Etkinlik",verein:"Dernek",wohltaetigkeit:"Hayır kurumu",sehenswuerdigkeit:"Gezilecek yer",sonstiges:"Diğer"},
  },
  pl: {
    notFound:"Nie znaleziono QR-X lub został usunięty.", unavailableTitle:"QR-X niedostępny", unavailable:"Ten QR-X nie jest już dostępny.", restrictedOwnerTitle:"QR-X ograniczony", restrictedOwnerText:"Ten QR-X został ograniczony na podstawie decyzji moderacyjnej i obecnie nie jest publicznie dostępny.", restrictedPublicText:"Ten QR-X jest obecnie niedostępny.",
    reason:"Powód", noReason:"Nie podano dokładniejszego powodu.", reviewHint:"Jeśli uważasz, że decyzja powinna zostać ponownie sprawdzona, możesz poprosić o ponowną weryfikację.", reviewRequested:"Poproszono o weryfikację. Twoje zgłoszenie zostało wysłane do pomocy.", reviewExisting:"Dla tej decyzji istnieje już otwarta weryfikacja.", reviewError:"Nie udało się zapisać zgłoszenia. Spróbuj ponownie później.", reviewButton:"Poproś o weryfikację decyzji", reviewDisclaimer:"Zgłoszenie nie powoduje automatycznego zniesienia ograniczenia.",
    backCollection:"← Wróć do kolekcji „{{title}}”", normalQrx:"Zwykły QR-X", businessVerified: "Zweryfikowana firma", businessQrx: "Business QR-X", verified:"Zweryfikowany", follower:"OBSERWUJĄCY", mediaStat:"MEDIA", updatesStat:"AKTUALIZACJE", openApp:"Otwórz aplikację", website:"Strona WWW", call:"Zadzwoń", email:"E-mail", navigation:"Nawigacja", appMissing:"Aplikacja nie jest zainstalowana?", downloadHere:"Pobierz tutaj",
    title:"Tytuł", description:"Opis", noDescription:"Brak opisu.", news:"Aktualności", noNews:"Brak aktualności.", images:"Obrazy", noImages:"Brak obrazów.", imageOpenAria:"Otwórz obraz {{name}}", tapImage:"Dotknij obrazu, aby otworzyć", files:"Pliki", fileOpenAria:"Otwórz plik {{name}}", fileDownloadAria:"Pobierz plik {{name}}", open:"Otwórz", download:"Pobierz",
    location:"Lokalizacja", noLocation:"Brak zapisanej lokalizacji.", googleMaps:"Otwórz w Google Maps", navigationOpen:"Otwórz nawigację", transfer:"Transfer", transferHint:"Historia i aktualny status transferu tego QR-X.", noTransfer:"Brak transferu.", recipient:"Odbiorca", from:"Od", to:"Do", accepted:"Zaakceptowano", expires:"Wygasa",
    followed:"Obserwowane", ownerText:"Jesteś właścicielem tego QR-X.", ownQrx:"Mój QR-X", savedText:"Ten QR-X znajduje się obecnie w zapisanych elementach.", followHint:"Obserwuj ten QR-X, aby szybciej go odnaleźć.", unfollow:"Przestań obserwować", follow:"Obserwuj", loginFollow:"Zaloguj się, aby obserwować ten QR-X.", savedByOne:"Zapisany przez {{count}} użytkownika", savedByMany:"Zapisany przez {{count}} użytkowników",
    collection:{untitled:"QR-X bez nazwy",business:"Business QR-X",normal:"Zwykły QR-X",collection:"Kolekcja",one:"element",many:"elementów",verified:"Zweryfikowany",part:"Kolekcja",open:"Otwórz →"},
    categories:{praxis_gesundheit:"Praktyka i zdrowie",gastronomie:"Gastronomia",unternehmen:"Firma",dienstleistung:"Usługi",handwerk:"Rzemiosło",event:"Wydarzenie",verein:"Stowarzyszenie",wohltaetigkeit:"Dobroczynność",sehenswuerdigkeit:"Atrakcja",sonstiges:"Inne"},
  },
  ar: {
    notFound:"لم يتم العثور على QR-X أو تم حذفه.", unavailableTitle:"QR-X غير متاح", unavailable:"لم يعد QR-X هذا متاحًا.", restrictedOwnerTitle:"QR-X مقيّد", restrictedOwnerText:"تم تقييد QR-X هذا بسبب قرار إشراف وهو غير متاح للعامة حاليًا.", restrictedPublicText:"QR-X هذا غير متاح حاليًا.",
    reason:"السبب", noReason:"لم يتم تقديم سبب أكثر تفصيلًا.", reviewHint:"إذا كنت ترى أن هذا القرار يجب مراجعته، يمكنك طلب مراجعة جديدة.", reviewRequested:"تم طلب المراجعة. أُرسل طلبك إلى الدعم.", reviewExisting:"توجد بالفعل مراجعة مفتوحة لهذا القرار.", reviewError:"تعذر حفظ الطلب. يرجى المحاولة مرة أخرى لاحقًا.", reviewButton:"طلب مراجعة القرار", reviewDisclaimer:"لا يؤدي الطلب تلقائيًا إلى رفع التقييد.",
    backCollection:"← العودة إلى المجموعة «{{title}}»", normalQrx:"QR-X عادي", businessVerified: "نشاط تجاري موثّق", businessQrx: "Business QR-X", verified:"تم التحقق", follower:"المتابعون", mediaStat:"الوسائط", updatesStat:"التحديثات", openApp:"فتح التطبيق", website:"الموقع", call:"اتصال", email:"البريد الإلكتروني", navigation:"التنقل", appMissing:"التطبيق غير مثبت؟", downloadHere:"تنزيل من هنا",
    title:"العنوان", description:"الوصف", noDescription:"لا يوجد وصف.", news:"الأخبار / التحديثات", noNews:"لا توجد أخبار بعد.", images:"الصور", noImages:"لا توجد صور.", imageOpenAria:"فتح الصورة {{name}}", tapImage:"اضغط على الصورة لفتحها", files:"الملفات", fileOpenAria:"فتح الملف {{name}}", fileDownloadAria:"تنزيل الملف {{name}}", open:"فتح", download:"تنزيل",
    location:"الموقع", noLocation:"لم يتم حفظ موقع.", googleMaps:"فتح في خرائط Google", navigationOpen:"فتح التنقل", transfer:"النقل", transferHint:"سجل النقل والحالة الحالية لهذا QR-X.", noTransfer:"لا يوجد نقل بعد.", recipient:"المستلم", from:"من", to:"إلى", accepted:"تم القبول", expires:"انتهاء الصلاحية",
    followed:"المتابعة", ownerText:"أنت مالك QR-X هذا.", ownQrx:"QR-X الخاص بي", savedText:"QR-X هذا موجود حاليًا في العناصر المحفوظة لديك.", followHint:"تابع QR-X هذا للعثور عليه بسرعة أكبر.", unfollow:"إلغاء المتابعة", follow:"متابعة", loginFollow:"سجّل الدخول لمتابعة QR-X هذا.", savedByOne:"محفوظ بواسطة مستخدم واحد", savedByMany:"محفوظ بواسطة {{count}} مستخدمين",
    collection:{untitled:"QR-X بدون اسم",business:"Business QR-X",normal:"QR-X عادي",collection:"مجموعة",one:"عنصر",many:"عناصر",verified:"تم التحقق",part:"مجموعة",open:"فتح →"},
    categories:{praxis_gesundheit:"العيادات والصحة",gastronomie:"المطاعم والضيافة",unternehmen:"شركة",dienstleistung:"خدمة",handwerk:"حِرف",event:"فعالية",verein:"جمعية",wohltaetigkeit:"أعمال خيرية",sehenswuerdigkeit:"معلم سياحي",sonstiges:"أخرى"},
  },
  fr: {
    notFound:"QR-X introuvable ou supprimé.", unavailableTitle:"QR-X indisponible", unavailable:"Ce QR-X n’est plus disponible.", restrictedOwnerTitle:"QR-X restreint", restrictedOwnerText:"Ce QR-X a été restreint à la suite d’une décision de modération et n’est actuellement pas accessible au public.", restrictedPublicText:"Ce QR-X est actuellement indisponible.",
    reason:"Motif", noReason:"Aucun motif plus détaillé n’a été indiqué.", reviewHint:"Si vous pensez que cette décision doit être réexaminée, vous pouvez demander une nouvelle vérification.", reviewRequested:"Vérification demandée. Votre demande a été transmise au support.", reviewExisting:"Une vérification est déjà ouverte pour cette décision.", reviewError:"La demande n’a pas pu être enregistrée. Veuillez réessayer plus tard.", reviewButton:"Demander la révision de la décision", reviewDisclaimer:"La demande ne lève pas automatiquement la restriction.",
    backCollection:"← Retour à la collection « {{title}} »", normalQrx:"QR-X normal", businessVerified: "Entreprise vérifiée", businessQrx: "Business QR-X", verified:"Vérifié", follower:"ABONNÉS", mediaStat:"MÉDIAS", updatesStat:"ACTUALITÉS", openApp:"Ouvrir l’application", website:"Site web", call:"Appeler", email:"E-mail", navigation:"Navigation", appMissing:"Application non installée ?", downloadHere:"Télécharger ici",
    title:"Titre", description:"Description", noDescription:"Aucune description disponible.", news:"Actualités", noNews:"Aucune actualité pour le moment.", images:"Images", noImages:"Aucune image disponible.", imageOpenAria:"Ouvrir l’image {{name}}", tapImage:"Touchez l’image pour l’ouvrir", files:"Fichiers", fileOpenAria:"Ouvrir le fichier {{name}}", fileDownloadAria:"Télécharger le fichier {{name}}", open:"Ouvrir", download:"Télécharger",
    location:"Lieu", noLocation:"Aucun lieu enregistré.", googleMaps:"Ouvrir dans Google Maps", navigationOpen:"Ouvrir la navigation", transfer:"Transfert", transferHint:"Historique et état actuel du transfert de ce QR-X.", noTransfer:"Aucun transfert pour le moment.", recipient:"Destinataire", from:"De", to:"À", accepted:"Accepté", expires:"Expiration",
    followed:"Suivi", ownerText:"Vous êtes le propriétaire de ce QR-X.", ownQrx:"Mon QR-X", savedText:"Ce QR-X figure actuellement dans vos éléments enregistrés.", followHint:"Suivez ce QR-X pour le retrouver plus rapidement.", unfollow:"Ne plus suivre", follow:"Suivre", loginFollow:"Connectez-vous pour suivre ce QR-X.", savedByOne:"Enregistré par {{count}} utilisateur", savedByMany:"Enregistré par {{count}} utilisateurs",
    collection:{untitled:"QR-X sans nom",business:"Business QR-X",normal:"QR-X normal",collection:"Collection",one:"élément",many:"éléments",verified:"Vérifié",part:"Collection",open:"Ouvrir →"},
    categories:{praxis_gesundheit:"Cabinet & Santé",gastronomie:"Restauration",unternehmen:"Entreprise",dienstleistung:"Service",handwerk:"Artisanat",event:"Événement",verein:"Association",wohltaetigkeit:"Caritatif",sehenswuerdigkeit:"Site touristique",sonstiges:"Autre"},
  },
  es: {
    notFound:"No se encontró el QR-X o fue eliminado.", unavailableTitle:"QR-X no disponible", unavailable:"Este QR-X ya no está disponible.", restrictedOwnerTitle:"QR-X restringido", restrictedOwnerText:"Este QR-X ha sido restringido debido a una decisión de moderación y actualmente no está disponible públicamente.", restrictedPublicText:"Este QR-X no está disponible actualmente.",
    reason:"Motivo", noReason:"No se indicó un motivo más detallado.", reviewHint:"Si crees que esta decisión debe revisarse, puedes solicitar una nueva revisión.", reviewRequested:"Revisión solicitada. Tu solicitud se ha enviado al soporte.", reviewExisting:"Ya existe una revisión abierta para esta decisión.", reviewError:"No se pudo guardar la solicitud. Inténtalo de nuevo más tarde.", reviewButton:"Solicitar revisión de la decisión", reviewDisclaimer:"La solicitud no elimina automáticamente la restricción.",
    backCollection:"← Volver a la colección «{{title}}»", normalQrx:"QR-X normal", businessVerified: "Empresa verificada", businessQrx: "Business QR-X", verified:"Verificado", follower:"SEGUIDORES", mediaStat:"MEDIOS", updatesStat:"ACTUALIZACIONES", openApp:"Abrir app", website:"Sitio web", call:"Llamar", email:"Correo", navigation:"Navegación", appMissing:"¿No tienes instalada la app?", downloadHere:"Descargar aquí",
    title:"Título", description:"Descripción", noDescription:"No hay descripción disponible.", news:"Noticias / Actualizaciones", noNews:"Todavía no hay noticias.", images:"Imágenes", noImages:"No hay imágenes disponibles.", imageOpenAria:"Abrir imagen {{name}}", tapImage:"Toca la imagen para abrirla", files:"Archivos", fileOpenAria:"Abrir archivo {{name}}", fileDownloadAria:"Descargar archivo {{name}}", open:"Abrir", download:"Descargar",
    location:"Ubicación", noLocation:"No hay ubicación guardada.", googleMaps:"Abrir en Google Maps", navigationOpen:"Abrir navegación", transfer:"Transferencia", transferHint:"Historial y estado actual de transferencia de este QR-X.", noTransfer:"Todavía no hay transferencia.", recipient:"Destinatario", from:"De", to:"A", accepted:"Aceptada", expires:"Vencimiento",
    followed:"Seguimiento", ownerText:"Eres el propietario de este QR-X.", ownQrx:"Mi QR-X", savedText:"Este QR-X está actualmente entre tus elementos guardados.", followHint:"Sigue este QR-X para encontrarlo más rápidamente.", unfollow:"Dejar de seguir", follow:"Seguir", loginFollow:"Inicia sesión para seguir este QR-X.", savedByOne:"Guardado por {{count}} usuario", savedByMany:"Guardado por {{count}} usuarios",
    collection:{untitled:"QR-X sin nombre",business:"Business QR-X",normal:"QR-X normal",collection:"Colección",one:"elemento",many:"elementos",verified:"Verificado",part:"Colección",open:"Abrir →"},
    categories:{praxis_gesundheit:"Consulta y salud",gastronomie:"Gastronomía",unternehmen:"Empresa",dienstleistung:"Servicio",handwerk:"Oficio",event:"Evento",verein:"Asociación",wohltaetigkeit:"Beneficencia",sehenswuerdigkeit:"Lugar de interés",sonstiges:"Otros"},
  },
  it: {
    notFound:"QR-X non trovato o eliminato.", unavailableTitle:"QR-X non disponibile", unavailable:"Questo QR-X non è più disponibile.", restrictedOwnerTitle:"QR-X limitato", restrictedOwnerText:"Questo QR-X è stato limitato a seguito di una decisione di moderazione e al momento non è disponibile pubblicamente.", restrictedPublicText:"Questo QR-X al momento non è disponibile.",
    reason:"Motivo", noReason:"Non è stato indicato un motivo più dettagliato.", reviewHint:"Se ritieni che questa decisione debba essere riesaminata, puoi richiedere una nuova verifica.", reviewRequested:"Verifica richiesta. La tua richiesta è stata inviata al supporto.", reviewExisting:"Esiste già una verifica aperta per questa decisione.", reviewError:"Impossibile salvare la richiesta. Riprova più tardi.", reviewButton:"Richiedi la verifica della decisione", reviewDisclaimer:"La richiesta non rimuove automaticamente la limitazione.",
    backCollection:"← Torna alla raccolta «{{title}}»", normalQrx:"QR-X normale", businessVerified: "Azienda verificata", businessQrx: "Business QR-X", verified:"Verificato", follower:"FOLLOWER", mediaStat:"MEDIA", updatesStat:"AGGIORNAMENTI", openApp:"Apri app", website:"Sito web", call:"Chiama", email:"E-mail", navigation:"Navigazione", appMissing:"App non installata?", downloadHere:"Scarica qui",
    title:"Titolo", description:"Descrizione", noDescription:"Nessuna descrizione disponibile.", news:"Notizie / Aggiornamenti", noNews:"Nessuna notizia ancora.", images:"Immagini", noImages:"Nessuna immagine disponibile.", imageOpenAria:"Apri immagine {{name}}", tapImage:"Tocca l’immagine per aprirla", files:"File", fileOpenAria:"Apri file {{name}}", fileDownloadAria:"Scarica file {{name}}", open:"Apri", download:"Scarica",
    location:"Luogo", noLocation:"Nessun luogo salvato.", googleMaps:"Apri in Google Maps", navigationOpen:"Apri navigazione", transfer:"Trasferimento", transferHint:"Cronologia e stato attuale del trasferimento di questo QR-X.", noTransfer:"Nessun trasferimento ancora.", recipient:"Destinatario", from:"Da", to:"A", accepted:"Accettato", expires:"Scadenza",
    followed:"Seguito", ownerText:"Sei il proprietario di questo QR-X.", ownQrx:"Il mio QR-X", savedText:"Questo QR-X è attualmente tra gli elementi salvati.", followHint:"Segui questo QR-X per ritrovarlo più rapidamente.", unfollow:"Smetti di seguire", follow:"Segui", loginFollow:"Accedi per seguire questo QR-X.", savedByOne:"Salvato da {{count}} utente", savedByMany:"Salvato da {{count}} utenti",
    collection:{untitled:"QR-X senza nome",business:"Business QR-X",normal:"QR-X normale",collection:"Raccolta",one:"elemento",many:"elementi",verified:"Verificato",part:"Raccolta",open:"Apri →"},
    categories:{praxis_gesundheit:"Studio & Salute",gastronomie:"Ristorazione",unternehmen:"Azienda",dienstleistung:"Servizio",handwerk:"Artigianato",event:"Evento",verein:"Associazione",wohltaetigkeit:"Beneficenza",sehenswuerdigkeit:"Attrazione",sonstiges:"Altro"},
  },
} as const;

function legacyInterpolate(value: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, replacement]) => result.replaceAll(`{{${key}}}`, replacement),
    value,
  );
}

type SearchParams = Record<string, string | string[] | undefined>;

function getFirst(param: string | string[] | undefined): string | undefined {
  return Array.isArray(param) ? param[0] : param;
}

function toErrorMessage(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

function normalizeQrxId(id: string): string {
  let v = String(id || "").trim();
  try {
    v = decodeURIComponent(v);
  } catch {
    // ignore
  }
  if (v.startsWith("qrx:")) v = v.slice(4);
  return v;
}

function isProbablyMobile(ua: string | null): boolean {
  if (!ua) return false;
  const u = ua.toLowerCase();
  return /android|iphone|ipad|ipod|mobile|tablet/.test(u);
}

function normalizeWebsite(url: string | null | undefined): string | null {
  const trimmed = String(url || "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeNavigation(value: string | null | undefined): string | null {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

function formatNumber(value: number | null | undefined, locale: LegacyQrxLocale) {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "0";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.max(0, numberValue));
}

function formatDate(value: string | null | undefined, locale: LegacyQrxLocale) {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function normalizeNewsItems(value: NewsItem[] | null | undefined) {
  const raw = Array.isArray(value) ? value : [];
  return raw
    .filter((item) => typeof item?.text === "string" && item.text.trim().length > 0)
    .map((item, index) => ({
      id: `${item.createdAt ?? "news"}-${index}`,
      text: item.text.trim(),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
    }))
    .sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function QrxPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const debug = getFirst(sp.debug) === "1";
  const parentQrxId = getFirst(sp.parentQrxId);
  const parentQrxTitle = getFirst(sp.parentQrxTitle);
  const adminKey = getFirst(sp.adminKey);
  const moderationReviewResult = getFirst(sp.review);
  const hasAdminAccess =
    !!process.env.QRX_ADMIN_ACCESS_KEY &&
    adminKey === process.env.QRX_ADMIN_ACCESS_KEY;

  const qrxId = normalizeQrxId(id);
  const h = await headers();
  const publicLocale = resolveLegacyQrxLocale(h.get("accept-language"));
  const ui = LEGACY_QRX_TEXT[publicLocale];
  const supabase = await createSupabaseServerClient();;

  const { data: entry, error: entryErr } = await supabase
    .from("qr_x_entries")
    .select(`
      id,
      owner_user_id,
      title,
      description,
      news,
      location_name,
      location_lat,
      location_lng,
      logo_url,
      type,
      category,
      verified,
      cover_image_url,
      cta_phone,
      cta_website,
      cta_email,
      cta_navigation,
      company_name,
      suspended,
      suspended_reason,
      deleted_at,
      deleted_reason,
      deleted_by_admin,
      password_protected,
      views_total,
      follower_count,
      created_at,
      collection_title,
      collection_description
    `)
    .eq("id", qrxId)
    .maybeSingle()
    .returns<QrxEntry>();

  const { data: media, error: mediaErr } = await supabase
    .from("qr_x_media")
    .select("id, qrx_id, type, url, filename, bytes")
    .eq("qrx_id", qrxId)
    .returns<QrxMedia[]>();

  const { data: collectionRowsRaw, error: collectionRowsErr } = await supabase
    .from("qrx_collection_items")
    .select("linked_qrx_id,sort_order,custom_title")
    .eq("collection_qrx_id", qrxId)
    .order("sort_order", { ascending: true });

  const collectionRows = (collectionRowsRaw ?? []) as Array<{
    linked_qrx_id: string;
    sort_order: number | null;
    custom_title: string | null;
  }>;

  const linkedQrxIds = collectionRows
    .map((row) => row.linked_qrx_id)
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  const { data: collectionChildrenRaw, error: collectionChildrenErr } =
    linkedQrxIds.length > 0
      ? await supabase
          .from("qr_x_entries")
          .select(
            "id,title,company_name,description,type,logo_url,cover_image_url,location_name,verified,deleted_at,suspended",
          )
          .in("id", linkedQrxIds)
          .is("deleted_at", null)
          .or("suspended.is.null,suspended.eq.false")
      : { data: [], error: null };

  const collectionChildren = (collectionChildrenRaw ?? []) as Array<
    QrxCollectionPreviewItem & {
      deleted_at?: string | null;
      suspended?: boolean | null;
    }
  >;

  const collectionChildrenById = new Map(
    collectionChildren.map((child) => [child.id, child]),
  );

  const collectionItems: QrxCollectionPreviewItem[] = collectionRows.reduce<
    QrxCollectionPreviewItem[]
  >((accumulator, row) => {
    const child = collectionChildrenById.get(row.linked_qrx_id);

    if (!child || child.deleted_at || child.suspended === true) {
      return accumulator;
    }

    accumulator.push({
      id: child.id,
      title: child.title ?? null,
      company_name: child.company_name ?? null,
      description: child.description ?? null,
      type: child.type ?? null,
      logo_url: child.logo_url ?? null,
      cover_image_url: child.cover_image_url ?? null,
      location_name: child.location_name ?? null,
      verified: child.verified ?? null,
      custom_title: row.custom_title ?? null,
    });

    return accumulator;
  }, []);

  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;

  const { count: saveCountRaw } = await supabase
    .from("qrx_saves")
    .select("*", { count: "exact", head: true })
    .eq("qrx_id", qrxId);

  const { data: savedRow } = currentUserId
    ? await supabase
        .from("qrx_saves")
        .select("qrx_id")
        .eq("qrx_id", qrxId)
        .eq("user_id", currentUserId)
        .maybeSingle()
    : { data: null };

  const isOwner = Boolean(entry?.owner_user_id && currentUserId && entry.owner_user_id === currentUserId);

  const { data: transferHistoryRaw } = isOwner
    ? await supabase.rpc("get_qrx_transfer_history", { p_qrx_id: qrxId })
    : { data: [] };

  async function toggleFollowAction() {
    "use server";

   const actionSupabase = await createSupabaseServerClient();
    const { data: actionUserData } = await actionSupabase.auth.getUser();
    const actionUserId = actionUserData.user?.id ?? null;

    if (!actionUserId) return;

    const { data: existing } = await actionSupabase
      .from("qrx_saves")
      .select("qrx_id")
      .eq("qrx_id", qrxId)
      .eq("user_id", actionUserId)
      .maybeSingle();

    if (existing) {
      await actionSupabase
        .from("qrx_saves")
        .delete()
        .eq("qrx_id", qrxId)
        .eq("user_id", actionUserId);
    } else {
      await actionSupabase
        .from("qrx_saves")
        .upsert({ qrx_id: qrxId, user_id: actionUserId }, { onConflict: "qrx_id,user_id" });
    }

    revalidatePath(`/qrx/${qrxId}`);
  }

  async function requestModerationReviewAction() {
    "use server";

    const actionSupabase = await createSupabaseServerClient();
    const { data: actionUserData, error: actionUserError } =
      await actionSupabase.auth.getUser();
    const actionUser = actionUserData.user;

    if (actionUserError || !actionUser?.id) {
      redirect(`/login?next=${encodeURIComponent(`/qrx/${qrxId}`)}`);
    }

    const { data: ownedQrx } = await actionSupabase
      .from("qr_x_entries")
      .select("id,title,owner_user_id,suspended,suspended_reason")
      .eq("id", qrxId)
      .eq("owner_user_id", actionUser.id)
      .maybeSingle();

    if (!ownedQrx || ownedQrx.suspended !== true) {
      redirect(`/qrx/${qrxId}`);
    }

    const { data: existing } = await actionSupabase
      .from("support_tickets")
      .select("id,status")
      .eq("user_id", actionUser.id)
      .eq("qrx_id", qrxId)
      .eq("report_reason", "moderation_review")
      .in("status", ["open", "in_review", "waiting_customer"])
      .limit(1);

    if (Array.isArray(existing) && existing.length > 0) {
      redirect(`/qrx/${qrxId}?review=existing`);
    }

    const description = [
      "Antrag auf Überprüfung einer Moderationsentscheidung aus der Webplattform.",
      `QR-X: ${qrxId}`,
      `Titel: ${ownedQrx.title ?? "QR-X"}`,
      `Angezeigter Sperrgrund: ${ownedQrx.suspended_reason?.trim() || "Kein Grund angegeben"}`,
      "",
      "Der Nutzer bittet um erneute Prüfung der Moderationsentscheidung.",
    ].join("\n");

    const { error: ticketError } = await actionSupabase
      .from("support_tickets")
      .insert({
        user_id: actionUser.id,
        qrx_id: qrxId,
        problem_type: "other",
        status: "open",
        title: "Überprüfung einer Moderationsentscheidung",
        description,
        report_reason: "moderation_review",
        reporter_email: actionUser.email ?? null,
        report_weight: 1,
      });

    if (ticketError) {
      console.error("Moderation review ticket creation failed:", ticketError);
      redirect(`/qrx/${qrxId}?review=error`);
    }

    revalidatePath(`/qrx/${qrxId}`);
    redirect(`/qrx/${qrxId}?review=requested`);
  }

  const ua = h.get("user-agent");
  const showDownloadHint = isProbablyMobile(ua);
  const isMobile = showDownloadHint;

  const debugPayload = {
    idParam: id,
    qrxId,
    entryFound: !!entry,
    entryErr: toErrorMessage(entryErr),
    suspended: entry?.suspended ?? null,
    suspendedReason: entry?.suspended_reason ?? null,
    deletedAt: entry?.deleted_at ?? null,
    deletedReason: entry?.deleted_reason ?? null,
    deletedByAdmin: entry?.deleted_by_admin ?? null,
    passwordProtected: entry?.password_protected ?? null,
    hasAdminAccess,
    mediaCount: (media ?? []).length,
    mediaErr: toErrorMessage(mediaErr),
    collectionCount: collectionItems.length,
    collectionRowsErr: toErrorMessage(collectionRowsErr),
    collectionChildrenErr: toErrorMessage(collectionChildrenErr),
    currentUserId,
    saveCount: saveCountRaw ?? entry?.follower_count ?? 0,
    hasSaved: Boolean(savedRow),
    env: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      runtime: "nodejs",
    },
  };

  if (entryErr || !entry) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>404</h1>
          <p className={styles.sub}>{ui.notFound}</p>
          {debug && <pre className={styles.debug}>{JSON.stringify(debugPayload, null, 2)}</pre>}
        </div>
      </main>
    );
  }

  if (entry.deleted_at) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>{ui.unavailableTitle}</h1>
          <p className={styles.sub}>{ui.unavailable}</p>
          {debug && <pre className={styles.debug}>{JSON.stringify(debugPayload, null, 2)}</pre>}
        </div>
      </main>
    );
  }

  if (entry.suspended === true) {
    return (
      <main className={styles.page}>
        <div
          className={styles.card}
          style={{
            maxWidth: 620,
            border: "1px solid rgba(245,197,66,0.24)",
            background: "#0D1728",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              margin: "0 auto 16px",
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: "rgba(245,197,66,0.08)",
              border: "1px solid rgba(245,197,66,0.24)",
              fontSize: 24,
            }}
          >
            ◇
          </div>

          <h1 className={styles.title}>
            {isOwner ? ui.restrictedOwnerTitle : ui.unavailableTitle}
          </h1>

          <p className={styles.sub}>
            {isOwner ? ui.restrictedOwnerText : ui.restrictedPublicText}
          </p>

          {isOwner ? (
            <>
              <div
                style={{
                  marginTop: 18,
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  textAlign: "left",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#94A3B8",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {ui.reason}
                </strong>
                <span style={{ color: "#E2E8F0", lineHeight: 1.5 }}>
                  {entry.suspended_reason?.trim() || ui.noReason}
                </span>
              </div>

              <p className={styles.sub} style={{ marginTop: 18 }}>
                {ui.reviewHint}
              </p>

              {moderationReviewResult === "requested" ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(34,197,94,0.09)",
                    border: "1px solid rgba(34,197,94,0.24)",
                    color: "#BBF7D0",
                  }}
                >
                  {ui.reviewRequested}
                </div>
              ) : moderationReviewResult === "existing" ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(59,130,246,0.09)",
                    border: "1px solid rgba(59,130,246,0.24)",
                    color: "#BFDBFE",
                  }}
                >
                  {ui.reviewExisting}
                </div>
              ) : moderationReviewResult === "error" ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.22)",
                    color: "#FECACA",
                  }}
                >
                  {ui.reviewError}
                </div>
              ) : (
                <form action={requestModerationReviewAction} style={{ marginTop: 16 }}>
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      minHeight: 48,
                      border: 0,
                      borderRadius: 14,
                      padding: "0 16px",
                      background: "#F8FAFC",
                      color: "#0F172A",
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {ui.reviewButton}
                  </button>
                </form>
              )}

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#718096",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {ui.reviewDisclaimer}
              </p>
            </>
          ) : null}

          {debug && <pre className={styles.debug}>{JSON.stringify(debugPayload, null, 2)}</pre>}
        </div>
      </main>
    );
  }

  const images: QrxMedia[] = (media ?? []).filter((m) => m.type === "image");
  const files: QrxMedia[] = (media ?? []).filter((m) => m.type === "file");

  const isBusiness = entry.type === "business";
  const companyName = entry.company_name?.trim() || entry.title;
  const logoUrl = entry.logo_url?.trim() || null;
  const coverUrl = entry.cover_image_url?.trim() || null;

  const galleryImages = images.filter((img) => {
    if (!img.url) return false;
    if (logoUrl && img.url === logoUrl) return false;
    if (coverUrl && img.url === coverUrl) return false;
    return true;
  });

  const wantSave = getFirst(sp.save) === "1";
  const deepLink = wantSave ? `miosegqr://qrx/${qrxId}?save=1` : `miosegqr://qrx/${qrxId}`;
  const fallbackUrl = `/${publicLocale}/get-app?from=${encodeURIComponent(`/qrx/${qrxId}${wantSave ? "?save=1" : ""}`)}`;
  const websiteUrl = normalizeWebsite(entry.cta_website);
  const navigationUrl = normalizeNavigation(entry.cta_navigation);
  const phoneUrl = entry.cta_phone?.trim() ? `tel:${entry.cta_phone.trim()}` : null;
  const emailUrl = entry.cta_email?.trim() ? `mailto:${entry.cta_email.trim()}` : null;
  const categoryMeta = getBusinessCategoryMeta(entry.category, ui.categories);
  const newsItems = normalizeNewsItems(entry.news);
  const transferHistory = ((transferHistoryRaw ?? []) as TransferHistoryItem[]).sort((a, b) => {
    const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });
  const totalMediaCount = (media ?? []).length;
  const followerCount = saveCountRaw ?? entry.follower_count ?? 0;
  const publicQrxUrl = `https://www.mioseg-qr.com/qrx/${qrxId}`;

  const collectionBackSectionStyle: CSSProperties = {
  width: "min(960px, calc(100% - 32px))",
  margin: "0 auto 14px",
};

const collectionBackLinkStyle: CSSProperties = {
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 14px",
  background: "rgba(37,99,235,0.14)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#dbeafe",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 900,
};

const sectionCardStyle: CSSProperties = {
    width: isMobile ? "100%" : "min(960px, calc(100% - 32px))",
    maxWidth: "100%",
    boxSizing: "border-box",
    margin: "0 auto 16px",
    borderRadius: isMobile ? 20 : 26,
    padding: isMobile ? 16 : 22,
    background: "#0D1728",
    border: "1px solid rgba(59, 130, 246, 0.18)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
  };

  const heroShellStyle: CSSProperties = {
    width: isMobile ? "100%" : "min(960px, calc(100% - 32px))",
    maxWidth: "100%",
    boxSizing: "border-box",
    margin: "0 auto 16px",
  };

  const heroCardStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    borderRadius: isMobile ? 22 : 26,
    minHeight: isMobile ? 300 : 390,
    background: "#0D1728",
    border: "1px solid rgba(59, 130, 246, 0.18)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
  };

  const heroCoverImageStyle: CSSProperties = {
    width: "100%",
    height: isMobile ? 300 : 390,
    objectFit: "cover",
    display: "block",
    filter: "brightness(0.78)",
  };

  const heroLogoFrameStyle: CSSProperties = {
    width: isMobile ? 98 : 138,
    height: isMobile ? 98 : 138,
    borderRadius: 999,
    overflow: "hidden",
    background: "#ffffff",
    border: "4px solid rgba(255,255,255,0.94)",
  };

  const heroTitleStyle: CSSProperties = {
    margin: 0,
    color: "#ffffff",
    fontSize: isMobile ? 28 : 42,
    lineHeight: 1.15,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    textShadow: "0 8px 22px rgba(0,0,0,0.38)",
  };

  const verifiedNoticeStyle: CSSProperties = {
    width: isMobile ? "100%" : "min(960px, calc(100% - 32px))",
    maxWidth: "100%",
    boxSizing: "border-box",
    margin: "0 auto 16px",
    borderRadius: isMobile ? 20 : 24,
    padding: isMobile ? 16 : 20,
    background: "#06281F",
    border: "1px solid rgba(52,211,153,0.34)",
    display: "flex",
    alignItems: "center",
    gap: 18,
    boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
  };

  const profileStatsStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: isMobile ? 8 : 14,
  };

  const profileStatBoxStyle: CSSProperties = {
    minHeight: isMobile ? 74 : 92,
    borderRadius: isMobile ? 16 : 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "grid",
    placeItems: "center",
    gap: 3,
    color: "#ffffff",
    textAlign: "center",
  };

  const profileStatValueStyle: CSSProperties = {
    color: "#ffffff",
    fontSize: isMobile ? 24 : 34,
    lineHeight: 1,
    fontWeight: 800,
  };

  const profileActionsStyle: CSSProperties = isMobile
    ? { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 20 }
    : { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 };

  const actionChipStyle: CSSProperties = {
    width: isMobile ? "100%" : undefined,
    minHeight: isMobile ? 48 : 46,
    borderRadius: 999,
    padding: isMobile ? "0 10px" : "0 18px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: isMobile ? 14 : 15,
  };

  const appButtonStyle: CSSProperties = { ...actionChipStyle, background: "#ffffff", color: "#0f172a" };

  const cardTitleStyle: CSSProperties = {
    margin: 0, color: "#ffffff", fontSize: isMobile ? 20 : 22, lineHeight: 1.22, fontWeight: 800, letterSpacing: "-0.02em",
  };

  const simpleTextStyle: CSSProperties = {
    margin: "12px 0 0", color: "rgba(255,255,255,0.86)", fontSize: isMobile ? 16 : 17, lineHeight: 1.55, fontWeight: 400,
  };

  const descriptionTextStyle: CSSProperties = {
    margin: "18px 0 0", color: "rgba(255,255,255,0.84)", fontSize: isMobile ? 15 : 16, lineHeight: isMobile ? 1.58 : 1.65, whiteSpace: "pre-wrap", fontWeight: 400,
  };

  const imageGridStyle: CSSProperties = {
    marginTop: 22, display: "grid",
    gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(140px, 1fr))",
    gap: isMobile ? 14 : 22,
  };

  const imageThumbStyle: CSSProperties = {
    width: isMobile ? 96 : 112, height: isMobile ? 96 : 112, borderRadius: 18,
    objectFit: "cover", display: "block", boxShadow: "0 14px 30px rgba(0,0,0,0.24)",
  };

  const profileHeaderStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: isMobile ? 10 : 14,
    flexWrap: "wrap",
    marginBottom: isMobile ? 20 : 30,
  };

  const profileKickerStyle: CSSProperties = {
    color: "#D4AF37",
    fontSize: isMobile ? 12 : 14,
    fontWeight: 800,
    letterSpacing: isMobile ? "0.1em" : "0.14em",
    textTransform: "uppercase",
  };

  const profileCategoryPillStyle: CSSProperties = {
    minHeight: isMobile ? 34 : 38,
    borderRadius: 999,
    padding: isMobile ? "0 12px" : "0 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.78)",
    display: "inline-flex",
    alignItems: "center",
    fontWeight: 700,
    fontSize: isMobile ? 13 : 14,
  };

  const profileStatLabelStyle: CSSProperties = {
    color: "rgba(255,255,255,0.55)",
    fontSize: isMobile ? 10 : 12,
    fontWeight: 700,
    letterSpacing: isMobile ? "0.06em" : "0.08em",
    textTransform: "uppercase",
  };

  const mutedTextStyle: CSSProperties = {
    margin: "12px 0 0",
    color: "rgba(255,255,255,0.58)",
    fontSize: isMobile ? 14 : 15,
    lineHeight: 1.55,
  };

  const newsBoxStyle: CSSProperties = {
    marginTop: isMobile ? 14 : 18,
    borderRadius: isMobile ? 18 : 22,
    overflowY: "auto",
    overflowX: "hidden",
    maxHeight: isMobile ? 360 : 460,
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(65,84,103,0.75)",
    background: "rgba(255,255,255,0.025)",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(148,163,184,0.45) transparent",
    overscrollBehavior: "contain",
    paddingRight: isMobile ? 0 : 4,
  };

  const newsRowStyle: CSSProperties = {
    padding: isMobile ? "14px 14px" : "16px 18px",
  };

  const newsTextStyle: CSSProperties = {
    color: "rgba(255,255,255,0.86)",
    fontSize: isMobile ? 15 : 16,
    lineHeight: isMobile ? 1.42 : 1.55,
  };

  const newsDateStyle: CSSProperties = {
    marginTop: 8,
    color: "#8f9baa",
    fontSize: isMobile ? 13 : 14,
  };


  return (
    <main className={styles.page}>
      <TrackViewClient qrxId={qrxId} />

      <QrxPasswordGate qrxId={qrxId} enabled={entry.password_protected === true && !hasAdminAccess} locale={publicLocale}>
        {parentQrxId && parentQrxTitle ? (
          <section style={collectionBackSectionStyle}>
            <a
              href={`/qrx/${encodeURIComponent(parentQrxId)}`}
              style={collectionBackLinkStyle}
            >
              {legacyInterpolate(ui.backCollection, { title: parentQrxTitle })}
            </a>
          </section>
        ) : null}

        {/* 1. Hero */}
        {isBusiness ? (
          <section style={heroShellStyle}>
            <div style={heroCardStyle}>
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="Cover" style={heroCoverImageStyle} />
              ) : (
                <div style={heroCoverFallbackStyle} />
              )}

              <div style={heroOverlayStyle} />

              <div style={heroIdentityStyle}>
                {logoUrl ? (
                  <div style={heroLogoFrameStyle}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo" style={heroLogoStyle} />
                  </div>
                ) : null}

                <div
                  style={{
                    ...heroIdentityTextStyle,
                    flexBasis: logoUrl ? 320 : "100%",
                  }}
                >
                  <h1 style={heroTitleStyle}>{companyName}</h1>

                  <div style={heroBrandRowStyle}>
                    {entry.verified ? (
                      <span style={heroVerifiedBusinessBadgeStyle}>
                        <span style={heroVerifiedBusinessIconStyle}>✓</span>
                        {ui.businessVerified}
                      </span>
                    ) : (
                      <span style={heroBusinessBadgeStyle}>{ui.businessQrx}</span>
                    )}

                    <span style={heroBrandDividerStyle} aria-hidden="true" />

                    <span style={heroMiosegBrandStyle}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/logo-wwhite.png"
                        alt=""
                        aria-hidden="true"
                        style={heroMiosegLogoStyle}
                      />
                      <span>mioseg qr</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section style={sectionCardStyle}>
            <div style={phaseBadgeRowStyle}>
              <span style={phaseCategoryBadgeStyle}>⌗ {ui.normalQrx}</span>
              {categoryMeta ? (
                <span style={phaseCategoryBadgeStyle}>
                  {categoryMeta.icon} {categoryMeta.label}
                </span>
              ) : null}
              {entry.verified ? <span style={phaseVerifiedSoftBadgeStyle}>✓ {ui.verified}</span> : null}
            </div>
            <h1 style={normalHeroTitleStyle}>{companyName}</h1>
          </section>
        )}

        {/* 2. Business-Profil */}
        <section style={sectionCardStyle}>
          {categoryMeta ? (
            <div style={profileCategoryHeaderStyle}>
              <span style={profileCategoryPillStyle}>
                {categoryMeta.icon} {categoryMeta.label}
              </span>
            </div>
          ) : null}

          <div style={profileStatsStyle}>
            <div style={profileStatBoxStyle}>
              <strong style={profileStatValueStyle}>{formatNumber(followerCount, publicLocale)}</strong>
              <span style={profileStatLabelStyle}>{ui.follower}</span>
            </div>
            <div style={profileStatBoxStyle}>
              <strong style={profileStatValueStyle}>{formatNumber(totalMediaCount, publicLocale)}</strong>
              <span style={profileStatLabelStyle}>{ui.mediaStat}</span>
            </div>
            <div style={profileStatBoxStyle}>
              <strong style={profileStatValueStyle}>{formatNumber(newsItems.length, publicLocale)}</strong>
              <span style={profileStatLabelStyle}>{ui.updatesStat}</span>
            </div>
          </div>

          <div style={profileActionsStyle}>
            <a href={deepLink} data-fallback={fallbackUrl} id="openAppBtn" style={appButtonStyle}>
              {ui.openApp}
            </a>

            {websiteUrl ? (
              <a style={actionChipStyle} href={websiteUrl} target="_blank" rel="noreferrer">
                🌐 {ui.website}
              </a>
            ) : null}

            {phoneUrl ? (
              <a style={actionChipStyle} href={phoneUrl}>
                ☎️ {ui.call}
              </a>
            ) : null}

            {emailUrl ? (
              <a style={actionChipStyle} href={emailUrl}>
                ✉️ {ui.email}
              </a>
            ) : null}

            {navigationUrl ? (
              <a style={actionChipStyle} href={navigationUrl} target="_blank" rel="noreferrer">
                🧭 {ui.navigation}
              </a>
            ) : null}
          </div>

          {showDownloadHint ? (
            <p className={styles.muted} style={{ marginTop: 14 }}>
              {ui.appMissing}{" "}
              <a className={styles.downloadLink} href={fallbackUrl}>
                {ui.downloadHere}
              </a>
            </p>
          ) : null}
        </section>

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var btn = document.getElementById("openAppBtn");
  if(!btn) return;

  btn.addEventListener("click", function(e){
    var href = btn.getAttribute("href");
    var fallback = btn.getAttribute("data-fallback");
    if(!href) return;

    try { window.location.href = href; } catch(e){}

    setTimeout(function(){
      try { window.location.href = fallback; } catch(e){}
    }, 1200);

    e.preventDefault();
  });
})();`.trim(),
          }}
        />

        {debug && <pre className={styles.debug}>{JSON.stringify(debugPayload, null, 2)}</pre>}

        {/* 3. Titel */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>{ui.title}</h2>
          <p style={simpleTextStyle}>{entry.title?.trim() || companyName}</p>
        </section>

        {/* 4. Beschreibung */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>{ui.description}</h2>
          <p style={descriptionTextStyle}>
            {entry.description?.trim() ? entry.description : ui.noDescription}
          </p>
        </section>

        {/* 5. News / Updates */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>{ui.news}</h2>

          {newsItems.length === 0 ? (
            <p style={mutedTextStyle}>{ui.noNews}</p>
          ) : (
            <div style={newsBoxStyle}>
              {newsItems.map((n, index) => (
  <article
    key={n.id}
    style={{
      ...newsRowStyle,
      borderBottom:
        index === newsItems.length - 1
          ? "none"
          : "1px solid rgba(65,84,103,0.6)",
    }}
  >
                  <div style={newsTextStyle}>{n.text}</div>
                  <div style={newsDateStyle}>{formatDate(n.createdAt, publicLocale)}</div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 6. Bilder */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>{ui.images}</h2>

          {galleryImages.length === 0 ? (
            <p style={mutedTextStyle}>{ui.noImages}</p>
          ) : (
            <div style={imageGridStyle}>
              {galleryImages.map((img) => (
                <MediaInteractionLink
                  key={img.id}
                  qrxId={qrxId}
                  mediaId={img.id}
                  mediaType="image"
                  eventType="image_view"
                  variant="original"
                  source="public_qrx_gallery"
                  href={img.url}
                  mode="open"
                  style={imageItemStyle}
                  ariaLabel={legacyInterpolate(ui.imageOpenAria, { name: img.filename })}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.filename} style={imageThumbStyle} />
                  <span style={imageCaptionStyle}>{img.filename}</span>
                  <span style={imageOpenHintStyle}>{ui.tapImage}</span>
                </MediaInteractionLink>
              ))}
            </div>
          )}
        </section>

        {/* 7. Dateien */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>{ui.files}</h2>

          {files.length === 0 ? (
            <p style={mutedTextStyle}>–</p>
          ) : (
            <div style={fileListStyle}>
              {files.map((f) => (
                <div key={f.id} style={fileRowStyle}>
                  <span style={fileNameStyle}>📄 {f.filename}</span>

                  <div style={fileActionRowStyle}>
                    <MediaInteractionLink
                      qrxId={qrxId}
                      mediaId={f.id}
                      mediaType="file"
                      eventType="file_open"
                      variant="original"
                      source="public_qrx_files"
                      href={f.url}
                      mode="open"
                      style={fileActionButtonStyle}
                      ariaLabel={legacyInterpolate(ui.fileOpenAria, { name: f.filename })}
                    >
                      {ui.open}
                    </MediaInteractionLink>

                    <MediaInteractionLink
                      qrxId={qrxId}
                      mediaId={f.id}
                      mediaType="file"
                      eventType="file_download"
                      variant="original"
                      source="public_qrx_files"
                      href={f.url}
                      mode="download"
                      filename={f.filename}
                      style={fileDownloadButtonStyle}
                      ariaLabel={legacyInterpolate(ui.fileDownloadAria, { name: f.filename })}
                    >
                      ⬇ {ui.download}
                    </MediaInteractionLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 8. Sammlung */}
        {collectionItems.length > 0 ? (
          <section style={sectionCardStyle}>
            <CollectionPreview
              parentQrxId={qrxId}
              parentQrxTitle={companyName}
              items={collectionItems}
              locale={publicLocale}
              routeMode="root"
              labels={ui.collection}
              collectionTitle={entry.collection_title}
              collectionDescription={entry.collection_description}
            />
          </section>
        ) : null}

        {/* 9. Standort */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>{ui.location}</h2>
          <p style={simpleTextStyle}>{entry.location_name?.trim() ? entry.location_name : ui.noLocation}</p>

          {entry.location_lat != null && entry.location_lng != null ? (
            <p style={coordinateTextStyle}>
              {entry.location_lat}, {entry.location_lng}
            </p>
          ) : null}

          <div style={mapButtonWrapStyle}>
            {entry.location_lat != null && entry.location_lng != null ? (
              <a
                style={wideSecondaryButtonStyle}
                href={`https://www.google.com/maps?q=${entry.location_lat},${entry.location_lng}`}
                target="_blank"
                rel="noreferrer"
              >
                🗺️ {ui.googleMaps}
              </a>
            ) : null}

            {isBusiness && navigationUrl ? (
              <a style={wideSecondaryButtonStyle} href={navigationUrl} target="_blank" rel="noreferrer">
                🧭 {ui.navigationOpen}
              </a>
            ) : null}
          </div>
        </section>

        {/* 10. Transfer */}
        {isOwner ? (
          <section style={sectionCardStyle}>
            <h2 style={cardTitleStyle}>{ui.transfer}</h2>
            <p style={mutedTextStyle}>{ui.transferHint}</p>

            {transferHistory.length === 0 ? (
              <div style={emptyTransferStyle}>↔ {ui.noTransfer}</div>
            ) : (
              <div style={transferListStyle}>
                {transferHistory.map((item, index) => (
                  <div key={item.id ?? item.transfer_id ?? `${item.created_at}-${index}`} style={transferCardStyle}>
                    <div style={transferTopStyle}>
                      <strong>{item.status ?? "Transfer"}</strong>
                      <span>{formatDate(item.created_at, publicLocale)}</span>
                    </div>
                    {item.recipient_email ? <span>{ui.recipient}: {item.recipient_email}</span> : null}
                    {item.from_name ? <span>{ui.from}: {item.from_name}</span> : null}
                    {item.to_name ? <span>{ui.to}: {item.to_name}</span> : null}
                    {item.accepted_at ? <span>{ui.accepted}: {formatDate(item.accepted_at, publicLocale)}</span> : null}
                    {item.expires_at ? <span>{ui.expires}: {formatDate(item.expires_at, publicLocale)}</span> : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {/* 11. Gefolgt */}
        <section style={sectionCardStyle}>
          <h2 style={cardTitleStyle}>{ui.followed}</h2>

          {isOwner ? (
            <>
              <p style={mutedTextStyle}>{ui.ownerText}</p>
              <button type="button" disabled style={widePrimaryDisabledButtonStyle}>
                👑 {ui.ownQrx}
              </button>
            </>
          ) : currentUserId ? (
            <>
              <p style={mutedTextStyle}>
                {savedRow ? ui.savedText : ui.followHint}
              </p>

              <form action={toggleFollowAction}>
                <button type="submit" style={widePrimaryButtonStyle}>
                  {savedRow ? `🔖 ${ui.unfollow}` : `🔖 ${ui.follow}`}
                </button>
              </form>
            </>
          ) : (
            <>
              <p style={mutedTextStyle}>{ui.loginFollow}</p>
              <a href={`/${publicLocale}/login?next=${encodeURIComponent(`/qrx/${qrxId}`)}`} style={widePrimaryLinkStyle}>
                + {ui.follow}
              </a>
            </>
          )}

          <p style={centerInfoStyle}>
            {legacyInterpolate(
              Number(followerCount) === 1 ? ui.savedByOne : ui.savedByMany,
              { count: formatNumber(followerCount, publicLocale) },
            )}
          </p>
        </section>

        {/* 12. QR-X Code */}
        <section style={{ ...sectionCardStyle, textAlign: "center" }}>
          <QrxCodeCanvas
            value={publicQrxUrl}
            qrxId={qrxId}
                        locale={publicLocale}
variant={isBusiness ? "business" : "normal"}
            logoSrc="/logo-white.png"
          />
        </section>

        {/* 13. Inhalt melden */}
        <section style={sectionCardStyle}>
          <QrxReportForm qrxId={qrxId} locale={publicLocale} />
        </section>

        <div className={styles.footer}>mioseg qr • QR-X Web</div>
      </QrxPasswordGate>
    </main>
  );
}

const sectionCardStyle: CSSProperties = {
  width: "min(960px, calc(100% - 32px))",
  margin: "0 auto 20px",
  borderRadius: 26,
  padding: 22,
  background: "#0D1728",
  border: "1px solid rgba(59, 130, 246, 0.18)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
};

const heroShellStyle: CSSProperties = {
  width: "min(960px, calc(100% - 32px))",
  margin: "0 auto 20px",
};

const heroCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 26,
  minHeight: 390,
  background: "#0D1728",
  border: "1px solid rgba(59, 130, 246, 0.18)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
};

const heroCoverImageStyle: CSSProperties = {
  width: "100%",
  height: 316,
  objectFit: "cover",
  display: "block",
  filter: "brightness(0.72) blur(0.2px)",
};

const heroCoverFallbackStyle: CSSProperties = {
  minHeight: 316,
  background: "linear-gradient(135deg, #0D1728, #142236)",
};

const heroOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(6,12,21,0.08) 0%, rgba(6,12,21,0.3) 48%, rgba(6,12,21,0.82) 100%)",
};

const heroIdentityStyle: CSSProperties = {
  position: "absolute",
  left: 30,
  right: 30,
  bottom: 26,
  display: "flex",
  alignItems: "flex-end",
  gap: 24,
  flexWrap: "wrap",
};

const heroIdentityTextStyle: CSSProperties = {
  minWidth: 0,
  flex: "1 1 320px",
  paddingBottom: 8,
};

const heroBrandRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
  marginTop: 16,
};

const heroVerifiedBusinessBadgeStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 999,
  padding: "0 18px",
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  background: "rgba(8,17,29,0.88)",
  color: "#facc15",
  border: "1px solid rgba(250,204,21,0.74)",
  fontWeight: 900,
  fontSize: 13,
  letterSpacing: "0.03em",
  boxShadow: "0 12px 28px rgba(0,0,0,0.24)",
  backdropFilter: "blur(12px)",
};

const heroVerifiedBusinessIconStyle: CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  border: "1px solid currentColor",
  fontSize: 12,
};

const heroBusinessBadgeStyle: CSSProperties = {
  ...heroVerifiedBusinessBadgeStyle,
  color: "#fde68a",
};

const heroBrandDividerStyle: CSSProperties = {
  width: 1,
  height: 30,
  background: "rgba(250,204,21,0.68)",
};

const heroMiosegBrandStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 900,
  textShadow: "0 4px 14px rgba(0,0,0,0.4)",
};

const heroMiosegLogoStyle: CSSProperties = {
  width: 34,
  height: 34,
  objectFit: "contain",
  display: "block",
};

const profileCategoryHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: 18,
};




const heroLogoFrameStyle: CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: 22,
  overflow: "hidden",
  background: "#ffffff",
  border: "1px solid rgba(255,255,255,0.28)",
};

const heroLogoStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 24,
  lineHeight: 1.15,
  fontWeight: 800,
  textShadow: "0 8px 22px rgba(0,0,0,0.38)",
};

const normalHeroTitleStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "#ffffff",
  fontSize: 34,
  lineHeight: 1.1,
  fontWeight: 950,
};







const profileCategoryPillStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 999,
  padding: "0 14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.78)",
  display: "inline-flex",
  alignItems: "center",
  fontWeight: 700,
  fontSize: 14,
};

const profileStatsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
};

const profileStatBoxStyle: CSSProperties = {
  minHeight: 92,
  borderRadius: 20,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  display: "grid",
  placeItems: "center",
  gap: 3,
  color: "#ffffff",
  textAlign: "center",
};

const profileStatValueStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 800,
};

const profileStatLabelStyle: CSSProperties = {
  color: "rgba(255,255,255,0.55)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const profileActionsStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 24,
};

const actionChipStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 999,
  padding: "0 18px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 15,
};

const appButtonStyle: CSSProperties = {
  ...actionChipStyle,
  background: "#ffffff",
  color: "#0f172a",
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 22,
  lineHeight: 1.22,
  fontWeight: 800,
  letterSpacing: "-0.02em",
};


const simpleTextStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "rgba(255,255,255,0.86)",
  fontSize: 17,
  lineHeight: 1.55,
  fontWeight: 400,
};

const descriptionTextStyle: CSSProperties = {
  margin: "18px 0 0",
  color: "rgba(255,255,255,0.84)",
  fontSize: 16,
  lineHeight: 1.65,
  whiteSpace: "pre-wrap",
  fontWeight: 400,
};

const mutedTextStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "rgba(255,255,255,0.58)",
  fontSize: 15,
  lineHeight: 1.55,
};


const newsBoxStyle: CSSProperties = {
  marginTop: 18,
  borderRadius: 22,
  overflowY: "auto",
  overflowX: "hidden",
  maxHeight: 460,
  border: "1px solid rgba(65,84,103,0.75)",
  background: "rgba(255,255,255,0.025)",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(148,163,184,0.45) transparent",
  overscrollBehavior: "contain",
  paddingRight: 4,
};

const newsRowStyle: CSSProperties = {
  padding: "16px 18px",
};

const newsTextStyle: CSSProperties = {
  color: "rgba(255,255,255,0.86)",
  fontSize: 16,
  lineHeight: 1.55,
};

const newsDateStyle: CSSProperties = {
  marginTop: 8,
  color: "#8f9baa",
  fontSize: 14,
};

const imageGridStyle: CSSProperties = {
  marginTop: 22,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 22,
};

const imageItemStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: 8,
  color: "#9fc2ee",
  textDecoration: "none",
  textAlign: "center",
};

const imageThumbStyle: CSSProperties = {
  width: 112,
  height: 112,
  borderRadius: 18,
  objectFit: "cover",
  display: "block",
  boxShadow: "0 14px 30px rgba(0,0,0,0.24)",
};

const imageCaptionStyle: CSSProperties = {
  color: "#aeb9c6",
  fontSize: 14,
  wordBreak: "break-word",
  maxWidth: 150,
};

const imageOpenHintStyle: CSSProperties = {
  color: "#9fc2ee",
  fontSize: 13,
  lineHeight: 1.2,
};

const fileListStyle: CSSProperties = {
  marginTop: 18,
  display: "grid",
  gap: 10,
};

const fileRowStyle: CSSProperties = {
  minHeight: 56,
  borderRadius: 18,
  padding: "0 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e5edf5",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  fontWeight: 850,
};

const fileNameStyle: CSSProperties = {
  minWidth: 0,
  flex: "1 1 auto",
  wordBreak: "break-word",
};

const fileActionRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 8,
  flexWrap: "wrap",
};

const fileActionButtonStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 12,
  padding: "0 12px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#e5edf5",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 850,
  cursor: "pointer",
};

const fileDownloadButtonStyle: CSSProperties = {
  ...fileActionButtonStyle,
  background: "rgba(59,130,246,0.16)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#bfdbfe",
};

const coordinateTextStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "#8f9baa",
  fontSize: 16,
  lineHeight: 1.55,
};

const mapButtonWrapStyle: CSSProperties = {
  marginTop: 16,
  display: "grid",
  gap: 10,
};

const widePrimaryButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 58,
  borderRadius: 18,
  border: 0,
  padding: "0 18px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 18,
};

const widePrimaryDisabledButtonStyle: CSSProperties = {
  ...widePrimaryButtonStyle,
  cursor: "default",
  opacity: 0.88,
};

const widePrimaryLinkStyle: CSSProperties = {
  width: "100%",
  minHeight: 58,
  borderRadius: 18,
  padding: "0 18px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
};

const wideSecondaryButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 56,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "0 18px",
  background: "rgba(255,255,255,0.055)",
  color: "#ffffff",
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 17,
};

const emptyTransferStyle: CSSProperties = {
  marginTop: 16,
  borderRadius: 18,
  padding: 18,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(65,84,103,0.75)",
  color: "#9aa7b5",
  fontSize: 17,
};

const transferListStyle: CSSProperties = {
  marginTop: 16,
  display: "grid",
  gap: 12,
};

const transferCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
  display: "grid",
  gap: 6,
  fontSize: 13,
  fontWeight: 800,
};

const transferTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "#ffffff",
};

const centerInfoStyle: CSSProperties = {
  margin: "14px 0 0",
  textAlign: "center",
  color: "#9aa7b5",
  fontSize: 15,
};




const phaseBadgeRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 10,
};

const phaseCategoryBadgeStyle: CSSProperties = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.78)",
  fontSize: 13,
  fontWeight: 700,
  border: "1px solid rgba(255,255,255,0.08)",
};

const phaseVerifiedSoftBadgeStyle: CSSProperties = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(34,197,94,0.16)",
  color: "#bbf7d0",
  fontSize: 12,
  fontWeight: 950,
  border: "1px solid rgba(134,239,172,0.24)",
};
