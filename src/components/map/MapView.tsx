"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale, Project } from "@/lib/types";

function projectHref(slug: string, locale: string) {
  return `/${locale}/projectes/${slug}`;
}

function markerVariant(slug: string) {
  return [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 8;
}

export default function MapView({ projects, locale }: { projects: Project[]; locale: string }) {
  const [selected, setSelected] = useState<Project | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const projectsRef = useRef(projects);
  const localeRef = useRef(locale);

  projectsRef.current = projects;
  localeRef.current = locale;

  function addMarker(leaflet: typeof import("leaflet"), target: import("leaflet").LayerGroup, project: Project) {
    const activeLocale = localeRef.current as Locale;
    const variant = markerVariant(project.slug);
    const icon = leaflet.divIcon({
      className: "pu-project-marker-host",
      html: `<span class="pu-project-marker variant-${variant}" aria-hidden="true"><i></i><b>+</b></span>`,
      iconSize: [58, 58],
      iconAnchor: [29, 29],
    });
    const marker = leaflet.marker([project.coordinates.lat, project.coordinates.lng], {
      icon,
      title: project[activeLocale].title,
      keyboard: true,
      bubblingMouseEvents: false,
    }).addTo(target);
    marker.bindTooltip(
      `<strong>${project[activeLocale].title}</strong><span>${project[activeLocale].municipality} · ${project[activeLocale].year}</span>`,
      { className: "pu-project-tooltip", direction: "top", offset: [0, -22], opacity: 1 }
    );
    marker.on("click", () => setSelected(project));
  }

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return;
    let cancelled = false;

    void import("leaflet").then((module) => {
      if (cancelled || !elementRef.current) return;
      const L = module.default;
      const map = L.map(elementRef.current, {
        center: [41.48, 2.08],
        zoom: 9,
        minZoom: 7,
        maxZoom: 17,
        zoomControl: false,
      });

      L.tileLayer("https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wmts/topografic-mut/MON3857NW/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.icgc.cat">ICGC</a>',
        maxZoom: 18,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      const markerLayer = L.layerGroup().addTo(map);
      projectsRef.current.forEach((project) => addMarker(L, markerLayer, project));
      markerLayerRef.current = markerLayer;
      leafletRef.current = L;
      mapRef.current = map;

      const setZoomMode = () => {
        map.getContainer().dataset.zoomMode = map.getZoom() < 9 ? "territory" : "point";
      };
      setZoomMode();
      map.on("zoomend", setZoomMode);
      map.on("click", () => setSelected(null));
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      markerLayerRef.current = null;
    };
  }, []); // The map instance must survive filter changes.

  useEffect(() => {
    const L = leafletRef.current;
    const layer = markerLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    projects.forEach((project) => addMarker(L, layer, project));
  }, [projects, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selected && !projects.some((project) => project.slug === selected.slug)) setSelected(null);
  }, [projects, selected]);

  const activeLocale = locale as Locale;

  return (
    <>
      <div ref={elementRef} className="pu-map" />
      {selected && (
        <aside className="pu-map-card" aria-label={selected[activeLocale].title}>
          <button type="button" className="pu-map-card-close" onClick={() => setSelected(null)} aria-label="Tancar">×</button>
          <div className="pu-map-card-image">
            <Image
              src={`/projects/${selected.slug}/${selected.coverImage}`}
              alt={selected[activeLocale].title}
              fill
              sizes="(max-width: 640px) 78vw, 320px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="pu-map-card-copy">
            <h2>{selected[activeLocale].title}</h2>
            <span>{selected[activeLocale].municipality}</span>
            <p>{[selected[activeLocale].year, selected[activeLocale].tipus, selected[activeLocale].status].filter(Boolean).join(" · ")}</p>
            <Link href={projectHref(selected.slug, locale)}>Veure projecte <b>→</b></Link>
          </div>
        </aside>
      )}
      <style>{`
        .pu-map { width: 100%; height: 100%; background: #fff; }
        .pu-map .leaflet-tile-pane { filter: grayscale(1) brightness(1.55) contrast(0.85); }
        .pu-map-card { position: absolute; left: var(--margin-page); bottom: 28px; z-index: 400; width: min(300px, calc(100vw - 40px)); background: #fff; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: hidden; }
        .pu-map-card-close { position: absolute; top: 10px; right: 10px; z-index: 2; width: 26px; height: 26px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.12); background: rgba(255,255,255,0.92); color: var(--color-fg); font-family: var(--font-mono); font-size: 16px; line-height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .pu-map-card-image { position: relative; width: 100%; aspect-ratio: 4 / 3; overflow: hidden; background: var(--color-gray-light); }
        .pu-map-card-copy { padding: 16px 18px 20px; }
        .pu-map-card-copy h2 { margin: 0 0 10px; color: var(--color-fg); font-family: var(--font-sans); font-size: 18px; font-weight: 650; letter-spacing: -.02em; line-height: 1.15; }
        .pu-map-card-copy > span, .pu-map-card-copy p { display: block; margin: 0; color: var(--color-muted); font-family: var(--font-mono); font-size: 9px; letter-spacing: .08em; text-transform: uppercase; line-height: 1.6; }
        .pu-map-card-copy a { margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: space-between; color: var(--color-fg); font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: .1em; text-decoration: none; text-transform: uppercase; }
        .pu-map-card-copy a b { font-size: 14px; font-weight: 400; }
        .pu-project-marker-host { background: none; border: 0; }
        .pu-project-marker { position: relative; display: block; width: 58px; height: 58px; cursor: pointer; transition: transform var(--dur-fast) var(--ease-smooth); }
        .pu-project-marker::before, .pu-project-marker i { content: ""; position: absolute; left: 9px; top: 12px; width: 38px; height: 31px; background: rgba(29, 238, 64, .67); transform: rotate(-7deg); mix-blend-mode: multiply; }
        .pu-project-marker i { left: 18px; top: 7px; width: 28px; height: 38px; background: rgba(30, 224, 236, .62); transform: rotate(9deg); }
        .pu-project-marker b { position: absolute; inset: 0; display: grid; place-items: center; color: #050505; font-family: Arial, sans-serif; font-size: 34px; font-weight: 400; line-height: 1; z-index: 2; }
        .pu-project-marker.variant-1::before, .pu-project-marker.variant-5::before { background: rgba(255, 213, 0, .76); transform: rotate(6deg); }
        .pu-project-marker.variant-1 i, .pu-project-marker.variant-5 i { background: rgba(255, 38, 205, .57); transform: rotate(-10deg); }
        .pu-project-marker.variant-2::before, .pu-project-marker.variant-6::before { background: rgba(30, 224, 236, .62); transform: rotate(10deg); }
        .pu-project-marker.variant-2 i, .pu-project-marker.variant-6 i { background: rgba(29, 238, 64, .63); transform: rotate(-5deg); }
        .pu-project-marker.variant-3::before, .pu-project-marker.variant-7::before { background: rgba(255, 38, 205, .57); transform: rotate(-9deg); }
        .pu-project-marker.variant-3 i, .pu-project-marker.variant-7 i { background: rgba(255, 213, 0, .72); transform: rotate(7deg); }
        .pu-project-marker.variant-4 { transform: rotate(7deg); }
        .pu-project-marker.variant-5 { transform: rotate(-5deg); }
        .pu-project-marker.variant-6 { transform: translate(7px, -5px); }
        .pu-project-marker.variant-7 { transform: translate(-6px, 5px); }
        .pu-project-marker:hover { transform: scale(1.12); z-index: 5; }
        .pu-map[data-zoom-mode="territory"] .pu-project-marker { transform: scale(.72); }
        .pu-map[data-zoom-mode="territory"] .pu-project-marker i { opacity: 0; }
        .pu-project-tooltip { border: 1px solid #111; border-radius: 0; box-shadow: none; padding: 10px 12px; background: rgba(255,255,255,.96); color: #111; }
        .pu-project-tooltip::before { display: none; }
        .pu-project-tooltip strong, .pu-project-tooltip span { display: block; }
        .pu-project-tooltip strong { max-width: 220px; font-family: var(--font-sans); font-size: 12px; line-height: 1.3; }
        .pu-project-tooltip span { margin-top: 5px; font-family: var(--font-mono); font-size: 9px; color: var(--color-muted); letter-spacing: .04em; }
        .leaflet-control-zoom { border: 1px solid #111 !important; border-radius: 0 !important; box-shadow: none !important; }
        .leaflet-control-zoom a { border-radius: 0 !important; color: #111 !important; font-family: var(--font-mono) !important; font-size: 14px !important; }
        .leaflet-control-attribution { border-radius: 0 !important; background: rgba(255,255,255,.82) !important; font-family: var(--font-mono) !important; font-size: 8px !important; }
        .leaflet-attribution-flag { display: none !important; }
        @media (max-width: 640px) {
          .pu-map-card { left: 50%; bottom: 16px; width: min(78vw, 300px); transform: translateX(-50%); }
          .pu-map-card-image { aspect-ratio: 16 / 10; }
        }
      `}</style>
    </>
  );
}
