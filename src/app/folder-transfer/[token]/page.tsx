"use client";

import { useEffect, useState } from "react";
import { getDictionary } from "@/i18n/get-dictionary";
import { locales, type Locale } from "@/i18n/config";


function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "de";

  const candidates = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ];

  for (const candidate of candidates) {
    const normalized = String(candidate || "").trim().toLowerCase().split(/[-_]/)[0];
    if (locales.includes(normalized as Locale)) return normalized as Locale;
  }

  return "de";
}

type FolderTransferRedirectPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function FolderTransferRedirectPage({
  params,
}: FolderTransferRedirectPageProps) {
  const { token = "" } = await params;

  return <FolderTransferRedirectClient token={token} />;
}

function FolderTransferRedirectClient({ token }: { token: string }) {
  const [locale, setLocale] = useState<Locale>("de");
  const copy = getDictionary(locale).transfer;

  useEffect(() => {
    setLocale(detectBrowserLocale());
  }, []);

  useEffect(() => {
    if (!token) return;

    // ✅ WICHTIG: 3 Slashes, damit "folder-transfer" Teil des PATH ist
    const deep = `miosegqr:///folder-transfer/${encodeURIComponent(token)}`;

    window.location.href = deep;

    const t = window.setTimeout(() => {
      window.location.href = "https://mioseg-qr.com";
    }, 1200);

    return () => window.clearTimeout(t);
  }, [token]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>{copy.folderTitle}</h1>
      <p>{copy.folderOpening}</p>

      <a
        href={`miosegqr:///folder-transfer/${encodeURIComponent(token)}`}
        style={{
          display: "inline-block",
          marginTop: 12,
          padding: "12px 16px",
          background: "#4da3ff",
          color: "#081018",
          borderRadius: 12,
          fontWeight: 800,
          textDecoration: "none",
        }}
      >
        {copy.openApp}
      </a>
    </div>
  );
}