"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { FILTER_UI } from "./ProjectFilterPanel";

export type ArchiveView = "arxiu" | "visual" | "territorial" | "sintetic";

const VIEWS: { key: ArchiveView; label: string; href: string }[] = [
  { key: "arxiu",       label: "ARXIU",       href: "/projectes" },
  { key: "visual",      label: "VISUAL",      href: "/directori" },
  { key: "territorial", label: "TERRITORIAL", href: "/mapa"      },
  { key: "sintetic",    label: "SINTÈTIC",    href: "/sintetic"  },
];

const HINT_KEY = "pu-filter-hint";

/**
 * Navegació comuna de les quatre vistes de l'arxiu. En mòbil el botó de
 * filtres porta el text "Filtres" i, la primera vegada de la sessió, fa un
 * petit gest perquè es vegi que s'obre un panell.
 */
export default function ArchiveNav({
  locale, active, filtersOpen, onToggleFilters, activeCount = 0,
}: {
  locale: string;
  active: ArchiveView;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  activeCount?: number;
}) {
  const ui = FILTER_UI[(locale as Locale) in FILTER_UI ? (locale as Locale) : "ca"];
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (!onToggleFilters) return;
    try {
      if (sessionStorage.getItem(HINT_KEY) === "1") return;
      sessionStorage.setItem(HINT_KEY, "1");
    } catch { return; }
    setHint(true);
    const t = window.setTimeout(() => setHint(false), 3200);
    return () => window.clearTimeout(t);
  }, [onToggleFilters]);

  return (
    <nav className="pu-anav" aria-label="Arxiu">
      {VIEWS.map(v => v.key === active
        ? <span key={v.key} className="pu-anav-item is-active" aria-current="page">{v.label}</span>
        : <Link key={v.key} href={`/${locale}${v.href}`} className="pu-anav-item">{v.label}</Link>
      )}
      {onToggleFilters && (
        <button
          type="button"
          className={`pu-anav-filters${filtersOpen ? " is-open" : ""}${hint ? " is-hinting" : ""}`}
          onClick={onToggleFilters}
          aria-expanded={!!filtersOpen}
          title={filtersOpen ? ui.close : ui.filters}
        >
          <span className="pu-anav-filters-label">
            {ui.filters}{activeCount > 0 && <span className="pu-anav-count"> · {activeCount}</span>}
          </span>
          <span className="pu-anav-arrows" aria-hidden="true">{filtersOpen ? "‹‹" : "»»"}</span>
        </button>
      )}

      <style>{`
        .pu-anav {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: clamp(14px, 2.2vw, 32px);
          font-family: var(--font-sans);
        }
        .pu-anav-item {
          font-family: var(--font-sans);
          font-size: clamp(32px, 4vw, 60px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #bbb;
          text-decoration: none;
          transition: color 200ms ease;
        }
        a.pu-anav-item:hover { color: #555; }
        .pu-anav-item.is-active { color: #000; }

        .pu-anav-filters {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          margin-left: 4px;
          padding: 0 0 4px;
          border: 0;
          background: none;
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 12px;
          line-height: 1;
          color: #ccc;
          transition: color 200ms ease;
        }
        .pu-anav-filters:hover, .pu-anav-filters.is-open { color: #999; }
        .pu-anav-filters-label { display: none; }
        .pu-anav-arrows { display: inline-block; letter-spacing: -0.02em; }

        @keyframes pu-anav-nudge {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(5px); }
          40%      { transform: translateX(0); }
          60%      { transform: translateX(5px); }
          80%      { transform: translateX(0); }
        }

        @media (max-width: 768px) {
          .pu-anav { gap: 8px 12px; align-items: baseline; }
          .pu-anav-item { font-size: clamp(15px, 4vw, 20px); letter-spacing: -0.02em; }
          .pu-anav-filters {
            margin-left: auto;
            padding: 8px 0 8px 8px;
            margin-top: -8px; margin-bottom: -8px;
            font-size: var(--size-meta);
            color: #000;
          }
          .pu-anav-filters-label { display: inline; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; }
          .pu-anav-count { font-variant-numeric: tabular-nums; }
          .pu-anav-filters.is-open { color: #999; }
          .pu-anav-filters.is-hinting .pu-anav-arrows { animation: pu-anav-nudge 1400ms var(--ease-in-out) 700ms 2; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pu-anav-filters .pu-anav-arrows { animation: none !important; }
        }
      `}</style>
    </nav>
  );
}
