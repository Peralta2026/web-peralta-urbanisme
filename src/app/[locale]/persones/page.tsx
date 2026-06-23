import { getAllTeamMembers } from "@/lib/team";
import type { Locale } from "@/lib/types";
import PersonCard from "@/components/team/PersonCard";

export default async function PersonesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const members = getAllTeamMembers();

  return (
    <div style={{ paddingTop: "72px" }}>
      {/* ── Capçalera ── */}
      <header
        style={{
          paddingLeft: "64px",
          paddingRight: "64px",
          paddingTop: "80px",
          paddingBottom: "80px",
          borderBottom: "1px solid #000",
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
            marginBottom: "40px",
          }}
        >
          EQUIP HUMÀ
        </h1>
        <div
          style={{
            maxWidth: "640px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "16px",
              lineHeight: 1.65,
              color: "#000",
            }}
          >
            Peralta Urbanisme és un equip d&apos;arquitectes i urbanistes dedicat
            al planejament, l&apos;estratègia urbana i la transformació del territori.
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "16px",
              lineHeight: 1.65,
              color: "#000",
            }}
          >
            La nostra estructura combina un equip estable amb una xarxa de
            col·laboradors especialitzats, que s&apos;incorporen segons les necessitats
            de cada projecte. Aquesta manera de treballar ens permet mantenir una
            mirada propera, rigorosa i transversal sobre encàrrecs de naturalesa
            i escala diversa.
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "16px",
              lineHeight: 1.65,
              color: "#000",
            }}
          >
            El nucli de l&apos;empresa està format per dos arquitectes urbanistes de
            dues generacions diferents però que comparteixen un mateix tarannà
            i inquietud sobre el territori.
          </p>
        </div>
      </header>

      {/* ── Constel·lació de persones ── */}
      <section
        style={{
          paddingLeft: "64px",
          paddingRight: "64px",
          paddingBottom: "160px",
        }}
      >
        {members.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#aaa",
              marginTop: "80px",
            }}
          >
            —
          </p>
        ) : (
          members.map((member, i) => (
            <div
              key={member.slug}
              style={{
                marginTop: i === 0 ? "120px" : "160px",
                /* Right-side people are offset to create the stagger */
                paddingLeft: i % 2 === 1 ? "80px" : "0",
              }}
            >
              <PersonCard
                member={member}
                locale={locale as Locale}
                photoSide={i % 2 === 0 ? "left" : "right"}
              />
            </div>
          ))
        )}
      </section>
    </div>
  );
}
