"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/lib/types";

/* ─── Nav ────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Projectes",        href: "/projectes"     },
  { label: "Directori visual", href: "/directori"     },
  { label: "Persones",         href: "/persones"      },
  { label: "Intervencions",    href: "/intervencions" },
  { label: "Contacte",         href: "/contacte"      },
] as const;

const LOCALES = ["ca", "es", "en"] as const;

function localizeHref(href: string, locale: string) {
  return locale === "ca" ? href : `/${locale}${href}`;
}

/* ─── Grid ───────────────────────────────────────────────────────────────── */

const SRCS = [
  "/grid/01.jpg", "/grid/02.jpg", "/grid/03.jpg", "/grid/04.jpg",
  "/grid/05.jpg", "/grid/06.jpg", "/grid/07.jpg", "/grid/08.jpg",
  "/grid/09.jpg", "/grid/10.jpg",
];

const COLS      = 2;
const ROWS      = 6;
const CELL_H_VH = 65;
const GUTTER    = 2;

/* ─── Scroll / animation ─────────────────────────────────────────────────── */

const HERO_RANGE  = 900;   // Phase 1: hero shrinks
const RISE_RANGE  = 700;   // Phase 2: projects panel rises
const TOTAL_RANGE = HERO_RANGE + RISE_RANGE;
const HERO_MIN    = 0.44;
const LERP_K      = 0.08;
const SLOW        = 0.42;
const FAST        = 0.82;
const CURVE_H     = 80;    // SVG curve height in px

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - Math.min(t, 1), 4);
}

function buildGrid(): string[][] {
  const out: string[][] = [];
  let idx = 0;
  for (let r = 0; r < ROWS; r++) {
    const row: string[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(SRCS[idx % SRCS.length]);
      idx++;
    }
    idx = (idx + 2) % SRCS.length;
    out.push(row);
  }
  return out;
}

const GRID = buildGrid();

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/* ─── Component ──────────────────────────────────────────────────────────── */

interface Props {
  locale: string;
  projects: Project[];
}

export default function HomeScene({ locale, projects }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  /* refs */
  const heroRef      = useRef<HTMLDivElement>(null);
  const hintRef      = useRef<HTMLDivElement>(null);
  const rowRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const projectsRef  = useRef<HTMLDivElement>(null);
  const barrigaRef   = useRef<SVGPathElement>(null);
  const vY           = useRef(0);
  const sY           = useRef(0);
  const rafId        = useRef(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    /* ── Wheel ── */
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      vY.current = Math.max(0, Math.min(vY.current + delta * 0.7, TOTAL_RANGE));
    };

    /* ── Touch ── */
    let t0 = 0;
    const onTouchStart = (e: TouchEvent) => { t0 = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      e.preventDefault();
      const delta = t0 - e.touches[0].clientY;
      vY.current = Math.max(0, Math.min(vY.current + delta, TOTAL_RANGE));
      t0 = e.touches[0].clientY;
    };

    document.addEventListener("wheel",      onWheel,      { passive: false });
    document.addEventListener("touchstart", onTouchStart, { passive: true  });
    document.addEventListener("touchmove",  onTouchMove,  { passive: false });

    /* ── RAF loop ── */
    const tick = () => {
      sY.current += (vY.current - sY.current) * LERP_K;
      const sy = sY.current;

      /* ── Phase 1: hero shrinks ─────────────────────────────────── */
      const p1  = Math.min(1, sy / HERO_RANGE);
      const ep1 = easeOutQuart(p1);
      const scale = 1 - ep1 * (1 - HERO_MIN);

      if (heroRef.current) {
        heroRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = Math.max(0, 1 - p1 * 5).toFixed(3);
      }

      /* ── Parallax (only during Phase 1 max) ───────────────────── */
      const parallaxY = Math.min(sy, HERO_RANGE);
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const speed = i % 2 === 0 ? SLOW : FAST;
        row.style.transform = `translateY(${(-parallaxY * speed).toFixed(1)}px)`;
      });

      /* ── Phase 2: projects panel rises ────────────────────────── */
      if (sy > HERO_RANGE && projectsRef.current && barrigaRef.current) {
        const p2   = Math.min(1, (sy - HERO_RANGE) / RISE_RANGE);
        const ep2  = easeOutQuart(p2);
        const tVH  = (1 - ep2) * 100;
        const depth = (1 - ep2) * CURVE_H;

        projectsRef.current.style.transform = `translateY(${tVH.toFixed(2)}vh)`;

        /* Barriga SVG path: concave curve at top, flattens as panel rises */
        const d = `M 0 0 L 100 0 L 100 ${CURVE_H} Q 50 ${CURVE_H - depth} 0 ${CURVE_H} Z`;
        barrigaRef.current.setAttribute("d", d);
      } else if (projectsRef.current) {
        projectsRef.current.style.transform = "translateY(100vh)";
      }

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("wheel",      onWheel);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      document.body.style.overflow = "";
    };
  }, []);

  function switchLocale(newLocale: string) {
    router.push(newLocale === "ca" ? "/" : `/${newLocale}/`);
    setMenuOpen(false);
  }

  const localeKey = locale as "ca" | "es" | "en";

  return (
    <>
      <style>{`
        @keyframes pu-hint-drop {
          0%,100% { transform: translateY(0); }
          55%      { transform: translateY(8px); }
        }
      `}</style>

      {/* ── Scene ─────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, overflow: "hidden" }}>

        {/* LAYER A — Parallax grid */}
        <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            display: "flex", flexDirection: "column", gap: `${GUTTER}px`,
          }}>
            {GRID.map((row, ri) => (
              <div
                key={ri}
                ref={(el) => { rowRefs.current[ri] = el; }}
                style={{ display: "flex", gap: `${GUTTER}px`, height: `${CELL_H_VH}vh`, flexShrink: 0, willChange: "transform" }}
              >
                {row.map((src, ci) => (
                  <div key={ci} style={{
                    flex: `0 0 calc(${100 / COLS}% - ${(GUTTER * (COLS - 1)) / COLS}px)`,
                    overflow: "hidden",
                  }}>
                    <img src={src} alt="" aria-hidden loading={ri < 2 ? "eager" : "lazy"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* LAYER B — White hero panel */}
        <div
          ref={heroRef}
          style={{
            position: "absolute", inset: 0, zIndex: 10,
            background: "#ffffff", transformOrigin: "center center", willChange: "transform",
          }}
        >
          {/* Nav bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "88px",
            display: "flex", alignItems: "center", padding: "0 32px",
          }}>
            <Link href={localizeHref("/", locale)} style={{ flexShrink: 0, textDecoration: "none" }}>
              <img src="/logo-nuevo.png" alt="Peralta Urbanisme"
                style={{ width: "196px", height: "auto", objectFit: "contain", display: "block" }} />
            </Link>

            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label={menuOpen ? "Tancar menú" : "Obrir menú"}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
                <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
                <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                {LOCALES.map((loc, i) => (
                  <span key={loc} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button onClick={() => switchLocale(loc)} style={{
                      fontSize: "10px", letterSpacing: "0.10em",
                      fontWeight: locale === loc ? 700 : 400,
                      color: locale === loc ? "#000" : "#ccc",
                      background: "none", border: "none", cursor: "pointer", padding: 0, textTransform: "uppercase",
                    }}>{loc}</button>
                    {i < LOCALES.length - 1 && <span style={{ color: "#e8e8e8" }}>/</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div ref={hintRef} style={{
            position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
            userSelect: "none", pointerEvents: "none", fontFamily: "var(--font-mono)",
          }}>
            <span style={{ fontSize: "9px", letterSpacing: "0.22em", color: "#c8c8c8", textTransform: "uppercase" }}>scroll</span>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "pu-hint-drop 2.4s ease-in-out infinite" }}>
              <span style={{ display: "block", width: "1px", height: "32px", background: "#dedede" }} />
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ display: "block" }}>
                <path d="M0.5 0.5L4 4.5L7.5 0.5" stroke="#dedede" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ── LAYER C — Projects panel (Phase 2) ────────────────────────── */}
      <div
        ref={projectsRef}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "#ffffff",
          transform: "translateY(100vh)",
          willChange: "transform",
          overflow: "visible",
        }}
      >
        {/* Barriga SVG — sits above the panel, creates the curved top edge */}
        <svg
          aria-hidden
          style={{
            position: "absolute",
            top: -CURVE_H,
            left: 0,
            right: 0,
            width: "100%",
            height: CURVE_H,
            display: "block",
            overflow: "visible",
          }}
          viewBox={`0 0 100 ${CURVE_H}`}
          preserveAspectRatio="none"
        >
          <path
            ref={barrigaRef}
            d={`M 0 0 L 100 0 L 100 ${CURVE_H} L 0 ${CURVE_H} Z`}
            fill="#ffffff"
          />
        </svg>

        {/* Projects content */}
        <div style={{
          position: "absolute", inset: 0,
          overflowY: "auto",
          padding: "80px 48px 120px",
          fontFamily: "var(--font-sans)",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: "48px",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase" }}>
              Projectes
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", color: "#ccc" }}>
              {pad2(projects.length)}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#1a1a1a", marginBottom: "0" }} />

          {/* Project list */}
          {projects.map((p, i) => {
            const data = p[localeKey];
            return (
              <Link
                key={p.slug}
                href={localizeHref(`/projectes/${p.slug}`, locale)}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr auto",
                  alignItems: "baseline",
                  gap: "0 24px",
                  padding: "28px 0",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                }}>
                  {/* Index */}
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "11px",
                    letterSpacing: "0.06em", color: "#ccc", paddingTop: "3px",
                  }}>
                    {pad2(i + 1)}
                  </span>

                  {/* Title + metadata */}
                  <div>
                    <div style={{
                      fontSize: "clamp(18px, 2vw, 26px)",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.15,
                      color: "#111",
                      marginBottom: "6px",
                    }}>
                      {data.title}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)", fontSize: "10px",
                      letterSpacing: "0.08em", color: "#aaa", textTransform: "uppercase",
                    }}>
                      {data.municipality} · {data.tipus}
                    </div>
                  </div>

                  {/* Year */}
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "11px",
                    letterSpacing: "0.06em", color: "#bbb",
                    whiteSpace: "nowrap",
                  }}>
                    {data.year}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Footer link */}
          <div style={{ paddingTop: "48px" }}>
            <Link href={localizeHref("/projectes", locale)} style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#111", textDecoration: "none",
              borderBottom: "1px solid #111", paddingBottom: "2px",
            }}>
              Veure tots els projectes →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Menu overlay ──────────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "#ffffff", display: "flex", flexDirection: "column",
          fontFamily: "var(--font-sans)",
        }}>
          <div style={{ display: "flex", alignItems: "center", height: "88px", padding: "0 32px", flexShrink: 0 }}>
            <img src="/logo-nuevo.png" alt="Peralta Urbanisme" style={{ width: "196px", height: "auto" }} />
            <button onClick={() => setMenuOpen(false)} style={{
              marginLeft: "auto", background: "none", border: "none",
              cursor: "pointer", fontSize: "26px", lineHeight: 1, padding: "4px", color: "#000",
            }} aria-label="Tancar menú">×</button>
          </div>

          <div style={{ height: "1px", background: "#1a1a1a", flexShrink: 0 }} />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 32px" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={href} href={localizeHref(href, locale)} onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600, color: "#000",
                    textDecoration: "none", letterSpacing: "-0.01em", lineHeight: 1.25,
                    padding: "8px 0",
                  }}>
                  {label}
                </Link>
              ))}
            </nav>

            <div style={{
              marginTop: "auto", display: "flex", gap: "12px", alignItems: "center",
              fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.10em",
            }}>
              {LOCALES.map((loc, i) => (
                <span key={loc} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button onClick={() => switchLocale(loc)} style={{
                    fontSize: "11px", letterSpacing: "0.10em",
                    fontWeight: locale === loc ? 700 : 400,
                    color: locale === loc ? "#000" : "#aaa",
                    background: "none", border: "none", cursor: "pointer", padding: 0, textTransform: "uppercase",
                  }}>{loc}</button>
                  {i < LOCALES.length - 1 && <span style={{ color: "#e0e0e0" }}>/</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
