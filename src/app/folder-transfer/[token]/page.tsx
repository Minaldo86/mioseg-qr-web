"use client";

import { useEffect } from "react";

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
      <h1>Ordner-Übertragung</h1>
      <p>Wir öffnen die App…</p>

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
        In App öffnen
      </a>
    </div>
  );
}