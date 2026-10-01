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

function ContactColumn({ col, locale, children }: { col: Column; locale: string; children?: React.ReactNode }) {
  return (
    <div className="pu-hc-col">
      <h2 className="pu-hc-heading">{col.heading}</h2>
      <p className="pu-hc-text">{col.text}</p>
      {children}
      <Link href={`/${locale}${col.href}`} className="pu-hc-cta">
        {col.cta}
      </Link>
    </div>
  );
}

export default function HomeContact({ locale }: { locale: string }) {
  const loc: Loc = locale === "es" || locale === "en" ? locale : "ca";
  const copy = COPY[loc];

  return (
    <section className="pu-hc">
      <ContactColumn col={copy.clients} locale={locale}>
        <p className="pu-hc-direct">
          <a href="mailto:info@peraltaurbanisme.com">info@peraltaurbanisme.com</a>
          <a href="tel:+34935389893">+34 935 389 893</a>
        </p>
      </ContactColumn>
      <ContactColumn col={copy.talent} locale={locale} />

      <style>{`
        .pu-hc {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--color-bg);
        }
        .pu-hc-col {
          display: flex;
          flex-direction: column;
          padding: clamp(56px, 9vh, 112px) var(--margin-page);
        }
        .pu-hc-col + .pu-hc-col { border-left: 1px solid var(--color-border); }
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
          gap: 6px 24px;
          margin: 20px 0 0;
          font-family: var(--font-sans);
          font-size: var(--size-body);
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
        @media (max-width: 768px) {
          .pu-hc { grid-template-columns: 1fr; }
          .pu-hc-col + .pu-hc-col {
            border-left: none;
            border-top: 1px solid var(--color-border);
          }
        }
      `}</style>
    </section>
  );
}
