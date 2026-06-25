"use client";

import { useState } from "react";

interface Props {
  slug: string;
  images: string[];
  title: string;
}

export default function ProjectGallery({ slug, images, title }: Props) {
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <div style={{ marginBottom: "72px" }}>
      {/* ── Imatge principal ── */}
      <div
        style={{
          width: "100%",
          height: "clamp(420px, 62vh, 720px)",
          border: "1px solid #9a9a9a",
          overflow: "hidden",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginBottom: "10px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/projects/${slug}/${images[active]}`}
          alt={`${title} — imatge ${active + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />

        {/* Botons anterior/següent — mínims, quadrats */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Imatge anterior"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "32px",
                height: "32px",
                border: "1px solid #9a9a9a",
                background: "rgba(255,255,255,0.9)",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-sans)",
                lineHeight: 1,
              }}
            >
              ←
            </button>
            <button
              onClick={next}
              aria-label="Imatge següent"
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "32px",
                height: "32px",
                border: "1px solid #9a9a9a",
                background: "rgba(255,255,255,0.9)",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-sans)",
                lineHeight: 1,
              }}
            >
              →
            </button>
          </>
        )}
      </div>

      {/* ── Miniatures ── */}
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              aria-label={`Imatge ${i + 1}`}
              style={{
                flexShrink: 0,
                width: "74px",
                height: "52px",
                border: `1px solid ${i === active ? "#111" : "#d0d0d0"}`,
                background: "#fff",
                opacity: i === active ? 1 : 0.55,
                cursor: "pointer",
                padding: 0,
                overflow: "hidden",
                transition: "opacity 120ms ease, border-color 120ms ease",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/projects/${slug}/${img}`}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
