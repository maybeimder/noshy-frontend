import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ACCEPTED_IMAGE_TYPES, imageVariant } from "@/shared/lib/images";
import { uploadImage, type UploadPurpose } from "@/shared/lib/upload";
import Button from "./Button";
import Icon from "./Icon";

type ImagePickerProps = {
      label: string;
      purpose: UploadPurpose;
      value: string | null;
      onChange: (url: string | null) => void;
      /** "cover" for recipes (16:9), "circle" for avatars. */
      shape?: "cover" | "circle";
      /** Shown inside the empty frame (e.g. the illustrated recipe cover or the initial). */
      placeholder?: ReactNode;
      hint?: string;
};

export default function ImagePicker({
      label,
      purpose,
      value,
      onChange,
      shape = "cover",
      placeholder,
      hint,
}: ImagePickerProps) {
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

      const shown = preview ?? (value ? imageVariant(value, shape === "circle" ? 192 : 960, shape === "circle" ? 192 : 540) : null);
      const frame =
            shape === "circle"
                  ? "size-24 rounded-full"
                  : "aspect-[16/9] w-full rounded-card";

      return (
            <div className={`flex gap-4 ${shape === "circle" ? "items-center" : "flex-col"}`}>
                  <div className={`relative grid shrink-0 place-items-center overflow-hidden bg-secondary-soft ${frame}`}>
                        {shown ? (
                              <img src={shown} alt="" className={`size-full object-cover ${uploading ? "opacity-60" : ""}`} />
                        ) : (
                              placeholder ??
                              (shape === "circle" ? (
                                    <Icon name="user" className="size-10 text-ink" />
                              ) : (
                                    <span className="flex flex-col items-center gap-2 text-ink">
                                          <Icon name="bowl" className="size-12" strokeWidth={1.5} />
                                          <span className="text-sm font-semibold">Sin foto todavía</span>
                                    </span>
                              ))
                        )}
                        {uploading && (
                              <div className="absolute inset-x-4 bottom-4">
                                    <div
                                          role="progressbar"
                                          aria-label="Subiendo foto"
                                          aria-valuemin={0}
                                          aria-valuemax={100}
                                          aria-valuenow={Math.round((progress ?? 0) * 100)}
                                          className="h-2 overflow-hidden rounded-full bg-card"
                                    >
                                          <div
                                                className="h-full rounded-full bg-primary transition-[width]"
                                                style={{ width: `${Math.max(5, (progress ?? 0) * 100)}%` }}
                                          />
                                    </div>
                              </div>
                        )}
                  </div>

                  <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-ink">{label}</span>
                        <div className="flex flex-wrap gap-2">
                              <label
                                    htmlFor={inputId}
                                    className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control bg-secondary-soft px-4 text-sm font-semibold text-ink hover:bg-secondary/60 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong ${
                                          uploading ? "pointer-events-none opacity-60" : ""
                                    }`}
                              >
                                    <Icon name={value ? "edit" : "plus"} className="size-5" />
                                    {uploading ? "Subiendo…" : value ? "Cambiar foto" : "Subir foto"}
                                    <input
                                          ref={inputRef}
                                          id={inputId}
                                          type="file"
                                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                          disabled={uploading}
                                          onChange={(e) => pick(e.target.files?.[0])}
                                          className="sr-only"
                                    />
                              </label>
                              {value && !uploading && (
                                    <Button variant="tertiary" onClick={() => onChange(null)}>
                                          <Icon name="trash" className="size-5" />
                                          Quitar
                                    </Button>
                              )}
                        </div>
                        {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
                        {error && (
                              <p role="alert" className="flex items-start gap-1 text-sm text-error">
                                    <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
                                    {error}
                              </p>
                        )}
                  </div>
            </div>
      );
}
