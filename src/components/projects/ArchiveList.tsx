"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Project, Locale } from "@/lib/types";

function localizeHref(href: string, locale: string): string {
  if (locale === "ca") return href;
  return `/${locale}${href}`;
}

const UI: Record<Locale, { tipus: string; abast: string; any: string; all: string; empty: string; open: string }> = {
  ca: { tipus: "Tipus", abast: "Abast", any: "Any", all: "Tots", empty: "Cap projecte coincideix amb els filtres seleccionats.", open: "+" },
  es: { tipus: "Tipo",  abast: "Alcance", any: "Año", all: "Todos", empty: "Ningún proyecto coincide con los filtros seleccionados.", open: "+" },
  en: { tipus: "Type",  abast: "Scope",   any: "Year", all: "All", empty: "No projects match the selected filters.", open: "+" },
};

function FilterDropdown({ label, options, value, onChange }: {
  label:    string;
  options:  string[];
  value:    string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "0", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: value ? "#000" : "#888", display: "flex", alignItems: "center", gap: "6px", fontWeight: value ? 700 : 400 }}
      >
        {value || label}
        <span style={{ fontSize: "8px", opacity: 0.5 }}>▾</span>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "#fff", border: "1px solid #e8e8e8", minWidth: "200px", zIndex: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: !value ? "#000" : "#777", background: "none", border: "none", cursor: "pointer", fontWeight: !value ? 700 : 400, fontFamily: "var(--font-mono)" }}
            >
              —
            </button>
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: value === opt ? "#000" : "#777", background: value === opt ? "#f7f6f3" : "none", border: "none", cursor: "pointer", fontWeight: value === opt ? 700 : 400, fontFamily: "var(--font-mono)" }}
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

  return (
    <>
      {/* ── Filtres ── */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "0 32px" }}>
        <div style={{ maxWidth: "1380px", margin: "0 auto", display: "flex", alignItems: "center", gap: "40px", height: "52px" }}>
          <FilterDropdown label={ui.tipus} options={optionsTipus} value={filterTipus} onChange={setFilterTipus} />
          <FilterDropdown label={ui.abast} options={optionsAbast} value={filterAbast} onChange={setFilterAbast} />
          <FilterDropdown label={ui.any}   options={optionsAny}   value={filterAny}   onChange={setFilterAny}   />
          {hasFilters && (
            <button
              onClick={() => { setFilterTipus(""); setFilterAbast(""); setFilterAny(""); }}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#aaa", textDecoration: "underline" }}
            >
              Esborrar filtres
            </button>
          )}
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
