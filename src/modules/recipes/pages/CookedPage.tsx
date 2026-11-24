import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import NudgeCard from "@/modules/cooking/components/NudgeCard";
import { useNudge } from "@/modules/cooking/hooks/useHome";
import KitchenHeader from "@/modules/inventory/components/KitchenHeader";
import Avatar from "@/shared/components/ui/Avatar";
import Chips from "@/shared/components/ui/Chips";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Photo from "@/shared/components/ui/Photo";
import LoadMore from "@/shared/components/ui/LoadMore";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import { useRememberShape } from "@/shared/hooks/useShape";
import { formatDate, plural } from "@/shared/lib/format";
import { CookedSkeleton, type CookedShape } from "../components/RecipeSkeletons";
import { useCookedRecipes } from "../hooks/useRecipes";

const rings = ["bg-brand", "bg-[linear-gradient(135deg,var(--color-secondary),var(--color-mustard))]", "bg-[linear-gradient(135deg,var(--color-lilac-soft),var(--color-sky-soft))]", "bg-card"];

/** Your avatar, to Perfil (the design's «D» in the corner). */
function HeaderActions() {
      const { user } = useAuth();
      return (
            <Link to="/perfil" aria-label="Tu perfil" className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong">
                  <Avatar name={user?.name ?? ""} url={user?.avatarUrl} size="sm" />
            </Link>
      );
}

export default function CookedPage() {
      const [filter, setFilter] = useState("all");
      const cooked = useCookedRecipes(filter);
      const nudge = useNudge("myKitchen");
      const facets = cooked.data?.pages[0]?.meta.facets ?? [];
      const list = (cooked.data?.pages ?? []).flatMap((p) => p.data);

      const loading = cooked.isPending || nudge.isPending;
      useRememberShape<CookedShape>("cooked", !loading && filter === "all" ? { count: Math.min(8, list.length), nudge: Boolean(nudge.data) } : null);

      if (loading) {
            return (
                  <>
                        <KitchenHeader title="Mi cocina" actions={<HeaderActions />} />
                        <CookedSkeleton />
                  </>
            );
      }
      return (
            <>
                  <KitchenHeader title="Mi cocina" actions={<HeaderActions />} />
                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                        {nudge.data && <NudgeCard nudge={nudge.data} tone="blush" />}
                        {facets.length > 0 && <Chips bleed label="Filtrar" value={filter} onChange={setFilter} options={facets.map((f) => ({ id: f.id, label: f.count === undefined ? f.label : `${f.label} (${f.count})` }))} />}
                        {cooked.isError ? (
                              <ErrorState message={cooked.error.message} onRetry={() => cooked.refetch()} />
                        ) : list.length === 0 ? (
                              <EmptyState icon="kitchen" title="Todavía nada por aquí" description="Cuando cocines una receta con Noshy, aparecerá en esta lista." />
                        ) : (
                              <ul className="grid grid-cols-3 gap-x-3 gap-y-5">
                                    {list.map(({ recipe, timesCooked, lastCookedAt }, index) => (
                                          <li key={recipe.id}>
                                                <Link
                                                      to={`/recetas/${recipe.id}`}
                                                      aria-label={`${recipe.title}, la cocinaste ${plural(timesCooked, "vez", "veces")}, la última el ${formatDate(lastCookedAt)}`}
                                                      className="group flex flex-col items-center gap-2 rounded-card text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong"
                                                >
                                                      {/* Ring colours rotate so the grid reads as a shelf of plates, not a table. */}
                                                      <span className={`grid aspect-square w-full max-w-28 place-items-center rounded-full p-1 shadow-soft transition-transform group-active:scale-95 ${rings[index % rings.length]}`}>
                                                            <span className="block size-full overflow-hidden rounded-full border-4 border-card bg-card">
                                                                  <Photo url={recipe.imageUrl} width={240} height={240} className="size-full object-cover" fallback={<DishPlate seed={recipe.id} className="size-full" />} />
                                                            </span>
                                                      </span>
                                                      <span aria-hidden className="w-full">
                                                            <span className="block truncate font-display text-sm font-extrabold text-ink">{recipe.title}</span>
                                                            <span className="block text-xs font-semibold text-ink-muted">La cociné {plural(timesCooked, "vez", "veces")}</span>
                                                      </span>
                                                </Link>
                                          </li>
                                    ))}
                              </ul>
                        )}
                        <LoadMore query={cooked} />
                  </main>
            </>
      );
}
