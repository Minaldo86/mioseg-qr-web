import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "mioseg qr",
  description: "QR-X Viewer",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "mioseg qr",
    description: "QR-X Viewer",
    images: [
      {
        url: "/og-image-v2.png",
        width: 1200,
        height: 630,
        alt: "mioseg qr",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mioseg qr",
    description: "QR-X Viewer",
    images: ["/og-image-v2.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          backgroundColor: "#ffffff",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <SiteHeader />
        {children}
        <Footer />
      </body>
    </html>
  );
}