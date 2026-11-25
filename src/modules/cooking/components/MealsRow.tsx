import Icon, { type IconName } from "@/shared/components/ui/Icon";
import type { MealSlot, MealSlotId } from "@/shared/types/api";

const icons: Record<MealSlotId, IconName> = { breakfast: "coffee", snack1: "sparkle", lunch: "soup", snack2: "sparkle", dinner: "moon" };
const statusText = (meal: MealSlot) =>
      meal.status === "logged" ? `${meal.kcal ?? 0} kcal` : meal.status === "skipped" ? "Saltada" : meal.status === "current" ? "Ahora" : "Pendiente";

// Logged meals sink into the panel, the current one stands out, the rest are outlined.
const tones: Record<MealSlot["status"], { tile: string; icon: string; text: string }> = {
      logged: { tile: "bg-canvas text-ink", icon: "bg-protein-soft text-protein", text: "text-protein-ink" },
      current: { tile: "bg-plum-glow text-card shadow-[0_10px_18px_-8px_rgb(46_19_45/0.5)]", icon: "bg-brand text-card", text: "text-marker" },
      pending: { tile: "border border-line bg-card text-ink", icon: "bg-canvas text-ink-muted", text: "text-ink-muted" },
      skipped: { tile: "border border-line bg-card text-ink", icon: "bg-canvas text-ink-muted", text: "text-ink-muted" },
};

// Meal slots as the backend builds them; tapping one logs a meal. Up to four share the row, more of them scroll.
export default function MealsRow({ meals, onPick }: { meals: MealSlot[]; onPick: (slot: MealSlot) => void }) {
      return (
            <ul aria-label="Comidas de hoy" className="scrollbar-none flex gap-1.5 overflow-x-auto px-5 pt-1 pb-6">
                  {meals.map((meal) => {
                        const tone = tones[meal.status];
                        return (
                              <li key={meal.slot} className="min-w-[4.6rem] flex-1">
                                    <button
                                          type="button"
                                          onClick={() => onPick(meal)}
                                          aria-label={`${meal.label}, ${statusText(meal)}: registrar`}
                                          className={`flex h-[5.375rem] w-full flex-col items-center justify-center rounded-[1.25rem] px-1 text-center transition-[scale] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${tone.tile}`}
                                    >
                                          <span className={`grid size-8 place-items-center rounded-full ${tone.icon}`}>
                                                <Icon name={meal.status === "logged" ? "check" : icons[meal.slot]} className="size-4" strokeWidth={2} />
                                          </span>
                                          <span className="mt-1 block max-w-full truncate font-display text-[0.8125rem] leading-[1.125rem] font-medium">{meal.label}</span>
                                          <span className={`block text-[0.6875rem] leading-4 font-bold ${tone.text}`}>{statusText(meal)}</span>
                                    </button>
                              </li>
                        );
                  })}
            </ul>
      );
}
