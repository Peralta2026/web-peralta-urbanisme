"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { Map as MLMap, Marker } from "maplibre-gl";
import type { Locale, Project } from "@/lib/types";

const PeraltaMap = dynamic(() => import("./PeraltaMap"), { ssr: false });

/* Projectes sobre la cartografia pròpia: etiquetes de color amb "+".
   En passar-hi per sobre es reforça el perímetre del municipi i apareix una
   anotació de plànol; en clicar s'obre la targeta del projecte. */

type MuniFeature = { properties: { c: string; n: string }; geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] } };

const COPY: Record<Locale, { projects: string; municipalities: string; view: string; close: string; inProgress: string }> = {
  ca: { projects: "projectes", municipalities: "municipis", view: "Veure projecte", close: "Tancar", inProgress: "En procés" },
  es: { projects: "proyectos", municipalities: "municipios", view: "Ver proyecto", close: "Cerrar", inProgress: "En proceso" },
  en: { projects: "projects", municipalities: "municipalities", view: "View project", close: "Close", inProgress: "In progress" },
};

function markerVariant(slug: string) {
  return [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 8;
}

function inRing([x, y]: number[], ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function muniOf(pt: number[], munis: MuniFeature[]) {
  for (const f of munis) {
    const polys = (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates) as number[][][][];
    if (polys.some((poly) => inRing(pt, poly[0]) && !poly.slice(1).some((hole) => inRing(pt, hole)))) return f.properties.c;
  }
  return "";
}

function ProjectCard({ project, locale, onClose }: { project: Project; locale: Locale; onClose: () => void }) {
  const t = COPY[locale];
  const ws = project.webStatus ?? "si";
  const hasPage = ws === "si" || ws === "relevant";
  const hasImage = hasPage && !!project.coverImage;
  const d = project[locale];
  return (
    <aside className="pu-map-card" aria-label={d.title}>
      <button type="button" className="pu-map-card-close" onClick={onClose} aria-label={t.close}>×</button>
      {hasImage && (
        <div className="pu-map-card-image">
          <Image src={`/projects/${project.slug}/${project.coverImage}`} alt={d.title} fill sizes="(max-width: 640px) 78vw, 320px" style={{ objectFit: "cover" }} />
        </div>
      )}
      <div className="pu-map-card-copy">
        <h2>{d.title}</h2>
        <span>{d.municipality}</span>
        <p>{[d.year, d.tipus, d.status].filter(Boolean).join(" · ")}</p>
        {hasPage ? (
          <Link href={`/${locale}/projectes/${project.slug}`}>{t.view} <b>→</b></Link>
        ) : ws === "en-proces" ? (
          <p className="pu-map-card-status">{t.inProgress}</p>
        ) : null}
      </div>
    </aside>
  );
}

export default function TerritorialMap({ projects, locale }: { projects: Project[]; locale: string }) {
  const loc = (["ca", "es", "en"].includes(locale) ? locale : "ca") as Locale;
  const t = COPY[loc];
  const municipalities = useMemo(() => new Set(projects.map((p) => p[loc].municipality.split(/[(,]/)[0].trim())).size, [projects, loc]);

  const mapRef = useRef<MLMap | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const projectsRef = useRef(projects);
  projectsRef.current = projects;
  const munisRef = useRef<MuniFeature[]>([]);
  const muniCodes = useRef<Map<string, string>>(new Map());
  const hoverRef = useRef<Project | null>(null);
  const [hovered, setHovered] = useState<{ p: Project; x: number; y: number; flip: boolean } | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);

  const place = () => {
    const map = mapRef.current;
    const p = hoverRef.current;
    if (!map || !p) { setHovered(null); return; }
    const { x, y } = map.project([p.coordinates.lng, p.coordinates.lat]);
    setHovered({ p, x, y, flip: x > map.getContainer().clientWidth - 300 });
  };

  const highlight = (p: Project | null) => {
    const map = mapRef.current;
    hoverRef.current = p;
    if (map?.getLayer("muni-selected")) map.setFilter("muni-selected", ["==", ["get", "c"], p ? muniCodes.current.get(p.slug) ?? "" : ""]);
    place();
  };

  const indexMunis = () => {
    muniCodes.current = new Map(projectsRef.current.map((p) => [p.slug, muniOf([p.coordinates.lng, p.coordinates.lat], munisRef.current)]));
  };

  const drawMarkers = () => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = projectsRef.current.map((p) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "pu-project-marker-host";
      el.setAttribute("aria-label", `${p[loc].title} — ${p[loc].municipality}`);
      el.innerHTML = `<span class="pu-project-marker variant-${markerVariant(p.slug)}" aria-hidden="true"><i></i><b>+</b></span>`;
      el.addEventListener("mouseenter", () => highlight(p));
      el.addEventListener("mouseleave", () => highlight(null));
      el.addEventListener("focus", () => highlight(p));
      el.addEventListener("blur", () => highlight(null));
      el.addEventListener("click", (e) => { e.stopPropagation(); setSelected(p); });
      return new lib.Marker({ element: el, anchor: "center" }).setLngLat([p.coordinates.lng, p.coordinates.lat]).addTo(map);
    });
  };

  const onReady = (map: MLMap) => {
    mapRef.current = map;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __puMap?: MLMap }).__puMap = map;
    void import("maplibre-gl").then((lib) => {
      libRef.current = lib.default as unknown as typeof import("maplibre-gl");
      drawMarkers();
    });

    const container = map.getContainer();
    const setZoomMode = () => { container.dataset.zoomMode = map.getZoom() < 9 ? "territory" : "point"; };
    setZoomMode();
    map.on("zoom", setZoomMode);
    map.on("move", place);
    map.on("click", () => setSelected(null));

    // Els polígons municipals (per al perímetre ressaltat) arriben després del primer dibuix
    void fetch("/territorial/muni-poly.json").then((r) => r.json()).then((json) => {
      if (!mapRef.current) return;
      munisRef.current = json.features;
      indexMunis();
      map.addSource("muni-poly", { type: "geojson", data: json });
      map.addLayer({ id: "muni-selected", type: "line", source: "muni-poly", filter: ["==", ["get", "c"], ""],
        paint: { "line-color": "#000", "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1, 11, 1.4, 14, 2] } });
    });
  };

  // Els filtres redibuixen les etiquetes
  useEffect(() => {
    if (!mapRef.current) return;
    highlight(null);
    drawMarkers();
    if (munisRef.current.length) indexMunis();
    if (selected && !projects.some((p) => p.slug === selected.slug)) setSelected(null);
  }, [projects]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { markersRef.current.forEach((m) => m.remove()); }, []);

  const h = hovered;

  return (
    <div className="pu-tmap">
      <PeraltaMap locale={locale} onReady={onReady} padding={{ top: 72, bottom: 48, left: 48, right: 48 }} />

      <p className="pu-tmap-count" aria-live="polite">
        <span>{projects.length} {t.projects}</span>
        <span>{municipalities} {t.municipalities}</span>
      </p>

      {h && (
        <div className={`pu-ann${h.flip ? " is-flip" : ""}`} style={{ left: h.x, top: h.y }} aria-hidden="true">
          <span className="pu-ann-line" />
          <div className="pu-ann-text">
            <strong>{h.p[loc].title}</strong>
            <span>{h.p[loc].municipality}</span>
            {h.p[loc].year && <span>{h.p[loc].year}</span>}
          </div>
        </div>
      )}

      {selected && <ProjectCard project={selected} locale={loc} onClose={() => setSelected(null)} />}

      <style>{`
        .pu-tmap { position: absolute; inset: 0; }
        .pu-tmap-count {
          position: absolute; top: 16px; right: var(--margin-page); z-index: 3; margin: 0;
          display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
          font-family: var(--font-sans); font-size: var(--size-meta); color: #000;
          font-variant-numeric: tabular-nums; pointer-events: none;
        }

        /* Anotació de plànol (hover) */
        .pu-ann { position: absolute; z-index: 3; display: flex; align-items: flex-start; pointer-events: none; font-family: var(--font-sans); }
        .pu-ann-line { display: block; width: 44px; height: 1px; margin-left: 24px; background: #000; }
        .pu-ann-text {
          display: flex; flex-direction: column; margin: -7px 0 0 8px;
          font-size: 12px; line-height: 1.35; color: #000; white-space: nowrap;
          text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 2px #fff;
        }
        .pu-ann-text strong { font-size: 13px; font-weight: 700; letter-spacing: -0.01em; text-transform: uppercase; }
        .pu-ann.is-flip { flex-direction: row-reverse; transform: translateX(-100%); }
        .pu-ann.is-flip .pu-ann-line { margin: 0 24px 0 0; }
        .pu-ann.is-flip .pu-ann-text { margin: -7px 8px 0 0; align-items: flex-end; text-align: right; }
        @media (hover: none) { .pu-ann { display: none; } }

        /* Etiquetes de projecte (com a la versió anterior) */
        .pu-project-marker-host { display: block; padding: 0; border: 0; background: none; cursor: pointer; }
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
        .pu-project-marker-host:hover .pu-project-marker, .pu-project-marker-host:focus-visible .pu-project-marker { transform: scale(1.12); }
        .pu-project-marker-host:hover, .pu-project-marker-host:focus-visible { z-index: 5; }
        .pu-project-marker-host:focus-visible { outline: 1px solid #000; outline-offset: -8px; }
        .maplibregl-map[data-zoom-mode="territory"] .pu-project-marker { transform: scale(.72); }
        .maplibregl-map[data-zoom-mode="territory"] .pu-project-marker i { opacity: 0; }

        /* Targeta del projecte (com a la versió anterior) */
        .pu-map-card { position: absolute; left: var(--margin-page); bottom: 28px; z-index: 400; width: min(300px, calc(100vw - 40px)); background: #fff; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: hidden; }
        .pu-map-card-close { position: absolute; top: 10px; right: 10px; z-index: 2; width: 26px; height: 26px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.12); background: rgba(255,255,255,0.92); color: var(--color-fg); font-family: var(--font-sans); font-size: 16px; line-height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .pu-map-card-image { position: relative; width: 100%; aspect-ratio: 4 / 3; overflow: hidden; background: var(--color-gray-light); }
        .pu-map-card-copy { padding: 16px 18px 20px; }
        .pu-map-card-copy h2 { margin: 0 0 10px; color: var(--color-fg); font-family: var(--font-sans); font-size: 17px; font-weight: 650; letter-spacing: -.02em; line-height: 1.2; overflow-wrap: break-word; word-break: break-word; }
        .pu-map-card-copy > span, .pu-map-card-copy p { display: block; margin: 0; color: var(--color-muted); font-family: var(--font-sans); font-size: var(--size-meta); line-height: 1.6; }
        .pu-map-card-copy a { margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: space-between; color: var(--color-fg); font-family: var(--font-sans); font-size: var(--size-meta); font-weight: 600; text-decoration: none; }
        .pu-map-card-copy a b { font-size: 14px; font-weight: 400; }
        .pu-map-card-status { margin-top: 18px !important; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.08); color: #888 !important; }
        @media (max-width: 640px) {
          .pu-map-card { left: 50%; bottom: 16px; width: min(78vw, 300px); transform: translateX(-50%); }
          .pu-map-card-image { aspect-ratio: 16 / 10; }
        }
      `}</style>
    </div>
  );
}
