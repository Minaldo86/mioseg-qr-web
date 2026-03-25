import Link from "next/link";
import React from "react";

type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  listItems?: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: LegalSection[];
  updatedLabel?: string;
  updatedValue?: string;
};

export default function LegalPage({
  eyebrow,
  title,
  subtitle,
  sections,
  updatedLabel = "Stand",
  updatedValue = "März 2026",
}: LegalPageProps) {
  return (
    <main style={styles.page}>
      <section style={styles.heroSection}>
        <div style={styles.container}>
          <span style={styles.eyebrow}>{eyebrow}</span>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{subtitle}</p>

          <div style={styles.metaRow}>
            <div style={styles.metaCard}>
              <span style={styles.metaLabel}>{updatedLabel}</span>
              <strong style={styles.metaValue}>{updatedValue}</strong>
            </div>

            <div style={styles.metaCard}>
              <span style={styles.metaLabel}>Gültigkeit</span>
              <strong style={styles.metaValue}>App + Webplattform</strong>
            </div>

            <div style={styles.metaCard}>
              <span style={styles.metaLabel}>Sprache</span>
              <strong style={styles.metaValue}>Deutsch</strong>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.contentSection}>
        <div style={styles.contentWrap}>
          <aside style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <p style={styles.sidebarTitle}>Inhalt</p>
              <nav style={styles.nav}>
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`} style={styles.navLink}>
                    {section.title}
                  </a>
                ))}
              </nav>

              <div style={styles.sidebarDivider} />

              <div style={styles.quickLinks}>
                <Link href="/" style={styles.quickLink}>
                  Startseite
                </Link>
                <Link href="/get-app" style={styles.quickLink}>
                  Get App
                </Link>
                <Link href="/datenschutz" style={styles.quickLink}>
                  Datenschutz
                </Link>
                <Link href="/nutzungsbedingungen" style={styles.quickLink}>
                  Nutzungsbedingungen
                </Link>
                <Link href="/impressum" style={styles.quickLink}>
                  Impressum
                </Link>
              </div>
            </div>
          </aside>

          <div style={styles.mainColumn}>
            {sections.map((section) => (
              <section key={section.id} id={section.id} style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>{section.title}</h2>

                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.id}-p-${index}`} style={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}

                {section.listItems && section.listItems.length > 0 ? (
                  <ul style={styles.list}>
                    {section.listItems.map((item, index) => (
                      <li key={`${section.id}-li-${index}`} style={styles.listItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #08111d 0%, #0d1726 24%, #f8fafc 24%, #f8fafc 100%)",
  },

  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px",
  },

  heroSection: {
    padding: "72px 0 44px",
    color: "#ffffff",
  },
  eyebrow: {
    display: "inline-block",
    marginBottom: 14,
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#d9e8ff",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: 52,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: -1.2,
  },
  subtitle: {
    margin: "0 0 24px 0",
    maxWidth: 820,
    fontSize: 18,
    lineHeight: 1.8,
    color: "#bfd0e3",
  },

  metaRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },
  metaCard: {
    minWidth: 160,
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: "#aac0d8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: 700,
  },
  metaValue: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: 800,
  },

  contentSection: {
    padding: "0 0 72px",
  },
  contentWrap: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px",
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    gap: 24,
    alignItems: "start",
  },

  sidebar: {
    position: "sticky",
    top: 24,
    alignSelf: "start",
  },
  sidebarCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
  },
  sidebarTitle: {
    margin: "0 0 14px 0",
    fontSize: 15,
    fontWeight: 900,
    color: "#0f172a",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  navLink: {
    color: "#183a67",
    textDecoration: "none",
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 700,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "#e8eef5",
    margin: "18px 0",
  },
  quickLinks: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  quickLink: {
    color: "#5b6778",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
  },

  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: 28,
    padding: 28,
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.05)",
    scrollMarginTop: 24,
  },
  sectionTitle: {
    margin: "0 0 14px 0",
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: -0.4,
  },
  paragraph: {
    margin: "0 0 14px 0",
    fontSize: 15,
    lineHeight: 1.85,
    color: "#445064",
  },
  list: {
    margin: "4px 0 6px 0",
    paddingLeft: 22,
    color: "#445064",
  },
  listItem: {
    marginBottom: 10,
    fontSize: 15,
    lineHeight: 1.8,
  },
};