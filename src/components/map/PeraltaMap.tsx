"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MLMap, StyleSpecification, ExpressionSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/* Cartografia pròpia de Peralta: fons blanc i només límits administratius
   (ICGC per a Catalunya, IGN per al context d'Espanya). Sense mapa base,
   sense toponímia. El zoom revela: territori → províncies → municipis.
   Geometries generades per scripts/build-territorial.mjs. */

const CATALONIA: [[number, number], [number, number]] = [[0.16, 40.52], [3.33, 42.86]];
const SPAIN_LIMITS: [[number, number], [number, number]] = [[-13, 34], [7.5, 45.5]];
const DETAIL_FROM = 9.6;
const FIT_PADDING = { top: 110, bottom: 48, left: 48, right: 48 };
const INK = "#000";

const z = (...stops: number[]): ExpressionSpecification =>
  ["interpolate", ["linear"], ["zoom"], ...stops] as unknown as ExpressionSpecification;

/* Gruixos i opacitats per escala: cada jerarquia apareix progressivament */
const STYLE: StyleSpecification = {
  version: 8,
  sources: {
    // Mapa base vectorial de l'ICGC (esquema OpenMapTiles): només se'n dibuixen
    // vies, ferrocarril i edificis, amb el mateix traç negre; sense noms
    city: { type: "vector", tiles: ["https://geoserveis.icgc.cat/servei/catalunya/mapa-base2/vt/{z}/{x}/{y}.pbf"], minzoom: 8, maxzoom: 15 },
    spain: { type: "geojson", data: "/territorial/spain.json" },
    cat:   { type: "geojson", data: "/territorial/cat.json" },
    muni:  { type: "geojson", data: "/territorial/muni-lines.json" },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#fff" } },

    /* ── Ciutat (ICGC): el zoom revela vies → carrers → illes → edificis ── */
    // Edificis: contorn fi, sense color
    { id: "city-building", type: "fill", source: "city", "source-layer": "building", minzoom: 13.6,
      paint: { "fill-color": "#fff", "fill-outline-color": INK, "fill-opacity": z(13.6, 0, 14.4, 1) } },
    { id: "city-building-line", type: "line", source: "city", "source-layer": "building", minzoom: 13.6,
      paint: { "line-color": INK, "line-width": z(14, 0.25, 16, 0.45), "line-opacity": z(13.6, 0, 14.4, 1) } },
    // Ferrocarril
    { id: "city-rail", type: "line", source: "city", "source-layer": "transportation", minzoom: 10.5,
      filter: ["all", ["==", ["get", "class"], "rail"], ["!=", ["get", "brunnel"], "tunnel"]],
      paint: { "line-color": INK, "line-width": z(10.5, 0.4, 14, 0.8, 16, 1.2), "line-dasharray": [6, 3], "line-opacity": z(10.5, 0, 11.5, 1) } },
    // Carrers: a prop es dibuixen amb dues línies (vora negra, interior blanc) i les illes apareixen
    { id: "city-street-casing", type: "line", source: "city", "source-layer": "transportation", minzoom: 11.8,
      filter: ["all", ["in", ["get", "class"], ["literal", ["minor", "service", "pedestrian"]]], ["!=", ["get", "brunnel"], "tunnel"], ["==", ["geometry-type"], "LineString"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": INK, "line-width": z(11.8, 0.2, 13.5, 0.4, 14.6, 0.5, 15.2, 4, 17, 13), "line-opacity": z(11.8, 0, 12.8, 1) } },
    { id: "city-street-fill", type: "line", source: "city", "source-layer": "transportation", minzoom: 14.6,
      filter: ["all", ["in", ["get", "class"], ["literal", ["minor", "service", "pedestrian"]]], ["!=", ["get", "brunnel"], "tunnel"], ["==", ["geometry-type"], "LineString"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#fff", "line-width": z(14.6, 0, 15.2, 3, 17, 11.8) } },
    { id: "city-road-casing", type: "line", source: "city", "source-layer": "transportation", minzoom: 10.2,
      filter: ["all", ["in", ["get", "class"], ["literal", ["secondary", "tertiary", "secondary_link", "tertiary_link"]]], ["!=", ["get", "brunnel"], "tunnel"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": INK, "line-width": z(10.2, 0.25, 12, 0.5, 14.4, 0.8, 15.2, 6, 17, 18), "line-opacity": z(10.2, 0, 11, 1) } },
    { id: "city-road-fill", type: "line", source: "city", "source-layer": "transportation", minzoom: 14.4,
      filter: ["all", ["in", ["get", "class"], ["literal", ["secondary", "tertiary", "secondary_link", "tertiary_link"]]], ["!=", ["get", "brunnel"], "tunnel"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#fff", "line-width": z(14.4, 0, 15.2, 4.6, 17, 16.4) } },
    { id: "city-main-casing", type: "line", source: "city", "source-layer": "transportation", minzoom: 8.4,
      filter: ["all", ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "motorway_link", "trunk_link", "primary_link"]]], ["!=", ["get", "brunnel"], "tunnel"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": INK, "line-width": z(8.4, 0.3, 10, 0.6, 12, 0.9, 14, 1.2, 15.2, 8, 17, 24), "line-opacity": z(8.4, 0, 9.4, 1) } },
    { id: "city-main-fill", type: "line", source: "city", "source-layer": "transportation", minzoom: 14,
      filter: ["all", ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "motorway_link", "trunk_link", "primary_link"]]], ["!=", ["get", "brunnel"], "tunnel"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#fff", "line-width": z(14, 0, 15.2, 6.4, 17, 22) } },

    // Espanya (IGN). Els trams catalans només fins que entra el dibuix de l'ICGC
    { id: "es-prov", type: "line", source: "spain", filter: ["all", ["==", ["get", "k"], "prov"], ["==", ["get", "cat"], 0]],
      paint: { "line-color": INK, "line-width": z(5, 0.25, 6.6, 0.45, 8, 0.3, 10, 0.3), "line-opacity": z(5, 0, 6.2, 1) } },
    { id: "es-ccaa", type: "line", source: "spain", filter: ["all", ["==", ["get", "k"], "ccaa"], ["==", ["get", "cat"], 0]],
      paint: { "line-color": INK, "line-width": z(4, 0.55, 6.6, 0.9, 8, 0.55, 10, 0.55) } },
    { id: "es-pais", type: "line", source: "spain", filter: ["all", ["==", ["get", "k"], "pais"], ["==", ["get", "cat"], 0]],
      paint: { "line-color": INK, "line-width": z(4, 0.8, 6.6, 1.2, 8, 0.8, 10, 0.8) } },
    { id: "es-cat", type: "line", source: "spain", filter: ["all", ["==", ["get", "cat"], 1], ["!=", ["get", "k"], "prov"]],
      paint: { "line-color": INK, "line-width": ["match", ["get", "k"], "pais", 1.2, 0.9], "line-opacity": z(6.3, 1, 6.9, 0) } },
    { id: "es-cat-prov", type: "line", source: "spain", filter: ["all", ["==", ["get", "cat"], 1], ["==", ["get", "k"], "prov"]],
      paint: { "line-color": INK, "line-width": 0.45, "line-opacity": z(5, 0, 6.2, 1, 6.3, 1, 6.9, 0) } },

    // Catalunya (ICGC)
    { id: "cat-muni", type: "line", source: "muni", minzoom: 7.7, maxzoom: DETAIL_FROM + 0.8,
      paint: { "line-color": INK, "line-width": z(8, 0.2, 9, 0.34, 10, 0.42), "line-opacity": z(7.7, 0, 8.8, 1, DETAIL_FROM, 1, DETAIL_FROM + 0.8, 0) } },
    { id: "cat-prov", type: "line", source: "cat", filter: ["==", ["get", "k"], "catprov"],
      paint: { "line-color": INK, "line-width": z(6.5, 0.45, 9, 0.7, 12, 0.85), "line-opacity": z(6.3, 0, 6.9, 1) } },
    { id: "cat-outline", type: "line", source: "cat", filter: ["==", ["get", "k"], "cat"],
      paint: { "line-color": INK, "line-width": z(6.5, 1.2, 10, 1.4, 13, 1.6), "line-opacity": z(6.3, 0, 6.9, 1) } },
  ],
};

const DETAIL_LAYER = {
  id: "cat-muni-detail", type: "line" as const, source: "muni-detail", minzoom: DETAIL_FROM,
  paint: { "line-color": INK, "line-width": z(DETAIL_FROM, 0.42, 11, 0.5, 13, 0.65), "line-opacity": z(DETAIL_FROM, 0, DETAIL_FROM + 0.8, 1) },
};

const LABELS: Record<string, { zoomIn: string; zoomOut: string; gestures: string }> = {
  ca: { zoomIn: "Apropar", zoomOut: "Allunyar", gestures: "Fes servir dos dits per moure el mapa" },
  es: { zoomIn: "Acercar", zoomOut: "Alejar", gestures: "Usa dos dedos para mover el mapa" },
  en: { zoomIn: "Zoom in", zoomOut: "Zoom out", gestures: "Use two fingers to move the map" },
};

type Padding = { top: number; bottom: number; left: number; right: number };

export default function PeraltaMap({ locale, showZoom = false, onReady, padding = FIT_PADDING }: { locale: string; showZoom?: boolean; onReady?: (map: MLMap) => void; padding?: Padding }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const t = LABELS[locale] ?? LABELS.ca;

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    let cancelled = false;
    void import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelled || !ref.current) return;
      const touch = window.matchMedia("(hover: none)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const map = new maplibregl.Map({
        container: ref.current,
        style: STYLE,
        bounds: CATALONIA,
        fitBoundsOptions: { padding },
        maxBounds: SPAIN_LIMITS,
        minZoom: 4.2,
        maxZoom: 17,
        pitch: 0,
        bearing: 0,
        maxPitch: 0,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        renderWorldCopies: false,
        attributionControl: false,
        cooperativeGestures: touch,
        locale: { "CooperativeGesturesHandler.MobileHelpText": t.gestures, "CooperativeGesturesHandler.WindowsHelpText": t.gestures, "CooperativeGesturesHandler.MacHelpText": t.gestures },
        fadeDuration: reduced ? 0 : 300,
      });
      map.touchZoomRotate.disableRotation();
      map.keyboard.disableRotation();
      mapRef.current = map;

      let detailAdded = false;
      const addDetail = () => {
        if (detailAdded || map.getZoom() < DETAIL_FROM - 0.6) return;
        detailAdded = true;
        map.addSource("muni-detail", { type: "geojson", data: "/territorial/muni-detail.json" });
        map.addLayer(DETAIL_LAYER, "cat-prov");
      };
      // L'enquadrament inicial es refà quan el contenidor ja té la mida definitiva
      map.on("load", () => {
        map.resize();
        map.fitBounds(CATALONIA, { padding, duration: 0 });
        addDetail();
        onReady?.(map);
      });
      map.on("zoom", () => { addDetail(); if (showZoom) setZoom(map.getZoom()); });
      if (showZoom) setZoom(map.getZoom());
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomBy = (d: number) => mapRef.current?.easeTo({ zoom: (mapRef.current.getZoom() + d), duration: 350 });

  return (
    <div className="pu-pmap">
      <div ref={ref} className="pu-pmap-canvas" />
      <div className="pu-pmap-zoom">
        <button type="button" onClick={() => zoomBy(1)} aria-label={t.zoomIn}>+</button>
        <button type="button" onClick={() => zoomBy(-1)} aria-label={t.zoomOut}>−</button>
        {showZoom && zoom !== null && <span>z {zoom.toFixed(1)}</span>}
      </div>
      <p className="pu-pmap-attr">ICGC · IGN</p>
      <style>{`
        .pu-pmap { position: absolute; inset: 0; background: #fff; }
        .pu-pmap-canvas { position: absolute; inset: 0; }
        .pu-pmap .maplibregl-canvas { outline: none; }
        .pu-pmap-zoom {
          position: absolute; right: var(--margin-page); bottom: 28px; z-index: 2;
          display: flex; align-items: baseline; gap: 14px;
          font-family: var(--font-sans);
        }
        .pu-pmap-zoom button {
          padding: 4px 2px; border: 0; background: none; cursor: pointer;
          font-family: var(--font-sans); font-size: 22px; font-weight: 300; line-height: 1; color: #000;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-pmap-zoom button:hover { opacity: 0.4; }
        .pu-pmap-zoom span { font-size: var(--size-meta); color: var(--color-muted); font-variant-numeric: tabular-nums; }
        .pu-pmap-attr {
          position: absolute; left: var(--margin-page); bottom: 24px; z-index: 2; margin: 0;
          font-family: var(--font-sans); font-size: 11px; color: #9a9a9a;
        }
        .pu-pmap .maplibregl-cooperative-gesture-screen {
          background: rgba(255,255,255,0.86); color: #000;
          font-family: var(--font-sans); font-size: 15px;
        }
        @media (max-width: 900px) {
          .pu-pmap-zoom { display: none; }
          .pu-pmap-attr { bottom: calc(14px + env(safe-area-inset-bottom)); }
        }
      `}</style>
    </div>
  );
}
