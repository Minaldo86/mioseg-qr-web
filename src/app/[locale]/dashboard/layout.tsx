import type { ReactNode } from "react";
import TermsReconsentGate from "./TermsReconsentGate";
import DashboardLanguageSwitcher from "./DashboardLanguageSwitcher";

type Props = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || "de";

  return (
    <TermsReconsentGate locale={locale}>
      {children}
      <DashboardLanguageSwitcher currentLocale={locale} />
    </TermsReconsentGate>
  );
}
