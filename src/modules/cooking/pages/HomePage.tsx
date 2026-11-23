import { Link, Navigate } from "react-router-dom";
import { useRecommendations } from "@/modules/feedback/hooks/useFeedback";
import { useInventory } from "@/modules/inventory/hooks/useInventory";
import { useCaloriesToday } from "@/modules/meals/hooks/useCaloriesToday";
import { useActivePlan } from "@/modules/plans/hooks/usePlan";
import { useOnboardingSkipped } from "@/modules/plans/utils/onboarding";
import { useCommunityRecipes, useMyRecipes } from "@/modules/recipes/hooks/useRecipes";
import type { Recipe } from "@/modules/recipes/types";
import AppHeader from "@/shared/components/layout/AppHeader";
import Icon from "@/shared/components/ui/Icon";
import { LoadingState } from "@/shared/components/ui/QueryState";
import { MarkerText } from "@/shared/components/ui/ScribbleText";
import ChefPromptCard from "../components/ChefPromptCard";
import DayCard from "../components/DayCard";
import MealsRow from "../components/MealsRow";
import MostCooked from "../components/MostCooked";
import TodayCarousel, { type TodayPick } from "../components/TodayCarousel";

const IDEAS = 3;

/** Recommended recipes first, then the newest from the community, then mine: up to three, no repeats. */
function pickToday(mine: Recipe[], community: Recipe[], recommendedIds: string[]): TodayPick[] {
      const mineIds = new Set(mine.map((r) => r.id));
      const link = (recipe: Recipe) => (mineIds.has(recipe.id) ? `/recetas/${recipe.id}` : `/comunidad/${recipe.id}`);
      const all = [...mine, ...community];
      const picks: TodayPick[] = [];
      const add = (recipe: Recipe | undefined, reason: string) => {
            if (recipe && picks.length < IDEAS && !picks.some((p) => p.recipe.id === recipe.id)) picks.push({ recipe, to: link(recipe), reason });
      };
      recommendedIds.forEach((id) => add(all.find((r) => r.id === id), "Te va a encantar"));
      [...community].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")).forEach((r) => add(r, r.authorName ? `De ${r.authorName.split(" ")[0]}` : "De la comunidad"));
      mine.forEach((r) => add(r, "Tu receta"));
      return picks;
}

function SectionTitle({ id, title, action }: { id: string; title: string; action?: { to: string; label: string } }) {
      return (
            <div className="flex items-end justify-between gap-3 px-5">
                  <h2 id={id} className="text-section font-extrabold text-ink">
                        <MarkerText>{title}</MarkerText>
                  </h2>
                  {action && (
                        <Link to={action.to} className="min-h-11 content-center text-sm font-extrabold text-primary-strong focus-visible:outline-2 focus-visible:outline-primary-strong">
                              {action.label}
                        </Link>
                  )}
            </div>
      );
}

export default function HomePage() {
      const plan = useActivePlan();
      const mine = useMyRecipes();
      const community = useCommunityRecipes();
      const recommendations = useRecommendations();
      const inventory = useInventory();
      const caloriesToday = useCaloriesToday();
      const [skipped] = useOnboardingSkipped();

      const recommendedIds = (recommendations.data ?? []).filter((r) => r.targetType === "recipe").map((r) => r.targetId);
      const picks = pickToday(mine.data ?? [], community.data ?? [], recommendedIds);
      const loadingPicks = mine.isPending || community.isPending;

      // A new account (or one that never finished) starts with the six onboarding steps.
      if (plan.isSuccess && plan.data === null && !skipped) return <Navigate to="/plan/nuevo" replace />;

      return (
            <>
                  <AppHeader />

                  <main className="mx-auto flex max-w-xl flex-col gap-6 pt-3 pb-12">
                        <DayCard plan={plan.data} caloriesToday={caloriesToday.data ?? 0} />
                        {plan.data && <MealsRow mealsPerDay={plan.data.mealsPerDay ?? 3} />}

                        <section aria-labelledby="for-you" className="flex flex-col gap-3">
                              <SectionTitle id="for-you" title="Hoy para ti" action={picks.length > 1 ? { to: "/recetas?ver=explorar", label: `${picks.length} ideas` } : undefined} />
                              {loadingPicks ? (
                                    <LoadingState />
                              ) : picks.length > 0 ? (
                                    <TodayCarousel picks={picks} inventory={inventory.data ?? []} />
                              ) : (
                                    <Link
                                          to="/recetas/nueva"
                                          className="mx-5 flex items-center gap-4 rounded-card bg-card p-6 shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                    >
                                          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary-soft text-ink">
                                                <Icon name="plus" />
                                          </span>
                                          <span className="flex-1 text-base text-ink">
                                                <strong className="block">Aún no hay recetas</strong>
                                                Crea la primera y aparecerá aquí.
                                          </span>
                                    </Link>
                              )}
                        </section>

                        <ChefPromptCard inventory={inventory.data} />

                        <section aria-labelledby="most-cooked" className="flex flex-col gap-3">
                              <SectionTitle id="most-cooked" title="Lo que más cocinas" action={{ to: "/recetas", label: "Ver todo" }} />
                              <MostCooked recipes={mine.data ?? []} />
                        </section>
                  </main>
            </>
      );
}
