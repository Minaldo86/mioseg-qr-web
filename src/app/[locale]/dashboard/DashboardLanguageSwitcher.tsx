"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { supabase } from "@/lib/supabase";

const DASHBOARD_LANGUAGES = [
  { code: "de", label: "Deutsch", short: "DE" },
  { code: "en", label: "English", short: "EN" },
  { code: "tr", label: "Türkçe", short: "TR" },
  { code: "pl", label: "Polski", short: "PL" },
  { code: "ar", label: "العربية", short: "AR" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "es", label: "Español", short: "ES" },
  { code: "it", label: "Italiano", short: "IT" },
] as const;

type DashboardLocale = (typeof DASHBOARD_LANGUAGES)[number]["code"];

function isDashboardLocale(value: string): value is DashboardLocale {
  return DASHBOARD_LANGUAGES.some((item) => item.code === value);
}

function replaceLocaleInPath(pathname: string, locale: DashboardLocale) {
  const parts = pathname.split("/");
  if (parts.length > 1 && isDashboardLocale(parts[1] ?? "")) {
    parts[1] = locale;
    return parts.join("/") || `/${locale}/dashboard`;
  }
  return `/${locale}/dashboard`;
}

export default function DashboardLanguageSwitcher({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [saving, setSaving] = useState(false);

  const locale: DashboardLocale = isDashboardLocale(currentLocale)
    ? currentLocale
    : "de";

  async function changeLanguage(nextLocale: DashboardLocale) {
    if (saving || nextLocale === locale) return;

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ language: nextLocale })
          .eq("id", user.id);

        if (error) {
          console.warn("Could not save dashboard language:", error.message);
        }
      }

      const nextPath = replaceLocaleInPath(pathname || `/${locale}/dashboard`, nextLocale);
      router.replace(nextPath);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(8,18,34,0.94)",
        boxShadow: "0 16px 44px rgba(0,0,0,0.28)",
        backdropFilter: "blur(14px)",
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 15 }}>🌐</span>
      <select
        aria-label="Language"
        value={locale}
        disabled={saving}
        onChange={(event) => {
          const value = event.target.value;
          if (isDashboardLocale(value)) void changeLanguage(value);
        }}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          border: 0,
          outline: 0,
          cursor: saving ? "wait" : "pointer",
          background: "transparent",
          color: "#ffffff",
          fontSize: 12,
          fontWeight: 850,
          padding: "4px 20px 4px 2px",
        }}
      >
        {DASHBOARD_LANGUAGES.map((item) => (
          <option
            key={item.code}
            value={item.code}
            style={{ color: "#0f172a", background: "#ffffff" }}
          >
            {item.short} · {item.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        style={{
          marginLeft: -20,
          pointerEvents: "none",
          color: "#94a3b8",
          fontSize: 10,
        }}
      >
        ▼
      </span>
    </div>
  );
}
