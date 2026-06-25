import { getAllProjects } from "@/lib/projects";
import { type Locale } from "@/lib/types";
import MapContainer from "@/components/map/MapContainer";

export default async function IntervencionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();

  const markers = projects
    .filter((p) => p.coordinates)
    .map((p) => ({
      slug: p.slug,
      lat: p.coordinates.lat,
      lng: p.coordinates.lng,
      title: p[locale as Locale].title,
      municipality: p[locale as Locale].municipality,
      year: p[locale as Locale].year,
      status: p[locale as Locale].status,
      coverImage: p.coverImage,
    }));

  return (
    // fixed inset-0 top-[88px]: ocupa tot el viewport sota la nav fixa (88px d'alt)
    <div className="fixed inset-0 top-[88px]">
      <MapContainer markers={markers} locale={locale} />
    </div>
  );
}
