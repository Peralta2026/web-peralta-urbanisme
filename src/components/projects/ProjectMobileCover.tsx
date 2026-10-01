"use client";

import Image from "next/image";

export const GALLERY_OPEN_EVENT = "pu-gallery-open";

/**
 * Portada a sang a dalt de la fitxa, només en mòbil. En tocar-la obre el visor
 * de la galeria (ProjectEditorialGallery escolta l'esdeveniment).
 */
export default function ProjectMobileCover({ slug, file, title }: { slug: string; file: string; title: string }) {
  return (
    <button
      type="button"
      className="pu-pcover"
      onClick={() => window.dispatchEvent(new CustomEvent(GALLERY_OPEN_EVENT, { detail: { file } }))}
      aria-label={title}
    >
      <Image src={`/projects/${slug}/${file}`} alt={title} fill priority quality={85} sizes="100vw" className="pu-pcover-img" />
      <style>{`
        .pu-pcover { display: none; }
        @media (max-width: 768px) {
          .pu-pcover {
            display: block;
            position: relative;
            width: 100%;
            aspect-ratio: 4 / 3;
            max-height: 62svh;
            padding: 0;
            border: 0;
            background: var(--color-gray-light);
            cursor: zoom-in;
            overflow: hidden;
          }
          .pu-pcover-img { object-fit: cover; }
        }
      `}</style>
    </button>
  );
}
