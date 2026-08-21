"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/lib/types";
import ProjectViewer, { type ProjectViewerHandle } from "./ProjectViewer";

/* ─── Mosaic ─────────────────────────────────────────────────────────────── */

const LEFT_SRCS  = ["/grid/01.jpg", "/grid/03.jpg", "/grid/05.jpg", "/grid/07.jpg", "/grid/09.jpg"];
const RIGHT_SRCS = ["/grid/02.jpg", "/grid/04.jpg", "/grid/06.jpg", "/grid/08.jpg", "/grid/10.jpg"];
const COL_GAP   = 14;
const STRIP_GAP = 14;
const IMG_H_VH  = 0.42;
const SPEED_L   = 55;
const SPEED_R   = 38;

/* ─── Scroll constants ───────────────────────────────────────────────────── */

const HERO_SHRINK_END = 480;          // hero finishes shrinking at 480px scroll
const SETTLE_START    = 240;          // content starts transitioning at 240px
const SETTLE_END      = 500;          // content fully settled at 500px
const RISE_START      = 720;          // pause ~220px after settle, then panel rises
const RISE_RANGE      = 700;          // projects fully up after another 700px
const TOTAL_RANGE     = RISE_START + RISE_RANGE;
const HERO_MIN        = 0.88;         // hero shrinks to 88% of viewport (subtle)
const LERP_K          = 0.08;
const CURVE_H         = 32;
const PANEL_BG        = "#f7f6f3";

const LOCALES = ["ca", "es", "en"] as const;

/* ─── Easings ────────────────────────────────────────────────────────────── */

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * Math.min(t, 1)) - 1) / 2;
}
function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - Math.min(t, 1), 4);
}

/* ─── i18n content ───────────────────────────────────────────────────────── */

const HERO_CONTENT = {
  ca: {
    line1: "El potencial d'un lloc no sempre és evident.",
    line2: "Saber veure'l és el principi del projecte.",
    line3: "Una mirada sensible. Un llapis audaç.",
    line4: "Urbanisme estratègic per transformar la complexitat en oportunitats de ciutat.",
    links: [
      { label: "Mapa ↗",      href: "/mapa",      sub: "On treballem" },
      { label: "Persones ↗",  href: "/persones",  sub: "Qui mira"     },
      { label: "Principis ↗", href: "/principis", sub: "Com pensem"   },
    ],
  },
  es: {
    line1: "El potencial de un lugar no siempre es evidente.",
    line2: "Saberlo ver es el principio del proyecto.",
    line3: "Una mirada sensible. Un lápiz audaz.",
    line4: "Urbanismo estratégico para transformar la complejidad en oportunidades de ciudad.",
    links: [
      { label: "Mapa ↗",       href: "/mapa",      sub: "Dónde trabajamos" },
      { label: "Personas ↗",   href: "/persones",  sub: "Quién mira"       },
      { label: "Principios ↗", href: "/principis", sub: "Cómo pensamos"    },
    ],
  },
  en: {
    line1: "The potential of a place is not always evident.",
    line2: "Knowing how to see it is the beginning of the project.",
    line3: "A sensitive gaze. A bold pencil.",
    line4: "Strategic urbanism to transform complexity into city opportunities.",
    links: [
      { label: "Map ↗",        href: "/mapa",      sub: "Where we work" },
      { label: "People ↗",     href: "/persones",  sub: "Who looks"     },
      { label: "Principles ↗", href: "/principis", sub: "How we think"  },
    ],
  },
} as const;

/* ─── Helper components (outside HomeScene to avoid remount) ─────────────── */

function LangSelectorHero({ locale }: { locale: string }) {
  const router = useRouter();
  function switchLocale(newLocale: string) {
    router.push(`/${newLocale}/`);
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.10em" }}>
      {LOCALES.map((loc, i) => (
        <span key={loc} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => switchLocale(loc)} style={{ fontSize: "11px", letterSpacing: "0.10em", fontWeight: locale === loc ? 700 : 400, color: locale === loc ? "#000" : "#bbb", background: "none", border: "none", cursor: "pointer", padding: 0, textTransform: "uppercase" }}>
            {loc}
          </button>
          {i < LOCALES.length - 1 && <span style={{ color: "#ddd" }}>/</span>}
        </span>
      ))}
    </div>
  );
}

function NavLinkHero({ label, sub, href, locale }: { label: string; sub: string; href: string; locale: string }) {
  const [hovered, setHovered] = useState(false);
  const dest = `/${locale}${href}`;
  return (
    <Link href={dest} style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#000", fontWeight: 600, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ display: "block", height: "17px", marginTop: "5px", overflow: "hidden" }}>
        <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "12px", color: "#999", letterSpacing: "0.01em", transition: "transform 220ms ease, opacity 220ms ease", transform: hovered ? "translateY(0)" : "translateY(7px)", opacity: hovered ? 1 : 0 }}>
          {sub}
        </span>
      </span>
    </Link>
  );
}

/* ─── HomeScene ──────────────────────────────────────────────────────────── */

interface Props {
  locale:   string;
  projects: Project[];
}

export default function HomeScene({ locale, projects }: Props) {
  const content = HERO_CONTENT[(locale as keyof typeof HERO_CONTENT)] ?? HERO_CONTENT.ca;

  const viewerRef = useRef<ProjectViewerHandle>(null);

  /* DOM refs for RAF animation */
  const heroRef         = useRef<HTMLDivElement>(null);
  const initialLayerRef = useRef<HTMLDivElement>(null);
  const settledLayerRef = useRef<HTMLDivElement>(null);
  const hintRef         = useRef<HTMLDivElement>(null);
  const projectsRef     = useRef<HTMLDivElement>(null);
  const leftColRef      = useRef<HTMLDivElement>(null);
  const rightColRef     = useRef<HTMLDivElement>(null);

  /* scroll state (no React state — RAF only) */
  const vY       = useRef(0);
  const sY       = useRef(0);
  const rafId    = useRef(0);
  const lastTime = useRef(0);
  const loopH    = useRef(0);
  const leftOff  = useRef(0);
  const rightOff = useRef(0);

  useEffect(() => {
    const imgH = window.innerHeight * IMG_H_VH;
    loopH.current   = LEFT_SRCS.length * (imgH + COL_GAP);
    rightOff.current = loopH.current * 0.4;

    document.body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const raw = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      if (sY.current < TOTAL_RANGE - 5) {
        vY.current = Math.max(0, Math.min(vY.current + raw * 0.7, TOTAL_RANGE));
      } else if (raw < 0 && (viewerRef.current?.isAtTop() ?? true)) {
        /* scroll up from top of viewer → go back to hero */
        vY.current = Math.max(0, vY.current + raw * 0.7);
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
      } else if (delta < 0 && (viewerRef.current?.isAtTop() ?? true)) {
        vY.current = Math.max(0, vY.current + delta);
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

      /* mosaic scroll */
      if (loopH.current > 0) {
        leftOff.current  = (leftOff.current  + SPEED_L * dt) % loopH.current;
        rightOff.current = (rightOff.current + SPEED_R * dt) % loopH.current;
        if (leftColRef.current)  leftColRef.current.style.transform  = `translateY(-${leftOff.current.toFixed(1)}px)`;
        if (rightColRef.current) rightColRef.current.style.transform = `translateY(-${rightOff.current.toFixed(1)}px)`;
      }

      /* lerp scroll */
      sY.current += (vY.current - sY.current) * LERP_K;
      const sy = sY.current;

      /* Phase 1 — hero shrinks (0 → HERO_SHRINK_END) */
      const p1    = Math.min(1, sy / HERO_SHRINK_END);
      const scale = HERO_MIN + (1 - HERO_MIN) * (1 - easeInOutSine(p1));
      if (heroRef.current) heroRef.current.style.transform = `scale(${scale.toFixed(4)})`;

      /* Phase 1b — content crossfade (SETTLE_START → SETTLE_END) */
      const settleRaw = (sy - SETTLE_START) / (SETTLE_END - SETTLE_START);
      const settleP   = easeInOutSine(Math.max(0, Math.min(1, settleRaw)));
      if (initialLayerRef.current) initialLayerRef.current.style.opacity = (1 - settleP).toFixed(3);
      if (settledLayerRef.current) settledLayerRef.current.style.opacity = settleP.toFixed(3);
      if (hintRef.current)         hintRef.current.style.opacity         = Math.max(0, 1 - settleP * 2.5).toFixed(3);

      /* Phase 2 — projects panel rises (RISE_START → TOTAL_RANGE) */
      if (projectsRef.current) {
        if (sy > RISE_START) {
          const p2  = Math.min(1, (sy - RISE_START) / RISE_RANGE);
          const ep2 = easeOutQuart(p2);
          const curveV = (CURVE_H * (1 - ep2)).toFixed(1);
          projectsRef.current.style.transform = `translateY(${((1 - ep2) * 100).toFixed(2)}vh)`;
          projectsRef.current.style.borderRadius = `50% 50% 0 0 / ${curveV}px ${curveV}px 0 0`;
          /* Logo fades in when panel is nearly full — via handle */
          const navOpacity = ep2 > 0.82 ? Math.min(1, (ep2 - 0.82) / 0.18) : 0;
          viewerRef.current?.setLogoOpacity(navOpacity);
        } else {
          projectsRef.current.style.transform = "translateY(100vh)";
          projectsRef.current.style.borderRadius = `50% 50% 0 0 / ${CURVE_H}px ${CURVE_H}px 0 0`;
        }
      }

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("wheel",      onWheel);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      cancelAnimationFrame(rafId.current);
      document.body.style.overflow = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const localizeHref = (href: string) => `/${locale}${href}`;

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

        {/* MOSAIC */}
        <div style={{ position: "absolute", inset: 0, background: "#ffffff", display: "flex", gap: `${STRIP_GAP}px` }}>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div ref={leftColRef} style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", flexDirection: "column", gap: `${COL_GAP}px` }}>
              {[...LEFT_SRCS, ...LEFT_SRCS].map((src, i) => (
                <div key={i} style={{ height: `${(IMG_H_VH * 100).toFixed(0)}vh`, flexShrink: 0, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" aria-hidden loading="eager" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div ref={rightColRef} style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", flexDirection: "column", gap: `${COL_GAP}px` }}>
              {[...RIGHT_SRCS, ...RIGHT_SRCS].map((src, i) => (
                <div key={i} style={{ height: `${(IMG_H_VH * 100).toFixed(0)}vh`, flexShrink: 0, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" aria-hidden loading="eager" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HERO */}
        <div ref={heroRef} style={{ position: "absolute", inset: 0, zIndex: 10, background: "#ffffff", transformOrigin: "center center", willChange: "transform" }}>

          {/* Language selector — always top-right */}
          <div style={{ position: "absolute", top: "28px", right: "36px", zIndex: 20 }}>
            <LangSelectorHero locale={locale} />
          </div>

          {/* Layer 1 — initial: centered logo */}
          <div ref={initialLayerRef} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Link href={localizeHref("/")} style={{ textDecoration: "none", display: "block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-nuevo.png" alt="Peralta Urbanisme" style={{ width: "clamp(280px, 40vw, 540px)", height: "auto", display: "block" }} />
            </Link>
          </div>

          {/* Layer 2 — settled: logo top + editorial text + nav links */}
          <div ref={settledLayerRef} style={{ position: "absolute", inset: 0, opacity: 0, display: "flex", flexDirection: "column", padding: "clamp(28px, 4vh, 48px) clamp(36px, 5vw, 64px)" }}>

            {/* Logo top-left */}
            <Link href={localizeHref("/")} style={{ textDecoration: "none", display: "inline-block", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-nuevo.png" alt="Peralta Urbanisme" style={{ width: "clamp(160px, 20vw, 210px)", height: "auto", display: "block" }} />
            </Link>

            {/* Spacer — empuja el bloque text+links hacia abajo */}
            <div style={{ flex: 1 }} />

            {/* Texto editorial + botones — agrupados, botones pegados al texto */}
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(22px, 3vh, 36px)", maxWidth: "min(760px, 85%)", paddingBottom: "clamp(12px, 2vh, 24px)" }}>
              {/* Texto */}
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(24px, 3vw, 42px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: "#000", margin: "0 0 0.15em" }}>
                  {content.line1}
                </p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(24px, 3vw, 42px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: "#000", margin: "0 0 1.4em" }}>
                  {content.line2}
                </p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(17px, 2vw, 26px)", fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.35, color: "#111", margin: "0 0 0.7em" }}>
                  {content.line3}
                </p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(14px, 1.4vw, 18px)", fontWeight: 400, lineHeight: 1.6, color: "#666", margin: 0 }}>
                  {content.line4}
                </p>
              </div>

              {/* Nav links — sin cajas, bajo el texto */}
              <div style={{ display: "flex", gap: "clamp(24px, 3.5vw, 52px)", alignItems: "flex-start" }}>
                {content.links.map(link => (
                  <NavLinkHero key={link.href} label={link.label} sub={link.sub} href={link.href} locale={locale} />
                ))}
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div ref={hintRef} style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", userSelect: "none", pointerEvents: "none", fontFamily: "var(--font-mono)" }}>
            <span style={{ fontSize: "9px", letterSpacing: "0.22em", color: "rgba(0,0,0,0.35)", textTransform: "uppercase" }}>
              Scroll Down
            </span>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "pu-hint-drop 2.4s ease-in-out infinite" }}>
              <span style={{ display: "block", width: "1px", height: "32px", background: "rgba(0,0,0,0.22)" }} />
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ display: "block" }}>
                <path d="M0.5 0.5L4 4.5L7.5 0.5" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ── PROJECTS PANEL ────────────────────────────────────────────── */}
      <div ref={projectsRef} style={{ position: "fixed", inset: 0, zIndex: 150, background: PANEL_BG, transform: "translateY(100vh)", willChange: "transform, border-radius", borderRadius: `50% 50% 0 0 / ${CURVE_H}px ${CURVE_H}px 0 0`, overflow: "hidden" }}>
        <ProjectViewer ref={viewerRef} projects={projects} locale={locale} />
      </div>
    </>
  );
}
