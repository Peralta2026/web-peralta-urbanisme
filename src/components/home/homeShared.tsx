"use client";

import { useRouter } from "next/navigation";

export const FEATURED_SLUGS = [
  "la-miralda-pendent",
  "mpgm-bonaigua",
  "pmu-granollers-110b",
  "can-carreres-st-boi",
  "amb-ppu-hospital-valles",
  "alta-costura",
];

export const LOCALES = ["ca", "es", "en"] as const;

export const FIELD_LABELS: Record<string, { municipi: string; any: string; ambit: string; sostre: string; habitatges: string; readMore: string; view: string }> = {
  ca: { municipi: "Municipi", any: "Any", ambit: "Àmbit", sostre: "Sostre", habitatges: "Habitatges", readMore: "Llegir més", view: "Veure projecte" },
  es: { municipi: "Municipio", any: "Año", ambit: "Ámbito", sostre: "Techo", habitatges: "Viviendas", readMore: "Leer más", view: "Ver proyecto" },
  en: { municipi: "Municipality", any: "Year", ambit: "Scope", sostre: "Floor area", habitatges: "Dwellings", readMore: "Read more", view: "View project" },
};

export const UI_LABELS: Record<string, { noResults: string; explore: string }> = {
  ca: { noResults: "Cap projecte trobat", explore: "Explorar l'arxiu de projectes" },
  es: { noResults: "Sin proyectos", explore: "Explorar el archivo de proyectos" },
  en: { noResults: "No projects found", explore: "Explore the project archive" },
};

export const CONTENT = {
  ca: {
    line1: "El potencial d'un lloc no sempre és evident.",
    line2: "Saber veure'l és el principi del projecte.",
    line3: "Una mirada sensible. Un llapis audaç.",
    line4: "Urbanisme estratègic per transformar la complexitat en oportunitats de ciutat.",
    links: [
      { label: "Mapa ↗",      href: "/mapa",      sub: "On treballem" },
      { label: "Persones ↗",  href: "/equip",     sub: "Qui mira"     },
      { label: "Principis ↗", href: "/principis", sub: "Com pensem"   },
    ],
    destacats: "Projectes destacats",
  },
  es: {
    line1: "El potencial de un lugar no siempre es evidente.",
    line2: "Saberlo ver es el principio del proyecto.",
    line3: "Una mirada sensible. Un lápiz audaz.",
    line4: "Urbanismo estratégico para transformar la complejidad en oportunidades de ciudad.",
    links: [
      { label: "Mapa ↗",       href: "/mapa",      sub: "Dónde trabajamos" },
      { label: "Personas ↗",   href: "/equip",     sub: "Quién mira"       },
      { label: "Principios ↗", href: "/principis", sub: "Cómo pensamos"    },
    ],
    destacats: "Proyectos destacados",
  },
  en: {
    line1: "The potential of a place is not always evident.",
    line2: "Knowing how to see it is the beginning of the project.",
    line3: "A sensitive gaze. A bold pencil.",
    line4: "Strategic urbanism to transform complexity into city opportunities.",
    links: [
      { label: "Map ↗",        href: "/mapa",      sub: "Where we work" },
      { label: "People ↗",     href: "/equip",     sub: "Who looks"     },
      { label: "Principles ↗", href: "/principis", sub: "How we think"  },
    ],
    destacats: "Featured projects",
  },
} as const;

export function isValid(val: string | number | null | undefined): val is string | number {
  if (val === null || val === undefined) return false;
  if (val === "-" || val === "No aplica" || val === "") return false;
  if (typeof val === "number" && val <= 0) return false;
  return true;
}

export function LangSelector({ locale }: { locale: string }) {
  const router = useRouter();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-sans)", fontSize: "var(--size-meta)" }}>
      {LOCALES.map((loc, i) => (
        <span key={loc} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => router.push(`/${loc}/`)}
            style={{ fontSize: "var(--size-meta)", letterSpacing: "0.04em", fontWeight: locale === loc ? 700 : 400, color: locale === loc ? "#000" : "#bbb", background: "none", border: "none", cursor: "pointer", padding: 0, textTransform: "uppercase" }}>
            {loc}
          </button>
          {i < LOCALES.length - 1 && <span style={{ color: "#ddd" }}>/</span>}
        </span>
      ))}
    </div>
  );
}
