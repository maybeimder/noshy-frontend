import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Avatar from "@/shared/components/ui/Avatar";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import Icon, { type IconName } from "@/shared/components/ui/Icon";
import LoadMore from "@/shared/components/ui/LoadMore";
import Mascot from "@/shared/components/ui/Mascot";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { MarkerText, TitleIcon } from "@/shared/components/ui/ScribbleText";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import { useDebounced } from "@/shared/hooks/useDebounced";
import { useRememberShape } from "@/shared/hooks/useShape";
import type { MealSlotId, RecipeCard, RecommendationFilters } from "@/shared/types/api";
import CommunityHeader from "../components/CommunityHeader";
import ExploreCard from "../components/ExploreCard";
import FeedCard from "../components/FeedCard";
import MyRecipeSheet from "../components/MyRecipeSheet";
import RecipeGridCard, { coverBadge } from "../components/RecipeGridCard";
import RecipeSearch from "../components/RecipeSearch";
import RecipesHeader from "../components/RecipesHeader";
import { FeedSkeleton, GridSkeleton, MineSkeleton, type FeedShape, type ListShape } from "../components/RecipeSkeletons";
import { useCreators, useFeed, useMyRecipes, useRecipeActions, useRecommendations, useSavedRecipes } from "../hooks/useRecipes";
import type { MyRecipeStatus } from "../types";

/** Comunidad, or Recetas inside Mi cocina: the gallery (?ver=explorar) and your own book, «Recetario» (no `ver`). */
export default function RecipesPage() {
      const [params] = useSearchParams();
      const ver = params.get("ver");

      return (
            <>
                  {ver === "comunidad" ? <CommunityHeader /> : <RecipesHeader book={ver !== "explorar"} />}
                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-2">{ver === "comunidad" ? <Community /> : ver === "explorar" ? <Explore /> : <Mine />}</main>
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
      const [openId, setOpenId] = useState<string | null>(null);
      useRememberShape<ListShape>("mine", mine.data ? { count: Math.min(8, mine.data.pages[0]!.data.length) } : null);
      if (mine.isPending) return <MineSkeleton />;
      if (mine.isError) return <ErrorState message={mine.error.message} onRetry={() => mine.refetch()} />;
      const own = mine.data.pages.flatMap((p) => p.data);
      const opened = own.find((r) => r.id === openId);
      return (
            <>
                  <ul className="grid grid-cols-2 gap-3">
                        {own.map((recipe) => {
                                    const status = statuses[recipe.status];
                                    const editable = recipe.status === "draft" || recipe.status === "rejected";
                                    return (
                                          <li key={recipe.id} className="relative">
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
                                                <button
                                                      type="button"
                                                      aria-label={`Opciones de ${recipe.title || "receta sin nombre"}`}
                                                      onClick={() => setOpenId(recipe.id)}
                                                      className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-card/90 text-ink shadow-soft backdrop-blur hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                                >
                                                      <Icon name="dots" className="size-5" strokeWidth={3} />
                                                </button>
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
                  {opened && <MyRecipeSheet key={opened.id} recipe={opened} onClose={() => setOpenId(null)} />}

                  <section aria-labelledby="saved" className="mt-2 flex flex-col gap-3">
                        <div className="flex items-baseline justify-between gap-3">
                              <h2 id="saved" className="flex items-center gap-2 text-section text-ink">
                                    <TitleIcon name="bookmark" />
                                    <MarkerText>Guardadas</MarkerText>
                              </h2>
                              {saved.recipes.length > 0 && <span className="text-sm font-bold text-ink-muted">{saved.query.hasNextPage ? `${saved.recipes.length}+` : saved.recipes.length}</span>}
                        </div>
                        {saved.pending ? (
                              <GridSkeleton name="saved" />
                        ) : saved.query.isError ? (
                              <ErrorState message={saved.query.error.message} onRetry={() => saved.query.refetch()} />
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
                        <LoadMore query={saved.query} />
                  </section>
            </>
      );
}

const slots: MealSlotId[] = ["breakfast", "snack1", "lunch", "snack2", "dinner"];

const sources = ["forYou", "library", "pantry"] as const;

/** Ideas of the chef; the filters come in the URL from nudges and the pantry. */
function Explore() {
      const [params, setParams] = useSearchParams();
      const source = sources.find((s) => s === params.get("fuente")) ?? "forYou";
      const slot = slots.find((s) => s === params.get("franja"));
      const using = params.get("con")?.split(",").filter(Boolean);
      const max = Number(params.get("max")) || undefined;
      const [search, setSearch] = useState("");
      const q = useDebounced(search.trim()) || undefined;
      const filters: RecommendationFilters = { source, slot, usingIngredientIds: using, maxMinutes: max, q };
      const ideas = useRecommendations(filters);
      const set = (changes: Record<string, string | null>) => {
            const next = new URLSearchParams(params);
            for (const [key, value] of Object.entries(changes)) value === null ? next.delete(key) : next.set(key, value);
            setParams(next, { replace: true });
      };
      const list = (ideas.data?.pages ?? []).flatMap((p) => p.data);
      const meta = ideas.data?.pages[0]?.meta;
      const filling = meta?.library?.status === "filling";
      useRememberShape<ListShape>("explore", ideas.data && !q ? { count: Math.min(8, list.length) } : null);

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
                  <RecipeSearch label="Buscar recetas" placeholder="Busca por nombre o ingrediente" value={search} onChange={setSearch} />
                  <Chips
                        bleed
                        label="De dónde salen las ideas"
                        value={source}
                        onChange={(id) => set({ fuente: id === "forYou" ? null : id })}
                        options={[
                              { id: "forYou", label: "Para ti" },
                              { id: "library", label: "Biblioteca" },
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
                  ) : list.length === 0 && q ? (
                        <EmptyState
                              icon="search"
                              title={`Nada con «${q}»`}
                              description="Prueba con otra palabra, o pídesela a tu chef."
                              action={
                                    <Link to={`/chef?mensaje=${encodeURIComponent(`Quiero una receta de ${q}`)}`} className={`${buttonBase} ${buttonVariants.primary} min-h-11 text-sm`}>
                                          Pedírsela a mi chef
                                    </Link>
                              }
                        />
                  ) : list.length === 0 && source === "library" ? (
                        <EmptyState
                              icon="search"
                              title={filling ? "Preparando tu biblioteca" : "La biblioteca está vacía por ahora"}
                              description={filling ? "Estamos buscando recetas que puedas comer. Aparecen aquí solas." : max ? "Prueba con más tiempo." : "No pudimos traer recetas en este momento. Vuelve en un rato o pídele una a tu chef."}
                        />
                  ) : list.length === 0 ? (
                        <EmptyState icon="search" title="Sin ideas con estos filtros" description="Prueba con más tiempo o con otra fuente." />
                  ) : (
                        <>
                              <p className="text-sm font-semibold text-ink-muted">
                                    {meta?.total ?? list.length} {(meta?.total ?? list.length) === 1 ? "receta" : "recetas"}
                                    {source === "pantry" ? " con lo que tienes" : source === "library" ? " de la biblioteca" : " para ti"}
                                    {filling && <span role="status"> · trayendo más…</span>}
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
      const [search, setSearch] = useState("");
      const q = useDebounced(search.trim()) || undefined;
      const feed = useFeed(filter, { q });
      const creators = useCreators();
      const { follow } = useRecipeActions();
      const items = (feed.data?.pages ?? []).flatMap((p) => p.data);
      const filters = feed.data?.pages[0]?.meta.filters ?? [];
      const loading = feed.isPending || creators.isPending;
      useRememberShape<FeedShape>("feed", !loading && feed.data && filter === "trending" && !q ? { count: Math.min(3, items.length), creators: Boolean(creators.data?.length) } : null);
      if (loading) return <FeedSkeleton />;

      return (
            <>
                  {creators.data && creators.data.length > 0 && (
                        <ul aria-label="Creadores" className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 py-1">
                              {creators.data.map((creator) => (
                                    <li key={creator.id} className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center">
                                          <span className="relative">
                                                <Link
                                                      to={`/creador/${creator.id}`}
                                                      aria-label={`${creator.firstName}${creator.hasNewContent ? ", con recetas nuevas" : ""}`}
                                                      className="block rounded-full bg-story p-[2.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                                >
                                                      <Avatar name={creator.firstName} url={creator.avatarUrl} size="md" className="size-[3.6875rem] border-[2.5px] border-canvas bg-clip-padding" />
                                                </Link>
                                                {!creator.following && (
                                                      <button
                                                            type="button"
                                                            aria-label={`Seguir a ${creator.firstName}`}
                                                            disabled={follow.isPending}
                                                            onClick={() => follow.mutate({ id: creator.id, on: true })}
                                                            className="absolute -right-2 -bottom-2 grid size-8 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary-strong"
                                                      >
                                                            <span aria-hidden className="grid size-5 place-items-center rounded-full border-2 border-canvas bg-brand text-card">
                                                                  <Icon name="plus" className="size-3" strokeWidth={3} />
                                                            </span>
                                                      </button>
                                                )}
                                          </span>
                                          <span aria-hidden className="w-full truncate text-xs font-bold text-ink-muted">{creator.firstName}</span>
                                    </li>
                              ))}
                        </ul>
                  )}
                  <RecipeSearch label="Buscar en la comunidad" placeholder="Busca una receta o un creador" value={search} onChange={setSearch} />
                  {filters.length > 0 && <Chips bleed label="Filtrar comunidad" value={filter} onChange={setFilter} options={filters.map((f) => (f.id === "trending" ? { ...f, icon: "flame" as const } : f))} />}
                  {feed.isError ? (
                        <ErrorState message={feed.error.message} onRetry={() => feed.refetch()} />
                  ) : items.length === 0 && q ? (
                        <EmptyState icon="search" title={`Nada con «${q}»`} description="Prueba con otra palabra o quita los filtros." />
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
