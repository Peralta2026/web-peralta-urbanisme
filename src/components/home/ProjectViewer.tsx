"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function localizeHref(href: string, locale: string) {
  return locale === "ca" ? href : `/${locale}${href}`;
}

function pad2(n: number) { return String(n).padStart(2, "0"); }

const TAG_LABELS: Record<string, string> = {
  "residencial":                 "Residencial",
  "transformacio":               "Transformació",
  "extensio":                    "Extensió",
  "regeneracio":                 "Regeneració",
  "activitat-economica":         "Activitat econòmica",
  "infraestructura-verda":       "Infraestructura verda",
  "integracio-infraestructures": "Integració d'infraestructures",
  "estructura-urbana":           "Estructura urbana",
  "divulgacio":                  "Divulgació",
  "espai-public":                "Espai públic",
  "participacio-ciutadana":      "Participació ciutadana",
  "encaixos-singulars":          "Encaixos singulars",
};

/* ─── Physics ────────────────────────────────────────────────────────────── */

const SENSITIVITY = 0.0003;  // input px → slots/frame velocity
const MAX_VEL     = 0.022;   // max slots/frame (~1.3 slots/sec at 60fps)
const FRICTION    = 0.84;    // velocity decay per frame
const LERP_K      = 0.12;    // dispPos follows rawPos
const SETTLE_MS   = 320;     // ms quiet before settle spring
const SETTLE_K    = 0.14;    // spring rate toward nearest integer
const SNAP_EPS    = 0.002;   // hard-snap threshold

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface ProjectViewerHandle {
  addDelta: (delta: number) => void;
}

interface Props {
  projects: Project[];
  locale:   string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

const ProjectViewer = forwardRef<ProjectViewerHandle, Props>(
  function ProjectViewer({ projects, locale }, ref) {
    const N = projects.length;

    const [activeIdx, setActiveIdx] = useState(0);

    const projVel    = useRef(0);
    const rawPos     = useRef(0);
    const dispPos    = useRef(0);
    const lastInput  = useRef(0);
    const slotH      = useRef(0);
    const trackRef   = useRef<HTMLDivElement>(null);
    const rafId      = useRef(0);

    useImperativeHandle(ref, () => ({
      addDelta(delta: number) {
        const add = Math.max(-MAX_VEL, Math.min(MAX_VEL, delta * SENSITIVITY));
        projVel.current = Math.max(-MAX_VEL, Math.min(MAX_VEL, projVel.current + add));
        lastInput.current = performance.now();
      },
    }), []);

    useEffect(() => {
      slotH.current = window.innerHeight;
      const onResize = () => { slotH.current = window.innerHeight; };
      window.addEventListener("resize", onResize);

      let prevActive = 0;

      const tick = () => {
        const now     = performance.now();
        const settled = now - lastInput.current > SETTLE_MS;

        if (settled) {
          projVel.current = 0;
          const target = Math.max(0, Math.min(N - 1, Math.round(rawPos.current)));
          const dist   = target - rawPos.current;
          if (Math.abs(dist) < SNAP_EPS) {
            rawPos.current = target;
          } else {
            rawPos.current += dist * SETTLE_K;
          }
        } else {
          rawPos.current += projVel.current;
          projVel.current *= FRICTION;
        }

        rawPos.current  = Math.max(0, Math.min(N - 1, rawPos.current));
        dispPos.current = Math.max(0, Math.min(N - 1,
          dispPos.current + (rawPos.current - dispPos.current) * LERP_K
        ));

        if (trackRef.current && slotH.current > 0) {
          trackRef.current.style.transform =
            `translateY(-${(dispPos.current * slotH.current).toFixed(2)}px)`;
        }

        const dominant = Math.max(0, Math.min(N - 1, Math.round(dispPos.current)));
        if (dominant !== prevActive) {
          prevActive = dominant;
          setActiveIdx(dominant);
        }

        rafId.current = requestAnimationFrame(tick);
      };
      rafId.current = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(rafId.current);
        window.removeEventListener("resize", onResize);
      };
    }, [N]);

    const project = projects[activeIdx];
    const data    = project[locale as "ca" | "es" | "en"];
    const hasLong = !!(data.descriptionLong && data.descriptionLong !== data.descriptionShort);

    return (
      <>
        <style>{`
          @keyframes pu-info-enter {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0);    }
          }
        `}</style>

        <div style={{
          position:   "absolute",
          inset:      0,
          display:    "flex",
          background: "#ffffff",
          fontFamily: "var(--font-sans)",
        }}>

          {/* ── ProjectInfoStage ────────────────────────────────────────── */}
          <div style={{
            width:         "32%",
            flexShrink:    0,
            height:        "100%",
            display:       "flex",
            flexDirection: "column",
            padding:       "56px 48px 48px 56px",
          }}>

            <p style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "10px",
              letterSpacing: "0.10em",
              color:         "#ccc",
              marginBottom:  "36px",
              flexShrink:    0,
            }}>
              {pad2(activeIdx + 1)} / {pad2(N)}
            </p>

            <div
              key={activeIdx}
              style={{
                flex:          1,
                display:       "flex",
                flexDirection: "column",
                animation:     "pu-info-enter 280ms ease forwards",
                minHeight:     0,
              }}
            >
              <h2 style={{
                fontSize:      "clamp(20px, 2.2vw, 34px)",
                fontWeight:    700,
                letterSpacing: "-0.02em",
                lineHeight:    1.1,
                color:         "#111",
                marginBottom:  "24px",
              }}>
                {data.title}
              </h2>

              <p style={{
                fontSize:     "13px",
                lineHeight:   1.7,
                color:        "#555",
                whiteSpace:   "pre-line",
                marginBottom: "32px",
                overflowY:    "auto",
                maxHeight:    "28vh",
              }}>
                {data.descriptionShort}
              </p>

              <p style={{
                fontFamily:    "var(--font-mono)",
                fontSize:      "10px",
                letterSpacing: "0.08em",
                color:         "#aaa",
                textTransform: "uppercase",
                lineHeight:    1.6,
                marginBottom:  "10px",
                flexShrink:    0,
              }}>
                {data.municipality}
                {data.year  ? ` · ${data.year}`  : ""}
                {data.tipus ? ` · ${data.tipus}` : ""}
              </p>

              {project.tags.length > 0 && (
                <p style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      "9px",
                  letterSpacing: "0.08em",
                  color:         "#c0c0c0",
                  textTransform: "uppercase",
                  lineHeight:    1.8,
                  marginBottom:  "32px",
                  flexShrink:    0,
                }}>
                  {project.tags.map(t => TAG_LABELS[t] ?? t).join("  /  ")}
                </p>
              )}

              {hasLong && (
                <button style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      "10px",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color:         "#111",
                  background:    "none",
                  border:        "none",
                  cursor:        "pointer",
                  padding:       "0 0 2px",
                  borderBottom:  "1px solid #111",
                  alignSelf:     "flex-start",
                  marginBottom:  "20px",
                  flexShrink:    0,
                }}>
                  Llegir més
                </button>
              )}

              <div style={{ marginTop: "auto", paddingTop: "24px", flexShrink: 0 }}>
                <Link
                  href={localizeHref(`/projectes/${project.slug}`, locale)}
                  style={{
                    fontFamily:     "var(--font-mono)",
                    fontSize:       "10px",
                    letterSpacing:  "0.12em",
                    textTransform:  "uppercase",
                    color:          "#111",
                    textDecoration: "none",
                    borderBottom:   "1px solid #111",
                    paddingBottom:  "2px",
                  }}
                >
                  Veure projecte →
                </Link>
              </div>
            </div>
          </div>

          {/* ── ProjectMediaStage ───────────────────────────────────────── */}
          <div style={{
            flex:     1,
            height:   "100%",
            overflow: "hidden",
            position: "relative",
          }}>
            <div ref={trackRef} style={{
              position:  "absolute",
              top:       0,
              left:      0,
              right:     0,
              willChange: "transform",
            }}>
              {projects.map((proj, i) => {
                const d   = proj[locale as "ca" | "es" | "en"];
                const src = `/projects/${proj.slug}/${proj.coverImage}`;
                return (
                  <div
                    key={proj.slug}
                    style={{
                      height:        "100vh",
                      display:       "flex",
                      alignItems:    "center",
                      paddingRight:  "clamp(40px, 7vw, 84px)",
                      paddingLeft:   "20px",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={d.title}
                      loading={i <= 1 ? "eager" : "lazy"}
                      style={{
                        width:      "100%",
                        height:     "82vh",
                        objectFit:  "cover",
                        display:    "block",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </>
    );
  }
);

export default ProjectViewer;
