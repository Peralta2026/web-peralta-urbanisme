"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/lib/types";

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
const COL_GAP    = 14;
const STRIP_GAP  = 14;
const IMG_H_VH   = 0.42;
const SPEED_L    = 55;
const SPEED_R    = 38;

/* ─── Scroll constants ───────────────────────────────────────────────────── */

const SETTLE_START    = 240;   // hero content crossfade starts
const SETTLE_END      = 500;   // hero fully settled (logo TL + text + links)
const HERO_SHRINK_END = 480;   // hero scale animation ends
const HERO_MIN        = 0.88;

const OPEN_RANGE      = 400;   // hero slides UP, cards rise from BELOW (500→900)
const CARDS_PER_STEP  = 420;   // virtual px per card advance
const N_CARDS         = FEATURED_SLUGS.length;

// After all cards, allow inner scroll for footer
const CARDS_END   = SETTLE_END + N_CARDS * CARDS_PER_STEP;  // 500+2100 = 2600
const TOTAL_RANGE = CARDS_END;

const LERP_K = 0.08;

const LOCALES = ["ca", "es", "en"] as const;

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
      { label: "Persones ↗",  href: "/persones",  sub: "Qui mira"     },
      { label: "Principis ↗", href: "/principis", sub: "Com pensem"   },
    ],
    destacats: "Projectes destacats",
    explorar:  "Explorar tots els projectes →",
    footerLinks: [
      { label: "Persones",          href: "/persones"  },
      { label: "Principis",         href: "/principis" },
      { label: "Mapa de projectes", href: "/mapa"      },
      { label: "Arxiu",             href: "/projectes" },
      { label: "Contacte",          href: "/contacte"  },
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
    destacats: "Proyectos destacados",
    explorar:  "Explorar todos los proyectos →",
    footerLinks: [
      { label: "Personas",           href: "/persones"  },
      { label: "Principios",         href: "/principis" },
      { label: "Mapa de proyectos",  href: "/mapa"      },
      { label: "Archivo",            href: "/projectes" },
      { label: "Contacto",           href: "/contacte"  },
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
    destacats: "Featured projects",
    explorar:  "Explore all projects →",
    footerLinks: [
      { label: "People",           href: "/persones"  },
      { label: "Principles",       href: "/principis" },
      { label: "Projects map",     href: "/mapa"      },
      { label: "Archive",          href: "/projectes" },
      { label: "Contact",          href: "/contacte"  },
    ],
  },
} as const;

/* ─── Card rolodex transform ─────────────────────────────────────────────── */

function applyCardTransforms(refs: (HTMLDivElement | null)[], dp: number) {
  const STACK_REST = 8;
  const PEAK_H     = 140;
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

function LangSelectorHero({ locale }: { locale: string }) {
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
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: "18px", boxShadow: "0 8px 48px rgba(0,0,0,0.08)", display: "flex", overflow: "hidden" }}>
      <div style={{ flex: "0 0 50%", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/projects/${project.slug}/${images[0]}`} alt={d.title}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", userSelect: "none" }} />
      </div>
      <div style={{ width: "1px", background: "rgba(0,0,0,0.08)", flexShrink: 0, alignSelf: "stretch" }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "clamp(20px,3vh,36px) clamp(18px,2.5vw,30px)", overflow: "hidden" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#bbb", margin: "0 0 14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {[d.municipality, d.year, d.tipus].filter(Boolean).join(" · ")}
        </p>
        <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(16px,1.6vw,24px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: "#000", margin: "0 0 12px" }}>
          {d.title}
        </h3>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(12px,1vw,13.5px)", lineHeight: 1.65, color: "#555", margin: 0, flex: 1, overflow: "hidden" }}>
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

  /* ── DOM refs ── */
  const heroRef         = useRef<HTMLDivElement>(null);
  const initialLayerRef = useRef<HTMLDivElement>(null);
  const settledLayerRef = useRef<HTMLDivElement>(null);
  const hintRef         = useRef<HTMLDivElement>(null);

  const cardsPanelRef = useRef<HTMLDivElement>(null);
  const cardRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const exploreRef    = useRef<HTMLDivElement>(null);
  const counterRef    = useRef<HTMLSpanElement>(null);
  const innerRef      = useRef<HTMLDivElement>(null);

  /* Mosaic */
  const leftColRef  = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  /* RAF scroll state */
  const vY       = useRef(0);
  const sY       = useRef(0);
  const rafId    = useRef(0);
  const lastTime = useRef(0);
  const loopH    = useRef(0);
  const leftOff  = useRef(0);
  const rightOff = useRef(0);

  useEffect(() => {
    const imgH = window.innerHeight * IMG_H_VH;
    loopH.current    = LEFT_SRCS.length * (imgH + COL_GAP);
    rightOff.current = loopH.current * 0.4;

    document.body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const raw = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      if (vY.current < TOTAL_RANGE - 5) {
        vY.current = Math.max(0, Math.min(vY.current + raw * 0.7, TOTAL_RANGE));
      } else {
        /* After all cards: scroll the footer strip */
        if (innerRef.current) innerRef.current.scrollTop += raw * 0.7;
        if (raw < 0 && innerRef.current && innerRef.current.scrollTop <= 0) {
          vY.current = Math.max(0, vY.current + raw * 0.5);
        }
      }
    };

    let t0 = 0;
    const onTouchStart = (e: TouchEvent) => { t0 = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      e.preventDefault();
      const delta = t0 - e.touches[0].clientY;
      t0 = e.touches[0].clientY;
      if (vY.current < TOTAL_RANGE - 5) {
        vY.current = Math.max(0, Math.min(vY.current + delta, TOTAL_RANGE));
      } else {
        if (innerRef.current) innerRef.current.scrollTop += delta;
        if (delta < 0 && innerRef.current && innerRef.current.scrollTop <= 0) {
          vY.current = Math.max(0, vY.current + delta);
        }
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

      /* ── Phase 0: hero shrink + content crossfade ── */
      const p1    = Math.min(1, sy / HERO_SHRINK_END);
      const scale = HERO_MIN + (1 - HERO_MIN) * (1 - easeInOutSine(p1));
      const settleRaw = (sy - SETTLE_START) / (SETTLE_END - SETTLE_START);
      const settleP   = easeInOutSine(Math.max(0, Math.min(1, settleRaw)));
      if (initialLayerRef.current) initialLayerRef.current.style.opacity = (1 - settleP).toFixed(3);
      if (settledLayerRef.current) settledLayerRef.current.style.opacity = settleP.toFixed(3);
      if (hintRef.current)         hintRef.current.style.opacity         = Math.max(0, 1 - settleP * 2.5).toFixed(3);

      /* ── Hero position ── */
      if (sy < SETTLE_END) {
        /* Phase 0: only scale */
        if (heroRef.current) {
          heroRef.current.style.transform = `scale(${scale.toFixed(4)})`;
          heroRef.current.style.pointerEvents = "auto";
        }
        /* Cards panel stays hidden below */
        if (cardsPanelRef.current) cardsPanelRef.current.style.transform = "translateY(100vh)";
      } else {
        /* Phase 1+: hero slides UP, cards rise from BELOW */
        const openP  = Math.min(1, (sy - SETTLE_END) / OPEN_RANGE);
        const easedP = easeInOutSine(openP);
        const heroTY = -easedP * 100;
        const cardsTY = (1 - easedP) * 100;

        if (heroRef.current) {
          heroRef.current.style.transform     = `translateY(${heroTY.toFixed(2)}vh)`;
          heroRef.current.style.pointerEvents = openP >= 1 ? "none" : "auto";
        }
        if (cardsPanelRef.current) {
          cardsPanelRef.current.style.transform = `translateY(${cardsTY.toFixed(2)}vh)`;
        }
      }

      /* ── Phase 1: cards cycling ── */
      if (sy >= SETTLE_END) {
        const cardPos = Math.max(0, Math.min(N_CARDS - 1, (sy - SETTLE_END) / CARDS_PER_STEP));
        applyCardTransforms(cardRefs.current, cardPos);
        const cardIdx = Math.round(cardPos);
        if (counterRef.current) counterRef.current.textContent = `${String(cardIdx + 1).padStart(2, "0")} / ${String(N_CARDS).padStart(2, "0")}`;
        if (exploreRef.current) {
          const show = cardPos > N_CARDS - 1.3;
          exploreRef.current.style.opacity       = show ? "1" : "0";
          exploreRef.current.style.pointerEvents = show ? "auto" : "none";
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

  return (
    <>
      <style>{`
        @keyframes pu-hint-drop {
          0%,100% { transform: translateY(0); }
          55%      { transform: translateY(6px); }
        }
        .pu-footer-inner::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── MOSAIC ──────────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 5, background: "#fff", display: "flex", gap: `${STRIP_GAP}px` }}>
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

      {/* ── CARDS PANEL (z=8) — rises from below ─────────────────────────── */}
      <div
        ref={cardsPanelRef}
        style={{
          position: "fixed", inset: 0, zIndex: 8,
          background: "#fff",
          transform: "translateY(100vh)",
          willChange: "transform",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
          <Link href={`/${locale}/`} style={{ textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nuevo.png" alt="Peralta Urbanisme" style={{ width: "clamp(130px,16vw,190px)", height: "auto" }} />
          </Link>
        </div>

        {/* Section header */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)" }}>
            {content.destacats}
          </span>
          <span ref={counterRef} style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", letterSpacing: "0.12em", color: "#ccc" }}>
            01 / {String(N_CARDS).padStart(2, "0")}
          </span>
        </div>

        {/* Card stage */}
        <div style={{ flex: 1, position: "relative", overflow: "visible", minHeight: 0 }}>
          {featured.map((proj, i) => (
            <div
              key={proj.slug}
              ref={el => { cardRefs.current[i] = el; }}
              style={{
                position: "absolute", top: "50%", left: "50%",
                width: "min(calc(100% - 40px), 900px)",
                height: "min(calc(100% - 8px), 440px)",
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

        {/* Explore button */}
        <div ref={exploreRef} style={{ flexShrink: 0, padding: "14px 20px", opacity: 0, transition: "opacity 400ms ease", pointerEvents: "none", textAlign: "right", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <Link href={`/${locale}/projectes`}
            style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1px solid #000", paddingBottom: "2px" }}>
            {content.explorar}
          </Link>
        </div>

        {/* Footer strip (scrollable after cards end) */}
        <div ref={innerRef} className="pu-footer-inner" style={{ flexShrink: 0, maxHeight: "0px", overflow: "hidden", scrollbarWidth: "none" }}>
          <footer style={{ background: "#0a0a0a", padding: "52px 20px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "32px", marginBottom: "40px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-nuevo.png" alt="Peralta Urbanisme" style={{ width: "clamp(120px,14vw,170px)", height: "auto", filter: "invert(1)", opacity: 0.9 }} />
              <div style={{ display: "flex", gap: "clamp(16px,2.5vw,40px)", flexWrap: "wrap" }}>
                {content.footerLinks.map(({ label, href }) => (
                  <Link key={href} href={`/${locale}${href}`}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", textDecoration: "none", display: "block" }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.20)", textTransform: "uppercase" }}>
                © {new Date().getFullYear()} Peralta Urbanisme
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.20)", textTransform: "uppercase" }}>
                Barcelona
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* ── HERO (z=10) ──────────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "#fff",
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {/* Lang selector */}
        <div style={{ position: "absolute", top: "28px", right: "20px", zIndex: 20 }}>
          <LangSelectorHero locale={locale} />
        </div>

        {/* INITIAL LAYER — centered logo */}
        <div ref={initialLayerRef} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link href={`/${locale}/`} style={{ textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nuevo.png" alt="Peralta Urbanisme" style={{ width: "clamp(280px,40vw,540px)", height: "auto" }} />
          </Link>
        </div>

        {/* SETTLED LAYER — logo TL + text + links */}
        <div ref={settledLayerRef} style={{ position: "absolute", inset: 0, opacity: 0, display: "flex", flexDirection: "column", padding: "20px", justifyContent: "flex-end" }}>

          <div style={{ position: "absolute", top: "20px", left: "20px" }}>
            <Link href={`/${locale}/`} style={{ textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-nuevo.png" alt="Peralta Urbanisme" style={{ width: "clamp(130px,16vw,190px)", height: "auto" }} />
            </Link>
          </div>

          <div style={{ maxWidth: "min(680px, 80%)", paddingBottom: "clamp(12px,2vh,28px)" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(22px,2.6vw,38px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.12, color: "#000", margin: "0 0 0.12em" }}>
              {content.line1}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(22px,2.6vw,38px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.12, color: "#000", margin: "0 0 1em" }}>
              {content.line2}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(14px,1.6vw,22px)", fontWeight: 400, lineHeight: 1.35, color: "#111", margin: "0 0 0.55em" }}>
              {content.line3}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(12px,1.1vw,15px)", fontWeight: 400, lineHeight: 1.6, color: "#777", margin: "0 0 clamp(20px,3vh,36px)" }}>
              {content.line4}
            </p>
            <div style={{ display: "flex", gap: "clamp(20px,3vw,44px)", alignItems: "flex-start", flexWrap: "wrap" }}>
              {content.links.map(link => (
                <NavLinkHero key={link.href} label={link.label} sub={link.sub} href={link.href} locale={locale} />
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} style={{ position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", userSelect: "none", pointerEvents: "none", fontFamily: "var(--font-mono)" }}>
          <span style={{ fontSize: "9px", letterSpacing: "0.22em", color: "rgba(0,0,0,0.35)", textTransform: "uppercase" }}>Scroll</span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "pu-hint-drop 2.4s ease-in-out infinite" }}>
            <span style={{ display: "block", width: "1px", height: "28px", background: "rgba(0,0,0,0.22)" }} />
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
              <path d="M0.5 0.5L4 4.5L7.5 0.5" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>
    </>
  );
}
