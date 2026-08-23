import nextDynamic from "next/dynamic";

export const dynamic = "force-static";

const ContactMap = nextDynamic(
  () => import("@/components/contact/ContactMap"),
  { ssr: false, loading: () => <div style={{ width: "100%", height: "100%", minHeight: "480px", background: "#f2f1ee" }} /> }
);

export default async function ContactePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // locale available for future i18n use
  await params;

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>

      {/* ── Capçalera ─────────────────────────────────────────────────── */}
      <header style={{
        padding:      "clamp(36px,5vh,64px) var(--margin-page) clamp(24px,3.5vh,44px)",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <p style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color:         "#888",
          marginBottom:  "20px",
        }}>
          Contacte
        </p>
        <h1 style={{
          fontFamily:    "var(--font-sans)",
          fontWeight:    700,
          fontSize:      "clamp(52px,7vw,96px)",
          letterSpacing: "-0.05em",
          lineHeight:    0.9,
          color:         "#000",
          margin:        0,
        }}>
          Parlem
        </h1>
      </header>

      {/* ── Contingut principal ───────────────────────────────────────── */}
      <div className="pu-contacte-grid">

        {/* ── Columna esquerra: dades ─────────────────────────────────── */}
        <div className="pu-contacte-left">

          {/* Email */}
          <div className="pu-contacte-block pu-contacte-block--top">
            <p className="pu-contacte-label">Escriu-nos</p>
            <a
              href="mailto:info@peraltaurbanisme.com"
              className="pu-contacte-email"
            >
              info@peraltaurbanisme.com
            </a>
          </div>

          {/* Adreça */}
          <div className="pu-contacte-block">
            <p className="pu-contacte-label">Adreça</p>
            <address className="pu-contacte-address">
              Carrer d&apos;Argentona, 59<br />
              08302 Mataró, Barcelona
            </address>
          </div>

          {/* Xarxes */}
          <div className="pu-contacte-block">
            <p className="pu-contacte-label">Segueix-nos</p>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <a
                href="https://www.instagram.com/peraltaurbanisme/"
                target="_blank"
                rel="noopener noreferrer"
                className="pu-contacte-social"
              >
                Instagram
              </a>
              <a
                href="https://es.linkedin.com/company/peralta-urbanisme-slp"
                target="_blank"
                rel="noopener noreferrer"
                className="pu-contacte-social"
              >
                LinkedIn
              </a>
            </div>
          </div>

        </div>

        {/* ── Columna dreta: mapa ─────────────────────────────────────── */}
        <div className="pu-contacte-map-wrap">
          <ContactMap />
        </div>
      </div>

      <style>{`
        .pu-contacte-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          min-height: calc(100vh - 88px - clamp(100px,18vh,160px));
          border-bottom: 1px solid #1a1a1a;
        }
        .pu-contacte-left {
          border-right: 1px solid #1a1a1a;
          display: flex;
          flex-direction: column;
        }
        .pu-contacte-block {
          padding: clamp(28px,4vh,52px) var(--margin-page);
          border-top: 1px solid #e8e8e4;
        }
        .pu-contacte-block--top {
          border-top: none;
          padding-top: clamp(36px,5vh,64px);
        }
        .pu-contacte-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #888;
          margin: 0 0 14px;
        }
        .pu-contacte-email {
          font-family: var(--font-sans);
          font-size: clamp(18px, 1.9vw, 26px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #000;
          text-decoration: none;
          border-bottom: 1.5px solid #000;
          padding-bottom: 3px;
          display: inline-block;
          transition: opacity 200ms ease;
        }
        .pu-contacte-email:hover { opacity: 0.55; }
        .pu-contacte-address {
          font-family: var(--font-sans);
          font-size: clamp(14px, 1.3vw, 18px);
          font-weight: 400;
          line-height: 1.6;
          color: #333;
          font-style: normal;
          margin: 0;
        }
        .pu-contacte-social {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000;
          text-decoration: none;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          transition: opacity 200ms ease;
        }
        .pu-contacte-social:hover { opacity: 0.5; }
        .pu-contacte-map-wrap {
          position: relative;
          overflow: hidden;
        }
        .pu-contacte-map-wrap > div {
          position: absolute;
          inset: 0;
        }
        @media (max-width: 768px) {
          .pu-contacte-grid {
            grid-template-columns: 1fr;
            min-height: unset;
          }
          .pu-contacte-left {
            border-right: none;
            border-bottom: 1px solid #1a1a1a;
          }
          .pu-contacte-map-wrap {
            height: 380px;
            position: relative;
          }
          .pu-contacte-map-wrap > div {
            position: relative;
            height: 380px;
          }
        }
      `}</style>
    </div>
  );
}
