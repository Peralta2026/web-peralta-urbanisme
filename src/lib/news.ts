import fs from "fs";
import path from "path";
import type { NewsItem } from "./types";

const newsDir = path.join(process.cwd(), "content", "news");

export function getAllNews(): NewsItem[] {
  if (!fs.existsSync(newsDir)) return [];

  return fs
    .readdirSync(newsDir)
    .filter((f) => f.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(newsDir, file), "utf-8")) as NewsItem)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  const filePath = path.join(newsDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as NewsItem;
}
