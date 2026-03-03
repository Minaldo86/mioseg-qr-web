"use client";

import { useEffect } from "react";

export default function FolderTransferRedirectPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params?.token ?? "";

  useEffect(() => {
    if (!token) return;

    // Deeplink in die App
    const deep = `miosegqr://folder-transfer/${encodeURIComponent(token)}`;

    // Versuch: App öffnen
    window.location.href = deep;

    // Fallback nach 1.2s (z.B. auf Landing / Download)
    const t = setTimeout(() => {
      window.location.href = "https://mioseg-qr.com"; // oder App-Download Seite
    }, 1200);

    return () => clearTimeout(t);
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