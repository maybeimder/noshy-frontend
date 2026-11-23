import { Link } from "react-router-dom";
import Icon, { type IconName } from "@/shared/components/ui/Icon";

type Meal = { name: string; from: number; to: number; icon: IconName };

// Typical hours per meal; the one we are in now is highlighted.
const breakfast: Meal = { name: "Desayuno", from: 5, to: 10, icon: "bowl" };
const lunch: Meal = { name: "Almuerzo", from: 12, to: 15, icon: "kitchen" };
const dinner: Meal = { name: "Cena", from: 18, to: 24, icon: "flame" };
const snack = (n: number, from: number, to: number): Meal => ({ name: `Snack ${n}`, from, to, icon: "sparkle" });

export function mealsFor(count: number): Meal[] {
      if (count <= 1) return [lunch];
      if (count === 2) return [breakfast, dinner];
      if (count === 3) return [breakfast, lunch, dinner];
      if (count === 4) return [breakfast, snack(1, 10, 12), lunch, dinner];
      const extra = Array.from({ length: count - 5 }, (_, i) => snack(i + 3, 21, 24));
      return [breakfast, snack(1, 10, 12), lunch, snack(2, 15, 18), dinner, ...extra];
}

// Meal slots for today. Nothing is logged yet (no meals API), so past slots say so instead of inventing kcal.
export default function MealsRow({ mealsPerDay }: { mealsPerDay: number }) {
      const hour = new Date().getHours();
      const meals = mealsFor(mealsPerDay);
      const nowIndex = meals.findIndex((m) => hour >= m.from && hour < m.to);
      const next = nowIndex === -1 ? meals.findIndex((m) => m.from > hour) : nowIndex;

      return (
            <ul aria-label="Comidas de hoy" className="scrollbar-none flex gap-2 overflow-x-auto px-5 py-1">
                  {meals.map((meal, index) => {
                        const now = index === next;
                        const past = next === -1 ? true : index < next;
                        const status = now ? (nowIndex === -1 ? "Siguiente" : "Ahora") : past ? "Sin registrar" : "Pendiente";
                        const body = (
                              <>
                                    <span className={`grid size-8 place-items-center rounded-full ${now ? "bg-primary-strong text-card" : past ? "bg-mist-soft text-ink-muted" : "bg-field text-ink"}`}>
                                          <Icon name={meal.icon} className="size-4" strokeWidth={2} />
                                    </span>
                                    <span className="mt-2 block font-display text-sm font-extrabold">{meal.name}</span>
                                    <span className={`block text-xs font-semibold ${now ? "text-secondary-soft" : "text-ink-muted"}`}>{status}</span>
                              </>
                        );
                        return (
                              <li key={meal.name} className="shrink-0">
                                    {now ? (
                                          <Link
                                                to="/chef"
                                                aria-label={`${meal.name}, ${status.toLowerCase()}: pídele ideas a tu chef`}
                                                className="flex w-[5.5rem] flex-col rounded-control bg-plum-glow p-3 text-card shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                          >
                                                {body}
                                          </Link>
                                    ) : (
                                          <div className={`flex w-[5.5rem] flex-col rounded-control p-3 ${past ? "bg-card/60 text-ink-muted" : "bg-card text-ink"} shadow-soft`}>{body}</div>
                                    )}
                              </li>
                        );
                  })}
            </ul>
      );
}
