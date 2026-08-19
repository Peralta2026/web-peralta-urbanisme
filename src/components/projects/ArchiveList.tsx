"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Project, Locale } from "@/lib/types";

function localizeHref(href: string, locale: string): string {
  if (locale === "ca") return href;
  return `/${locale}${href}`;
}

const UI: Record<Locale, { filtres: string; tipus: string; abast: string; any: string; all: string; empty: string; open: string; clear: string }> = {
  ca: { filtres: "Filtres", tipus: "Tipus", abast: "Abast", any: "Any", all: "Tots", empty: "Cap projecte coincideix amb els filtres seleccionats.", open: "+", clear: "Esborrar filtres" },
  es: { filtres: "Filtros", tipus: "Tipo",  abast: "Alcance", any: "Año", all: "Todos", empty: "Ningún proyecto coincide con los filtros seleccionados.", open: "+", clear: "Borrar filtros" },
  en: { filtres: "Filters", tipus: "Type",  abast: "Scope",   any: "Year", all: "All", empty: "No projects match the selected filters.", open: "+", clear: "Clear filters" },
};

function FilterDropdown({ categoryLabel, allLabel, options, value, onChange }: {
  categoryLabel: string;
  allLabel:      string;
  options:       string[];
  value:         string;
  onChange:      (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive = !!value;

  return (
    <div style={{ position: "relative", minWidth: "clamp(120px, 18vw, 220px)", flex: 1 }}>

      {/* Category label */}
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(0,0,0,0.8)", fontWeight: 700, margin: "0 0 10px" }}>
        {categoryLabel}
      </p>

      {/* Separator */}
      <div style={{ height: "1px", background: isActive ? "#000" : "rgba(0,0,0,0.15)", marginBottom: "10px", transition: "background 200ms" }} />

      {/* Value button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", fontFamily: "var(--font-sans)", fontSize: "clamp(13px, 1.3vw, 15px)", letterSpacing: "-0.01em", color: isActive ? "#000" : "#aaa", fontWeight: isActive ? 600 : 400 }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || allLabel}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", opacity: isActive ? 0.6 : 0.35, flexShrink: 0, transition: "transform 180ms", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "calc(100% + 12px)", left: 0, background: "#fff", border: "1px solid #e0e0e0", minWidth: "200px", zIndex: 20, boxShadow: "0 12px 32px rgba(0,0,0,0.09)" }}>
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 20px", fontFamily: "var(--font-sans)", fontSize: "13px", color: !value ? "#000" : "#aaa", background: "none", border: "none", cursor: "pointer", fontWeight: !value ? 600 : 400, letterSpacing: "-0.01em" }}
            >
              {allLabel}
            </button>
            <div style={{ height: "1px", background: "#f0f0f0", margin: "0 20px" }} />
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 20px", fontFamily: "var(--font-sans)", fontSize: "13px", color: value === opt ? "#000" : "#555", background: value === opt ? "#f7f6f3" : "none", border: "none", cursor: "pointer", fontWeight: value === opt ? 600 : 400, letterSpacing: "-0.01em" }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  projects: Project[];
  locale:   string;
}

export default function ArchiveList({ projects, locale }: Props) {
  const loc = locale as Locale;
  const ui  = UI[loc];

  const [filterTipus, setFilterTipus] = useState("");
  const [filterAbast, setFilterAbast] = useState("");
  const [filterAny,   setFilterAny]   = useState("");

  /* Opções úniques de cada filtre (des de les dades reals) */
  const optionsTipus = useMemo(() =>
    [...new Set(projects.map(p => p[loc].tipus).filter(Boolean))].sort(),
    [projects, loc]
  );
  const optionsAbast = useMemo(() =>
    [...new Set(projects.map(p => p[loc].status).filter(Boolean))].sort(),
    [projects, loc]
  );
  const optionsAny = useMemo(() =>
    [...new Set(projects.map(p => p[loc].year).filter(Boolean))].sort((a, b) => Number(b) - Number(a)),
    [projects, loc]
  );

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const d = p[loc];
      if (filterTipus && d.tipus !== filterTipus) return false;
      if (filterAbast && d.status !== filterAbast) return false;
      if (filterAny   && d.year  !== filterAny  ) return false;
      return true;
    });
  }, [projects, loc, filterTipus, filterAbast, filterAny]);

  const hasFilters = filterTipus || filterAbast || filterAny;

  const clearAll = () => { setFilterTipus(""); setFilterAbast(""); setFilterAny(""); };

  return (
    <>
      {/* ── Filtres ── */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "clamp(24px, 3.5vh, 40px) clamp(24px, 4vw, 48px) clamp(20px, 3vh, 36px)" }}>
        <div style={{ maxWidth: "1380px", margin: "0 auto" }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(20px, 3vh, 32px)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#000", fontWeight: 700 }}>
              {ui.filtres}
            </span>
            <button
              onClick={clearAll}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: hasFilters ? "#888" : "transparent", textDecoration: "underline", transition: "color 200ms", pointerEvents: hasFilters ? "auto" : "none" }}
            >
              {ui.clear}
            </button>
          </div>

          {/* Filter columns */}
          <div style={{ display: "flex", gap: "clamp(24px, 5vw, 80px)", alignItems: "flex-start" }}>
            <FilterDropdown categoryLabel={ui.tipus} allLabel={ui.all} options={optionsTipus} value={filterTipus} onChange={setFilterTipus} />
            <FilterDropdown categoryLabel={ui.abast} allLabel={ui.all} options={optionsAbast} value={filterAbast} onChange={setFilterAbast} />
            <FilterDropdown categoryLabel={ui.any}   allLabel={ui.all} options={optionsAny}   value={filterAny}   onChange={setFilterAny}   />
          </div>
        </div>
      </div>

      {/* ── Llista de projectes ── */}
      <div style={{ maxWidth: "1380px", margin: "0 auto", padding: "0 32px 88px" }}>
        {filtered.length === 0 ? (
          <div style={{ paddingTop: "64px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "#aaa", letterSpacing: "0.04em" }}>
            {ui.empty}
          </div>
        ) : (
          <>
            {/* Capçalera columnes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 64px 180px 32px", gap: "0 24px", padding: "14px 0", borderBottom: "1px solid #e8e8e8", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" }}>
              <span>Projecte</span>
              <span>Municipi</span>
              <span>Any</span>
              <span>Tipus</span>
              <span />
            </div>

            {filtered.map(project => {
              const d = project[loc];
              return (
                <div key={project.slug}
                  style={{ display: "grid", gridTemplateColumns: "1fr 160px 64px 180px 32px", gap: "0 24px", padding: "16px 0", borderBottom: "1px solid #e8e8e8", alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f7f6f3")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: 500, color: "#000", letterSpacing: "-0.01em" }}>
                    {d.title}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#666", letterSpacing: "0.02em" }}>
                    {d.municipality}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#666" }}>
                    {d.year}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#888", letterSpacing: "0.02em" }}>
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
              {filtered.length} projecte{filtered.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .pu-archive-row { grid-template-columns: 1fr 32px !important; }
          .pu-archive-col-hide { display: none !important; }
        }
      `}</style>
    </>
  );
}
