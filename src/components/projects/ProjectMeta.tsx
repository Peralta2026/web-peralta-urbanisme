"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProjectLocale, TagSlug } from "@/lib/types";

interface Props {
  data: ProjectLocale;
  tags: TagSlug[];
}

interface MetaRowProps {
  label: string;
  value: string | number | null;
  unit?: string;
}

function MetaRow({ label, value, unit }: MetaRowProps) {
  if (value === null || value === undefined) return null;
  return (
    <div className="mb-4">
      <p
        className="text-xs uppercase tracking-wider text-gray-500 mb-0.5"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="text-sm text-black">
        {value}
        {unit && <span className="ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function ProjectMeta({ data, tags }: Props) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("project");
  const tf = useTranslations("filters");

  return (
    <div
      className="h-full overflow-y-auto px-8 py-10 flex flex-col"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Title */}
      <h1 className="text-2xl font-bold leading-tight mb-8">{data.title}</h1>

      {/* Structured metadata */}
      <div className="mb-8">
        <MetaRow label={t("municipality")} value={data.municipality} />
        <MetaRow label={t("year")} value={data.year} />
        <MetaRow label={t("status")} value={data.status} />
        <MetaRow label={t("type")} value={data.tipus} />
        {data.premi && <MetaRow label={t("prize")} value={data.premi} />}
        {data.ambitM2 && (
          <MetaRow
            label={t("scope")}
            value={data.ambitM2.toLocaleString()}
            unit={t("squareMeters")}
          />
        )}
        <MetaRow label={t("program")} value={data.programa} />
        {data.sostreM2 && (
          <MetaRow
            label={t("built")}
            value={data.sostreM2.toLocaleString()}
            unit={t("squareMeters")}
          />
        )}
        {data.habitatges && (
          <MetaRow label={t("dwellings")} value={data.habitatges} />
        )}
      </div>

      {/* Description */}
      <div className="mb-8">
        <p className="text-sm leading-relaxed text-black">
          {data.descriptionShort}
        </p>
        {data.descriptionLong && data.descriptionLong !== data.descriptionShort && (
          <>
            {expanded && (
              <p className="text-sm leading-relaxed text-black mt-4 whitespace-pre-line">
                {data.descriptionLong}
              </p>
            )}
            <button
              onClick={() => setExpanded((e) => !e)}
              className="mt-3 text-xs text-gray-500 underline cursor-pointer border-none bg-transparent p-0 hover:text-black"
            >
              {expanded ? t("readLess") : t("readMore")}
            </button>
          </>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div
          className="text-xs text-gray-500 mt-auto"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {tags.map((tag) => tf(tag)).join(" / ")}
        </div>
      )}
    </div>
  );
}
