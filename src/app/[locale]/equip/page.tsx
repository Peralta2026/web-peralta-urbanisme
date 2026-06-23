import { getAllTeamMembers } from "@/lib/team";
import { type Locale } from "@/lib/types";
import { getTranslations } from "next-intl/server";

export default async function EquipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const members = getAllTeamMembers();
  const t = await getTranslations({ locale, namespace: "team" });

  return (
    <div className="pt-12 px-6 py-16 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-16">{t("title")}</h1>
      {members.length === 0 ? (
        <p className="text-gray-400 text-sm">—</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {members.map((member) => {
            const data = member[locale as Locale];
            return (
              <div key={member.slug} className="flex gap-6">
                <div className="w-32 h-32 flex-shrink-0 overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/team/${member.photo}`}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-sm">{data.name}</p>
                  <p
                    className="text-xs text-gray-500 mb-3"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {data.role}
                  </p>
                  <p className="text-sm leading-relaxed">{data.bioShort}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
