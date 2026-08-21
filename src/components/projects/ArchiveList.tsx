"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Project, Locale, TagSlug } from "@/lib/types";
import { ALL_TAGS } from "@/lib/types";

function localizeHref(href: string, locale: string): string {
  return `/${locale}${href}`;
}

/* ─── Tag labels per locale ──────────────────────────────────────────────── */

const TAG_LABELS: Record<Locale, Record<TagSlug, string>> = {
  ca: {
    "residencial":                 "Residencial",
    "transformacio":               "Transformació",
    "extensio":                    "Extensió",
    "regeneracio":                 "Regeneració",
    "activitat-economica":         "Activitat Econòmica",
    "infraestructura-verda":       "Infraestructura Verda",
    "integracio-infraestructures": "Integració Infraestructures",
    "estructura-urbana":           "Estructura Urbana",
    "divulgacio":                  "Divulgació",
    "espai-public":                "Espai Públic",
    "participacio-ciutadana":      "Participació Ciutadana",
    "encaixos-singulars":          "Encaixos Singulars",
  },
  es: {
    "residencial":                 "Residencial",
    "transformacio":               "Transformación",
    "extensio":                    "Extensión",
    "regeneracio":                 "Regeneración",
    "activitat-economica":         "Actividad Económica",
    "infraestructura-verda":       "Infraestructura Verde",
    "integracio-infraestructures": "Integración Infraestructuras",
    "estructura-urbana":           "Estructura Urbana",
    "divulgacio":                  "Divulgación",
    "espai-public":                "Espacio Público",
    "participacio-ciutadana":      "Participación Ciudadana",
    "encaixos-singulars":          "Encajes Singulares",
  },
  en: {
    "residencial":                 "Residential",
    "transformacio":               "Transformation",
    "extensio":                    "Extension",
    "regeneracio":                 "Regeneration",
    "activitat-economica":         "Economic Activity",
    "infraestructura-verda":       "Green Infrastructure",
    "integracio-infraestructures": "Infrastructure Integration",
    "estructura-urbana":           "Urban Structure",
    "divulgacio":                  "Outreach",
    "espai-public":                "Public Space",
    "participacio-ciutadana":      "Citizen Participation",
    "encaixos-singulars":          "Singular Insertions",
  },
};

/* ─── UI labels ──────────────────────────────────────────────────────────── */

interface UiStrings {
  filtra: string;
  tema:   string;
  tipus:  string;
  escala: string;
  clear:  string;
  empty:  string;
  view:   string;
  col:    { project: string; municipality: string; year: string; tipus: string };
  count:  (n: number) => string;
}

const UI: Record<Locale, UiStrings> = {
  ca: {
    filtra: "Filtra per:",
    tema:   "Temàtica",
    tipus:  "Tipus",
    escala: "Escala",
    clear:  "Esborrar",
    empty:  "Cap projecte coincideix amb els filtres seleccionats.",
    view:   "Veure projecte →",
    col:    { project: "Projecte", municipality: "Municipi", year: "Any", tipus: "Tipus" },
    count:  (n) => `${n} projecte${n !== 1 ? "s" : ""}`,
  },
  es: {
    filtra: "Filtrar por:",
    tema:   "Temática",
    tipus:  "Tipo",
    escala: "Escala",
    clear:  "Borrar",
    empty:  "Ningún proyecto coincide con los filtros seleccionados.",
    view:   "Ver proyecto →",
    col:    { project: "Proyecto", municipality: "Municipio", year: "Año", tipus: "Tipo" },
    count:  (n) => `${n} proyecto${n !== 1 ? "s" : ""}`,
  },
  en: {
    filtra: "Filter by:",
    tema:   "Theme",
    tipus:  "Type",
    escala: "Scale",
    clear:  "Clear",
    empty:  "No projects match the selected filters.",
    view:   "View project →",
    col:    { project: "Project", municipality: "Municipality", year: "Year", tipus: "Type" },
    count:  (n) => `${n} project${n !== 1 ? "s" : ""}`,
  },
};

type Dim = "tema" | "tipus" | "escala";

interface Props {
  projects: Project[];
  locale:   string;
}

function ArchiveProjectCard({ project, locale, viewLabel }: { project: Project; locale: Locale; viewLabel: string }) {
  const data = project[locale];
  const image = project.images[0] || project.coverImage;

  return (
    <div className="pu-archive-card">
      <div className="pu-archive-card-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/projects/${project.slug}/${image}`} alt={data.title} loading="lazy" />
      </div>
      <div className="pu-archive-card-divider" />
      <div className="pu-archive-card-copy">
        <h3>{data.title}</h3>
        {project.tags.length > 0 && (
          <p className="pu-archive-card-tags">
            {project.tags.map((tag) => TAG_LABELS[locale][tag]).join(" · ")}
          </p>
        )}
        <p className="pu-archive-card-facts">
          {[data.municipality, data.year, data.status, data.tipus].filter(Boolean).join(" · ")}
        </p>
        <p className="pu-archive-card-description">{data.descriptionShort}</p>
        <Link href={localizeHref(`/projectes/${project.slug}`, locale)}>{viewLabel}</Link>
      </div>
    </div>
  );
}

export default function ArchiveList({ projects, locale }: Props) {
  const loc = locale as Locale;
  const ui  = UI[loc];

  const [activeDim,    setActiveDim]    = useState<Dim | null>(null);
  const [filterTema,   setFilterTema]   = useState<string>("");
  const [filterTipus,  setFilterTipus]  = useState<string>("");
  const [filterEscala, setFilterEscala] = useState<string>("");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  /* Options derived from actual data */
  const temaOptions = ALL_TAGS;
  const tipusOptions = useMemo(() =>
    [...new Set(projects.map(p => p[loc].tipus).filter(Boolean))].sort(),
    [projects, loc]
  );
  const escalaOptions = useMemo(() =>
    [...new Set(projects.map(p => p[loc].status).filter(Boolean))].sort(),
    [projects, loc]
  );

  /* Filtered list */
  const filtered = useMemo(() => projects.filter(p => {
    if (filterTema   && !p.tags.includes(filterTema as TagSlug)) return false;
    if (filterTipus  && p[loc].tipus  !== filterTipus)           return false;
    if (filterEscala && p[loc].status !== filterEscala)          return false;
    return true;
  }), [projects, loc, filterTema, filterTipus, filterEscala]);

  const hasFilters = !!(filterTema || filterTipus || filterEscala);
  const clearAll   = () => { setFilterTema(""); setFilterTipus(""); setFilterEscala(""); };

  /* Dim helpers */
  const toggleDim  = (dim: Dim) => setActiveDim(d => d === dim ? null : dim);

  const getDimValue = (dim: Dim) => {
    if (dim === "tema")   return filterTema  ? TAG_LABELS[loc][filterTema as TagSlug] : "";
    if (dim === "tipus")  return filterTipus;
    return filterEscala;
  };

  const clearDim = (dim: Dim) => {
    if (dim === "tema")   setFilterTema("");
    else if (dim === "tipus")  setFilterTipus("");
    else setFilterEscala("");
  };

  const getOptions = (): { value: string; label: string }[] => {
    if (activeDim === "tema")   return temaOptions.map(t => ({ value: t, label: TAG_LABELS[loc][t] }));
    if (activeDim === "tipus")  return tipusOptions.map(v => ({ value: v, label: v }));
    return escalaOptions.map(v => ({ value: v, label: v }));
  };

  const getActiveFilter = () => {
    if (activeDim === "tema")  return filterTema;
    if (activeDim === "tipus") return filterTipus;
    return filterEscala;
  };

  const setActiveFilter = (value: string) => {
    const current = getActiveFilter();
    const next = value === current ? "" : value;
    if (activeDim === "tema")   setFilterTema(next);
    else if (activeDim === "tipus")  setFilterTipus(next);
    else setFilterEscala(next);
    if (next) setActiveDim(null);
  };

  const dims: { key: Dim; label: string }[] = [
    { key: "tema",   label: ui.tema   },
    { key: "tipus",  label: ui.tipus  },
    { key: "escala", label: ui.escala },
  ];

  return (
    <>
      {/* ── FILTRA PER ──────────────────────────────────────────────── */}
      <div className="pu-filter-box" style={{ borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", background: "#f7f7f5" }}>

        {/* Main bar */}
        <div style={{
          padding: "0 clamp(32px, 5vw, 64px)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(20px, 3.5vw, 48px)",
          minHeight: "76px",
          flexWrap: "wrap",
        }}>

          {/* "Filtra per:" label */}
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            {ui.filtra}
          </span>

          {/* Dimension tabs */}
          {dims.map(({ key, label }) => {
            const val    = getDimValue(key);
            const isOpen = activeDim === key;
            const hasVal = !!val;
            return (
              <button
                key={key}
                onClick={() => toggleDim(key)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: isOpen ? "1.5px solid #000" : "1.5px solid transparent",
                  cursor: "pointer",
                  padding: "4px 0 2px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  letterSpacing: "0.01em",
                  color: (isOpen || hasVal) ? "#000" : "rgba(0,0,0,0.45)",
                  fontWeight: (isOpen || hasVal) ? 650 : 500,
                  transition: "color 160ms, border-color 160ms",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {hasVal ? `${label}: ${val}` : label}
                {hasVal && (
                  <span
                    role="button"
                    onClick={e => { e.stopPropagation(); clearDim(key); if (activeDim === key) setActiveDim(null); }}
                    style={{ fontSize: "15px", lineHeight: 1, opacity: 0.45, marginLeft: "1px", cursor: "pointer" }}
                  >
                    ×
                  </span>
                )}
              </button>
            );
          })}

          {/* Esborrar tot — right edge */}
          {hasFilters && (
            <button
              onClick={clearAll}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#aaa",
                textDecoration: "underline",
                flexShrink: 0,
              }}
            >
              {ui.clear}
            </button>
          )}
        </div>

        {/* Options panel — expands when a dimension is selected */}
        {activeDim && (
          <div style={{
            borderTop: "1px solid rgba(0,0,0,0.07)",
            padding: "clamp(22px, 3vh, 32px) clamp(32px, 5vw, 64px) clamp(28px, 4vh, 44px)",
            display: "flex",
            gap: "clamp(8px, 1.5vw, 16px)",
            flexWrap: "wrap",
            alignItems: "center",
          }}>
            {getOptions().map((opt, i, arr) => {
              const isSelected = getActiveFilter() === opt.value;
              return (
                <span key={opt.value} style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 1.5vw, 16px)" }}>
                  <button
                    onClick={() => setActiveFilter(opt.value)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(16px, 1.7vw, 20px)",
                      letterSpacing: "-0.01em",
                      color: isSelected ? "#000" : "#999",
                      fontWeight: isSelected ? 650 : 450,
                      textDecoration: isSelected ? "underline" : "none",
                      textUnderlineOffset: "3px",
                      transition: "color 150ms, font-weight 150ms",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {opt.label}
                  </button>
                  {i < arr.length - 1 && (
                    <span style={{ color: "rgba(0,0,0,0.2)", fontSize: "11px", userSelect: "none" }}>·</span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Llista de projectes ─────────────────────────────────────── */}
      <div style={{ maxWidth: "1380px", margin: "0 auto", padding: "0 clamp(32px, 5vw, 64px) 88px" }}>
        {filtered.length === 0 ? (
          <div style={{ paddingTop: "64px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "#aaa", letterSpacing: "0.04em" }}>
            {ui.empty}
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="pu-archive-header" style={{ display: "grid", gridTemplateColumns: "1fr 160px 64px 180px 32px", gap: "0 24px", padding: "14px 0", borderBottom: "1px solid #e8e8e8", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" }}>
              <span>{ui.col.project}</span>
              <span className="pu-archive-hide-sm">{ui.col.municipality}</span>
              <span className="pu-archive-hide-sm">{ui.col.year}</span>
              <span className="pu-archive-hide-sm">{ui.col.tipus}</span>
              <span />
            </div>

            {filtered.map(project => {
              const d = project[loc];
              const isExpanded = expandedSlug === project.slug;
              return (
                <div key={project.slug}>
                  <div
                    className={`pu-archive-row ${isExpanded ? "is-expanded" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    style={{ display: "grid", gridTemplateColumns: "1fr 160px 64px 180px 32px", gap: "0 24px", padding: "17px 0", borderBottom: "1px solid #e8e8e8", alignItems: "center", cursor: "pointer", transition: "background 160ms" }}
                    onClick={() => setExpandedSlug(current => current === project.slug ? null : project.slug)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setExpandedSlug(current => current === project.slug ? null : project.slug);
                      }
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: isExpanded ? 650 : 500, color: "#000", letterSpacing: "-0.01em" }}>
                      {d.title}
                    </span>
                    <span className="pu-archive-hide-sm" style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#666" }}>
                      {d.municipality}
                    </span>
                    <span className="pu-archive-hide-sm" style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#666" }}>
                      {d.year}
                    </span>
                    <span className="pu-archive-hide-sm" style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#777" }}>
                      {d.tipus}
                    </span>
                    <Link
                      href={localizeHref(`/projectes/${project.slug}`, locale)}
                      onClick={(event) => event.stopPropagation()}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "17px", color: "#000", textDecoration: "none", textAlign: "center", lineHeight: 1 }}
                      aria-label={`Obrir ${d.title}`}
                    >
                      +
                    </Link>
                  </div>

                  {isExpanded && (
                    <div className="pu-archive-expand">
                      <ArchiveProjectCard project={project} locale={loc} viewLabel={ui.view} />
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ paddingTop: "16px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "#bbb", letterSpacing: "0.08em" }}>
              {ui.count(filtered.length)}
            </div>
          </>
        )}
      </div>

      <style>{`
        .pu-archive-row:hover,
        .pu-archive-row.is-expanded { background: #f7f7f5; }
        .pu-archive-row:focus-visible { outline: 1px solid #111; outline-offset: -1px; }
        .pu-archive-expand {
          padding: 14px 0 24px;
          border-bottom: 1px solid #111;
          animation: pu-archive-open 420ms var(--ease-smooth) both;
          transform-origin: top;
        }
        .pu-archive-card {
          display: flex;
          width: 100%;
          height: clamp(400px, 48vw, 560px);
          overflow: hidden;
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 12px 40px rgba(0,0,0,.08);
        }
        .pu-archive-card-image {
          flex: 0 0 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: clamp(18px, 2.5vw, 32px);
        }
        .pu-archive-card-image img {
          display: block;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .pu-archive-card-divider { width: 1px; flex-shrink: 0; background: rgba(0,0,0,.09); }
        .pu-archive-card-copy {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: clamp(24px, 3vw, 42px);
        }
        .pu-archive-card-copy h3 {
          margin: 0 0 14px;
          color: #000;
          font-family: var(--font-sans);
          font-size: clamp(24px, 2.5vw, 38px);
          font-weight: 700;
          letter-spacing: -.035em;
          line-height: 1.02;
        }
        .pu-archive-card-tags,
        .pu-archive-card-facts {
          margin: 0 0 8px;
          overflow: hidden;
          color: #777;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: .1em;
          line-height: 1.45;
          text-overflow: ellipsis;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .pu-archive-card-tags { color: #333; }
        .pu-archive-card-description {
          max-width: 620px;
          margin: 18px 0 0;
          overflow: hidden;
          color: #555;
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.15vw, 16px);
          line-height: 1.65;
        }
        .pu-archive-card-copy > a {
          align-self: flex-start;
          margin-top: auto;
          padding-bottom: 3px;
          border-bottom: 1px solid #000;
          color: #000;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: .12em;
          text-decoration: none;
          text-transform: uppercase;
        }
        @keyframes pu-archive-open {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .pu-archive-row    { grid-template-columns: 1fr 32px !important; }
          .pu-archive-header { display: none !important; }
          .pu-archive-hide-sm { display: none !important; }
          .pu-filter-box > div:first-child { padding-inline: 20px !important; }
          .pu-archive-card { height: auto; min-height: 0; flex-direction: column; border-radius: 11px; }
          .pu-archive-card-image { flex: none; width: 100%; height: 280px; }
          .pu-archive-card-divider { width: 100%; height: 1px; }
          .pu-archive-card-copy { min-height: 330px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pu-archive-expand { animation: none; }
        }
      `}</style>
    </>
  );
}
