import Image from "next/image";
import Link from "next/link";
import styles from "./home-page.module.css";

import LanguageSwitcher from "../../components/LanguageSwitcher";
import { defaultLocale, isValidLocale } from "../../i18n/config";
import { getDictionary } from "../../i18n/get-dictionary";


const PUBLIC_LOCALES = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;
type PublicLocale = (typeof PUBLIC_LOCALES)[number];

const HOME_HERO_COPY: Record<PublicLocale, {
  headline1: string;
  headline2: string;
  headline3: string;
  text: string;
  ctaExplore: string;
  navFeatures: string;
  navExplore: string;
  navUseCases: string;
  navPrices: string;
  miniScan: string;
  miniScanText: string;
  miniSave: string;
  miniSaveText: string;
  miniExplore: string;
  miniExploreText: string;
}> = {
  de: { headline1:"Scannen.", headline2:"Speichern.", headline3:"Wiederfinden.", text:"Mioseg qr macht QR-Codes intelligent. Speichere Orte, entdecke neue Möglichkeiten und bleibe immer up to date.", ctaExplore:"Explore entdecken", navFeatures:"Funktionen", navExplore:"Explore", navUseCases:"Use Cases", navPrices:"Preise", miniScan:"Scannen", miniScanText:"QR-Codes öffnen", miniSave:"Speichern", miniSaveText:"Nie wieder verlieren", miniExplore:"Entdecken", miniExploreText:"Orte, Menschen, Möglichkeiten" },
  en: { headline1:"Scan.", headline2:"Save.", headline3:"Find again.", text:"Mioseg qr makes QR codes intelligent. Save places, discover new possibilities and stay up to date.", ctaExplore:"Discover Explore", navFeatures:"Features", navExplore:"Explore", navUseCases:"Use Cases", navPrices:"Prices", miniScan:"Scan", miniScanText:"Open QR codes", miniSave:"Save", miniSaveText:"Never lose them again", miniExplore:"Discover", miniExploreText:"Places, people, possibilities" },
  tr: { headline1:"Tara.", headline2:"Kaydet.", headline3:"Yeniden bul.", text:"Mioseg qr, QR kodlarını akıllı hale getirir. Yerleri kaydet, yeni olanakları keşfet ve her zaman güncel kal.", ctaExplore:"Explore'u keşfet", navFeatures:"Özellikler", navExplore:"Explore", navUseCases:"Kullanım alanları", navPrices:"Fiyatlar", miniScan:"Tara", miniScanText:"QR kodlarını aç", miniSave:"Kaydet", miniSaveText:"Bir daha kaybetme", miniExplore:"Keşfet", miniExploreText:"Yerler, insanlar, olanaklar" },
  pl: { headline1:"Skanuj.", headline2:"Zapisuj.", headline3:"Odnajduj.", text:"Mioseg qr sprawia, że kody QR stają się inteligentne. Zapisuj miejsca, odkrywaj nowe możliwości i bądź zawsze na bieżąco.", ctaExplore:"Odkryj Explore", navFeatures:"Funkcje", navExplore:"Explore", navUseCases:"Zastosowania", navPrices:"Ceny", miniScan:"Skanuj", miniScanText:"Otwieraj kody QR", miniSave:"Zapisuj", miniSaveText:"Nigdy więcej nie zgub", miniExplore:"Odkrywaj", miniExploreText:"Miejsca, ludzie, możliwości" },
  ar: { headline1:"امسح.", headline2:"احفظ.", headline3:"اعثر عليه مجددًا.", text:"يجعل mioseg qr رموز QR أكثر ذكاءً. احفظ الأماكن، واكتشف إمكانيات جديدة، وابقَ على اطلاع دائم.", ctaExplore:"اكتشف Explore", navFeatures:"الميزات", navExplore:"Explore", navUseCases:"حالات الاستخدام", navPrices:"الأسعار", miniScan:"مسح", miniScanText:"فتح رموز QR", miniSave:"حفظ", miniSaveText:"لن تفقدها مجددًا", miniExplore:"اكتشاف", miniExploreText:"أماكن، أشخاص، إمكانيات" },
  fr: { headline1:"Scannez.", headline2:"Enregistrez.", headline3:"Retrouvez.", text:"Mioseg qr rend les QR codes intelligents. Enregistrez des lieux, découvrez de nouvelles possibilités et restez toujours à jour.", ctaExplore:"Découvrir Explore", navFeatures:"Fonctions", navExplore:"Explore", navUseCases:"Cas d’usage", navPrices:"Tarifs", miniScan:"Scanner", miniScanText:"Ouvrir des QR codes", miniSave:"Enregistrer", miniSaveText:"Ne plus jamais les perdre", miniExplore:"Découvrir", miniExploreText:"Lieux, personnes, possibilités" },
  es: { headline1:"Escanea.", headline2:"Guarda.", headline3:"Encuentra.", text:"Mioseg qr hace que los códigos QR sean inteligentes. Guarda lugares, descubre nuevas posibilidades y mantente siempre al día.", ctaExplore:"Descubrir Explore", navFeatures:"Funciones", navExplore:"Explore", navUseCases:"Casos de uso", navPrices:"Precios", miniScan:"Escanear", miniScanText:"Abrir códigos QR", miniSave:"Guardar", miniSaveText:"No volver a perderlos", miniExplore:"Descubrir", miniExploreText:"Lugares, personas, posibilidades" },
  it: { headline1:"Scansiona.", headline2:"Salva.", headline3:"Ritrova.", text:"Mioseg qr rende intelligenti i codici QR. Salva luoghi, scopri nuove possibilità e rimani sempre aggiornato.", ctaExplore:"Scopri Explore", navFeatures:"Funzioni", navExplore:"Explore", navUseCases:"Casi d’uso", navPrices:"Prezzi", miniScan:"Scansiona", miniScanText:"Apri codici QR", miniSave:"Salva", miniSaveText:"Non perderli mai più", miniExplore:"Scopri", miniExploreText:"Luoghi, persone, possibilità" },
};

const HOME_PUBLIC_UI: Record<PublicLocale, {
  heroImageAlt: string;
  useCasesEyebrow: string;
  useCasesTitle: string;
  exploreTitle: string;
  exploreText: string;
  nearby: string;
  discoverPlaces: string;
  localOffers: string;
  supportCommunity: string;
  viewExplore: string;
  restaurant: string;
  passwordTitle: string;
  passwordText: string;
  currentTitle: string;
  currentText: string;
  organizeTitle: string;
  organizeText: string;
  nearbyText: string;
}> = {
  de: { heroImageAlt:"Person scannt einen Mioseg QR-Code", useCasesEyebrow:"Für jede Situation gemacht", useCasesTitle:"QR-X verbindet echte Orte mit digitalen Inhalten.", exploreTitle:"Entdecke, was um dich herum passiert.", exploreText:"Oder mache dein Unternehmen, Event oder Projekt sichtbar. Explore zeigt QR-X auf einer Karte und verbindet Menschen mit Orten, Angeboten und Möglichkeiten.", nearby:"In deiner Nähe", discoverPlaces:"Orte entdecken", localOffers:"Lokale Angebote", supportCommunity:"Gemeinde stärken", viewExplore:"Explore ansehen", restaurant:"Gastronomie", passwordTitle:"Passwortschutz", passwordText:"Schütze private QR-X mit einem Passwort.", currentTitle:"Immer aktuell", currentText:"Änderungen bleiben sofort sichtbar.", organizeTitle:"Speichern & organisieren", organizeText:"Ordner, Karte und Verlauf bleiben übersichtlich.", nearbyText:"Entdecke Möglichkeiten in deiner Nähe." },
  en: { heroImageAlt:"Person scanning a Mioseg QR code", useCasesEyebrow:"Made for every situation", useCasesTitle:"QR-X connects real places with digital content.", exploreTitle:"Discover what is happening around you.", exploreText:"Or make your business, event or project visible. Explore shows QR-X on a map and connects people with places, offers and possibilities.", nearby:"Nearby", discoverPlaces:"Discover places", localOffers:"Local offers", supportCommunity:"Support your community", viewExplore:"View Explore", restaurant:"Restaurant", passwordTitle:"Password protection", passwordText:"Protect private QR-X with a password.", currentTitle:"Always up to date", currentText:"Changes stay instantly visible.", organizeTitle:"Save & organize", organizeText:"Folders, map and history stay organized.", nearbyText:"Discover opportunities nearby." },
  tr: { heroImageAlt:"Mioseg QR kodunu tarayan kişi", useCasesEyebrow:"Her durum için tasarlandı", useCasesTitle:"QR-X gerçek yerleri dijital içeriklerle buluşturur.", exploreTitle:"Çevrende neler olduğunu keşfet.", exploreText:"İşletmeni, etkinliğini veya projenizi görünür hale getir. Explore, QR-X'leri haritada gösterir ve insanları yerler, teklifler ve olanaklarla buluşturur.", nearby:"Yakınında", discoverPlaces:"Yerleri keşfet", localOffers:"Yerel teklifler", supportCommunity:"Topluluğunu destekle", viewExplore:"Explore'u görüntüle", restaurant:"Gastronomi", passwordTitle:"Şifre koruması", passwordText:"Özel QR-X'lerini bir şifreyle koru.", currentTitle:"Her zaman güncel", currentText:"Değişiklikler anında görünür.", organizeTitle:"Kaydet ve düzenle", organizeText:"Klasörler, harita ve geçmiş düzenli kalır.", nearbyText:"Yakınındaki olanakları keşfet." },
  pl: { heroImageAlt:"Osoba skanująca kod Mioseg QR", useCasesEyebrow:"Do każdej sytuacji", useCasesTitle:"QR-X łączy prawdziwe miejsca z treściami cyfrowymi.", exploreTitle:"Odkryj, co dzieje się wokół Ciebie.", exploreText:"Możesz też zwiększyć widoczność swojej firmy, wydarzenia lub projektu. Explore pokazuje QR-X na mapie i łączy ludzi z miejscami, ofertami i możliwościami.", nearby:"W pobliżu", discoverPlaces:"Odkrywaj miejsca", localOffers:"Lokalne oferty", supportCommunity:"Wspieraj społeczność", viewExplore:"Zobacz Explore", restaurant:"Gastronomia", passwordTitle:"Ochrona hasłem", passwordText:"Chroń prywatne QR-X za pomocą hasła.", currentTitle:"Zawsze aktualne", currentText:"Zmiany są od razu widoczne.", organizeTitle:"Zapisuj i organizuj", organizeText:"Foldery, mapa i historia pozostają uporządkowane.", nearbyText:"Odkrywaj możliwości w swojej okolicy." },
  ar: { heroImageAlt:"شخص يمسح رمز Mioseg QR", useCasesEyebrow:"مصمم لكل موقف", useCasesTitle:"يربط QR-X الأماكن الحقيقية بالمحتوى الرقمي.", exploreTitle:"اكتشف ما يحدث من حولك.", exploreText:"أو اجعل شركتك أو فعاليتك أو مشروعك ظاهرًا. يعرض Explore رموز QR-X على الخريطة ويربط الأشخاص بالأماكن والعروض والإمكانيات.", nearby:"بالقرب منك", discoverPlaces:"اكتشف الأماكن", localOffers:"عروض محلية", supportCommunity:"ادعم مجتمعك", viewExplore:"عرض Explore", restaurant:"مطاعم", passwordTitle:"حماية بكلمة مرور", passwordText:"احمِ QR-X الخاصة بك بكلمة مرور.", currentTitle:"محدّث دائمًا", currentText:"تظهر التغييرات فورًا.", organizeTitle:"حفظ وتنظيم", organizeText:"تبقى المجلدات والخريطة والسجل منظمين.", nearbyText:"اكتشف الإمكانيات القريبة منك." },
  fr: { heroImageAlt:"Personne scannant un code Mioseg QR", useCasesEyebrow:"Conçu pour chaque situation", useCasesTitle:"QR-X relie les lieux réels aux contenus numériques.", exploreTitle:"Découvrez ce qui se passe autour de vous.", exploreText:"Ou rendez votre entreprise, événement ou projet visible. Explore affiche les QR-X sur une carte et relie les personnes aux lieux, offres et possibilités.", nearby:"À proximité", discoverPlaces:"Découvrir des lieux", localOffers:"Offres locales", supportCommunity:"Soutenir la communauté", viewExplore:"Voir Explore", restaurant:"Gastronomie", passwordTitle:"Protection par mot de passe", passwordText:"Protégez les QR-X privés avec un mot de passe.", currentTitle:"Toujours à jour", currentText:"Les modifications sont visibles immédiatement.", organizeTitle:"Enregistrer et organiser", organizeText:"Dossiers, carte et historique restent bien organisés.", nearbyText:"Découvrez des possibilités près de chez vous." },
  es: { heroImageAlt:"Persona escaneando un código Mioseg QR", useCasesEyebrow:"Hecho para cada situación", useCasesTitle:"QR-X conecta lugares reales con contenido digital.", exploreTitle:"Descubre lo que ocurre a tu alrededor.", exploreText:"O haz visible tu empresa, evento o proyecto. Explore muestra QR-X en un mapa y conecta a las personas con lugares, ofertas y posibilidades.", nearby:"Cerca de ti", discoverPlaces:"Descubrir lugares", localOffers:"Ofertas locales", supportCommunity:"Apoya a tu comunidad", viewExplore:"Ver Explore", restaurant:"Gastronomía", passwordTitle:"Protección con contraseña", passwordText:"Protege los QR-X privados con una contraseña.", currentTitle:"Siempre actualizado", currentText:"Los cambios se muestran inmediatamente.", organizeTitle:"Guardar y organizar", organizeText:"Carpetas, mapa e historial se mantienen organizados.", nearbyText:"Descubre posibilidades cerca de ti." },
  it: { heroImageAlt:"Persona che scansiona un codice Mioseg QR", useCasesEyebrow:"Pensato per ogni situazione", useCasesTitle:"QR-X collega luoghi reali a contenuti digitali.", exploreTitle:"Scopri cosa succede intorno a te.", exploreText:"Oppure rendi visibile la tua azienda, evento o progetto. Explore mostra i QR-X su una mappa e collega le persone a luoghi, offerte e possibilità.", nearby:"Nelle vicinanze", discoverPlaces:"Scopri luoghi", localOffers:"Offerte locali", supportCommunity:"Sostieni la comunità", viewExplore:"Visualizza Explore", restaurant:"Gastronomia", passwordTitle:"Protezione con password", passwordText:"Proteggi i QR-X privati con una password.", currentTitle:"Sempre aggiornato", currentText:"Le modifiche sono subito visibili.", organizeTitle:"Salva e organizza", organizeText:"Cartelle, mappa e cronologia restano ordinate.", nearbyText:"Scopri opportunità vicino a te." },
};

const PROFESSIONAL_USE_CASE_TEXT: Record<PublicLocale, Array<{icon:string;title:string;text:string;image:string}>> = {
  de: [],
  en: [],
  tr: [],
  pl: [],
  ar: [],
  fr: [],
  es: [],
  it: [],
};


const HOME_RELEASE_COPY: Record<PublicLocale, {
  videoEyebrow: string;
  videoTitle: string;
  videoText: string;
  videoHint: string;
  qrxEyebrow: string;
  qrxTitle: string;
  qrxText: string;
  qrxMedia: string;
  qrxUpdates: string;
  qrxLocation: string;
  qrxActions: string;
  pricingEyebrow: string;
  pricingTitle: string;
  pricingText: string;
  pricingPoint1: string;
  pricingPoint2: string;
  pricingPoint3: string;
  pricingCta: string;
  finalTitle: string;
  finalText: string;
  finalExplore: string;
  finalApp: string;
  footerPrivacy: string;
  footerTerms: string;
}> = {
  de: {
    videoEyebrow: "Mioseg qr erleben",
    videoTitle: "Mioseg qr in 60 Sekunden.",
    videoText: "Sieh, wie aus einem einfachen QR-Code ein dynamischer QR-X wird – vom Scannen und Speichern bis zu Updates, Karte und direktem Kontakt.",
    videoHint: "Das finale Promo-Video wird hier direkt eingebunden.",
    qrxEyebrow: "Was ist ein QR-X?",
    qrxTitle: "Mehr als ein QR-Code.",
    qrxText: "Ein QR-X verbindet einen QR-Code mit Inhalten, die du später aktualisieren kannst. Nutzer öffnen denselben Code und sehen weiterhin die aktuellen Informationen.",
    qrxMedia: "Bilder & Dateien",
    qrxUpdates: "News & Updates",
    qrxLocation: "Standort & Karte",
    qrxActions: "Kontakt & Aktionen",
    pricingEyebrow: "Einfaches Modell",
    pricingTitle: "Credits statt Abo-Pflicht.",
    pricingText: "Mioseg qr setzt auf Credits für kostenpflichtige Funktionen. So entstehen nicht automatisch jeden Monat neue Gebühren.",
    pricingPoint1: "Kein verpflichtendes Monatsabo",
    pricingPoint2: "Credits nur bei Bedarf einsetzen",
    pricingPoint3: "App und Web mit demselben Konto",
    pricingCta: "Konto starten",
    finalTitle: "Bereit für deinen ersten QR-X?",
    finalText: "Entdecke Mioseg qr im Browser oder nutze die App, sobald sie in den Stores verfügbar ist.",
    finalExplore: "Explore öffnen",
    finalApp: "App ansehen",
    footerPrivacy: "Datenschutz",
    footerTerms: "Nutzungsbedingungen",
  },
  en: {
    videoEyebrow: "Experience Mioseg qr",
    videoTitle: "Mioseg qr in 60 seconds.",
    videoText: "See how a simple QR code becomes a dynamic QR-X — from scanning and saving to updates, map context and direct actions.",
    videoHint: "The final promotional video will be embedded here.",
    qrxEyebrow: "What is a QR-X?",
    qrxTitle: "More than a QR code.",
    qrxText: "A QR-X connects a QR code with content you can update later. People open the same code and continue to see the latest information.",
    qrxMedia: "Images & files",
    qrxUpdates: "News & updates",
    qrxLocation: "Location & map",
    qrxActions: "Contact & actions",
    pricingEyebrow: "Simple model",
    pricingTitle: "Credits instead of a required subscription.",
    pricingText: "Mioseg qr uses Credits for paid features, so new monthly charges are not created automatically.",
    pricingPoint1: "No mandatory monthly subscription",
    pricingPoint2: "Use Credits only when needed",
    pricingPoint3: "One account for app and web",
    pricingCta: "Start account",
    finalTitle: "Ready for your first QR-X?",
    finalText: "Explore Mioseg qr in the browser or use the app once it is available in the stores.",
    finalExplore: "Open Explore",
    finalApp: "View app",
    footerPrivacy: "Privacy",
    footerTerms: "Terms of Use",
  },
  tr: {
    videoEyebrow: "Mioseg qr'ı keşfet",
    videoTitle: "60 saniyede Mioseg qr.",
    videoText: "Basit bir QR kodunun; tarama, kaydetme, güncellemeler, harita ve doğrudan işlemlerle nasıl dinamik bir QR-X'e dönüştüğünü gör.",
    videoHint: "Nihai tanıtım videosu burada doğrudan gösterilecek.",
    qrxEyebrow: "QR-X nedir?",
    qrxTitle: "Bir QR kodundan daha fazlası.",
    qrxText: "QR-X, bir QR kodunu daha sonra güncelleyebileceğin içeriklerle birleştirir. Kullanıcılar aynı kodu açar ve güncel bilgileri görmeye devam eder.",
    qrxMedia: "Görseller ve dosyalar",
    qrxUpdates: "Haberler ve güncellemeler",
    qrxLocation: "Konum ve harita",
    qrxActions: "İletişim ve işlemler",
    pricingEyebrow: "Basit model",
    pricingTitle: "Zorunlu abonelik yerine Credits.",
    pricingText: "Mioseg qr ücretli özellikler için Credits kullanır. Böylece her ay otomatik olarak yeni ücret oluşmaz.",
    pricingPoint1: "Zorunlu aylık abonelik yok",
    pricingPoint2: "Credits'i yalnızca gerektiğinde kullan",
    pricingPoint3: "Uygulama ve web için tek hesap",
    pricingCta: "Hesap oluştur",
    finalTitle: "İlk QR-X'in için hazır mısın?",
    finalText: "Mioseg qr'ı tarayıcıda keşfet veya mağazalarda yayınlandığında uygulamayı kullan.",
    finalExplore: "Explore'u aç",
    finalApp: "Uygulamayı gör",
    footerPrivacy: "Gizlilik",
    footerTerms: "Kullanım Koşulları",
  },
  pl: {
    videoEyebrow: "Poznaj Mioseg qr",
    videoTitle: "Mioseg qr w 60 sekund.",
    videoText: "Zobacz, jak zwykły kod QR staje się dynamicznym QR-X — od skanowania i zapisywania po aktualizacje, mapę i bezpośrednie działania.",
    videoHint: "Finalny film promocyjny zostanie osadzony bezpośrednio tutaj.",
    qrxEyebrow: "Czym jest QR-X?",
    qrxTitle: "Więcej niż kod QR.",
    qrxText: "QR-X łączy kod QR z treściami, które możesz później aktualizować. Użytkownicy otwierają ten sam kod i nadal widzą aktualne informacje.",
    qrxMedia: "Obrazy i pliki",
    qrxUpdates: "Aktualności",
    qrxLocation: "Lokalizacja i mapa",
    qrxActions: "Kontakt i działania",
    pricingEyebrow: "Prosty model",
    pricingTitle: "Credits zamiast obowiązkowego abonamentu.",
    pricingText: "Mioseg qr korzysta z Credits dla płatnych funkcji, dzięki czemu opłaty nie naliczają się automatycznie co miesiąc.",
    pricingPoint1: "Brak obowiązkowego abonamentu miesięcznego",
    pricingPoint2: "Używaj Credits tylko wtedy, gdy ich potrzebujesz",
    pricingPoint3: "Jedno konto dla aplikacji i wersji webowej",
    pricingCta: "Załóż konto",
    finalTitle: "Gotowy na swój pierwszy QR-X?",
    finalText: "Poznaj Mioseg qr w przeglądarce lub skorzystaj z aplikacji, gdy pojawi się w sklepach.",
    finalExplore: "Otwórz Explore",
    finalApp: "Zobacz aplikację",
    footerPrivacy: "Prywatność",
    footerTerms: "Warunki korzystania",
  },
  ar: {
    videoEyebrow: "اكتشف Mioseg qr",
    videoTitle: "Mioseg qr في 60 ثانية.",
    videoText: "شاهد كيف يتحول رمز QR بسيط إلى QR-X ديناميكي، من المسح والحفظ إلى التحديثات والخريطة والإجراءات المباشرة.",
    videoHint: "سيتم تضمين الفيديو الترويجي النهائي هنا مباشرة.",
    qrxEyebrow: "ما هو QR-X؟",
    qrxTitle: "أكثر من مجرد رمز QR.",
    qrxText: "يربط QR-X رمز QR بمحتوى يمكنك تحديثه لاحقًا. يفتح المستخدمون الرمز نفسه ويستمرون في رؤية أحدث المعلومات.",
    qrxMedia: "الصور والملفات",
    qrxUpdates: "الأخبار والتحديثات",
    qrxLocation: "الموقع والخريطة",
    qrxActions: "الاتصال والإجراءات",
    pricingEyebrow: "نموذج بسيط",
    pricingTitle: "Credits بدل الاشتراك الإلزامي.",
    pricingText: "يستخدم Mioseg qr نظام Credits للوظائف المدفوعة، لذلك لا تُنشأ رسوم شهرية جديدة تلقائيًا.",
    pricingPoint1: "لا يوجد اشتراك شهري إلزامي",
    pricingPoint2: "استخدم Credits عند الحاجة فقط",
    pricingPoint3: "حساب واحد للتطبيق والويب",
    pricingCta: "ابدأ حسابك",
    finalTitle: "هل أنت جاهز لأول QR-X؟",
    finalText: "اكتشف Mioseg qr في المتصفح أو استخدم التطبيق عند توفره في المتاجر.",
    finalExplore: "فتح Explore",
    finalApp: "عرض التطبيق",
    footerPrivacy: "الخصوصية",
    footerTerms: "شروط الاستخدام",
  },
  fr: {
    videoEyebrow: "Découvrir Mioseg qr",
    videoTitle: "Mioseg qr en 60 secondes.",
    videoText: "Découvrez comment un simple QR code devient un QR-X dynamique, du scan et de l’enregistrement aux mises à jour, à la carte et aux actions directes.",
    videoHint: "La vidéo promotionnelle finale sera intégrée directement ici.",
    qrxEyebrow: "Qu’est-ce qu’un QR-X ?",
    qrxTitle: "Bien plus qu’un QR code.",
    qrxText: "Un QR-X relie un QR code à des contenus que vous pouvez mettre à jour plus tard. Les utilisateurs ouvrent le même code et voient toujours les informations actuelles.",
    qrxMedia: "Images & fichiers",
    qrxUpdates: "Actualités",
    qrxLocation: "Lieu & carte",
    qrxActions: "Contact & actions",
    pricingEyebrow: "Modèle simple",
    pricingTitle: "Des Credits plutôt qu’un abonnement obligatoire.",
    pricingText: "Mioseg qr utilise des Credits pour les fonctions payantes, afin d’éviter des frais mensuels automatiques.",
    pricingPoint1: "Aucun abonnement mensuel obligatoire",
    pricingPoint2: "Utilisez des Credits uniquement si nécessaire",
    pricingPoint3: "Un seul compte pour l’app et le web",
    pricingCta: "Créer un compte",
    finalTitle: "Prêt pour votre premier QR-X ?",
    finalText: "Découvrez Mioseg qr dans le navigateur ou utilisez l’application dès sa disponibilité dans les stores.",
    finalExplore: "Ouvrir Explore",
    finalApp: "Voir l’application",
    footerPrivacy: "Confidentialité",
    footerTerms: "Conditions d’utilisation",
  },
  es: {
    videoEyebrow: "Descubre Mioseg qr",
    videoTitle: "Mioseg qr en 60 segundos.",
    videoText: "Descubre cómo un simple código QR se convierte en un QR-X dinámico: desde escanear y guardar hasta actualizaciones, mapa y acciones directas.",
    videoHint: "El vídeo promocional final se integrará directamente aquí.",
    qrxEyebrow: "¿Qué es un QR-X?",
    qrxTitle: "Mucho más que un código QR.",
    qrxText: "Un QR-X conecta un código QR con contenido que puedes actualizar más adelante. Los usuarios abren el mismo código y siguen viendo la información actual.",
    qrxMedia: "Imágenes y archivos",
    qrxUpdates: "Noticias y actualizaciones",
    qrxLocation: "Ubicación y mapa",
    qrxActions: "Contacto y acciones",
    pricingEyebrow: "Modelo sencillo",
    pricingTitle: "Credits en lugar de una suscripción obligatoria.",
    pricingText: "Mioseg qr utiliza Credits para las funciones de pago, evitando que se generen automáticamente nuevos cargos mensuales.",
    pricingPoint1: "Sin suscripción mensual obligatoria",
    pricingPoint2: "Usa Credits solo cuando los necesites",
    pricingPoint3: "Una cuenta para app y web",
    pricingCta: "Crear cuenta",
    finalTitle: "¿Listo para tu primer QR-X?",
    finalText: "Descubre Mioseg qr en el navegador o utiliza la app cuando esté disponible en las tiendas.",
    finalExplore: "Abrir Explore",
    finalApp: "Ver app",
    footerPrivacy: "Privacidad",
    footerTerms: "Términos de uso",
  },
  it: {
    videoEyebrow: "Scopri Mioseg qr",
    videoTitle: "Mioseg qr in 60 secondi.",
    videoText: "Scopri come un semplice codice QR diventa un QR-X dinamico: dalla scansione e dal salvataggio agli aggiornamenti, alla mappa e alle azioni dirette.",
    videoHint: "Il video promozionale finale verrà integrato direttamente qui.",
    qrxEyebrow: "Cos’è un QR-X?",
    qrxTitle: "Molto più di un codice QR.",
    qrxText: "Un QR-X collega un codice QR a contenuti che puoi aggiornare in seguito. Gli utenti aprono lo stesso codice e continuano a vedere le informazioni aggiornate.",
    qrxMedia: "Immagini e file",
    qrxUpdates: "Notizie e aggiornamenti",
    qrxLocation: "Posizione e mappa",
    qrxActions: "Contatti e azioni",
    pricingEyebrow: "Modello semplice",
    pricingTitle: "Credits invece di un abbonamento obbligatorio.",
    pricingText: "Mioseg qr utilizza Credits per le funzioni a pagamento, evitando nuovi addebiti mensili automatici.",
    pricingPoint1: "Nessun abbonamento mensile obbligatorio",
    pricingPoint2: "Usa Credits solo quando servono",
    pricingPoint3: "Un account per app e web",
    pricingCta: "Crea account",
    finalTitle: "Pronto per il tuo primo QR-X?",
    finalText: "Scopri Mioseg qr nel browser o usa l’app quando sarà disponibile negli store.",
    finalExplore: "Apri Explore",
    finalApp: "Vedi app",
    footerPrivacy: "Privacy",
    footerTerms: "Termini di utilizzo",
  },
};

const PROMO_VIDEO_SRC = "/landing/mioseg-qr-promo.mp4";

function publicLocale(value: string): PublicLocale {
  return PUBLIC_LOCALES.includes(value as PublicLocale) ? (value as PublicLocale) : "en";
}


type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Home({ params }: Props) {
  const resolvedParams = await params;
  const locale = isValidLocale(resolvedParams.locale)
    ? resolvedParams.locale
    : defaultLocale;

  const t = getDictionary(locale);
  const landingImages = {
    heroScan: "/landing/hero-scan.png",
    heroPhone: "/landing/hero-phone-map.png",
    realEstate: "/landing/usecase-real-estate.png",
    restaurant: "/landing/usecase-restaurant.png",
    business: "/landing/usecase-business.png",
    event: "/landing/usecase-event.png",
    school: "/landing/usecase-school.png",
    fitness: "/landing/usecase-fitness.png",
    creator: "/landing/usecase-creator.png",
    tourism: "/landing/usecase-tourism.png",
  };

  const publicLanguage = publicLocale(locale);
  const heroCopy = HOME_HERO_COPY[publicLanguage];
  const publicUi = HOME_PUBLIC_UI[publicLanguage];
  const releaseCopy = HOME_RELEASE_COPY[publicLanguage];

  const professionalUseCases = {
    de: [
      ["🏠","Immobilien","Exposés, Dokumente und Kontakte digital teilen.",landingImages.realEstate],
      ["🍽️","Gastronomie","Speisekarten, Aktionen und Reservierungslinks.",landingImages.restaurant],
      ["💼","Unternehmen","Produkte, Angebote und Infos für deine Kunden.",landingImages.business],
      ["🎟️","Events","Tickets, Infos und Updates – alles an einem Ort.",landingImages.event],
      ["🎓","Schule & Campus","Pläne, Räume, AGs und Infos schnell digital finden.",landingImages.school],
      ["🏋️","Fitness & Vereine","Kurse, Trainingszeiten und Community-Infos teilen.",landingImages.fitness],
      ["🎬","Creator & Shops","Profile, Produkte, Videos und Aktionen sichtbar machen.",landingImages.creator],
      ["📸","Tourismus","Sehenswürdigkeiten, Routen und lokale Tipps entdecken.",landingImages.tourism],
    ],
    en: [
      ["🏠","Real estate","Share exposés, documents and contacts digitally.",landingImages.realEstate],
      ["🍽️","Restaurants","Menus, offers and booking links.",landingImages.restaurant],
      ["💼","Business","Products, offers and information for your customers.",landingImages.business],
      ["🎟️","Events","Tickets, information and updates — all in one place.",landingImages.event],
      ["🎓","School & campus","Plans, rooms, clubs and info quickly available digitally.",landingImages.school],
      ["🏋️","Fitness & clubs","Share classes, training times and community updates.",landingImages.fitness],
      ["🎬","Creators & shops","Make profiles, products, videos and campaigns visible.",landingImages.creator],
      ["📸","Tourism","Discover sights, routes and local tips.",landingImages.tourism],
    ],
    tr: [
      ["🏠","Gayrimenkul","İlanları, belgeleri ve iletişim bilgilerini dijital olarak paylaş.",landingImages.realEstate],
      ["🍽️","Gastronomi","Menüler, kampanyalar ve rezervasyon bağlantıları.",landingImages.restaurant],
      ["💼","İşletmeler","Ürünleri, teklifleri ve müşteri bilgilerini paylaş.",landingImages.business],
      ["🎟️","Etkinlikler","Biletler, bilgiler ve güncellemeler tek yerde.",landingImages.event],
      ["🎓","Okul & kampüs","Planları, odaları, kulüpleri ve bilgileri hızlıca dijital bul.",landingImages.school],
      ["🏋️","Fitness & kulüpler","Dersleri, antrenman saatlerini ve topluluk bilgilerini paylaş.",landingImages.fitness],
      ["🎬","İçerik üreticileri & mağazalar","Profilleri, ürünleri, videoları ve kampanyaları görünür yap.",landingImages.creator],
      ["📸","Turizm","Gezilecek yerleri, rotaları ve yerel ipuçlarını keşfet.",landingImages.tourism],
    ],
    pl: [
      ["🏠","Nieruchomości","Udostępniaj cyfrowo oferty, dokumenty i kontakty.",landingImages.realEstate],
      ["🍽️","Gastronomia","Menu, promocje i linki do rezerwacji.",landingImages.restaurant],
      ["💼","Firmy","Produkty, oferty i informacje dla klientów.",landingImages.business],
      ["🎟️","Wydarzenia","Bilety, informacje i aktualizacje — wszystko w jednym miejscu.",landingImages.event],
      ["🎓","Szkoła i kampus","Plany, sale, zajęcia i informacje szybko dostępne cyfrowo.",landingImages.school],
      ["🏋️","Fitness i kluby","Udostępniaj zajęcia, godziny treningów i informacje społeczności.",landingImages.fitness],
      ["🎬","Twórcy i sklepy","Pokazuj profile, produkty, filmy i akcje.",landingImages.creator],
      ["📸","Turystyka","Odkrywaj atrakcje, trasy i lokalne wskazówki.",landingImages.tourism],
    ],
    ar: [
      ["🏠","العقارات","شارك العروض والمستندات وبيانات الاتصال رقميًا.",landingImages.realEstate],
      ["🍽️","المطاعم","القوائم والعروض وروابط الحجز.",landingImages.restaurant],
      ["💼","الأعمال","المنتجات والعروض والمعلومات لعملائك.",landingImages.business],
      ["🎟️","الفعاليات","التذاكر والمعلومات والتحديثات — في مكان واحد.",landingImages.event],
      ["🎓","المدرسة والحرم الجامعي","الخطط والغرف والأنشطة والمعلومات متاحة رقميًا بسرعة.",landingImages.school],
      ["🏋️","اللياقة والأندية","شارك الدورات وأوقات التدريب ومعلومات المجتمع.",landingImages.fitness],
      ["🎬","صناع المحتوى والمتاجر","اعرض الملفات والمنتجات والفيديوهات والحملات.",landingImages.creator],
      ["📸","السياحة","اكتشف المعالم والمسارات والنصائح المحلية.",landingImages.tourism],
    ],
    fr: [
      ["🏠","Immobilier","Partagez numériquement exposés, documents et contacts.",landingImages.realEstate],
      ["🍽️","Gastronomie","Menus, offres et liens de réservation.",landingImages.restaurant],
      ["💼","Entreprises","Produits, offres et informations pour vos clients.",landingImages.business],
      ["🎟️","Événements","Billets, informations et mises à jour — au même endroit.",landingImages.event],
      ["🎓","École & campus","Plans, salles, activités et informations rapidement accessibles.",landingImages.school],
      ["🏋️","Fitness & associations","Partagez cours, horaires et informations de communauté.",landingImages.fitness],
      ["🎬","Créateurs & boutiques","Rendez visibles profils, produits, vidéos et campagnes.",landingImages.creator],
      ["📸","Tourisme","Découvrez sites, itinéraires et conseils locaux.",landingImages.tourism],
    ],
    es: [
      ["🏠","Inmobiliaria","Comparte exposés, documentos y contactos de forma digital.",landingImages.realEstate],
      ["🍽️","Gastronomía","Menús, ofertas y enlaces de reserva.",landingImages.restaurant],
      ["💼","Empresas","Productos, ofertas e información para tus clientes.",landingImages.business],
      ["🎟️","Eventos","Entradas, información y actualizaciones — todo en un mismo lugar.",landingImages.event],
      ["🎓","Escuela y campus","Planos, salas, actividades e información disponibles rápidamente.",landingImages.school],
      ["🏋️","Fitness y clubes","Comparte clases, horarios de entrenamiento e información de la comunidad.",landingImages.fitness],
      ["🎬","Creadores y tiendas","Haz visibles perfiles, productos, vídeos y campañas.",landingImages.creator],
      ["📸","Turismo","Descubre lugares de interés, rutas y consejos locales.",landingImages.tourism],
    ],
    it: [
      ["🏠","Immobiliare","Condividi digitalmente exposé, documenti e contatti.",landingImages.realEstate],
      ["🍽️","Gastronomia","Menu, offerte e link di prenotazione.",landingImages.restaurant],
      ["💼","Aziende","Prodotti, offerte e informazioni per i tuoi clienti.",landingImages.business],
      ["🎟️","Eventi","Biglietti, informazioni e aggiornamenti — tutto in un unico posto.",landingImages.event],
      ["🎓","Scuola e campus","Mappe, stanze, attività e informazioni disponibili rapidamente.",landingImages.school],
      ["🏋️","Fitness e associazioni","Condividi corsi, orari di allenamento e informazioni della community.",landingImages.fitness],
      ["🎬","Creator e negozi","Rendi visibili profili, prodotti, video e campagne.",landingImages.creator],
      ["📸","Turismo","Scopri attrazioni, itinerari e consigli locali.",landingImages.tourism],
    ],
  }[publicLanguage].map(([icon,title,text,image]) => ({ icon, title, text, image })) as Array<{icon:string;title:string;text:string;image:string}>;




  return (
    <main className={styles.page}>
      <section className="miosegProHero">
        <div className="miosegProNav">
          <Link href={`/${locale}`} className="miosegProBrand">
            <img src="/logo-wwhite.png" alt={`${t.common.appName} Logo`} />
          </Link>

          <nav className="miosegProNavLinks" aria-label="Landing Navigation">
            <Link href={`/${locale}#features`}>{heroCopy.navFeatures}</Link>
            <Link href={`/${locale}/explore`}>{heroCopy.navExplore}</Link>
            <Link href={`/${locale}#usecases`}>{heroCopy.navUseCases}</Link>
            <Link href={`/${locale}#pricing`}>{heroCopy.navPrices}</Link>
          </nav>

          <div className="miosegProNavActions">
            <LanguageSwitcher currentLocale={locale} />
            <Link href={`/${locale}/get-app`} className="miosegProDownload">
              ↓ {t.home.hero.ctaPrimary}
            </Link>
          </div>
        </div>

        <div className="miosegProHeroGrid">
          <div className="miosegProHeroText">
            <h1>
              <span>{heroCopy.headline1}</span>
              <span>{heroCopy.headline2}</span>
              <span>{heroCopy.headline3}</span>
            </h1>

            <p>{heroCopy.text}</p>

            <div className="miosegProHeroActions">
              <Link href={`/${locale}/get-app`} className="miosegProPrimary">
                ↓ {t.home.hero.ctaPrimary}
              </Link>
              <Link href={`/${locale}/explore`} className="miosegProSecondary">
                ⦿ {heroCopy.ctaExplore}
              </Link>
            </div>
          </div>

          <div className="miosegProHeroImage">
            <div className="miosegHeroPhotoFallback">
              <Image
                src={landingImages.heroScan}
                alt={
                  publicUi.heroImageAlt
                }
                width={1100}
                height={900}
                className="miosegHeroPhoto"
                priority
              />
            </div>

            <div className="miosegHeroOverlayCard">
              <div>
                <span>⌗</span>
                <strong>{heroCopy.miniScan}</strong>
                <p>{heroCopy.miniScanText}</p>
              </div>
              <div>
                <span>▣</span>
                <strong>{heroCopy.miniSave}</strong>
                <p>{heroCopy.miniSaveText}</p>
              </div>
              <div>
                <span>⌖</span>
                <strong>{heroCopy.miniExplore}</strong>
                <p>{heroCopy.miniExploreText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="miosegVideoSection" aria-labelledby="mioseg-video-title">
        <div className="miosegReleaseSectionHeader">
          <span>{releaseCopy.videoEyebrow}</span>
          <h2 id="mioseg-video-title">{releaseCopy.videoTitle}</h2>
          <p>{releaseCopy.videoText}</p>
        </div>

        <div className="miosegVideoFrame">
          <video
            controls
            preload="metadata"
            poster={landingImages.heroScan}
            playsInline
            aria-label={releaseCopy.videoTitle}
          >
            <source src={PROMO_VIDEO_SRC} type="video/mp4" />
          </video>

          <div className="miosegVideoHint">
            <span>▶</span>
            <p>{releaseCopy.videoHint}</p>
          </div>
        </div>
      </section>

      <section id="features" className="miosegQrxExplainer">
        <div className="miosegQrxCopy">
          <span>{releaseCopy.qrxEyebrow}</span>
          <h2>{releaseCopy.qrxTitle}</h2>
          <p>{releaseCopy.qrxText}</p>

          <div className="miosegQrxFeatureChips">
            <span>▧ {releaseCopy.qrxMedia}</span>
            <span>↻ {releaseCopy.qrxUpdates}</span>
            <span>⌖ {releaseCopy.qrxLocation}</span>
            <span>↗ {releaseCopy.qrxActions}</span>
          </div>
        </div>

        <div className="miosegQrxVisual" aria-hidden="true">
          <div className="miosegQrxCodeTile">
            <div className="miosegQrxFakeCode">
              {Array.from({ length: 25 }).map((_, index) => (
                <i key={index} />
              ))}
            </div>
            <strong>QR-X</strong>
          </div>

          <div className="miosegQrxVisualCards">
            <div><span>▧</span><strong>{releaseCopy.qrxMedia}</strong></div>
            <div><span>↻</span><strong>{releaseCopy.qrxUpdates}</strong></div>
            <div><span>⌖</span><strong>{releaseCopy.qrxLocation}</strong></div>
            <div><span>↗</span><strong>{releaseCopy.qrxActions}</strong></div>
          </div>
        </div>
      </section>

      <section id="usecases" className="miosegProUseCaseSection">
        <div className="miosegProSectionHeader">
          <span>⌖ {publicUi.useCasesEyebrow}</span>
          <h2>
            {publicUi.useCasesTitle}
          </h2>
        </div>

        <div className="miosegProUseCaseGrid">
          {professionalUseCases.map((item) => (
            <article key={item.title} className="miosegProUseCard">
              <div className="miosegProUseImage">
                <Image src={item.image} alt={item.title} width={760} height={460} />
              </div>
              <div className="miosegProUseBody">
                <div className="miosegProUseIcon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="miosegProExploreBand">
        <div className="miosegProExploreText">
          <span>Explore</span>
          <h2>
            {publicUi.exploreTitle}
          </h2>
          <p>
            {publicUi.exploreText}
          </p>

          <div className="miosegProExploreChips">
            <span>📍 {publicUi.nearby}</span>
            <span>🔎 {publicUi.discoverPlaces}</span>
            <span>🏷️ {publicUi.localOffers}</span>
            <span>🤝 {publicUi.supportCommunity}</span>
          </div>

          <div className="miosegProHeroActions">
            <Link href={`/${locale}/explore`} className="miosegProPrimary">
              🗺️ {publicUi.viewExplore}
            </Link>
            <Link href={`/${locale}/get-app`} className="miosegProSecondary">
              {t.home.hero.ctaPrimary}
            </Link>
          </div>
        </div>

        <div className="miosegProMapMock">
          <div className="miosegProMapPin pinA">☕</div>
          <div className="miosegProMapPin pinB">🏠</div>
          <div className="miosegProMapPin pinC">🎟️</div>
          <div className="miosegProMapPin pinD">🩺</div>
          <div className="miosegProUserPoint" />

          <div className="miosegProMapCard">
            <div className="miosegProMapCardImage" />
            <div>
              <span>{publicUi.nearby}</span>
              <strong>Café Bella Vista</strong>
              <p>{publicUi.restaurant} · 250 m</p>
            </div>
          </div>
        </div>
      </section>

      <section className="miosegProBenefitBar">
        <div>
          <span>🔐</span>
          <strong>{publicUi.passwordTitle}</strong>
          <p>{publicUi.passwordText}</p>
        </div>
        <div>
          <span>🔄</span>
          <strong>{publicUi.currentTitle}</strong>
          <p>{publicUi.currentText}</p>
        </div>
        <div>
          <span>🔖</span>
          <strong>{publicUi.organizeTitle}</strong>
          <p>{publicUi.organizeText}</p>
        </div>
        <div>
          <span>📍</span>
          <strong>Explore</strong>
          <p>{publicUi.nearbyText}</p>
        </div>
      </section>
      <section id="pricing" className="miosegPricingSection">
        <div className="miosegPricingCard">
          <div className="miosegPricingCopy">
            <span>{releaseCopy.pricingEyebrow}</span>
            <h2>{releaseCopy.pricingTitle}</h2>
            <p>{releaseCopy.pricingText}</p>
          </div>

          <div className="miosegPricingPoints">
            <div><span>✓</span>{releaseCopy.pricingPoint1}</div>
            <div><span>✓</span>{releaseCopy.pricingPoint2}</div>
            <div><span>✓</span>{releaseCopy.pricingPoint3}</div>
          </div>

          <Link href={`/${locale}/register`} className="miosegPricingCta">
            {releaseCopy.pricingCta}
          </Link>
        </div>
      </section>

      <section className="miosegFinalCtaRelease">
        <div>
          <span>Mioseg qr</span>
          <h2>{releaseCopy.finalTitle}</h2>
          <p>{releaseCopy.finalText}</p>
        </div>

        <div className="miosegFinalCtaActions">
          <Link href={`/${locale}/explore`} className="miosegProSecondary">
            {releaseCopy.finalExplore}
          </Link>
          <Link href={`/${locale}/get-app`} className="miosegProPrimary">
            {releaseCopy.finalApp}
          </Link>
        </div>
      </section>

      <section className={styles.downloadSection}>
        <div className={styles.downloadCard}>
          <div className={styles.downloadTop}>
            <div className={styles.downloadBrand}>
              <div className={styles.downloadLogoWrap}>
                <img
                  src="/logo-wwhite.png"
                  alt={`${t.common.appName} Download Logo`}
                  className={styles.downloadLogo}
                />
              </div>

              <div className={styles.downloadBrandText}>
                <span className={styles.downloadBrandTitle}>{t.common.appName}</span>
                <span className={styles.downloadBrandSubtitle}>
                  {t.home.download.brandSubtitle}
                </span>
              </div>
            </div>

            <div className={styles.downloadButtons}>
              <Link href={`/${locale}/get-app`} className={styles.downloadPrimaryButton}>
                {t.home.download.ctaPrimary}
              </Link>
              <Link href={`/${locale}/datenschutz`} className={styles.downloadSecondaryButton}>
                {t.home.download.ctaSecondary}
              </Link>
            </div>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card1Title}</div>
              <p className={styles.trustText}>{t.home.download.card1Text}</p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card2Title}</div>
              <p className={styles.trustText}>{t.home.download.card2Text}</p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card3Title}</div>
              <p className={styles.trustText}>{t.home.download.card3Text}</p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card4Title}</div>
              <p className={styles.trustText}>{t.home.download.card4Text}</p>
            </div>
          </div>
        </div>
      </section>




      <footer className="miosegHomeFooter">
        <div>
          <strong>Mioseg qr</strong>
          <span>© 2026 Mioseg qr</span>
        </div>
        <nav aria-label="Legal">
          <Link href={`/${locale}/datenschutz`}>{releaseCopy.footerPrivacy}</Link>
          <Link href={`/${locale}/nutzungsbedingungen`}>{releaseCopy.footerTerms}</Link>
        </nav>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.miosegProHero {
  min-height: 680px;
  background:
    radial-gradient(circle at 78% 18%, rgba(37, 99, 235, 0.32), transparent 28%),
    linear-gradient(135deg, #07101f 0%, #0d1726 48%, #14385f 100%);
  color: #ffffff;
  overflow: hidden;
}

.miosegProNav {
  max-width: 1320px;
  margin: 0 auto;
  min-height: 82px;
  padding: 16px 24px;
  display: grid;
  grid-template-columns: 220px 1fr auto;
  gap: 18px;
  align-items: center;
  position: relative;
  z-index: 5;
}

.miosegProBrand img {
  width: 132px;
  height: auto;
  display: block;
}

.miosegProNavLinks {
  display: flex;
  justify-content: center;
  gap: 34px;
}

.miosegProNavLinks a {
  color: rgba(255,255,255,0.86);
  text-decoration: none;
  font-size: 15px;
  font-weight: 900;
}

.miosegProNavLinks a:hover {
  color: #ffffff;
}

.miosegProNavActions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.miosegProDownload,
.miosegProPrimary {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  padding: 0 20px;
  background: linear-gradient(135deg, #0d6efd 0%, #7c3aed 100%);
  color: #ffffff;
  text-decoration: none;
  font-weight: 950;
  box-shadow: 0 18px 42px rgba(37, 99, 235, 0.28);
}

.miosegProSecondary {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 0 20px;
  background: rgba(255,255,255,0.10);
  color: #ffffff;
  border: 1px solid rgba(255,255,255,0.28);
  text-decoration: none;
  font-weight: 950;
  backdrop-filter: blur(14px);
}

.miosegProHeroGrid {
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(360px, 0.82fr) minmax(520px, 1.18fr);
  gap: 42px;
  align-items: center;
  padding: 42px 24px 74px;
}

.miosegProHeroText h1 {
  margin: 0;
  font-size: clamp(56px, 7vw, 104px);
  line-height: 0.92;
  letter-spacing: -3px;
  font-weight: 950;
}

.miosegProHeroText h1 span {
  display: block;
}

.miosegProHeroText h1 span:nth-child(3) {
  background: linear-gradient(135deg, #1685ff 0%, #8b5cf6 82%);
  -webkit-background-clip: text;
  color: transparent;
}

.miosegProHeroText p {
  max-width: 520px;
  margin: 28px 0;
  color: rgba(255,255,255,0.82);
  font-size: 20px;
  line-height: 1.65;
}

.miosegProHeroActions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.miosegProHeroImage {
  min-height: 520px;
  border-radius: 34px;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
    radial-gradient(circle at 76% 28%, rgba(255,255,255,0.15), transparent 34%);
  box-shadow: 0 34px 92px rgba(0,0,0,0.28);
}

.miosegHeroPhotoFallback {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(7,16,31,0.18), rgba(7,16,31,0.48)),
    radial-gradient(circle at 32% 38%, rgba(255,255,255,0.22), transparent 18%),
    linear-gradient(135deg, #213a59 0%, #0d1726 100%);
}

.miosegHeroPhoto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.86;
}

.miosegHeroOverlayCard {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  width: min(260px, calc(100% - 60px));
  display: grid;
  gap: 12px;
  border-radius: 28px;
  padding: 18px;
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 26px 70px rgba(0,0,0,0.18);
  backdrop-filter: blur(18px);
}

.miosegHeroOverlayCard div {
  display: grid;
  grid-template-columns: 44px 1fr;
  column-gap: 12px;
  align-items: center;
}

.miosegHeroOverlayCard span {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #eef4ff;
  color: #2563eb;
  font-weight: 950;
}

.miosegHeroOverlayCard strong {
  color: #0d1726;
  font-size: 15px;
  font-weight: 950;
}

.miosegHeroOverlayCard p {
  grid-column: 2;
  margin: 2px 0 0;
  color: #5d6b7d;
  font-size: 12px;
  line-height: 1.35;
}

.miosegProUseCaseSection {
  padding: 56px 20px 72px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
}

.miosegProSectionHeader {
  max-width: 1180px;
  margin: 0 auto 24px;
  text-align: center;
}

.miosegProSectionHeader span {
  color: #2563eb;
  font-size: 16px;
  font-weight: 950;
}

.miosegProSectionHeader h2 {
  margin: 14px auto 0;
  max-width: 820px;
  color: #0d1726;
  font-size: clamp(34px, 5vw, 54px);
  line-height: 1.02;
  letter-spacing: -1.4px;
}

.miosegProUseCaseGrid {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.miosegProUseCard {
  overflow: hidden;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid #e1e9f2;
  box-shadow: 0 18px 50px rgba(14, 23, 38, 0.08);
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.miosegProUseCard:hover {
  transform: translateY(-5px);
  box-shadow: 0 26px 70px rgba(14, 23, 38, 0.12);
}

.miosegProUseImage {
  height: 150px;
  background:
    linear-gradient(135deg, rgba(37,99,235,0.16), rgba(124,58,237,0.10)),
    #eef4fb;
  overflow: hidden;
}

.miosegProUseImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.miosegProUseBody {
  position: relative;
  padding: 42px 20px 22px;
}

.miosegProUseIcon {
  position: absolute;
  top: -31px;
  left: 20px;
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(14, 23, 38, 0.14);
  font-size: 28px;
}

.miosegProUseBody h3 {
  margin: 0 0 8px;
  color: #0d1726;
  font-size: 22px;
  letter-spacing: -0.35px;
}

.miosegProUseBody p {
  margin: 0;
  color: #5d6b7d;
  font-size: 15px;
  line-height: 1.55;
}

.miosegProExploreBand {
  max-width: 1440px;
  margin: 0 auto 48px;
  border-radius: 42px;
  padding: 44px;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
  gap: 32px;
  align-items: center;
  background:
    radial-gradient(circle at 80% 30%, rgba(37,99,235,0.18), transparent 28%),
    linear-gradient(135deg, #eef4ff 0%, #ffffff 100%);
  border: 1px solid #e1e9f2;
  box-shadow: 0 28px 86px rgba(14, 23, 38, 0.10);
}

.miosegProExploreText > span {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 12px;
  background: #e8f0ff;
  color: #2563eb;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 12px;
}

.miosegProExploreText h2 {
  margin: 18px 0 14px;
  color: #0d1726;
  font-size: clamp(36px, 5vw, 62px);
  line-height: 1.02;
  letter-spacing: -1.6px;
}

.miosegProExploreText p {
  margin: 0 0 20px;
  color: #5d6b7d;
  font-size: 18px;
  line-height: 1.7;
}

.miosegProExploreChips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 22px 0;
}

.miosegProExploreChips span {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  border-radius: 14px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #dfe9f5;
  color: #17304d;
  font-size: 13px;
  font-weight: 900;
}

.miosegProMapMock {
  position: relative;
  min-height: 410px;
  border-radius: 34px;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(255,255,255,0.68) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255,255,255,0.68) 1px, transparent 1px),
    linear-gradient(135deg, #dbeafe 0%, #f3f8ff 54%, #cfe2f5 100%);
  background-size: 58px 58px, 58px 58px, auto;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: inset 0 0 0 1px rgba(13,23,38,0.04);
}

.miosegProMapPin {
  position: absolute;
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: linear-gradient(180deg, #0d6efd, #7c3aed);
  border: 3px solid #ffffff;
  box-shadow: 0 16px 36px rgba(37,99,235,0.28);
  font-size: 24px;
  animation: miosegProPin 3.2s ease-in-out infinite;
}

.pinA { left: 70px; top: 78px; }
.pinB { right: 125px; top: 70px; animation-delay: 180ms; }
.pinC { left: 42%; bottom: 66px; animation-delay: 360ms; }
.pinD { right: 58px; bottom: 110px; animation-delay: 540ms; }

.miosegProUserPoint {
  position: absolute;
  left: 50%;
  top: 48%;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #2563eb;
  border: 5px solid #ffffff;
  box-shadow: 0 0 0 22px rgba(37,99,235,0.16);
  animation: miosegProPulse 2.5s ease-in-out infinite;
}

.miosegProMapCard {
  position: absolute;
  right: 26px;
  bottom: 28px;
  width: 250px;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255,255,255,0.94);
  box-shadow: 0 18px 50px rgba(14,23,38,0.18);
  border: 1px solid rgba(255,255,255,0.85);
}

.miosegProMapCardImage {
  height: 92px;
  background:
    linear-gradient(135deg, rgba(13,23,38,0.08), rgba(37,99,235,0.10)),
    url("/landing/explore-card.png");
  background-size: cover;
  background-position: center;
}

.miosegProMapCard div:last-child {
  padding: 13px;
}

.miosegProMapCard span {
  color: #2563eb;
  font-size: 11px;
  font-weight: 950;
}

.miosegProMapCard strong {
  display: block;
  color: #0d1726;
  font-size: 16px;
  margin: 5px 0;
}

.miosegProMapCard p {
  margin: 0;
  color: #5d6b7d;
  font-size: 12px;
  font-weight: 800;
}

.miosegProBenefitBar {
  max-width: 1320px;
  margin: -20px auto 64px;
  border-radius: 30px;
  padding: 20px 28px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  background: linear-gradient(135deg, #0d1726 0%, #17304d 100%);
  color: #ffffff;
  box-shadow: 0 24px 70px rgba(13, 23, 38, 0.18);
}

.miosegProBenefitBar div {
  display: grid;
  grid-template-columns: 54px 1fr;
  column-gap: 14px;
  align-items: center;
  min-height: 88px;
}

.miosegProBenefitBar span {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: rgba(255,255,255,0.10);
  font-size: 26px;
  grid-row: span 2;
}

.miosegProBenefitBar strong {
  font-size: 17px;
}

.miosegProBenefitBar p {
  margin: 4px 0 0;
  color: rgba(255,255,255,0.72);
  font-size: 13px;
  line-height: 1.4;
}

@keyframes miosegProPin {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

@keyframes miosegProPulse {
  0%, 100% { box-shadow: 0 0 0 14px rgba(37,99,235,0.16); }
  50% { box-shadow: 0 0 0 30px rgba(37,99,235,0); }
}

@media (max-width: 1100px) {
  .miosegProNav {
    grid-template-columns: 1fr auto;
  }

  .miosegProNavLinks {
    display: none;
  }

  .miosegProHeroGrid,
  .miosegProExploreBand {
    grid-template-columns: 1fr;
  }

  .miosegProUseCaseGrid,
  .miosegProBenefitBar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .miosegProHeroImage {
    min-height: 460px;
  }
}


.miosegVideoSection,
.miosegQrxExplainer,
.miosegPricingSection,
.miosegFinalCtaRelease {
  width: min(1180px, calc(100% - 48px));
  margin-left: auto;
  margin-right: auto;
}

.miosegVideoSection {
  padding: 88px 0 84px;
}

.miosegReleaseSectionHeader {
  max-width: 760px;
  margin: 0 auto 32px;
  text-align: center;
}

.miosegReleaseSectionHeader > span,
.miosegQrxCopy > span,
.miosegPricingCopy > span,
.miosegFinalCtaRelease > div:first-child > span {
  display: inline-block;
  margin-bottom: 10px;
  color: #4d84c9;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.miosegReleaseSectionHeader h2,
.miosegQrxCopy h2,
.miosegPricingCopy h2,
.miosegFinalCtaRelease h2 {
  margin: 0;
  color: #0d1726;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.02;
  letter-spacing: -0.045em;
  font-weight: 950;
}

.miosegReleaseSectionHeader p,
.miosegQrxCopy p,
.miosegPricingCopy p,
.miosegFinalCtaRelease p {
  margin: 18px 0 0;
  color: #65758a;
  font-size: 17px;
  line-height: 1.7;
}

.miosegVideoFrame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: 34px;
  background: #07101f;
  border: 1px solid rgba(13, 23, 38, 0.10);
  box-shadow: 0 32px 90px rgba(13, 23, 38, 0.15);
}

.miosegVideoFrame video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background: #07101f;
}

.miosegVideoHint {
  position: absolute;
  left: 22px;
  bottom: 22px;
  max-width: min(440px, calc(100% - 44px));
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-radius: 16px;
  color: #fff;
  background: rgba(7, 16, 31, 0.70);
  border: 1px solid rgba(255,255,255,0.14);
  backdrop-filter: blur(14px);
  pointer-events: none;
}

.miosegVideoHint span {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255,255,255,.13);
  flex: 0 0 auto;
}

.miosegVideoHint p {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
}

.miosegQrxExplainer {
  margin-bottom: 84px;
  padding: 56px;
  display: grid;
  grid-template-columns: minmax(0, .92fr) minmax(380px, 1.08fr);
  gap: 56px;
  align-items: center;
  border-radius: 38px;
  background:
    radial-gradient(circle at 78% 24%, rgba(59,130,246,.20), transparent 30%),
    linear-gradient(135deg, #07101f 0%, #0d1726 55%, #15385c 100%);
  box-shadow: 0 28px 86px rgba(7,16,31,.22);
}

.miosegQrxCopy h2,
.miosegQrxCopy p {
  color: #fff;
}

.miosegQrxCopy p {
  color: rgba(255,255,255,.76);
}

.miosegQrxCopy > span {
  color: #8fc7ff;
}

.miosegQrxFeatureChips {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 25px;
}

.miosegQrxFeatureChips span {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  padding: 0 13px;
  border-radius: 999px;
  color: #eaf4ff;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.10);
  font-size: 12px;
  font-weight: 900;
}

.miosegQrxVisual {
  min-height: 360px;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 18px;
  align-items: center;
}

.miosegQrxCodeTile {
  padding: 18px;
  border-radius: 30px;
  background: #fff;
  box-shadow: 0 24px 64px rgba(0,0,0,.24);
}

.miosegQrxCodeTile > strong {
  display: block;
  margin-top: 12px;
  color: #0d1726;
  text-align: center;
  font-size: 22px;
  font-weight: 950;
}

.miosegQrxFakeCode {
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  padding: 8px;
  border-radius: 18px;
  background: #f8fafc;
}

.miosegQrxFakeCode i {
  display: block;
  border-radius: 4px;
  background: #0d1726;
}

.miosegQrxFakeCode i:nth-child(2n),
.miosegQrxFakeCode i:nth-child(7),
.miosegQrxFakeCode i:nth-child(13),
.miosegQrxFakeCode i:nth-child(21) {
  opacity: .18;
}

.miosegQrxVisualCards {
  display: grid;
  gap: 11px;
}

.miosegQrxVisualCards > div {
  min-height: 66px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-radius: 18px;
  color: #fff;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.10);
  box-shadow: 0 16px 34px rgba(0,0,0,.12);
}

.miosegQrxVisualCards span {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: rgba(255,255,255,.10);
  font-size: 18px;
}

.miosegQrxVisualCards strong {
  font-size: 14px;
}

.miosegPricingSection {
  padding: 82px 0 32px;
}

.miosegPricingCard {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, .8fr) auto;
  gap: 34px;
  align-items: center;
  padding: 38px;
  border-radius: 34px;
  background: #f7faff;
  border: 1px solid #dce7f5;
  box-shadow: 0 22px 62px rgba(13,23,38,.08);
}

.miosegPricingCopy h2 {
  font-size: clamp(30px, 4vw, 46px);
}

.miosegPricingPoints {
  display: grid;
  gap: 11px;
}

.miosegPricingPoints > div {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #32445a;
  font-size: 14px;
  font-weight: 800;
}

.miosegPricingPoints span {
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #0d6efd;
  background: #e8f2ff;
  flex: 0 0 auto;
}

.miosegPricingCta {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 0 20px;
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(135deg, #0d6efd 0%, #7c3aed 100%);
  text-decoration: none;
  font-weight: 950;
  box-shadow: 0 18px 40px rgba(37,99,235,.20);
}

.miosegFinalCtaRelease {
  margin-top: 54px;
  margin-bottom: 54px;
  padding: 48px 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 34px;
  border-radius: 36px;
  background:
    radial-gradient(circle at 90% 10%, rgba(124,58,237,.26), transparent 28%),
    linear-gradient(135deg, #07101f, #0d1726 55%, #14385f);
  box-shadow: 0 28px 82px rgba(7,16,31,.20);
}

.miosegFinalCtaRelease h2,
.miosegFinalCtaRelease p {
  color: #fff;
}

.miosegFinalCtaRelease p {
  color: rgba(255,255,255,.74);
  max-width: 700px;
}

.miosegFinalCtaRelease > div:first-child > span {
  color: #8fc7ff;
}

.miosegFinalCtaActions {
  display: flex;
  gap: 12px;
  flex: 0 0 auto;
}

.miosegHomeFooter {
  width: min(1180px, calc(100% - 48px));
  margin: 18px auto 0;
  min-height: 84px;
  padding: 20px 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-top: 1px solid rgba(13,23,38,.10);
}

.miosegHomeFooter > div {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #65758a;
  font-size: 13px;
}

.miosegHomeFooter strong {
  color: #0d1726;
}

.miosegHomeFooter nav {
  display: flex;
  gap: 18px;
}

.miosegHomeFooter a {
  color: #53667d;
  text-decoration: none;
  font-size: 13px;
  font-weight: 800;
}

.miosegHomeFooter a:hover {
  color: #0d6efd;
}

@media (max-width: 980px) {
  .miosegQrxExplainer {
    grid-template-columns: 1fr;
    padding: 40px;
  }

  .miosegQrxVisual {
    min-height: 0;
  }

  .miosegPricingCard {
    grid-template-columns: 1fr;
  }

  .miosegPricingCta {
    width: fit-content;
  }

  .miosegFinalCtaRelease {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 680px) {
  .miosegVideoSection,
  .miosegQrxExplainer,
  .miosegPricingSection,
  .miosegFinalCtaRelease,
  .miosegHomeFooter {
    width: min(100% - 28px, 1180px);
  }

  .miosegVideoSection {
    padding: 58px 0 56px;
  }

  .miosegReleaseSectionHeader {
    margin-bottom: 22px;
  }

  .miosegReleaseSectionHeader h2,
  .miosegQrxCopy h2,
  .miosegFinalCtaRelease h2 {
    font-size: 36px;
  }

  .miosegVideoFrame {
    border-radius: 24px;
  }

  .miosegVideoHint {
    left: 12px;
    right: 12px;
    bottom: 12px;
    max-width: none;
  }

  .miosegQrxExplainer {
    margin-bottom: 56px;
    padding: 26px 20px;
    gap: 32px;
    border-radius: 28px;
  }

  .miosegQrxVisual {
    grid-template-columns: 120px 1fr;
    gap: 12px;
  }

  .miosegQrxCodeTile {
    padding: 12px;
    border-radius: 22px;
  }

  .miosegQrxFakeCode {
    gap: 4px;
    padding: 5px;
  }

  .miosegQrxVisualCards > div {
    min-height: 54px;
    padding: 0 11px;
  }

  .miosegQrxVisualCards span {
    width: 32px;
    height: 32px;
  }

  .miosegPricingSection {
    padding: 54px 0 18px;
  }

  .miosegPricingCard {
    padding: 24px 20px;
    border-radius: 26px;
    gap: 24px;
  }

  .miosegFinalCtaRelease {
    margin-top: 36px;
    margin-bottom: 36px;
    padding: 30px 22px;
    border-radius: 28px;
  }

  .miosegFinalCtaActions {
    width: 100%;
    flex-direction: column;
  }

  .miosegFinalCtaActions a {
    width: 100%;
  }

  .miosegHomeFooter {
    align-items: flex-start;
    flex-direction: column;
  }

  .miosegHomeFooter > div {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 680px) {
  .miosegProNav {
    padding: 14px 16px;
  }

  .miosegProNavActions {
    width: 100%;
    grid-column: 1 / -1;
    justify-content: space-between;
  }

  .miosegProHeroGrid {
    padding: 32px 16px 52px;
  }

  .miosegProHeroText h1 {
    font-size: 54px;
  }

  .miosegProHeroImage {
    min-height: 420px;
    border-radius: 28px;
  }

  .miosegHeroOverlayCard {
    left: 18px;
    right: 18px;
    bottom: 18px;
    top: auto;
    transform: none;
    width: auto;
  }

  .miosegProUseCaseGrid,
  .miosegProBenefitBar {
    grid-template-columns: 1fr;
  }

  .miosegProExploreBand {
    margin: 0 14px 44px;
    padding: 22px;
    border-radius: 30px;
  }

  .miosegProMapMock {
    min-height: 360px;
  }

  .miosegProMapCard {
    left: 18px;
    right: 18px;
    width: auto;
  }
}
          `.trim(),
        }}
      />

    </main>
  );
}