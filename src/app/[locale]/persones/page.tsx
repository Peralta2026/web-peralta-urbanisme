import Link from "next/link";
import { getAllTeamMembers } from "@/lib/team";
import type { Locale } from "@/lib/types";
import PersonRow from "@/components/team/PersonRow";
import AccentSection from "@/components/ui/AccentSection";
import { PersonesClosing, PersonesOpening, PersonesTable, PersonesVerbs } from "@/components/team/PersonesStory";

export const dynamic = "force-static";

/* Font: crèdits de la BASE DE DADES PROJECTES (sense serveis tècnics).
   Llistat i logos originals: servidor > _Material Extra Web > COL·LABORADORS */
const COLLABORATORS: { name: string; url: string; file?: string }[] = [
  { name: "AFAC, Arquitectura i Ciutat",            url: "http://www.amadorferrer.com/",     file: "c-afac.png" },
  { name: "(az) MAP, Medi Ambient i Paisatge",      url: "https://az-map.com/",              file: "c-az.png" },
  { name: "Carles Enrich Studio",                   url: "https://www.carlesenrich.com/",    file: "c-carles-enrich.png" },
  { name: "Cobrusi Arquitectes",                    url: "https://cobrusi.com/",             file: "c-cobrusi.png" },
  { name: "EMF",                                    url: "https://www.emf.cat/",             file: "c-emf.png" },
  { name: "Estel",                                  url: "https://plaestel.org/",            file: "c-estel.png" },
  { name: "HARQUITECTES",                           url: "https://www.harquitectes.com/",    file: "c-harquitectes.png" },
  { name: "IGREMAP",                                url: "http://igremap.com/",              file: "c-igremap.png" },
  { name: "Nartex Barcelona",                       url: "https://www.nartexbarcelona.com/", file: "c-nartex.png" },
  { name: "OUA Group",                              url: "https://www.ouagroup.com/",        file: "c-oua.png" },
  { name: "Projectes Urbans",                       url: "https://projectesurbans.com/" },
  { name: "Raons Públiques",                        url: "https://raons.coop/",              file: "c-raons.png" },
  { name: "TallerAT",                               url: "http://www.tallerat.com/",         file: "c-taller-at.png" },
  { name: "Traça",                                  url: "https://www.traca.cat/" },
  { name: "VAIC Mobility",                          url: "https://vaicmobility.com/",        file: "c-vaic.png" },
  { name: "VIA, Economia i Urbanisme",              url: "https://www.via-urbanisme.com/",   file: "c-via.png" },
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
            <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer" className="pu-collab-logo" title={c.name}>
              {c.file
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={`/collaborators/${c.file}`} alt={c.name} />
                : <span className="pu-collab-name">{c.name}</span>}
            </a>
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
          gap: clamp(28px, 3.6vw, 56px) clamp(36px, 4.4vw, 72px);
          flex-wrap: wrap;
        }
        .pu-collab-logo {
          display: flex;
          align-items: center;
          height: 44px;
          color: #000;
          text-decoration: none;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-collab-logo:hover { opacity: 0.55; }
        .pu-collab-logo img { display: block; height: auto; max-height: 40px; max-width: 160px; width: auto; object-fit: contain; }
        .pu-collab-name { font-family: var(--font-sans); font-size: 15px; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap; }

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
