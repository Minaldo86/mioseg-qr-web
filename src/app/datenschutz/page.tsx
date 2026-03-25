export default function DatenschutzPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Datenschutzerklärung</h1>
        <p style={styles.subtitle}>
          Informationen zur Verarbeitung personenbezogener Daten in der App und
          Webplattform von mioseg qr / QR-X.
        </p>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Verantwortlicher</h2>
          <p style={styles.paragraph}>
            Verantwortlich für die Datenverarbeitung ist:
            <br />
            Minh Hoang Huynh
            <br />
            Einzelunternehmen
            <br />
            Konrad Adenauer Str. 170
            <br />
            52511 Geilenkirchen
            <br />
            Deutschland
            <br />
            E-Mail: info@mioseg-qr.com
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Allgemeines zur Datenverarbeitung</h2>
          <p style={styles.paragraph}>
            Wir verarbeiten personenbezogene Daten der Nutzer nur, soweit dies zur
            Bereitstellung einer funktionsfähigen App, der Webplattform sowie
            unserer Inhalte und Leistungen erforderlich ist.
          </p>
          <p style={styles.paragraph}>
            Die Verarbeitung erfolgt gemäß den geltenden datenschutzrechtlichen
            Vorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO).
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Registrierung und Benutzerkonto</h2>
          <p style={styles.paragraph}>
            Bei der Registrierung werden insbesondere folgende Daten verarbeitet:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>E-Mail-Adresse</li>
            <li style={styles.listItem}>Passwort in verschlüsselter Form</li>
          </ul>
          <p style={styles.paragraph}>
            Zweck der Verarbeitung ist die Erstellung und Verwaltung des Benutzerkontos
            sowie die Authentifizierung des Nutzers.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Nutzung der App und QR-X Funktionen</h2>
          <p style={styles.paragraph}>
            Bei Nutzung der App und Webplattform können insbesondere folgende Daten
            verarbeitet werden:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>erstellte QR-X Inhalte</li>
            <li style={styles.listItem}>gespeicherte und verwaltete QR-Codes</li>
            <li style={styles.listItem}>Ordnerstrukturen und gespeicherte Scans</li>
            <li style={styles.listItem}>Änderungsstände, Zeitstempel und technische Metadaten</li>
            <li style={styles.listItem}>Inhalte in normalen QR-X und Business QR-X</li>
          </ul>
          <p style={styles.paragraph}>
            Zweck der Verarbeitung ist die Bereitstellung, Verwaltung und Nutzung
            der Funktionen der App und Webplattform.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Hochgeladene Inhalte und Medien</h2>
          <p style={styles.paragraph}>
            Nutzer können eigene Inhalte hochladen, speichern und verwalten,
            insbesondere:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Bilder</li>
            <li style={styles.listItem}>Videos wie MP4-Dateien</li>
            <li style={styles.listItem}>Audiodateien wie MP3-Dateien</li>
            <li style={styles.listItem}>PDFs und sonstige unterstützte Inhalte</li>
          </ul>
          <p style={styles.paragraph}>
            Diese Inhalte werden gespeichert und verarbeitet, um die Funktionen
            der App bereitzustellen, QR-X darzustellen und Webansichten zu ermöglichen.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Standortdaten</h2>
          <p style={styles.paragraph}>
            Die App kann Standortdaten erfassen, wenn der Nutzer dies aktiv erlaubt.
            Dies geschieht insbesondere beim Scannen eines QR-Codes oder beim Erstellen
            eines QR-X.
          </p>
          <p style={styles.paragraph}>
            Standortdaten werden nur verarbeitet oder gespeichert, wenn der Nutzer
            im jeweiligen Vorgang zustimmt.
          </p>
          <p style={styles.paragraph}>
            Zweck der Verarbeitung kann insbesondere die Dokumentation des Scan-Standorts
            oder die Verwaltung standortbezogener QR-X Inhalte sein.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Server- und Logdaten</h2>
          <p style={styles.paragraph}>
            Bei der Nutzung der App und Webplattform können automatisch technische
            Daten verarbeitet werden, insbesondere:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>IP-Adresse</li>
            <li style={styles.listItem}>Gerätetyp</li>
            <li style={styles.listItem}>Betriebssystem</li>
            <li style={styles.listItem}>Zeitpunkt des Zugriffs</li>
            <li style={styles.listItem}>technische Fehler- und Protokolldaten</li>
          </ul>
          <p style={styles.paragraph}>
            Zweck der Verarbeitung ist die Sicherheit, Stabilität, Fehleranalyse
            und Missbrauchsprävention.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Zahlungsabwicklung und In-App Käufe</h2>
          <p style={styles.paragraph}>
            Digitale Käufe innerhalb der App erfolgen über den Apple App Store oder
            den Google Play Store.
          </p>
          <p style={styles.paragraph}>
            Die Zahlungsabwicklung erfolgt ausschließlich über die jeweiligen
            Plattformbetreiber. Wir selbst verarbeiten keine Zahlungsdaten wie
            Kreditkartennummern oder Bankdaten der Nutzer.
          </p>
          <p style={styles.paragraph}>
            Zur technischen Verwaltung und Validierung von In-App Käufen kann zusätzlich
            ein externer Kaufverwaltungsdienst eingesetzt werden.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Eingesetzte Dienstleister</h2>
          <p style={styles.paragraph}>
            Zur technischen Bereitstellung unseres Angebots setzen wir externe
            Dienstleister ein.
          </p>
          <p style={styles.paragraph}>
            Hierzu gehört insbesondere Supabase als Backend-, Datenbank-,
            Authentifizierungs- und Speicherlösung.
          </p>
          <p style={styles.paragraph}>
            Zur Verwaltung und Validierung von In-App Käufen setzen wir RevenueCat ein.
            Dabei können insbesondere App-User-ID, Kaufstatus und produktbezogene
            Informationen verarbeitet werden.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>10. Speicherdauer</h2>
          <p style={styles.paragraph}>
            Personenbezogene Daten werden nur so lange gespeichert, wie dies für
            die jeweiligen Zwecke erforderlich ist.
          </p>
          <p style={styles.paragraph}>
            Nutzer können ihr Konto im Rahmen der verfügbaren Funktionen löschen
            lassen beziehungsweise eine Löschung anfragen.
          </p>
          <p style={styles.paragraph}>
            Gesetzliche Aufbewahrungspflichten bleiben unberührt.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>11. Rechte der betroffenen Personen</h2>
          <p style={styles.paragraph}>
            Nutzer haben insbesondere folgende Rechte:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Recht auf Auskunft</li>
            <li style={styles.listItem}>Recht auf Berichtigung</li>
            <li style={styles.listItem}>Recht auf Löschung</li>
            <li style={styles.listItem}>Recht auf Einschränkung der Verarbeitung</li>
            <li style={styles.listItem}>Recht auf Datenübertragbarkeit</li>
            <li style={styles.listItem}>Recht auf Widerruf einer erteilten Einwilligung</li>
            <li style={styles.listItem}>
              Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde
            </li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>12. Datensicherheit</h2>
          <p style={styles.paragraph}>
            Wir setzen technische und organisatorische Maßnahmen ein, um personenbezogene
            Daten bestmöglich vor Verlust, Manipulation und unbefugtem Zugriff zu schützen.
          </p>
          <p style={styles.paragraph}>
            Trotz aller Sorgfalt kann eine vollständige Sicherheit bei digitaler
            Datenübertragung und Speicherung jedoch nicht garantiert werden.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>13. Änderungen dieser Datenschutzerklärung</h2>
          <p style={styles.paragraph}>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, sofern dies
            aufgrund rechtlicher, technischer oder geschäftlicher Entwicklungen
            erforderlich ist.
          </p>
          <p style={styles.paragraph}>
            Die jeweils aktuelle Fassung wird in der App und auf der Webplattform
            bereitgestellt.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>14. Kontakt</h2>
          <p style={styles.paragraph}>
            Bei Fragen zum Datenschutz:
            <br />
            info@mioseg-qr.com
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
  list: {
    margin: "0 0 14px 0",
    paddingLeft: 22,
    color: "#445064",
  },
  listItem: {
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 1.8,
  },
};