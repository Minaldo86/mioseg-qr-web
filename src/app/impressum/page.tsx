export default function ImpressumPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Impressum</h1>
        <p style={styles.subtitle}>
          Anbieterkennzeichnung für die App und Webplattform von mioseg qr / QR-X.
        </p>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Angaben gemäß § 5 TMG</h2>
          <p style={styles.paragraph}>
            Minh Hoang Huynh
            <br />
            Einzelunternehmen
            <br />
            Konrad Adenauer Str. 170
            <br />
            52511 Geilenkirchen
            <br />
            Deutschland
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Kontakt</h2>
          <p style={styles.paragraph}>E-Mail: info@mioseg-qr.com</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Umsatzsteuer-ID gemäß § 27 a Umsatzsteuergesetz
          </h2>
          <p style={styles.paragraph}>DE357674467</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Vertreten durch</h2>
          <p style={styles.paragraph}>Minh Hoang Huynh</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 MStV
          </h2>
          <p style={styles.paragraph}>
            Minh Hoang Huynh
            <br />
            Konrad Adenauer Str. 170
            <br />
            52511 Geilenkirchen
            <br />
            Deutschland
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Geltungsbereich</h2>
          <p style={styles.paragraph}>
            Dieses Impressum gilt für die mobile App „mioseg qr“ / „QR-X“, die
            zugehörige Webplattform sowie öffentlich erreichbare QR-X-Webansichten.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Haftung für Inhalte</h2>
          <p style={styles.paragraph}>
            Die Inhalte unserer App und Website wurden mit größter Sorgfalt erstellt.
            Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
            jedoch keine Gewähr übernehmen.
          </p>
          <p style={styles.paragraph}>
            Als Diensteanbieter sind wir gemäß den allgemeinen gesetzlichen Vorschriften
            für eigene Inhalte auf diesen Seiten verantwortlich. Eine Verpflichtung zur
            Überwachung übermittelter oder gespeicherter fremder Informationen besteht
            jedoch nur im Rahmen der gesetzlichen Vorgaben.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Haftung für Links</h2>
          <p style={styles.paragraph}>
            Unsere App und Website können Links zu externen Websites Dritter enthalten.
            Auf deren Inhalte haben wir keinen Einfluss. Für die Inhalte der verlinkten
            Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
          </p>
          <p style={styles.paragraph}>
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete
            Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
            entsprechenden Rechtsverletzungen werden derartige Links unverzüglich entfernt.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Urheberrecht</h2>
          <p style={styles.paragraph}>
            Die durch den Anbieter erstellten Inhalte und Werke in dieser App und auf
            dieser Website unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind
            als solche gekennzeichnet.
          </p>
          <p style={styles.paragraph}>
            Jede Vervielfältigung, Bearbeitung, Verbreitung oder sonstige Verwertung
            außerhalb der Grenzen des Urheberrechts bedarf der vorherigen schriftlichen
            Zustimmung des jeweiligen Rechteinhabers.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Haftung für Nutzerinhalte</h2>
          <p style={styles.paragraph}>
            Nutzer können über die Plattform eigene Inhalte wie Texte, Bilder, Videos,
            Audiodateien und sonstige Medien hochladen, speichern, verwalten, teilen und
            gegebenenfalls öffentlich zugänglich machen.
          </p>
          <p style={styles.paragraph}>
            Für diese Inhalte sind ausschließlich die jeweiligen Nutzer verantwortlich.
            Der Anbieter übernimmt keine Haftung für Inhalte, die von Nutzern bereitgestellt,
            hochgeladen, verlinkt oder veröffentlicht werden.
          </p>
          <p style={styles.paragraph}>
            Der Anbieter behält sich vor, Inhalte zu prüfen, zu sperren oder zu löschen,
            sofern diese gegen geltendes Recht, Rechte Dritter oder die Nutzungsbedingungen
            verstoßen.
          </p>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "56px 24px 72px",
  },
  container: {
    maxWidth: 920,
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: 28,
    padding: 32,
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: 40,
    lineHeight: 1.1,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: -0.8,
  },
  subtitle: {
    margin: "0 0 30px 0",
    fontSize: 16,
    lineHeight: 1.75,
    color: "#5b6778",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
  },
  paragraph: {
    margin: "0 0 14px 0",
    fontSize: 15,
    lineHeight: 1.8,
    color: "#445064",
  },
};