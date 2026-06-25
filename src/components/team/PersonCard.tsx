"use client";

import { useState } from "react";
import type { TeamMember, Locale } from "@/lib/types";

const PHOTO_W = 280;
const PHOTO_H = 370;

interface Props {
  member: TeamMember;
  locale: Locale;
  photoSide: "left" | "right";
}

export default function PersonCard({ member, locale, photoSide }: Props) {
  const [expanded, setExpanded] = useState(false);
  const data = member[locale];

  const photoEl = (
    <div
      style={{
        width: `${PHOTO_W}px`,
        height: `${PHOTO_H}px`,
        backgroundColor: "#c8c8c8",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/team/${member.photo}`}
        alt={data.name}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          filter: "grayscale(100%)",
          display: "block",
        }}
      />
    </div>
  );

  const textEl = (
    <div style={{ maxWidth: "260px" }}>
      {/* Role — small mono above name */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "#888",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "20px",
          lineHeight: 1.5,
        }}
      >
        {data.role}
      </p>

      {/* Name + toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "12px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "24px",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "#000",
            margin: 0,
          }}
        >
          {data.name}
        </h2>
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Tancar bio" : "Llegir bio"}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "20px",
            fontWeight: 300,
            color: "#000",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {expanded ? "−" : "+"}
        </button>
      </div>

      {/* Bio */}
      {expanded && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            lineHeight: 1.7,
            color: "#222",
            marginTop: "20px",
            whiteSpace: "pre-line",
          }}
        >
          {data.bioLong}
        </p>
      )}
    </div>
  );

  return (
    <>
      {/* ── Mobile: stacked ── */}
      <div className="flex flex-col gap-6 md:hidden">
        <div style={{ maxWidth: `${PHOTO_W}px` }}>{photoEl}</div>
        {textEl}
      </div>

      {/* ── Desktop: photo-left layout ── */}
      {photoSide === "left" && (
        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: "52px" }}
        >
          {photoEl}
          {textEl}
        </div>
      )}

      {/* ── Desktop: photo-right layout (text top-left, photo bottom-right) ── */}
      {photoSide === "right" && (
        <div
          className="hidden md:flex"
          style={{
            alignItems: "flex-start",
            gap: "52px",
            justifyContent: "flex-end",
          }}
        >
          {textEl}
          {photoEl}
        </div>
      )}
    </>
  );
}
