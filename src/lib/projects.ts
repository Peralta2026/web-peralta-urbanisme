import fs from "fs";
import path from "path";
import type { Project } from "./types";

const projectsDir = path.join(process.cwd(), "content", "projects");

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".json"));

  const STATUS_ORDER: Record<string, number> = {
    "relevant": 0,
    "si": 1,
    "sense-fitxa": 2,
    "en-proces": 3,
    "no": 4,
  };

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(projectsDir, file), "utf-8");
      return JSON.parse(raw) as Project;
    })
    .sort((a, b) => {
      const orderA = STATUS_ORDER[a.webStatus ?? "si"] ?? 1;
      const orderB = STATUS_ORDER[b.webStatus ?? "si"] ?? 1;
      if (orderA !== orderB) return orderA - orderB;
      const yearA = parseInt(a.ca.year) || 0;
      const yearB = parseInt(b.ca.year) || 0;
      return yearB - yearA;
    });
}

export function getProjectBySlug(slug: string): Project | undefined {
  const filePath = path.join(projectsDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return undefined;

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Project;
}
