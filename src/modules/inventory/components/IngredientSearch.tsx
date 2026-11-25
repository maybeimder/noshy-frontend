import { useId, useState } from "react";
import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import Photo from "@/shared/components/ui/Photo";
import { fieldClass } from "@/shared/components/ui/TextField";
import { useIngredientSearch } from "../hooks/useInventory";
import type { IngredientOption } from "../types";

type IngredientSearchProps = { label: string; placeholder?: string; autoFocus?: boolean; initialQuery?: string; onPick: (option: IngredientOption) => void; /** Offers to add what was typed as it is (the API accepts 2–60 characters with a letter). */ onText?: (text: string) => void };

/** Search in the ingredient catalog; everything the API stores refers to one of these. */
export default function IngredientSearch({ label, placeholder = "Busca un ingrediente…", autoFocus, initialQuery = "", onPick, onText }: IngredientSearchProps) {
      const id = useId();
      const [query, setQuery] = useState(initialQuery);
      const search = useIngredientSearch(query);
      const text = query.trim().replace(/\s+/g, " ");
      const typed = text.length >= 2;
      const asText = onText && typed && text.length <= 60 && /\p{L}/u.test(text) && !search.isPlaceholderData && !search.data?.some((o) => o.label.toLowerCase() === text.toLowerCase());

      return (
            <div className="flex flex-col gap-2">
                  <label htmlFor={id} className="sr-only">
                        {label}
                  </label>
                  <div className="relative">
                        <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
                        <input
                              id={id}
                              type="search"
                              autoFocus={autoFocus}
                              autoComplete="off"
                              value={query}
                              placeholder={placeholder}
                              onChange={(e) => setQuery(e.target.value)}
                              // Enter would submit the form around it.
                              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                              className={`${fieldClass("field")} min-h-12 rounded-full pr-4 pl-12`}
                        />
                  </div>
                  {query.trim().length === 1 && <p className="text-xs font-semibold text-ink-muted">Escribe al menos 2 letras.</p>}
                  {typed && search.isPending && (
                        <p role="status" className="text-sm font-semibold text-ink-muted">
                              Buscando en el catálogo…
                        </p>
                  )}
                  {typed && search.error && <p className="text-sm font-semibold text-error">{search.error.message}</p>}
                  {typed && search.data && (
                        <ul aria-label="Resultados" className="flex flex-col divide-y divide-line">
                              {search.data.map((option) => (
                                    <li key={option.id}>
                                          <button
                                                type="button"
                                                onClick={() => {
                                                      onPick(option);
                                                      setQuery("");
                                                }}
                                                className="flex min-h-12 w-full items-center gap-3 py-2 text-left hover:bg-field focus-visible:outline-2 focus-visible:outline-primary-strong"
                                          >
                                                <ProductThumb option={option} />
                                                <span className="min-w-0 flex-1">
                                                      <span className="block font-bold text-ink">{option.label}</span>
                                                      {option.conflicts.length > 0 && (
                                                            <span className="flex items-center gap-1 text-xs font-bold text-warning">
                                                                  <Icon name="alert" className="size-3.5" />
                                                                  Choca con: {option.conflicts.map((c) => c.label).join(", ")}
                                                            </span>
                                                      )}
                                                </span>
                                                <Icon name="plus" className="size-5 shrink-0 text-primary-strong" strokeWidth={2.25} />
                                          </button>
                                    </li>
                              ))}
                              {search.data.length === 0 && !asText && <li className="py-3 text-sm text-ink-muted">«{query.trim()}» todavía no está en el catálogo de Noshy. Prueba con otro nombre (por ejemplo «avena» o «granola»).</li>}
                              {asText && (
                                    <li>
                                          <button
                                                type="button"
                                                onClick={() => {
                                                      onText(text);
                                                      setQuery("");
                                                }}
                                                className="flex min-h-12 w-full items-center gap-3 py-2 text-left hover:bg-field focus-visible:outline-2 focus-visible:outline-primary-strong"
                                          >
                                                <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-control bg-blush text-primary-strong">
                                                      <Icon name="edit" className="size-5" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                      <span className="block truncate font-bold text-ink">Añadir «{text}»</span>
                                                      <span className="block text-xs text-ink-muted">{search.data.length === 0 ? "No está en el catálogo, pero puedes guardarlo igual" : "Tal como lo escribiste"}</span>
                                                </span>
                                          </button>
                                    </li>
                              )}
                        </ul>
                  )}
            </div>
      );
}

/** The product's photo; without one (or if it does not load), its pictogram on the brand gradient. */
function ProductThumb({ option }: { option: IngredientOption }) {
      return (
            <span aria-hidden className="block size-12 shrink-0 overflow-hidden rounded-control bg-card shadow-soft">
                  <Photo
                        url={option.imageUrl}
                        width={96}
                        height={96}
                        className="size-full object-contain"
                        fallback={<IngredientIcon label={option.label} icon={option.icon} shape="bare" color="text-card" className="size-full bg-brand" />}
                  />
            </span>
      );
}
