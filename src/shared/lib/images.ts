export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 20 * 1024 * 1024;
const MAX_SIDE = 1600;

/**
 * Resizes to at most 1600 px and re-encodes as JPEG so uploads stay small (contract in
 * backend/recommendation.md §1). Throws with a user-facing message.
 */
export async function compressImage(file: File): Promise<Blob> {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            throw new Error("Usa una foto JPG, PNG o WebP.");
      }
      if (file.size > MAX_INPUT_BYTES) {
            throw new Error("La foto pesa demasiado (máximo 20 MB).");
      }

      let bitmap: ImageBitmap;
      try {
            bitmap = await createImageBitmap(file);
      } catch {
            throw new Error("No pudimos leer esta foto. Prueba con otra.");
      }

      const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Tu navegador no pudo procesar la foto.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();

      return new Promise((resolve, reject) =>
            canvas.toBlob(
                  (blob) => (blob ? resolve(blob) : reject(new Error("No pudimos procesar la foto."))),
                  "image/jpeg",
                  0.85,
            ),
      );
}

/**
 * Asks the image CDN for a size that fits where it is shown. Cloudinary and Pexels both resize on
 * the fly; any other URL is returned untouched.
 */
export function imageVariant(url: string, width: number, height?: number): string {
      try {
            const parsed = new URL(url);
            if (parsed.hostname === "res.cloudinary.com" && parsed.pathname.includes("/image/upload/")) {
                  const transform = ["f_auto", "q_auto", "c_fill", `w_${width}`, height ? `h_${height}` : null]
                        .filter(Boolean)
                        .join(",");
                  parsed.pathname = parsed.pathname.replace("/image/upload/", `/image/upload/${transform}/`);
                  return parsed.toString();
            }
            if (parsed.hostname === "images.pexels.com") {
                  parsed.search = "";
                  parsed.searchParams.set("auto", "compress");
                  parsed.searchParams.set("cs", "tinysrgb");
                  parsed.searchParams.set("fit", "crop");
                  parsed.searchParams.set("w", String(width));
                  if (height) parsed.searchParams.set("h", String(height));
                  return parsed.toString();
            }
      } catch {
            // Not a valid URL: let the <img> fail and show its fallback.
      }
      return url;
}
