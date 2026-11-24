import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "@/shared/components/layout/PageHeader";
import Avatar from "@/shared/components/ui/Avatar";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import DishCover from "@/shared/components/ui/DishArt";
import Icon, { type IconName } from "@/shared/components/ui/Icon";
import LoadMore from "@/shared/components/ui/LoadMore";
import Mascot from "@/shared/components/ui/Mascot";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { MarkerText } from "@/shared/components/ui/ScribbleText";
import Photo from "@/shared/components/ui/Photo";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import { useRememberShape } from "@/shared/hooks/useShape";
import { formatTime } from "@/shared/lib/format";
import type { MealSlotId, RecipeCard, RecommendationFilters } from "@/shared/types/api";
import CommentsDialog from "../components/CommentsDialog";
import ExploreCard from "../components/ExploreCard";
import RecipeGridCard, { coverBadge } from "../components/RecipeGridCard";
import { FeedSkeleton, GridSkeleton, MineSkeleton, type FeedShape, type ListShape } from "../components/RecipeSkeletons";
import { useCreators, useFeed, useMyRecipes, useRecipeActions, useRecommendations, useSavedRecipes } from "../hooks/useRecipes";
import type { FeedItem, MyRecipeStatus } from "../types";

const tabs = [
      { id: "mias", label: "Mis recetas" },
      { id: "comunidad", label: "Comunidad" },
      { id: "explorar", label: "Explorar" },
] as const;
type Tab = (typeof tabs)[number]["id"];

export default function RecipesPage() {
      const [params, setParams] = useSearchParams();
      const ver = params.get("ver");
      const tab: Tab = ver === "comunidad" || ver === "explorar" ? ver : "mias";

      return (
            <>
                  {tab === "comunidad" ? (
                        <header className="mx-auto flex max-w-xl items-center gap-3 px-5 pt-6 pb-2">
                              <div className="min-w-0 flex-1">
                                    <h1 className="text-[1.75rem] leading-tight font-extrabold text-ink">
                                          <MarkerText>Comunidad</MarkerText>
                                    </h1>
                                    <p className="mt-1 text-sm font-semibold text-ink-muted">Recetas de gente real</p>
                              </div>
                              <RoundButton to="/recetas/nueva" label="Nueva receta" tone="primary">
                                    <Icon name="plus" strokeWidth={2.25} />
                              </RoundButton>
                        </header>
                  ) : (
                        <PageHeader
                              title="Recetas"
                              scribble="orange"
                              decoration="star"
                              actions={
                                    <>
                                          <RoundButton to="/compras" label="Lista de compras">
                                                <Icon name="cart" />
                                          </RoundButton>
                                          <RoundButton to="/recetas/nueva" label="Nueva receta" tone="primary">
                                                <Icon name="plus" strokeWidth={2.25} />
                                          </RoundButton>
                                    </>
                              }
                        />
                  )}
                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                        <div role="tablist" aria-label="Tipo de recetas" className="grid grid-cols-3 gap-1 rounded-full bg-card p-1 shadow-soft">
                              {tabs.map(({ id, label }) => (
                                    <button
                                          key={id}
                                          type="button"
                                          role="tab"
                                          id={`tab-${id}`}
                                          aria-selected={tab === id}
                                          aria-controls="recipes-panel"
                                          onClick={() => setParams(id === "mias" ? {} : { ver: id }, { replace: true })}
                                          className={`min-h-10 rounded-full text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                tab === id ? "bg-brand text-card" : "text-ink-muted hover:text-ink"
                                          }`}
                                    >
                                          {label}
                                    </button>
                              ))}
                        </div>
                        <section id="recipes-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex flex-col gap-4">
                              {tab === "mias" ? <Mine /> : tab === "comunidad" ? <Community /> : <Explore />}
                        </section>
                  </main>
            </>
      );
}

const statuses: Record<MyRecipeStatus, { label: string; icon: IconName }> = {
      draft: { label: "Borrador", icon: "lock" },
      inReview: { label: "En revisión", icon: "clock" },
      published: { label: "Publicada", icon: "globe" },
      rejected: { label: "No aprobada", icon: "alert" },
};

function Mine() {
      const mine = useMyRecipes();
      const saved = useSavedRecipes();
      useRememberShape<ListShape>("mine", mine.data ? { count: Math.min(8, mine.data.pages[0]!.data.length) } : null);
      if (mine.isPending) return <MineSkeleton />;
      if (mine.isError) return <ErrorState message={mine.error.message} onRetry={() => mine.refetch()} />;
      return (
            <>
                  <ul className="grid grid-cols-2 gap-3">
                        {mine.data.pages
                              .flatMap((p) => p.data)
                              .map((recipe) => {
                                    const status = statuses[recipe.status];
                                    const editable = recipe.status === "draft" || recipe.status === "rejected";
                                    return (
                                          <li key={recipe.id}>
                                                <RecipeGridCard
                                                      recipe={{ ...recipe, imageUrl: recipe.coverImageUrl }}
                                                      to={editable ? `/recetas/${recipe.id}/editar` : `/recetas/${recipe.id}`}
                                                      badge={
                                                            <span className={coverBadge}>
                                                                  <Icon name={status.icon} className="size-3.5" strokeWidth={2.25} />
                                                                  {status.label}
                                                            </span>
                                                      }
                                                />
                                          </li>
                                    );
                              })}
                        <li>
                              <Link
                                    to="/recetas/nueva"
                                    className="flex h-full min-h-60 flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-primary/40 p-4 text-center hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                              >
                                    <Mascot className="w-24" />
                                    <span className="font-display text-base font-extrabold text-ink">¡Crea una receta!</span>
                                    <span className="text-xs font-semibold text-ink-muted">Y compártela con la comunidad</span>
                              </Link>
                        </li>
                  </ul>
                  <LoadMore query={mine} />

                  <section aria-labelledby="saved" className="mt-2 flex flex-col gap-3">
                        <div className="flex items-baseline justify-between gap-3">
                              <h2 id="saved" className="text-section font-extrabold text-ink">
                                    <MarkerText>Guardadas</MarkerText>
                              </h2>
                              {saved.recipes.length > 0 && <span className="text-sm font-bold text-ink-muted">{saved.recipes.length}</span>}
                        </div>
                        {saved.pending && saved.recipes.length === 0 ? (
                              <GridSkeleton name="saved" />
                        ) : saved.recipes.length === 0 ? (
                              <p className="flex items-start gap-3 rounded-card bg-card p-4 text-sm text-ink-muted shadow-soft">
                                    <Icon name="bookmark" className="size-5 shrink-0 text-primary-strong" />
                                    Toca el marcador en una receta, o «Guardar» en las que te propone tu chef, y la encuentras aquí.
                              </p>
                        ) : (
                              <ul className="grid grid-cols-2 gap-3">
                                    {saved.recipes.map((recipe) => (
                                          <li key={recipe.id}>
                                                <ExploreCard recipe={recipe} />
                                          </li>
                                    ))}
                              </ul>
                        )}
                  </section>
            </>
      );
}

const slots: MealSlotId[] = ["breakfast", "snack1", "lunch", "snack2", "dinner"];

/** Ideas of the chef; the filters come in the URL from nudges and the pantry. */
function Explore() {
      const [params, setParams] = useSearchParams();
      const source = params.get("fuente") === "pantry" ? "pantry" : "forYou";
      const slot = slots.find((s) => s === params.get("franja"));
      const using = params.get("con")?.split(",").filter(Boolean);
      const max = Number(params.get("max")) || undefined;
      const filters: RecommendationFilters = { source, slot, usingIngredientIds: using, maxMinutes: max };
      const ideas = useRecommendations(filters);
      const set = (changes: Record<string, string | null>) => {
            const next = new URLSearchParams(params);
            for (const [key, value] of Object.entries(changes)) value === null ? next.delete(key) : next.set(key, value);
            setParams(next, { replace: true });
      };
      const list = (ideas.data?.pages ?? []).flatMap((p) => p.data);
      useRememberShape<ListShape>("explore", ideas.data ? { count: Math.min(8, list.length) } : null);

      return (
            <>
                  <Link
                        to={`/chef?mensaje=${encodeURIComponent("Invéntame una receta con lo que tengo en mi despensa")}`}
                        className="group flex items-center gap-3 rounded-full bg-plum-glow p-2 text-card shadow-[0_16px_32px_-20px_rgb(43_20_51/0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                  >
                        <MascotAvatar tone="white" className="size-12" />
                        <span className="min-w-0 flex-1">
                              <span className="block font-display font-extrabold">¿No ves lo que se te antoja?</span>
                              <span className="block text-sm text-card/80">Pídele una receta a tu chef</span>
                        </span>
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-strong transition-transform group-hover:translate-x-0.5">
                              <Icon name="arrowRight" className="size-5" strokeWidth={2.25} />
                        </span>
                  </Link>
                  <Chips
                        bleed
                        label="De dónde salen las ideas"
                        value={source}
                        onChange={(id) => set({ fuente: id === "pantry" ? "pantry" : null })}
                        options={[
                              { id: "forYou", label: "Para ti" },
                              { id: "pantry", label: "Con mi despensa" },
                        ]}
                  />
                  <Chips
                        bleed
                        label="Tiempo"
                        value={String(max ?? "")}
                        onChange={(id) => set({ max: id || null })}
                        options={[
                              { id: "", label: "Sin prisa" },
                              { id: "15", label: "15 min" },
                              { id: "30", label: "30 min" },
                        ]}
                  />
                  {(using || slot) && (
                        <button
                              type="button"
                              onClick={() => set({ con: null, franja: null })}
                              className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-secondary-soft px-4 text-sm font-bold text-ink focus-visible:outline-2 focus-visible:outline-primary-strong"
                        >
                              {using ? "Con lo que vence pronto" : "Para esta comida"}
                              <Icon name="close" className="size-4" />
                        </button>
                  )}
                  {ideas.isPending ? (
                        <GridSkeleton name="explore" />
                  ) : ideas.isError ? (
                        <ErrorState message={ideas.error.message} onRetry={() => ideas.refetch()} />
                  ) : list.length === 0 ? (
                        <EmptyState icon="search" title="Sin ideas con estos filtros" description="Prueba con más tiempo o con otra fuente." />
                  ) : (
                        <>
                              <p className="text-sm font-semibold text-ink-muted">
                                    {list.length} {list.length === 1 ? "receta" : "recetas"}
                                    {source === "pantry" ? " con lo que tienes" : " para ti"}
                              </p>
                              <ul className="grid grid-cols-2 gap-3">
                                    {list.map((recipe, index) => (
                                          <li key={recipe.id} className={index === 0 ? "col-span-2" : ""}>
                                                <ExploreCard recipe={recipe} featured={index === 0} />
                                          </li>
                                    ))}
                              </ul>
                        </>
                  )}
                  <LoadMore query={ideas} />
            </>
      );
}


function Community() {
      const [filter, setFilter] = useState("trending");
      const feed = useFeed(filter);
      const creators = useCreators();
      const { follow } = useRecipeActions();
      const items = (feed.data?.pages ?? []).flatMap((p) => p.data);
      const filters = feed.data?.pages[0]?.meta.filters ?? [];
      const loading = feed.isPending || creators.isPending;
      useRememberShape<FeedShape>("feed", !loading && feed.data && filter === "trending" ? { count: Math.min(3, items.length), creators: Boolean(creators.data?.length) } : null);
      if (loading) return <FeedSkeleton />;

      return (
            <>
                  {creators.data && creators.data.length > 0 && (
                        <ul aria-label="Creadores que sigues" className="scrollbar-none -mx-5 flex gap-4 overflow-x-auto px-5 py-1">
                              {creators.data.map((creator) => (
                                    <li key={creator.id} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 text-center">
                                          <button
                                                type="button"
                                                aria-pressed={creator.following}
                                                aria-label={`${creator.firstName}${creator.hasNewContent ? ", con recetas nuevas" : ""}. ${creator.following ? "Dejar de seguir" : "Seguir"}`}
                                                disabled={follow.isPending}
                                                onClick={() => follow.mutate({ id: creator.id, on: !creator.following })}
                                                className={`relative rounded-full p-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${creator.hasNewContent ? "bg-brand" : "bg-line"}`}
                                          >
                                                <Avatar name={creator.firstName} url={creator.avatarUrl} size="md" className="border-[3px] border-canvas" />
                                                {!creator.following && (
                                                      <span aria-hidden className="absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full border-2 border-canvas bg-primary-strong text-card">
                                                            <Icon name="plus" className="size-3.5" strokeWidth={3} />
                                                      </span>
                                                )}
                                          </button>
                                          <span aria-hidden className="w-full truncate text-xs font-bold text-ink">{creator.firstName}</span>
                                    </li>
                              ))}
                        </ul>
                  )}
                  {filters.length > 0 && <Chips bleed label="Filtrar comunidad" value={filter} onChange={setFilter} options={filters.map((f) => (f.id === "trending" ? { ...f, icon: "flame" as const } : f))} />}
                  {feed.isError ? (
                        <ErrorState message={feed.error.message} onRetry={() => feed.refetch()} />
                  ) : items.length === 0 ? (
                        <EmptyState
                              icon="community"
                              title="Aún no hay recetas aquí"
                              description="Publica una de las tuyas e inspira a otras personas."
                              action={
                                    <Link to="/recetas/nueva" className={`${buttonBase} ${buttonVariants.primary} min-h-11 text-sm`}>
                                          Crear una receta
                                    </Link>
                              }
                        />
                  ) : (
                        <ul className="flex flex-col gap-4">
                              {items.map((item) => (
                                    <FeedCard key={item.recipe.id} item={item} />
                              ))}
                        </ul>
                  )}
                  <LoadMore query={feed} />
            </>
      );
}

function FeedCard({ item }: { item: FeedItem }) {
      const { like, save } = useRecipeActions();
      const [commentsOpen, setCommentsOpen] = useState(false);
      const { recipe, author, viewer, stats, compatibility } = item;
      const error = like.error ?? save.error;
      const n = recipe.nutritionPerServing;
      const time = formatTime(recipe.totalTimeMinutes);
      const glass = "inline-flex items-center gap-1.5 rounded-full bg-plum/55 px-2.5 py-1 text-xs font-extrabold text-card backdrop-blur-md";
      const stat =
            "inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-extrabold text-card hover:bg-card/15 focus-visible:outline-2 focus-visible:outline-card disabled:opacity-60";

      return (
            <li className="relative isolate overflow-hidden rounded-card bg-plum text-card shadow-[0_20px_40px_-24px_rgb(43_20_51/0.8)]">
                  <span className="absolute inset-0 -z-10">
                        <Photo url={recipe.imageUrl} width={720} height={900} className="size-full object-cover" fallback={<DishCover seed={recipe.id} layout="hero" className="size-full" />} />
                  </span>
                  <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(29_9_44/0.4)_0%,transparent_22%,rgb(29_9_44/0.35)_45%,rgb(29_9_44/0.94)_100%)]" />

                  <div className="flex items-start justify-between gap-2 p-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-plum/55 py-1 pr-3 pl-1 text-sm font-extrabold backdrop-blur-md">
                              <Avatar name={author.displayName} url={author.avatarUrl} size="xs" className="size-7 text-xs" />
                              {author.displayName}
                        </span>
                        {item.chefConsultable && (
                              <span title="Chef consultable" className="rounded-full bg-brand p-[3px]">
                                    <MascotAvatar tone="white" className="size-10" />
                                    <span className="sr-only">Chef consultable</span>
                              </span>
                        )}
                  </div>

                  <Link to={`/recetas/${recipe.id}`} className="block px-4 pt-28 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-card">
                        {!compatibility.ok && (
                              <span className={`${glass} mb-2 bg-secondary-soft/95 text-peach-ink`}>
                                    {compatibility.adaptable ? "Tu chef la adapta" : `Tiene ${compatibility.conflicts.map((c) => c.label.toLowerCase()).join(", ")}`}
                              </span>
                        )}
                        {recipe.cuisine && <span className="block text-sm font-bold text-secondary-soft">{recipe.cuisine.label}</span>}
                        <span className="mt-0.5 block font-display text-section leading-tight font-extrabold text-balance">{recipe.title}</span>
                  </Link>
                  <ul className="flex flex-wrap gap-1.5 px-4 pt-3">
                        {time && (
                              <li className={glass}>
                                    <Icon name="clock" className="size-3.5" />
                                    {time}
                              </li>
                        )}
                        {recipe.difficulty && (
                              <li className={glass}>
                                    <Icon name="flame" className="size-3.5" />
                                    {recipe.difficulty.label}
                              </li>
                        )}
                        <li className={glass} aria-label={`${n.kcal} kcal, ${Math.round(n.proteinG)} g de proteína, ${Math.round(n.carbsG)} g de carbohidratos y ${Math.round(n.fatG)} g de grasa`}>
                              <span aria-hidden className="text-secondary">{n.kcal}kcal</span>
                              <span aria-hidden className="text-[color-mix(in_srgb,var(--color-mint-soft)_80%,white)]">{Math.round(n.proteinG)}p</span>
                              <span aria-hidden className="text-rose-soft">{Math.round(n.carbsG)}c</span>
                              <span aria-hidden className="text-mustard-soft">{Math.round(n.fatG)}f</span>
                        </li>
                  </ul>
                  <div className="flex items-center gap-1 px-2 pt-1 pb-3">
                        <button type="button" aria-pressed={viewer.liked} aria-label={`Me gusta (${stats.likes})`} disabled={like.isPending} onClick={() => like.mutate({ id: recipe.id, on: !viewer.liked })} className={`toggle-pop ${stat}`}>
                              <Icon name="heart" className={`size-5 ${viewer.liked ? "fill-current text-primary" : ""}`} />
                              {stats.likes}
                        </button>
                        <button type="button" aria-label={`Comentarios (${stats.comments})`} onClick={() => setCommentsOpen(true)} className={stat}>
                              <Icon name="chat" className="size-5" />
                              {stats.comments}
                        </button>
                        <button type="button" aria-pressed={viewer.saved} aria-label="Guardar" disabled={save.isPending} onClick={() => save.mutate({ id: recipe.id, on: !viewer.saved })} className={`toggle-pop ${stat}`}>
                              <Icon name="bookmark" className={`size-5 ${viewer.saved ? "fill-current" : ""}`} />
                        </button>
                        {item.chefConsultable && (
                              <Link
                                    to={`/chef?receta=${recipe.id}`}
                                    className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-card px-3 text-xs font-extrabold whitespace-nowrap text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
                              >
                                    <Icon name="chat" className="size-4" />
                                    Pregúntale al chef
                              </Link>
                        )}
                  </div>
                  {error && <p className="px-4 pb-3 text-sm font-semibold text-secondary-soft">{error.message}</p>}
                  <CommentsDialog recipeId={recipe.id} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
            </li>
      );
}
