import Link from "next/link";
import { getAllTeamMembers } from "@/lib/team";
import type { Locale } from "@/lib/types";
import PersonRow from "@/components/team/PersonRow";

export const dynamic = "force-static";

const PILLARS = ["Encàrrec", "Subjecte", "Sentit", "Resultat"];

const COLLABORATORS = [
  { name: "AFAC · Amador Ferrer / Víctor Ferrer", file: "afac.jpg" },
  { name: "Cobrusi Arquitectes", file: "cobrusi.png" },
  { name: "EMF", file: "emf.jpg" },
  { name: "OUA", file: "oua.png" },
  { name: "VAIC Mobility", file: "vaic.png" },
];

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

export default async function PersonesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const members = getAllTeamMembers();

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>

      {/* ── Capçalera ─────────────────────────────────────────────────── */}
      <header style={{
        paddingTop:    "clamp(36px,5vh,64px)",
        paddingBottom: "clamp(24px,3.5vh,44px)",
        paddingLeft:   "var(--margin-page)",
        paddingRight:  "var(--margin-page)",
      }}>
        <h1 style={{
          fontFamily:    "var(--font-sans)",
          fontWeight:    700,
          fontSize:      "clamp(32px,4vw,60px)",
          letterSpacing: "-0.04em",
          lineHeight:    1,
          color:         "#000",
          marginBottom:  "clamp(20px,3vh,36px)",
        }}>
          Equip humà
        </h1>
        <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.65, color: "#000" }}>
            Peralta Urbanisme és un equip d&apos;arquitectes i urbanistes dedicat al planejament,
            l&apos;estratègia urbana i la transformació del territori.
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.65, color: "#555" }}>
            La nostra estructura combina un equip estable amb una xarxa de col·laboradors
            especialitzats. Aquesta manera de treballar ens permet mantenir una mirada propera,
            rigorosa i transversal sobre encàrrecs de naturalesa i escala diversa.
          </p>
        </div>
      </header>

      {/* ── Equip ─────────────────────────────────────────────────────── */}
      <section style={{
        paddingLeft:   "var(--margin-page)",
        paddingRight:  "var(--margin-page)",
        paddingTop:    "clamp(24px,3vh,40px)",
        paddingBottom: "clamp(24px,3vh,40px)",
      }}>
        <PersonRow members={members} locale={locale as Locale} />
      </section>

      {/* ── Col·laboradors habituals ──────────────────────────────────── */}
      <section style={{
        paddingLeft:   "var(--margin-page)",
        paddingRight:  "var(--margin-page)",
        paddingTop:    "clamp(32px,4vh,56px)",
        paddingBottom: "clamp(40px,5vh,72px)",
        borderTop:     "1px solid rgba(0,0,0,0.07)",
      }}>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize:   "13px",
          fontWeight: 700,
          color:      "#888",
          margin:     "0 0 clamp(14px,2vh,20px)",
        }}>
          Col·laboradors habituals
        </p>
        <p style={{
          fontFamily:   "var(--font-sans)",
          fontSize:     "clamp(13px,1.1vw,15px)",
          lineHeight:   1.7,
          color:        "#444",
          maxWidth:     "640px",
          margin:       "0 0 clamp(24px,3.5vh,40px)",
        }}>
          Entenem l&apos;urbanisme com una pràctica col·lectiva. Treballem amb una xarxa de professionals
          especialitzats que amplia i complementa la nostra mirada.
        </p>

        <div className="pu-collab-strip">
          {COLLABORATORS.map(c => (
            <div key={c.file} className="pu-collab-logo" title={c.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/collaborators/${c.file}`}
                alt={c.name}
                style={{
                  maxHeight: "36px",
                  maxWidth:  "120px",
                  width:     "auto",
                  height:    "auto",
                  objectFit: "contain",
                  display:   "block",
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Manera de treballar ───────────────────────────────────────── */}
      <section className="pu-dark-section">
        <blockquote className="pu-dark-quote">
          &ldquo;L&apos;estratègia no és res més que traçar el camí a través de quatre paraules:
          encàrrec, subjecte, sentit i resultat. Una metodologia honesta i responsable amb el territori.&rdquo;
        </blockquote>

        {/* 4 pillars */}
        <div className="pu-pillars-grid">
          {PILLARS.map((word, i) => (
            <div key={word} className={`pu-pillar-cell${i < 3 ? " pu-pillar-cell--border" : ""}`}>
              <h3 className="pu-pillar-word">{word}</h3>
            </div>
          ))}
        </div>

        <p className="pu-dark-body">
          Treballem arreu del territori català amb ajuntaments i agents públics i privats.
          Cada encàrrec és una oportunitat de descobrir un nou municipi i deixar-hi un relat
          holístic i potent per crear noves oportunitats.
        </p>
      </section>

      {/* ── Clients — fons blanc, carrusel quiet fins hover ──────────── */}
      <section className="pu-clients-section">
        <p className="pu-clients-label">Han confiat en nosaltres</p>
        <div className="pu-clients-track-wrap">
          <div className="pu-clients-track">
            {[...CLIENTS, ...CLIENTS].map((c, i) => (
              <div key={i} className="pu-client-logo" title={c.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/clients/${c.file}`}
                  alt={c.name}
                  className="pu-client-img"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA: Vols treballar amb nosaltres? ────────────────────────── */}
      <section className="pu-cta-section">
        <h2 className="pu-cta-heading">
          Vols treballar<br />amb nosaltres?
        </h2>
        <Link href={`/${locale}/treballa-amb-nosaltres`} className="pu-cta-btn">
          Comencem <span style={{ fontSize: "14px" }}>→</span>
        </Link>
      </section>

      <style>{`
        /* ── Secció fosca ── */
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

        /* ── Clients marquee — blanc, quiet fins hover ── */
        .pu-clients-section {
          border-top: 1px solid rgba(0,0,0,0.07);
          padding: clamp(36px,5vh,64px) 0;
          background: #fff;
          overflow: hidden;
        }
        .pu-clients-label {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          color: #888;
          margin: 0 0 clamp(20px,3vh,32px);
          padding: 0 var(--margin-page);
        }
        .pu-clients-track-wrap {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          cursor: pointer;
        }
        .pu-clients-track {
          display: flex;
          align-items: center;
          gap: clamp(40px, 5vw, 80px);
          width: max-content;
          padding: 8px 0;
          animation: pu-marquee 42s linear infinite;
          animation-play-state: paused;
        }
        .pu-clients-track-wrap:hover .pu-clients-track {
          animation-play-state: running;
        }
        @keyframes pu-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pu-client-logo {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.5;
          filter: grayscale(100%);
          transition: opacity 300ms ease, filter 300ms ease;
        }
        .pu-clients-track-wrap:hover .pu-client-logo {
          opacity: 0.7;
        }
        .pu-client-logo:hover {
          opacity: 1 !important;
          filter: grayscale(0%) !important;
        }
        .pu-client-img {
          max-height: 36px;
          max-width: 110px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        /* ── Col·laboradors habituals ── */
        .pu-collab-strip {
          display: flex;
          align-items: center;
          gap: clamp(32px, 5vw, 72px);
          flex-wrap: wrap;
        }
        .pu-collab-logo {
          opacity: 0.45;
          filter: grayscale(100%);
          transition: opacity 280ms ease, filter 280ms ease;
          display: flex;
          align-items: center;
        }
        .pu-collab-logo:hover {
          opacity: 0.85;
          filter: grayscale(0%);
        }

        /* ── CTA ── */
        .pu-cta-section {
          border-top: 1px solid #e8e8e4;
          padding: clamp(48px,7vh,88px) var(--margin-page);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }
        .pu-cta-heading {
          font-family: var(--font-sans);
          font-size: clamp(26px,3.2vw,48px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.0;
          color: #000;
          margin: 0;
        }
        .pu-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border: 1px solid #000;
          font-family: var(--font-sans);
          font-size: 13px;
          color: #000;
          text-decoration: none;
          transition: background 200ms ease, color 200ms ease;
          white-space: nowrap;
        }
        .pu-cta-btn:hover { background: #000; color: #fff; }

        /* ── Mòbil ── */
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
          .pu-collab-strip { gap: 24px; }
          .pu-cta-section { flex-direction: column; align-items: flex-start; }
          .pu-client-img { max-height: 28px; max-width: 80px; }
        }
        @media (max-width: 480px) {
          .pu-clients-track { gap: 32px; }
        }
      `}</style>
    </div>
  );
}
