import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { ApiError } from "@/shared/lib/axios";
import { formatDate } from "@/shared/lib/format";
import RecipeBody from "../components/RecipeBody";
import RecipeCover from "../components/RecipeCover";
import RecipeFeedback from "../components/RecipeFeedback";
import ShoppingListDialog from "../components/ShoppingListDialog";
import { useCommunityRecipe, useRecipeMutations } from "../hooks/useRecipes";
import { chefLink } from "../utils/links";

export default function CommunityRecipePage() {
      const { id } = useParams();
      const navigate = useNavigate();
      const recipe = useCommunityRecipe(id);
      const { create } = useRecipeMutations();
      const [shoppingOpen, setShoppingOpen] = useState(false);

      if (recipe.isPending) return <LoadingState />;
      if (recipe.isError) {
            const notFound = recipe.error instanceof ApiError && recipe.error.status === 404;
            return (
                  <>
                        <PageHeader title="Comunidad" backTo="/recetas?ver=comunidad" />
                        <main className="mx-auto max-w-xl px-6 pt-6">
                              {notFound ? (
                                    <EmptyState icon="globe" title="Receta no disponible" description="Su autor dejó de publicarla." />
                              ) : (
                                    <ErrorState message={recipe.error.message} onRetry={() => recipe.refetch()} />
                              )}
                        </main>
                  </>
            );
      }

      const r = recipe.data;
      // Adapting and own shopping lists need an own copy; saving one makes that possible.
      const saveCopy = () =>
            create.mutate(
                  { title: r.title, ingredients: r.ingredients, instructions: r.instructions },
                  { onSuccess: (copy) => navigate(`/recetas/${copy.id}`) },
            );

      return (
            <>
                  <PageHeader title={r.title} backTo="/recetas?ver=comunidad" />
                  <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 pt-6">
                        <RecipeCover id={r.id} title={r.title} size="lg" />
                        <p className="text-base text-ink-muted">
                              Por <strong className="text-ink">{r.authorName ?? "alguien de la comunidad"}</strong>
                              {r.publishedAt && ` · ${formatDate(r.publishedAt)}`}
                        </p>

                        <section aria-label="Acciones" className="flex flex-col gap-2">
                              <Button fullWidth loading={create.isPending} onClick={saveCopy}>
                                    <Icon name="book" className="size-5" />
                                    Guardar en mis recetas
                              </Button>
                              <div className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" onClick={() => setShoppingOpen(true)}>
                                          <Icon name="cart" className="size-5" />
                                          Lista de compras
                                    </Button>
                                    <Button variant="secondary" onClick={() => navigate(chefLink(r.id, r.title))}>
                                          <Icon name="chef" className="size-5" />
                                          Preguntar al chef
                                    </Button>
                              </div>
                              {create.error && <p className="text-sm text-error">{create.error.message}</p>}
                        </section>

                        <RecipeBody ingredients={r.ingredients} instructions={r.instructions} />
                        <RecipeFeedback recipe={r} />
                  </main>

                  <ShoppingListDialog recipe={r} own={false} open={shoppingOpen} onClose={() => setShoppingOpen(false)} />
            </>
      );
}
