import PersonesPage from "../persones/page";

export const dynamic = "force-static";

export default async function EquipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return PersonesPage({ params });
}
