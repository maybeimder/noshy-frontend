import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { cookApi } from "@/modules/cook/api/cook.api";
import AddToWeekDialog from "@/modules/menus/components/AddToWeekDialog";
import { useShoppingMutations } from "@/modules/shopping-list/hooks/useShoppingList";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { ErrorState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import Stepper from "@/shared/components/ui/Stepper";
import { ApiError, newKey } from "@/shared/lib/axios";
import { formatTime, plural } from "@/shared/lib/format";
import { shareText } from "@/shared/lib/share";
import CommentsDialog from "../components/CommentsDialog";
import RecipeBody from "../components/RecipeBody";
import RecipeHero from "../components/RecipeHero";
import { RecipeDetailSkeleton } from "../components/RecipeSkeletons";
import { useRecipe, useRecipeActions } from "../hooks/useRecipes";

export default function RecipeDetailPage() {
      const { id } = useParams();
      const navigate = useNavigate();
      const queryClient = useQueryClient();
      const { user } = useAuth();
      const [servings, setServings] = useState<number>();
      const [original, setOriginal] = useState(false);
      const recipe = useRecipe(id, { servings, ...(original ? { adapted: false } : {}) });
      const { save, like } = useRecipeActions();
      const { addRecipe } = useShoppingMutations();
      const [commentsOpen, setCommentsOpen] = useState(false);
      const [weekOpen, setWeekOpen] = useState(false);
      const [shared, setShared] = useState<string | null>(null);
      const cook = useMutation({
            mutationFn: cookApi.start,
            onSuccess: (session) => {
                  queryClient.setQueryData(["cookingSession", session.id], session);
                  navigate(`/cocinar/${session.id}`);
            },
      });

      if (recipe.isPending) return <RecipeDetailSkeleton id={id} />;
      if (recipe.isError) {
            return (
                  <>
                        <PageHeader title="Receta" backTo="/recetas" />
                        <main className="mx-auto max-w-xl px-5 pt-6">
                              <ErrorState message={recipe.error.message} onRetry={() => recipe.refetch()} />
                        </main>
                  </>
            );
      }

      const r = recipe.data;
      const active = cook.error instanceof ApiError && cook.error.code === "SESSION_ALREADY_ACTIVE" ? String(cook.error.details.sessionId) : null;
      const alreadyInList = addRecipe.error instanceof ApiError && addRecipe.error.code === "RECIPE_ALREADY_IN_LIST";
      const actionError = save.error ?? like.error;
      const mine = r.author.id !== null && r.author.id === user?.id;
      const time = formatTime(r.totalTimeMinutes);

      return (
            <>
                  <RecipeHero
                        recipe={r}
                        backTo="/recetas"
                        action={
                              <div className="flex gap-2">
                                    <RoundButton label={r.viewer.isLiked ? "Quitar me gusta" : "Me gusta"} aria-pressed={r.viewer.isLiked} disabled={like.isPending} onClick={() => like.mutate({ id: r.id, on: !r.viewer.isLiked })}>
                                          <Icon name="heart" className={`size-6 ${r.viewer.isLiked ? "fill-current text-primary-strong" : ""}`} />
                                    </RoundButton>
                                    <RoundButton label={r.viewer.isSaved ? "Quitar de guardadas" : "Guardar"} aria-pressed={r.viewer.isSaved} disabled={save.isPending} onClick={() => save.mutate({ id: r.id, on: !r.viewer.isSaved })}>
                                          <Icon name="bookmark" className={`size-6 ${r.viewer.isSaved ? "fill-current text-primary-strong" : ""}`} />
                                    </RoundButton>
                                    <RoundButton label="Compartir" onClick={async () => setShared(await shareText(r.title, `${r.title}\n${window.location.origin}/recetas/${r.id}`))}>
                                          <Icon name="share" />
                                    </RoundButton>
                              </div>
                        }
                  />

                  <main className="relative mx-auto -mt-10 flex max-w-xl flex-col gap-4 rounded-t-[2rem] bg-canvas px-5 pt-6">
                        {shared && (
                              <p role="status" className="rounded-control bg-field p-3 text-sm font-bold text-ink">
                                    {shared}
                              </p>
                        )}
                        <div className="flex flex-col gap-3">
                              <p className="text-sm font-bold text-ink-muted">
                                    {[r.cuisine?.label, mine ? "Tu receta" : `Por ${r.author.displayName}`, r.rating && `★ ${r.rating.avg} (${r.rating.count})`].filter(Boolean).join(" · ")}
                              </p>
                              <h1 className="text-page leading-tight font-extrabold break-words text-ink">{r.title}</h1>
                              <ul className="flex flex-wrap gap-2 text-xs font-extrabold">
                                    {time && <li className="rounded-full bg-card px-3 py-1.5 text-ink">{time}</li>}
                                    {r.difficulty && <li className="rounded-full bg-card px-3 py-1.5 text-ink">{r.difficulty.label}</li>}
                                    <li className="rounded-full bg-peach-soft px-3 py-1.5 text-peach-ink">{r.nutritionPerServing.kcal} kcal</li>
                                    <li className="rounded-full bg-rose-soft px-3 py-1.5 text-rose-ink">{Math.round(r.nutritionPerServing.proteinG)} g proteína</li>
                                    <li className="rounded-full bg-mustard-soft px-3 py-1.5 text-mustard-ink">{Math.round(r.nutritionPerServing.carbsG)} g carbos</li>
                                    <li className="rounded-full bg-sky-soft px-3 py-1.5 text-sky-ink">{Math.round(r.nutritionPerServing.fatG)} g grasa</li>
                              </ul>
                        </div>
                        {actionError && <p className="text-sm font-semibold text-error">{actionError.message}</p>}

                        <Stepper label="Porciones" value={r.servings.value} min={r.servings.min} max={r.servings.max} onChange={setServings} suffix="porciones" />

                        {active ? (
                              <div className="flex flex-col gap-2 rounded-card bg-peach-soft p-4 text-sm font-semibold text-peach-ink">
                                    Ya tienes una receta en curso.
                                    <Link to={`/cocinar/${active}`} className={`${buttonBase} ${buttonVariants.dark} min-h-11`}>
                                          Continuar con esa
                                    </Link>
                              </div>
                        ) : (
                              <Button
                                    size="lg"
                                    fullWidth
                                    loading={cook.isPending}
                                    disabled={!r.compatibility.ok || r.stepsCount === 0}
                                    onClick={() => cook.mutate({ recipeId: r.id, servings: r.servings.value, adaptationId: r.adaptation?.id ?? null, key: newKey() })}
                              >
                                    <Icon name="flame" className="size-5" />
                                    Cocinar
                              </Button>
                        )}
                        {cook.error && !active && <p className="text-sm font-semibold text-error">{cook.error.message}</p>}

                        <div className="grid grid-cols-2 gap-3">
                              <Button variant="secondary" loading={addRecipe.isPending} onClick={() => addRecipe.mutate({ recipeId: r.id, servings: r.servings.value, adaptationId: r.adaptation?.id ?? null })}>
                                    <Icon name="cart" className="size-5 text-tomato" />
                                    Lista de compras
                              </Button>
                              <Button variant="secondary" onClick={() => setWeekOpen(true)}>
                                    <Icon name="plus" className="size-5" />
                                    Mi semana
                              </Button>
                              {(r.chefConsultable || r.author.type !== "user" || mine) && (
                                    <Link to={`/chef?receta=${r.id}`} className={`${buttonBase} ${buttonVariants.secondary} min-h-11 text-sm`}>
                                          <MascotAvatar className="size-6" />
                                          Pregúntale
                                    </Link>
                              )}
                              <Button variant="secondary" onClick={() => setCommentsOpen(true)}>
                                    <Icon name="mail" className="size-5" />
                                    Comentarios
                              </Button>
                        </div>
                        {!r.compatibility.ok && !original && (
                              <p role="status" className="flex items-start gap-2 rounded-control bg-peach-soft p-4 text-sm font-semibold text-peach-ink">
                                    <Icon name="alert" className="size-5 shrink-0" />
                                    Choca con tus restricciones: {r.compatibility.conflicts.map((c) => c.label).join(", ")}. Tu chef no pudo adaptarla.
                              </p>
                        )}
                        {(r.adaptation || original) && (
                              <section aria-label="Versión de tu chef" className="flex flex-col gap-2 rounded-card bg-lilac-soft p-4 text-sm text-lilac-ink">
                                    {r.adaptation && (
                                          <>
                                                <p className="font-extrabold">Adaptada para ti: {r.adaptation.reasons.map((x) => x.label).join(" · ")}</p>
                                                {r.adaptation.substitutions.map((s) => (
                                                      <p key={s.from.ingredientId}>
                                                            {s.from.label} → <strong>{s.to.label}</strong>
                                                      </p>
                                                ))}
                                          </>
                                    )}
                                    <button type="button" onClick={() => setOriginal((v) => !v)} className="min-h-11 self-start font-bold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary-strong">
                                          {original ? "Ver la versión adaptada" : "Ver la receta original"}
                                    </button>
                              </section>
                        )}

                        {addRecipe.data && (
                              <p role="status" className="rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                                    {addRecipe.data.added + addRecipe.data.merged > 0
                                          ? `Agregué ${plural(addRecipe.data.added + addRecipe.data.merged, "ingrediente", "ingredientes")} a tu lista.`
                                          : "Ya tienes todo: no hizo falta agregar nada."}{" "}
                                    <Link to="/compras" className="underline underline-offset-4">
                                          Ver lista
                                    </Link>
                              </p>
                        )}
                        {addRecipe.error && <p className={`text-sm font-semibold ${alreadyInList ? "text-ink-muted" : "text-error"}`}>{addRecipe.error.message}</p>}

                        <RecipeBody recipe={r} />
                  </main>

                  <CommentsDialog recipeId={r.id} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
                  <AddToWeekDialog recipe={r} servings={r.servings.value} open={weekOpen} onClose={() => setWeekOpen(false)} />
            </>
      );
}
