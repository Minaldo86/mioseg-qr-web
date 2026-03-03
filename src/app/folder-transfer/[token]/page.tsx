"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";

export default function FolderTransferRedirectPage() {
  const params = useParams<{ token?: string }>();

  const token = useMemo(() => {
    const raw = params?.token;
    return typeof raw === "string" ? raw.trim() : "";
  }, [params]);

  useEffect(() => {
    if (!token) return;

    const deep = `miosegqr://folder-transfer/${encodeURIComponent(token)}`;

    // Versuch: App öffnen
    window.location.href = deep;

    // Fallback nach 1.2s
    const t = window.setTimeout(() => {
      window.location.href = "https://mioseg-qr.com";
    }, 1200);

    return () => window.clearTimeout(t);
  }, [token]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Ordner-Übertragung</h1>
      <p>Wir öffnen die App…</p>

      <a
        href={`miosegqr://folder-transfer/${encodeURIComponent(token)}`}
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
        In App öffnen
      </a>
    </div>
  );
}