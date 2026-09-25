"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/lib/types";

/* ─── Featured slugs ─────────────────────────────────────────────────────── */

const FEATURED_SLUGS = [
  "la-miralda-pendent",
  "mpgm-bonaigua",
  "pmu-granollers-110b",
  "can-carreres-st-boi",
  "amb-ppu-hospital-valles",
  "alta-costura",
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

const SETTLE_START   = 180;
const SETTLE_END     = 480;
const OPEN_RANGE     = 380;
const CARDS_PER_STEP = 440;
const LERP_K         = 0.08;

const LOCALES = ["ca", "es", "en"] as const;

/* ─── Labels ─────────────────────────────────────────────────────────────── */


const FIELD_LABELS: Record<string, { municipi: string; any: string; ambit: string; sostre: string; habitatges: string; readMore: string }> = {
  ca: { municipi: "Municipi", any: "Any", ambit: "Àmbit", sostre: "Sostre", habitatges: "Habitatges", readMore: "Llegir més" },
  es: { municipi: "Municipio", any: "Año", ambit: "Ámbito", sostre: "Techo", habitatges: "Viviendas", readMore: "Leer más" },
  en: { municipi: "Municipality", any: "Year", ambit: "Scope", sostre: "Floor area", habitatges: "Dwellings", readMore: "Read more" },
};

const UI_LABELS: Record<string, { noResults: string; explore: string }> = {
  ca: { noResults: "Cap projecte trobat", explore: "Explorar l'arxiu de projectes" },
  es: { noResults: "Sin proyectos", explore: "Explorar el archivo de proyectos" },
  en: { noResults: "No projects found", explore: "Explore the project archive" },
};

const TOOL_LABELS: Record<string, { draw: string; erase: string; clear: string; thin: string; normal: string; thick: string }> = {
  ca: { draw: "Dibuixar", erase: "Esborrar", clear: "Netejar",     thin: "Fi",   normal: "Normal", thick: "Gruixut" },
  es: { draw: "Dibujar",  erase: "Borrar",   clear: "Borrar todo", thin: "Fino", normal: "Normal", thick: "Grueso"  },
  en: { draw: "Draw",     erase: "Erase",    clear: "Clear",       thin: "Thin", normal: "Normal", thick: "Thick"   },
};

const STROKE_MULS  = { 1: 0.3, 2: 0.7, 3: 1.0, 4: 2.4 } as const;
const DOT_SIZES_PX = { 1: 4,   2: 6,   3: 9,   4: 13  } as const;

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

/* ─── Data validity helper ───────────────────────────────────────────────── */

function isValid(val: string | number | null | undefined): val is string | number {
  if (val === null || val === undefined) return false;
  if (val === "-" || val === "No aplica" || val === "") return false;
  if (typeof val === "number" && val <= 0) return false;
  return true;
}


/* ─── Calligraphic drawing ───────────────────────────────────────────────── */

function drawCalli(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to:   { x: number; y: number },
  prevMid: { x: number; y: number } | null,
  sizeMul = 1,
): { x: number; y: number } {
  const dx   = to.x - from.x;
  const dy   = to.y - from.y;
  if (Math.hypot(dx, dy) < 0.5) return prevMid ?? from;

  const angle    = Math.atan2(dy, dx);
  const speed    = Math.hypot(dx, dy);
  const pressure = Math.max(0, 1 - speed / 28);
  // Nib at 45° — thick when horizontal, thin when vertical
  const w   = (1.2 + pressure * 1.8 + 4.8 * Math.abs(Math.cos(angle - Math.PI / 4))) * sizeMul;
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };

  ctx.beginPath();
  ctx.lineWidth   = w;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.strokeStyle = "#111";
  ctx.globalAlpha = 0.88;
  if (prevMid) {
    ctx.moveTo(prevMid.x, prevMid.y);
    ctx.quadraticCurveTo(from.x, from.y, mid.x, mid.y);
  } else {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(mid.x, mid.y);
  }
  ctx.stroke();
  return mid;
}

/* ─── LangSelector ───────────────────────────────────────────────────────── */

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

/* ─── NavLinkHero ────────────────────────────────────────────────────────── */

function NavLinkHero({ label, sub, href, locale }: { label: string; sub: string; href: string; locale: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/${locale}${href}`}
      style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", position: "relative" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#000", fontWeight: 600, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ position: "absolute", top: "100%", left: 0, display: "block", height: "17px", marginTop: "5px", overflow: "hidden", whiteSpace: "nowrap" }}>
        <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "12px", color: "#999", transition: "transform 220ms ease, opacity 220ms ease", transform: hovered ? "translateY(0)" : "translateY(7px)", opacity: hovered ? 1 : 0 }}>
          {sub}
        </span>
      </span>
    </Link>
  );
}

/* ─── FeaturedCard ───────────────────────────────────────────────────────── */

function FeaturedCard({ project, locale, mobile }: { project: Project; locale: string; mobile?: boolean }) {
  const d      = project[locale as "ca" | "es" | "en"];
  const images = project.images.length > 0 ? project.images : [project.coverImage];
  const fl     = FIELD_LABELS[locale] ?? FIELD_LABELS.ca;
  const [descOpen, setDescOpen] = useState(false);

  const dataRows = [
    { label: fl.municipi,    value: d.municipality },
    { label: fl.any,         value: d.year },
    { label: fl.ambit,       value: isValid(d.ambitM2)    ? `${d.ambitM2!.toLocaleString("ca-ES")} m²`   : null },
    { label: fl.sostre,      value: isValid(d.sostreM2)   ? `${d.sostreM2!.toLocaleString("ca-ES")} m²st` : null },
    { label: fl.habitatges,  value: isValid(d.habitatges) ? String(d.habitatges)                          : null },
  ].filter(r => isValid(r.value));

  /* ── Mobile layout: image top, content bottom ── */
  if (mobile) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#fff", border: "1px solid rgba(0,0,0,0.10)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: "0 0 58%", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/projects/${project.slug}/${images[0]}`} alt={d.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }} />
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: "3px" }}>
          <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "19px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#000", margin: "0 0 12px" }}>
            {d.title}
          </h3>
          {dataRows.map(r => (
            <div key={r.label} style={{ display: "flex", gap: "10px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", minWidth: "80px", flexShrink: 0, lineHeight: 1.6 }}>{r.label}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#111", lineHeight: 1.6, fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
            </div>
          ))}
          {descOpen ? (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", lineHeight: 1.6, color: "#444", margin: "10px 0 0" }}>
              {d.descriptionShort}
            </p>
          ) : (
            <button
              onClick={() => setDescOpen(true)}
              style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#888", padding: 0, borderBottom: "1px solid #ccc", paddingBottom: "2px", marginTop: "10px" }}
            >
              {fl.readMore}
            </button>
          )}
          <Link href={`/${locale}/projectes/${project.slug}`}
            style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1.5px solid #000", paddingBottom: "2px", alignSelf: "flex-start", marginTop: "auto", paddingTop: "16px" }}>
            Veure →
          </Link>
        </div>
      </div>
    );
  }

  /* ── Desktop layout: image left, content right ── */
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", border: "1px solid rgba(0,0,0,0.10)", boxShadow: "0 8px 48px rgba(0,0,0,0.08)", display: "flex", overflow: "hidden" }}>
      <div style={{ flex: "0 0 50%", overflow: "hidden", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/projects/${project.slug}/${images[0]}`} alt={d.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", userSelect: "none" }} />
      </div>
      <div style={{ width: "1px", background: "rgba(0,0,0,0.08)", flexShrink: 0, alignSelf: "stretch" }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "clamp(24px,3.5vh,44px) clamp(24px,2.8vw,40px)", overflow: "hidden" }}>
        <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(20px,2vw,32px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#000", margin: "0 0 clamp(28px,4.5vh,52px)" }}>
          {d.title}
        </h3>
        {dataRows.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {dataRows.map(r => (
              <div key={r.label} style={{ display: "flex", gap: "14px", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#aaa", minWidth: "90px", flexShrink: 0 }}>{r.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#111", fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
        {descOpen ? (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(13px,1.1vw,15px)", lineHeight: 1.65, color: "#444", margin: "clamp(28px,4.5vh,52px) 0 0", overflow: "auto" }}>
            {d.descriptionShort}
          </p>
        ) : (
          <button
            onClick={() => setDescOpen(true)}
            style={{ alignSelf: "flex-end", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#888", padding: 0, borderBottom: "1px solid #ccc", paddingBottom: "2px", marginTop: "clamp(28px,4.5vh,52px)" }}
          >
            {fl.readMore}
          </button>
        )}
        <Link href={`/${locale}/projectes/${project.slug}`}
          style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1.5px solid #000", paddingBottom: "3px", alignSelf: "flex-start", marginTop: "auto", paddingTop: "24px", flexShrink: 0 }}>
          Veure projecte →
        </Link>
      </div>
    </div>
  );
}

/* ─── HomeScene ──────────────────────────────────────────────────────────── */

export default function HomeScene({ locale, projects }: { locale: string; projects: Project[] }) {
  const content  = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.ca;
  const ui       = UI_LABELS[locale] ?? UI_LABELS.ca;

  const featured = useMemo(() => FEATURED_SLUGS
    .map(s => projects.find(p => p.slug === s))
    .filter((p): p is Project => !!p),
  [projects]);

  const displayProjects = featured;

  /* ── State ── */
  const [isMobile,  setIsMobile]  = useState(false);
  const [drawMode,   setDrawMode]   = useState<"draw" | "erase">("draw");
  const [strokeSize, setStrokeSize] = useState<1 | 2 | 3 | 4>(3);

  /* ── Refs ── */
  const fixedLogoRef    = useRef<HTMLDivElement>(null);
  const heroRef         = useRef<HTMLDivElement>(null);
  const initialLayerRef = useRef<HTMLDivElement>(null);
  const settledLayerRef = useRef<HTMLDivElement>(null);
  const hintRef         = useRef<HTMLDivElement>(null);
  const mosaicRef       = useRef<HTMLDivElement>(null);
  const cardsPanelRef   = useRef<HTMLDivElement>(null);
  const cardRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const exploreRef      = useRef<HTMLDivElement>(null);
  const leftColRef      = useRef<HTMLDivElement>(null);
  const rightColRef     = useRef<HTMLDivElement>(null);
  const scrollSpaceRef  = useRef<HTMLDivElement>(null);
  const videoRef        = useRef<HTMLDivElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const cursorRef       = useRef<HTMLDivElement>(null);
  const toolsRef        = useRef<HTMLDivElement>(null);
  const isDrawingRef    = useRef(false);
  const lastPtRef       = useRef<{ x: number; y: number } | null>(null);
  const prevMidRef      = useRef<{ x: number; y: number } | null>(null);
  const drawModeRef     = useRef<"draw" | "erase">("draw");
  const strokeSizeRef   = useRef<1 | 2 | 3 | 4>(3);
  const clearFnRef      = useRef<() => void>(() => {});

  /* Hero-exit lock */
  const heroDoneRef      = useRef(false);  // dynamic: true when hero fully off-screen
  const heroCompletedRef = useRef(false);  // one-time: stays true after first exit
  const heroMinScrollRef = useRef(0);

  /* Dynamic scroll values */
  const nCardsRef    = useRef(displayProjects.length);
  const totalRangeRef = useRef(SETTLE_END + displayProjects.length * CARDS_PER_STEP);

  /* RAF state */
  const vY       = useRef(0);
  const sY       = useRef(0);
  const rafId    = useRef(0);
  const lastTime = useRef(0);
  const loopH    = useRef(0);
  const leftOff  = useRef(0);
  const rightOff = useRef(0);
  const pageY    = useRef(0);

  /* Touch swipe */
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  /* ── Sync nCardsRef when displayProjects changes ── */
  useEffect(() => {
    const n = Math.max(1, displayProjects.length);
    nCardsRef.current    = n;
    totalRangeRef.current = SETTLE_END + n * CARDS_PER_STEP;
    if (scrollSpaceRef.current) {
      scrollSpaceRef.current.style.height = `calc(100vh + ${totalRangeRef.current}px)`;
    }
    vY.current = Math.max(0, Math.min(vY.current, totalRangeRef.current));
  }, [displayProjects.length]);

  /* ── Mobile detection ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleModeChange = (mode: "draw" | "erase") => {
    drawModeRef.current = mode;
    setDrawMode(mode);
  };

  const handleSizeChange = (size: 1 | 2 | 3 | 4) => {
    strokeSizeRef.current = size;
    setStrokeSize(size);
  };

  /* ── RAF loop ── */
  useEffect(() => {
    const imgH = window.innerHeight * IMG_H_VH;
    loopH.current    = LEFT_SRCS.length * (imgH + COL_GAP);
    rightOff.current = loopH.current * 0.4;

    const onScroll = () => {
      const raw = window.scrollY;
      if (heroCompletedRef.current && raw < heroMinScrollRef.current) {
        window.scrollTo(0, heroMinScrollRef.current);
        pageY.current = heroMinScrollRef.current;
        vY.current    = heroMinScrollRef.current;
        return;
      }
      pageY.current = raw;
      vY.current = Math.max(0, Math.min(raw, totalRangeRef.current));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    lastTime.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt  = Math.min((now - lastTime.current) / 1000, 0.1);
      lastTime.current = now;

      const nCards    = nCardsRef.current;
      const totalRange = totalRangeRef.current;

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

      /* ── Compute hero state for this frame ── */
      const openP    = sy < SETTLE_END ? 0 : Math.min(1, (sy - SETTLE_END) / OPEN_RANGE);
      const heroDone = openP >= 1;
      heroDoneRef.current = heroDone;
      if (heroDone && !heroCompletedRef.current) {
        heroCompletedRef.current = true;
        heroMinScrollRef.current = SETTLE_END;
      }

      /* ── Phase 0: hero crossfade ── */
      const settleRaw = (sy - SETTLE_START) / (SETTLE_END - SETTLE_START);
      const settleP   = easeInOutSine(Math.max(0, Math.min(1, settleRaw)));

      if (initialLayerRef.current) initialLayerRef.current.style.opacity = (1 - settleP).toFixed(3);
      if (settledLayerRef.current) settledLayerRef.current.style.opacity = settleP.toFixed(3);
      if (videoRef.current)        videoRef.current.style.opacity        = settleP.toFixed(3);
      if (hintRef.current)         hintRef.current.style.opacity         = Math.max(0, 1 - settleP * 2.5).toFixed(3);
      if (fixedLogoRef.current)    fixedLogoRef.current.style.opacity    = settleP.toFixed(3);
      if (cursorRef.current)       cursorRef.current.style.opacity       = heroDone ? "0" : settleP.toFixed(3);
      if (canvasRef.current)       canvasRef.current.style.display       = heroDone ? "none" : "block";
      if (toolsRef.current) {
        const show = !heroDone && settleP > 0.3;
        toolsRef.current.style.display       = heroDone ? "none" : "flex";
        toolsRef.current.style.opacity       = show ? Math.min(1, (settleP - 0.3) / 0.5).toFixed(3) : "0";
        toolsRef.current.style.pointerEvents = show ? "auto" : "none";
      }

      /* ── Phase 1: hero slides UP, cards rise ── */
      if (sy < SETTLE_END) {
        if (heroRef.current)       heroRef.current.style.transform       = "translateY(0)";
        if (cardsPanelRef.current) cardsPanelRef.current.style.transform = "translateY(100vh)";
      } else {
        const easedP = easeInOutSine(openP);
        if (heroRef.current) {
          heroRef.current.style.transform     = `translateY(${(-easedP * 100).toFixed(2)}vh)`;
          heroRef.current.style.pointerEvents = heroDone ? "none" : "auto";
        }
        if (cardsPanelRef.current) {
          cardsPanelRef.current.style.transform = `translateY(${((1 - easedP) * 100).toFixed(2)}vh)`;
        }
      }

      /* ── Cards cycling ── */
      if (sy >= SETTLE_END) {
        const cardPos = Math.max(0, Math.min(nCards - 1, (sy - SETTLE_END) / CARDS_PER_STEP));
        applyCardTransforms(cardRefs.current.slice(0, nCards), cardPos);
        if (exploreRef.current) {
          const show = cardPos > nCards - 1.3;
          exploreRef.current.style.opacity       = show ? "1" : "0";
          exploreRef.current.style.pointerEvents = show ? "auto" : "none";
        }
      }

      /* Exit: reveal footer */
      const exitY = Math.max(0, pageY.current - totalRange);
      if (exitY > 0) {
        if (cardsPanelRef.current) cardsPanelRef.current.style.transform = `translateY(-${exitY.toFixed(1)}px)`;
        if (mosaicRef.current)     mosaicRef.current.style.transform     = `translateY(-${exitY.toFixed(1)}px)`;
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

  /* ── Drawing canvas + custom cursor ── */
  useEffect(() => {
    const canvas   = canvasRef.current;
    const cursorEl = cursorRef.current;
    if (!canvas || !cursorEl) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => {
      const tmp = document.createElement("canvas");
      tmp.width  = canvas.width;
      tmp.height = canvas.height;
      tmp.getContext("2d")?.drawImage(canvas, 0, 0);
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.getContext("2d")?.drawImage(tmp, 0, 0);
    };

    clearFnRef.current = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") {
        cursorEl.style.left = `${e.clientX}px`;
        cursorEl.style.top  = `${e.clientY}px`;
        const eraserR = 6 + strokeSizeRef.current * 4;
        if (drawModeRef.current === "erase") {
          cursorEl.style.width        = `${eraserR * 2}px`;
          cursorEl.style.height       = `${eraserR * 2}px`;
          cursorEl.style.background   = "transparent";
          cursorEl.style.border       = "1.5px solid rgba(0,0,0,0.5)";
          cursorEl.style.mixBlendMode = "normal";
        } else {
          cursorEl.style.width        = "10px";
          cursorEl.style.height       = "10px";
          cursorEl.style.background   = "#fff";
          cursorEl.style.border       = "none";
          cursorEl.style.mixBlendMode = "difference";
        }
      }
      if (!isDrawingRef.current || !lastPtRef.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (drawModeRef.current === "erase") {
        const eraserR = 6 + strokeSizeRef.current * 4;
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, eraserR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fill();
        ctx.restore();
        lastPtRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      prevMidRef.current = drawCalli(ctx, lastPtRef.current, { x: e.clientX, y: e.clientY }, prevMidRef.current, STROKE_MULS[strokeSizeRef.current]);
      lastPtRef.current  = { x: e.clientX, y: e.clientY };
    };

    const onDown = (e: PointerEvent) => {
      if (heroDoneRef.current) return;
      if (!e.isPrimary) return;
      if ((e.target as HTMLElement).closest("a, button")) return;
      e.preventDefault();
      isDrawingRef.current = true;
      prevMidRef.current   = null;
      lastPtRef.current    = { x: e.clientX, y: e.clientY };
    };

    const onUp = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      isDrawingRef.current = false;
      lastPtRef.current    = null;
      prevMidRef.current   = null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (heroDoneRef.current) return;
      if (e.key === "e" || e.key === "E") { drawModeRef.current = "erase"; setDrawMode("erase"); }
      if (e.key === "d" || e.key === "D") { drawModeRef.current = "draw";  setDrawMode("draw");  }
      if (e.key === "Escape")              clearFnRef.current();
      if (e.key === "1") { strokeSizeRef.current = 1; setStrokeSize(1); }
      if (e.key === "2") { strokeSizeRef.current = 2; setStrokeSize(2); }
      if (e.key === "3") { strokeSizeRef.current = 3; setStrokeSize(3); }
      if (e.key === "4") { strokeSizeRef.current = 4; setStrokeSize(4); }
    };

    window.addEventListener("resize",        onResize);
    window.addEventListener("pointermove",   onMove);
    window.addEventListener("pointerdown",   onDown, { passive: false });
    window.addEventListener("pointerup",     onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown",       onKeyDown);

    return () => {
      window.removeEventListener("resize",        onResize);
      window.removeEventListener("pointermove",   onMove);
      window.removeEventListener("pointerdown",   onDown);
      window.removeEventListener("pointerup",     onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown",       onKeyDown);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cardWidth = "min(calc(100% - 40px), 1040px)";

  return (
    <>
      <style>{`
        @keyframes pu-hint-drop {
          0%,100% { transform: translateY(0); }
          55%      { transform: translateY(6px); }
        }
        .pu-draw-tools { flex-direction: row; align-items: center; gap: 16px; }
        .pu-draw-tools-dot { cursor: pointer; border-radius: 50%; flex-shrink: 0; transition: background 150ms ease; }
        @media (max-width: 768px) {
          .pu-draw-tools {
            flex-direction: column-reverse !important;
            bottom: auto !important;
            right: 16px !important;
            top: 50%;
            transform: translateY(-50%);
            padding: 14px 10px;
            gap: 12px !important;
            background: rgba(255,255,255,0.88);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            border-radius: 20px;
            border: 1px solid rgba(0,0,0,0.08);
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          }
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

      {/* ── FIXED LOGO z=100 ─────────────────────────────────────────────────── */}
      <div ref={fixedLogoRef} style={{ position: "fixed", top: "20px", left: "var(--margin-page)", zIndex: 100, opacity: 0, pointerEvents: "auto" }}>
        <Link href={`/${locale}/`} style={{ textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-nuevo.png" alt="Peralta Urbanisme"
            style={{ height: "clamp(44px,5.5vh,62px)", width: "auto", display: "block" }} />
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
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          const dy = e.changedTouches[0].clientY - touchStartY.current;
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            const cardPos    = Math.max(0, (sY.current - SETTLE_END) / CARDS_PER_STEP);
            const currentCard = Math.round(cardPos);
            const nCards     = nCardsRef.current;
            const targetCard = dx < 0
              ? Math.min(nCards - 1, currentCard + 1)
              : Math.max(0, currentCard - 1);
            window.scrollTo({ top: SETTLE_END + targetCard * CARDS_PER_STEP, behavior: "smooth" });
          }
        }}
      >
        {/* ── Header ── */}
        <div style={{ flexShrink: 0, padding: "112px var(--margin-page) clamp(20px, 3vh, 40px)", position: "relative", zIndex: 2000, background: "#fff" }}>
          <h2 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(28px,3.6vw,52px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#000",
            margin: "0 0 10px",
          }}>
            {content.destacats}
          </h2>
          <div style={{ height: "1px", background: "rgba(0,0,0,0.08)" }} />
        </div>

        {/* ── Card stage ── */}
        <div style={{ flex: 1, position: "relative", overflow: "visible", minHeight: 0 }}>
          {displayProjects.length === 0 && (
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb" }}>
                {ui.noResults}
              </p>
            </div>
          )}

          {displayProjects.map((proj, i) => (
            <div
              key={proj.slug}
              ref={el => { cardRefs.current[i] = el; }}
              style={{
                position: "absolute",
                top: "calc(50% + clamp(10px, 2vh, 20px))",
                left: "50%",
                width: cardWidth,
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
              <FeaturedCard project={proj} locale={locale} mobile={isMobile} />
            </div>
          ))}
        </div>

        {/* ── Explore button ── */}
        <div style={{ flexShrink: 0, height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            ref={exploreRef}
            style={{
              opacity: 0,
              transition: "opacity 400ms ease",
              pointerEvents: "none",
            }}
          >
            <Link
              href={`/${locale}/projectes`}
              style={{
                display: "inline-block", background: "#000", color: "#fff",
                fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 500,
                letterSpacing: "0.01em", padding: "11px 26px", borderRadius: "100px",
                textDecoration: "none", boxShadow: "0 3px 16px rgba(0,0,0,0.15)",
              }}
            >
              {ui.explore}
            </Link>
          </div>
        </div>
      </div>

      {/* ── HERO z=10 ────────────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        style={{ position: "fixed", inset: 0, zIndex: 10, background: "#fff", willChange: "transform", cursor: "none", userSelect: "none", touchAction: "none" }}
      >
        {/* Vídeo de fons — wrapper clips edge artifacts; opacity controlled via ref */}
        <div
          ref={videoRef}
          style={{
            position:   "absolute",
            top:        "11%",
            right:      "7%",
            width:      "62%",
            height:     "77%",
            overflow:   "hidden",
            opacity:    0,
            background: "#fff",
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              width:      "100%",
              height:     "100%",
              objectFit:  "contain",
              display:    "block",
              background: "#fff",
              willChange: "transform",
              transform:  "scale(1.004)",
            }}
          >
            <source src="/intro.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Lang selector */}
        <div style={{ position: "absolute", top: "27px", right: "76px", zIndex: 20, height: "22px", display: "flex", alignItems: "center" }}>
          <LangSelector locale={locale} />
        </div>

        {/* INITIAL LAYER — centered logo */}
        <div ref={initialLayerRef} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link href={`/${locale}/`} style={{ textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nuevo.png" alt="Peralta Urbanisme"
              style={{ width: "clamp(280px,40vw,560px)", height: "auto" }} />
          </Link>
        </div>

        {/* SETTLED LAYER — text + links */}
        <div
          ref={settledLayerRef}
          style={{ position: "absolute", inset: 0, opacity: 0, display: "flex", flexDirection: "column", padding: "20px var(--margin-page)", justifyContent: "flex-end" }}
        >
          <div style={{ maxWidth: "min(900px,90%)", paddingBottom: "clamp(16px,2.5vh,36px)" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(22px,2.4vw,36px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#000", margin: "0 0 0.1em" }}>
              {content.line1}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(22px,2.4vw,36px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#000", margin: "0 0 0.9em" }}>
              {content.line2}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(15px,1.6vw,22px)", fontWeight: 400, lineHeight: 1.35, color: "#111", margin: "0 0 0.5em" }}>
              {content.line3}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(15px,1.6vw,22px)", fontWeight: 400, lineHeight: 1.35, color: "#111", margin: "0 0 clamp(24px,3.5vh,44px)" }}>
              {content.line4}
            </p>
            <div style={{ display: "flex", gap: "clamp(28px,4vw,56px)", alignItems: "flex-start" }}>
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

      {/* Real scroll space */}
      <div
        ref={scrollSpaceRef}
        aria-hidden="true"
        style={{ height: `calc(100vh + ${SETTLE_END + displayProjects.length * CARDS_PER_STEP}px)`, pointerEvents: "none" }}
      />

      {/* ── Notícies ── */}
      <section style={{ padding: "clamp(64px,8vh,100px) var(--margin-page)", borderTop: "1px solid #1a1a1a", background: "#fff" }}>
        <header style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "clamp(20px,3vh,36px)", marginBottom: "clamp(40px,5vh,72px)" }}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(32px,4vw,60px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "#000", margin: 0 }}>
            Notícies
          </h2>
        </header>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#ccc", margin: 0 }}>
          Properament
        </p>
      </section>

      {/* ── Drawing tools UI ── */}
      <div
        ref={toolsRef}
        className="pu-draw-tools"
        style={{
          position:      "fixed",
          bottom:        "36px",
          right:         "var(--margin-page, 48px)",
          zIndex:        9996,
          display:       "none",
          opacity:       0,
          pointerEvents: "none",
          userSelect:    "none",
        }}
      >
        {/* Mode buttons */}
        {(["draw", "erase"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            style={{
              background:    "none",
              border:        "none",
              padding:       0,
              cursor:        "pointer",
              fontFamily:    "var(--font-mono)",
              fontSize:      "9px",
              letterSpacing: "0.16em",
              textTransform: "uppercase" as const,
              color:         drawMode === mode ? "#000" : "rgba(0,0,0,0.32)",
              fontWeight:    drawMode === mode ? 700 : 400,
              transition:    "color 180ms ease",
              lineHeight:    1,
            }}
          >
            {(TOOL_LABELS[locale] ?? TOOL_LABELS.ca)[mode]}
          </button>
        ))}

        {/* Separator */}
        <span style={{ color: "rgba(0,0,0,0.18)", fontSize: "9px", lineHeight: 1, fontFamily: "var(--font-mono)" }}>·</span>

        {/* Size: − [dots] + */}
        <button
          onClick={() => handleSizeChange(Math.max(1, strokeSize - 1) as 1|2|3|4)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "14px", lineHeight: 1, color: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center" }}
        >−</button>
        {([1, 2, 3, 4] as const).map((size) => (
          <span
            key={size}
            className="pu-draw-tools-dot"
            onClick={() => handleSizeChange(size)}
            style={{
              width:      `${DOT_SIZES_PX[size]}px`,
              height:     `${DOT_SIZES_PX[size]}px`,
              background: strokeSize === size ? "#000" : "rgba(0,0,0,0.18)",
            }}
          />
        ))}
        <button
          onClick={() => handleSizeChange(Math.min(4, strokeSize + 1) as 1|2|3|4)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "14px", lineHeight: 1, color: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center" }}
        >+</button>

        {/* Separator */}
        <span style={{ color: "rgba(0,0,0,0.18)", fontSize: "9px", lineHeight: 1, fontFamily: "var(--font-mono)" }}>·</span>

        {/* Clear */}
        <button
          onClick={() => clearFnRef.current()}
          style={{
            background:    "none",
            border:        "none",
            padding:       0,
            cursor:        "pointer",
            fontFamily:    "var(--font-mono)",
            fontSize:      "9px",
            letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            color:         "rgba(0,0,0,0.32)",
            transition:    "color 180ms ease",
            lineHeight:    1,
          }}
        >
          {(TOOL_LABELS[locale] ?? TOOL_LABELS.ca).clear}
        </button>
      </div>

      {/* ── Calligraphic drawing canvas (pointer-events:none — links still work) ── */}
      <canvas
        ref={canvasRef}
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        9997,
          pointerEvents: "none",
        }}
      />

      {/* ── Custom cursor: black dot that inverts colors via mix-blend-mode ── */}
      <div
        ref={cursorRef}
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          width:        "10px",
          height:       "10px",
          borderRadius: "50%",
          background:   "#fff",
          mixBlendMode: "difference",
          pointerEvents:"none",
          zIndex:       9998,
          transform:    "translate(-50%, -50%)",
          opacity:      0,
        }}
      />
    </>
  );
}
