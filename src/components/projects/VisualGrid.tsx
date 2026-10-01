"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale, Project } from "@/lib/types";
import ArchiveNav from "./ArchiveNav";
import { FILTER_UI, LeftFilterPanel, useProjectFilters } from "./ProjectFilterPanel";

const VIEW_LABEL: Record<Locale, { view: string; close: string; prev: string; next: string }> = {
  ca: { view: "Veure projecte", close: "Tancar", prev: "Anterior", next: "Següent" },
  es: { view: "Ver proyecto",   close: "Cerrar", prev: "Anterior", next: "Siguiente" },
  en: { view: "View project",   close: "Close",  prev: "Previous", next: "Next" },
};

/* ─── Vista ampliada ─────────────────────────────────────────────────────── */

function VisualPreview({
  project, locale, onClose, onPrev, onNext,
}: {
  project: Project;
  locale: Locale;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const d  = project[locale];
  const ui = VIEW_LABEL[locale];
  const touchX = useRef<number | null>(null);
  const meta = [d.municipality, d.year].filter(Boolean).join(" · ");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("pu-lightbox-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove("pu-lightbox-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="pu-vp"
      role="dialog"
      aria-modal="true"
      aria-label={d.title}
      onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) (dx < 0 ? onNext : onPrev)();
      }}
    >
      <button type="button" className="pu-vp-close" onClick={onClose} aria-label={ui.close}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3" />
          <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>

      <figure className="pu-vp-figure" key={project.slug} onClick={(e) => e.stopPropagation()}>
        <Link href={`/${locale}/projectes/${project.slug}`} className="pu-vp-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/projects/${project.slug}/${project.coverImage}`} alt={d.title} />
        </Link>
        <figcaption className="pu-vp-caption">
          <div>
            <p className="pu-vp-title">{d.title}</p>
            {d.subtitle && <p className="pu-vp-sub">{d.subtitle}</p>}
            {meta && <p className="pu-vp-meta">{meta}</p>}
          </div>
          <Link href={`/${locale}/projectes/${project.slug}`} className="pu-vp-link">{ui.view} →</Link>
        </figcaption>
      </figure>

      <button type="button" className="pu-vp-nav pu-vp-nav--prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label={ui.prev}>‹</button>
      <button type="button" className="pu-vp-nav pu-vp-nav--next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label={ui.next}>›</button>
    </div>
  );
}

/* ─── VisualGrid ─────────────────────────────────────────────────────────── */

export default function VisualGrid({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const loc = (locale in VIEW_LABEL ? locale : "ca") as Locale;
  const withCover = useMemo(
    () => projects.filter(p => p.coverImage && p.webStatus !== "no"),
    [projects],
  );
  const filters = useProjectFilters(withCover, loc);
  const shown = filters.filtered;

  const [isMobile,  setIsMobile]  = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [openIdx,   setOpenIdx]   = useState<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    if (window.innerWidth > 768) setPanelOpen(true);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setOpenIdx(null); }, [shown]);

  const n = shown.length;
  const close = useMemo(() => () => setOpenIdx(null), []);
  const prev  = useMemo(() => () => setOpenIdx(i => (i === null ? i : (i - 1 + n) % n)), [n]);
  const next  = useMemo(() => () => setOpenIdx(i => (i === null ? i : (i + 1) % n)), [n]);

  return (
    <>
      <div className="pu-visual-head">
        <ArchiveNav
          locale={locale}
          active="visual"
          filtersOpen={panelOpen}
          onToggleFilters={() => setPanelOpen(o => !o)}
          activeCount={filters.activeTema.size + filters.activeTipus.size + filters.activeEscala.size}
        />
      </div>
      <div className="pu-visual-rule" />

      <div className="pu-visual-body">
        {isMobile && panelOpen && (
          <div onClick={() => setPanelOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 249, background: "rgba(0,0,0,0.18)" }} />
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

        <div className="pu-visual-grid-wrap">
          {n === 0 && <p className="pu-visual-empty">{FILTER_UI[loc].empty}</p>}
          <div className="pu-visual-grid">
            {shown.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                className="pu-visual-cell"
                aria-label={p[loc].title}
                onClick={() => setOpenIdx(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/visual/${p.slug}.jpg`}
                  alt={p[loc].title}
                  loading={i < 12 ? "eager" : "lazy"}
                  className="pu-visual-img"
                  onError={(e) => { const fallback = `/projects/${p.slug}/${p.coverImage}`; if (!e.currentTarget.src.endsWith(fallback)) e.currentTarget.src = fallback; }}
                />
                <span className="pu-visual-overlay">
                  <span className="pu-visual-title">{p[loc].title}</span>
                  {p[loc].subtitle && <span className="pu-visual-subtitle">{p[loc].subtitle}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {openIdx !== null && shown[openIdx] && (
        <VisualPreview project={shown[openIdx]} locale={loc} onClose={close} onPrev={prev} onNext={next} />
      )}

      <style>{`
        .pu-visual-head { padding: clamp(36px,5vh,64px) var(--margin-page) 0; }
        .pu-visual-rule { margin: clamp(16px,2.5vh,28px) var(--margin-page) 0; height: 1px; background: rgba(0,0,0,0.08); }
        .pu-visual-body { display: flex; align-items: flex-start; }
        .pu-visual-grid-wrap {
          flex: 1; min-width: 0;
          padding: clamp(24px, 4vh, 48px) var(--margin-page) clamp(48px, 8vh, 96px);
        }
        .pu-visual-empty { font-family: var(--font-sans); font-size: var(--size-body); color: #888; }
        .pu-visual-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: clamp(10px, 1.2vw, 18px);
        }
        .pu-visual-cell {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          padding: 0;
          border: 0;
          overflow: hidden;
          cursor: pointer;
          background: #f0f0ee;
          z-index: 1;
          transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
                      z-index 0ms 480ms;
        }
        @media (hover: hover) {
          .pu-visual-cell:hover {
            transform: scale(1.23);
            z-index: 20;
            transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
                        z-index 0ms 0ms;
          }
          .pu-visual-grid:has(.pu-visual-cell:hover) .pu-visual-cell:not(:hover) {
            opacity: 0.35;
            filter: brightness(0.85);
            transition: transform 480ms cubic-bezier(0.22,1,0.36,1),
                        z-index 0ms 480ms,
                        opacity 280ms ease,
                        filter 280ms ease;
          }
          .pu-visual-cell:hover .pu-visual-overlay { opacity: 1; }
        }
        .pu-visual-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .pu-visual-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          text-align: left;
          padding: clamp(20px, 2vw, 28px) clamp(10px, 1vw, 14px) clamp(10px, 1vw, 14px);
          opacity: 0;
          transition: opacity 280ms ease;
          pointer-events: none;
        }
        .pu-visual-title {
          color: #fff;
          font-family: var(--font-sans);
          font-size: clamp(11px, 0.9vw, 14px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
          display: block;
        }
        .pu-visual-subtitle {
          color: rgba(255,255,255,0.68);
          font-family: var(--font-sans);
          font-size: clamp(8px, 0.62vw, 10px);
          font-weight: 400;
          line-height: 1.3;
          display: block;
          margin-top: 4px;
        }
        @media (max-width: 1200px) {
          .pu-visual-grid { grid-template-columns: repeat(5, 1fr); }
        }
        @media (max-width: 900px) {
          .pu-visual-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }
        }
        @media (max-width: 640px) {
          .pu-visual-grid { grid-template-columns: repeat(3, 1fr); gap: 3px; }
          .pu-visual-grid-wrap { padding: 16px var(--margin-page) 48px; }
        }

        /* ── Vista ampliada ── */
        @keyframes pu-vp-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pu-vp-fig { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: none; } }
        .pu-vp {
          position: fixed; inset: 0; z-index: 400;
          display: flex; align-items: center; justify-content: center;
          padding: 72px clamp(56px, 8vw, 120px) 40px;
          background: rgba(255,255,255,0.97);
          animation: pu-vp-in 260ms ease;
          cursor: zoom-out;
        }
        .pu-vp-figure {
          margin: 0;
          display: flex; flex-direction: column;
          width: min(100%, 980px);
          max-height: 100%;
          cursor: default;
          animation: pu-vp-fig 380ms var(--ease-smooth);
        }
        .pu-vp-img { display: block; min-height: 0; flex: 1; }
        .pu-vp-img img {
          display: block;
          width: 100%;
          height: 100%;
          max-height: calc(100vh - 230px);
          max-height: calc(100svh - 230px);
          object-fit: contain;
        }
        .pu-vp-caption {
          display: flex; justify-content: space-between; align-items: flex-end; gap: 24px;
          padding-top: 18px;
          border-top: 1px solid rgba(0,0,0,0.12);
          margin-top: 18px;
          font-family: var(--font-sans);
        }
        .pu-vp-title { font-size: clamp(20px, 2vw, 28px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; color: #000; margin: 0; }
        .pu-vp-sub   { font-size: 13px; font-style: italic; color: #777; margin: 4px 0 0; line-height: 1.3; }
        .pu-vp-meta  { font-size: var(--size-meta); color: #888; margin: 8px 0 0; font-variant-numeric: tabular-nums; }
        .pu-vp-link {
          flex-shrink: 0;
          font-size: var(--size-body);
          color: #000;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-vp-link:hover { opacity: 0.5; }
        .pu-vp-close {
          position: absolute; top: 24px; right: var(--margin-page);
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border: 0; background: none; color: #000; cursor: pointer;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-vp-close:hover { opacity: 0.5; }
        .pu-vp-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 48px; height: 72px;
          border: 0; background: none; cursor: pointer;
          font-family: var(--font-sans); font-size: 32px; font-weight: 300; color: #999;
          transition: color var(--dur-fast) ease;
        }
        .pu-vp-nav:hover { color: #000; }
        .pu-vp-nav--prev { left: clamp(4px, 2vw, 32px); }
        .pu-vp-nav--next { right: clamp(4px, 2vw, 32px); }

        @media (max-width: 768px) {
          .pu-vp { padding: 64px var(--margin-mobile) 24px; align-items: center; }
          .pu-vp-close { top: 12px; right: 8px; }
          .pu-vp-nav { display: none; }
          .pu-vp-img img { max-height: calc(100svh - 280px); }
          .pu-vp-caption { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pu-visual-cell, .pu-vp, .pu-vp-figure { transition-duration: 0ms !important; animation: none !important; }
        }
      `}</style>
    </>
  );
}
