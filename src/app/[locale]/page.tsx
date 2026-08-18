import HomeScene from "@/components/home/HomeScene";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  void params;
  return <HomeScene />;
}
