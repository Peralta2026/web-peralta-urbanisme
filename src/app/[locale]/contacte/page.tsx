import { getTranslations } from "next-intl/server";

export default async function ContactePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="pt-12 px-6 py-16 max-w-2xl">
      <h1 className="text-2xl font-bold mb-12">{t("title")}</h1>
      <div className="space-y-4 text-sm">
        <p>
          <a
            href="mailto:info@peraltaurbanisme.cat"
            className="text-black no-underline hover:underline"
          >
            info@peraltaurbanisme.cat
          </a>
        </p>
        <p>
          <a
            href="https://instagram.com/peraltaurbanisme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black no-underline hover:underline"
          >
            @peraltaurbanisme
          </a>
        </p>
      </div>
    </div>
  );
}
