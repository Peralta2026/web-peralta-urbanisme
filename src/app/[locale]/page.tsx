import HomeScene from "@/components/home/HomeScene";
import { getAllProjects } from "@/lib/projects";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();
  return <HomeScene locale={locale} projects={projects} />;
}
