import { useState, type FormEvent } from "react";
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
import MacroTiles from "@/shared/components/ui/MacroTiles";
import Stepper from "@/shared/components/ui/Stepper";
import { ApiError, newKey } from "@/shared/lib/axios";
import { formatTime, plural } from "@/shared/lib/format";
import { shareText } from "@/shared/lib/share";
import CommentsDialog from "../components/CommentsDialog";
import RecipeBody from "../components/RecipeBody";
import RecipeHero, { heroButtonClass } from "../components/RecipeHero";
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
      const { addRecipe, addItems } = useShoppingMutations();
      const [question, setQuestion] = useState("");
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
      const canAsk = r.chefConsultable || r.author.type !== "user" || mine;
      const ask = (event: FormEvent) => {
            event.preventDefault();
            const text = question.trim();
            navigate(`/chef?${new URLSearchParams({ receta: r.id, ...(text ? { mensaje: text } : {}) })}`);
      };

      return (
            <>
                  <RecipeHero
                        recipe={r}
                        backTo="/recetas"
                        action={
                              <div className="flex gap-2">
                                    <button type="button" aria-label="Compartir" className={heroButtonClass} onClick={async () => setShared(await shareText(r.title, `${r.title}\n${window.location.origin}/recetas/${r.id}`))}>
                                          <Icon name="share" />
                                    </button>
                                    <button
                                          type="button"
                                          aria-label={r.viewer.isLiked ? "Quitar me gusta" : "Me gusta"}
                                          aria-pressed={r.viewer.isLiked}
                                          disabled={like.isPending}
                                          className={heroButtonClass}
                                          onClick={() => like.mutate({ id: r.id, on: !r.viewer.isLiked })}
                                    >
                                          <Icon name="heart" className={`size-6 ${r.viewer.isLiked ? "fill-current text-primary" : ""}`} />
                                    </button>
                              </div>
                        }
                  >
                        <p className="text-sm font-bold text-secondary-soft">{mine ? "Tu receta" : (r.cuisine?.label ?? `Por ${r.author.displayName}`)}</p>
                        <h1 className="mt-1 text-[2rem] leading-[1.1] font-extrabold text-balance break-words">{r.title}</h1>
                        {r.tags.length > 0 && <p className="mt-2 text-sm text-card/85">{r.tags.slice(0, 4).join(" · ")}</p>}
                        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold">
                              {time && (
                                    <li className="flex items-center gap-1.5">
                                          <Icon name="clock" className="size-4" />
                                          {time}
                                    </li>
                              )}
                              {r.rating && (
                                    <li className="flex items-center gap-1.5" aria-label={`${r.rating.avg} de 5, ${r.rating.count} opiniones`}>
                                          <Icon name="star4" className="size-4 text-secondary" />
                                          {r.rating.avg.toLocaleString("es-CO")} ({r.rating.count})
                                    </li>
                              )}
                              <li className="flex items-center gap-1.5">
                                    <Icon name="community" className="size-4" />
                                    {r.servings.value} porc.
                              </li>
                              {r.difficulty && <li>{r.difficulty.label}</li>}
                        </ul>
                  </RecipeHero>

                  <main className="relative mx-auto -mt-8 flex max-w-xl flex-col gap-5 rounded-t-[2rem] bg-canvas px-5 pt-6 pb-36">
                        {shared && (
                              <p role="status" className="rounded-control bg-field p-3 text-sm font-bold text-ink">
                                    {shared}
                              </p>
                        )}
                        <MacroTiles macros={r.nutritionPerServing} />
                        {actionError && <p className="text-sm font-semibold text-error">{actionError.message}</p>}

                        {!r.compatibility.ok && !original && (
                              <p role="status" className="flex items-start gap-2 rounded-control bg-peach-soft p-4 text-sm font-semibold text-peach-ink">
                                    <Icon name="alert" className="size-5 shrink-0" />
                                    Choca con tus restricciones: {r.compatibility.conflicts.map((c) => c.label).join(", ")}. Tu chef no pudo adaptarla.
                              </p>
                        )}

                        {(r.adaptation || original || canAsk) && (
                              <section aria-label="Tu chef" className="flex flex-col gap-3 rounded-card bg-plum-glow p-4 text-card shadow-[0_18px_36px_-22px_rgb(43_20_51/0.8)]">
                                    <div className="flex items-center gap-3">
                                          <MascotAvatar tone="white" className="size-12" />
                                          <div className="min-w-0 flex-1">
                                                <h2 className="font-display text-title font-extrabold">{r.adaptation && !original ? "Tu chef la adaptó para ti" : "Pregúntale a tu chef"}</h2>
                                                <p className="text-sm text-card/80">
                                                      {r.adaptation && !original ? r.adaptation.reasons.map((x) => x.label).join(" · ") : "Te ayuda con dudas, cambios y sustitutos."}
                                                </p>
                                          </div>
                                    </div>
                                    {r.adaptation && !original && r.adaptation.substitutions.length > 0 && (
                                          <ul className="flex flex-col gap-2">
                                                {r.adaptation.substitutions.map((s) => (
                                                      <li key={s.from.ingredientId} className="flex items-center gap-2 rounded-control bg-card/10 px-3 py-2.5 text-sm">
                                                            <span className="text-card/75">{s.from.label}</span>
                                                            <Icon name="arrowRight" className="size-4 shrink-0 text-secondary" strokeWidth={2.25} />
                                                            <strong className="min-w-0 flex-1">{s.to.label}</strong>
                                                      </li>
                                                ))}
                                          </ul>
                                    )}
                                    {canAsk && (
                                          <form onSubmit={ask} className="flex items-center gap-2 rounded-full bg-card p-1 pl-4">
                                                <label htmlFor="ask-chef" className="sr-only">
                                                      Pregunta para tu chef sobre esta receta
                                                </label>
                                                <input
                                                      id="ask-chef"
                                                      value={question}
                                                      onChange={(e) => setQuestion(e.target.value)}
                                                      placeholder="¿Puedo hacerla en airfryer?"
                                                      className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted/70 focus-visible:outline-none"
                                                />
                                                <button type="submit" aria-label="Preguntar" className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong">
                                                      <Icon name="send" className="size-5" />
                                                </button>
                                          </form>
                                    )}
                                    {(r.adaptation || original) && (
                                          <button type="button" onClick={() => setOriginal((v) => !v)} className="min-h-11 self-start text-sm font-bold text-secondary-soft underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-card">
                                                {original ? "Ver la versión adaptada" : "Ver la receta original"}
                                          </button>
                                    )}
                              </section>
                        )}

                        <RecipeBody
                              recipe={r}
                              adding={addItems.isPending ? (addItems.variables?.[0]?.ingredientId ?? null) : null}
                              onAdd={(ingredient) => addItems.mutate([{ ingredientId: ingredient.ingredientId, sourceRecipeId: r.id }])}
                        />

                        <section aria-label="Porciones y más" className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-soft">
                              <div className="flex items-center justify-between gap-3">
                                    <span className="font-display text-title font-extrabold text-ink">Porciones</span>
                                    <Stepper label="Porciones" value={r.servings.value} min={r.servings.min} max={r.servings.max} onChange={setServings} suffix="porciones" />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                    <Button variant="soft" className="min-h-12 flex-col gap-0.5 px-2 text-xs" loading={addRecipe.isPending} onClick={() => addRecipe.mutate({ recipeId: r.id, servings: r.servings.value, adaptationId: r.adaptation?.id ?? null })}>
                                          <Icon name="cart" className="size-5" />
                                          A la lista
                                    </Button>
                                    <Button variant="soft" className="min-h-12 flex-col gap-0.5 px-2 text-xs" onClick={() => setWeekOpen(true)}>
                                          <Icon name="plus" className="size-5" />
                                          Mi semana
                                    </Button>
                                    <Button variant="soft" className="min-h-12 flex-col gap-0.5 px-2 text-xs" onClick={() => setCommentsOpen(true)}>
                                          <Icon name="mail" className="size-5" />
                                          Comentarios
                                    </Button>
                              </div>
                              {(addRecipe.data || addItems.data) && (
                                    <p role="status" className="rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                                          {(() => {
                                                const result = addRecipe.data ?? addItems.data!;
                                                const n = result.added + result.merged;
                                                return n > 0 ? `Agregué ${plural(n, "ingrediente", "ingredientes")} a tu lista.` : "Ya tienes todo: no hizo falta agregar nada.";
                                          })()}{" "}
                                          <Link to="/compras" className="underline underline-offset-4">
                                                Ver lista
                                          </Link>
                                    </p>
                              )}
                              {addRecipe.error && <p className={`text-sm font-semibold ${alreadyInList ? "text-ink-muted" : "text-error"}`}>{addRecipe.error.message}</p>}
                              {addItems.error && <p className="text-sm font-semibold text-error">{addItems.error.message}</p>}
                        </section>
                  </main>

                  {/* Save and the one dominant action, always in reach. */}
                  <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-xl flex-col gap-2 bg-canvas/95 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
                        {cook.error && !active && <p className="text-sm font-semibold text-error">{cook.error.message}</p>}
                        {active ? (
                              <div className="flex items-center gap-3 rounded-card bg-peach-soft p-3 text-sm font-semibold text-peach-ink">
                                    <span className="flex-1">Ya tienes una receta en curso.</span>
                                    <Link to={`/cocinar/${active}`} className={`${buttonBase} ${buttonVariants.dark} min-h-11`}>
                                          Continuar con esa
                                    </Link>
                              </div>
                        ) : (
                              <div className="flex items-center gap-3">
                                    <button
                                          type="button"
                                          aria-label={r.viewer.isSaved ? "Quitar de guardadas" : "Guardar"}
                                          aria-pressed={r.viewer.isSaved}
                                          disabled={save.isPending}
                                          onClick={() => save.mutate({ id: r.id, on: !r.viewer.isSaved })}
                                          className="grid size-14 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong hover:bg-rose-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60"
                                    >
                                          <Icon name="bookmark" className={`size-6 ${r.viewer.isSaved ? "fill-current" : ""}`} />
                                    </button>
                                    <Button
                                          size="lg"
                                          fullWidth
                                          arrow="chef"
                                          loading={cook.isPending}
                                          disabled={!r.compatibility.ok || r.stepsCount === 0}
                                          onClick={() => cook.mutate({ recipeId: r.id, servings: r.servings.value, adaptationId: r.adaptation?.id ?? null, key: newKey() })}
                                    >
                                          Modo cocina paso a paso
                                    </Button>
                              </div>
                        )}
                  </div>

                  <CommentsDialog recipeId={r.id} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
                  <AddToWeekDialog recipe={r} servings={r.servings.value} open={weekOpen} onClose={() => setWeekOpen(false)} />
            </>
      );
}
