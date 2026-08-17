// src/legal/imprint.ts

import { getLegalLocale } from "./get-legal-locale";
import type { LegalDocument, LegalLocale } from "./types";

const imprintDocuments: Partial<Record<LegalLocale, LegalDocument>> = {
  de: {
    title: "Impressum",
    subtitle:
      "Anbieterkennzeichnung für die App und Webplattform von mioseg qr / QR-X.",
    sections: [
      {
        title: "Angaben gemäß § 5 TMG",
        content: [
          "Minh Hoang Huynh",
          "Einzelunternehmen",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Deutschland",
        ],
      },
      {
        title: "Kontakt",
        content: ["E-Mail: info@mioseg-qr.com"],
      },
      {
        title: "Umsatzsteuer-ID gemäß § 27 a Umsatzsteuergesetz",
        content: ["DE357674467"],
      },
      {
        title: "Vertreten durch",
        content: ["Minh Hoang Huynh"],
      },
      {
        title: "Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 MStV",
        content: [
          "Minh Hoang Huynh",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Deutschland",
        ],
      },
      {
        title: "Haftung für Inhalte",
        content: [
          "Die Inhalte unserer App und Website wurden mit größter Sorgfalt erstellt.",
          "Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.",
        ],
      },
      {
        title: "Haftung für Links",
        content: [
          "Unsere App und Website können Links zu externen Websites Dritter enthalten.",
          "Auf deren Inhalte haben wir keinen Einfluss.",
          "Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.",
        ],
      },
      {
        title: "Urheberrecht",
        content: [
          "Die durch den Anbieter erstellten Inhalte und Werke in dieser App und auf dieser Website unterliegen dem deutschen Urheberrecht.",
          "Beiträge Dritter sind als solche gekennzeichnet.",
        ],
      },
      {
        title: "Haftung für Nutzerinhalte",
        content: [
          "Nutzer können eigene Inhalte wie Texte, Bilder, Videos und Audiodateien hochladen.",
          "Für diese Inhalte sind ausschließlich die jeweiligen Nutzer verantwortlich.",
          "Der Anbieter übernimmt keine Haftung für Inhalte, die von Nutzern bereitgestellt werden.",
          "Der Anbieter behält sich vor, Inhalte zu prüfen, zu sperren oder zu löschen, sofern diese gegen geltendes Recht oder die Nutzungsbedingungen verstoßen.",
        ],
      },
      {
        title: "Geltungsbereich",
        content: [
          "Dieses Impressum gilt für die mobile App „mioseg qr“ / „QR-X“, die zugehörige Webplattform sowie öffentlich erreichbare QR-X-Webansichten.",
        ],
      },
    ],
  },

  tr: {
    title: "Yasal Bildirim",
    subtitle:
      "mioseg qr / QR-X uygulaması ve web platformu için sağlayıcı bilgileri.",
    sections: [
      {
        title: "§ 5 TMG uyarınca bilgiler",
        content: [
          "Minh Hoang Huynh",
          "Şahıs işletmesi",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Almanya",
        ],
      },
      {
        title: "İletişim",
        content: [
          "E-posta: info@mioseg-qr.com",
        ],
      },
      {
        title: "Alman Katma Değer Vergisi Kanunu § 27 a uyarınca KDV kimlik numarası",
        content: [
          "DE357674467",
        ],
      },
      {
        title: "Temsil eden",
        content: [
          "Minh Hoang Huynh",
        ],
      },
      {
        title: "MStV § 18 fıkra 2 uyarınca gazetecilik ve editoryal içerikten sorumlu kişi",
        content: [
          "Minh Hoang Huynh",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Almanya",
        ],
      },
      {
        title: "İçerik sorumluluğu",
        content: [
          "Uygulamamızın ve web sitemizin içerikleri büyük bir özenle hazırlanmıştır.",
          "Ancak içeriklerin doğruluğu, eksiksizliği ve güncelliği konusunda garanti veremeyiz.",
        ],
      },
      {
        title: "Bağlantılar için sorumluluk",
        content: [
          "Uygulamamız ve web sitemiz üçüncü taraflara ait harici web sitelerine bağlantılar içerebilir.",
          "Bu web sitelerinin içerikleri üzerinde herhangi bir etkimiz yoktur.",
          "Bağlantı verilen sayfaların içeriklerinden her zaman ilgili sağlayıcı veya işletmeci sorumludur.",
        ],
      },
      {
        title: "Telif hakkı",
        content: [
          "Sağlayıcı tarafından bu uygulamada ve web sitesinde oluşturulan içerik ve eserler Alman telif hakkı mevzuatına tabidir.",
          "Üçüncü taraf içerikleri uygun olduğu ölçüde bu şekilde belirtilir.",
        ],
      },
      {
        title: "Kullanıcı içerikleri için sorumluluk",
        content: [
          "Kullanıcılar metin, görsel, video ve ses dosyaları gibi kendi içeriklerini yükleyebilir.",
          "Bu içeriklerden yalnızca ilgili kullanıcılar sorumludur.",
          "Sağlayıcı, kullanıcılar tarafından sağlanan içerikler için sorumluluk üstlenmez.",
          "Sağlayıcı, yürürlükteki hukuka veya Kullanım Koşullarına aykırı içerikleri inceleme, engelleme veya silme hakkını saklı tutar.",
        ],
      },
      {
        title: "Kapsam",
        content: [
          "Bu Yasal Bildirim, „mioseg qr“ / „QR-X“ mobil uygulaması, ilgili web platformu ve herkese açık QR-X web görünümleri için geçerlidir.",
        ],
      },
    ],
  },
  pl: {
    title: "Impressum",
    subtitle:
      "Informacje o usługodawcy aplikacji i platformy internetowej mioseg qr / QR-X.",
    sections: [
      {
        title: "Informacje zgodnie z § 5 TMG",
        content: [
          "Minh Hoang Huynh",
          "Jednoosobowa działalność gospodarcza",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Niemcy",
        ],
      },
      {
        title: "Kontakt",
        content: [
          "E-mail: info@mioseg-qr.com",
        ],
      },
      {
        title: "Numer identyfikacyjny VAT zgodnie z § 27 a niemieckiej ustawy o VAT",
        content: [
          "DE357674467",
        ],
      },
      {
        title: "Reprezentowany przez",
        content: [
          "Minh Hoang Huynh",
        ],
      },
      {
        title: "Osoba odpowiedzialna za treści dziennikarsko-redakcyjne zgodnie z § 18 ust. 2 MStV",
        content: [
          "Minh Hoang Huynh",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Niemcy",
        ],
      },
      {
        title: "Odpowiedzialność za treści",
        content: [
          "Treści naszej aplikacji i strony internetowej zostały przygotowane z największą starannością.",
          "Nie możemy jednak zagwarantować prawidłowości, kompletności ani aktualności treści.",
        ],
      },
      {
        title: "Odpowiedzialność za linki",
        content: [
          "Nasza aplikacja i strona internetowa mogą zawierać linki do zewnętrznych stron internetowych osób trzecich.",
          "Nie mamy wpływu na ich treść.",
          "Za treść stron, do których prowadzą linki, odpowiada zawsze odpowiedni dostawca lub operator.",
        ],
      },
      {
        title: "Prawo autorskie",
        content: [
          "Treści i utwory stworzone przez usługodawcę w tej aplikacji i na tej stronie internetowej podlegają niemieckiemu prawu autorskiemu.",
          "Treści osób trzecich są odpowiednio oznaczone.",
        ],
      },
      {
        title: "Odpowiedzialność za treści użytkowników",
        content: [
          "Użytkownicy mogą przesyłać własne treści, takie jak teksty, obrazy, filmy i pliki audio.",
          "Za te treści odpowiadają wyłącznie poszczególni użytkownicy.",
          "Usługodawca nie ponosi odpowiedzialności za treści udostępniane przez użytkowników.",
          "Usługodawca zastrzega sobie prawo do sprawdzania, blokowania lub usuwania treści, jeżeli naruszają one obowiązujące prawo lub Warunki korzystania.",
        ],
      },
      {
        title: "Zakres obowiązywania",
        content: [
          "Niniejsze informacje prawne dotyczą aplikacji mobilnej „mioseg qr” / „QR-X”, powiązanej platformy internetowej oraz publicznie dostępnych widoków internetowych QR-X.",
        ],
      },
    ],
  },
  ar: {
    title: "البيانات القانونية",
    subtitle:
      "معلومات مقدم الخدمة لتطبيق mioseg qr / QR-X والمنصة الإلكترونية.",
    sections: [
      {
        title: "المعلومات وفق § 5 TMG",
        content: [
          "Minh Hoang Huynh",
          "منشأة فردية",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "ألمانيا",
        ],
      },
      {
        title: "الاتصال",
        content: [
          "البريد الإلكتروني: info@mioseg-qr.com",
        ],
      },
      {
        title: "رقم تعريف ضريبة القيمة المضافة وفق § 27 a من قانون ضريبة القيمة المضافة الألماني",
        content: [
          "DE357674467",
        ],
      },
      {
        title: "يمثله",
        content: [
          "Minh Hoang Huynh",
        ],
      },
      {
        title: "المسؤول عن المحتوى الصحفي والتحريري وفق § 18 الفقرة 2 MStV",
        content: [
          "Minh Hoang Huynh",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "ألمانيا",
        ],
      },
      {
        title: "المسؤولية عن المحتوى",
        content: [
          "تم إعداد محتوى تطبيقنا وموقعنا الإلكتروني بعناية كبيرة.",
          "ومع ذلك لا يمكننا ضمان صحة المحتوى أو اكتماله أو حداثته.",
        ],
      },
      {
        title: "المسؤولية عن الروابط",
        content: [
          "قد يحتوي تطبيقنا وموقعنا الإلكتروني على روابط لمواقع خارجية تابعة لأطراف ثالثة.",
          "ليس لنا تأثير على محتوى هذه المواقع.",
          "يتحمل مقدم أو مشغل الصفحة المرتبطة دائمًا مسؤولية محتواها.",
        ],
      },
      {
        title: "حقوق النشر",
        content: [
          "تخضع المحتويات والأعمال التي أنشأها مقدم الخدمة في هذا التطبيق وعلى هذا الموقع لقانون حقوق النشر الألماني.",
          "تُميز مساهمات الأطراف الثالثة على هذا الأساس عند الاقتضاء.",
        ],
      },
      {
        title: "المسؤولية عن محتوى المستخدمين",
        content: [
          "يمكن للمستخدمين رفع محتوياتهم الخاصة مثل النصوص والصور والفيديوهات والملفات الصوتية.",
          "يتحمل المستخدمون المعنيون وحدهم مسؤولية هذه المحتويات.",
          "لا يتحمل مقدم الخدمة مسؤولية المحتويات التي يوفرها المستخدمون.",
          "يحتفظ مقدم الخدمة بالحق في فحص أو حظر أو حذف المحتويات إذا خالفت القانون الساري أو شروط الاستخدام.",
        ],
      },
      {
        title: "نطاق التطبيق",
        content: [
          "ينطبق هذا Impressum على تطبيق «mioseg qr» / «QR-X» للهاتف المحمول والمنصة الإلكترونية المرتبطة به وصفحات QR-X العامة المتاحة عبر الويب.",
        ],
      },
    ],
  },
  fr: {
    title: "Mentions légales",
    subtitle:
      "Informations sur le prestataire de l’application mioseg qr / QR-X et de la plateforme web.",
    sections: [
      {
        title: "Informations conformément au § 5 TMG",
        content: [
          "Minh Hoang Huynh",
          "Entreprise individuelle",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Allemagne",
        ],
      },
      {
        title: "Contact",
        content: [
          "E-mail : info@mioseg-qr.com",
        ],
      },
      {
        title: "Numéro de TVA conformément au § 27 a de la loi allemande sur la TVA",
        content: [
          "DE357674467",
        ],
      },
      {
        title: "Représenté par",
        content: [
          "Minh Hoang Huynh",
        ],
      },
      {
        title: "Responsable du contenu journalistique et éditorial conformément au § 18 al. 2 MStV",
        content: [
          "Minh Hoang Huynh",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Allemagne",
        ],
      },
      {
        title: "Responsabilité pour les contenus",
        content: [
          "Les contenus de notre application et de notre site web ont été élaborés avec le plus grand soin.",
          "Nous ne pouvons toutefois garantir l’exactitude, l’exhaustivité ou l’actualité des contenus.",
        ],
      },
      {
        title: "Responsabilité pour les liens",
        content: [
          "Notre application et notre site web peuvent contenir des liens vers des sites externes de tiers.",
          "Nous n’avons aucune influence sur leur contenu.",
          "Le fournisseur ou l’exploitant concerné reste toujours responsable du contenu des pages liées.",
        ],
      },
      {
        title: "Droit d’auteur",
        content: [
          "Les contenus et œuvres créés par le prestataire dans cette application et sur ce site sont soumis au droit d’auteur allemand.",
          "Les contributions de tiers sont signalées comme telles lorsque cela est applicable.",
        ],
      },
      {
        title: "Responsabilité pour les contenus des utilisateurs",
        content: [
          "Les utilisateurs peuvent télécharger leurs propres contenus, tels que textes, images, vidéos et fichiers audio.",
          "Les utilisateurs concernés sont seuls responsables de ces contenus.",
          "Le prestataire n’assume aucune responsabilité pour les contenus fournis par les utilisateurs.",
          "Le prestataire se réserve le droit de contrôler, bloquer ou supprimer les contenus s’ils enfreignent le droit applicable ou les Conditions d’utilisation.",
        ],
      },
      {
        title: "Champ d’application",
        content: [
          "Les présentes Mentions légales s’appliquent à l’application mobile « mioseg qr » / « QR-X », à la plateforme web associée et aux vues web publiques de QR-X.",
        ],
      },
    ],
  },
  es: {
    title: "Aviso legal",
    subtitle:
      "Información del proveedor de la aplicación mioseg qr / QR-X y de la plataforma web.",
    sections: [
      {
        title: "Información conforme al § 5 TMG",
        content: [
          "Minh Hoang Huynh",
          "Empresario individual",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Alemania",
        ],
      },
      {
        title: "Contacto",
        content: [
          "Correo electrónico: info@mioseg-qr.com",
        ],
      },
      {
        title: "Número de identificación del IVA conforme al § 27 a de la Ley alemana del IVA",
        content: [
          "DE357674467",
        ],
      },
      {
        title: "Representado por",
        content: [
          "Minh Hoang Huynh",
        ],
      },
      {
        title: "Responsable del contenido periodístico-editorial conforme al § 18, apartado 2, MStV",
        content: [
          "Minh Hoang Huynh",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Alemania",
        ],
      },
      {
        title: "Responsabilidad por los contenidos",
        content: [
          "Los contenidos de nuestra aplicación y nuestro sitio web se han elaborado con el máximo cuidado.",
          "No obstante, no podemos garantizar la exactitud, integridad o actualidad de los contenidos.",
        ],
      },
      {
        title: "Responsabilidad por enlaces",
        content: [
          "Nuestra aplicación y nuestro sitio web pueden contener enlaces a sitios web externos de terceros.",
          "No tenemos influencia sobre sus contenidos.",
          "El proveedor u operador correspondiente es siempre responsable del contenido de las páginas enlazadas.",
        ],
      },
      {
        title: "Derechos de autor",
        content: [
          "Los contenidos y obras creados por el proveedor en esta aplicación y en este sitio web están sujetos a la legislación alemana sobre derechos de autor.",
          "Las contribuciones de terceros se identifican como tales cuando corresponde.",
        ],
      },
      {
        title: "Responsabilidad por contenidos de usuarios",
        content: [
          "Los usuarios pueden subir sus propios contenidos, como textos, imágenes, vídeos y archivos de audio.",
          "Los respectivos usuarios son los únicos responsables de dichos contenidos.",
          "El proveedor no asume responsabilidad por los contenidos proporcionados por los usuarios.",
          "El proveedor se reserva el derecho de revisar, bloquear o eliminar contenidos si infringen la legislación aplicable o las Condiciones de uso.",
        ],
      },
      {
        title: "Ámbito de aplicación",
        content: [
          "Este Impressum se aplica a la aplicación móvil «mioseg qr» / «QR-X», a la plataforma web asociada y a las vistas web públicas de QR-X.",
        ],
      },
    ],
  },
  it: {
    title: "Impressum",
    subtitle:
      "Informazioni sul fornitore dell’app mioseg qr / QR-X e della piattaforma web.",
    sections: [
      {
        title: "Informazioni ai sensi del § 5 TMG",
        content: [
          "Minh Hoang Huynh",
          "Impresa individuale",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Germania",
        ],
      },
      {
        title: "Contatto",
        content: [
          "E-mail: info@mioseg-qr.com",
        ],
      },
      {
        title: "Partita IVA ai sensi del § 27 a della legge tedesca sull’IVA",
        content: [
          "DE357674467",
        ],
      },
      {
        title: "Rappresentato da",
        content: [
          "Minh Hoang Huynh",
        ],
      },
      {
        title: "Responsabile dei contenuti giornalistico-editoriali ai sensi del § 18 comma 2 MStV",
        content: [
          "Minh Hoang Huynh",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Germania",
        ],
      },
      {
        title: "Responsabilità per i contenuti",
        content: [
          "I contenuti della nostra app e del nostro sito web sono stati creati con la massima cura.",
          "Tuttavia non possiamo garantire la correttezza, completezza o attualità dei contenuti.",
        ],
      },
      {
        title: "Responsabilità per i link",
        content: [
          "La nostra app e il nostro sito web possono contenere link a siti esterni di terzi.",
          "Non abbiamo alcuna influenza sui loro contenuti.",
          "Il rispettivo fornitore o gestore è sempre responsabile dei contenuti delle pagine collegate.",
        ],
      },
      {
        title: "Diritto d’autore",
        content: [
          "I contenuti e le opere creati dal fornitore in questa app e su questo sito sono soggetti al diritto d’autore tedesco.",
          "I contributi di terzi sono indicati come tali ove applicabile.",
        ],
      },
      {
        title: "Responsabilità per i contenuti degli utenti",
        content: [
          "Gli utenti possono caricare propri contenuti, come testi, immagini, video e file audio.",
          "I rispettivi utenti sono gli unici responsabili di tali contenuti.",
          "Il fornitore non si assume alcuna responsabilità per i contenuti forniti dagli utenti.",
          "Il fornitore si riserva il diritto di controllare, bloccare o eliminare contenuti qualora violino la legge applicabile o le Condizioni d’uso.",
        ],
      },
      {
        title: "Ambito di applicazione",
        content: [
          "Il presente Impressum si applica all’app mobile «mioseg qr» / «QR-X», alla relativa piattaforma web e alle visualizzazioni web pubbliche dei QR-X.",
        ],
      },
    ],
  },
  en: {
    title: "Legal Notice",
    subtitle:
      "Provider information for the app and web platform of mioseg qr / QR-X.",
    sections: [
      {
        title: "Information according to § 5 TMG",
        content: [
          "Minh Hoang Huynh",
          "Sole proprietorship",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Germany",
        ],
      },
      {
        title: "Contact",
        content: ["Email: info@mioseg-qr.com"],
      },
      {
        title: "VAT ID according to § 27 a German VAT Act",
        content: ["DE357674467"],
      },
      {
        title: "Represented by",
        content: ["Minh Hoang Huynh"],
      },
      {
        title: "Responsible for editorial content according to § 18 para. 2 MStV",
        content: [
          "Minh Hoang Huynh",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Germany",
        ],
      },
      {
        title: "Liability for content",
        content: [
          "The content of our app and website has been created with great care.",
          "However, we cannot assume any liability for the accuracy, completeness, or timeliness of the content.",
        ],
      },
      {
        title: "Liability for links",
        content: [
          "Our app and website may contain links to external third-party websites.",
          "We have no influence over the content of those websites.",
          "The respective provider or operator is always responsible for the content of linked pages.",
        ],
      },
      {
        title: "Copyright",
        content: [
          "Content and works created by the provider in this app and on this website are subject to German copyright law.",
          "Third-party content is marked as such where applicable.",
        ],
      },
      {
        title: "Liability for user content",
        content: [
          "Users may upload their own content such as text, images, videos, and audio files.",
          "Users are solely responsible for such content.",
          "The provider assumes no liability for content supplied by users.",
          "The provider reserves the right to review, block, or remove content if it violates applicable law or the Terms of Use.",
        ],
      },
      {
        title: "Scope",
        content: [
          "This legal notice applies to the mobile app “mioseg qr” / “QR-X”, the associated web platform, and publicly accessible QR-X web views.",
        ],
      },
    ],
  },
};

const fallbackNotices: Partial<Record<LegalLocale, string>> = {
  de: "",
  en: "",
  tr: "",
  pl: "",
  ar: "",
  fr: "",
  es: "",
  it: "",
};

export function getImprintDocument(language: string | null | undefined): LegalDocument {
  const locale = getLegalLocale(language);
  const directDocument = imprintDocuments[locale];

  if (directDocument) {
    return directDocument;
  }

  const germanFallback = imprintDocuments.de!;

  return {
    ...germanFallback,
    fallbackNotice: fallbackNotices[locale] ?? "",
  };
}