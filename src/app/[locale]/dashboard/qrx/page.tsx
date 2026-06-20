import { redirect } from "next/navigation";

export default async function LocaleQrxRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  redirect(`/qrx/${id}`);
}