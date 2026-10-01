"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { FIELD_LABELS, isValid } from "@/components/home/homeShared";

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

/* ─── Deck ───────────────────────────────────────────────────────────────── */

/**
 * Targetes de projecte a alçada de pantalla que s'apilen en fer scroll
 * (Projectes destacats de la home mòbil i vista Sintètic en mòbil).
 * `top` és l'alçada de la franja fixa superior.
 */
export default function MobileCardDeck({ projects, locale, top }: { projects: Project[]; locale: string; top: string }) {
  return (
    <div className="pu-deck" style={{ ["--band" as string]: top, ["--n" as string]: Math.min(projects.length, 6) }}>
      {projects.map((p, i) => (
        <div key={p.slug} className="pu-hm-slot" style={{ ["--i" as string]: Math.min(i, 5) }}>
          <MobileCard project={p} locale={locale} />
        </div>
      ))}
      <style>{`
        .pu-deck { --slot-step: 7px; }
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
        @media (orientation: landscape) and (max-height: 500px) {
          .pu-hm-slot { height: calc(100svh - var(--band) - 12px); min-height: 0; }
          .pu-mc { flex-direction: row; }
          .pu-mc-img { flex-basis: 45%; }
          .pu-mc-body { border-top: 0; border-left: 1px solid rgba(0,0,0,0.08); }
        }
      `}</style>
    </div>
  );
}
