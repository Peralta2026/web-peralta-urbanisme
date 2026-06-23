"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  slug: string;
  images: string[];
  title: string;
}

export default function ImageCarousel({ slug, images, title }: Props) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Main image */}
      <div className="flex-1 relative overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/projects/${slug}/${images[current]}`}
          alt={`${title} — ${current + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Nav arrows — only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-black flex items-center justify-center text-black text-sm hover:bg-black hover:text-white transition-colors"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Següent"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-black flex items-center justify-center text-black text-sm hover:bg-black hover:text-white transition-colors"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1.5 p-3 bg-white border-t border-black overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-12 h-12 overflow-hidden border transition-none ${
                i === current ? "border-black" : "border-gray-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/projects/${slug}/${img}`}
                alt={`Miniatura ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
