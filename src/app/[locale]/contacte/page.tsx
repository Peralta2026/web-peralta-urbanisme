import ContactMapLoader from "@/components/contact/ContactMapLoader";

export const dynamic = "force-static";

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.1" fill="currentColor" strokeWidth="2.5"/>
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
    <>
      <div className="pu-contact-root">

        {/* ── Columna esquerra: info ── */}
        <aside className="pu-contact-info">

          <h1 className="pu-contact-heading">Parlem</h1>

          <div className="pu-contact-blocks">

            <div className="pu-contact-block">
              <span className="pu-contact-label">Escriu-nos</span>
              <a href="mailto:info@peraltaurbanisme.com" className="pu-contact-email">
                info@peraltaurbanisme.com
              </a>
            </div>

            <div className="pu-contact-block">
              <span className="pu-contact-label">Telèfon</span>
              <a href="tel:+34935389893" className="pu-contact-phone">
                +34 935 389 893
              </a>
            </div>

            <div className="pu-contact-block">
              <span className="pu-contact-label">Adreça</span>
              <address className="pu-contact-address">
                Carrer de l&apos;Argentona, 29<br />
                Pis 3-3 · 08302 Mataró
              </address>
            </div>

            <div className="pu-contact-block">
              <span className="pu-contact-label">Segueix-nos</span>
              <div className="pu-contact-socials">
                <a
                  href="https://www.instagram.com/peraltaurbanisme/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pu-contact-social"
                  aria-label="Instagram"
                >
                  <IconInstagram /> Instagram
                </a>
                <a
                  href="https://es.linkedin.com/company/peralta-urbanisme-slp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pu-contact-social"
                  aria-label="LinkedIn"
                >
                  <IconLinkedin /> LinkedIn
                </a>
              </div>
            </div>

          </div>
        </aside>

        {/* ── Columna dreta: mapa ── */}
        <div className="pu-contact-map">
          <ContactMapLoader />
        </div>

      </div>

      <style>{`
        .pu-contact-root {
          display: grid;
          grid-template-columns: 340px 1fr;
          height: 100svh;
          padding-top: var(--header-height);
          overflow: hidden;
          font-family: var(--font-sans);
        }

        /* ── Panel info ── */
        .pu-contact-info {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: clamp(32px,5vh,56px) var(--margin-page) clamp(40px,6vh,64px);
          border-right: 1px solid rgba(0,0,0,0.08);
          overflow-y: auto;
        }

        .pu-contact-heading {
          font-family: var(--font-sans);
          font-size: clamp(42px, 5vw, 72px);
          font-weight: 700;
          letter-spacing: -0.045em;
          line-height: 1;
          color: #000;
          margin: 0 0 clamp(40px, 6vh, 64px);
        }

        .pu-contact-blocks {
          display: flex;
          flex-direction: column;
          gap: clamp(24px, 3.5vh, 36px);
        }

        .pu-contact-block {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .pu-contact-label {
          font-family: var(--font-mono);
          font-size: 8.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #bbb;
        }

        .pu-contact-email {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.1vw, 15px);
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #000;
          text-decoration: none;
          transition: opacity 180ms ease;
        }
        .pu-contact-email:hover { opacity: 0.4; }

        .pu-contact-phone {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.05vw, 15px);
          font-weight: 400;
          color: #444;
          text-decoration: none;
          transition: opacity 180ms ease;
        }
        .pu-contact-phone:hover { opacity: 0.4; }

        .pu-contact-address {
          font-family: var(--font-sans);
          font-size: clamp(12px, 1vw, 14px);
          font-weight: 400;
          line-height: 1.7;
          color: #666;
          font-style: normal;
        }

        .pu-contact-socials {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pu-contact-social {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #888;
          text-decoration: none;
          transition: color 180ms ease;
        }
        .pu-contact-social:hover { color: #000; }

        /* ── Mapa ── */
        .pu-contact-map {
          position: relative;
          overflow: hidden;
        }
        .pu-contact-map > div {
          width: 100%;
          height: 100%;
        }

        /* ── Mòbil ── */
        @media (max-width: 768px) {
          .pu-contact-root {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            height: auto;
            min-height: 100svh;
            overflow: visible;
          }
          .pu-contact-info {
            justify-content: flex-start;
            border-right: none;
            border-bottom: 1px solid rgba(0,0,0,0.07);
          }
          .pu-contact-heading {
            margin-bottom: clamp(28px, 4vh, 40px);
          }
          .pu-contact-map {
            height: 52vw;
            min-height: 240px;
          }
        }
      `}</style>
    </>
  );
}
