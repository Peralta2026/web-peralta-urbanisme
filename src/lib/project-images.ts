import path from "node:path";
import fs from "node:fs";
import sizeOf from "image-size";

/** Paper de la imatge a la retícula, segons la nomenclatura del servidor */
export type ImageIntent = "cover" | "wide" | "tall" | "big" | "small";

export interface ProjectImageData {
  file: string;
  width: number;
  height: number;
  intent: ImageIntent;
}

const INTENTS: ImageIntent[] = ["cover", "wide", "tall", "big", "small"];

export async function getProjectImages(
  slug: string,
  files: string[],
  layout: Record<string, string> = {},
): Promise<ProjectImageData[]> {
  const images: ProjectImageData[] = [];
  files.forEach((file, index) => {
    const filePath = path.join(process.cwd(), "public", "projects", slug, file);
    // Una imatge que no existeix no es pinta: evita forats buits a la galeria
    if (!fs.existsSync(filePath)) return;
    try {
      const { width, height } = sizeOf(fs.readFileSync(filePath));
      if (!width || !height) return;
      const declared = layout[file] as ImageIntent | undefined;
      images.push({
        file,
        width,
        height,
        intent: declared && INTENTS.includes(declared) ? declared : index === 0 ? "cover" : "small",
      });
    } catch {
      // fitxer il·legible: s'omet
    }
  });
  return images;
}
