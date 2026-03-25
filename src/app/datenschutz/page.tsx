// app/datenschutz/page.tsx

export default function DatenschutzPage() {
  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Datenschutzerklärung</h1>

      <section style={styles.section}>
        <h2>1. Verantwortlicher</h2>
        <p>
          Minh Hoang Huynh<br />
          Konrad Adenauer Str. 170<br />
          52511 Geilenkirchen<br />
          Deutschland<br />
          E-Mail: info@mioseg-qr.com
        </p>
      </section>

      <section style={styles.section}>
        <h2>2. Erhebung von Daten</h2>
        <p>
          Bei der Nutzung der App werden personenbezogene Daten verarbeitet, insbesondere:
          E-Mail-Adresse, QR-X Inhalte, hochgeladene Medien (z. B. Bilder, Videos, Audiodateien) sowie technische Daten.
        </p>
      </section>

      <section style={styles.section}>
        <h2>3. Standortdaten</h2>
        <p>
          Standortdaten werden nur verarbeitet, wenn der Nutzer aktiv zustimmt.
        </p>
      </section>

      <section style={styles.section}>
        <h2>4. Zahlungsabwicklung</h2>
        <p>
          Käufe erfolgen über Apple App Store oder Google Play Store.
          Zahlungsdaten werden nicht von uns verarbeitet.
        </p>
      </section>

      <section style={styles.section}>
        <h2>5. Drittanbieter</h2>
        <p>
          Wir nutzen Supabase für Backend und Speicherung sowie RevenueCat zur Verwaltung von In-App Käufen.
        </p>
      </section>

      <section style={styles.section}>
        <h2>6. Rechte der Nutzer</h2>
        <p>
          Nutzer haben das Recht auf Auskunft, Löschung, Berichtigung und Einschränkung der Verarbeitung.
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