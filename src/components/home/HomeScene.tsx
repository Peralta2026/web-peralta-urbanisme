"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/lib/types";
import ProjectViewer, { type ProjectViewerHandle } from "./ProjectViewer";

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

/* ─── Mosaic ─────────────────────────────────────────────────────────────── */

const LEFT_SRCS  = ["/grid/01.jpg", "/grid/03.jpg", "/grid/05.jpg", "/grid/07.jpg", "/grid/09.jpg"];
const RIGHT_SRCS = ["/grid/02.jpg", "/grid/04.jpg", "/grid/06.jpg", "/grid/08.jpg", "/grid/10.jpg"];

const COL_GAP   = 14;
const STRIP_GAP = 14;
const IMG_H_VH  = 0.42;
const SPEED_L   = 55;
const SPEED_R   = 38;

/* ─── Scroll constants ───────────────────────────────────────────────────── */

const HERO_RANGE  = 1100;
const RISE_RANGE  = 700;
const TOTAL_RANGE = HERO_RANGE + RISE_RANGE;
const HERO_START  = 1.0;
const HERO_MIN    = 0.44;
const LERP_K      = 0.08;

/* ─── Easings ────────────────────────────────────────────────────────────── */

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * Math.min(t, 1)) - 1) / 2;
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - Math.min(t, 1), 4);
}

/* ─── HomeScene ──────────────────────────────────────────────────────────── */

interface Props {
  locale:   string;
  projects: Project[];
}

export default function HomeScene({ locale, projects }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const viewerRef = useRef<ProjectViewerHandle>(null);

  /* scroll refs */
  const heroRef     = useRef<HTMLDivElement>(null);
  const hintRef     = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const vY          = useRef(0);
  const sY          = useRef(0);
  const rafId       = useRef(0);

  /* mosaic refs */
  const leftColRef  = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftOffset  = useRef(0);
  const rightOffset = useRef(0);
  const lastTime    = useRef(0);
  const loopH       = useRef(0);

  useEffect(() => {
    const imgH = window.innerHeight * IMG_H_VH;
    loopH.current    = LEFT_SRCS.length * (imgH + COL_GAP);
    rightOffset.current = loopH.current * 0.4;

    document.body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const raw = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;

      if (sY.current < TOTAL_RANGE - 5) {
        vY.current = Math.max(0, Math.min(vY.current + raw * 0.7, TOTAL_RANGE));
      } else {
        viewerRef.current?.addDelta(raw);
      }
    };

    let t0 = 0;
    const onTouchStart = (e: TouchEvent) => { t0 = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      e.preventDefault();
      const delta = t0 - e.touches[0].clientY;
      t0 = e.touches[0].clientY;
      if (sY.current < TOTAL_RANGE - 5) {
        vY.current = Math.max(0, Math.min(vY.current + delta, TOTAL_RANGE));
      } else {
        viewerRef.current?.addDelta(delta);
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

      /* mosaic */
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

      /* Phase 1 — hero shrink */
      const p1    = Math.min(1, sy / HERO_RANGE);
      const scale = HERO_START - easeInOutSine(p1) * (HERO_START - HERO_MIN);
      if (heroRef.current) heroRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      if (hintRef.current) hintRef.current.style.opacity  = Math.max(0, 1 - p1 * 3).toFixed(3);

      /* Phase 2 — projects panel rise */
      if (projectsRef.current) {
        if (sy > HERO_RANGE) {
          const p2  = Math.min(1, (sy - HERO_RANGE) / RISE_RANGE);
          const ep2 = easeOutQuart(p2);
          projectsRef.current.style.transform = `translateY(${((1 - ep2) * 100).toFixed(2)}vh)`;
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
      `}</style>

      {/* ── SCENE ─────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 100, overflow: "hidden" }}>

        {/* MOSAIC — 2 columnes verticals autònomes */}
        <div style={{
          position:   "absolute",
          inset:      0,
          background: "#242320",
          display:    "flex",
          gap:        `${STRIP_GAP}px`,
        }}>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div ref={leftColRef} style={{
              position: "absolute", top: 0, left: 0, right: 0,
              display: "flex", flexDirection: "column", gap: `${COL_GAP}px`,
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
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div ref={rightColRef} style={{
              position: "absolute", top: 0, left: 0, right: 0,
              display: "flex", flexDirection: "column", gap: `${COL_GAP}px`,
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

        {/* HERO — composició editorial dins el panell blanc */}
        <div ref={heroRef} style={{
          position:        "absolute",
          inset:           0,
          zIndex:          10,
          background:      "#ffffff",
          transformOrigin: "center center",
          willChange:      "transform",
        }}>
          {/* Hero centre — logo gran + controls */}
          <div style={{
            position:       "absolute",
            top:            "50%",
            left:           "50%",
            transform:      "translate(-50%, -50%)",
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            "clamp(28px, 4.5vh, 52px)",
          }}>
            {/* Logo centrat i gran */}
            <Link href={localizeHref("/", locale)} style={{ textDecoration: "none", display: "block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-nuevo.png"
                alt="Peralta Urbanisme"
                style={{ width: "clamp(300px, 42vw, 580px)", height: "auto", display: "block" }}
              />
            </Link>

            {/* Controls — menú + idiomes */}
            <div style={{
              display:     "flex",
              alignItems:  "center",
              gap:         "24px",
              fontFamily:  "var(--font-mono)",
            }}>
              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menú"
                style={{
                  background:    "none",
                  border:        "none",
                  cursor:        "pointer",
                  padding:       0,
                  display:       "flex",
                  flexDirection: "column",
                  gap:           "6px",
                }}
              >
                <span style={{ display: "block", width: "26px", height: "1px", background: "#111" }} />
                <span style={{ display: "block", width: "26px", height: "1px", background: "#111" }} />
                <span style={{ display: "block", width: "26px", height: "1px", background: "#111" }} />
              </button>

              {/* Divisor */}
              <span style={{ display: "block", width: "1px", height: "16px", background: "#ddd" }} />

              {/* Idiomes */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {LOCALES.map((loc, i) => (
                  <span key={loc} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => switchLocale(loc)} style={{
                      fontSize:      "12px",
                      letterSpacing: "0.10em",
                      fontWeight:    locale === loc ? 700 : 400,
                      color:         locale === loc ? "#000" : "#bbb",
                      background:    "none",
                      border:        "none",
                      cursor:        "pointer",
                      padding:       0,
                      textTransform: "uppercase",
                    }}>{loc}</button>
                    {i < LOCALES.length - 1 && <span style={{ color: "#e0e0e0", fontSize: "12px" }}>/</span>}
                  </span>
                ))}
              </div>
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
        position:   "fixed",
        inset:      0,
        zIndex:     150,
        background: "#f0f0f0",
        transform:  "translateY(100vh)",
        willChange: "transform",
        overflow:   "hidden",
      }}>
        {/* Hamburger flotant */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menú"
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
          }}
        >
          <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
          <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
          <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
        </button>

        {/* Project Viewer */}
        <ProjectViewer ref={viewerRef} projects={projects} locale={locale} />
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
                    fontSize:       "clamp(28px, 4vw, 44px)",
                    fontWeight:     600,
                    color:          "#000",
                    textDecoration: "none",
                    letterSpacing:  "-0.01em",
                    lineHeight:     1.25,
                    padding:        "8px 0",
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
