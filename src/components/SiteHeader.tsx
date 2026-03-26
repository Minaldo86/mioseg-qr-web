import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link href="/" style={styles.brandLink}>
          <div style={styles.logoWrap}>
            <Image
              src="/logo.png"
              alt="mioseg qr Logo"
              width={42}
              height={42}
              style={styles.logo}
              priority
            />
          </div>

          <div style={styles.brandTextWrap}>
            <span style={styles.brandTitle}>mioseg qr</span>
            <span style={styles.brandSubtitle}>QR-X Plattform</span>
          </div>
        </Link>

        <nav style={styles.nav}>
          <Link href="/get-app" style={styles.navLink}>
            Get App
          </Link>
          <Link href="/impressum" style={styles.navLink}>
            Impressum
          </Link>
          <Link href="/datenschutz" style={styles.navLink}>
            Datenschutz
          </Link>
          <Link href="/nutzungsbedingungen" style={styles.navLink}>
            Nutzungsbedingungen
          </Link>
        </nav>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(14px)",
    background: "rgba(8, 17, 29, 0.82)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  inner: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  brandLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
  },
  logoWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  brandTextWrap: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: 900,
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    color: "#aebfd5",
    fontSize: 12,
    fontWeight: 700,
    marginTop: 3,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  navLink: {
    color: "#e5edf7",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
  },
};