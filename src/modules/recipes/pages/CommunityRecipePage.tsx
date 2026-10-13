import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/shared/components/layout/PageHeader";
import Avatar from "@/shared/components/ui/Avatar";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { ApiError } from "@/shared/lib/axios";
import { formatDate } from "@/shared/lib/format";
import RecipeBody from "../components/RecipeBody";
import { PhotoCredit } from "../components/RecipeCover";
import RecipeFeedback from "../components/RecipeFeedback";
import RecipeHero from "../components/RecipeHero";
import { RecipeQuickActions, RecipeTitle } from "../components/RecipeIntro";
import ShoppingListDialog from "../components/ShoppingListDialog";
import { useCommunityRecipe, useRecipeMutations } from "../hooks/useRecipes";

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
                        <main className="mx-auto max-w-xl px-5 pt-6">
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
            create.mutate({ title: r.title, ingredients: r.ingredients, instructions: r.instructions }, { onSuccess: (copy) => navigate(`/recetas/${copy.id}`) });

      return (
            <>
                  <RecipeHero recipe={r} backTo="/recetas?ver=comunidad" />

                  <main className="relative mx-auto -mt-10 flex max-w-xl flex-col gap-4 rounded-t-[2rem] bg-canvas px-5 pt-6">
                        <PhotoCredit recipe={r} />
                        <RecipeTitle
                              recipe={r}
                              tag="Comunidad"
                              chips={
                                    <li className="inline-flex items-center gap-1.5 rounded-full bg-card py-1 pr-3 pl-1 text-ink">
                                          <Avatar name={r.authorName ?? "?"} url={r.authorAvatarUrl} size="xs" />
                                          {r.authorName ?? "Comunidad"}
                                          {r.publishedAt && <span className="font-semibold text-ink-muted">· {formatDate(r.publishedAt)}</span>}
                                    </li>
                              }
                        />

                        <Button size="lg" fullWidth loading={create.isPending} onClick={saveCopy}>
                              <Icon name="book" className="size-5" />
                              Guardar en mis recetas
                        </Button>
                        <RecipeQuickActions recipe={r} onShopping={() => setShoppingOpen(true)} />
                        {create.error && <p className="text-sm text-error">{create.error.message}</p>}

                        <RecipeBody ingredients={r.ingredients} instructions={r.instructions} />
                        <RecipeFeedback recipe={r} />
                  </main>

                  <ShoppingListDialog recipe={r} own={false} open={shoppingOpen} onClose={() => setShoppingOpen(false)} />
            </>
      );
}
