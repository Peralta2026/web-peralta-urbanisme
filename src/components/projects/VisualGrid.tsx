"use client";

import Link from "next/link";
import type { Locale, Project } from "@/lib/types";

interface ImageCell {
  slug:  string;
  title: string;
  src:   string;
}

function buildImageCells(projects: Project[], locale: Locale): ImageCell[] {
  return projects.map((project) => ({
    slug:  project.slug,
    title: project[locale].title,
    src:   `/projects/${project.slug}/${project.coverImage}`,
  }));
}

interface Props {
  projects: Project[];
  locale:   Locale;
}

export default function VisualGrid({ projects, locale }: Props) {
  const cells = buildImageCells(projects, locale);

  return (
    <div className="pu-visual-grid-wrap">
      <div className="pu-visual-grid">
        {cells.map((cell, i) => (
          <Link
            key={`${cell.slug}-${i}`}
            href={`/${locale}/projectes/${cell.slug}`}
            className="pu-visual-cell"
            aria-label={cell.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cell.src}
              alt={cell.title}
              loading={i < 10 ? "eager" : "lazy"}
              className="pu-visual-img"
            />
            <div className="pu-visual-overlay">
              <span>{cell.title}</span>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .pu-visual-grid-wrap {
          padding: clamp(24px, 4vh, 48px) var(--margin-page) clamp(48px, 8vh, 96px);
        }
        .pu-visual-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: clamp(16px, 1.8vw, 26px);
        }
        .pu-visual-cell {
          position: relative;
          display: block;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          text-decoration: none;
          background: #f0f0ee;
          z-index: 1;
          transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
                      z-index 0ms 480ms;
        }
        .pu-visual-cell:hover {
          transform: scale(1.07);
          z-index: 20;
          transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
                      z-index 0ms 0ms;
        }
        .pu-visual-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .pu-visual-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 60%);
          display: flex;
          align-items: flex-end;
          padding: clamp(20px, 2vw, 28px) clamp(10px, 1vw, 14px) clamp(10px, 1vw, 14px);
          opacity: 0;
          transition: opacity 280ms ease;
          pointer-events: none;
        }
        .pu-visual-cell:hover .pu-visual-overlay {
          opacity: 1;
        }
        .pu-visual-overlay span {
          color: #000;
          font-family: var(--font-sans);
          font-size: clamp(11px, 0.9vw, 14px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        @media (max-width: 1024px) {
          .pu-visual-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 640px) {
          .pu-visual-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .pu-visual-grid-wrap { padding: 20px var(--margin-mobile) 48px; }
        }
        @media (max-width: 400px) {
          .pu-visual-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pu-visual-cell { transition-duration: 0ms !important; }
        }
      `}</style>
    </div>
  );
}
