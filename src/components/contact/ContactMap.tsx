"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

// Carrer de l'Argentona, 59 · Pis 3-3 · 08302 Mataró, Barcelona
const LAT  = 41.5407;
const LNG  = 2.4412;
const ZOOM = 16;

const ESPAI_IMGS = ["/espai/1.jpg", "/espai/2.jpg", "/espai/3.jpg"];

function mod(n: number, m: number) { return ((n % m) + m) % m; }

export default function ContactMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<unknown>(null);

  const [popupOpen,   setPopupOpen]   = useState(false);
  const [popupIdx,    setPopupIdx]    = useState(0);
  const [lightbox,    setLightbox]    = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [LAT, LNG],
        zoom: ZOOM,
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18 }
      ).addTo(map);

      // Circle pin with +
      const icon = L.divIcon({
        className: "",
        html: `<div class="pu-cmap-pin"><span class="pu-cmap-plus">+</span></div>`,
        iconSize:   [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([LAT, LNG], { icon }).addTo(map);
      marker.on("click", () => setPopupOpen(v => !v));

      setTimeout(() => map.invalidateSize(), 120);
      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Wrapper: position:relative so popup is positioned relative to this */}
      <div className="pu-cmap-wrap">
        <div ref={containerRef} className="pu-cmap-leaflet" />

        {/* Popup — fixed, espai dret de la pàgina */}
        {popupOpen && (
          <div className="pu-cmap-popup">
            <button className="pu-cmap-popup-close" onClick={() => setPopupOpen(false)}>×</button>

            {/* Imatge carousel — sense padding, va fins a la vora */}
            <div className="pu-cmap-strip">
              <button
                className="pu-cmap-arrow pu-cmap-arrow--l"
                onClick={() => setPopupIdx(i => mod(i - 1, ESPAI_IMGS.length))}
                aria-label="Anterior"
              >‹</button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ESPAI_IMGS[popupIdx]}
                alt={`Espai ${popupIdx + 1}`}
                className="pu-cmap-img"
                onClick={() => { setLightboxIdx(popupIdx); setLightbox(true); }}
              />
              <button
                className="pu-cmap-arrow pu-cmap-arrow--r"
                onClick={() => setPopupIdx(i => mod(i + 1, ESPAI_IMGS.length))}
                aria-label="Següent"
              >›</button>
            </div>

            {/* Info */}
            <div className="pu-cmap-popup-inner">
              <p className="pu-cmap-popup-title">El nostre espai</p>
              <div className="pu-cmap-dots">
                {ESPAI_IMGS.map((_, i) => (
                  <button
                    key={i}
                    className={`pu-cmap-dot${i === popupIdx ? " pu-cmap-dot--on" : ""}`}
                    onClick={() => setPopupIdx(i)}
                    aria-label={`Imatge ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox — fixed, outside everything */}
      {lightbox && (
        <div className="pu-cmap-lightbox" onClick={() => setLightbox(false)}>
          <button className="pu-cmap-lb-close" onClick={() => setLightbox(false)}>×</button>
          <button
            className="pu-cmap-lb-arrow pu-cmap-lb-arrow--l"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => mod(i - 1, ESPAI_IMGS.length)); }}
          >‹</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ESPAI_IMGS[lightboxIdx]}
            alt={`Espai ${lightboxIdx + 1}`}
            className="pu-cmap-lb-img"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="pu-cmap-lb-arrow pu-cmap-lb-arrow--r"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => mod(i + 1, ESPAI_IMGS.length)); }}
          >›</button>
        </div>
      )}

      <style>{`
        /* ── Mapa ── */
        .pu-cmap-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          isolation: isolate;
        }
        .pu-cmap-leaflet {
          position: absolute;
          inset: 0;
        }

        /* Leaflet overrides */
        .leaflet-container { background: #f5f5f3; }
        .leaflet-tile-pane { filter: contrast(1.04) brightness(1.01); }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          font-family: var(--font-sans) !important;
          font-size: var(--size-meta) !important;
          background: rgba(255,255,255,0.7) !important;
          border-radius: 0 !important;
          padding: 2px 6px !important;
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(0,0,0,0.15) !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .leaflet-control-zoom a {
          border-radius: 0 !important;
          color: #111 !important;
          font-family: var(--font-sans) !important;
          font-size: 15px !important;
          font-weight: 300 !important;
          width: 26px !important;
          height: 26px !important;
          line-height: 26px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* ── Pin ── */
        .pu-cmap-pin {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
          transition: transform 200ms ease, background 200ms ease;
        }
        .pu-cmap-pin:hover { transform: scale(1.1); background: #222; }
        .pu-cmap-plus {
          color: #fff;
          font-size: 20px;
          font-weight: 300;
          font-family: var(--font-sans);
          line-height: 1;
          user-select: none;
        }

        /* ── Popup — fixed, en l'espai buit a la dreta ── */
        .pu-cmap-popup {
          position: fixed;
          top: 50%;
          right: clamp(24px, 8vw, 120px);
          transform: translateY(-50%);
          z-index: 9000;
          width: 280px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          overflow: hidden;
          pointer-events: all;
        }
        .pu-cmap-popup-inner {
          padding: 16px 16px 14px;
        }
        .pu-cmap-popup-close {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.92);
          color: #111;
          font-family: var(--font-sans);
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: background 150ms ease;
        }
        .pu-cmap-popup-close:hover { background: #fff; }
        .pu-cmap-popup-title {
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          color: #aaa;
          margin: 0 0 10px;
        }
        @media (max-width: 640px) {
          .pu-cmap-popup {
            right: 50%;
            transform: translate(50%, -50%);
            width: min(280px, calc(100vw - 40px));
          }
        }

        /* Strip */
        .pu-cmap-strip {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #eee;
        }
        .pu-cmap-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          cursor: zoom-in;
          transition: opacity 200ms ease;
        }
        .pu-cmap-img:hover { opacity: 0.9; }
        .pu-cmap-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          background: rgba(255,255,255,0.88);
          border: none;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #000;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          transition: background 150ms ease;
          font-family: var(--font-sans);
        }
        .pu-cmap-arrow:hover { background: #fff; }
        .pu-cmap-arrow--l { left: 5px; }
        .pu-cmap-arrow--r { right: 5px; }

        /* Dots */
        .pu-cmap-dots {
          display: flex;
          justify-content: center;
          gap: 5px;
          margin-top: 9px;
        }
        .pu-cmap-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          border: none;
          background: #d0d0d0;
          cursor: pointer;
          padding: 0;
          transition: background 150ms ease;
        }
        .pu-cmap-dot--on { background: #000; }

        /* ── Lightbox ── */
        .pu-cmap-lightbox {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0,0,0,0.92);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pu-cmap-lb-img {
          max-width: 90vw;
          max-height: 88vh;
          object-fit: contain;
          display: block;
        }
        .pu-cmap-lb-close {
          position: absolute;
          top: 20px;
          right: 24px;
          background: none;
          border: none;
          color: #fff;
          font-size: 30px;
          cursor: pointer;
          font-family: var(--font-sans);
          line-height: 1;
          padding: 0;
          opacity: 0.7;
          transition: opacity 150ms;
        }
        .pu-cmap-lb-close:hover { opacity: 1; }
        .pu-cmap-lb-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #fff;
          font-size: 44px;
          cursor: pointer;
          padding: 0 20px;
          opacity: 0.55;
          transition: opacity 150ms;
          font-family: var(--font-sans);
          line-height: 1;
        }
        .pu-cmap-lb-arrow:hover { opacity: 1; }
        .pu-cmap-lb-arrow--l { left: 0; }
        .pu-cmap-lb-arrow--r { right: 0; }
      `}</style>
    </>
  );
}
