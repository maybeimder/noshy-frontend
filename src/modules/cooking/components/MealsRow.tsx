import Icon, { type IconName } from "@/shared/components/ui/Icon";
import type { MealSlot, MealSlotId } from "@/shared/types/api";

const icons: Record<MealSlotId, IconName> = { breakfast: "bowl", snack1: "sparkle", lunch: "kitchen", snack2: "sparkle", dinner: "flame" };
const statusText = (meal: MealSlot) =>
      meal.status === "logged" ? `${meal.kcal ?? 0} kcal` : meal.status === "skipped" ? "Saltada" : meal.status === "current" ? "Ahora" : "Pendiente";

// Meal slots as the backend builds them; tapping one logs a meal.
export default function MealsRow({ meals, onPick }: { meals: MealSlot[]; onPick: (slot: MealSlot) => void }) {
      return (
            <ul aria-label="Comidas de hoy" className="scrollbar-none flex gap-2 overflow-x-auto px-5 py-1">
                  {meals.map((meal) => {
                        const now = meal.status === "current";
                        return (
                              <li key={meal.slot} className="shrink-0">
                                    <button
                                          type="button"
                                          onClick={() => onPick(meal)}
                                          aria-label={`${meal.label}, ${statusText(meal)}: registrar`}
                                          className={`flex w-[5.5rem] flex-col items-start rounded-control p-3 text-left shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                now ? "bg-plum-glow text-card" : "bg-card text-ink"
                                          }`}
                                    >
                                          <span className={`grid size-8 place-items-center rounded-full ${now ? "bg-primary-strong text-card" : meal.status === "logged" ? "bg-mint-soft text-mint-ink" : "bg-field text-ink"}`}>
                                                <Icon name={meal.status === "logged" ? "check" : icons[meal.slot]} className="size-4" strokeWidth={2} />
                                          </span>
                                          <span className="mt-2 block font-display text-sm font-extrabold">{meal.label}</span>
                                          <span className={`block text-xs font-semibold ${now ? "text-secondary-soft" : "text-ink-muted"}`}>{statusText(meal)}</span>
                                    </button>
                              </li>
                        );
                  })}
            </ul>
      );
}
