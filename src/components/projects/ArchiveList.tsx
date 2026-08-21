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
    col:    { project: "Project", municipality: "Municipality", year: "Year", tipus: "Type" },
    count:  (n) => `${n} project${n !== 1 ? "s" : ""}`,
  },
};

type Dim = "tema" | "tipus" | "escala";

interface Props {
  projects: Project[];
  locale:   string;
}

export default function ArchiveList({ projects, locale }: Props) {
  const loc = locale as Locale;
  const ui  = UI[loc];

  const [activeDim,    setActiveDim]    = useState<Dim | null>(null);
  const [filterTema,   setFilterTema]   = useState<string>("");
  const [filterTipus,  setFilterTipus]  = useState<string>("");
  const [filterEscala, setFilterEscala] = useState<string>("");

  /* Options derived from actual data */
  const temaOptions  = useMemo(() =>
    ALL_TAGS.filter(t => projects.some(p => p.tags.includes(t))),
    [projects]
  );
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
      <div style={{ borderBottom: "1px solid #1a1a1a" }}>

        {/* Main bar */}
        <div style={{
          padding: "0 clamp(32px, 5vw, 64px)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(20px, 3.5vw, 48px)",
          minHeight: "60px",
          flexWrap: "wrap",
        }}>

          {/* "Filtra per:" label */}
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.18em",
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
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: (isOpen || hasVal) ? "#000" : "rgba(0,0,0,0.45)",
                  fontWeight: (isOpen || hasVal) ? 700 : 400,
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
            padding: "clamp(16px, 2.5vh, 24px) clamp(32px, 5vw, 64px)",
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
                      fontSize: "clamp(14px, 1.6vw, 18px)",
                      letterSpacing: "-0.01em",
                      color: isSelected ? "#000" : "#999",
                      fontWeight: isSelected ? 700 : 400,
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
              return (
                <div
                  key={project.slug}
                  className="pu-archive-row"
                  style={{ display: "grid", gridTemplateColumns: "1fr 160px 64px 180px 32px", gap: "0 24px", padding: "16px 0", borderBottom: "1px solid #e8e8e8", alignItems: "center", cursor: "pointer", transition: "background 120ms" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f7f6f3")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: 500, color: "#000", letterSpacing: "-0.01em" }}>
                    {d.title}
                  </span>
                  <span className="pu-archive-hide-sm" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#666", letterSpacing: "0.02em" }}>
                    {d.municipality}
                  </span>
                  <span className="pu-archive-hide-sm" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#666" }}>
                    {d.year}
                  </span>
                  <span className="pu-archive-hide-sm" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#888", letterSpacing: "0.02em" }}>
                    {d.tipus}
                  </span>
                  <Link
                    href={localizeHref(`/projectes/${project.slug}`, locale)}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: "#000", textDecoration: "none", textAlign: "center", lineHeight: 1 }}
                    aria-label={`Obrir ${d.title}`}
                  >
                    +
                  </Link>
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
        @media (max-width: 640px) {
          .pu-archive-row    { grid-template-columns: 1fr 32px !important; }
          .pu-archive-header { display: none !important; }
          .pu-archive-hide-sm { display: none !important; }
        }
      `}</style>
    </>
  );
}
