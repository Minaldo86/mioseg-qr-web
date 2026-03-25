import LegalPage from "../../components/LegalPage";

export default function ImpressumPage() {
  return (
    <LegalPage
      eyebrow="Rechtliches"
      title="Impressum"
      subtitle="Anbieterkennzeichnung für die App, die Webplattform und öffentlich erreichbare QR-X-Webansichten von mioseg qr / QR-X."
      sections={[
        {
          id: "angaben",
          title: "Angaben gemäß § 5 TMG",
          paragraphs: [
            "Minh Hoang Huynh",
            "Einzelunternehmen",
            "Konrad Adenauer Str. 170",
            "52511 Geilenkirchen",
            "Deutschland",
          ],
        },
        {
          id: "kontakt",
          title: "Kontakt",
          paragraphs: ["E-Mail: info@mioseg-qr.com"],
        },
        {
          id: "ustid",
          title: "Umsatzsteuer-ID gemäß § 27 a Umsatzsteuergesetz",
          paragraphs: ["DE357674467"],
        },
        {
          id: "vertretung",
          title: "Vertreten durch",
          paragraphs: ["Minh Hoang Huynh"],
        },
        {
          id: "redaktion",
          title: "Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 MStV",
          paragraphs: [
            "Minh Hoang Huynh",
            "Konrad Adenauer Str. 170",
            "52511 Geilenkirchen",
            "Deutschland",
          ],
        },
        {
          id: "geltungsbereich",
          title: "Geltungsbereich",
          paragraphs: [
            "Dieses Impressum gilt für die mobile App „mioseg qr“ / „QR-X“, die zugehörige Webplattform sowie öffentlich erreichbare QR-X-Webansichten.",
          ],
        },
        {
          id: "haftung-inhalte",
          title: "Haftung für Inhalte",
          paragraphs: [
            "Die Inhalte unserer App und Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.",
            "Als Diensteanbieter sind wir gemäß den allgemeinen gesetzlichen Vorschriften für eigene Inhalte verantwortlich. Eine Verpflichtung zur allgemeinen Überwachung übermittelter oder gespeicherter fremder Informationen besteht jedoch nur im Rahmen der gesetzlichen Vorgaben.",
          ],
        },
        {
          id: "haftung-links",
          title: "Haftung für Links",
          paragraphs: [
            "Unsere App und Website können Links zu externen Websites Dritter enthalten. Auf deren Inhalte haben wir keinen Einfluss. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.",
            "Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden derartige Links unverzüglich entfernt.",
          ],
        },
        {
          id: "urheberrecht",
          title: "Urheberrecht",
          paragraphs: [
            "Die durch den Anbieter erstellten Inhalte und Werke in dieser App und auf dieser Website unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.",
            "Jede Vervielfältigung, Bearbeitung, Verbreitung oder sonstige Verwertung außerhalb der Grenzen des Urheberrechts bedarf der vorherigen Zustimmung des jeweiligen Rechteinhabers.",
          ],
        },
        {
          id: "nutzerinhalte",
          title: "Haftung für Nutzerinhalte",
          paragraphs: [
            "Nutzer können über die Plattform eigene Inhalte wie Texte, Bilder, Videos, Audiodateien und sonstige Medien hochladen, speichern, verwalten, teilen und gegebenenfalls öffentlich zugänglich machen.",
            "Für diese Inhalte sind ausschließlich die jeweiligen Nutzer verantwortlich. Der Anbieter übernimmt keine Haftung für Inhalte, die von Nutzern bereitgestellt, hochgeladen, verlinkt oder veröffentlicht werden.",
            "Der Anbieter behält sich vor, Inhalte zu prüfen, zu sperren oder zu löschen, sofern diese gegen geltendes Recht, Rechte Dritter oder die Nutzungsbedingungen verstoßen.",
          ],
        },
      ]}
    />
  );
}