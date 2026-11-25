import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import NudgeCard from "@/modules/cooking/components/NudgeCard";
import { useNudge } from "@/modules/cooking/hooks/useHome";
import KitchenHeader from "@/modules/inventory/components/KitchenHeader";
import Avatar from "@/shared/components/ui/Avatar";
import Chips from "@/shared/components/ui/Chips";
import Icon from "@/shared/components/ui/Icon";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Photo from "@/shared/components/ui/Photo";
import LoadMore from "@/shared/components/ui/LoadMore";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import { useRememberShape } from "@/shared/hooks/useShape";
import { formatDate, plural } from "@/shared/lib/format";
import { CookedSkeleton, type CookedShape } from "../components/RecipeSkeletons";
import { useCookedRecipes } from "../hooks/useRecipes";

// Pastel pairs (top, bottom) of the plate rings, in the order of the design.
const rings = [
      ["rose", "sky"],
      ["mustard", "mint"],
      ["sky", "lilac"],
      ["mint", "peach"],
      ["lilac", "rose"],
      ["peach", "mustard"],
].map(([from, to]) => ({ "--ring-from": `var(--color-${from}-soft)`, "--ring-to": `var(--color-${to}-soft)` }) as CSSProperties);

/** Your avatar, to Perfil. */
function HeaderActions() {
      const { user } = useAuth();
      return (
            <Link to="/perfil" aria-label="Tu perfil" className="rounded-full shadow-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong">
                  <Avatar name={user?.name ?? ""} url={user?.avatarUrl} size="sm" className="size-12" />
            </Link>
      );
}

export default function CookedPage() {
      const [filter, setFilter] = useState("all");
      const cooked = useCookedRecipes(filter);
      const nudge = useNudge("myKitchen");
      const facets = cooked.data?.pages[0]?.meta.facets ?? [];
      const list = (cooked.data?.pages ?? []).flatMap((p) => p.data);

      const total = facets.find((f) => f.id === "all")?.count ?? list.length;
      const loading = cooked.isPending || nudge.isPending;
      useRememberShape<CookedShape>("cooked", !loading && filter === "all" ? { count: Math.min(8, list.length), nudge: Boolean(nudge.data) } : null);

      if (loading) {
            return (
                  <>
                        <KitchenHeader section="cooked" meta={null} actions={<HeaderActions />} />
                        <CookedSkeleton />
                  </>
            );
      }
      return (
            <>
                  <KitchenHeader section="cooked" meta={total > 0 ? plural(total, "plato cocinado", "platos cocinados") : "Lo que has cocinado"} actions={<HeaderActions />} />
                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-2">
                        {facets.length > 0 && <Chips bleed label="Filtrar" value={filter} onChange={setFilter} options={facets.map((f) => ({ id: f.id, label: f.count === undefined ? f.label : `${f.label} (${f.count})` }))} />}
                        {nudge.data && <NudgeCard nudge={nudge.data} tone="lilac" />}
                        {cooked.isError ? (
                              <ErrorState message={cooked.error.message} onRetry={() => cooked.refetch()} />
                        ) : list.length === 0 ? (
                              <EmptyState icon="kitchen" title="Todavía nada por aquí" description="Cuando cocines una receta con Noshy, aparecerá en esta lista." />
                        ) : (
                              <ul className="grid grid-cols-3 gap-x-3 gap-y-6 pt-1">
                                    {list.map(({ recipe, photoUrl, timesCooked, lastCookedAt }, index) => (
                                          <li key={recipe.id}>
                                                <Link
                                                      to={`/recetas/${recipe.id}`}
                                                      aria-label={`${recipe.title}, la cocinaste ${plural(timesCooked, "vez", "veces")}, la última el ${formatDate(lastCookedAt)}${photoUrl ? ", con tu foto" : ""}`}
                                                      className="group flex flex-col items-center gap-2.5 rounded-card text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong"
                                                >
                                                      <span
                                                            style={rings[index % rings.length]}
                                                            className="relative grid aspect-square w-full max-w-28 place-items-center rounded-full bg-plate-ring p-2 shadow-[0_10px_20px_-8px_rgb(122_90_100/0.28)] transition-transform group-active:scale-95"
                                                      >
                                                            <span className="block size-full overflow-hidden rounded-full border-[3px] border-card bg-card">
                                                                  <Photo url={recipe.imageUrl} width={240} height={240} className="size-full object-cover" fallback={<DishPlate seed={recipe.id} className="size-full" />} />
                                                            </span>
                                                            {photoUrl && (
                                                                  <span title="Tu foto" className="absolute right-0 bottom-0 grid size-7 place-items-center rounded-full border-2 border-canvas bg-brand text-card">
                                                                        <Icon name="camera" className="size-3.5" strokeWidth={2.25} />
                                                                  </span>
                                                            )}
                                                      </span>
                                                      <span aria-hidden className="w-full">
                                                            <span className="line-clamp-2 font-display text-[0.9375rem] leading-[1.15rem] font-semibold text-balance text-ink">{recipe.title}</span>
                                                            <span className="block text-xs text-ink-muted">La cociné {plural(timesCooked, "vez", "veces")}</span>
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
