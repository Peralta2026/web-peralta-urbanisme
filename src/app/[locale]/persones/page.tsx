import { getAllTeamMembers } from "@/lib/team";
import type { Locale, TeamMember } from "@/lib/types";
import PersonCard from "@/components/team/PersonCard";

// ─── Posicions de la constel·lació (desktop) ───────────────────────────────
//
// Retícula invisible de 12 columnes sobre un contenidor de 1440px.
// Cada persona té: photoSide, paddingTop (desplaçament vertical dins el grup),
// i colStart/colSpan per posicionar-la a la retícula.
//
// GRUP 1 — Jordi + Mar (Partners)
//   Jordi: cols 1–6, foto esquerra + text dret, alineat a dalt
//   Mar:   cols 7–12, text esquerre + foto dreta, desplaçat 110px avall
//
// GRUP 2 — Marc + Julia
//   Marc:  cols 1–7, foto esquerra + text dret, alineat a dalt
//   Julia: cols 6–12, text esquerre + foto dreta, desplaçat 70px avall
//
// GRUP 3 — Delfina (sola)
//   Delfina: cols 3–9, foto esquerra + text dret, centrada-esquerra

const CONSTELLATION: Record<
  string,
  {
    photoSide: "left" | "right";
    paddingTop: string;
    gridColumn: string;
  }
> = {
  "jordi-peralta": {
    photoSide: "left",
    paddingTop: "0px",
    gridColumn: "1 / 7",
  },
  "mar-castarlenas": {
    photoSide: "right",
    paddingTop: "110px",
    gridColumn: "7 / 13",
  },
  "marc-vizcarra": {
    photoSide: "left",
    paddingTop: "0px",
    gridColumn: "1 / 8",
  },
  "julia-renones": {
    photoSide: "right",
    paddingTop: "70px",
    gridColumn: "6 / 13",
  },
  "delfina-capiglioni": {
    photoSide: "left",
    paddingTop: "0px",
    gridColumn: "3 / 10",
  },
};

// Grups de persones per files de la constel·lació
const GROUPS: string[][] = [
  ["jordi-peralta", "mar-castarlenas"],
  ["marc-vizcarra", "julia-renones"],
  ["delfina-capiglioni"],
];

const GROUP_MARGIN: Record<number, string> = {
  0: "120px",
  1: "180px",
  2: "160px",
};

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
    <div style={{ paddingTop: "88px" }}>
      {/* ── Capçalera ── */}
      <header
        style={{
          paddingLeft: "64px",
          paddingRight: "64px",
          paddingTop: "80px",
          paddingBottom: "80px",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "clamp(2.4rem, 6vw, 5.5rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.0,
            color: "#000",
            marginBottom: "48px",
          }}
        >
          EQUIP HUMÀ
        </h1>
        <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", lineHeight: 1.65, color: "#000" }}>
            Peralta Urbanisme és un equip d&apos;arquitectes i urbanistes dedicat
            al planejament, l&apos;estratègia urbana i la transformació del territori.
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", lineHeight: 1.65, color: "#000" }}>
            La nostra estructura combina un equip estable amb una xarxa de
            col·laboradors especialitzats, que s&apos;incorporen segons les necessitats
            de cada projecte. Aquesta manera de treballar ens permet mantenir una
            mirada propera, rigorosa i transversal sobre encàrrecs de naturalesa
            i escala diversa.
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", lineHeight: 1.65, color: "#000" }}>
            El nucli de l&apos;empresa està format per dos arquitectes urbanistes de
            dues generacions diferents però que comparteixen un mateix tarannà
            i inquietud sobre el territori.
          </p>
        </div>
      </header>

      {/* ── Constel·lació — MÒBIL: pila simple ── */}
      <section
        className="md:hidden"
        style={{
          padding: "64px 24px 120px",
          display: "flex",
          flexDirection: "column",
          gap: "72px",
        }}
      >
        {members.map((member) => (
          <PersonCard
            key={member.slug}
            member={member}
            locale={locale as Locale}
            photoSide="left"
          />
        ))}
      </section>

      {/* ── Constel·lació — DESKTOP: posicions individuals ── */}
      <section
        className="hidden md:block"
        style={{
          paddingLeft: "64px",
          paddingRight: "64px",
          paddingBottom: "200px",
        }}
      >
        {GROUPS.map((group, groupIndex) => (
          <div
            key={groupIndex}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              marginTop: GROUP_MARGIN[groupIndex] ?? "160px",
            }}
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
                  style={{
                    gridColumn: cfg.gridColumn,
                    paddingTop: cfg.paddingTop,
                  }}
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
    </div>
  );
}
