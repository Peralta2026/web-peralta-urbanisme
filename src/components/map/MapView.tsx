"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Project, Locale } from "@/lib/types";

function localizeHref(href: string, locale: string): string {
  if (locale === "ca") return href;
  return `/${locale}${href}`;
}

interface Props {
  projects: Project[];
  locale:   string;
}

export default function MapView({ projects, locale }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const leafletRef  = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    let L: typeof import("leaflet");
    let map: import("leaflet").Map;

    (async () => {
      L = (await import("leaflet")).default;

      map = L.map(mapRef.current!, {
        center:  [41.7, 1.9],
        zoom:    8,
        minZoom: 7,
        maxZoom: 16,
        zoomControl: true,
      });

      leafletRef.current = map;

      /* ── Tiles CartoDB Light (minimal) ── */
      const tileLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains:  "abcd",
          maxZoom:     20,
        }
      ).addTo(map);

      /* B&W filter on tile pane */
      const tilePane = map.getPanes().tilePane as HTMLElement;
      tilePane.style.filter = "grayscale(1) contrast(1.15) brightness(1.02)";

      const loc = locale as Locale;

      /* ── Project markers ── */
      projects.forEach(project => {
        const { lat, lng } = project.coordinates;
        if (lat === 0 && lng === 0) return; // skip placeholder coords

        const title = project[loc].title;
        const href  = localizeHref(`/projectes/${project.slug}`, locale);

        const marker = L.circleMarker([lat, lng], {
          radius:      4,
          fillColor:   "#000",
          fillOpacity: 1,
          color:       "#000",
          weight:      0,
        }).addTo(map);

        const popup = L.popup({
          closeButton: false,
          offset:      [0, -4],
          className:   "pu-map-popup",
        }).setContent(
          `<div style="font-family:var(--font-sans,sans-serif);padding:12px 14px;min-width:180px">
            <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#000;line-height:1.3">${title}</p>
            <a href="${href}" style="font-size:11px;font-family:var(--font-mono,monospace);letter-spacing:0.08em;text-transform:uppercase;color:#000;text-decoration:none;border-bottom:1px solid #000;padding-bottom:1px">
              Obrir projecte →
            </a>
          </div>`
        );

        marker.on("mouseover", () => {
          marker.setRadius(5.5);
          marker.bindPopup(popup).openPopup();
        });
        marker.on("mouseout", () => {
          marker.setRadius(4);
          setTimeout(() => { if (popup.isOpen()) marker.closePopup(); }, 300);
        });
        marker.on("click", () => { window.location.href = href; });
      });
    })();

    return () => {
      if (map) map.remove();
      leafletRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        .pu-map-popup .leaflet-popup-content-wrapper {
          border-radius: 0;
          border: 1px solid #e8e8e8;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          padding: 0;
        }
        .pu-map-popup .leaflet-popup-content { margin: 0; }
        .pu-map-popup .leaflet-popup-tip-container { display: none; }
        .leaflet-control-zoom a {
          border-radius: 0 !important;
          border-color: #ddd !important;
          font-family: var(--font-mono) !important;
          font-size: 14px !important;
        }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          font-family: var(--font-mono) !important;
          font-size: 9px !important;
          letter-spacing: 0.04em !important;
          color: #bbb !important;
          background: rgba(255,255,255,0.7) !important;
        }
        .leaflet-control-attribution a { color: #999 !important; }
      `}</style>
      <div ref={mapRef} style={{ width: "100%", height: "100%", background: "#f5f5f5" }} />
    </>
  );
}
