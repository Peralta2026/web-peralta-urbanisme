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

      {/* ── Col·laboradors ────────────────────────────────────────────── */}
      <section style={{
        paddingLeft:   "var(--margin-page)",
        paddingRight:  "var(--margin-page)",
        paddingTop:    "clamp(32px,4vh,56px)",
        paddingBottom: "clamp(40px,5vh,72px)",
        borderTop:     "1px solid rgba(0,0,0,0.07)",
      }}>
        <p style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "8px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color:         "#bbb",
          marginBottom:  "clamp(16px,2vh,24px)",
        }}>
          Col·laboradors habituals
        </p>
        <p style={{
          fontFamily:    "var(--font-sans)",
          fontSize:      "clamp(13px,1.1vw,15px)",
          lineHeight:    1.7,
          color:         "#444",
          maxWidth:      "640px",
          marginBottom:  "clamp(24px,3.5vh,40px)",
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
      <section style={{
        borderTop:   "1px solid #1a1a1a",
        background:  "var(--color-fg)",
        color:       "var(--color-bg)",
        padding:     "clamp(64px,9vh,112px) var(--margin-page)",
        WebkitFontSmoothing: "antialiased",
      }}>
        <blockquote style={{
          fontFamily:    "var(--font-sans)",
          fontSize:      "clamp(20px,2.6vw,38px)",
          fontWeight:    700,
          letterSpacing: "-0.035em",
          lineHeight:    1.1,
          color:         "#fff",
          maxWidth:      "820px",
          margin:        "0 0 clamp(48px,7vh,80px)",
        }}>
          &ldquo;L&apos;estratègia no és res més que traçar el camí a través de quatre paraules:
          encàrrec, subjecte, sentit i resultat. Una metodologia honesta i responsable amb el territori.&rdquo;
        </blockquote>

        {/* 4 pillars */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop:           "1px solid rgba(255,255,255,0.15)",
          marginBottom:        "clamp(40px,6vh,72px)",
        }}>
          {PILLARS.map((word, i) => (
            <div key={word} style={{
              padding:     "clamp(20px,3vh,32px) 0",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none",
              paddingRight: i < 3 ? "clamp(16px,2vw,32px)" : 0,
              paddingLeft:  i > 0 ? "clamp(16px,2vw,32px)" : 0,
            }}>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(18px,2vw,28px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
                {word}
              </h3>
            </div>
          ))}
        </div>

        {/* Secondary text */}
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: "0 0 clamp(36px,5vh,56px)", maxWidth: "480px" }}>
          Treballem arreu del territori català amb ajuntaments i agents públics i privats.
          Cada encàrrec és una oportunitat de descobrir un nou municipi i deixar-hi un relat
          holístic i potent per crear noves oportunitats.
        </p>

        {/* Clients marquee */}
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "clamp(20px,3vh,32px)" }}>
            Administracions i entitats amb qui hem treballat
          </p>
          <div className="pu-clients-track-wrap">
            <div className="pu-clients-track">
              {[...CLIENTS, ...CLIENTS].map((c, i) => (
                <div key={i} className="pu-client-logo" title={c.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/clients/${c.file}`}
                    alt={c.name}
                    style={{ maxHeight: "32px", maxWidth: "100px", width: "auto", height: "auto", objectFit: "contain", display: "block" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA: Vols treballar amb nosaltres? ────────────────────────── */}
      <section style={{
        borderTop:   "1px solid #e8e8e4",
        padding:     "clamp(48px,7vh,88px) var(--margin-page)",
        display:     "flex",
        alignItems:  "center",
        justifyContent: "space-between",
        gap:         "32px",
        flexWrap:    "wrap",
      }}>
        <h2 style={{
          fontFamily:    "var(--font-sans)",
          fontSize:      "clamp(26px,3.2vw,48px)",
          fontWeight:    700,
          letterSpacing: "-0.04em",
          lineHeight:    1.0,
          color:         "#000",
          margin:        0,
        }}>
          Vols treballar<br />amb nosaltres?
        </h2>
        <Link
          href={`/${locale}/treballa-amb-nosaltres`}
          style={{
            display:       "inline-flex",
            alignItems:    "center",
            gap:           "10px",
            padding:       "14px 28px",
            border:        "1px solid #000",
            fontFamily:    "var(--font-sans)",
            fontSize:      "var(--size-meta)",
            color:         "#000",
            textDecoration:"none",
            transition:    "background 200ms ease, color 200ms ease",
          }}
          className="pu-cta-btn"
        >
          Comencem <span style={{ fontSize: "14px" }}>→</span>
        </Link>
      </section>

      <style>{`
        .pu-cta-btn:hover { background: #000; color: #fff; }

        /* ── Clients marquee ── */
        .pu-clients-track-wrap {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .pu-clients-track {
          display: flex;
          align-items: center;
          gap: clamp(40px, 5vw, 72px);
          width: max-content;
          animation: pu-marquee 38s linear infinite;
        }
        .pu-clients-track:hover { animation-play-state: paused; }
        @keyframes pu-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pu-client-logo {
          opacity: 0.38;
          filter: brightness(0) invert(1);
          transition: opacity 280ms ease;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .pu-client-logo:hover { opacity: 0.75; }

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

        @media (max-width: 768px) {
          .pu-pillars-grid { grid-template-columns: repeat(2,1fr) !important; }
          .pu-cta-section { flex-direction: column; align-items: flex-start !important; }
          .pu-treballar-grid { grid-template-columns: 1fr !important; }
          .pu-collab-strip { gap: 24px; }
        }
      `}</style>
    </div>
  );
}
