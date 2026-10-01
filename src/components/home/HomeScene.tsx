"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { NewsItem, Project } from "@/lib/types";
import NewsList from "@/components/news/NewsList";
import { NEWS_LABELS, newsHref, toLoc } from "@/components/news/newsUtils";
import HomeContact from "@/components/home/HomeContact";
import HomeMobile from "@/components/home/HomeMobile";
import HomeStrip from "@/components/home/HomeStrip";
import HomeManifesto from "@/components/home/HomeManifesto";
import { drawCalli } from "@/lib/calligraphy";
import { PENCIL_TIP, PencilGlyph } from "@/components/layout/PencilGlyph";
import { CONTENT, FEATURED_SLUGS, FIELD_LABELS, LangSelector, UI_LABELS, isValid } from "@/components/home/homeShared";

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

const TOOL_LABELS: Record<string, { draw: string; erase: string; clear: string; thin: string; normal: string; thick: string }> = {
  ca: { draw: "Dibuixar", erase: "Esborrar", clear: "Netejar",     thin: "Fi",   normal: "Normal", thick: "Gruixut" },
  es: { draw: "Dibujar",  erase: "Borrar",   clear: "Borrar todo", thin: "Fino", normal: "Normal", thick: "Grueso"  },
  en: { draw: "Draw",     erase: "Erase",    clear: "Clear",       thin: "Thin", normal: "Normal", thick: "Thick"   },
};

const STROKE_MULS  = { 1: 0.3, 2: 0.7, 3: 1.0, 4: 2.4 } as const;

/* Traç que subratlla "Un llapis audaç" abans que aparegui el llapis */
const SIGN_PATH     = "M2 13 C 28 8, 52 17, 82 12 S 136 7, 166 13 C 180 15.5, 191 12, 198 5";
const SIGN_VB       = { w: 200, h: 22 };
const SIGN_STROKE   = 2.2;
const SIGN_DELAY_MS = 300;
const SIGN_DRAW_MS  = 1800;
const DOT_SIZES_PX = { 1: 4,   2: 6,   3: 9,   4: 13  } as const;

/* ─── Easings ────────────────────────────────────────────────────────────── */

function easeInOutSine(t: number) { return -(Math.cos(Math.PI * Math.min(t, 1)) - 1) / 2; }

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


/* ─── HeroLine3: la segona frase ("Un llapis audaç.") és la que es subratlla ── */

function HeroLine3({ text, targetRef }: { text: string; targetRef: React.RefObject<HTMLSpanElement | null> }) {
  const cut = text.indexOf(". ");
  if (cut < 0) return <>{text}</>;
  const second = text.slice(cut + 2).replace(/\.$/, "");
  return <>{text.slice(0, cut + 2)}<span ref={targetRef}>{second}</span>.</>;
}

/* ─── NavLinkHero ────────────────────────────────────────────────────────── */

function NavLinkHero({ label, sub, href, locale }: { label: string; sub: string; href: string; locale: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/${locale}${href}`}
      style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", position: "relative" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--size-meta)", color: "#000", fontWeight: 600, whiteSpace: "nowrap" }}>
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

function FeaturedCard({ project, locale }: { project: Project; locale: string }) {
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

  /* ── Desktop layout: image left, content right ── */
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", border: "1px solid rgba(0,0,0,0.10)", boxShadow: "0 8px 48px rgba(0,0,0,0.08)", display: "flex", overflow: "hidden", borderRadius: "8px" }}>
      <div style={{ flex: "none", aspectRatio: "1 / 1", alignSelf: "stretch", overflow: "hidden", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/projects/${project.slug}/${images[0]}`} alt={d.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", userSelect: "none" }} />
      </div>
      <div style={{ width: "1px", background: "rgba(0,0,0,0.08)", flexShrink: 0, alignSelf: "stretch" }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "clamp(24px,3.5vh,44px) clamp(24px,2.8vw,40px)", overflow: "hidden" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(20px,2vw,32px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#000", margin: "0 0 6px" }}>
            {d.title}
          </h3>
          {d.subtitle && (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(12px,1vw,14px)", fontStyle: "italic", color: "#777", margin: "0 0 clamp(20px,3.5vh,40px)", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              {d.subtitle}
            </p>
          )}
          {!d.subtitle && <div style={{ height: "clamp(20px,3.5vh,40px)" }} />}
        </div>
        {dataRows.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {dataRows.map(r => (
              <div key={r.label} style={{ display: "flex", gap: "14px", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--size-meta)", color: "#aaa", minWidth: "90px", flexShrink: 0 }}>{r.label}</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--size-meta)", color: "#111", fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
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
            style={{ alignSelf: "flex-end", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "11px", color: "#888", padding: 0, borderBottom: "1px solid #ccc", paddingBottom: "2px", marginTop: "clamp(20px,3vh,40px)" }}
          >
            + {fl.readMore}
          </button>
        )}
        <Link href={`/${locale}/projectes/${project.slug}`}
          style={{ fontFamily: "var(--font-sans)", fontSize: "var(--size-meta)", fontWeight: 700, color: "#000", textDecoration: "none", borderBottom: "1.5px solid #000", paddingBottom: "3px", alignSelf: "flex-start", marginTop: "auto", paddingTop: "24px", flexShrink: 0 }}>
          {fl.view} →
        </Link>
      </div>
    </div>
  );
}

/* ─── DesktopHome ────────────────────────────────────────────────────────── */

function DesktopHome({ locale, projects, news }: HomeProps) {
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
  const [introComplete, setIntroComplete] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return sessionStorage.getItem("pu-intro-done") === "1"; } catch { return false; }
  });

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
  const videoElemRef    = useRef<HTMLVideoElement>(null);
  const signRef         = useRef<HTMLDivElement>(null);
  const signTargetRef   = useRef<HTMLSpanElement>(null);
  const signStartedRef  = useRef(false);
  const signTimerRef    = useRef(0);
  const penReadyRef     = useRef(false);
  const lastMouseRef    = useRef<{ x: number; y: number } | null>(null);

  /* Hero-exit lock */
  const heroDoneRef      = useRef(false);
  const heroCompletedRef = useRef(introComplete);  // pre-set if session already saw intro
  const heroMinScrollRef = useRef(0);
  const introOffsetRef   = useRef(introComplete ? SETTLE_END : 0);
  const isMobileRef      = useRef(false);

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
    if (scrollSpaceRef.current && !heroCompletedRef.current) {
      scrollSpaceRef.current.style.height = `calc(100vh + ${totalRangeRef.current}px)`;
    }
    vY.current = Math.min(vY.current, totalRangeRef.current);
  }, [displayProjects.length]);

  /* ── Mobile detection ── */
  useEffect(() => {
    const check = () => {
      const m = window.innerWidth <= 768;
      setIsMobile(m);
      isMobileRef.current = m;
      if (mosaicRef.current) mosaicRef.current.style.display = m ? "none" : "flex";
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Video freeze: restart before black-bar end frames ── */
  useEffect(() => {
    const video = videoElemRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 2) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  const handleModeChange = (mode: "draw" | "erase") => {
    drawModeRef.current = mode;
    setDrawMode(mode);
  };

  const handleSizeChange = (size: 1 | 2 | 3 | 4) => {
    strokeSizeRef.current = size;
    setStrokeSize(size);
  };

  /* ── Traç d'entrada: es dibuixa i s'esvaeix; en acabar apareix el llapis ── */
  const playSign = () => {
    const el = signRef.current;
    const cursorEl = cursorRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduced) { penReadyRef.current = true; return; }
    const target = signTargetRef.current?.getBoundingClientRect();
    if (!target || target.width === 0) { penReadyRef.current = true; return; }
    const width  = target.width + 10;
    const height = (width * SIGN_VB.h) / SIGN_VB.w;
    el.style.left   = `${target.left - 5}px`;
    el.style.top    = `${target.bottom - height * 0.3}px`;
    el.style.width  = `${width}px`;
    el.style.height = `${height}px`;
    if (cursorEl && !lastMouseRef.current) {
      cursorEl.style.left = `${target.right + 5}px`;
      cursorEl.style.top  = `${target.bottom - height * 0.3 + (5 / SIGN_VB.h) * height}px`;
    }
    const path = el.querySelector("path");
    if (path) {
      const len = path.getTotalLength();
      path.style.strokeWidth = `${(SIGN_STROKE * SIGN_VB.w) / width}`;
      path.style.strokeDasharray = `${len}`;
      path.animate(
        [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: SIGN_DRAW_MS, delay: SIGN_DELAY_MS, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "both" },
      );
    }
    el.animate(
      [{ opacity: 1 }, { opacity: 0.95, offset: 0.55 }, { opacity: 0 }],
      { duration: SIGN_DRAW_MS, delay: SIGN_DELAY_MS, easing: "ease-in", fill: "both" },
    );
    signTimerRef.current = window.setTimeout(() => { penReadyRef.current = true; }, SIGN_DELAY_MS + SIGN_DRAW_MS);
  };

  /* ── RAF loop ── */
  useEffect(() => {
    const imgH = window.innerHeight * IMG_H_VH;
    loopH.current    = LEFT_SRCS.length * (imgH + COL_GAP);
    rightOff.current = loopH.current * 0.4;

    const onScroll = () => {
      const raw     = window.scrollY;
      pageY.current = raw;
      // Clamp scrollY to 0 to neutralise rubber-band overshooting on Mac/iOS;
      // after hero is done, also enforce vY >= SETTLE_END so the white-logo layer
      // can never reappear regardless of bounce or negative scroll values.
      let v = Math.min(Math.max(0, raw) + introOffsetRef.current, totalRangeRef.current);
      if (heroCompletedRef.current) v = Math.max(v, SETTLE_END);
      vY.current = v;
    };

    /* ── Mobile touch lock: block scroll-up once hero is done ── */
    let lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => { lastTouchY = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      if (!heroCompletedRef.current) return;
      const currentY  = e.touches[0].clientY;
      const goingUp   = currentY > lastTouchY; // finger moves down → content scrolls up
      lastTouchY = currentY;
      if (goingUp && window.scrollY <= heroMinScrollRef.current + 20) {
        e.preventDefault();
      }
    };

    onScroll();
    sY.current = vY.current; // snap: no lerp flash if page reloads mid-scroll
    window.addEventListener("scroll",      onScroll,      { passive: true });
    window.addEventListener("touchstart",  onTouchStart,  { passive: true });
    window.addEventListener("touchmove",   onTouchMove,   { passive: false });
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
        introOffsetRef.current   = SETTLE_END; // 480 — hero (video) still reachable; white logo is not
        heroMinScrollRef.current = 0;
        // Shrink scroll space: scrollY=0 now maps to hero-with-video, scrollY=OPEN_RANGE maps to cards
        const newRange = nCardsRef.current * CARDS_PER_STEP;
        if (scrollSpaceRef.current) {
          scrollSpaceRef.current.style.height = `calc(100vh + ${newRange}px)`;
        }
        // Jump scrollY back so the visual position doesn't change
        const jumpTo = Math.max(0, pageY.current - introOffsetRef.current);
        window.scrollTo(0, jumpTo);
        pageY.current = jumpTo;
        // Persist intro-done across same-session navigation
        try { sessionStorage.setItem("pu-intro-done", "1"); } catch { /* ignore */ }
        setIntroComplete(true);
      }

      /* ── Phase 0: hero crossfade ── */
      const settleRaw = (sy - SETTLE_START) / (SETTLE_END - SETTLE_START);
      const settleP   = easeInOutSine(Math.max(0, Math.min(1, settleRaw)));

      if (initialLayerRef.current) initialLayerRef.current.style.opacity = (1 - settleP).toFixed(3);
      if (settledLayerRef.current) settledLayerRef.current.style.opacity = settleP.toFixed(3);
      if (videoRef.current)        videoRef.current.style.opacity        = settleP.toFixed(3);
      if (hintRef.current)         hintRef.current.style.opacity         = Math.max(0, 1 - settleP * 2.5).toFixed(3);
      if (fixedLogoRef.current)    fixedLogoRef.current.style.opacity    = settleP.toFixed(3);
      if (!signStartedRef.current && !heroDone && !isMobileRef.current && settleP > 0.97) {
        signStartedRef.current = true;
        playSign();
      }
      if (cursorRef.current)       cursorRef.current.style.opacity       = (heroDone || isMobileRef.current || !penReadyRef.current) ? "0" : settleP.toFixed(3);
      if (canvasRef.current)       canvasRef.current.style.display       = (heroDone || isMobileRef.current) ? "none" : "block";
      if (toolsRef.current) {
        const show = !heroDone && !isMobileRef.current && settleP > 0.3 && penReadyRef.current;
        toolsRef.current.style.display       = (heroDone || isMobileRef.current) ? "none" : "flex";
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
      const exitY = Math.max(0, pageY.current + introOffsetRef.current - totalRange);
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
      window.removeEventListener("scroll",     onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      cancelAnimationFrame(rafId.current);
      window.clearTimeout(signTimerRef.current);
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
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        cursorEl.style.left = `${e.clientX}px`;
        cursorEl.style.top  = `${e.clientY}px`;
        const eraserR = 6 + strokeSizeRef.current * 4;
        if (drawModeRef.current === "erase") {
          cursorEl.classList.add("is-erase");
          cursorEl.style.width        = `${eraserR * 2}px`;
          cursorEl.style.height       = `${eraserR * 2}px`;
        } else {
          cursorEl.classList.remove("is-erase");
          cursorEl.style.width        = "28px";
          cursorEl.style.height       = "28px";
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
      if (heroDoneRef.current || !penReadyRef.current) return;
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
        .pu-hero-cursor { transform: translate(-${PENCIL_TIP.x}px, -${PENCIL_TIP.y}px); transition: opacity 450ms ease; }
        .pu-hero-cursor-pencil { display: block; }
        .pu-hero-cursor.is-erase { transform: translate(-50%, -50%); border: 1.5px solid rgba(0,0,0,0.5); border-radius: 50%; }
        .pu-hero-cursor.is-erase .pu-hero-cursor-pencil { display: none; }
        .pu-hero-sign { position: fixed; top: 0; left: 0; z-index: 9998; pointer-events: none; opacity: 0; }
        .pu-hero-sign svg { display: block; width: 100%; height: 100%; overflow: visible; }
        .pu-hero-sign path { fill: none; stroke: #111; stroke-linecap: round; }
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

      {/* ── HEADER BAND — thin white strip so logo doesn't float z=50 ───────── */}
      {introComplete && (
        <>
          <div className="pu-hero-band" style={{ position: "fixed", top: 0, left: 0, right: 0, background: "#fff", zIndex: 50, pointerEvents: "none" }} />
          <style>{`
            .pu-hero-band { height: 64px; }
            @media (max-width: 768px) { .pu-hero-band { height: 44px; } }
          `}</style>
        </>
      )}

      {/* ── FIXED LOGO z=100 ─────────────────────────────────────────────────── */}
      <div ref={fixedLogoRef} className="pu-home-logo" style={{ position: "fixed", top: "20px", left: "var(--margin-page)", zIndex: 100, opacity: introComplete ? 1 : 0, pointerEvents: "auto" }}>
        <button
          onClick={() => window.scrollTo({ top: SETTLE_END + OPEN_RANGE + 10, behavior: "smooth" })}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "block" }}
          aria-label="Anar a la pàgina principal"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-nuevo.png" alt="Peralta Urbanisme"
            style={{ width: "clamp(220px,26vw,290px)", height: "auto", display: "block", marginLeft: "clamp(-33px,-3vw,-25px)", mixBlendMode: "multiply" }} />
        </button>
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
            const targetScrollY = Math.max(0, SETTLE_END + targetCard * CARDS_PER_STEP - introOffsetRef.current);
            window.scrollTo({ top: targetScrollY, behavior: "instant" });
          }
        }}
      >
        {/* ── Header ── */}
        <div style={{ flexShrink: 0, padding: "112px var(--margin-page) clamp(20px, 3vh, 40px)", position: "relative", zIndex: 2000, background: "#fff" }}>
          <div style={{ marginBottom: "10px" }}>
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
          </div>
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
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--size-meta)", color: "#bbb" }}>
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
              <FeaturedCard project={proj} locale={locale} />
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

      {/* ── HERO z=10 ── */}
      <div
        ref={heroRef}
        style={{ position: "fixed", inset: 0, zIndex: 10, background: "#fff", willChange: "transform", cursor: isMobile ? "default" : "none", userSelect: "none", touchAction: isMobile ? "auto" : "none" }}
      >
        {/* Vídeo de fons — wrapper clips edge artifacts; opacity controlled via ref */}
        <div
          ref={videoRef}
          style={isMobile ? {
            position:   "absolute",
            top:        "2%",
            left:       0,
            right:      0,
            width:      "100%",
            height:     "62%",
            overflow:   "hidden",
            opacity:    0,
            background: "#fff",
          } : {
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
            ref={videoElemRef}
            autoPlay
            muted
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
              style={{ width: "clamp(280px,40vw,560px)", height: "auto", mixBlendMode: "multiply" }} />
          </Link>
        </div>

        {/* SETTLED LAYER — text + links */}
        <div
          ref={settledLayerRef}
          style={{ position: "absolute", inset: 0, opacity: 0, display: "flex", flexDirection: "column", padding: isMobile ? "66% var(--margin-mobile) 20px" : "20px var(--margin-page)", justifyContent: isMobile ? "flex-start" : "flex-end", overflowY: isMobile ? "auto" : "hidden" }}
        >
          <div style={{ maxWidth: isMobile ? "100%" : "min(900px,90%)", paddingBottom: isMobile ? "0" : "clamp(16px,2.5vh,36px)" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(22px,2.4vw,36px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#000", margin: "0 0 0.1em" }}>
              {content.line1}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(22px,2.4vw,36px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#000", margin: "0 0 0.9em" }}>
              {content.line2}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(15px,1.6vw,22px)", fontWeight: 400, lineHeight: 1.35, color: "#111", margin: "0 0 0.5em" }}>
              <HeroLine3 text={content.line3} targetRef={signTargetRef} />
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
        <div ref={hintRef} style={{ position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", userSelect: "none", pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
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
        style={{ height: introComplete
          ? `calc(100vh + ${displayProjects.length * CARDS_PER_STEP}px)`
          : `calc(100vh + ${SETTLE_END + displayProjects.length * CARDS_PER_STEP}px)`,
          pointerEvents: "none" }}
      />

      {/* ── Notícies ── */}
      <section style={{ padding: "clamp(64px,8vh,100px) var(--margin-page)", background: "#fff" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", paddingBottom: "clamp(20px,3vh,36px)", marginBottom: "clamp(40px,5vh,72px)" }}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(32px,4vw,60px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "#000", margin: 0 }}>
            {NEWS_LABELS[toLoc(locale)].title}
          </h2>
          <Link href={newsHref(locale)} className="pu-home-news-all">
            {NEWS_LABELS[toLoc(locale)].all}
          </Link>
        </header>
        <NewsList items={news.slice(0, 6)} locale={locale} expandable />
        <style>{`
          .pu-home-news-all {
            font-family: var(--font-sans);
            font-size: var(--size-body);
            color: #000;
            text-decoration: underline;
            text-decoration-thickness: 1px;
            text-underline-offset: 4px;
            white-space: nowrap;
            transition: opacity var(--dur-fast) ease;
          }
          .pu-home-news-all:hover { opacity: 0.5; }
        `}</style>
      </section>

      <HomeStrip locale={locale} />

      <HomeContact locale={locale} />

      <HomeManifesto locale={locale} />

      {/* ── Drawing tools UI ── */}
      <div
        ref={toolsRef}
        className="pu-draw-tools"
        style={{
          position:      "fixed",
          bottom:        "14px",
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
              fontFamily:    "var(--font-sans)",
              fontSize:      "var(--size-meta)",
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
        <span style={{ color: "rgba(0,0,0,0.18)", fontSize: "var(--size-meta)", lineHeight: 1, fontFamily: "var(--font-sans)" }}>·</span>

        {/* Size: − [dots] + */}
        <button
          onClick={() => handleSizeChange(Math.max(1, strokeSize - 1) as 1|2|3|4)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1, color: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center" }}
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
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1, color: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center" }}
        >+</button>

        {/* Separator */}
        <span style={{ color: "rgba(0,0,0,0.18)", fontSize: "var(--size-meta)", lineHeight: 1, fontFamily: "var(--font-sans)" }}>·</span>

        {/* Clear */}
        <button
          onClick={() => clearFnRef.current()}
          style={{
            background:    "none",
            border:        "none",
            padding:       0,
            cursor:        "pointer",
            fontFamily:    "var(--font-sans)",
            fontSize:      "var(--size-meta)",
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

      {/* ── Traç d'entrada ── */}
      <div ref={signRef} className="pu-hero-sign" aria-hidden="true">
        <svg viewBox={`0 0 ${SIGN_VB.w} ${SIGN_VB.h}`}>
          <path d={SIGN_PATH} />
        </svg>
      </div>

      {/* ── Cursor propi: llapis (o cercle en mode esborrar) ── */}
      <div
        ref={cursorRef}
        className="pu-hero-cursor"
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          width:        "28px",
          height:       "28px",
          pointerEvents:"none",
          zIndex:       9998,
          opacity:      0,
        }}
      >
        <PencilGlyph className="pu-hero-cursor-pencil" />
      </div>
    </>
  );
}

/* ─── HomeScene ──────────────────────────────────────────────────────────── */

type HomeProps = { locale: string; projects: Project[]; news: NewsItem[] };

// Telèfons (i tauletes en vertical) fan servir una home de scroll natiu: el
// scroll virtual del desktop no s'entén bé amb el dit.
const MOBILE_QUERY = "(max-width: 768px), (max-width: 1100px) and (orientation: portrait), (max-height: 500px)";

function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export default function HomeScene(props: HomeProps) {
  const mobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
  return mobile ? <HomeMobile {...props} /> : <DesktopHome {...props} />;
}
