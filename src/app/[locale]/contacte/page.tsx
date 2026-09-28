import ContactMapLoader from "@/components/contact/ContactMapLoader";

export const dynamic = "force-static";

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
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
    <>
      <div className="pu-contact-root">

        <h1 className="pu-contact-heading">Parlem</h1>

        <div className="pu-contact-intro">
          <p>
            Si teniu un projecte, una consulta o un repte urbanístic que vulgueu compartir
            amb nosaltres, poseu-vos en contacte amb l&apos;estudi.
          </p>
          <p>
            Treballem amb administracions, entitats, empreses i altres equips professionals,
            tant en nous encàrrecs com en col·laboracions.
          </p>
          <a href="mailto:info@peraltaurbanisme.com" className="pu-contact-cta">
            Expliqueu-nos el vostre projecte →
          </a>
        </div>

        <div className="pu-contact-grid">

          {/* Email */}
          <div className="pu-contact-block">
            <a href="mailto:info@peraltaurbanisme.com" className="pu-contact-email">
              info@peraltaurbanisme.com
            </a>
          </div>

          {/* Telèfon */}
          <div className="pu-contact-block">
            <a href="tel:+34935389893" className="pu-contact-phone">
              +34 935 389 893
            </a>
            <a href="tel:+34617005675" className="pu-contact-phone">
              +34 617 005 675
            </a>
          </div>

          {/* Adreça + mini-mapa */}
          <div className="pu-contact-block pu-contact-block--addr">
            <div className="pu-contact-addr-row">
              <address className="pu-contact-address">
                Carrer de l&apos;Argentona, 59<br />
                Pis 3-3 · 08302 Mataró
              </address>
              {/* Mini mapa — overflow visible so popup can escape */}
              <div className="pu-contact-minimap">
                <ContactMapLoader />
              </div>
            </div>
          </div>

          {/* Xarxes */}
          <div className="pu-contact-block">
            <div className="pu-contact-socials">
              <a
                href="https://www.instagram.com/peraltaurbanisme/"
                target="_blank"
                rel="noopener noreferrer"
                className="pu-contact-social"
                aria-label="Instagram"
              >
                <IconInstagram />
                <span>Instagram</span>
              </a>
              <a
                href="https://es.linkedin.com/company/peralta-urbanisme-slp"
                target="_blank"
                rel="noopener noreferrer"
                className="pu-contact-social"
                aria-label="LinkedIn"
              >
                <IconLinkedin />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .pu-contact-intro {
          max-width: 560px;
          margin-bottom: clamp(40px, 6vh, 72px);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pu-contact-intro p {
          font-family: var(--font-sans);
          font-size: clamp(14px, 1.15vw, 16px);
          line-height: 1.7;
          color: #444;
          margin: 0;
        }
        .pu-contact-cta {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.1vw, 15px);
          font-weight: 600;
          color: #000;
          text-decoration: none;
          letter-spacing: -0.01em;
          margin-top: 4px;
          transition: opacity 180ms ease;
          display: inline-block;
        }
        .pu-contact-cta:hover { opacity: 0.4; }

        .pu-contact-root {
          padding-top: var(--header-height);
          padding-left: var(--margin-page);
          padding-right: var(--margin-page);
          padding-bottom: clamp(64px, 10vh, 120px);
          font-family: var(--font-sans);
          max-width: 900px;
        }

        .pu-contact-heading {
          font-family: var(--font-sans);
          font-size: clamp(48px, 6vw, 88px);
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 1;
          color: #000;
          margin: clamp(40px, 6vh, 72px) 0 clamp(48px, 7vh, 80px);
        }

        .pu-contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(36px, 5vh, 56px) clamp(40px, 6vw, 80px);
        }

        .pu-contact-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pu-contact-block--addr {
          grid-column: 1 / -1;
        }


        .pu-contact-email {
          font-family: var(--font-sans);
          font-size: clamp(14px, 1.3vw, 18px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #000;
          text-decoration: none;
          transition: opacity 180ms ease;
        }
        .pu-contact-email:hover { opacity: 0.35; }

        .pu-contact-phone {
          font-family: var(--font-sans);
          font-size: clamp(14px, 1.2vw, 17px);
          font-weight: 400;
          color: #444;
          text-decoration: none;
          transition: opacity 180ms ease;
        }
        .pu-contact-phone:hover { opacity: 0.35; }

        .pu-contact-addr-row {
          display: flex;
          align-items: flex-start;
          gap: clamp(28px, 3vw, 52px);
        }

        .pu-contact-address {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.1vw, 15px);
          font-weight: 400;
          line-height: 1.75;
          color: #555;
          font-style: normal;
        }

        /* Mini mapa: overflow visible so the popup can appear above it */
        .pu-contact-minimap {
          width: clamp(160px, 18vw, 220px);
          height: clamp(160px, 18vw, 220px);
          flex-shrink: 0;
          position: relative;
          border: 1px solid rgba(0,0,0,0.09);
        }
        .pu-contact-minimap > div {
          width: 100%;
          height: 100%;
        }

        /* Social icons — bigger, clearer */
        .pu-contact-socials {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pu-contact-social {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #555;
          text-decoration: none;
          transition: color 180ms ease;
        }
        .pu-contact-social svg {
          flex-shrink: 0;
        }
        .pu-contact-social span {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.1vw, 15px);
          font-weight: 500;
          letter-spacing: -0.01em;
        }
        .pu-contact-social:hover { color: #000; }

        /* ── Mòbil ── */
        @media (max-width: 640px) {
          .pu-contact-grid {
            grid-template-columns: 1fr;
          }
          .pu-contact-block--addr {
            grid-column: 1;
          }
          .pu-contact-addr-row {
            flex-direction: column;
          }
          .pu-contact-minimap {
            width: 100%;
            height: 52vw;
          }
        }
      `}</style>
    </>
  );
}
