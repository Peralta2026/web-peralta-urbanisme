import type { NewsItem } from "@/lib/types";

export type Loc = "ca" | "es" | "en";

export const NEWS_LABELS: Record<Loc, { title: string; all: string; back: string; sources: string; related: string; credits: string }> = {
  ca: { title: "Notícies", all: "Totes les notícies", back: "Totes les notícies", sources: "Fonts", related: "Projectes relacionats", credits: "Equip" },
  es: { title: "Noticias", all: "Todas las noticias", back: "Todas las noticias", sources: "Fuentes", related: "Proyectos relacionados", credits: "Equipo" },
  en: { title: "News", all: "All news", back: "All news", sources: "Sources", related: "Related projects", credits: "Team" },
};

export function toLoc(locale: string): Loc {
  return locale === "es" || locale === "en" ? locale : "ca";
}

export const MONTHS: Record<Loc, string[]> = {
  ca: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"],
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

export function formatNewsDate(date: string, locale: string) {
  const [year, month, day] = date.split("-");
  const name = MONTHS[toLoc(locale)][Number(month) - 1] ?? month;
  return [day ? String(Number(day)) : null, name, year].filter(Boolean).join(" ");
}

export function newsDate(item: NewsItem, locale: string) {
  return item[toLoc(locale)].dateLabel ?? formatNewsDate(item.date, locale);
}

export function newsHref(locale: string, slug?: string) {
  return `/${locale}/noticies${slug ? `/${slug}` : ""}`;
}
