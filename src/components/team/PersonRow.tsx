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
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
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
          font-size: clamp(10px, 0.85vw, 13px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
          color: #000;
          margin: 0 0 3px;
        }
        .pu-person-foot-role {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #999;
          margin: 0;
        }

        /* ── Mòbil ── */
        @media (max-width: 768px) {
          .pu-person-grid {
            flex-direction: column;
            gap: 48px;
          }
          .pu-person-item {
            flex: none !important;
            width: 100%;
            flex-direction: column !important;
          }
          .pu-person-item--active {
            flex-direction: column !important;
          }
          .pu-person-photo-wrap {
            width: 100% !important;
            aspect-ratio: 3 / 2;
          }
          .pu-person-bio {
            flex: none !important;
            width: 100% !important;
            opacity: 1 !important;
            padding-left: 0 !important;
            overflow: visible !important;
            margin-top: 14px;
          }
          .pu-person-btn { display: none; }
          .pu-person-foot { display: none !important; }
          .pu-person-name { font-size: 18px; white-space: normal; }
          .pu-person-role { white-space: normal; margin-bottom: 12px; }
          .pu-person-text { font-size: 14px; }
        }
      `}</style>
    </>
  );
}
