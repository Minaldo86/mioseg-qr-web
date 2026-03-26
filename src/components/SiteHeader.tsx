"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Start" },
  { href: "/get-app", label: "Get App" },
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/nutzungsbedingungen", label: "Nutzungsbedingungen" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";

  const activeHref = useMemo(() => {
    if (!pathname) return "/";
    if (pathname === "/") return "/";
    const exact = NAV_ITEMS.find((item) => item.href === pathname);
    return exact?.href ?? "";
  }, [pathname]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      style={{
        ...styles.wrapper,
        ...(isHome ? styles.wrapperHome : styles.wrapperDefault),
      }}
    >
      <div style={styles.outer}>
        <div style={styles.inner}>
          <Link href="/" style={styles.brandLink} onClick={closeMenu}>
            <div style={styles.logoShell}>
              <Image
                src="/mioseg_qr_white_transparent.png"
                alt="mioseg qr Logo"
                width={44}
                height={44}
                style={styles.logo}
                priority
              />
            </div>

            <div style={styles.brandTextWrap}>
              <span style={styles.brandTitle}>mioseg qr</span>
              <span style={styles.brandSubtitle}>QR-X Plattform</span>
            </div>
          </Link>

          <div style={styles.desktopNavWrap}>
            <nav style={styles.nav}>
              {NAV_ITEMS.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      ...styles.navLink,
                      ...(isActive ? styles.navLinkActive : null),
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div style={styles.actions}>
            <Link href="/get-app" style={styles.ctaButton}>
              App öffnen
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={menuOpen}
              onClick={toggleMenu}
              style={styles.menuButton}
            >
              <span
                style={{
                  ...styles.menuLine,
                  ...(menuOpen ? styles.menuLineTopOpen : null),
                }}
              />
              <span
                style={{
                  ...styles.menuLine,
                  ...(menuOpen ? styles.menuLineMiddleOpen : null),
                }}
              />
              <span
                style={{
                  ...styles.menuLine,
                  ...(menuOpen ? styles.menuLineBottomOpen : null),
                }}
              />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div style={styles.mobilePanel}>
            <nav style={styles.mobileNav}>
              {NAV_ITEMS.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    style={{
                      ...styles.mobileNavLink,
                      ...(isActive ? styles.mobileNavLinkActive : null),
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link href="/get-app" onClick={closeMenu} style={styles.mobileCtaButton}>
                App öffnen
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    padding: "14px 18px 0",
    backdropFilter: "blur(14px)",
  },
  wrapperHome: {
    background:
      "linear-gradient(180deg, rgba(8,17,29,0.72) 0%, rgba(8,17,29,0.30) 58%, rgba(8,17,29,0) 100%)",
  },
  wrapperDefault: {
    background:
      "linear-gradient(180deg, rgba(8,17,29,0.82) 0%, rgba(8,17,29,0.48) 58%, rgba(8,17,29,0.06) 100%)",
  },

  outer: {
    maxWidth: 1220,
    margin: "0 auto",
  },

  inner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    padding: "14px 18px",
    borderRadius: 24,
    background: "rgba(11, 18, 30, 0.78)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
    flexWrap: "nowrap",
  },

  brandLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 14,
    textDecoration: "none",
    minWidth: 0,
    flexShrink: 0,
  },

  logoShell: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    padding: 7,
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
    minWidth: 0,
  },

  brandTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: -0.3,
    lineHeight: 1.05,
  },

  brandSubtitle: {
    color: "#9fb4cc",
    fontSize: 12,
    fontWeight: 700,
    marginTop: 4,
    letterSpacing: 0.2,
  },

  desktopNavWrap: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },

  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  navLink: {
    color: "#e6eef8",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
    padding: "10px 14px",
    borderRadius: 12,
    background: "transparent",
    border: "1px solid transparent",
    transition: "all 0.2s ease",
  },

  navLinkActive: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#ffffff",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },

  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    padding: "0 18px",
    borderRadius: 14,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 800,
    color: "#08111d",
    background: "linear-gradient(180deg, #ffffff 0%, #eef4fb 100%)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
    whiteSpace: "nowrap",
  },

  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    cursor: "pointer",
    position: "relative",
  },

  menuLine: {
    position: "absolute",
    width: 18,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    transition: "all 0.2s ease",
  },

  menuLineTopOpen: {
    transform: "rotate(45deg)",
  },

  menuLineMiddleOpen: {
    opacity: 0,
  },

  menuLineBottomOpen: {
    transform: "rotate(-45deg)",
  },

  mobilePanel: {
    marginTop: 12,
    borderRadius: 24,
    background: "rgba(11, 18, 30, 0.92)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
    padding: 16,
    display: "none",
  },

  mobileNav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  mobileNavLink: {
    textDecoration: "none",
    color: "#e6eef8",
    padding: "12px 14px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    background: "transparent",
    border: "1px solid transparent",
  },

  mobileNavLinkActive: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#ffffff",
  },

  mobileCtaButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 14,
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 800,
    color: "#08111d",
    background: "linear-gradient(180deg, #ffffff 0%, #eef4fb 100%)",
    marginTop: 6,
  },
};