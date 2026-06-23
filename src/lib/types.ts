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

export interface Project {
  slug: string;
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
