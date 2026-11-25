import { useState } from "react";
import { Link } from "react-router-dom";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import { useMyRecipeMutations } from "../hooks/useRecipes";
import type { MyRecipeRow } from "../types";

/** What can be done with a recipe of one's own: why it was rejected, edit, take it out of the community, delete. */
export default function MyRecipeSheet({ recipe, onClose }: { recipe: MyRecipeRow; onClose: () => void }) {
      const { unpublish, remove } = useMyRecipeMutations();
      const [confirming, setConfirming] = useState(false);
      const error = unpublish.error ?? remove.error;
      const editable = recipe.status === "draft" || recipe.status === "rejected";

      return (
            <Dialog open variant="sheet" onClose={onClose} title={recipe.title || "Sin nombre"}>
                  <div className="flex flex-col gap-3">
                        {recipe.status === "rejected" && (
                              <p className="flex items-start gap-2 rounded-control bg-peach-soft p-4 text-sm font-semibold text-peach-ink">
                                    <Icon name="alert" className="size-5 shrink-0" />
                                    {recipe.rejectionReason ?? "No pasó la revisión."} Corrígela y vuelve a publicarla.
                              </p>
                        )}
                        {recipe.status === "inReview" && <p className="text-ink-muted">La estamos revisando. En un momento la verás publicada.</p>}
                        {confirming ? (
                              <>
                                    <p className="text-ink">¿Borrarla? No se puede deshacer{recipe.status === "published" ? ", y sale de la comunidad" : ""}.</p>
                                    <div className="grid grid-cols-2 gap-3">
                                          <Button variant="soft" onClick={() => setConfirming(false)}>
                                                Cancelar
                                          </Button>
                                          <Button loading={remove.isPending} onClick={() => remove.mutate(recipe.id, { onSuccess: onClose })}>
                                                Sí, borrar
                                          </Button>
                                    </div>
                              </>
                        ) : (
                              <>
                                    <Link to={editable ? `/recetas/${recipe.id}/editar` : `/recetas/${recipe.id}`} className={`${buttonBase} ${buttonVariants.primary} min-h-12`}>
                                          {editable ? "Editar" : "Ver receta"}
                                    </Link>
                                    {recipe.status === "published" && (
                                          <Button variant="secondary" size="lg" loading={unpublish.isPending} onClick={() => unpublish.mutate(recipe.id, { onSuccess: onClose })}>
                                                Sacar de la comunidad para editarla
                                          </Button>
                                    )}
                                    {recipe.status !== "inReview" && (
                                          <Button variant="tertiary" onClick={() => setConfirming(true)} className="text-error!">
                                                <Icon name="trash" className="size-5" />
                                                Borrar receta
                                          </Button>
                                    )}
                              </>
                        )}
                        {error && <p className="text-sm font-semibold text-error">{error.message}</p>}
                  </div>
            </Dialog>
      );
}
