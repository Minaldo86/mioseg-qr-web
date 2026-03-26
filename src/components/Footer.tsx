import Link from "next/link";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.topRow}>
          <div style={styles.brandBlock}>
            <span style={styles.brandTitle}>mioseg qr</span>
            <p style={styles.brandText}>
              QR-X Plattform für gespeicherte Scans, flexible Inhalte, Business QR-X,
              Standortbezug und professionelle Webansichten.
            </p>
          </div>

          <div style={styles.linkBlock}>
            <span style={styles.linkHeading}>Rechtliches</span>
            <div style={styles.links}>
              <Link href="/impressum" style={styles.link}>
                Impressum
              </Link>
              <Link href="/datenschutz" style={styles.link}>
                Datenschutz
              </Link>
              <Link href="/nutzungsbedingungen" style={styles.link}>
                Nutzungsbedingungen
              </Link>
            </div>
          </div>
        </div>

        <div style={styles.bottomRow}>
          <span style={styles.copy}>© 2026 mioseg qr. Alle Rechte vorbehalten.</span>
        </div>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    marginTop: 0,
    background: "#0b1220",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "28px 24px 34px",
  },
  inner: {
    maxWidth: 1180,
    margin: "0 auto",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 28,
    flexWrap: "wrap",
    marginBottom: 22,
  },
  brandBlock: {
    maxWidth: 520,
  },
  brandTitle: {
    display: "inline-block",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 10,
  },
  brandText: {
    margin: 0,
    color: "#b9c8d8",
    fontSize: 14,
    lineHeight: 1.8,
  },
  linkBlock: {
    minWidth: 220,
  },
  linkHeading: {
    display: "inline-block",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 10,
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  link: {
    color: "#cfe0f2",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
  },
  bottomRow: {
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  copy: {
    color: "#8fa4bb",
    fontSize: 13,
  },
};