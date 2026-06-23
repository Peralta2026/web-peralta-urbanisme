"use client";

import { useTranslations } from "next-intl";
import { ALL_TAGS, type TagSlug } from "@/lib/types";

interface FilterBarProps {
  activeTags: TagSlug[];
  onToggle: (tag: TagSlug) => void;
  onClearAll: () => void;
}

export default function FilterBar({
  activeTags,
  onToggle,
  onClearAll,
}: FilterBarProps) {
  const t = useTranslations("filters");
  const hasActive = activeTags.length > 0;

  return (
    <div
      className="flex flex-wrap gap-x-6 gap-y-2 px-6 py-4 border-b border-black"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <button
        onClick={onClearAll}
        className={`text-xs uppercase tracking-wider cursor-pointer border-none bg-transparent p-0 transition-none ${
          !hasActive ? "text-black font-bold" : "text-gray-400 hover:text-black"
        }`}
      >
        {t("all")}
      </button>
      {ALL_TAGS.map((tag) => {
        const isActive = activeTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`text-xs uppercase tracking-wider cursor-pointer border-none bg-transparent p-0 transition-none ${
              isActive
                ? "text-black font-bold"
                : "text-gray-400 hover:text-black"
            }`}
          >
            {t(tag)}
          </button>
        );
      })}
    </div>
  );
}
