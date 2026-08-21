import { getAllProjects } from "@/lib/projects";
import MapExplorer from "@/components/map/MapExplorer";

export const dynamic = "force-static";

export default async function MapaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();

  return <MapExplorer projects={projects} locale={locale} />;
}
