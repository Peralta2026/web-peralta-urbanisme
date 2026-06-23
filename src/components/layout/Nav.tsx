"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Projectes", href: "/projectes" },
  { label: "Equip", href: "/equip" },
  { label: "Intervencions estratègiques", href: "/intervencions" },
  { label: "Contacte", href: "/contacte" },
] as const;

const LOCALES = ["ca", "es", "en"] as const;

function localizeHref(href: string, locale: string): string {
  if (locale === "ca") return href;
  return `/${locale}${href}`;
}

export default function Nav({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const cleanPath = pathname.replace(/^\/(es|en)/, "") || "/";

  function switchLocale(newLocale: string) {
    let newPath = pathname;
    if (currentLocale !== "ca") {
      newPath = pathname.replace(/^\/(es|en)/, "");
    }
    if (newLocale === "ca") {
      router.push(newPath || "/");
    } else {
      router.push(`/${newLocale}${newPath || "/"}`);
    }
    setOpen(false);
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <div className="flex items-center justify-between px-6 h-14">
          {/* Logo */}
          <Link
            href={localizeHref("/", locale)}
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/logo.jpg"
              alt="Peralta Urbanisme"
              width={160}
              height={40}
              style={{ height: "32px", width: "auto", objectFit: "contain" }}
              priority
            />
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Tancar menú" : "Obrir menú"}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 cursor-pointer border-none bg-transparent p-0"
          >
            {open ? (
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
      </nav>

      {/* Menu overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-white border-b border-black pt-14 flex flex-col"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <div className="flex flex-col justify-between flex-1 px-8 py-12">
            {/* Nav links */}
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive =
                  cleanPath === href || cleanPath.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={localizeHref(href, locale)}
                    onClick={() => setOpen(false)}
                    className={`text-3xl leading-tight no-underline transition-none ${
                      isActive
                        ? "text-black font-semibold"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Language switcher */}
            <div
              className="flex items-center gap-4 mt-16"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {LOCALES.map((loc, i) => (
                <span key={loc} className="flex items-center gap-4">
                  <button
                    onClick={() => switchLocale(loc)}
                    className={`text-xs uppercase tracking-widest cursor-pointer border-none bg-transparent p-0 ${
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
