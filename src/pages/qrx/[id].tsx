import { useRouter } from "next/router";

export default function QrxPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return null;

  return (
    <main style={{ padding: 24 }}>
      <h1>QR-X Route funktioniert ✅</h1>
      <p>ID: {id}</p>
    </main>
  );
}
