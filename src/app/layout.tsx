import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "mioseg qr",
  description: "QR-X Viewer",
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