import { getAllProjects } from "@/lib/projects";
import { type Locale } from "@/lib/types";
import ProjectDiptych from "@/components/projects/ProjectDiptych";
import Link from "next/link";

export default async function ProjectesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const allProjects = getAllProjects();
  const featured = allProjects.slice(0, 3);

  function dirLink() {
    if (loc === "ca") return "/directori";
    return `/${loc}/directori`;
  }

  return (
    <div className="pt-14">
      {/* 3 featured diptychs */}
      <div>
        {featured.map((project) => (
          <ProjectDiptych key={project.slug} project={project} locale={loc} />
        ))}
      </div>

      {/* "Veure'ls tots" button */}
      <div className="flex justify-center py-16 border-b border-black">
        <Link
          href={dirLink()}
          className="inline-block border border-black px-10 py-3 text-xs uppercase tracking-widest text-black no-underline hover:bg-black hover:text-white transition-colors"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Veure&rsquo;ls tots
        </Link>
      </div>
    </div>
  );
}
