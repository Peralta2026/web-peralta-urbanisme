// One-time script: resize and compress all project images to web size
// Run: node scripts/optimize-images.mjs

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.join(__dirname, "..", "public", "projects");

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 78;
const MAX_UNOPTIMIZED_BYTES = 500 * 1024;

async function optimizeDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await optimizeDir(fullPath);
      continue;
    }
    if (!/\.(jpg|jpeg)$/i.test(file)) continue;

    try {
      const source = fs.readFileSync(fullPath);
      const metadata = await sharp(source).metadata();
      const needsResize =
        (metadata.width ?? 0) > MAX_WIDTH ||
        (metadata.height ?? 0) > MAX_HEIGHT;

      if (!needsResize && stat.size <= MAX_UNOPTIMIZED_BYTES) continue;

      const optimized = await sharp(source)
        .rotate()
        .resize({
          width: MAX_WIDTH,
          height: MAX_HEIGHT,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toBuffer();

      if (optimized.length >= source.length) continue;

      fs.writeFileSync(fullPath, optimized);
      const sizeBefore = (source.length / 1024 / 1024).toFixed(2);
      const sizeAfter = (optimized.length / 1024 / 1024).toFixed(2);
      console.log(`${path.relative(projectsDir, fullPath)}: ${sizeBefore}MB -> ${sizeAfter}MB`);
    } catch (err) {
      console.error(`${file}: ${err.message}`);
    }
  }
}

console.log("Optimizing project images...\n");
await optimizeDir(projectsDir);
console.log("\nDone.");
