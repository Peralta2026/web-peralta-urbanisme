"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Project, Locale, TagSlug } from "@/lib/types";
import { ALL_TAGS } from "@/lib/types";

/* ─── URL helper ────────────────────────────────────────────────────────────── */

function projectHref(slug: string, locale: string): string {
  return `/${locale}/projectes/${slug}`;
}

/* ─── Tag labels per locale ──────────────────────────────────────────────────── */

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

/* ─── UI labels ──────────────────────────────────────────────────────────────── */

const TIPUS_VALUES = ["Estudi", "Planejament general", "Planejament derivat", "Altres"] as const;
type TipusValue = typeof TIPUS_VALUES[number];

const ESCALA_VALUES = ["Barri", "Sector", "Municipi", "Plurimunicipal"] as const;
type EscalaValue = typeof ESCALA_VALUES[number];

const TIPUS_COLORS: Record<string, string> = {
  "Estudi":                "#F9EE76",
  "Planejament general":   "#B4EFC5",
  "Planejament derivat":   "#A8DEF5",
  "Altres":                "#F5C0DA",
};

const TIPUS_LABELS: Record<string, Record<TipusValue, string>> = {
  ca: { "Estudi": "Estudi", "Planejament general": "Planejament general", "Planejament derivat": "Planejament derivat", "Altres": "Altres" },
  es: { "Estudi": "Estudio", "Planejament general": "Planeamiento general", "Planejament derivat": "Planeamiento derivado", "Altres": "Otros" },
  en: { "Estudi": "Study", "Planejament general": "General planning", "Planejament derivat": "Derived planning", "Altres": "Other" },
};

const ESCALA_LABELS: Record<string, Record<EscalaValue, string>> = {
  ca: { "Barri": "Barri", "Sector": "Sector", "Municipi": "Municipi", "Plurimunicipal": "Plurimunicipal" },
  es: { "Barri": "Barrio", "Sector": "Sector", "Municipi": "Municipio", "Plurimunicipal": "Plurimunicipal" },
  en: { "Barri": "Neighbourhood", "Sector": "Sector", "Municipi": "Municipality", "Plurimunicipal": "Plurimunicipal" },
};

interface UiStrings {
  filtra: string;
  tema:   string;
  tipus:  string;
  escala: string;
  clear:  string;
  empty:  string;
  view:   string;
  filters: string;
  close:   string;
  col:    { project: string; municipality: string; year: string; tipus: string };
  count:  (n: number) => string;
}

const UI: Record<Locale, UiStrings> = {
  ca: {
    filtra:  "Filtra per:",
    tema:    "Temàtica",
    tipus:   "Tipus",
    escala:  "Escala",
    clear:   "Netejar",
    empty:   "Cap projecte coincideix amb els filtres seleccionats.",
    view:    "Veure projecte →",
    filters: "Filtres",
    close:   "Tancar",
    col:    { project: "Projecte", municipality: "Municipi", year: "Any", tipus: "Tipus" },
    count:  (n) => `${n} projecte${n !== 1 ? "s" : ""}`,
  },
  es: {
    filtra:  "Filtrar por:",
    tema:    "Temática",
    tipus:   "Tipo",
    escala:  "Escala",
    clear:   "Borrar",
    empty:   "Ningún proyecto coincide con los filtros seleccionados.",
    view:    "Ver proyecto →",
    filters: "Filtros",
    close:   "Cerrar",
    col:    { project: "Proyecto", municipality: "Municipio", year: "Año", tipus: "Tipo" },
    count:  (n) => `${n} proyecto${n !== 1 ? "s" : ""}`,
  },
  en: {
    filtra:  "Filter by:",
    tema:    "Theme",
    tipus:   "Type",
    escala:  "Scale",
    clear:   "Clear",
    empty:   "No projects match the selected filters.",
    view:    "View project →",
    filters: "Filters",
    close:   "Close",
    col:    { project: "Project", municipality: "Municipality", year: "Year", tipus: "Type" },
    count:  (n) => `${n} project${n !== 1 ? "s" : ""}`,
  },
};

/* ─── FilterToggleRow ──────────────────────────────────────────────────────── */

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

/* ─── FilterSectionHead ────────────────────────────────────────────────────── */

function FilterSectionHead({ title }: { title: string }) {
  return (
    <div style={{ marginTop: "10px", marginBottom: "1px", paddingBottom: "4px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#ccc" }}>
        {title}
      </span>
    </div>
  );
}

/* ─── LeftFilterPanel ──────────────────────────────────────────────────────── */

function LeftFilterPanel({
  open, locale,
  activeTema, activeTipus, activeEscala,
  onToggleTema, onToggleTipus, onToggleEscala,
  onClear, onClose,
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
  onClose: () => void;
}) {
  const tagLabels   = TAG_LABELS[locale as Locale] ?? TAG_LABELS.ca;
  const tipusLabels = TIPUS_LABELS[locale] ?? TIPUS_LABELS.ca;
  const escalaLabels = ESCALA_LABELS[locale] ?? ESCALA_LABELS.ca;
  const ui = UI[locale as Locale] ?? UI.ca;
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
        position: "relative",
      }}
    >
      <div style={{
        width: "260px",
        height: "100%",
        overflowY: "auto",
        padding: "16px 20px 24px",
        boxSizing: "border-box",
      }}>
        {/* Temàtica */}
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

        {/* Tipus */}
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

        {/* Escala */}
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

        {/* Clear button */}
        {hasAny && (
          <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button
              onClick={onClear}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-mono)", fontSize: "8.5px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#bbb" }}
            >
              {ui.clear}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ArchiveProjectCard ─────────────────────────────────────────────────────── */

const READ_MORE: Record<Locale, string> = { ca: "Llegir més", es: "Leer más", en: "Read more" };

function ArchiveProjectCard({ project, locale, viewLabel }: { project: Project; locale: Locale; viewLabel: string }) {
  const data = project[locale];
  const image = project.images[0] || project.coverImage;
  const [descOpen, setDescOpen] = useState(false);

  const facts = [
    data.municipality,
    data.year,
    data.status,
    data.tipus,
    data.ambitM2  ? `${data.ambitM2.toLocaleString("ca-ES")} m²`   : null,
    data.sostreM2 ? `${data.sostreM2.toLocaleString("ca-ES")} m²st` : null,
  ].filter(Boolean).join(" · ");

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
        <p className="pu-archive-card-facts">{facts}</p>
        {descOpen ? (
          <p className="pu-archive-card-description">{data.descriptionShort}</p>
        ) : (
          <button
            onClick={() => setDescOpen(true)}
            className="pu-archive-card-readmore"
          >
            {READ_MORE[locale]}
          </button>
        )}
        <Link href={projectHref(project.slug, locale)}>{viewLabel}</Link>
      </div>
    </div>
  );
}

/* ─── ArchiveList ────────────────────────────────────────────────────────────── */

interface Props {
  projects: Project[];
  locale:   string;
}

export default function ArchiveList({ projects, locale }: Props) {
  const loc = locale as Locale;
  const ui  = UI[loc];
  const tagLabels = TAG_LABELS[loc] ?? TAG_LABELS.ca;

  /* ── Filter state (multi-select) ── */
  const [panelOpen,    setPanelOpen]    = useState(true);
  const [activeTema,   setActiveTema]   = useState<Set<TagSlug>>(new Set());
  const [activeTipus,  setActiveTipus]  = useState<Set<string>>(new Set());
  const [activeEscala, setActiveEscala] = useState<Set<string>>(new Set());
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const toggleTema   = (t: TagSlug) => setActiveTema(p => { const n = new Set(p); n.has(t) ? n.delete(t) : n.add(t); return n; });
  const toggleTipus  = (v: string) => setActiveTipus(p => { const n = new Set(p); n.has(v) ? n.delete(v) : n.add(v); return n; });
  const toggleEscala = (v: string) => setActiveEscala(p => { const n = new Set(p); n.has(v) ? n.delete(v) : n.add(v); return n; });
  const clearAll     = () => { setActiveTema(new Set()); setActiveTipus(new Set()); setActiveEscala(new Set()); };

  const hasFilters = activeTema.size > 0 || activeTipus.size > 0 || activeEscala.size > 0;

  /* ── Filtered list ── */
  const filtered = useMemo(() => projects.filter(p => {
    const matchTema   = activeTema.size === 0   || p.tags.some(t => activeTema.has(t));
    const matchTipus  = activeTipus.size === 0  || activeTipus.has(p[loc].tipus);
    const matchEscala = activeEscala.size === 0 || activeEscala.has(p[loc].status);
    return matchTema && matchTipus && matchEscala;
  }), [projects, loc, activeTema, activeTipus, activeEscala]);

  return (
    <>
      {/* ── Top bar: filtra per + active chips ─────────────────────────── */}
      <div
        className="pu-filter-box"
        style={{ borderTop: "1px solid rgba(0,0,0,0.10)", borderBottom: "1px solid rgba(0,0,0,0.10)", background: "#fff" }}
      >
        <div style={{
          padding: "0 var(--margin-page)",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          minHeight: "52px",
          flexWrap: "wrap",
        }}>
          {/* Toggle sidebar button — just two small arrows */}
          <button
            onClick={() => setPanelOpen(f => !f)}
            title={panelOpen ? ui.close : ui.filters}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: 1,
              color: panelOpen ? "#888" : "#bbb",
              background: "none", border: "none", cursor: "pointer", padding: "2px 0",
              transition: "color 200ms ease",
              flexShrink: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {panelOpen ? "‹‹" : "››"}
          </button>

          {/* Divider */}
          {hasFilters && <span style={{ color: "rgba(0,0,0,0.12)", fontSize: "10px" }}>|</span>}

          {/* Active filter chips */}
          {Array.from(activeTema).map(tag => (
            <button key={`tag-${tag}`}
              onClick={() => toggleTema(tag)}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", border: "1px solid #111", borderRadius: "100px", background: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#111" }}>
              {tagLabels[tag]}
              <span style={{ fontSize: "12px", lineHeight: 1 }}>×</span>
            </button>
          ))}
          {Array.from(activeTipus).map(val => {
            const chipColor = TIPUS_COLORS[val];
            return (
              <button key={`tipus-${val}`}
                onClick={() => toggleTipus(val)}
                style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", border: "1px solid #111", borderRadius: "100px", background: chipColor ?? "#111", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.10em", textTransform: "uppercase", color: chipColor ? "#111" : "#fff" }}>
                {(TIPUS_LABELS[loc] ?? TIPUS_LABELS.ca)[val as TipusValue]}
                <span style={{ fontSize: "12px", lineHeight: 1 }}>×</span>
              </button>
            );
          })}
          {Array.from(activeEscala).map(val => (
            <button key={`escala-${val}`}
              onClick={() => toggleEscala(val)}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", border: "1px solid #111", borderRadius: "100px", background: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#111" }}>
              {(ESCALA_LABELS[loc] ?? ESCALA_LABELS.ca)[val as EscalaValue]}
              <span style={{ fontSize: "12px", lineHeight: 1 }}>×</span>
            </button>
          ))}

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={clearAll}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", textDecoration: "underline", flexShrink: 0 }}
            >
              {ui.clear}
            </button>
          )}
        </div>
      </div>

      {/* ── Content area: left panel + list ──────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>

        {/* Left filter panel */}
        <LeftFilterPanel
          open={panelOpen}
          locale={locale}
          activeTema={activeTema}
          activeTipus={activeTipus}
          activeEscala={activeEscala}
          onToggleTema={toggleTema}
          onToggleTipus={toggleTipus}
          onToggleEscala={toggleEscala}
          onClear={clearAll}
          onClose={() => setPanelOpen(false)}
        />

        {/* Project list */}
        <div style={{
          flex: 1, minWidth: 0,
          padding: `0 var(--margin-page) 88px ${panelOpen ? "28px" : "var(--margin-page)"}`,
          transition: "padding-left 350ms cubic-bezier(0.22,1,0.36,1)",
        }}>
          {filtered.length === 0 ? (
            <div style={{ paddingTop: "64px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "#aaa", letterSpacing: "0.04em" }}>
              {ui.empty}
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div
                className="pu-archive-header"
                style={{ display: "grid", gridTemplateColumns: "1fr 160px 64px 180px 32px", gap: "0 24px", padding: "14px 0", borderBottom: "1px solid #e8e8e8", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" }}
              >
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
                      data-tipus={d.tipus}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      style={{
                        display: "grid", gridTemplateColumns: "1fr 160px 64px 180px 32px", gap: "0 24px",
                        padding: "17px 0", borderBottom: "1px solid #e8e8e8", alignItems: "center",
                        cursor: "pointer", transition: "background 200ms ease",
                        background: isExpanded ? (TIPUS_COLORS[d.tipus] ?? "#f5f5f3") : undefined,
                      }}
                      onClick={() => setExpandedSlug(cur => cur === project.slug ? null : project.slug)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedSlug(cur => cur === project.slug ? null : project.slug);
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
                      <span className="pu-archive-hide-sm" style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "6px" }}>
                        {TIPUS_COLORS[d.tipus] && (
                          <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: TIPUS_COLORS[d.tipus], flexShrink: 0 }} />
                        )}
                        {d.tipus}
                      </span>
                      {/* Navigate to project — stops row expand */}
                      <Link
                        href={projectHref(project.slug, locale)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontFamily: "var(--font-mono)", fontSize: "15px", color: "#000", textDecoration: "none", textAlign: "center", lineHeight: 1 }}
                        aria-label={`Obrir ${d.title}`}
                      >
                        →
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
      </div>

      <style>{`
        .pu-archive-row:hover { background: #f5f5f3; }
        .pu-archive-row[data-tipus="Estudi"]:hover              { background: #F9EE76; }
        .pu-archive-row[data-tipus="Planejament general"]:hover { background: #B4EFC5; }
        .pu-archive-row[data-tipus="Planejament derivat"]:hover { background: #A8DEF5; }
        .pu-archive-row[data-tipus="Altres"]:hover              { background: #F5C0DA; }
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
          border-radius: 0;
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
          margin: 0 0 16px;
          color: #000;
          font-family: var(--font-sans);
          font-size: clamp(26px, 2.8vw, 42px);
          font-weight: 700;
          letter-spacing: -.04em;
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
          margin: 16px 0 0;
          overflow: hidden;
          color: #444;
          font-family: var(--font-sans);
          font-size: clamp(14px, 1.2vw, 17px);
          line-height: 1.65;
        }
        .pu-archive-card-readmore {
          align-self: flex-start;
          background: none;
          border: none;
          border-bottom: 1px solid #ccc;
          padding: 0 0 2px;
          margin-top: 16px;
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #888;
        }
        .pu-archive-card-copy > a {
          align-self: flex-start;
          margin-top: auto;
          padding-top: 24px;
          padding-bottom: 3px;
          border-bottom: 1.5px solid #000;
          color: #000;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .10em;
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
          .pu-filter-box > div { min-height: 44px !important; }
          .pu-archive-card { height: auto; min-height: 0; flex-direction: column; }
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
