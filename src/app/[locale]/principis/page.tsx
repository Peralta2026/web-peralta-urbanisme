export const dynamic = "force-static";

export default async function PrincipisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>

        {/* Capçalera */}
        <header style={{ padding: "64px 32px 56px", borderBottom: "1px solid #1a1a1a" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: "16px" }}>
            Estudi · Principis
          </p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.92, color: "#000", margin: 0 }}>
            Com<br />treballem
          </h1>
        </header>

        {/* Contingut */}
        <section style={{ padding: "72px 32px 120px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", marginBottom: "20px" }}>
              Urbanisme de proximitat
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "17px", lineHeight: 1.6, color: "#111", marginBottom: "20px" }}>
              El nostre treball neix del territori. Cada projecte és un exercici d&apos;escolta activa: del lloc, de les persones que hi viuen i de les dinàmiques que el conformen.
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "17px", lineHeight: 1.6, color: "#111" }}>
              Entenem l&apos;urbanisme com una disciplina de síntesi —on la dimensió física, social i normativa es troben— i és en aquesta intersecció on projectem.
            </p>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", marginBottom: "20px" }}>
              Rigor i claredat
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "17px", lineHeight: 1.6, color: "#111", marginBottom: "20px" }}>
              El planejament urbanístic ha de ser llegible. Per a la ciutadania, per a l&apos;administració i per als professionals que el duran a terme. Escrivim de manera precisa perquè les coses es puguin executar.
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "17px", lineHeight: 1.6, color: "#111" }}>
              Cada proposta es documenta exhaustivament: anàlisi previ, diagnosi compartida, proposta justificada i redacció tècnica.
            </p>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", marginBottom: "20px" }}>
              Escales diverses
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "17px", lineHeight: 1.6, color: "#111" }}>
              Treballem des de l&apos;escala territorial fins al detall de l&apos;espai públic. El canvi d&apos;escala no és un salt: és la comprensió de com cada intervenció s&apos;inscriu en un sistema més ampli.
            </p>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", marginBottom: "20px" }}>
              Xarxa de col·laboradors
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "17px", lineHeight: 1.6, color: "#111" }}>
              L&apos;equip estable del despatx s&apos;amplia amb una xarxa de professionals especialitzats —geògrafs, enginyers, sociòlegs, paisatgistes— que s&apos;incorporen quan cada projecte ho requereix.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
