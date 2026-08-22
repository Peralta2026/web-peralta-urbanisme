import MetodePage from "@/components/metode/MetodePage";

export const dynamic = "force-static";

export default async function PrincipisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <MetodePage />;
}
