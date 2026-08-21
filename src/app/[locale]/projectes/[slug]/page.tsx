import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { type Locale, type TagSlug } from "@/lib/types";
import Link from "next/link";
import ProjectEditorialGallery from "@/components/projects/ProjectEditorialGallery";
import { getProjectImages } from "@/lib/project-images";

// ─── Etiquetes per idioma ─────────────────────────────────────────────────────

const TAG_LABELS: Record<Locale, Record<TagSlug, string>> = {
  ca: {
    "residencial": "Residencial",
    "transformacio": "Transformació",
    "extensio": "Extensió",
    "regeneracio": "Regeneració",
    "activitat-economica": "Activitat econòmica",
    "infraestructura-verda": "Infraestructura verda",
    "integracio-infraestructures": "Integració d'infraestructures",
    "estructura-urbana": "Estructura urbana",
    "divulgacio": "Divulgació",
    "espai-public": "Espai públic",
    "participacio-ciutadana": "Participació ciutadana",
    "encaixos-singulars": "Encaixos singulars",
  },
  es: {
    "residencial": "Residencial",
    "transformacio": "Transformación",
    "extensio": "Extensión",
    "regeneracio": "Regeneración",
    "activitat-economica": "Actividad económica",
    "infraestructura-verda": "Infraestructura verde",
    "integracio-infraestructures": "Integración de infraestructuras",
    "estructura-urbana": "Estructura urbana",
    "divulgacio": "Divulgación",
    "espai-public": "Espacio público",
    "participacio-ciutadana": "Participación ciudadana",
    "encaixos-singulars": "Encajes singulares",
  },
  en: {
    "residencial": "Residential",
    "transformacio": "Transformation",
    "extensio": "Extension",
    "regeneracio": "Regeneration",
    "activitat-economica": "Economic activity",
    "infraestructura-verda": "Green infrastructure",
    "integracio-infraestructures": "Infrastructure integration",
    "estructura-urbana": "Urban structure",
    "divulgacio": "Outreach",
    "espai-public": "Public space",
    "participacio-ciutadana": "Civic participation",
    "encaixos-singulars": "Singular insertions",
  },
};

const UI: Record<Locale, {
  back: string;
  prev: string;
  next: string;
  allProjects: string;
  topics: string;
  facts: Record<string, string>;
}> = {
  ca: {
    back: "← Tornar als projectes",
    prev: "← Anterior",
    next: "Següent →",
    allProjects: "Tots els projectes",
    topics: "Temes",
    facts: {
      tipus: "Tipus", municipi: "Municipi", any: "Any", estat: "Estat",
      programa: "Programa", ambit: "Àmbit", sostre: "Sostre", habitatges: "Habitatges", premi: "Premi",
    },
  },
  es: {
    back: "← Volver a proyectos",
    prev: "← Anterior",
    next: "Siguiente →",
    allProjects: "Todos los proyectos",
    topics: "Temas",
    facts: {
      tipus: "Tipo", municipi: "Municipio", any: "Año", estat: "Estado",
      programa: "Programa", ambit: "Ámbito", sostre: "Techo", habitatges: "Viviendas", premi: "Premio",
    },
  },
  en: {
    back: "← Back to projects",
    prev: "← Previous",
    next: "Next →",
    allProjects: "All projects",
    topics: "Topics",
    facts: {
      tipus: "Type", municipi: "Municipality", any: "Year", estat: "Status",
      programa: "Programme", ambit: "Scope", sostre: "Built", habitatges: "Dwellings", premi: "Prize",
    },
  },
};

function projectHref(slug: string, locale: Locale) {
  return `/${locale}/projectes/${slug}`;
}

function backHref(locale: Locale) {
  return `/${locale}/projectes`;
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.flatMap((p) =>
    (["ca", "es", "en"] as const).map((locale) => ({ slug: p.slug, locale }))
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const loc = locale as Locale;

  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const allProjects = getAllProjects();
  const projectIndex = allProjects.findIndex((p) => p.slug === slug);
  const total = allProjects.length;
  const prevProject = projectIndex > 0 ? allProjects[projectIndex - 1] : null;
  const nextProject = projectIndex < total - 1 ? allProjects[projectIndex + 1] : null;

  const data = project[loc];
  const galleryImages = await getProjectImages(project.slug, project.images);
  const ui = UI[loc];
  const tagLabels = TAG_LABELS[loc];
  const f = ui.facts;

  // Dades tècniques (nomes camps amb valor)
  const facts: { label: string; value: string }[] = [
    data.tipus       && { label: f.tipus,      value: data.tipus },
    data.municipality && { label: f.municipi,   value: data.municipality },
    data.year        && { label: f.any,        value: data.year },
    data.status      && { label: f.estat,      value: data.status },
    data.programa    && { label: f.programa,   value: data.programa },
    data.ambitM2     && { label: f.ambit,      value: `${data.ambitM2.toLocaleString("ca")} m²` },
    data.sostreM2    && { label: f.sostre,     value: `${data.sostreM2.toLocaleString("ca")} m²` },
    data.habitatges  && { label: f.habitatges, value: String(data.habitatges) },
    data.premi       && { label: f.premi,      value: data.premi! },
  ].filter(Boolean) as { label: string; value: string }[];

  // Paràgrafs del text llarg
  const paragraphs = (data.descriptionLong || data.descriptionShort)
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  // ── Estils reutilitzables ──
  const sans = "var(--font-sans)";
  const borderLine = "1px solid #e0e0e0";

  return (
    <div style={{ background: "#fff", minHeight: "100vh", paddingTop: "88px" }}>
      <div
        className="project-detail-shell"
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 48px 96px",
        }}
      >
        <div className="project-detail-content">

        {/* ════════════════════════════════════════════════════════════════════
            BANDA CAPÇALERA — tornada esquerra · dades tècniques dreta
            ════════════════════════════════════════════════════════════════════ */}
        <div
          className="project-detail-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "24px 0 22px",
            borderBottom: borderLine,
            marginBottom: "56px",
            gap: "32px",
          }}
        >
          {/* Tornada */}
          <Link
            href={backHref(loc)}
            style={{
              fontFamily: sans,
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              color: "#111",
              borderBottom: "1px solid currentColor",
              paddingBottom: "2px",
              flexShrink: 0,
            }}
          >
            {ui.back}
          </Link>

        </div>

        {/* ════════════════════════════════════════════════════════════════════
            TÍTOL + DESCRIPCIÓ — 2 columnes iguals
            ════════════════════════════════════════════════════════════════════ */}
        <div
          className="project-detail-intro"
          style={{
            gridTemplateColumns: "1fr 1fr",
            columnGap: "64px",
            marginBottom: "56px",
            alignItems: "start",
          }}
        >
          {/* Títol — esquerra, gran, pes 800 */}
          <h1
            style={{
              fontFamily: sans,
              fontSize: "clamp(32px, 3.6vw, 58px)",
              lineHeight: 0.93,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color: "#000",
              margin: "0 0 32px 0",
            }}
          >
            {data.title}
          </h1>

          {/* Dades tècniques — immediatament sota el títol */}
          <dl
            className="project-detail-facts"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 32px",
              margin: "0 0 32px",
              paddingBottom: "32px",
              borderBottom: borderLine,
              justifyContent: "flex-start",
            }}
          >
            {facts.map(({ label, value }) => (
              <div key={label} style={{ minWidth: "80px" }}>
                <dt
                  style={{
                    fontFamily: sans,
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#aaa",
                    marginBottom: "3px",
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </dt>
                <dd
                  style={{
                    fontFamily: sans,
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#111",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Descripció curta — dreta, text de lectura */}
          <p
            style={{
              fontFamily: sans,
              fontSize: "17px",
              lineHeight: 1.54,
              letterSpacing: "-0.01em",
              color: "#333",
              margin: "0 0 32px 0",
              paddingTop: "6px",
            }}
          >
            {data.descriptionShort}
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            COS LLARG — tags esquerra · text central
            ════════════════════════════════════════════════════════════════════ */}
        <div
          className="project-detail-copy"
          style={{
            gridTemplateColumns: "180px minmax(0, 700px)",
            columnGap: "64px",
            borderTop: borderLine,
            paddingTop: "48px",
            marginBottom: "80px",
          }}
        >
          {/* Tags */}
          <div className="mb-10 lg:mb-0">
            <p
              style={{
                fontFamily: sans,
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: "14px",
                lineHeight: 1.2,
              }}
            >
              {ui.topics}
            </p>
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "block",
                  fontFamily: sans,
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "#666",
                  marginBottom: "4px",
                }}
              >
                {tagLabels[tag]}
              </span>
            ))}
          </div>

          {/* Text llarg */}
          <div>
            {paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: sans,
                  fontSize: "17px",
                  lineHeight: 1.62,
                  letterSpacing: "-0.012em",
                  color: "#111",
                  margin: "0 0 22px 0",
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
        </div>

        {/* Galeria editorial — columna independent */}
        <div className="project-detail-gallery">
          <ProjectEditorialGallery
            slug={project.slug}
            images={galleryImages}
            title={data.title}
          />
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            NAVEGACIÓ INFERIOR
            ════════════════════════════════════════════════════════════════════ */}
        <div
          className="project-detail-navigation"
          style={{
            borderTop: borderLine,
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "24px",
          }}
        >
          <div style={{ flex: 1 }}>
            {prevProject && (
              <Link
                href={projectHref(prevProject.slug, loc)}
                style={{
                  fontFamily: sans,
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "#111",
                  borderBottom: "1px solid currentColor",
                  paddingBottom: "2px",
                }}
              >
                {ui.prev}
              </Link>
            )}
          </div>

          <Link
            href={backHref(loc)}
            style={{
              fontFamily: sans,
              fontSize: "12px",
              fontWeight: 500,
              textDecoration: "none",
              color: "#aaa",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {ui.allProjects}
          </Link>

          <div style={{ flex: 1, textAlign: "right" }}>
            {nextProject && (
              <Link
                href={projectHref(nextProject.slug, loc)}
                style={{
                  fontFamily: sans,
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "#111",
                  borderBottom: "1px solid currentColor",
                  paddingBottom: "2px",
                }}
              >
                {ui.next}
              </Link>
            )}
          </div>
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .project-detail-shell {
              display: grid;
              grid-template-columns: minmax(280px, .72fr) minmax(0, 1.55fr);
              grid-template-rows: auto auto;
              column-gap: clamp(48px, 5vw, 88px);
              align-items: start;
            }
            .project-detail-content {
              grid-column: 1;
              grid-row: 1;
              display: flex;
              flex-direction: column;
            }
            .project-detail-header {
              display: contents !important;
            }
            .project-detail-header > a {
              order: 1;
              align-self: flex-start;
              margin: 24px 0 56px;
            }
            .project-detail-intro {
              order: 2;
              display: block !important;
              margin-bottom: 28px !important;
            }
            .project-detail-intro h1 {
              font-size: clamp(38px, 3.5vw, 62px) !important;
              line-height: .95 !important;
            }
            .project-detail-gallery {
              grid-column: 2;
              grid-row: 1;
            }
            .project-detail-copy {
              order: 4;
              display: block !important;
              margin-bottom: 64px !important;
            }
            .project-detail-copy > div:first-child:not(:has(span)) {
              display: none;
            }
            .project-detail-copy > div:first-child {
              margin-bottom: 36px;
            }
            .project-detail-copy p {
              font-size: 15px !important;
              line-height: 1.58 !important;
            }
            .project-detail-navigation {
              grid-column: 1 / -1;
              grid-row: 2;
              margin-top: 24px;
            }
          }
          @media (max-width: 1023px) {
            .project-detail-intro { display: block !important; }
            .project-detail-copy { display: block !important; }
          }
          @media (max-width: 720px) {
            .project-detail-shell { padding: 0 16px 64px !important; }
            .project-detail-header { margin-bottom: 36px !important; }
          }
        `}</style>

      </div>
    </div>
  );
}
