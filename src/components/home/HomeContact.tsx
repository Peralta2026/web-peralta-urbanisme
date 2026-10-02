"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Loc = "ca" | "es" | "en";

interface Column {
  heading: string;
  text: string;
  cta: string;
  href: string;
}

const COPY: Record<Loc, { clients: Column; talent: Column }> = {
  ca: {
    clients: {
      heading: "Parlem del vostre projecte",
      text: "Per a ajuntaments, consorcis i entitats públiques i privades: planejament urbanístic, estratègia territorial i projecte de l'espai públic.",
      cta: "Contactar amb l'estudi",
      href: "/contacte",
    },
    talent: {
      heading: "Treballa amb nosaltres",
      text: "Busquem persones amb formació en arquitectura, urbanisme o disciplines afins, amb ganes d'implicar-se en projectes de planejament i estratègia urbana.",
      cta: "Enviar candidatura",
      href: "/treballa-amb-nosaltres",
    },
  },
  es: {
    clients: {
      heading: "Hablemos de su proyecto",
      text: "Para ayuntamientos, consorcios y entidades públicas y privadas: planeamiento urbanístico, estrategia territorial y proyecto del espacio público.",
      cta: "Contactar con el estudio",
      href: "/contacte",
    },
    talent: {
      heading: "Trabaja con nosotros",
      text: "Buscamos personas con formación en arquitectura, urbanismo o disciplinas afines, con ganas de implicarse en proyectos de planeamiento y estrategia urbana.",
      cta: "Enviar candidatura",
      href: "/treballa-amb-nosaltres",
    },
  },
  en: {
    clients: {
      heading: "Let's talk about your project",
      text: "For municipalities, consortia and public and private organisations: urban planning, territorial strategy and public space design.",
      cta: "Contact the studio",
      href: "/contacte",
    },
    talent: {
      heading: "Work with us",
      text: "We are looking for people with a background in architecture, urban planning or related fields who want to get involved in planning and urban strategy projects.",
      cta: "Send your application",
      href: "/treballa-amb-nosaltres",
    },
  },
};

const ACCENTS = ["var(--accent-yellow)", "var(--accent-green)", "var(--accent-blue)", "var(--accent-pink)"];

/* Traç de llapis que es dibuixa sota el títol quan la secció entra a la pantalla */
function PencilStroke() {
  return (
    <svg className="pu-hc-stroke" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M3 15 C 60 8, 118 19, 180 12 S 300 6, 352 13 C 372 15.5, 386 11, 397 9"
        pathLength={1}
      />
    </svg>
  );
}

function ContactColumn({ col, locale, accent, children }: { col: Column; locale: string; accent?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`pu-hc-col${accent ? " pu-hc-col--accent" : ""}`}>
      <h2 className="pu-hc-heading">
        <span className="pu-hc-heading-text">
          {col.heading}
          {accent && <PencilStroke />}
        </span>
      </h2>
      <p className="pu-hc-text">{col.text}</p>
      {children}
      <Link href={`/${locale}${col.href}`} className="pu-hc-cta">
        {col.cta} <span className="pu-hc-arrow" aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export default function HomeContact({ locale }: { locale: string }) {
  const loc: Loc = locale === "es" || locale === "en" ? locale : "ca";
  const copy = COPY[loc];
  const ref = useRef<HTMLElement>(null);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [drawn, setDrawn] = useState(false);

  // Un color de la paleta de l'estudi a cada visita, com el diagrama de Mètode
  useEffect(() => {
    setAccent(ACCENTS[Math.floor(Math.random() * ACCENTS.length)]);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setDrawn(true); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={`pu-hc${drawn ? " is-drawn" : ""}`} style={{ ["--hc-accent" as string]: accent }}>
      <ContactColumn col={copy.clients} locale={locale} accent>
        <p className="pu-hc-direct">
          <a href="mailto:info@peraltaurbanisme.com">info@peraltaurbanisme.com</a>
          <a href="tel:+34935389893">+34 935 389 893</a>
        </p>
      </ContactColumn>

      <style>{`
        .pu-hc {
          display: grid;
          grid-template-columns: 1fr;
          background: var(--color-bg);
        }
        .pu-hc-col {
          display: flex;
          flex-direction: column;
          padding: clamp(56px, 9vh, 112px) var(--margin-page);
        }
        .pu-hc-col + .pu-hc-col { border-left: 1px solid var(--color-border); }
        .pu-hc-col--accent {
          background: var(--hc-accent);
          transition: background var(--dur-slow) ease;
        }
        .pu-hc-col--accent + .pu-hc-col { border-left: none; }
        .pu-hc-col--accent .pu-hc-heading { font-size: var(--size-hero); letter-spacing: -0.045em; line-height: 1; max-width: 9em; margin-bottom: 28px; }
        .pu-hc-col--accent .pu-hc-text { color: #222; }
        .pu-hc-heading-text { position: relative; display: inline-block; }
        .pu-hc-stroke {
          position: absolute;
          left: -2%;
          bottom: -0.32em;
          width: 104%;
          height: 0.34em;
          overflow: visible;
          pointer-events: none;
        }
        .pu-hc-stroke path {
          fill: none;
          stroke: #111;
          stroke-width: 2.4;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          transition: stroke-dashoffset 1400ms cubic-bezier(0.65, 0, 0.35, 1) 250ms;
        }
        .pu-hc.is-drawn .pu-hc-stroke path { stroke-dashoffset: 0; }
        .pu-hc-heading {
          font-family: var(--font-sans);
          font-size: var(--size-title);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.05;
          color: #000;
          margin: 0 0 20px;
        }
        .pu-hc-text {
          font-family: var(--font-sans);
          font-size: var(--size-body);
          line-height: 1.6;
          color: #444;
          max-width: 440px;
          margin: 0;
        }
        .pu-hc-direct {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 28px;
          margin: 28px 0 0;
          font-family: var(--font-sans);
          font-size: clamp(17px, 1.5vw, 21px);
          letter-spacing: -0.01em;
          font-variant-numeric: tabular-nums;
        }
        .pu-hc-direct a {
          color: var(--color-fg);
          text-decoration: none;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-hc-direct a:hover { opacity: 0.5; }
        .pu-hc-cta {
          align-self: flex-start;
          margin-top: auto;
          padding-top: clamp(32px, 5vh, 56px);
          font-family: var(--font-sans);
          font-size: var(--size-body);
          color: #000;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-hc-cta:hover { opacity: 0.5; }
        .pu-hc-arrow { display: inline-block; transition: transform var(--dur-mid) var(--ease-smooth); }
        .pu-hc-cta:hover .pu-hc-arrow { transform: translateX(6px); }
        .pu-hc-col--accent .pu-hc-cta { font-size: clamp(17px, 1.5vw, 21px); font-weight: 600; text-decoration-thickness: 1.5px; }
        .pu-hc-col--accent .pu-hc-cta:hover { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .pu-hc-stroke path { transition: none; stroke-dashoffset: 0; }
        }
        @media (max-width: 768px) {
          .pu-hc { grid-template-columns: 1fr; }
          .pu-hc-col + .pu-hc-col {
            border-left: none;
            border-top: 1px solid var(--color-border);
          }
          .pu-hc-col--accent + .pu-hc-col { border-top: none; }
        }
      `}</style>
    </section>
  );
}
