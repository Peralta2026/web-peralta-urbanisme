"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { Project, TagSlug } from "@/lib/types";
import { ALL_TAGS } from "@/lib/types";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function localizeHref(href: string, locale: string) {
  return locale === "ca" ? href : `/${locale}${href}`;
}

/* ─── Tag labels ─────────────────────────────────────────────────────────── */

const TAG_LABELS: Record<TagSlug, string> = {
  "residencial":                 "Residencial",
  "transformacio":               "Transformació",
  "extensio":                    "Extensió",
  "regeneracio":                 "Regeneració",
  "activitat-economica":         "Activitat Econòmica",
  "infraestructura-verda":       "Infraestructura Verda",
  "integracio-infraestructures": "Integració Infraestructures",
  "estructura-urbana":           "Estructura Urbana",
  "divulgacio":                  "Divulgació",
  "espai-public":                "Espai Públic",
  "participacio-ciutadana":      "Participació Ciutadana",
  "encaixos-singulars":          "Encaixos Singulars",
};

const TIPUS_OPTS = ["Planejament", "Estudis urbanístics", "Avantprojectes singulars"];
const ABAST_OPTS = ["Sector", "Municipi", "Territorial"];

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface ProjectViewerHandle {
  addDelta:       (delta: number) => void;
  isAtTop:        () => boolean;
  setLogoOpacity: (o: number) => void;
}

interface Props {
  projects: Project[];
  locale:   string;
}

interface FilterState {
  tema:  string;
  tipus: string;
  abast: string;
}

type Dim = "tema" | "tipus" | "abast";

/* ─── Physics ────────────────────────────────────────────────────────────── */

const SENSITIVITY = 0.0006;
const MAX_VEL     = 0.04;
const FRICTION    = 0.82;
const LERP_K      = 0.10;
const SETTLE_MS   = 320;
const SETTLE_K    = 0.18;
const SNAP_EPS    = 0.003;

const PANEL_BG = "#f7f6f3";

/* ─── Image helpers ──────────────────────────────────────────────────────── */

function getImages(proj: Project): string[] {
  const all = [proj.coverImage, ...(proj.images ?? [])].filter(Boolean);
  return all.length > 0 ? all : [proj.coverImage];
}

function imgSrc(proj: Project, idx: number) {
  const imgs = getImages(proj);
  return `/projects/${proj.slug}/${imgs[Math.max(0, Math.min(idx, imgs.length - 1))]}`;
}

/* ─── Lightbox ───────────────────────────────────────────────────────────── */

function Lightbox({
  proj, idx, onClose, onPrev, onNext,
}: {
  proj:    Project;
  idx:     number;
  onClose: () => void;
  onPrev:  () => void;
  onNext:  () => void;
}) {
  const imgs = getImages(proj);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onPrev();
      if (e.key === "ArrowRight")  onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.93)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <button onClick={onClose} style={{ position: "absolute", top: "24px", right: "32px", background: "none", border: "none", color: "#fff", fontSize: "30px", cursor: "pointer", lineHeight: 1, zIndex: 10 }}>
        ×
      </button>

      {imgs.length > 1 && (
        <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", userSelect: "none" }}>
          {idx + 1} / {imgs.length}
        </div>
      )}

      {idx > 0 && (
        <button onClick={e => { e.stopPropagation(); onPrev(); }} style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#fff", fontSize: "36px", cursor: "pointer", padding: "12px", opacity: 0.7 }}>
          ‹
        </button>
      )}
      {idx < imgs.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNext(); }} style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#fff", fontSize: "36px", cursor: "pointer", padding: "12px", opacity: 0.7 }}>
          ›
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc(proj, idx)}
        alt=""
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "92vw", maxHeight: "90vh", objectFit: "contain", display: "block", userSelect: "none" }}
      />
    </div>
  );
}

/* ─── FilterBar ──────────────────────────────────────────────────────────── */

function FilterBarPV({
  filters, activeDim, onToggleDim, onSelectOption, onClearDim, projects,
}: {
  filters:        FilterState;
  activeDim:      Dim | null;
  onToggleDim:    (d: Dim) => void;
  onSelectOption: (d: Dim, value: string) => void;
  onClearDim:     (d: Dim) => void;
  projects:       Project[];
}) {
  const dims: { key: Dim; label: string }[] = [
    { key: "tema",  label: "Temàtica" },
    { key: "tipus", label: "Tipus"    },
    { key: "abast", label: "Escala"   },
  ];

  const getDisplay = (d: Dim) => {
    if (d === "tema")  return filters.tema  ? (TAG_LABELS[filters.tema as TagSlug] ?? filters.tema) : "";
    if (d === "tipus") return filters.tipus;
    return filters.abast;
  };

  const getOpts = (d: Dim) => {
    if (d === "tema") {
      const used = ALL_TAGS.filter(t => projects.some(p => p.tags.includes(t)));
      return used.map(t => ({ value: t, label: TAG_LABELS[t] }));
    }
    if (d === "tipus") return TIPUS_OPTS.map(v => ({ value: v, label: v }));
    return ABAST_OPTS.map(v => ({ value: v, label: v }));
  };

  const getVal = (d: Dim) => d === "tema" ? filters.tema : d === "tipus" ? filters.tipus : filters.abast;

  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", background: PANEL_BG, flexShrink: 0 }}>
      <div style={{ padding: "0 clamp(32px,5vw,64px)", display: "flex", alignItems: "center", gap: "clamp(20px,3.5vw,48px)", minHeight: "52px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", whiteSpace: "nowrap", flexShrink: 0 }}>
          Filtra per:
        </span>
        {dims.map(({ key, label }) => {
          const val = getDisplay(key); const isOpen = activeDim === key; const hasVal = !!val;
          return (
            <button key={key} onClick={() => onToggleDim(key)} style={{ background: "none", border: "none", borderBottom: isOpen ? "1.5px solid #000" : "1.5px solid transparent", cursor: "pointer", padding: "4px 0 2px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: (isOpen || hasVal) ? "#000" : "rgba(0,0,0,0.45)", fontWeight: (isOpen || hasVal) ? 700 : 400, transition: "color 160ms, border-color 160ms", display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap", flexShrink: 0 }}>
              {hasVal ? `${label}: ${val}` : label}
              {hasVal && <span role="button" onClick={e => { e.stopPropagation(); onClearDim(key); }} style={{ fontSize: "14px", lineHeight: 1, opacity: 0.4, cursor: "pointer" }}>×</span>}
            </button>
          );
        })}
      </div>
      {activeDim && (
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", padding: "clamp(12px,2vh,18px) clamp(32px,5vw,64px)", display: "flex", gap: "clamp(8px,1.5vw,16px)", flexWrap: "wrap", alignItems: "center" }}>
          {getOpts(activeDim).map((opt, i, arr) => {
            const isSel = getVal(activeDim) === opt.value;
            return (
              <span key={opt.value} style={{ display: "flex", alignItems: "center", gap: "clamp(8px,1.5vw,14px)" }}>
                <button onClick={() => onSelectOption(activeDim, opt.value)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-sans)", fontSize: "clamp(13px,1.5vw,17px)", letterSpacing: "-0.01em", color: isSel ? "#000" : "#999", fontWeight: isSel ? 700 : 400, textDecoration: isSel ? "underline" : "none", textUnderlineOffset: "3px", whiteSpace: "nowrap" }}>
                  {opt.label}
                </button>
                {i < arr.length - 1 && <span style={{ color: "rgba(0,0,0,0.2)", fontSize: "11px", userSelect: "none" }}>·</span>}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────── */

function Card({
  proj, locale, imgIdx, onImgPrev, onImgNext, onImgLightbox, isExpanded, onToggleExpand,
}: {
  proj:           Project;
  locale:         string;
  imgIdx:         number;
  onImgPrev:      () => void;
  onImgNext:      () => void;
  onImgLightbox:  () => void;
  isExpanded:     boolean;
  onToggleExpand: () => void;
}) {
  const d    = proj[locale as "ca" | "es" | "en"];
  const imgs = getImages(proj);
  const src  = imgSrc(proj, imgIdx);
  const hasLong = !!(d.descriptionLong && d.descriptionLong.trim() && d.descriptionLong !== d.descriptionShort);

  return (
    <div className="pu-card">

      {/* ── Image ── */}
      <div className="pu-card-img-zone">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={d.title} className="pu-card-img" />

        {/* click zones: left prev | center lightbox | right next */}
        {imgIdx > 0 && <div className="pu-iz pu-iz-l" onClick={onImgPrev} />}
        <div className="pu-iz pu-iz-c" onClick={onImgLightbox} />
        {imgIdx < imgs.length - 1 && <div className="pu-iz pu-iz-r" onClick={onImgNext} />}

        {/* arrow overlays */}
        {imgIdx > 0 && <div className="pu-arr pu-arr-l" onClick={onImgPrev}>‹</div>}
        {imgIdx < imgs.length - 1 && <div className="pu-arr pu-arr-r" onClick={onImgNext}>›</div>}

        {/* dots */}
        {imgs.length > 1 && (
          <div className="pu-dots">
            {imgs.map((_, i) => (
              <span key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: i === imgIdx ? "#111" : "rgba(0,0,0,0.18)", flexShrink: 0, transition: "background 200ms" }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div style={{ width: "1px", background: "rgba(0,0,0,0.09)", flexShrink: 0, alignSelf: "stretch" }} />

      {/* ── Text ── */}
      <div className="pu-card-text">

        <p className="pu-meta">
          {d.municipality}{d.year ? ` · ${d.year}` : ""}{d.tipus ? ` · ${d.tipus}` : ""}
        </p>

        <h2 className="pu-card-title">{d.title}</h2>

        <div className="pu-card-desc">
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "clamp(12.5px,1.05vw,14.5px)", lineHeight: 1.78, color: "#555" }}>
            {d.descriptionShort}
          </p>
          {isExpanded && hasLong && (
            <p style={{ margin: "1em 0 0", fontFamily: "var(--font-sans)", fontSize: "clamp(12.5px,1.05vw,14.5px)", lineHeight: 1.78, color: "#666" }}>
              {d.descriptionLong}
            </p>
          )}
        </div>

        {proj.tags.length > 0 && (
          <p className="pu-tags">
            {proj.tags.map(t => TAG_LABELS[t] ?? t).join(" · ")}
          </p>
        )}

        <div className="pu-card-actions">
          {hasLong && (
            <button onClick={onToggleExpand} className="pu-action-btn">
              {isExpanded ? "− Reduir" : "+ Llegir més"}
            </button>
          )}
          <Link href={localizeHref(`/projectes/${proj.slug}`, locale)} className="pu-action-link">
            Veure projecte →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── ProjectViewer ──────────────────────────────────────────────────────── */

const ProjectViewer = forwardRef<ProjectViewerHandle, Props>(
  function ProjectViewer({ projects, locale }, ref) {
    const [filters,    setFilters]    = useState<FilterState>({ tema: "", tipus: "", abast: "" });
    const [activeDim,  setActiveDim]  = useState<Dim | null>(null);
    const [imgIndices, setImgIndices] = useState<Record<string, number>>({});
    const [lightbox,   setLightbox]   = useState<{ slug: string; idx: number } | null>(null);
    const [expanded,   setExpanded]   = useState<Set<string>>(new Set());
    const [activeIdx,  setActiveIdx]  = useState(0);

    const filteredProjects = useMemo(() => projects.filter(p => {
      const ca = p.ca;
      const ok1 = !filters.tema  || p.tags.includes(filters.tema  as TagSlug);
      const ok2 = !filters.tipus || ca.tipus  === filters.tipus;
      const ok3 = !filters.abast || ca.status === filters.abast;
      return ok1 && ok2 && ok3;
    }), [projects, filters]);

    const N = filteredProjects.length;

    const logoRef  = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const rafId    = useRef(0);
    const projVel   = useRef(0);
    const rawPos    = useRef(0);
    const dispPos   = useRef(0);
    const lastInput = useRef(0);

    useImperativeHandle(ref, () => ({
      addDelta(delta: number) {
        if (N <= 1) return;
        const add = Math.max(-MAX_VEL, Math.min(MAX_VEL, delta * SENSITIVITY));
        projVel.current = Math.max(-MAX_VEL, Math.min(MAX_VEL, projVel.current + add));
        lastInput.current = performance.now();
      },
      isAtTop()              { return rawPos.current < 0.05; },
      setLogoOpacity(o: number) {
        if (logoRef.current) {
          logoRef.current.style.opacity = String(o);
          logoRef.current.style.pointerEvents = o > 0.5 ? "auto" : "none";
        }
      },
    }), [N]);

    useEffect(() => {
      rawPos.current = 0; dispPos.current = 0; projVel.current = 0; setActiveIdx(0);
    }, [filters]);

    const applyTransforms = useCallback(() => {
      const dp = dispPos.current;

      /*
       * DECK MODEL — all cards live at the SAME screen position, stacked.
       *
       * STACK_OFFSET: the small vertical gap between depth levels.
       *   Cards below the active one are shifted DOWN by this amount,
       *   so their top edges peek out from beneath the card above them.
       *
       * Transitions: when active card (delta=0) moves to delta=-1,
       *   ty goes from 0 → STACK_OFFSET (card sinks into the deck).
       *   The incoming card goes from ty=STACK_OFFSET → 0 (rises to top).
       *   Total travel: ONE STACK_OFFSET (24px) — very compact, no list scrolling.
       *
       * z-index: card closest to delta=0 is highest. At the midpoint (absD equal),
       *   DOM order breaks the tie: the incoming card (higher index) renders on top.
       *
       * Past cards (delta<0) and upcoming cards (delta>0) are at THE SAME ty
       *   for equal |delta|. Past cards are hidden behind incoming cards via z.
       */
      const STACK_OFFSET = 24; // px per depth level

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const delta = i - dp;
        const absD  = Math.abs(delta);

        if (absD > 3.5) { el.style.visibility = "hidden"; el.style.pointerEvents = "none"; return; }

        el.style.visibility = "visible";
        el.style.opacity    = "1"; /* physical movement only — no fading */

        const depth  = Math.min(absD, 3);
        const ty     = depth * STACK_OFFSET;     /* ALL depths shift down the same way */
        const sc     = Math.max(0.90, 1 - depth * 0.022);
        const bright = Math.max(0.76, 1 - depth * 0.08);
        const z      = Math.round(1000 - absD * 100); /* DOM order breaks ties at midpoint */

        el.style.transform     = `translate(-50%, calc(-50% + ${ty.toFixed(1)}px)) scale(${sc.toFixed(4)})`;
        el.style.filter        = `brightness(${bright.toFixed(3)})`;
        el.style.zIndex        = String(Math.max(0, z));
        el.style.pointerEvents = absD < 0.4 ? "auto" : "none";
      });
    }, []);

    useEffect(() => {
      let prev = 0;
      const tick = () => {
        const nCurr   = N;
        const settled = performance.now() - lastInput.current > SETTLE_MS;
        if (settled) {
          projVel.current = 0;
          const target = Math.max(0, Math.min(nCurr - 1, Math.round(rawPos.current)));
          const dist   = target - rawPos.current;
          if (Math.abs(dist) < SNAP_EPS) rawPos.current = target; else rawPos.current += dist * SETTLE_K;
        } else {
          rawPos.current  += projVel.current;
          projVel.current *= FRICTION;
        }
        rawPos.current  = Math.max(0, Math.min(Math.max(0, nCurr - 1), rawPos.current));
        dispPos.current = dispPos.current + (rawPos.current - dispPos.current) * LERP_K;
        dispPos.current = Math.max(0, Math.min(Math.max(0, nCurr - 1), dispPos.current));
        applyTransforms();
        const dom = Math.max(0, Math.min(Math.max(0, nCurr - 1), Math.round(dispPos.current)));
        if (dom !== prev) { prev = dom; setActiveIdx(dom); }
        rafId.current = requestAnimationFrame(tick);
      };
      rafId.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId.current);
    }, [N, applyTransforms]);

    const getImgIdx = (slug: string) => imgIndices[slug] ?? 0;

    const handleImgPrev = useCallback((slug: string, total: number) =>
      setImgIndices(p => ({ ...p, [slug]: Math.max(0, (p[slug] ?? 0) - 1) })), []);

    const handleImgNext = useCallback((slug: string, total: number) =>
      setImgIndices(p => ({ ...p, [slug]: Math.min(total - 1, (p[slug] ?? 0) + 1) })), []);

    const handleToggleExpand = useCallback((slug: string) =>
      setExpanded(p => { const n = new Set(p); n.has(slug) ? n.delete(slug) : n.add(slug); return n; }), []);

    const handleToggleDim    = (d: Dim) => setActiveDim(a => a === d ? null : d);
    const handleSelectOption = (d: Dim, value: string) => {
      setFilters(f => { const cur = d === "tema" ? f.tema : d === "tipus" ? f.tipus : f.abast; return { ...f, [d]: cur === value ? "" : value }; });
      setActiveDim(null);
    };
    const handleClearDim = (d: Dim) => setFilters(f => ({ ...f, [d]: "" }));

    return (
      <>
        <style>{`
          .pu-card {
            width: 100%; height: 100%;
            display: flex; flex-direction: row;
            background: #ffffff;
            border-radius: 22px;
            border: 1px solid rgba(0,0,0,0.10);
            overflow: hidden;
            box-shadow: 0 6px 32px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.06);
          }
          .pu-card-img-zone {
            flex: 0 0 52%; position: relative;
            background: #fff;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
          }
          .pu-card-img {
            max-width: 100%; max-height: 100%;
            width: auto; height: auto;
            object-fit: contain; display: block;
            user-select: none; pointer-events: none;
            padding: clamp(16px,3%,36px);
          }
          .pu-iz { position: absolute; top: 0; bottom: 0; z-index: 3; }
          .pu-iz-l { left: 0;   width: 28%; cursor: w-resize; }
          .pu-iz-c { left: 28%; right: 28%; cursor: zoom-in;  }
          .pu-iz-r { right: 0;  width: 28%; cursor: e-resize; }
          .pu-arr {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: rgba(255,255,255,0.85); border-radius: 50%;
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; color: #333; cursor: pointer; z-index: 4;
            opacity: 0; transition: opacity 180ms;
            box-shadow: 0 1px 6px rgba(0,0,0,0.12); user-select: none;
          }
          .pu-card-img-zone:hover .pu-arr { opacity: 1; }
          .pu-arr-l { left: 10px;  }
          .pu-arr-r { right: 10px; }
          .pu-dots {
            position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
            display: flex; gap: 5px; align-items: center; z-index: 3;
          }
          .pu-card-text {
            flex: 1; min-width: 0;
            display: flex; flex-direction: column;
            padding: clamp(28px,4vh,48px) clamp(24px,3vw,48px);
            overflow: hidden;
          }
          .pu-meta {
            font-family: var(--font-mono);
            font-size: 9.5px; letter-spacing: 0.10em; text-transform: uppercase;
            color: #bbb; margin: 0 0 clamp(12px,2.2vh,20px);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .pu-card-title {
            font-family: var(--font-sans);
            font-size: clamp(17px,1.8vw,28px);
            font-weight: 700; letter-spacing: -0.025em; line-height: 1.1;
            color: #000; margin: 0 0 clamp(12px,2vh,20px);
          }
          .pu-card-desc {
            flex: 1; min-height: 0;
            overflow-y: auto;
            margin: 0 0 clamp(10px,1.8vh,18px);
            scrollbar-width: none;
          }
          .pu-card-desc::-webkit-scrollbar { display: none; }
          .pu-tags {
            font-family: var(--font-mono);
            font-size: 8px; letter-spacing: 0.08em; color: #ccc;
            text-transform: uppercase; line-height: 1.9;
            margin: 0 0 clamp(12px,2vh,20px); flex-shrink: 0;
          }
          .pu-card-actions {
            display: flex; gap: 22px; align-items: baseline;
            flex-wrap: wrap; flex-shrink: 0;
          }
          .pu-action-btn {
            font-family: var(--font-mono);
            font-size: 9.5px; letter-spacing: 0.10em; text-transform: uppercase;
            color: #555; background: none; border: none; cursor: pointer;
            padding: 0 0 2px; border-bottom: 1px solid #bbb;
          }
          .pu-action-btn:hover { color: #000; border-color: #000; }
          .pu-action-link {
            font-family: var(--font-mono);
            font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase;
            color: #111; text-decoration: none;
            border-bottom: 1px solid #111; padding-bottom: 2px;
          }
          .pu-action-link:hover { opacity: 0.6; }

          @media (max-width: 640px) {
            .pu-card { flex-direction: column; border-radius: 22px; }
            .pu-card-img-zone { flex: 0 0 46%; }
            .pu-card-text { flex: 1; padding: 20px 22px; }
          }
        `}</style>

        <div style={{ position: "absolute", inset: 0, fontFamily: "var(--font-sans)", display: "flex", flexDirection: "column", background: PANEL_BG }}>

          {/* Logo bar */}
          <div ref={logoRef} style={{ flexShrink: 0, height: "72px", display: "flex", alignItems: "center", padding: "0 clamp(32px,5vw,64px)", opacity: 0, pointerEvents: "none", borderBottom: "1px solid rgba(0,0,0,0.08)", background: PANEL_BG }}>
            <Link href={localizeHref("/", locale)} style={{ textDecoration: "none", display: "inline-block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-nuevo.png" alt="Peralta Urbanisme" style={{ width: "clamp(160px,20vw,210px)", height: "auto", display: "block" }} />
            </Link>
          </div>

          {/* Filter bar */}
          <FilterBarPV filters={filters} activeDim={activeDim} onToggleDim={handleToggleDim} onSelectOption={handleSelectOption} onClearDim={handleClearDim} projects={projects} />

          {/* Card stage */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

            {filteredProjects.length === 0 ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", color: "#bbb", textTransform: "uppercase" }}>
                  Cap projecte coincideix
                </p>
              </div>
            ) : (
              filteredProjects.map((proj, i) => {
                const imgs  = getImages(proj);
                const iIdx  = getImgIdx(proj.slug);
                const isExp = expanded.has(proj.slug);
                return (
                  <div
                    key={proj.slug}
                    ref={el => { cardRefs.current[i] = el; }}
                    style={{
                      position: "absolute", top: "50%", left: "50%",
                      /* card is shorter than stage so the next card's top edge peeks below */
                      width:    "min(calc(100% - 48px), 1160px)",
                      height:   "min(calc(100% - 88px), 440px)",
                      transformOrigin: "center center",
                      willChange: "transform, filter",
                      visibility:    i > 3 ? "hidden" : "visible",
                      opacity:       "1",
                      /* SSR initial state: tight deck stack (24px offset per level) */
                      transform:  `translate(-50%, calc(-50% + ${Math.min(i, 3) * 24}px)) scale(${Math.max(0.90, 1 - Math.min(i, 3) * 0.022).toFixed(4)})`,
                      filter:     `brightness(${Math.max(0.76, 1 - Math.min(i, 3) * 0.08).toFixed(3)})`,
                      zIndex:     String(1000 - i * 100),
                      pointerEvents: i === 0 ? "auto" : "none",
                    }}
                  >
                    <Card
                      proj={proj} locale={locale}
                      imgIdx={iIdx}
                      onImgPrev={() => handleImgPrev(proj.slug, imgs.length)}
                      onImgNext={() => handleImgNext(proj.slug, imgs.length)}
                      onImgLightbox={() => setLightbox({ slug: proj.slug, idx: iIdx })}
                      isExpanded={isExp}
                      onToggleExpand={() => handleToggleExpand(proj.slug)}
                    />
                  </div>
                );
              })
            )}

            {N > 0 && (
              <div style={{ position: "absolute", bottom: "12px", right: "clamp(32px,5vw,64px)", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#ccc", userSelect: "none", zIndex: 200 }}>
                {String(activeIdx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
              </div>
            )}
          </div>
        </div>

        {/* Lightbox */}
        {lightbox && (() => {
          const lp = projects.find(p => p.slug === lightbox.slug);
          if (!lp) return null;
          const li = getImages(lp);
          return (
            <Lightbox
              proj={lp} idx={lightbox.idx}
              onClose={() => setLightbox(null)}
              onPrev={() => setLightbox(l => l && l.idx > 0 ? { ...l, idx: l.idx - 1 } : l)}
              onNext={() => setLightbox(l => l && l.idx < li.length - 1 ? { ...l, idx: l.idx + 1 } : l)}
            />
          );
        })()}
      </>
    );
  }
);

export default ProjectViewer;
