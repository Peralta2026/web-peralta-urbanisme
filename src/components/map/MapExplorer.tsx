"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale, Project, TagSlug } from "@/lib/types";
import { ALL_TAGS } from "@/lib/types";
import MapView from "./MapView";

const PAGE_TITLES: Record<Locale, string> = {
  ca: "Directori territorial",
  es: "Directori territorial",
  en: "Territorial directory",
};

const NAV: Record<Locale, { visual: string; arxiu: string }> = {
  ca: { visual: "Directori visual →",   arxiu: "Arxiu de Projectes →" },
  es: { visual: "Directorio visual →",  arxiu: "Arxiu de Projectes →" },
  en: { visual: "Visual directory →",   arxiu: "Project Archive →"    },
};

const SECTION_LABELS: Record<Locale, { tematica: string; tipus: string; escala: string; clear: string }> = {
  ca: { tematica: "Temàtica", tipus: "Tipus", escala: "Escala", clear: "Netejar" },
  es: { tematica: "Temática", tipus: "Tipo",  escala: "Escala", clear: "Borrar"  },
  en: { tematica: "Theme",    tipus: "Type",  escala: "Scale",  clear: "Clear"   },
};

const TAG_LABELS: Record<Locale, Record<TagSlug, string>> = {
  ca: { residencial: "Residencial", transformacio: "Transformació", extensio: "Extensió", regeneracio: "Regeneració", "activitat-economica": "Activitat Econòmica", "infraestructura-verda": "Infraestructura Verda", "integracio-infraestructures": "Integració Infraestructures", "estructura-urbana": "Estructura Urbana", divulgacio: "Divulgació", "espai-public": "Espai Públic", "participacio-ciutadana": "Participació Ciutadana", "encaixos-singulars": "Encaixos Singulars" },
  es: { residencial: "Residencial", transformacio: "Transformación", extensio: "Extensión", regeneracio: "Regeneración", "activitat-economica": "Actividad Económica", "infraestructura-verda": "Infraestructura Verde", "integracio-infraestructures": "Integración Infraestructuras", "estructura-urbana": "Estructura Urbana", divulgacio: "Divulgación", "espai-public": "Espacio Público", "participacio-ciutadana": "Participación Ciudadana", "encaixos-singulars": "Encajes Singulares" },
  en: { residencial: "Residential", transformacio: "Transformation", extensio: "Extension", regeneracio: "Regeneration", "activitat-economica": "Economic Activity", "infraestructura-verda": "Green Infrastructure", "integracio-infraestructures": "Infrastructure Integration", "estructura-urbana": "Urban Structure", divulgacio: "Outreach", "espai-public": "Public Space", "participacio-ciutadana": "Citizen Participation", "encaixos-singulars": "Singular Insertions" },
};

const TIPUS_VALUES = ["Estudi", "Planejament general", "Planejament derivat", "Altres"] as const;
const ESCALA_VALUES = ["Barri", "Sector", "Municipi", "Plurimunicipal"] as const;

const TIPUS_LABELS: Record<Locale, Record<typeof TIPUS_VALUES[number], string>> = {
  ca: { "Estudi": "Estudi", "Planejament general": "Planejament general", "Planejament derivat": "Planejament derivat", "Altres": "Altres" },
  es: { "Estudi": "Estudio", "Planejament general": "Planeamiento general", "Planejament derivat": "Planeamiento derivado", "Altres": "Otros" },
  en: { "Estudi": "Study", "Planejament general": "General planning", "Planejament derivat": "Derived planning", "Altres": "Other" },
};

const ESCALA_LABELS: Record<Locale, Record<typeof ESCALA_VALUES[number], string>> = {
  ca: { "Barri": "Barri", "Sector": "Sector", "Municipi": "Municipi", "Plurimunicipal": "Plurimunicipal" },
  es: { "Barri": "Barrio", "Sector": "Sector", "Municipi": "Municipio", "Plurimunicipal": "Plurimunicipal" },
  en: { "Barri": "Neighbourhood", "Sector": "Sector", "Municipi": "Municipality", "Plurimunicipal": "Plurimunicipal" },
};

/* ─── FilterToggleRow ────────────────────────────────────────────────────────── */

function FilterToggleRow({ label, active, onToggle, tabIndex: tIdx }: {
  label: string; active: boolean; onToggle: () => void; tabIndex: number;
}) {
  return (
    <div
      role="button"
      tabIndex={tIdx}
      onClick={onToggle}
      onKeyDown={(e) => e.key === "Enter" && onToggle()}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", cursor: "pointer", outline: "none" }}
    >
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: active ? "#000" : "#555", lineHeight: 1.3, fontWeight: active ? 600 : 400, transition: "color 160ms" }}>
        {label}
      </span>
      <div style={{
        width: "10px", height: "10px", borderRadius: "50%",
        border: `1.5px solid ${active ? "#111" : "#ccc"}`,
        background: active ? "#111" : "transparent",
        flexShrink: 0, marginLeft: "10px",
        transition: "background 180ms ease, border-color 180ms ease",
      }} />
    </div>
  );
}

/* ─── FilterSectionHead ──────────────────────────────────────────────────────── */

function FilterSectionHead({ title }: { title: string }) {
  return (
    <div style={{ marginTop: "10px", marginBottom: "1px", paddingBottom: "4px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#ccc" }}>
        {title}
      </span>
    </div>
  );
}

/* ─── MapExplorer ────────────────────────────────────────────────────────────── */

export default function MapExplorer({ projects, locale }: { projects: Project[]; locale: string }) {
  const loc    = locale as Locale;
  const ui     = SECTION_LABELS[loc] ?? SECTION_LABELS.ca;
  const nav    = NAV[loc]            ?? NAV.ca;
  const title  = PAGE_TITLES[loc]   ?? PAGE_TITLES.ca;
  const tagLbl = TAG_LABELS[loc]     ?? TAG_LABELS.ca;
  const tipLbl = TIPUS_LABELS[loc]   ?? TIPUS_LABELS.ca;
  const escLbl = ESCALA_LABELS[loc]  ?? ESCALA_LABELS.ca;

  const [panelOpen, setPanelOpen] = useState(true);
  const [theme,     setTheme]     = useState("");
  const [type,      setType]      = useState("");
  const [scale,     setScale]     = useState("");

  const locatedProjects = useMemo(
    () => projects.filter(({ coordinates }) => coordinates.lat !== 0 && coordinates.lng !== 0),
    [projects]
  );

  const visibleProjects = useMemo(() => locatedProjects.filter((p) => {
    if (theme && !p.tags.includes(theme as TagSlug)) return false;
    if (type  && p[loc].tipus  !== type)             return false;
    if (scale && p[loc].status !== scale)             return false;
    return true;
  }), [locatedProjects, loc, theme, type, scale]);

  const hasFilters = !!(theme || type || scale);
  const clearAll   = () => { setTheme(""); setType(""); setScale(""); };

  const toggle = (val: string, current: string, set: (v: string) => void) =>
    set(val === current ? "" : val);

  return (
    <div className="pu-map-explorer">

      {/* ── Capçalera: títol + toggle (esquerra) · botons nav (dreta) ── */}
      <div style={{
        flexShrink:     0,
        padding:        "clamp(36px,5vh,64px) var(--margin-page) 0",
        display:        "flex",
        alignItems:     "flex-end",
        justifyContent: "space-between",
        gap:            "24px",
        flexWrap:       "wrap",
      }}>
        {/* Esquerra */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "18px" }}>
          <h1 style={{
            fontFamily:    "var(--font-sans)",
            fontSize:      "clamp(32px,4vw,60px)",
            fontWeight:    700,
            letterSpacing: "-0.04em",
            lineHeight:    1,
            color:         "#000",
            margin:        0,
            flexShrink:    0,
          }}>
            {title}
          </h1>
          <button
            onClick={() => setPanelOpen(f => !f)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: 1,
              color: panelOpen ? "#888" : "#bbb",
              background: "none", border: "none", cursor: "pointer",
              padding: "0 0 5px",
              transition: "color 200ms ease", flexShrink: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {panelOpen ? "‹‹" : "»»"}
          </button>
        </div>

        {/* Dreta */}
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <Link href={`/${locale}/directori`} className="pu-dir-btn">{nav.visual}</Link>
          <Link href={`/${locale}/projectes`} className="pu-dir-btn">{nav.arxiu}</Link>
        </div>
      </div>

      {/* ── Línia separadora ── */}
      <div style={{ flexShrink: 0, margin: "clamp(16px,2.5vh,28px) var(--margin-page) 0", height: "1px", background: "rgba(0,0,0,0.08)" }} />

      {/* ── Contingut: panell filtres (esquerra) + mapa (resta) ── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>

        {/* Panell de filtres esquerre */}
        <div
          aria-hidden={!panelOpen}
          style={{
            width:      panelOpen ? "260px" : "0",
            flexShrink: 0,
            overflow:   "hidden",
            transition: "width 350ms cubic-bezier(0.22,1,0.36,1)",
            borderRight: panelOpen ? "1px solid rgba(0,0,0,0.08)" : "none",
          }}
        >
          <div style={{
            width: "260px",
            height: "100%",
            overflowY: "auto",
            padding: "16px 20px 24px var(--margin-page)",
            boxSizing: "border-box",
          }}>
            {/* Temàtica */}
            <FilterSectionHead title={ui.tematica} />
            {ALL_TAGS.map((tag) => (
              <FilterToggleRow
                key={tag}
                label={tagLbl[tag]}
                active={theme === tag}
                tabIndex={panelOpen ? 0 : -1}
                onToggle={() => toggle(tag, theme, setTheme)}
              />
            ))}

            {/* Tipus */}
            <FilterSectionHead title={ui.tipus} />
            {TIPUS_VALUES.map((val) => (
              <FilterToggleRow
                key={val}
                label={tipLbl[val]}
                active={type === val}
                tabIndex={panelOpen ? 0 : -1}
                onToggle={() => toggle(val, type, setType)}
              />
            ))}

            {/* Escala */}
            <FilterSectionHead title={ui.escala} />
            {ESCALA_VALUES.map((val) => (
              <FilterToggleRow
                key={val}
                label={escLbl[val]}
                active={scale === val}
                tabIndex={panelOpen ? 0 : -1}
                onToggle={() => toggle(val, scale, setScale)}
              />
            ))}

            {/* Clear */}
            {hasFilters && (
              <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <button
                  onClick={clearAll}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-mono)", fontSize: "8.5px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#bbb" }}
                >
                  {ui.clear}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="pu-map-canvas">
          <MapView projects={visibleProjects} locale={locale} />
        </div>
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
        .pu-map-canvas {
          flex: 1;
          min-width: 0;
          min-height: 0;
          position: relative;
          z-index: 1;
          isolation: isolate;
        }
        .pu-dir-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border: 1px solid #1a1a1a;
          background: transparent;
          transition: background 180ms ease, color 180ms ease;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #000;
          text-decoration: none;
        }
        .pu-dir-btn:hover { background: #000; color: #fff; }
        @media (max-width: 768px) {
          .pu-map-explorer { height: 100dvh; }
        }
      `}</style>
    </div>
  );
}
