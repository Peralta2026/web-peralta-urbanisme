/* "Manera de treballar": cita + quatre paraules sobre fons negre (final de Mètode) */

type Loc = "ca" | "es" | "en";

const COPY: Record<Loc, { quote: string; pillars: string[]; body: string }> = {
  ca: {
    quote: "L’estratègia no és res més que traçar el camí a través de quatre paraules: encàrrec, subjecte, sentit i resultat. Una metodologia honesta i responsable amb el territori.",
    pillars: ["Encàrrec", "Subjecte", "Sentit", "Resultat"],
    body: "Treballem arreu del territori català amb ajuntaments i agents públics i privats. Cada encàrrec és una oportunitat de descobrir un nou municipi i deixar-hi un relat holístic i potent per crear noves oportunitats.",
  },
  es: {
    quote: "La estrategia no es más que trazar el camino a través de cuatro palabras: encargo, sujeto, sentido y resultado. Una metodología honesta y responsable con el territorio.",
    pillars: ["Encargo", "Sujeto", "Sentido", "Resultado"],
    body: "Trabajamos en todo el territorio catalán con ayuntamientos y agentes públicos y privados. Cada encargo es una oportunidad de descubrir un nuevo municipio y dejar en él un relato holístico y potente para crear nuevas oportunidades.",
  },
  en: {
    quote: "Strategy is nothing more than tracing the path through four words: commission, subject, meaning and result. An honest methodology, responsible to the territory.",
    pillars: ["Commission", "Subject", "Meaning", "Result"],
    body: "We work throughout Catalonia with local councils and public and private stakeholders. Every commission is an opportunity to discover a new municipality and leave behind a holistic, powerful narrative that opens up new opportunities.",
  },
};

export default function MetodeDarkSection({ locale }: { locale: string }) {
  const t = COPY[locale === "es" || locale === "en" ? locale : "ca"];
  return (
    <section className="pu-dark-section">
      <blockquote className="pu-dark-quote">&ldquo;{t.quote}&rdquo;</blockquote>

      <div className="pu-pillars-grid">
        {t.pillars.map((word, i) => (
          <div key={word} className={`pu-pillar-cell${i < 3 ? " pu-pillar-cell--border" : ""}`}>
            <h3 className="pu-pillar-word">{word}</h3>
          </div>
        ))}
      </div>

      <p className="pu-dark-body">{t.body}</p>

      <style>{`
        .pu-dark-section {
          border-top: 1px solid #1a1a1a;
          background: var(--color-fg);
          color: var(--color-bg);
          padding: clamp(64px,9vh,112px) var(--margin-page);
          -webkit-font-smoothing: antialiased;
        }
        .pu-dark-quote {
          font-family: var(--font-sans);
          font-size: clamp(20px,2.6vw,38px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.1;
          color: #fff;
          max-width: 820px;
          margin: 0 0 clamp(48px,7vh,80px);
        }
        .pu-pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid rgba(255,255,255,0.15);
          margin-bottom: clamp(40px,6vh,72px);
        }
        .pu-pillar-cell {
          padding: clamp(20px,3vh,32px) clamp(16px,2vw,32px) clamp(20px,3vh,32px) 0;
        }
        .pu-pillar-cell--border {
          border-right: 1px solid rgba(255,255,255,0.15);
          margin-right: 0;
        }
        .pu-pillar-cell:not(:first-child) {
          padding-left: clamp(16px,2vw,32px);
        }
        .pu-pillar-word {
          font-family: var(--font-sans);
          font-size: clamp(18px,2vw,28px);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #fff;
          margin: 0;
        }
        .pu-dark-body {
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.55);
          margin: 0;
          max-width: 480px;
        }
        @media (max-width: 768px) {
          .pu-pillars-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .pu-pillar-cell:nth-child(2) {
            border-right: none !important;
          }
          .pu-pillar-cell:nth-child(3) {
            border-top: 1px solid rgba(255,255,255,0.15);
            border-right: 1px solid rgba(255,255,255,0.15);
          }
          .pu-pillar-cell:nth-child(4) {
            border-top: 1px solid rgba(255,255,255,0.15);
          }
        }
      `}</style>
    </section>
  );
}
