"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import type { NewsItem } from "@/lib/types";
import { NEWS_LABELS, newsDate, newsHref, toLoc } from "./newsUtils";

export { NEWS_LABELS, newsDate, newsHref, toLoc };

/* ── Cards ────────────────────────────────────────────────────────────────── */

function NewsCard({ item, index, locale }: { item: NewsItem; index: number; locale: string }) {
  const t = item[toLoc(locale)];
  return (
    <Link href={newsHref(locale, item.slug)} className="pu-mag-item" style={{ order: index * 2 }}>
      {item.coverImage && (
        <span className={`pu-mag-img${item.coverFit === "contain" ? " pu-mag-img--contain" : ""}`}>
          <img src={item.coverImage} alt="" loading="lazy" />
        </span>
      )}
      <span className="pu-mag-meta">
        <span className="pu-mag-date">{newsDate(item, locale)}</span>
        <span className="pu-mag-tag">{t.tag}</span>
      </span>
      <span className="pu-mag-title">{t.title}</span>
      <span className="pu-mag-summary">{t.summary}</span>
    </Link>
  );
}

function ExpandableCard({
  item, index, locale, open, onToggle,
}: { item: NewsItem; index: number; locale: string; open: boolean; onToggle: () => void }) {
  const t = item[toLoc(locale)];
  return (
    <div
      role="button"
      tabIndex={0}
      className={`pu-mag-item${open ? " pu-mag-item--open" : ""}`}
      data-news-slug={item.slug}
      style={{ order: index * 2, cursor: "pointer", userSelect: "none" }}
      onClick={onToggle}
      onKeyDown={(e) => e.key === "Enter" && onToggle()}
    >
      {item.coverImage && (
        <span className={`pu-mag-img${item.coverFit === "contain" ? " pu-mag-img--contain" : ""}`}>
          <img src={item.coverImage} alt="" loading="lazy" />
        </span>
      )}
      <span className="pu-mag-meta">
        <span className="pu-mag-date">{newsDate(item, locale)}</span>
        <span className="pu-mag-tag">{t.tag}</span>
      </span>
      <span className="pu-mag-title">{t.title}</span>
      <span className="pu-mag-summary">{t.summary}</span>
    </div>
  );
}

/* ── Expanded inline panel ────────────────────────────────────────────────── */

function ExpandedPanel({ item, locale, onClose, inline, order }: { item: NewsItem; locale: string; onClose: () => void; inline?: boolean; order?: number }) {
  const loc    = toLoc(locale);
  const t      = item[loc];
  const labels = NEWS_LABELS[loc];
  const hasImg = item.images.length > 0;
  const hasFacts = !!(t.credits || (item.sources && item.sources.length > 0));

  return (
    <div className={`pu-mag-panel${inline ? " pu-mag-panel--inline" : " pu-mag-panel--below"}`} style={inline ? { order } : undefined}>
      {/* header row: meta + close */}
      <div className="pu-mag-panel-topbar">
        <span className="pu-mag-panel-meta">{newsDate(item, locale)} · {t.tag}</span>
        <button className="pu-mag-panel-close" onClick={onClose} aria-label="Tancar">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className={`pu-mag-panel-grid${hasImg ? "" : " pu-mag-panel-grid--text"}`}>
        {/* text column */}
        <div className="pu-mag-panel-text">
          <h2 className="pu-mag-panel-title">{t.title}</h2>
          <p className="pu-mag-panel-lead">{t.summary}</p>
          {t.body.map((para, i) => (
            <p key={i} className="pu-mag-panel-para">{para}</p>
          ))}

          {hasFacts && (
            <dl className="pu-mag-panel-facts">
              {t.credits && (
                <div>
                  <dt>{labels.credits}</dt>
                  <dd>{t.credits}</dd>
                </div>
              )}
              {item.sources && item.sources.length > 0 && (
                <div>
                  <dt>{labels.sources}</dt>
                  <dd>
                    {item.sources.map((s) => (
                      <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="pu-mag-panel-link">
                        {s.label} ↗
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>

        {/* images column */}
        {hasImg && (
          <div className="pu-mag-panel-imgs">
            {item.images.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" loading="lazy" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── NewsList ─────────────────────────────────────────────────────────────── */

/**
 * Maqueta de revista: tres columnes separades per filets verticals.
 * `expandable` (home page): clic expandeix contingut inline; sense navegar a nova pàgina.
 */
export default function NewsList({
  items, locale, expandable,
}: { items: NewsItem[]; locale: string; expandable?: boolean }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggle = (slug: string) => setOpenSlug(p => p === slug ? null : slug);
  const openItem = expandable && openSlug ? (items.find(i => i.slug === openSlug) ?? null) : null;

  // En una sola columna la notícia s'obre al seu lloc: es porta a dalt de la pantalla
  useEffect(() => {
    if (!openSlug || !window.matchMedia("(max-width: 860px)").matches) return;
    const el = document.querySelector<HTMLElement>(`[data-news-slug="${openSlug}"]`);
    if (!el) return;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 64;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - Math.min(header, 72) - 8, behavior: "smooth" });
  }, [openSlug]);

  const columns: { item: NewsItem; index: number }[][] = [[], [], []];
  items.forEach((item, index) => columns[index % 3].push({ item, index }));

  return (
    <div>
      <div className="pu-mag">
        {columns.map((col, c) => (
          <div key={c} className="pu-mag-col">
            {col.map(({ item, index }) => expandable
              ? (
                <Fragment key={item.slug}>
                  <ExpandableCard item={item} index={index} locale={locale} open={openSlug === item.slug} onToggle={() => toggle(item.slug)} />
                  {openItem?.slug === item.slug && (
                    <ExpandedPanel item={item} locale={locale} onClose={() => setOpenSlug(null)} inline order={index * 2 + 1} />
                  )}
                </Fragment>
              )
              : <NewsCard key={item.slug} item={item} index={index} locale={locale} />
            )}
          </div>
        ))}

        <style>{`
          .pu-mag {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            border-top: 1px solid var(--color-border);
          }
          .pu-mag-col {
            display: flex;
            flex-direction: column;
            padding: 0 clamp(24px, 3vw, 48px);
          }
          .pu-mag-col:first-child { padding-left: 0; }
          .pu-mag-col:last-child  { padding-right: 0; }
          .pu-mag-col + .pu-mag-col { border-left: 1px solid var(--color-border); }

          .pu-mag-item {
            display: flex;
            flex-direction: column;
            padding: clamp(32px, 4.5vh, 52px) 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.12);
            color: var(--color-fg);
            text-decoration: none;
            transition: opacity var(--dur-fast) ease;
            outline: none;
          }
          .pu-mag-col .pu-mag-item:last-child { border-bottom: none; }
          .pu-mag-item:hover { opacity: 0.6; }
          .pu-mag-item--open { opacity: 1 !important; }

          .pu-mag-img {
            display: block;
            aspect-ratio: 4 / 3;
            overflow: hidden;
            margin-bottom: 24px;
            background: var(--color-gray-light);
          }
          .pu-mag-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            filter: grayscale(1);
            transition: filter 340ms ease;
          }
          .pu-mag-item:hover .pu-mag-img img { filter: grayscale(0) saturate(1.35); }
          .pu-mag-img--contain { background: #fff; }
          .pu-mag-img--contain img { object-fit: contain; }

          .pu-mag-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 4px 14px;
            margin-bottom: 14px;
            font-family: var(--font-sans);
            font-size: 12px;
            line-height: 1.4;
            font-variant-numeric: tabular-nums;
          }
          .pu-mag-date { color: var(--color-fg); font-weight: 600; }
          .pu-mag-tag  { color: var(--color-muted); }

          .pu-mag-title {
            font-family: var(--font-sans);
            font-size: clamp(21px, 1.75vw, 27px);
            font-weight: 700;
            letter-spacing: -0.03em;
            line-height: 1.12;
            text-wrap: balance;
            margin-bottom: 14px;
          }
          .pu-mag-summary {
            font-family: var(--font-sans);
            font-size: 14.5px;
            line-height: 1.6;
            color: #555;
            max-width: 36em;
          }

          .pu-mag-panel--inline { display: none; }
          @media (max-width: 860px) {
            .pu-mag-panel.pu-mag-panel--inline { display: block; border-top: 0; padding-bottom: 8px; }
            .pu-mag-panel--inline .pu-mag-panel-meta,
            .pu-mag-panel--inline .pu-mag-panel-title,
            .pu-mag-panel--inline .pu-mag-panel-lead { display: none; }
            .pu-mag-panel--inline .pu-mag-panel-topbar { padding-top: 0; margin: 0 0 12px; justify-content: flex-end; }
            .pu-mag-panel--inline .pu-mag-panel-grid { border-bottom: 1px solid rgba(0,0,0,0.12); margin-bottom: 0; }
            .pu-mag-panel--below { display: none; }
            .pu-mag .pu-mag-item--open { border-bottom: 0 !important; padding-bottom: 16px; }
            .pu-mag { display: flex; flex-direction: column; }
            .pu-mag-col { display: contents; }
            .pu-mag-item { border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important; }
          }
        `}</style>
      </div>

      {/* Expanded panel — outside the 3-col grid, full-width below */}
      {openItem && <ExpandedPanel item={openItem} locale={locale} onClose={() => setOpenSlug(null)} />}

      <style>{`
        @keyframes pu-panel-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pu-mag-panel {
          border-top: 1px solid var(--color-border);
          animation: pu-panel-in 220ms ease;
          font-family: var(--font-sans);
        }
        .pu-mag-panel-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(24px,3.5vh,40px) 0 0;
          margin-bottom: clamp(20px,3vh,32px);
        }
        .pu-mag-panel-meta {
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          color: var(--color-muted);
          font-variant-numeric: tabular-nums;
        }
        .pu-mag-panel-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid rgba(0,0,0,0.14);
          border-radius: 50%;
          background: none;
          cursor: pointer;
          color: #888;
          transition: color 160ms ease, border-color 160ms ease;
          flex-shrink: 0;
        }
        .pu-mag-panel-close:hover { color: #000; border-color: #000; }

        .pu-mag-panel-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          align-items: start;
          border-bottom: 1px solid var(--color-border);
          margin-bottom: clamp(40px,6vh,72px);
        }
        .pu-mag-panel-grid--text { grid-template-columns: 1fr; }

        .pu-mag-panel-text {
          padding: 0 clamp(32px,4vw,64px) clamp(40px,6vh,64px) 0;
        }
        .pu-mag-panel-grid--text .pu-mag-panel-text {
          padding-right: 0;
          max-width: 720px;
        }

        .pu-mag-panel-title {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: clamp(26px,2.4vw,40px);
          letter-spacing: -0.035em;
          line-height: 1.04;
          color: #000;
          margin: 0 0 clamp(20px,3vh,32px);
          max-width: 20em;
          text-wrap: balance;
        }
        .pu-mag-panel-lead {
          font-size: clamp(16px,1.4vw,20px);
          line-height: 1.5;
          letter-spacing: -0.01em;
          color: #000;
          margin: 0 0 22px;
        }
        .pu-mag-panel-para {
          font-size: var(--size-body);
          line-height: 1.7;
          color: #444;
          margin: 0 0 16px;
        }

        .pu-mag-panel-facts {
          margin: 24px 0 0;
          border-top: 1px solid var(--color-border);
        }
        .pu-mag-panel-facts > div {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .pu-mag-panel-facts dt {
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          color: var(--color-muted);
          padding-top: 2px;
        }
        .pu-mag-panel-facts dd {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 14px;
          line-height: 1.5;
          color: #222;
        }
        .pu-mag-panel-link {
          color: #000;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-mag-panel-link:hover { opacity: 0.5; }

        .pu-mag-panel-imgs {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--color-border);
          border-left: 1px solid var(--color-border);
        }
        .pu-mag-panel-imgs img {
          display: block;
          width: 100%;
          height: auto;
          background: var(--color-bg);
        }

        @media (max-width: 768px) {
          .pu-mag-panel-grid { grid-template-columns: 1fr; }
          .pu-mag-panel-text { padding-right: 0; }
          .pu-mag-panel-imgs {
            border-left: none;
            border-top: 1px solid var(--color-border);
          }
          .pu-mag-panel-facts > div { grid-template-columns: 1fr; gap: 6px; }
        }
      `}</style>
    </div>
  );
}
