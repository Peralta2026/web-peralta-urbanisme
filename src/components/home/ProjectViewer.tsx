"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function localizeHref(href: string, locale: string) {
  return locale === "ca" ? href : `/${locale}${href}`;
}

function pad2(n: number) { return String(n).padStart(2, "0"); }

/* ─── Filter data ────────────────────────────────────────────────────────── */

const CONCEPTES: { slug: string; label: string }[] = [
  { slug: "residencial",                 label: "Residencial" },
  { slug: "transformacio",               label: "Transformació" },
  { slug: "extensio",                    label: "Extensió" },
  { slug: "regeneracio",                 label: "Regeneració" },
  { slug: "activitat-economica",         label: "Activitat econòmica" },
  { slug: "infraestructura-verda",       label: "Infraestructura verda" },
  { slug: "integracio-infraestructures", label: "Integració infraestructures" },
  { slug: "estructura-urbana",           label: "Estructura urbana" },
  { slug: "divulgacio",                  label: "Divulgació" },
  { slug: "espai-public",                label: "Espai públic" },
  { slug: "participacio-ciutadana",      label: "Participació ciutadana" },
  { slug: "encaixos-singulars",          label: "Encaixos singulars" },
];

const TIPUS_OPTS = ["Planejament", "Estudis urbanístics", "Avantprojectes singulars"];
const ABAST_OPTS = ["Sector", "Municipi", "Territorial"];

const SLUG_LABEL: Record<string, string> = Object.fromEntries(
  CONCEPTES.map(({ slug, label }) => [slug, label])
);

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface ProjectViewerHandle {
  addDelta: (delta: number) => void;
}

interface Props {
  projects: Project[];
  locale:   string;
}

interface FilterState {
  conceptes: Set<string>;
  tipus:     Set<string>;
  abast:     Set<string>;
}

/* ─── Physics constants ──────────────────────────────────────────────────── */

const SENSITIVITY = 0.0003;
const MAX_VEL     = 0.022;
const FRICTION    = 0.84;
const LERP_K      = 0.12;
const SETTLE_MS   = 300;
const SETTLE_K    = 0.16;
const SNAP_EPS    = 0.002;

/* ─── FilterBar ──────────────────────────────────────────────────────────── */

function FilterBar({
  filters,
  onToggle,
}: {
  filters: FilterState;
  onToggle: (g: keyof FilterState, v: string) => void;
}) {
  const chipStyle = (active: boolean): React.CSSProperties => ({
    fontFamily:          "var(--font-mono)",
    fontSize:            "9.5px",
    letterSpacing:       "0.07em",
    textTransform:       "uppercase" as const,
    color:               active ? "#111" : "#bbb",
    fontWeight:          active ? 600 : 400,
    background:          "none",
    border:              "none",
    cursor:              "pointer",
    padding:             0,
    textDecoration:      active ? "underline" : "none",
    textUnderlineOffset: "3px",
    whiteSpace:          "nowrap" as const,
    flexShrink:          0,
  });

  const groupLabel: React.CSSProperties = {
    fontFamily:    "var(--font-mono)",
    fontSize:      "8px",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color:         "#ccc",
    flexShrink:    0,
    alignSelf:     "center" as const,
  };

  const row: React.CSSProperties = {
    display:    "flex",
    alignItems: "center",
    gap:        "12px",
    overflow:   "hidden",
  };

  const chips: React.CSSProperties = {
    display:    "flex",
    gap:        "10px",
    overflowX:  "auto" as const,
    scrollbarWidth: "none" as const,
  };

  return (
    <div style={{
      position:  "absolute",
      top:       "24px",
      left:      "50%",
      transform: "translateX(-50%)",
      width:     "min(62vw, 960px)",
      display:   "flex",
      flexDirection: "column",
      gap:       "6px",
    }}>
      {/* Row 1: Conceptes */}
      <div style={row}>
        <span style={groupLabel}>Conceptes</span>
        <div style={chips}>
          {CONCEPTES.map(({ slug, label }) => (
            <button
              key={slug}
              style={chipStyle(filters.conceptes.has(slug))}
              onClick={() => onToggle("conceptes", slug)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Tipus + Abast */}
      <div style={{ ...row, gap: "28px" }}>
        <div style={row}>
          <span style={groupLabel}>Tipus</span>
          <div style={chips}>
            {TIPUS_OPTS.map(t => (
              <button key={t} style={chipStyle(filters.tipus.has(t))} onClick={() => onToggle("tipus", t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={row}>
          <span style={groupLabel}>Abast</span>
          <div style={chips}>
            {ABAST_OPTS.map(a => (
              <button key={a} style={chipStyle(filters.abast.has(a))} onClick={() => onToggle("abast", a)}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ProjectViewer ──────────────────────────────────────────────────────── */

const ProjectViewer = forwardRef<ProjectViewerHandle, Props>(
  function ProjectViewer({ projects, locale }, ref) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [filters, setFilters] = useState<FilterState>({
      conceptes: new Set(),
      tipus:     new Set(),
      abast:     new Set(),
    });
    const [slotH, setSlotH] = useState(0);

    /* filtered list */
    const filteredProjects = useMemo(() => {
      const empty = (s: Set<string>) => s.size === 0;
      return projects.filter(p => {
        const ca = p.ca;
        const ok1 = empty(filters.conceptes) || p.tags.some(t => filters.conceptes.has(t));
        const ok2 = empty(filters.tipus)     || filters.tipus.has(ca.tipus ?? "");
        const ok3 = empty(filters.abast)     || filters.abast.has(ca.status ?? "");
        return ok1 && ok2 && ok3;
      });
    }, [projects, filters]);

    const N = filteredProjects.length;

    function toggleFilter(group: keyof FilterState, value: string) {
      setFilters(prev => {
        const s = new Set(prev[group]);
        s.has(value) ? s.delete(value) : s.add(value);
        return { ...prev, [group]: s };
      });
    }

    /* physics refs */
    const projVel   = useRef(0);
    const rawPos    = useRef(0);
    const dispPos   = useRef(0);
    const lastInput = useRef(0);
    const slotHRef  = useRef(0);
    const trackRef  = useRef<HTMLDivElement>(null);
    const windowRef = useRef<HTMLDivElement>(null);
    const rafId     = useRef(0);

    useImperativeHandle(ref, () => ({
      addDelta(delta: number) {
        if (N <= 1) return;
        const add = Math.max(-MAX_VEL, Math.min(MAX_VEL, delta * SENSITIVITY));
        projVel.current = Math.max(-MAX_VEL, Math.min(MAX_VEL, projVel.current + add));
        lastInput.current = performance.now();
      },
    }), [N]);

    /* reset on filter change */
    useEffect(() => {
      rawPos.current  = 0;
      dispPos.current = 0;
      projVel.current = 0;
      setActiveIdx(0);
    }, [filters]);

    /* RAF loop */
    useEffect(() => {
      const measure = () => {
        if (windowRef.current) {
          slotHRef.current = windowRef.current.clientHeight;
          setSlotH(windowRef.current.clientHeight);
        }
      };
      measure();
      window.addEventListener("resize", measure);

      let prevActive = 0;

      const tick = () => {
        const nCurr   = N;
        const settled = performance.now() - lastInput.current > SETTLE_MS;

        if (settled) {
          projVel.current = 0;
          const target = Math.max(0, Math.min(nCurr - 1, Math.round(rawPos.current)));
          const dist   = target - rawPos.current;
          if (Math.abs(dist) < SNAP_EPS) rawPos.current = target;
          else rawPos.current += dist * SETTLE_K;
        } else {
          rawPos.current  += projVel.current;
          projVel.current *= FRICTION;
        }

        rawPos.current  = Math.max(0, Math.min(Math.max(0, nCurr - 1), rawPos.current));
        dispPos.current = Math.max(0, Math.min(Math.max(0, nCurr - 1),
          dispPos.current + (rawPos.current - dispPos.current) * LERP_K
        ));

        if (trackRef.current && slotHRef.current > 0) {
          trackRef.current.style.transform =
            `translateY(-${(dispPos.current * slotHRef.current).toFixed(2)}px)`;
        }

        const dominant = Math.max(0, Math.min(Math.max(0, nCurr - 1), Math.round(dispPos.current)));
        if (dominant !== prevActive) {
          prevActive = dominant;
          setActiveIdx(dominant);
        }

        rafId.current = requestAnimationFrame(tick);
      };
      rafId.current = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(rafId.current);
        window.removeEventListener("resize", measure);
      };
    }, [N]);

    const packH = slotH > 0 ? `${slotH}px` : "calc(100vh - 140px)";

    return (
      <>
        <style>{`
          @keyframes pu-info-enter {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0);    }
          }
          .pu-pack {
            display: flex;
            flex-direction: row;
          }
          .pu-pack-img-wrap {
            flex: 0 0 54%;
            overflow: hidden;
            border-radius: 5px;
          }
          .pu-pack-text {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            padding: clamp(24px, 3vh, 40px) clamp(24px, 3vw, 40px) clamp(24px, 3vh, 40px) clamp(28px, 3.5vw, 48px);
            overflow: hidden;
          }
          @media (max-width: 767px) {
            .pu-pack { flex-direction: column; }
            .pu-pack-img-wrap {
              flex: 0 0 52%;
              border-radius: 5px 5px 0 0;
            }
            .pu-pack-text { flex: 1; padding: 20px 18px; }
          }
          .pu-filter-chips::-webkit-scrollbar { display: none; }
        `}</style>

        <div style={{
          position:   "absolute",
          inset:      0,
          fontFamily: "var(--font-sans)",
        }}>
          {/* ── Filter bar ─────────────────────────────────────────────── */}
          <FilterBar filters={filters} onToggle={toggleFilter} />

          {/* ── Clip window — cards travel through here ─────────────────── */}
          <div
            ref={windowRef}
            style={{
              position:  "absolute",
              top:       "88px",
              bottom:    "44px",
              left:      "50%",
              transform: "translateX(-50%)",
              width:     "min(62vw, 960px)",
              overflow:  "hidden",
            }}
          >
            {/* Pack track — translateY drives the card stack */}
            <div
              ref={trackRef}
              style={{
                position:   "absolute",
                top:        0,
                left:       0,
                right:      0,
                willChange: "transform",
              }}
            >
              {filteredProjects.length === 0 ? (
                <div style={{
                  height:         packH,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                }}>
                  <p style={{
                    fontFamily:    "var(--font-mono)",
                    fontSize:      "11px",
                    letterSpacing: "0.08em",
                    color:         "#bbb",
                    textTransform: "uppercase",
                  }}>
                    Cap projecte coincideix
                  </p>
                </div>
              ) : (
                filteredProjects.map((proj, i) => {
                  const d      = proj[locale as "ca" | "es" | "en"];
                  const src    = `/projects/${proj.slug}/${proj.coverImage}`;
                  const hasLong = !!(d.descriptionLong && d.descriptionLong !== d.descriptionShort);
                  const isActive = i === activeIdx;

                  return (
                    <div
                      key={proj.slug}
                      className="pu-pack"
                      style={{ height: packH, flexShrink: 0 }}
                    >
                      {/* Image */}
                      <div className="pu-pack-img-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={d.title}
                          loading={i <= 1 ? "eager" : "lazy"}
                          style={{
                            width:      "100%",
                            height:     "100%",
                            objectFit:  "cover",
                            display:    "block",
                          }}
                        />
                      </div>

                      {/* Text */}
                      <div className="pu-pack-text">
                        <div
                          key={isActive ? "active" : `idle-${i}`}
                          style={{
                            flex:          1,
                            display:       "flex",
                            flexDirection: "column",
                            minHeight:     0,
                            animation:     isActive
                              ? "pu-info-enter 260ms ease forwards"
                              : "none",
                          }}
                        >
                          <p style={{
                            fontFamily:    "var(--font-mono)",
                            fontSize:      "9px",
                            letterSpacing: "0.12em",
                            color:         "#ccc",
                            textTransform: "uppercase",
                            marginBottom:  "clamp(16px, 2.5vh, 28px)",
                            flexShrink:    0,
                          }}>
                            {pad2(i + 1)} / {pad2(N)}
                          </p>

                          <h2 style={{
                            fontSize:      "clamp(17px, 1.9vw, 29px)",
                            fontWeight:    700,
                            letterSpacing: "-0.02em",
                            lineHeight:    1.1,
                            color:         "#111",
                            marginBottom:  "clamp(14px, 2vh, 22px)",
                            flexShrink:    0,
                          }}>
                            {d.title}
                          </h2>

                          <p style={{
                            fontSize:         "12.5px",
                            lineHeight:       1.75,
                            color:            "#555",
                            marginBottom:     "clamp(14px, 2vh, 22px)",
                            overflow:         "hidden",
                            display:          "-webkit-box",
                            WebkitLineClamp:  5,
                            WebkitBoxOrient:  "vertical",
                            flexShrink:       0,
                          }}>
                            {d.descriptionShort}
                          </p>

                          <p style={{
                            fontFamily:    "var(--font-mono)",
                            fontSize:      "9.5px",
                            letterSpacing: "0.08em",
                            color:         "#aaa",
                            textTransform: "uppercase",
                            lineHeight:    1.65,
                            marginBottom:  "8px",
                            flexShrink:    0,
                          }}>
                            {d.municipality}
                            {d.year  ? ` · ${d.year}`  : ""}
                            {d.tipus ? ` · ${d.tipus}` : ""}
                          </p>

                          {proj.tags.length > 0 && (
                            <p style={{
                              fontFamily:    "var(--font-mono)",
                              fontSize:      "8.5px",
                              letterSpacing: "0.08em",
                              color:         "#ccc",
                              textTransform: "uppercase",
                              lineHeight:    1.8,
                              flexShrink:    0,
                            }}>
                              {proj.tags.map(t => SLUG_LABEL[t] ?? t).join("  /  ")}
                            </p>
                          )}

                          <div style={{ flex: 1 }} />

                          {hasLong && (
                            <button style={{
                              fontFamily:          "var(--font-mono)",
                              fontSize:            "9.5px",
                              letterSpacing:       "0.10em",
                              textTransform:       "uppercase",
                              color:               "#111",
                              background:          "none",
                              border:              "none",
                              cursor:              "pointer",
                              padding:             "0 0 2px",
                              borderBottom:        "1px solid #111",
                              alignSelf:           "flex-start",
                              marginBottom:        "14px",
                              flexShrink:          0,
                            }}>
                              Llegir més
                            </button>
                          )}

                          <Link
                            href={localizeHref(`/projectes/${proj.slug}`, locale)}
                            style={{
                              fontFamily:     "var(--font-mono)",
                              fontSize:       "9.5px",
                              letterSpacing:  "0.12em",
                              textTransform:  "uppercase",
                              color:          "#111",
                              textDecoration: "none",
                              borderBottom:   "1px solid #111",
                              paddingBottom:  "2px",
                              alignSelf:      "flex-start",
                              flexShrink:     0,
                            }}
                          >
                            Veure projecte →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Counter (stable, below clip window) ─────────────────────── */}
          {N > 0 && (
            <div style={{
              position:      "absolute",
              bottom:        "14px",
              left:          "50%",
              transform:     "translateX(-50%)",
              width:         "min(62vw, 960px)",
              display:       "flex",
              justifyContent: "space-between",
              fontFamily:    "var(--font-mono)",
              fontSize:      "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color:         "#ccc",
            }}>
              <span>{pad2(activeIdx + 1)} / {pad2(N)}</span>
              {N < projects.length && (
                <span>{N} de {projects.length}</span>
              )}
            </div>
          )}
        </div>
      </>
    );
  }
);

export default ProjectViewer;
