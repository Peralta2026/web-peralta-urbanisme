"use client";

import { useState, useCallback } from "react";
import type { Project, ProjectLocale, Locale } from "@/lib/types";

interface Props {
  project: Project;
  locale: Locale;
}

function MetaItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="mb-5">
      <p
        className="text-xs uppercase tracking-wider text-gray-500 mb-1"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="text-sm text-black leading-snug">
        {value}
        {unit && <span className="ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function ProjectDiptych({ project, locale }: Props) {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const data: ProjectLocale = project[locale];
  const images = project.images;
  const slug = project.slug;

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % images.length),
    [images.length]
  );

  return (
    <article
      className="border-b border-black"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* LEFT — Image */}
        <div
          className="relative border-b md:border-b-0 md:border-r border-black"
          style={{ minHeight: "clamp(300px, 45vw, 580px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/projects/${slug}/${images[current]}`}
            alt={`${data.title} — ${current + 1}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Click zones — invisible, for prev/next */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Imatge anterior"
                style={{
                  position: "absolute",
                  inset: "0 50% 0 0",
                  background: "transparent",
                  border: "none",
                  cursor: "w-resize",
                  zIndex: 1,
                }}
              />
              <button
                onClick={next}
                aria-label="Imatge següent"
                style={{
                  position: "absolute",
                  inset: "0 0 0 50%",
                  background: "transparent",
                  border: "none",
                  cursor: "e-resize",
                  zIndex: 1,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "12px",
                  fontSize: "11px",
                  color: "#fff",
                  backgroundColor: "rgba(0,0,0,0.45)",
                  padding: "2px 8px",
                  fontFamily: "var(--font-mono)",
                  zIndex: 2,
                }}
              >
                {current + 1} / {images.length}
              </span>
            </>
          )}
        </div>

        {/* RIGHT — Content */}
        <div className="flex flex-col px-10 pt-10 pb-12">

          {/* Title block — molt gran, com a la referència */}
          <div className="mb-16">
            <h2
              className="font-bold leading-tight text-black"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", lineHeight: 1.1 }}
            >
              {data.title}
            </h2>
            <p
              className="font-bold text-black mt-1"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", lineHeight: 1.1 }}
            >
              {data.municipality} — {data.year}
            </p>
          </div>

          {/* Descripció curta */}
          <p className="text-base leading-relaxed text-black">
            {data.descriptionShort}
          </p>

          {/* Botó llegir més */}
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-10 text-xs uppercase tracking-widest text-black underline cursor-pointer border-none bg-transparent p-0 text-left"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Llegir més
            </button>
          )}

          {/* Contingut expandit: text llarg + metadades en 2 columnes */}
          {expanded && (
            <div className="mt-10 grid grid-cols-5 gap-10">
              {/* Descripció llarga */}
              <div className="col-span-3">
                <p className="text-base leading-relaxed text-black whitespace-pre-line">
                  {data.descriptionLong}
                </p>
                <button
                  onClick={() => setExpanded(false)}
                  className="mt-8 text-xs uppercase tracking-widest text-gray-400 underline cursor-pointer border-none bg-transparent p-0 text-left hover:text-black"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Llegir menys
                </button>
              </div>

              {/* Columna de metadades */}
              <div className="col-span-2">
                <MetaItem label="Municipi" value={data.municipality} />
                <MetaItem label="Any" value={data.year} />
                <MetaItem label="Estat" value={data.status} />
                <MetaItem label="Tipologia" value={data.tipus} />
                {data.premi && (
                  <MetaItem label="Premi" value={data.premi} />
                )}
                {data.ambitM2 && (
                  <MetaItem
                    label="Àmbit"
                    value={data.ambitM2.toLocaleString()}
                    unit="m²"
                  />
                )}
                {data.programa && data.programa !== "XXX" && (
                  <MetaItem label="Programa" value={data.programa} />
                )}
                {data.sostreM2 && (
                  <MetaItem
                    label="Sostre"
                    value={data.sostreM2.toLocaleString()}
                    unit="m²"
                  />
                )}
                {data.habitatges && (
                  <MetaItem label="Habitatges" value={data.habitatges} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
