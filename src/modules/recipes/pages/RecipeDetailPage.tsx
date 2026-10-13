import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import { PhotoCredit } from "../components/RecipeCover";
import RecipeBody from "../components/RecipeBody";
import RecipeFeedback from "../components/RecipeFeedback";
import RecipeHero from "../components/RecipeHero";
import { RecipeQuickActions, RecipeTitle } from "../components/RecipeIntro";
import ShoppingListDialog from "../components/ShoppingListDialog";
import { useAdaptRecipe, useMyRecipe, useRecipeMutations } from "../hooks/useRecipes";
import type { PhotoNotSavedState } from "./RecipeEditorPage";

export default function RecipeDetailPage() {
      const { id } = useParams();
      const navigate = useNavigate();
      const location = useLocation();
      const photoNotSaved = (location.state as PhotoNotSavedState | null)?.photoNotSaved ?? false;
      const recipe = useMyRecipe(id);
      const adapt = useAdaptRecipe();
      const { publish, unpublish, remove } = useRecipeMutations();
      const [shoppingOpen, setShoppingOpen] = useState(false);
      const [deleteOpen, setDeleteOpen] = useState(false);

      if (recipe.isPending) return <LoadingState />;
      if (recipe.isError) return <ErrorState message={recipe.error.message} onRetry={() => recipe.refetch()} />;
      if (!recipe.data) {
            return (
                  <>
                        <PageHeader title="Receta" backTo="/recetas" />
                        <main className="mx-auto max-w-xl px-5 pt-6">
                              <EmptyState icon="book" title="Receta no encontrada" description="Puede que la hayas eliminado." />
                        </main>
                  </>
            );
      }

      const r = recipe.data;
      const adaptation = adapt.data?.recipeId === r.id ? adapt.data : null;
      const visibility = r.isPublic ? unpublish : publish;

      return (
            <>
                  <RecipeHero
                        recipe={r}
                        backTo="/recetas"
                        action={
                              <RoundButton to={`/recetas/${r.id}/editar`} label="Editar receta">
                                    <Icon name="edit" />
                              </RoundButton>
                        }
                  />

                  <main className="relative mx-auto -mt-10 flex max-w-xl flex-col gap-4 rounded-t-[2rem] bg-canvas px-5 pt-6">
                        {photoNotSaved && (
                              <p role="status" className="flex items-start gap-3 rounded-control bg-peach-soft p-4 text-sm font-semibold text-peach-ink">
                                    <Icon name="info" className="size-5 shrink-0" />
                                    La receta se guardó, pero el servidor todavía no guarda fotos. Podrás añadirla cuando esté disponible.
                              </p>
                        )}
                        <PhotoCredit recipe={r} />

                        <RecipeTitle
                              recipe={r}
                              tag="Casera"
                              chips={
                                    <li className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-ink">
                                          <Icon name={r.isPublic ? "globe" : "lock"} className="size-3.5" strokeWidth={2.25} />
                                          {r.isPublic ? "En la comunidad" : "Solo tú la ves"}
                                    </li>
                              }
                        />

                        <Button size="lg" fullWidth loading={adapt.isPending} onClick={() => adapt.mutate(r.id)}>
                              <Icon name="pantry" className="size-5" />
                              {adaptation ? "Volver a comparar" : "¿Qué me falta?"}
                        </Button>
                        <RecipeQuickActions recipe={r} onShopping={() => setShoppingOpen(true)} />
                        {adapt.error && <p className="text-sm text-error">{adapt.error.message}</p>}
                        {adaptation && (
                              <p role="status" className="sr-only">
                                    {adaptation.missingIngredients.length
                                          ? `Te faltan ${adaptation.missingIngredients.length} ingredientes.`
                                          : "Tienes todo en tu despensa."}
                              </p>
                        )}

                        <RecipeBody ingredients={r.ingredients} instructions={r.instructions} adaptation={adaptation} />

                        <RecipeFeedback recipe={r} />

                        <section aria-labelledby="share" className="flex flex-col gap-3 rounded-[1.75rem] bg-rose-soft p-5">
                              <div>
                                    <h2 id="share" className="text-section font-extrabold text-ink">
                                          {r.isPublic ? "Ya es pública" : "Compártela"}
                                    </h2>
                                    <p className="text-sm font-semibold text-ink">
                                          {r.isPublic ? "Cualquier persona en Noshy puede verla y guardarla." : "Publícala para que otras personas la descubran."}
                                    </p>
                              </div>
                              <Button variant="secondary" size="lg" loading={visibility.isPending} onClick={() => visibility.mutate(r.id)}>
                                    <Icon name={r.isPublic ? "lock" : "globe"} className="size-5 text-primary-strong" />
                                    {r.isPublic ? "Dejar de publicar" : "Publicar en la comunidad"}
                              </Button>
                              {visibility.error && <p className="text-sm text-error">{visibility.error.message}</p>}
                        </section>

                        <Button variant="tertiary" onClick={() => setDeleteOpen(true)} className="self-center text-error!">
                              <Icon name="trash" className="size-5" />
                              Eliminar receta
                        </Button>
                  </main>

                  <ShoppingListDialog recipe={r} own open={shoppingOpen} onClose={() => setShoppingOpen(false)} />

                  <Dialog
                        open={deleteOpen}
                        onClose={() => setDeleteOpen(false)}
                        title="¿Eliminar receta?"
                        actions={
                              <>
                                    <Button variant="soft" onClick={() => setDeleteOpen(false)}>
                                          Cancelar
                                    </Button>
                                    <Button loading={remove.isPending} onClick={() => remove.mutate(r.id, { onSuccess: () => navigate("/recetas", { replace: true }) })}>
                                          Eliminar
                                    </Button>
                              </>
                        }
                  >
                        <p className="text-ink-muted">
                              Se eliminará <strong className="text-ink">{r.title}</strong>
                              {r.isPublic ? " y dejará de aparecer en la comunidad" : ""}. No se puede deshacer.
                        </p>
                        {remove.error && <p className="mt-2 text-sm text-error">{remove.error.message}</p>}
                  </Dialog>
            </>
      );
}
