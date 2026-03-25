import LegalPage from "../../components/LegalPage";

export default function NutzungsbedingungenPage() {
  return (
    <LegalPage
      eyebrow="Nutzungsbedingungen"
      title="Nutzungsbedingungen"
      subtitle="Bedingungen für die Nutzung der App und Webplattform von mioseg qr / QR-X."
      sections={[
        {
          id: "anbieter",
          title: "1. Anbieter",
          paragraphs: [
            "Anbieter der App und Webplattform „mioseg qr“ ist:",
            "Minh Hoang Huynh",
            "Einzelunternehmen",
            "Konrad Adenauer Str. 170",
            "52511 Geilenkirchen",
            "Deutschland",
            "E-Mail: info@mioseg-qr.com",
          ],
        },
        {
          id: "leistung",
          title: "2. Leistungsbeschreibung",
          paragraphs: [
            "mioseg qr ist eine Plattform zur Erstellung, Verwaltung und Nutzung von QR-Codes („QR-X“).",
            "Nutzer können QR-Codes scannen und speichern, eigene QR-X erstellen, Inhalte wie Texte, Bilder, Videos, Audiodateien und sonstige Medien hinterlegen sowie QR-X verwalten, teilen und aktualisieren.",
            "Es gibt normale QR-X und Business QR-X mit erweiterten Funktionen.",
          ],
        },
        {
          id: "registrierung",
          title: "3. Registrierung",
          paragraphs: [
            "Die Nutzung bestimmter Funktionen erfordert ein Benutzerkonto.",
            "Die Registrierung erfolgt über E-Mail-Adresse und Passwort.",
            "Der Nutzer ist verpflichtet, wahrheitsgemäße Angaben zu machen und seine Zugangsdaten sicher aufzubewahren.",
          ],
        },
        {
          id: "credits",
          title: "4. Credits-System",
          paragraphs: [
            "Die Nutzung bestimmter Funktionen erfolgt über ein Credit-System.",
            "Ein QR-X kann kostenlos erstellt werden, sofern der jeweils angebotene kostenlose Grundumfang dies vorsieht.",
            "Weitere QR-X sowie zusätzlicher Speicher sind kostenpflichtig.",
            "Credits werden im Rahmen des angebotenen Pay-per-Use-Modells verbraucht.",
            "Credits sind nicht übertragbar und nicht auszahlbar.",
          ],
        },
        {
          id: "zahlungen",
          title: "5. Zahlungen / In-App Käufe",
          paragraphs: [
            "Digitale Käufe innerhalb der App erfolgen über den Apple App Store oder den Google Play Store.",
            "Es gelten die jeweiligen Zahlungsbedingungen der Plattformbetreiber.",
            "Der Anbieter selbst verarbeitet keine Zahlungsdaten.",
            "Rückerstattungen erfolgen ausschließlich nach den Bedingungen des jeweiligen App Stores, soweit dort vorgesehen.",
          ],
        },
        {
          id: "business",
          title: "6. Business QR-X",
          paragraphs: [
            "Neben normalen QR-X können auch Business QR-X mit erweiterten Funktionen angeboten werden.",
            "Für Business QR-X können gesonderte oder zusätzliche Kostenregelungen gelten.",
            "Der konkrete Funktionsumfang von Business QR-X kann je nach Produktstand variieren.",
          ],
        },
        {
          id: "inhalte",
          title: "7. Benutzerinhalte",
          paragraphs: [
            "Nutzer können eigene Inhalte hochladen, speichern und verwalten, insbesondere Texte, Bilder, Videos, Audiodateien, PDFs und weitere unterstützte Inhalte.",
            "Der Nutzer ist allein verantwortlich für die von ihm hochgeladenen Inhalte.",
            "Es ist insbesondere untersagt, Inhalte hochzuladen, die gegen geltendes Recht verstoßen, Rechte Dritter verletzen oder beleidigend, diskriminierend oder sonst rechtswidrig sind.",
            "Der Anbieter übernimmt keine Haftung für Inhalte der Nutzer.",
            "Der Anbieter behält sich das Recht vor, Inhalte zu prüfen, zu sperren oder zu löschen.",
          ],
        },
        {
          id: "speicher",
          title: "8. Speicher und Datenvolumen",
          paragraphs: [
            "Das Speichern von Medien wie Videos oder Audiodateien kann zusätzlichen Speicherverbrauch verursachen.",
            "Zusätzlicher Speicher kann kostenpflichtig sein und über Credits oder andere angebotene Modelle erworben werden.",
            "Der Nutzer ist selbst verantwortlich für die Größe seiner Inhalte und die Nutzung seines Speicherkontingents.",
          ],
        },
        {
          id: "oeffentlich",
          title: "9. Öffentliche Inhalte und Webansichten",
          paragraphs: [
            "Soweit Nutzer Inhalte für öffentliche QR-X-Webansichten freigeben, können diese Inhalte öffentlich abrufbar sein.",
            "Nutzer sind selbst dafür verantwortlich zu prüfen, welche Inhalte veröffentlicht oder freigegeben werden.",
          ],
        },
        {
          id: "verfuegbarkeit",
          title: "10. Verfügbarkeit",
          paragraphs: [
            "Der Anbieter bemüht sich um eine hohe Verfügbarkeit der Dienste.",
            "Ein Anspruch auf permanente Verfügbarkeit oder fehlerfreie Funktion besteht nicht.",
            "Wartungen, Updates und technische Störungen können zu Einschränkungen führen.",
          ],
        },
        {
          id: "haftung",
          title: "11. Haftung",
          paragraphs: [
            "Der Anbieter haftet nur bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung wesentlicher Vertragspflichten im gesetzlich zulässigen Umfang.",
            "Keine Haftung besteht insbesondere für Inhalte von Nutzern, Datenverlust durch Nutzerverhalten oder technische Störungen außerhalb des Einflussbereichs des Anbieters.",
          ],
        },
        {
          id: "aenderungen",
          title: "12. Änderungen",
          paragraphs: [
            "Der Anbieter behält sich vor, diese Nutzungsbedingungen jederzeit anzupassen, sofern hierfür ein sachlicher Grund besteht.",
            "Nutzer werden über wesentliche Änderungen in geeigneter Weise informiert.",
          ],
        },
        {
          id: "recht",
          title: "13. Anwendbares Recht",
          paragraphs: [
            "Es gilt das Recht der Bundesrepublik Deutschland, soweit dem keine zwingenden gesetzlichen Vorschriften entgegenstehen.",
          ],
        },
        {
          id: "sprache",
          title: "14. Sprache und Auslegung",
          paragraphs: [
            "Soweit diese Nutzungsbedingungen in mehreren Sprachen bereitgestellt werden, dient dies in erster Linie der besseren Verständlichkeit.",
            "Bei Auslegungsunterschieden oder Widersprüchen ist die deutsche Fassung maßgeblich, soweit gesetzlich zulässig.",
          ],
        },
        {
          id: "schluss",
          title: "15. Schlussbestimmungen",
          paragraphs: [
            "Sollten einzelne Bestimmungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
          ],
        },
      ]}
    />
  );
}