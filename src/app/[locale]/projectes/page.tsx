import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import ArchiveList from "@/components/projects/ArchiveList";

export const dynamic = "force-static";

const TITLES: Record<string, string> = {
  ca: "Arxiu de Projectes",
  es: "Arxiu de Projectes",
  en: "Project Archive",
};

const SUB_NAV: Record<string, { num: string; label: string; desc: string; href: string }[]> = {
  ca: [
    { num: "01", label: "Directori visual", desc: "Tots els projectes en imatge", href: "/directori" },
    { num: "02", label: "Directori territorial", desc: "Explora per territori i localització", href: "/mapa" },
  ],
  es: [
    { num: "01", label: "Directorio visual", desc: "Todos los proyectos en imagen", href: "/directori" },
    { num: "02", label: "Directorio territorial", desc: "Explora por territorio y localización", href: "/mapa" },
  ],
  en: [
    { num: "01", label: "Visual directory", desc: "All projects as images", href: "/directori" },
    { num: "02", label: "Territorial directory", desc: "Explore by territory and location", href: "/mapa" },
  ],
};

export default async function ProjectesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = getAllProjects();
  const title   = TITLES[locale]  ?? TITLES.ca;
  const subNav  = SUB_NAV[locale] ?? SUB_NAV.ca;

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>

      {/* ── Capçalera ── */}
      <div style={{ padding: "clamp(36px,5vh,64px) var(--margin-page) 0" }}>
        <h1 style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(32px,4vw,60px)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "#000",
          margin: 0,
        }}>
          {title}
        </h1>
      </div>

      {/* ── Sub-navegació: Directori visual | Directori territorial ── */}
      <div style={{
        display: "flex",
        gap: "8px",
        margin: "clamp(16px,2.5vh,28px) var(--margin-page) 0",
        flexWrap: "wrap",
      }}>
        {subNav.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className="pu-dir-btn"
            style={{ textDecoration: "none" }}
          >
            <span className="pu-dir-btn-label">{item.label}</span>
            <span className="pu-dir-btn-arrow">→</span>
          </Link>
        ))}
      </div>

      <ArchiveList projects={projects} locale={locale} />

      <style>{`
        .pu-dir-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border: 1px solid #1a1a1a;
          background: transparent;
          transition: background 180ms ease, color 180ms ease;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #000;
        }
        .pu-dir-btn:hover { background: #000; color: #fff; }
        .pu-dir-btn-arrow { font-size: 11px; opacity: 0.6; transition: opacity 180ms; }
        .pu-dir-btn:hover .pu-dir-btn-arrow { opacity: 1; }
      `}</style>
    </div>
  );
}
