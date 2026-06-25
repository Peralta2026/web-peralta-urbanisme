"use client";

import Link from "next/link";
import type { Project, Locale } from "@/lib/types";

interface Props {
  project: Project;
  locale: Locale;
}

export default function ProjectCard({ project, locale }: Props) {
  const data = project[locale];
  const href =
    locale === "ca"
      ? `/projectes/${project.slug}`
      : `/${locale}/projectes/${project.slug}`;

  const meta = [data.tipus, data.municipality, data.year]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={href}
      className="block group"
      style={{
        border: "1px solid #1f1f1f",
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
      {/* Grid: 2 cols desktop / 1 col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:h-[540px]">

        {/* ── Columna imatge ── */}
        <div
          className="flex items-center justify-center h-[320px] md:h-full border-b border-[#1f1f1f] md:border-b-0 md:border-r md:border-r-[#1f1f1f]"
          style={{ padding: "28px" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/projects/${project.slug}/${project.coverImage}`}
            alt={data.title}
            className="group-hover:opacity-[0.92] transition-opacity duration-[160ms]"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              maxWidth: "94%",
              maxHeight: "94%",
              display: "block",
            }}
          />
        </div>

        {/* ── Columna text ── */}
        <div
          className="flex flex-col pt-7 px-[22px] pb-[30px] md:pt-[48px] md:px-[56px] md:pb-[42px] md:h-full"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {/* Metadata: tipus · municipality · year */}
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#555",
              marginBottom: "28px",
              lineHeight: 1.2,
            }}
          >
            {meta}
          </p>

          {/* Títol */}
          <h2
            style={{
              fontSize: "clamp(32px, 3.4vw, 54px)",
              lineHeight: 0.96,
              fontWeight: 800,
              letterSpacing: "-0.055em",
              maxWidth: "560px",
              color: "#000",
              margin: 0,
            }}
          >
            {data.title}
          </h2>

          {/* Spacer — empeny la descripció al fons */}
          <div className="flex-1" />

          {/* Descripció curta */}
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
              maxWidth: "520px",
              color: "#000",
              marginBottom: "28px",
            }}
          >
            {data.descriptionShort}
          </p>

          {/* Link / CTA */}
          <span
            style={{
              fontSize: "13px",
              fontWeight: 650,
              letterSpacing: "-0.01em",
              borderBottom: "1px solid currentColor",
              paddingBottom: "3px",
              alignSelf: "flex-start",
              color: "#000",
            }}
          >
            Veure projecte →
          </span>
        </div>
      </div>
    </Link>
  );
}
