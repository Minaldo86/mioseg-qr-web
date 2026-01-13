type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function QrxPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main style={{ padding: 40 }}>
      <h1>QR-X PAGE ✅</h1>
      <p>ID: {id}</p>
    </main>
  );
}
