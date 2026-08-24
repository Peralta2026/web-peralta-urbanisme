import path from "node:path";
import fs from "node:fs";
import sizeOf from "image-size";

export interface ProjectImageData {
  file: string;
  width: number;
  height: number;
}

const FALLBACK_SIZE = { width: 1600, height: 1067 };

export async function getProjectImages(
  slug: string,
  files: string[],
): Promise<ProjectImageData[]> {
  return files.map((file) => {
    try {
      const filePath = path.join(process.cwd(), "public", "projects", slug, file);
      if (!fs.existsSync(filePath)) return { file, ...FALLBACK_SIZE };
      const buffer = fs.readFileSync(filePath);
      const { width, height } = sizeOf(buffer);
      return {
        file,
        width:  width  ?? FALLBACK_SIZE.width,
        height: height ?? FALLBACK_SIZE.height,
      };
    } catch {
      return { file, ...FALLBACK_SIZE };
    }
  });
}
