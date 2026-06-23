"use client";

import { useState } from "react";
import type { TeamMember, Locale } from "@/lib/types";

const PHOTO_W = 300;
const PHOTO_H = 400;

function PhotoBox({ member }: { member: TeamMember }) {
  return (
    <div
      style={{
        width: `${PHOTO_W}px`,
        height: `${PHOTO_H}px`,
        backgroundColor: "#d0d0d0",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/team/${member.photo}`}
        alt=""
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
}

interface Props {
  member: TeamMember;
  locale: Locale;
  photoSide: "left" | "right";
}

export default function PersonCard({ member, locale, photoSide }: Props) {
  const [expanded, setExpanded] = useState(false);
  const data = member[locale];

  const textBlock = (
    <div style={{ maxWidth: "320px" }}>
      {/* Role — small mono label above name */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "#666",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "16px",
          lineHeight: 1.4,
        }}
      >
        {data.role}
      </p>

      {/* Name + toggle button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "16px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "26px",
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
            fontSize: "22px",
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

      {/* Bio — expanded */}
      {expanded && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            lineHeight: 1.65,
            color: "#000",
            marginTop: "24px",
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
      <div className="flex flex-col gap-8 md:hidden">
        <div style={{ width: "100%", maxWidth: `${PHOTO_W}px` }}>
          <PhotoBox member={member} />
        </div>
        {textBlock}
      </div>

      {/* ── Desktop: asymmetric constellation ── */}
      <div
        className="hidden md:flex"
        style={{
          alignItems: "center",
          gap: "64px",
          justifyContent: photoSide === "left" ? "flex-start" : "flex-end",
        }}
      >
        {photoSide === "left" ? (
          <>
            <PhotoBox member={member} />
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            <PhotoBox member={member} />
          </>
        )}
      </div>
    </>
  );
}
