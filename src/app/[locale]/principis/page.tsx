import MetodePage from "@/components/metode/MetodePage";

export const dynamic = "force-static";

export default async function PrincipisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <MetodePage locale={locale} />;
}
