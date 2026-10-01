"use client";

import dynamic from "next/dynamic";

const PeraltaMap = dynamic(() => import("./PeraltaMap"), { ssr: false });

const COUNTS: Record<string, { projects: string; municipalities: string }> = {
  ca: { projects: "projectes", municipalities: "municipis" },
  es: { projects: "proyectos", municipalities: "municipios" },
  en: { projects: "projects", municipalities: "municipalities" },
};

/* Prototip: només el dibuix cartogràfic (sense projectes ni filtres) */
export default function TerritorialPrototype({ locale, projects, municipalities }: { locale: string; projects: number; municipalities: number }) {
  const c = COUNTS[locale] ?? COUNTS.ca;
  return (
    <div className="pu-tp">
      <PeraltaMap locale={locale} showZoom onReady={(map) => { (window as unknown as { __puMap?: unknown }).__puMap = map; }} />
      <div className="pu-tp-head">
        <h1>TERRITORIAL</h1>
        <p><span>{projects} {c.projects}</span><span>{municipalities} {c.municipalities}</span></p>
      </div>
      <style>{`
        .pu-tp { position: relative; height: 100vh; height: 100dvh; padding-top: var(--header-height); }
        .pu-tp > .pu-pmap { top: var(--header-height); }
        .pu-tp-head {
          position: absolute; z-index: 2;
          top: calc(var(--header-height) + clamp(24px, 4vh, 48px));
          left: var(--margin-page); right: var(--margin-page);
          display: flex; justify-content: space-between; align-items: flex-start;
          pointer-events: none;
          font-family: var(--font-sans);
        }
        .pu-tp-head h1 {
          margin: 0;
          font-size: clamp(32px, 4vw, 60px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #000;
        }
        .pu-tp-head p {
          margin: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
          font-size: var(--size-meta); color: #000; font-variant-numeric: tabular-nums;
        }
        @media (max-width: 900px) {
          .pu-tp-head { top: calc(var(--header-height) + 16px); }
          .pu-tp-head h1 { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
