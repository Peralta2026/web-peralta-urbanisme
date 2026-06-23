"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Projectes", href: "/projectes" },
  { label: "Directori visual", href: "/directori" },
  { label: "Equip", href: "/equip" },
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
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <div className="flex items-center h-14 px-6 gap-6">

          {/* Logo */}
          <Link
            href={localizeHref("/", locale)}
            className="flex-shrink-0"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/logo.jpg"
              alt="Peralta Urbanisme"
              width={240}
              height={60}
              style={{ height: "40px", width: "auto" }}
              priority
            />
          </Link>

          {/* Desktop nav links — centrats */}
          <div className="hidden lg:flex items-center gap-7 flex-1 justify-center">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = cleanPath === href || cleanPath.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={localizeHref(href, locale)}
                  className={`text-xs uppercase tracking-widest no-underline whitespace-nowrap transition-none ${
                    isActive
                      ? "text-black font-semibold"
                      : "text-gray-500 hover:text-black"
                  }`}
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
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {LOCALES.map((loc, i) => (
                <span key={loc} className="flex items-center gap-2">
                  <button
                    onClick={() => switchLocale(loc)}
                    className={`text-xs uppercase cursor-pointer border-none bg-transparent p-0 ${
                      currentLocale === loc
                        ? "text-black font-semibold"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    {loc}
                  </button>
                  {i < LOCALES.length - 1 && (
                    <span className="text-gray-300 text-xs">/</span>
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
          className="fixed inset-0 z-40 bg-white pt-14 flex flex-col lg:hidden"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <div className="flex flex-col justify-between flex-1 px-8 py-12">
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={localizeHref(href, locale)}
                  onClick={() => setMenuOpen(false)}
                  className="text-2xl no-underline text-black hover:text-gray-400"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div
              className="flex items-center gap-4 mt-16"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {LOCALES.map((loc, i) => (
                <span key={loc} className="flex items-center gap-4">
                  <button
                    onClick={() => switchLocale(loc)}
                    className={`text-xs uppercase cursor-pointer border-none bg-transparent p-0 ${
                      currentLocale === loc
                        ? "text-black font-semibold"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    {loc}
                  </button>
                  {i < LOCALES.length - 1 && (
                    <span className="text-gray-300 text-xs">/</span>
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
