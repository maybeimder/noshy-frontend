import { useState } from "react";
import Icon from "@/shared/components/ui/Icon";
import { tones, toneFor } from "@/shared/lib/tones";
import { foodErrorMessage, useFoodSearch } from "../hooks/useFood";
import type { FoodSearchItem } from "../types";

type FoodResultsProps = {
      query: string;
      /** id of the list, referenced by the search input's aria-controls. */
      listId: string;
      /** "+": add right away with the product's base serving. */
      onQuickAdd: (item: FoodSearchItem) => void;
      /** Tap on the row: open the product sheet. */
      onOpen: (item: FoodSearchItem) => void;
      /** Product id being added, to show its spinner. */
      addingId?: string | null;
};

const kcal = new Intl.NumberFormat("es", { maximumFractionDigits: 0 });

// Products from the catalog as the user types (GET /food/products?q=…).
export default function FoodResults({ query, listId, onQuickAdd, onOpen, addingId }: FoodResultsProps) {
      const search = useFoodSearch(query);
      const typed = query.trim().length >= 2;
      if (!typed) return null;

      const items = search.data ?? [];

      return (
            <div className="flex flex-col gap-2">
                  <p aria-live="polite" className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-ink-muted uppercase">
                        {search.isFetching && <span aria-hidden className="size-3 animate-spin rounded-full border-2 border-primary-strong border-r-transparent" />}
                        {search.isError
                              ? "Catálogo"
                              : search.isPending
                                ? "Buscando en el catálogo…"
                                : items.length
                                  ? `${items.length} ${items.length === 1 ? "producto" : "productos"} del catálogo`
                                  : "Sin coincidencias en el catálogo"}
                  </p>

                  {search.isError ? (
                        <p className="flex items-start gap-2 rounded-control bg-peach-soft p-3 text-sm font-semibold text-peach-ink">
                              <Icon name="info" className="size-4 shrink-0" />
                              {foodErrorMessage(search.error)}
                        </p>
                  ) : items.length === 0 ? (
                        !search.isPending && <p className="text-sm text-ink-muted">Puedes añadirlo igualmente con el nombre que escribiste.</p>
                  ) : (
                        <ul id={listId} aria-label="Productos del catálogo" className="flex max-h-80 flex-col gap-1 overflow-y-auto overscroll-contain rounded-control bg-field p-1">
                              {items.map((item) => (
                                    <ResultRow key={item.id} item={item} adding={addingId === item.id} onQuickAdd={onQuickAdd} onOpen={onOpen} />
                              ))}
                        </ul>
                  )}
            </div>
      );
}

function ResultRow({
      item,
      adding,
      onQuickAdd,
      onOpen,
}: {
      item: FoodSearchItem;
      adding: boolean;
      onQuickAdd: (item: FoodSearchItem) => void;
      onOpen: (item: FoodSearchItem) => void;
}) {
      const [imageFailed, setImageFailed] = useState(false);
      const tone = tones[toneFor(item.name)];
      const brand = item.isGeneric ? "Genérico" : item.brand;

      return (
            <li className="flex items-center gap-2 rounded-control bg-card p-2">
                  <button
                        type="button"
                        onClick={() => onOpen(item)}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-control text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                  >
                        {item.image && !imageFailed ? (
                              <img src={item.image} alt="" loading="lazy" onError={() => setImageFailed(true)} className="size-11 shrink-0 rounded-control bg-field object-cover" />
                        ) : (
                              <span aria-hidden className={`grid size-11 shrink-0 place-items-center rounded-control font-display font-extrabold ${tone.soft} ${tone.ink}`}>
                                    {item.name.trim().charAt(0).toUpperCase()}
                              </span>
                        )}
                        <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-1.5">
                                    <span className="truncate font-bold text-ink">{item.name}</span>
                                    {item.exactMatch && (
                                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-mint-soft px-1.5 py-0.5 text-[0.65rem] font-extrabold text-mint-ink">
                                                <Icon name="check" className="size-3" strokeWidth={3} />
                                                Exacto
                                          </span>
                                    )}
                              </span>
                              <span className="block truncate text-xs font-semibold text-ink-muted">
                                    {brand}
                                    {item.kcalPer100g !== null && ` · ${kcal.format(item.kcalPer100g)} kcal/100 g`}
                              </span>
                        </span>
                  </button>
                  <button
                        type="button"
                        aria-label={`Añadir ${item.name} (${item.baseServing.grams} g) a la despensa`}
                        disabled={adding}
                        onClick={() => onQuickAdd(item)}
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-strong text-card hover:bg-primary-strong/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60"
                  >
                        {adding ? (
                              <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                        ) : (
                              <Icon name="plus" className="size-5" strokeWidth={2.5} />
                        )}
                  </button>
            </li>
      );
}
