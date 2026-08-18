"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function localizeHref(href: string, locale: string) {
  return locale === "ca" ? href : `/${locale}${href}`;
}

function pad2(n: number) { return String(n).padStart(2, "0"); }

const TAG_LABELS: Record<string, string> = {
  "residencial":                 "Residencial",
  "transformacio":               "Transformació",
  "extensio":                    "Extensió",
  "regeneracio":                 "Regeneració",
  "activitat-economica":         "Activitat econòmica",
  "infraestructura-verda":       "Infraestructura verda",
  "integracio-infraestructures": "Integració d'infraestructures",
  "estructura-urbana":           "Estructura urbana",
  "divulgacio":                  "Divulgació",
  "espai-public":                "Espai públic",
  "participacio-ciutadana":      "Participació ciutadana",
  "encaixos-singulars":          "Encaixos singulars",
};

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface Props {
  projects: Project[];
  locale:   string;
}

/* ─── ProjectViewer ─────────────────────────────────────────────────────── */

export default function ProjectViewer({ projects, locale }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgIdx,    setImgIdx]    = useState(0);

  const project = projects[activeIdx];
  const data    = project[locale as "ca" | "es" | "en"];
  const images  = project.images.length > 0 ? project.images : [project.coverImage];
  const imgSrc  = `/projects/${project.slug}/${images[imgIdx] ?? project.coverImage}`;
  const hasLong = !!(data.descriptionLong && data.descriptionLong !== data.descriptionShort);

  function goTo(idx: number) {
    setActiveIdx(idx);
    setImgIdx(0);
  }

  return (
    <div style={{
      position:   "absolute",
      inset:      0,
      display:    "flex",
      background: "#ffffff",
      fontFamily: "var(--font-sans)",
    }}>

      {/* ── ProjectInfoStage — 34% ───────────────────────────────────── */}
      <div style={{
        width:         "34%",
        flexShrink:    0,
        height:        "100%",
        overflowY:     "auto",
        display:       "flex",
        flexDirection: "column",
        padding:       "56px 44px 48px 56px",
      }}>

        {/* Counter */}
        <p style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "10px",
          letterSpacing: "0.10em",
          color:         "#ccc",
          marginBottom:  "36px",
        }}>
          {pad2(activeIdx + 1)} / {pad2(projects.length)}
        </p>

        {/* Title */}
        <h2 style={{
          fontSize:      "clamp(22px, 2.4vw, 38px)",
          fontWeight:    700,
          letterSpacing: "-0.02em",
          lineHeight:    1.1,
          color:         "#111",
          marginBottom:  "20px",
        }}>
          {data.title}
        </h2>

        {/* Short description */}
        <p style={{
          fontSize:     "14px",
          lineHeight:   1.65,
          color:        "#555",
          whiteSpace:   "pre-line",
          marginBottom: "24px",
        }}>
          {data.descriptionShort}
        </p>

        {/* Metadata */}
        <p style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "10px",
          letterSpacing: "0.08em",
          color:         "#aaa",
          textTransform: "uppercase",
          lineHeight:    1.6,
          marginBottom:  "12px",
        }}>
          {data.municipality}
          {data.year  ? ` · ${data.year}`  : ""}
          {data.tipus ? ` · ${data.tipus}` : ""}
        </p>

        {/* Tags — editorial, sense chips ni bordes */}
        {project.tags.length > 0 && (
          <p style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "9px",
            letterSpacing: "0.08em",
            color:         "#c0c0c0",
            textTransform: "uppercase",
            lineHeight:    1.7,
            marginBottom:  "28px",
          }}>
            {project.tags.map(t => TAG_LABELS[t] ?? t).join("  /  ")}
          </p>
        )}

        {/* Llegir més */}
        {hasLong && (
          <button style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "10px",
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color:         "#111",
            background:    "none",
            border:        "none",
            cursor:        "pointer",
            padding:       "0 0 2px",
            borderBottom:  "1px solid #111",
            alignSelf:     "flex-start",
            marginBottom:  "20px",
          }}>
            Llegir més
          </button>
        )}

        {/* CTA */}
        <div style={{ marginTop: "auto", paddingTop: "24px" }}>
          <Link
            href={localizeHref(`/projectes/${project.slug}`, locale)}
            style={{
              fontFamily:     "var(--font-mono)",
              fontSize:       "10px",
              letterSpacing:  "0.12em",
              textTransform:  "uppercase",
              color:          "#111",
              textDecoration: "none",
              borderBottom:   "1px solid #111",
              paddingBottom:  "2px",
            }}
          >
            Veure projecte →
          </Link>
        </div>

        {/* ── DEV CONTROLS (temporals — s'eliminaran amb el scroll) ── */}
        <div style={{
          marginTop:  "28px",
          display:    "flex",
          gap:        "10px",
          borderTop:  "1px solid #f4f4f4",
          paddingTop: "16px",
        }}>
          <button
            onClick={() => goTo(Math.max(0, activeIdx - 1))}
            disabled={activeIdx === 0}
            style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "9px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background:    "none",
              border:        "1px solid #e0e0e0",
              cursor:        activeIdx === 0 ? "default" : "pointer",
              color:         activeIdx === 0 ? "#e0e0e0" : "#aaa",
              padding:       "4px 8px",
            }}
          >
            ← prev
          </button>
          <button
            onClick={() => goTo(Math.min(projects.length - 1, activeIdx + 1))}
            disabled={activeIdx === projects.length - 1}
            style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "9px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background:    "none",
              border:        "1px solid #e0e0e0",
              cursor:        activeIdx === projects.length - 1 ? "default" : "pointer",
              color:         activeIdx === projects.length - 1 ? "#e0e0e0" : "#aaa",
              padding:       "4px 8px",
            }}
          >
            next →
          </button>
        </div>
      </div>

      {/* ── ProjectMediaStage — 66% ──────────────────────────────────── */}
      <div style={{
        flex:       1,
        height:     "100%",
        overflow:   "hidden",
        position:   "relative",
        background: "#f0f0f0",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${activeIdx}-${imgIdx}`}
          src={imgSrc}
          alt={data.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </div>
  );
}
