"use client";

import Link from "next/link";
import type { Project, Locale } from "@/lib/types";

interface Props {
  project: Project;
  locale: Locale;
  type: "image" | "text";
}

function localizeHref(href: string, locale: Locale): string {
  if (locale === "ca") return href;
  return `/${locale}${href}`;
}

export default function ProjectGridCell({ project, locale, type }: Props) {
  const data = project[locale];
  const href = localizeHref(`/projectes/${project.slug}`, locale);
  const imgSrc = `/projects/${project.slug}/${project.coverImage}`;

  if (type === "image") {
    return (
      <Link
        href={href}
        className="block relative aspect-square overflow-hidden bg-gray-100 group no-underline"
        style={{ border: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={data.title}
          className="w-full h-full object-cover"
        />
        {/* Hover: title overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <p className="text-white text-xs font-semibold uppercase tracking-wider leading-tight">
            {data.title}
          </p>
          <p
            className="text-white/60 text-xs mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {data.municipality} — {data.year}
          </p>
        </div>
      </Link>
    );
  }

  // type === "text"
  return (
    <Link
      href={href}
      className="block relative aspect-square overflow-hidden bg-black group no-underline"
      style={{ border: "none" }}
    >
      {/* Text layer (visible by default) */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 group-hover:opacity-0 transition-opacity duration-200">
        <p className="text-white font-bold text-base leading-tight mb-1">
          {data.title}
        </p>
        <p
          className="text-white/50 text-xs"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {data.municipality} — {data.year}
        </p>
      </div>

      {/* Image layer (visible on hover) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={data.title}
          className="w-full h-full object-cover"
        />
        {/* Keep title visible on top of image on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-3">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">
            {data.title}
          </p>
        </div>
      </div>
    </Link>
  );
}
