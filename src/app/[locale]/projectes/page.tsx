import { getAllProjects } from "@/lib/projects";
import { type Locale } from "@/lib/types";
import ProjectDiptych from "@/components/projects/ProjectDiptych";

export default async function ProjectesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();

  return (
    /* pt-[72px] = nav height. px-16 = 64px lateral margin. gap-6 between projects */
    <div
      style={{
        paddingTop: "72px",
      }}
    >
      <div
        style={{
          paddingLeft: "64px",
          paddingRight: "64px",
          paddingTop: "40px",
          paddingBottom: "64px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {projects.map((project) => (
          <ProjectDiptych
            key={project.slug}
            project={project}
            locale={locale as Locale}
          />
        ))}
      </div>
    </div>
  );
}
