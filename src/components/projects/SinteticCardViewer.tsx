"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale, Project } from "@/lib/types";
import { FILTER_UI, LeftFilterPanel, useProjectFilters } from "./ProjectFilterPanel";
import ArchiveNav from "./ArchiveNav";
import MobileCardDeck from "@/components/home/MobileCardDeck";

/* ─── Constants (same as HomeScene) ───────────────────────────────────────── */

const CARDS_PER_STEP = 440;
const LERP_K         = 0.08;

const FIELD_LABELS: Record<string, {
  municipi: string; any: string; ambit: string; sostre: string;
  habitatges: string; readMore: string; view: string;
  explore: string;
}> = {
  ca: { municipi: "Municipi", any: "Any", ambit: "Àmbit", sostre: "Sostre", habitatges: "Habitatges", readMore: "Llegir més", view: "Veure projecte →", explore: "Explorar l'arxiu de projectes" },
  es: { municipi: "Municipio", any: "Año", ambit: "Ámbito", sostre: "Techo", habitatges: "Viviendas", readMore: "Leer más", view: "Ver proyecto →", explore: "Explorar el archivo de proyectos" },
  en: { municipi: "Municipality", any: "Year", ambit: "Scope", sostre: "Floor area", habitatges: "Dwellings", readMore: "Read more", view: "View project →", explore: "Explore the project archive" },
};

/* ─── Helpers (copied verbatim from HomeScene) ─────────────────────────────── */

function isValid(val: string | number | null | undefined): val is string | number {
  if (val === null || val === undefined) return false;
  if (val === "-" || val === "No aplica" || val === "") return false;
  if (typeof val === "number" && val <= 0) return false;
  return true;
}

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

/* ─── FeaturedCard (desktop, idèntica a HomeScene; en mòbil MobileCardDeck) ── */

function FeaturedCard({ project, locale }: { project: Project; locale: string }) {
  const d      = project[locale as "ca" | "es" | "en"];
  const images = project.images.length > 0 ? project.images : [project.coverImage];
  const fl     = FIELD_LABELS[locale] ?? FIELD_LABELS.ca;
  const [descOpen, setDescOpen] = useState(false);

  const dataRows = [
    { label: fl.municipi,   value: d.municipality },
    { label: fl.any,        value: d.year },
    { label: fl.ambit,      value: isValid(d.ambitM2)    ? `${d.ambitM2!.toLocaleString("ca-ES")} m²`    : null },
    { label: fl.sostre,     value: isValid(d.sostreM2)   ? `${d.sostreM2!.toLocaleString("ca-ES")} m²st` : null },
    { label: fl.habitatges, value: isValid(d.habitatges) ? String(d.habitatges)                           : null },
  ].filter(r => isValid(r.value));

  /* ── Desktop layout ── */
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
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(13px,1.1vw,15px)", lineHeight: 1.65, color: "#444", margin: "clamp(20px,3vh,40px) 0 0", overflow: "auto" }}>
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
          {fl.view}
        </Link>
      </div>
    </div>
  );
}

/* ─── SinteticCardViewer ──────────────────────────────────────────────────── */

export default function SinteticCardViewer({ projects, locale }: { projects: Project[]; locale: string }) {
  const loc: Locale = locale === "es" || locale === "en" ? locale : "ca";
  const fl = FIELD_LABELS[locale] ?? FIELD_LABELS.ca;

  const [panelOpen, setPanelOpen] = useState(true);
  const filters = useProjectFilters(projects, loc);
  const shown   = filters.filtered;

  const cardRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const exploreRef  = useRef<HTMLDivElement>(null);
  const vY          = useRef(0);
  const sY          = useRef(0);
  const rafId       = useRef(0);
  const lastTime    = useRef(0);
  const nCardsRef   = useRef(shown.length);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const [isMobile, setIsMobile] = useState(false);

  /* ── Mobile detection ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    if (window.innerWidth <= 768) setPanelOpen(false);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Scroll + RAF loop ── */
  useEffect(() => {
    nCardsRef.current = shown.length;

    // Un nou filtrat torna a començar per la primera targeta
    window.scrollTo(0, 0);
    vY.current = 0;
    sY.current = 0;

    const onScroll = () => {
      vY.current = Math.max(0, window.scrollY);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    lastTime.current = performance.now();

    const tick = (now: number) => {
      lastTime.current = now;
      sY.current += (vY.current - sY.current) * LERP_K;
      const sy     = sY.current;
      const nCards = nCardsRef.current;
      const cardPos = Math.max(0, Math.min(nCards - 1, sy / CARDS_PER_STEP));

      applyCardTransforms(cardRefs.current.slice(0, nCards), cardPos);

      if (exploreRef.current) {
        const show = cardPos > nCards - 1.3;
        exploreRef.current.style.opacity       = show ? "1" : "0";
        exploreRef.current.style.pointerEvents = show ? "auto" : "none";
      }

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isMobile) {
    return (
      <div className="pu-sint-m">
        <div className="pu-sint-m-head">
          <ArchiveNav
            locale={locale}
            active="sintetic"
            filtersOpen={panelOpen}
            onToggleFilters={() => setPanelOpen(o => !o)}
            activeCount={filters.activeTema.size + filters.activeTipus.size + filters.activeEscala.size}
          />
        </div>
        {panelOpen && (
          <div onClick={() => setPanelOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 249, background: "rgba(0,0,0,0.18)" }} />
        )}
        <LeftFilterPanel
          open={panelOpen}
          mobile
          locale={locale}
          activeTema={filters.activeTema}
          activeTipus={filters.activeTipus}
          activeEscala={filters.activeEscala}
          onToggleTema={filters.toggleTema}
          onToggleTipus={filters.toggleTipus}
          onToggleEscala={filters.toggleEscala}
          onClear={filters.clearAll}
        />
        <div className="pu-sint-m-deck">
          {shown.length === 0 && <p className="pu-sint-m-empty">{FILTER_UI[loc].empty}</p>}
          <MobileCardDeck projects={shown} locale={locale} top="var(--header-height)" />
        </div>
        <div className="pu-sint-m-explore">
          <Link href={`/${locale}/projectes`}>{fl.explore}</Link>
        </div>
        <style>{`
          .pu-sint-m-head {
            padding: 36px var(--margin-page) 18px;
            border-bottom: 1px solid rgba(0,0,0,0.08);
            margin: 0 var(--margin-page);
            padding-left: 0; padding-right: 0;
          }
          .pu-sint-m-deck { padding: 16px var(--margin-page) 0; }
          .pu-sint-m-empty { font-family: var(--font-sans); font-size: var(--size-body); color: #888; padding: 40px 0; }
          .pu-sint-m-explore { display: flex; justify-content: center; padding: 28px 0 56px; }
          .pu-sint-m-explore a {
            display: inline-block; background: #000; color: #fff;
            font-family: var(--font-sans); font-size: 13px; font-weight: 500;
            letter-spacing: 0.01em; padding: 12px 26px; border-radius: 100px;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  const totalScrollHeight = shown.length * CARDS_PER_STEP + 300;
  const cardWidth = "min(calc(100% - 40px), 1040px)";

  return (
    <>
      {/* ── Fixed panel (below site header) ── */}
      <div
        style={{
          position:      "fixed",
          top:           "var(--header-height)",
          left:          0,
          right:         0,
          bottom:        0,
          zIndex:        8,
          background:    "#fff",
          display:       "flex",
          flexDirection: "column",
          willChange:    "transform",
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          const dy = e.changedTouches[0].clientY - touchStartY.current;
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            const cardPos     = Math.max(0, sY.current / CARDS_PER_STEP);
            const currentCard = Math.round(cardPos);
            const nCards      = nCardsRef.current;
            const targetCard  = dx < 0
              ? Math.min(nCards - 1, currentCard + 1)
              : Math.max(0, currentCard - 1);
            window.scrollTo({ top: targetCard * CARDS_PER_STEP, behavior: "smooth" });
          }
        }}
      >
        {/* ── Nav tipogràfica ── */}
        <div style={{
          flexShrink: 0,
          padding:    "clamp(28px,4vh,52px) var(--margin-page) clamp(16px,2.5vh,28px)",
          display:    "flex",
          alignItems: "flex-end",
          gap:        "clamp(14px,2.2vw,32px)",
          flexWrap:   "wrap",
          background: "#fff",
          zIndex:     2,
        }}>
<ArchiveNav
            locale={locale}
            active="sintetic"
            filtersOpen={panelOpen}
            onToggleFilters={() => setPanelOpen(o => !o)}
            activeCount={filters.activeTema.size + filters.activeTipus.size + filters.activeEscala.size}
          />
        </div>
        <div style={{ flexShrink: 0, height: "1px", margin: "0 var(--margin-page)", background: "rgba(0,0,0,0.08)" }} />

        {/* ── Panell de filtres (esquerra) + targetes (resta) ── */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {isMobile && panelOpen && (
            <div
              onClick={() => setPanelOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 249, background: "rgba(0,0,0,0.18)" }}
            />
          )}
          <LeftFilterPanel
            open={panelOpen}
            mobile={isMobile}
            locale={locale}
            activeTema={filters.activeTema}
            activeTipus={filters.activeTipus}
            activeEscala={filters.activeEscala}
            onToggleTema={filters.toggleTema}
            onToggleTipus={filters.toggleTipus}
            onToggleEscala={filters.toggleEscala}
            onClear={filters.clearAll}
          />

        {/* ── Card stage ── */}
        <div style={{ flex: 1, minWidth: 0, position: "relative", overflow: "visible", minHeight: 0 }}>
          {shown.length === 0 && (
            <p style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--size-body)", color: "#888", textAlign: "center", maxWidth: "80%" }}>
              {FILTER_UI[loc].empty}
            </p>
          )}
          {shown.map((proj, i) => (
            <div
              key={proj.slug}
              ref={el => { cardRefs.current[i] = el; }}
              style={{
                position:        "absolute",
                top:             "calc(50% + clamp(10px,2vh,20px))",
                left:            "50%",
                width:           cardWidth,
                height:          "min(calc(100% - 96px), 560px)",
                transformOrigin: "center center",
                willChange:      "transform, filter",
                visibility:      i <= 2 ? "visible" : "hidden",
                transform:       `translate(-50%, calc(-50% + ${Math.min(i, 2) * 8}px)) scale(${Math.max(0.90, 1 - Math.min(i, 2) * 0.018).toFixed(4)})`,
                filter:          `brightness(${Math.max(0.84, 1 - Math.min(i, 2) * 0.07).toFixed(3)})`,
                zIndex:          String(1000 - i * 100),
                pointerEvents:   i === 0 ? "auto" : "none",
              }}
            >
              <FeaturedCard project={proj} locale={locale} />
            </div>
          ))}
        </div>
        </div>

        {/* ── Explore button ── */}
        <div style={{ flexShrink: 0, height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            ref={exploreRef}
            style={{ opacity: 0, transition: "opacity 400ms ease", pointerEvents: "none" }}
          >
            <Link
              href={`/${locale}/projectes`}
              style={{ display: "inline-block", background: "#000", color: "#fff", fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.01em", padding: "11px 26px", borderRadius: "100px", textDecoration: "none", boxShadow: "0 3px 16px rgba(0,0,0,0.15)" }}
            >
              {fl.explore}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Scroll space (drives the animation) ── */}
      <div style={{ height: `${totalScrollHeight}px` }} />

      <style>{`
      `}</style>
    </>
  );
}
