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
      {/* ── Desktop: fila horitzontal ── */}
      <div
        className="pu-person-row"
        style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}
      >
        {ordered.map(member => {
          const isActive = active === member.slug;
          const data     = member[locale];

          return (
            <div
              key={member.slug}
              style={{
                flex:       isActive ? 1.7 : 1,
                minWidth:   0,
                transition: "flex 0.55s cubic-bezier(0.22,1,0.36,1)",
                display:    "flex",
                flexDirection: "column",
              }}
            >
              {/* ── Nom + rol SOBRE la foto — ocultat quan expandit ── */}
              <div
                onClick={() => toggle(member.slug)}
                style={{
                  cursor:     "pointer",
                  maxHeight:  isActive ? "0px" : "60px",
                  opacity:    isActive ? 0 : 1,
                  overflow:   "hidden",
                  marginBottom: isActive ? "0px" : "12px",
                  transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease, margin-bottom 0.4s",
                }}
              >
                <h3 style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "clamp(11px,1vw,15px)",
                  fontWeight:    700,
                  letterSpacing: "-0.02em",
                  lineHeight:    1.15,
                  color:         "#000",
                  margin:        "0 0 4px",
                }}>
                  {data.name}
                </h3>
                <p style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      "9px",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color:         "#999",
                  margin:        0,
                }}>
                  {data.role}
                </p>
              </div>

              {/* ── Foto + panell lateral ── */}
              <div style={{ display: "flex", alignItems: "flex-start" }}>

                {/* Foto */}
                <div
                  onClick={() => toggle(member.slug)}
                  style={{
                    position:   "relative",
                    width:      isActive ? "44%" : "100%",
                    flexShrink: 0,
                    aspectRatio: "260 / 344",
                    overflow:   "hidden",
                    backgroundColor: "#c8c8c8",
                    cursor:     "pointer",
                    transition: "width 0.55s cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/team/${member.photo}`}
                    alt={data.name}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
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

                  {/* botó + */}
                  <button
                    onClick={e => { e.stopPropagation(); toggle(member.slug); }}
                    aria-expanded={isActive}
                    aria-label={isActive ? "Tancar bio" : "Llegir bio"}
                    style={{
                      position:   "absolute",
                      bottom:     "10px",
                      right:      "10px",
                      width:      "24px",
                      height:     "24px",
                      border:     "1px solid rgba(255,255,255,0.65)",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.28)",
                      color:      "#fff",
                      fontSize:   "16px",
                      fontWeight: 300,
                      fontFamily: "var(--font-sans)",
                      lineHeight: 1,
                      cursor:     "pointer",
                      display:    "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding:    0,
                      transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                      transform:  isActive ? "rotate(45deg)" : "none",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Panell de text lateral — apareix quan actiu */}
                <div
                  style={{
                    flex:       1,
                    minWidth:   0,
                    overflow:   "hidden",
                    maxWidth:   isActive ? "9999px" : "0px",
                    opacity:    isActive ? 1 : 0,
                    paddingLeft: isActive ? "18px" : "0px",
                    transition: "max-width 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease, padding-left 0.4s",
                  }}
                >
                  <h3 style={{
                    fontFamily:    "var(--font-sans)",
                    fontSize:      "clamp(14px,1.2vw,19px)",
                    fontWeight:    700,
                    letterSpacing: "-0.03em",
                    lineHeight:    1.1,
                    color:         "#000",
                    margin:        "0 0 6px",
                    whiteSpace:    "nowrap",
                  }}>
                    {data.name}
                  </h3>
                  <p style={{
                    fontFamily:    "var(--font-mono)",
                    fontSize:      "9px",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color:         "#888",
                    margin:        "0 0 18px",
                    whiteSpace:    "nowrap",
                  }}>
                    {data.role}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-sans)",
                    fontSize:   "12.5px",
                    lineHeight: 1.72,
                    color:      "#333",
                    margin:     0,
                    whiteSpace: "pre-line",
                  }}>
                    {data.bioLong}
                  </p>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Mòbil: columna vertical ── */}
      <div className="pu-person-col" style={{ display: "none", flexDirection: "column", gap: "40px" }}>
        {ordered.map(member => {
          const isActive = active === member.slug;
          const data     = member[locale];

          return (
            <div key={`mob-${member.slug}`}>
              {/* Nom + rol */}
              <div
                onClick={() => toggle(member.slug)}
                style={{ cursor: "pointer", marginBottom: "14px" }}
              >
                <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#000", margin: "0 0 5px" }}>
                  {data.name}
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.07em", textTransform: "uppercase", color: "#999", margin: 0 }}>
                  {data.role}
                </p>
              </div>

              {/* Foto */}
              <div
                onClick={() => toggle(member.slug)}
                style={{ position: "relative", width: "220px", maxWidth: "100%", aspectRatio: "260 / 344", overflow: "hidden", backgroundColor: "#c8c8c8", cursor: "pointer" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/team/${member.photo}`}
                  alt={data.name}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(100%)" }}
                />
                <button
                  onClick={e => { e.stopPropagation(); toggle(member.slug); }}
                  aria-expanded={isActive}
                  aria-label={isActive ? "Tancar bio" : "Llegir bio"}
                  style={{ position: "absolute", bottom: "10px", right: "10px", width: "24px", height: "24px", border: "1px solid rgba(255,255,255,0.65)", borderRadius: "50%", background: "rgba(0,0,0,0.28)", color: "#fff", fontSize: "16px", fontWeight: 300, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)", transform: isActive ? "rotate(45deg)" : "none" }}
                >
                  +
                </button>
              </div>

              {/* Bio */}
              <div style={{ maxHeight: isActive ? "700px" : "0px", overflow: "hidden", transition: "max-height 0.55s cubic-bezier(0.22,1,0.36,1)" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.72, color: "#333", paddingTop: "18px", margin: 0, whiteSpace: "pre-line" }}>
                  {data.bioLong}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pu-person-row { display: none !important; }
          .pu-person-col { display: flex !important; }
        }
      `}</style>
    </>
  );
}
