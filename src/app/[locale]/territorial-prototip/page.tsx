import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import TerritorialPrototype from "@/components/map/TerritorialPrototype";

export const dynamic = "force-static";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TerritorialPrototipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const located = getAllProjects().filter((p) => p.webStatus !== "no" && p.coordinates.lat !== 0 && p.coordinates.lng !== 0);
  const municipalities = new Set(located.map((p) => p.ca.municipality.split(/[(,]/)[0].trim())).size;
  return <TerritorialPrototype locale={locale} projects={located.length} municipalities={municipalities} />;
}
