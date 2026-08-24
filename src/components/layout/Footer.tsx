import Link from "next/link";
import Image from "next/image";

function L(locale: string, path: string) {
  return `/${locale}${path}`;
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-label="Instagram">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.1" fill="currentColor" strokeWidth="2.5"/>
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="LinkedIn">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

export default function Footer({ locale }: { locale: string }) {
  return (
    <footer className="pu-footer">
      <div className="pu-footer-inner">

        {/* ── Col 1: Marca ── */}
        <div className="pu-footer-brand">
          <Link href={L(locale, "/")} className="pu-footer-logo-link">
            <Image
              src="/logo-nuevo.png"
              alt="Peralta Urbanisme"
              width={280}
              height={70}
              style={{ filter: "invert(1)", width: "100%", height: "auto" }}
            />
          </Link>
          <p className="pu-footer-tagline">
            Despatx d&apos;urbanisme<br />i planificació territorial
          </p>
        </div>

        {/* ── Col 2: Navegació en 2 sub-columnes ── */}
        <div className="pu-footer-nav-wrap">
          <div className="pu-footer-nav-sub">
            <Link href={L(locale, "/projectes")}>Arxiu de Projectes</Link>
            <Link href={L(locale, "/directori")}>Directori visual</Link>
            <Link href={L(locale, "/mapa")}>Directori territorial</Link>
          </div>
          <div className="pu-footer-nav-sub">
            <Link href={L(locale, "/principis")}>Mètode</Link>
            <Link href={L(locale, "/equip")}>Persones</Link>
          </div>
        </div>

        {/* ── Col 3: Contacte ── */}
        <div className="pu-footer-contact-col">
          <p className="pu-footer-col-label">Contacte</p>
          <a href="tel:+34935389893" className="pu-footer-phone">
            +34 935 389 893
          </a>
          <div className="pu-footer-social">
            <a href="https://www.instagram.com/peraltaurbanisme" target="_blank" rel="noopener noreferrer" className="pu-footer-social-icon" aria-label="Instagram">
              <IconInstagram />
            </a>
            <a href="https://www.linkedin.com/company/peralta-urbanisme" target="_blank" rel="noopener noreferrer" className="pu-footer-social-icon" aria-label="LinkedIn">
              <IconLinkedin />
            </a>
          </div>
        </div>

      </div>

      {/* ── Línia ── */}
      <div className="pu-footer-rule" />

      {/* ── Peu ── */}
      <div className="pu-footer-bottom">
        <span className="pu-footer-copy">© {new Date().getFullYear()} Peralta Urbanisme</span>
        <div className="pu-footer-legal">
          <Link href={L(locale, "/avis-legal")}>Avís legal</Link>
          <Link href={L(locale, "/privacitat")}>Política de privacitat</Link>
        </div>
      </div>

      <style>{`
        .pu-footer {
          background: #0a0a0a;
          padding: 80px var(--margin-page) 44px;
          font-family: var(--font-sans);
          position: relative;
          z-index: 1;
        }
        .pu-footer-inner {
          display: grid;
          grid-template-columns: 1.8fr 1.4fr 1fr;
          gap: 56px;
          align-items: start;
          margin-bottom: 72px;
        }

        /* Brand */
        .pu-footer-brand { display: flex; flex-direction: column; gap: 0; }
        .pu-footer-logo-link { display: block; width: clamp(180px, 20vw, 280px); margin-bottom: 22px; }
        .pu-footer-logo-link img { display: block; width: 100%; height: auto; }
        .pu-footer-tagline {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          line-height: 1.8;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        /* Nav */
        .pu-footer-nav-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 24px;
          padding-top: 6px;
        }
        .pu-footer-nav-sub { display: flex; flex-direction: column; gap: 12px; }
        .pu-footer-nav-sub a {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: -0.01em;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 180ms ease;
          line-height: 1.3;
        }
        .pu-footer-nav-sub a:hover { color: #fff; }

        /* Contact */
        .pu-footer-col-label {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin: 0 0 18px;
        }
        .pu-footer-phone {
          display: block;
          font-family: var(--font-sans);
          font-size: clamp(16px, 1.5vw, 22px);
          font-weight: 600;
          letter-spacing: -0.03em;
          color: #fff;
          text-decoration: none;
          margin-bottom: 24px;
          transition: opacity 180ms ease;
        }
        .pu-footer-phone:hover { opacity: 0.65; }
        .pu-footer-social { display: flex; gap: 14px; align-items: center; }
        .pu-footer-social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 180ms ease, border-color 180ms ease;
        }
        .pu-footer-social-icon:hover { color: #fff; border-color: rgba(255,255,255,0.6); }

        /* Bottom */
        .pu-footer-rule { height: 1px; background: rgba(255,255,255,0.07); margin-bottom: 28px; }
        .pu-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .pu-footer-copy {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
        }
        .pu-footer-legal { display: flex; gap: 24px; }
        .pu-footer-legal a {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          text-decoration: none;
          transition: color 180ms ease;
        }
        .pu-footer-legal a:hover { color: rgba(255,255,255,0.55); }

        /* Responsive */
        @media (max-width: 960px) {
          .pu-footer-inner { grid-template-columns: 1fr 1fr; gap: 40px; }
          .pu-footer-brand { grid-column: 1 / -1; flex-direction: row; align-items: flex-end; gap: 32px; }
          .pu-footer-tagline { margin-bottom: 4px; }
        }
        @media (max-width: 600px) {
          .pu-footer { padding: 56px var(--margin-mobile) 36px; }
          .pu-footer-inner { grid-template-columns: 1fr; gap: 36px; }
          .pu-footer-brand { flex-direction: column; align-items: flex-start; gap: 16px; }
          .pu-footer-nav-wrap { gap: 0 16px; }
          .pu-footer-bottom { flex-direction: column; align-items: flex-start; gap: 14px; }
        }
      `}</style>
    </footer>
  );
}
