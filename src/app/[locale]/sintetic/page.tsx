import { getAllProjects } from "@/lib/projects";
import type { Locale } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

const FIELD_LABELS: Record<string, { municipi: string; any: string; tipus: string; ambit: string }> = {
  ca: { municipi: "Municipi", any: "Any", tipus: "Tipus", ambit: "Àmbit" },
  es: { municipi: "Municipio", any: "Año", tipus: "Tipo", ambit: "Ámbito" },
  en: { municipi: "Municipality", any: "Year", tipus: "Type", ambit: "Scope" },
};

const VIEW_LABEL: Record<string, string> = {
  ca: "Veure projecte →",
  es: "Ver proyecto →",
  en: "View project →",
};

export async function generateStaticParams() {
  return (["ca", "es", "en"] as const).map((locale) => ({ locale }));
}

export default async function SinteticPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const fl = FIELD_LABELS[locale] ?? FIELD_LABELS.ca;
  const viewLabel = VIEW_LABEL[locale] ?? VIEW_LABEL.ca;

  const projects = getAllProjects().filter(
    (p) => p.webStatus === "si" || p.webStatus === "relevant"
  );

  return (
    <div style={{ paddingTop: "var(--header-height)", fontFamily: "var(--font-sans)" }}>

      {/* ── Capçalera: nav tipogràfica unificada ── */}
      <div style={{
        padding:    "clamp(36px,5vh,64px) var(--margin-page) 0",
        display:    "flex",
        alignItems: "flex-end",
        gap:        "clamp(14px,2.2vw,32px)",
        flexWrap:   "wrap",
      }}>
        <Link href={`/${locale}/projectes`} className="pu-dirview-link">ARXIU</Link>
        <Link href={`/${locale}/directori`} className="pu-dirview-link">VISUAL</Link>
        <Link href={`/${locale}/mapa`} className="pu-dirview-link">TERRITORIAL</Link>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(28px,3.8vw,58px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "#000" }}>SINTÈTIC</span>
      </div>

      {/* ── Línia separadora ── */}
      <div style={{ margin: "clamp(16px,2.5vh,28px) var(--margin-page) 0", height: "1px", background: "rgba(0,0,0,0.08)" }} />

      {/* ── Grid de tarjetes ── */}
      <div className="pu-sintetic-grid">
        {projects.map((project) => {
          const data = project[loc];
          const dataItems = [
            data.municipality && { label: fl.municipi, value: data.municipality },
            data.year         && { label: fl.any,      value: data.year },
            data.tipus        && { label: fl.tipus,     value: data.tipus },
            data.ambitM2      && { label: fl.ambit,     value: `${data.ambitM2.toLocaleString("ca-ES")} m²` },
          ].filter(Boolean) as { label: string; value: string }[];

          return (
            <Link
              key={project.slug}
              href={`/${locale}/projectes/${project.slug}`}
              className="pu-sintetic-card"
            >
              {project.coverImage && (
                <div className="pu-sintetic-card-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/projects/${project.slug}/${project.coverImage}`}
                    alt={data.title}
                    loading="lazy"
                  />
                </div>
              )}
              <div className="pu-sintetic-card-body">
                <div>
                  <h2 className="pu-sintetic-card-title">{data.title}</h2>
                  {data.subtitle && (
                    <p className="pu-sintetic-card-subtitle">{data.subtitle}</p>
                  )}
                  {dataItems.length > 0 && (
                    <div className="pu-sintetic-card-data">
                      {dataItems.map((item) => (
                        <div key={item.label} className="pu-sintetic-card-row">
                          <span className="pu-sintetic-card-label">{item.label}</span>
                          <span className="pu-sintetic-card-value">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="pu-sintetic-card-cta">{viewLabel}</span>
              </div>
            </Link>
          );
        })}
      </div>

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

        .pu-sintetic-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(0,0,0,0.09);
          margin: 0 var(--margin-page) 80px;
          border: 1px solid rgba(0,0,0,0.09);
        }
        .pu-sintetic-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: #fff;
          transition: background 200ms ease;
        }
        .pu-sintetic-card:hover { background: #f8f8f7; }
        .pu-sintetic-card-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #f0f0ee;
        }
        .pu-sintetic-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 400ms cubic-bezier(0.22,1,0.36,1);
        }
        .pu-sintetic-card:hover .pu-sintetic-card-img img {
          transform: scale(1.04);
        }
        .pu-sintetic-card-body {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          padding: clamp(18px, 2vw, 28px);
          gap: 20px;
        }
        .pu-sintetic-card-title {
          font-family: var(--font-sans);
          font-size: clamp(18px, 1.8vw, 26px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: #000;
          margin: 0 0 8px 0;
        }
        .pu-sintetic-card-subtitle {
          font-family: var(--font-sans);
          font-size: clamp(11px, 0.9vw, 13px);
          font-style: italic;
          font-weight: 400;
          color: #666;
          margin: 0 0 16px 0;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }
        .pu-sintetic-card-data {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pu-sintetic-card-row {
          display: flex;
          gap: 12px;
          align-items: baseline;
        }
        .pu-sintetic-card-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #aaa;
          min-width: 72px;
          flex-shrink: 0;
        }
        .pu-sintetic-card-value {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #333;
          font-variant-numeric: tabular-nums;
        }
        .pu-sintetic-card-cta {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000;
          border-bottom: 1.5px solid #000;
          padding-bottom: 2px;
          align-self: flex-start;
        }
        @media (max-width: 1024px) {
          .pu-sintetic-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .pu-sintetic-grid { grid-template-columns: 1fr; margin: 0 0 60px; }
        }
      `}</style>
    </div>
  );
}
