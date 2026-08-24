import Link from "next/link";
import Image from "next/image";

function loc(locale: string, path: string) {
  return `/${locale}${path}`;
}

export default function Footer({ locale }: { locale: string }) {
  return (
    <footer className="pu-footer">

      {/* ── Contingut principal ── */}
      <div className="pu-footer-main">

        {/* Col 1 — Marca */}
        <div className="pu-footer-brand">
          <Link href={loc(locale, "/")} className="pu-footer-logo-link">
            <Image src="/logo-nuevo.png" alt="Peralta Urbanisme" width={220} height={55} style={{ filter: "invert(1)" }} />
          </Link>
          <p className="pu-footer-tagline">
            Despatx d&apos;urbanisme<br />i planificació territorial
          </p>
        </div>

        {/* Col 2 — Navegació */}
        <div className="pu-footer-nav-col">
          <p className="pu-footer-label">Pàgines</p>
          <nav className="pu-footer-links">
            <Link href={loc(locale, "/projectes")}>Arxiu de Projectes</Link>
            <Link href={loc(locale, "/directori")}>Directori visual</Link>
            <Link href={loc(locale, "/mapa")}>Directori territorial</Link>
            <Link href={loc(locale, "/principis")}>Mètode</Link>
            <Link href={loc(locale, "/equip")}>Persones</Link>
            <Link href={loc(locale, "/contacte")}>Contacte</Link>
          </nav>
        </div>

        {/* Col 3 — Contacte */}
        <div className="pu-footer-contact-col">
          <p className="pu-footer-label">Contacte</p>
          <a href="tel:+34935389893" className="pu-footer-phone">
            +34 935 389 893
          </a>
          <Link href={loc(locale, "/contacte")} className="pu-footer-contact-link">
            Escriu-nos →
          </Link>
        </div>

      </div>

      {/* ── Línia ── */}
      <div className="pu-footer-rule" />

      {/* ── Peu ── */}
      <div className="pu-footer-bottom">
        <span className="pu-footer-copy">
          © {new Date().getFullYear()} Peralta Urbanisme
        </span>
        <div className="pu-footer-legal">
          <Link href={loc(locale, "/avis-legal")}>Avís legal</Link>
          <Link href={loc(locale, "/privacitat")}>Política de privacitat</Link>
        </div>
      </div>

      <style>{`
        .pu-footer {
          background: #0a0a0a;
          padding: 72px var(--margin-page) 40px;
          font-family: var(--font-sans);
          color: rgba(255,255,255,0.55);
          position: relative;
          z-index: 1;
        }

        /* Main grid */
        .pu-footer-main {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 64px;
        }

        /* Brand */
        .pu-footer-logo-link {
          display: block;
          width: clamp(140px, 16vw, 200px);
          margin-bottom: 28px;
        }
        .pu-footer-logo-link img { width: 100%; height: auto; display: block; }
        .pu-footer-tagline {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1.7;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }

        /* Nav col */
        .pu-footer-label {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin: 0 0 20px;
        }
        .pu-footer-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pu-footer-links a {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: -0.01em;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: color 180ms ease;
        }
        .pu-footer-links a:hover { color: #fff; }

        /* Contact col */
        .pu-footer-phone {
          display: block;
          font-family: var(--font-sans);
          font-size: clamp(18px, 1.8vw, 26px);
          font-weight: 600;
          letter-spacing: -0.03em;
          color: #fff;
          text-decoration: none;
          margin-bottom: 20px;
          transition: opacity 180ms ease;
        }
        .pu-footer-phone:hover { opacity: 0.7; }
        .pu-footer-contact-link {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 2px;
          transition: color 180ms ease, border-color 180ms ease;
        }
        .pu-footer-contact-link:hover { color: #fff; border-color: rgba(255,255,255,0.6); }

        /* Divider */
        .pu-footer-rule {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin-bottom: 28px;
        }

        /* Bottom */
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
          color: rgba(255,255,255,0.22);
        }
        .pu-footer-legal {
          display: flex;
          gap: 24px;
        }
        .pu-footer-legal a {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          text-decoration: none;
          transition: color 180ms ease;
        }
        .pu-footer-legal a:hover { color: rgba(255,255,255,0.6); }

        /* Responsive */
        @media (max-width: 900px) {
          .pu-footer-main { grid-template-columns: 1fr 1fr; gap: 40px; }
          .pu-footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 600px) {
          .pu-footer { padding: 56px var(--margin-mobile) 36px; }
          .pu-footer-main { grid-template-columns: 1fr; gap: 36px; }
          .pu-footer-brand { grid-column: auto; }
          .pu-footer-bottom { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
      `}</style>
    </footer>
  );
}
