"use client";

import { useState } from "react";
import type { Project, Locale, TagSlug } from "@/lib/types";
import FilterBar from "./FilterBar";
import ProjectGridCell from "./ProjectGridCell";

interface Props {
  projects: Project[];
  locale: Locale;
}

export default function ProjectGrid({ projects, locale }: Props) {
  const [activeTags, setActiveTags] = useState<TagSlug[]>([]);

  const filtered =
    activeTags.length === 0
      ? projects
      : projects.filter((p) =>
          activeTags.every((tag) => p.tags.includes(tag))
        );

  function toggleTag(tag: TagSlug) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <>
      <FilterBar
        activeTags={activeTags}
        onToggle={toggleTag}
        onClearAll={() => setActiveTags([])}
      />

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-sm text-gray-400">
          Cap projecte amb aquests filtres.
        </div>
      ) : (
        /* Responsive grid: 3 cols desktop → 2 cols tablet → 1 col mobile */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-black">
          {filtered.map((project, i) => (
            <div key={project.slug} className="border-b border-r border-black">
              <ProjectGridCell
                project={project}
                locale={locale}
                type={i % 2 === 0 ? "image" : "text"}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
