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

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>

      {/* ── Capçalera ── */}
      <div style={{ maxWidth: "1380px", margin: "0 auto", padding: "48px 32px 36px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "32px" }}>
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: "12px" }}>
            Arxiu
          </p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#000", margin: 0 }}>
            {projects.length} Projectes
          </h1>
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", lineHeight: 1.5, color: "#666", maxWidth: "480px", margin: 0 }}>
          Treballs de planejament, estratègia urbana i transformació territorial.
        </p>
      </div>

      <ArchiveList projects={projects} locale={locale} />
    </div>
  );
}
