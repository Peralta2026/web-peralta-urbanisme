"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("met-in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".met-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function AccordionItem({
  index,
  name,
  description,
  tags,
  defaultOpen = false,
}: {
  index: string;
  name: string;
  description: string;
  tags: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.style.maxHeight = open ? `${bodyRef.current.scrollHeight}px` : "0";
  }, [open]);

  return (
    <div className="met-mode-item">
      <button
        type="button"
        className="met-mode-summary"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="met-mode-index">{index}</span>
        <span className="met-mode-name">{name}</span>
        <span className="met-mode-arrow" style={{ transform: open ? "rotate(45deg)" : undefined }}>+</span>
      </button>
      <div ref={bodyRef} className="met-mode-body">
        <div className="met-mode-body-inner">
          <div />
          <div>
            <p className="met-mode-desc">{description}</p>
            <div className="met-mode-tags">
              {tags.map((t) => <span key={t} className="met-mode-tag">{t}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MetodePage() {
  useReveal();

  return (
    <>
      <style>{`
        /* ── HERO ── */
        .met-hero {
          background: var(--color-border);
          min-height: 52vh;
          padding-top: var(--header-height);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding-bottom: 52px;
          padding-left: var(--margin-page); padding-right: var(--margin-page);
        }
        .met-hero-title {
          font-family: var(--font-sans);
          font-size: clamp(32px, 4.8vw, 68px);
          font-weight: 700; letter-spacing: -0.04em; line-height: 1.0;
          color: var(--color-bg);
          white-space: normal; word-break: break-word;
        }
        .met-hero-sub {
          margin-top: 20px;
          font-family: var(--font-mono); font-size: clamp(10px, 1vw, 12px);
          letter-spacing: .12em; text-transform: uppercase;
          color: rgba(255,255,255,.5);
        }

        /* ── VALORS ── */
        .met-values {
          padding: 88px var(--margin-page) 80px;
          border-bottom: 1px solid var(--color-border-soft);
        }
        .met-section-label {
          font-family: var(--font-mono); font-size: var(--size-label); letter-spacing: .14em;
          text-transform: uppercase; color: var(--color-muted); margin-bottom: 52px;
        }
        .met-values-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .met-value { padding-right: 32px; }
        .met-value:not(:last-child) { border-right: 1px solid var(--color-border-soft); margin-right: 32px; }
        .met-value-name {
          font-family: var(--font-sans); font-size: clamp(26px, 2.8vw, 40px);
          font-weight: 700; letter-spacing: -.035em; line-height: 1.0; margin-bottom: 18px;
        }
        .met-value-desc {
          font-family: var(--font-sans); font-size: 14px; line-height: 1.65;
          color: var(--color-muted); max-width: 260px;
        }

        /* ── WORD STRIP ── */
        .met-strip { border-top: 1px solid var(--color-border-soft); border-bottom: 1px solid var(--color-border); }
        .met-strip-grid { display: grid; grid-template-columns: repeat(3, 1fr); padding: 0 var(--margin-page); }
        .met-strip-word {
          padding: 22px 32px 22px 0;
          font-family: var(--font-sans); font-size: clamp(28px, 3.8vw, 56px);
          font-weight: 700; letter-spacing: -.04em;
          border-right: 1px solid var(--color-border-soft);
        }
        .met-strip-word:last-child { border-right: none; padding-left: 32px; }
        .met-strip-word:nth-child(2) { padding-left: 32px; }

        /* ── PILARS ── */
        .met-pillars-header {
          padding: 72px var(--margin-page) 48px;
          border-bottom: 1px solid var(--color-border-soft);
        }
        .met-pillars-header h2 {
          font-family: var(--font-sans); font-size: clamp(22px, 2vw, 30px);
          font-weight: 600; letter-spacing: -.02em;
        }
        .met-pillar-band {
          display: grid; grid-template-columns: 1fr 1fr;
          min-height: 44vh;
          border-bottom: 1px solid var(--color-border-soft);
        }
        .met-pillar-content {
          padding: 52px var(--margin-page) 52px;
          display: flex; flex-direction: column; justify-content: center;
        }
        .met-pillar-num {
          font-family: var(--font-mono); font-size: var(--size-label); letter-spacing: .14em;
          text-transform: uppercase; color: var(--color-faint); margin-bottom: 24px;
        }
        .met-pillar-title {
          font-family: var(--font-sans); font-size: clamp(26px, 2.6vw, 38px);
          font-weight: 700; letter-spacing: -.035em; line-height: 1.05; margin-bottom: 16px;
        }
        .met-pillar-tagline {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em;
          text-transform: uppercase; color: var(--color-muted); margin-bottom: 20px;
        }
        .met-pillar-desc {
          font-family: var(--font-sans); font-size: 14px; line-height: 1.7;
          color: var(--color-muted); max-width: 400px;
        }
        .met-pillar-visual {
          background: #ffffff;
          border-left: 1px solid var(--color-border-soft);
          position: relative; overflow: hidden;
        }
        .met-pillar-visual-left {
          border-left: none;
          border-right: 1px solid var(--color-border-soft);
        }

        /* ── MODES ── */
        .met-modes {
          border-top: 1px solid var(--color-border);
          padding-bottom: 96px;
        }
        .met-modes-header {
          padding: 72px var(--margin-page) 64px;
          border-bottom: 1px solid var(--color-border);
          display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: end;
        }
        .met-modes-header h2 {
          font-family: var(--font-sans); font-size: clamp(30px, 3.6vw, 52px);
          font-weight: 700; letter-spacing: -.04em; line-height: 1.0;
        }
        .met-modes-header p {
          font-family: var(--font-sans); font-size: 14px; color: var(--color-muted); line-height: 1.65;
        }
        .met-modes-list { padding: 0 var(--margin-page); }
        .met-mode-item { border-top: 1px solid var(--color-border-soft); }
        .met-mode-item:last-child { border-bottom: 1px solid var(--color-border-soft); }
        .met-mode-summary {
          display: grid; grid-template-columns: 40px 1fr auto;
          align-items: center; gap: 24px;
          padding: 32px 0;
          cursor: pointer; background: none; border: none; width: 100%; text-align: left;
        }
        .met-mode-index {
          font-family: var(--font-mono); font-size: var(--size-label); color: var(--color-faint);
          letter-spacing: .1em;
        }
        .met-mode-name {
          font-family: var(--font-sans); font-size: clamp(22px, 2.4vw, 34px);
          font-weight: 700; letter-spacing: -.035em; color: var(--color-fg);
        }
        .met-mode-arrow {
          font-size: 22px; color: var(--color-gray-mid);
          transition: transform var(--dur-mid) var(--ease-smooth);
        }
        .met-mode-body {
          overflow: hidden; max-height: 0;
          transition: max-height 0.4s var(--ease-smooth);
        }
        .met-mode-body-inner {
          display: grid; grid-template-columns: 40px 1fr;
          gap: 24px; padding-bottom: 40px;
        }
        .met-mode-desc {
          font-family: var(--font-sans); font-size: 15px;
          color: var(--color-fg); line-height: 1.7;
          max-width: 560px; margin-bottom: 24px;
        }
        .met-mode-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .met-mode-tag {
          font-family: var(--font-mono); font-size: 9px; letter-spacing: .1em;
          text-transform: uppercase; color: #444;
          border: 1px solid #bbb; padding: 6px 12px;
        }

        /* ── CLIENT AL CENTRE ── */
        .met-client {
          padding: 88px var(--margin-page);
          border-top: 1px solid var(--color-border);
          background: var(--color-fg); color: var(--color-bg);
        }
        .met-client .met-section-label { color: rgba(255,255,255,.4); margin-bottom: 48px; }
        .met-client h2 {
          font-family: var(--font-sans); font-size: clamp(22px, 2vw, 30px);
          font-weight: 600; letter-spacing: -.02em; color: var(--color-bg);
          margin-bottom: 16px;
        }
        .met-client > p {
          font-family: var(--font-sans); font-size: 14px; color: rgba(255,255,255,.55);
          line-height: 1.7; max-width: 520px; margin-bottom: 72px;
        }
        .met-hub-wrap { display: flex; justify-content: center; }
        .met-hub {
          position: relative; width: 380px; height: 380px;
          display: flex; align-items: center; justify-content: center;
        }
        .met-hub-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .met-hub-center {
          position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
          width: 120px; height: 120px;
          border: 1.5px solid rgba(255,255,255,1);
          border-radius: 50%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px; z-index: 2; background: var(--color-fg);
        }
        .met-hub-orbit {
          position: absolute; width: 84px; height: 84px;
          border: 1.5px solid rgba(255,255,255,.6);
          border-radius: 50%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px;
        }
        .met-hub-top    { top: 12px; left: 50%; transform: translateX(-50%); }
        .met-hub-left   { bottom: 48px; left: 12px; }
        .met-hub-right  { bottom: 48px; right: 12px; }
        .met-hub-label {
          font-family: var(--font-mono); font-size: 8px; letter-spacing: .12em;
          text-transform: uppercase; color: rgba(255,255,255,.5);
        }
        .met-hub-name {
          font-family: var(--font-sans); font-weight: 700; letter-spacing: -.01em;
          color: rgba(255,255,255,.9);
        }
        .met-hub-center .met-hub-label { color: rgba(255,255,255,.5); }
        .met-hub-center .met-hub-name { font-size: 14px; color: #fff; }
        .met-hub-orbit .met-hub-name { font-size: 12px; }

        /* ── REVEAL ── */
        .met-reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.6s var(--ease-smooth), transform 0.6s var(--ease-smooth); }
        .met-reveal.met-in { opacity: 1; transform: none; }
        .met-d1 { transition-delay: 80ms; }
        .met-d2 { transition-delay: 160ms; }
        .met-d3 { transition-delay: 240ms; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .met-values-grid { grid-template-columns: 1fr; gap: 40px; }
          .met-value:not(:last-child) { border-right: none; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 40px; margin-right: 0; }
          .met-strip-grid { grid-template-columns: 1fr; }
          .met-strip-word, .met-strip-word:last-child, .met-strip-word:nth-child(2) { border-right: none; padding-left: 0; border-bottom: 1px solid var(--color-border-soft); }
          .met-pillar-band { grid-template-columns: 1fr; min-height: auto; }
          .met-pillar-visual, .met-pillar-visual-left { border-left: none; border-right: none; border-top: 1px solid var(--color-border-soft); min-height: 280px; }
          .met-modes-header { grid-template-columns: 1fr; }
          .met-hub { width: 300px; height: 300px; }
          .met-hub-center { width: 96px; height: 96px; }
          .met-hub-orbit { width: 70px; height: 70px; }
        }
      `}</style>

      {/* HERO */}
      <section className="met-hero">
        <h1 className="met-hero-title">Com treballem<br />la complexitat</h1>
        <p className="met-hero-sub">Mètode · Peralta Urbanisme</p>
      </section>

      {/* VALORS */}
      <section className="met-values">
        <p className="met-section-label met-reveal">Els nostres valors fonamentals</p>
        <div className="met-values-grid">
          <div className="met-value met-reveal met-d1">
            <h3 className="met-value-name">Esforç</h3>
            <p className="met-value-desc">Cada encàrrec mereix la màxima dedicació. No hi ha atajos ni solucions prefabricades: el rigor és la base de qualsevol bon resultat.</p>
          </div>
          <div className="met-value met-reveal met-d2">
            <h3 className="met-value-name">Talent</h3>
            <p className="met-value-desc">L&apos;urbanisme demana pensament creatiu i tècnic alhora. Cultivem la capacitat d&apos;imaginar territoris millors i de fer-los possible.</p>
          </div>
          <div className="met-value met-reveal met-d3">
            <h3 className="met-value-name">Ètica</h3>
            <p className="met-value-desc">Treballem per a la col·lectivitat. Cada decisió tècnica té conseqüències sobre persones i llocs: actuem amb responsabilitat i integritat.</p>
          </div>
        </div>
      </section>

      {/* WORD STRIP */}
      <div className="met-strip">
        <div className="met-strip-grid">
          <div className="met-strip-word">Estratègia</div>
          <div className="met-strip-word">Disseny</div>
          <div className="met-strip-word">Comunicació</div>
        </div>
      </div>

      {/* PILARS */}
      <section>
        <div className="met-pillars-header met-reveal">
          <p className="met-section-label" style={{ marginBottom: "12px" }}>Els nostres pilars urbanístics</p>
          <h2>Tres eixos que orienten cada projecte</h2>
        </div>

        {/* Pilar 1: Estratègia */}
        <div className="met-pillar-band">
          <div className="met-pillar-content met-reveal">
            <p className="met-pillar-num">01</p>
            <h3 className="met-pillar-title">Estratègia</h3>
            <p className="met-pillar-tagline">Visió territorial i planificació</p>
            <p className="met-pillar-desc">Analitzem el context des d&apos;una mirada àmplia: mobilitat, usos, dinàmiques socials i econòmiques. Definim les estratègies que permeten transformar el territori de forma coherent i sostenible.</p>
          </div>
          <div className="met-pillar-visual">
            <Image src="/metode/sketch-estrategia.png" alt="Croquis Estratègia" fill style={{ objectFit: "contain", padding: "8px" }} />
          </div>
        </div>

        {/* Pilar 2: Disseny */}
        <div className="met-pillar-band">
          <div className="met-pillar-visual met-pillar-visual-left">
            <Image src="/metode/sketch-disseny.png" alt="Croquis Disseny" fill style={{ objectFit: "contain", padding: "8px" }} />
          </div>
          <div className="met-pillar-content met-reveal">
            <p className="met-pillar-num">02</p>
            <h3 className="met-pillar-title">Disseny</h3>
            <p className="met-pillar-tagline">Proposta i forma urbana</p>
            <p className="met-pillar-desc">Projectem espais públics, teixits urbans i plans amb criteris de qualitat formal i funcional. El disseny és l&apos;eina amb la qual materialitzem les idees i les fem habitables.</p>
          </div>
        </div>

        {/* Pilar 3: Comunicació */}
        <div className="met-pillar-band">
          <div className="met-pillar-content met-reveal">
            <p className="met-pillar-num">03</p>
            <h3 className="met-pillar-title">Comunicació</h3>
            <p className="met-pillar-tagline">Participació i mediació</p>
            <p className="met-pillar-desc">L&apos;urbanisme és un acte col·lectiu. Acompanyem els processos participatius, traduïm la complexitat tècnica en llenguatge comprensible i facilitem el consens entre actors diversos.</p>
          </div>
          <div className="met-pillar-visual">
            <Image src="/metode/sketch-comunicacio.png" alt="Croquis Comunicació" fill style={{ objectFit: "contain", padding: "8px" }} />
          </div>
        </div>
      </section>

      {/* MODES DE COL·LABORACIÓ */}
      <section className="met-modes">
        <div className="met-modes-header met-reveal">
          <div>
            <p className="met-section-label" style={{ marginBottom: "16px" }}>Com col·laborem</p>
            <h2>Tres formes<br />d&apos;acompanyar-vos</h2>
          </div>
          <p>Adaptem la nostra implicació a les necessitats reals de cada client i cada fase del projecte. Cada encàrrec és diferent: la nostra estructura és flexible per respondre-hi amb precisió.</p>
        </div>
        <div className="met-modes-list">
          <AccordionItem
            index="01"
            name="Assessorament"
            description="Oferim consultes tècniques puntuals i acompanyament estratègic en moments clau. Analitzem situacions complexes, avaluem opcions i donem suport en la presa de decisions urbanístiques i territorials."
            tags={["Consultes tècniques", "Dictàmens", "Suport a la decisió", "Administracions locals"]}
            defaultOpen
          />
          <AccordionItem
            index="02"
            name="Intervencions"
            description="Redactem plans, estudis i projectes d'urbanisme des del principi fins al final. Assumim la responsabilitat tècnica completa de l'encàrrec: diagnosi, proposta, documentació i tràmit."
            tags={["Plans directors", "Plans parcials", "Espai públic", "Estudis de viabilitat"]}
          />
          <AccordionItem
            index="03"
            name="Desenvolupament"
            description="Col·laborem en projectes de llarga durada com a equip tècnic estable. Integrem-nos en l'estructura del client per garantir continuïtat, coherència i suport continu al llarg de tot el procés."
            tags={["Projectes plurianuals", "Suport continu", "Equip tècnic integrat", "Seguiment i gestió"]}
          />
        </div>
      </section>

      {/* EL CLIENT AL CENTRE */}
      <section className="met-client">
        <p className="met-section-label">Filosofia de treball</p>
        <h2>El client al centre</h2>
        <p>Cada projecte s&apos;organitza al voltant de les necessitats reals del client. Peralta Urbanisme i el projecte existeixen per servir-les: el client defineix el rumb, nosaltres posem el coneixement i el mètode per fer-ho possible.</p>

        <div className="met-hub-wrap">
          <div className="met-hub">
            <svg className="met-hub-svg" viewBox="0 0 380 380" aria-hidden="true">
              <line x1="190" y1="190" x2="190" y2="96" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
              <line x1="190" y1="190" x2="96" y2="332" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
              <line x1="190" y1="190" x2="284" y2="332" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
            </svg>
            <div className="met-hub-center">
              <span className="met-hub-label">Qui lidera</span>
              <span className="met-hub-name">Client</span>
            </div>
            <div className="met-hub-orbit met-hub-top">
              <span className="met-hub-label">Mètode</span>
              <span className="met-hub-name">Peralta</span>
            </div>
            <div className="met-hub-orbit met-hub-left">
              <span className="met-hub-label">Resultat</span>
              <span className="met-hub-name">Projecte</span>
            </div>
            <div className="met-hub-orbit met-hub-right">
              <span className="met-hub-label">Impacte</span>
              <span className="met-hub-name">Territori</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
