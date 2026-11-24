import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Icon from "@/shared/components/ui/Icon";
import { receiptsApi } from "../api/receipts.api";

const MAX_BYTES = 10 * 1024 * 1024;

/** Uploads a receipt; the backend reads it in the background. "feature": the big plum card of onboarding · "button": the pink square of Mi despensa. */
export default function ReceiptScanner({ variant = "row" }: { variant?: "row" | "feature" | "button" }) {
      const id = useId();
      const upload = useMutation({ mutationFn: receiptsApi.upload });
      const [localError, setLocalError] = useState<string | null>(null);
      const feature = variant === "feature";

      const pick = (file: File | undefined) => {
            if (!file) return;
            const tooBig = file.size > MAX_BYTES;
            setLocalError(tooBig ? "La factura pesa más de 10 MB." : null);
            if (!tooBig) upload.mutate(file);
      };
      const error = localError ?? upload.error?.message;

      if (variant === "button") {
            return (
                  <>
                        <label
                              htmlFor={id}
                              aria-label={upload.isPending ? "Subiendo tu factura" : "Escanear una factura"}
                              className={`grid size-12 shrink-0 cursor-pointer place-items-center rounded-control bg-brand text-card shadow-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong ${upload.isPending ? "pointer-events-none animate-pulse" : ""}`}
                        >
                              <Icon name="scan" />
                              <input
                                    id={id}
                                    type="file"
                                    accept="image/jpeg,image/png,image/heic,application/pdf"
                                    disabled={upload.isPending}
                                    onChange={(e) => {
                                          pick(e.target.files?.[0]);
                                          e.target.value = "";
                                    }}
                                    className="sr-only"
                              />
                        </label>
                        {(error || upload.data) && (
                              <p
                                    role={error ? "alert" : "status"}
                                    className={`fixed inset-x-5 bottom-28 z-30 mx-auto flex max-w-md flex-wrap items-center gap-x-2 rounded-control p-3 text-sm font-bold shadow-soft ${error ? "bg-card text-error" : "bg-mint-soft text-mint-ink"}`}
                              >
                                    <Icon name={error ? "alert" : "check"} className="size-4" strokeWidth={2.5} />
                                    {error ?? "Estoy leyendo tu factura."}
                                    {!error && upload.data && (
                                          <Link to={`/facturas/${upload.data.receiptId}`} className="underline underline-offset-4">
                                                Ver factura
                                          </Link>
                                    )}
                              </p>
                        )}
                  </>
            );
      }

      return (
            <div className="flex flex-col gap-2">
                  <label
                        htmlFor={id}
                        className={`group flex cursor-pointer items-center gap-3 rounded-card text-left has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong ${
                              feature ? "bg-plum-glow p-4 text-card shadow-[0_18px_36px_-20px_rgb(43_20_51/0.7)]" : "bg-card p-3 text-ink shadow-soft hover:bg-field"
                        } ${upload.isPending ? "pointer-events-none opacity-70" : ""}`}
                  >
                        <span className={`grid size-12 shrink-0 place-items-center rounded-control ${feature ? "bg-primary-strong" : "bg-lilac-soft text-lilac-ink"}`}>
                              <Icon name="scan" />
                        </span>
                        <span className="min-w-0 flex-1">
                              <span className="block font-display text-title font-extrabold">{upload.isPending ? "Subiendo tu factura…" : "Escanea tu última factura"}</span>
                              <span className={`block text-sm ${feature ? "text-card/80" : "text-ink-muted"}`}>Agrego lo que compraste a tu despensa</span>
                        </span>
                        <Icon name="chevronRight" className="size-6 shrink-0" />
                        <input
                              id={id}
                              type="file"
                              accept="image/jpeg,image/png,image/heic,application/pdf"
                              disabled={upload.isPending}
                              onChange={(e) => {
                                    pick(e.target.files?.[0]);
                                    e.target.value = "";
                              }}
                              className="sr-only"
                        />
                  </label>
                  {error && (
                        <p role="alert" className="text-sm font-semibold text-error">
                              {error}
                        </p>
                  )}
                  {upload.data && !error && (
                        <p role="status" className="flex flex-wrap items-center gap-x-2 rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                              <Icon name="check" className="size-4" strokeWidth={2.5} />
                              La estoy leyendo.
                              {/* The receipt screen needs the finished onboarding flow around it. */}
                              {!feature && (
                                    <Link to={`/facturas/${upload.data.receiptId}`} className="underline underline-offset-4">
                                          Ver factura
                                    </Link>
                              )}
                        </p>
                  )}
            </div>
      );
}
