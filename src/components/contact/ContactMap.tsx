"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Carrer d'Argentona, 59 · 08302 Mataró, Barcelona
const LAT = 41.5392;
const LNG = 2.4412;
const ZOOM = 15;

const TILE_URL =
  "https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wmts/topografic-mut/MON3857NW/{z}/{x}/{y}.png";

const PIN_HTML = `
  <div style="
    width:14px;height:14px;
    background:#000;
    transform:rotate(45deg);
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
  "></div>
`;

export default function ContactMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      const map = L.map(containerRef.current!, {
        center: [LAT, LNG],
        zoom: ZOOM,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: true,
        attributionControl: false,
      });

      L.tileLayer(TILE_URL, { maxZoom: 19 }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: PIN_HTML,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker([LAT, LNG], { icon }).addTo(map);

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
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: "480px" }}
      />
      <style>{`
        .leaflet-container {
          background: #f2f1ee;
          filter: grayscale(1) contrast(1.85) brightness(0.90);
          opacity: 0.90;
        }
      `}</style>
    </>
  );
}
