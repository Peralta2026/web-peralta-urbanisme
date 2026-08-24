import { getAllProjects } from "@/lib/projects";
import type { Locale } from "@/lib/types";
import VisualGrid from "@/components/projects/VisualGrid";
import Link from "next/link";

export const dynamic = "force-static";

const TITLES: Record<string, string> = {
  ca: "Directori visual",
  es: "Directorio visual",
  en: "Visual directory",
};

const NAV: Record<string, { arxiu: string; territorial: string }> = {
  ca: { arxiu: "Arxiu de Projectes →", territorial: "Directori territorial →" },
  es: { arxiu: "Arxiu de Projectes →", territorial: "Directorio territorial →" },
  en: { arxiu: "Project Archive →",    territorial: "Territorial directory →" },
};

export default async function DirectoriPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();
  const title    = TITLES[locale] ?? TITLES.ca;
  const nav      = NAV[locale]    ?? NAV.ca;

  return (
    <div style={{ paddingTop: "var(--header-height)", fontFamily: "var(--font-sans)" }}>

      {/* ── Capçalera: títol (esquerra) · botons nav (dreta) ── */}
      <div style={{
        padding:         "clamp(36px,5vh,64px) var(--margin-page) 0",
        display:         "flex",
        alignItems:      "flex-end",
        justifyContent:  "space-between",
        gap:             "24px",
        flexWrap:        "wrap",
      }}>
        <h1 style={{
          fontFamily:    "var(--font-sans)",
          fontSize:      "clamp(32px,4vw,60px)",
          fontWeight:    700,
          letterSpacing: "-0.04em",
          lineHeight:    1,
          color:         "#000",
          margin:        0,
        }}>
          {title}
        </h1>

        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <Link href={`/${locale}/projectes`} className="pu-dir-btn">
            {nav.arxiu}
          </Link>
          <Link href={`/${locale}/mapa`} className="pu-dir-btn">
            {nav.territorial}
          </Link>
        </div>
      </div>

      {/* ── Línia separadora ── */}
      <div style={{ margin: "clamp(16px,2.5vh,28px) var(--margin-page) 0", height: "1px", background: "rgba(0,0,0,0.08)" }} />

      {/* ── Malla visual ── */}
      <VisualGrid projects={projects} locale={locale as Locale} />

      <style>{`
        .pu-dir-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border: 1px solid #1a1a1a;
          background: transparent;
          transition: background 180ms ease, color 180ms ease;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #000;
          text-decoration: none;
        }
        .pu-dir-btn:hover { background: #000; color: #fff; }
      `}</style>
    </div>
  );
}
