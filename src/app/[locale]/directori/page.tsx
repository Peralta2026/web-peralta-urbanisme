import { getAllProjects } from "@/lib/projects";
import type { Locale } from "@/lib/types";
import VisualGrid from "@/components/projects/VisualGrid";

export const dynamic = "force-static";

export default async function DirectoriPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();

  return (
    <div style={{ paddingTop: "var(--header-height)", fontFamily: "var(--font-sans)" }}>
      <VisualGrid projects={projects} locale={locale as Locale} />
    </div>
  );
}
