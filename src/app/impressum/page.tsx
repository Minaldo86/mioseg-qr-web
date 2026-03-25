// app/impressum/page.tsx

export default function ImpressumPage() {
  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Impressum</h1>

      <section style={styles.section}>
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          Minh Hoang Huynh<br />
          Einzelunternehmen<br />
          Konrad Adenauer Str. 170<br />
          52511 Geilenkirchen<br />
          Deutschland
        </p>
      </section>

      <section style={styles.section}>
        <h2>Kontakt</h2>
        <p>E-Mail: info@mioseg-qr.com</p>
      </section>

      <section style={styles.section}>
        <h2>Umsatzsteuer-ID</h2>
        <p>DE357674467</p>
      </section>

      <section style={styles.section}>
        <h2>Vertreten durch</h2>
        <p>Minh Hoang Huynh</p>
      </section>

      <section style={styles.section}>
        <h2>Haftung für Inhalte</h2>
        <p>
          Die Inhalte unserer App und Website wurden mit größter Sorgfalt erstellt.
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
        </p>
      </section>

      <section style={styles.section}>
        <h2>Haftung für Nutzerinhalte</h2>
        <p>
          Nutzer können eigene Inhalte wie Texte, Bilder, Videos und Audiodateien hochladen.
          Für diese Inhalte sind ausschließlich die jeweiligen Nutzer verantwortlich.
          Der Anbieter übernimmt keine Haftung für Inhalte von Nutzern.
        </p>
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 40,
    fontFamily: "system-ui",
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
};