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
        }
      `}</style>
    </div>
  );
}
