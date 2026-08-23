import { getAllProjects } from "@/lib/projects";
import type { Locale, Project } from "@/lib/types";
import VisualGrid from "@/components/projects/VisualGrid";

export const dynamic = "force-static";

const TITLES: Record<string, string> = {
  ca: "Directori visual",
  es: "Directorio visual",
  en: "Visual directory",
};

export default async function DirectoriPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects  = getAllProjects();
  const title     = TITLES[locale] ?? TITLES.ca;

  return (
    <div style={{ paddingTop: "var(--header-height)", fontFamily: "var(--font-sans)" }}>
      {/* ── Capçalera ── */}
      <div style={{ padding: "clamp(36px,5vh,64px) var(--margin-page) 0" }}>
        <h1 style={{
          fontFamily:    "var(--font-sans)",
          fontSize:      "clamp(32px,4vw,60px)",
          fontWeight:    700,
          letterSpacing: "-0.04em",
          lineHeight:    1,
          color:         "#000",
          margin:        0,
        }}>
          {title}
        </h1>
      </div>

      {/* ── Malla visual ── */}
      <VisualGrid projects={projects} locale={locale as Locale} />
    </div>
  );
}
