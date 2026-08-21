"use client";

import { useState, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const LOCALES = ["ca", "es", "en"] as const;

function localizeHref(href: string, locale: string): string {
  if (locale === "ca") return href;
  return `/${locale}${href}`;
}

const ESTUDIO_LINKS = [
  { label: "Persones",       href: "/persones"       },
  { label: "Principis",      href: "/principis"      },
  { label: "Premis",         href: "/premis"         },
  { label: "Col·laboradors", href: "/collaboradors"  },
];

const MAIN_LINKS = [
  { label: "Mapa",     href: "/mapa"     },
  { label: "Contacte", href: "/contacte" },
];

function LangSelector({ currentLocale, onSwitch }: { currentLocale: string; onSwitch: (l: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em" }}>
      {LOCALES.map((loc, i) => (
        <span key={loc} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={() => onSwitch(loc)} style={{ fontSize: "11px", letterSpacing: "0.08em", fontWeight: currentLocale === loc ? 700 : 400, color: currentLocale === loc ? "#000" : "#aaa", background: "none", border: "none", padding: 0, cursor: "pointer", textTransform: "uppercase" }}>
            {loc}
          </button>
          {i < LOCALES.length - 1 && <span style={{ color: "#ddd" }}>/</span>}
        </span>
      ))}
    </div>
  );
}

export default function Nav({ locale }: { locale: string }) {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const studioTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentLocale = useLocale();
  const pathname      = usePathname();
  const router        = useRouter();

  const cleanPath = pathname.replace(/^\/(es|en)/, "") || "/";
  const isHome    = cleanPath === "/";
  const isArchive = cleanPath.startsWith("/projectes");

  if (isHome) return null;

  function switchLocale(newLocale: string) {
    let newPath = pathname;
    if (currentLocale !== "ca") newPath = pathname.replace(/^\/(es|en)/, "");
    router.push(newLocale === "ca" ? (newPath || "/") : `/${newLocale}${newPath || "/"}`);
    setMenuOpen(false);
  }

  function onStudioEnter() { clearTimeout(studioTimer.current); setStudioOpen(true); }
  function onStudioLeave() { studioTimer.current = setTimeout(() => setStudioOpen(false), 150); }

  const isActive = (href: string) => cleanPath === href || cleanPath.startsWith(href + "/");
  const studioActive = ESTUDIO_LINKS.some(l => isActive(l.href));

  return (
    <>
      <style>{`
        .pu-nav-a { text-decoration: none; white-space: nowrap; }
        .pu-nav-a:hover { color: #000 !important; }
        .pu-studio-item { display: block; padding: 10px 16px; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: #000; text-decoration: none; }
        .pu-studio-item:hover { background: #f7f6f3; }
        @media (min-width: 1024px) { .pu-hide-lg { display: none !important; } }
        @media (max-width: 1023px) { .pu-show-lg { display: none !important; } }
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #1a1a1a", height: "88px", fontFamily: "var(--font-sans)" }}>
        <div style={{ display: "flex", alignItems: "center", height: "100%", padding: "0 32px" }}>

          {/* Logo */}
          <Link href={localizeHref("/", locale)} onClick={() => setMenuOpen(false)} style={{ flexShrink: 0 }}>
            <Image src="/logo-nuevo.png" alt="Peralta Urbanisme" width={360} height={90}
              style={{ width: "clamp(160px, 20vw, 210px)", height: "auto", objectFit: "contain" }} priority />
          </Link>

          {/* Desktop center nav */}
          <div className="pu-show-lg" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "32px" }}>

            {/* Estudio dropdown */}
            <div style={{ position: "relative" }} onMouseEnter={onStudioEnter} onMouseLeave={onStudioLeave}>
              <button className="pu-nav-a" style={{ fontSize: "12px", fontWeight: studioActive ? 700 : 600, letterSpacing: "0.08em", textTransform: "uppercase", color: studioActive ? "#000" : "#777", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                Estudi <span style={{ fontSize: "8px", opacity: 0.6, marginTop: "1px" }}>▾</span>
              </button>
              {studioOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 18px)", left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid #e8e8e8", minWidth: "190px", zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                  {ESTUDIO_LINKS.map(({ label, href }) => (
                    <Link key={href} href={localizeHref(href, locale)} onClick={() => setStudioOpen(false)}
                      className="pu-studio-item" style={{ fontWeight: isActive(href) ? 700 : 400 }}>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {MAIN_LINKS.map(({ label, href }) => (
              <Link key={href} href={localizeHref(href, locale)} className="pu-nav-a"
                style={{ fontSize: "12px", fontWeight: isActive(href) ? 700 : 600, letterSpacing: "0.08em", textTransform: "uppercase", color: isActive(href) ? "#000" : "#777" }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginLeft: "auto" }}>

            {/* Visual | Arxiu switcher — desktop */}
            <div className="pu-show-lg" style={{ display: "flex", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", borderLeft: "1px solid #e8e8e8", paddingLeft: "20px" }}>
              <Link href={localizeHref("/", locale)}
                style={{ padding: "2px 8px", fontWeight: !isArchive ? 700 : 400, color: !isArchive ? "#000" : "#aaa", textDecoration: "none", borderRight: "1px solid #ddd" }}>
                Visual
              </Link>
              <Link href={localizeHref("/projectes", locale)}
                style={{ padding: "2px 8px", fontWeight: isArchive ? 700 : 400, color: isArchive ? "#000" : "#aaa", textDecoration: "none" }}>
                Arxiu
              </Link>
            </div>

            {/* Language — desktop */}
            <div className="pu-show-lg">
              <LangSelector currentLocale={currentLocale} onSwitch={switchLocale} />
            </div>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Menú"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "24px", height: "24px" }}>
              {menuOpen
                ? <span style={{ fontSize: "22px", lineHeight: 1, userSelect: "none" }}>×</span>
                : <span style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span style={{ display: "block", width: "20px", height: "1px", background: "#000" }} />
                    <span style={{ display: "block", width: "20px", height: "1px", background: "#000" }} />
                    <span style={{ display: "block", width: "20px", height: "1px", background: "#000" }} />
                  </span>
              }
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "#fff", paddingTop: "88px", fontFamily: "var(--font-sans)", overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "32px", minHeight: "calc(100vh - 88px)" }}>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#bbb", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>Estudi</span>
              {ESTUDIO_LINKS.map(({ label, href }) => (
                <Link key={href} href={localizeHref(href, locale)} onClick={() => setMenuOpen(false)}
                  style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 650, color: "#000", textDecoration: "none", lineHeight: 1.25, padding: "6px 0" }}>
                  {label}
                </Link>
              ))}
              <div style={{ height: "20px" }} />
              {MAIN_LINKS.map(({ label, href }) => (
                <Link key={href} href={localizeHref(href, locale)} onClick={() => setMenuOpen(false)}
                  style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 650, color: "#000", textDecoration: "none", lineHeight: 1.25, padding: "6px 0" }}>
                  {label}
                </Link>
              ))}
              <div style={{ height: "24px" }} />
              <div style={{ display: "flex", gap: "20px", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                <Link href={localizeHref("/", locale)} onClick={() => setMenuOpen(false)}
                  style={{ color: "#999", textDecoration: "none" }}>Visual</Link>
                <span style={{ color: "#ddd" }}>·</span>
                <Link href={localizeHref("/projectes", locale)} onClick={() => setMenuOpen(false)}
                  style={{ color: "#999", textDecoration: "none" }}>Arxiu</Link>
              </div>
            </nav>
            <div style={{ marginTop: "40px" }}>
              <LangSelector currentLocale={currentLocale} onSwitch={switchLocale} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
