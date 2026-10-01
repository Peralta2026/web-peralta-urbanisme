import Link from "next/link";
import { getAllTeamMembers } from "@/lib/team";
import type { Locale } from "@/lib/types";
import PersonRow from "@/components/team/PersonRow";
import AccentSection from "@/components/ui/AccentSection";
import { PersonesClosing, PersonesOpening, PersonesTable, PersonesVerbs } from "@/components/team/PersonesStory";

export const dynamic = "force-static";

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

      {/* ── 01 · Qui som ─────────────────────────────────────────────── */}
      <header className="pu-persones-head">
        <h1 style={{
          fontFamily:    "var(--font-sans)",
          fontWeight:    700,
          fontSize:      "var(--size-body)",
          letterSpacing: "-0.01em",
          lineHeight:    1,
          color:         "#000",
          margin:        0,
        }}>
          Equip humà
        </h1>
      </header>
      <PersonesOpening locale={locale} />

      {/* ── 02 · Les persones ─────────────────────────────────────────── */}
      <section style={{
        paddingLeft:   "var(--margin-page)",
        paddingRight:  "var(--margin-page)",
      }}>
        <PersonRow members={members} locale={locale as Locale} />
      </section>
      <PersonesVerbs locale={locale} />

      {/* ── 03 · La mateixa taula ─────────────────────────────────────── */}
      <PersonesTable locale={locale} />

      {/* ── 04 · Què en surt ──────────────────────────────────────────── */}
      <PersonesClosing locale={locale} />

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
          fontSize:   "20px",
          fontWeight: 700,
          letterSpacing: "-0.015em",
          color:      "#000",
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
      <AccentSection className="pu-cta-section">
        <h2 className="pu-cta-heading">
          Vols treballar<br />amb nosaltres?
        </h2>
        <Link href={`/${locale}/treballa-amb-nosaltres`} className="pu-cta-btn">
          Comencem <span style={{ fontSize: "14px" }}>→</span>
        </Link>
      </AccentSection>

      <style>{`
        .pu-persones-head { padding: clamp(24px, 3.5vh, 40px) var(--margin-page) 0; }
        @media (max-width: 900px) { .pu-persones-head { padding-top: clamp(36px, 5vh, 64px); } }

        /* ── Clients marquee — blanc, quiet fins hover ── */
        .pu-clients-section {
          border-top: 1px solid rgba(0,0,0,0.07);
          padding: clamp(36px,5vh,64px) 0;
          background: #fff;
          overflow: hidden;
        }
        .pu-clients-label {
          font-family: var(--font-sans);
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.015em;
          color: #000;
          margin: 0 0 clamp(20px,3vh,32px);
          padding: 0 var(--margin-page);
        }
        .pu-clients-track-wrap {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
        }
        .pu-clients-track {
          display: flex;
          align-items: center;
          gap: clamp(48px, 6vw, 96px);
          width: max-content;
          padding: 12px 0;
          animation: pu-marquee 60s linear infinite;
        }
        .pu-clients-track-wrap:hover .pu-clients-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) { .pu-clients-track { animation: none; } }
        @keyframes pu-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pu-client-logo {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 300ms ease;
        }
        .pu-clients-track-wrap:hover .pu-client-logo { opacity: 0.55; }
        .pu-clients-track-wrap:hover .pu-client-logo:hover { opacity: 1; }
        .pu-client-img {
          max-height: 52px;
          max-width: 160px;
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
          display: flex;
          align-items: center;
        }

        /* ── CTA ── */
        .pu-cta-section {
          background: var(--accent);
          transition: background var(--dur-slow) ease;
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
          .pu-collab-strip { gap: 24px; }
          .pu-cta-section { flex-direction: column; align-items: flex-start; }
          .pu-client-img { max-height: 40px; max-width: 116px; }
        }
        @media (max-width: 480px) {
          .pu-clients-track { gap: 32px; }
        }
      `}</style>
    </div>
  );
}
