"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface Marker {
  slug: string;
  lat: number;
  lng: number;
  title: string;
  municipality: string;
  year: string;
}

interface Props {
  markers: Marker[];
  locale: string;
}

function projectHref(slug: string, locale: string): string {
  return locale === "ca" ? `/projectes/${slug}` : `/${locale}/projectes/${slug}`;
}

export default function MapContainer({ markers, locale }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const style =
      process.env.NEXT_PUBLIC_MAPBOX_STYLE ||
      "mapbox://styles/mapbox/light-v11";

    if (!token) {
      console.warn("Mapbox token not set. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local");
      return;
    }

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style,
        center: [1.8, 41.7],
        zoom: 7.5,
      });

      mapInstance.current = map;

      map.on("load", () => {
        markers.forEach((m) => {
          // Custom marker: black square
          const el = document.createElement("div");
          el.style.cssText = `
            width: 12px;
            height: 12px;
            background: #000000;
            cursor: pointer;
            transition: width 0.15s, height 0.15s;
          `;
          el.addEventListener("mouseenter", () => {
            el.style.width = "16px";
            el.style.height = "16px";
          });
          el.addEventListener("mouseleave", () => {
            el.style.width = "12px";
            el.style.height = "12px";
          });

          const href = projectHref(m.slug, locale);

          const popup = new mapboxgl.Popup({
            closeButton: false,
            offset: 12,
            className: "peralta-popup",
          }).setHTML(`
            <div style="font-family: 'Instrument Sans', sans-serif; padding: 12px; min-width: 160px;">
              <p style="font-weight: 700; font-size: 13px; margin-bottom: 4px; line-height: 1.3;">${m.title}</p>
              <p style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #888; margin-bottom: 10px;">${m.municipality} — ${m.year}</p>
              <a href="${href}" style="font-size: 11px; color: #000; text-decoration: underline;">Veure projecte →</a>
            </div>
          `);

          new mapboxgl.Marker({ element: el })
            .setLngLat([m.lng, m.lat])
            .setPopup(popup)
            .addTo(map);
        });
      });
    });

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, [markers, locale]);

  return (
    <>
      <div ref={mapRef} className="w-full h-full" />
      <style jsx global>{`
        /* Override Mapbox popup default styles */
        .peralta-popup .mapboxgl-popup-content {
          border: 1px solid #000;
          border-radius: 0;
          box-shadow: none;
          padding: 0;
        }
        .peralta-popup .mapboxgl-popup-tip {
          display: none;
        }
        /* Hide Mapbox logo attribution minimal styling */
        .mapboxgl-ctrl-logo {
          opacity: 0.4;
        }
      `}</style>
    </>
  );
}
