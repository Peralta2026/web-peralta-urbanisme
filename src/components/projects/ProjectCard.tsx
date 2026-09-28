"use client";

import Link from "next/link";
import type { Project, Locale } from "@/lib/types";

interface Props {
  project: Project;
  locale: Locale;
}

export default function ProjectCard({ project, locale }: Props) {
  const data = project[locale];
  const href = `/${locale}/projectes/${project.slug}`;

  const meta = [data.tipus, data.municipality, data.year]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={href}
      className="block group"
      style={{
        border: "1px solid #7e7e7e",
        textDecoration: "none",
        color: "inherit",
        overflow: "hidden",
        display: "block",
        borderRadius: "8px",
      }}
    >
      {/* Grid: image 1:1 / text en desktop — apilat en mòbil */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] md:h-[420px]">

        {/* ── Columna imatge ── */}
        <div
          className="border-b border-[#7e7e7e] md:border-b-0 md:border-r md:border-r-[#7e7e7e]"
          style={{ aspectRatio: "1 / 1", overflow: "hidden" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/projects/${project.slug}/${project.coverImage}`}
            alt={data.title}
            className="group-hover:opacity-[0.88] transition-opacity duration-[160ms]"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {/* ── Columna text ── */}
        <div
          style={{
            padding: "18px 24px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: "var(--font-sans)",
            overflow: "hidden",
          }}
        >
          {/* Bloc superior: metadata + títol */}
          <div>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#6c6c6c",
                lineHeight: 1.2,
                marginBottom: "14px",
                margin: "0 0 14px 0",
              }}
            >
              {meta}
            </p>

            <h2
              style={{
                fontSize: "clamp(28px, 2.8vw, 42px)",
                lineHeight: 0.95,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                color: "#000",
                margin: "0 0 0 0",
                maxWidth: "92%",
              }}
            >
              {data.title}
            </h2>
          </div>

          {/* Bloc inferior: resum + CTA */}
          <div>
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.42,
                color: "#000",
                maxWidth: "90%",
                margin: "0 0 18px 0",
              }}
            >
              {data.descriptionShort}
            </p>

            <span
              style={{
                fontSize: "13px",
                fontWeight: 650,
                letterSpacing: "-0.01em",
                borderBottom: "1px solid currentColor",
                paddingBottom: "2px",
                display: "inline-block",
                color: "#000",
              }}
            >
              Veure projecte →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
