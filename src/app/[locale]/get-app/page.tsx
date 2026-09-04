import Link from "next/link";
import styles from "./get-app.module.css";

import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { defaultLocale, isValidLocale } from "../../../i18n/config";

type Props = { params: Promise<{ locale: string }> };

type GetAppCopy = {
  badge:string; title1:string; title2:string; intro:string; storeAppleSmall:string; storeGoogleSmall:string;
  appStoreButton:string; playButton:string; factScan:string; factScanText:string; factQrxText:string; factBusinessText:string;
  phoneSubtitle:string; phoneOverline:string; phoneTitle:string; phoneText:string; phoneScanText:string; phoneQrxText:string;
  chipScan:string; chipSave:string; noticeTitle:string; noticeText:string; insightsEyebrow:string; insightsTitle:string; insightsText:string;
  cardScanBadge:string; cardScanTitle:string; cardScanText:string; cardMapBadge:string; cardMapTitle:string; cardMapText:string;
  cardCreateBadge:string; cardCreateTitle:string; cardCreateText:string; expectEyebrow:string; expectTitle:string; expectText:string;
  strongLabel:string; strongTitle:string; strongText:string; bullet1:string; bullet2:string; bullet3:string;
  scanSaveTitle:string; scanSaveText:string; ownQrxTitle:string; ownQrxText:string; businessText:string;
  availabilityEyebrow:string; availabilityTitle:string; availabilityText:string; availabilitySubText:string;
  statusLabel:string; statusValue:string; home:string; privacy:string; terms:string;
  heroPromise:string; compareEyebrow:string; compareTitle:string; compareText:string;
  withoutAppTitle:string; withoutAppText:string; withAppTitle:string; withAppText:string;
  appBenefit1:string; appBenefit2:string; appBenefit3:string; appBenefit4:string; appBenefit5:string; appBenefit6:string;
};

const GET_APP_COPY: Record<string, GetAppCopy> = {
  de: {
    badge:"mioseg qr · App herunterladen",
    title1:"mioseg qr im vollen",
    title2:"Umfang nutzen.",
    intro:"Lade die mioseg qr App herunter und mache mehr aus jedem QR-X. Scanne, speichere und organisiere QR-Codes und QR-X, folge interessanten QR-X und erhalte wichtige Aktualisierungen direkt in der App.",
    storeAppleSmall:"Laden im", storeGoogleSmall:"Jetzt bei", appStoreButton:"Im App Store", playButton:"Bei Google Play",
    factScan:"Speichern", factScanText:"QR-Codes und QR-X dauerhaft behalten und in eigenen Ordnern organisieren",
    factQrxText:"QR-X folgen und wichtige Aktualisierungen direkt mitbekommen",
    factBusinessText:"Eigene QR-X erstellen, verwalten und professionell einsetzen",
    phoneSubtitle:"Speichern, organisieren, folgen und wiederfinden",
    phoneOverline:"Die App im Überblick", phoneTitle:"Deine QR-X an einem Ort",
    phoneText:"Scans, gespeicherte QR-X, eigene Inhalte, Updates und Standorte übersichtlich in einer App.",
    phoneScanText:"Speichern & wiederfinden", phoneQrxText:"Folgen & Updates erhalten", chipScan:"Scannen", chipSave:"Speichern",
    noticeTitle:"Ohne App sofort öffnen. Mit App mehr daraus machen.",
    noticeText:"Jeder öffentliche QR-X lässt sich direkt im Browser öffnen. Mit der mioseg qr App kannst du ihn zusätzlich speichern, organisieren, verfolgen und später jederzeit wiederfinden.",
    insightsEyebrow:"Deine Vorteile in der App",
    insightsTitle:"Aus einem Scan wird etwas, das bei dir bleibt",
    insightsText:"Die App macht aus QR-Codes und QR-X mehr als einen einmaligen Scan: Inhalte speichern, ordnen, wiederfinden und bei wichtigen Änderungen auf dem Laufenden bleiben.",
    cardScanBadge:"Scannen & Speichern", cardScanTitle:"Scannen, speichern und wiederfinden",
    cardScanText:"Erfasse QR-Codes und QR-X, speichere sie dauerhaft und organisiere sie in deinen eigenen Ordnern.",
    cardMapBadge:"Karte", cardMapTitle:"Orte später wiederfinden",
    cardMapText:"Gespeicherte und eigene QR-X mit Standort auf deiner persönlichen Karte sehen und direkt wiederfinden.",
    cardCreateBadge:"Erstellen & Verwalten", cardCreateTitle:"Eigene QR-X erstellen",
    cardCreateText:"Erstelle eigene QR-X mit Texten, Bildern, Dateien und weiteren Inhalten und aktualisiere sie jederzeit.",
    expectEyebrow:"Der Unterschied",
    expectTitle:"Ohne App zugänglich. Mit App verbunden.",
    expectText:"QR-X bleiben bewusst ohne App erreichbar. Die App erweitert sie um die Funktionen, die aus einem einzelnen Aufruf eine dauerhafte Verbindung machen.",
    strongLabel:"Mit mioseg qr App", strongTitle:"Mehr als ansehen",
    strongText:"Speichere wichtige QR-X, ordne sie, folge ihnen und erhalte Aktualisierungen. So bleiben Informationen nicht nur erreichbar, sondern auch bei dir.",
    bullet1:"QR-Codes & QR-X speichern und in Ordnern organisieren",
    bullet2:"QR-X folgen und Updates mitbekommen",
    bullet3:"Standorte auf der Karte wiederfinden",
    scanSaveTitle:"Scannen, Speichern & Ordnen",
    scanSaveText:"Scanne QR-Codes und QR-X, speichere sie dauerhaft und sortiere sie übersichtlich in eigenen Ordnern.",
    ownQrxTitle:"Eigene QR-X",
    ownQrxText:"Erstelle und verwalte eigene QR-X mit Texten, Bildern, PDFs, MP3 oder MP4 und halte die Inhalte flexibel aktuell.",
    businessText:"Nutze Business QR-X mit professioneller Webansicht, Kontaktfunktionen, Medien, Standort und flexibler Verwaltung.",
    availabilityEyebrow:"Download & Verfügbarkeit",
    availabilityTitle:"mioseg qr App",
    availabilityText:"Die App wird für iPhone und Android verfügbar sein. Nach Veröffentlichung führen dich die Buttons direkt zum jeweiligen Store.",
    availabilitySubText:"Bis zum offiziellen Start zeigen wir hier den aktuellen Veröffentlichungsstatus.",
    statusLabel:"Aktueller Status", statusValue:"Demnächst verfügbar", home:"Startseite", privacy:"Datenschutz", terms:"Nutzungsbedingungen",
    heroPromise:"Ohne App sofort öffnen. Mit App mehr daraus machen.",
    compareEyebrow:"Warum die App?",
    compareTitle:"QR-X öffnen kann jeder. Die App macht sie persönlich.",
    compareText:"Ein QR-X funktioniert direkt im Browser. Wenn du ihn aber behalten, ordnen, verfolgen oder später wiederfinden möchtest, spielt die App ihre Stärke aus.",
    withoutAppTitle:"Ohne App",
    withoutAppText:"QR-X direkt scannen, öffnen und alle freigegebenen Inhalte sofort ansehen – ohne Installation.",
    withAppTitle:"Mit mioseg qr App",
    withAppText:"QR-X speichern, in Ordnern organisieren, folgen, Updates erhalten, Standorte wiederfinden und eigene QR-X verwalten.",
    appBenefit1:"QR-X speichern", appBenefit2:"Eigene Ordner", appBenefit3:"Folgen & Updates",
    appBenefit4:"Persönliche Karte", appBenefit5:"Explore nutzen", appBenefit6:"Eigene QR-X verwalten"
  },
  en: {
    badge:"{ui.badge}", title1:"Get the mioseg qr app", title2:"for iPhone and Android.",
    intro:"Scan QR codes, save content, create your own QR-X and use Business QR-X with professional web views, contact functions, media and flexible management.",
    storeAppleSmall:"Download on the", storeGoogleSmall:"Get it on", appStoreButton:"On the App Store", playButton:"On Google Play",
    factScan:"Scan", factScanText:"Save QR codes instead of searching for them again later", factQrxText:"Change content later without a new code", factBusinessText:"Professional presence with contact and media",
    phoneSubtitle:"Save, organize and extend QR codes", phoneOverline:"The app at a glance", phoneTitle:"Modern QR workflows in one app", phoneText:"Scans, saved content, your own QR-X and business features clearly organized in one app.",
    phoneScanText:"Save & find again", phoneQrxText:"Update flexibly", chipScan:"Scan", chipSave:"Save",
    noticeTitle:"Note", noticeText:"You can add the final store links here later. Until the app is live, you can also show TestFlight, beta links or a short coming-soon message.",
    insightsEyebrow:"App insights", insightsTitle:"Show users directly what to expect in the app", insightsText:"You can place real screenshots of your app here. This makes the page more credible and significantly more polished.",
    cardScanBadge:"Scan", cardScanTitle:"Capture QR codes quickly", cardScanText:"Scan, name and keep them permanently in the app.",
    cardMapBadge:"Map", cardMapTitle:"Find locations again", cardMapText:"View saved scans on the map and navigate back to them later.",
    cardCreateBadge:"Create", cardCreateTitle:"Create your own QR-X", cardCreateText:"Design your own content flexibly with text, images and media.",
    expectEyebrow:"What to expect", expectTitle:"One app for modern QR workflows", expectText:"mioseg qr combines classic scanning with its own QR-X platform for private users and businesses.",
    strongLabel:"Especially powerful", strongTitle:"More than a QR scanner", strongText:"The app combines classic saving with QR-X, business features, map view and structured management.",
    bullet1:"Scan & save permanently", bullet2:"Manage your own QR-X flexibly", bullet3:"Use Business QR-X professionally",
    scanSaveTitle:"Scan & Save", scanSaveText:"Capture QR codes, save them permanently and organize them clearly in your app.",
    ownQrxTitle:"Create your own QR-X", ownQrxText:"Create your own content with text, images, PDFs, MP3 or MP4 and keep it flexibly updated.",
    businessText:"Use professional web views with company name, cover image, contact buttons and a modern business look.",
    availabilityEyebrow:"Download & availability", availabilityTitle:"Coming soon or already available", availabilityText:"Later you can add your official store links here and direct visitors to the correct app store.",
    availabilitySubText:"Not live yet? You can temporarily show a message such as “Coming soon to the App Store and Google Play”.",
    statusLabel:"Current status", statusValue:"Coming Soon / Beta possible", home:"Home", privacy:"Privacy", terms:"Terms of Use",
    heroPromise:"Open QR-X instantly without the app. Get more with the app.",
    compareEyebrow:"Why the app?",
    compareTitle:"Open QR-X anywhere. Make them personal with the app.",
    compareText:"A QR-X works directly in the browser. The app adds saving, organizing, following, updates, maps and management.",
    withoutAppTitle:"Without the app",
    withoutAppText:"Scan and open QR-X directly and view shared content instantly — no installation required.",
    withAppTitle:"With the mioseg qr app",
    withAppText:"Save and organize QR-X, follow updates, find locations again and manage your own QR-X.",
    appBenefit1:"Save QR-X", appBenefit2:"Your folders", appBenefit3:"Follow & updates",
    appBenefit4:"Personal map", appBenefit5:"Explore", appBenefit6:"Manage your QR-X"

  },
  tr: {
    badge:"mioseg qr · Uygulama İndir", title1:"mioseg qr uygulamasını edin", title2:"iPhone ve Android için.",
    intro:"QR kodlarını tara, içerikleri kaydet, kendi QR-X'lerini oluştur ve profesyonel web görünümü, iletişim işlevleri, medya ve esnek yönetim ile Business QR-X kullan.",
    storeAppleSmall:"Şuradan indir", storeGoogleSmall:"Şuradan edin", appStoreButton:"App Store'da", playButton:"Google Play'de",
    factScan:"Tara", factScanText:"QR kodlarını kaydet, sonra tekrar aramak zorunda kalma", factQrxText:"Yeni kod oluşturmadan içeriği daha sonra değiştir", factBusinessText:"İletişim ve medya ile profesyonel görünüm",
    phoneSubtitle:"QR kodlarını kaydet, düzenle ve genişlet", phoneOverline:"Uygulamaya genel bakış", phoneTitle:"Tek uygulamada modern QR iş akışları", phoneText:"Taramalar, kaydedilen içerikler, kendi QR-X'lerin ve iş özellikleri tek uygulamada düzenli şekilde.",
    phoneScanText:"Kaydet ve yeniden bul", phoneQrxText:"Esnek güncelle", chipScan:"Tara", chipSave:"Kaydet",
    noticeTitle:"Not", noticeText:"Nihai mağaza bağlantılarını daha sonra kolayca ekleyebilirsin. Uygulama yayında değilken TestFlight, beta bağlantıları veya yakında mesajı gösterebilirsin.",
    insightsEyebrow:"Uygulama görünümü", insightsTitle:"Kullanıcılara uygulamada ne beklediklerini doğrudan göster", insightsText:"Buraya uygulamanın gerçek ekran görüntülerini ekleyebilirsin. Bu, sayfayı daha güvenilir ve kaliteli gösterir.",
    cardScanBadge:"Tara", cardScanTitle:"QR kodlarını hızlıca yakala", cardScanText:"Doğrudan tara, adlandır ve uygulamada kalıcı olarak sakla.",
    cardMapBadge:"Harita", cardMapTitle:"Konumları yeniden bul", cardMapText:"Kaydedilen taramaları haritada gör ve daha sonra doğrudan geri navigasyon yap.",
    cardCreateBadge:"Oluştur", cardCreateTitle:"Kendi QR-X'ini oluştur", cardCreateText:"Metin, görseller ve medya ile kendi içeriğini esnek şekilde tasarla.",
    expectEyebrow:"Seni neler bekliyor", expectTitle:"Modern QR iş akışları için tek uygulama", expectText:"mioseg qr klasik taramayı özel kullanıcılar ve işletmeler için kendi QR-X platformuyla birleştirir.",
    strongLabel:"Özellikle güçlü", strongTitle:"Bir QR tarayıcıdan fazlası", strongText:"Uygulama klasik kaydetmeyi QR-X, iş özellikleri, harita görünümü ve düzenli yönetimle birleştirir.",
    bullet1:"Tara ve kalıcı kaydet", bullet2:"Kendi QR-X'lerini esnek yönet", bullet3:"Business QR-X'i profesyonel kullan",
    scanSaveTitle:"Tara ve Kaydet", scanSaveText:"QR kodlarını yakala, kalıcı olarak kaydet ve uygulamanda düzenli şekilde organize et.",
    ownQrxTitle:"Kendi QR-X'ini oluştur", ownQrxText:"Metin, görseller, PDF, MP3 veya MP4 ile kendi içeriklerini oluştur ve esnek şekilde güncelle.",
    businessText:"Şirket adı, kapak görseli, iletişim düğmeleri ve modern iş görünümüyle profesyonel web sayfaları kullan.",
    availabilityEyebrow:"İndirme ve kullanılabilirlik", availabilityTitle:"Yakında veya zaten kullanılabilir", availabilityText:"Daha sonra resmi mağaza bağlantılarını ekleyebilir ve ziyaretçileri doğru uygulama mağazasına yönlendirebilirsin.",
    availabilitySubText:"Henüz yayında değil mi? Geçici olarak “Yakında App Store ve Google Play'de” gibi bir mesaj gösterebilirsin.",
    statusLabel:"Güncel durum", statusValue:"Coming Soon / Beta mümkün", home:"Ana sayfa", privacy:"Gizlilik", terms:"Kullanım Koşulları",
    heroPromise:"Open QR-X instantly without the app. Get more with the app.",
    compareEyebrow:"Why the app?",
    compareTitle:"Open QR-X anywhere. Make them personal with the app.",
    compareText:"A QR-X works directly in the browser. The app adds saving, organizing, following, updates, maps and management.",
    withoutAppTitle:"Without the app",
    withoutAppText:"Scan and open QR-X directly and view shared content instantly — no installation required.",
    withAppTitle:"With the mioseg qr app",
    withAppText:"Save and organize QR-X, follow updates, find locations again and manage your own QR-X.",
    appBenefit1:"Save QR-X", appBenefit2:"Your folders", appBenefit3:"Follow & updates",
    appBenefit4:"Personal map", appBenefit5:"Explore", appBenefit6:"Manage your QR-X"

  },
  pl: {
    badge:"mioseg qr · Pobierz aplikację", title1:"Pobierz aplikację mioseg qr", title2:"na iPhone i Android.",
    intro:"Skanuj kody QR, zapisuj treści, twórz własne QR-X i korzystaj z Business QR-X z profesjonalnym widokiem webowym, funkcjami kontaktu, multimediami i elastycznym zarządzaniem.",
    storeAppleSmall:"Pobierz w", storeGoogleSmall:"Pobierz z", appStoreButton:"W App Store", playButton:"W Google Play",
    factScan:"Skanuj", factScanText:"Zapisuj kody QR zamiast później szukać ich ponownie", factQrxText:"Zmieniaj treści później bez nowego kodu", factBusinessText:"Profesjonalna prezentacja z kontaktem i multimediami",
    phoneSubtitle:"Zapisuj, organizuj i rozszerzaj kody QR", phoneOverline:"Aplikacja w skrócie", phoneTitle:"Nowoczesne przepływy QR w jednej aplikacji", phoneText:"Skany, zapisane treści, własne QR-X i funkcje biznesowe przejrzyście w jednej aplikacji.",
    phoneScanText:"Zapisuj i odnajduj", phoneQrxText:"Elastycznie aktualizuj", chipScan:"Skanuj", chipSave:"Zapisuj",
    noticeTitle:"Informacja", noticeText:"Później możesz tu łatwo dodać finalne linki do sklepów. Dopóki aplikacja nie jest dostępna, możesz pokazać linki TestFlight, beta lub krótki komunikat o premierze.",
    insightsEyebrow:"Podgląd aplikacji", insightsTitle:"Pokaż od razu, czego użytkownicy mogą oczekiwać", insightsText:"Możesz tu umieścić prawdziwe zrzuty ekranu aplikacji. Dzięki temu strona jest bardziej wiarygodna i dopracowana.",
    cardScanBadge:"Skanuj", cardScanTitle:"Szybko przechwytuj kody QR", cardScanText:"Skanuj, nazywaj i zachowuj je na stałe w aplikacji.",
    cardMapBadge:"Mapa", cardMapTitle:"Odnajduj lokalizacje", cardMapText:"Wyświetlaj zapisane skany na mapie i wracaj do nich później.",
    cardCreateBadge:"Utwórz", cardCreateTitle:"Twórz własne QR-X", cardCreateText:"Elastycznie twórz własne treści z tekstem, obrazami i multimediami.",
    expectEyebrow:"Czego się spodziewać", expectTitle:"Jedna aplikacja do nowoczesnych przepływów QR", expectText:"mioseg qr łączy klasyczne skanowanie z własną platformą QR-X dla użytkowników prywatnych i firm.",
    strongLabel:"Szczególnie mocne", strongTitle:"Więcej niż skaner QR", strongText:"Aplikacja łączy klasyczne zapisywanie z QR-X, funkcjami biznesowymi, mapą i uporządkowanym zarządzaniem.",
    bullet1:"Skanuj i zapisuj na stałe", bullet2:"Elastycznie zarządzaj własnymi QR-X", bullet3:"Profesjonalnie wykorzystuj Business QR-X",
    scanSaveTitle:"Skanuj i zapisuj", scanSaveText:"Przechwytuj kody QR, zapisuj je na stałe i przejrzyście organizuj w aplikacji.",
    ownQrxTitle:"Twórz własne QR-X", ownQrxText:"Twórz treści z tekstem, obrazami, PDF, MP3 lub MP4 i elastycznie je aktualizuj.",
    businessText:"Korzystaj z profesjonalnych widoków webowych z nazwą firmy, grafiką okładkową, przyciskami kontaktu i nowoczesnym wyglądem.",
    availabilityEyebrow:"Pobieranie i dostępność", availabilityTitle:"Wkrótce lub już dostępna", availabilityText:"Później możesz dodać oficjalne linki do sklepów i kierować odwiedzających do właściwego sklepu.",
    availabilitySubText:"Jeszcze nie jest dostępna? Tymczasowo możesz pokazać komunikat „Wkrótce w App Store i Google Play”.",
    statusLabel:"Aktualny status", statusValue:"Coming Soon / możliwa Beta", home:"Strona główna", privacy:"Prywatność", terms:"Warunki użytkowania",
    heroPromise:"Open QR-X instantly without the app. Get more with the app.",
    compareEyebrow:"Why the app?",
    compareTitle:"Open QR-X anywhere. Make them personal with the app.",
    compareText:"A QR-X works directly in the browser. The app adds saving, organizing, following, updates, maps and management.",
    withoutAppTitle:"Without the app",
    withoutAppText:"Scan and open QR-X directly and view shared content instantly — no installation required.",
    withAppTitle:"With the mioseg qr app",
    withAppText:"Save and organize QR-X, follow updates, find locations again and manage your own QR-X.",
    appBenefit1:"Save QR-X", appBenefit2:"Your folders", appBenefit3:"Follow & updates",
    appBenefit4:"Personal map", appBenefit5:"Explore", appBenefit6:"Manage your QR-X"

  },
  ar: {
    badge:"mioseg qr · تنزيل التطبيق", title1:"احصل على تطبيق mioseg qr", title2:"لـ iPhone وAndroid.",
    intro:"امسح رموز QR واحفظ المحتوى وأنشئ QR-X الخاص بك واستخدم Business QR-X مع عرض ويب احترافي ووظائف اتصال ووسائط وإدارة مرنة.",
    storeAppleSmall:"تنزيل من", storeGoogleSmall:"احصل عليه من", appStoreButton:"على App Store", playButton:"على Google Play",
    factScan:"مسح", factScanText:"احفظ رموز QR بدل البحث عنها لاحقًا", factQrxText:"غيّر المحتوى لاحقًا دون رمز جديد", factBusinessText:"حضور احترافي مع الاتصال والوسائط",
    phoneSubtitle:"احفظ رموز QR ونظّمها ووسّعها", phoneOverline:"نظرة سريعة على التطبيق", phoneTitle:"تدفقات QR حديثة في تطبيق واحد", phoneText:"عمليات المسح والمحتوى المحفوظ وQR-X الخاص بك وميزات الأعمال منظمة في تطبيق واحد.",
    phoneScanText:"حفظ والعثور مجددًا", phoneQrxText:"تحديث مرن", chipScan:"مسح", chipSave:"حفظ",
    noticeTitle:"ملاحظة", noticeText:"يمكنك إضافة روابط المتاجر النهائية هنا لاحقًا بسهولة. وحتى يصبح التطبيق متاحًا، يمكنك عرض TestFlight أو روابط تجريبية أو رسالة إطلاق قريب.",
    insightsEyebrow:"لمحة عن التطبيق", insightsTitle:"اعرض للمستخدمين مباشرة ما ينتظرهم داخل التطبيق", insightsText:"يمكنك وضع لقطات شاشة حقيقية من التطبيق هنا، ما يجعل الصفحة أكثر موثوقية واحترافية.",
    cardScanBadge:"مسح", cardScanTitle:"التقاط رموز QR بسرعة", cardScanText:"امسح مباشرة وسمِّ المحتوى واحتفظ به دائمًا في التطبيق.",
    cardMapBadge:"الخريطة", cardMapTitle:"العثور على المواقع مجددًا", cardMapText:"شاهد عمليات المسح المحفوظة على الخريطة وانتقل إليها لاحقًا.",
    cardCreateBadge:"إنشاء", cardCreateTitle:"أنشئ QR-X الخاص بك", cardCreateText:"صمّم محتواك بمرونة باستخدام النصوص والصور والوسائط.",
    expectEyebrow:"ما الذي ينتظرك", expectTitle:"تطبيق واحد لتدفقات QR الحديثة", expectText:"يجمع mioseg qr بين المسح التقليدي ومنصة QR-X خاصة للمستخدمين والأعمال.",
    strongLabel:"قوي بشكل خاص", strongTitle:"أكثر من مجرد ماسح QR", strongText:"يجمع التطبيق بين الحفظ التقليدي وQR-X وميزات الأعمال وعرض الخريطة والإدارة المنظمة.",
    bullet1:"امسح واحفظ بشكل دائم", bullet2:"أدر QR-X الخاص بك بمرونة", bullet3:"استخدم Business QR-X باحتراف",
    scanSaveTitle:"مسح وحفظ", scanSaveText:"التقط رموز QR واحفظها بشكل دائم ونظّمها بوضوح داخل التطبيق.",
    ownQrxTitle:"أنشئ QR-X الخاص بك", ownQrxText:"أنشئ محتوى بالنصوص والصور وPDF وMP3 أو MP4 واستمر في تحديثه بمرونة.",
    businessText:"استخدم عروض ويب احترافية مع اسم الشركة وصورة غلاف وأزرار اتصال ومظهر أعمال حديث.",
    availabilityEyebrow:"التنزيل والتوفر", availabilityTitle:"قريبًا أو متاح بالفعل", availabilityText:"يمكنك لاحقًا إضافة روابط المتاجر الرسمية وتوجيه الزوار إلى متجر التطبيقات المناسب.",
    availabilitySubText:"لم يُطلق بعد؟ يمكنك مؤقتًا عرض رسالة مثل «قريبًا على App Store وGoogle Play».",
    statusLabel:"الحالة الحالية", statusValue:"قريبًا / نسخة Beta ممكنة", home:"الرئيسية", privacy:"الخصوصية", terms:"شروط الاستخدام",
    heroPromise:"Open QR-X instantly without the app. Get more with the app.",
    compareEyebrow:"Why the app?",
    compareTitle:"Open QR-X anywhere. Make them personal with the app.",
    compareText:"A QR-X works directly in the browser. The app adds saving, organizing, following, updates, maps and management.",
    withoutAppTitle:"Without the app",
    withoutAppText:"Scan and open QR-X directly and view shared content instantly — no installation required.",
    withAppTitle:"With the mioseg qr app",
    withAppText:"Save and organize QR-X, follow updates, find locations again and manage your own QR-X.",
    appBenefit1:"Save QR-X", appBenefit2:"Your folders", appBenefit3:"Follow & updates",
    appBenefit4:"Personal map", appBenefit5:"Explore", appBenefit6:"Manage your QR-X"

  },
  fr: {
    badge:"mioseg qr · Télécharger l’app", title1:"Téléchargez l’app mioseg qr", title2:"pour iPhone et Android.",
    intro:"Scannez des QR codes, enregistrez du contenu, créez vos propres QR-X et utilisez Business QR-X avec une vue web professionnelle, des fonctions de contact, des médias et une gestion flexible.",
    storeAppleSmall:"Télécharger dans", storeGoogleSmall:"Disponible sur", appStoreButton:"Sur l’App Store", playButton:"Sur Google Play",
    factScan:"Scanner", factScanText:"Enregistrez les QR codes au lieu de les rechercher plus tard", factQrxText:"Modifiez le contenu plus tard sans nouveau code", factBusinessText:"Présence professionnelle avec contact et médias",
    phoneSubtitle:"Enregistrer, organiser et enrichir les QR codes", phoneOverline:"L’app en un coup d’œil", phoneTitle:"Des workflows QR modernes dans une seule app", phoneText:"Scans, contenus enregistrés, vos propres QR-X et fonctions business clairement regroupés dans une app.",
    phoneScanText:"Enregistrer & retrouver", phoneQrxText:"Mettre à jour librement", chipScan:"Scanner", chipSave:"Enregistrer",
    noticeTitle:"Remarque", noticeText:"Vous pourrez facilement ajouter ici les liens définitifs vers les stores. Tant que l’app n’est pas encore disponible, vous pouvez afficher TestFlight, des liens bêta ou un court message de lancement prochain.",
    insightsEyebrow:"Aperçu de l’app", insightsTitle:"Montrez directement ce que les utilisateurs trouveront dans l’app", insightsText:"Vous pouvez insérer ici de vraies captures d’écran de l’app. Cela rend la page plus crédible et plus qualitative.",
    cardScanBadge:"Scanner", cardScanTitle:"Capturer rapidement les QR codes", cardScanText:"Scannez, nommez et conservez-les durablement dans l’app.",
    cardMapBadge:"Carte", cardMapTitle:"Retrouver les lieux", cardMapText:"Visualisez les scans enregistrés sur la carte et revenez-y plus tard.",
    cardCreateBadge:"Créer", cardCreateTitle:"Créer vos propres QR-X", cardCreateText:"Créez librement vos contenus avec du texte, des images et des médias.",
    expectEyebrow:"Ce qui vous attend", expectTitle:"Une app pour des workflows QR modernes", expectText:"mioseg qr associe le scan classique à sa propre plateforme QR-X pour particuliers et entreprises.",
    strongLabel:"Particulièrement puissant", strongTitle:"Bien plus qu’un scanner QR", strongText:"L’app associe l’enregistrement classique à QR-X, aux fonctions business, à la carte et à une gestion structurée.",
    bullet1:"Scanner & enregistrer durablement", bullet2:"Gérer librement vos propres QR-X", bullet3:"Utiliser Business QR-X professionnellement",
    scanSaveTitle:"Scanner & enregistrer", scanSaveText:"Capturez les QR codes, enregistrez-les durablement et organisez-les clairement dans l’app.",
    ownQrxTitle:"Créer vos propres QR-X", ownQrxText:"Créez vos contenus avec textes, images, PDF, MP3 ou MP4 et mettez-les à jour librement.",
    businessText:"Utilisez des vues web professionnelles avec nom d’entreprise, image de couverture, boutons de contact et design business moderne.",
    availabilityEyebrow:"Téléchargement & disponibilité", availabilityTitle:"Bientôt ou déjà disponible", availabilityText:"Vous pourrez ajouter ici vos liens officiels vers les stores et diriger les visiteurs vers le bon magasin d’applications.",
    availabilitySubText:"Pas encore disponible ? Vous pouvez temporairement afficher un message comme « Bientôt sur l’App Store et Google Play ».",
    statusLabel:"Statut actuel", statusValue:"Coming Soon / Beta possible", home:"Accueil", privacy:"Confidentialité", terms:"Conditions d’utilisation",
    heroPromise:"Open QR-X instantly without the app. Get more with the app.",
    compareEyebrow:"Why the app?",
    compareTitle:"Open QR-X anywhere. Make them personal with the app.",
    compareText:"A QR-X works directly in the browser. The app adds saving, organizing, following, updates, maps and management.",
    withoutAppTitle:"Without the app",
    withoutAppText:"Scan and open QR-X directly and view shared content instantly — no installation required.",
    withAppTitle:"With the mioseg qr app",
    withAppText:"Save and organize QR-X, follow updates, find locations again and manage your own QR-X.",
    appBenefit1:"Save QR-X", appBenefit2:"Your folders", appBenefit3:"Follow & updates",
    appBenefit4:"Personal map", appBenefit5:"Explore", appBenefit6:"Manage your QR-X"

  },
  es: {
    badge:"mioseg qr · Descargar app", title1:"Descarga la app mioseg qr", title2:"para iPhone y Android.",
    intro:"Escanea códigos QR, guarda contenido, crea tus propios QR-X y utiliza Business QR-X con vista web profesional, funciones de contacto, medios y gestión flexible.",
    storeAppleSmall:"Descargar en", storeGoogleSmall:"Consíguelo en", appStoreButton:"En App Store", playButton:"En Google Play",
    factScan:"Escanear", factScanText:"Guarda códigos QR en lugar de volver a buscarlos después", factQrxText:"Cambia el contenido más tarde sin un código nuevo", factBusinessText:"Presencia profesional con contacto y medios",
    phoneSubtitle:"Guardar, organizar y ampliar códigos QR", phoneOverline:"La app de un vistazo", phoneTitle:"Flujos QR modernos en una sola app", phoneText:"Escaneos, contenido guardado, tus propios QR-X y funciones Business organizados en una sola app.",
    phoneScanText:"Guardar y reencontrar", phoneQrxText:"Actualizar de forma flexible", chipScan:"Escanear", chipSave:"Guardar",
    noticeTitle:"Aviso", noticeText:"Más adelante puedes añadir aquí fácilmente los enlaces definitivos de las tiendas. Mientras la app no esté publicada, también puedes mostrar TestFlight, enlaces beta o un breve aviso de próximo lanzamiento.",
    insightsEyebrow:"Vista de la app", insightsTitle:"Muestra directamente lo que los usuarios encontrarán en la app", insightsText:"Aquí puedes incluir capturas reales de la app. Esto hace que la página sea más creíble y profesional.",
    cardScanBadge:"Escanear", cardScanTitle:"Captura códigos QR rápidamente", cardScanText:"Escanea, asigna un nombre y guárdalos permanentemente en la app.",
    cardMapBadge:"Mapa", cardMapTitle:"Vuelve a encontrar ubicaciones", cardMapText:"Consulta los escaneos guardados en el mapa y vuelve a navegar hasta ellos más tarde.",
    cardCreateBadge:"Crear", cardCreateTitle:"Crea tus propios QR-X", cardCreateText:"Diseña tu propio contenido de forma flexible con texto, imágenes y medios.",
    expectEyebrow:"Qué puedes esperar", expectTitle:"Una app para flujos QR modernos", expectText:"mioseg qr combina el escaneo clásico con una plataforma QR-X propia para usuarios particulares y empresas.",
    strongLabel:"Especialmente potente", strongTitle:"Más que un escáner QR", strongText:"La app combina el guardado clásico con QR-X, funciones Business, mapa y gestión estructurada.",
    bullet1:"Escanear y guardar permanentemente", bullet2:"Gestionar tus QR-X con flexibilidad", bullet3:"Usar Business QR-X profesionalmente",
    scanSaveTitle:"Escanear y guardar", scanSaveText:"Captura códigos QR, guárdalos permanentemente y organízalos claramente en la app.",
    ownQrxTitle:"Crear tus propios QR-X", ownQrxText:"Crea contenido con textos, imágenes, PDF, MP3 o MP4 y mantenlo actualizado de forma flexible.",
    businessText:"Utiliza vistas web profesionales con nombre de empresa, imagen de portada, botones de contacto y un diseño Business moderno.",
    availabilityEyebrow:"Descarga y disponibilidad", availabilityTitle:"Próximamente o ya disponible", availabilityText:"Más adelante puedes añadir los enlaces oficiales de las tiendas y dirigir a los visitantes a la tienda adecuada.",
    availabilitySubText:"¿Aún no está publicada? Puedes mostrar temporalmente un aviso como «Próximamente en App Store y Google Play».",
    statusLabel:"Estado actual", statusValue:"Coming Soon / Beta posible", home:"Inicio", privacy:"Privacidad", terms:"Condiciones de uso",
    heroPromise:"Open QR-X instantly without the app. Get more with the app.",
    compareEyebrow:"Why the app?",
    compareTitle:"Open QR-X anywhere. Make them personal with the app.",
    compareText:"A QR-X works directly in the browser. The app adds saving, organizing, following, updates, maps and management.",
    withoutAppTitle:"Without the app",
    withoutAppText:"Scan and open QR-X directly and view shared content instantly — no installation required.",
    withAppTitle:"With the mioseg qr app",
    withAppText:"Save and organize QR-X, follow updates, find locations again and manage your own QR-X.",
    appBenefit1:"Save QR-X", appBenefit2:"Your folders", appBenefit3:"Follow & updates",
    appBenefit4:"Personal map", appBenefit5:"Explore", appBenefit6:"Manage your QR-X"

  },
  it: {
    badge:"mioseg qr · Download app", title1:"Scarica l’app mioseg qr", title2:"per iPhone e Android.",
    intro:"Scansiona codici QR, salva contenuti, crea i tuoi QR-X e usa Business QR-X con vista web professionale, funzioni di contatto, media e gestione flessibile.",
    storeAppleSmall:"Scarica su", storeGoogleSmall:"Disponibile su", appStoreButton:"Su App Store", playButton:"Su Google Play",
    factScan:"Scansiona", factScanText:"Salva i codici QR invece di cercarli di nuovo più tardi", factQrxText:"Modifica i contenuti in seguito senza un nuovo codice", factBusinessText:"Presenza professionale con contatti e media",
    phoneSubtitle:"Salva, organizza ed espandi i codici QR", phoneOverline:"L’app in sintesi", phoneTitle:"Workflow QR moderni in un’unica app", phoneText:"Scansioni, contenuti salvati, i tuoi QR-X e funzioni Business organizzati in un’unica app.",
    phoneScanText:"Salva e ritrova", phoneQrxText:"Aggiorna in modo flessibile", chipScan:"Scansiona", chipSave:"Salva",
    noticeTitle:"Nota", noticeText:"In seguito potrai inserire qui facilmente i link definitivi agli store. Finché l’app non è disponibile puoi mostrare TestFlight, link beta o un breve messaggio di prossima uscita.",
    insightsEyebrow:"Anteprima app", insightsTitle:"Mostra subito cosa troveranno gli utenti nell’app", insightsText:"Qui puoi inserire veri screenshot dell’app. Questo rende la pagina più credibile e professionale.",
    cardScanBadge:"Scansiona", cardScanTitle:"Acquisisci rapidamente i codici QR", cardScanText:"Scansiona, assegna un nome e conservali permanentemente nell’app.",
    cardMapBadge:"Mappa", cardMapTitle:"Ritrova le posizioni", cardMapText:"Visualizza le scansioni salvate sulla mappa e torna direttamente a quei luoghi in seguito.",
    cardCreateBadge:"Crea", cardCreateTitle:"Crea i tuoi QR-X", cardCreateText:"Progetta i tuoi contenuti in modo flessibile con testo, immagini e media.",
    expectEyebrow:"Cosa aspettarsi", expectTitle:"Un’app per workflow QR moderni", expectText:"mioseg qr unisce la scansione classica a una propria piattaforma QR-X per utenti privati e aziende.",
    strongLabel:"Particolarmente potente", strongTitle:"Più di uno scanner QR", strongText:"L’app unisce il salvataggio classico a QR-X, funzioni Business, mappa e gestione strutturata.",
    bullet1:"Scansiona e salva permanentemente", bullet2:"Gestisci i tuoi QR-X con flessibilità", bullet3:"Usa Business QR-X in modo professionale",
    scanSaveTitle:"Scansiona e salva", scanSaveText:"Acquisisci i codici QR, salvali permanentemente e organizzali chiaramente nell’app.",
    ownQrxTitle:"Crea i tuoi QR-X", ownQrxText:"Crea contenuti con testi, immagini, PDF, MP3 o MP4 e aggiornali in modo flessibile.",
    businessText:"Usa viste web professionali con nome azienda, immagine di copertina, pulsanti di contatto e un look Business moderno.",
    availabilityEyebrow:"Download e disponibilità", availabilityTitle:"Presto o già disponibile", availabilityText:"In seguito potrai aggiungere i link ufficiali agli store e indirizzare i visitatori allo store corretto.",
    availabilitySubText:"Non è ancora disponibile? Puoi mostrare temporaneamente un messaggio come «Presto su App Store e Google Play».",
    statusLabel:"Stato attuale", statusValue:"Coming Soon / Beta possibile", home:"Home", privacy:"Privacy", terms:"Condizioni d’uso",
    heroPromise:"Open QR-X instantly without the app. Get more with the app.",
    compareEyebrow:"Why the app?",
    compareTitle:"Open QR-X anywhere. Make them personal with the app.",
    compareText:"A QR-X works directly in the browser. The app adds saving, organizing, following, updates, maps and management.",
    withoutAppTitle:"Without the app",
    withoutAppText:"Scan and open QR-X directly and view shared content instantly — no installation required.",
    withAppTitle:"With the mioseg qr app",
    withAppText:"Save and organize QR-X, follow updates, find locations again and manage your own QR-X.",
    appBenefit1:"Save QR-X", appBenefit2:"Your folders", appBenefit3:"Follow & updates",
    appBenefit4:"Personal map", appBenefit5:"Explore", appBenefit6:"Manage your QR-X"

  }
};


export default async function GetAppPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = isValidLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const ui = GET_APP_COPY[locale] ?? GET_APP_COPY.en;
  const appStoreUrl = "#";
  const googlePlayUrl = "#";

  const isAppStoreLive = appStoreUrl !== "#";
  const isGooglePlayLive = googlePlayUrl !== "#";

  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.animatedGlowOne} />
        <div className={styles.animatedGlowTwo} />

        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroLeft}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: locale === "ar" ? "flex-end" : "flex-start" }}>
                <LanguageSwitcher currentLocale={locale} />
              </div>
              <span className={styles.badge}>{ui.badge}</span>

              <h1 className={styles.title}>
                {ui.title1}
                <br />
                {ui.title2}
              </h1>

              <p className={styles.text}>
                {ui.intro}
              </p>

              <div className={styles.heroPromise}>
                <span className={styles.heroPromiseDot}>✓</span>
                <strong>{ui.heroPromise}</strong>
              </div>

              <div className={styles.storeBadgeRow}>
                <a
                  href={appStoreUrl}
                  className={`${styles.storeBadge} ${
                    !isAppStoreLive ? styles.storeBadgeDisabled : ""
                  }`}
                  aria-disabled={!isAppStoreLive}
                >
                  <span className={styles.storeBadgeIcon}></span>
                  <span className={styles.storeBadgeTextWrap}>
                    <span className={styles.storeBadgeSmall}>{ui.storeAppleSmall}</span>
                    <span className={styles.storeBadgeBig}>App Store</span>
                  </span>
                </a>

                <a
                  href={googlePlayUrl}
                  className={`${styles.storeBadge} ${
                    !isGooglePlayLive ? styles.storeBadgeDisabled : ""
                  }`}
                  aria-disabled={!isGooglePlayLive}
                >
                  <span className={styles.storeBadgePlay}>▶</span>
                  <span className={styles.storeBadgeTextWrap}>
                    <span className={styles.storeBadgeSmall}>{ui.storeGoogleSmall}</span>
                    <span className={styles.storeBadgeBig}>Google Play</span>
                  </span>
                </a>
              </div>

              <div className={styles.buttonRow}>
                <a
                  href={appStoreUrl}
                  className={`${styles.primaryButton} ${
                    !isAppStoreLive ? styles.buttonDisabled : ""
                  }`}
                  aria-disabled={!isAppStoreLive}
                >
                  {ui.appStoreButton}
                </a>

                <a
                  href={googlePlayUrl}
                  className={`${styles.secondaryButton} ${
                    !isGooglePlayLive ? styles.buttonDisabled : ""
                  }`}
                  aria-disabled={!isGooglePlayLive}
                >
                  {ui.playButton}
                </a>
              </div>

              <div className={styles.heroFacts}>
                <div className={styles.factCard}>
                  <strong className={styles.factTitle}>{ui.factScan}</strong>
                  <span className={styles.factText}>
                    {ui.factScanText}
                  </span>
                </div>

                <div className={styles.factCard}>
                  <strong className={styles.factTitle}>QR-X</strong>
                  <span className={styles.factText}>
                    {ui.factQrxText}
                  </span>
                </div>

                <div className={styles.factCard}>
                  <strong className={styles.factTitle}>Business</strong>
                  <span className={styles.factText}>
                    {ui.factBusinessText}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.previewWrap}>
              <div className={styles.phoneShell}>
                <div className={styles.phoneNotch} />

                <div className={styles.phoneScreen}>
                  <div className={styles.phoneTopBar}>
                    <span className={styles.phoneTime}>9:41</span>
                    <div className={styles.phoneStatusIcons}>
                      <span>▂▄▆█</span>
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  <div className={styles.phoneHeroCard}>
                    <div className={styles.phoneLogoWrap}>
                      <img
                        src="/logo-wwhite.png"
                        alt="mioseg qr Logo"
                        className={styles.phoneLogo}
                      />
                    </div>

                    <div className={styles.phoneBrandText}>
                      <div className={styles.phoneBrandTitle}>mioseg qr</div>
                      <div className={styles.phoneBrandSubTitle}>
                        {ui.phoneSubtitle}
                      </div>
                    </div>
                  </div>

                  <div className={styles.phoneMainCard}>
                    <div className={styles.phoneOverline}>{ui.phoneOverline}</div>
                    <h3 className={styles.phoneCardTitle}>
                      {ui.phoneTitle}
                    </h3>
                    <p className={styles.phoneCardText}>
                      {ui.phoneText}
                    </p>
                  </div>

                  <div className={styles.phoneMiniGrid}>
                    <div className={styles.phoneMiniCard}>
                      <div className={styles.phoneMiniTitle}>Scans</div>
                      <div className={styles.phoneMiniText}>
                        {ui.phoneScanText}
                      </div>
                    </div>

                    <div className={styles.phoneMiniCard}>
                      <div className={styles.phoneMiniTitle}>QR-X</div>
                      <div className={styles.phoneMiniText}>
                        {ui.phoneQrxText}
                      </div>
                    </div>
                  </div>

                  <div className={styles.phoneChipRow}>
                    <span className={styles.phoneChip}>{ui.chipScan}</span>
                    <span className={styles.phoneChip}>{ui.chipSave}</span>
                    <span className={styles.phoneChip}>Business</span>
                  </div>

                  <div className={styles.phoneBottomNav}>
                    <span className={styles.navDotActive} />
                    <span className={styles.navDot} />
                    <span className={styles.navDot} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.noticeCard}>
            <p className={styles.noticeTitle}>{ui.noticeTitle}</p>
            <p className={styles.noticeText}>
              {ui.noticeText}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.previewSection}>
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>{ui.insightsEyebrow}</span>
            <h2 className={styles.sectionTitle}>
              {ui.insightsTitle}
            </h2>
            <p className={styles.sectionText}>
              {ui.insightsText}
            </p>
          </div>

          <div className={styles.previewGrid}>
            <div className={styles.previewCard}>
              <div className={styles.previewImageWrap}>
                <img
                  src="/landing/scan-screen.jpg"
                  alt="Scan Screen"
                  className={styles.previewImage}
                />
              </div>
              <div className={styles.previewCardTextWrap}>
                <div className={styles.previewCardBadge}>{ui.cardScanBadge}</div>
                <h3 className={styles.previewCardTitle}>{ui.cardScanTitle}</h3>
                <p className={styles.previewCardText}>
                  {ui.cardScanText}
                </p>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewImageWrap}>
                <img
                  src="/landing/map-screen.jpg"
                  alt="Map Screen"
                  className={styles.previewImage}
                />
              </div>
              <div className={styles.previewCardTextWrap}>
                <div className={styles.previewCardBadge}>{ui.cardMapBadge}</div>
                <h3 className={styles.previewCardTitle}>{ui.cardMapTitle}</h3>
                <p className={styles.previewCardText}>
                  {ui.cardMapText}
                </p>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewImageWrap}>
                <img
                  src="/landing/create-screen.jpg"
                  alt="Create Screen"
                  className={styles.previewImage}
                />
              </div>
              <div className={styles.previewCardTextWrap}>
                <div className={styles.previewCardBadge}>{ui.cardCreateBadge}</div>
                <h3 className={styles.previewCardTitle}>{ui.cardCreateTitle}</h3>
                <p className={styles.previewCardText}>
                  {ui.cardCreateText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.compareSection}>
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>{ui.compareEyebrow}</span>
            <h2 className={styles.sectionTitle}>{ui.compareTitle}</h2>
            <p className={styles.sectionText}>{ui.compareText}</p>
          </div>

          <div className={styles.compareGrid}>
            <div className={styles.compareCard}>
              <div className={styles.compareIcon}>↗</div>
              <h3 className={styles.compareCardTitle}>{ui.withoutAppTitle}</h3>
              <p className={styles.compareCardText}>{ui.withoutAppText}</p>
              <div className={styles.compareSimpleList}>
                <span>✓ QR-X</span>
                <span>✓ Browser</span>
                <span>✓ Sofort zugänglich</span>
              </div>
            </div>

            <div className={styles.compareCardFeatured}>
              <div className={styles.compareAppLabel}>mioseg qr</div>
              <h3 className={styles.compareCardFeaturedTitle}>{ui.withAppTitle}</h3>
              <p className={styles.compareCardFeaturedText}>{ui.withAppText}</p>
              <div className={styles.benefitPills}>
                <span>{ui.appBenefit1}</span>
                <span>{ui.appBenefit2}</span>
                <span>{ui.appBenefit3}</span>
                <span>{ui.appBenefit4}</span>
                <span>{ui.appBenefit5}</span>
                <span>{ui.appBenefit6}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>{ui.expectEyebrow}</span>
            <h2 className={styles.sectionTitle}>{ui.expectTitle}</h2>
            <p className={styles.sectionText}>
              {ui.expectText}
            </p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCardFeatured}>
              <div className={styles.featureCardLabel}>{ui.strongLabel}</div>
              <h3 className={styles.featureCardFeaturedTitle}>
                {ui.strongTitle}
              </h3>
              <p className={styles.featureCardFeaturedText}>
                {ui.strongText}
              </p>
              <div className={styles.featureList}>
                <div className={styles.featureListItem}>
                  ✓ {ui.bullet1}
                </div>
                <div className={styles.featureListItem}>
                  ✓ {ui.bullet2}
                </div>
                <div className={styles.featureListItem}>
                  ✓ {ui.bullet3}
                </div>
              </div>
            </div>

            <div className={styles.featureCardColumn}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>{ui.scanSaveTitle}</h3>
                <p className={styles.cardText}>
                  {ui.scanSaveText}
                </p>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>{ui.ownQrxTitle}</h3>
                <p className={styles.cardText}>
                  {ui.ownQrxText}
                </p>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Business QR-X</h3>
                <p className={styles.cardText}>
                  {ui.businessText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.infoBox}>
            <div className={styles.infoBoxLeft}>
              <span className={styles.sectionEyebrow}>{ui.availabilityEyebrow}</span>
              <h2 className={styles.sectionTitle}>{ui.availabilityTitle}</h2>
              <p className={styles.infoText}>
                {ui.availabilityText}
              </p>
              <p className={styles.infoSubText}>
                {ui.availabilitySubText}
              </p>
            </div>

            <div className={styles.infoBoxRight}>
              <div className={styles.miniStatusCard}>
                <div className={styles.miniStatusLabel}>{ui.statusLabel}</div>
                <div className={styles.miniStatusValue}>{ui.statusValue}</div>
              </div>

              <div className={styles.inlineLinks}>
                <Link href={`/${locale}`} className={styles.inlineLink}>
                  {ui.home}
                </Link>
                <Link href={`/${locale}/datenschutz`} className={styles.inlineLink}>
                  Datenschutz
                </Link>
                <Link href={`/${locale}/nutzungsbedingungen`} className={styles.inlineLink}>
                  Nutzungsbedingungen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}