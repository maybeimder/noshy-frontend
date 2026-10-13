import { Link } from "react-router-dom";
import type { NutritionPlan } from "@/modules/plans/types";
import { objectiveLabel } from "@/modules/plans/utils/labels";
import { Sparkle, Star, Steam } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import Mascot from "@/shared/components/ui/Mascot";
import ScribbleText from "@/shared/components/ui/ScribbleText";

// "always": Spanish skips the separator on 4-digit numbers by default (2200 → 2.200).
const kcal = new Intl.NumberFormat("es", { useGrouping: "always" });

type HomeHeroProps = {
      firstName: string;
      /** undefined while loading, null when the user has no plan yet. */
      plan: NutritionPlan | null | undefined;
      /** Calories eaten today (0 until the backend tracks meals). */
      caloriesToday: number;
};

const pill = "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-extrabold";

export default function HomeHero({ firstName, plan, caloriesToday }: HomeHeroProps) {
      const target = plan?.targets.calories;

      return (
            // Extra top margin: the mascot and doodles rise above the card.
            <section aria-labelledby="hero-title" className="relative mx-5 mt-14">
                  <Star className="absolute -top-12 left-[36%] size-7 rotate-12 text-primary" />
                  <Steam className="absolute -top-14 left-[47%] size-7 text-wine" />
                  <Sparkle className="absolute top-2 right-0 size-4 text-secondary" />

                  <div className="relative rounded-[1.75rem] bg-secondary-soft px-5 pt-6 pb-5">
                        <Mascot className="pointer-events-none absolute -top-16 -right-3 w-[52%] max-w-60" />

                        <div className="relative max-w-[60%]">
                              <p className="text-base font-extrabold text-rust">Hola, {firstName}</p>
                              <h1 id="hero-title" className="mt-1 text-[2rem] leading-[1.1] font-extrabold text-ink">
                                    ¿Qué cocinamos{" "}
                                    <span className="whitespace-nowrap">
                                          <ScribbleText>hoy</ScribbleText>?
                                    </span>
                              </h1>
                        </div>

                        <div className="relative mt-6 flex flex-wrap gap-2">
                              {plan === undefined ? null : plan ? (
                                    <>
                                          <span className={`${pill} bg-card text-ink`}>{objectiveLabel(plan.objective)}</span>
                                          {target && (
                                                <span
                                                      className={`${pill} bg-ink text-card tabular-nums`}
                                                      aria-label={`${kcal.format(caloriesToday)} de ${kcal.format(target)} kilocalorías hoy`}
                                                >
                                                      {kcal.format(caloriesToday)} / {kcal.format(target)} kcal
                                                </span>
                                          )}
                                    </>
                              ) : (
                                    <Link
                                          to="/plan/nuevo"
                                          className={`${pill} gap-1 bg-card text-ink hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong`}
                                    >
                                          Configura tu plan
                                          <Icon name="arrowRight" className="size-4" />
                                    </Link>
                              )}
                        </div>
                  </div>
            </section>
      );
}
