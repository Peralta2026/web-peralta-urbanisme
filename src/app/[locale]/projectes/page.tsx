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
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        margin: "clamp(24px,3.5vh,44px) var(--margin-page) 0",
        borderTop: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a",
      }}>
        {subNav.map((item, i) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className="pu-dir-card"
            style={{
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "clamp(22px,3vh,36px) clamp(20px,3vw,40px) clamp(22px,3vh,36px) 0",
              borderRight: i === 0 ? "1px solid #1a1a1a" : "none",
              paddingLeft: i === 1 ? "clamp(20px,3vw,40px)" : 0,
            }}
          >
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#bbb",
            }}>
              {item.num}
            </span>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(18px,2vw,28px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#000",
            }}>
              {item.label}
            </span>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              color: "#888",
              lineHeight: 1.45,
            }}>
              {item.desc}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "#000",
              marginTop: "4px",
            }}>
              →
            </span>
          </Link>
        ))}
      </div>

      <ArchiveList projects={projects} locale={locale} />

      <style>{`
        .pu-dir-card { transition: background 200ms ease; }
        .pu-dir-card:hover { background: #f8f8f6; }
        @media (max-width: 600px) {
          .pu-dir-card { padding-left: 0 !important; padding-right: 0 !important; }
        }
      `}</style>
    </div>
  );
}
