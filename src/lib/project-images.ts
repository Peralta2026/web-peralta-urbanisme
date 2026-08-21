import path from "node:path";
import sharp from "sharp";

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
  return Promise.all(
    files.map(async (file) => {
      try {
        const metadata = await sharp(
          path.join(process.cwd(), "public", "projects", slug, file),
        ).metadata();

        return {
          file,
          width: metadata.width ?? FALLBACK_SIZE.width,
          height: metadata.height ?? FALLBACK_SIZE.height,
        };
      } catch {
        return { file, ...FALLBACK_SIZE };
      }
    }),
  );
}
