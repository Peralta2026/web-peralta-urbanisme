import { getAllProjects } from "@/lib/projects";
import { type Locale } from "@/lib/types";
import ProjectGrid from "@/components/projects/ProjectGrid";

export default async function DirectoriPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();

  return (
    <div className="pt-14">
      <div className="px-6 py-8 border-b border-black">
        <h1
          className="text-xs uppercase tracking-widest text-gray-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Directori de projectes
        </h1>
      </div>
      <ProjectGrid projects={projects} locale={locale as Locale} />
    </div>
  );
}
