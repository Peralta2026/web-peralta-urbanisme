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
  tags: TagSlug[];
  coordinates: { lat: number; lng: number };
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

export type NewsCategory =
  | "esdeveniment"
  | "concurs"
  | "aprovacio"
  | "participacio"
  | "premsa"
  | "premi"
  | "equip";

export interface NewsLocale {
  title: string;
  summary: string;
  body: string[];
  credits?: string;
}

export interface NewsItem {
  slug: string;
  /** "YYYY-MM" o "YYYY-MM-DD" — ordena cronològicament com a text */
  date: string;
  category: NewsCategory;
  coverImage?: string;
  images: string[];
  relatedProjects: string[];
  source?: { network: "linkedin" | "instagram"; url: string };
  ca: NewsLocale;
  es: NewsLocale;
  en: NewsLocale;
}
