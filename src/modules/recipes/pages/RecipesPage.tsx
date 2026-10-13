import { Link, useSearchParams } from "react-router-dom";
import { useFeedbackHistory } from "@/modules/feedback/hooks/useFeedback";
import { useSavedShoppingList } from "@/modules/shopping-list/hooks/useShoppingList";
import PageHeader from "@/shared/components/layout/PageHeader";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import Mascot from "@/shared/components/ui/Mascot";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import Sticker from "@/shared/components/ui/Sticker";
import RecipeGridCard, { coverBadge } from "../components/RecipeGridCard";
import { useCommunityRecipes, useMyRecipes } from "../hooks/useRecipes";
import type { Recipe } from "../types";

const tabs = [
      { id: "mias", label: "Mis recetas" },
      { id: "comunidad", label: "Comunidad" },
] as const;

export default function RecipesPage() {
      const [params, setParams] = useSearchParams();
      const tab = params.get("ver") === "comunidad" ? "comunidad" : "mias";
      const mine = useMyRecipes();
      const community = useCommunityRecipes();
      const history = useFeedbackHistory();
      const { saved } = useSavedShoppingList();
      const query = tab === "mias" ? mine : community;
      // From the home cooks row: /recetas?ver=comunidad&autor=Nicolás
      const author = tab === "comunidad" ? params.get("autor") : null;
      const recipes = (query.data ?? []).filter((recipe) => !author || recipe.authorName === author);
      const pending = saved ? saved.list.missingItems.length - saved.checked.length : 0;
      const prepared = new Set((history.data ?? []).filter((f) => f.eventType === "prepared").map((f) => f.targetId));

      const badgeFor = (recipe: Recipe) => {
            if (tab === "comunidad") {
                  return recipe.authorName ? <span className={`${coverBadge} bg-card text-ink`}>Por {recipe.authorName.split(" ")[0]}</span> : null;
            }
            if (prepared.has(recipe.id)) return <span className={`${coverBadge} bg-card text-ink`}>Preparada</span>;
            return (
                  <span className={`${coverBadge} bg-card text-ink`}>
                        <Icon name={recipe.isPublic ? "globe" : "lock"} className="size-3.5" strokeWidth={2.25} />
                        {recipe.isPublic ? "Publicada" : "Privada"}
                  </span>
            );
      };

      return (
            <>
                  <PageHeader
                        title="Recetas"
                        scribble="orange"
                        decoration="star"
                        actions={
                              <>
                                    <RoundButton to="/compras" label="Lista de compras" badge={pending || undefined}>
                                          <Icon name="cart" />
                                    </RoundButton>
                                    <RoundButton to="/recetas/nueva" label="Nueva receta" tone="primary">
                                          <Icon name="plus" strokeWidth={2.25} />
                                    </RoundButton>
                              </>
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                        <div role="tablist" aria-label="Tipo de recetas" className="grid grid-cols-2 gap-1 rounded-full bg-card p-1.5">
                              {tabs.map(({ id, label }) => {
                                    const selected = tab === id;
                                    return (
                                          <button
                                                key={id}
                                                type="button"
                                                role="tab"
                                                id={`tab-${id}`}
                                                aria-selected={selected}
                                                aria-controls="recipes-panel"
                                                onClick={() => setParams(id === "mias" ? {} : { ver: id }, { replace: true })}
                                                className={`min-h-11 rounded-full text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                      selected ? "bg-ink text-card" : "text-ink-muted hover:text-ink"
                                                }`}
                                          >
                                                {label}
                                          </button>
                                    );
                              })}
                        </div>

                        {tab === "mias" && saved && pending > 0 && (
                              <Link
                                    to="/compras"
                                    className="group flex items-center gap-3 rounded-card bg-secondary-soft p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                              >
                                    <span className="grid size-11 shrink-0 place-items-center rounded-control bg-card text-tomato">
                                          <Icon name="cart" className="size-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                          <span className="block font-display text-base font-extrabold text-ink">Tu lista de compras</span>
                                          <span className="block truncate text-xs font-semibold text-ink">
                                                {saved.list.recipes.map((r) => r.title).join(", ")} · {pending} por comprar
                                          </span>
                                    </span>
                                    <Icon name="arrowRight" className="size-5 shrink-0 text-ink transition-transform group-hover:translate-x-1" />
                              </Link>
                        )}

                        {author && (
                              <p className="inline-flex items-center gap-2 self-start rounded-full bg-secondary-soft py-1 pr-1 pl-4 text-sm text-ink">
                                    Recetas de <strong>{author}</strong>
                                    <button
                                          type="button"
                                          aria-label="Ver todas las recetas de la comunidad"
                                          onClick={() => setParams({ ver: "comunidad" }, { replace: true })}
                                          className="grid size-8 place-items-center rounded-full hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-primary-strong"
                                    >
                                          <Icon name="close" className="size-4" />
                                    </button>
                              </p>
                        )}

                        <section id="recipes-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
                              {query.isPending ? (
                                    <LoadingState />
                              ) : query.isError ? (
                                    <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
                              ) : tab === "comunidad" && recipes.length === 0 && !author ? (
                                    <CommunityEmpty />
                              ) : (
                                    <ul className="grid grid-cols-2 gap-3">
                                          {recipes.map((recipe) => (
                                                <li key={recipe.id}>
                                                      <RecipeGridCard
                                                            recipe={recipe}
                                                            to={tab === "mias" ? `/recetas/${recipe.id}` : `/comunidad/${recipe.id}`}
                                                            badge={badgeFor(recipe)}
                                                      />
                                                </li>
                                          ))}
                                          {tab === "mias" && (
                                                <li>
                                                      <Link
                                                            to="/recetas/nueva"
                                                            className="flex h-full min-h-60 flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-primary/40 p-4 text-center hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                                      >
                                                            <Mascot className="w-24" />
                                                            <span className="font-display text-base font-extrabold text-ink">¡Crea una receta!</span>
                                                            <span className="text-xs font-semibold text-ink-muted">Guárdala y adáptala a tu despensa</span>
                                                      </Link>
                                                </li>
                                          )}
                                    </ul>
                              )}
                        </section>
                  </main>
            </>
      );
}

function CommunityEmpty() {
      return (
            <div className="flex flex-col gap-4">
                  <section className="relative overflow-hidden rounded-[1.75rem] bg-secondary-soft px-5 pt-40 pb-5">
                        <Mascot className="absolute -top-2 right-2 w-44" />
                        <Sticker tilt={-6} className="absolute top-6 left-28">
                              ¡Hola, vecina!
                        </Sticker>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-extrabold text-ink">
                              <Icon name="globe" className="size-3.5 text-primary-strong" strokeWidth={2.25} />
                              Recién abierta
                        </span>
                        <h2 className="mt-3 text-[1.75rem] leading-tight font-extrabold text-ink">La comunidad está empezando</h2>
                        <p className="mt-2 text-sm text-ink">Publica una de tus recetas y sé de las primeras en inspirar a otras personas.</p>
                        <Link to="/recetas" className={`${buttonBase} ${buttonVariants.primary} mt-5 min-h-14 w-full text-base`}>
                              <Icon name="plus" className="size-5" strokeWidth={2.25} />
                              Publicar una receta
                        </Link>
                  </section>

                  <section aria-labelledby="how-it-works">
                        <h2 id="how-it-works" className="mb-3 text-title font-extrabold text-ink">
                              Cómo funciona
                        </h2>
                        <ol className="flex flex-col gap-2">
                              {["Elige una de tus recetas", "Toca «Publicar en la comunidad»"].map((step, index) => (
                                    <li key={step} className="flex items-center gap-3 rounded-card bg-card p-3 text-sm font-bold text-ink">
                                          <span
                                                aria-hidden
                                                className={`grid size-9 place-items-center rounded-full font-display font-extrabold ${index === 0 ? "bg-secondary-soft" : "bg-rose-soft"}`}
                                          >
                                                {index + 1}
                                          </span>
                                          {step}
                                    </li>
                              ))}
                        </ol>
                  </section>
            </div>
      );
}
