"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { key: "projectes", href: "/projectes" },
  { key: "equip", href: "/equip" },
  { key: "intervencions", href: "/intervencions" },
  { key: "contacte", href: "/contacte" },
] as const;

const LOCALES = ["ca", "es", "en"] as const;

function localizeHref(href: string, locale: string): string {
  if (locale === "ca") return href;
  return `/${locale}${href}`;
}

export default function Nav({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // Detect active page by stripping locale prefix
  const cleanPath = pathname.replace(/^\/(es|en)/, "") || "/";

  function switchLocale(newLocale: string) {
    // Replace locale prefix in current path
    let newPath = pathname;
    if (currentLocale !== "ca") {
      newPath = pathname.replace(/^\/(es|en)/, "");
    }
    if (newLocale === "ca") {
      router.push(newPath || "/");
    } else {
      router.push(`/${newLocale}${newPath || "/"}`);
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div className="flex items-center justify-between px-6 h-12">
        {/* Brand */}
        <Link
          href={localizeHref("/", locale)}
          className="font-bold text-sm uppercase tracking-widest text-black no-underline"
        >
          Peralta Urbanisme
        </Link>

        {/* Page links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ key, href }) => {
            const isActive =
              cleanPath === href || cleanPath.startsWith(href + "/");
            return (
              <Link
                key={key}
                href={localizeHref(href, locale)}
                className={`text-xs uppercase tracking-widest no-underline transition-none ${
                  isActive
                    ? "text-black font-semibold border-b border-black pb-0.5"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
        </div>

        {/* Language switcher */}
        <div className="flex items-center gap-3">
          {LOCALES.map((loc, i) => (
            <span key={loc} className="flex items-center gap-3">
              <button
                onClick={() => switchLocale(loc)}
                className={`text-xs uppercase tracking-widest cursor-pointer border-none bg-none p-0 ${
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
    </nav>
  );
}
