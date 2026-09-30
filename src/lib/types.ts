export type TagSlug =
  | "residencial"
  | "transformacio"
  | "extensio"
  | "regeneracio"
  | "activitat-economica"
  | "infraestructura-verda"
  | "integracio-infraestructures"
  | "estructura-urbana"
  | "divulgacio"
  | "espai-public"
  | "participacio-ciutadana"
  | "encaixos-singulars";

export const ALL_TAGS: TagSlug[] = [
  "residencial",
  "transformacio",
  "extensio",
  "regeneracio",
  "activitat-economica",
  "infraestructura-verda",
  "integracio-infraestructures",
  "estructura-urbana",
  "divulgacio",
  "espai-public",
  "participacio-ciutadana",
  "encaixos-singulars",
];

export interface ProjectLocale {
  title: string;
  subtitle?: string;
  municipality: string;
  year: string;
  status: string;
  tipus: string;
  premi: string | null;
  ambitM2: number | null;
  programa: string | null;
  sostreM2: number | null;
  habitatges: number | null;
  descriptionShort: string;
  descriptionLong: string;
}

export type WebStatus = "relevant" | "si" | "sense-fitxa" | "en-proces" | "no";

export interface Project {
  slug: string;
  webStatus?: WebStatus;
  coverImage: string;
  images: string[];
  /** Paper de cada imatge a la galeria: cover · wide · tall · big · small */
  imageLayout?: Record<string, string>;
  tags: TagSlug[];
  coordinates: { lat: number; lng: number };
  credits?: string;
  ca: ProjectLocale;
  es: ProjectLocale;
  en: ProjectLocale;
}

export interface TeamMemberLocale {
  name: string;
  role: string;
  bioShort: string;
  bioLong: string;
}

export interface TeamMember {
  slug: string;
  photo: string;
  order: number;
  ca: TeamMemberLocale;
  es: TeamMemberLocale;
  en: TeamMemberLocale;
}

export type Locale = "ca" | "es" | "en";

export interface NewsLocale {
  /** Etiqueta editorial, p. ex. "Projecte · Planejament" */
  tag: string;
  title: string;
  summary: string;
  body: string[];
  /** Substitueix la data calculada quan no és exacta, p. ex. "Primavera 2026" */
  dateLabel?: string;
  credits?: string;
}

export interface NewsItem {
  slug: string;
  /** "YYYY-MM" o "YYYY-MM-DD" — ordena cronològicament com a text */
  date: string;
  coverImage?: string;
  /** "contain" per a cartells o gràfics que no s'han de retallar */
  coverFit?: "cover" | "contain";
  images: string[];
  relatedProjects: string[];
  sources?: { label: string; url: string }[];
  ca: NewsLocale;
  es: NewsLocale;
  en: NewsLocale;
}
