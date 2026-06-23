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
    <div style={{ marginBottom: "20px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#888",
          marginBottom: "4px",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "13px", color: "#000", lineHeight: 1.4 }}>
        {value}
        {unit && <span style={{ marginLeft: "4px" }}>{unit}</span>}
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

  // Title font size: large on desktop, smaller on mobile
  const titleStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontWeight: 700,
    lineHeight: 1.05,
    color: "#000",
    fontSize: "clamp(1.6rem, 3.2vw, 3rem)",
  };

  return (
    <article>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
        className="grid-cols-diptych"
      >
        {/* ── LEFT — Caixa imatge ── */}
        <div
          style={{
            border: "1px solid #000",
            padding: "12px",          /* marge interior: imatge com a làmina */
            height: "70vh",
            minHeight: "320px",
            boxSizing: "border-box",
          }}
        >
          {/* Inner frame — the image sits inside here */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
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

            {/* Click zones (invisibles) per navegar entre imatges */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Imatge anterior"
                  style={{
                    position: "absolute",
                    top: 0, bottom: 0, left: 0, right: "50%",
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
                    top: 0, bottom: 0, left: "50%", right: 0,
                    background: "transparent",
                    border: "none",
                    cursor: "e-resize",
                    zIndex: 1,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: "#fff",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    padding: "2px 7px",
                    zIndex: 2,
                  }}
                >
                  {current + 1} / {images.length}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT — Caixa text ── */}
        <div
          style={{
            border: "1px solid #000",
            height: "70vh",
            minHeight: "320px",
            overflowY: "auto",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            padding: "40px",
            fontFamily: "var(--font-sans)",
          }}
        >
          {/* Títol + municipi/any al capdamunt */}
          <div>
            <h2 style={titleStyle}>{data.title}</h2>
            <p style={{ ...titleStyle, marginTop: "4px" }}>
              {data.municipality} — {data.year}
            </p>
          </div>

          {/* Espai blanc al mig (franja de respir) — desapareix quan s'expandeix */}
          {!expanded && <div style={{ flex: 1 }} />}

          {/* Descripció curta */}
          {!expanded && (
            <div>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: "#000",
                  maxWidth: "560px",
                }}
              >
                {data.descriptionShort}
              </p>

              <button
                onClick={() => setExpanded(true)}
                style={{
                  marginTop: "28px",
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#000",
                }}
              >
                Llegir més
              </button>
            </div>
          )}

          {/* Contingut expandit */}
          {expanded && (
            <div
              style={{
                marginTop: "40px",
                display: "grid",
                gridTemplateColumns: "3fr 2fr",
                gap: "40px",
                flex: 1,
              }}
            >
              {/* Descripció llarga */}
              <div>
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "#000",
                    whiteSpace: "pre-line",
                  }}
                >
                  {data.descriptionLong}
                </p>
                <button
                  onClick={() => setExpanded(false)}
                  style={{
                    marginTop: "28px",
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#888",
                  }}
                >
                  Llegir menys
                </button>
              </div>

              {/* Columna metadades */}
              <div>
                <MetaItem label="Municipi" value={data.municipality} />
                <MetaItem label="Any" value={data.year} />
                <MetaItem label="Estat" value={data.status} />
                <MetaItem label="Tipologia" value={data.tipus} />
                {data.premi && <MetaItem label="Premi" value={data.premi} />}
                {data.ambitM2 && (
                  <MetaItem
                    label="Àmbit"
                    value={data.ambitM2.toLocaleString()}
                    unit="m²"
                  />
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
