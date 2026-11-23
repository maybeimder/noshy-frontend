import { Sparkle, Star } from "@/shared/components/ui/Doodles";
import Icon, { type IconName } from "@/shared/components/ui/Icon";
import { BrandRing, MascotAvatar } from "@/shared/components/ui/MascotBubble";
import type { Tone } from "@/shared/lib/tones";
import type { NutritionPlan } from "../types";
import { objectiveLabel } from "../utils/labels";
import { cookTimes, dietStyles, dishOptions, goalLabel, type OnboardingPrefs } from "../utils/onboarding";
import { ToneIcon } from "./OnboardingUI";

type PlanDoneProps = {
      firstName: string;
      plan: NutritionPlan;
      prefs: OnboardingPrefs | null;
      /** Opens the flow again on that step (index in planSteps). */
      onEdit: (step: number) => void;
      onContinue: () => void;
};

const list = (values: string[], empty: string) => (values.length ? values.join(", ") : empty);

// «¡Listo, Diana!»: what the chef learned, each answer one tap from being changed.
export default function PlanDone({ firstName, plan, prefs, onEdit, onContinue }: PlanDoneProps) {
      const time = cookTimes.find((t) => t.value === prefs?.cookTime)?.label;
      const rows: { label: string; value: string; icon: IconName; tone: Tone; step: number }[] = [
            {
                  label: "Objetivo",
                  value: prefs?.goals.length ? prefs.goals.map(goalLabel).join(" · ") : objectiveLabel(plan.objective),
                  icon: "target",
                  tone: "mint",
                  step: 0,
            },
            {
                  label: "Nunca",
                  value: list(
                        plan.restrictions.filter((r) => !dietStyles.includes(r)),
                        plan.restrictions.length ? plan.restrictions.join(", ") : "Sin restricciones",
                  ),
                  icon: "alert",
                  tone: "rose",
                  step: 2,
            },
            {
                  label: "Te encanta",
                  value: list(dishOptions.filter((d) => prefs?.dishes.includes(d.value)).map((d) => d.label), "Aún por descubrir"),
                  icon: "heart",
                  tone: "peach",
                  step: 3,
            },
            {
                  label: "Tu cocina",
                  value: [`${plan.mealsPerDay ?? 3} comidas`, time, prefs?.appliances[0]].filter(Boolean).join(" · "),
                  icon: "kitchen",
                  tone: "mustard",
                  step: 4,
            },
            {
                  label: "Compras",
                  value: [list(prefs?.stores ?? [], "Sin tiendas"), prefs?.budget ? `$${Math.round(prefs.budget / 1000)}k/sem` : null].filter(Boolean).join(" · "),
                  icon: "cart",
                  tone: "sky",
                  step: 5,
            },
      ];

      return (
            <main className="min-h-dvh bg-[linear-gradient(180deg,var(--color-primary-strong)_0%,var(--color-wine)_55%,var(--color-plum)_100%)] px-5 pt-12 pb-8 text-card">
                  <div className="mx-auto flex max-w-xl flex-col gap-6">
                        <div className="relative mx-auto">
                              <Star className="absolute -top-2 -left-12 size-7 -rotate-12 text-card/80" />
                              <Sparkle className="absolute top-4 -right-12 size-5 text-secondary" />
                              <Star className="absolute -right-8 bottom-2 size-5 rotate-12 text-card/60" />
                              <span className="grid size-36 place-items-center rounded-full bg-card/20 p-2">
                                    <BrandRing className="size-full">
                                          <MascotAvatar tone="white" className="size-full" />
                                    </BrandRing>
                              </span>
                        </div>

                        <div className="text-center">
                              <h1 className="text-page font-extrabold">¡Listo, {firstName}!</h1>
                              <p className="mx-auto mt-2 max-w-xs text-base text-card/85">
                                    Tu chef Noshy ya te conoce un poquito. Cada receta que cocines le hará conocerte mejor.
                              </p>
                        </div>

                        <ul aria-label="Lo que sabe tu chef" className="divide-y divide-line rounded-card bg-card px-4 text-ink shadow-[0_24px_48px_-24px_rgb(29_9_44/0.8)]">
                              {rows.map((row) => (
                                    <li key={row.label} className="flex items-center gap-3 py-3">
                                          <ToneIcon icon={row.icon} tone={row.tone} className="size-10 rounded-control" />
                                          <div className="min-w-0 flex-1">
                                                <p className="text-xs font-extrabold tracking-wider text-ink-muted uppercase">{row.label}</p>
                                                <p className="truncate text-sm font-bold">{row.value}</p>
                                          </div>
                                          <button
                                                type="button"
                                                aria-label={`Cambiar ${row.label.toLowerCase()}`}
                                                onClick={() => onEdit(row.step)}
                                                className="grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-field hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-strong"
                                          >
                                                <Icon name="edit" className="size-5" />
                                          </button>
                                    </li>
                              ))}
                        </ul>

                        <button
                              type="button"
                              onClick={onContinue}
                              className="mt-2 flex min-h-14 items-center justify-between rounded-full bg-card py-2 pr-2 pl-6 font-display text-title font-extrabold text-ink shadow-[0_16px_32px_-16px_rgb(29_9_44/0.8)] transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
                        >
                              Ver mi primer menú
                              <span aria-hidden className="grid size-10 place-items-center rounded-full bg-brand text-card">
                                    <Icon name="arrowRight" className="size-5" strokeWidth={2.25} />
                              </span>
                        </button>
                  </div>
            </main>
      );
}
