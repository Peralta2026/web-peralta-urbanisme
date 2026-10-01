"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Map as MLMap, MapLayerMouseEvent, GeoJSONSource, ExpressionSpecification } from "maplibre-gl";
import type { Locale, Project } from "@/lib/types";

const PeraltaMap = dynamic(() => import("./PeraltaMap"), { ssr: false });

/* Projectes sobre la cartografia pròpia: punt negre; en passar-hi per sobre,
   el punt creix, el perímetre del municipi es reforça i apareix una anotació
   (punt — línia — text). Clic → fitxa. En mòbil, el primer toc selecciona. */

type Pt = { slug: string; title: string; muni: string; year: string; lng: number; lat: number };
type MuniFeature = { properties: { c: string; n: string }; geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] } };

const COPY: Record<Locale, { projects: string; municipalities: string; view: string; list: string }> = {
  ca: { projects: "projectes", municipalities: "municipis", view: "Veure projecte", list: "Projectes al mapa" },
  es: { projects: "proyectos", municipalities: "municipios", view: "Ver proyecto", list: "Proyectos en el mapa" },
  en: { projects: "projects", municipalities: "municipalities", view: "View project", list: "Projects on the map" },
};

const hover = ["boolean", ["feature-state", "hover"], false];
const RADIUS = ["interpolate", ["linear"], ["zoom"],
  5, ["case", hover, 3.2, 1.6],
  8, ["case", hover, 4.4, 2.3],
  10, ["case", hover, 5.2, 2.9],
  13, ["case", hover, 6.2, 3.6],
] as unknown as ExpressionSpecification;

function toFC(pts: Pt[]) {
  return {
    type: "FeatureCollection" as const,
    features: pts.map((p, i) => ({ type: "Feature" as const, id: i, properties: { i }, geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] } })),
  };
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

export default function TerritorialMap({ projects, locale }: { projects: Project[]; locale: string }) {
  const loc = (["ca", "es", "en"].includes(locale) ? locale : "ca") as Locale;
  const t = COPY[loc];
  const router = useRouter();
  const pts = useMemo<Pt[]>(() => projects.map((p) => ({
    slug: p.slug, title: p[loc].title, muni: p[loc].municipality, year: p[loc].year,
    lng: p.coordinates.lng, lat: p.coordinates.lat,
  })), [projects, loc]);
  const municipalities = useMemo(() => new Set(pts.map((p) => p.muni.split(/[(,]/)[0].trim())).size, [pts]);

  const mapRef = useRef<MLMap | null>(null);
  const ptsRef = useRef(pts);
  ptsRef.current = pts;
  const muniCodes = useRef<Map<string, string>>(new Map());
  const munisRef = useRef<MuniFeature[]>([]);
  const activeRef = useRef<number | null>(null);
  const [active, setActive] = useState<{ i: number; x: number; y: number; flip: boolean } | null>(null);

  const place = (i: number | null) => {
    const map = mapRef.current;
    if (!map || i === null || !ptsRef.current[i]) { setActive(null); return; }
    const p = ptsRef.current[i];
    const { x, y } = map.project([p.lng, p.lat]);
    const w = map.getContainer().clientWidth;
    setActive({ i, x, y, flip: x > w - 280 });
  };

  const highlight = (i: number | null) => {
    const map = mapRef.current;
    if (!map) return;
    if (activeRef.current !== null) map.setFeatureState({ source: "projects", id: activeRef.current }, { hover: false });
    activeRef.current = i;
    if (i !== null) map.setFeatureState({ source: "projects", id: i }, { hover: true });
    const p = i !== null ? ptsRef.current[i] : null;
    const code = p ? muniCodes.current.get(p.slug) ?? "" : "";
    if (map.getLayer("muni-selected")) map.setFilter("muni-selected", ["==", ["get", "c"], code]);
    place(i);
  };

  const indexMunis = () => {
    muniCodes.current = new Map(ptsRef.current.map((p) => [p.slug, muniOf([p.lng, p.lat], munisRef.current)]));
  };

  const onReady = (map: MLMap) => {
    mapRef.current = map;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __puMap?: MLMap }).__puMap = map;
    const touch = window.matchMedia("(hover: none)").matches;

    map.addSource("projects", { type: "geojson", data: toFC(ptsRef.current) });
    map.addLayer({ id: "project-points", type: "circle", source: "projects",
      paint: { "circle-color": "#000", "circle-radius": RADIUS, "circle-radius-transition": { duration: 160 } } });
    map.addLayer({ id: "project-hit", type: "circle", source: "projects",
      paint: { "circle-radius": touch ? 16 : 10, "circle-opacity": 0 } });

    // Els polígons municipals (per al perímetre ressaltat) arriben després del primer dibuix
    void fetch("/territorial/muni-poly.json").then((r) => r.json()).then((json) => {
      if (!mapRef.current) return;
      munisRef.current = json.features;
      indexMunis();
      map.addSource("muni-poly", { type: "geojson", data: json });
      map.addLayer({ id: "muni-selected", type: "line", source: "muni-poly", filter: ["==", ["get", "c"], ""],
        paint: { "line-color": "#000", "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1, 11, 1.4] } }, "project-points");
      if (activeRef.current !== null) highlight(activeRef.current);
    });

    const idx = (e: MapLayerMouseEvent) => Number(e.features?.[0]?.properties?.i);
    if (!touch) {
      map.on("mousemove", "project-hit", (e) => {
        const i = idx(e);
        map.getCanvas().style.cursor = "pointer";
        if (i !== activeRef.current) highlight(i);
      });
      map.on("mouseleave", "project-hit", () => { map.getCanvas().style.cursor = ""; highlight(null); });
      map.on("click", "project-hit", (e) => {
        const p = ptsRef.current[idx(e)];
        if (p) router.push(`/${locale}/projectes/${p.slug}`);
      });
    } else {
      // Primer toc: selecciona; segon toc al mateix punt: obre la fitxa
      map.on("click", (e) => {
        const hit = map.queryRenderedFeatures(e.point, { layers: ["project-hit"] });
        if (!hit.length) { highlight(null); return; }
        const i = Number(hit[0].properties?.i);
        if (i === activeRef.current) router.push(`/${locale}/projectes/${ptsRef.current[i].slug}`);
        else highlight(i);
      });
    }
    map.on("move", () => place(activeRef.current));
  };

  // Els filtres actualitzen els punts
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    highlight(null);
    (map.getSource("projects") as GeoJSONSource | undefined)?.setData(toFC(pts));
    if (munisRef.current.length) indexMunis();
  }, [pts]); // eslint-disable-line react-hooks/exhaustive-deps

  const a = active && pts[active.i] ? { ...active, p: pts[active.i] } : null;

  return (
    <div className="pu-tmap">
      <PeraltaMap locale={locale} onReady={onReady} padding={{ top: 72, bottom: 48, left: 48, right: 48 }} />

      <p className="pu-tmap-count" aria-live="polite">
        <span>{pts.length} {t.projects}</span>
        <span>{municipalities} {t.municipalities}</span>
      </p>

      {a && (
        <div className={`pu-ann${a.flip ? " is-flip" : ""}`} style={{ left: a.x, top: a.y }}>
          <span className="pu-ann-line" aria-hidden="true" />
          <div className="pu-ann-text">
            <strong>{a.p.title}</strong>
            <span>{a.p.muni}</span>
            {a.p.year && <span>{a.p.year}</span>}
            <Link href={`/${locale}/projectes/${a.p.slug}`} className="pu-ann-link">{t.view} →</Link>
          </div>
        </div>
      )}

      <nav className="pu-tmap-sr" aria-label={t.list}>
        <ul>
          {pts.map((p) => (
            <li key={p.slug}><Link href={`/${locale}/projectes/${p.slug}`}>{p.title} — {p.muni}{p.year ? `, ${p.year}` : ""}</Link></li>
          ))}
        </ul>
      </nav>

      <style>{`
        .pu-tmap { position: absolute; inset: 0; }
        .pu-tmap-count {
          position: absolute; top: 16px; right: var(--margin-page); z-index: 3; margin: 0;
          display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
          font-family: var(--font-sans); font-size: var(--size-meta); color: #000;
          font-variant-numeric: tabular-nums; pointer-events: none;
        }
        .pu-ann {
          position: absolute; z-index: 3;
          display: flex; align-items: flex-start;
          pointer-events: none;
          font-family: var(--font-sans);
        }
        .pu-ann-line { display: block; width: 52px; height: 1px; margin-top: 0; background: #000; }
        .pu-ann-text {
          display: flex; flex-direction: column;
          margin: -7px 0 0 8px;
          font-size: 12px; line-height: 1.35; color: #000;
          text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 2px #fff;
          white-space: nowrap;
        }
        .pu-ann-text strong { font-size: 13px; font-weight: 700; letter-spacing: -0.01em; text-transform: uppercase; }
        .pu-ann.is-flip { flex-direction: row-reverse; transform: translateX(-100%); }
        .pu-ann.is-flip .pu-ann-text { margin: -7px 8px 0 0; align-items: flex-end; text-align: right; }
        .pu-ann-link { display: none; }
        @media (hover: none) {
          .pu-ann-link {
            pointer-events: auto;
            display: inline-block; margin-top: 6px; padding: 4px 0;
            color: #000; font-weight: 600; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px;
          }
        }
        .pu-tmap-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .pu-tmap-sr:focus-within {
          width: auto; height: auto; clip: auto; overflow: auto; z-index: 4;
          top: 56px; left: var(--margin-page); max-height: 60%;
          background: #fff; padding: 12px 0; font-family: var(--font-sans); font-size: var(--size-meta);
        }
        .pu-tmap-sr ul { list-style: none; margin: 0; padding: 0; }
        .pu-tmap-sr a { color: #000; }
        @media (prefers-reduced-motion: reduce) {
          .pu-ann { transition: none; }
        }
      `}</style>
    </div>
  );
}
