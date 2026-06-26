"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Projectes", href: "/projectes" },
  { label: "Directori visual", href: "/directori" },
  { label: "Persones", href: "/persones" },
  { label: "Intervencions", href: "/intervencions" },
  { label: "Contacte", href: "/contacte" },
] as const;

const LOCALES = ["ca", "es", "en"] as const;

function localizeHref(href: string, locale: string): string {
  if (locale === "ca") return href;
  return `/${locale}${href}`;
}

// ── Components helpers (fora del Nav per evitar re-muntatge a cada render) ──

function LangSelector({
  currentLocale,
  onSwitch,
  small,
}: {
  currentLocale: string;
  onSwitch: (loc: string) => void;
  small?: boolean;
}) {
  return (
    <div
      style={{
        display:       "flex",
        alignItems:    "center",
        gap:           small ? "6px" : "8px",
        fontFamily:    "var(--font-mono)",
        fontSize:      small ? "10px" : "11px",
        letterSpacing: "0.08em",
      }}
    >
      {LOCALES.map((loc, i) => (
        <span key={loc} style={{ display: "flex", alignItems: "center", gap: small ? "6px" : "8px" }}>
          <button
            onClick={() => onSwitch(loc)}
            style={{
              fontSize:      small ? "10px" : "11px",
              letterSpacing: "0.08em",
              fontWeight:    currentLocale === loc ? 700 : 400,
              color:         currentLocale === loc ? "#000" : "#aaa",
              background:    "none",
              border:        "none",
              padding:       0,
              cursor:        "pointer",
              textTransform: "uppercase",
            }}
          >
            {loc}
          </button>
          {i < LOCALES.length - 1 && (
            <span style={{ color: "#ddd", fontSize: small ? "10px" : "11px" }}>/</span>
          )}
        </span>
      ))}
    </div>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  if (open) {
    return <span style={{ fontSize: "20px", lineHeight: 1, userSelect: "none" }}>×</span>;
  }
  return (
    <span style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span style={{ display: "block", width: "20px", height: "1px", background: "#000" }} />
      <span style={{ display: "block", width: "20px", height: "1px", background: "#000" }} />
      <span style={{ display: "block", width: "20px", height: "1px", background: "#000" }} />
    </span>
  );
}

export default function Nav({ locale }: { locale: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const cleanPath = pathname.replace(/^\/(es|en)/, "") || "/";
  const isHome = cleanPath === "/";

  function switchLocale(newLocale: string) {
    let newPath = pathname;
    if (currentLocale !== "ca") newPath = pathname.replace(/^\/(es|en)/, "");
    router.push(newLocale === "ca" ? (newPath || "/") : `/${newLocale}${newPath || "/"}`);
    setMenuOpen(false);
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{
          fontFamily:   "var(--font-sans)",
          height:       "88px",
          borderBottom: isHome ? "none" : "1px solid #1a1a1a",
        }}
      >
        <div
          className="flex items-center h-full"
          style={{ paddingLeft: "32px", paddingRight: "32px" }}
        >
          {/* Logo — més gran a la home */}
          <Link
            href={localizeHref("/", locale)}
            className="flex-shrink-0"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/logo.jpg"
              alt="Peralta Urbanisme"
              width={360}
              height={90}
              style={{
                width:      isHome ? "220px" : "165px",
                height:     "auto",
                marginTop:  "4px",
                objectFit:  "contain",
                transition: "width 0.3s ease",
              }}
              priority
            />
          </Link>

          {/* Desktop nav links — ocults a la home */}
          {!isHome && (
            <div
              className="hidden lg:flex items-center flex-1 justify-center"
              style={{ gap: "34px" }}
            >
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = cleanPath === href || cleanPath.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={localizeHref(href, locale)}
                    className="no-underline whitespace-nowrap"
                    style={{
                      fontSize:      "12px",
                      fontWeight:    isActive ? 700 : 650,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color:         isActive ? "#000" : "#777",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div
            className={isHome ? "" : "flex items-center gap-5"}
            style={{ marginLeft: "auto", display: "flex", alignItems: isHome ? "flex-end" : "center",
                     flexDirection: isHome ? "column" : "row", gap: isHome ? "5px" : "20px" }}
          >
            {/* Idiomes — a la dreta en pàgines normals (desktop), sota el burger a la home */}
            {!isHome && (
              <div className="hidden lg:flex">
                <LangSelector currentLocale={currentLocale} onSwitch={switchLocale} />
              </div>
            )}

            {/* Burger — sempre visible a la home, només mòbil a la resta */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Tancar menú" : "Obrir menú"}
              className={isHome ? "" : "lg:hidden"}
              style={{
                display:    "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width:      24,
                height:     24,
                cursor:     "pointer",
                border:     "none",
                background: "none",
                padding:    0,
              }}
            >
              <HamburgerIcon open={menuOpen} />
            </button>

            {/* Idiomes sota el burger — només a la home */}
            {isHome && <LangSelector currentLocale={currentLocale} onSwitch={switchLocale} small />}
          </div>
        </div>
      </nav>

      {/* Overlay menú — mòbil sempre; a la home també a desktop */}
      {menuOpen && (
        <div
          className={`fixed inset-0 z-40 bg-white flex flex-col ${isHome ? "" : "lg:hidden"}`}
          style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}
        >
          <div className="flex flex-col justify-between flex-1 px-8 py-12">
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={localizeHref(href, locale)}
                  onClick={() => setMenuOpen(false)}
                  className="text-2xl no-underline text-black"
                  style={{ fontWeight: 650 }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div
              className="flex items-center gap-4 mt-16"
              style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em" }}
            >
              {LOCALES.map((loc, i) => (
                <span key={loc} className="flex items-center gap-4">
                  <button
                    onClick={() => switchLocale(loc)}
                    className="uppercase cursor-pointer border-none bg-transparent p-0"
                    style={{
                      fontSize: "11px",
                      color: currentLocale === loc ? "#000" : "#aaa",
                      fontWeight: currentLocale === loc ? 700 : 400,
                    }}
                  >
                    {loc}
                  </button>
                  {i < LOCALES.length - 1 && (
                    <span style={{ color: "#ddd" }}>/</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
