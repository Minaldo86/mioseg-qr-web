import Image from "next/image";
import Link from "next/link";
import styles from "./home-page.module.css";

import LanguageSwitcher from "../../components/LanguageSwitcher";
import HomeAudienceDemos from "../../components/HomeAudienceDemos";
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
  de: { headline1:"Mehr als", headline2:"ein QR-Code.", headline3:"Dein QR-X.", text:"Für dich: scannen, speichern, wiederfinden, folgen und entdecken. Für Unternehmen: Produkte, Maschinen, Projekte und Standorte dauerhaft mit aktuellen Informationen verbinden.", ctaExplore:"Explore entdecken", navFeatures:"QR-X verstehen", navExplore:"Explore", navUseCases:"Für Unternehmen", navPrices:"Preise", miniScan:"Für dich", miniScanText:"Scannen, speichern, wiederfinden", miniSave:"Bleib aktuell", miniSaveText:"Folgen & Updates erhalten", miniExplore:"Für Unternehmen", miniExploreText:"QR-X erstellen & sichtbar machen" },
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

const APP_SHOWCASE_COPY: Record<PublicLocale, {
  eyebrow: string;
  title: string;
  text: string;
  exploreTitle: string;
  exploreText: string;
  scansTitle: string;
  scansText: string;
  businessTitle: string;
  businessText: string;
  collectionTitle: string;
  collectionText: string;
  collectionBadge: string;
}> = {
  de: { eyebrow:"Echte App-Einblicke", title:"So sieht Mioseg qr wirklich aus.", text:"Keine Demo-Grafiken: Diese Ansichten stammen direkt aus der App und zeigen die wichtigsten Funktionen im echten Einsatz.", exploreTitle:"Explore & Karte", exploreText:"QR-X in der Umgebung entdecken und Orte direkt auf der Karte wiederfinden.", scansTitle:"Scans organisieren", scansText:"Gespeicherte QR-Codes und QR-X suchen, filtern und in Ordnern übersichtlich ablegen.", businessTitle:"Business QR-X", businessText:"Unternehmen erhalten ein professionelles Profil mit Kategorie, Kontaktaktionen und optionaler Verifizierung.", collectionTitle:"Custom Collection", collectionText:"Mehrere eigenständige QR-X zu einer Sammlung verbinden – ideal für Produkte, Immobilien, Events, Ausstellungen oder Standorte.", collectionBadge:"Besonderes QR-X Feature" },
  en: { eyebrow:"Real app views", title:"This is what Mioseg qr really looks like.", text:"No demo graphics: these screens come directly from the app and show the core features in real use.", exploreTitle:"Explore & map", exploreText:"Discover QR-X nearby and find places again directly on the map.", scansTitle:"Organize scans", scansText:"Search, filter and organize saved QR codes and QR-X in folders.", businessTitle:"Business QR-X", businessText:"Businesses get a professional profile with category, contact actions and optional verification.", collectionTitle:"Custom Collection", collectionText:"Connect multiple independent QR-X in one collection – ideal for products, real estate, events, exhibitions or locations.", collectionBadge:"Distinctive QR-X feature" },
  tr: { eyebrow:"Gerçek uygulama ekranları", title:"Mioseg qr gerçekten böyle görünüyor.", text:"Demo görselleri değil: Bu ekranlar doğrudan uygulamadan alınmıştır ve temel özellikleri gerçek kullanımda gösterir.", exploreTitle:"Explore ve harita", exploreText:"Yakındaki QR-X'leri keşfet ve yerleri haritada yeniden bul.", scansTitle:"Taramaları düzenle", scansText:"Kaydedilen QR kodlarını ve QR-X'leri ara, filtrele ve klasörlerde düzenle.", businessTitle:"Business QR-X", businessText:"İşletmeler kategori, iletişim işlemleri ve isteğe bağlı doğrulama içeren profesyonel bir profil alır.", collectionTitle:"Custom Collection", collectionText:"Birden fazla bağımsız QR-X'i tek koleksiyonda birleştir – ürünler, gayrimenkuller, etkinlikler, sergiler veya konumlar için ideal.", collectionBadge:"Özel QR-X özelliği" },
  pl: { eyebrow:"Prawdziwe widoki aplikacji", title:"Tak naprawdę wygląda Mioseg qr.", text:"Bez grafik demonstracyjnych: te ekrany pochodzą bezpośrednio z aplikacji i pokazują najważniejsze funkcje w praktyce.", exploreTitle:"Explore i mapa", exploreText:"Odkrywaj QR-X w pobliżu i odnajduj miejsca bezpośrednio na mapie.", scansTitle:"Organizuj skany", scansText:"Wyszukuj, filtruj i porządkuj zapisane kody QR i QR-X w folderach.", businessTitle:"Business QR-X", businessText:"Firmy otrzymują profesjonalny profil z kategorią, akcjami kontaktowymi i opcjonalną weryfikacją.", collectionTitle:"Custom Collection", collectionText:"Połącz wiele niezależnych QR-X w jedną kolekcję – idealne dla produktów, nieruchomości, wydarzeń, wystaw lub lokalizacji.", collectionBadge:"Wyjątkowa funkcja QR-X" },
  ar: { eyebrow:"لقطات حقيقية من التطبيق", title:"هكذا يبدو Mioseg qr فعليًا.", text:"ليست رسومات تجريبية: هذه الشاشات مأخوذة مباشرة من التطبيق وتعرض أهم الوظائف أثناء الاستخدام الحقيقي.", exploreTitle:"Explore والخريطة", exploreText:"اكتشف QR-X القريبة واعثر على الأماكن مباشرة على الخريطة.", scansTitle:"تنظيم عمليات المسح", scansText:"ابحث عن رموز QR وQR-X المحفوظة وقم بتصفيتها وتنظيمها في مجلدات.", businessTitle:"Business QR-X", businessText:"تحصل الشركات على ملف احترافي مع فئة وإجراءات اتصال وتحقق اختياري.", collectionTitle:"Custom Collection", collectionText:"اربط عدة QR-X مستقلة في مجموعة واحدة، وهو مناسب للمنتجات والعقارات والفعاليات والمعارض والمواقع.", collectionBadge:"ميزة QR-X مميزة" },
  fr: { eyebrow:"Vrais aperçus de l’app", title:"Voici à quoi ressemble réellement Mioseg qr.", text:"Pas de maquettes : ces écrans proviennent directement de l’application et montrent les fonctions principales en situation réelle.", exploreTitle:"Explore & carte", exploreText:"Découvrez les QR-X à proximité et retrouvez des lieux directement sur la carte.", scansTitle:"Organiser les scans", scansText:"Recherchez, filtrez et classez les QR codes et QR-X enregistrés dans des dossiers.", businessTitle:"Business QR-X", businessText:"Les entreprises disposent d’un profil professionnel avec catégorie, actions de contact et vérification optionnelle.", collectionTitle:"Custom Collection", collectionText:"Regroupez plusieurs QR-X indépendants dans une collection – idéal pour produits, immobilier, événements, expositions ou sites.", collectionBadge:"Fonction QR-X distinctive" },
  es: { eyebrow:"Vistas reales de la app", title:"Así es Mioseg qr de verdad.", text:"Sin gráficos de demostración: estas pantallas proceden directamente de la app y muestran las funciones principales en uso real.", exploreTitle:"Explore y mapa", exploreText:"Descubre QR-X cercanos y vuelve a encontrar lugares directamente en el mapa.", scansTitle:"Organizar escaneos", scansText:"Busca, filtra y organiza códigos QR y QR-X guardados en carpetas.", businessTitle:"Business QR-X", businessText:"Las empresas obtienen un perfil profesional con categoría, acciones de contacto y verificación opcional.", collectionTitle:"Custom Collection", collectionText:"Conecta varios QR-X independientes en una colección, ideal para productos, inmuebles, eventos, exposiciones o ubicaciones.", collectionBadge:"Función QR-X distintiva" },
  it: { eyebrow:"Schermate reali dell’app", title:"Ecco come appare davvero Mioseg qr.", text:"Niente grafiche demo: queste schermate provengono direttamente dall’app e mostrano le funzioni principali nell’uso reale.", exploreTitle:"Explore e mappa", exploreText:"Scopri QR-X nelle vicinanze e ritrova i luoghi direttamente sulla mappa.", scansTitle:"Organizza le scansioni", scansText:"Cerca, filtra e organizza QR code e QR-X salvati in cartelle.", businessTitle:"Business QR-X", businessText:"Le aziende ottengono un profilo professionale con categoria, azioni di contatto e verifica opzionale.", collectionTitle:"Custom Collection", collectionText:"Collega più QR-X indipendenti in una raccolta, ideale per prodotti, immobili, eventi, mostre o sedi.", collectionBadge:"Funzione QR-X distintiva" },
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
    // Real app screenshots are used for the product presentation.
    heroScan: "/landing/app-explore.jpg",
    heroPhone: "/landing/app-hero-qrx.jpg",
    appExplore: "/landing/app-explore.jpg",
    appScans: "/landing/app-my-scans.jpg",
    appBusiness: "/landing/app-business-qrx.jpg",
    appCollection: "/landing/app-collection.jpg",
    appUpdates: "/landing/app-updates.jpg",
    videoPoster: "/landing/video-poster.png",
    realEstate: "/landing/usecase-real-estate.png",
    restaurant: "/landing/usecase-restaurant.png",
    craft: "/landing/usecase-craft.png",
    business: "/landing/usecase-business.png",
    event: "/landing/usecase-event.png",
    tourism: "/landing/usecase-tourism.png",
    school: "/landing/usecase-school.png",
    fitness: "/landing/usecase-fitness.png",
    creator: "/landing/usecase-creator.png",
  };

  const publicLanguage = publicLocale(locale);
  const heroCopy = HOME_HERO_COPY[publicLanguage];
  const publicUi = HOME_PUBLIC_UI[publicLanguage];
  const releaseCopy = HOME_RELEASE_COPY[publicLanguage];
  const isGerman = publicLanguage === "de";
  const showcaseCopy = APP_SHOWCASE_COPY[publicLanguage];

  const professionalUseCases = {
    de: [
      ["🍽️","Gastronomie","Speisekarten, Events und Angebote teilen.",landingImages.restaurant],
      ["🏠","Immobilien","Objekte präsentieren und Infos bereitstellen.",landingImages.realEstate],
      ["🛠️","Handwerk","Referenzen zeigen und Kunden gewinnen.",landingImages.craft],
      ["🏢","Unternehmen","Produkte, Services und Standorte teilen.",landingImages.business],
      ["🎟️","Events","Einladungen, Infos und Updates teilen.",landingImages.event],
      ["📸","Tourismus","Sehenswürdigkeiten und Touren entdecken.",landingImages.tourism],
    ],
    en: [
      ["🍽️","Restaurants","Share menus, events and offers.",landingImages.restaurant],
      ["🏠","Real estate","Present properties and provide information.",landingImages.realEstate],
      ["🛠️","Trades","Show references and win customers.",landingImages.craft],
      ["🏢","Business","Share products, services and locations.",landingImages.business],
      ["🎟️","Events","Share invitations, information and updates.",landingImages.event],
      ["📸","Tourism","Discover sights and tours.",landingImages.tourism],
    ],
    tr: [
      ["🍽️","Gastronomi","Menüler, etkinlikler ve teklifleri paylaş.",landingImages.restaurant],
      ["🏠","Gayrimenkul","Objeleri tanıt ve bilgileri sun.",landingImages.realEstate],
      ["🛠️","Zanaat","Referanslarını göster ve müşteri kazan.",landingImages.craft],
      ["🏢","İşletmeler","Ürünleri, hizmetleri ve konumları paylaş.",landingImages.business],
      ["🎟️","Etkinlikler","Davetleri, bilgileri ve güncellemeleri paylaş.",landingImages.event],
      ["📸","Turizm","Gezilecek yerleri ve turları keşfet.",landingImages.tourism],
    ],
    pl: [
      ["🍽️","Gastronomia","Udostępniaj menu, wydarzenia i oferty.",landingImages.restaurant],
      ["🏠","Nieruchomości","Prezentuj obiekty i przekazuj informacje.",landingImages.realEstate],
      ["🛠️","Rzemiosło","Pokazuj realizacje i zdobywaj klientów.",landingImages.craft],
      ["🏢","Firmy","Udostępniaj produkty, usługi i lokalizacje.",landingImages.business],
      ["🎟️","Wydarzenia","Udostępniaj zaproszenia, informacje i aktualizacje.",landingImages.event],
      ["📸","Turystyka","Odkrywaj atrakcje i wycieczki.",landingImages.tourism],
    ],
    ar: [
      ["🍽️","المطاعم","شارك القوائم والفعاليات والعروض.",landingImages.restaurant],
      ["🏠","العقارات","اعرض العقارات ووفّر المعلومات.",landingImages.realEstate],
      ["🛠️","الحرف","اعرض المراجع واكسب العملاء.",landingImages.craft],
      ["🏢","الأعمال","شارك المنتجات والخدمات والمواقع.",landingImages.business],
      ["🎟️","الفعاليات","شارك الدعوات والمعلومات والتحديثات.",landingImages.event],
      ["📸","السياحة","اكتشف المعالم والجولات.",landingImages.tourism],
    ],
    fr: [
      ["🍽️","Gastronomie","Partagez menus, événements et offres.",landingImages.restaurant],
      ["🏠","Immobilier","Présentez des biens et fournissez des informations.",landingImages.realEstate],
      ["🛠️","Artisanat","Montrez vos références et gagnez des clients.",landingImages.craft],
      ["🏢","Entreprises","Partagez produits, services et sites.",landingImages.business],
      ["🎟️","Événements","Partagez invitations, informations et mises à jour.",landingImages.event],
      ["📸","Tourisme","Découvrez sites et circuits.",landingImages.tourism],
    ],
    es: [
      ["🍽️","Gastronomía","Comparte menús, eventos y ofertas.",landingImages.restaurant],
      ["🏠","Inmobiliaria","Presenta propiedades y facilita información.",landingImages.realEstate],
      ["🛠️","Oficios","Muestra referencias y consigue clientes.",landingImages.craft],
      ["🏢","Empresas","Comparte productos, servicios y ubicaciones.",landingImages.business],
      ["🎟️","Eventos","Comparte invitaciones, información y actualizaciones.",landingImages.event],
      ["📸","Turismo","Descubre lugares y recorridos.",landingImages.tourism],
    ],
    it: [
      ["🍽️","Gastronomia","Condividi menu, eventi e offerte.",landingImages.restaurant],
      ["🏠","Immobiliare","Presenta immobili e fornisci informazioni.",landingImages.realEstate],
      ["🛠️","Artigianato","Mostra referenze e conquista clienti.",landingImages.craft],
      ["🏢","Aziende","Condividi prodotti, servizi e sedi.",landingImages.business],
      ["🎟️","Eventi","Condividi inviti, informazioni e aggiornamenti.",landingImages.event],
      ["📸","Turismo","Scopri attrazioni e tour.",landingImages.tourism],
    ],
  }[publicLanguage].map(([icon,title,text,image]) => ({ icon, title, text, image })) as Array<{icon:string;title:string;text:string;image:string}>;




  return (
    <main className={`${styles.page} landingBPage`} style={{ background: "#06101f", minHeight: "100vh" }}>
      <section className="landingBHero">
        <div className="landingBNav">
          <Link href={`/${locale}`} className="landingBBrand">
            <img src="/logo-wwhite.png" alt={`${t.common.appName} Logo`} />
          </Link>

          <nav className="landingBNavLinks" aria-label="Landing Navigation">
            <Link href={`/${locale}#features`}>{heroCopy.navFeatures}</Link>
            <Link href={`/${locale}/explore`}>{heroCopy.navExplore}</Link>
            <Link href={`/${locale}#${isGerman ? "business" : "usecases"}`}>{heroCopy.navUseCases}</Link>
            <Link href={`/${locale}#pricing`}>{heroCopy.navPrices}</Link>
          </nav>

          <div className="landingBNavActions">
            <LanguageSwitcher currentLocale={locale} />
            <Link href={`/${locale}/get-app`} className="landingBPrimary">
              {t.home.hero.ctaPrimary}
            </Link>
          </div>
        </div>

        <div className="landingBHeroGrid">
          <div className="landingBHeroCopy">
            <span className="landingBEyebrow">Mioseg qr</span>
            <h1>
              <span>{heroCopy.headline1}</span>
              <span>{heroCopy.headline2}</span>
              <span>{heroCopy.headline3}</span>
            </h1>
            <p>{heroCopy.text}</p>

            <div className="landingBActions">
              <Link href={`/${locale}/explore`} className="landingBPrimary">
                {heroCopy.ctaExplore}
              </Link>
              <Link href={`/${locale}#${isGerman ? "qrx-explained" : "features"}`} className="landingBSecondary">
                {isGerman ? "QR-X verstehen" : "Mehr erfahren"}
              </Link>
            </div>

            {isGerman && (
              <div className="landingBPromise">
                <span>✓ Kostenlos starten</span><span>✓ Keine Abo-Pflicht</span><span>✓ App & Web</span>
              </div>
            )}
            {!isGerman && (
              <div className="landingBStoreRow">
                <div className="landingBStorePlaceholder">App Store</div>
                <div className="landingBStorePlaceholder">Google Play</div>
              </div>
            )}
          </div>

          <div className="landingBHeroVisual">
            <div className="landingBOrb orbOne" />
            <div className="landingBOrb orbTwo" />

            <div className="landingBHeroPhoneFrame">
              <Image
                src={landingImages.heroPhone}
                alt={publicUi.heroImageAlt}
                width={945}
                height={2048}
                className="landingBHeroPhone"
                priority
              />
            </div>

            <div className="landingBHeroFeature featureOne">
              <span>⌗</span>
              <div><strong>{heroCopy.miniScan}</strong><p>{heroCopy.miniScanText}</p></div>
            </div>
            <div className="landingBHeroFeature featureTwo">
              <span>▣</span>
              <div><strong>{heroCopy.miniSave}</strong><p>{heroCopy.miniSaveText}</p></div>
            </div>
            <div className="landingBHeroFeature featureThree">
              <span>⌖</span>
              <div><strong>{heroCopy.miniExplore}</strong><p>{heroCopy.miniExploreText}</p></div>
            </div>
          </div>
        </div>
      </section>

      {isGerman && (
        <>
          <section className="landingBProblem landingBDarkBand">
            <div className="landingBSectionHeader">
              <span className="landingBEyebrow">Warum Mioseg qr?</span>
              <h2>Gescannt. Geschlossen. Später nie wiedergefunden.</h2>
              <p>Ein normaler QR-Code ist oft nur ein kurzer Weg zu einer Seite. Mioseg qr macht aus dem Scan etwas, das du speichern, wiederfinden und weiter nutzen kannst.</p>
            </div>
            <div className="landingBProblemAnswer">
              <strong>Scannen → speichern → wiederfinden → folgen → entdecken.</strong>
              <span>Und Unternehmen können genau diese Verbindung dauerhaft mit aktuellen Informationen versorgen.</span>
            </div>
          </section>

          <section id="qrx-explained" className="landingBQrxAha">
            <div className="landingBSectionHeader">
              <span className="landingBEyebrow">Der QR-X Aha-Moment</span>
              <h2>Ein normaler QR-Code öffnet ein Ziel. Ein QR-X bleibt nützlich.</h2>
              <p>Der QR-X bleibt derselbe. Die Informationen dahinter können jederzeit aktualisiert und erweitert werden.</p>
            </div>
            <div className="landingBCompare">
              <div className="landingBCompareOld">
                <span>Normaler QR-Code</span><strong>QR</strong><p>Ein Scan → ein Link</p>
              </div>
              <div className="landingBCompareArrow"><span>→</span><small>wird zu</small></div>
              <div className="landingBCompareNew">
                <div className="landingBCompareNewHead"><span>QR-X</span><strong>QR-X</strong></div>
                <div className="landingBFeatureCloud">{['Bilder','PDF & Dateien','Standort','Kontakt','News','Updates','Follow','Passwort'].map(x => <b key={x}>{x}</b>)}</div>
                <p className="landingBQrxCoreText">Ein dauerhaft verwaltbarer digitaler Informationspunkt für reale Dinge, Orte und Projekte.</p>
              </div>
            </div>
            <div className="landingBStatement">Einmal verbinden. Dauerhaft aktuell halten.</div>
          </section>

          <HomeAudienceDemos />

          <section className="landingBExploreValue" aria-labelledby="explore-value-title">
            <div className="landingBSectionHeader">
              <span className="landingBEyebrow">Explore verbindet beide Seiten</span>
              <h2 id="explore-value-title">Entdecken für Nutzer. Sichtbarkeit für Unternehmen.</h2>
              <p>Explore macht QR-X auf der Karte auffindbar und zeigt, was sich an realen Orten befindet.</p>
            </div>
            <div className="landingBExploreValueGrid">
              <div className="landingBExplorePhone">
                <Image src={landingImages.appExplore} alt="Mioseg qr Explore Karte" width={945} height={2048} className="landingBExploreShot" />
              </div>
              <div className="landingBExploreValueCards">
                <article>
                  <span className="landingBAudienceBadge">Für Nutzer</span>
                  <h3>Entdecke, was um dich herum interessant ist.</h3>
                  <p>Finde QR-X in deiner Nähe, öffne Orte und Angebote, speichere interessante Einträge und navigiere direkt dorthin.</p>
                  <div className="landingBExploreTags"><span>In meiner Nähe</span><span>Kategorien</span><span>Speichern</span><span>Navigation</span></div>
                </article>
                <article className="landingBExploreBusinessCard">
                  <span className="landingBAudienceBadge">Für Unternehmen</span>
                  <h3>Zeige, wo dein Unternehmen aktiv ist.</h3>
                  <p>Ein Immobilienunternehmen kann seine angebotenen Objekte auf Explore sichtbar machen. Interessenten sehen, wo sie liegen, öffnen den passenden QR-X und gelangen direkt zu Informationen, Kontakt und Navigation.</p>
                  <small>Dasselbe Prinzip funktioniert für Projekte, Filialen, Standorte und Servicepunkte.</small>
                </article>
              </div>
            </div>
            <div className="landingBExploreAction"><Link href={`/${locale}/explore`} className="landingBPrimary">Explore ansehen</Link></div>
          </section>

          <section className="landingBFollow">
            <div className="landingBFollowCopy">
              <span className="landingBEyebrow">Scannen ist nur der Anfang</span>
              <h2>Folge einem QR-X und bleib auf dem Laufenden.</h2>
              <p>Wenn sich wichtige Inhalte ändern, kann Mioseg qr dich darüber informieren. Der QR-X bleibt derselbe – nur die Information dahinter wird aktueller.</p>
              <div className="landingBFollowExamples"><span>🏠 Preis geändert</span><span>📄 Neues Dokument</span><span>🔧 Wartung aktualisiert</span><span>🎟️ Termin geändert</span></div>
            </div>
            <div className="landingBFollowFlow">
              <div><b>1</b><strong>QR-X speichern oder folgen</strong><small>Einmal verbinden</small></div><i>→</i>
              <div><b>2</b><strong>Inhalt wird aktualisiert</strong><small>Der QR-X bleibt</small></div><i>→</i>
              <div className="landingBPushCard"><b>🔔</b><strong>Du erfährst es.</strong><small>Aktuell bleiben</small></div>
            </div>
          </section>
        </>
      )}

      <section className="landingBVideo">
        <div className="landingBVideoCopy">
          <span className="landingBEyebrow">{releaseCopy.videoEyebrow}</span>
          <h2>{releaseCopy.videoTitle}</h2>
          <p>{releaseCopy.videoText}</p>
        </div>

        <div className="landingBVideoFrame">
          <video
            controls
            preload="metadata"
            poster={landingImages.videoPoster}
            playsInline
            aria-label={releaseCopy.videoTitle}
          >
            <source src={PROMO_VIDEO_SRC} type="video/mp4" />
          </video>


        </div>
      </section>

      <section id="features" className="landingBQrx">
        <div className="landingBSectionHeader">
          <span className="landingBEyebrow">{releaseCopy.qrxEyebrow}</span>
          <h2>{releaseCopy.qrxTitle}</h2>
          <p>{releaseCopy.qrxText}</p>
        </div>

        <div className="landingBQrxFeatures">
          <div><span>▧</span><strong>{releaseCopy.qrxMedia}</strong></div>
          <div><span>⌖</span><strong>{releaseCopy.qrxLocation}</strong></div>
          <div><span>↗</span><strong>{releaseCopy.qrxActions}</strong></div>
          <div><span>↻</span><strong>{releaseCopy.qrxUpdates}</strong></div>
          <div><span>🔐</span><strong>{publicUi.passwordTitle}</strong></div>
        </div>
      </section>

      <section className="landingBShowcase" aria-labelledby="app-showcase-title">
        <div className="landingBSectionHeader landingBShowcaseHeader">
          <span className="landingBEyebrow">{showcaseCopy.eyebrow}</span>
          <h2 id="app-showcase-title">{showcaseCopy.title}</h2>
          <p>{showcaseCopy.text}</p>
        </div>

        <div className="landingBShowcaseGrid">
          <article className="landingBShowcaseCard">
            <div className="landingBShotWrap">
              <Image src={landingImages.appExplore} alt={showcaseCopy.exploreTitle} width={945} height={2048} className="landingBShot" />
            </div>
            <div className="landingBShowcaseBody">
              <span className="landingBShowcaseNumber">01</span>
              <h3>{showcaseCopy.exploreTitle}</h3>
              <p>{showcaseCopy.exploreText}</p>
            </div>
          </article>

          <article className="landingBShowcaseCard">
            <div className="landingBShotWrap">
              <Image src={landingImages.appScans} alt={showcaseCopy.scansTitle} width={945} height={2048} className="landingBShot" />
            </div>
            <div className="landingBShowcaseBody">
              <span className="landingBShowcaseNumber">02</span>
              <h3>{showcaseCopy.scansTitle}</h3>
              <p>{showcaseCopy.scansText}</p>
            </div>
          </article>

          <article className="landingBShowcaseCard landingBShowcaseCardGold">
            <div className="landingBShotWrap">
              <Image src={landingImages.appBusiness} alt={showcaseCopy.businessTitle} width={945} height={2048} className="landingBShot" />
            </div>
            <div className="landingBShowcaseBody">
              <span className="landingBShowcaseNumber">03</span>
              <h3>{showcaseCopy.businessTitle}</h3>
              <p>{showcaseCopy.businessText}</p>
            </div>
          </article>
        </div>
      </section>

      {!isGerman && (
      <section id="usecases" className="landingBUseCases">
        <div className="landingBSectionHeader">
          <span className="landingBEyebrow">{publicUi.useCasesEyebrow}</span>
          <h2>{publicUi.useCasesTitle}</h2>
        </div>

        <div className="landingBUseGrid">
          {professionalUseCases.map((item) => (
            <article key={item.title} className="landingBUseCard">
              <div className="landingBUseImage">
                <Image src={item.image} alt={item.title} width={720} height={460} />
              </div>

              <div className="landingBUseBody">
                <div className="landingBUseIcon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      )}

      {isGerman && (
        <section className="landingBTrust">
          <div className="landingBSectionHeader">
            <span className="landingBEyebrow">Für den professionellen Einsatz</span>
            <h2>Mehr als Inhalte hinter einem Code.</h2>
            <p>QR-X kombiniert die Informationen mit Funktionen, die auch im professionellen Einsatz wichtig sind.</p>
          </div>
          <div className="landingBTrustGrid">
            <div><span>🔐</span><strong>Passwortschutz</strong><p>Zugriff auf geschützte QR-X gezielt absichern.</p></div>
            <div><span>▧</span><strong>Dateien & Medien</strong><p>Dokumente, Bilder und weitere Inhalte zentral bereitstellen.</p></div>
            <div><span>⌖</span><strong>Standort & Explore</strong><p>Reale Orte mit digitalen Informationen verbinden.</p></div>
            <div><span>↗</span><strong>Kontakt & Aktionen</strong><p>Telefon, Website, E-Mail oder Navigation direkt erreichbar machen.</p></div>
            <div><span>↻</span><strong>Updates</strong><p>Informationen ändern, ohne den QR-X auszutauschen.</p></div>
            <div><span>▣</span><strong>App & Web</strong><p>Mit demselben Konto plattformübergreifend arbeiten.</p></div>
          </div>
        </section>
      )}

      <section className="landingBBenefits">
        <div><span>✦</span><strong>Kostenlos starten</strong><p>Erster normaler QR-X immer kostenlos.</p></div>
        <div><span>✕</span><strong>Keine Abo-Pflicht</strong><p>Zahle nur, wenn du Credits brauchst.</p></div>
        <div><span>⬡</span><strong>Zugriff & Datenschutz</strong><p>Mit Schutzfunktionen wie Passwortzugriff für private QR-X.</p></div>
        <div><span>▣</span><strong>App & Web</strong><p>Überall synchron verfügbar.</p></div>
      </section>

      <section id="pricing" className="landingBPricing">
        <div className="landingBPricingCopy">
          <span className="landingBEyebrow">{releaseCopy.pricingEyebrow}</span>
          <h2>{releaseCopy.pricingTitle}</h2>
          <p>{releaseCopy.pricingText}</p>
          <Link href={`/${locale}/register`} className="landingBPrimary">
            {releaseCopy.pricingCta}
          </Link>
        </div>

        <div className="landingBCreditVisual" aria-hidden="true">
          <div className="coin coinA" />
          <div className="coin coinB" />
          <div className="coin coinC" />
        </div>

        <div className="landingBPricingPoints">
          <div><span>✓</span>{releaseCopy.pricingPoint1}</div>
          <div><span>✓</span>{releaseCopy.pricingPoint2}</div>
          <div><span>✓</span>{releaseCopy.pricingPoint3}</div>
          <div><span>✓</span>Credits verfallen nicht</div>
          <div><span>✓</span>Volle Kostenkontrolle ohne versteckte Gebühren</div>
        </div>
      </section>

      <section className="landingBFinalCta">
        <div>
          <h2>{releaseCopy.finalTitle}</h2>
          <p>{releaseCopy.finalText}</p>
        </div>

        <div className="landingBActions">
          <Link href={`/${locale}/get-app`} className="landingBPrimary">{releaseCopy.finalApp}</Link>
          <Link href={`/${locale}/explore`} className="landingBSecondary">{releaseCopy.finalExplore}</Link>
        </div>
      </section>

      <footer className="landingBFooter">
        <div className="landingBFooterBrand">
          <img src="/logo-wwhite.png" alt="Mioseg qr" />
          <span>© 2026 Mioseg qr</span>
        </div>

        <div className="landingBFooterLinks">
          <Link href={`/${locale}#features`}>{heroCopy.navFeatures}</Link>
          <Link href={`/${locale}/explore`}>{heroCopy.navExplore}</Link>
          <Link href={`/${locale}#${isGerman ? "business" : "usecases"}`}>{heroCopy.navUseCases}</Link>
          <Link href={`/${locale}#pricing`}>{heroCopy.navPrices}</Link>
          <Link href={`/${locale}/datenschutz`}>{releaseCopy.footerPrivacy}</Link>
          <Link href={`/${locale}/nutzungsbedingungen`}>{releaseCopy.footerTerms}</Link>
        </div>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
:root{--b:#06101f;--card:#0d1a2c;--line:rgba(132,157,194,.18);--txt:#f8fbff;--muted:#9aabc1;--blue:#2477ff;--violet:#9333ea}
html{scroll-behavior:smooth;background:var(--b)}body{margin:0;background:var(--b)!important}#__next{background:var(--b)}
.landingBHero,.landingBVideo,.landingBQrx,.landingBShowcase,.landingBUseCases,.landingBBenefits,.landingBPricing,.landingBFinalCta,.landingBFooter,.landingBAudience,.landingBBusiness,.landingBExploreValue,.landingBTrust{color:var(--txt)}
.landingBHero{min-height:760px;background:radial-gradient(circle at 68% 26%,rgba(41,98,255,.17),transparent 26%),radial-gradient(circle at 78% 34%,rgba(124,58,237,.14),transparent 28%),linear-gradient(180deg,#06101f 0%,#081426 100%);overflow:hidden}
.landingBNav{width:min(1280px,calc(100% - 48px));margin:0 auto;min-height:88px;display:grid;grid-template-columns:180px 1fr auto;gap:24px;align-items:center}
.landingBBrand img{width:128px;height:auto;display:block}.landingBNavLinks{display:flex;justify-content:center;gap:32px}.landingBNavLinks a,.landingBFooter a{color:rgba(255,255,255,.82);text-decoration:none;font-weight:800;font-size:14px}.landingBNavLinks a:hover,.landingBFooter a:hover{color:#fff}
.landingBNavActions,.landingBActions,.landingBStoreRow{display:flex;align-items:center;gap:12px}.landingBPrimary,.landingBSecondary{min-height:48px;display:inline-flex;align-items:center;justify-content:center;padding:0 20px;border-radius:14px;text-decoration:none;font-weight:900;transition:transform .18s ease,box-shadow .18s ease}.landingBPrimary{color:#fff;background:linear-gradient(135deg,var(--blue),var(--violet));box-shadow:0 16px 34px rgba(46,86,255,.24)}.landingBSecondary{color:#fff;border:1px solid rgba(150,169,204,.28);background:rgba(255,255,255,.03)}.landingBPrimary:hover,.landingBSecondary:hover{transform:translateY(-2px)}
.landingBHeroGrid{width:min(1280px,calc(100% - 48px));margin:0 auto;padding:62px 0 90px;display:grid;grid-template-columns:minmax(360px,.8fr) minmax(560px,1.2fr);gap:42px;align-items:center}
.landingBEyebrow{display:inline-flex;align-items:center;min-height:30px;padding:0 11px;border-radius:999px;border:1px solid rgba(129,150,189,.18);background:rgba(255,255,255,.04);color:#a9bbd3;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
.landingBHeroCopy h1{margin:18px 0 0;font-size:clamp(58px,6.6vw,98px);line-height:.94;letter-spacing:-3.7px;font-weight:950}.landingBHeroCopy h1 span{display:block}.landingBHeroCopy h1 span:last-child{background:linear-gradient(90deg,#1f74ff 0%,#2d67ff 40%,#9a32ff 100%);-webkit-background-clip:text;color:transparent}.landingBHeroCopy>p{max-width:550px;margin:28px 0;color:#c1ccdb;font-size:18px;line-height:1.72}
.landingBStoreRow{margin-top:18px}.landingBStorePlaceholder{min-width:126px;min-height:40px;display:grid;place-items:center;border-radius:10px;background:#03070d;border:1px solid rgba(255,255,255,.16);color:#fff;font-size:12px;font-weight:800}
.landingBHeroVisual{min-height:560px;position:relative}.landingBOrb{position:absolute;border-radius:50%}.orbOne{width:440px;height:440px;right:100px;top:68px;background:radial-gradient(circle at 35% 35%,rgba(41,116,255,.30),rgba(38,83,255,.05) 56%,transparent 70%);border:1px solid rgba(89,129,255,.16)}.orbTwo{width:360px;height:360px;right:20px;top:120px;background:radial-gradient(circle at 50% 50%,rgba(128,58,237,.22),transparent 66%)}
.landingBHeroPhoneFrame{position:absolute;z-index:3;left:50%;top:48%;transform:translate(-50%,-50%) rotate(2deg);width:min(300px,43vw);padding:8px;border-radius:38px;background:#03070d;border:1px solid rgba(255,255,255,.14);box-shadow:0 30px 75px rgba(0,0,0,.48),0 0 0 8px rgba(12,24,42,.72)}.landingBHeroPhone{width:100%;height:auto;display:block;border-radius:30px}
.landingBHeroFeature{position:absolute;z-index:4;width:220px;display:grid;grid-template-columns:48px 1fr;gap:13px;align-items:center;padding:14px;border-radius:18px;background:rgba(8,18,34,.86);border:1px solid rgba(120,145,185,.19);box-shadow:0 18px 36px rgba(0,0,0,.24);backdrop-filter:blur(14px)}.landingBHeroFeature>span{width:48px;height:48px;display:grid;place-items:center;border-radius:16px;color:#87a7ff;background:linear-gradient(145deg,rgba(55,116,255,.14),rgba(126,58,237,.13));font-size:20px}.landingBHeroFeature strong{font-size:14px}.landingBHeroFeature p{margin:3px 0 0;color:var(--muted);font-size:12px;line-height:1.4}.featureOne{right:0;top:94px}.featureTwo{right:-16px;top:236px}.featureThree{right:12px;top:380px}
.landingBVideo,.landingBQrx,.landingBShowcase,.landingBUseCases,.landingBBenefits,.landingBPricing,.landingBFinalCta,.landingBFooter{width:min(1280px,calc(100% - 48px));margin-left:auto;margin-right:auto}
.landingBVideo{margin-top:18px;padding:42px;display:grid;grid-template-columns:.86fr 1.14fr;gap:36px;align-items:center;border-radius:26px;background:radial-gradient(circle at 75% 30%,rgba(71,89,255,.13),transparent 30%),linear-gradient(135deg,#0a1628,#0c1728);border:1px solid var(--line)}
.landingBVideoCopy h2,.landingBSectionHeader h2,.landingBPricingCopy h2,.landingBFinalCta h2{margin:14px 0 0;color:#fff;font-size:clamp(30px,4vw,50px);line-height:1.04;letter-spacing:-1.4px}.landingBVideoCopy p,.landingBSectionHeader p,.landingBPricingCopy p,.landingBFinalCta p{color:var(--muted);line-height:1.7}
.landingBVideoFrame{min-height:290px;position:relative;overflow:hidden;border-radius:20px;background:#03070d;border:1px solid rgba(255,255,255,.08)}.landingBVideoFrame video{width:100%;height:100%;min-height:290px;display:block;object-fit:cover}
.landingBAssetHint,.landingBImageHint{position:absolute;z-index:3;display:grid;gap:2px;padding:8px 10px;border-radius:10px;background:rgba(4,8,14,.72);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:10px;backdrop-filter:blur(8px);pointer-events:none}.landingBAssetHint{right:12px;bottom:12px}.landingBAssetHint span{color:#9eabc0;font-size:9px}
.landingBQrx{padding:70px 0 46px}.landingBSectionHeader{max-width:820px;margin:0 auto 34px;text-align:center}.landingBQrxFeatures{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.landingBQrxFeatures>div{min-height:132px;display:grid;place-items:center;align-content:center;gap:12px;text-align:center;border-radius:20px;background:rgba(255,255,255,.025);border:1px solid rgba(123,147,186,.14)}.landingBQrxFeatures span{width:52px;height:52px;display:grid;place-items:center;border-radius:18px;color:#7da1ff;background:linear-gradient(145deg,rgba(36,119,255,.10),rgba(124,58,237,.10));font-size:21px}.landingBQrxFeatures strong{font-size:13px}
.landingBShowcase{padding:56px 0 38px}.landingBShowcaseHeader{margin-bottom:38px}.landingBShowcaseGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.landingBShowcaseCard{min-width:0;overflow:hidden;border-radius:24px;background:linear-gradient(180deg,#0d1a2c 0%,#091523 100%);border:1px solid rgba(128,153,194,.16);box-shadow:0 22px 50px rgba(0,0,0,.18)}.landingBShotWrap{height:430px;overflow:hidden;padding:18px 18px 0;display:flex;justify-content:center;background:radial-gradient(circle at 50% 18%,rgba(38,104,255,.17),transparent 42%),#081321}.landingBShot{display:block;width:auto;height:560px;max-width:100%;object-fit:contain;border-radius:22px 22px 0 0;box-shadow:0 20px 48px rgba(0,0,0,.38)}.landingBShowcaseBody{padding:20px 22px 24px;position:relative}.landingBShowcaseNumber{display:inline-flex;margin-bottom:10px;color:#7186a3;font-size:11px;font-weight:900;letter-spacing:.14em}.landingBShowcaseBody h3,.landingBCollectionCopy h3{margin:0;color:#fff;font-size:21px;letter-spacing:-.35px}.landingBShowcaseBody p,.landingBCollectionCopy p{margin:9px 0 0;color:var(--muted);font-size:13px;line-height:1.62}.landingBShowcaseCardGold{border-color:rgba(225,176,72,.28)}.landingBShowcaseCardGold .landingBShotWrap{background:radial-gradient(circle at 50% 18%,rgba(225,176,72,.14),transparent 44%),#0c141f}.landingBShowcaseCollection{grid-column:1/-1;display:grid;grid-template-columns:.92fr 1.08fr;min-height:470px;background:radial-gradient(circle at 20% 50%,rgba(82,71,255,.14),transparent 42%),linear-gradient(135deg,#0b1729,#0b1422)}.landingBCollectionCopy{padding:46px;display:flex;flex-direction:column;justify-content:center}.landingBCollectionCopy h3{font-size:clamp(30px,4vw,48px);letter-spacing:-1.2px}.landingBCollectionCopy p{max-width:570px;font-size:15px}.landingBCollectionBadge{align-self:flex-start;margin-bottom:16px;padding:8px 11px;border-radius:999px;background:rgba(144,91,255,.12);border:1px solid rgba(144,91,255,.28);color:#b8a3ff;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.landingBCollectionFlow{margin-top:26px;display:flex;align-items:center;flex-wrap:wrap;gap:8px}.landingBCollectionFlow span,.landingBCollectionFlow strong{padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(135,157,194,.16);font-size:12px}.landingBCollectionFlow strong{color:#fff;background:linear-gradient(135deg,rgba(36,119,255,.18),rgba(147,51,234,.18));border-color:rgba(122,96,255,.28)}.landingBCollectionFlow b{color:#7c8fa9;font-size:12px}.landingBCollectionShot{height:470px;overflow:hidden;padding:28px 32px 0;display:flex;justify-content:center;align-items:flex-start;background:linear-gradient(180deg,rgba(255,255,255,.015),transparent)}.landingBCollectionShot .landingBShot{height:600px}
.landingBUseCases{padding:44px 0 28px}.landingBUseGrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.landingBUseCard{overflow:hidden;border-radius:18px;background:#0c1829;border:1px solid rgba(124,147,184,.15)}.landingBUseImage{height:150px;position:relative;overflow:hidden;background:#091321}.landingBUseImage img{width:100%;height:100%;object-fit:cover}.landingBImageHint{left:8px;top:8px}.landingBUseBody{position:relative;padding:36px 14px 18px}.landingBUseIcon{position:absolute;left:14px;top:-24px;width:48px;height:48px;display:grid;place-items:center;border-radius:15px;background:#0d1d33;border:1px solid rgba(99,129,190,.22);font-size:20px}.landingBUseBody h3{margin:0 0 7px;font-size:16px}.landingBUseBody p{margin:0;color:var(--muted);font-size:12px;line-height:1.5}
.landingBBenefits{margin-top:24px;padding:18px 20px;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;border-radius:20px;background:#0b1627;border:1px solid var(--line)}.landingBBenefits>div{min-height:88px;display:grid;grid-template-columns:45px 1fr;column-gap:12px;align-content:center;padding:8px 18px;border-right:1px solid rgba(127,150,185,.12)}.landingBBenefits>div:last-child{border-right:none}.landingBBenefits span{grid-row:1/3;width:45px;height:45px;display:grid;place-items:center;border-radius:15px;color:#b198ff;background:rgba(124,58,237,.12)}.landingBBenefits strong{align-self:end;font-size:14px}.landingBBenefits p{margin:3px 0 0;color:var(--muted);font-size:11px}
.landingBPricing{margin-top:26px;padding:34px;display:grid;grid-template-columns:1.05fr .55fr 1fr;gap:32px;align-items:center;border-radius:22px;background:#0a1525;border:1px solid var(--line)}.landingBCreditVisual{min-height:150px;position:relative;border-radius:20px;background:radial-gradient(circle at 50% 50%,rgba(121,65,255,.24),transparent 55%),#0b1322;border:1px solid rgba(145,96,255,.22)}.coin{position:absolute;left:50%;width:92px;height:34px;border-radius:50%;transform:translateX(-50%);border:4px solid #7d43ff;box-shadow:inset 0 0 0 3px rgba(44,111,255,.55)}.coinA{top:38px}.coinB{top:64px;width:105px}.coinC{top:90px;width:118px}.landingBPricingPoints{display:grid;gap:10px}.landingBPricingPoints>div{display:flex;gap:10px;color:#dce5f1;font-size:13px}.landingBPricingPoints span{color:#a06bff}
.landingBFinalCta{margin-top:26px;padding:28px 34px;display:flex;align-items:center;justify-content:space-between;gap:32px;border-radius:20px;background:radial-gradient(circle at 75% 30%,rgba(82,71,255,.22),transparent 30%),linear-gradient(135deg,#111b3a,#17114c);border:1px solid rgba(112,91,255,.28)}.landingBFinalCta h2{font-size:clamp(28px,3.4vw,42px)}.landingBFinalCta p{margin-bottom:0}
.landingBFooter{padding:30px 0 36px;display:flex;align-items:center;justify-content:space-between;gap:24px}.landingBFooterBrand{display:flex;align-items:center;gap:14px;color:#77889f;font-size:12px}.landingBFooterBrand img{width:104px;height:auto}.landingBFooterLinks{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:16px}

.landingBPage{background:#06101f!important;color:var(--txt);overflow-x:hidden}.landingBPage:before{content:"";position:fixed;inset:0;z-index:-1;background:#06101f}
.landingBPromise{margin-top:20px;display:flex;flex-wrap:wrap;gap:8px}.landingBPromise span{padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(130,153,190,.15);color:#b9c8da;font-size:11px;font-weight:800}
.landingBJourney,.landingBProblem,.landingBOneApp,.landingBQrxAha,.landingBFollow,.landingBStories,.landingBAudience,.landingBBusiness,.landingBExploreValue,.landingBTrust{width:min(1280px,calc(100% - 48px));margin-left:auto;margin-right:auto;color:var(--txt)}
.landingBJourney{position:relative;margin-top:30px;padding:26px 24px;display:grid;grid-template-columns:repeat(8,1fr);gap:0;border:1px solid rgba(130,153,190,.16);border-radius:28px;background:linear-gradient(180deg,rgba(13,26,44,.94),rgba(7,17,31,.96));box-shadow:0 24px 70px rgba(0,0,0,.22);overflow:hidden}.landingBJourneyLine{position:absolute;left:7%;right:7%;top:45px;height:1px;background:linear-gradient(90deg,transparent,rgba(66,128,255,.65),rgba(151,69,255,.65),transparent)}.landingBJourneyStep{position:relative;z-index:1;text-align:center}.landingBJourneyStep span{width:38px;height:38px;margin:0 auto;display:grid;place-items:center;border-radius:50%;background:#0a1729;border:1px solid rgba(110,142,201,.25);color:#7295c7;font-size:9px;font-weight:950;box-shadow:0 0 0 6px #091525}.landingBJourneyStep strong{display:block;margin-top:13px;font-size:11px;letter-spacing:.015em;color:#e7edf6}
.landingBDarkBand{position:relative}.landingBProblem{padding:92px 0 54px}.landingBProblem:before{content:"";position:absolute;left:50%;top:20px;width:100vw;height:calc(100% - 10px);transform:translateX(-50%);z-index:-1;background:radial-gradient(circle at 50% 30%,rgba(35,95,210,.08),transparent 36%),linear-gradient(180deg,#06101f,#071423 50%,#06101f)}.landingBProblemGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.landingBProblemGrid article{display:flex;align-items:flex-start;gap:14px;padding:20px;border-radius:18px;background:linear-gradient(180deg,#0c1829,#091523);border:1px solid rgba(126,149,186,.14);box-shadow:0 16px 34px rgba(0,0,0,.10)}.landingBProblemGrid article>span{flex:0 0 48px;width:48px;height:48px;display:grid;place-items:center;border-radius:15px;background:rgba(255,255,255,.04);font-size:23px}.landingBProblemGrid strong{display:block;margin-top:2px;font-size:14px}.landingBProblemGrid p{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.landingBProblemAnswer{margin:20px auto 0;max-width:850px;padding:22px 28px;text-align:center;border-radius:20px;background:linear-gradient(135deg,rgba(36,119,255,.12),rgba(147,51,234,.12));border:1px solid rgba(91,100,255,.26);box-shadow:0 18px 50px rgba(40,64,190,.10)}.landingBProblemAnswer strong,.landingBProblemAnswer span{display:block}.landingBProblemAnswer strong{font-size:22px;letter-spacing:-.45px}.landingBProblemAnswer span{margin-top:6px;color:#aebdd1;font-size:13px}
.landingBOneApp{margin-top:42px;min-height:640px;display:grid;grid-template-columns:1fr .9fr;gap:54px;align-items:center;padding:62px;border-radius:32px;background:radial-gradient(circle at 82% 42%,rgba(42,100,255,.22),transparent 31%),radial-gradient(circle at 95% 75%,rgba(147,51,234,.13),transparent 30%),linear-gradient(135deg,#0b1729,#081320);border:1px solid rgba(127,151,190,.17);overflow:hidden;box-shadow:0 35px 90px rgba(0,0,0,.18)}.landingBOneApp h2,.landingBFollow h2{margin:16px 0 14px;font-size:clamp(38px,4.8vw,62px);line-height:1.01;letter-spacing:-2px}.landingBOneAppCopy>p,.landingBFollowCopy>p{max-width:650px;color:var(--muted);line-height:1.72;font-size:15px}.landingBOneAppList{margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:9px}.landingBOneAppList span{display:flex;align-items:center;gap:9px;padding:11px 12px;border-radius:13px;background:rgba(255,255,255,.032);border:1px solid rgba(126,149,186,.11);color:#dce5f1;font-size:12px;font-weight:760}.landingBOneAppList b{color:#6f9dff}.landingBOneAppVisual{height:520px;position:relative;display:flex;justify-content:center;align-items:flex-start}.landingBOneAppGlow{position:absolute;width:390px;height:390px;top:60px;border-radius:50%;background:radial-gradient(circle,rgba(54,109,255,.24),rgba(126,58,237,.08) 45%,transparent 70%);filter:blur(2px)}.landingBOneAppPhone{position:relative;z-index:2;height:630px;width:auto;max-width:72%;object-fit:contain;border-radius:30px;box-shadow:0 34px 70px rgba(0,0,0,.48),0 0 0 1px rgba(255,255,255,.08)}.landingBFloatingTag{position:absolute;z-index:3;padding:9px 12px;border-radius:999px;background:rgba(8,18,34,.88);border:1px solid rgba(123,150,196,.20);box-shadow:0 16px 34px rgba(0,0,0,.24);backdrop-filter:blur(12px);font-size:11px;font-weight:850;color:#dde7f5}.tagScan{left:0;top:64px}.tagFolder{left:-18px;top:182px}.tagMap{left:2px;top:305px}.tagBell{right:-10px;top:78px}.tagCollection{right:-34px;top:210px}.tagExplore{right:-2px;top:342px}.landingBOneAppSeal{position:absolute;z-index:4;right:8px;bottom:8px;width:122px;height:122px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#2477ff,#9333ea);box-shadow:0 22px 50px rgba(60,64,255,.34);text-align:center}.landingBOneAppSeal strong{font-size:40px;line-height:.9}.landingBOneAppSeal span{font-weight:950}.landingBOneAppSeal small{max-width:88px;margin-top:4px;font-size:9px;line-height:1.2}
.landingBQrxAha{padding:96px 0 60px}.landingBQrxAha .landingBSectionHeader{max-width:900px}.landingBCompare{display:grid;grid-template-columns:.62fr 90px 1.38fr;gap:22px;align-items:center}.landingBCompareOld,.landingBCompareNew{min-height:300px;padding:32px;border-radius:26px;border:1px solid var(--line);background:#0a1525}.landingBCompareOld{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;opacity:.66}.landingBCompareOld>span,.landingBCompareNewHead>span{color:#8295ae;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.landingBCompareOld>strong{margin:18px 0;font-size:56px;letter-spacing:-2px}.landingBCompareOld p{margin:0;color:var(--muted)}.landingBCompareArrow{text-align:center;color:#657c9d}.landingBCompareArrow span{display:block;font-size:38px}.landingBCompareArrow small{display:block;margin-top:4px;font-size:9px;text-transform:uppercase;letter-spacing:.12em}.landingBCompareNew{position:relative;overflow:hidden;background:radial-gradient(circle at 18% 18%,rgba(36,119,255,.18),transparent 35%),radial-gradient(circle at 82% 78%,rgba(147,51,234,.13),transparent 36%),#0b1729}.landingBCompareNew:after{content:"";position:absolute;inset:auto -90px -120px auto;width:260px;height:260px;border-radius:50%;border:1px solid rgba(115,88,255,.16)}.landingBCompareNewHead{display:flex;align-items:end;justify-content:space-between;gap:18px}.landingBCompareNewHead strong{font-size:54px;letter-spacing:-2px}.landingBFeatureCloud{position:relative;z-index:1;margin-top:28px;display:flex;flex-wrap:wrap;gap:9px}.landingBFeatureCloud b{padding:10px 13px;border-radius:999px;background:rgba(255,255,255,.055);border:1px solid rgba(131,153,190,.16);font-size:11px}.landingBStatement{margin-top:26px;text-align:center;font-size:clamp(34px,4.6vw,56px);font-weight:950;letter-spacing:-1.8px;background:linear-gradient(90deg,#4b95ff,#b15bff);-webkit-background-clip:text;color:transparent}
.landingBFollow{margin-top:52px;padding:52px;display:grid;grid-template-columns:.88fr 1.12fr;gap:44px;align-items:center;border-radius:28px;background:radial-gradient(circle at 84% 40%,rgba(116,62,255,.10),transparent 32%),linear-gradient(135deg,#0a1628,#0d1729);border:1px solid var(--line)}.landingBFollowExamples{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}.landingBFollowExamples span{padding:9px 11px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(128,151,188,.14);font-size:11px}.landingBFollowFlow{display:flex;align-items:center;gap:9px}.landingBFollowFlow>div{flex:1;min-height:150px;padding:19px;border-radius:19px;background:#0b1728;border:1px solid rgba(126,149,186,.15);display:flex;flex-direction:column;justify-content:center}.landingBFollowFlow b{font-size:21px;color:#729aff}.landingBFollowFlow strong{margin-top:10px;font-size:13px}.landingBFollowFlow small{margin-top:4px;color:var(--muted)}.landingBFollowFlow i{color:#667a98;font-style:normal}.landingBFollowFlow .landingBPushCard{border-color:rgba(147,81,255,.38);background:linear-gradient(145deg,rgba(36,119,255,.12),rgba(147,51,234,.16));box-shadow:0 18px 42px rgba(75,54,200,.12)}
.landingBStories{padding:86px 0 38px}.landingBStoryGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.landingBStoryGrid article{padding:30px;border-radius:24px;background:linear-gradient(180deg,#0c1829,#091523);border:1px solid var(--line)}.landingBStoryIcon{font-size:36px}.landingBStoryGrid h3{margin:16px 0 8px;font-size:23px}.landingBStoryGrid p{min-height:92px;color:var(--muted);font-size:13px;line-height:1.68}.landingBStoryGrid strong{display:block;padding-top:15px;border-top:1px solid rgba(126,149,186,.12);color:#e5ecf6;font-size:12px}

.landingBQrxCoreText{position:relative;z-index:1;margin:24px 0 0;color:#b8c7db;font-size:13px;line-height:1.65;max-width:590px}
.landingBAudience{padding:78px 0 38px}.landingBAudienceGrid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.landingBAudienceCard{padding:34px;border-radius:28px;background:linear-gradient(180deg,#0c192b,#091523);border:1px solid rgba(126,149,186,.16)}.landingBAudienceCardBusiness{background:radial-gradient(circle at 90% 12%,rgba(214,170,55,.13),transparent 34%),linear-gradient(180deg,#111a27,#0a1523);border-color:rgba(214,170,55,.25)}.landingBAudienceBadge{display:inline-flex;padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.055);border:1px solid rgba(139,160,194,.16);color:#b9c8db;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.landingBAudienceCard h3,.landingBExploreValueCards h3{margin:17px 0 10px;font-size:clamp(25px,3vw,36px);line-height:1.08;letter-spacing:-1px}.landingBAudienceCard p,.landingBExploreValueCards p{margin:0;color:var(--muted);font-size:14px;line-height:1.72}.landingBAudienceFlow{margin-top:24px;display:flex;align-items:center;flex-wrap:wrap;gap:8px}.landingBAudienceFlow span{padding:9px 11px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(126,149,186,.13);font-size:11px;font-weight:850}.landingBAudienceFlow b{color:#697f9e;font-size:11px}
.landingBAudienceSelector{align-items:stretch}.landingBAudienceChoice{appearance:none;width:100%;color:inherit;text-align:left;font:inherit;cursor:pointer;position:relative;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease}.landingBAudienceChoice:hover{transform:translateY(-3px);border-color:rgba(82,132,255,.38)}.landingBAudienceChoice:focus-visible{outline:2px solid #6f8dff;outline-offset:4px}.landingBAudienceChoiceActive{border-color:rgba(87,126,255,.68)!important;box-shadow:0 0 0 1px rgba(87,126,255,.25),0 22px 55px rgba(10,48,130,.22)}.landingBAudienceCardBusiness.landingBAudienceChoiceActive{border-color:rgba(214,170,55,.58)!important;box-shadow:0 0 0 1px rgba(214,170,55,.18),0 22px 55px rgba(111,80,15,.16)}.landingBAudienceOpenHint{display:inline-flex;margin-top:26px;color:#9fb9e8;font-size:11px;font-weight:900;letter-spacing:.02em}.landingBAudienceChoiceActive .landingBAudienceOpenHint{color:#fff}
.landingBAudienceDemoPanel{margin-top:22px;padding:28px;border-radius:28px;background:linear-gradient(180deg,#0b1728,#081321);border:1px solid rgba(126,149,186,.16);box-shadow:0 24px 60px rgba(0,0,0,.14)}.landingBAudienceDemoHead{display:grid;grid-template-columns:.9fr 1.1fr;gap:28px;align-items:end;margin-bottom:22px}.landingBAudienceDemoHead h3{margin:12px 0 0;color:#fff;font-size:clamp(24px,3vw,34px);letter-spacing:-.8px}.landingBAudienceDemoHead>p{margin:0;color:var(--muted);font-size:13px;line-height:1.65}.landingBAudienceDemoGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.landingBAudienceDemoGridPrivate{grid-template-columns:repeat(2,minmax(0,1fr));max-width:880px}.landingBAudienceDemoCard{min-width:0;overflow:hidden;border-radius:20px;background:#0d1a2c;border:1px solid rgba(128,153,194,.16);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.landingBAudienceDemoCard:hover{transform:translateY(-3px);border-color:rgba(87,126,255,.34);box-shadow:0 18px 42px rgba(0,0,0,.20)}.landingBAudienceDemoImageLink{position:relative;display:block;height:180px;overflow:hidden;background:#091321}.landingBAudienceDemoImage{width:100%;height:100%;display:block;object-fit:cover;transition:transform .28s ease}.landingBAudienceDemoCard:hover .landingBAudienceDemoImage{transform:scale(1.025)}.landingBAudienceDemoImageBadge{position:absolute;left:12px;top:12px;padding:7px 9px;border-radius:999px;background:rgba(5,13,25,.82);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);color:#fff;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.landingBAudienceDemoBody{padding:18px}.landingBAudienceDemoBody>small{color:#8398b5;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.landingBAudienceDemoBody h4{margin:7px 0 8px;color:#fff;font-size:19px;letter-spacing:-.3px}.landingBAudienceDemoBody p{margin:0;color:var(--muted);font-size:12px;line-height:1.6}.landingBAudienceDemoLink{margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#fff;text-decoration:none;font-size:12px;font-weight:900}.landingBAudienceDemoLink span{color:#7fa1ff;font-size:16px}.landingBAudienceDemoPassword{margin-top:14px;padding:10px 11px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(139,160,194,.14);font-size:10px}.landingBAudienceDemoPassword span{color:#9daec2}.landingBAudienceDemoPassword strong{color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
.landingBBusiness{margin-top:58px;display:grid;grid-template-columns:1.06fr .94fr;gap:0;overflow:hidden;border-radius:32px;background:radial-gradient(circle at 92% 15%,rgba(208,162,45,.10),transparent 30%),linear-gradient(135deg,#0b1728,#081320);border:1px solid rgba(211,168,61,.20);box-shadow:0 32px 90px rgba(0,0,0,.20)}.landingBBusinessVisual{position:relative;min-height:620px;overflow:hidden}.landingBBusinessImage{width:100%;height:100%;position:absolute;inset:0;object-fit:cover}.landingBBusinessVisual:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,16,31,.06),rgba(6,16,31,.14) 65%,rgba(6,16,31,.72))}.landingBBusinessImageLabel{position:absolute;z-index:2;left:24px;bottom:24px;display:flex;flex-direction:column;gap:4px;max-width:330px;padding:13px 15px;border-radius:15px;background:rgba(5,12,22,.78);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(12px)}.landingBBusinessImageLabel strong{font-size:13px}.landingBBusinessImageLabel span{color:#aebdd1;font-size:10px}.landingBBusinessCopy{padding:52px 48px;display:flex;flex-direction:column;justify-content:center}.landingBBusinessCopy h2{margin:16px 0 14px;font-size:clamp(38px,4.7vw,60px);line-height:1.01;letter-spacing:-2px}.landingBBusinessCopy>p{color:var(--muted);font-size:14px;line-height:1.72}.landingBBusinessInfoGrid{margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.landingBBusinessInfoGrid span{padding:10px 11px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(128,151,188,.12);font-size:11px;color:#dbe5f1}.landingBBusinessPromise{margin-top:24px;padding:18px 20px;border-radius:18px;background:linear-gradient(135deg,rgba(214,169,55,.12),rgba(255,255,255,.025));border:1px solid rgba(214,169,55,.25)}.landingBBusinessPromise strong{font-size:18px}.landingBBusinessPromise p{margin:6px 0 0;color:#b6c3d5;font-size:12px;line-height:1.6}.landingBBusinessTransfer{margin-top:18px!important;color:#d3dcea!important;font-weight:750}
.landingBExploreValue{padding:96px 0 48px}.landingBExploreValueGrid{display:grid;grid-template-columns:.72fr 1.28fr;gap:26px;align-items:stretch}.landingBExplorePhone{min-height:600px;display:flex;justify-content:center;align-items:flex-start;padding:28px 24px 0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at 50% 22%,rgba(36,119,255,.20),transparent 42%),#081321;border:1px solid rgba(124,148,187,.16)}.landingBExploreShot{height:690px;width:auto;max-width:90%;object-fit:contain;border-radius:28px;box-shadow:0 30px 70px rgba(0,0,0,.44)}.landingBExploreValueCards{display:grid;grid-template-rows:1fr 1fr;gap:16px}.landingBExploreValueCards article{padding:34px;border-radius:26px;background:linear-gradient(180deg,#0c1829,#091523);border:1px solid rgba(126,149,186,.15)}.landingBExploreValueCards .landingBExploreBusinessCard{background:radial-gradient(circle at 88% 18%,rgba(214,169,55,.11),transparent 36%),linear-gradient(180deg,#101925,#091523);border-color:rgba(214,169,55,.22)}.landingBExploreTags{display:flex;flex-wrap:wrap;gap:7px;margin-top:20px}.landingBExploreTags span{padding:8px 10px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(126,149,186,.14);font-size:10px;font-weight:800}.landingBExploreBusinessCard small{display:block;margin-top:18px;padding-top:16px;border-top:1px solid rgba(129,151,187,.12);color:#c5d0df;line-height:1.55}.landingBExploreAction{margin-top:24px;text-align:center}
.landingBTrust{padding:74px 0 22px}.landingBTrustGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.landingBTrustGrid>div{padding:22px;border-radius:19px;background:#0b1728;border:1px solid rgba(126,149,186,.14)}.landingBTrustGrid span{width:42px;height:42px;display:grid;place-items:center;border-radius:13px;background:rgba(36,119,255,.09);margin-bottom:14px}.landingBTrustGrid strong{display:block;font-size:14px}.landingBTrustGrid p{margin:7px 0 0;color:var(--muted);font-size:11px;line-height:1.55}

.landingBDemoWorlds{width:min(1280px,calc(100% - 48px));margin:72px auto 24px;color:var(--txt)}
.landingBDemoBridge{display:grid;grid-template-columns:1fr auto 1.08fr auto 1fr;gap:14px;align-items:center;margin:0 0 24px;padding:20px;border-radius:24px;background:linear-gradient(135deg,#0a1728,#0c1a2e);border:1px solid rgba(126,149,186,.16)}
.landingBDemoBridge>div{min-height:122px;padding:18px;border-radius:18px;background:rgba(255,255,255,.025);border:1px solid rgba(126,149,186,.12);display:flex;flex-direction:column;justify-content:center}.landingBDemoBridge>b{color:#667d9d}.landingBDemoBridge strong{margin-top:12px;font-size:16px}.landingBDemoBridge small{margin-top:6px;color:var(--muted);line-height:1.55}.landingBDemoBridgeCore{background:linear-gradient(135deg,rgba(36,119,255,.13),rgba(147,51,234,.13))!important;border-color:rgba(95,96,255,.28)!important}.landingBDemoBridgeCore>span{font-weight:950;font-size:25px;background:linear-gradient(90deg,#5f96ff,#b16aff);-webkit-background-clip:text;color:transparent}
.landingBDemoColumns{display:grid;grid-template-columns:1fr 1fr;gap:18px}.landingBDemoColumn{padding:30px;border-radius:28px;background:linear-gradient(180deg,#0c192b,#081422);border:1px solid rgba(126,149,186,.15)}.landingBDemoColumnBusiness{background:radial-gradient(circle at 95% 5%,rgba(214,169,55,.10),transparent 30%),linear-gradient(180deg,#101925,#081422);border-color:rgba(214,169,55,.20)}.landingBDemoColumnHead h3{margin:15px 0 8px;font-size:clamp(26px,3vw,38px);letter-spacing:-1px}.landingBDemoColumnHead p{margin:0 0 22px;color:var(--muted);line-height:1.65;font-size:13px}
.landingBDemoCards,.landingBPrivateExamples{display:grid;gap:10px}.landingBDemoCards article,.landingBPrivateExamples article{display:grid;grid-template-columns:54px 1fr;gap:14px;padding:17px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(126,149,186,.12)}.landingBDemoCards article.landingBDemoFeatured{border-color:rgba(151,92,255,.28);background:linear-gradient(135deg,rgba(73,78,255,.09),rgba(147,51,234,.07))}.landingBDemoIcon{width:50px;height:50px;display:grid;place-items:center;border-radius:15px;background:rgba(255,255,255,.045);font-size:23px}.landingBDemoCards small,.landingBPrivateExamples small{color:#8398b5;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.landingBDemoCards h4,.landingBPrivateExamples h4{margin:4px 0 5px;font-size:17px}.landingBDemoCards p,.landingBPrivateExamples p{margin:0;color:var(--muted);font-size:11px;line-height:1.55}.landingBDemoStatus,.landingBDemoPassword{display:inline-flex;margin-top:10px;padding:6px 8px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(126,149,186,.12);color:#aebed2;font-size:9px;font-weight:850}.landingBDemoLink{display:inline-flex;align-items:center;margin-top:11px;color:#8fb1ff;text-decoration:none;font-size:11px;font-weight:900}.landingBDemoLink:hover{color:#fff;text-decoration:underline}
.landingBPrivateBenefits{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}.landingBPrivateBenefits>div{padding:16px;border-radius:17px;background:rgba(36,119,255,.045);border:1px solid rgba(91,128,194,.14)}.landingBPrivateBenefits span{font-size:20px}.landingBPrivateBenefits strong{display:block;margin-top:9px;font-size:13px}.landingBPrivateBenefits p{margin:5px 0 0;color:var(--muted);font-size:10px;line-height:1.5}.landingBPrivateExamples{margin-top:10px}.landingBNoAppLock{margin-top:16px;padding:18px;border-radius:18px;background:linear-gradient(135deg,rgba(36,119,255,.10),rgba(147,51,234,.08));border:1px solid rgba(86,99,255,.22)}.landingBNoAppLock strong,.landingBNoAppLock span{display:block}.landingBNoAppLock strong{font-size:15px}.landingBNoAppLock span{margin-top:6px;color:#aebed1;font-size:11px;line-height:1.55}
@media(max-width:1120px){.landingBAudienceDemoGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.landingBAudienceDemoGridPrivate{max-width:none}.landingBAudienceDemoHead{grid-template-columns:1fr}.landingBAudienceDemoHead>p{max-width:760px}.landingBDemoColumns{grid-template-columns:1fr}.landingBDemoBridge{grid-template-columns:1fr}.landingBDemoBridge>b{transform:rotate(90deg);text-align:center}.landingBAudienceGrid,.landingBBusiness,.landingBExploreValueGrid{grid-template-columns:1fr}.landingBBusinessVisual{min-height:520px}.landingBExplorePhone{min-height:480px}.landingBExploreShot{height:570px}.landingBTrustGrid{grid-template-columns:repeat(2,1fr)}.landingBJourney{grid-template-columns:repeat(4,1fr);row-gap:22px}.landingBJourneyLine{display:none}.landingBOneApp,.landingBFollow{grid-template-columns:1fr}.landingBProblemGrid{grid-template-columns:1fr 1fr}.landingBFollowFlow{max-width:760px}.landingBStoryGrid{grid-template-columns:1fr 1fr}.landingBNav{grid-template-columns:1fr auto}.landingBNavLinks{display:none}.landingBHeroGrid,.landingBVideo{grid-template-columns:1fr}.landingBHeroVisual{min-height:560px}.landingBUseGrid{grid-template-columns:repeat(3,1fr)}.landingBQrxFeatures{grid-template-columns:repeat(3,1fr)}.landingBShowcaseGrid{grid-template-columns:1fr 1fr}.landingBShowcaseCollection{grid-column:1/-1}.landingBBenefits{grid-template-columns:repeat(2,1fr)}.landingBBenefits>div:nth-child(2){border-right:none}.landingBPricing{grid-template-columns:1fr}.landingBCreditVisual{max-width:280px}}
@media(max-width:720px){.landingBAudienceDemoPanel{padding:18px 14px;border-radius:22px}.landingBAudienceDemoGrid,.landingBAudienceDemoGridPrivate{grid-template-columns:1fr}.landingBAudienceDemoImageLink{height:190px}.landingBAudienceOpenHint{margin-top:20px}.landingBDemoWorlds{width:min(100% - 28px,1280px);margin-top:52px}.landingBDemoColumn{padding:22px 18px}.landingBPrivateBenefits{grid-template-columns:1fr}.landingBDemoCards article,.landingBPrivateExamples article{grid-template-columns:46px 1fr}.landingBDemoIcon{width:44px;height:44px}.landingBAudience,.landingBBusiness,.landingBExploreValue,.landingBTrust{width:min(100% - 28px,1280px)}.landingBAudience{padding-top:54px}.landingBAudienceCard{padding:24px 20px}.landingBBusiness{margin-top:34px;border-radius:24px}.landingBBusinessVisual{min-height:360px}.landingBBusinessCopy{padding:28px 20px}.landingBBusinessCopy h2{font-size:38px;letter-spacing:-1.4px}.landingBBusinessInfoGrid{grid-template-columns:1fr}.landingBExploreValue{padding-top:64px}.landingBExplorePhone{min-height:390px}.landingBExploreShot{height:480px}.landingBExploreValueCards article{padding:24px 20px}.landingBTrustGrid{grid-template-columns:1fr}.landingBJourney,.landingBProblem,.landingBOneApp,.landingBQrxAha,.landingBFollow,.landingBStories{width:min(100% - 28px,1280px)}.landingBJourney{grid-template-columns:repeat(2,1fr);padding:20px 14px;row-gap:18px}.landingBProblem{padding-top:56px}.landingBProblemGrid,.landingBStoryGrid{grid-template-columns:1fr}.landingBOneApp,.landingBFollow{padding:26px 20px}.landingBOneAppList{grid-template-columns:1fr}.landingBOneAppVisual{height:420px}.landingBOneAppPhone{height:500px;max-width:70%}.landingBFloatingTag{font-size:9px;padding:7px 9px}.tagScan{left:0;top:55px}.tagFolder{left:-4px;top:145px}.tagMap{left:0;top:255px}.tagBell{right:0;top:68px}.tagCollection{right:-4px;top:174px}.tagExplore{right:0;top:290px}.landingBOneAppSeal{width:96px;height:96px;right:0;bottom:8px}.landingBCompare{grid-template-columns:1fr}.landingBCompareArrow span{transform:rotate(90deg);display:inline-block}.landingBCompareArrow{text-align:center}.landingBFollowFlow{flex-direction:column;align-items:stretch}.landingBFollowFlow i{transform:rotate(90deg);text-align:center}.landingBStoryGrid p{min-height:0}.landingBNav,.landingBHeroGrid,.landingBVideo,.landingBQrx,.landingBShowcase,.landingBUseCases,.landingBBenefits,.landingBPricing,.landingBFinalCta,.landingBFooter{width:min(100% - 28px,1280px)}.landingBNav{min-height:74px;grid-template-columns:1fr auto}.landingBNavActions>:first-child{display:none}.landingBPrimary,.landingBSecondary{min-height:44px;padding:0 16px}.landingBHeroGrid{padding:44px 0 64px}.landingBHeroCopy h1{font-size:54px;letter-spacing:-2.6px}.landingBHeroVisual{min-height:470px}.landingBHeroPhoneFrame{width:260px}.landingBHeroFeature{width:180px;padding:10px}.featureOne{right:0;top:52px}.featureTwo{right:0;top:174px}.featureThree{right:0;top:298px}.landingBVideo{padding:24px}.landingBVideoFrame,.landingBVideoFrame video{min-height:220px}.landingBQrx{padding-top:56px}.landingBQrxFeatures,.landingBUseGrid{grid-template-columns:1fr 1fr}.landingBShowcaseGrid{grid-template-columns:1fr}.landingBShowcaseCollection{grid-column:auto;grid-template-columns:1fr}.landingBShotWrap{height:390px}.landingBShowcaseCard .landingBShot{height:510px}.landingBCollectionCopy{padding:28px 22px}.landingBCollectionShot{height:390px;padding:18px 18px 0}.landingBCollectionShot .landingBShot{height:500px}.landingBBenefits{grid-template-columns:1fr}.landingBBenefits>div{border-right:none;border-bottom:1px solid rgba(127,150,185,.12)}.landingBBenefits>div:last-child{border-bottom:none}.landingBPricing,.landingBFinalCta{padding:24px 20px}.landingBFinalCta{align-items:flex-start;flex-direction:column}.landingBFinalCta .landingBActions{width:100%;flex-direction:column}.landingBFinalCta .landingBActions a{width:100%}.landingBFooter{align-items:flex-start;flex-direction:column}.landingBFooterLinks{justify-content:flex-start}}
          `.trim(),
        }}
      />
    </main>
  );
}
