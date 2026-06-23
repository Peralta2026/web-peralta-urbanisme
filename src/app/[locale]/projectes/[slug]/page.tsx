import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { type Locale } from "@/lib/types";
import ImageCarousel from "@/components/projects/ImageCarousel";
import ProjectMeta from "@/components/projects/ProjectMeta";
import Link from "next/link";

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.flatMap((p) =>
    ["ca", "es", "en"].map((locale) => ({ slug: p.slug, locale }))
  );
}

function backHref(locale: Locale): string {
  return locale === "ca" ? "/projectes" : `/${locale}/projectes`;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const data = project[locale as Locale];

  return (
    <div className="pt-12 h-screen flex flex-col">
      {/* Back link */}
      <div className="px-6 py-3 border-b border-black">
        <Link
          href={backHref(locale as Locale)}
          className="text-xs text-gray-500 hover:text-black no-underline"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← Projectes
        </Link>
      </div>

      {/* Diptych: image left + meta right. Mobile: stacked via Tailwind */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: image carousel */}
        <div className="border-r border-black overflow-hidden">
          <ImageCarousel
            slug={project.slug}
            images={project.images}
            title={data.title}
          />
        </div>

        {/* Right: metadata */}
        <div className="overflow-y-auto">
          <ProjectMeta data={data} tags={project.tags} />
        </div>
      </div>
    </div>
  );
}
