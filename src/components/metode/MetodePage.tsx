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

function MethodDiagram() {
  const [st, setSt] = useState(0);
  const [col, setCol] = useState({
    z0: "#F9EE76", z1: "#B4EFC5", z2: "#A8DEF5",
    wf0: "rgba(180,239,197,.11)", wf1: "rgba(168,222,245,.11)", wf2: "rgba(249,238,118,.11)",
  });

  useEffect(() => {
    const P = ["#F9EE76","#B4EFC5","#A8DEF5","#F5C0DA"];
    const s = [...P].sort(() => Math.random() - .5);
    const t = (h: string, a: number) => {
      const r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16);
      return `rgba(${r},${g},${b},${a})`;
    };
    setCol({ z0:s[0], z1:s[1], z2:s[2], wf0:t(s[1],.11), wf1:t(s[2],.11), wf2:t(s[0],.11) });
  }, []);

  const go = (n: number) => setSt(n);
  const sc = `md-s${st}`;

  return (
    <section className="md-section">
      <div className="md-header">
        <p className="md-intro-label">L&apos;equip i els àmbits de coneixement</p>
        <div className="md-tabs">
          {["Base","Equip","Àmbits"].map((l, i) => (
            <button key={i} className={`md-tab${st===i?" md-on":""}`} onClick={() => go(i)}>{l}</button>
          ))}
        </div>
      </div>
      <div className={`md-svg-outer ${sc}`} onClick={() => go((st+1)%3)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <svg className="md-svg" viewBox="0 0 1100 870" xmlns="http://www.w3.org/2000/svg">
          {/* Wing fills */}
          <polygon className="md-ext-fill" style={{fill:col.wf0}} points="550,65 338,432 126,65"/>
          <polygon className="md-ext-fill" style={{fill:col.wf1}} points="550,65 762,432 974,65"/>
          <polygon className="md-ext-fill" style={{fill:col.wf2}} points="338,432 762,432 550,799"/>
          {/* Colour zones */}
          <polygon className="md-z" style={{fill:col.z0}} points="550,65 444,248 656,248"/>
          <polygon className="md-z" style={{fill:col.z1}} points="338,432 444,248 550,432"/>
          <polygon className="md-z" style={{fill:col.z2}} points="762,432 656,248 550,432"/>
          <polygon fill="#fff" points="444,248 656,248 550,432"/>
          {/* Triangle structure */}
          <polygon className="md-tri-inner" points="444,248 656,248 550,432"/>
          <polygon className="md-tri-outer" points="550,65 338,432 762,432"/>
          {/* Vertex dots */}
          <circle cx="550" cy="65"  r="4" fill="#111"/>
          <circle cx="338" cy="432" r="4" fill="#111"/>
          <circle cx="762" cy="432" r="4" fill="#111"/>
          {/* Zone dividers */}
          <line className="md-zdiv" x1="400" y1="325" x2="461" y2="432"/>
          <line className="md-zdiv" x1="700" y1="325" x2="639" y2="432"/>
          {/* Vertex labels */}
          <text x="550" y="24"  className="md-vl">ESTRATÈGIA</text>
          <text x="550" y="38"  className="md-vs">entendre · decidir · orientar</text>
          <text x="338" y="460" className="md-vl">PROJECTE</text>
          <text x="338" y="474" className="md-vs">definir · transformar</text>
          <text x="762" y="460" className="md-vl">TERRITORI</text>
          <text x="762" y="474" className="md-vs">context · impacte</text>
          {/* CLIENT centre */}
          <text x="550" y="316" className="md-cl">CLIENT</text>
          <text x="550" y="333" className="md-cl-sub">AL CENTRE</text>
          {/* Person names */}
          <text x="550" y="180" className="md-pn">Jordi</text>
          <text x="550" y="197" className="md-pn">Peralta</text>
          <text x="460" y="314" className="md-pn">Mar</text>
          <text x="460" y="331" className="md-pn">Castarlenas</text>
          <text x="410" y="392" className="md-pn">Julia</text>
          <text x="410" y="409" className="md-pn">Reñones</text>
          <text x="640" y="314" className="md-pn">Marc</text>
          <text x="640" y="331" className="md-pn">Vizcarra</text>
          <text x="690" y="392" className="md-pn">Delfina</text>
          <text x="690" y="409" className="md-pn">Capiglioni</text>
          {/* Outer network edges */}
          <g className="md-ext-edges">
            <line className="md-ext-edge" x1="126" y1="65"  x2="550" y2="65"/>
            <line className="md-ext-edge" x1="126" y1="65"  x2="338" y2="432"/>
            <line className="md-ext-edge" x1="550" y1="65"  x2="974" y2="65"/>
            <line className="md-ext-edge" x1="974" y1="65"  x2="762" y2="432"/>
            <line className="md-ext-edge" x1="338" y1="432" x2="550" y2="799"/>
            <line className="md-ext-edge" x1="762" y1="432" x2="550" y2="799"/>
          </g>
          {/* Domain text in wings */}
          <g className="md-ext-txt">
            <line className="md-wsep" x1="218" y1="117" x2="458" y2="117"/>
            <text x="338" y="108" className="md-wlabel">ÀMBIT SOCIAL</text>
            <text x="338" y="142" className="md-wdom">Societat i Participació</text>
            <line className="md-wsep" x1="240" y1="174" x2="436" y2="174"/>
            <text x="338" y="196" className="md-wdom">Mobilitat i Infraestructures</text>
            <line className="md-wsep" x1="258" y1="228" x2="418" y2="228"/>
            <text x="338" y="250" className="md-wdom">Economia i Viabilitat</text>
            <line className="md-wsep" x1="270" y1="282" x2="406" y2="282"/>
            <line className="md-wsep" x1="642" y1="117" x2="882" y2="117"/>
            <text x="762" y="108" className="md-wlabel">ÀMBIT NORMATIU</text>
            <text x="762" y="142" className="md-wdom">Regulació i Planejament</text>
            <line className="md-wsep" x1="664" y1="174" x2="860" y2="174"/>
            <text x="762" y="196" className="md-wdom">Legalitat i Gestió</text>
            <line className="md-wsep" x1="682" y1="228" x2="842" y2="228"/>
            <text x="762" y="250" className="md-wdom">Urbanisme i Paisatge</text>
            <line className="md-wsep" x1="694" y1="282" x2="830" y2="282"/>
            <line className="md-wsep" x1="386" y1="498" x2="714" y2="498"/>
            <text x="550" y="488" className="md-wlabel">ÀMBIT FÍSIC</text>
            <text x="550" y="526" className="md-wdom">Disseny Urbà i Espai Públic</text>
            <line className="md-wsep" x1="410" y1="564" x2="690" y2="564"/>
            <text x="550" y="596" className="md-wdom">Medi Ambient i Territori</text>
            <line className="md-wsep" x1="432" y1="634" x2="668" y2="634"/>
          </g>
        </svg>
      </div>
    </section>
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

        /* ── MODES ── */
        .met-modes { border-top: 1px solid var(--color-border); }
        .met-modes-left { padding-bottom: 80px; }
        .met-modes-header-block { padding: 72px var(--margin-page) 48px; border-bottom: 1px solid var(--color-border); }
        .met-modes-header-block h2 { font-family: var(--font-sans); font-size: clamp(30px,3.6vw,52px); font-weight: 700; letter-spacing: -0.04em; line-height: 1.0; margin: 0 0 14px; }
        .met-modes-header-block > p { font-family: var(--font-sans); font-size: 14px; color: var(--color-muted); line-height: 1.65; max-width: 380px; margin: 0; }
        .met-modes-list { padding: 0 var(--margin-page); }

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

        /* ── TRIANGLE DIAGRAM ── */
        .md-section { padding: clamp(56px,8vh,96px) var(--margin-page); border-top: 1px solid rgba(0,0,0,0.07); }
        .md-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: clamp(28px,4vh,48px); flex-wrap: wrap; gap: 16px; }
        .md-intro-label { font-family: var(--font-sans); font-size: 13px; font-weight: 400; color: #888; }
        .md-tabs { display: flex; border: 1px solid rgba(0,0,0,0.12); border-radius: 7px; overflow: hidden; }
        .md-tab { padding: 8px 20px; border: none; border-right: 1px solid rgba(0,0,0,0.09); background: transparent; font-family: var(--font-sans); font-size: 11.5px; font-weight: 500; color: #aaa; cursor: pointer; transition: background 150ms, color 150ms; }
        .md-tab:last-child { border-right: none; }
        .md-on { background: #111; color: #fff; }
        .md-tab:hover:not(.md-on) { color: #444; }
        .md-svg-outer { width: 100%; cursor: pointer; }
        .md-svg { width: 100%; height: auto; overflow: visible; display: block; }
        .md-svg text { font-family: var(--font-sans), sans-serif; }
        /* zones */
        .md-z { opacity: 0; transition: opacity .65s cubic-bezier(.4,0,.2,1); }
        .md-s1 .md-z, .md-s2 .md-z { opacity: 1; }
        /* dividers */
        .md-zdiv { fill: none; stroke: rgba(0,0,0,.14); stroke-width: .75; stroke-dasharray: 3.5 4; opacity: 0; transition: opacity .4s ease .3s; }
        .md-s1 .md-zdiv, .md-s2 .md-zdiv { opacity: 1; }
        /* person names */
        .md-pn { font-size: 13px; font-weight: 600; fill: rgba(0,0,0,.76); text-anchor: middle; opacity: 0; transition: opacity .45s ease .3s; }
        .md-s1 .md-pn, .md-s2 .md-pn { opacity: 1; }
        /* triangle lines */
        .md-tri-outer { fill: none; stroke: #111; stroke-width: 1.5; }
        .md-tri-inner { fill: none; stroke: rgba(0,0,0,.22); stroke-width: 1.0; stroke-dasharray: 6 4; }
        /* vertex labels */
        .md-vl { font-size: 13.5px; font-weight: 700; fill: #111; text-anchor: middle; letter-spacing: .04em; }
        .md-vs { font-size: 10px; fill: #c0c0c0; text-anchor: middle; }
        .md-cl { font-size: 18px; font-weight: 700; fill: #111; text-anchor: middle; letter-spacing: -.03em; }
        .md-cl-sub { font-size: 9.5px; fill: #ccc; text-anchor: middle; letter-spacing: .04em; }
        /* outer network */
        .md-ext-fill { opacity: 0; transition: opacity .55s ease .05s; }
        .md-s2 .md-ext-fill { opacity: 1; }
        .md-ext-edges { opacity: 0; transition: opacity .55s ease .05s; }
        .md-s2 .md-ext-edges { opacity: 1; }
        .md-ext-edge { fill: none; stroke: #111; stroke-width: 1.1; stroke-dasharray: 9 6; }
        .md-ext-txt { opacity: 0; transition: opacity .5s ease .55s; }
        .md-s2 .md-ext-txt { opacity: 1; }
        .md-wdom { font-size: 12px; font-weight: 600; fill: #222; text-anchor: middle; }
        .md-wlabel { font-size: 8.5px; font-weight: 600; fill: #bbb; text-anchor: middle; letter-spacing: .1em; }
        .md-wsep { fill: none; stroke: rgba(0,0,0,.1); stroke-width: .6; stroke-dasharray: 3 4; }

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
          .met-pillar-cols { flex-direction: column; min-height: auto; }
          .met-pillar-col { flex: none !important; min-height: 64px; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); }
          .met-pillar-col:last-child { border-bottom: none; }
          .met-pillar-col.is-open, .met-pillar-cols.is-locked .met-pillar-col { min-height: 320px; }
          .met-pillar-word-v { writing-mode: horizontal-tb; transform: none; font-size: clamp(22px,5vw,34px); justify-content: flex-start; padding: 0 var(--margin-page); }
        }
        @media (max-width: 768px) {
          .met-values-grid { grid-template-columns: 1fr; gap: 40px; }
          .met-value:not(:last-child) { border-right: none; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 40px; margin-right: 0; }
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

      {/* ── TRES FORMES ── */}
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
      </section>

      {/* ── DIAGRAMA TRIANGLE INTERACTIU ── */}
      <MethodDiagram />

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
