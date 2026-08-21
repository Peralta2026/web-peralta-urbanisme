"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { ProjectImageData } from "@/lib/project-images";
import styles from "./ProjectGallery.module.css";

interface Props {
  slug: string;
  images: ProjectImageData[];
  title: string;
}

interface GallerySection {
  feature?: ProjectImageData;
  columns?: [ProjectImageData[], ProjectImageData[]];
}

function balanceColumns(images: ProjectImageData[]): [ProjectImageData[], ProjectImageData[]] {
  const columns: [ProjectImageData[], ProjectImageData[]] = [[], []];
  const heights = [0, 0];

  images.forEach((image) => {
    const column = heights[0] <= heights[1] ? 0 : 1;
    columns[column].push(image);
    heights[column] += image.height / image.width;
  });

  return columns;
}

function composeGallery(images: ProjectImageData[]): GallerySection[] {
  const sections: GallerySection[] = [];
  let pending: ProjectImageData[] = [];

  const flushPending = () => {
    if (!pending.length) return;
    sections.push({ columns: balanceColumns(pending) });
    pending = [];
  };

  images.forEach((image) => {
    const ratio = image.width / image.height;
    if (ratio >= 1.82) {
      flushPending();
      sections.push({ feature: image });
    } else {
      pending.push(image);
    }
  });

  flushPending();
  return sections;
}

export default function ProjectEditorialGallery({ slug, images, title }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const sections = useMemo(() => composeGallery(images), [images]);

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") {
        setActive((current) => current === null ? null : (current - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight") {
        setActive((current) => current === null ? null : (current + 1) % images.length);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, images.length]);

  const renderImage = (image: ProjectImageData) => {
    const index = images.findIndex((item) => item.file === image.file);
    return (
      <button
        key={image.file}
        type="button"
        className={styles.imageButton}
        onClick={() => setActive(index)}
        aria-label={`${title} — ${index + 1}/${images.length}`}
      >
        <Image
          className={styles.image}
          src={`/projects/${slug}/${image.file}`}
          alt={`${title} — ${index + 1}`}
          width={image.width}
          height={image.height}
          sizes="(max-width: 720px) 50vw, (max-width: 1100px) 45vw, 30vw"
          loading={index < 4 ? "eager" : "lazy"}
        />
        <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
      </button>
    );
  };

  if (!images.length) return null;

  return (
    <>
      <div className={styles.gallery}>
        {sections.map((section, sectionIndex) => {
          if (section.feature) return renderImage(section.feature);
          if (!section.columns) return null;

          return (
            <div className={styles.columns} key={`section-${sectionIndex}`}>
              {section.columns.map((column, columnIndex) => (
                <div className={styles.column} key={`column-${columnIndex}`}>
                  {column.map(renderImage)}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {active !== null && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={title}>
          <Image
            className={styles.lightboxImage}
            src={`/projects/${slug}/${images[active].file}`}
            alt={`${title} — ${active + 1}`}
            width={images[active].width}
            height={images[active].height}
            sizes="100vw"
          />
          <button className={styles.close} type="button" onClick={() => setActive(null)} aria-label="Close">×</button>
          {images.length > 1 && (
            <>
              <button className={styles.previous} type="button" onClick={() => setActive((active - 1 + images.length) % images.length)} aria-label="Previous">←</button>
              <button className={styles.next} type="button" onClick={() => setActive((active + 1) % images.length)} aria-label="Next">→</button>
            </>
          )}
          <span className={styles.counter}>{active + 1} / {images.length}</span>
        </div>
      )}
    </>
  );
}
