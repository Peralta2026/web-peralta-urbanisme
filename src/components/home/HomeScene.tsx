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

/* ─── Tag labels ─────────────────────────────────────────────────────────── */

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

/* ─── Mosaic — 2 autonomous vertical columns ─────────────────────────────── */

const LEFT_SRCS  = ["/grid/01.jpg", "/grid/03.jpg", "/grid/05.jpg", "/grid/07.jpg", "/grid/09.jpg"];
const RIGHT_SRCS = ["/grid/02.jpg", "/grid/04.jpg", "/grid/06.jpg", "/grid/08.jpg", "/grid/10.jpg"];

const COL_GAP   = 14;   // px between images within each column
const STRIP_GAP = 14;   // px between the two columns
const IMG_H_VH  = 0.42; // each image = 42vh
const SPEED_L   = 55;   // px/s left column (faster)
const SPEED_R   = 38;   // px/s right column (slower)

/* ─── Scroll constants ───────────────────────────────────────────────────── */

const HERO_RANGE  = 1100;
const RISE_RANGE  = 700;
const TOTAL_RANGE = HERO_RANGE + RISE_RANGE;
const HERO_MIN    = 0.44;
const LERP_K      = 0.08;
const CURVE_H     = 80;
const SNAP_THRESH = 120;

/* ─── Easings ────────────────────────────────────────────────────────────── */

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * Math.min(t, 1)) - 1) / 2;
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - Math.min(t, 1), 4);
}

function pad2(n: number) { return String(n).padStart(2, "0"); }

/* ─── ProjectSlide (outside HomeScene to avoid re-mount issues) ──────────── */

interface SlideProps {
  project:   Project;
  locale:    string;
  projIdx:   number;
  total:     number;
  imgIdx:    number;
  expanded:  boolean;
  onImgNext: () => void;
  onExpand:  () => void;
}

function ProjectSlide({ project, locale, projIdx, total, imgIdx, expanded, onImgNext, onExpand }: SlideProps) {
  const data   = project[locale as "ca" | "es" | "en"];
  const images = project.images.length > 0 ? project.images : [project.coverImage];
  const imgSrc = `/projects/${project.slug}/${images[imgIdx] ?? project.coverImage}`;
  const hasMore = images.length > 1;
  const hasLong = data.descriptionLong && data.descriptionLong !== data.descriptionShort;

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "1fr 1fr",
      height:              "100vh",
      flexShrink:          0,
    }}>

      {/* ── LEFT: text ──────────────────────────────────────────────── */}
      <div style={{
        height:          "100%",
        overflowY:       "auto",
        display:         "flex",
        flexDirection:   "column",
        padding:         "48px 52px 48px 48px",
        borderRight:     "1px solid #f0f0f0",
        fontFamily:      "var(--font-sans)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "40px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.10em", color: "#ccc" }}>
            {pad2(projIdx + 1)} — {pad2(total)}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em", color: "#ddd", textTransform: "uppercase" }}>
            ↑ ↓ navegar
          </span>
        </div>

        <h2 style={{
          fontSize:      "clamp(22px, 2.4vw, 38px)",
          fontWeight:    700,
          letterSpacing: "-0.02em",
          lineHeight:    1.1,
          color:         "#111",
          marginBottom:  "14px",
        }}>
          {data.title}
        </h2>

        <p style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "10px",
          letterSpacing: "0.08em",
          color:         "#aaa",
          textTransform: "uppercase",
          marginBottom:  "28px",
          lineHeight:    1.6,
        }}>
          {data.municipality}<br />
          {data.year} · {data.tipus}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "32px" }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "9px",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color:         "#999",
              border:        "1px solid #e8e8e8",
              padding:       "3px 7px",
            }}>
              {TAG_LABELS[tag] ?? tag}
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{
            fontSize:     "15px",
            lineHeight:   1.65,
            color:        "#444",
            marginBottom: hasLong ? "16px" : "0",
            whiteSpace:   "pre-line",
          }}>
            {expanded ? data.descriptionLong : data.descriptionShort}
          </p>
          {hasLong && (
            <button onClick={onExpand} style={{
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
            }}>
              {expanded ? "Llegir menys" : "Llegir més"}
            </button>
          )}
        </div>

        <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #f0f0f0" }}>
          <Link
            href={localizeHref(`/projectes/${project.slug}`, locale)}
            style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color:         "#111",
              textDecoration:"none",
              borderBottom:  "1px solid #111",
              paddingBottom: "2px",
            }}
          >
            Veure projecte →
          </Link>
        </div>
      </div>

      {/* ── RIGHT: image ────────────────────────────────────────────── */}
      <div
        onClick={hasMore ? onImgNext : undefined}
        style={{
          height:   "100%",
          overflow: "hidden",
          position: "relative",
          cursor:   hasMore ? "pointer" : "default",
          background: "#f5f5f5",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={data.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {hasMore && (
          <div style={{
            position:   "absolute",
            bottom:     "16px",
            right:      "16px",
            fontFamily: "var(--font-mono)",
            fontSize:   "10px",
            letterSpacing: "0.06em",
            color:      "rgba(255,255,255,0.9)",
            background: "rgba(0,0,0,0.35)",
            padding:    "4px 8px",
            backdropFilter: "blur(4px)",
          }}>
            {imgIdx + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── HomeScene ──────────────────────────────────────────────────────────── */

interface Props {
  locale:   string;
  projects: Project[];
}

export default function HomeScene({ locale, projects }: Props) {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [projState, setProjState]  = useState({ idx: 0, imgIdx: 0, expanded: false });
  const router = useRouter();

  /* scroll refs */
  const heroRef     = useRef<HTMLDivElement>(null);
  const hintRef     = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const barrigaRef  = useRef<SVGPathElement>(null);
  const sliderRef   = useRef<HTMLDivElement>(null);
  const vY          = useRef(0);
  const sY          = useRef(0);
  const rafId       = useRef(0);
  const snapAcc     = useRef(0);

  /* mosaic refs */
  const leftColRef  = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftOffset  = useRef(0);
  const rightOffset = useRef(0);
  const lastTime    = useRef(0);
  const loopH       = useRef(0);

  /* update slider when project changes */
  useEffect(() => {
    if (!sliderRef.current) return;
    sliderRef.current.style.transform = `translateY(-${projState.idx * window.innerHeight}px)`;
  }, [projState.idx]);

  useEffect(() => {
    /* mosaic loop height (computed from actual viewport) */
    const imgH = window.innerHeight * IMG_H_VH;
    loopH.current    = LEFT_SRCS.length * (imgH + COL_GAP);
    rightOffset.current = loopH.current * 0.4;

    document.body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const raw = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;

      if (sY.current >= TOTAL_RANGE - 5) {
        snapAcc.current += raw;
        if (snapAcc.current > SNAP_THRESH) {
          setProjState(s => ({ idx: Math.min(s.idx + 1, projects.length - 1), imgIdx: 0, expanded: false }));
          snapAcc.current = 0;
        } else if (snapAcc.current < -SNAP_THRESH) {
          setProjState(s => ({ idx: Math.max(s.idx - 1, 0), imgIdx: 0, expanded: false }));
          snapAcc.current = 0;
        }
      } else {
        vY.current = Math.max(0, Math.min(vY.current + raw * 0.7, TOTAL_RANGE));
      }
    };

    let t0 = 0;
    const onTouchStart = (e: TouchEvent) => { t0 = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      e.preventDefault();
      const delta = t0 - e.touches[0].clientY;
      t0 = e.touches[0].clientY;
      if (sY.current >= TOTAL_RANGE - 5) {
        snapAcc.current += delta;
        if (snapAcc.current > SNAP_THRESH) {
          setProjState(s => ({ idx: Math.min(s.idx + 1, projects.length - 1), imgIdx: 0, expanded: false }));
          snapAcc.current = 0;
        } else if (snapAcc.current < -SNAP_THRESH) {
          setProjState(s => ({ idx: Math.max(s.idx - 1, 0), imgIdx: 0, expanded: false }));
          snapAcc.current = 0;
        }
      } else {
        vY.current = Math.max(0, Math.min(vY.current + delta, TOTAL_RANGE));
      }
    };

    document.addEventListener("wheel",      onWheel,      { passive: false });
    document.addEventListener("touchstart", onTouchStart, { passive: true  });
    document.addEventListener("touchmove",  onTouchMove,  { passive: false });

    lastTime.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt  = Math.min((now - lastTime.current) / 1000, 0.1);
      lastTime.current = now;

      /* mosaic — time-based, independent of scroll */
      if (loopH.current > 0) {
        leftOffset.current  = (leftOffset.current  + SPEED_L * dt) % loopH.current;
        rightOffset.current = (rightOffset.current + SPEED_R * dt) % loopH.current;
        if (leftColRef.current)
          leftColRef.current.style.transform  = `translateY(-${leftOffset.current.toFixed(1)}px)`;
        if (rightColRef.current)
          rightColRef.current.style.transform = `translateY(-${rightOffset.current.toFixed(1)}px)`;
      }

      /* scroll lerp */
      sY.current += (vY.current - sY.current) * LERP_K;
      const sy = sY.current;

      /* Phase 1 — hero shrink (easeInOutSine: slow start, gradual) */
      const p1    = Math.min(1, sy / HERO_RANGE);
      const scale = 1 - easeInOutSine(p1) * (1 - HERO_MIN);
      if (heroRef.current) heroRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      if (hintRef.current) hintRef.current.style.opacity  = Math.max(0, 1 - p1 * 3).toFixed(3);

      /* Phase 2 — projects panel rises */
      if (projectsRef.current && barrigaRef.current) {
        if (sy > HERO_RANGE) {
          const p2    = Math.min(1, (sy - HERO_RANGE) / RISE_RANGE);
          const ep2   = easeOutQuart(p2);
          const depth = (1 - ep2) * CURVE_H;
          projectsRef.current.style.transform = `translateY(${((1 - ep2) * 100).toFixed(2)}vh)`;
          barrigaRef.current.setAttribute("d",
            `M 0 0 L 100 0 L 100 ${CURVE_H} Q 50 ${(CURVE_H - depth).toFixed(1)} 0 ${CURVE_H} Z`
          );
        } else {
          projectsRef.current.style.transform = "translateY(100vh)";
        }
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function switchLocale(newLocale: string) {
    router.push(newLocale === "ca" ? "/" : `/${newLocale}/`);
    setMenuOpen(false);
  }

  return (
    <>
      <style>{`
        @keyframes pu-hint-drop {
          0%,100% { transform: translateY(0); }
          55%      { transform: translateY(6px); }
        }
        .pu-slider { transition: transform 680ms cubic-bezier(0.65, 0, 0.35, 1); }
      `}</style>

      {/* ── SCENE ─────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, overflow: "hidden" }}>

        {/* MOSAIC — 2 vertical strips, autonomous loop */}
        <div style={{
          position:   "absolute",
          inset:      0,
          background: "#0a0a0a",
          display:    "flex",
          gap:        `${STRIP_GAP}px`,
        }}>
          {/* Left column — faster */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div ref={leftColRef} style={{
              position:      "absolute",
              top:           0, left: 0, right: 0,
              display:       "flex",
              flexDirection: "column",
              gap:           `${COL_GAP}px`,
            }}>
              {[...LEFT_SRCS, ...LEFT_SRCS].map((src, i) => (
                <div key={i} style={{ height: `${(IMG_H_VH * 100).toFixed(0)}vh`, flexShrink: 0, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" aria-hidden loading="eager"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right column — slower */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div ref={rightColRef} style={{
              position:      "absolute",
              top:           0, left: 0, right: 0,
              display:       "flex",
              flexDirection: "column",
              gap:           `${COL_GAP}px`,
            }}>
              {[...RIGHT_SRCS, ...RIGHT_SRCS].map((src, i) => (
                <div key={i} style={{ height: `${(IMG_H_VH * 100).toFixed(0)}vh`, flexShrink: 0, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" aria-hidden loading="eager"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HERO — white panel, floating composition, no nav bar */}
        <div ref={heroRef} style={{
          position:        "absolute",
          inset:           0,
          zIndex:          10,
          background:      "#ffffff",
          transformOrigin: "center center",
          willChange:      "transform",
        }}>
          {/* Logo — top left, floating */}
          <Link href={localizeHref("/", locale)}
            style={{ position: "absolute", top: "48px", left: "48px", textDecoration: "none", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nuevo.png" alt="Peralta Urbanisme"
              style={{ width: "clamp(200px, 22vw, 320px)", height: "auto", display: "block" }} />
          </Link>

          {/* Controls — top right, floating */}
          <div style={{
            position:      "absolute",
            top:           "48px",
            right:         "48px",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "flex-end",
            gap:           "12px",
          }}>
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Menú"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
              <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
              <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
              <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
              {LOCALES.map((loc, i) => (
                <span key={loc} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button onClick={() => switchLocale(loc)} style={{
                    fontSize:      "10px",
                    letterSpacing: "0.10em",
                    fontWeight:    locale === loc ? 700 : 400,
                    color:         locale === loc ? "#000" : "#ccc",
                    background:    "none",
                    border:        "none",
                    cursor:        "pointer",
                    padding:       0,
                    textTransform: "uppercase",
                  }}>{loc}</button>
                  {i < LOCALES.length - 1 && <span style={{ color: "#e8e8e8" }}>/</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div ref={hintRef} style={{
            position:      "absolute",
            bottom:        "40px",
            left:          "50%",
            transform:     "translateX(-50%)",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           "10px",
            userSelect:    "none",
            pointerEvents: "none",
            fontFamily:    "var(--font-mono)",
          }}>
            <span style={{ fontSize: "9px", letterSpacing: "0.22em", color: "#c8c8c8", textTransform: "uppercase" }}>
              Scroll Down
            </span>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "pu-hint-drop 2.4s ease-in-out infinite" }}>
              <span style={{ display: "block", width: "1px", height: "32px", background: "#dedede" }} />
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ display: "block" }}>
                <path d="M0.5 0.5L4 4.5L7.5 0.5" stroke="#dedede" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ── PROJECTS PANEL ────────────────────────────────────────────── */}
      <div ref={projectsRef} style={{
        position:  "fixed",
        inset:     0,
        zIndex:    50,
        background:"#ffffff",
        transform: "translateY(100vh)",
        willChange:"transform",
        overflow:  "visible",
      }}>
        {/* Barriga SVG */}
        <svg aria-hidden style={{
          position: "absolute",
          top:      -CURVE_H,
          left:     0, right: 0,
          width:    "100%",
          height:   CURVE_H,
          display:  "block",
          overflow: "visible",
        }} viewBox={`0 0 100 ${CURVE_H}`} preserveAspectRatio="none">
          <path ref={barrigaRef}
            d={`M 0 0 L 100 0 L 100 ${CURVE_H} L 0 ${CURVE_H} Z`}
            fill="#ffffff" />
        </svg>

        {/* Floating hamburger — no top bar */}
        <button onClick={() => setMenuOpen(o => !o)} aria-label="Menú"
          style={{
            position:      "absolute",
            top:           "28px",
            right:         "36px",
            zIndex:        10,
            background:    "none",
            border:        "none",
            cursor:        "pointer",
            padding:       0,
            display:       "flex",
            flexDirection: "column",
            gap:           "5px",
          }}>
          <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
          <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
          <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
        </button>

        {/* Slider viewport — full height, no top offset */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div ref={sliderRef} className="pu-slider" style={{ width: "100%", willChange: "transform" }}>
            {projects.map((p, i) => (
              <ProjectSlide
                key={p.slug}
                project={p}
                locale={locale}
                projIdx={i}
                total={projects.length}
                imgIdx={projState.idx === i ? projState.imgIdx : 0}
                expanded={projState.idx === i ? projState.expanded : false}
                onImgNext={() => setProjState(s => ({
                  ...s,
                  imgIdx: (s.imgIdx + 1) % (p.images.length || 1),
                }))}
                onExpand={() => setProjState(s => ({ ...s, expanded: !s.expanded }))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu overlay ──────────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          position:      "fixed",
          inset:         0,
          zIndex:        200,
          background:    "#ffffff",
          display:       "flex",
          flexDirection: "column",
          fontFamily:    "var(--font-sans)",
        }}>
          <div style={{ display: "flex", alignItems: "center", height: "88px", padding: "0 32px", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    fontSize:      "clamp(28px, 4vw, 44px)",
                    fontWeight:    600,
                    color:         "#000",
                    textDecoration:"none",
                    letterSpacing: "-0.01em",
                    lineHeight:    1.25,
                    padding:       "8px 0",
                  }}>
                  {label}
                </Link>
              ))}
            </nav>
            <div style={{
              marginTop:     "auto",
              display:       "flex",
              gap:           "12px",
              alignItems:    "center",
              fontFamily:    "var(--font-mono)",
              fontSize:      "11px",
              letterSpacing: "0.10em",
            }}>
              {LOCALES.map((loc, i) => (
                <span key={loc} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button onClick={() => switchLocale(loc)} style={{
                    fontSize:      "11px",
                    letterSpacing: "0.10em",
                    fontWeight:    locale === loc ? 700 : 400,
                    color:         locale === loc ? "#000" : "#aaa",
                    background:    "none",
                    border:        "none",
                    cursor:        "pointer",
                    padding:       0,
                    textTransform: "uppercase",
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
