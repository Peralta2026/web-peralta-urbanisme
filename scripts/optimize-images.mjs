// One-time script: resize and compress all project images to web size
// Run: node scripts/optimize-images.mjs

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.join(__dirname, "..", "public", "projects");

const MAX_WIDTH = 2400;   // px — enough for a retina 1200px display
const JPEG_QUALITY = 82;  // good balance quality/size

async function optimizeDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await optimizeDir(fullPath);
      continue;
    }
    if (!/\.(jpg|jpeg|JPG|JPEG|png|PNG)$/.test(file)) continue;

    const sizeBefore = (stat.size / 1024 / 1024).toFixed(1);
    const tmpPath = fullPath + ".tmp";

    try {
      await sharp(fullPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toFile(tmpPath);

      fs.renameSync(tmpPath, fullPath);
      const sizeAfter = (fs.statSync(fullPath).size / 1024 / 1024).toFixed(1);
      console.log(`✓ ${path.relative(projectsDir, fullPath)}: ${sizeBefore}MB → ${sizeAfter}MB`);
    } catch (err) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      console.error(`✗ ${file}: ${err.message}`);
    }
  }
}

console.log("Optimizing project images...\n");
await optimizeDir(projectsDir);
console.log("\nDone.");
