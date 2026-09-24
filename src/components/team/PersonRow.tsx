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

  const activeMember = ordered.find(m => m.slug === active) ?? null;

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
              {/* ── Nom + rol sobre la foto ── */}
              <div
                onClick={() => toggle(member.slug)}
                style={{ cursor: "pointer", marginBottom: "12px" }}
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

              {/* ── Foto — omple el 100% de la columna ── */}
              <div
                onClick={() => toggle(member.slug)}
                style={{
                  position:   "relative",
                  width:      "100%",
                  aspectRatio: "260 / 344",
                  overflow:   "hidden",
                  backgroundColor: "#c8c8c8",
                  cursor:     "pointer",
                  flexShrink: 0,
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
            </div>
          );
        })}
      </div>

      {/* ── Bio panel — s'obre a sota de tota la fila ── */}
      <div
        style={{
          maxHeight:  active ? "600px" : "0px",
          overflow:   "hidden",
          transition: "max-height 0.55s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {activeMember && (() => {
          const d = activeMember[locale];
          return (
            <div style={{
              marginTop:   "28px",
              paddingTop:  "28px",
              borderTop:   "1px solid rgba(0,0,0,0.10)",
              display:     "flex",
              gap:         "clamp(32px,4vw,64px)",
              alignItems:  "flex-start",
            }}>
              {/* Nom + rol */}
              <div style={{ flexShrink: 0 }}>
                <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(16px,1.6vw,24px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#000", margin: "0 0 6px" }}>
                  {d.name}
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                  {d.role}
                </p>
              </div>

              {/* Bio text */}
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize:   "13.5px",
                lineHeight: 1.72,
                color:      "#333",
                margin:     0,
                whiteSpace: "pre-line",
                maxWidth:   "640px",
              }}>
                {d.bioLong}
              </p>
            </div>
          );
        })()}
      </div>

      {/* ── Mòbil: columna vertical ── */}
      <div className="pu-person-col" style={{ display: "none", flexDirection: "column", gap: "40px" }}>
        {ordered.map(member => {
          const isActive = active === member.slug;
          const data     = member[locale];

          return (
            <div key={`mob-${member.slug}`}>
              <div onClick={() => toggle(member.slug)} style={{ cursor: "pointer", marginBottom: "14px" }}>
                <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#000", margin: "0 0 5px" }}>
                  {data.name}
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.07em", textTransform: "uppercase", color: "#999", margin: 0 }}>
                  {data.role}
                </p>
              </div>

              <div onClick={() => toggle(member.slug)}
                style={{ position: "relative", width: "220px", maxWidth: "100%", aspectRatio: "260 / 344", overflow: "hidden", backgroundColor: "#c8c8c8", cursor: "pointer" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/team/${member.photo}`} alt={data.name}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(100%)" }} />
                <button onClick={e => { e.stopPropagation(); toggle(member.slug); }}
                  aria-expanded={isActive}
                  aria-label={isActive ? "Tancar bio" : "Llegir bio"}
                  style={{ position: "absolute", bottom: "10px", right: "10px", width: "24px", height: "24px", border: "1px solid rgba(255,255,255,0.65)", borderRadius: "50%", background: "rgba(0,0,0,0.28)", color: "#fff", fontSize: "16px", fontWeight: 300, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)", transform: isActive ? "rotate(45deg)" : "none" }}>
                  +
                </button>
              </div>

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
