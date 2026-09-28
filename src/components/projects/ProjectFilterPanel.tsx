"use client";

import { useMemo, useState } from "react";
import type { Locale, Project, TagSlug } from "@/lib/types";
import { ALL_TAGS } from "@/lib/types";

/* ─── Valors i etiquetes dels filtres ────────────────────────────────────────── */

export const TIPUS_VALUES = ["Estudi", "Planejament general", "Planejament derivat", "Altres"] as const;
export const ESCALA_VALUES = ["Barri", "Sector", "Municipi", "Plurimunicipal"] as const;
type TipusValue = typeof TIPUS_VALUES[number];
type EscalaValue = typeof ESCALA_VALUES[number];

const TAG_LABELS: Record<Locale, Record<TagSlug, string>> = {
  ca: { residencial: "Residencial", transformacio: "Transformació", extensio: "Extensió", regeneracio: "Regeneració", "activitat-economica": "Activitat Econòmica", "infraestructura-verda": "Infraestructura Verda", "integracio-infraestructures": "Integració Infraestructures", "estructura-urbana": "Estructura Urbana", divulgacio: "Divulgació", "espai-public": "Espai Públic", "participacio-ciutadana": "Participació Ciutadana", "encaixos-singulars": "Encaixos Singulars" },
  es: { residencial: "Residencial", transformacio: "Transformación", extensio: "Extensión", regeneracio: "Regeneración", "activitat-economica": "Actividad Económica", "infraestructura-verda": "Infraestructura Verde", "integracio-infraestructures": "Integración Infraestructuras", "estructura-urbana": "Estructura Urbana", divulgacio: "Divulgación", "espai-public": "Espacio Público", "participacio-ciutadana": "Participación Ciudadana", "encaixos-singulars": "Encajes Singulares" },
  en: { residencial: "Residential", transformacio: "Transformation", extensio: "Extension", regeneracio: "Regeneration", "activitat-economica": "Economic Activity", "infraestructura-verda": "Green Infrastructure", "integracio-infraestructures": "Infrastructure Integration", "estructura-urbana": "Urban Structure", divulgacio: "Outreach", "espai-public": "Public Space", "participacio-ciutadana": "Citizen Participation", "encaixos-singulars": "Singular Insertions" },
};

const TIPUS_LABELS: Record<Locale, Record<TipusValue, string>> = {
  ca: { "Estudi": "Estudi", "Planejament general": "Planejament general", "Planejament derivat": "Planejament derivat", "Altres": "Altres" },
  es: { "Estudi": "Estudio", "Planejament general": "Planeamiento general", "Planejament derivat": "Planeamiento derivado", "Altres": "Otros" },
  en: { "Estudi": "Study", "Planejament general": "General planning", "Planejament derivat": "Derived planning", "Altres": "Other" },
};

const ESCALA_LABELS: Record<Locale, Record<EscalaValue, string>> = {
  ca: { "Barri": "Barri", "Sector": "Sector", "Municipi": "Municipi", "Plurimunicipal": "Plurimunicipal" },
  es: { "Barri": "Barrio", "Sector": "Sector", "Municipi": "Municipio", "Plurimunicipal": "Plurimunicipal" },
  en: { "Barri": "Neighbourhood", "Sector": "Sector", "Municipi": "Municipality", "Plurimunicipal": "Plurimunicipal" },
};

export const FILTER_UI: Record<Locale, { tema: string; tipus: string; escala: string; clear: string; empty: string; filters: string; close: string }> = {
  ca: { tema: "Temàtica", tipus: "Tipus", escala: "Escala", clear: "Netejar", empty: "Cap projecte coincideix amb els filtres seleccionats.", filters: "Filtres", close: "Tancar" },
  es: { tema: "Temática", tipus: "Tipo",  escala: "Escala", clear: "Borrar",  empty: "Ningún proyecto coincide con los filtros seleccionados.", filters: "Filtros", close: "Cerrar" },
  en: { tema: "Theme",    tipus: "Type",  escala: "Scale",  clear: "Clear",   empty: "No projects match the selected filters.", filters: "Filters", close: "Close" },
};

/* ─── Estat dels filtres (selecció múltiple, com a l'Arxiu) ──────────────────── */

export function useProjectFilters(projects: Project[], loc: Locale) {
  const [activeTema,   setActiveTema]   = useState<Set<TagSlug>>(new Set());
  const [activeTipus,  setActiveTipus]  = useState<Set<string>>(new Set());
  const [activeEscala, setActiveEscala] = useState<Set<string>>(new Set());

  const toggle = <T,>(set: (fn: (p: Set<T>) => Set<T>) => void) => (v: T) =>
    set(p => { const n = new Set(p); if (n.has(v)) n.delete(v); else n.add(v); return n; });

  const filtered = useMemo(() => projects.filter(p => {
    const matchTema   = activeTema.size === 0   || p.tags.some(t => activeTema.has(t));
    const matchTipus  = activeTipus.size === 0  || activeTipus.has(p[loc].tipus);
    const matchEscala = activeEscala.size === 0 || activeEscala.has(p[loc].status);
    return matchTema && matchTipus && matchEscala;
  }), [projects, loc, activeTema, activeTipus, activeEscala]);

  return {
    filtered,
    activeTema, activeTipus, activeEscala,
    toggleTema:   toggle(setActiveTema),
    toggleTipus:  toggle(setActiveTipus),
    toggleEscala: toggle(setActiveEscala),
    clearAll: () => { setActiveTema(new Set()); setActiveTipus(new Set()); setActiveEscala(new Set()); },
  };
}

/* ─── FilterToggleRow ────────────────────────────────────────────────────────── */

function FilterToggleRow({
  label, active, onToggle, tabIndex: tIdx,
}: { label: string; active: boolean; onToggle: () => void; tabIndex: number }) {
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
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--size-meta)", color: "#ccc" }}>
        {title}
      </span>
    </div>
  );
}

/* ─── LeftFilterPanel ────────────────────────────────────────────────────────── */

export function LeftFilterPanel({
  open, locale,
  activeTema, activeTipus, activeEscala,
  onToggleTema, onToggleTipus, onToggleEscala,
  onClear,
}: {
  open: boolean;
  locale: string;
  activeTema: Set<TagSlug>;
  activeTipus: Set<string>;
  activeEscala: Set<string>;
  onToggleTema: (t: TagSlug) => void;
  onToggleTipus: (v: string) => void;
  onToggleEscala: (v: string) => void;
  onClear: () => void;
}) {
  const loc          = (locale as Locale) in TAG_LABELS ? (locale as Locale) : "ca";
  const tagLabels    = TAG_LABELS[loc];
  const tipusLabels  = TIPUS_LABELS[loc];
  const escalaLabels = ESCALA_LABELS[loc];
  const ui           = FILTER_UI[loc];
  const hasAny = activeTema.size > 0 || activeTipus.size > 0 || activeEscala.size > 0;

  return (
    <div
      aria-hidden={!open}
      style={{
        width: open ? "260px" : "0",
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 350ms cubic-bezier(0.22,1,0.36,1)",
        borderRight: open ? "1px solid rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div style={{
        width: "260px",
        height: "100%",
        overflowY: "auto",
        padding: "16px 20px 24px var(--margin-page)",
        boxSizing: "border-box",
      }}>
        <FilterSectionHead title={ui.tema} />
        {ALL_TAGS.map((tag) => (
          <FilterToggleRow
            key={tag}
            label={tagLabels[tag]}
            active={activeTema.has(tag)}
            tabIndex={open ? 0 : -1}
            onToggle={() => onToggleTema(tag)}
          />
        ))}

        <FilterSectionHead title={ui.tipus} />
        {TIPUS_VALUES.map((val) => (
          <FilterToggleRow
            key={val}
            label={tipusLabels[val]}
            active={activeTipus.has(val)}
            tabIndex={open ? 0 : -1}
            onToggle={() => onToggleTipus(val)}
          />
        ))}

        <FilterSectionHead title={ui.escala} />
        {ESCALA_VALUES.map((val) => (
          <FilterToggleRow
            key={val}
            label={escalaLabels[val]}
            active={activeEscala.has(val)}
            tabIndex={open ? 0 : -1}
            onToggle={() => onToggleEscala(val)}
          />
        ))}

        {hasAny && (
          <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button
              onClick={onClear}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-sans)", fontSize: "var(--size-meta)", color: "#bbb" }}
            >
              {ui.clear}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Botó ‹‹ / »» per obrir i tancar el panell ──────────────────────────────── */

export function FilterPanelToggle({ open, locale, onToggle }: { open: boolean; locale: string; onToggle: () => void }) {
  const ui = FILTER_UI[(locale as Locale) in FILTER_UI ? (locale as Locale) : "ca"];
  return (
    <button
      onClick={onToggle}
      title={open ? ui.close : ui.filters}
      style={{
        fontFamily: "var(--font-sans)", fontSize: "12px", lineHeight: 1,
        color: open ? "#999" : "#ccc",
        background: "none", border: "none", cursor: "pointer",
        padding: "0 0 4px",
        transition: "color 200ms ease",
        letterSpacing: "-0.02em",
        marginLeft: "4px",
      }}
    >
      {open ? "‹‹" : "»»"}
    </button>
  );
}
