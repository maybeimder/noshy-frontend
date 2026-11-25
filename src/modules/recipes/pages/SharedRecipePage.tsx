import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import Logo from "@/shared/components/ui/Logo";
import MacroTiles from "@/shared/components/ui/MacroTiles";
import Photo from "@/shared/components/ui/Photo";
import { ErrorState } from "@/shared/components/ui/QueryState";
import { Sk, SkMain } from "@/shared/components/ui/Skeleton";
import { formatTime } from "@/shared/lib/format";
import { recipesApi } from "../api/recipes.api";

/** Where a shared link lands: readable without an account. With one, the recipe itself. */
export default function SharedRecipePage() {
      const { key = "" } = useParams();
      const { status, user } = useAuth();
      const recipe = useQuery({ queryKey: ["sharedRecipe", key], queryFn: () => recipesApi.shared(key), retry: false });

      if (status === "authenticated" && user?.onboardingStatus === "completed" && recipe.data) return <Navigate to={`/recetas/${recipe.data.id}`} replace />;
      if (recipe.isPending || status === "loading")
            return (
                  <SkMain className="mx-auto flex min-h-dvh max-w-xl flex-col gap-5 bg-canvas px-5 py-6">
                        <Sk className="h-72 rounded-[2rem]" />
                        <Sk className="h-20 rounded-card" />
                        <Sk className="h-48 rounded-card" />
                  </SkMain>
            );
      if (recipe.isError)
            return (
                  <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 bg-canvas px-5 py-10">
                        <Logo />
                        <ErrorState message={recipe.error.message} onRetry={() => recipe.refetch()} />
                        <Link to="/bienvenida" className={`${buttonBase} ${buttonVariants.primary} min-h-12`}>
                              Conocer Noshy
                        </Link>
                  </main>
            );
      const r = recipe.data;
      const time = formatTime(r.totalTimeMinutes);
      return (
            <main className="mx-auto min-h-dvh max-w-xl bg-canvas pb-32">
                  <div className="relative flex min-h-80 flex-col justify-end overflow-hidden rounded-b-[2.5rem] bg-plum p-6 text-card">
                        <span className="absolute inset-0">
                              <Photo url={r.imageUrl} alt="" width={960} height={800} className="size-full object-cover" fallback={<DishCover seed={r.id} layout="hero" className="size-full" />} />
                        </span>
                        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(46_19_45/0.3)_0%,transparent_35%,rgb(46_14_30/0.92)_100%)]" />
                        <p className="relative text-base text-card/85">{r.cuisine?.label ?? `Por ${r.author}`}</p>
                        <h1 className="relative text-[2rem] leading-[1.1] font-medium break-words">{r.title}</h1>
                        <p className="relative mt-2 flex flex-wrap gap-x-4 text-sm font-bold">
                              {time && (
                                    <span className="flex items-center gap-1.5">
                                          <Icon name="timer" className="size-4" strokeWidth={2} />
                                          {time}
                                    </span>
                              )}
                              <span className="flex items-center gap-1.5">
                                    <Icon name="community" className="size-4" />
                                    {r.servings} porc.
                              </span>
                        </p>
                  </div>
                  <div className="flex flex-col gap-6 px-5 pt-6">
                        {r.nutritionPerServing && <MacroTiles macros={r.nutritionPerServing} estimated={r.nutritionEstimated} />}
                        <section aria-labelledby="shared-ingredients">
                              <h2 id="shared-ingredients" className="mb-3 text-section font-semibold text-ink">
                                    Ingredientes
                              </h2>
                              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {r.ingredients.map((i, index) => (
                                          <li key={index} className="flex items-center gap-3 rounded-full bg-card py-1.5 pr-4 pl-1.5 shadow-soft">
                                                <IngredientIcon label={i.label} icon={i.icon} shape="circle" className="size-9" />
                                                <span className="min-w-0 flex-1 truncate font-bold text-ink">{i.label}</span>
                                                <span className="shrink-0 text-sm text-ink-muted">{i.quantity}</span>
                                          </li>
                                    ))}
                              </ul>
                        </section>
                        {r.steps.length > 0 && (
                              <section aria-labelledby="shared-steps">
                                    <h2 id="shared-steps" className="mb-3 text-section font-semibold text-ink">
                                          Preparación
                                    </h2>
                                    <ol className="flex flex-col gap-4">
                                          {r.steps.map((step, index) => (
                                                <li key={index} className="flex gap-3">
                                                      <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-blush font-display font-semibold text-primary-strong">
                                                            {index + 1}
                                                      </span>
                                                      <div className="min-w-0 pt-1 text-ink">
                                                            {!step.text.startsWith(step.title) && <p className="font-bold">{step.title}</p>}
                                                            <p>{step.text}</p>
                                                      </div>
                                                </li>
                                          ))}
                                    </ol>
                              </section>
                        )}
                  </div>
                  <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-xl flex-col bg-canvas/95 px-5 pt-3 pb-5 backdrop-blur">
                        <Link to={status === "authenticated" ? "/" : "/bienvenida"} state={{ from: `/recetas/${r.id}` }} className={`${buttonBase} ${buttonVariants.primary} min-h-14`}>
                              {status === "authenticated" ? "Configurar mi chef" : "Cocinarla con Noshy"}
                        </Link>
                  </div>
            </main>
      );
}
