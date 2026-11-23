import { useId, useState } from "react";
import Icon from "@/shared/components/ui/Icon";
import { fieldClass } from "@/shared/components/ui/TextField";
import { useIngredientSearch } from "../hooks/useInventory";
import type { IngredientOption } from "../types";

type IngredientSearchProps = { label: string; placeholder?: string; autoFocus?: boolean; onPick: (option: IngredientOption) => void };

/** Search in the ingredient catalog; everything the API stores refers to one of these. */
export default function IngredientSearch({ label, placeholder = "Busca un ingrediente…", autoFocus, onPick }: IngredientSearchProps) {
      const id = useId();
      const [query, setQuery] = useState("");
      const search = useIngredientSearch(query);
      const typed = query.trim().length >= 2;

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
                              {search.data.length === 0 && <li className="py-3 text-sm text-ink-muted">No encontramos «{query.trim()}» en el catálogo.</li>}
                        </ul>
                  )}
            </div>
      );
}
