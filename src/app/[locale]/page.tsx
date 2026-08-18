import { getAllProjects } from "@/lib/projects";
import { type Locale } from "@/lib/types";
import HomeScene from "@/components/home/HomeScene";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  void locale;
  void getAllProjects; // available for Phase 3 (project explorer)

  return <HomeScene />;
}
