import { useRouter } from "next/router";

export default function QrxPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return <p style={{ padding: 40 }}>Lade QR-X…</p>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>QR-X PAGE ✅</h1>
      <p>ID: {id}</p>
    </main>
  );
}
