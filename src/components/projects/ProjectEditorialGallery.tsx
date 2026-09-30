"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { ProjectImageData } from "@/lib/project-images";
import styles from "./ProjectGallery.module.css";

interface Props {
  slug: string;
  images: ProjectImageData[];
  title: string;
  /** Files fixades a mà des de la fitxa (galleryRows); la resta es compon sola */
  manualRows?: string[][];
}

interface GalleryItem extends ProjectImageData {
  index: number;
  ratio: number;
}

interface GalleryRow {
  items: GalleryItem[];
  /** Suma de proporcions: l'alçada de la fila és amplada / sum */
  sum: number;
  /** Proporció mínima perquè la fila no quedi desmesurada (una sola imatge vertical, l'última fila…) */
  minSum: number;
}

const LARGE = new Set(["cover", "big"]);

/**
 * Compon la galeria en files justificades: cada fila ocupa tota l'amplada i
 * totes les imatges d'una fila tenen la mateixa alçada, de manera que cap
 * imatge es retalla ni es deforma. La nomenclatura del servidor decideix la mida:
 *  - PORTADA (cover) i BIG 4 (big): grans, com a molt de dues en dues
 *  - LONG-HOR (wide): una fila sencera si és prou apaïsada
 *  - LONG-VER (tall) i 1x1 (small): petites, de tres en tres (quatre si n'hi ha de verticals)
 * L'ordre es respecta sempre, per això les seqüències queden juntes.
 */
function composeRows(images: ProjectImageData[], startIndex = 0): GalleryRow[] {
  const items: GalleryItem[] = images.map((image, i) => ({ ...image, index: startIndex + i, ratio: image.width / image.height }));
  const rows: GalleryRow[] = [];
  let current: GalleryItem[] = [];

  const sumOf = (list: GalleryItem[]) => list.reduce((acc, item) => acc + item.ratio, 0);
  const isLarge = (item: GalleryItem) => LARGE.has(item.intent) || (item.intent === "wide" && item.ratio < 1.6);
  const flush = (minSum?: number) => {
    if (!current.length) return;
    const large = current.some(isLarge);
    rows.push({ items: current, sum: sumOf(current), minSum: minSum ?? (large ? 1.25 : 2.4) });
    current = [];
  };

  items.forEach((item) => {
    // Imatges molt apaïsades: sempre soles, a tota l'amplada
    if (item.ratio >= 2.2 || (item.intent === "wide" && item.ratio >= 1.6)) {
      flush();
      rows.push({ items: [item], sum: item.ratio, minSum: 0 });
      return;
    }

    const large = isLarge(item);
    // Una peça gran no comparteix fila amb peces petites anteriors,
    // tret que la petita quedés sola i minúscula: llavors fan parella
    if (large && current.length && !current.some(isLarge) && sumOf(current) >= 1.6) flush();
    if (!large && current.some(isLarge) && current.length >= 2) flush();

    const rowLarge = large || current.some(isLarge);
    const target = rowLarge ? 2.4 : 3.3;
    const withItem = [...current, item];
    const maxItems = rowLarge ? 2 : withItem.some((i) => i.ratio < 0.9) ? 4 : 3;
    if (current.length && (sumOf(withItem) > target * 1.25 || withItem.length > maxItems)) flush();

    current.push(item);
    if (sumOf(current) >= target) flush();
  });
  flush();
  return rows;
}

export default function ProjectEditorialGallery({ slug, images: sourceImages, title, manualRows }: Props) {
  const [active, setActive] = useState<number | null>(null);

  // Primer les files fixades a mà, després la resta en l'ordre de la fitxa.
  // `images` queda en ordre de visualització perquè numeració i visor coincideixin.
  const { images, rows } = useMemo(() => {
    const byFile = new Map(sourceImages.map((image) => [image.file, image]));
    const fixed = (manualRows ?? [])
      .map((row) => row.map((file) => byFile.get(file)).filter((image): image is ProjectImageData => !!image))
      .filter((row) => row.length > 0);
    const used = new Set(fixed.flat().map((image) => image.file));
    const rest = sourceImages.filter((image) => !used.has(image.file));
    let index = 0;
    const fixedRows: GalleryRow[] = fixed.map((row) => {
      const items = row.map((image) => ({ ...image, index: index++, ratio: image.width / image.height }));
      return { items, sum: items.reduce((acc, item) => acc + item.ratio, 0), minSum: 0 };
    });
    return { images: [...fixed.flat(), ...rest], rows: [...fixedRows, ...composeRows(rest, index)] };
  }, [sourceImages, manualRows]);

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Amaga els controls de la pàgina (p. ex. "tornar a dalt") mentre el visor és obert
    document.body.classList.add("pu-lightbox-open");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") setActive((c) => (c === null ? null : (c - 1 + images.length) % images.length));
      if (event.key === "ArrowRight") setActive((c) => (c === null ? null : (c + 1) % images.length));
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("pu-lightbox-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, images.length]);

  if (!images.length) return null;

  return (
    <>
      <div className={styles.gallery}>
        {rows.map((row, r) => {
          const width = row.sum < row.minSum ? `${(row.sum / row.minSum) * 100}%` : "100%";
          return (
            <div key={r} className={styles.row} style={{ width }}>
              {row.items.map((item) => {
                const share = (item.ratio / row.sum) * (row.sum < row.minSum ? row.sum / row.minSum : 1);
                return (
                  <button
                    key={item.file}
                    type="button"
                    className={styles.imageButton}
                    style={{ flex: `${item.ratio} 1 0`, aspectRatio: String(item.ratio) }}
                    onClick={() => setActive(item.index)}
                    aria-label={`${title} — ${item.index + 1}/${images.length}`}
                  >
                    <Image
                      className={styles.image}
                      src={`/projects/${slug}/${item.file}`}
                      alt={`${title} — ${item.index + 1}`}
                      fill
                      quality={85}
                      sizes={`(max-width: 1023px) ${Math.ceil(share * 100)}vw, ${Math.ceil(share * 62)}vw`}
                      loading={item.index < 3 ? "eager" : "lazy"}
                    />
                    <span className={styles.number}>{String(item.index + 1).padStart(2, "0")}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {active !== null && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={title} onClick={() => setActive(null)}>
          <div className={styles.lightboxFrame}>
            <Image
              key={images[active].file}
              className={styles.lightboxImage}
              src={`/projects/${slug}/${images[active].file}`}
              alt={`${title} — ${active + 1}`}
              fill
              quality={90}
              sizes="100vw"
              priority
            />
          </div>
          <button className={styles.close} type="button" onClick={() => setActive(null)} aria-label="Close">×</button>
          {images.length > 1 && (
            <>
              <button className={styles.previous} type="button" onClick={(e) => { e.stopPropagation(); setActive((active - 1 + images.length) % images.length); }} aria-label="Previous">←</button>
              <button className={styles.next} type="button" onClick={(e) => { e.stopPropagation(); setActive((active + 1) % images.length); }} aria-label="Next">→</button>
            </>
          )}
          <span className={styles.counter}>{active + 1} / {images.length}</span>
        </div>
      )}
    </>
  );
}
