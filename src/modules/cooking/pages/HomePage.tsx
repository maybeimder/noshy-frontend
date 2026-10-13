import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useRecommendations } from "@/modules/feedback/hooks/useFeedback";
import { eventLabels } from "@/modules/feedback/utils/labels";
import { useActivePlan } from "@/modules/plans/hooks/usePlan";
import { objectiveLabel } from "@/modules/plans/utils/labels";
import { useCommunityRecipes, useMyRecipes } from "@/modules/recipes/hooks/useRecipes";
import { useSavedShoppingList } from "@/modules/shopping-list/hooks/useShoppingList";
import AppHeader from "@/shared/components/layout/AppHeader";
import Icon, { type IconName } from "@/shared/components/ui/Icon";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { plural } from "@/shared/lib/format";
import RecipeCarousel from "../components/RecipeCarousel";
import SectionHeader from "../components/SectionHeader";

const today = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date());

export default function HomePage() {
      const { user } = useAuth();
      const plan = useActivePlan();
      const community = useCommunityRecipes();
      const mine = useMyRecipes();
      const recommendations = useRecommendations();
      const { saved: shoppingList } = useSavedShoppingList();

      const firstName = user?.name.split(" ")[0] ?? "";
      const recipeLink = (id: string) => {
            if (mine.data?.some((r) => r.id === id)) return `/recetas/${id}`;
            if (community.data?.some((r) => r.id === id)) return `/comunidad/${id}`;
            return null;
      };
      const pendingItems = shoppingList ? shoppingList.list.missingItems.length - shoppingList.checked.length : 0;

      return (
            <>
                  <AppHeader />

                  <main className="mx-auto flex max-w-xl flex-col gap-8 pt-6 pb-12">
                        <div className="px-6">
                              <h1 className="text-page font-bold text-ink">Hola, {firstName}</h1>
                              <p className="text-base text-ink-muted">
                                    {plan.data ? `Tu objetivo: ${objectiveLabel(plan.data.objective).toLowerCase()}` : "¿Qué cocinamos hoy?"}
                              </p>
                        </div>

                        <div className="flex flex-col gap-3 px-6">
                              {plan.data === null && (
                                    <ShortcutCard
                                          to="/plan/nuevo"
                                          icon="sparkle"
                                          tone="secondary"
                                          title="Configura tu plan nutricional"
                                          description="Tu chef adaptará las recetas a tus metas y restricciones."
                                    />
                              )}
                              <ShortcutCard
                                    to="/chef"
                                    icon="chef"
                                    tone="primary"
                                    title="Habla con tu chef"
                                    description="Pídele ideas con lo que tienes en tu despensa."
                              />
                              {shoppingList && pendingItems > 0 && (
                                    <ShortcutCard
                                          to="/compras"
                                          icon="cart"
                                          tone="card"
                                          title="Tu lista de compras"
                                          description={`${plural(pendingItems, "cosa", "cosas")} por comprar`}
                                    />
                              )}
                        </div>

                        <section aria-labelledby="community">
                              <SectionHeader id="community" title="De la comunidad" aside={today} />
                              {community.isPending ? (
                                    <LoadingState />
                              ) : community.isError ? (
                                    <div className="px-6 pt-4">
                                          <ErrorState message={community.error.message} onRetry={() => community.refetch()} />
                                    </div>
                              ) : community.data.length === 0 ? (
                                    <p className="px-6 pt-4 text-base text-ink-muted">
                                          Todavía no hay recetas publicadas.{" "}
                                          <Link to="/recetas" className="font-bold text-ink underline underline-offset-4">
                                                Publica la primera
                                          </Link>
                                    </p>
                              ) : (
                                    <RecipeCarousel
                                          recipes={community.data.slice(0, 8)}
                                          labelledBy="community"
                                          linkTo={(recipe) => `/comunidad/${recipe.id}`}
                                    />
                              )}
                        </section>

                        <section aria-labelledby="for-you" className="flex flex-col gap-4">
                              <SectionHeader id="for-you" title="Para ti" highlight="secondary" />
                              <div className="px-6">
                                    {recommendations.isPending ? (
                                          <LoadingState />
                                    ) : recommendations.isError ? (
                                          <ErrorState message={recommendations.error.message} onRetry={() => recommendations.refetch()} />
                                    ) : recommendations.data.length === 0 ? (
                                          <p className="rounded-card bg-card p-6 text-base text-ink-muted">
                                                Cuando cocines una receta o se lo cuentes a tu chef, aquí verás recomendaciones hechas para ti.
                                          </p>
                                    ) : (
                                          <ul className="flex flex-col gap-3">
                                                {recommendations.data.slice(0, 5).map((item) => {
                                                      const to = item.targetType === "recipe" ? recipeLink(item.targetId) : null;
                                                      const body = (
                                                            <>
                                                                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary-soft text-ink">
                                                                        <Icon name={item.targetType === "recipe" ? "book" : "sparkle"} className="size-5" />
                                                                  </span>
                                                                  <span className="min-w-0 flex-1">
                                                                        <span className="block truncate text-base font-bold text-ink">{item.targetName}</span>
                                                                        <span className="block text-sm text-ink-muted">
                                                                              {eventLabels[item.eventType]} · {item.recommendation}
                                                                        </span>
                                                                  </span>
                                                                  {to && <Icon name="arrowRight" className="size-5 shrink-0 text-ink-muted" />}
                                                            </>
                                                      );
                                                      return (
                                                            <li key={item.id}>
                                                                  {to ? (
                                                                        <Link
                                                                              to={to}
                                                                              className="flex items-center gap-4 rounded-card bg-card p-4 hover:bg-secondary-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                                                        >
                                                                              {body}
                                                                        </Link>
                                                                  ) : (
                                                                        <div className="flex items-center gap-4 rounded-card bg-card p-4">{body}</div>
                                                                  )}
                                                            </li>
                                                      );
                                                })}
                                          </ul>
                                    )}
                              </div>
                        </section>
                  </main>
            </>
      );
}

const tones = {
      primary: "bg-primary-soft",
      secondary: "bg-secondary-soft",
      card: "bg-card",
};

function ShortcutCard({
      to,
      icon,
      tone,
      title,
      description,
}: {
      to: string;
      icon: IconName;
      tone: keyof typeof tones;
      title: string;
      description: string;
}) {
      return (
            <Link
                  to={to}
                  className={`group flex items-center gap-4 rounded-card p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${tones[tone]}`}
            >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-ink">
                        <Icon name={icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                        <span className="block text-title font-bold text-ink">{title}</span>
                        <span className="block text-sm text-ink-muted">{description}</span>
                  </span>
                  <Icon name="arrowRight" className="size-5 shrink-0 text-ink transition-transform group-hover:translate-x-1" />
            </Link>
      );
}
