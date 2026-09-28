"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Carrer de l'Argentona, 29 · Pis 3-3 · 08302 Mataró, Barcelona
const LAT  = 41.5396;
const LNG  = 2.4408;
const ZOOM = 15;

export default function ContactMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [LAT, LNG],
        zoom: ZOOM,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: true,
        attributionControl: false,
      });

      // Esri World Light Gray Base — no API key, minimal, white
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18 }
      ).addTo(map);

      // Diamond black pin
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:12px;height:12px;
          background:#000;
          transform:rotate(45deg);
          box-shadow:0 2px 10px rgba(0,0,0,0.4);
        "></div>`,
        iconSize:   [12, 12],
        iconAnchor: [6, 6],
      });

      L.marker([LAT, LNG], { icon }).addTo(map);

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
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <style>{`
        .leaflet-container { background: #f5f5f3; }
        .leaflet-tile-pane { filter: contrast(1.04) brightness(1.01); }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          font-family: var(--font-mono) !important;
          font-size: 7px !important;
          background: rgba(255,255,255,0.7) !important;
          border-radius: 0 !important;
          padding: 2px 6px !important;
        }
      `}</style>
    </>
  );
}
