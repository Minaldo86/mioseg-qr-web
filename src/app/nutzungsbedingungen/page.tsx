// app/nutzungsbedingungen/page.tsx

export default function TermsPage() {
  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Nutzungsbedingungen</h1>

      <section style={styles.section}>
        <h2>1. Nutzung</h2>
        <p>
          mioseg qr ermöglicht das Erstellen und Verwalten von QR-Codes (QR-X).
        </p>
      </section>

      <section style={styles.section}>
        <h2>2. Credits-System</h2>
        <p>
          Bestimmte Funktionen sind kostenpflichtig und werden über Credits abgerechnet.
        </p>
      </section>

      <section style={styles.section}>
        <h2>3. In-App Käufe</h2>
        <p>
          Käufe erfolgen über Apple App Store oder Google Play Store.
        </p>
      </section>

      <section style={styles.section}>
        <h2>4. Nutzerinhalte</h2>
        <p>
          Nutzer sind selbst verantwortlich für ihre Inhalte.
          Illegale Inhalte sind verboten.
        </p>
      </section>

      <section style={styles.section}>
        <h2>5. Haftung</h2>
        <p>
          Der Anbieter haftet nur im gesetzlich zulässigen Rahmen.
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