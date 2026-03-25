import LegalPage from "../../components/LegalPage";

export default function DatenschutzPage() {
  return (
    <LegalPage
      eyebrow="Datenschutz"
      title="Datenschutzerklärung"
      subtitle="Informationen zur Verarbeitung personenbezogener Daten in der App und Webplattform von mioseg qr / QR-X."
      sections={[
        {
          id: "verantwortlicher",
          title: "1. Verantwortlicher",
          paragraphs: [
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
          id: "allgemein",
          title: "2. Allgemeines zur Datenverarbeitung",
          paragraphs: [
            "Wir verarbeiten personenbezogene Daten der Nutzer nur, soweit dies zur Bereitstellung einer funktionsfähigen App, der Webplattform sowie unserer Inhalte und Leistungen erforderlich ist.",
            "Die Verarbeitung erfolgt gemäß den geltenden datenschutzrechtlichen Vorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO).",
          ],
        },
        {
          id: "konto",
          title: "3. Registrierung und Benutzerkonto",
          paragraphs: [
            "Bei der Registrierung werden insbesondere folgende Daten verarbeitet:",
            "Zweck der Verarbeitung ist die Erstellung und Verwaltung des Benutzerkontos sowie die Authentifizierung des Nutzers.",
          ],
          listItems: [
            "E-Mail-Adresse",
            "Passwort in verschlüsselter Form",
          ],
        },
        {
          id: "nutzung",
          title: "4. Nutzung der App und QR-X Funktionen",
          paragraphs: [
            "Bei Nutzung der App und Webplattform können insbesondere folgende Daten verarbeitet werden:",
            "Zweck der Verarbeitung ist die Bereitstellung, Verwaltung und Nutzung der Funktionen der App und Webplattform.",
          ],
          listItems: [
            "erstellte QR-X Inhalte",
            "gespeicherte und verwaltete QR-Codes",
            "Ordnerstrukturen und gespeicherte Scans",
            "Änderungsstände, Zeitstempel und technische Metadaten",
            "Inhalte in normalen QR-X und Business QR-X",
          ],
        },
        {
          id: "medien",
          title: "5. Hochgeladene Inhalte und Medien",
          paragraphs: [
            "Nutzer können eigene Inhalte hochladen, speichern und verwalten. Diese Inhalte werden gespeichert und verarbeitet, um die Funktionen der App bereitzustellen, QR-X darzustellen und Webansichten zu ermöglichen.",
          ],
          listItems: [
            "Bilder",
            "Videos wie MP4-Dateien",
            "Audiodateien wie MP3-Dateien",
            "PDFs und sonstige unterstützte Inhalte",
          ],
        },
        {
          id: "standort",
          title: "6. Standortdaten",
          paragraphs: [
            "Die App kann Standortdaten erfassen, wenn der Nutzer dies aktiv erlaubt. Dies geschieht insbesondere beim Scannen eines QR-Codes oder beim Erstellen eines QR-X.",
            "Standortdaten werden nur verarbeitet oder gespeichert, wenn der Nutzer im jeweiligen Vorgang zustimmt.",
            "Zweck der Verarbeitung kann insbesondere die Dokumentation des Scan-Standorts oder die Verwaltung standortbezogener QR-X Inhalte sein.",
          ],
        },
        {
          id: "logs",
          title: "7. Server- und Logdaten",
          paragraphs: [
            "Bei der Nutzung der App und Webplattform können automatisch technische Daten verarbeitet werden.",
            "Zweck der Verarbeitung ist die Sicherheit, Stabilität, Fehleranalyse und Missbrauchsprävention.",
          ],
          listItems: [
            "IP-Adresse",
            "Gerätetyp",
            "Betriebssystem",
            "Zeitpunkt des Zugriffs",
            "technische Fehler- und Protokolldaten",
          ],
        },
        {
          id: "zahlungen",
          title: "8. Zahlungsabwicklung und In-App Käufe",
          paragraphs: [
            "Digitale Käufe innerhalb der App erfolgen über den Apple App Store oder den Google Play Store.",
            "Die Zahlungsabwicklung erfolgt ausschließlich über die jeweiligen Plattformbetreiber. Wir selbst verarbeiten keine Zahlungsdaten wie Kreditkartennummern oder Bankdaten der Nutzer.",
            "Zur technischen Verwaltung und Validierung von In-App Käufen kann zusätzlich ein externer Kaufverwaltungsdienst eingesetzt werden.",
          ],
        },
        {
          id: "dienstleister",
          title: "9. Eingesetzte Dienstleister",
          paragraphs: [
            "Zur technischen Bereitstellung unseres Angebots setzen wir externe Dienstleister ein.",
            "Hierzu gehört insbesondere Supabase als Backend-, Datenbank-, Authentifizierungs- und Speicherlösung.",
            "Zur Verwaltung und Validierung von In-App Käufen setzen wir RevenueCat ein. Dabei können insbesondere App-User-ID, Kaufstatus und produktbezogene Informationen verarbeitet werden.",
          ],
        },
        {
          id: "speicherdauer",
          title: "10. Speicherdauer",
          paragraphs: [
            "Personenbezogene Daten werden nur so lange gespeichert, wie dies für die jeweiligen Zwecke erforderlich ist.",
            "Nutzer können ihr Konto im Rahmen der verfügbaren Funktionen löschen lassen beziehungsweise eine Löschung anfragen.",
            "Gesetzliche Aufbewahrungspflichten bleiben unberührt.",
          ],
        },
        {
          id: "rechte",
          title: "11. Rechte der betroffenen Personen",
          paragraphs: ["Nutzer haben insbesondere folgende Rechte:"],
          listItems: [
            "Recht auf Auskunft",
            "Recht auf Berichtigung",
            "Recht auf Löschung",
            "Recht auf Einschränkung der Verarbeitung",
            "Recht auf Datenübertragbarkeit",
            "Recht auf Widerruf einer erteilten Einwilligung",
            "Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde",
          ],
        },
        {
          id: "sicherheit",
          title: "12. Datensicherheit",
          paragraphs: [
            "Wir setzen technische und organisatorische Maßnahmen ein, um personenbezogene Daten bestmöglich vor Verlust, Manipulation und unbefugtem Zugriff zu schützen.",
            "Trotz aller Sorgfalt kann eine vollständige Sicherheit bei digitaler Datenübertragung und Speicherung jedoch nicht garantiert werden.",
          ],
        },
        {
          id: "aenderungen",
          title: "13. Änderungen dieser Datenschutzerklärung",
          paragraphs: [
            "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, sofern dies aufgrund rechtlicher, technischer oder geschäftlicher Entwicklungen erforderlich ist.",
            "Die jeweils aktuelle Fassung wird in der App und auf der Webplattform bereitgestellt.",
          ],
        },
        {
          id: "kontakt",
          title: "14. Kontakt",
          paragraphs: [
            "Bei Fragen zum Datenschutz:",
            "info@mioseg-qr.com",
          ],
        },
      ]}
    />
  );
}