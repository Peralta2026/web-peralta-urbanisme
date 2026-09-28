"use client";

import { useEffect, useRef, useState } from "react";

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("met-in"); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".met-reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function AccordionItem({ name, description, tags, defaultOpen = false }: {
  name: string; description: string; tags: string[]; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.style.maxHeight = open ? `${bodyRef.current.scrollHeight}px` : "0";
  }, [open]);
  return (
    <div className="met-mode-item">
      <button type="button" className="met-mode-summary" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="met-mode-name">{name}</span>
        <span className="met-mode-arrow" style={{ transform: open ? "rotate(45deg)" : undefined }}>+</span>
      </button>
      <div ref={bodyRef} className="met-mode-body">
        <div className="met-mode-body-inner">
          <div>
            <p className="met-mode-desc">{description}</p>
            <p className="met-mode-tags">{tags.join(" / ")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const CLIENTS = [
  { name: "AMB", file: "amb.jpg" },
  { name: "Diputació de Barcelona", file: "diputacio-bcn.png" },
  { name: "Barcelona Regional", file: "barcelona-regional.png" },
  { name: "Incasol", file: "incasol.jpg" },
  { name: "Federació Catalana de Municipis", file: "federacio-municipis.jpg" },
  { name: "Terrassa", file: "terrassa.png" },
  { name: "Granollers", file: "granollers.jpg" },
  { name: "Sant Cugat", file: "sant-cugat.jpg" },
  { name: "Rubí", file: "rubi.png" },
  { name: "Cornellà", file: "cornella.png" },
  { name: "Castelldefels", file: "castelldefels.png" },
  { name: "Gavà", file: "gava.png" },
  { name: "El Prat de Llobregat", file: "el-prat.png" },
  { name: "Premià de Mar", file: "premia-de-mar.jpg" },
  { name: "La Llagosta", file: "la-llagosta.png" },
  { name: "Calaf", file: "calaf.jpg" },
  { name: "Molins de Rei", file: "molins-de-rei.png" },
  { name: "Sant Just Desvern", file: "sant-just.jpg" },
  { name: "Pineda de Mar", file: "pineda-de-mar.png" },
  { name: "Bigues", file: "bigues.png" },
  { name: "Montcada i Reixac", file: "montcada.png" },
  { name: "L'Hospitalet", file: "hospitalet.jpg" },
  { name: "Barberà del Vallès", file: "barbera.jpg" },
];

const PILLARS = [
  { key: "estrategia",  num: "01", name: "Estratègia",  tagline: "Visió territorial i planificació", desc: "Analitzem el context des d'una mirada àmplia: mobilitat, usos, dinàmiques socials i econòmiques. Definim les estratègies que permeten transformar el territori de forma coherent i sostenible.", img: "/metode/sketch-estrategia.png" },
  { key: "disseny",     num: "02", name: "Disseny",     tagline: "Proposta i forma urbana",          desc: "Projectem espais públics, teixits urbans i plans amb criteris de qualitat formal i funcional. El disseny és l'eina amb la qual materialitzem les idees i les fem habitables.",                img: "/metode/sketch-disseny.png" },
  { key: "comunicacio", num: "03", name: "Comunicació", tagline: "Participació i mediació",          desc: "L'urbanisme és un acte col·lectiu. Acompanyem els processos participatius, traduïm la complexitat tècnica en llenguatge comprensible i facilitem el consens entre actors diversos.",        img: "/metode/sketch-comunicacio.png" },
] as const;

function PillarCols() {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const locked = visited.size >= 3;

  return (
    <div className={`met-pillar-cols${locked ? " is-locked" : ""}`}>
      {PILLARS.map((p) => {
        const isOpen = !locked && hovered === p.key;
        const contentVisible = locked || isOpen;
        return (
          <div
            key={p.key}
            className={`met-pillar-col${isOpen ? " is-open" : ""}`}
            onMouseEnter={() => { if (!locked) { setHovered(p.key); setVisited((prev) => new Set([...prev, p.key])); } }}
            onMouseLeave={() => { if (!locked) setHovered(null); }}
          >
            <div className="met-pillar-word-v" aria-hidden={contentVisible}>{p.name}</div>
            <div className="met-pillar-expand" aria-hidden={!contentVisible}>
              <p className="met-pillar-e-num">{p.num}</p>
              <h3 className="met-pillar-e-title">{p.name}</h3>
              <p className="met-pillar-e-tagline">{p.tagline}</p>
              <p className="met-pillar-e-desc">{p.desc}</p>
              <div className="met-pillar-e-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.name} loading="lazy" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClientBall() {
  const [open, setOpen] = useState(false);
  return (
    <div className="met-ball-wrap">
      <div className={`met-ball${open ? " is-open" : ""}`}>
        <div className="met-ball-simple">
          <span className="met-ball-slabel">Qui lidera</span>
          <span className="met-ball-sname">Client</span>
        </div>
        <div className="met-ball-diagram">
          <svg viewBox="0 0 360 360" className="met-hub-svg" aria-hidden="true">
            <line x1="180" y1="130" x2="180" y2="86"  stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
            <line x1="145" y1="216" x2="95"  y2="269" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
            <line x1="215" y1="216" x2="265" y2="269" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
          </svg>
          <div className="met-hnode met-hnode-client">
            <span className="met-hnode-label">Qui lidera</span>
            <span className="met-hnode-name" style={{ fontSize: "14px" }}>Client</span>
          </div>
          <div className="met-hnode met-hnode-peralta">
            <span className="met-hnode-label">Mètode</span>
            <span className="met-hnode-name">Peralta</span>
          </div>
          <div className="met-hnode met-hnode-projecte">
            <span className="met-hnode-label">Resultat</span>
            <span className="met-hnode-name">Projecte</span>
          </div>
          <div className="met-hnode met-hnode-territori">
            <span className="met-hnode-label">Impacte</span>
            <span className="met-hnode-name">Territori</span>
          </div>
        </div>
      </div>
      <button type="button" className="met-ball-btn" onClick={() => setOpen((v) => !v)}>
        {open ? "Tancar" : "Filosofia de treball"}
      </button>
    </div>
  );
}

export default function MetodePage() {
  useReveal();

  return (
    <>
      <style>{`
        /* ── HEADER ── */
        .met-page-header { padding-top: var(--header-height); }
        .met-page-title-row { padding: clamp(36px,5vh,64px) var(--margin-page) 0; }
        .met-page-title { font-family: var(--font-sans); font-size: clamp(32px,4vw,60px); font-weight: 700; letter-spacing: -0.04em; line-height: 1; color: #000; margin: 0; }
        .met-page-sep { margin: clamp(16px,2.5vh,28px) var(--margin-page) 0; height: 1px; background: rgba(0,0,0,0.08); }

        /* ── SECTION HEADINGS ── */
        .met-section-heading {
          font-family: var(--font-sans);
          font-size: clamp(30px, 3.6vw, 52px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--color-fg);
        }

        /* ── VALORS ── */
        .met-values { padding: 88px var(--margin-page) 80px; border-bottom: 1px solid var(--color-border-soft); }
        .met-values .met-section-heading { margin-bottom: 52px; display: block; }
        .met-values-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .met-value { padding-right: 32px; }
        .met-value:not(:last-child) { border-right: 1px solid var(--color-border-soft); margin-right: 32px; }
        .met-value-name { font-family: var(--font-sans); font-size: clamp(26px, 2.8vw, 40px); font-weight: 700; letter-spacing: -.035em; line-height: 1.0; margin-bottom: 18px; }
        .met-value-desc { font-family: var(--font-sans); font-size: 14px; line-height: 1.65; color: var(--color-muted); max-width: 260px; }
        .met-value-desc strong { font-weight: 700; color: var(--color-fg); }

        /* ── PILARS ── */
        .met-pilars-top {
          padding: 72px var(--margin-page) 48px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .met-pilars-top .met-section-heading { display: block; margin-bottom: 12px; }
        .met-pilars-h2 { font-family: var(--font-sans); font-size: clamp(22px, 2vw, 30px); font-weight: 500; letter-spacing: -.02em; margin: 0; }
        .met-pilars-h2 strong { font-weight: 900; }

        /* Pillar interactive columns */
        .met-pillar-cols { display: flex; min-height: 58vh; border-top: 1px solid rgba(0,0,0,0.08); border-bottom: 1px solid rgba(0,0,0,0.08); }
        .met-pillar-col { flex: 1; min-width: 0; overflow: hidden; transition: flex 0.65s cubic-bezier(0.22,1,0.36,1); border-right: 1px solid rgba(0,0,0,0.08); position: relative; cursor: default; }
        .met-pillar-col:last-child { border-right: none; }
        .met-pillar-col.is-open { flex: 4; }
        .met-pillar-cols.is-locked .met-pillar-col { flex: 1 !important; }

        /* Vertical word */
        .met-pillar-word-v {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          writing-mode: horizontal-tb; transform: none;
          font-family: var(--font-sans); font-size: clamp(16px,1.6vw,24px); font-weight: 700; letter-spacing: -0.03em;
          color: var(--color-fg); padding: 16px 8px;
          opacity: 1; transition: opacity 0.22s ease; pointer-events: none;
          text-align: center;
        }
        .met-pillar-col.is-open .met-pillar-word-v,
        .met-pillar-cols.is-locked .met-pillar-word-v { opacity: 0; }

        /* Expanded content */
        .met-pillar-expand {
          position: absolute; inset: 0;
          padding: 40px clamp(24px,3vw,48px) 32px;
          display: flex; flex-direction: column; gap: 0;
          opacity: 0; transition: opacity 0.28s ease 0.22s; pointer-events: none; overflow: hidden;
        }
        .met-pillar-col.is-open .met-pillar-expand,
        .met-pillar-cols.is-locked .met-pillar-expand { opacity: 1; pointer-events: auto; }
        .met-pillar-e-num { font-family: var(--font-sans); font-size: clamp(28px,3vw,48px); font-weight: 900; letter-spacing: -0.04em; color: var(--color-fg); margin: 0 0 12px; line-height: 1; }
        .met-pillar-e-title { font-family: var(--font-sans); font-size: clamp(22px,2.2vw,34px); font-weight: 700; letter-spacing: -0.04em; line-height: 1.0; margin: 0 0 14px; }
        .met-pillar-e-tagline { font-family: var(--font-sans); font-size: var(--size-meta); color: var(--color-muted); margin: 0 0 16px; }
        .met-pillar-e-desc { font-family: var(--font-sans); font-size: 14px; line-height: 1.65; color: var(--color-muted); max-width: 340px; margin: 0; }
        .met-pillar-e-img { margin-top: auto; padding-top: 24px; }
        .met-pillar-e-img img { width: 100%; max-height: 160px; object-fit: contain; display: block; }

        /* ── MODES + BALL ── */
        .met-modes { display: grid; grid-template-columns: 3fr 2fr; border-top: 1px solid var(--color-border); }
        .met-modes-left { border-right: 1px solid rgba(0,0,0,0.08); padding-bottom: 80px; }
        .met-modes-header-block { padding: 72px var(--margin-page) 48px; border-bottom: 1px solid var(--color-border); }
        .met-modes-header-block h2 { font-family: var(--font-sans); font-size: clamp(30px,3.6vw,52px); font-weight: 700; letter-spacing: -0.04em; line-height: 1.0; margin: 0 0 14px; }
        .met-modes-header-block > p { font-family: var(--font-sans); font-size: 14px; color: var(--color-muted); line-height: 1.65; max-width: 380px; margin: 0; }
        .met-modes-list { padding: 0 var(--margin-page); }
        .met-modes-right { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 32px; gap: 28px; }

        /* Accordion */
        .met-mode-item { border-top: 1px solid var(--color-border-soft); }
        .met-mode-item:last-child { border-bottom: 1px solid var(--color-border-soft); }
        .met-mode-summary { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 24px; padding: 32px 0; cursor: pointer; background: none; border: none; width: 100%; text-align: left; }
        .met-mode-name { font-family: var(--font-sans); font-size: clamp(22px,2.4vw,34px); font-weight: 700; letter-spacing: -.035em; color: var(--color-fg); }
        .met-mode-arrow { font-size: 22px; color: var(--color-gray-mid); transition: transform var(--dur-mid) var(--ease-smooth); }
        .met-mode-body { overflow: hidden; max-height: 0; transition: max-height 0.4s var(--ease-smooth); }
        .met-mode-body-inner { display: grid; grid-template-columns: 1fr; gap: 24px; padding-bottom: 40px; }
        .met-mode-desc { font-family: var(--font-sans); font-size: 15px; color: var(--color-fg); line-height: 1.7; max-width: 560px; margin-bottom: 24px; }
        .met-mode-tags { font-family: var(--font-sans); font-size: var(--size-meta); line-height: 1.6; color: var(--color-muted); margin: 0; }

        /* ── BALL ── */
        .met-ball-wrap { display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .met-ball {
          position: relative;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: var(--color-fg);
          overflow: hidden;
          transition: width 0.65s cubic-bezier(0.22,1,0.36,1), height 0.65s cubic-bezier(0.22,1,0.36,1);
          -webkit-font-smoothing: antialiased;
          flex-shrink: 0;
        }
        .met-ball.is-open { width: 360px; height: 360px; }

        .met-ball-simple { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; opacity: 1; transition: opacity 0.2s ease; pointer-events: none; }
        .met-ball.is-open .met-ball-simple { opacity: 0; }
        .met-ball-slabel { font-family: var(--font-sans); font-size: 11px; color: rgba(255,255,255,0.5); }
        .met-ball-sname { font-family: var(--font-sans); font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: #fff; }

        .met-ball-diagram { position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s ease 0.35s; pointer-events: none; }
        .met-ball.is-open .met-ball-diagram { opacity: 1; }
        .met-hub-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }

        .met-hnode { position: absolute; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.65); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; }
        .met-hnode-label { font-family: var(--font-sans); font-size: 10px; color: rgba(255,255,255,0.5); }
        .met-hnode-name { font-family: var(--font-sans); font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.92); letter-spacing: -0.01em; }
        .met-hnode-client  { width: 100px; height: 100px; top: 130px; left: 130px; border-color: rgba(255,255,255,0.95); background: var(--color-fg); }
        .met-hnode-peralta  { width: 72px; height: 72px; top: 14px;  left: 144px; }
        .met-hnode-projecte { width: 72px; height: 72px; top: 259px; left: 34px;  }
        .met-hnode-territori{ width: 72px; height: 72px; top: 259px; left: 254px; }

        .met-ball-btn { background: none; border: 1px solid var(--color-fg); padding: 10px 24px; font-family: var(--font-sans); font-size: var(--size-meta); cursor: pointer; color: var(--color-fg); transition: background 200ms ease, color 200ms ease; }
        .met-ball-btn:hover { background: var(--color-fg); color: var(--color-bg); }

        /* ── REVEAL ── */
        .met-reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.6s var(--ease-smooth), transform 0.6s var(--ease-smooth); }
        .met-reveal.met-in { opacity: 1; transform: none; }
        .met-d1 { transition-delay: 80ms; } .met-d2 { transition-delay: 160ms; } .met-d3 { transition-delay: 240ms; }

        /* ── Han confiat en nosaltres ── */
        .met-clients-section {
          border-top: 1px solid rgba(0,0,0,0.07);
          padding: clamp(36px,5vh,64px) 0;
          background: #fff;
          overflow: hidden;
        }
        .met-clients-label {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 400;
          color: #888;
          margin: 0 0 clamp(20px,3vh,32px);
          padding: 0 var(--margin-page);
        }
        .met-clients-wrap {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          cursor: pointer;
        }
        .met-clients-track {
          display: flex;
          align-items: center;
          gap: clamp(40px, 5vw, 80px);
          width: max-content;
          padding: 8px 0;
          animation: met-marquee 42s linear infinite;
          animation-play-state: paused;
        }
        .met-clients-wrap:hover .met-clients-track {
          animation-play-state: running;
        }
        @keyframes met-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .met-client-logo {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.5;
          filter: grayscale(100%);
          transition: opacity 300ms ease, filter 300ms ease;
        }
        .met-clients-wrap:hover .met-client-logo { opacity: 0.7; }
        .met-client-logo:hover {
          opacity: 1 !important;
          filter: grayscale(0%) !important;
        }
        .met-client-img {
          max-height: 36px;
          max-width: 110px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          .met-modes { grid-template-columns: 1fr; }
          .met-modes-left { border-right: none; border-bottom: 1px solid var(--color-border-soft); }
          .met-modes-right { border-top: 1px solid var(--color-border-soft); padding: 56px 24px; }
          .met-pillar-cols { flex-direction: column; min-height: auto; }
          .met-pillar-col { flex: none !important; min-height: 64px; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); }
          .met-pillar-col:last-child { border-bottom: none; }
          .met-pillar-col.is-open, .met-pillar-cols.is-locked .met-pillar-col { min-height: 320px; }
          .met-pillar-word-v { writing-mode: horizontal-tb; transform: none; font-size: clamp(22px,5vw,34px); justify-content: flex-start; padding: 0 var(--margin-page); }
        }
        @media (max-width: 768px) {
          .met-values-grid { grid-template-columns: 1fr; gap: 40px; }
          .met-value:not(:last-child) { border-right: none; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 40px; margin-right: 0; }
          .met-ball.is-open { width: min(300px, 86vw); height: min(300px, 86vw); }
          .met-client-img { max-height: 28px; max-width: 80px; }
          .met-clients-track { gap: 32px; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="met-page-header">
        <div className="met-page-title-row">
          <h1 className="met-page-title">Mètode</h1>
        </div>
        <div className="met-page-sep" />
      </div>

      {/* ── VALORS FONAMENTALS ── */}
      <section className="met-values">
        <p className="met-section-heading met-reveal">Els nostres valors fonamentals</p>
        <div className="met-values-grid">
          <div className="met-value met-reveal met-d1">
            <h3 className="met-value-name">Esforç</h3>
            <p className="met-value-desc">Tota la <strong>dedicació</strong> necessària per assolir amb rigor els <strong>objectius</strong> marcats, amb l&apos;<strong>actitud</strong> i el convenciment que el propi trajecte aporta sempre nous <strong>aprenentatges</strong>.</p>
          </div>
          <div className="met-value met-reveal met-d2">
            <h3 className="met-value-name">Talent</h3>
            <p className="met-value-desc">Confiança en la <strong>creativitat</strong> i la <strong>intuïció</strong> experta com a capacitats que s&apos;alimenten d&apos;una sòlida <strong>experiència</strong> professional, una mirada <strong>reflexiva</strong> i un llapis <strong>audaç</strong>.</p>
          </div>
          <div className="met-value met-reveal met-d3">
            <h3 className="met-value-name">Ètica</h3>
            <p className="met-value-desc">Una vocació sincera i <strong>honesta</strong> per millorar les nostres ciutats i territoris des del principi fonamental de l&apos;<strong>interès públic</strong> i la bona <strong>gestió</strong> d&apos;un marc jurídic complex.</p>
          </div>
        </div>
      </section>

      {/* ── PILARS URBANÍSTICS ── */}
      <section>
        <div className="met-pilars-top met-reveal">
          <p className="met-section-heading">Els nostres pilars urbanístics</p>
          <h2 className="met-pilars-h2"><strong>Tres</strong> eixos que orienten cada projecte</h2>
        </div>
        <PillarCols />
      </section>

      {/* ── TRES FORMES + BALL ── */}
      <section className="met-modes">
        <div className="met-modes-left">
          <div className="met-modes-header-block met-reveal">
            <h2>Tres formes<br />d&apos;acompanyar-vos</h2>
            <p>Adaptem la nostra implicació a les necessitats reals de cada client i cada fase del projecte. Cada encàrrec és diferent: la nostra estructura és flexible per respondre-hi amb precisió.</p>
          </div>
          <div className="met-modes-list">
            <AccordionItem
              name="Assessorament" defaultOpen
              description="Oferim consultes tècniques puntuals i acompanyament estratègic en moments clau. Analitzem situacions complexes, avaluem opcions i donem suport en la presa de decisions urbanístiques i territorials."
              tags={["Consultes tècniques", "Dictàmens", "Suport a la decisió", "Administracions locals"]}
            />
            <AccordionItem
              name="Intervencions"
              description="Redactem plans, estudis i projectes d'urbanisme des del principi fins al final. Assumim la responsabilitat tècnica completa de l'encàrrec: diagnosi, proposta, documentació i tràmit."
              tags={["Plans directors", "Plans parcials", "Espai públic", "Estudis de viabilitat"]}
            />
            <AccordionItem
              name="Desenvolupament"
              description="Col·laborem en projectes de llarga durada com a equip tècnic estable. Integrem-nos en l'estructura del client per garantir continuïtat, coherència i suport continu al llarg de tot el procés."
              tags={["Projectes plurianuals", "Suport continu", "Equip tècnic integrat", "Seguiment i gestió"]}
            />
          </div>
        </div>
        <div className="met-modes-right">
          <ClientBall />
        </div>
      </section>

      {/* ── Han confiat en nosaltres ── */}
      <section className="met-clients-section">
        <p className="met-clients-label">Han confiat en nosaltres</p>
        <div className="met-clients-wrap">
          <div className="met-clients-track">
            {[...CLIENTS, ...CLIENTS].map((c, i) => (
              <div key={i} className="met-client-logo" title={c.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/clients/${c.file}`}
                  alt={c.name}
                  className="met-client-img"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
