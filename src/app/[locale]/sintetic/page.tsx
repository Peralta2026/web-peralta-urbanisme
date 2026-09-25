import { getAllProjects } from "@/lib/projects";
import type { Locale } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

const FIELD_LABELS = {
  ca: { municipi: "Municipi", any: "Any", tipus: "Tipus", ambit: "Àmbit", sostre: "Sostre", habitatges: "Habitatges", view: "Veure projecte →" },
  es: { municipi: "Municipio", any: "Año", tipus: "Tipo", ambit: "Ámbito", sostre: "Sostre", habitatges: "Habitatges", view: "Ver proyecto →" },
  en: { municipi: "Municipality", any: "Year", tipus: "Type", ambit: "Scope", sostre: "Floor area", habitatges: "Units", view: "View project →" },
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
  const fl = FIELD_LABELS[locale as keyof typeof FIELD_LABELS] ?? FIELD_LABELS.ca;

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
        <span className="pu-dirview-active">SINTÈTIC</span>
      </div>

      {/* ── Línia separadora ── */}
      <div style={{ margin: "clamp(16px,2.5vh,28px) var(--margin-page) 0", height: "1px", background: "rgba(0,0,0,0.08)" }} />

      {/* ── Llista de tarjetes horitzontals ── */}
      <div className="pu-sintetic-list">
        {projects.map((project) => {
          const d   = project[loc];
          const img = project.coverImage
            ? `/projects/${project.slug}/${project.coverImage}`
            : null;

          const dataRows = [
            d.municipality && { label: fl.municipi,    value: d.municipality },
            d.year         && { label: fl.any,          value: d.year },
            d.tipus        && { label: fl.tipus,         value: d.tipus },
            d.ambitM2      && { label: fl.ambit,         value: `${d.ambitM2.toLocaleString("ca-ES")} m²` },
            d.sostreM2     && { label: fl.sostre,        value: `${d.sostreM2.toLocaleString("ca-ES")} m²st` },
            d.habitatges   && { label: fl.habitatges,    value: String(d.habitatges) },
          ].filter(Boolean) as { label: string; value: string }[];

          return (
            <Link
              key={project.slug}
              href={`/${locale}/projectes/${project.slug}`}
              className="pu-sintetic-card"
            >
              {/* Imatge esquerra */}
              <div className="pu-sintetic-card-img">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={d.title} loading="lazy" />
                ) : (
                  <div className="pu-sintetic-card-placeholder" />
                )}
              </div>

              {/* Divisor */}
              <div className="pu-sintetic-card-divider" />

              {/* Contingut dret */}
              <div className="pu-sintetic-card-content">
                <div className="pu-sintetic-card-top">
                  <h2 className="pu-sintetic-card-title">{d.title}</h2>
                  {d.subtitle && (
                    <p className="pu-sintetic-card-subtitle">{d.subtitle}</p>
                  )}
                  {dataRows.length > 0 && (
                    <div className="pu-sintetic-card-data">
                      {dataRows.map((r) => (
                        <div key={r.label} className="pu-sintetic-card-row">
                          <span className="pu-sintetic-card-label">{r.label}</span>
                          <span className="pu-sintetic-card-value">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="pu-sintetic-card-cta">{fl.view}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .pu-dirview-link {
          font-family: var(--font-sans);
          font-size: clamp(32px, 4vw, 60px);
          font-weight: 300;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #bbb;
          text-decoration: none;
          transition: color 200ms ease;
        }
        .pu-dirview-link:hover { color: #555; }
        .pu-dirview-active {
          font-family: var(--font-sans);
          font-size: clamp(32px, 4vw, 60px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #000;
        }

        .pu-sintetic-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: rgba(0,0,0,0.07);
          margin: clamp(24px,3.5vh,40px) var(--margin-page) 80px;
          border: 1px solid rgba(0,0,0,0.07);
        }

        .pu-sintetic-card {
          display: flex;
          height: clamp(240px, 28vh, 340px);
          background: #fff;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: background 200ms ease, box-shadow 200ms ease;
        }
        .pu-sintetic-card:hover {
          background: #f9f9f8;
          box-shadow: 0 4px 32px rgba(0,0,0,0.08);
        }

        .pu-sintetic-card-img {
          flex: 0 0 50%;
          overflow: hidden;
          background: #f0f0ee;
          position: relative;
        }
        .pu-sintetic-card-img img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 500ms cubic-bezier(0.22,1,0.36,1);
          user-select: none;
        }
        .pu-sintetic-card:hover .pu-sintetic-card-img img {
          transform: scale(1.04);
        }
        .pu-sintetic-card-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e8e6;
        }

        .pu-sintetic-card-divider {
          width: 1px;
          background: rgba(0,0,0,0.08);
          flex-shrink: 0;
          align-self: stretch;
        }

        .pu-sintetic-card-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(22px,3.5vh,40px) clamp(22px,2.8vw,40px);
          overflow: hidden;
        }

        .pu-sintetic-card-top {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .pu-sintetic-card-title {
          font-family: var(--font-sans);
          font-size: clamp(18px,2vw,30px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.05;
          color: #000;
          margin: 0 0 clamp(10px,1.5vh,18px);
        }

        .pu-sintetic-card-subtitle {
          font-family: var(--font-sans);
          font-size: clamp(11px,0.95vw,13px);
          font-style: italic;
          font-weight: 400;
          color: #666;
          margin: 0 0 clamp(14px,2vh,22px);
          line-height: 1.35;
          letter-spacing: -0.01em;
        }

        .pu-sintetic-card-data {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .pu-sintetic-card-row {
          display: flex;
          gap: 14px;
          align-items: baseline;
        }
        .pu-sintetic-card-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #aaa;
          min-width: 90px;
          flex-shrink: 0;
        }
        .pu-sintetic-card-value {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #111;
          font-variant-numeric: tabular-nums;
        }

        .pu-sintetic-card-cta {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #000;
          border-bottom: 1.5px solid #000;
          padding-bottom: 3px;
          align-self: flex-start;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .pu-sintetic-card { height: auto; flex-direction: column; }
          .pu-sintetic-card-img { flex: none; height: 260px; }
          .pu-sintetic-card-divider { display: none; }
        }
        @media (max-width: 480px) {
          .pu-sintetic-card-img { height: 200px; }
          .pu-sintetic-list { margin: 20px 0 60px; border-left: none; border-right: none; }
        }
      `}</style>
    </div>
  );
}
