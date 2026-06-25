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

export default function Nav({ locale }: { locale: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const cleanPath = pathname.replace(/^\/(es|en)/, "") || "/";

  function switchLocale(newLocale: string) {
    let newPath = pathname;
    if (currentLocale !== "ca") newPath = pathname.replace(/^\/(es|en)/, "");
    router.push(newLocale === "ca" ? (newPath || "/") : `/${newLocale}${newPath || "/"}`);
    setMenuOpen(false);
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#1a1a1a]"
        style={{ fontFamily: "var(--font-sans)", height: "88px" }}
      >
        <div
          className="flex items-center h-full"
          style={{ paddingLeft: "32px", paddingRight: "32px" }}
        >
          {/* Logo */}
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
              style={{ width: "165px", height: "auto", marginTop: "4px", objectFit: "contain" }}
              priority
            />
          </Link>

          {/* Desktop nav links — centrats */}
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
                  className="no-underline whitespace-nowrap transition-none"
                  style={{
                    fontSize: "12px",
                    fontWeight: isActive ? 700 : 650,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: isActive ? "#000" : "#777",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right: language + hamburger */}
          <div className="flex items-center gap-5 ml-auto">
            {/* Language — desktop */}
            <div
              className="hidden lg:flex items-center gap-2"
              style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em" }}
            >
              {LOCALES.map((loc, i) => (
                <span key={loc} className="flex items-center gap-2">
                  <button
                    onClick={() => switchLocale(loc)}
                    className="uppercase cursor-pointer border-none bg-transparent p-0"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      fontWeight: currentLocale === loc ? 700 : 400,
                      color: currentLocale === loc ? "#000" : "#aaa",
                    }}
                  >
                    {loc}
                  </button>
                  {i < LOCALES.length - 1 && (
                    <span style={{ color: "#ddd", fontSize: "11px" }}>/</span>
                  )}
                </span>
              ))}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Tancar menú" : "Obrir menú"}
              className="lg:hidden flex flex-col justify-center gap-1.5 w-6 h-6 cursor-pointer border-none bg-transparent p-0"
            >
              {menuOpen ? (
                <span className="text-xl leading-none select-none">×</span>
              ) : (
                <>
                  <span className="block w-5 h-px bg-black" />
                  <span className="block w-5 h-px bg-black" />
                  <span className="block w-5 h-px bg-black" />
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-white flex flex-col lg:hidden"
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
