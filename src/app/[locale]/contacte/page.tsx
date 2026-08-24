import ContactMapLoader from "@/components/contact/ContactMapLoader";

export const dynamic = "force-static";

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.1" fill="currentColor" strokeWidth="2.5"/>
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

export default async function ContactePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>

      {/* ── Capçalera estàndard ─────────────────────────────────────────── */}
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
          <div className="pu-contacte-block">
            <p className="pu-contacte-label">Escriu-nos</p>
            <a href="mailto:info@peraltaurbanisme.com" className="pu-contacte-email">
              info@peraltaurbanisme.com
            </a>
          </div>

          {/* Telèfon */}
          <div className="pu-contacte-block">
            <p className="pu-contacte-label">Telèfon</p>
            <a href="tel:+34935389893" className="pu-contacte-phone">
              +34 935 389 893
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
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <a
                href="https://www.instagram.com/peraltaurbanisme/"
                target="_blank"
                rel="noopener noreferrer"
                className="pu-social-icon"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href="https://es.linkedin.com/company/peralta-urbanisme-slp"
                target="_blank"
                rel="noopener noreferrer"
                className="pu-social-icon"
                aria-label="LinkedIn"
              >
                <IconLinkedin />
              </a>
            </div>
          </div>

        </div>

        {/* ── Columna dreta: mapa ─────────────────────────────────────── */}
        <div className="pu-contacte-map-wrap">
          <ContactMapLoader />
        </div>
      </div>

      <style>{`
        .pu-contacte-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          align-items: start;
          border-bottom: 1px solid #1a1a1a;
        }
        .pu-contacte-left {
          display: flex;
          flex-direction: column;
          padding: clamp(36px,5vh,64px) var(--margin-page);
          gap: 36px;
        }
        .pu-contacte-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pu-contacte-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #aaa;
          margin: 0;
        }
        .pu-contacte-email {
          font-family: var(--font-sans);
          font-size: clamp(14px, 1.4vw, 20px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #000;
          text-decoration: none;
          transition: opacity 200ms ease;
        }
        .pu-contacte-email:hover { opacity: 0.5; }
        .pu-contacte-phone {
          font-family: var(--font-sans);
          font-size: clamp(14px, 1.3vw, 18px);
          font-weight: 400;
          letter-spacing: -0.01em;
          color: #333;
          text-decoration: none;
          transition: opacity 200ms ease;
        }
        .pu-contacte-phone:hover { opacity: 0.5; }
        .pu-contacte-address {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.2vw, 16px);
          font-weight: 400;
          line-height: 1.65;
          color: #555;
          font-style: normal;
          margin: 0;
        }
        .pu-social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(0,0,0,0.15);
          color: #444;
          text-decoration: none;
          transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
        }
        .pu-social-icon:hover { color: #000; border-color: #000; }
        .pu-contacte-map-wrap {
          height: 480px;
          position: sticky;
          top: 88px;
          overflow: hidden;
          border-left: 1px solid #1a1a1a;
        }
        .pu-contacte-map-wrap > div {
          width: 100%;
          height: 100%;
        }
        @media (max-width: 768px) {
          .pu-contacte-grid { grid-template-columns: 1fr; }
          .pu-contacte-map-wrap {
            height: 340px;
            position: relative;
            top: 0;
            border-left: none;
            border-top: 1px solid #1a1a1a;
          }
        }
      `}</style>
    </div>
  );
}
