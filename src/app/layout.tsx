import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/Footer";

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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
        }}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}