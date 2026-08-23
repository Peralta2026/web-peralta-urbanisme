"use client";

import Link from "next/link";
import type { Locale, Project } from "@/lib/types";

interface ImageCell {
  slug:   string;
  title:  string;
  src:    string;
}

function buildImageCells(projects: Project[], locale: Locale): ImageCell[] {
  const cells: ImageCell[] = [];
  for (const project of projects) {
    const title  = project[locale].title;
    const first  = project.coverImage;
    const second = project.images?.[0] ?? project.coverImage;
    cells.push({ slug: project.slug, title, src: `/projects/${project.slug}/${first}` });
    cells.push({ slug: project.slug, title, src: `/projects/${project.slug}/${second}` });
  }
  return cells;
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
              loading="lazy"
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
          gap: clamp(6px, 0.8vw, 14px);
        }
        .pu-visual-cell {
          position: relative;
          display: block;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          text-decoration: none;
          background: #f0f0ee;
        }
        .pu-visual-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pu-visual-cell:hover .pu-visual-img {
          transform: scale(1.04);
        }
        .pu-visual-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.52);
          display: flex;
          align-items: flex-end;
          padding: clamp(10px, 1.2vw, 16px);
          opacity: 0;
          transition: opacity 260ms ease;
        }
        .pu-visual-cell:hover .pu-visual-overlay {
          opacity: 1;
        }
        .pu-visual-overlay span {
          color: #fff;
          font-family: var(--font-sans);
          font-size: clamp(11px, 0.9vw, 14px);
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.2;
          text-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
        @media (max-width: 1024px) {
          .pu-visual-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 640px) {
          .pu-visual-grid { grid-template-columns: repeat(3, 1fr); gap: 4px; }
          .pu-visual-grid-wrap { padding: 20px var(--margin-mobile) 48px; }
        }
        @media (max-width: 400px) {
          .pu-visual-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
