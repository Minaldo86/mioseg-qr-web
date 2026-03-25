// components/Footer.tsx

import Link from "next/link";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.brand}>
          <span style={styles.logo}>mioseg qr</span>
          <p style={styles.tagline}>QR-X Plattform</p>
        </div>

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

      <div style={styles.bottom}>
        <p style={styles.copy}>
          © {new Date().getFullYear()} mioseg qr
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: 80,
    paddingTop: 30,
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },
  inner: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 20,
  },
  brand: {
    display: "flex",
    flexDirection: "column" as const,
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
  },
  tagline: {
    fontSize: 12,
    color: "#6b7280",
  },
  links: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap" as const,
  },
  link: {
    fontSize: 14,
    color: "#111827",
    textDecoration: "none",
  },
  bottom: {
    marginTop: 20,
    padding: "10px 0",
    textAlign: "center" as const,
  },
  copy: {
    fontSize: 12,
    color: "#9ca3af",
  },
};