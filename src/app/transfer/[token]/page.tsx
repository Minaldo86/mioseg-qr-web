// src/app/transfer/[token]/page.tsx
import React from "react";

function safeToken(input: unknown) {
  const t = String(input ?? "").trim();
  return t.length > 0 ? t : "";
}

export default async function TransferTokenPage({
  params,
}: {
  // ✅ Next 15 erwartet bei dir params als Promise
  params: Promise<{ token: string }>;
}) {
  const { token: rawToken } = await params;
  const token = safeToken(rawToken);

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Ungültiger Transfer-Link</h1>
          <p style={styles.p}>Der Token fehlt oder ist ungültig.</p>
          <a style={styles.link} href="https://mioseg-qr.com">
            Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  const universalLink = `https://mioseg-qr.com/transfer/${encodeURIComponent(token)}`;
  const appDeepLink = `miosegqr://transfer/${encodeURIComponent(token)}`;
  const playStore = "https://play.google.com/store/apps/details?id=com.mioseg.qr";
  const appStore = "https://apps.apple.com/";
  const getApp = "https://mioseg-qr.com/get-app";

  // ✅ Script macht: Mobile-Erkennung -> App öffnen -> nach 1.2s Fallback UI einblenden
  const script = `
(function(){
  var token = ${JSON.stringify(token)};
  var appDeepLink = ${JSON.stringify(appDeepLink)};
  var universalLink = ${JSON.stringify(universalLink)};
  var playStore = ${JSON.stringify(playStore)};
  var appStore = ${JSON.stringify(appStore)};
  var getApp = ${JSON.stringify(getApp)};

  function isAndroid(){ return /Android/i.test(navigator.userAgent || ""); }
  function isIOS(){ return /iPhone|iPad|iPod/i.test(navigator.userAgent || ""); }

  function show(el){ if(el) el.style.display = "block"; }
  function hide(el){ if(el) el.style.display = "none"; }

  var fallback = document.getElementById("fallback");
  var storeBtn = document.getElementById("storeBtn");
  var copyBtn = document.getElementById("copyBtn");
  var openBtn = document.getElementById("openBtn");
  var direct = document.getElementById("directLink");

  if (direct) direct.textContent = universalLink;
  if (direct) direct.href = universalLink;

  function storeLink(){
    if (isAndroid()) return playStore;
    if (isIOS()) return appStore;
    return getApp;
  }

  function openApp(){
    try { window.location.href = appDeepLink; } catch(e){}
    window.setTimeout(function(){ show(fallback); }, 1200);
  }

  if (openBtn) openBtn.addEventListener("click", function(){ openApp(); });

  if (storeBtn) {
    storeBtn.addEventListener("click", function(){
      window.open(storeLink(), "_blank", "noopener,noreferrer");
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async function(){
      try {
        await navigator.clipboard.writeText(universalLink);
        alert("Link kopiert ✅");
      } catch(e) {
        alert("Kopieren nicht möglich – bitte manuell markieren.");
      }
    });
  }

  // Auto-open nur auf Mobile
  if (isAndroid() || isIOS()) {
    openApp();
  } else {
    show(fallback);
  }
})();`;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoDot} />
          <div style={styles.logoText}>mioseg qr</div>
        </div>

        <h1 style={styles.h1}>QR-X Übertragung</h1>
        <p style={styles.p}>Wir öffnen jetzt die App, damit du die Übertragung annehmen kannst.</p>

        <button id="openBtn" style={styles.primaryBtn}>
          In App öffnen
        </button>

        <div style={styles.smallBox}>
          <div style={styles.smallTitle}>Falls du nicht eingeloggt bist:</div>
          <div style={styles.smallText}>
            Bitte in der App einloggen – danach kannst du den Transfer annehmen.
          </div>
        </div>

        <div id="fallback" style={{ display: "none" }}>
          <div style={{ height: 10 }} />
          <div style={styles.hr} />

          <h2 style={styles.h2}>App nicht installiert?</h2>
          <p style={styles.p}>Installiere mioseg qr und öffne danach den Link erneut.</p>

          <button id="storeBtn" style={styles.secondaryBtn}>
            App herunterladen
          </button>

          <button id="copyBtn" style={styles.ghostBtn}>
            Link kopieren
          </button>

          <div style={styles.mini}>
            Direktlink:{" "}
            <a id="directLink" style={styles.link} href={universalLink}>
              {universalLink}
            </a>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f0f10",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#151518",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  logoDot: { width: 10, height: 10, borderRadius: 999, background: "#4da3ff" },
  logoText: { fontWeight: 700, letterSpacing: 0.3, color: "#dfefff" },
  h1: { margin: "8px 0 10px 0", fontSize: 22 },
  h2: { margin: "12px 0 8px 0", fontSize: 16 },
  p: { margin: "0 0 12px 0", color: "rgba(255,255,255,0.78)", lineHeight: 1.5, fontSize: 14 },
  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "#4da3ff",
    color: "#081018",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
  },
  secondaryBtn: {
    display: "block",
    width: "100%",
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 700,
    textDecoration: "none",
    marginTop: 8,
    cursor: "pointer",
  },
  ghostBtn: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px dashed rgba(255,255,255,0.20)",
    background: "transparent",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10,
  },
  smallBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  },
  smallTitle: { fontSize: 12, fontWeight: 800, marginBottom: 4, color: "rgba(255,255,255,0.9)" },
  smallText: { fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.45 },
  hr: { height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" },
  mini: { marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45, wordBreak: "break-word" },
  link: { color: "#4da3ff", textDecoration: "none" },
};
