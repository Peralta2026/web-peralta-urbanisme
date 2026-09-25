import { getAllProjects } from "@/lib/projects";
import type { Locale } from "@/lib/types";
import VisualGrid from "@/components/projects/VisualGrid";
import Link from "next/link";

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

      {/* ── Capçalera: nav tipogràfica unificada ── */}
      <div style={{
        padding:        "clamp(36px,5vh,64px) var(--margin-page) 0",
        display:        "flex",
        alignItems:     "flex-end",
        gap:            "clamp(14px,2.2vw,32px)",
        flexWrap:       "wrap",
      }}>
        <Link href={`/${locale}/projectes`} className="pu-dirview-link">ARXIU</Link>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(28px,3.8vw,58px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "#000" }}>VISUAL</span>
        <Link href={`/${locale}/mapa`} className="pu-dirview-link">TERRITORIAL</Link>
        <Link href={`/${locale}/sintetic`} className="pu-dirview-link">SINTÈTIC</Link>
      </div>

      {/* ── Línia separadora ── */}
      <div style={{ margin: "clamp(16px,2.5vh,28px) var(--margin-page) 0", height: "1px", background: "rgba(0,0,0,0.08)" }} />

      {/* ── Malla visual ── */}
      <VisualGrid projects={projects} locale={locale as Locale} />

      <style>{`
        .pu-dirview-link {
          font-family: var(--font-sans);
          font-size: clamp(28px, 3.8vw, 58px);
          font-weight: 300;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #bbb;
          text-decoration: none;
          transition: color 200ms ease;
        }
        .pu-dirview-link:hover { color: #555; }
      `}</style>
    </div>
  );
}
