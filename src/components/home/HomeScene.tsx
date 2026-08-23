"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project, TagSlug } from "@/lib/types";

/* ─── Featured slugs ─────────────────────────────────────────────────────── */

const FEATURED_SLUGS = [
  "la-miralda-pendent",
  "mpgm-bonaigua",
  "sant-cugat-andana",
  "diputacio-calaf",
  "amb-ppu-hospital-valles",
];

/* ─── Mosaic ─────────────────────────────────────────────────────────────── */

const LEFT_SRCS  = ["/grid/01.jpg", "/grid/03.jpg", "/grid/05.jpg", "/grid/07.jpg", "/grid/09.jpg"];
const RIGHT_SRCS = ["/grid/02.jpg", "/grid/04.jpg", "/grid/06.jpg", "/grid/08.jpg", "/grid/10.jpg"];
const COL_GAP   = 14;
const STRIP_GAP = 14;
const IMG_H_VH  = 0.42;
const SPEED_L   = 55;
const SPEED_R   = 38;

/* ─── Scroll constants ───────────────────────────────────────────────────── */

const SETTLE_START = 180;
const SETTLE_END   = 480;        // hero content fully settled
const OPEN_RANGE   = 380;        // hero slides UP, cards rise (480→860)
const CARDS_PER_STEP = 440;      // virtual px per card advance
const N_CARDS      = FEATURED_SLUGS.length;
const TOTAL_RANGE  = SETTLE_END + N_CARDS * CARDS_PER_STEP; // 480+2200=2680

const LERP_K = 0.08;

const LOCALES = ["ca", "es", "en"] as const;

const TAG_LABELS: Record<string, Record<TagSlug, string>> = {
  ca: {
    residencial: "Residencial", transformacio: "Transformació", extensio: "Extensió",
    regeneracio: "Regeneració", "activitat-economica": "Activitat econòmica",
    "infraestructura-verda": "Infraestructura verda", "integracio-infraestructures": "Integració d'infraestructures",
    "estructura-urbana": "Estructura urbana", divulgacio: "Divulgació", "espai-public": "Espai públic",
    "participacio-ciutadana": "Participació ciutadana", "encaixos-singulars": "Encaixos singulars",
  },
  es: {
    residencial: "Residencial", transformacio: "Transformación", extensio: "Extensión",
    regeneracio: "Regeneración", "activitat-economica": "Actividad económica",
    "infraestructura-verda": "Infraestructura verde", "integracio-infraestructures": "Integración de infraestructuras",
    "estructura-urbana": "Estructura urbana", divulgacio: "Divulgación", "espai-public": "Espacio público",
    "participacio-ciutadana": "Participación ciudadana", "encaixos-singulars": "Encajes singulares",
  },
  en: {
    residencial: "Residential", transformacio: "Transformation", extensio: "Extension",
    regeneracio: "Regeneration", "activitat-economica": "Economic activity",
    "infraestructura-verda": "Green infrastructure", "integracio-infraestructures": "Infrastructure integration",
    "estructura-urbana": "Urban structure", divulgacio: "Outreach", "espai-public": "Public space",
    "participacio-ciutadana": "Civic participation", "encaixos-singulars": "Singular insertions",
  },
};

/* ─── Easings ────────────────────────────────────────────────────────────── */

function easeInOutSine(t: number) { return -(Math.cos(Math.PI * Math.min(t, 1)) - 1) / 2; }

/* ─── i18n ───────────────────────────────────────────────────────────────── */

const CONTENT = {
  ca: {
    line1: "El potencial d'un lloc no sempre és evident.",
    line2: "Saber veure'l és el principi del projecte.",
    line3: "Una mirada sensible. Un llapis audaç.",
    line4: "Urbanisme estratègic per transformar la complexitat en oportunitats de ciutat.",
    links: [
      { label: "Mapa ↗",      href: "/mapa",      sub: "On treballem" },
      { label: "Persones ↗",  href: "/equip",     sub: "Qui mira"     },
      { label: "Principis ↗", href: "/principis", sub: "Com pensem"   },
    ],
    destacats: "Projectes destacats",
    explorar:  "Explorar tots els projectes",
  },
  es: {
    line1: "El potencial de un lugar no siempre es evidente.",
    line2: "Saberlo ver es el principio del proyecto.",
    line3: "Una mirada sensible. Un lápiz audaz.",
    line4: "Urbanismo estratégico para transformar la complejidad en oportunidades de ciudad.",
    links: [
      { label: "Mapa ↗",       href: "/mapa",      sub: "Dónde trabajamos" },
      { label: "Personas ↗",   href: "/equip",     sub: "Quién mira"       },
      { label: "Principios ↗", href: "/principis", sub: "Cómo pensamos"    },
    ],
    destacats: "Proyectos destacados",
    explorar:  "Explorar todos los proyectos",
  },
  en: {
    line1: "The potential of a place is not always evident.",
    line2: "Knowing how to see it is the beginning of the project.",
    line3: "A sensitive gaze. A bold pencil.",
    line4: "Strategic urbanism to transform complexity into city opportunities.",
    links: [
      { label: "Map ↗",        href: "/mapa",      sub: "Where we work" },
      { label: "People ↗",     href: "/equip",     sub: "Who looks"     },
      { label: "Principles ↗", href: "/principis", sub: "How we think"  },
    ],
    destacats: "Featured projects",
    explorar:  "Explore all projects",
  },
} as const;

/* ─── Card rolodex transform ─────────────────────────────────────────────── */

function applyCardTransforms(refs: (HTMLDivElement | null)[], dp: number) {
  const STACK_REST = 8;
  const PEAK_H     = 110;
  refs.forEach((el, i) => {
    if (!el) return;
    const delta = i - dp;
    const absD  = Math.abs(delta);
    if (absD > 2.5) { el.style.visibility = "hidden"; el.style.pointerEvents = "none"; return; }
    el.style.visibility = "visible";
    let ty: number, sc: number, bright: number, rx: number, z: number;
    if (delta < 0 && delta > -1.5) {
      const t   = Math.min(1, -delta);
      const arc = Math.sin(t * Math.PI);
      ty     = -arc * PEAK_H + t * STACK_REST;
      rx     = -arc * 12;
      sc     = Math.max(0.88, 1 - arc * 0.05 - t * 0.018);
      bright = Math.max(0.80, 1 - t * 0.10);
      z      = Math.round(1000 + delta * 180);
    } else if (delta <= -1.5) {
      const depth = Math.min(-delta, 2);
      ty = depth * STACK_REST; rx = 0;
      sc = Math.max(0.88, 1 - depth * 0.018);
      bright = Math.max(0.82, 1 - depth * 0.08);
      z  = Math.round(800 - (-delta) * 80);
    } else {
      const depth = Math.min(delta, 2);
      ty     = depth * STACK_REST;
      rx     = Math.min(delta, 1.5) * 3;
      sc     = Math.max(0.90, 1 - depth * 0.018);
      bright = Math.max(0.84, 1 - depth * 0.07);
      z      = Math.round(1000 - delta * 100);
    }
    el.style.transform = [
      `translate(-50%, calc(-50% + ${ty.toFixed(2)}px))`,
      `perspective(1400px)`,
      `rotateX(${rx.toFixed(2)}deg)`,
      `scale(${sc.toFixed(4)})`,
    ].join(" ");
    el.style.filter        = `brightness(${bright.toFixed(3)})`;
    el.style.zIndex        = String(Math.max(0, z));
    el.style.pointerEvents = absD < 0.4 ? "auto" : "none";
  });
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function LangSelector({ locale }: { locale: string }) {
  const router = useRouter();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.10em" }}>
      {LOCALES.map((loc, i) => (
        <span key={loc} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => router.push(`/${loc}/`)}
            style={{ fontSize: "11px", letterSpacing: "0.10em", fontWeight: locale === loc ? 700 : 400, color: locale === loc ? "#000" : "#bbb", background: "none", border: "none", cursor: "pointer", padding: 0, textTransform: "uppercase" }}>
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
  return (
    <Link href={`/${locale}${href}`} style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#000", fontWeight: 600, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ display: "block", height: "17px", marginTop: "5px", overflow: "hidden" }}>
        <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "12px", color: "#999", transition: "transform 220ms ease, opacity 220ms ease", transform: hovered ? "translateY(0)" : "translateY(7px)", opacity: hovered ? 1 : 0 }}>
          {sub}
        </span>
      </span>
    </Link>
  );
}

function FeaturedCard({ project, locale }: { project: Project; locale: string }) {
  const d      = project[locale as "ca" | "es" | "en"];
  const images = project.images.length > 0 ? project.images : [project.coverImage];
  const tagLabels = TAG_LABELS[locale] ?? TAG_LABELS.ca;
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: "16px", boxShadow: "0 8px 48px rgba(0,0,0,0.08)", display: "flex", overflow: "hidden" }}>
      <div style={{ flex: "0 0 50%", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/projects/${project.slug}/${images[0]}`} alt={d.title}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", userSelect: "none" }} />
      </div>
      <div style={{ width: "1px", background: "rgba(0,0,0,0.08)", flexShrink: 0, alignSelf: "stretch" }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "clamp(20px,3vh,36px) clamp(18px,2.5vw,32px)", overflow: "hidden" }}>
        <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(17px,1.7vw,26px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: "#000", margin: "0 0 12px" }}>
          {d.title}
        </h3>
        {project.tags.length > 0 && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#666", margin: "0 0 7px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {project.tags.map((tag) => tagLabels[tag]).join(" · ")}
          </p>
        )}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#aaa", margin: "0 0 16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {[d.municipality, d.year, d.status, d.tipus].filter(Boolean).join(" · ")}
        </p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(12px,1vw,13.5px)", lineHeight: 1.7, color: "#555", margin: 0, flex: 1, overflow: "hidden" }}>
          {d.descriptionShort}
        </p>
        <Link href={`/${locale}/projectes/${project.slug}`}
          style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1px solid #000", paddingBottom: "2px", alignSelf: "flex-start", marginTop: "20px", flexShrink: 0 }}>
          Veure projecte →
        </Link>
      </div>
    </div>
  );
}

/* ─── HomeScene ──────────────────────────────────────────────────────────── */

export default function HomeScene({ locale, projects }: { locale: string; projects: Project[] }) {
  const content  = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.ca;
  const featured = FEATURED_SLUGS
    .map(s => projects.find(p => p.slug === s))
    .filter((p): p is Project => !!p);

  /* ── refs ── */
  const fixedLogoRef    = useRef<HTMLDivElement>(null);
  const heroRef         = useRef<HTMLDivElement>(null);
  const initialLayerRef = useRef<HTMLDivElement>(null);
  const settledLayerRef = useRef<HTMLDivElement>(null);
  const hintRef         = useRef<HTMLDivElement>(null);
  const mosaicRef       = useRef<HTMLDivElement>(null);
  const cardsPanelRef   = useRef<HTMLDivElement>(null);
  const cardRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const exploreRef      = useRef<HTMLDivElement>(null);
  const counterRef      = useRef<HTMLSpanElement>(null);
  const leftColRef      = useRef<HTMLDivElement>(null);
  const rightColRef     = useRef<HTMLDivElement>(null);

  /* RAF state */
  const vY       = useRef(0);
  const sY       = useRef(0);
  const rafId    = useRef(0);
  const lastTime = useRef(0);
  const loopH    = useRef(0);
  const leftOff  = useRef(0);
  const rightOff = useRef(0);
  const pageY    = useRef(0);

  useEffect(() => {
    const imgH = window.innerHeight * IMG_H_VH;
    loopH.current    = LEFT_SRCS.length * (imgH + COL_GAP);
    rightOff.current = loopH.current * 0.4;

    const onScroll = () => {
      pageY.current = window.scrollY;
      vY.current = Math.max(0, Math.min(window.scrollY, TOTAL_RANGE));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    lastTime.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt  = Math.min((now - lastTime.current) / 1000, 0.1);
      lastTime.current = now;

      /* Mosaic */
      if (loopH.current > 0) {
        leftOff.current  = (leftOff.current  + SPEED_L * dt) % loopH.current;
        rightOff.current = (rightOff.current + SPEED_R * dt) % loopH.current;
        if (leftColRef.current)  leftColRef.current.style.transform  = `translateY(-${leftOff.current.toFixed(1)}px)`;
        if (rightColRef.current) rightColRef.current.style.transform = `translateY(-${rightOff.current.toFixed(1)}px)`;
      }

      /* Lerp */
      sY.current += (vY.current - sY.current) * LERP_K;
      const sy = sY.current;

      /* ── Phase 0: hero content crossfade ── */
      const settleRaw = (sy - SETTLE_START) / (SETTLE_END - SETTLE_START);
      const settleP   = easeInOutSine(Math.max(0, Math.min(1, settleRaw)));

      if (initialLayerRef.current) initialLayerRef.current.style.opacity = (1 - settleP).toFixed(3);
      if (settledLayerRef.current) settledLayerRef.current.style.opacity = settleP.toFixed(3);
      if (hintRef.current)         hintRef.current.style.opacity         = Math.max(0, 1 - settleP * 2.5).toFixed(3);
      if (fixedLogoRef.current)    fixedLogoRef.current.style.opacity    = settleP.toFixed(3);

      /* ── Phase 1: hero slides UP, cards rise from BELOW ── */
      if (sy < SETTLE_END) {
        if (heroRef.current)       heroRef.current.style.transform       = "translateY(0)";
        if (cardsPanelRef.current) cardsPanelRef.current.style.transform = "translateY(100vh)";
      } else {
        const openP  = Math.min(1, (sy - SETTLE_END) / OPEN_RANGE);
        const easedP = easeInOutSine(openP);
        if (heroRef.current) {
          heroRef.current.style.transform     = `translateY(${(-easedP * 100).toFixed(2)}vh)`;
          heroRef.current.style.pointerEvents = openP >= 1 ? "none" : "auto";
        }
        if (cardsPanelRef.current) {
          cardsPanelRef.current.style.transform = `translateY(${((1 - easedP) * 100).toFixed(2)}vh)`;
        }
      }

      /* ── Cards cycling ── */
      if (sy >= SETTLE_END) {
        const cardPos = Math.max(0, Math.min(N_CARDS - 1, (sy - SETTLE_END) / CARDS_PER_STEP));
        applyCardTransforms(cardRefs.current, cardPos);
        const cardIdx = Math.round(cardPos);
        if (counterRef.current) {
          counterRef.current.textContent =
            `${String(cardIdx + 1).padStart(2, "0")} / ${String(N_CARDS).padStart(2, "0")}`;
        }
        if (exploreRef.current) {
          const show = cardPos > N_CARDS - 1.3;
          exploreRef.current.style.opacity       = show ? "1" : "0";
          exploreRef.current.style.pointerEvents = show ? "auto" : "none";
        }
      }

      /* Native page exit: reveal the shared footer after the final card. */
      const exitY = Math.max(0, pageY.current - TOTAL_RANGE);
      if (exitY > 0) {
        if (cardsPanelRef.current) cardsPanelRef.current.style.transform = `translateY(-${exitY.toFixed(1)}px)`;
        if (mosaicRef.current) mosaicRef.current.style.transform = `translateY(-${exitY.toFixed(1)}px)`;
      } else if (mosaicRef.current) {
        mosaicRef.current.style.transform = "translateY(0)";
      }

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{`
        @keyframes pu-hint-drop {
          0%,100% { transform: translateY(0); }
          55%      { transform: translateY(6px); }
        }
      `}</style>

      {/* ── MOSAIC z=5 ──────────────────────────────────────────────────────── */}
      <div ref={mosaicRef} style={{ position: "fixed", inset: 0, zIndex: 5, background: "#fff", display: "flex", gap: `${STRIP_GAP}px`, willChange: "transform" }}>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div ref={leftColRef} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: `${COL_GAP}px` }}>
            {[...LEFT_SRCS, ...LEFT_SRCS].map((src, i) => (
              <div key={i} style={{ height: `${(IMG_H_VH * 100).toFixed(0)}vh`, flexShrink: 0, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" aria-hidden loading="eager" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div ref={rightColRef} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: `${COL_GAP}px` }}>
            {[...RIGHT_SRCS, ...RIGHT_SRCS].map((src, i) => (
              <div key={i} style={{ height: `${(IMG_H_VH * 100).toFixed(0)}vh`, flexShrink: 0, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" aria-hidden loading="eager" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FIXED LOGO z=100 — persists across all sections ─────────────────── */}
      <div ref={fixedLogoRef} style={{ position: "fixed", top: "20px", left: "var(--margin-page)", zIndex: 100, opacity: 0, pointerEvents: "auto", transform: "translateX(-14%)" }}>
        <Link href={`/${locale}/`} style={{ textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-nuevo.png" alt="Peralta Urbanisme"
            style={{ width: "clamp(184px,22vw,240px)", height: "auto", display: "block" }} />
        </Link>
      </div>

      {/* ── CARDS PANEL z=8 ───────────────────────────────────────────────────── */}
      <div
        ref={cardsPanelRef}
        style={{
          position: "fixed", inset: 0, zIndex: 8,
          background: "#fff",
          transform: "translateY(100vh)",
          willChange: "transform",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header: big editorial title + counter ── */}
        <div style={{ flexShrink: 0, padding: "112px var(--margin-page) clamp(34px, 4vh, 52px)", position: "relative", zIndex: 2000, background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
            <h2 style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(28px,3.6vw,52px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#000",
              margin: 0,
            }}>
              {content.destacats}
            </h2>
            <span
              ref={counterRef}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: "#ccc",
                flexShrink: 0,
                paddingBottom: "6px",
              }}
            >
              01 / {String(N_CARDS).padStart(2, "0")}
            </span>
          </div>
          <div style={{ height: "1px", background: "rgba(0,0,0,0.08)" }} />
        </div>

        {/* ── Card stage — flex-1, cards centered ── */}
        <div style={{ flex: 1, position: "relative", overflow: "visible", minHeight: 0 }}>
          {featured.map((proj, i) => (
            <div
              key={proj.slug}
              ref={el => { cardRefs.current[i] = el; }}
              style={{
                position: "absolute",
                top: "calc(50% + clamp(36px, 6vh, 64px))", left: "50%",
                width: "min(calc(100% - 40px), 1040px)",
                height: "min(calc(100% - 96px), 560px)",
                transformOrigin: "center center",
                willChange: "transform, filter",
                visibility: i <= 2 ? "visible" : "hidden",
                transform: `translate(-50%, calc(-50% + ${Math.min(i, 2) * 8}px)) scale(${Math.max(0.90, 1 - Math.min(i, 2) * 0.018).toFixed(4)})`,
                filter: `brightness(${Math.max(0.84, 1 - Math.min(i, 2) * 0.07).toFixed(3)})`,
                zIndex: String(1000 - i * 100),
                pointerEvents: i === 0 ? "auto" : "none",
              }}
            >
              <FeaturedCard project={proj} locale={locale} />
            </div>
          ))}
        </div>

        {/* ── Explore button row — always reserves space at bottom ── */}
        <div style={{ flexShrink: 0, height: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            ref={exploreRef}
            style={{ opacity: 0, transition: "opacity 400ms ease", pointerEvents: "none" }}
          >
            <Link
              href={`/${locale}/projectes`}
              style={{
                display: "inline-block",
                background: "#000",
                color: "#fff",
                fontFamily: "var(--font-sans)",
                fontSize: "15px",
                fontWeight: 500,
                letterSpacing: "0.01em",
                padding: "15px 34px",
                borderRadius: "100px",
                textDecoration: "none",
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              }}
            >
              {content.explorar}
            </Link>
          </div>
        </div>
      </div>

      {/* ── HERO z=10 — full-screen white, no scale ───────────────────────────── */}
      <div
        ref={heroRef}
        style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "#fff",
          willChange: "transform",
        }}
      >
        {/* Lang selector — vertically centred with the 22 px hamburger dot (top:27px) */}
        <div style={{ position: "absolute", top: "27px", right: "76px", zIndex: 20, height: "22px", display: "flex", alignItems: "center" }}>
          <LangSelector locale={locale} />
        </div>

        {/* INITIAL LAYER — large centered logo */}
        <div ref={initialLayerRef} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link href={`/${locale}/`} style={{ textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nuevo.png" alt="Peralta Urbanisme"
              style={{ width: "clamp(280px,40vw,560px)", height: "auto" }} />
          </Link>
        </div>

        {/* SETTLED LAYER — text + links (no logo; logo is in fixedLogoRef) */}
        <div
          ref={settledLayerRef}
          style={{ position: "absolute", inset: 0, opacity: 0, display: "flex", flexDirection: "column", padding: "20px", justifyContent: "flex-end" }}
        >
          <div style={{ maxWidth: "min(780px,85%)", paddingBottom: "clamp(16px,2.5vh,36px)" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(24px,2.8vw,42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#000", margin: "0 0 0.1em" }}>
              {content.line1}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(24px,2.8vw,42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#000", margin: "0 0 0.9em" }}>
              {content.line2}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(15px,1.6vw,22px)", fontWeight: 400, lineHeight: 1.35, color: "#111", margin: "0 0 0.5em" }}>
              {content.line3}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(12px,1.1vw,15px)", fontWeight: 400, lineHeight: 1.65, color: "#777", margin: "0 0 clamp(24px,3.5vh,44px)" }}>
              {content.line4}
            </p>
            <div style={{ display: "flex", gap: "clamp(22px,3.5vw,52px)", alignItems: "flex-start", flexWrap: "wrap" }}>
              {content.links.map(link => (
                <NavLinkHero key={link.href} label={link.label} sub={link.sub} href={link.href} locale={locale} />
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} style={{ position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", userSelect: "none", pointerEvents: "none", fontFamily: "var(--font-mono)" }}>
          <span style={{ fontSize: "9px", letterSpacing: "0.22em", color: "rgba(0,0,0,0.55)", textTransform: "uppercase" }}>Scroll</span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "pu-hint-drop 2.4s ease-in-out infinite" }}>
            <span style={{ display: "block", width: "1px", height: "28px", background: "rgba(0,0,0,0.42)" }} />
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
              <path d="M0.5 0.5L4 4.5L7.5 0.5" stroke="rgba(0,0,0,0.42)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>

      {/* Real scroll space: after the animation, normal page flow reveals the footer. */}
      <div aria-hidden="true" style={{ height: `calc(100vh + ${TOTAL_RANGE}px)`, pointerEvents: "none" }} />
    </>
  );
}
