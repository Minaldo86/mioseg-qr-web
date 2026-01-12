import "./globals.css";
export const dynamic = "force-dynamic";


export const metadata = {
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
      <body>{children}</body>
    </html>
  );
}
