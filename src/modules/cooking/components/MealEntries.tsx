import { Link } from "react-router-dom";
import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import { slotLabel } from "@/modules/menus/utils/week";
import type { MealEntry } from "@/shared/types/api";
import { useMealMutations } from "../hooks/useHome";

/** What was logged, one by one, each with a way to remove it. */
export default function MealEntries({ date, entries, withSlot = true }: { date: string; entries: MealEntry[]; withSlot?: boolean }) {
      const { remove } = useMealMutations();
      if (entries.length === 0) return <p className="text-sm text-ink-muted">Aún no hay nada registrado.</p>;
      return (
            <>
                  <ul aria-label="Registrado" className="flex flex-col divide-y divide-line">
                        {entries.map((entry) => (
                              <li key={entry.id} className="flex items-center gap-3 py-2">
                                    <IngredientIcon label={entry.label} shape="circle" className="size-10" />
                                    <span className="min-w-0 flex-1">
                                          {entry.recipeId ? (
                                                <Link to={`/recetas/${entry.recipeId}`} className="block truncate font-bold text-ink hover:underline focus-visible:outline-2 focus-visible:outline-primary-strong">
                                                      {entry.label}
                                                </Link>
                                          ) : (
                                                <span className="block truncate font-bold text-ink">{entry.label}</span>
                                          )}
                                          <span className="block text-xs text-ink-muted">{[withSlot && slotLabel(entry.slot), !entry.skipped && `${Math.round(entry.kcal)} kcal`].filter(Boolean).join(" · ")}</span>
                                    </span>
                                    <button
                                          type="button"
                                          aria-label={`Borrar ${entry.label}`}
                                          disabled={remove.isPending}
                                          onClick={() => remove.mutate({ date, mealId: entry.id })}
                                          className="grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-field hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-50"
                                    >
                                          <Icon name="trash" className="size-5" />
                                    </button>
                              </li>
                        ))}
                  </ul>
                  {remove.error && <p className="text-sm font-semibold text-error">{remove.error.message}</p>}
            </>
      );
}
