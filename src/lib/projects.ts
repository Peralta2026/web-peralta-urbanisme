import fs from "fs";
import path from "path";
import type { Project } from "./types";

const projectsDir = path.join(process.cwd(), "content", "projects");

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".json"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(projectsDir, file), "utf-8");
      return JSON.parse(raw) as Project;
    })
    .sort((a, b) => {
      // Sort by year descending (most recent first)
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
