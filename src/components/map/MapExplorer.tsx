"use client";

import { useMemo, useState } from "react";
import type { Locale, Project, TagSlug } from "@/lib/types";
import { ALL_TAGS } from "@/lib/types";
import MapView from "./MapView";

type Dimension = "theme" | "type" | "scale";

const LABELS: Record<Locale, { title: string; locations: (count: number) => string; filterBy: string; theme: string; type: string; scale: string; clear: string; noThemes: string }> = {
  ca: { title: "Mapa de projectes", locations: (n) => `${n} ubicacion${n === 1 ? "" : "s"}`, filterBy: "Filtra per:", theme: "Temàtica", type: "Tipus", scale: "Escala", clear: "Esborrar", noThemes: "Temàtiques pendents d'assignar" },
  es: { title: "Mapa de proyectos", locations: (n) => `${n} ubicacion${n === 1 ? "" : "es"}`, filterBy: "Filtrar por:", theme: "Temática", type: "Tipo", scale: "Escala", clear: "Borrar", noThemes: "Temáticas pendientes de asignar" },
  en: { title: "Project map", locations: (n) => `${n} location${n === 1 ? "" : "s"}`, filterBy: "Filter by:", theme: "Theme", type: "Type", scale: "Scale", clear: "Clear", noThemes: "Themes pending assignment" },
};

const TAG_LABELS: Record<Locale, Record<TagSlug, string>> = {
  ca: { residencial: "Residencial", transformacio: "Transformació", extensio: "Extensió", regeneracio: "Regeneració", "activitat-economica": "Activitat Econòmica", "infraestructura-verda": "Infraestructura Verda", "integracio-infraestructures": "Integració Infraestructures", "estructura-urbana": "Estructura Urbana", divulgacio: "Divulgació", "espai-public": "Espai Públic", "participacio-ciutadana": "Participació Ciutadana", "encaixos-singulars": "Encaixos Singulars" },
  es: { residencial: "Residencial", transformacio: "Transformación", extensio: "Extensión", regeneracio: "Regeneración", "activitat-economica": "Actividad Económica", "infraestructura-verda": "Infraestructura Verde", "integracio-infraestructures": "Integración Infraestructuras", "estructura-urbana": "Estructura Urbana", divulgacio: "Divulgación", "espai-public": "Espacio Público", "participacio-ciutadana": "Participación Ciudadana", "encaixos-singulars": "Encajes Singulares" },
  en: { residencial: "Residential", transformacio: "Transformation", extensio: "Extension", regeneracio: "Regeneration", "activitat-economica": "Economic Activity", "infraestructura-verda": "Green Infrastructure", "integracio-infraestructures": "Infrastructure Integration", "estructura-urbana": "Urban Structure", divulgacio: "Outreach", "espai-public": "Public Space", "participacio-ciutadana": "Citizen Participation", "encaixos-singulars": "Singular Insertions" },
};

export default function MapExplorer({ projects, locale }: { projects: Project[]; locale: string }) {
  const loc = locale as Locale;
  const ui = LABELS[loc] ?? LABELS.ca;
  const [openDimension, setOpenDimension] = useState<Dimension | null>(null);
  const [theme, setTheme] = useState("");
  const [type, setType] = useState("");
  const [scale, setScale] = useState("");

  const locatedProjects = useMemo(() => projects.filter(({ coordinates }) => coordinates.lat !== 0 && coordinates.lng !== 0), [projects]);
  const themeOptions = ALL_TAGS;
  const typeOptions = useMemo(() => [...new Set(locatedProjects.map((project) => project[loc].tipus).filter(Boolean))].sort(), [locatedProjects, loc]);
  const scaleOptions = useMemo(() => [...new Set(locatedProjects.map((project) => project[loc].status).filter(Boolean))].sort(), [locatedProjects, loc]);
  const visibleProjects = useMemo(() => locatedProjects.filter((project) => {
    if (theme && !project.tags.includes(theme as TagSlug)) return false;
    if (type && project[loc].tipus !== type) return false;
    if (scale && project[loc].status !== scale) return false;
    return true;
  }), [locatedProjects, loc, theme, type, scale]);

  const dimensions: { key: Dimension; label: string; value: string }[] = [
    { key: "theme", label: ui.theme, value: theme ? TAG_LABELS[loc][theme as TagSlug] : "" },
    { key: "type", label: ui.type, value: type },
    { key: "scale", label: ui.scale, value: scale },
  ];
  const options = openDimension === "theme" ? themeOptions.map((value) => ({ value, label: TAG_LABELS[loc][value] })) : openDimension === "type" ? typeOptions.map((value) => ({ value, label: value })) : scaleOptions.map((value) => ({ value, label: value }));
  const currentValue = openDimension === "theme" ? theme : openDimension === "type" ? type : scale;
  const setValue = (dimension: Dimension, value: string) => {
    if (dimension === "theme") setTheme(value);
    if (dimension === "type") setType(value);
    if (dimension === "scale") setScale(value);
  };
  const clearAll = () => { setTheme(""); setType(""); setScale(""); setOpenDimension(null); };

  return (
    <div className="pu-map-explorer">
      <div className="pu-map-toolbar">
        <div className="pu-map-heading"><strong>{ui.title}</strong><span>{ui.locations(visibleProjects.length)}</span></div>
        <div className="pu-map-filters">
          <span className="pu-filter-label">{ui.filterBy}</span>
          {dimensions.map(({ key, label, value }) => (
            <button key={key} type="button" className={openDimension === key || value ? "is-active" : ""} onClick={() => setOpenDimension((current) => current === key ? null : key)}>
              {value ? `${label}: ${value}` : label}
              {value && <span role="button" aria-label={`${ui.clear} ${label}`} onClick={(event) => { event.stopPropagation(); setValue(key, ""); }}>×</span>}
            </button>
          ))}
          {(theme || type || scale) && <button type="button" className="pu-clear-filters" onClick={clearAll}>{ui.clear}</button>}
        </div>
        {openDimension && (
          <div className="pu-map-options">
            {options.length === 0 ? <span>{ui.noThemes}</span> : options.map((option) => (
              <button type="button" key={option.value} className={currentValue === option.value ? "is-selected" : ""} onClick={() => { setValue(openDimension, currentValue === option.value ? "" : option.value); setOpenDimension(null); }}>{option.label}</button>
            ))}
          </div>
        )}
      </div>
      <div className="pu-map-canvas"><MapView projects={visibleProjects} locale={locale} /></div>
      <style>{`
        .pu-map-explorer { height: 100svh; padding-top: var(--header-height); display: flex; flex-direction: column; background: #fff; }
        .pu-map-toolbar { flex: 0 0 auto; border-bottom: 1px solid var(--color-border); background: #fff; z-index: 2; }
        .pu-map-heading { min-height: 48px; padding: 0 var(--margin-page); display: flex; align-items: center; gap: 32px; border-bottom: 1px solid var(--color-border-soft); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: .12em; font-size: var(--size-label); }
        .pu-map-heading span { color: var(--color-muted); font-weight: 400; }
        .pu-map-filters { min-height: 54px; padding: 0 var(--margin-page); display: flex; align-items: center; gap: clamp(18px, 3vw, 42px); overflow-x: auto; font-family: var(--font-mono); }
        .pu-filter-label { color: var(--color-muted); font-size: var(--size-label); letter-spacing: .16em; text-transform: uppercase; white-space: nowrap; }
        .pu-map-filters button { border: 0; border-bottom: 1px solid transparent; padding: 4px 0 2px; background: none; color: var(--color-muted); font-family: inherit; font-size: var(--size-label); letter-spacing: .14em; text-transform: uppercase; white-space: nowrap; cursor: pointer; }
        .pu-map-filters button.is-active { color: var(--color-fg); border-bottom-color: var(--color-fg); font-weight: 700; }
        .pu-map-filters button span { margin-left: 6px; font-size: 15px; line-height: 0; }
        .pu-map-filters .pu-clear-filters { margin-left: auto; color: var(--color-gray-mid); text-decoration: underline; }
        .pu-map-options { min-height: 52px; padding: 12px var(--margin-page); display: flex; align-items: center; flex-wrap: wrap; gap: 10px 24px; border-top: 1px solid var(--color-border-soft); font-family: var(--font-sans); }
        .pu-map-options > span { color: var(--color-gray-mid); font-size: 13px; }
        .pu-map-options button { border: 0; padding: 0; background: none; color: var(--color-muted); font: inherit; font-size: 15px; cursor: pointer; }
        .pu-map-options button.is-selected { color: var(--color-fg); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
        .pu-map-canvas { min-height: 0; flex: 1; position: relative; }
        @media (max-width: 768px) { .pu-map-heading { min-height: 42px; } .pu-map-filters { gap: 20px; min-height: 50px; } .pu-filter-label { display: none; } }
      `}</style>
    </div>
  );
}
