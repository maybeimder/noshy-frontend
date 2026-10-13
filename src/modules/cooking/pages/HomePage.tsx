import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useRecommendations } from "@/modules/feedback/hooks/useFeedback";
import { useInventory } from "@/modules/inventory/hooks/useInventory";
import { useCaloriesToday } from "@/modules/meals/hooks/useCaloriesToday";
import { useActivePlan } from "@/modules/plans/hooks/usePlan";
import { useCommunityRecipes, useMyRecipes } from "@/modules/recipes/hooks/useRecipes";
import type { Recipe } from "@/modules/recipes/types";
import AppHeader from "@/shared/components/layout/AppHeader";
import { Sparkle, Squiggle } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import { LoadingState } from "@/shared/components/ui/QueryState";
import ChefPromptCard from "../components/ChefPromptCard";
import CooksRow, { cooksFrom } from "../components/CooksRow";
import FeaturedRecipe from "../components/FeaturedRecipe";
import HomeHero from "../components/HomeHero";

type FeaturedPick = { recipe: Recipe; tag?: string };

/** Best recommended recipe, else the newest community one, else one of mine. */
function pickFeatured(
      mine: Recipe[] | undefined,
      community: Recipe[] | undefined,
      recommendedIds: string[],
): FeaturedPick | null {
      const all = [...(mine ?? []), ...(community ?? [])];
      const recommended = recommendedIds.map((id) => all.find((r) => r.id === id)).find(Boolean);
      if (recommended) return { recipe: recommended, tag: "¡Te va a encantar!" };
      const newest = [...(community ?? [])].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))[0];
      if (newest) return { recipe: newest, tag: "Nuevo en la comunidad" };
      return mine?.[0] ? { recipe: mine[0] } : null;
}

export default function HomePage() {
      const { user } = useAuth();
      const plan = useActivePlan();
      const mine = useMyRecipes();
      const community = useCommunityRecipes();
      const recommendations = useRecommendations();
      const inventory = useInventory();
      const caloriesToday = useCaloriesToday();

      const recommendedIds = (recommendations.data ?? []).filter((r) => r.targetType === "recipe").map((r) => r.targetId);
      const featured = pickFeatured(mine.data, community.data, recommendedIds);
      const featuredLink = (recipe: Recipe) =>
            mine.data?.some((r) => r.id === recipe.id) ? `/recetas/${recipe.id}` : `/comunidad/${recipe.id}`;
      const loadingFeatured = mine.isPending || community.isPending;

      return (
            <>
                  <AppHeader />

                  <main className="mx-auto flex max-w-xl flex-col gap-8 pb-12">
                        <HomeHero firstName={user?.name.split(" ")[0] ?? ""} plan={plan.data} caloriesToday={caloriesToday.data ?? 0} />

                        <CooksRow cooks={cooksFrom(community.data ?? [])} />

                        <section aria-labelledby="for-you" className="flex flex-col gap-4">
                              <div className="relative flex items-end justify-between px-5">
                                    <h2 id="for-you" className="relative text-section font-extrabold text-ink">
                                          Para ti
                                          <Squiggle className="absolute -bottom-2 left-0 h-3 w-full text-secondary" />
                                          <Sparkle className="absolute -top-1 -right-6 size-4 text-primary" />
                                    </h2>
                                    <Sparkle className="size-5 text-secondary" />
                              </div>

                              {loadingFeatured ? (
                                    <LoadingState />
                              ) : featured ? (
                                    <FeaturedRecipe recipe={featured.recipe} to={featuredLink(featured.recipe)} tag={featured.tag} />
                              ) : (
                                    <Link
                                          to="/recetas/nueva"
                                          className="mx-6 flex items-center gap-4 rounded-card bg-card p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
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
                  </main>
            </>
      );
}
