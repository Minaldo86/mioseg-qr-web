export default async function QrxPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main style={{ padding: 40 }}>
      <h1>QR-X PAGE ✅</h1>
      <p>ID: {id}</p>
    </main>
  );
}
