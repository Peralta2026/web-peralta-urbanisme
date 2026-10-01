// Genera les miniatures de la franja-carrusel de la home (public/strip/) i el
// manifest content/strip.json. Tornar-lo a executar després d'afegir projectes:
//   node scripts/build-strip.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, "content", "projects");
const OUT_DIR = path.join(ROOT, "public", "strip");
const MANIFEST = path.join(ROOT, "content", "strip.json");
const HEIGHT = 380;
const PUBLISHED = new Set(["relevant", "si"]);

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const projects = fs.readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), "utf-8")))
  .filter((p) => p.coverImage && PUBLISHED.has(p.webStatus ?? "si"));

const items = [];
for (const p of projects) {
  const src = path.join(ROOT, "public", "projects", p.slug, p.coverImage);
  if (!fs.existsSync(src)) continue;
  const file = `${p.slug}.jpg`;
  const meta = await sharp(src).metadata();
  const ratio = Math.min(1.8, Math.max(0.66, meta.width / meta.height));
  const info = await sharp(src)
    .resize({ height: HEIGHT, width: Math.round(HEIGHT * ratio), fit: "cover" })
    .jpeg({ quality: 74, mozjpeg: true })
    .toFile(path.join(OUT_DIR, file));
  items.push({ slug: p.slug, src: `/strip/${file}`, w: info.width, h: info.height });
}

// Alterna formats perquè la franja no agrupi imatges de proporció semblant
items.sort((a, b) => a.w / a.h - b.w / b.h);
const mixed = [];
while (items.length) {
  mixed.push(items.shift());
  if (items.length) mixed.push(items.pop());
}

fs.writeFileSync(MANIFEST, JSON.stringify(mixed, null, 2) + "\n");
console.log(`${mixed.length} imatges → public/strip/`);
