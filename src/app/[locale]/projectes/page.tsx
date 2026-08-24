import { getAllProjects } from "@/lib/projects";
import ArchiveList from "@/components/projects/ArchiveList";

export const dynamic = "force-static";

export default async function ProjectesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();
  return <ArchiveList projects={projects} locale={locale} />;
}
