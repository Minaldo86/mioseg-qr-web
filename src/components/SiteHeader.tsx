"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import styles from "./site-header.module.css";

const SUPPORTED = ["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const;
type HeaderLocale = (typeof SUPPORTED)[number];

const HEADER_LANGUAGES: Array<{ code: HeaderLocale; label: string; short: string }> = [
  { code: "de", label: "Deutsch", short: "DE" },
  { code: "en", label: "English", short: "EN" },
  { code: "tr", label: "Türkçe", short: "TR" },
  { code: "pl", label: "Polski", short: "PL" },
  { code: "ar", label: "العربية", short: "AR" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "es", label: "Español", short: "ES" },
  { code: "it", label: "Italiano", short: "IT" },
];

type HeaderCopy = {
  home: string;
  getApp: string;
  login: string;
  dashboard: string;
  explore: string;
  account: string;
  support: string;
  signOut: string;
  signingOut: string;
  accountMenu: string;
};

const HEADER_TEXT: Record<HeaderLocale, HeaderCopy> = {
  de: {
    home: "mioseg qr Startseite",
    getApp: "App herunterladen",
    login: "Anmelden",
    dashboard: "Dashboard",
    explore: "Explore",
    account: "Konto",
    support: "Support",
    signOut: "Abmelden",
    signingOut: "Wird abgemeldet …",
    accountMenu: "Kontomenü",
  },
  en: {
    home: "mioseg qr home",
    getApp: "Get App",
    login: "Sign in",
    dashboard: "Dashboard",
    explore: "Explore",
    account: "Account",
    support: "Support",
    signOut: "Sign out",
    signingOut: "Signing out …",
    accountMenu: "Account menu",
  },
  tr: {
    home: "mioseg qr ana sayfa",
    getApp: "Uygulamayı indir",
    login: "Giriş yap",
    dashboard: "Kontrol paneli",
    explore: "Keşfet",
    account: "Hesap",
    support: "Destek",
    signOut: "Çıkış yap",
    signingOut: "Çıkış yapılıyor …",
    accountMenu: "Hesap menüsü",
  },
  pl: {
    home: "Strona główna mioseg qr",
    getApp: "Pobierz aplikację",
    login: "Zaloguj się",
    dashboard: "Panel",
    explore: "Odkrywaj",
    account: "Konto",
    support: "Pomoc",
    signOut: "Wyloguj się",
    signingOut: "Wylogowywanie …",
    accountMenu: "Menu konta",
  },
  ar: {
    home: "الصفحة الرئيسية لـ mioseg qr",
    getApp: "تنزيل التطبيق",
    login: "تسجيل الدخول",
    dashboard: "لوحة التحكم",
    explore: "استكشاف",
    account: "الحساب",
    support: "الدعم",
    signOut: "تسجيل الخروج",
    signingOut: "جارٍ تسجيل الخروج …",
    accountMenu: "قائمة الحساب",
  },
  fr: {
    home: "Accueil mioseg qr",
    getApp: "Télécharger l’application",
    login: "Se connecter",
    dashboard: "Tableau de bord",
    explore: "Explorer",
    account: "Compte",
    support: "Assistance",
    signOut: "Se déconnecter",
    signingOut: "Déconnexion …",
    accountMenu: "Menu du compte",
  },
  es: {
    home: "Inicio de mioseg qr",
    getApp: "Descargar la aplicación",
    login: "Iniciar sesión",
    dashboard: "Panel",
    explore: "Explorar",
    account: "Cuenta",
    support: "Soporte",
    signOut: "Cerrar sesión",
    signingOut: "Cerrando sesión …",
    accountMenu: "Menú de cuenta",
  },
  it: {
    home: "Home di mioseg qr",
    getApp: "Scarica l’app",
    login: "Accedi",
    dashboard: "Dashboard",
    explore: "Esplora",
    account: "Account",
    support: "Supporto",
    signOut: "Esci",
    signingOut: "Disconnessione …",
    accountMenu: "Menu account",
  },
};

type HeaderUser = {
  id: string;
  email: string;
  displayName: string;
  initials: string;
};

function normalizeLocale(value: string | null | undefined): HeaderLocale | null {
  const normalized = String(value ?? "").trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED.includes(normalized as HeaderLocale)
    ? (normalized as HeaderLocale)
    : null;
}

function buildInitials(name: string, email: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const emailName = email.split("@")[0] || "";
  const emailParts = emailName.split(/[._-]+/).filter(Boolean);

  if (emailParts.length >= 2) {
    return `${emailParts[0][0]}${emailParts[emailParts.length - 1][0]}`.toUpperCase();
  }

  return (emailName.slice(0, 2) || "U").toUpperCase();
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [queryLocale, setQueryLocale] = useState<HeaderLocale | null>(null);
  const [headerUser, setHeaderUser] = useState<HeaderUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [savingLanguage, setSavingLanguage] = useState(false);

  const firstSegment = pathname.split("/").filter(Boolean)[0] || "";
  const pathLocale = normalizeLocale(firstSegment);
  const locale = pathLocale ?? queryLocale ?? "de";
  const ui = HEADER_TEXT[locale];

  // A password-recovery link creates a temporary Supabase session.
  // Do not present that recovery session as a normal signed-in state in the global header.
  const isPasswordRecoveryPage = /\/reset-password(?:\/|$)/.test(pathname);

  useEffect(() => {
    if (pathLocale) {
      setQueryLocale(null);
      return;
    }

    if (typeof window === "undefined") return;

    const lang = normalizeLocale(new URLSearchParams(window.location.search).get("lang"));
    setQueryLocale(lang);
  }, [pathname, pathLocale]);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      if (isPasswordRecoveryPage) {
        if (!cancelled) {
          setHeaderUser(null);
          setMenuOpen(false);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user ?? null;

      if (!user) {
        if (!cancelled) setHeaderUser(null);
        return;
      }

      const email = user.email ?? "";

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name,last_name")
        .eq("id", user.id)
        .maybeSingle();

      const firstName = String(profile?.first_name ?? "").trim();
      const lastName = String(profile?.last_name ?? "").trim();
      const profileName = [firstName, lastName].filter(Boolean).join(" ").trim();

      const metadataName = String(
        user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          "",
      ).trim();

      const displayName =
        profileName ||
        metadataName ||
        email.split("@")[0] ||
        "mioseg qr";

      if (!cancelled) {
        setHeaderUser({
          id: user.id,
          email,
          displayName,
          initials: buildInitials(displayName, email),
        });
      }
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isPasswordRecoveryPage]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && !menuRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const accountHref = `/${locale}/dashboard/account`;
  const dashboardHref = `/${locale}/dashboard`;
  const supportHref = `/${locale}/dashboard/support`;
  const exploreHref = `/${locale}/explore`;

  const currentLabel = useMemo(() => {
    if (!headerUser) return "";
    return `${headerUser.displayName}${headerUser.email ? ` – ${headerUser.email}` : ""}`;
  }, [headerUser]);

  const handleLanguageChange = async (nextLocale: HeaderLocale) => {
    if (savingLanguage || nextLocale === locale) return;

    setSavingLanguage(true);

    try {
      if (headerUser) {
        const { error } = await supabase
          .from("profiles")
          .update({ language: nextLocale })
          .eq("id", headerUser.id);

        if (error) {
          console.warn("Could not save header language:", error.message);
        }
      }

      if (pathLocale) {
        const parts = pathname.split("/");
        if (parts.length > 1) {
          parts[1] = nextLocale;
        }
        router.replace(parts.join("/") || `/${nextLocale}`);
      } else if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("lang", nextLocale);
        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
        setQueryLocale(nextLocale);
      }
      router.refresh();
    } finally {
      setSavingLanguage(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;

    try {
      setSigningOut(true);
      setMenuOpen(false);
      await supabase.auth.signOut();
      setHeaderUser(null);
      router.push(`/${locale}`);
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href={`/${locale}`} className={styles.brand} aria-label={ui.home}>
          <img
            src="/logo-wwhite.png"
            alt="mioseg qr Logo"
            className={styles.logo}
          />
        </Link>

        <div className={styles.rightSide}>
          {headerUser ? (
            <>
              <nav className={styles.userNav} aria-label={ui.accountMenu}>
                <Link href={dashboardHref} className={`${styles.navLink} ${styles.dashboardLink}`}>
                  {ui.dashboard}
                </Link>
                <Link href={exploreHref} className={styles.navLink}>
                  {ui.explore}
                </Link>
              </nav>

              <div className={styles.accountMenuWrap} ref={menuRef}>
                <button
                  type="button"
                  className={styles.avatarButton}
                  aria-label={currentLabel}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  {headerUser.initials}
                </button>

                {menuOpen ? (
                  <div className={styles.accountMenu} role="menu">
                    <div className={styles.accountIdentity}>
                      <strong className={styles.accountName}>
                        {headerUser.displayName}
                      </strong>
                      {headerUser.email ? (
                        <span className={styles.accountEmail}>{headerUser.email}</span>
                      ) : null}
                    </div>

                    <div className={styles.menuDivider} />

                    <Link
                      href={accountHref}
                      className={styles.menuLink}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      {ui.account}
                    </Link>
                    <Link
                      href={dashboardHref}
                      className={styles.menuLink}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      {ui.dashboard}
                    </Link>
                    <Link
                      href={supportHref}
                      className={styles.menuLink}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      {ui.support}
                    </Link>

                    <button
                      type="button"
                      className={styles.signOutButton}
                      role="menuitem"
                      disabled={signingOut}
                      onClick={handleSignOut}
                    >
                      {signingOut ? ui.signingOut : ui.signOut}
                    </button>
                  </div>
                ) : null}
              </div>

              <label className={styles.languageControl}>
                <span aria-hidden="true" className={styles.languageIcon}>🌐</span>
                <select
                  aria-label="Language"
                  value={locale}
                  disabled={savingLanguage}
                  onChange={(event) => {
                    const nextLocale = normalizeLocale(event.target.value);
                    if (nextLocale) void handleLanguageChange(nextLocale);
                  }}
                >
                  {HEADER_LANGUAGES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.short} · {item.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true" className={styles.languageChevron}>▼</span>
              </label>
            </>
          ) : isPasswordRecoveryPage ? (
            <div className={styles.guestActions}>
              <Link href={`/${locale}/login`} className={styles.loginLink}>
                {ui.login}
              </Link>

              <label className={styles.languageControl}>
                <span aria-hidden="true" className={styles.languageIcon}>🌐</span>
                <select
                  aria-label="Language"
                  value={locale}
                  disabled={savingLanguage}
                  onChange={(event) => {
                    const nextLocale = normalizeLocale(event.target.value);
                    if (nextLocale) void handleLanguageChange(nextLocale);
                  }}
                >
                  {HEADER_LANGUAGES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.short} · {item.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true" className={styles.languageChevron}>▼</span>
              </label>
            </div>
          ) : (
            <div className={styles.guestActions}>
              <Link href={`/${locale}/get-app`} className={styles.cta}>
                {ui.getApp}
              </Link>
              <Link href={`/${locale}/login`} className={styles.loginLink}>
                {ui.login}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
