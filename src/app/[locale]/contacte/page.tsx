import BackLink from "@/components/layout/BackLink";
import ContactPlan from "@/components/contact/ContactPlan";

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
  const { locale } = await params;

  return (
    <>
      <div className="pu-contact-page">
      <div className="pu-contact-root">

        <h1 className="pu-contact-title">CONTACTE</h1>
        <BackLink />
        <p className="pu-contact-heading">Què teniu<br />entre mans?</p>

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
            <address className="pu-contact-address">
              Carrer de l&apos;Argentona, 59<br />
              Pis 3-3 · 08302 Mataró
            </address>
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

      {/* Plànol dibuixat de l'entorn de l'estudi; ones i fotos de l'espai */}
      <ContactPlan locale={locale} />
      </div>

      <style>{`
        .pu-contact-page {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          align-items: start;
        }
        @media (max-width: 900px) {
          .pu-contact-page { display: block; }
        }

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

        .pu-contact-title {
          font-family: var(--font-sans);
          font-size: clamp(32px, 4vw, 60px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #000;
          margin: clamp(36px, 5vh, 64px) 0 0;
        }
        .pu-contact-heading {
          font-family: var(--font-sans);
          font-size: clamp(22px, 2.2vw, 32px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: #000;
          margin: 0 0 clamp(40px, 6vh, 72px);
        }
        .pu-contact-root > .pu-back { margin: clamp(16px, 2.5vh, 28px) 0 clamp(28px, 4vh, 48px); }

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

        .pu-contact-address {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.1vw, 15px);
          font-weight: 400;
          line-height: 1.75;
          color: #555;
          font-style: normal;
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
        }
      `}</style>
    </>
  );
}
