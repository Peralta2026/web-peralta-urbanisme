import Link from "next/link";
import { getAllTeamMembers } from "@/lib/team";
import type { Locale, TeamMember } from "@/lib/types";
import PersonCard from "@/components/team/PersonCard";

export const dynamic = "force-static";

// ─── Posicions de la constel·lació ────────────────────────────────────────
// Marc ↔ Mar intercanviats; Delfina ↔ Julia intercanviades
const CONSTELLATION: Record<
  string,
  { photoSide: "left" | "right"; paddingTop: string; gridColumn: string }
> = {
  "jordi-peralta":      { photoSide: "left",  paddingTop: "0px",  gridColumn: "1 / 7"  },
  "marc-vizcarra":      { photoSide: "right", paddingTop: "60px", gridColumn: "7 / 13" },
  "mar-castarlenas":    { photoSide: "left",  paddingTop: "0px",  gridColumn: "1 / 8"  },
  "delfina-capiglioni": { photoSide: "right", paddingTop: "0px",  gridColumn: "6 / 13" },
  "julia-renones":      { photoSide: "left",  paddingTop: "0px",  gridColumn: "3 / 10" },
};

const GROUPS: string[][] = [
  ["jordi-peralta",  "marc-vizcarra"],
  ["mar-castarlenas","delfina-capiglioni"],
  ["julia-renones"],
];

const GROUP_MARGIN = ["40px", "52px", "8px"];

const PILLARS = ["Encàrrec", "Subjecte", "Sentit", "Resultat"];

export default async function PersonesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const members = getAllTeamMembers();
  const bySlug: Record<string, TeamMember> = Object.fromEntries(
    members.map((m) => [m.slug, m])
  );

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>

      {/* ── Capçalera ─────────────────────────────────────────────────── */}
      <header style={{
        paddingTop:    "clamp(36px,5vh,64px)",
        paddingBottom: "clamp(24px,3.5vh,44px)",
        paddingLeft:   "var(--margin-page)",
        paddingRight:  "var(--margin-page)",
        borderBottom:  "1px solid #1a1a1a",
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

      {/* ── Constel·lació ─────────────────────────────────────────────── */}
      <section style={{
        paddingLeft:   "var(--margin-page)",
        paddingRight:  "var(--margin-page)",
        paddingBottom: "80px",
      }}>
        {GROUPS.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="block md:grid md:grid-cols-12"
            style={{ marginTop: GROUP_MARGIN[groupIndex] ?? "56px" }}
          >
            {group.map((slug) => {
              const member = bySlug[slug];
              if (!member) return null;
              const cfg = CONSTELLATION[slug];
              if (!cfg) return null;
              return (
                <div
                  key={slug}
                  data-person={slug}
                  className="mt-12 md:mt-0"
                  style={{ gridColumn: cfg.gridColumn, paddingTop: cfg.paddingTop }}
                >
                  <PersonCard
                    member={member}
                    locale={locale as Locale}
                    photoSide={cfg.photoSide}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </section>

      {/* ── Manera de treballar ───────────────────────────────────────── */}
      <section style={{
        borderTop:   "1px solid #1a1a1a",
        background:  "var(--color-fg)",
        color:       "var(--color-bg)",
        padding:     "clamp(64px,9vh,112px) var(--margin-page)",
        WebkitFontSmoothing: "antialiased",
      }}>
        <p style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "10px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.4)",
          marginBottom:  "clamp(32px,5vh,56px)",
        }}>
          Com treballem
        </p>

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
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: "0 0 10px" }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(18px,2vw,28px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
                {word}
              </h3>
            </div>
          ))}
        </div>

        {/* Secondary text + municipalities */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "end" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: 0, maxWidth: "400px" }}>
            Treballem arreu del territori català amb ajuntaments i agents públics i privats.
            Cada encàrrec és una oportunitat de descobrir un nou municipi i deixar-hi un relat
            holístic i potent per crear noves oportunitats.
          </p>
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
              Municipis on hem treballat
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", margin: 0 }}>
              Granollers · Terrassa · Sant Cugat · Rubí<br />
              Premià de Mar · La Llagosta · Calaf · i molts més
            </p>
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
            fontFamily:    "var(--font-mono)",
            fontSize:      "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
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
        @media (max-width: 768px) {
          .pu-pillars-grid { grid-template-columns: repeat(2,1fr) !important; }
          .pu-cta-section { flex-direction: column; align-items: flex-start !important; }
          .pu-treballar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
