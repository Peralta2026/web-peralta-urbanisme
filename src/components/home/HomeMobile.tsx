"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { NewsItem, Project } from "@/lib/types";
import NewsList from "@/components/news/NewsList";
import { NEWS_LABELS, newsHref, toLoc } from "@/components/news/newsUtils";
import HomeContact from "@/components/home/HomeContact";
import HomeStrip from "@/components/home/HomeStrip";
import { CONTENT, FEATURED_SLUGS, FIELD_LABELS, LangSelector, UI_LABELS, isValid } from "@/components/home/homeShared";

const SETTLE_DELAY_FIRST = 2100;
const SETTLE_DELAY       = 700;

/* ─── Card ───────────────────────────────────────────────────────────────── */

function MobileCard({ project, locale }: { project: Project; locale: string }) {
  const d  = project[locale as "ca" | "es" | "en"];
  const fl = FIELD_LABELS[locale] ?? FIELD_LABELS.ca;
  const [open, setOpen] = useState(false);
  const image = project.images[0] ?? project.coverImage;

  const dataRows = [
    { label: fl.municipi,   value: d.municipality },
    { label: fl.any,        value: d.year },
    { label: fl.ambit,      value: isValid(d.ambitM2)     ? `${d.ambitM2!.toLocaleString("ca-ES")} m²`    : null },
    { label: fl.sostre,     value: isValid(d.sostreM2)    ? `${d.sostreM2!.toLocaleString("ca-ES")} m²st` : null },
    { label: fl.habitatges, value: isValid(d.habitatges)  ? String(d.habitatges)                           : null },
  ].filter(r => isValid(r.value));

  return (
    <article className={`pu-mc${open ? " is-open" : ""}`}>
      <Link href={`/${locale}/projectes/${project.slug}`} className="pu-mc-img" tabIndex={-1}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/projects/${project.slug}/${image}`} alt={d.title} loading="lazy" />
      </Link>
      <div className="pu-mc-body">
        <h3 className="pu-mc-title">{d.title}</h3>
        {d.subtitle && <p className="pu-mc-sub">{d.subtitle}</p>}
        {dataRows.length > 0 && (
          <dl className="pu-mc-data">
            {dataRows.map(r => (
              <div key={r.label}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {d.descriptionShort && (open
          ? <p className="pu-mc-desc">{d.descriptionShort}</p>
          : <button type="button" className="pu-mc-more" onClick={() => setOpen(true)}>+ {fl.readMore}</button>
        )}
        <Link href={`/${locale}/projectes/${project.slug}`} className="pu-mc-link">
          {fl.view} →
        </Link>
      </div>
    </article>
  );
}

// Els darrers fotogrames del vídeo són negres: es reinicia abans
function restartBeforeEnd(e: React.SyntheticEvent<HTMLVideoElement>) {
  const v = e.currentTarget;
  if (v.duration && v.currentTime >= v.duration - 2) {
    v.currentTime = 0;
    v.play().catch(() => {});
  }
}

/* ─── HomeMobile ─────────────────────────────────────────────────────────── */

export default function HomeMobile({ locale, projects, news }: { locale: string; projects: Project[]; news: NewsItem[] }) {
  const content = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.ca;
  const ui      = UI_LABELS[locale] ?? UI_LABELS.ca;
  const featured = useMemo(() => FEATURED_SLUGS
    .map(s => projects.find(p => p.slug === s))
    .filter((p): p is Project => !!p),
  [projects]);

  const [settled, setSettled]   = useState(false);
  const [instant, setInstant]   = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let seen = false;
    let firstVisit = true;
    try {
      seen = sessionStorage.getItem("pu-intro-done") === "1";
      firstVisit = sessionStorage.getItem("pu-intro") !== "1";
    } catch { /* ignore */ }

    const settle = () => {
      setSettled(true);
      try { sessionStorage.setItem("pu-intro-done", "1"); } catch { /* ignore */ }
    };

    if (seen) {
      setInstant(true);
      settle();
    }
    const t = seen ? 0 : window.setTimeout(settle, firstVisit ? SETTLE_DELAY_FIRST : SETTLE_DELAY);

    const onScroll = () => {
      if (window.scrollY > 8) settle();
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const state = `${settled ? " is-settled" : ""}${instant ? " is-instant" : ""}`;

  return (
    <div className={`pu-hm${state}`}>
      {/* ── Franja superior ── */}
      <div className="pu-hm-band">
        <button
          type="button"
          className="pu-hm-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Peralta Urbanisme"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-nuevo.png" alt="Peralta Urbanisme" />
        </button>
      </div>

      {/* ── Hero ── */}
      <section className="pu-hm-hero">
        <div className="pu-hm-lang"><LangSelector locale={locale} /></div>

        <div className="pu-hm-video">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video autoPlay muted playsInline preload="auto" onTimeUpdate={restartBeforeEnd}>
            <source src="/intro.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="pu-hm-initial" aria-hidden={settled}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-nuevo.png" alt="Peralta Urbanisme" />
        </div>

        <div className="pu-hm-text">
          <p className="pu-hm-lead">{content.line1}<br />{content.line2}</p>
          <p className="pu-hm-sub">{content.line3}</p>
          <p className="pu-hm-sub">{content.line4}</p>
          <nav className="pu-hm-links">
            {content.links.map(link => (
              <Link key={link.href} href={`/${locale}${link.href}`}>{link.label}</Link>
            ))}
          </nav>
        </div>

        <div className={`pu-hm-hint${scrolled ? " is-hidden" : ""}`} aria-hidden="true">
          <span />
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
            <path d="M0.5 0.5L4 4.5L7.5 0.5" stroke="rgba(0,0,0,0.42)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* ── Projectes destacats ── */}
      <section className="pu-hm-featured">
        <h2 className="pu-hm-h2">{content.destacats}</h2>
        {featured.length === 0 && <p className="pu-hm-empty">{ui.noResults}</p>}
        <div className="pu-hm-deck" style={{ ["--n" as string]: featured.length }}>
          {featured.map((p, i) => (
            <div key={p.slug} className="pu-hm-slot" style={{ ["--i" as string]: i }}>
              <MobileCard project={p} locale={locale} />
            </div>
          ))}
        </div>
        <div className="pu-hm-explore">
          <Link href={`/${locale}/projectes`}>{ui.explore}</Link>
        </div>
      </section>

      {/* ── Notícies ── */}
      <section className="pu-hm-news">
        <header>
          <h2 className="pu-hm-h2">{NEWS_LABELS[toLoc(locale)].title}</h2>
          <Link href={newsHref(locale)} className="pu-hm-news-all">{NEWS_LABELS[toLoc(locale)].all}</Link>
        </header>
        <NewsList items={news.slice(0, 6)} locale={locale} expandable />
      </section>

      <HomeStrip locale={locale} />

      <HomeContact locale={locale} />

      <style>{`
        .pu-hm { --band: 64px; --slot-step: 7px; background: var(--color-bg); }

        /* La creu del menú s'alinea amb el logo de la franja */
        .pu-profile-trigger.is-home { top: 21px; }

        .pu-hm-band {
          position: fixed; inset: 0 0 auto; z-index: 50;
          height: var(--band);
          background: var(--color-bg);
          pointer-events: none;
        }
        .pu-hm-logo {
          position: absolute; top: calc(var(--band) / 2 - 33px); left: var(--margin-page);
          display: block; padding: 0; border: 0; background: none; cursor: pointer;
          pointer-events: auto;
          opacity: 0;
          transition: opacity 900ms var(--ease-in-out);
        }
        .pu-hm-logo img { display: block; width: 190px; height: auto; margin-left: -24px; mix-blend-mode: multiply; }

        .pu-hm-hero {
          position: relative;
          height: 100vh;
          height: 100svh;
          min-height: 560px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding-top: var(--band);
        }
        .pu-hm-lang {
          position: absolute; z-index: 60;
          top: calc(var(--band) / 2 - 11px);
          right: calc(var(--margin-page) + 38px);
          height: 22px; display: flex; align-items: center;
        }
        .pu-hm-video {
          flex: 1;
          min-height: 160px;
          margin-bottom: 20px;
          opacity: 0;
          transition: opacity 1100ms var(--ease-in-out);
        }
        /* El dibuix del vídeo ocupa la meitat dreta del fotograma */
        .pu-hm-video video { width: 100%; height: 100%; object-fit: cover; object-position: 70% 50%; display: block; background: var(--color-bg); }

        .pu-hm-initial {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
          transition: opacity 900ms var(--ease-in-out);
        }
        .pu-hm-initial img { width: clamp(280px, 40vw, 560px); height: auto; mix-blend-mode: multiply; }

        .pu-hm-text {
          flex-shrink: 0;
          padding: 0 var(--margin-page) calc(64px + env(safe-area-inset-bottom));
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 900ms var(--ease-in-out) 200ms, transform 900ms var(--ease-smooth) 200ms;
        }
        .pu-hm-lead {
          font-family: var(--font-sans);
          font-size: clamp(22px, 6.4vw, 30px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: #000;
          margin: 0 0 18px;
          text-wrap: balance;
        }
        .pu-hm-sub {
          font-family: var(--font-sans);
          font-size: 15px;
          line-height: 1.4;
          color: #111;
          margin: 0 0 4px;
          max-width: 30em;
        }
        .pu-hm-links { display: flex; gap: 28px; margin-top: 22px; }
        .pu-hm-links a {
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          font-weight: 600;
          color: #000;
          text-decoration: none;
          padding: 6px 0;
        }

        .pu-hm-hint {
          position: absolute; left: 50%; bottom: calc(18px + env(safe-area-inset-bottom));
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 600ms ease;
        }
        .pu-hm-hint span { display: block; width: 1px; height: 24px; background: rgba(0,0,0,0.42); }
        .pu-hm-hint > * { animation: pu-hm-hint 2.4s ease-in-out infinite; }
        @keyframes pu-hm-hint { 0%,100% { transform: translateY(0); } 55% { transform: translateY(6px); } }

        .pu-hm.is-settled .pu-hm-logo,
        .pu-hm.is-settled .pu-hm-video,
        .pu-hm.is-settled .pu-hm-text { opacity: 1; transform: none; }
        .pu-hm.is-settled .pu-hm-hint { opacity: 1; transition-delay: 900ms; }
        .pu-hm.is-settled .pu-hm-hint.is-hidden { opacity: 0; transition-delay: 0ms; }
        .pu-hm.is-settled .pu-hm-initial { opacity: 0; }
        .pu-hm.is-instant .pu-hm-hero *, .pu-hm.is-instant .pu-hm-logo { transition-duration: 0ms !important; transition-delay: 0ms !important; }

        .pu-hm-h2 {
          font-family: var(--font-sans);
          font-size: clamp(28px, 8vw, 36px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #000;
          margin: 0;
        }

        /* ── Projectes destacats: baralla de cartes enganxoses ── */
        .pu-hm-featured { padding: 40px var(--margin-page) 0; }
        .pu-hm-featured > .pu-hm-h2 {
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          margin-bottom: 16px;
        }
        .pu-hm-empty { font-family: var(--font-sans); font-size: var(--size-meta); color: #bbb; }
        .pu-hm-slot {
          position: sticky;
          top: calc(var(--band) + var(--i) * var(--slot-step));
          height: calc(100svh - var(--band) - var(--n) * var(--slot-step) - 12px);
          min-height: 480px;
          padding-bottom: 12px;
          margin-bottom: 0;
        }
        .pu-hm-slot + .pu-hm-slot { margin-top: 18vh; }

        .pu-mc {
          height: 100%;
          display: flex; flex-direction: column;
          background: var(--color-bg);
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 8px;
          overflow: hidden;
        }
        .pu-mc-img {
          display: block;
          flex: 0 0 52%;
          overflow: hidden;
          background: var(--color-gray-light);
          transition: flex-basis 500ms var(--ease-smooth);
        }
        .pu-mc.is-open .pu-mc-img { flex-basis: 26%; }
        .pu-mc-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pu-mc-body {
          flex: 1; min-height: 0;
          display: flex; flex-direction: column;
          padding: 20px 20px 18px;
          border-top: 1px solid rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .pu-mc.is-open .pu-mc-body { overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
        .pu-mc-title {
          font-family: var(--font-sans);
          font-size: 23px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: #000;
          margin: 0 0 6px;
          text-wrap: balance;
        }
        .pu-mc-sub {
          font-family: var(--font-sans);
          font-size: 13px;
          font-style: italic;
          line-height: 1.3;
          color: #777;
          margin: 0;
        }
        .pu-mc-data { margin: 16px 0 0; display: flex; flex-direction: column; gap: 3px; }
        .pu-mc-data > div { display: flex; gap: 14px; align-items: baseline; }
        .pu-mc-data dt {
          min-width: 86px; flex-shrink: 0;
          font-family: var(--font-sans); font-size: var(--size-meta); color: #aaa;
        }
        .pu-mc-data dd {
          margin: 0;
          font-family: var(--font-sans); font-size: var(--size-meta); color: #111;
          font-variant-numeric: tabular-nums;
        }
        .pu-mc-more {
          align-self: flex-start;
          margin-top: 14px;
          padding: 4px 0 2px;
          border: 0; border-bottom: 1px solid #ccc;
          background: none; cursor: pointer;
          font-family: var(--font-sans); font-size: 12px; color: #888;
        }
        .pu-mc-desc {
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.6;
          color: #444;
          margin: 16px 0 0;
          animation: pu-mc-in 400ms ease;
        }
        @keyframes pu-mc-in { from { opacity: 0; } to { opacity: 1; } }
        .pu-mc-link {
          align-self: flex-start;
          margin-top: auto;
          padding-top: 16px;
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          font-weight: 700;
          color: #000;
          text-decoration: none;
        }
        .pu-mc-link::after { content: ""; display: block; height: 1.5px; margin-top: 3px; background: #000; }

        .pu-hm-explore {
          display: flex; justify-content: center;
          padding: 28px 0 8px;
        }
        .pu-hm-explore a {
          display: inline-block; background: #000; color: #fff;
          font-family: var(--font-sans); font-size: 13px; font-weight: 500;
          letter-spacing: 0.01em; padding: 12px 26px; border-radius: 100px;
          text-decoration: none;
        }

        /* ── Notícies ── */
        .pu-hm-news { padding: 72px var(--margin-page) 56px; }
        .pu-hm-news > header {
          display: flex; justify-content: space-between; align-items: flex-end; gap: 16px;
          margin-bottom: 28px;
        }
        .pu-hm-news-all {
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          color: #000;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
          white-space: nowrap;
          padding-bottom: 3px;
        }

        @media (orientation: landscape) and (max-height: 500px) {
          .pu-hm-hero { flex-direction: row-reverse; align-items: flex-end; }
          .pu-hm-text { padding-bottom: 20px; width: 55%; }
          .pu-hm-video { align-self: stretch; margin: 0 var(--margin-page) 16px 0; }
          .pu-hm-hint { display: none; }
          .pu-hm-slot { height: calc(100svh - var(--band) - 12px); min-height: 0; }
          .pu-mc { flex-direction: row; }
          .pu-mc-img { flex-basis: 45%; }
          .pu-mc-body { border-top: 0; border-left: 1px solid rgba(0,0,0,0.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pu-hm * { transition-duration: 0ms !important; animation: none !important; }
        }
      `}</style>
    </div>
  );
}
