import { getAllProjects } from "@/lib/projects";
import { type Locale } from "@/lib/types";
import ProjectGrid from "@/components/projects/ProjectGrid";

export default async function ProjectesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();

  return (
    <div className="pt-12">
      <ProjectGrid projects={projects} locale={locale as Locale} />
    </div>
  );
}
