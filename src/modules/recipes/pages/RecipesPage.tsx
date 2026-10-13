import { Link, useSearchParams } from "react-router-dom";
import PageHeader, { iconButtonClass } from "@/shared/components/layout/PageHeader";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import RecipeListItem from "../components/RecipeListItem";
import { useCommunityRecipes, useMyRecipes } from "../hooks/useRecipes";

const tabs = [
      { id: "mias", label: "Mis recetas" },
      { id: "comunidad", label: "Comunidad" },
] as const;

const primaryLink =
      "inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-6 text-sm font-semibold text-ink hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

export default function RecipesPage() {
      const [params, setParams] = useSearchParams();
      const tab = params.get("ver") === "comunidad" ? "comunidad" : "mias";
      const mine = useMyRecipes();
      const community = useCommunityRecipes();
      const query = tab === "mias" ? mine : community;

      return (
            <>
                  <PageHeader
                        title="Recetas"
                        actions={
                              <>
                                    <Link to="/compras" aria-label="Lista de compras" className={iconButtonClass}>
                                          <Icon name="cart" />
                                    </Link>
                                    <Link to="/recetas/nueva" aria-label="Nueva receta" className={iconButtonClass}>
                                          <Icon name="plus" />
                                    </Link>
                              </>
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 pt-6">
                        <div role="tablist" aria-label="Tipo de recetas" className="grid grid-cols-2 gap-1 rounded-control bg-card p-1">
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
                                                className={`min-h-11 rounded-control text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                      selected ? "bg-secondary-soft text-ink underline decoration-2 underline-offset-4" : "text-ink-muted hover:text-ink"
                                                }`}
                                          >
                                                {label}
                                          </button>
                                    );
                              })}
                        </div>

                        <section id="recipes-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
                              {query.isPending ? (
                                    <LoadingState />
                              ) : query.isError ? (
                                    <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
                              ) : query.data.length === 0 ? (
                                    tab === "mias" ? (
                                          <EmptyState
                                                icon="book"
                                                title="Aún no tienes recetas"
                                                description="Guarda tus recetas favoritas para adaptarlas a tu despensa y generar tu lista de compras."
                                                action={
                                                      <Link to="/recetas/nueva" className={primaryLink}>
                                                            <Icon name="plus" className="size-5" />
                                                            Crear receta
                                                      </Link>
                                                }
                                          />
                                    ) : (
                                          <EmptyState
                                                icon="globe"
                                                title="La comunidad está empezando"
                                                description="Publica una de tus recetas para que otras personas la descubran."
                                          />
                                    )
                              ) : (
                                    <ul className="flex flex-col gap-3">
                                          {query.data.map((recipe) => (
                                                <li key={recipe.id}>
                                                      <RecipeListItem
                                                            recipe={recipe}
                                                            to={tab === "mias" ? `/recetas/${recipe.id}` : `/comunidad/${recipe.id}`}
                                                            showAuthor={tab === "comunidad"}
                                                      />
                                                </li>
                                          ))}
                                    </ul>
                              )}
                        </section>
                  </main>
            </>
      );
}
