import { getAllProjects } from "@/lib/projects";
import SinteticCardViewer from "@/components/projects/SinteticCardViewer";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return (["ca", "es", "en"] as const).map((locale) => ({ locale }));
}

export default async function SinteticPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const projects = getAllProjects().filter(
    (p) => p.webStatus === "si" || p.webStatus === "relevant"
  );

  return (
    <div style={{ paddingTop: "var(--header-height)" }}>
      <SinteticCardViewer projects={projects} locale={locale} />
    </div>
  );
}
