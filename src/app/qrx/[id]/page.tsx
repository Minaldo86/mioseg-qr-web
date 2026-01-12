// src/app/qrx/[id]/page.tsx
type Props = {
  params: { id: string };
};

export default function QrxPage({ params }: Props) {
  return (
    <main style={{ padding: 40 }}>
      <h1>QR-X PAGE ✅</h1>
      <p>ID: {params.id}</p>
    </main>
  );
}
