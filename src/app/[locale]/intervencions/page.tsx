import { getAllProjects } from "@/lib/projects";
import { getTranslations } from "next-intl/server";
import { type Locale } from "@/lib/types";
import MapContainer from "@/components/map/MapContainer";

export default async function IntervencionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();
  const t = await getTranslations({ locale, namespace: "interventions" });

  const markers = projects
    .filter((p) => p.coordinates)
    .map((p) => ({
      slug: p.slug,
      lat: p.coordinates.lat,
      lng: p.coordinates.lng,
      title: p[locale as Locale].title,
      municipality: p[locale as Locale].municipality,
      year: p[locale as Locale].year,
    }));

  return (
    <div className="pt-12 h-screen">
      <MapContainer markers={markers} locale={locale} />
    </div>
  );
}
