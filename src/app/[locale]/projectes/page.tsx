import { getAllProjects } from "@/lib/projects";
import { type Locale } from "@/lib/types";
import ProjectCard from "@/components/projects/ProjectCard";

export default async function ProjectesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>

      {/* ── Intro ── */}
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "56px 40px 36px",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <p
          style={{
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "18px",
            color: "#000",
          }}
        >
          Projectes
        </p>
        <p
          style={{
            maxWidth: "620px",
            fontSize: "22px",
            lineHeight: 1.25,
            fontWeight: 400,
            color: "#000",
          }}
        >
          Una selecció de treballs de planejament, estratègia urbana i
          transformació territorial.
        </p>
      </div>

      {/* ── Llista de projectes ── */}
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "40px 40px 96px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale as Locale}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
