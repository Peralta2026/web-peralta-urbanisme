"use client";

import { useState } from "react";
import type { TeamMember, Locale } from "@/lib/types";

const PHOTO_W    = 260;
const PHOTO_H    = 344;
const EXP_PHOTO_W = 380;
const EXP_PHOTO_H = 500;

interface Props {
  member:     TeamMember;
  locale:     Locale;
  photoSide:  "left" | "right";
}

export default function PersonCard({ member, locale, photoSide }: Props) {
  const [expanded, setExpanded] = useState(false);
  const data = member[locale];

  const photoEl = (
    <div
      style={{
        width:      `${expanded ? EXP_PHOTO_W : PHOTO_W}px`,
        height:     `${expanded ? EXP_PHOTO_H : PHOTO_H}px`,
        transition: "width 0.5s cubic-bezier(0.22,1,0.36,1), height 0.5s cubic-bezier(0.22,1,0.36,1)",
        backgroundColor: "#c8c8c8",
        overflow:   "hidden",
        position:   "relative",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/team/${member.photo}`}
        alt={data.name}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        style={{
          position:       "absolute",
          inset:          0,
          width:          "100%",
          height:         "100%",
          objectFit:      "cover",
          objectPosition: "center top",
          filter:         "grayscale(100%)",
          display:        "block",
        }}
      />
    </div>
  );

  const textEl = (
    <div style={{
      maxWidth:   expanded ? "340px" : "240px",
      transition: "max-width 0.5s cubic-bezier(0.22,1,0.36,1)",
    }}>
      {/* Role */}
      <p style={{
        fontFamily:    "var(--font-mono)",
        fontSize:      "10px",
        color:         "#888",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom:  "16px",
        lineHeight:    1.5,
        transition:    "font-size 0.4s ease",
      }}>
        {data.role}
      </p>

      {/* Name + toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
        <h2 style={{
          fontFamily:    "var(--font-sans)",
          fontWeight:    700,
          fontSize:      expanded ? "32px" : "22px",
          letterSpacing: "-0.02em",
          lineHeight:    1.05,
          color:         "#000",
          margin:        0,
          transition:    "font-size 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}>
          {data.name}
        </h2>
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Tancar bio" : "Llegir bio"}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize:   "20px",
            fontWeight: 300,
            color:      "#000",
            background: "none",
            border:     "none",
            cursor:     "pointer",
            padding:    0,
            lineHeight: 1,
            flexShrink: 0,
            transition: "transform 0.3s ease",
            transform:  expanded ? "rotate(45deg)" : "none",
          }}
        >
          +
        </button>
      </div>

      {/* Bio — fade in */}
      <div style={{
        maxHeight:  expanded ? "600px" : "0px",
        overflow:   "hidden",
        transition: "max-height 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize:   "14px",
          lineHeight: 1.7,
          color:      "#333",
          marginTop:  "18px",
          whiteSpace: "pre-line",
        }}>
          {data.bioLong}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile ── */}
      <div className="flex flex-col gap-5 md:hidden">
        <div style={{ maxWidth: `${PHOTO_W}px` }}>{photoEl}</div>
        {textEl}
      </div>

      {/* ── Desktop: photo left ── */}
      {photoSide === "left" && (
        <div className="hidden md:flex" style={{ alignItems: "flex-start", gap: "40px" }}>
          {photoEl}
          {textEl}
        </div>
      )}

      {/* ── Desktop: photo right ── */}
      {photoSide === "right" && (
        <div className="hidden md:flex" style={{ alignItems: "flex-start", gap: "40px", justifyContent: "flex-end" }}>
          {textEl}
          {photoEl}
        </div>
      )}
    </>
  );
}
