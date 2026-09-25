import Link from "next/link";

type Loc = "ca" | "es" | "en";

interface Column {
  label: string;
  heading: string;
  text: string;
  cta: string;
  href: string;
}

const COPY: Record<Loc, { clients: Column; talent: Column }> = {
  ca: {
    clients: {
      label: "Administracions i clients",
      heading: "Parlem del vostre projecte",
      text: "Acompanyem ajuntaments, consorcis i entitats públiques i privades en el planejament urbanístic, l'estratègia territorial i el projecte de l'espai públic.",
      cta: "Contactar amb l'estudi",
      href: "/contacte",
    },
    talent: {
      label: "Professionals",
      heading: "Treballa amb nosaltres",
      text: "Busquem persones amb formació en arquitectura, urbanisme o disciplines afins, amb ganes d'implicar-se en projectes de planejament i estratègia urbana.",
      cta: "Enviar candidatura",
      href: "/treballa-amb-nosaltres",
    },
  },
  es: {
    clients: {
      label: "Administraciones y clientes",
      heading: "Hablemos de su proyecto",
      text: "Acompañamos a ayuntamientos, consorcios y entidades públicas y privadas en el planeamiento urbanístico, la estrategia territorial y el proyecto del espacio público.",
      cta: "Contactar con el estudio",
      href: "/contacte",
    },
    talent: {
      label: "Profesionales",
      heading: "Trabaja con nosotros",
      text: "Buscamos personas con formación en arquitectura, urbanismo o disciplinas afines, con ganas de implicarse en proyectos de planeamiento y estrategia urbana.",
      cta: "Enviar candidatura",
      href: "/treballa-amb-nosaltres",
    },
  },
  en: {
    clients: {
      label: "Public bodies and clients",
      heading: "Let's talk about your project",
      text: "We work with municipalities, consortia and public and private organisations on urban planning, territorial strategy and public space design.",
      cta: "Contact the studio",
      href: "/contacte",
    },
    talent: {
      label: "Professionals",
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
      <p className="pu-hc-label">{col.label}</p>
      <h2 className="pu-hc-heading">{col.heading}</h2>
      <p className="pu-hc-text">{col.text}</p>
      {children}
      <Link href={`/${locale}${col.href}`} className="pu-hc-cta">
        {col.cta} →
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
          border-top: 1px solid var(--color-border);
          background: var(--color-bg);
        }
        .pu-hc-col {
          display: flex;
          flex-direction: column;
          padding: clamp(56px, 9vh, 112px) var(--margin-page);
        }
        .pu-hc-col + .pu-hc-col { border-left: 1px solid var(--color-border); }
        .pu-hc-label {
          font-family: var(--font-mono);
          font-size: var(--size-label);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-muted);
          margin: 0 0 clamp(20px, 3vh, 32px);
        }
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
          font-family: var(--font-mono);
          font-size: var(--size-meta);
          letter-spacing: 0.04em;
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
          padding: clamp(32px, 5vh, 56px) 0 4px;
          border-bottom: 1px solid #000;
          font-family: var(--font-mono);
          font-size: var(--size-label);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #000;
          text-decoration: none;
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
