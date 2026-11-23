import { Link } from "react-router-dom";
import type { NutritionPlan } from "@/modules/plans/types";
import Icon from "@/shared/components/ui/Icon";
import { tones, type Tone } from "@/shared/lib/tones";

// "always": Spanish skips the separator on 4-digit numbers by default (2200 → 2.200).
const kcal = new Intl.NumberFormat("es", { useGrouping: "always" });

type DayCardProps = {
      /** undefined while loading, null when the user has no plan yet. */
      plan: NutritionPlan | null | undefined;
      /** Calories eaten today (0 until the backend tracks meals). */
      caloriesToday: number;
};

const macros: { key: "proteinGrams" | "carbohydratesGrams" | "fatGrams"; label: string; tone: Tone; bar: string }[] = [
      { key: "proteinGrams", label: "Proteína", tone: "rose", bar: "bg-primary" },
      { key: "carbohydratesGrams", label: "Carbos", tone: "mustard", bar: "bg-mustard" },
      { key: "fatGrams", label: "Grasas", tone: "sky", bar: "bg-cobalt" },
];

// «1.240 / 2.200 kcal»: today's calories against the plan, then each macro target.
export default function DayCard({ plan, caloriesToday }: DayCardProps) {
      if (plan === undefined) return <div aria-hidden className="mx-5 h-40 animate-pulse rounded-card bg-card/70" />;

      if (!plan?.targets.calories) {
            return (
                  <Link
                        to={plan ? "/plan/editar" : "/plan/nuevo"}
                        className="group mx-5 flex items-center gap-4 rounded-card bg-card p-5 shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                  >
                        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-peach-soft text-peach-ink">
                              <Icon name="target" />
                        </span>
                        <span className="min-w-0 flex-1">
                              <span className="block font-display text-title font-extrabold text-ink">Configura tu plan</span>
                              <span className="block text-sm text-ink-muted">Así tu chef sabe cuánto y qué te conviene comer.</span>
                        </span>
                        <Icon name="arrowRight" className="size-6 shrink-0 text-primary-strong transition-transform group-hover:translate-x-1" />
                  </Link>
            );
      }

      const target = plan.targets.calories;
      const share = Math.min(1, caloriesToday / target);
      const left = Math.max(0, target - caloriesToday);

      return (
            <section aria-label="Tu día" className="mx-5 rounded-card bg-card p-5 shadow-soft">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="flex items-baseline gap-1.5 text-ink" aria-label={`${kcal.format(caloriesToday)} de ${kcal.format(target)} kilocalorías hoy`}>
                              <span className="font-display text-metric font-extrabold tabular-nums">{kcal.format(caloriesToday)}</span>
                              <span className="text-sm font-bold text-ink-muted tabular-nums">/ {kcal.format(target)} kcal</span>
                        </p>
                        <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-extrabold text-peach-ink tabular-nums">
                              {Math.round(share * 100)}% · quedan {kcal.format(left)}
                        </span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-field">
                        <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-secondary),var(--color-primary))]"
                              style={{ width: `${Math.max(2, share * 100)}%` }}
                        />
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-4">
                        {macros.map(({ key, label, tone, bar }) => {
                              const goal = plan.targets[key];
                              return (
                                    <div key={key}>
                                          <div className="flex items-baseline justify-between gap-1">
                                                <dt className={`text-xs font-extrabold ${tones[tone].ink}`}>{label}</dt>
                                                <dd className="text-xs font-bold text-ink-muted tabular-nums">{goal ? `0/${goal}g` : "—"}</dd>
                                          </div>
                                          <div aria-hidden className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-field">
                                                <div className={`h-full w-[2%] rounded-full ${bar}`} />
                                          </div>
                                    </div>
                              );
                        })}
                  </dl>
            </section>
      );
}
