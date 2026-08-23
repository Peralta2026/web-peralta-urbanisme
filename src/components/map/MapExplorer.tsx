"use client";

import { useMemo, useState } from "react";
import type { Locale, Project, TagSlug } from "@/lib/types";
import { ALL_TAGS } from "@/lib/types";
import MapView from "./MapView";

type Dimension = "theme" | "type" | "scale";

const PAGE_TITLES: Record<Locale, string> = {
  ca: "Directori territorial",
  es: "Directori territorial",
  en: "Territorial directory",
};

const LABELS: Record<Locale, {
  filtra: string; theme: string; type: string; scale: string; clear: string; noThemes: string;
}> = {
  ca: { filtra: "Filtra per:", theme: "Temàtica", type: "Tipus", scale: "Escala", clear: "Esborrar", noThemes: "Temàtiques pendents d'assignar" },
  es: { filtra: "Filtrar por:", theme: "Temática", type: "Tipo", scale: "Escala", clear: "Borrar", noThemes: "Temáticas pendientes de asignar" },
  en: { filtra: "Filter by:", theme: "Theme", type: "Type", scale: "Scale", clear: "Clear", noThemes: "Themes pending assignment" },
};

const TAG_LABELS: Record<Locale, Record<TagSlug, string>> = {
  ca: { residencial: "Residencial", transformacio: "Transformació", extensio: "Extensió", regeneracio: "Regeneració", "activitat-economica": "Activitat Econòmica", "infraestructura-verda": "Infraestructura Verda", "integracio-infraestructures": "Integració Infraestructures", "estructura-urbana": "Estructura Urbana", divulgacio: "Divulgació", "espai-public": "Espai Públic", "participacio-ciutadana": "Participació Ciutadana", "encaixos-singulars": "Encaixos Singulars" },
  es: { residencial: "Residencial", transformacio: "Transformación", extensio: "Extensión", regeneracio: "Regeneración", "activitat-economica": "Actividad Económica", "infraestructura-verda": "Infraestructura Verde", "integracio-infraestructures": "Integración Infraestructuras", "estructura-urbana": "Estructura Urbana", divulgacio: "Divulgación", "espai-public": "Espacio Público", "participacio-ciutadana": "Participación Ciudadana", "encaixos-singulars": "Encajes Singulares" },
  en: { residencial: "Residential", transformacio: "Transformation", extensio: "Extension", regeneracio: "Regeneration", "activitat-economica": "Economic Activity", "infraestructura-verda": "Green Infrastructure", "integracio-infraestructures": "Infrastructure Integration", "estructura-urbana": "Urban Structure", divulgacio: "Outreach", "espai-public": "Public Space", "participacio-ciutadana": "Citizen Participation", "encaixos-singulars": "Singular Insertions" },
};

const TIPUS_COLORS: Record<string, string> = {
  "Estudi":               "#F9EE76",
  "Planejament general":  "#B4EFC5",
  "Planejament derivat":  "#A8DEF5",
  "Altres":               "#F5C0DA",
};

export default function MapExplorer({ projects, locale }: { projects: Project[]; locale: string }) {
  const loc = locale as Locale;
  const ui    = LABELS[loc]      ?? LABELS.ca;
  const title = PAGE_TITLES[loc] ?? PAGE_TITLES.ca;

  const [activeDim, setActiveDim] = useState<Dimension | null>(null);
  const [theme, setTheme] = useState("");
  const [type,  setType]  = useState("");
  const [scale, setScale] = useState("");

  const locatedProjects = useMemo(
    () => projects.filter(({ coordinates }) => coordinates.lat !== 0 && coordinates.lng !== 0),
    [projects]
  );
  const themeOptions = ALL_TAGS;
  const typeOptions  = useMemo(
    () => [...new Set(locatedProjects.map((p) => p[loc].tipus).filter(Boolean))].sort(),
    [locatedProjects, loc]
  );
  const scaleOptions = useMemo(
    () => [...new Set(locatedProjects.map((p) => p[loc].status).filter(Boolean))].sort(),
    [locatedProjects, loc]
  );

  const visibleProjects = useMemo(() => locatedProjects.filter((p) => {
    if (theme && !p.tags.includes(theme as TagSlug)) return false;
    if (type  && p[loc].tipus  !== type)             return false;
    if (scale && p[loc].status !== scale)             return false;
    return true;
  }), [locatedProjects, loc, theme, type, scale]);

  const hasFilters = !!(theme || type || scale);
  const clearAll   = () => { setTheme(""); setType(""); setScale(""); setActiveDim(null); };
  const toggleDim  = (dim: Dimension) => setActiveDim((d) => d === dim ? null : dim);

  const getDimValue = (dim: Dimension) => {
    if (dim === "theme") return theme ? TAG_LABELS[loc][theme as TagSlug] : "";
    if (dim === "type")  return type;
    return scale;
  };
  const clearDim = (dim: Dimension) => {
    if (dim === "theme") setTheme("");
    else if (dim === "type") setType("");
    else setScale("");
  };
  const getOptions = (): { value: string; label: string }[] => {
    if (activeDim === "theme") return themeOptions.map((t) => ({ value: t, label: TAG_LABELS[loc][t] }));
    if (activeDim === "type")  return typeOptions.map((v)  => ({ value: v, label: v }));
    return scaleOptions.map((v) => ({ value: v, label: v }));
  };
  const getActiveFilter = () => {
    if (activeDim === "theme") return theme;
    if (activeDim === "type")  return type;
    return scale;
  };
  const setActiveFilter = (value: string) => {
    const current = getActiveFilter();
    const next = value === current ? "" : value;
    if (activeDim === "theme") setTheme(next);
    else if (activeDim === "type") setType(next);
    else setScale(next);
    if (next) setActiveDim(null);
  };

  const dims: { key: Dimension; label: string }[] = [
    { key: "theme", label: ui.theme },
    { key: "type",  label: ui.type  },
    { key: "scale", label: ui.scale },
  ];

  return (
    <div className="pu-map-explorer">

      {/* ── Títol pàgina ──────────────────────────────────────────────── */}
      <div style={{ padding: "clamp(36px,5vh,64px) var(--margin-page) 0", flexShrink: 0 }}>
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
      </div>

      {/* ── Barra de filtres ──────────────────────────────────────────── */}
      <div className="pu-map-toolbar">

        {/* Main bar */}
        <div style={{
          padding:    "0 var(--margin-page)",
          display:    "flex",
          alignItems: "center",
          gap:        "clamp(20px, 3.5vw, 48px)",
          minHeight:  "76px",
          flexWrap:   "wrap",
        }}>
          <span style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color:         "rgba(0,0,0,0.35)",
            whiteSpace:    "nowrap",
            flexShrink:    0,
          }}>
            {ui.filtra}
          </span>

          {dims.map(({ key, label }) => {
            const val      = getDimValue(key);
            const isOpen   = activeDim === key;
            const hasVal   = !!val;
            const chipColor = key === "type" && hasVal ? TIPUS_COLORS[val] : undefined;

            return hasVal ? (
              <span key={key} style={{ display: "inline-flex", alignItems: "center" }}>
                <button
                  onClick={() => toggleDim(key)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding:      "5px 8px 5px 12px",
                    borderRadius: "100px 0 0 100px",
                    border:       "1px solid #1a1a1a",
                    borderRight:  "none",
                    background:   chipColor ?? "#111",
                    color:        chipColor ? "#111" : "#fff",
                    fontFamily:   "var(--font-mono)",
                    fontSize:     "9px",
                    letterSpacing:"0.10em",
                    textTransform:"uppercase",
                    fontWeight:   500,
                    cursor:       "pointer",
                    whiteSpace:   "nowrap",
                    transition:   "opacity 150ms",
                  }}
                >
                  {chipColor && (
                    <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#111", flexShrink: 0 }} />
                  )}
                  {val}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); clearDim(key); if (activeDim === key) setActiveDim(null); }}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding:      "5px 10px 5px 8px",
                    borderRadius: "0 100px 100px 0",
                    border:       "1px solid #1a1a1a",
                    borderLeft:   "none",
                    background:   chipColor ?? "#111",
                    color:        chipColor ? "#111" : "#fff",
                    fontFamily:   "var(--font-mono)",
                    fontSize:     "14px",
                    lineHeight:   1,
                    cursor:       "pointer",
                    transition:   "opacity 150ms",
                  }}
                  aria-label={`Esborrar ${label}`}
                >
                  ×
                </button>
              </span>
            ) : (
              <button
                key={key}
                onClick={() => toggleDim(key)}
                style={{
                  background:    "none",
                  border:        "none",
                  borderBottom:  isOpen ? "1px solid #000" : "1px solid transparent",
                  cursor:        "pointer",
                  padding:       "4px 0 3px",
                  fontFamily:    "var(--font-mono)",
                  fontSize:      "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color:         isOpen ? "#000" : "rgba(0,0,0,0.40)",
                  fontWeight:    isOpen ? 600 : 400,
                  transition:    "color 160ms, border-color 160ms",
                  whiteSpace:    "nowrap",
                  flexShrink:    0,
                }}
              >
                {label}
              </button>
            );
          })}

          {hasFilters && (
            <button
              onClick={clearAll}
              style={{
                marginLeft:    "auto",
                background:    "none",
                border:        "none",
                cursor:        "pointer",
                fontFamily:    "var(--font-mono)",
                fontSize:      "9px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         "#aaa",
                textDecoration:"underline",
                flexShrink:    0,
              }}
            >
              {ui.clear}
            </button>
          )}
        </div>

        {/* Options panel */}
        {activeDim && (
          <div style={{
            borderTop: "1px solid rgba(0,0,0,0.07)",
            padding:   "clamp(20px, 2.5vh, 28px) var(--margin-page) clamp(22px, 3vh, 36px)",
            display:   "flex",
            gap:       "6px 0",
            flexWrap:  "wrap",
            alignItems:"center",
          }}>
            {getOptions().length === 0 ? (
              <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                {ui.noThemes}
              </span>
            ) : getOptions().map((opt, i, arr) => {
              const isSelected = getActiveFilter() === opt.value;
              const swatch     = activeDim === "type" ? TIPUS_COLORS[opt.value] : undefined;
              return (
                <span key={opt.value} style={{ display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() => setActiveFilter(opt.value)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      background: "none",
                      border:     "none",
                      cursor:     "pointer",
                      padding:    "6px 0",
                      fontFamily: "var(--font-sans)",
                      fontSize:   "clamp(15px, 1.6vw, 20px)",
                      letterSpacing: "-0.01em",
                      color:      isSelected ? "#000" : "#999",
                      fontWeight: isSelected ? 650 : 400,
                      transition: "color 150ms",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {swatch && (
                      <span style={{
                        display:      "inline-block",
                        width:        "10px",
                        height:       "10px",
                        borderRadius: "50%",
                        background:   swatch,
                        border:       isSelected ? "1.5px solid #111" : "1.5px solid transparent",
                        flexShrink:   0,
                        transition:   "border-color 150ms",
                      }} />
                    )}
                    {opt.label}
                    {isSelected && <span style={{ fontSize: "12px", opacity: 0.5, marginLeft: "1px" }}>✓</span>}
                  </button>
                  {i < arr.length - 1 && (
                    <span style={{ color: "rgba(0,0,0,0.15)", fontSize: "10px", userSelect: "none", padding: "0 clamp(12px, 1.8vw, 24px)" }}>·</span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Mapa ──────────────────────────────────────────────────────── */}
      <div className="pu-map-canvas">
        <MapView projects={visibleProjects} locale={locale} />
      </div>

      <style>{`
        .pu-map-explorer {
          height: 100svh;
          padding-top: var(--header-height);
          display: flex;
          flex-direction: column;
          background: #fff;
          overflow: hidden;
        }
        .pu-map-toolbar {
          flex: 0 0 auto;
          border-top: 1px solid rgba(0,0,0,0.10);
          border-bottom: 1px solid rgba(0,0,0,0.10);
          background: #fff;
          margin-top: clamp(24px, 3.5vh, 44px);
        }
        .pu-map-canvas {
          min-height: 0;
          flex: 1;
          position: relative;
          z-index: 1;
          isolation: isolate;
        }
        @media (max-width: 768px) {
          .pu-map-toolbar { margin-top: 20px; }
        }
      `}</style>
    </div>
  );
}
