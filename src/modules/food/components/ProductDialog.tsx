import { useState } from "react";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import { LoadingState } from "@/shared/components/ui/QueryState";
import { fieldClass } from "@/shared/components/ui/TextField";
import { foodErrorMessage, useFoodProduct } from "../hooks/useFood";
import type { FoodSearchItem } from "../types";
import { formatNutrient, nutrientRows, scale } from "../utils/nutrients";
import MacroTiles from "./MacroTiles";

type ProductDialogProps = {
      /** Row picked from the search: shown right away while the full product loads. */
      item: FoodSearchItem;
      adding: boolean;
      error?: string | null;
      onAdd: (input: { name: string; quantity: number; unit: string }) => void;
      onClose: () => void;
};

// Nutri-Score colours are part of the label itself (A green … E red), shown with the letter.
const nutriscoreTone: Record<string, string> = {
      a: "bg-mint-soft text-mint-ink",
      b: "bg-mint-soft text-mint-ink",
      c: "bg-mustard-soft text-mustard-ink",
      d: "bg-peach-soft text-peach-ink",
      e: "bg-peach-soft text-error",
};

export default function ProductDialog({ item, adding, error, onAdd, onClose }: ProductDialogProps) {
      const product = useFoodProduct(item.id);
      const [grams, setGrams] = useState(String(item.baseServing.grams));
      const parsed = Number(grams.replace(",", "."));
      const valid = Number.isFinite(parsed) && parsed > 0;
      const p = product.data;
      const servings = [{ label: "100 g", grams: 100 }, ...(p?.servings ?? [item.baseServing])].filter(
            (s, i, all) => all.findIndex((o) => o.grams === s.grams) === i,
      );

      return (
            <Dialog
                  open
                  onClose={onClose}
                  variant="sheet"
                  title={item.name}
                  actions={
                        <>
                              <Button variant="soft" size="lg" onClick={onClose}>
                                    Cancelar
                              </Button>
                              <Button size="lg" loading={adding} disabled={!valid} onClick={() => onAdd({ name: item.name, quantity: parsed, unit: "g" })}>
                                    <Icon name="plus" className="size-5" strokeWidth={2.25} />
                                    A mi despensa
                              </Button>
                        </>
                  }
            >
                  <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                              {item.image ? (
                                    <img src={item.image} alt="" className="size-16 shrink-0 rounded-control bg-field object-cover" />
                              ) : null}
                              <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-ink-muted">{item.isGeneric ? "Genérico" : item.brand}</p>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                          {p?.nutriscore && (
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${nutriscoreTone[p.nutriscore.toLowerCase()] ?? "bg-mist-soft text-ink"}`}>
                                                      Nutri-Score {p.nutriscore.toUpperCase()}
                                                </span>
                                          )}
                                          {p?.dietTags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="rounded-full bg-lilac-soft px-2.5 py-1 text-xs font-extrabold text-lilac-ink">
                                                      {tag}
                                                </span>
                                          ))}
                                    </div>
                              </div>
                        </div>

                        {product.isPending ? (
                              <LoadingState label="Cargando la ficha…" />
                        ) : product.isError ? (
                              <p className="rounded-control bg-peach-soft p-3 text-sm font-semibold text-peach-ink">{foodErrorMessage(product.error)}</p>
                        ) : (
                              p && (
                                    <>
                                          <div>
                                                <p className="mb-2 text-xs font-extrabold tracking-wide text-ink-muted uppercase">
                                                      {valid ? `En ${parsed} g` : "Por 100 g"}
                                                </p>
                                                <MacroTiles nutrients={valid ? scale(p.per100g, parsed / 100) : p.per100g} compact />
                                                <ul className="mt-2 grid grid-cols-2 gap-x-4 text-xs text-ink-muted">
                                                      {nutrientRows.map(({ key, label, unit }) => (
                                                            <li key={key} className="flex justify-between border-b border-line py-1">
                                                                  {label}
                                                                  <span className="font-bold text-ink">
                                                                        {formatNutrient(valid ? scale(p.per100g, parsed / 100) : p.per100g, key)} {unit}
                                                                  </span>
                                                            </li>
                                                      ))}
                                                </ul>
                                          </div>
                                          {p.allergens.length > 0 && (
                                                <p className="flex items-start gap-2 rounded-control bg-peach-soft p-3 text-sm font-semibold text-peach-ink">
                                                      <Icon name="alert" className="size-4 shrink-0" />
                                                      Contiene: {p.allergens.join(", ")}
                                                </p>
                                          )}
                                    </>
                              )
                        )}

                        <div className="flex flex-col gap-2">
                              <span className="text-sm font-bold text-ink">¿Cuánto tienes?</span>
                              <div className="flex flex-wrap gap-2">
                                    {servings.map((s) => (
                                          <button
                                                key={`${s.label}-${s.grams}`}
                                                type="button"
                                                aria-pressed={parsed === s.grams}
                                                onClick={() => setGrams(String(s.grams))}
                                                className={`min-h-10 rounded-full px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                      parsed === s.grams ? "bg-ink text-card" : "bg-field text-ink hover:bg-line"
                                                }`}
                                          >
                                                {s.label} {s.label.includes(`${s.grams}`) ? "" : `(${s.grams} g)`}
                                          </button>
                                    ))}
                              </div>
                              <label className="relative">
                                    <span className="sr-only">Gramos</span>
                                    <input
                                          inputMode="decimal"
                                          value={grams}
                                          onChange={(e) => setGrams(e.target.value)}
                                          aria-invalid={!valid || undefined}
                                          className={`${fieldClass("field", valid ? undefined : "x")} min-h-12 pr-10 pl-4 font-display text-title font-bold`}
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-bold text-ink-muted">g</span>
                              </label>
                        </div>
                        {error && <p className="text-sm font-semibold text-error">{error}</p>}
                  </div>
            </Dialog>
      );
}
