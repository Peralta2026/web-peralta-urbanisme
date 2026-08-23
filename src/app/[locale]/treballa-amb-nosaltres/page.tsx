import Link from "next/link";

export const dynamic = "force-static";

export default async function TreballaAmbNosaltresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>

        <header style={{ padding: "64px var(--margin-page) 56px", borderBottom: "1px solid #1a1a1a" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: "16px" }}>
            Col·laboració
          </p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.92, color: "#000", margin: 0 }}>
            Comencem
          </h1>
        </header>

        <section style={{ padding: "72px var(--margin-page) 120px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>

          {/* Dades de contacte */}
          <div>
            <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "32px" }}>
              <div>
                <dt style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: "8px" }}>
                  Correu electrònic
                </dt>
                <dd style={{ margin: 0 }}>
                  <a href="mailto:info@peraltaurbanisme.cat" style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 500, color: "#000", textDecoration: "none", borderBottom: "1px solid currentColor", paddingBottom: "2px" }}>
                    info@peraltaurbanisme.cat
                  </a>
                </dd>
              </div>
              <div>
                <dt style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: "8px" }}>
                  Telèfon
                </dt>
                <dd style={{ margin: 0 }}>
                  <a href="tel:+34930000000" style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 500, color: "#000", textDecoration: "none" }}>
                    +34 93 000 00 00
                  </a>
                </dd>
              </div>
              <div>
                <dt style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: "8px" }}>
                  Adreça
                </dt>
                <dd style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "16px", lineHeight: 1.6, color: "#333" }}>
                  Carrer de la Indústria, 00<br />
                  08025 Barcelona
                </dd>
              </div>
              <div>
                <dt style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: "12px" }}>
                  Xarxes socials
                </dt>
                <dd style={{ margin: 0, display: "flex", gap: "20px" }}>
                  <a href="https://www.instagram.com/peraltaurbanisme" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1px solid currentColor", paddingBottom: "2px" }}>
                    Instagram
                  </a>
                  <a href="https://www.linkedin.com/company/peralta-urbanisme" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1px solid currentColor", paddingBottom: "2px" }}>
                    LinkedIn
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Text adaptat */}
          <div style={{ paddingTop: "8px" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "20px", lineHeight: 1.5, color: "#111", marginBottom: "24px", letterSpacing: "-0.01em" }}>
              Si teniu un repte urbanístic, un encàrrec concret o simplement voleu explorar
              si podem treballar junts, no dubtis en contactar-nos.
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", lineHeight: 1.6, color: "#666", marginBottom: "16px" }}>
              Expliceu-nos el vostre municipi, el vostre projecte o el vostre dubte.
              Respondrem en un termini màxim de 48 hores en dies laborables.
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.6, color: "#999" }}>
              Si voleu, digueu-nos un repte urbanístic que considereu rellevant i farem un
              abordatge preliminar per compartir-lo amb vosaltres, sense cost ni compromís.
            </p>
          </div>
        </section>

        {/* Tornar a l'equip */}
        <div style={{ padding: "0 var(--margin-page) 64px", borderTop: "1px solid #e8e8e4" }}>
          <Link
            href={`/${locale}/equip`}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "32px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textDecoration: "none" }}
          >
            ← Tornar a l&apos;equip
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          section { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
