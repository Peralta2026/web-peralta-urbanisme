import { getAllProjects } from "@/lib/projects";
import MapView from "@/components/map/MapView";

export const dynamic = "force-static";

export default async function MapaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100svh", paddingTop: "88px" }}>

      {/* ── Capçalera ── */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "0 32px", display: "flex", alignItems: "center", gap: "40px", height: "52px", flexShrink: 0 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#000", margin: 0, fontWeight: 600 }}>
          Mapa de projectes
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em", color: "#aaa", margin: 0 }}>
          {projects.filter(p => p.coordinates.lat !== 0 || p.coordinates.lng !== 0).length} ubicacions
        </p>
      </div>

      {/* ── Mapa ── */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapView projects={projects} locale={locale} />
      </div>
    </div>
  );
}
