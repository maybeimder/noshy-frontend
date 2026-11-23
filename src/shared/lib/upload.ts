import axios from "axios";
import { api, ApiError, unwrap } from "./axios";
import { compressImage } from "./images";

export type UploadPurpose = "recipeCover" | "cookedPhoto" | "avatar";

/** An uploaded photo: `id` is what the API takes, `url` only previews it in this tab. */
export type UploadedMedia = { id: string; url: string };

type UploadTicket = { mediaId: string; uploadUrl: string; headers: Record<string, string> };

/**
 * Compresses the photo, asks the API for a signed URL and PUTs the file straight to storage.
 * The signed URL is the credential, so no bearer token goes with it.
 */
export async function uploadImage(
      file: File,
      purpose: UploadPurpose,
      onProgress?: (fraction: number) => void,
): Promise<UploadedMedia> {
      const blob = await compressImage(file);
      const ticket = await api
            .post<{ data: UploadTicket }>("/media/uploads", { purpose, contentType: blob.type, sizeBytes: blob.size })
            .then(unwrap);
      try {
            await axios.put(ticket.uploadUrl, blob, {
                  headers: ticket.headers,
                  onUploadProgress: (event) => onProgress?.(event.total ? event.loaded / event.total : 0),
            });
      } catch {
            throw new ApiError(0, "UPLOAD_FAILED", "No pudimos subir la foto. Revisa tu conexión e inténtalo de nuevo.");
      }
      return { id: ticket.mediaId, url: URL.createObjectURL(blob) };
}
