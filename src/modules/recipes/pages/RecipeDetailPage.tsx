import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader, { iconButtonClass } from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { formatDate, plural } from "@/shared/lib/format";
import RecipeBody from "../components/RecipeBody";
import RecipeCover from "../components/RecipeCover";
import RecipeFeedback from "../components/RecipeFeedback";
import ShoppingListDialog from "../components/ShoppingListDialog";
import { useAdaptRecipe, useMyRecipe, useRecipeMutations } from "../hooks/useRecipes";
import { chefLink } from "../utils/links";

export default function RecipeDetailPage() {
      const { id } = useParams();
      const navigate = useNavigate();
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
                        <main className="mx-auto max-w-xl px-6 pt-6">
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
                  <PageHeader
                        title={r.title}
                        backTo="/recetas"
                        actions={
                              <Link to={`/recetas/${r.id}/editar`} aria-label="Editar receta" className={iconButtonClass}>
                                    <Icon name="edit" />
                              </Link>
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 pt-6">
                        <RecipeCover id={r.id} title={r.title} size="lg" />

                        <div className="flex flex-col gap-1">
                              <p className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted">
                                    <Icon name={r.isPublic ? "globe" : "lock"} className="size-4" />
                                    {r.isPublic ? `Publicada en la comunidad · ${formatDate(r.publishedAt ?? r.createdAt)}` : "Solo tú la ves"}
                              </p>
                              <p className="text-base text-ink-muted">
                                    {plural(r.ingredients.length, "ingrediente", "ingredientes")} ·{" "}
                                    {plural(r.instructions.length, "paso", "pasos")}
                              </p>
                        </div>

                        <section aria-label="Acciones" className="flex flex-col gap-2">
                              <Button fullWidth loading={adapt.isPending} onClick={() => adapt.mutate(r.id)}>
                                    <Icon name="pantry" className="size-5" />
                                    {adaptation ? "Volver a comparar con mi despensa" : "¿Qué me falta?"}
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
                              {adapt.error && <p className="text-sm text-error">{adapt.error.message}</p>}
                        </section>

                        {adaptation && (
                              <p role="status" className="flex items-start gap-3 rounded-control bg-secondary-soft p-4 text-base text-ink">
                                    <Icon name={adaptation.missingIngredients.length ? "info" : "check"} className="size-5 shrink-0" />
                                    {adaptation.missingIngredients.length
                                          ? `${adaptation.missingIngredients.length === 1 ? "Te falta" : "Te faltan"} ${plural(adaptation.missingIngredients.length, "ingrediente", "ingredientes")}. Puedes crear tu lista de compras.`
                                          : "Tienes todo lo necesario en tu despensa. ¡A cocinar!"}
                              </p>
                        )}

                        <RecipeBody ingredients={r.ingredients} instructions={r.instructions} adaptation={adaptation} />

                        <RecipeFeedback recipe={r} />

                        <section aria-labelledby="manage" className="flex flex-col gap-3 rounded-card bg-card p-6">
                              <h2 id="manage" className="text-title font-bold text-ink">
                                    Compartir
                              </h2>
                              <p className="text-sm text-ink-muted">
                                    {r.isPublic
                                          ? "Cualquier persona en Noshy puede verla y guardarla."
                                          : "Publícala para que otras personas la descubran en la comunidad."}
                              </p>
                              <Button variant="secondary" loading={visibility.isPending} onClick={() => visibility.mutate(r.id)}>
                                    <Icon name={r.isPublic ? "lock" : "globe"} className="size-5" />
                                    {r.isPublic ? "Dejar de publicar" : "Publicar en la comunidad"}
                              </Button>
                              {visibility.error && <p className="text-sm text-error">{visibility.error.message}</p>}
                              <Button variant="tertiary" onClick={() => setDeleteOpen(true)} className="text-error">
                                    <Icon name="trash" className="size-5" />
                                    Eliminar receta
                              </Button>
                        </section>
                  </main>

                  <ShoppingListDialog recipe={r} own open={shoppingOpen} onClose={() => setShoppingOpen(false)} />

                  <Dialog
                        open={deleteOpen}
                        onClose={() => setDeleteOpen(false)}
                        title="¿Eliminar receta?"
                        actions={
                              <>
                                    <Button variant="tertiary" onClick={() => setDeleteOpen(false)}>
                                          Cancelar
                                    </Button>
                                    <Button
                                          loading={remove.isPending}
                                          onClick={() => remove.mutate(r.id, { onSuccess: () => navigate("/recetas", { replace: true }) })}
                                    >
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
