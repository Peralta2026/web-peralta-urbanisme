"use client";

import { useState } from "react";
import type { TeamMember, Locale } from "@/lib/types";

const MEMBER_ORDER = [
  "jordi-peralta",
  "marc-vizcarra",
  "mar-castarlenas",
  "delfina-capiglioni",
  "julia-renones",
];

const CLOSE_LABEL: Record<Locale, string> = { ca: "Tancar", es: "Cerrar", en: "Close" };

/* ─── Mòbil: fila de miniatures + fitxa ampliada a sota ─────────────────── */

function MobilePeople({ members, locale, active, onToggle }: {
  members: TeamMember[];
  locale: Locale;
  active: string | null;
  onToggle: (slug: string) => void;
}) {
  const current = members.find(m => m.slug === active);
  const data = current?.[locale];
  return (
    <div className={`pu-pm${current ? " has-active" : ""}`}>
      <div className="pu-pm-row">
        {members.map(m => (
          <button
            key={m.slug}
            type="button"
            className={`pu-pm-thumb${m.slug === active ? " is-active" : ""}`}
            onClick={() => onToggle(m.slug)}
            aria-expanded={m.slug === active}
          >
            <span className="pu-pm-thumb-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/team/${m.photo}`} alt="" />
            </span>
            <span className="pu-pm-thumb-name">
              <span>{m[locale].name.split(" ")[0]}</span>
              <span>{m[locale].name.split(" ").slice(1).join(" ")}</span>
            </span>
          </button>
        ))}
      </div>

      {current && data && (
        <article className="pu-pm-detail" key={current.slug}>
          <div className="pu-pm-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/team/${current.photo}`} alt={data.name} />
          </div>
          <div className="pu-pm-head">
            <div>
              <h3 className="pu-pm-name">{data.name}</h3>
              <p className="pu-pm-role">{data.role}</p>
            </div>
            <button type="button" className="pu-pm-close" onClick={() => onToggle(current.slug)} aria-label={CLOSE_LABEL[locale]}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.3" />
                <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
          </div>
          <p className="pu-pm-text">{data.bioLong}</p>
        </article>
      )}
    </div>
  );
}

interface Props {
  members: TeamMember[];
  locale:  Locale;
}

export default function PersonRow({ members, locale }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const ordered = MEMBER_ORDER
    .map(slug => members.find(m => m.slug === slug))
    .filter((m): m is TeamMember => !!m);

  const toggle = (slug: string) =>
    setActive(prev => (prev === slug ? null : slug));

  return (
    <>
      <MobilePeople members={ordered} locale={locale} active={active} onToggle={toggle} />
      <div className="pu-person-grid">
        {ordered.map(member => {
          const isActive = active === member.slug;
          const data     = member[locale];

          return (
            <div
              key={member.slug}
              className={`pu-person-item${isActive ? " pu-person-item--active" : ""}`}
            >
              {/* ── Foto ── */}
              <div
                className="pu-person-photo-wrap"
                onClick={() => toggle(member.slug)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/team/${member.photo}`}
                  alt={data.name}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  className="pu-person-photo"
                />
                <button
                  onClick={e => { e.stopPropagation(); toggle(member.slug); }}
                  aria-expanded={isActive}
                  aria-label={isActive ? "Tancar bio" : "Llegir bio"}
                  className={`pu-person-btn${isActive ? " pu-person-btn--open" : ""}`}
                >
                  +
                </button>
              </div>

              {/* ── Text expandit (escriptori: al costat) ── */}
              <div className="pu-person-bio">
                <h3 className="pu-person-name">{data.name}</h3>
                <p className="pu-person-role">{data.role}</p>
                <p className="pu-person-text">{data.bioLong}</p>
              </div>

              {/* ── Peu: nom + rol (sempre visible a sota) ── */}
              <div className="pu-person-foot">
                <p className="pu-person-foot-name">{data.name}</p>
                <p className="pu-person-foot-role">{data.role}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        /* ── Grid: 5 columnes d'amplada igual ── */
        .pu-person-grid {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .pu-person-item {
          flex: 1 1 0;
          min-width: 0;
          transition: flex 0.55s cubic-bezier(0.22,1,0.36,1);
          display: flex;
          flex-direction: column;
        }
        .pu-person-item--active {
          flex: 4 1 0;
        }

        /* ── Foto ── */
        .pu-person-photo-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 260 / 344;
          overflow: hidden;
          background: #c8c8c8;
          cursor: pointer;
          flex-shrink: 0;
        }
        .pu-person-item--active .pu-person-photo-wrap {
          width: clamp(140px, 14vw, 190px);
        }
        .pu-person-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          filter: grayscale(100%);
          display: block;
        }

        /* Botó + */
        .pu-person-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border: 1px solid rgba(255,255,255,0.65);
          border-radius: 50%;
          background: rgba(0,0,0,0.28);
          color: #fff;
          font-size: 16px;
          font-weight: 300;
          font-family: var(--font-sans);
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .pu-person-btn--open {
          transform: rotate(45deg);
        }

        /* ── Panell bio (escriptori: apareix al costat) ── */
        .pu-person-bio {
          display: flex;
          flex-direction: column;
          flex: 0 0 0px;
          width: 0;
          overflow: hidden;
          opacity: 0;
          padding-left: 0;
          transition:
            flex 0.55s cubic-bezier(0.22,1,0.36,1),
            width 0.55s cubic-bezier(0.22,1,0.36,1),
            opacity 0.4s ease,
            padding-left 0.4s ease;
          /* Must be a sibling of photo-wrap, so we put item in flex row */
          align-self: flex-start;
        }
        /* The item itself must be row when active to show bio beside photo */
        .pu-person-item--active {
          flex-direction: row !important;
          align-items: flex-start;
          flex-wrap: nowrap;
        }
        .pu-person-item--active .pu-person-bio {
          flex: 1 1 0;
          width: auto;
          min-width: 0;
          opacity: 1;
          padding-left: 20px;
          overflow: visible;
        }
        .pu-person-item--active .pu-person-foot {
          display: none;
        }

        /* Bio text */
        .pu-person-name {
          font-family: var(--font-sans);
          font-size: clamp(14px, 1.1vw, 18px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: #000;
          margin: 0 0 4px;
          white-space: nowrap;
        }
        .pu-person-role {
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          color: #888;
          margin: 0 0 14px;
          white-space: nowrap;
        }
        .pu-person-text {
          font-family: var(--font-sans);
          font-size: 12px;
          line-height: 1.72;
          color: #333;
          margin: 0;
          white-space: pre-line;
        }

        /* ── Peu (nom/rol sota la foto) ── */
        .pu-person-foot {
          margin-top: 10px;
          padding-right: 4px;
        }
        .pu-person-foot-name {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.1vw, 17px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
          color: #000;
          margin: 0 0 3px;
        }
        .pu-person-foot-role {
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          color: #999;
          margin: 0;
        }

        /* ── Mòbil ── */
        .pu-pm { display: none; }
        @media (max-width: 768px) {
          .pu-person-grid { display: none; }
          .pu-pm { display: block; }
          .pu-pm-row {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 3px;
          }
          .pu-pm-thumb {
            display: flex; flex-direction: column; align-items: stretch;
            padding: 0; border: 0; background: none; cursor: pointer;
            text-align: left;
            transition: opacity 300ms ease;
          }
          .pu-pm.has-active .pu-pm-thumb:not(.is-active) { opacity: 0.4; }
          .pu-pm-thumb-img {
            display: block;
            aspect-ratio: 3 / 4;
            overflow: hidden;
            background: #c8c8c8;
          }
          .pu-pm-thumb-img img {
            width: 100%; height: 100%;
            object-fit: cover; object-position: center top;
            filter: grayscale(100%);
            display: block;
          }
          .pu-pm-thumb-name {
            display: block;
            margin-top: 6px;
            font-family: var(--font-sans);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: -0.01em;
            line-height: 1.25;
            color: #000;
          }
          .pu-pm-thumb-name > span {
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .pu-pm-thumb-name > span + span { font-weight: 400; color: #555; }
          .pu-pm-thumb.is-active .pu-pm-thumb-name > span:first-child { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }

          @keyframes pu-pm-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
          .pu-pm-detail {
            margin-top: 20px;
            animation: pu-pm-in 420ms var(--ease-smooth);
          }
          .pu-pm-photo {
            aspect-ratio: 4 / 5;
            overflow: hidden;
            background: #c8c8c8;
          }
          .pu-pm-photo img {
            width: 100%; height: 100%;
            object-fit: cover; object-position: center top;
            filter: grayscale(100%);
            display: block;
          }
          .pu-pm-head {
            display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
            padding-top: 16px;
          }
          .pu-pm-name {
            font-family: var(--font-sans);
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.03em;
            line-height: 1.05;
            color: #000;
            margin: 0 0 4px;
          }
          .pu-pm-role { font-family: var(--font-sans); font-size: var(--size-meta); color: #888; margin: 0; }
          .pu-pm-close {
            flex-shrink: 0;
            width: 36px; height: 36px; margin: -8px -8px 0 0;
            display: flex; align-items: center; justify-content: center;
            border: 0; background: none; color: #000; cursor: pointer;
          }
          .pu-pm-text {
            font-family: var(--font-sans);
            font-size: 14px;
            line-height: 1.65;
            color: #333;
            margin: 16px 0 0;
            white-space: pre-line;
          }
        }
      `}</style>
    </>
  );
}
