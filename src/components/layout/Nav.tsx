"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const LOCALES = ["ca", "es", "en"] as const;

const MENU = {
  ca: [
    { label: "Projectes", href: "/projectes" },
    { label: "Directori visual", href: "/directori" },
    { label: "Directori territorial", href: "/mapa" },
    { label: "Mètode", href: "/principis" },
    { label: "Persones", href: "/equip" },
    { label: "Contacte", href: "/contacte" },
  ],
  es: [
    { label: "Proyectos", href: "/projectes" },
    { label: "Directorio visual", href: "/directori" },
    { label: "Directorio territorial", href: "/mapa" },
    { label: "Método", href: "/principis" },
    { label: "Personas", href: "/equip" },
    { label: "Contacto", href: "/contacte" },
  ],
  en: [
    { label: "Projects", href: "/projectes" },
    { label: "Visual directory", href: "/directori" },
    { label: "Territorial directory", href: "/mapa" },
    { label: "Method", href: "/principis" },
    { label: "People", href: "/equip" },
    { label: "Contact", href: "/contacte" },
  ],
};

function localizeHref(href: string, locale: string) {
  return `/${locale}${href === "/" ? "" : href}`;
}

function LanguageSelector({ locale, onSwitch }: { locale: string; onSwitch: (locale: string) => void }) {
  return (
    <div className="pu-language-selector" aria-label="Language">
      {LOCALES.map((item, index) => (
        <span key={item}>
          <button type="button" className={locale === item ? "is-active" : ""} onClick={() => onSwitch(item)}>{item}</button>
          {index < LOCALES.length - 1 && <i>/</i>}
        </span>
      ))}
    </div>
  );
}

export default function Nav({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const cleanPath = pathname.replace(/^\/(ca|es|en)/, "") || "/";
  const isHome = cleanPath === "/";
  const links = MENU[locale as keyof typeof MENU] ?? MENU.ca;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const switchLocale = (nextLocale: string) => {
    router.push(localizeHref(cleanPath, nextLocale));
    setOpen(false);
  };

  return (
    <>
      {!isHome && (
        <header className="pu-site-header">
          <Link href={localizeHref("/", locale)} className="pu-header-logo" aria-label="Peralta Urbanisme — Home">
            <Image src="/logo-nuevo.png" alt="Peralta Urbanisme" width={360} height={90} priority />
          </Link>
          <LanguageSelector locale={locale} onSwitch={switchLocale} />
        </header>
      )}

      <button
        type="button"
        className={`pu-profile-trigger ${open ? "is-open" : ""} ${isHome ? "is-home" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Tancar menú" : "Obrir menú"}
        aria-expanded={open}
        aria-controls="pu-main-menu"
      >
        <span />
      </button>

      {open && <button type="button" className="pu-menu-backdrop" onClick={() => setOpen(false)} aria-label="Tancar menú" />}

      <aside id="pu-main-menu" className={`pu-menu-panel ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="pu-menu-top">
          <Link href={localizeHref("/", locale)} onClick={() => setOpen(false)}>
            <Image src="/logo-nuevo.png" alt="Peralta Urbanisme" width={360} height={90} />
          </Link>
        </div>

        <nav className="pu-menu-links" aria-label="Main navigation">
          {links.map((link, index) => {
            const active = cleanPath === link.href || cleanPath.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={localizeHref(link.href, locale)} className={active ? "is-active" : ""} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pu-menu-bottom">
          <LanguageSelector locale={locale} onSwitch={switchLocale} />
        </div>
      </aside>

      <style>{`
        .pu-site-header { position: fixed; inset: 0 0 auto; z-index: 200; height: var(--header-height); padding: 0 var(--margin-page); display: flex; align-items: center; justify-content: space-between; background: var(--color-bg); border-bottom: 1px solid var(--color-border); }
        .pu-header-logo { display: block; width: clamp(184px, 22vw, 240px); transform: translateX(-14%); }
        .pu-header-logo img, .pu-menu-top img { display: block; width: 100%; height: auto; }
        .pu-language-selector { display: flex; align-items: center; gap: 6px; margin-right: 48px; font-family: var(--font-mono); font-size: var(--size-meta); letter-spacing: .08em; text-transform: uppercase; }
        .pu-language-selector span { display: flex; align-items: center; gap: 6px; }
        .pu-language-selector button { border: 0; padding: 0; background: none; color: var(--color-gray-mid); font: inherit; text-transform: inherit; cursor: pointer; }
        .pu-language-selector button.is-active { color: var(--color-fg); font-weight: 700; }
        .pu-language-selector i { color: var(--color-faint); font-style: normal; }
        .pu-profile-trigger { position: fixed; top: 33px; right: var(--margin-page); z-index: 360; width: 22px; height: 22px; padding: 0; border: 0; background: transparent; cursor: pointer; }
        .pu-profile-trigger.is-home { top: 27px; }
        .pu-profile-trigger span { display: block; width: 18px; height: 18px; margin: 2px; border: 1px solid var(--color-fg); border-radius: 50%; background: var(--color-fg); transition: transform var(--dur-mid) var(--ease-smooth), background var(--dur-fast); }
        .pu-profile-trigger:hover span { transform: scale(.82); }
        .pu-profile-trigger.is-open span { background: var(--color-bg); transform: scale(.72); }
        .pu-menu-backdrop { position: fixed; inset: 0; z-index: 320; border: 0; background: rgba(0,0,0,.16); cursor: default; }
        .pu-menu-panel { position: fixed; inset: 0 auto 0 0; z-index: 340; width: 33vw; min-width: 300px; padding: 28px var(--margin-page) 32px; display: flex; flex-direction: column; background: var(--color-bg); transform: translateX(-101%); visibility: hidden; transition: transform var(--dur-slow) var(--ease-smooth), visibility 0s var(--dur-slow); }
        .pu-menu-panel.is-open { transform: translateX(0); visibility: visible; transition-delay: 0s; }
        .pu-menu-top { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 26px; border-bottom: 1px solid var(--color-border); }
        .pu-menu-top a { width: clamp(150px, 15vw, 205px); }
        .pu-menu-top > span, .pu-menu-bottom > span { color: var(--color-muted); font-family: var(--font-mono); font-size: var(--size-label); letter-spacing: .14em; text-transform: uppercase; }
        .pu-menu-links { margin: auto 0; display: flex; flex-direction: column; }
        .pu-menu-links a { display: grid; grid-template-columns: 32px 1fr; align-items: baseline; gap: 12px; padding: 8px 0; color: var(--color-fg); text-decoration: none; }
        .pu-menu-links small { color: var(--color-gray-mid); font-family: var(--font-mono); font-size: 9px; letter-spacing: .08em; }
        .pu-menu-links span { position: relative; width: fit-content; font-family: var(--font-sans); font-size: clamp(30px, 3.2vw, 54px); font-weight: 580; letter-spacing: -.035em; line-height: 1.02; }
        .pu-menu-links span::after { content: ""; position: absolute; left: 0; right: 0; bottom: -3px; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform var(--dur-mid) var(--ease-smooth); }
        .pu-menu-links a:hover span::after, .pu-menu-links a.is-active span::after { transform: scaleX(1); transform-origin: left; }
        .pu-menu-bottom { display: flex; align-items: flex-end; justify-content: space-between; padding-top: 24px; border-top: 1px solid var(--color-border); }
        .pu-menu-bottom .pu-language-selector { margin: 0; }
        @media (max-width: 1024px) {
          .pu-menu-panel { width: 50vw; min-width: 280px; }
        }
        @media (max-width: 768px) {
          .pu-site-header { padding: 0 var(--margin-mobile); }
          .pu-site-header > .pu-language-selector { display: none; }
          .pu-profile-trigger { right: var(--margin-mobile); }
          .pu-menu-panel { width: 88vw; min-width: 0; padding: 24px var(--margin-mobile) 28px; }
          .pu-menu-links span { font-size: clamp(26px, 8vw, 40px); }
        }
        @media (max-width: 480px) {
          .pu-menu-panel { width: 100vw; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pu-menu-panel, .pu-profile-trigger span, .pu-menu-links span::after { transition-duration: 0ms; }
        }
      `}</style>
    </>
  );
}
