export default function QrxPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main style={{ padding: 40 }}>
      <h1>QR-X PAGE ✅</h1>
      <p>ID: {params.id}</p>
    </main>
  );
}
