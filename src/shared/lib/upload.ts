import axios from "axios";
import { api, ApiError } from "./axios";
import { compressImage } from "./images";

export type UploadPurpose = "recipe" | "avatar";

type UploadSignature = {
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      signature: string;
};

/**
 * Compresses the photo, asks our API for a short-lived Cloudinary signature and uploads straight to
 * Cloudinary (images never go through our API). Returns the public https URL.
 * Contract: backend/recommendation.md §1.
 */
export async function uploadImage(
      file: File,
      purpose: UploadPurpose,
      onProgress?: (fraction: number) => void,
): Promise<string> {
      const blob = await compressImage(file);

      let signature: UploadSignature;
      try {
            signature = (await api.post<UploadSignature>("/uploads/signature", { purpose })).data;
      } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                  throw new ApiError(404, "UPLOADS_UNAVAILABLE", "La subida de fotos todavía no está disponible.");
            }
            throw error;
      }

      const form = new FormData();
      form.append("file", blob, "photo.jpg");
      form.append("api_key", signature.apiKey);
      form.append("timestamp", String(signature.timestamp));
      form.append("folder", signature.folder);
      form.append("signature", signature.signature);

      try {
            // Plain axios on purpose: our bearer token must never be sent to a third party.
            const response = await axios.post<{ secure_url: string }>(
                  `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
                  form,
                  { onUploadProgress: (event) => onProgress?.(event.total ? event.loaded / event.total : 0) },
            );
            return response.data.secure_url;
      } catch {
            throw new ApiError(0, "UPLOAD_FAILED", "No pudimos subir la foto. Revisa tu conexión e inténtalo de nuevo.");
      }
}
