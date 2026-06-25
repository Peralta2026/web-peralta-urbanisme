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

  // Build rows of 2 from the sorted member list
  const rows: (typeof members)[] = [];
  for (let i = 0; i < members.length; i += 2) {
    rows.push(members.slice(i, i + 2));
  }

  return (
    <div style={{ paddingTop: "88px" }}>
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
            marginBottom: "48px",
          }}
        >
          EQUIP HUMÀ
        </h1>
        <div
          style={{
            maxWidth: "600px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
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

      {/* ── Constel·lació de persones — 2 per fila ── */}
      <section
        style={{
          paddingLeft: "64px",
          paddingRight: "64px",
          paddingBottom: "160px",
        }}
      >
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              marginTop: rowIndex === 0 ? "120px" : "160px",
              gap: "0",
            }}
          >
            {/* Left person: photo left, text right (vertically centered) */}
            {row[0] && (
              <div>
                <PersonCard
                  member={row[0]}
                  locale={locale as Locale}
                  photoSide="left"
                />
              </div>
            )}

            {/* Right person: text top-left, photo right (creates vertical stagger) */}
            {row[1] && (
              <div>
                <PersonCard
                  member={row[1]}
                  locale={locale as Locale}
                  photoSide="right"
                />
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
