"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Project, ProjectLocale, TagSlug, Locale } from "@/lib/types";

interface Props {
  project: Project;
  locale: Locale;
}

function localizeHref(href: string, locale: Locale): string {
  if (locale === "ca") return href;
  return `/${locale}${href}`;
}

function TagsLabel({ tags }: { tags: TagSlug[] }) {
  return (
    <p
      className="text-xs text-gray-400 uppercase tracking-wider"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {tags.join(" / ")}
    </p>
  );
}

function MetaRow({ label, value, unit }: { label: string; value: string | number | null; unit?: string }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex gap-6">
      <p
        className="text-xs uppercase tracking-wider text-gray-400 w-28 flex-shrink-0"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="text-xs text-black">
        {value}{unit && <span className="ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function ProjectDiptych({ project, locale }: Props) {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const data: ProjectLocale = project[locale];
  const images = project.images;

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % images.length), [images.length]);

  const slug = project.slug;
  const href = localizeHref(`/projectes/${slug}`, locale);

  return (
    <article className="border-b border-black">
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ height: "clamp(360px, 50vw, 560px)" }}>

        {/* LEFT — Image carousel */}
        <div className="relative overflow-hidden border-b md:border-b-0 md:border-r border-black bg-gray-100" style={{ height: "clamp(260px, 50vw, 560px)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/projects/${slug}/${images[current]}`}
            alt={`${data.title} — ${current + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
              >
                ‹
              </button>
              <button
                onClick={next}
                aria-label="Següent"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
              >
                ›
              </button>
            </>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <span
              className="absolute bottom-3 right-3 text-xs text-white bg-black bg-opacity-60 px-2 py-0.5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {current + 1}/{images.length}
            </span>
          )}
        </div>

        {/* RIGHT — Scrollable text panel */}
        <div
          className="overflow-y-auto flex flex-col"
          style={{ height: "clamp(260px, 50vw, 560px)", fontFamily: "var(--font-sans)" }}
        >
          <div className="px-8 py-8 flex flex-col gap-4 flex-1">
            {/* Municipality + year */}
            <p
              className="text-xs text-gray-400 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {data.municipality} — {data.year}
            </p>

            {/* Title + link */}
            <Link href={href} className="no-underline group">
              <h2 className="text-xl font-semibold leading-snug text-black group-hover:underline">
                {data.title}
              </h2>
            </Link>

            {/* Short description */}
            <p className="text-sm leading-relaxed text-black">
              {data.descriptionShort}
            </p>

            {/* Llegir més */}
            {data.descriptionLong && data.descriptionLong !== data.descriptionShort && (
              <>
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="text-xs text-gray-500 underline cursor-pointer border-none bg-transparent p-0 hover:text-black text-left"
                >
                  {expanded ? "Llegir menys" : "Llegir més"}
                </button>

                {expanded && (
                  <>
                    <p className="text-sm leading-relaxed text-black whitespace-pre-line">
                      {data.descriptionLong}
                    </p>

                    {/* Data strip */}
                    <div className="border-t border-black pt-4 flex flex-col gap-3 mt-2">
                      <MetaRow label="Municipi" value={data.municipality} />
                      <MetaRow label="Any" value={data.year} />
                      <MetaRow label="Estat" value={data.status} />
                      <MetaRow label="Tipus" value={data.tipus} />
                      {data.premi && <MetaRow label="Premi" value={data.premi} />}
                      {data.ambitM2 && (
                        <MetaRow label="Àmbit" value={data.ambitM2.toLocaleString()} unit="m²" />
                      )}
                      {data.programa && <MetaRow label="Programa" value={data.programa} />}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Tags — pushed to bottom */}
            <div className="mt-auto pt-4">
              <TagsLabel tags={project.tags} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
