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
import Photo from "@/shared/components/ui/Photo";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import { useRememberShape } from "@/shared/hooks/useShape";
import { formatTime } from "@/shared/lib/format";
import type { MealSlotId, RecipeCard, RecommendationFilters } from "@/shared/types/api";
import CommentsDialog from "../components/CommentsDialog";
import RecipeGridCard, { coverBadge } from "../components/RecipeGridCard";
import { FeedSkeleton, GridSkeleton, MineSkeleton, type FeedShape, type ListShape } from "../components/RecipeSkeletons";
import { useCreators, useFeed, useMyRecipes, useRecipeActions, useRecommendations } from "../hooks/useRecipes";
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
                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                        <div role="tablist" aria-label="Tipo de recetas" className="grid grid-cols-3 gap-1 rounded-full bg-card p-1.5">
                              {tabs.map(({ id, label }) => (
                                    <button
                                          key={id}
                                          type="button"
                                          role="tab"
                                          id={`tab-${id}`}
                                          aria-selected={tab === id}
                                          aria-controls="recipes-panel"
                                          onClick={() => setParams(id === "mias" ? {} : { ver: id }, { replace: true })}
                                          className={`min-h-11 rounded-full text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                tab === id ? "bg-ink text-card" : "text-ink-muted hover:text-ink"
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
                  <Link to={`/chef?mensaje=${encodeURIComponent("Invéntame una receta con lo que tengo en mi despensa")}`} className={`${buttonBase} ${buttonVariants.dark} min-h-12 text-sm`}>
                        <Icon name="sparkle" className="size-5" />
                        Pedirle una receta a tu chef
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
                        <ul className="grid grid-cols-2 gap-3">
                              {list.map((recipe) => (
                                    <li key={recipe.id}>
                                          <RecipeGridCard recipe={recipe} meta={cardMeta(recipe)} badge={recipe.reason && <span className={coverBadge}>{recipe.reason.label}</span>} />
                                    </li>
                              ))}
                        </ul>
                  )}
                  <LoadMore query={ideas} />
            </>
      );
}

const cardMeta = (recipe: Pick<RecipeCard, "totalTimeMinutes" | "nutritionPerServing">) =>
      [formatTime(recipe.totalTimeMinutes), `${recipe.nutritionPerServing.kcal} kcal`].filter(Boolean).join(" · ");

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
                        <ul aria-label="Creadores" className="scrollbar-none -mx-5 flex gap-4 overflow-x-auto px-5 py-1">
                              {creators.data.map((creator) => (
                                    <li key={creator.id} className="flex w-20 shrink-0 flex-col items-center gap-1 text-center">
                                          <span className={`rounded-full p-1 ${creator.hasNewContent ? "bg-brand" : "bg-line"}`}>
                                                <Avatar name={creator.firstName} url={creator.avatarUrl} size="md" className="border-2 border-card" />
                                          </span>
                                          <span className="w-full truncate text-xs font-bold text-ink">{creator.firstName}</span>
                                          <button
                                                type="button"
                                                aria-pressed={creator.following}
                                                disabled={follow.isPending}
                                                onClick={() => follow.mutate({ id: creator.id, on: !creator.following })}
                                                className={`min-h-9 rounded-full px-3 text-xs font-extrabold focus-visible:outline-2 focus-visible:outline-primary-strong ${creator.following ? "bg-field text-ink" : "bg-primary-soft text-rose-ink"}`}
                                          >
                                                {creator.following ? "Siguiendo" : "Seguir"}
                                          </button>
                                    </li>
                              ))}
                        </ul>
                  )}
                  {filters.length > 0 && <Chips bleed label="Filtrar comunidad" value={filter} onChange={setFilter} options={filters} />}
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
      const action = "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-ink hover:bg-field focus-visible:outline-2 focus-visible:outline-primary-strong";
      const error = like.error ?? save.error;

      return (
            <li className="overflow-hidden rounded-card bg-card shadow-soft">
                  <Link to={`/recetas/${recipe.id}`} className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-strong">
                        <span className="relative block h-48">
                              <Photo url={recipe.imageUrl} width={800} height={384} className="size-full object-cover" fallback={<DishCover seed={recipe.id} className="size-full" />} />
                              {!compatibility.ok && (
                                    <span className={coverBadge}>{compatibility.adaptable ? "Tu chef la adapta" : `Tiene ${compatibility.conflicts.map((c) => c.label.toLowerCase()).join(", ")}`}</span>
                              )}
                        </span>
                        <span className="flex items-center gap-3 px-4 pt-3">
                              <Avatar name={author.displayName} url={author.avatarUrl} size="sm" />
                              <span className="min-w-0">
                                    <span className="block truncate font-display text-title font-extrabold text-ink">{recipe.title}</span>
                                    <span className="block truncate text-xs font-semibold text-ink-muted">
                                          {author.displayName} · {cardMeta(recipe)}
                                    </span>
                              </span>
                        </span>
                  </Link>
                  <div className="flex items-center px-2 pb-2">
                        <button type="button" aria-pressed={viewer.liked} aria-label={`Me gusta (${stats.likes})`} disabled={like.isPending} onClick={() => like.mutate({ id: recipe.id, on: !viewer.liked })} className={action}>
                              <Icon name="heart" className={`size-5 ${viewer.liked ? "fill-current text-primary-strong" : ""}`} />
                              {stats.likes}
                        </button>
                        <button type="button" aria-label={`Comentarios (${stats.comments})`} onClick={() => setCommentsOpen(true)} className={action}>
                              <Icon name="mail" className="size-5" />
                              {stats.comments}
                        </button>
                        <button type="button" aria-pressed={viewer.saved} aria-label="Guardar" disabled={save.isPending} onClick={() => save.mutate({ id: recipe.id, on: !viewer.saved })} className={`${action} ml-auto`}>
                              <Icon name="bookmark" className={`size-5 ${viewer.saved ? "fill-current text-primary-strong" : ""}`} />
                        </button>
                  </div>
                  {error && <p className="px-4 pb-3 text-sm font-semibold text-error">{error.message}</p>}
                  <CommentsDialog recipeId={recipe.id} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
            </li>
      );
}
