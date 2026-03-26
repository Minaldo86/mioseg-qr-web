"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./site-header.module.css";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Start" },
  { href: "/get-app", label: "Get App" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeHref = useMemo(() => {
    if (!pathname) return "/";
    if (pathname === "/") return "/";
    const exact = NAV_ITEMS.find((item) => item.href === pathname);
    return exact?.href ?? "";
  }, [pathname]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.wrapper}>
      <div className={styles.outer}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brandLink} onClick={closeMenu}>
            <div className={styles.logoShell}>
              <Image
                src="/mioseg_qr_white_transparent.png"
                alt="mioseg qr Logo"
                width={44}
                height={44}
                className={styles.logo}
                priority
              />
            </div>

            <div className={styles.brandTextWrap}>
              <span className={styles.brandTitle}>mioseg qr</span>
              <span className={styles.brandSubtitle}>QR-X Plattform</span>
            </div>
          </Link>

          <nav className={styles.desktopNav} aria-label="Hauptnavigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeHref === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.actions}>
            <Link href="/get-app" className={styles.ctaButton}>
              App öffnen
            </Link>

            <button
              type="button"
              className={styles.menuButton}
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={menuOpen}
              onClick={toggleMenu}
            >
              <span className={`${styles.menuLine} ${menuOpen ? styles.menuLineTopOpen : ""}`} />
              <span className={`${styles.menuLine} ${menuOpen ? styles.menuLineMiddleOpen : ""}`} />
              <span className={`${styles.menuLine} ${menuOpen ? styles.menuLineBottomOpen : ""}`} />
            </button>
          </div>
        </div>

        <div className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ""}`}>
          <nav className={styles.mobileNav} aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeHref === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`${styles.mobileNavLink} ${
                    isActive ? styles.mobileNavLinkActive : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link href="/get-app" onClick={closeMenu} className={styles.mobileCtaButton}>
              App öffnen
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}