"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

type QrxCodeCanvasProps = {
  value: string;
  qrxId: string;
  variant: "normal" | "business";
  logoSrc?: string;
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export default function QrxCodeCanvas({
  value,
  qrxId,
  variant,
  logoSrc = "/logo-white.png",
}: QrxCodeCanvasProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const label = variant === "business" ? "BUSINESS" : "QR-X";

  const filename = useMemo(() => `mioseg-qrx-${qrxId}.png`, [qrxId]);

  useEffect(() => {
    let cancelled = false;

    async function generateQrCode() {
      const canvas = document.createElement("canvas");
      const size = 1024;
      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(canvas, value, {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const center = size / 2;
      const panelSize = 188;
      const panelX = center - panelSize / 2;
      const panelY = center - panelSize / 2;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.24)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      drawRoundedRect(ctx, panelX, panelY, panelSize, panelSize, 32);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      drawRoundedRect(ctx, panelX + 14, panelY + 14, panelSize - 28, panelSize - 28, 26);
      ctx.fillStyle = variant === "business" ? "#D4AF37" : "#111827";
      ctx.fill();

      try {
        const logo = await loadImage(logoSrc);
        if (cancelled) return;

        const logoSize = panelSize - 58;
        const logoX = center - logoSize / 2;
        const logoY = center - logoSize / 2;

        ctx.save();
        drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 22);
        ctx.clip();
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      } catch {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 34px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("mioseg", center, center - 16);
        ctx.fillText("qr", center, center + 24);
      }

      if (!cancelled) {
        setQrDataUrl(canvas.toDataURL("image/png"));
      }
    }

    void generateQrCode();

    return () => {
      cancelled = true;
    };
  }, [value, logoSrc, variant]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("QR-X Link kopieren", value);
    }
  }

  return (
    <>
      <h2 style={centerTitleStyle}>QR-X Code</h2>
      <p style={mutedCenterTextStyle}>
        Dieser QR-Code wird direkt im Web erzeugt und enthält das mioseg qr Logo in der Mitte.
      </p>

      <div style={qrImageWrapStyle}>
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="QR-X Code" style={qrImageStyle} />
        ) : (
          <div style={qrLoadingStyle}>QR-X Code wird erstellt …</div>
        )}
      </div>

      <div style={qrVariantLabelStyle}>{label}</div>

      <div style={qrButtonGridStyle}>
        <a
          href={qrDataUrl ?? "#"}
          download={filename}
          aria-disabled={!qrDataUrl}
          style={{
            ...widePrimaryLinkStyle,
            opacity: qrDataUrl ? 1 : 0.64,
            pointerEvents: qrDataUrl ? "auto" : "none",
          }}
        >
          ⇩ QR-Code als Bild speichern
        </a>

        <button type="button" onClick={handleCopyLink} style={wideSecondaryButtonStyle}>
          {copied ? "✓ Link kopiert" : "Link kopieren"}
        </button>
      </div>
    </>
  );
}

const centerTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 22,
  lineHeight: 1.22,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  textAlign: "center",
};

const mutedCenterTextStyle: CSSProperties = {
  margin: "12px auto 0",
  color: "rgba(255,255,255,0.58)",
  fontSize: 15,
  lineHeight: 1.55,
  textAlign: "center",
  maxWidth: 720,
};

const qrImageWrapStyle: CSSProperties = {
  margin: "24px auto 0",
  width: 280,
  maxWidth: "100%",
  borderRadius: 24,
  padding: 12,
  background: "#ffffff",
  boxShadow: "0 18px 44px rgba(0,0,0,0.22)",
};

const qrImageStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  borderRadius: 16,
};

const qrLoadingStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  display: "grid",
  placeItems: "center",
  color: "#0f172a",
  fontWeight: 800,
  textAlign: "center",
};

const qrVariantLabelStyle: CSSProperties = {
  marginTop: 12,
  color: "#D4AF37",
  fontSize: 16,
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "0.22em",
};

const qrButtonGridStyle: CSSProperties = {
  marginTop: 22,
  display: "grid",
  gap: 12,
};

const widePrimaryLinkStyle: CSSProperties = {
  width: "100%",
  minHeight: 58,
  borderRadius: 18,
  padding: "0 18px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
};

const wideSecondaryButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 56,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "0 18px",
  background: "rgba(255,255,255,0.055)",
  color: "#ffffff",
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 17,
};
