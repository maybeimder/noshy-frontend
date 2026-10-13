import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ACCEPTED_IMAGE_TYPES, imageVariant } from "@/shared/lib/images";
import { uploadImage, type UploadPurpose } from "@/shared/lib/upload";
import Icon from "./Icon";
import Mascot from "./Mascot";
import Sticker from "./Sticker";

type ImagePickerProps = {
      label: string;
      purpose: UploadPurpose;
      value: string | null;
      onChange: (url: string | null) => void;
      /** "cover": peach photo card (ref/Nueva receta.png) · "circle": avatar. */
      shape?: "cover" | "circle";
      /** Circle only: shown when there is no photo (e.g. the initial). */
      placeholder?: ReactNode;
      hint?: string;
};

const pillButton =
      "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-card px-4 text-sm font-extrabold text-ink shadow-[0_6px_16px_-10px_rgb(43_20_51/0.45)] hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong";

export default function ImagePicker({ label, purpose, value, onChange, shape = "cover", placeholder, hint }: ImagePickerProps) {
      const inputId = useId();
      const inputRef = useRef<HTMLInputElement>(null);
      const [preview, setPreview] = useState<string | null>(null);
      const [progress, setProgress] = useState<number | null>(null);
      const [error, setError] = useState<string | null>(null);
      const uploading = progress !== null;

      // Local previews are object URLs: release them when replaced or unmounted.
      useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

      const pick = async (file: File | undefined) => {
            if (!file) return;
            setError(null);
            setPreview(URL.createObjectURL(file));
            setProgress(0);
            try {
                  onChange(await uploadImage(file, purpose, setProgress));
            } catch (e) {
                  setError(e instanceof Error ? e.message : "No pudimos subir la foto.");
            } finally {
                  setProgress(null);
                  setPreview(null);
                  if (inputRef.current) inputRef.current.value = "";
            }
      };

      const circle = shape === "circle";
      const shown = preview ?? (value ? imageVariant(value, circle ? 192 : 960, circle ? 192 : 540) : null);

      const fileInput = (
            <input
                  ref={inputRef}
                  id={inputId}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  disabled={uploading}
                  onChange={(e) => pick(e.target.files?.[0])}
                  className="sr-only"
            />
      );

      const progressBar = uploading && (
            <div
                  role="progressbar"
                  aria-label="Subiendo foto"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round((progress ?? 0) * 100)}
                  className="h-2 overflow-hidden rounded-full bg-card"
            >
                  <div className="h-full rounded-full bg-primary-strong transition-[width]" style={{ width: `${Math.max(5, (progress ?? 0) * 100)}%` }} />
            </div>
      );

      const errorText = error && (
            <p role="alert" className="flex items-start gap-1 text-sm font-semibold text-error">
                  <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
                  {error}
            </p>
      );

      if (circle) {
            return (
                  <div className="flex items-center gap-4">
                        <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary-soft">
                              {shown ? (
                                    <img src={shown} alt="" className={`size-full object-cover ${uploading ? "opacity-60" : ""}`} />
                              ) : (
                                    (placeholder ?? <Icon name="user" className="size-10 text-ink" />)
                              )}
                              {uploading && <div className="absolute inset-x-3 bottom-3">{progressBar}</div>}
                        </div>
                        <div className="flex flex-col gap-2">
                              <span className="text-sm font-bold text-ink">{label}</span>
                              <div className="flex flex-wrap gap-2">
                                    <label htmlFor={inputId} className={`${pillButton} ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                                          <Icon name="camera" className="size-4" />
                                          {uploading ? "Subiendo…" : value ? "Cambiar foto" : "Subir foto"}
                                          {fileInput}
                                    </label>
                                    {value && !uploading && (
                                          <button type="button" onClick={() => onChange(null)} className={pillButton}>
                                                <Icon name="trash" className="size-4" />
                                                Quitar
                                          </button>
                                    )}
                              </div>
                              {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
                              {errorText}
                        </div>
                  </div>
            );
      }

      return (
            <div className="flex flex-col gap-2">
                  {shown ? (
                        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-secondary-soft">
                              <img src={shown} alt={`${label}: vista previa`} className={`size-full object-cover ${uploading ? "opacity-60" : ""}`} />
                              <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
                                    {progressBar}
                                    {!uploading && (
                                          <div className="flex gap-2">
                                                <label htmlFor={inputId} className={pillButton}>
                                                      <Icon name="camera" className="size-4" />
                                                      Cambiar foto
                                                      {fileInput}
                                                </label>
                                                <button type="button" onClick={() => onChange(null)} className={pillButton}>
                                                      <Icon name="trash" className="size-4" />
                                                      Quitar
                                                </button>
                                          </div>
                                    )}
                              </div>
                        </div>
                  ) : (
                        <label
                              htmlFor={inputId}
                              className="relative flex min-h-36 cursor-pointer items-center gap-4 overflow-hidden rounded-[1.75rem] bg-secondary-soft px-5 pt-10 pb-5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong"
                        >
                              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-card text-primary-strong">
                                    <Icon name="camera" className="size-7" />
                              </span>
                              <span className="relative z-10 max-w-[45%]">
                                    <span className="block font-display text-title font-extrabold text-ink">Añade una foto</span>
                                    <span className="block text-sm font-semibold text-ink">{hint ?? "Así se verá en tus recetas"}</span>
                              </span>
                              <Mascot className="pointer-events-none absolute -right-2 -bottom-4 w-28" />
                              <Sticker tilt={-6} className="absolute top-2 right-24 text-xs">
                                    ¡Quiero ver!
                              </Sticker>
                              <span className="sr-only">{label}</span>
                              {fileInput}
                        </label>
                  )}
                  {errorText}
            </div>
      );
}
