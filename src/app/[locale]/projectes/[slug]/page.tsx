import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { type Locale, type TagSlug } from "@/lib/types";
import Link from "next/link";
import ProjectGallery from "@/components/projects/ProjectGallery";

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
  facts: Record<string, string>;
}> = {
  ca: {
    back: "← Tornar als projectes",
    prev: "← Projecte anterior",
    next: "Projecte següent →",
    allProjects: "Tornar a projectes",
    facts: {
      tipus: "Tipus", municipi: "Municipi", any: "Any", estat: "Estat",
      programa: "Programa", ambit: "Àmbit", sostre: "Sostre", habitatges: "Habitatges", premi: "Premi",
    },
  },
  es: {
    back: "← Volver a proyectos",
    prev: "← Proyecto anterior",
    next: "Proyecto siguiente →",
    allProjects: "Volver a proyectos",
    facts: {
      tipus: "Tipo", municipi: "Municipio", any: "Año", estat: "Estado",
      programa: "Programa", ambit: "Ámbito", sostre: "Techo", habitatges: "Viviendas", premi: "Premio",
    },
  },
  en: {
    back: "← Back to projects",
    prev: "← Previous project",
    next: "Next project →",
    allProjects: "Back to projects",
    facts: {
      tipus: "Type", municipi: "Municipality", any: "Year", estat: "Status",
      programa: "Programme", ambit: "Scope", sostre: "Built", habitatges: "Dwellings", premi: "Prize",
    },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function projectHref(slug: string, locale: Locale) {
  return locale === "ca" ? `/projectes/${slug}` : `/${locale}/projectes/${slug}`;
}

function backHref(locale: Locale) {
  return locale === "ca" ? "/projectes" : `/${locale}/projectes`;
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.flatMap((p) =>
    (["ca", "es", "en"] as const).map((locale) => ({ slug: p.slug, locale }))
  );
}

// ─── Pàgina ───────────────────────────────────────────────────────────────────

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
  const indexLabel = `${String(projectIndex + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;

  const data = project[loc];
  const ui = UI[loc];
  const tagLabels = TAG_LABELS[loc];
  const f = ui.facts;

  // Dades tècniques — mostra només les que tenen valor
  const facts: { label: string; value: string }[] = [
    data.tipus       && { label: f.tipus,     value: data.tipus },
    data.municipality && { label: f.municipi,  value: data.municipality },
    data.year        && { label: f.any,       value: data.year },
    data.status      && { label: f.estat,     value: data.status },
    data.programa    && { label: f.programa,  value: data.programa },
    data.ambitM2     && { label: f.ambit,     value: `${data.ambitM2.toLocaleString("ca")} m²` },
    data.sostreM2    && { label: f.sostre,    value: `${data.sostreM2.toLocaleString("ca")} m²` },
    data.habitatges  && { label: f.habitatges,value: String(data.habitatges) },
    data.premi       && { label: f.premi,     value: data.premi! },
  ].filter(Boolean) as { label: string; value: string }[];

  // Paràgrafs del text llarg
  const paragraphs = (data.descriptionLong || data.descriptionShort)
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    /*
     * Fons gris lleuger + lámina blanca central
     * El nav és fix i blanc (88px), per això paddingTop: "88px"
     */
    <div
      style={{
        background: "#e8e7e1",
        minHeight: "100vh",
        paddingTop: "88px",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingBottom: "96px",
      }}
    >
      {/* ── Lámina blanca ── */}
      <div
        style={{
          maxWidth: "1480px",
          margin: "20px auto 0",
          background: "#fff",
          padding: "32px 36px 72px",
        }}
      >

        {/* ════════════════════════════════════════════════════════════════════
            HERO EDITORIAL — retícula de 12 columnes
            ════════════════════════════════════════════════════════════════════ */}
        <div
          className="block md:grid"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            columnGap: "28px",
            rowGap: "48px",
            borderTop: "1px solid #9a9a9a",
            paddingTop: "32px",
            marginBottom: "36px",
          }}
        >
          {/* ── Columna esquerra: índex + tornada + tags ── */}
          <div
            style={{
              gridColumn: "1 / 3",
              gridRow: "1 / 3",
              display: "flex",
              flexDirection: "column",
            }}
            className="mb-12 md:mb-0"
          >
            {/* Número de projecte */}
            <div
              style={{
                fontSize: "clamp(44px, 4.5vw, 76px)",
                lineHeight: 1,
                fontWeight: 300,
                letterSpacing: "-0.06em",
                color: "#c9c9c9",
                fontFamily: "var(--font-sans)",
                marginBottom: "28px",
              }}
            >
              {indexLabel}
            </div>

            {/* Tornada */}
            <Link
              href={backHref(loc)}
              style={{
                display: "inline-block",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                borderBottom: "1px solid currentColor",
                paddingBottom: "2px",
                color: "#111",
                fontFamily: "var(--font-sans)",
              }}
            >
              {ui.back}
            </Link>

            {/* Tags — al fons de la columna */}
            <div style={{ marginTop: "auto", paddingTop: "56px" }}>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "block",
                    fontSize: "12px",
                    lineHeight: 1.5,
                    color: "#888",
                    marginBottom: "6px",
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {tagLabels[tag]}
                </span>
              ))}
            </div>
          </div>

          {/* ── Zona central: kicker + títol ── */}
          <div
            style={{
              gridColumn: "4 / 9",
              gridRow: "1 / 2",
              alignSelf: "start",
            }}
            className="mb-10 md:mb-0"
          >
            {/* Kicker/metadata */}
            <p
              style={{
                fontSize: "12px",
                lineHeight: 1.2,
                fontWeight: 650,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#777",
                marginBottom: "20px",
                fontFamily: "var(--font-sans)",
              }}
            >
              {[data.tipus, data.municipality, data.year].filter(Boolean).join(" · ")}
            </p>

            {/* Títol */}
            <h1
              style={{
                fontSize: "clamp(44px, 5.2vw, 82px)",
                lineHeight: 0.92,
                fontWeight: 800,
                letterSpacing: "-0.07em",
                color: "#000",
                margin: 0,
                fontFamily: "var(--font-sans)",
              }}
            >
              {data.title}
            </h1>
          </div>

          {/* ── Zona dreta: dades tècniques ── */}
          <dl
            style={{
              gridColumn: "9 / 13",
              gridRow: "1 / 2",
              alignSelf: "start",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: "24px",
              rowGap: "22px",
              margin: 0,
            }}
            className="mb-10 md:mb-0"
          >
            {facts.map(({ label, value }) => (
              <div key={label}>
                <dt
                  style={{
                    fontSize: "11px",
                    lineHeight: 1.2,
                    fontWeight: 650,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#8a8a8a",
                    marginBottom: "5px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {label}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: 1.3,
                    fontWeight: 400,
                    color: "#111",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* ── Zona inferior central: text introductori ── */}
          <div
            style={{
              gridColumn: "4 / 10",
              gridRow: "2 / 3",
              alignSelf: "start",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.45,
                letterSpacing: "-0.015em",
                color: "#111",
                margin: 0,
                fontFamily: "var(--font-sans)",
                maxWidth: "640px",
              }}
            >
              {data.descriptionShort}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            GALERIA D'IMATGES
            ════════════════════════════════════════════════════════════════════ */}
        <ProjectGallery
          slug={project.slug}
          images={project.images}
          title={data.title}
        />

        {/* ════════════════════════════════════════════════════════════════════
            COS LLARG — tags esquerra + text central
            ════════════════════════════════════════════════════════════════════ */}
        <div
          className="block lg:grid"
          style={{
            gridTemplateColumns: "220px minmax(0, 720px) 1fr",
            columnGap: "72px",
            borderTop: "1px solid #9a9a9a",
            paddingTop: "44px",
            marginBottom: "96px",
          }}
        >
          {/* Columna tags */}
          <div className="mb-12 lg:mb-0">
            <p
              style={{
                fontSize: "11px",
                fontWeight: 650,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8a8a8a",
                marginBottom: "16px",
                fontFamily: "var(--font-sans)",
              }}
            >
              {loc === "ca" ? "Temes" : loc === "es" ? "Temas" : "Topics"}
            </p>
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "block",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  color: "#777",
                  marginBottom: "7px",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {tagLabels[tag]}
              </span>
            ))}
          </div>

          {/* Columna text llarg */}
          <div>
            {paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: "18px",
                  lineHeight: 1.58,
                  letterSpacing: "-0.015em",
                  color: "#111",
                  margin: "0 0 24px 0",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            NAVEGACIÓ INFERIOR
            ════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            borderTop: "1px solid #9a9a9a",
            paddingTop: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "24px",
            fontFamily: "var(--font-sans)",
          }}
        >
          <div style={{ flex: 1 }}>
            {prevProject && (
              <Link
                href={projectHref(prevProject.slug, loc)}
                style={{
                  fontSize: "14px",
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
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              color: "#777",
              textAlign: "center",
            }}
          >
            {ui.allProjects}
          </Link>

          <div style={{ flex: 1, textAlign: "right" }}>
            {nextProject && (
              <Link
                href={projectHref(nextProject.slug, loc)}
                style={{
                  fontSize: "14px",
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

      </div>
    </div>
  );
}
