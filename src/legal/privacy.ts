// src/legal/privacy.ts

import { getLegalLocale } from "./get-legal-locale";
import type { LegalDocument, LegalLocale } from "./types";

const privacyDocuments: Partial<Record<LegalLocale, LegalDocument>> = {
  de: {
    title: "Datenschutzerklärung",
    subtitle:
      "Informationen zur Verarbeitung personenbezogener Daten in der App und Webplattform von mioseg qr / QR-X.",
    sections: [
      {
        title: "1. Verantwortlicher",
        content: [
          "Verantwortlich für die Datenverarbeitung ist:",
          "Minh Hoang Huynh",
          "Einzelunternehmen",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Deutschland",
          "E-Mail: info@mioseg-qr.com",
        ],
      },
      {
        title: "2. Allgemeines zur Datenverarbeitung",
        content: [
          "Wir verarbeiten personenbezogene Daten der Nutzer nur, soweit dies zur Bereitstellung einer funktionsfähigen App, der Webplattform sowie unserer Inhalte und Leistungen erforderlich ist.",
          "Die Verarbeitung erfolgt gemäß den geltenden datenschutzrechtlichen Vorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO).",
        ],
      },
      {
        title: "3. Registrierung und Benutzerkonto",
        content: [
          "Bei der Registrierung werden insbesondere folgende Daten verarbeitet:",
          "– E-Mail-Adresse",
          "– Passwort in verschlüsselter Form",
          "Zweck der Verarbeitung ist die Erstellung und Verwaltung des Benutzerkontos sowie die Authentifizierung des Nutzers.",
        ],
      },
      {
        title: "4. Nutzung der App und QR-X Funktionen",
        content: [
          "Bei Nutzung der App können insbesondere folgende Daten verarbeitet werden:",
          "– erstellte QR-X Inhalte",
          "– gespeicherte und verwaltete QR-Codes",
          "– Zeitstempel, Änderungen und technische Metadaten",
          "– Inhalte in normalen QR-X und Business QR-X",
          "Zweck der Verarbeitung ist die Bereitstellung, Verwaltung und Nutzung der Funktionen der App und Webplattform.",
        ],
      },
      {
        title: "5. Hochgeladene Inhalte und Medien",
        content: [
          "Nutzer können eigene Inhalte hochladen, speichern und verwalten, insbesondere:",
          "– Bilder",
          "– Videos wie MP4-Dateien",
          "– Audiodateien wie MP3-Dateien",
          "– sonstige unterstützte Medien und Inhalte",
          "Diese Inhalte werden gespeichert und verarbeitet, um die Funktionen der App bereitzustellen.",
        ],
      },
      {
        title: "6. Standortdaten",
        content: [
          "Die App kann Standortdaten erfassen, wenn der Nutzer dies aktiv erlaubt.",
          "Dies geschieht insbesondere beim Scannen eines QR-Codes oder beim Erstellen eines QR-X.",
          "Standortdaten werden nur verarbeitet oder gespeichert, wenn der Nutzer im jeweiligen Vorgang zustimmt.",
          "Zweck der Verarbeitung kann insbesondere die Dokumentation des Scan-Standorts oder die Verwaltung standortbezogener QR-X Inhalte sein.",
        ],
      },
      {
        title: "7. Server- und Logdaten",
        content: [
          "Bei der Nutzung der App und Webplattform können automatisch technische Daten verarbeitet werden, insbesondere:",
          "– IP-Adresse",
          "– Gerätetyp",
          "– Betriebssystem",
          "– Zeitpunkt des Zugriffs",
          "– technische Fehler- und Protokolldaten",
          "Zweck der Verarbeitung ist die Sicherheit, Stabilität, Fehleranalyse und Missbrauchsprävention.",
        ],
      },
      {
        title: "8. Zahlungsabwicklung und In-App Käufe",
        content: [
          "Digitale Käufe innerhalb der App erfolgen über den Apple App Store oder den Google Play Store.",
          "Die Zahlungsabwicklung erfolgt ausschließlich über die jeweiligen Plattformbetreiber.",
          "Wir selbst verarbeiten keine Zahlungsdaten wie Kreditkartennummern oder Bankdaten der Nutzer.",
        ],
      },
      {
        title: "9. Eingesetzte Dienstleister",
        content: [
          "Zur technischen Bereitstellung unseres Angebots setzen wir externe Dienstleister ein.",
          "Hierzu gehört insbesondere Supabase als Backend-, Datenbank-, Authentifizierungs- und Speicherlösung.",
          "Zur Verwaltung und Validierung von In-App Käufen setzen wir RevenueCat ein.",
          "Dabei können insbesondere App-User-ID, Kaufstatus und produktbezogene Informationen verarbeitet werden.",
        ],
      },
      {
        title: "10. Speicherdauer",
        content: [
          "Personenbezogene Daten werden nur so lange gespeichert, wie dies für die jeweiligen Zwecke erforderlich ist.",
          "Nutzer können ihr Konto im Rahmen der verfügbaren Funktionen löschen lassen bzw. eine Löschung anfragen.",
          "Gesetzliche Aufbewahrungspflichten bleiben unberührt.",
        ],
      },
      {
        title: "11. Rechte der betroffenen Personen",
        content: [
          "Nutzer haben insbesondere folgende Rechte:",
          "– Recht auf Auskunft",
          "– Recht auf Berichtigung",
          "– Recht auf Löschung",
          "– Recht auf Einschränkung der Verarbeitung",
          "– Recht auf Datenübertragbarkeit",
          "– Recht auf Widerruf einer erteilten Einwilligung",
          "– Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde",
        ],
      },
      {
        title: "12. Datensicherheit",
        content: [
          "Wir setzen technische und organisatorische Maßnahmen ein, um personenbezogene Daten bestmöglich vor Verlust, Manipulation und unbefugtem Zugriff zu schützen.",
          "Trotz aller Sorgfalt kann eine vollständige Sicherheit bei digitaler Datenübertragung und Speicherung jedoch nicht garantiert werden.",
        ],
      },
      {
        title: "13. Änderungen dieser Datenschutzerklärung",
        content: [
          "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, sofern dies aufgrund rechtlicher, technischer oder geschäftlicher Entwicklungen erforderlich ist.",
          "Die jeweils aktuelle Fassung wird in der App und auf der Webplattform bereitgestellt.",
        ],
      },
      {
        title: "14. Kontakt",
        content: ["Bei Fragen zum Datenschutz: info@mioseg-qr.com"],
      },
    ],
  },

  tr: {
    title: "Gizlilik Politikası",
    subtitle:
      "mioseg qr / QR-X uygulaması ve web platformunda kişisel verilerin işlenmesine ilişkin bilgiler.",
    sections: [
      {
        title: "1. Veri sorumlusu",
        content: [
          "Veri işlemeden sorumlu kişi:",
          "Minh Hoang Huynh",
          "Şahıs işletmesi",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Almanya",
          "E-posta: info@mioseg-qr.com",
        ],
      },
      {
        title: "2. Veri işlemeye ilişkin genel bilgiler",
        content: [
          "Kullanıcıların kişisel verilerini yalnızca işlevsel bir uygulamanın, web platformunun ve ilgili içerik ve hizmetlerimizin sağlanması için gerekli olduğu ölçüde işleriz.",
          "Veri işleme, yürürlükteki veri koruma mevzuatına, özellikle Genel Veri Koruma Tüzüğü'ne (GDPR/DSGVO) uygun olarak gerçekleştirilir.",
        ],
      },
      {
        title: "3. Kayıt ve kullanıcı hesabı",
        content: [
          "Kayıt sırasında özellikle aşağıdaki veriler işlenir:",
          "– e-posta adresi",
          "– şifrelenmiş biçimde parola",
          "İşlemenin amacı kullanıcı hesabını oluşturmak ve yönetmek ile kullanıcının kimliğini doğrulamaktır.",
        ],
      },
      {
        title: "4. Uygulamanın ve QR-X işlevlerinin kullanımı",
        content: [
          "Uygulama kullanılırken özellikle aşağıdaki veriler işlenebilir:",
          "– oluşturulan QR-X içerikleri",
          "– kaydedilen ve yönetilen QR kodları",
          "– zaman damgaları, değişiklikler ve teknik meta veriler",
          "– standart QR-X ve Business QR-X içerikleri",
          "İşlemenin amacı uygulama ve web platformu işlevlerinin sağlanması, yönetilmesi ve kullanılabilmesidir.",
        ],
      },
      {
        title: "5. Yüklenen içerikler ve medya",
        content: [
          "Kullanıcılar özellikle aşağıdaki kendi içeriklerini yükleyebilir, kaydedebilir ve yönetebilir:",
          "– görseller",
          "– MP4 dosyaları gibi videolar",
          "– MP3 dosyaları gibi ses dosyaları",
          "– desteklenen diğer medya ve içerikler",
          "Bu içerikler uygulamanın işlevlerini sağlamak amacıyla kaydedilir ve işlenir.",
        ],
      },
      {
        title: "6. Konum verileri",
        content: [
          "Uygulama, kullanıcı buna aktif olarak izin verdiğinde konum verilerini işleyebilir.",
          "Bu özellikle bir QR kodu taranırken veya bir QR-X oluşturulurken gerçekleşebilir.",
          "Konum verileri yalnızca kullanıcı ilgili işlemde onay verdiğinde işlenir veya kaydedilir.",
          "İşlemenin amacı özellikle tarama konumunun belgelenmesi veya konuma bağlı QR-X içeriklerinin yönetilmesi olabilir.",
        ],
      },
      {
        title: "7. Sunucu ve günlük verileri",
        content: [
          "Uygulama ve web platformu kullanılırken özellikle aşağıdaki teknik veriler otomatik olarak işlenebilir:",
          "– IP adresi",
          "– cihaz türü",
          "– işletim sistemi",
          "– erişim zamanı",
          "– teknik hata ve günlük verileri",
          "İşlemenin amacı güvenlik, kararlılık, hata analizi ve kötüye kullanımın önlenmesidir.",
        ],
      },
      {
        title: "8. Ödeme işlemleri ve uygulama içi satın alımlar",
        content: [
          "Uygulama içindeki dijital satın alımlar Apple App Store veya Google Play Store üzerinden gerçekleştirilir.",
          "Ödeme işlemleri yalnızca ilgili platform işletmecileri üzerinden gerçekleştirilir.",
          "Kredi kartı numaraları veya banka bilgileri gibi kullanıcı ödeme verilerini kendimiz işlemeyiz.",
        ],
      },
      {
        title: "9. Kullanılan hizmet sağlayıcıları",
        content: [
          "Hizmetlerimizin teknik olarak sunulması için harici hizmet sağlayıcıları kullanırız.",
          "Bunlar arasında özellikle backend, veritabanı, kimlik doğrulama ve depolama çözümü olarak Supabase yer alır.",
          "Uygulama içi satın alımların yönetimi ve doğrulanması için RevenueCat kullanırız.",
          "Bu kapsamda özellikle uygulama kullanıcı kimliği, satın alma durumu ve ürünle ilgili bilgiler işlenebilir.",
        ],
      },
      {
        title: "10. Saklama süresi",
        content: [
          "Kişisel veriler yalnızca ilgili amaçlar için gerekli olduğu sürece saklanır.",
          "Kullanıcılar mevcut işlevler kapsamında hesaplarını sildirebilir veya silme talebinde bulunabilir.",
          "Yasal saklama yükümlülükleri bundan etkilenmez.",
        ],
      },
      {
        title: "11. İlgili kişilerin hakları",
        content: [
          "Kullanıcılar özellikle aşağıdaki haklara sahiptir:",
          "– bilgi ve erişim hakkı",
          "– düzeltme hakkı",
          "– silme hakkı",
          "– işlemenin kısıtlanmasını talep etme hakkı",
          "– veri taşınabilirliği hakkı",
          "– verilmiş bir rızayı geri çekme hakkı",
          "– bir veri koruma denetim makamına şikâyette bulunma hakkı",
        ],
      },
      {
        title: "12. Veri güvenliği",
        content: [
          "Kişisel verileri kayıp, manipülasyon ve yetkisiz erişime karşı mümkün olan en iyi şekilde korumak için teknik ve organizasyonel önlemler uygularız.",
          "Tüm özenimize rağmen dijital veri aktarımı ve depolamasında tam güvenlik garanti edilemez.",
        ],
      },
      {
        title: "13. Bu Gizlilik Politikasındaki değişiklikler",
        content: [
          "Hukuki, teknik veya ticari gelişmeler nedeniyle gerekli olması hâlinde bu Gizlilik Politikasını güncelleme hakkımızı saklı tutarız.",
          "Güncel sürüm uygulamada ve web platformunda sunulur.",
        ],
      },
      {
        title: "14. İletişim",
        content: [
          "Veri korumayla ilgili sorular için: info@mioseg-qr.com",
        ],
      },
    ],
  },

  pl: {
    title: "Polityka prywatności",
    subtitle:
      "Informacje o przetwarzaniu danych osobowych w aplikacji i platformie internetowej mioseg qr / QR-X.",
    sections: [
      {
        title: "1. Administrator danych",
        content: [
          "Administratorem danych osobowych jest:",
          "Minh Hoang Huynh",
          "Jednoosobowa działalność gospodarcza",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Niemcy",
          "E-mail: info@mioseg-qr.com",
        ],
      },
      {
        title: "2. Ogólne informacje o przetwarzaniu danych",
        content: [
          "Przetwarzamy dane osobowe użytkowników wyłącznie w zakresie niezbędnym do zapewnienia działania aplikacji, platformy internetowej oraz naszych treści i usług.",
          "Przetwarzanie odbywa się zgodnie z obowiązującymi przepisami o ochronie danych, w szczególności z ogólnym rozporządzeniem o ochronie danych (RODO).",
        ],
      },
      {
        title: "3. Rejestracja i konto użytkownika",
        content: [
          "Podczas rejestracji przetwarzane są w szczególności następujące dane:",
          "– adres e-mail",
          "– hasło w postaci zaszyfrowanej",
          "Celem przetwarzania jest utworzenie i zarządzanie kontem użytkownika oraz jego uwierzytelnianie.",
        ],
      },
      {
        title: "4. Korzystanie z aplikacji i funkcji QR-X",
        content: [
          "Podczas korzystania z aplikacji mogą być przetwarzane w szczególności następujące dane:",
          "– utworzone treści QR-X",
          "– zapisane i zarządzane kody QR",
          "– znaczniki czasu, zmiany i metadane techniczne",
          "– treści w zwykłych QR-X i Business QR-X",
          "Celem przetwarzania jest udostępnianie, zarządzanie i korzystanie z funkcji aplikacji i platformy internetowej.",
        ],
      },
      {
        title: "5. Przesyłane treści i media",
        content: [
          "Użytkownicy mogą przesyłać, zapisywać i zarządzać własnymi treściami, w szczególności:",
          "– obrazami",
          "– filmami, np. plikami MP4",
          "– plikami audio, np. MP3",
          "– innymi obsługiwanymi mediami i treściami",
          "Treści te są przechowywane i przetwarzane w celu udostępnienia funkcji aplikacji.",
        ],
      },
      {
        title: "6. Dane lokalizacyjne",
        content: [
          "Aplikacja może pobierać dane lokalizacyjne, jeżeli użytkownik aktywnie na to zezwoli.",
          "Dotyczy to w szczególności skanowania kodu QR lub tworzenia QR-X.",
          "Dane lokalizacyjne są przetwarzane lub zapisywane tylko wtedy, gdy użytkownik wyrazi zgodę w danym procesie.",
          "Celem przetwarzania może być w szczególności dokumentowanie lokalizacji skanu lub zarządzanie treściami QR-X związanymi z lokalizacją.",
        ],
      },
      {
        title: "7. Dane serwera i logów",
        content: [
          "Podczas korzystania z aplikacji i platformy internetowej mogą być automatycznie przetwarzane dane techniczne, w szczególności:",
          "– adres IP",
          "– typ urządzenia",
          "– system operacyjny",
          "– czas dostępu",
          "– techniczne dane błędów i dzienników",
          "Celem przetwarzania jest bezpieczeństwo, stabilność, analiza błędów i zapobieganie nadużyciom.",
        ],
      },
      {
        title: "8. Obsługa płatności i zakupy w aplikacji",
        content: [
          "Zakupy cyfrowe w aplikacji są realizowane za pośrednictwem Apple App Store lub Google Play Store.",
          "Obsługa płatności odbywa się wyłącznie przez odpowiednich operatorów platform.",
          "Sami nie przetwarzamy danych płatniczych użytkowników, takich jak numery kart kredytowych czy dane bankowe.",
        ],
      },
      {
        title: "9. Wykorzystywani usługodawcy",
        content: [
          "Do technicznego świadczenia naszych usług korzystamy z zewnętrznych usługodawców.",
          "Należy do nich w szczególności Supabase jako rozwiązanie backendowe, bazodanowe, uwierzytelniające i pamięci masowej.",
          "Do zarządzania i weryfikacji zakupów w aplikacji korzystamy z RevenueCat.",
          "W związku z tym mogą być przetwarzane w szczególności identyfikator użytkownika aplikacji, status zakupu i informacje dotyczące produktu.",
        ],
      },
      {
        title: "10. Okres przechowywania",
        content: [
          "Dane osobowe są przechowywane wyłącznie tak długo, jak jest to konieczne do realizacji odpowiednich celów.",
          "Użytkownicy mogą usunąć swoje konto w ramach dostępnych funkcji lub poprosić o jego usunięcie.",
          "Ustawowe obowiązki przechowywania danych pozostają bez zmian.",
        ],
      },
      {
        title: "11. Prawa osób, których dane dotyczą",
        content: [
          "Użytkownikom przysługują w szczególności następujące prawa:",
          "– prawo dostępu do danych",
          "– prawo do sprostowania",
          "– prawo do usunięcia",
          "– prawo do ograniczenia przetwarzania",
          "– prawo do przenoszenia danych",
          "– prawo do wycofania udzielonej zgody",
          "– prawo do wniesienia skargi do organu nadzorczego ds. ochrony danych",
        ],
      },
      {
        title: "12. Bezpieczeństwo danych",
        content: [
          "Stosujemy środki techniczne i organizacyjne, aby możliwie najlepiej chronić dane osobowe przed utratą, manipulacją i nieuprawnionym dostępem.",
          "Mimo zachowania należytej staranności nie można zagwarantować pełnego bezpieczeństwa cyfrowego przesyłania i przechowywania danych.",
        ],
      },
      {
        title: "13. Zmiany niniejszej polityki prywatności",
        content: [
          "Zastrzegamy sobie prawo do aktualizacji niniejszej polityki prywatności, jeżeli będzie to konieczne z powodu zmian prawnych, technicznych lub biznesowych.",
          "Aktualna wersja będzie udostępniana w aplikacji i na platformie internetowej.",
        ],
      },
      {
        title: "14. Kontakt",
        content: ["W sprawach dotyczących ochrony danych: info@mioseg-qr.com"],
      },
    ],
  },

  ar: {
    title: "سياسة الخصوصية",
    subtitle:
      "معلومات حول معالجة البيانات الشخصية في تطبيق ومنصة الويب mioseg qr / QR-X.",
    sections: [
      {
        title: "1. المسؤول عن معالجة البيانات",
        content: [
          "المسؤول عن معالجة البيانات هو:",
          "Minh Hoang Huynh",
          "منشأة فردية",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "ألمانيا",
          "البريد الإلكتروني: info@mioseg-qr.com",
        ],
      },
      {
        title: "2. معلومات عامة حول معالجة البيانات",
        content: [
          "لا نعالج البيانات الشخصية للمستخدمين إلا بالقدر اللازم لتوفير تطبيق يعمل بصورة سليمة ومنصة الويب ومحتوياتنا وخدماتنا.",
          "تتم المعالجة وفقًا لأحكام حماية البيانات المعمول بها، ولا سيما اللائحة العامة لحماية البيانات (GDPR).",
        ],
      },
      {
        title: "3. التسجيل وحساب المستخدم",
        content: [
          "عند التسجيل تتم معالجة البيانات التالية على وجه الخصوص:",
          "– عنوان البريد الإلكتروني",
          "– كلمة المرور بصيغة مشفرة",
          "الغرض من المعالجة هو إنشاء حساب المستخدم وإدارته ومصادقة المستخدم.",
        ],
      },
      {
        title: "4. استخدام التطبيق ووظائف QR-X",
        content: [
          "عند استخدام التطبيق قد تتم معالجة البيانات التالية على وجه الخصوص:",
          "– محتويات QR-X التي تم إنشاؤها",
          "– رموز QR المحفوظة والمدارة",
          "– الطوابع الزمنية والتغييرات والبيانات الوصفية التقنية",
          "– المحتويات في QR-X العادية وBusiness QR-X",
          "الغرض من المعالجة هو توفير وظائف التطبيق ومنصة الويب وإدارتها واستخدامها.",
        ],
      },
      {
        title: "5. المحتويات والوسائط المرفوعة",
        content: [
          "يمكن للمستخدمين رفع محتوياتهم الخاصة وحفظها وإدارتها، ولا سيما:",
          "– الصور",
          "– مقاطع الفيديو مثل ملفات MP4",
          "– الملفات الصوتية مثل ملفات MP3",
          "– الوسائط والمحتويات الأخرى المدعومة",
          "يتم تخزين هذه المحتويات ومعالجتها لتوفير وظائف التطبيق.",
        ],
      },
      {
        title: "6. بيانات الموقع",
        content: [
          "يمكن للتطبيق جمع بيانات الموقع إذا سمح المستخدم بذلك بشكل صريح.",
          "يحدث ذلك على وجه الخصوص عند مسح رمز QR أو إنشاء QR-X.",
          "لا تتم معالجة بيانات الموقع أو تخزينها إلا إذا وافق المستخدم في العملية المعنية.",
          "قد يكون الغرض من المعالجة، على وجه الخصوص، توثيق موقع المسح أو إدارة محتويات QR-X المرتبطة بالموقع.",
        ],
      },
      {
        title: "7. بيانات الخادم والسجلات",
        content: [
          "عند استخدام التطبيق ومنصة الويب قد تتم معالجة بيانات تقنية تلقائيًا، ولا سيما:",
          "– عنوان IP",
          "– نوع الجهاز",
          "– نظام التشغيل",
          "– وقت الوصول",
          "– بيانات الأخطاء والسجلات التقنية",
          "الغرض من المعالجة هو الأمان والاستقرار وتحليل الأخطاء ومنع إساءة الاستخدام.",
        ],
      },
      {
        title: "8. معالجة المدفوعات والمشتريات داخل التطبيق",
        content: [
          "تتم المشتريات الرقمية داخل التطبيق عبر Apple App Store أو Google Play Store.",
          "تتم معالجة المدفوعات حصريًا من خلال مشغلي المنصات المعنيين.",
          "نحن لا نعالج بأنفسنا بيانات الدفع الخاصة بالمستخدمين مثل أرقام بطاقات الائتمان أو البيانات المصرفية.",
        ],
      },
      {
        title: "9. مزودو الخدمات المستخدمون",
        content: [
          "نستخدم مزودي خدمات خارجيين لتوفير خدماتنا من الناحية التقنية.",
          "ويشمل ذلك على وجه الخصوص Supabase كحل للواجهة الخلفية وقاعدة البيانات والمصادقة والتخزين.",
          "نستخدم RevenueCat لإدارة المشتريات داخل التطبيق والتحقق منها.",
          "وقد تتم في هذا السياق معالجة معرف مستخدم التطبيق وحالة الشراء والمعلومات المتعلقة بالمنتج.",
        ],
      },
      {
        title: "10. مدة التخزين",
        content: [
          "لا يتم الاحتفاظ بالبيانات الشخصية إلا للمدة اللازمة للأغراض المعنية.",
          "يمكن للمستخدمين حذف حسابهم في إطار الوظائف المتاحة أو طلب حذفه.",
          "تظل التزامات الاحتفاظ القانونية دون مساس.",
        ],
      },
      {
        title: "11. حقوق أصحاب البيانات",
        content: [
          "يتمتع المستخدمون على وجه الخصوص بالحقوق التالية:",
          "– الحق في الوصول إلى البيانات",
          "– الحق في التصحيح",
          "– الحق في الحذف",
          "– الحق في تقييد المعالجة",
          "– الحق في نقل البيانات",
          "– الحق في سحب الموافقة الممنوحة",
          "– الحق في تقديم شكوى إلى سلطة رقابية لحماية البيانات",
        ],
      },
      {
        title: "12. أمن البيانات",
        content: [
          "نستخدم تدابير تقنية وتنظيمية لحماية البيانات الشخصية قدر الإمكان من الفقدان والتلاعب والوصول غير المصرح به.",
          "ومع ذلك، ورغم كل العناية، لا يمكن ضمان الأمان الكامل عند النقل الرقمي للبيانات وتخزينها.",
        ],
      },
      {
        title: "13. تغييرات سياسة الخصوصية هذه",
        content: [
          "نحتفظ بالحق في تحديث سياسة الخصوصية هذه إذا أصبح ذلك ضروريًا بسبب تطورات قانونية أو تقنية أو تجارية.",
          "سيتم توفير النسخة الحالية في التطبيق وعلى منصة الويب.",
        ],
      },
      {
        title: "14. التواصل",
        content: ["للأسئلة المتعلقة بحماية البيانات: info@mioseg-qr.com"],
      },
    ],
  },

  fr: {
    title: "Politique de confidentialité",
    subtitle:
      "Informations sur le traitement des données à caractère personnel dans l’application et la plateforme web mioseg qr / QR-X.",
    sections: [
      {
        title: "1. Responsable du traitement",
        content: [
          "Le responsable du traitement des données est :",
          "Minh Hoang Huynh",
          "Entreprise individuelle",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Allemagne",
          "E-mail : info@mioseg-qr.com",
        ],
      },
      {
        title: "2. Informations générales sur le traitement des données",
        content: [
          "Nous traitons les données à caractère personnel des utilisateurs uniquement dans la mesure nécessaire au fonctionnement de l’application, de la plateforme web ainsi qu’à la fourniture de nos contenus et services.",
          "Le traitement est effectué conformément aux règles applicables en matière de protection des données, notamment au Règlement général sur la protection des données (RGPD).",
        ],
      },
      {
        title: "3. Inscription et compte utilisateur",
        content: [
          "Lors de l’inscription, les données suivantes sont notamment traitées :",
          "– adresse e-mail",
          "– mot de passe sous forme chiffrée",
          "Le traitement a pour finalité la création et la gestion du compte utilisateur ainsi que l’authentification de l’utilisateur.",
        ],
      },
      {
        title: "4. Utilisation de l’application et des fonctions QR-X",
        content: [
          "Lors de l’utilisation de l’application, les données suivantes peuvent notamment être traitées :",
          "– contenus QR-X créés",
          "– codes QR enregistrés et gérés",
          "– horodatages, modifications et métadonnées techniques",
          "– contenus dans les QR-X standards et Business QR-X",
          "Le traitement a pour finalité la mise à disposition, la gestion et l’utilisation des fonctions de l’application et de la plateforme web.",
        ],
      },
      {
        title: "5. Contenus et médias téléversés",
        content: [
          "Les utilisateurs peuvent téléverser, enregistrer et gérer leurs propres contenus, notamment :",
          "– images",
          "– vidéos, par exemple des fichiers MP4",
          "– fichiers audio, par exemple des fichiers MP3",
          "– autres médias et contenus pris en charge",
          "Ces contenus sont stockés et traités afin de fournir les fonctions de l’application.",
        ],
      },
      {
        title: "6. Données de localisation",
        content: [
          "L’application peut collecter des données de localisation si l’utilisateur l’autorise expressément.",
          "Cela se produit notamment lors du scan d’un code QR ou de la création d’un QR-X.",
          "Les données de localisation ne sont traitées ou enregistrées que si l’utilisateur y consent dans l’opération concernée.",
          "Le traitement peut notamment avoir pour finalité la documentation du lieu du scan ou la gestion de contenus QR-X liés à une localisation.",
        ],
      },
      {
        title: "7. Données serveur et journaux",
        content: [
          "Lors de l’utilisation de l’application et de la plateforme web, des données techniques peuvent être traitées automatiquement, notamment :",
          "– adresse IP",
          "– type d’appareil",
          "– système d’exploitation",
          "– date et heure de l’accès",
          "– données techniques d’erreur et de journalisation",
          "Le traitement a pour finalité la sécurité, la stabilité, l’analyse des erreurs et la prévention des abus.",
        ],
      },
      {
        title: "8. Traitement des paiements et achats intégrés",
        content: [
          "Les achats numériques effectués dans l’application sont réalisés via l’Apple App Store ou le Google Play Store.",
          "Le traitement des paiements est assuré exclusivement par les opérateurs des plateformes concernées.",
          "Nous ne traitons pas nous-mêmes les données de paiement des utilisateurs, telles que les numéros de carte bancaire ou les coordonnées bancaires.",
        ],
      },
      {
        title: "9. Prestataires utilisés",
        content: [
          "Nous faisons appel à des prestataires externes pour la fourniture technique de notre service.",
          "Il s’agit notamment de Supabase comme solution de backend, base de données, authentification et stockage.",
          "Nous utilisons RevenueCat pour gérer et valider les achats intégrés.",
          "Dans ce cadre, l’identifiant utilisateur de l’application, le statut d’achat et les informations relatives au produit peuvent notamment être traités.",
        ],
      },
      {
        title: "10. Durée de conservation",
        content: [
          "Les données à caractère personnel ne sont conservées que pendant la durée nécessaire aux finalités concernées.",
          "Les utilisateurs peuvent supprimer leur compte au moyen des fonctions disponibles ou demander sa suppression.",
          "Les obligations légales de conservation restent inchangées.",
        ],
      },
      {
        title: "11. Droits des personnes concernées",
        content: [
          "Les utilisateurs disposent notamment des droits suivants :",
          "– droit d’accès",
          "– droit de rectification",
          "– droit à l’effacement",
          "– droit à la limitation du traitement",
          "– droit à la portabilité des données",
          "– droit de retirer un consentement donné",
          "– droit d’introduire une réclamation auprès d’une autorité de contrôle de la protection des données",
        ],
      },
      {
        title: "12. Sécurité des données",
        content: [
          "Nous mettons en œuvre des mesures techniques et organisationnelles afin de protéger au mieux les données à caractère personnel contre la perte, la manipulation et les accès non autorisés.",
          "Malgré toutes les précautions, une sécurité absolue de la transmission et du stockage numériques des données ne peut toutefois être garantie.",
        ],
      },
      {
        title: "13. Modifications de la présente politique de confidentialité",
        content: [
          "Nous nous réservons le droit d’adapter la présente politique de confidentialité lorsque cela est nécessaire en raison d’évolutions juridiques, techniques ou commerciales.",
          "La version en vigueur est mise à disposition dans l’application et sur la plateforme web.",
        ],
      },
      {
        title: "14. Contact",
        content: ["Pour toute question relative à la protection des données : info@mioseg-qr.com"],
      },
    ],
  },

  es: {
    title: "Política de privacidad",
    subtitle:
      "Información sobre el tratamiento de datos personales en la aplicación y la plataforma web mioseg qr / QR-X.",
    sections: [
      {
        title: "1. Responsable del tratamiento",
        content: [
          "El responsable del tratamiento de datos es:",
          "Minh Hoang Huynh",
          "Empresario individual",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Alemania",
          "Correo electrónico: info@mioseg-qr.com",
        ],
      },
      {
        title: "2. Información general sobre el tratamiento de datos",
        content: [
          "Tratamos los datos personales de los usuarios únicamente en la medida necesaria para proporcionar una aplicación funcional, la plataforma web y nuestros contenidos y servicios.",
          "El tratamiento se realiza de conformidad con la normativa aplicable en materia de protección de datos, en particular el Reglamento General de Protección de Datos (RGPD).",
        ],
      },
      {
        title: "3. Registro y cuenta de usuario",
        content: [
          "Durante el registro se tratan, en particular, los siguientes datos:",
          "– dirección de correo electrónico",
          "– contraseña en forma cifrada",
          "La finalidad del tratamiento es crear y gestionar la cuenta de usuario, así como autenticar al usuario.",
        ],
      },
      {
        title: "4. Uso de la aplicación y funciones QR-X",
        content: [
          "Al utilizar la aplicación pueden tratarse, en particular, los siguientes datos:",
          "– contenidos QR-X creados",
          "– códigos QR guardados y gestionados",
          "– marcas de tiempo, cambios y metadatos técnicos",
          "– contenidos en QR-X normales y Business QR-X",
          "La finalidad del tratamiento es proporcionar, gestionar y utilizar las funciones de la aplicación y la plataforma web.",
        ],
      },
      {
        title: "5. Contenidos y medios subidos",
        content: [
          "Los usuarios pueden subir, guardar y gestionar sus propios contenidos, en particular:",
          "– imágenes",
          "– vídeos, como archivos MP4",
          "– archivos de audio, como archivos MP3",
          "– otros medios y contenidos compatibles",
          "Estos contenidos se almacenan y tratan para proporcionar las funciones de la aplicación.",
        ],
      },
      {
        title: "6. Datos de ubicación",
        content: [
          "La aplicación puede recopilar datos de ubicación si el usuario lo permite expresamente.",
          "Esto sucede, en particular, al escanear un código QR o al crear un QR-X.",
          "Los datos de ubicación solo se tratan o almacenan si el usuario da su consentimiento en el proceso correspondiente.",
          "La finalidad del tratamiento puede ser, en particular, documentar la ubicación del escaneo o gestionar contenidos QR-X relacionados con una ubicación.",
        ],
      },
      {
        title: "7. Datos del servidor y registros",
        content: [
          "Al utilizar la aplicación y la plataforma web pueden tratarse automáticamente datos técnicos, en particular:",
          "– dirección IP",
          "– tipo de dispositivo",
          "– sistema operativo",
          "– momento del acceso",
          "– datos técnicos de errores y registros",
          "La finalidad del tratamiento es la seguridad, estabilidad, análisis de errores y prevención de abusos.",
        ],
      },
      {
        title: "8. Procesamiento de pagos y compras dentro de la aplicación",
        content: [
          "Las compras digitales dentro de la aplicación se realizan a través de Apple App Store o Google Play Store.",
          "El procesamiento de pagos se realiza exclusivamente a través de los operadores de las plataformas correspondientes.",
          "Nosotros no tratamos directamente datos de pago de los usuarios, como números de tarjetas de crédito o datos bancarios.",
        ],
      },
      {
        title: "9. Proveedores de servicios utilizados",
        content: [
          "Utilizamos proveedores de servicios externos para la prestación técnica de nuestro servicio.",
          "Entre ellos se encuentra, en particular, Supabase como solución de backend, base de datos, autenticación y almacenamiento.",
          "Utilizamos RevenueCat para gestionar y validar las compras dentro de la aplicación.",
          "En este contexto pueden tratarse, en particular, el ID de usuario de la aplicación, el estado de la compra y la información relacionada con el producto.",
        ],
      },
      {
        title: "10. Periodo de conservación",
        content: [
          "Los datos personales solo se conservan durante el tiempo necesario para los fines correspondientes.",
          "Los usuarios pueden eliminar su cuenta mediante las funciones disponibles o solicitar su eliminación.",
          "Las obligaciones legales de conservación permanecen intactas.",
        ],
      },
      {
        title: "11. Derechos de las personas afectadas",
        content: [
          "Los usuarios tienen, en particular, los siguientes derechos:",
          "– derecho de acceso",
          "– derecho de rectificación",
          "– derecho de supresión",
          "– derecho a la limitación del tratamiento",
          "– derecho a la portabilidad de los datos",
          "– derecho a retirar un consentimiento otorgado",
          "– derecho a presentar una reclamación ante una autoridad de control de protección de datos",
        ],
      },
      {
        title: "12. Seguridad de los datos",
        content: [
          "Aplicamos medidas técnicas y organizativas para proteger los datos personales, en la medida de lo posible, frente a pérdida, manipulación y accesos no autorizados.",
          "No obstante, pese a todas las precauciones, no puede garantizarse una seguridad absoluta en la transmisión y el almacenamiento digitales de datos.",
        ],
      },
      {
        title: "13. Cambios en esta política de privacidad",
        content: [
          "Nos reservamos el derecho de adaptar esta política de privacidad cuando sea necesario debido a cambios legales, técnicos o empresariales.",
          "La versión vigente estará disponible en la aplicación y en la plataforma web.",
        ],
      },
      {
        title: "14. Contacto",
        content: ["Para preguntas sobre protección de datos: info@mioseg-qr.com"],
      },
    ],
  },

  it: {
    title: "Informativa sulla privacy",
    subtitle:
      "Informazioni sul trattamento dei dati personali nell’app e nella piattaforma web mioseg qr / QR-X.",
    sections: [
      {
        title: "1. Titolare del trattamento",
        content: [
          "Il titolare del trattamento dei dati è:",
          "Minh Hoang Huynh",
          "Ditta individuale",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Germania",
          "E-mail: info@mioseg-qr.com",
        ],
      },
      {
        title: "2. Informazioni generali sul trattamento dei dati",
        content: [
          "Trattiamo i dati personali degli utenti esclusivamente nella misura necessaria per fornire un’app funzionante, la piattaforma web e i nostri contenuti e servizi.",
          "Il trattamento avviene in conformità alle norme vigenti in materia di protezione dei dati, in particolare al Regolamento generale sulla protezione dei dati (GDPR).",
        ],
      },
      {
        title: "3. Registrazione e account utente",
        content: [
          "Durante la registrazione vengono trattati in particolare i seguenti dati:",
          "– indirizzo e-mail",
          "– password in forma cifrata",
          "La finalità del trattamento è la creazione e la gestione dell’account utente nonché l’autenticazione dell’utente.",
        ],
      },
      {
        title: "4. Utilizzo dell’app e delle funzioni QR-X",
        content: [
          "Durante l’utilizzo dell’app possono essere trattati in particolare i seguenti dati:",
          "– contenuti QR-X creati",
          "– codici QR salvati e gestiti",
          "– timestamp, modifiche e metadati tecnici",
          "– contenuti nei QR-X normali e Business QR-X",
          "La finalità del trattamento è fornire, gestire e utilizzare le funzioni dell’app e della piattaforma web.",
        ],
      },
      {
        title: "5. Contenuti e media caricati",
        content: [
          "Gli utenti possono caricare, salvare e gestire i propri contenuti, in particolare:",
          "– immagini",
          "– video, ad esempio file MP4",
          "– file audio, ad esempio file MP3",
          "– altri media e contenuti supportati",
          "Questi contenuti vengono memorizzati e trattati per fornire le funzioni dell’app.",
        ],
      },
      {
        title: "6. Dati di localizzazione",
        content: [
          "L’app può raccogliere dati di localizzazione se l’utente lo consente espressamente.",
          "Ciò avviene in particolare durante la scansione di un codice QR o la creazione di un QR-X.",
          "I dati di localizzazione vengono trattati o memorizzati solo se l’utente acconsente nell’operazione interessata.",
          "La finalità del trattamento può essere, in particolare, documentare il luogo della scansione o gestire contenuti QR-X collegati alla posizione.",
        ],
      },
      {
        title: "7. Dati del server e di log",
        content: [
          "Durante l’utilizzo dell’app e della piattaforma web possono essere trattati automaticamente dati tecnici, in particolare:",
          "– indirizzo IP",
          "– tipo di dispositivo",
          "– sistema operativo",
          "– momento dell’accesso",
          "– dati tecnici relativi a errori e log",
          "La finalità del trattamento è garantire sicurezza, stabilità, analisi degli errori e prevenzione degli abusi.",
        ],
      },
      {
        title: "8. Elaborazione dei pagamenti e acquisti in-app",
        content: [
          "Gli acquisti digitali all’interno dell’app vengono effettuati tramite Apple App Store o Google Play Store.",
          "L’elaborazione dei pagamenti avviene esclusivamente tramite i rispettivi gestori delle piattaforme.",
          "Non trattiamo direttamente dati di pagamento degli utenti, come numeri di carte di credito o dati bancari.",
        ],
      },
      {
        title: "9. Fornitori di servizi utilizzati",
        content: [
          "Per la fornitura tecnica del nostro servizio utilizziamo fornitori esterni.",
          "Tra questi rientra in particolare Supabase come soluzione di backend, database, autenticazione e archiviazione.",
          "Utilizziamo RevenueCat per gestire e convalidare gli acquisti in-app.",
          "In tale contesto possono essere trattati, in particolare, l’ID utente dell’app, lo stato dell’acquisto e le informazioni relative al prodotto.",
        ],
      },
      {
        title: "10. Periodo di conservazione",
        content: [
          "I dati personali vengono conservati solo per il tempo necessario alle rispettive finalità.",
          "Gli utenti possono eliminare il proprio account tramite le funzioni disponibili oppure richiederne la cancellazione.",
          "Restano invariati gli obblighi legali di conservazione.",
        ],
      },
      {
        title: "11. Diritti degli interessati",
        content: [
          "Gli utenti dispongono in particolare dei seguenti diritti:",
          "– diritto di accesso",
          "– diritto di rettifica",
          "– diritto alla cancellazione",
          "– diritto alla limitazione del trattamento",
          "– diritto alla portabilità dei dati",
          "– diritto di revocare un consenso prestato",
          "– diritto di presentare reclamo a un’autorità di controllo per la protezione dei dati",
        ],
      },
      {
        title: "12. Sicurezza dei dati",
        content: [
          "Adottiamo misure tecniche e organizzative per proteggere al meglio i dati personali da perdita, manipolazione e accessi non autorizzati.",
          "Nonostante ogni cautela, non è tuttavia possibile garantire una sicurezza assoluta nella trasmissione e memorizzazione digitale dei dati.",
        ],
      },
      {
        title: "13. Modifiche alla presente informativa sulla privacy",
        content: [
          "Ci riserviamo il diritto di aggiornare la presente informativa sulla privacy qualora ciò sia necessario a seguito di sviluppi giuridici, tecnici o aziendali.",
          "La versione aggiornata sarà resa disponibile nell’app e sulla piattaforma web.",
        ],
      },
      {
        title: "14. Contatto",
        content: ["Per domande relative alla protezione dei dati: info@mioseg-qr.com"],
      },
    ],
  },

  en: {
    title: "Privacy Policy",
    subtitle:
      "Information on the processing of personal data in the app and web platform of mioseg qr / QR-X.",
    sections: [
      {
        title: "1. Controller",
        content: [
          "The controller responsible for data processing is:",
          "Minh Hoang Huynh",
          "Sole proprietorship",
          "Konrad Adenauer Str. 170",
          "52511 Geilenkirchen",
          "Germany",
          "Email: info@mioseg-qr.com",
        ],
      },
      {
        title: "2. General information on data processing",
        content: [
          "We process users’ personal data only to the extent necessary to provide a functional app, web platform, and our related services.",
          "Processing is carried out in accordance with applicable data protection law, in particular the GDPR.",
        ],
      },
      {
        title: "3. Registration and user account",
        content: [
          "During registration, the following data is processed in particular:",
          "– email address",
          "– password in encrypted form",
          "The purpose of processing is to create and manage the user account and authenticate the user.",
        ],
      },
      {
        title: "4. App usage and QR-X functions",
        content: [
          "When using the app, the following data may be processed in particular:",
          "– created QR-X content",
          "– saved and managed QR codes",
          "– timestamps, updates, and technical metadata",
          "– content in standard QR-X and Business QR-X",
          "The purpose is to provide, manage, and operate the app and web platform features.",
        ],
      },
      {
        title: "5. Uploaded content and media",
        content: [
          "Users can upload, save, and manage their own content, in particular:",
          "– images",
          "– videos such as MP4 files",
          "– audio files such as MP3 files",
          "– other supported media and content",
          "These contents are stored and processed in order to provide the app’s functionality.",
        ],
      },
      {
        title: "6. Location data",
        content: [
          "The app may process location data if the user actively grants permission.",
          "This may occur in particular when scanning a QR code or creating a QR-X.",
          "Location data is only processed or stored if the user consents in the respective action.",
          "The purpose may include documenting scan locations or managing location-based QR-X content.",
        ],
      },
      {
        title: "7. Server and log data",
        content: [
          "When using the app and web platform, technical data may be processed automatically, in particular:",
          "– IP address",
          "– device type",
          "– operating system",
          "– time of access",
          "– technical error and log data",
          "The purpose is security, stability, error analysis, and abuse prevention.",
        ],
      },
      {
        title: "8. Payment processing and in-app purchases",
        content: [
          "Digital purchases within the app are processed via the Apple App Store or Google Play Store.",
          "Payment processing takes place exclusively through the respective platform operators.",
          "We do not process payment data such as credit card numbers or bank details ourselves.",
        ],
      },
      {
        title: "9. Service providers used",
        content: [
          "We use external service providers for the technical provision of our services.",
          "This includes in particular Supabase as backend, database, authentication, and storage solution.",
          "We use RevenueCat for managing and validating in-app purchases.",
          "This may include processing app user ID, purchase status, and product-related information.",
        ],
      },
      {
        title: "10. Storage period",
        content: [
          "Personal data is only stored for as long as necessary for the respective purposes.",
          "Users can request deletion of their account or use available account deletion features where provided.",
          "Statutory retention obligations remain unaffected.",
        ],
      },
      {
        title: "11. Rights of data subjects",
        content: [
          "Users have in particular the following rights:",
          "– right of access",
          "– right to rectification",
          "– right to erasure",
          "– right to restriction of processing",
          "– right to data portability",
          "– right to withdraw a granted consent",
          "– right to lodge a complaint with a data protection authority",
        ],
      },
      {
        title: "12. Data security",
        content: [
          "We implement technical and organizational measures to protect personal data as far as possible against loss, manipulation, and unauthorized access.",
          "Despite all due care, complete security of digital data transmission and storage cannot be guaranteed.",
        ],
      },
      {
        title: "13. Changes to this privacy policy",
        content: [
          "We reserve the right to update this privacy policy if this becomes necessary due to legal, technical, or business developments.",
          "The current version will be provided in the app and on the web platform.",
        ],
      },
      {
        title: "14. Contact",
        content: ["For privacy-related questions: info@mioseg-qr.com"],
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

export function getPrivacyDocument(language: string | null | undefined): LegalDocument {
  const locale = getLegalLocale(language);
  const directDocument = privacyDocuments[locale];

  if (directDocument) {
    return directDocument;
  }

  const germanFallback = privacyDocuments.de!;

  return {
    ...germanFallback,
    fallbackNotice: fallbackNotices[locale] ?? "",
  };
}