import { getAllProjects } from "@/lib/projects";
import { type Locale } from "@/lib/types";
import HomeProjects from "@/components/home/HomeProjects";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();

  return <HomeProjects projects={projects} locale={locale as Locale} />;
}
