"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { drawCalli, type Pt } from "@/lib/calligraphy";
import { PENCIL_CURSOR, SIGN_PATH } from "./PencilGlyph";

/* Easter egg del peu: el web es converteix en paper i es pot dibuixar a sobre.
   Amb el dit: un dit dibuixa, dos dits desplacen. No es desa res: un
   recàrrec o canvi de pàgina ho esborra. */

const COPY: Record<string, { motto: string; clear: string; close: string; trigger: string }> = {
  ca: { motto: "Tot projecte comença amb un traç.",     clear: "Esborrar", close: "Sortir", trigger: "Dibuixar sobre el web" },
  es: { motto: "Todo proyecto empieza con un trazo.",   clear: "Borrar",   close: "Salir",  trigger: "Dibujar sobre la web" },
  en: { motto: "Every project begins with a stroke.",   clear: "Clear",    close: "Exit",   trigger: "Draw on the website" },
};

const STROKE_COLOR = "#fff";

/* ─── Capa de dibuix ─────────────────────────────────────────────────────── */

function PencilLayer({ locale, onClose }: { locale: string; onClose: () => void }) {
  const t = COPY[locale] ?? COPY.ca;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [motto, setMotto] = useState<"hidden" | "shown" | "done">("hidden");
  const mottoRef = useRef(motto);
  mottoRef.current = motto;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Traços en coordenades del document: es mouen amb el contingut en fer scroll
    const strokes: Pt[][] = [];
    let current: Pt[] | null = null;
    let prevMid: Pt | null = null;
    let raf = 0;
    let mottoTimer = 0;

    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      raf = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const ox = window.scrollX;
      const oy = window.scrollY;
      for (const s of strokes) {
        let mid: Pt | null = null;
        for (let i = 1; i < s.length; i++) {
          mid = drawCalli(ctx, { x: s[i - 1].x - ox, y: s[i - 1].y - oy }, { x: s[i].x - ox, y: s[i].y - oy }, mid, 1, STROKE_COLOR);
        }
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };

    const docPt = (e: PointerEvent): Pt => ({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY });

    // Amb el dit: un dit dibuixa, dos dits desplacen la pàgina (amb inèrcia)
    const touches = new Map<number, { x: number; y: number }>();
    let panning = false;
    let panY = 0;
    let panV = 0;
    let panT = 0;
    let inertia = 0;
    const midY = () => {
      let sum = 0;
      touches.forEach((t) => { sum += t.y; });
      return sum / touches.size;
    };
    const stopInertia = () => { cancelAnimationFrame(inertia); inertia = 0; };
    const glide = () => {
      panV *= 0.94;
      if (Math.abs(panV) < 0.3) { inertia = 0; return; }
      window.scrollBy(0, panV);
      inertia = requestAnimationFrame(glide);
    };

    const startStroke = (e: PointerEvent) => {
      current = [docPt(e)];
      strokes.push(current);
      prevMid = null;
      if (mottoRef.current === "hidden") {
        setMotto("shown");
        mottoTimer = window.setTimeout(() => setMotto("done"), 2600);
      }
    };
    const extendStroke = (e: PointerEvent) => {
      if (!current) return;
      const p = docPt(e);
      const last = current[current.length - 1];
      current.push(p);
      prevMid = drawCalli(
        ctx,
        { x: last.x - window.scrollX, y: last.y - window.scrollY },
        { x: p.x - window.scrollX, y: p.y - window.scrollY },
        prevMid, 1, STROKE_COLOR,
      );
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.pointerType !== "touch") {
        if (!e.isPrimary || e.button !== 0) return;
        canvas.setPointerCapture(e.pointerId);
        startStroke(e);
        return;
      }
      stopInertia();
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 1 && !panning) {
        startStroke(e);
      } else if (touches.size === 2) {
        // El segon dit converteix el gest en desplaçament: el traç començat no compta
        if (current) {
          strokes.pop();
          current = null;
          prevMid = null;
          schedule();
        }
        panning = true;
        panY = midY();
        panV = 0;
        panT = performance.now();
      }
    };
    const onMove = (e: PointerEvent) => {
      e.stopPropagation();
      if (e.pointerType !== "touch") { extendStroke(e); return; }
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (panning) {
        if (touches.size < 2) return;
        const y = midY();
        const dy = panY - y;
        const now = performance.now();
        window.scrollBy(0, dy);
        const v = Math.max(-60, Math.min(60, (dy / Math.max(16, now - panT)) * 16));
        panV = panV * 0.6 + v * 0.4;
        panY = y;
        panT = now;
        return;
      }
      extendStroke(e);
    };
    const onUp = (e: PointerEvent) => {
      e.stopPropagation();
      if (e.pointerType === "touch") {
        touches.delete(e.pointerId);
        if (panning) {
          if (touches.size === 0) {
            panning = false;
            if (performance.now() - panT < 80) inertia = requestAnimationFrame(glide);
          } else {
            panY = midY();
          }
          return;
        }
      }
      current = null;
      prevMid = null;
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onClear = () => { strokes.length = 0; schedule(); };
    const onResize = () => { size(); schedule(); };

    size();
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pu-pencil-clear", onClear);
    document.body.classList.add("pu-pencil-on");

    return () => {
      cancelAnimationFrame(raf);
      stopInertia();
      window.clearTimeout(mottoTimer);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pu-pencil-clear", onClear);
      document.body.classList.remove("pu-pencil-on");
    };
  }, [onClose]);

  return (
    <>
      <canvas ref={canvasRef} className="pu-pencil-canvas" style={{ cursor: PENCIL_CURSOR }} />
      <p className={`pu-pencil-motto is-${motto}`} aria-live="polite">{t.motto}</p>
      <div className="pu-pencil-ui">
        <button type="button" onClick={() => window.dispatchEvent(new Event("pu-pencil-clear"))}>{t.clear}</button>
        <button type="button" onClick={onClose} aria-label={t.close}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.4" />
            <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <style>{`
        @keyframes pu-pencil-in { from { opacity: 0; } to { opacity: 1; } }
        .pu-pencil-canvas {
          position: fixed; inset: 0;
          width: 100vw; height: 100vh;
          z-index: 10010;
          mix-blend-mode: difference;
          touch-action: none;
        }
        .pu-pencil-motto {
          position: fixed; left: 50%; bottom: calc(76px + env(safe-area-inset-bottom));
          transform: translateX(-50%);
          z-index: 10011;
          margin: 0;
          font-family: var(--font-sans);
          font-size: 15px;
          letter-spacing: -0.01em;
          color: #fff;
          mix-blend-mode: difference;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 900ms ease;
        }
        .pu-pencil-motto.is-shown { opacity: 1; }
        .pu-pencil-ui {
          position: fixed; left: 50%; bottom: calc(28px + env(safe-area-inset-bottom));
          transform: translateX(-50%);
          z-index: 10011;
          display: flex; align-items: center; gap: 22px;
          mix-blend-mode: difference;
          animation: pu-pencil-in 500ms ease;
        }
        .pu-pencil-ui button {
          display: inline-flex; align-items: center;
          padding: 6px 0;
          border: 0; background: none; cursor: pointer;
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          color: #fff;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-pencil-ui button:hover { opacity: 0.55; }
        body.pu-pencil-on .pu-scroll-top { display: none !important; }
      `}</style>
    </>
  );
}

/* ─── Disparador ─────────────────────────────────────────────────────────── */

/**
 * `inline`: dins del peu o del manifest (ordinador).
 * `floating`: botó flotant a baix a la dreta, a totes les pàgines (mòbil i tauleta).
 */
export default function PencilEgg({ locale, variant = "inline" }: { locale: string; variant?: "inline" | "floating" }) {
  const [active, setActive] = useState(false);
  const pathname = usePathname();
  const close = useRef(() => setActive(false)).current;

  useEffect(() => { setActive(false); }, [pathname]);

  const t = COPY[locale] ?? COPY.ca;

  return (
    <>
      <button
        type="button"
        className={`pu-egg pu-egg--${variant}${active ? " is-active" : ""}`}
        onClick={() => setActive(a => !a)}
        aria-label={t.trigger}
        aria-pressed={active}
      >
        <svg width="34" height="14" viewBox="0 0 34 14" fill="none" aria-hidden="true">
          <path d={SIGN_PATH} pathLength={1} />
        </svg>
      </button>
      {active && createPortal(<PencilLayer locale={locale} onClose={close} />, document.body)}
      <style>{`
        .pu-egg {
          display: inline-flex; align-items: center;
          padding: 10px 6px;
          margin: -10px -6px;
          -webkit-tap-highlight-color: transparent;
          border: 0; background: none; cursor: pointer;
          color: rgba(255,255,255,0.22);
          transition: color 300ms ease;
        }
        .pu-egg path {
          stroke: currentColor; stroke-width: 1.4; stroke-linecap: round;
          stroke-dasharray: 1; stroke-dashoffset: 0;
        }
        .pu-egg:hover, .pu-egg.is-active { color: rgba(255,255,255,0.9); }
        .pu-egg:hover path { animation: pu-egg-draw 900ms cubic-bezier(0.65, 0, 0.35, 1); }
        @keyframes pu-egg-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        .pu-egg--floating { display: none; }
        @media (max-width: 900px), (hover: none) {
          .pu-egg--inline { display: none; }
          .pu-egg--floating {
            display: inline-flex;
            position: fixed;
            right: calc(var(--margin-page) - 6px);
            bottom: calc(10px + env(safe-area-inset-bottom));
            margin: 0;
            z-index: 450;
            color: rgba(255,255,255,0.42);
            mix-blend-mode: difference;
          }
          .pu-egg--floating:hover, .pu-egg--floating.is-active { color: rgba(255,255,255,0.42); }
          body.pu-pencil-on .pu-egg--floating, body.pu-lightbox-open .pu-egg--floating { display: none; }
        }
      `}</style>
    </>
  );
}
