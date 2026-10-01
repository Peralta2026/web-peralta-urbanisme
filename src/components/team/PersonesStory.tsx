"use client";

import { useEffect, useRef } from "react";

/* Dramatúrgia de Persones:
   01 qui som (obertura) → 02 les persones + verbs → 03 la mateixa taula → 04 què en surt */

type Loc = "ca" | "es" | "en";
const toLoc = (l: string): Loc => (l === "es" || l === "en" ? l : "ca");

const COPY: Record<Loc, {
  opening: { a: string; b: string; c: string; d: string; e: string };
  mobileOpening: string[];
  verbs: string[];
  ofici: string;
  table: { dades: string; planol: string; norma: string; carrer: string; close: string; datum: string; datumNote: string };
  closing: string[];
}> = {
  ca: {
    opening: { a: "Un equip capaç de passar", b: "del dibuix a la norma,", c: "del territori al detall", d: "i de l’anàlisi", e: "a la proposta." },
    mobileOpening: ["Un equip capaç de passar del dibuix a la norma,", "del territori al detall", "i de l’anàlisi a la proposta."],
    verbs: ["Analitzar", "Dibuixar", "Calcular", "Negociar", "Imaginar"],
    ofici: "Tot forma part del mateix ofici.",
    table: { dades: "Mirem les dades.", planol: "Mirem el plànol.", norma: "Mirem la norma.", carrer: "Mirem el carrer.", close: "El projecte comença quan ho posem tot sobre la mateixa taula.", datum: "120.871 m²", datumNote: "àmbit · MPGM Bonaigua, Sant Just Desvern" },
    closing: ["Rigor per entendre.", "Criteri per decidir.", "Capacitat per transformar."],
  },
  es: {
    opening: { a: "Un equipo capaz de pasar", b: "del dibujo a la norma,", c: "del territorio al detalle", d: "y del análisis", e: "a la propuesta." },
    mobileOpening: ["Un equipo capaz de pasar del dibujo a la norma,", "del territorio al detalle", "y del análisis a la propuesta."],
    verbs: ["Analizar", "Dibujar", "Calcular", "Negociar", "Imaginar"],
    ofici: "Todo forma parte del mismo oficio.",
    table: { dades: "Miramos los datos.", planol: "Miramos el plano.", norma: "Miramos la norma.", carrer: "Miramos la calle.", close: "El proyecto empieza cuando lo ponemos todo sobre la misma mesa.", datum: "120.871 m²", datumNote: "ámbito · MPGM Bonaigua, Sant Just Desvern" },
    closing: ["Rigor para entender.", "Criterio para decidir.", "Capacidad para transformar."],
  },
  en: {
    opening: { a: "A team able to move", b: "from drawing to regulation,", c: "from territory to detail", d: "and from analysis", e: "to proposal." },
    mobileOpening: ["A team able to move from drawing to regulation,", "from territory to detail", "and from analysis to proposal."],
    verbs: ["Analyse", "Draw", "Calculate", "Negotiate", "Imagine"],
    ofici: "It is all part of the same craft.",
    table: { dades: "We look at the data.", planol: "We look at the plan.", norma: "We look at the regulations.", carrer: "We look at the street.", close: "The project begins when we put it all on the same table.", datum: "120,871 m²", datumNote: "scope · MPGM Bonaigua, Sant Just Desvern" },
    closing: ["Rigour to understand.", "Judgement to decide.", "Capacity to transform."],
  },
};

/* Les paraules entren en negre quan arriben a la seva posició (sense fos) */
function useInk(selector: string) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-inked"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -32% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector]);
  return ref;
}

const INK_CSS = `
  .pu-ink { color: #d6d6d6; transition: color 220ms linear; }
  .pu-ink.is-inked { color: #000; }
  @media (prefers-reduced-motion: reduce) { .pu-ink { color: #000; transition: none; } }
`;

/* ─── 01 · Obertura ──────────────────────────────────────────────────────── */

export function PersonesOpening({ locale }: { locale: string }) {
  const t = COPY[toLoc(locale)];
  return (
    <section className="pu-po">
      <p className="pu-po-desk" aria-label={t.mobileOpening.join(" ")}>
        <span className="pu-po-a">{t.opening.a}</span>
        <span className="pu-po-b">{t.opening.b}</span>
        <span className="pu-po-c">{t.opening.c}</span>
        <span className="pu-po-d">{t.opening.d}</span>
        <span className="pu-po-e">{t.opening.e}</span>
      </p>
      <p className="pu-po-mob">
        {t.mobileOpening.map((l, i) => <span key={i}>{l}</span>)}
      </p>
      <style>{`
        .pu-po { padding: clamp(40px, 7vh, 88px) var(--margin-page) clamp(120px, 20vh, 220px); }
        .pu-po p { margin: 0; font-family: var(--font-sans); font-weight: 700; color: #000; }
        .pu-po-desk {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          column-gap: clamp(16px, 2vw, 32px);
          font-size: clamp(34px, 4.4vw, 74px);
          letter-spacing: -0.045em;
          line-height: 1.02;
        }
        .pu-po-desk span { display: block; white-space: nowrap; }
        .pu-po-a { grid-column: 1 / -1; }
        .pu-po-b { grid-column: 1 / -1; }
        .pu-po-c { grid-column: 6 / -1; margin-top: 0.62em; }
        .pu-po-d { grid-column: 2 / -1; margin-top: 0.62em; }
        .pu-po-e { grid-column: 2 / -1; }
        .pu-po-mob { display: none; }
        @media (max-width: 900px) {
          .pu-po { padding: 28px var(--margin-page) 112px; }
          .pu-po-desk { display: none; }
          .pu-po-mob {
            display: block;
            font-size: clamp(30px, 8.6vw, 40px);
            letter-spacing: -0.04em;
            line-height: 1.05;
          }
          .pu-po-mob span { display: block; }
        }
      `}</style>
    </section>
  );
}

/* ─── 02 · Verbs després de les persones ─────────────────────────────────── */

export function PersonesVerbs({ locale }: { locale: string }) {
  const t = COPY[toLoc(locale)];
  const ref = useInk(".pu-ink");
  return (
    <section ref={ref} className="pu-pv">
      <ul className="pu-pv-verbs">
        {t.verbs.map((v, i) => <li key={v} className={`pu-ink pu-pv-v${i}`}>{v}</li>)}
      </ul>
      <p className="pu-pv-ofici">{t.ofici}</p>
      <style>{INK_CSS + `
        .pu-pv { padding: clamp(96px, 16vh, 180px) var(--margin-page) clamp(120px, 20vh, 220px); font-family: var(--font-sans); }
        .pu-pv-verbs {
          list-style: none; margin: 0; padding: 0;
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          column-gap: clamp(16px, 2vw, 32px);
          row-gap: clamp(18px, 4vh, 44px);
        }
        .pu-pv-verbs li {
          font-size: clamp(36px, 5.6vw, 96px);
          font-weight: 700;
          letter-spacing: -0.045em;
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .pu-pv-v0 { grid-column: 1 / -1; }
        .pu-pv-v1 { grid-column: 6 / -1; }
        .pu-pv-v2 { grid-column: 3 / -1; }
        .pu-pv-v3 { grid-column: 8 / -1; }
        .pu-pv-v4 { grid-column: 2 / -1; }
        .pu-pv-ofici {
          margin: clamp(88px, 14vh, 160px) 0 0;
          font-size: clamp(22px, 2.3vw, 36px);
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: #000;
        }
        @media (max-width: 900px) {
          .pu-pv { padding: 96px var(--margin-page) 112px; }
          .pu-pv-verbs { row-gap: 14px; }
          .pu-pv-verbs li { font-size: clamp(34px, 10.4vw, 52px); }
          .pu-pv-v0, .pu-pv-v2, .pu-pv-v4 { grid-column: 1 / -1; }
          .pu-pv-v1, .pu-pv-v3 { grid-column: 4 / -1; }
          .pu-pv-ofici { margin-top: 72px; font-size: 22px; }
        }
      `}</style>
    </section>
  );
}

/* ─── 03 · La mateixa taula ──────────────────────────────────────────────── */

type Piece = {
  key: string;
  img?: string;
  /* posició en % de la taula: [x, y, amplada, rotació] — desktop i mòbil */
  d: [number, number, number, number];
  m: [number, number, number, number];
};

const PIECES: Piece[] = [
  { key: "planol",      img: "/persones-taula/planol.jpg",      d: [5, 9, 27, -2.2],  m: [3, 4, 62, -2] },
  { key: "norma",       img: "/persones-taula/norma.jpg",       d: [61, 4, 17, 1.6],  m: [56, 15, 40, 2] },
  { key: "dades",       img: "/persones-taula/dades.jpg",       d: [36, 30, 21, -1],  m: [6, 33, 58, -1.2] },
  { key: "datum",                                               d: [80, 42, 15, 2.4], m: [62, 46.5, 34, 2.6] },
  { key: "carrer",      img: "/persones-taula/carrer.jpg",      d: [7, 60, 31, 1.4],  m: [4, 56, 88, 1.2] },
  { key: "croquis",     img: "/persones-taula/croquis.jpg",     d: [62, 56, 13, -2.8], m: [62, 66, 32, -3] },
  { key: "cartografia", img: "/persones-taula/cartografia.jpg", d: [40, 63, 17, 0.8], m: [8, 70, 48, 1] },
  { key: "maqueta",     img: "/persones-taula/maqueta.jpg",     d: [83, 72, 11, -1.4], m: [56, 84, 30, -1.6] },
];

const WORDS: { key: "dades" | "planol" | "norma" | "carrer"; d: [number, number]; m: [number, number] }[] = [
  { key: "planol", d: [8, 4],   m: [4, 1] },
  { key: "norma",  d: [62, 0],  m: [55, 39.6] },
  { key: "dades",  d: [37, 25.5], m: [6, 30.3] },
  { key: "carrer", d: [8, 92],  m: [6, 64] },
];

export function PersonesTable({ locale }: { locale: string }) {
  const t = COPY[toLoc(locale)].table;
  const ref = useRef<HTMLDivElement>(null);

  // A l'ordinador els papers es poden moure sobre la taula
  useEffect(() => {
    const table = ref.current;
    if (!table || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let z = 20;
    let drag: { el: HTMLElement; sx: number; sy: number; ox: number; oy: number } | null = null;
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".pu-pt-piece");
      if (!el || e.button !== 0) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.style.zIndex = String(++z);
      el.classList.add("is-held");
      drag = { el, sx: e.clientX, sy: e.clientY, ox: Number(el.dataset.dx ?? 0), oy: Number(el.dataset.dy ?? 0) };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = drag.ox + e.clientX - drag.sx;
      const dy = drag.oy + e.clientY - drag.sy;
      drag.el.dataset.dx = String(dx);
      drag.el.dataset.dy = String(dy);
      drag.el.style.translate = `${dx}px ${dy}px`;
    };
    const onUp = () => { drag?.el.classList.remove("is-held"); drag = null; };
    table.addEventListener("pointerdown", onDown);
    table.addEventListener("pointermove", onMove);
    table.addEventListener("pointerup", onUp);
    table.addEventListener("pointercancel", onUp);
    return () => {
      table.removeEventListener("pointerdown", onDown);
      table.removeEventListener("pointermove", onMove);
      table.removeEventListener("pointerup", onUp);
      table.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const vars = (d: number[], m: number[]) => ({
    ["--x" as string]: `${d[0]}%`, ["--y" as string]: `${d[1]}%`, ["--w" as string]: `${d[2]}%`, ["--r" as string]: `${d[3] ?? 0}deg`,
    ["--mx" as string]: `${m[0]}%`, ["--my" as string]: `${m[1]}%`, ["--mw" as string]: `${m[2]}%`, ["--mr" as string]: `${m[3] ?? 0}deg`,
  });

  return (
    <section className="pu-pt">
      <div ref={ref} className="pu-pt-table">
        {PIECES.map((p) => (
          <div key={p.key} className={`pu-pt-piece pu-pt-piece--${p.key}`} style={vars(p.d, p.m)}>
            {p.img
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={p.img} alt="" loading="lazy" draggable={false} />
              : <div className="pu-pt-datum"><strong>{t.datum}</strong><span>{t.datumNote}</span></div>}
            {p.key === "norma" && (
              <svg className="pu-pt-mark" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M30 42 C 22 30, 40 18, 58 22 S 80 40, 72 56 S 44 70, 33 58 C 28 52, 31 44, 39 41" />
              </svg>
            )}
          </div>
        ))}
        {WORDS.map((w) => (
          <p key={w.key} className="pu-pt-word" style={vars(w.d, w.m)}>{t[w.key]}</p>
        ))}
      </div>
      <p className="pu-pt-close">{t.close}</p>

      <style>{`
        .pu-pt { padding: clamp(48px, 8vh, 96px) 0 0; font-family: var(--font-sans); }
        .pu-pt-table {
          position: relative;
          aspect-ratio: 16 / 11;
          max-height: 140vh;
          margin: 0 auto;
          background: var(--color-gray-light);
          overflow: hidden;
          user-select: none;
        }
        .pu-pt-piece {
          position: absolute;
          left: var(--x); top: var(--y); width: var(--w);
          rotate: var(--r);
          padding: 6px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          z-index: 2;
        }
        .pu-pt-piece img { display: block; width: 100%; height: auto; pointer-events: none; }
        @media (hover: hover) and (pointer: fine) {
          .pu-pt-piece { cursor: grab; }
          .pu-pt-piece.is-held { cursor: grabbing; }
        }
        .pu-pt-datum { padding: 14% 10% 16%; display: flex; flex-direction: column; gap: 8px; }
        .pu-pt-datum strong { font-size: clamp(18px, 2vw, 32px); font-weight: 700; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; color: #000; }
        .pu-pt-datum span { font-size: var(--size-meta); color: var(--color-muted); line-height: 1.3; }
        .pu-pt-mark { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
        .pu-pt-mark path { fill: none; stroke: #111; stroke-width: 2.2; stroke-linecap: round; vector-effect: non-scaling-stroke; opacity: 0.85; }
        .pu-pt-word {
          position: absolute;
          left: var(--x); top: var(--y);
          margin: 0;
          z-index: 1;
          font-size: clamp(22px, 2.6vw, 44px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1;
          color: #000;
          white-space: nowrap;
          pointer-events: none;
        }
        .pu-pt-close {
          margin: 0;
          padding: clamp(64px, 11vh, 128px) var(--margin-page) 0;
          max-width: 18em;
          font-size: clamp(28px, 3.4vw, 56px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.04;
          color: #000;
        }
        @media (max-width: 900px) {
          .pu-pt-table { aspect-ratio: 390 / 1180; max-height: none; }
          .pu-pt-piece { left: var(--mx); top: var(--my); width: var(--mw); rotate: var(--mr); padding: 4px; }
          .pu-pt-word { left: var(--mx); top: var(--my); font-size: 22px; z-index: 3; }
          .pu-pt-close { font-size: 28px; padding-top: 56px; }
        }
      `}</style>
    </section>
  );
}

/* ─── 04 · Què en surt ───────────────────────────────────────────────────── */

export function PersonesClosing({ locale }: { locale: string }) {
  const t = COPY[toLoc(locale)];
  const ref = useInk(".pu-ink");
  return (
    <section ref={ref} className="pu-pc">
      {t.closing.map((l, i) => <p key={l} className={`pu-ink pu-pc-l${i}`}>{l}</p>)}
      <style>{INK_CSS + `
        .pu-pc {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          column-gap: clamp(16px, 2vw, 32px);
          row-gap: clamp(28px, 6vh, 72px);
          padding: clamp(180px, 30vh, 340px) var(--margin-page) clamp(180px, 30vh, 340px);
          font-family: var(--font-sans);
        }
        .pu-pc p {
          margin: 0;
          font-size: clamp(40px, 6.4vw, 110px);
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 0.98;
          white-space: nowrap;
        }
        .pu-pc-l0 { grid-column: 1 / -1; }
        .pu-pc-l1 { grid-column: 4 / -1; }
        .pu-pc-l2 { grid-column: 1 / -1; }
        @media (max-width: 900px) {
          .pu-pc { display: block; padding: 160px var(--margin-page); }
          .pu-pc p { font-size: clamp(32px, 9.6vw, 48px); white-space: normal; }
          .pu-pc p + p { margin-top: 10px; }
        }
      `}</style>
    </section>
  );
}
