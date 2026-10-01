// Genera les miniatures 3:4 de la vista Visual (public/visual/<slug>.jpg).
// Retalla el blanc que envolta els dibuixos perquè cada imatge ompli el seu
// rectangle. Tornar-lo a executar després d'afegir o canviar portades:
//   node scripts/build-visual.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, "content", "projects");
const OUT_DIR = path.join(ROOT, "public", "visual");

fs.mkdirSync(OUT_DIR, { recursive: true });

const projects = fs.readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), "utf-8")))
  .filter((p) => p.coverImage && p.webStatus !== "no");

let n = 0;
for (const p of projects) {
  const src = path.join(ROOT, "public", "projects", p.slug, p.coverImage);
  if (!fs.existsSync(src)) continue;
  const trimmed = await sharp(src)
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 28 })
    .toBuffer()
    .catch(() => fs.readFileSync(src));
  await sharp(trimmed)
    .resize({ width: 720, height: 960, fit: "cover", position: "attention" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(path.join(OUT_DIR, `${p.slug}.jpg`));
  n++;
}
console.log(`${n} miniatures → public/visual/`);
