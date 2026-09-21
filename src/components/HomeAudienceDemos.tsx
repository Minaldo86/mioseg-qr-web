"use client";

import { useRef, useState } from "react";

type Demo = {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  image: string;
  imageAlt: string;
  cta: string;
  password?: string;
};

type Audience = "private" | "business";
type SupportedLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

const COPY = {
  de: {
    sectionEyebrow: "Was bringen dir dynamische QR-Codes?",
    sectionTitle: "Zwei Seiten. Dieselbe Verbindung.",
    sectionText: "Wähle eine Perspektive und probiere darunter echte Beispiele direkt aus.",
    selectorLabel: "Zielgruppe für dynamische QR-Codes auswählen",
    privateBadge: "Für dich",
    privateTitle: "Speichere und entdecke, was dich umgibt.",
    privateText: "Interessante QR-Codes verschwinden nicht mehr nach dem Scan. Speichere sie, ordne sie und finde sie später wieder.",
    privateFlow: ["Scannen", "Speichern", "Wiederfinden", "Folgen"],
    privateHint: "Private Beispiele anzeigen ↓",
    businessBadge: "Für Unternehmen",
    businessTitle: "Mach physische Dinge digital.",
    businessText: "Verbinde ein reales Objekt, einen Standort oder ein Projekt mit einem dynamischen QR-Code. Inhalte lassen sich später ändern, ohne den angebrachten QR-Code auszutauschen.",
    businessFlow: ["Erstellen", "Anbringen", "Aktualisieren", "Sichtbar bleiben"],
    businessHint: "Unternehmensbeispiele anzeigen ↓",
    businessDemoTitle: "Dynamische QR-Codes im echten Einsatz",
    privateDemoTitle: "QR-Codes, die du im Alltag nutzen kannst",
    businessDemoText: "Öffne die Beispiele und sieh direkt, wie unterschiedliche Produkte, Objekte und Angebote mit dynamischen QR-Codes funktionieren.",
    privateDemoText: "Öffne die privaten Beispiele und sieh, wie QR-Codes gespeichert, wiedergefunden oder geschützt genutzt werden können.",
    live: "Live QR-Code",
    open: "öffnen",
    demoPassword: "Demo-Passwort",
    objectLabelTitle: "QR-Code direkt am Objekt",
    objectLabelText: "Informationen dort, wo sie gebraucht werden.",
    businessSectionEyebrow: "Mioseg qr für Unternehmen",
    businessSectionTitle: "Eine Maschine. Ein QR-Code. Alle wichtigen Informationen.",
    businessSectionText: "Ein Mitarbeiter scannt den QR-Code direkt an der Maschine und gelangt zu den Informationen, die für dieses konkrete Objekt hinterlegt wurden.",
    businessInfo: ["Betriebsanleitung","Technische Daten","Wartung & Service","Prüfberichte","Sicherheitsinfos","Ersatzteile","Ansprechpartner","Aktuelle Änderungen"],
    businessPromiseTitle: "Einmal anbringen. Dauerhaft verwalten.",
    businessPromiseText: "Der QR-Code bleibt an der Maschine. Die Informationen dahinter können jederzeit aktualisiert werden.",
    businessTransfer: "Was hier für eine Maschine funktioniert, lässt sich genauso auf Produkte, Immobilien, Fahrzeuge, Gebäude, Projekte oder Standorte übertragen.",
    privateLabelTitle: "QR-Codes im Alltag entdecken",
    privateLabelText: "Interessantes speichern und später wiederfinden.",
    privateSectionEyebrow: "Mioseg qr für dich",
    privateSectionTitle: "Entdecken. Speichern. Später wiederfinden.",
    privateSectionText: "Du entdeckst einen interessanten Ort, ein Restaurant, eine Sehenswürdigkeit oder einen anderen QR-Code? Scanne ihn mit Mioseg qr und behalte ihn einfach bei dir.",
    privateInfo: ["Scannen","Speichern","In Ordner ablegen","Folgen","Updates erhalten","Auf der Karte wiederfinden"],
    privatePromiseTitle: "Einmal entdeckt. Dauerhaft bei dir.",
    privatePromiseText: "Interessante QR-Codes bleiben gespeichert und können später schnell wiedergefunden werden.",
    privateTransfer: "Egal ob Restaurant, Reiseziel, Veranstaltung, Produkt oder ein QR-Code für dein Zuhause – mit Mioseg qr musst du interessante Informationen nicht jedes Mal neu suchen."
  },
  en: {
    sectionEyebrow: "What can QR do for you?",
    sectionTitle: "Two sides. One connection.",
    sectionText: "Choose a perspective and try real QR examples below.",
    selectorLabel: "Choose a QR audience",
    privateBadge: "For you",
    privateTitle: "Scan, keep and find it again later.",
    privateText: "Interesting QR codes and QR no longer disappear after you scan them. Save them, organize them and find them again whenever you need them.",
    privateFlow: ["Scan", "Save", "Find again", "Follow"],
    privateHint: "Show personal examples ↓",
    businessBadge: "For businesses",
    businessTitle: "Provide information exactly where it is needed.",
    businessText: "Connect a real object, location or project to a QR. Update the content later without replacing the QR attached to it.",
    businessFlow: ["Create", "Attach", "Update", "Stay visible"],
    businessHint: "Show business examples ↓",
    businessDemoTitle: "QR in real use",
    privateDemoTitle: "QR you can use in everyday life",
    businessDemoText: "Open the examples and see how different products, objects and services work with QR.",
    privateDemoText: "Open the personal examples and see how QR can be saved, found again or protected.",
    live: "Live QR",
    open: "open",
    demoPassword: "Demo password",
    objectLabelTitle: "QR directly on the object",
    objectLabelText: "Information exactly where it is needed.",
    businessSectionEyebrow: "Mioseg qr for businesses",
    businessSectionTitle: "One machine. One QR. All the important information.",
    businessSectionText: "An employee scans the QR directly on the machine and opens the information stored for that specific object.",
    businessInfo: ["Operating manual","Technical data","Maintenance & service","Inspection reports","Safety information","Spare parts","Contact person","Latest changes"],
    businessPromiseTitle: "Attach once. Manage continuously.",
    businessPromiseText: "The QR stays on the machine. The information behind it can be updated at any time.",
    businessTransfer: "What works for a machine works just as well for products, real estate, vehicles, buildings, projects or locations.",
    privateLabelTitle: "Discover QR in everyday life",
    privateLabelText: "Save what interests you and find it again later.",
    privateSectionEyebrow: "Mioseg qr for you",
    privateSectionTitle: "Discover. Save. Find again.",
    privateSectionText: "Found an interesting place, restaurant, attraction or another QR? Scan it with mioseg qr and keep it with you.",
    privateInfo: ["Scan","Save","Organize in folders","Follow","Receive updates","Find again on the map"],
    privatePromiseTitle: "Discover once. Keep it with you.",
    privatePromiseText: "Interesting QR stay saved and can be found again quickly later.",
    privateTransfer: "Whether it is a restaurant, travel destination, event, product or a QR for your home – with mioseg qr you do not have to search for useful information again every time."
  },
  tr: {
    sectionEyebrow:"QR sana ne kazandırır?", sectionTitle:"İki taraf. Tek bağlantı.", sectionText:"Bir bakış açısı seç ve aşağıdaki gerçek QR örneklerini doğrudan dene.",
    selectorLabel:"QR hedef kitlesini seç", privateBadge:"Senin için", privateTitle:"Tara, sakla ve daha sonra yeniden bul.", privateText:"İlginç QR kodları ve QR'ler taramadan sonra kaybolmaz. Kaydet, düzenle ve gerektiğinde yeniden bul.",
    privateFlow:["Tara","Kaydet","Yeniden bul","Takip et"], privateHint:"Kişisel örnekleri göster ↓", businessBadge:"İşletmeler için", businessTitle:"Bilgiyi tam ihtiyaç duyulan yerde sun.",
    businessText:"Gerçek bir nesneyi, konumu veya projeyi bir QR ile bağla. Yerleştirilen QR'i değiştirmeden içeriği daha sonra güncelle.", businessFlow:["Oluştur","Yerleştir","Güncelle","Görünür kal"], businessHint:"İşletme örneklerini göster ↓",
    businessDemoTitle:"QR gerçek kullanımda", privateDemoTitle:"Günlük hayatta kullanabileceğin QR'ler", businessDemoText:"Örnekleri aç ve farklı ürünlerin, nesnelerin ve hizmetlerin QR ile nasıl çalıştığını gör.", privateDemoText:"Kişisel örnekleri aç ve QR'lerin nasıl kaydedildiğini, yeniden bulunduğunu veya korunduğunu gör.",
    live:"Canlı QR", open:"aç", demoPassword:"Demo şifresi", objectLabelTitle:"QR doğrudan nesnenin üzerinde", objectLabelText:"Bilgi tam ihtiyaç duyulan yerde.",
    businessSectionEyebrow:"İşletmeler için Mioseg qr", businessSectionTitle:"Bir makine. Bir QR. Tüm önemli bilgiler.", businessSectionText:"Bir çalışan makinenin üzerindeki QR'i tarar ve o nesne için kaydedilmiş bilgilere ulaşır.",
    businessInfo:["Kullanım kılavuzu","Teknik veriler","Bakım ve servis","Kontrol raporları","Güvenlik bilgileri","Yedek parçalar","İlgili kişi","Güncel değişiklikler"],
    businessPromiseTitle:"Bir kez yerleştir. Sürekli yönet.", businessPromiseText:"QR makinede kalır. Arkasındaki bilgiler her zaman güncellenebilir.", businessTransfer:"Bir makinede çalışan bu sistem ürünlere, gayrimenkullere, araçlara, binalara, projelere veya konumlara da uygulanabilir.",
    privateLabelTitle:"Günlük hayatta QR keşfet", privateLabelText:"İlgini çekenleri kaydet ve daha sonra yeniden bul.", privateSectionEyebrow:"Senin için Mioseg qr", privateSectionTitle:"Keşfet. Kaydet. Yeniden bul.", privateSectionText:"İlginç bir yer, restoran, turistik nokta veya başka bir QR mi buldun? Mioseg qr ile tara ve yanında tut.",
    privateInfo:["Tara","Kaydet","Klasörlerde düzenle","Takip et","Güncellemeleri al","Haritada yeniden bul"], privatePromiseTitle:"Bir kez keşfet. Hep yanında kalsın.", privatePromiseText:"İlginç QR'ler kayıtlı kalır ve daha sonra hızla yeniden bulunabilir.", privateTransfer:"Restoran, seyahat noktası, etkinlik, ürün veya evin için bir QR olsun – Mioseg qr ile faydalı bilgileri her seferinde yeniden aramak zorunda kalmazsın."
  },
  pl: {
    sectionEyebrow:"Co daje Ci QR?", sectionTitle:"Dwie strony. Jedno połączenie.", sectionText:"Wybierz perspektywę i wypróbuj poniżej prawdziwe przykłady QR.",
    selectorLabel:"Wybierz grupę odbiorców QR", privateBadge:"Dla Ciebie", privateTitle:"Skanuj, zachowuj i odnajduj później.", privateText:"Ciekawe kody QR i QR nie znikają po zeskanowaniu. Zapisuj je, porządkuj i odnajduj, gdy ich potrzebujesz.",
    privateFlow:["Skanuj","Zapisz","Odnajdź","Obserwuj"], privateHint:"Pokaż przykłady prywatne ↓", businessBadge:"Dla firm", businessTitle:"Udostępniaj informacje dokładnie tam, gdzie są potrzebne.",
    businessText:"Połącz rzeczywisty obiekt, lokalizację lub projekt z QR. Treści możesz później aktualizować bez wymiany umieszczonego QR.", businessFlow:["Utwórz","Umieść","Aktualizuj","Pozostań widoczny"], businessHint:"Pokaż przykłady firmowe ↓",
    businessDemoTitle:"QR w praktyce", privateDemoTitle:"QR do codziennego użytku", businessDemoText:"Otwórz przykłady i zobacz, jak różne produkty, obiekty i usługi działają z QR.", privateDemoText:"Otwórz przykłady prywatne i zobacz, jak QR można zapisywać, odnajdywać i chronić.",
    live:"QR na żywo", open:"otwórz", demoPassword:"Hasło demo", objectLabelTitle:"QR bezpośrednio na obiekcie", objectLabelText:"Informacje dokładnie tam, gdzie są potrzebne.",
    businessSectionEyebrow:"Mioseg qr dla firm", businessSectionTitle:"Jedna maszyna. Jeden QR. Wszystkie ważne informacje.", businessSectionText:"Pracownik skanuje QR bezpośrednio na maszynie i otwiera informacje zapisane dla tego konkretnego obiektu.",
    businessInfo:["Instrukcja obsługi","Dane techniczne","Konserwacja i serwis","Raporty z kontroli","Informacje bezpieczeństwa","Części zamienne","Osoba kontaktowa","Aktualne zmiany"],
    businessPromiseTitle:"Umieść raz. Zarządzaj stale.", businessPromiseText:"QR pozostaje na maszynie. Informacje za nim można aktualizować w dowolnym momencie.", businessTransfer:"To, co działa dla maszyny, sprawdza się także dla produktów, nieruchomości, pojazdów, budynków, projektów i lokalizacji.",
    privateLabelTitle:"Odkrywaj QR na co dzień", privateLabelText:"Zapisuj to, co Cię interesuje, i odnajduj później.", privateSectionEyebrow:"Mioseg qr dla Ciebie", privateSectionTitle:"Odkrywaj. Zapisuj. Odnajduj.", privateSectionText:"Znalazłeś ciekawe miejsce, restaurację, atrakcję lub inny QR? Zeskanuj go z Mioseg qr i zachowaj.",
    privateInfo:["Skanuj","Zapisuj","Porządkuj w folderach","Obserwuj","Otrzymuj aktualizacje","Odnajduj na mapie"], privatePromiseTitle:"Odkryj raz. Zachowaj na stałe.", privatePromiseText:"Ciekawe QR pozostają zapisane i można je później szybko odnaleźć.", privateTransfer:"Restauracja, cel podróży, wydarzenie, produkt czy QR Twojego domu – z Mioseg qr nie musisz za każdym razem szukać przydatnych informacji od nowa."
  },
  fr: {
    sectionEyebrow:"Que vous apporte QR ?", sectionTitle:"Deux côtés. Une même connexion.", sectionText:"Choisissez une perspective et testez directement de vrais exemples QR ci-dessous.",
    selectorLabel:"Choisir le public QR", privateBadge:"Pour vous", privateTitle:"Scannez, gardez et retrouvez plus tard.", privateText:"Les QR codes et QR intéressants ne disparaissent plus après le scan. Enregistrez-les, organisez-les et retrouvez-les quand vous en avez besoin.",
    privateFlow:["Scanner","Enregistrer","Retrouver","Suivre"], privateHint:"Afficher les exemples personnels ↓", businessBadge:"Pour les entreprises", businessTitle:"Fournissez l'information exactement là où elle est nécessaire.",
    businessText:"Reliez un objet réel, un lieu ou un projet à un QR. Mettez ensuite le contenu à jour sans remplacer le QR installé.", businessFlow:["Créer","Installer","Mettre à jour","Rester visible"], businessHint:"Afficher les exemples entreprise ↓",
    businessDemoTitle:"QR en situation réelle", privateDemoTitle:"Des QR utiles au quotidien", businessDemoText:"Ouvrez les exemples et découvrez comment différents produits, objets et services fonctionnent avec QR.", privateDemoText:"Ouvrez les exemples personnels et découvrez comment enregistrer, retrouver ou protéger des QR.",
    live:"QR en direct", open:"ouvrir", demoPassword:"Mot de passe démo", objectLabelTitle:"QR directement sur l'objet", objectLabelText:"L'information là où elle est nécessaire.",
    businessSectionEyebrow:"Mioseg qr pour les entreprises", businessSectionTitle:"Une machine. Un QR. Toutes les informations importantes.", businessSectionText:"Un collaborateur scanne le QR directement sur la machine et accède aux informations enregistrées pour cet objet précis.",
    businessInfo:["Mode d'emploi","Données techniques","Maintenance & service","Rapports de contrôle","Informations de sécurité","Pièces détachées","Contact","Dernières modifications"],
    businessPromiseTitle:"Installez une fois. Gérez durablement.", businessPromiseText:"Le QR reste sur la machine. Les informations associées peuvent être mises à jour à tout moment.", businessTransfer:"Ce qui fonctionne pour une machine fonctionne aussi pour des produits, biens immobiliers, véhicules, bâtiments, projets ou sites.",
    privateLabelTitle:"Découvrir QR au quotidien", privateLabelText:"Enregistrez ce qui vous intéresse et retrouvez-le plus tard.", privateSectionEyebrow:"Mioseg qr pour vous", privateSectionTitle:"Découvrez. Enregistrez. Retrouvez.", privateSectionText:"Vous découvrez un lieu, un restaurant, un site touristique ou un autre QR intéressant ? Scannez-le avec Mioseg qr et gardez-le avec vous.",
    privateInfo:["Scanner","Enregistrer","Classer dans des dossiers","Suivre","Recevoir des mises à jour","Retrouver sur la carte"], privatePromiseTitle:"Découvert une fois. Toujours avec vous.", privatePromiseText:"Les QR intéressants restent enregistrés et peuvent être retrouvés rapidement plus tard.", privateTransfer:"Restaurant, destination, événement, produit ou QR pour votre maison : avec Mioseg qr, vous n'avez plus à rechercher les mêmes informations à chaque fois."
  },
  es: {
    sectionEyebrow:"¿Qué te aporta QR?", sectionTitle:"Dos lados. Una misma conexión.", sectionText:"Elige una perspectiva y prueba directamente ejemplos reales de QR.",
    selectorLabel:"Elegir público de QR", privateBadge:"Para ti", privateTitle:"Escanea, guarda y vuelve a encontrarlo.", privateText:"Los códigos QR y QR interesantes ya no desaparecen después de escanearlos. Guárdalos, organízalos y encuéntralos cuando los necesites.",
    privateFlow:["Escanear","Guardar","Encontrar","Seguir"], privateHint:"Mostrar ejemplos personales ↓", businessBadge:"Para empresas", businessTitle:"Ofrece información exactamente donde se necesita.",
    businessText:"Conecta un objeto real, una ubicación o un proyecto con un QR. Actualiza después el contenido sin sustituir el QR instalado.", businessFlow:["Crear","Colocar","Actualizar","Seguir visible"], businessHint:"Mostrar ejemplos de empresa ↓",
    businessDemoTitle:"QR en uso real", privateDemoTitle:"QR para tu día a día", businessDemoText:"Abre los ejemplos y descubre cómo funcionan distintos productos, objetos y servicios con QR.", privateDemoText:"Abre los ejemplos personales y descubre cómo guardar, volver a encontrar o proteger QR.",
    live:"QR en vivo", open:"abrir", demoPassword:"Contraseña demo", objectLabelTitle:"QR directamente en el objeto", objectLabelText:"Información exactamente donde se necesita.",
    businessSectionEyebrow:"Mioseg qr para empresas", businessSectionTitle:"Una máquina. Un QR. Toda la información importante.", businessSectionText:"Un empleado escanea el QR directamente en la máquina y accede a la información guardada para ese objeto concreto.",
    businessInfo:["Manual de uso","Datos técnicos","Mantenimiento y servicio","Informes de inspección","Información de seguridad","Repuestos","Persona de contacto","Cambios actuales"],
    businessPromiseTitle:"Colócalo una vez. Gestiónalo siempre.", businessPromiseText:"El QR permanece en la máquina. La información asociada puede actualizarse en cualquier momento.", businessTransfer:"Lo que funciona para una máquina también funciona para productos, inmuebles, vehículos, edificios, proyectos o ubicaciones.",
    privateLabelTitle:"Descubre QR en tu día a día", privateLabelText:"Guarda lo que te interesa y encuéntralo más tarde.", privateSectionEyebrow:"Mioseg qr para ti", privateSectionTitle:"Descubre. Guarda. Vuelve a encontrar.", privateSectionText:"¿Has encontrado un lugar, restaurante, atracción u otro QR interesante? Escanéalo con Mioseg qr y guárdalo contigo.",
    privateInfo:["Escanear","Guardar","Organizar en carpetas","Seguir","Recibir actualizaciones","Encontrar en el mapa"], privatePromiseTitle:"Descúbrelo una vez. Consérvalo contigo.", privatePromiseText:"Los QR interesantes permanecen guardados y puedes encontrarlos rápidamente más adelante.", privateTransfer:"Ya sea un restaurante, destino, evento, producto o un QR para tu hogar, con Mioseg qr no tienes que buscar la misma información una y otra vez."
  },
  it: {
    sectionEyebrow:"Cosa ti offre QR?", sectionTitle:"Due lati. Un'unica connessione.", sectionText:"Scegli una prospettiva e prova direttamente esempi QR reali.",
    selectorLabel:"Scegli il pubblico QR", privateBadge:"Per te", privateTitle:"Scansiona, conserva e ritrova più tardi.", privateText:"I QR code e QR interessanti non scompaiono più dopo la scansione. Salvali, organizzali e ritrovali quando servono.",
    privateFlow:["Scansiona","Salva","Ritrova","Segui"], privateHint:"Mostra esempi personali ↓", businessBadge:"Per le aziende", businessTitle:"Fornisci le informazioni esattamente dove servono.",
    businessText:"Collega un oggetto reale, una sede o un progetto a un QR. Aggiorna poi i contenuti senza sostituire il QR applicato.", businessFlow:["Crea","Applica","Aggiorna","Resta visibile"], businessHint:"Mostra esempi aziendali ↓",
    businessDemoTitle:"QR nell'uso reale", privateDemoTitle:"QR utili nella vita quotidiana", businessDemoText:"Apri gli esempi e scopri come prodotti, oggetti e servizi diversi funzionano con QR.", privateDemoText:"Apri gli esempi personali e scopri come salvare, ritrovare o proteggere i QR.",
    live:"QR live", open:"apri", demoPassword:"Password demo", objectLabelTitle:"QR direttamente sull'oggetto", objectLabelText:"Informazioni esattamente dove servono.",
    businessSectionEyebrow:"Mioseg qr per le aziende", businessSectionTitle:"Una macchina. Un QR. Tutte le informazioni importanti.", businessSectionText:"Un dipendente scansiona il QR direttamente sulla macchina e apre le informazioni memorizzate per quello specifico oggetto.",
    businessInfo:["Manuale operativo","Dati tecnici","Manutenzione e assistenza","Rapporti di controllo","Informazioni di sicurezza","Ricambi","Referente","Modifiche attuali"],
    businessPromiseTitle:"Applicalo una volta. Gestiscilo nel tempo.", businessPromiseText:"Il QR resta sulla macchina. Le informazioni collegate possono essere aggiornate in qualsiasi momento.", businessTransfer:"Ciò che funziona per una macchina funziona anche per prodotti, immobili, veicoli, edifici, progetti o sedi.",
    privateLabelTitle:"Scopri QR nella vita quotidiana", privateLabelText:"Salva ciò che ti interessa e ritrovalo più tardi.", privateSectionEyebrow:"Mioseg qr per te", privateSectionTitle:"Scopri. Salva. Ritrova.", privateSectionText:"Hai trovato un luogo, ristorante, attrazione o altro QR interessante? Scansionalo con Mioseg qr e conservalo.",
    privateInfo:["Scansiona","Salva","Organizza in cartelle","Segui","Ricevi aggiornamenti","Ritrova sulla mappa"], privatePromiseTitle:"Scoprilo una volta. Tienilo con te.", privatePromiseText:"I QR interessanti restano salvati e possono essere ritrovati rapidamente in seguito.", privateTransfer:"Ristorante, destinazione, evento, prodotto o QR per casa tua: con Mioseg qr non devi cercare ogni volta le stesse informazioni."
  },
  ar: {
    sectionEyebrow:"ماذا يقدم لك QR؟", sectionTitle:"جانبان. اتصال واحد.", sectionText:"اختر منظورًا وجرّب أمثلة QR حقيقية مباشرة أدناه.",
    selectorLabel:"اختر جمهور QR", privateBadge:"لك", privateTitle:"امسح واحفظ واعثر عليه لاحقًا.", privateText:"لن تختفي رموز QR وQR المهمة بعد المسح. احفظها ونظمها واعثر عليها عندما تحتاج إليها.",
    privateFlow:["امسح","احفظ","اعثر مجددًا","تابع"], privateHint:"عرض الأمثلة الشخصية ↓", businessBadge:"للشركات", businessTitle:"وفّر المعلومات في المكان الذي تحتاج إليه بالضبط.",
    businessText:"اربط شيئًا حقيقيًا أو موقعًا أو مشروعًا بـ QR. يمكنك تحديث المحتوى لاحقًا دون استبدال QR المثبت.", businessFlow:["أنشئ","ثبّت","حدّث","ابقَ ظاهرًا"], businessHint:"عرض أمثلة الشركات ↓",
    businessDemoTitle:"QR في الاستخدام الحقيقي", privateDemoTitle:"QR يمكنك استخدامه يوميًا", businessDemoText:"افتح الأمثلة وشاهد كيف تعمل المنتجات والأشياء والخدمات المختلفة مع QR.", privateDemoText:"افتح الأمثلة الشخصية وشاهد كيف يمكن حفظ QR والعثور عليه مجددًا أو حمايته.",
    live:"QR مباشر", open:"فتح", demoPassword:"كلمة مرور العرض", objectLabelTitle:"QR مباشرة على الشيء", objectLabelText:"المعلومات حيث تحتاج إليها.",
    businessSectionEyebrow:"Mioseg qr للشركات", businessSectionTitle:"آلة واحدة. QR واحد. كل المعلومات المهمة.", businessSectionText:"يمسح الموظف QR مباشرة على الآلة ويفتح المعلومات المخزنة لهذا الشيء تحديدًا.",
    businessInfo:["دليل التشغيل","البيانات التقنية","الصيانة والخدمة","تقارير الفحص","معلومات السلامة","قطع الغيار","جهة الاتصال","أحدث التغييرات"],
    businessPromiseTitle:"ثبّته مرة. وأدره باستمرار.", businessPromiseText:"يبقى QR على الآلة ويمكن تحديث المعلومات المرتبطة به في أي وقت.", businessTransfer:"ما يصلح للآلة يصلح أيضًا للمنتجات والعقارات والمركبات والمباني والمشاريع والمواقع.",
    privateLabelTitle:"اكتشف QR في حياتك اليومية", privateLabelText:"احفظ ما يهمك واعثر عليه لاحقًا.", privateSectionEyebrow:"Mioseg qr لك", privateSectionTitle:"اكتشف. احفظ. اعثر مجددًا.", privateSectionText:"وجدت مكانًا أو مطعمًا أو معلمًا أو QR آخر يهمك؟ امسحه باستخدام Mioseg qr واحتفظ به.",
    privateInfo:["امسح","احفظ","نظم في مجلدات","تابع","استلم التحديثات","اعثر عليه على الخريطة"], privatePromiseTitle:"اكتشفه مرة. واحتفظ به.", privatePromiseText:"تبقى رموز QR المهمة محفوظة ويمكن العثور عليها بسرعة لاحقًا.", privateTransfer:"سواء كان مطعمًا أو وجهة سفر أو فعالية أو منتجًا أو QR لمنزلك، لن تحتاج مع Mioseg qr إلى البحث عن المعلومات نفسها كل مرة."
  }
} as const;

const BUSINESS_DEMOS: Record<SupportedLocale, Demo[]> = {
  de: [
    { eyebrow:"Maschine & Industrie", title:"MX-500", text:"Betriebsanleitung, technische Daten, Wartung, Prüfberichte und aktuelle Änderungen direkt an der Maschine.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500 Industriemaschine mit QR-Code", cta:"QR-Code öffnen" },
    { eyebrow:"Business + Collection", title:"Theater am Rhein", text:"Ein dynamischer Theater-QR-Code bündelt die Spielzeit und verbindet mehrere eigenständige Produktionen in einer Collection.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein Spielzeit 2026/27", cta:"Collection öffnen" },
    { eyebrow:"Produkt", title:"AeroTherm X12", text:"Digitalisiere dein Produkt: Produktdaten, Dokumente, Support und spätere Aktualisierungen dauerhaft mit der Wärmepumpe verbinden.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12 Wärmepumpe", cta:"QR-Code öffnen" },
    { eyebrow:"Immobilie", title:"WohnOase", text:"Exposé, Bilder, Grundrisse, Standort und Kontakt über einen dauerhaft aktualisierbaren QR-Code bereitstellen.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase Immobilie", cta:"QR-Code öffnen" }
  ],
  en: [
    { eyebrow:"Machine & industry", title:"MX-500", text:"Operating manual, technical data, maintenance, inspection reports and current changes directly at the machine.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500 industrial machine with QR", cta:"Open QR" },
    { eyebrow:"Business QR + Collection", title:"Theater am Rhein", text:"A theater QR brings the season together and connects several independent productions in one Collection.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein 2026/27 season", cta:"Open Collection" },
    { eyebrow:"Product", title:"AeroTherm X12", text:"Connect product data, documents, support and future updates permanently to the heat pump.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12 heat pump", cta:"Open QR" },
    { eyebrow:"Real estate", title:"WohnOase", text:"Provide property details, images, floor plans, location and contact through a QR that can be updated at any time.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase property", cta:"Open QR" }
  ],
  tr: [
    { eyebrow:"Makine & endüstri", title:"MX-500", text:"Kullanım kılavuzu, teknik veriler, bakım, kontrol raporları ve güncel değişiklikler doğrudan makinede.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500", cta:"QR'i aç" },
    { eyebrow:"Business QR + Collection", title:"Theater am Rhein", text:"Tiyatro QR'i sezonu bir araya getirir ve birden fazla bağımsız prodüksiyonu Collection içinde bağlar.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein", cta:"Collection'ı aç" },
    { eyebrow:"Ürün", title:"AeroTherm X12", text:"Ürün verilerini, belgeleri, desteği ve gelecekteki güncellemeleri ısı pompasına kalıcı olarak bağla.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"QR'i aç" },
    { eyebrow:"Gayrimenkul", title:"WohnOase", text:"İlan, görseller, planlar, konum ve iletişimi her zaman güncellenebilir bir QR üzerinden sun.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase", cta:"QR'i aç" }
  ],
  pl: [
    { eyebrow:"Maszyna i przemysł", title:"MX-500", text:"Instrukcja obsługi, dane techniczne, konserwacja, raporty z kontroli i aktualne zmiany bezpośrednio przy maszynie.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500", cta:"Otwórz QR" },
    { eyebrow:"Business QR + Collection", title:"Theater am Rhein", text:"QR teatru łączy sezon i wiele niezależnych produkcji w jednej Collection.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein", cta:"Otwórz Collection" },
    { eyebrow:"Produkt", title:"AeroTherm X12", text:"Połącz dane produktu, dokumenty, wsparcie i przyszłe aktualizacje na stałe z pompą ciepła.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"Otwórz QR" },
    { eyebrow:"Nieruchomość", title:"WohnOase", text:"Udostępniaj ofertę, zdjęcia, plany, lokalizację i kontakt przez stale aktualizowany QR.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase", cta:"Otwórz QR" }
  ],
  fr: [
    { eyebrow:"Machine & industrie", title:"MX-500", text:"Mode d'emploi, données techniques, maintenance, rapports de contrôle et modifications directement sur la machine.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500", cta:"Ouvrir QR" },
    { eyebrow:"Business QR + Collection", title:"Theater am Rhein", text:"Un QR de théâtre regroupe la saison et relie plusieurs productions indépendantes dans une Collection.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein", cta:"Ouvrir la Collection" },
    { eyebrow:"Produit", title:"AeroTherm X12", text:"Reliez durablement données produit, documents, support et futures mises à jour à la pompe à chaleur.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"Ouvrir QR" },
    { eyebrow:"Immobilier", title:"WohnOase", text:"Présentez descriptif, images, plans, localisation et contact via un QR actualisable à tout moment.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase", cta:"Ouvrir QR" }
  ],
  es: [
    { eyebrow:"Máquina e industria", title:"MX-500", text:"Manual de uso, datos técnicos, mantenimiento, informes de inspección y cambios actuales directamente en la máquina.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500", cta:"Abrir QR" },
    { eyebrow:"Business QR + Collection", title:"Theater am Rhein", text:"Un QR del teatro reúne la temporada y conecta varias producciones independientes en una Collection.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein", cta:"Abrir Collection" },
    { eyebrow:"Producto", title:"AeroTherm X12", text:"Conecta permanentemente datos, documentos, soporte y futuras actualizaciones con la bomba de calor.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"Abrir QR" },
    { eyebrow:"Inmueble", title:"WohnOase", text:"Ofrece ficha, imágenes, planos, ubicación y contacto mediante un QR actualizable.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase", cta:"Abrir QR" }
  ],
  it: [
    { eyebrow:"Macchina & industria", title:"MX-500", text:"Manuale operativo, dati tecnici, manutenzione, rapporti di controllo e modifiche direttamente sulla macchina.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500", cta:"Apri QR" },
    { eyebrow:"Business QR + Collection", title:"Theater am Rhein", text:"Un QR del teatro riunisce la stagione e collega più produzioni indipendenti in una Collection.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein", cta:"Apri Collection" },
    { eyebrow:"Prodotto", title:"AeroTherm X12", text:"Collega in modo permanente dati, documenti, supporto e futuri aggiornamenti alla pompa di calore.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"Apri QR" },
    { eyebrow:"Immobile", title:"WohnOase", text:"Fornisci scheda, immagini, planimetrie, posizione e contatto tramite un QR sempre aggiornabile.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase", cta:"Apri QR" }
  ],
  ar: [
    { eyebrow:"الآلة والصناعة", title:"MX-500", text:"دليل التشغيل والبيانات التقنية والصيانة وتقارير الفحص وآخر التغييرات مباشرة على الآلة.", href:"https://www.mioseg-qr.com/qrx/2b87342e-809b-46ad-9ba1-4b7bcd5a3d67", image:"/landing/business-machine-qrx.png", imageAlt:"MX-500", cta:"فتح QR" },
    { eyebrow:"Business QR + Collection", title:"Theater am Rhein", text:"يجمع QR الخاص بالمسرح الموسم ويربط عدة عروض مستقلة ضمن Collection واحدة.", href:"https://www.mioseg-qr.com/qrx/17be4d84-a874-433f-a0c0-3cf32a9021c1", image:"/landing/theater.jpg", imageAlt:"Theater am Rhein", cta:"فتح Collection" },
    { eyebrow:"منتج", title:"AeroTherm X12", text:"اربط بيانات المنتج والوثائق والدعم والتحديثات المستقبلية بمضخة الحرارة بشكل دائم.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"فتح QR" },
    { eyebrow:"عقار", title:"WohnOase", text:"اعرض التفاصيل والصور والمخططات والموقع والتواصل عبر QR قابل للتحديث دائمًا.", href:"https://www.mioseg-qr.com/qrx/2f8a5f04-db67-4fc1-b80b-67a2c049140d", image:"/landing/immobilien.png", imageAlt:"WohnOase", cta:"فتح QR" }
  ]
};

const PRIVATE_DEMOS: Record<SupportedLocale, Demo[]> = {
  de: [
    { eyebrow:"Produkt im Alltag", title:"Meine AeroTherm X12", text:"QR-Code an der Wärmepumpe scannen, speichern und Handbuch, Produktinformationen sowie spätere Hersteller-Updates wiederfinden.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12 Wärmepumpe im privaten Einsatz", cta:"QR-Code öffnen" },
    { eyebrow:"Privater QR-Code", title:"Mein Zuhause", text:"Grundrisse, Energieausweis, Wartungsunterlagen und Hausinformationen in einem passwortgeschützten QR-Code bündeln.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Privater QR-Code Mein Zuhause", cta:"Geschützten QR-Code öffnen", password:"mioseg-qr" },
    { eyebrow:"Reise & Kultur", title:"Paris Culture Guide", text:"Sehenswürdigkeiten und Kultur entdecken, den QR-Code speichern und interessante Orte später wiederfinden.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"QR-Code öffnen" },
    { eyebrow:"Restaurant", title:"Trattoria Bellavista", text:"Speisekarte ansehen, Restaurant speichern und über neue Gerichte und aktuelle Angebote informiert bleiben.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista Restaurant", cta:"QR-Code öffnen" }
  ],
  en: [
    { eyebrow:"Everyday product", title:"My AeroTherm X12", text:"Scan and save the QR on the heat pump, then find the manual, product information and future manufacturer updates again later.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12 heat pump in personal use", cta:"Open QR" },
    { eyebrow:"Private QR", title:"My Home", text:"Keep floor plans, energy certificate, maintenance documents and home information together in a password-protected QR.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Private My Home QR", cta:"Open protected QR", password:"mioseg-qr" },
    { eyebrow:"Travel & culture", title:"Paris Culture Guide", text:"Discover attractions and culture, save the QR and find interesting places again later.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"Open QR" },
    { eyebrow:"Restaurant", title:"Trattoria Bellavista", text:"View the menu, save the restaurant and stay informed about new dishes and current offers.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista restaurant", cta:"Open QR" }
  ],
  tr: [
    { eyebrow:"Günlük ürün", title:"AeroTherm X12", text:"Isı pompasındaki QR'i tara, kaydet; kılavuzu, ürün bilgilerini ve gelecekteki üretici güncellemelerini yeniden bul.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"QR'i aç" },
    { eyebrow:"Özel QR", title:"Evim", text:"Kat planlarını, enerji belgesini, bakım belgelerini ve ev bilgilerini parola korumalı bir QR'te topla.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Home QR", cta:"Korumalı QR'i aç", password:"mioseg-qr" },
    { eyebrow:"Seyahat & kültür", title:"Paris Culture Guide", text:"Gezilecek yerleri ve kültürü keşfet, QR'i kaydet ve ilginç yerleri daha sonra yeniden bul.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"QR'i aç" },
    { eyebrow:"Restoran", title:"Trattoria Bellavista", text:"Menüyü görüntüle, restoranı kaydet ve yeni yemekler ile güncel tekliflerden haberdar ol.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista", cta:"QR'i aç" }
  ],
  pl: [
    { eyebrow:"Produkt na co dzień", title:"AeroTherm X12", text:"Zeskanuj i zapisz QR na pompie ciepła, a później odnajdź instrukcję, informacje o produkcie i aktualizacje producenta.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"Otwórz QR" },
    { eyebrow:"Prywatny QR", title:"Mój dom", text:"Połącz plany, świadectwo energetyczne, dokumenty konserwacji i informacje o domu w chronionym hasłem QR.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Home QR", cta:"Otwórz chroniony QR", password:"mioseg-qr" },
    { eyebrow:"Podróże i kultura", title:"Paris Culture Guide", text:"Odkrywaj atrakcje i kulturę, zapisz QR i odnajduj ciekawe miejsca później.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"Otwórz QR" },
    { eyebrow:"Restauracja", title:"Trattoria Bellavista", text:"Zobacz menu, zapisz restaurację i otrzymuj informacje o nowych daniach i ofertach.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista", cta:"Otwórz QR" }
  ],
  fr: [
    { eyebrow:"Produit au quotidien", title:"AeroTherm X12", text:"Scannez et enregistrez le QR de la pompe à chaleur, puis retrouvez manuel, informations produit et futures mises à jour du fabricant.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"Ouvrir QR" },
    { eyebrow:"QR privé", title:"Ma maison", text:"Regroupez plans, certificat énergétique, documents d'entretien et informations de la maison dans un QR protégé par mot de passe.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Home QR", cta:"Ouvrir le QR protégé", password:"mioseg-qr" },
    { eyebrow:"Voyage & culture", title:"Paris Culture Guide", text:"Découvrez sites et culture, enregistrez le QR et retrouvez les lieux intéressants plus tard.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"Ouvrir QR" },
    { eyebrow:"Restaurant", title:"Trattoria Bellavista", text:"Consultez le menu, enregistrez le restaurant et restez informé des nouveaux plats et offres.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista", cta:"Ouvrir QR" }
  ],
  es: [
    { eyebrow:"Producto cotidiano", title:"AeroTherm X12", text:"Escanea y guarda el QR de la bomba de calor y vuelve a encontrar el manual, la información del producto y futuras actualizaciones.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"Abrir QR" },
    { eyebrow:"QR privado", title:"Mi hogar", text:"Reúne planos, certificado energético, documentos de mantenimiento e información del hogar en un QR protegido por contraseña.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Home QR", cta:"Abrir QR protegido", password:"mioseg-qr" },
    { eyebrow:"Viajes y cultura", title:"Paris Culture Guide", text:"Descubre lugares y cultura, guarda el QR y vuelve a encontrar sitios interesantes más tarde.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"Abrir QR" },
    { eyebrow:"Restaurante", title:"Trattoria Bellavista", text:"Consulta el menú, guarda el restaurante y mantente informado sobre nuevos platos y ofertas.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista", cta:"Abrir QR" }
  ],
  it: [
    { eyebrow:"Prodotto quotidiano", title:"AeroTherm X12", text:"Scansiona e salva il QR sulla pompa di calore, poi ritrova manuale, informazioni prodotto e futuri aggiornamenti del produttore.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"Apri QR" },
    { eyebrow:"QR privato", title:"Casa mia", text:"Raccogli planimetrie, certificato energetico, documenti di manutenzione e informazioni della casa in un QR protetto da password.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Home QR", cta:"Apri QR protetto", password:"mioseg-qr" },
    { eyebrow:"Viaggi & cultura", title:"Paris Culture Guide", text:"Scopri attrazioni e cultura, salva il QR e ritrova i luoghi interessanti più tardi.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"Apri QR" },
    { eyebrow:"Ristorante", title:"Trattoria Bellavista", text:"Consulta il menu, salva il ristorante e resta aggiornato su nuovi piatti e offerte.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista", cta:"Apri QR" }
  ],
  ar: [
    { eyebrow:"منتج يومي", title:"AeroTherm X12", text:"امسح QR على مضخة الحرارة واحفظه ثم اعثر لاحقًا على الدليل ومعلومات المنتج وتحديثات الشركة المصنعة.", href:"https://www.mioseg-qr.com/qrx/4a44cab9-fcd6-4809-8dab-0301af443b0d", image:"/landing/wärmepumpe.png", imageAlt:"AeroTherm X12", cta:"فتح QR" },
    { eyebrow:"QR خاص", title:"منزلي", text:"اجمع المخططات وشهادة الطاقة ووثائق الصيانة ومعلومات المنزل في QR محمي بكلمة مرور.", href:"https://www.mioseg-qr.com/qrx/1f495090-4690-4d57-9081-cf21f09f7616", image:"/landing/mein zuhause.png", imageAlt:"Home QR", cta:"فتح QR المحمي", password:"mioseg-qr" },
    { eyebrow:"السفر والثقافة", title:"Paris Culture Guide", text:"اكتشف المعالم والثقافة واحفظ QR واعثر على الأماكن المهمة لاحقًا.", href:"https://www.mioseg-qr.com/qrx/e38e07d4-2f34-4a02-8908-40ce13f512f0", image:"/landing/paris.png", imageAlt:"Paris Culture Guide", cta:"فتح QR" },
    { eyebrow:"مطعم", title:"Trattoria Bellavista", text:"اطلع على القائمة واحفظ المطعم وابقَ على اطلاع بالأطباق الجديدة والعروض الحالية.", href:"https://www.mioseg-qr.com/qrx/5260589f-6a8d-43ad-8348-ee8ad22c0c4b", image:"/landing/restaurant.jpg", imageAlt:"Trattoria Bellavista", cta:"فتح QR" }
  ]
};

export default function HomeAudienceDemos({ locale = "de" }: { locale?: string }) {
  const language: SupportedLocale = (["de","en","tr","pl","ar","fr","es","it"] as const).includes(locale as SupportedLocale) ? locale as SupportedLocale : "en";
  const c = COPY[language];
  const [activeAudience, setActiveAudience] = useState<Audience>("business");
  const demoPanelRef = useRef<HTMLDivElement>(null);
  const demos = activeAudience === "business" ? BUSINESS_DEMOS[language] : PRIVATE_DEMOS[language];

  const selectAudience = (audience: Audience) => {
    setActiveAudience(audience);

    // Wait until React has rendered the selected examples before scrolling.
    // Two animation frames make this reliable in desktop and mobile browsers.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        demoPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  return (
    <section className="landingBAudience" aria-labelledby="audience-title">
      <div className="landingBSectionHeader">
        <span className="landingBEyebrow">{c.sectionEyebrow}</span>
        <h2 id="audience-title">{c.sectionTitle}</h2>
        <p>{c.sectionText}</p>
      </div>

      <div className="landingBAudienceGrid landingBAudienceSelector" role="group" aria-label={c.selectorLabel}>
        <button type="button" className={`landingBAudienceCard landingBAudienceChoice ${activeAudience === "private" ? "landingBAudienceChoiceActive" : ""}`} onClick={() => selectAudience("private")} aria-pressed={activeAudience === "private"} aria-controls="audience-examples">
          <span className="landingBAudienceBadge">{c.privateBadge}</span>
          <h3>{c.privateTitle}</h3>
          <p>{c.privateText}</p>
          <div className="landingBAudienceFlow">{c.privateFlow.map((x,i) => <span key={x}>{i > 0 && <b>→</b>}{x}</span>)}</div>
          <span className="landingBAudienceOpenHint">{c.privateHint}</span>
        </button>

        <button type="button" className={`landingBAudienceCard landingBAudienceCardBusiness landingBAudienceChoice ${activeAudience === "business" ? "landingBAudienceChoiceActive" : ""}`} onClick={() => selectAudience("business")} aria-pressed={activeAudience === "business"} aria-controls="audience-examples">
          <span className="landingBAudienceBadge">{c.businessBadge}</span>
          <h3>{c.businessTitle}</h3>
          <p>{c.businessText}</p>
          <div className="landingBAudienceFlow">{c.businessFlow.map((x,i) => <span key={x}>{i > 0 && <b>→</b>}{x}</span>)}</div>
          <span className="landingBAudienceOpenHint">{c.businessHint}</span>
        </button>
      </div>

      <div
        id="audience-examples"
        ref={demoPanelRef}
        className="landingBAudienceDemoPanel"
        aria-live="polite"
        style={{ scrollMarginTop: "clamp(72px, 10vh, 112px)" }}
      >
        <div className="landingBAudienceDemoHead">
          <div>
            <span className="landingBAudienceBadge">{activeAudience === "business" ? c.businessBadge : c.privateBadge}</span>
            <h3>{activeAudience === "business" ? c.businessDemoTitle : c.privateDemoTitle}</h3>
          </div>
          <p>{activeAudience === "business" ? c.businessDemoText : c.privateDemoText}</p>
        </div>

        <div className="landingBAudienceDemoGrid">
          {demos.map((demo) => (
            <article className="landingBAudienceDemoCard" key={`${activeAudience}-${demo.title}`}>
              <a href={demo.href} target="_blank" rel="noreferrer" className="landingBAudienceDemoImageLink" aria-label={`${demo.title} ${c.open}`}>
                <img src={demo.image} alt={demo.imageAlt} className="landingBAudienceDemoImage" />
                <span className="landingBAudienceDemoImageBadge">{c.live}</span>
              </a>
              <div className="landingBAudienceDemoBody">
                <small>{demo.eyebrow}</small><h4>{demo.title}</h4><p>{demo.text}</p>
                {demo.password && <div className="landingBAudienceDemoPassword"><span>🔐 {c.demoPassword}</span><strong>{demo.password}</strong></div>}
                <a className="landingBAudienceDemoLink" href={demo.href} target="_blank" rel="noreferrer">{demo.cta} <span>→</span></a>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeAudience === "business" ? (
        <section id="business" className="landingBBusiness">
          <div className="landingBBusinessVisual">
            <img src="/landing/business-machine-qrx.png" alt={language === "de" ? "Mitarbeiter scannt einen QR an einer Industriemaschine" : "Employee scans a QR on an industrial machine"} className="landingBBusinessImage" />
            <div className="landingBBusinessImageLabel"><strong>{c.objectLabelTitle}</strong><span>{c.objectLabelText}</span></div>
          </div>
          <div className="landingBBusinessCopy">
            <span className="landingBEyebrow">{c.businessSectionEyebrow}</span><h2>{c.businessSectionTitle}</h2><p>{c.businessSectionText}</p>
            <div className="landingBBusinessInfoGrid">{c.businessInfo.map(item => <span key={item}>✓ {item}</span>)}</div>
            <div className="landingBBusinessPromise"><strong>{c.businessPromiseTitle}</strong><p>{c.businessPromiseText}</p></div>
            <p className="landingBBusinessTransfer">{c.businessTransfer}</p>
          </div>
        </section>
      ) : (
        <section className="landingBBusiness">
          <div className="landingBBusinessVisual">
            <img src="/landing/Trattoria.png" alt={language === "de" ? "Person scannt einen QR an der Trattoria Bellavista" : "Person scans a QR at Trattoria Bellavista"} className="landingBBusinessImage" />
            <div className="landingBBusinessImageLabel"><strong>{c.privateLabelTitle}</strong><span>{c.privateLabelText}</span></div>
          </div>
          <div className="landingBBusinessCopy">
            <span className="landingBEyebrow">{c.privateSectionEyebrow}</span><h2>{c.privateSectionTitle}</h2><p>{c.privateSectionText}</p>
            <div className="landingBBusinessInfoGrid">{c.privateInfo.map(item => <span key={item}>✓ {item}</span>)}</div>
            <div className="landingBBusinessPromise"><strong>{c.privatePromiseTitle}</strong><p>{c.privatePromiseText}</p></div>
            <p className="landingBBusinessTransfer">{c.privateTransfer}</p>
          </div>
        </section>
      )}
    </section>
  );
}
