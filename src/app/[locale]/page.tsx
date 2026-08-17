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

  const heroStory =
    locale === "de"
      ? {
          badge: "Neue Hero Experience",
          scanLabel: "QR-Code erkannt",
          scanTitle: "Wohnung QR-X",
          scanText: "Exposé, Bilder, Dateien und Kontakt direkt öffnen.",
          folderLabel: "Gespeichert",
          folderTitle: "Ordner: Wohnungen",
          mapLabel: "Standort gemerkt",
          mapTitle: "Scan auf der Karte",
          detailLabel: "QR-X Detailansicht",
          detailTitle: "Alle Infos an einem Ort",
          detail1: "Bilder & Grundriss",
          detail2: "PDF-Dateien",
          detail3: "Ansprechpartner",
          flow1: "Scannen",
          flow2: "Speichern",
          flow3: "Wiederfinden",
        }
      : {
          badge: "New hero experience",
          scanLabel: "QR code detected",
          scanTitle: "Apartment QR-X",
          scanText: "Open exposé, images, files and contact instantly.",
          folderLabel: "Saved",
          folderTitle: "Folder: Apartments",
          mapLabel: "Location saved",
          mapTitle: "Scan on the map",
          detailLabel: "QR-X detail view",
          detailTitle: "Everything in one place",
          detail1: "Images & floor plan",
          detail2: "PDF files",
          detail3: "Contact person",
          flow1: "Scan",
          flow2: "Save",
          flow3: "Find again",
        };

  const realLifeUseCases =
    locale === "de"
      ? [
          {
            icon: "🏠",
            label: "Immobilien",
            title: "Wohnung oder Haus digital zeigen",
            text: "Ein QR-X an der Wohnung öffnet Exposé, Bilder, Grundriss, Energieausweis, Ansprechpartner und Standort – alles sofort abrufbar.",
            chips: ["Exposé", "PDF-Dateien", "Kontakt"],
          },
          {
            icon: "🍽️",
            label: "Gastronomie",
            title: "Speisekarte, Reservierung und Updates",
            text: "Restaurants können Speisekarten, Aktionen, Öffnungszeiten und Reservierungslinks über einen dynamischen QR-X aktuell halten.",
            chips: ["Speisekarte", "Reservierungslink", "Öffnungszeiten"],
          },
          {
            icon: "🚗",
            label: "Fahrzeuge",
            title: "Fahrzeugdaten direkt am Auto",
            text: "Autoverkäufer zeigen Ausstattung, Bilder, Videos, Preisänderungen und Kontakt direkt über einen QR-X am Fahrzeug.",
            chips: ["Bilder", "Ausstattung", "Preisupdate"],
          },
          {
            icon: "🎉",
            label: "Events",
            title: "Infos, Lageplan und Änderungen",
            text: "Veranstalter teilen Programm, Tickets, Lageplan und kurzfristige Änderungen – Nutzer speichern den QR-X und bleiben informiert.",
            chips: ["Tickets", "Programm", "Updates"],
          },
          {
            icon: "🏢",
            label: "Unternehmen",
            title: "Digitale Visitenkarte mit Mehrwert",
            text: "Unternehmen verbinden Kontakt, Leistungen, Website, Anfahrt und aktuelle Angebote in einem einzigen QR-X.",
            chips: ["Kontakt", "Leistungen", "Anfahrt"],
          },
          {
            icon: "📍",
            label: "Alltag",
            title: "Scannen, speichern, wiederfinden",
            text: "Nutzer verlieren interessante QR-Codes nicht mehr. Sie speichern sie in Ordnern und sehen später auf der Karte, wo sie gescannt wurden.",
            chips: ["Ordner", "Karte", "Verlauf"],
          },
          {
            icon: "🔐",
            label: "Privat teilen",
            title: "QR-X optional mit Passwort schützen",
            text: "Sensible Inhalte wie Exposés, interne Dateien oder private Eventinfos können nur für Personen sichtbar sein, die das Passwort kennen.",
            chips: ["Passwort", "Privat", "Kontrollierter Zugriff"],
          },
        ]
      : [
          {
            icon: "🏠",
            label: "Real estate",
            title: "Show apartments and houses digitally",
            text: "A QR-X at the property opens exposé, images, floor plan, energy certificate, contact and location instantly.",
            chips: ["Exposé", "PDF files", "Contact"],
          },
          {
            icon: "🍽️",
            label: "Restaurants",
            title: "Menu, booking and updates",
            text: "Restaurants can keep menus, offers, opening hours and booking links up to date through one dynamic QR-X.",
            chips: ["Menu", "Booking link", "Hours"],
          },
          {
            icon: "🚗",
            label: "Vehicles",
            title: "Vehicle details directly at the car",
            text: "Car sellers show specs, images, videos, price updates and contact directly through a QR-X on the vehicle.",
            chips: ["Images", "Specs", "Price update"],
          },
          {
            icon: "🎉",
            label: "Events",
            title: "Info, map and changes",
            text: "Organizers share program, tickets, venue map and last-minute updates. Users save the QR-X and stay informed.",
            chips: ["Tickets", "Program", "Updates"],
          },
          {
            icon: "🏢",
            label: "Business",
            title: "A digital business card with value",
            text: "Businesses connect contact, services, website, directions and current offers in one single QR-X.",
            chips: ["Contact", "Services", "Directions"],
          },
          {
            icon: "📍",
            label: "Everyday use",
            title: "Scan, save, find again",
            text: "Users no longer lose interesting QR codes. They save them in folders and later see where they scanned them on the map.",
            chips: ["Folders", "Map", "History"],
          },
          {
            icon: "🔐",
            label: "Private sharing",
            title: "Protect QR-X with an optional password",
            text: "Sensitive content such as exposés, internal files or private event information can be visible only to people who know the password.",
            chips: ["Password", "Private", "Controlled access"],
          },
        ];

  const conversionReasons =
    locale === "de"
      ? [
          {
            icon: "📁",
            title: "QR-Codes gehen nicht mehr verloren",
            text: "Scans werden gespeichert, sortiert und später wiedergefunden.",
          },
          {
            icon: "📍",
            title: "Jeder Scan bekommt Kontext",
            text: "Du siehst auf der Karte, wo ein QR-Code gescannt wurde.",
          },
          {
            icon: "🔔",
            title: "QR-X kann sich aktualisieren",
            text: "Gespeicherte QR-X können neue Informationen und Änderungen anzeigen.",
          },
          {
            icon: "🔐",
            title: "Optional privat teilen",
            text: "Sensible QR-X können später mit Passwortschutz abgesichert werden.",
          },
        ]
      : [
          {
            icon: "📁",
            title: "QR codes no longer get lost",
            text: "Scans are saved, sorted and easy to find again later.",
          },
          {
            icon: "📍",
            title: "Every scan gets context",
            text: "You can see on the map where a QR code was scanned.",
          },
          {
            icon: "🔔",
            title: "QR-X can update over time",
            text: "Saved QR-X can show new information and changes.",
          },
          {
            icon: "🔐",
            title: "Optionally private sharing",
            text: "Sensitive QR-X can later be protected with a password.",
          },
        ];

  const trustPoints =
    locale === "de"
      ? ["Keine Abo-Pflicht", "Credits statt monatlicher Kosten", "Für Alltag und Business", "Dynamische QR-X mit Updates"]
      : ["No subscription required", "Credits instead of monthly fees", "For everyday and business use", "Dynamic QR-X with updates"];

  const explorePreviewItems =
    locale === "de"
      ? [
          { icon: "🍽️", title: "Café am Markt", category: "Gastronomie", meta: "248 Aufrufe · 36 Follower", badge: "Beliebt" },
          { icon: "🏠", title: "Wohnung Stadtpark", category: "Immobilien", meta: "Exposé · Dateien · Kontakt", badge: "QR-X" },
          { icon: "🩺", title: "Praxis Gesund", category: "Praxis & Gesundheit", meta: "Verifiziert · Route · Kontakt", badge: "Verifiziert" },
        ]
      : [
          { icon: "🍽️", title: "Market Café", category: "Restaurant", meta: "248 views · 36 followers", badge: "Popular" },
          { icon: "🏠", title: "Park Apartment", category: "Real estate", meta: "Exposé · Files · Contact", badge: "QR-X" },
          { icon: "🩺", title: "Health Practice", category: "Health", meta: "Verified · Route · Contact", badge: "Verified" },
        ];


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

      <style
        dangerouslySetInnerHTML={{
          __html: `
.miosegHeroScene {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 4px;
  overflow: hidden;
}

.miosegHeroBadge {
  width: fit-content;
  border-radius: 999px;
  padding: 8px 12px;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.miosegScanBeam {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 92px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(77, 132, 201, 0), rgba(117, 210, 255, 0.95), rgba(77, 132, 201, 0));
  box-shadow: 0 0 24px rgba(117, 210, 255, 0.85);
  animation: miosegScanMove 3.4s ease-in-out infinite;
  z-index: 3;
}

.miosegQrCard,
.miosegDetailCard,
.miosegFolderCard,
.miosegMapCard {
  position: relative;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.045));
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(18px);
}

.miosegQrCard {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 14px;
  align-items: center;
  padding: 14px;
  animation: miosegFloat 5.2s ease-in-out infinite;
}

.miosegQrVisual {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(13, 23, 38, 0.08), 0 18px 34px rgba(0, 0, 0, 0.20);
}

.miosegQrVisual span {
  border-radius: 6px;
  background: #0d1726;
}

.miosegQrVisual span:nth-child(2),
.miosegQrVisual span:nth-child(4),
.miosegQrVisual span:nth-child(8) {
  background: #4d84c9;
}

.miosegQrCard h3,
.miosegDetailCard h3 {
  margin: 4px 0 6px;
  color: #ffffff;
  font-size: 20px;
  line-height: 1.15;
  letter-spacing: -0.35px;
}

.miosegQrCard p {
  margin: 0;
  color: #b9c8da;
  font-size: 13px;
  line-height: 1.55;
}

.miosegMiniLabel {
  color: #8fc7ff;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.miosegDetailCard {
  padding: 16px;
  animation: miosegFloatAlt 5.8s ease-in-out infinite;
}

.miosegDetailRows {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.miosegDetailRows span {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 14px;
  color: #edf6ff;
  background: rgba(13, 23, 38, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13px;
  font-weight: 800;
}

.miosegFlowRow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}

.miosegFlowRow span {
  min-height: 38px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #07101f;
  background: linear-gradient(180deg, #ffffff, #dbeafe);
  font-size: 12px;
  font-weight: 950;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.14);
}

.miosegHeroMiniGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.miosegFolderCard,
.miosegMapCard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px;
  min-height: 74px;
}

.miosegMiniIcon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 20px;
}

.miosegFolderCard strong,
.miosegMapCard strong {
  display: block;
  margin-top: 3px;
  color: #ffffff;
  font-size: 13px;
  line-height: 1.25;
}

@keyframes miosegScanMove {
  0%, 100% {
    transform: translateY(-24px);
    opacity: 0.28;
  }
  45%, 55% {
    opacity: 1;
  }
  50% {
    transform: translateY(145px);
  }
}

@keyframes miosegFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes miosegFloatAlt {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(7px) translateX(3px);
  }
}


.miosegUseCaseGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  max-width: 1180px;
  margin: 0 auto;
}

.miosegUseCaseCard {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f6f9fd 100%);
  border: 1px solid rgba(218, 228, 240, 0.95);
  box-shadow: 0 22px 54px rgba(14, 23, 38, 0.08);
  animation: miosegUseCaseIn 680ms ease both;
}

.miosegUseCaseCard::before {
  content: "";
  position: absolute;
  inset: -1px;
  background: radial-gradient(circle at 18% 0%, rgba(77, 132, 201, 0.18), transparent 34%);
  opacity: 0;
  transition: opacity 220ms ease;
  pointer-events: none;
}

.miosegUseCaseCard:hover::before {
  opacity: 1;
}

.miosegUseCaseCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 68px rgba(14, 23, 38, 0.12);
}

.miosegUseCaseTop {
  position: relative;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.miosegUseCaseIcon {
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(180deg, #0d1726 0%, #17304d 100%);
  box-shadow: 0 14px 30px rgba(13, 23, 38, 0.18);
  font-size: 25px;
}

.miosegUseCaseLabel {
  color: #4d84c9;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.miosegUseCaseCard h3 {
  margin: 0;
  color: #0d1726;
  font-size: 21px;
  line-height: 1.16;
  letter-spacing: -0.35px;
}

.miosegUseCaseCard p {
  position: relative;
  margin: 0;
  color: #5d6b7d;
  font-size: 15px;
  line-height: 1.72;
}

.miosegUseCaseChips {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.miosegUseCaseChips span {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  padding: 0 11px;
  border-radius: 999px;
  color: #17304d;
  background: #eef4fb;
  border: 1px solid #dbe7f4;
  font-size: 12px;
  font-weight: 900;
}



  .miosegExploreMapMock {
    border-radius: 30px;
    padding: 14px;
  }

  .miosegMapCanvas {
    height: 300px;
  }
}



  .miosegConversionCard {
    border-radius: 30px;
    padding: 22px;
  }

  .miosegConversionReason {
    grid-template-columns: 1fr;
  }

  .miosegConversionReason div {
    grid-row: auto;
    margin-bottom: 10px;
  }

  .miosegFinalCta {
    border-radius: 26px;
    padding: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .miosegScanBeam,
  .miosegQrCard,
  .miosegDetailCard,
  .miosegUseCaseCard,
  .miosegMotionConnector,
  .miosegMotionBoard::before,
  .miosegFloatingQr,
  .miosegPulseRing,
  .miosegPanelDetail,
  .miosegPanelFolder,
  .miosegPanelMap,
  .miosegPanelLock {
    animation: none !important;
  }
}

@media (max-width: 980px) {
  .miosegMotionTrack {
    grid-template-columns: 1fr;
  }

  .miosegMotionConnector {
    width: 3px;
    height: 34px;
    margin: 0 auto;
  }

  .miosegAnimatedProduct {
    min-height: 620px;
  }

  .miosegFloatingQr {
    top: 45%;
  }

  .miosegPanelDetail,
  .miosegPanelFolder,
  .miosegPanelMap,
  .miosegPanelLock {
    left: 18px;
    right: 18px;
    min-width: auto;
  }

  .miosegPanelDetail { top: 24px; }
  .miosegPanelFolder { top: 138px; }
  .miosegPanelMap { bottom: 138px; }
  .miosegPanelLock { bottom: 24px; }
}

@media (max-width: 640px) {
  .miosegMotionBoard {
    padding: 18px;
    border-radius: 28px;
  }

  .miosegAnimatedProduct {
    min-height: 650px;
  }
}

@media (max-width: 980px) {
  .miosegUseCaseGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  

  .miosegUseCaseStory {
    padding: 18px;
    border-radius: 28px;
  }
}

@media (max-width: 760px) {
  .miosegQrCard {
    grid-template-columns: 78px 1fr;
  }

  .miosegQrVisual {
    width: 74px;
    height: 74px;
    border-radius: 20px;
  }

  .miosegHeroMiniGrid {
    grid-template-columns: 1fr;
  }
}
          `.trim(),
        }}
      />


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