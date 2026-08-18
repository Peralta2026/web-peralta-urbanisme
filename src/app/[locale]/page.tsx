import HomeScene from "@/components/home/HomeScene";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <HomeScene locale={locale} />;
}
