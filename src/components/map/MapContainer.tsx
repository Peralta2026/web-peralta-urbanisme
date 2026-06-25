"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface MarkerData {
  slug: string;
  lat: number;
  lng: number;
  title: string;
  municipality: string;
  year: string;
  status?: string;
  coverImage?: string;
}

interface Props {
  markers: MarkerData[];
  locale: string;
}

function projectHref(slug: string, locale: string): string {
  return locale === "ca" ? `/projectes/${slug}` : `/${locale}/projectes/${slug}`;
}

export default function MapContainer({ markers, locale }: Props) {
  const [selected, setSelected] = useState<MarkerData | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      // Afegim el CSS de Leaflet si no està ja carregat
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const map = L.map(mapRef.current!, {
        center: [41.72, 1.5],
        zoom: 8,
        zoomControl: false,
        attributionControl: true,
      });

      mapInstance.current = map;

      // Capa base: CartoDB Positron — gris net, tipografia neta, ideal per urbanisme
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Zoom control: cantonada inferior dreta
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Marcadors
      markers.forEach((m) => {
        const icon = L.divIcon({
          className: "",
          html: `<div class="peralta-pin"></div>`,
          iconSize: [12, 22],
          iconAnchor: [6, 22],
        });

        const marker = L.marker([m.lat, m.lng], { icon });
        marker.addTo(map);
        marker.on("click", () => {
          setSelected((prev) => (prev?.slug === m.slug ? null : m));
        });
      });

      // Clicar el mapa fora d'un marcador tanca el panel
      map.on("click", () => setSelected(null));
    });

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Mapa */}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Panel lateral — apareix en clicar un marcador */}
      {selected && (
        <aside
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "280px",
            background: "#fff",
            borderRight: "1px solid #000",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Botó tancar */}
          <button
            onClick={() => setSelected(null)}
            aria-label="Tancar"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              fontSize: "18px",
              lineHeight: 1,
              cursor: "pointer",
              border: "none",
              background: "transparent",
              padding: 0,
              color: "#000",
              fontFamily: "var(--font-mono)",
              zIndex: 1,
            }}
          >
            ×
          </button>

          {/* Imatge de portada */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              borderBottom: "1px solid #000",
              flexShrink: 0,
            }}
          >
            <Image
              src={`/projects/${selected.slug}/${selected.coverImage ?? "cover.jpg"}`}
              alt={selected.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="280px"
            />
          </div>

          {/* Metadades */}
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#888",
                marginBottom: "10px",
              }}
            >
              {selected.municipality}
            </p>

            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: 1.35,
                marginBottom: "10px",
                color: "#000",
              }}
            >
              {selected.title}
            </h2>

            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "#888",
              }}
            >
              {selected.year}
              {selected.status ? ` — ${selected.status}` : ""}
            </p>

            <div
              style={{
                marginTop: "auto",
                paddingTop: "24px",
                borderTop: "1px solid #000",
              }}
            >
              <Link
                href={projectHref(selected.slug, locale)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#000",
                  textDecoration: "none",
                }}
              >
                Veure projecte →
              </Link>
            </div>
          </div>
        </aside>
      )}

      {/* Estils dels marcadors i sobreescriptura Leaflet */}
      <style>{`
        .peralta-pin {
          width: 10px;
          height: 10px;
          background: #000;
          border-radius: 50%;
          position: relative;
          transition: transform 0.15s ease;
          cursor: pointer;
        }
        .peralta-pin::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 1.5px;
          height: 10px;
          background: #000;
        }
        .leaflet-marker-icon:hover .peralta-pin {
          transform: scale(1.25);
        }
        .leaflet-control-attribution {
          font-family: 'IBM Plex Mono', monospace !important;
          font-size: 9px !important;
          background: rgba(255,255,255,0.85) !important;
          border-radius: 0 !important;
        }
        .leaflet-control-zoom {
          border: 1px solid #000 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .leaflet-control-zoom a {
          border-radius: 0 !important;
          color: #000 !important;
          border-bottom: 1px solid #e0e0e0 !important;
          font-family: 'IBM Plex Mono', monospace !important;
          font-size: 14px !important;
          line-height: 26px !important;
          width: 26px !important;
          height: 26px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f2f2f2 !important;
        }
        .leaflet-container {
          background: #f5f5f0 !important;
        }
      `}</style>
    </div>
  );
}
