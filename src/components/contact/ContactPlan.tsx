"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* Plànol dibuixat de l'entorn de l'estudi. De l'oficina en surten ones;
   el "+" obre en gran les fotos de l'espai interior. */

const ESPAI_IMGS = ["/espai/1.jpg", "/espai/2.jpg", "/espai/3.jpg"];

const COPY: Record<string, { open: string; title: string; close: string; prev: string; next: string; alt: string }> = {
  ca: { open: "Veure el nostre espai", title: "El nostre espai", close: "Tancar", prev: "Anterior", next: "Següent", alt: "Plànol de l'entorn de l'estudi a Mataró: aparcaments, bus, Rodalies R1 i accessos" },
  es: { open: "Ver nuestro espacio", title: "Nuestro espacio", close: "Cerrar", prev: "Anterior", next: "Siguiente", alt: "Plano del entorno del estudio en Mataró: aparcamientos, bus, Rodalies R1 y accesos" },
  en: { open: "See our space", title: "Our space", close: "Close", prev: "Previous", next: "Next", alt: "Map of the studio's surroundings in Mataró: parking, bus, R1 rail and access" },
};

function EspaiViewer({ t, onClose }: { t: typeof COPY["ca"]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const n = ESPAI_IMGS.length;
  const touchX = useRef<number | null>(null);
  const prev = () => setI((v) => (v - 1 + n) % n);
  const next = () => setI((v) => (v + 1) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("pu-lightbox-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.body.classList.remove("pu-lightbox-open");
      window.removeEventListener("keydown", onKey);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="pu-espai"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
      }}
    >
      <button type="button" className="pu-espai-close" onClick={onClose} aria-label={t.close}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3" />
          <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
      <figure className="pu-espai-figure" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={i} src={ESPAI_IMGS[i]} alt={`${t.title} ${i + 1}`} />
        <figcaption>
          <span>{t.title}</span>
          <span className="pu-espai-count">{i + 1} / {n}</span>
        </figcaption>
      </figure>
      <button type="button" className="pu-espai-nav pu-espai-nav--prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label={t.prev}>‹</button>
      <button type="button" className="pu-espai-nav pu-espai-nav--next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label={t.next}>›</button>
    </div>
  );
}

export default function ContactPlan({ locale }: { locale: string }) {
  const t = COPY[locale] ?? COPY.ca;
  const [open, setOpen] = useState(false);

  return (
    <figure className="pu-contact-plan">
      <div className="pu-contact-plan-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/contacte/mataro-eixos.jpg" alt={t.alt} />
        <span className="pu-contact-wave" aria-hidden="true" />
        <span className="pu-contact-wave" aria-hidden="true" />
        <span className="pu-contact-wave" aria-hidden="true" />
        <button type="button" className="pu-contact-pin" onClick={() => setOpen(true)} aria-label={t.open}>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <line x1="20" y1="3" x2="20" y2="37" />
            <line x1="3" y1="20" x2="37" y2="20" />
          </svg>
        </button>
      </div>
      {/* Fora del contenidor fix perquè quedi per sobre de la capçalera */}
      {open && createPortal(<EspaiViewer t={t} onClose={() => setOpen(false)} />, document.body)}

      <style>{`
        /* El plànol comença a l'alçada de "Què teniu entre mans?" i ocupa la columna fins al marge */
        .pu-contact-plan {
          margin: 0;
          padding: calc(var(--header-height) + clamp(36px, 5vh, 64px) + clamp(32px, 4vw, 60px) + clamp(36px, 6vh, 64px)) var(--margin-page) 0 0;
        }
        .pu-contact-plan-img {
          position: relative;
          width: 100%;
          aspect-ratio: 1600 / 946;
        }
        /* En blanc i negre fins que s'hi passa el cursor */
        .pu-contact-plan-img { --wave: #000; }
        .pu-contact-plan-img > img { display: block; width: 100%; height: 100%; object-fit: contain; filter: grayscale(1) contrast(1.05); transition: filter 600ms ease; }
        .pu-contact-plan-img:hover > img, .pu-contact-plan-img:active > img { filter: none; }
        .pu-contact-plan-img:hover, .pu-contact-plan-img:active { --wave: #7a1010; }

        @keyframes pu-contact-wave {
          0%   { width: 0;   height: 0; opacity: 1; }
          65%  { opacity: 0.7; }
          100% { width: 22%; height: 0; padding-bottom: 22%; opacity: 0; }
        }
        .pu-contact-wave {
          position: absolute;
          left: 48.6%; top: 56.8%;
          width: 0; height: 0;
          border: 2.5px solid var(--wave);
          transition: border-color 600ms ease;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: pu-contact-wave 4.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .pu-contact-wave:nth-of-type(2) { animation-delay: 1.5s; }
        .pu-contact-wave:nth-of-type(3) { animation-delay: 3s; }

        /* El "+" de l'oficina: obre les fotos de l'espai */
        .pu-contact-pin {
          position: absolute;
          left: 48.6%; top: 56.8%;
          transform: translate(-50%, -50%);
          width: 46px; height: 46px;
          display: flex; align-items: center; justify-content: center;
          padding: 0; border: 0; background: none; cursor: pointer;
          transition: transform var(--dur-mid) var(--ease-smooth);
        }
        .pu-contact-pin svg { width: 100%; height: 100%; overflow: visible; }
        .pu-contact-pin line { stroke: #000; stroke-width: 3.2; stroke-linecap: square; }
        .pu-contact-pin:hover { transform: translate(-50%, -50%) scale(1.15); }
        .pu-contact-pin:focus-visible { outline: 1px solid #000; outline-offset: 3px; }

        /* Visor de l'espai */
        @keyframes pu-espai-in { from { opacity: 0; } to { opacity: 1; } }
        .pu-espai {
          position: fixed; inset: 0; z-index: 500;
          display: flex; align-items: center; justify-content: center;
          padding: 64px clamp(56px, 8vw, 120px) 40px;
          background: rgba(255,255,255,0.97);
          animation: pu-espai-in 260ms ease;
          cursor: zoom-out;
        }
        .pu-espai-figure { margin: 0; display: flex; flex-direction: column; max-width: 100%; max-height: 100%; cursor: default; }
        .pu-espai-figure img {
          display: block; max-width: 100%;
          max-height: calc(100vh - 170px); max-height: calc(100svh - 170px);
          object-fit: contain;
          animation: pu-espai-in 300ms ease;
        }
        .pu-espai-figure figcaption {
          display: flex; justify-content: space-between; gap: 24px;
          padding-top: 14px;
          font-family: var(--font-sans); font-size: var(--size-meta); color: #000;
        }
        .pu-espai-count { color: var(--color-muted); font-variant-numeric: tabular-nums; }
        .pu-espai-close {
          position: absolute; top: 24px; right: var(--margin-page);
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          border: 0; background: none; color: #000; cursor: pointer;
        }
        .pu-espai-close:hover { opacity: 0.5; }
        .pu-espai-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 48px; height: 72px; border: 0; background: none; cursor: pointer;
          font-family: var(--font-sans); font-size: 32px; font-weight: 300; color: #999;
        }
        .pu-espai-nav:hover { color: #000; }
        .pu-espai-nav--prev { left: clamp(4px, 2vw, 32px); }
        .pu-espai-nav--next { right: clamp(4px, 2vw, 32px); }

        @media (prefers-reduced-motion: reduce) {
          .pu-contact-wave { animation: none; width: 10%; padding-bottom: 10%; opacity: 0.6; }
          .pu-contact-wave:nth-of-type(n+2) { display: none; }
        }
        @media (max-width: 900px) {
          .pu-contact-plan { padding: 0 var(--margin-page) 56px; }
          .pu-contact-plan-img { width: 100%; }
          .pu-espai { padding: 64px var(--margin-mobile) 24px; }
          .pu-espai-nav { display: none; }
          .pu-espai-close { top: 12px; right: 8px; }
        }
      `}</style>
    </figure>
  );
}
