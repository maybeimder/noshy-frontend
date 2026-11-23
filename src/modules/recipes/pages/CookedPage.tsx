import { useState } from "react";
import NudgeCard from "@/modules/cooking/components/NudgeCard";
import { useNudge } from "@/modules/cooking/hooks/useHome";
import KitchenHeader from "@/modules/inventory/components/KitchenHeader";
import Chips from "@/shared/components/ui/Chips";
import LoadMore from "@/shared/components/ui/LoadMore";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import { useRememberShape } from "@/shared/hooks/useShape";
import { formatDate, plural } from "@/shared/lib/format";
import RecipeGridCard, { coverBadge } from "../components/RecipeGridCard";
import { CookedSkeleton, type CookedShape } from "../components/RecipeSkeletons";
import { useCookedRecipes } from "../hooks/useRecipes";

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
                        <KitchenHeader title="Cocinadas" />
                        <CookedSkeleton />
                  </>
            );
      }
      return (
            <>
                  <KitchenHeader title="Cocinadas" />
                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                        {nudge.data && <NudgeCard nudge={nudge.data} />}
                        {facets.length > 0 && <Chips bleed label="Filtrar" value={filter} onChange={setFilter} options={facets.map((f) => ({ id: f.id, label: f.count === undefined ? f.label : `${f.label} · ${f.count}` }))} />}
                        {cooked.isError ? (
                              <ErrorState message={cooked.error.message} onRetry={() => cooked.refetch()} />
                        ) : list.length === 0 ? (
                              <EmptyState icon="kitchen" title="Todavía nada por aquí" description="Cuando cocines una receta con Noshy, aparecerá en esta lista." />
                        ) : (
                              <ul className="grid grid-cols-2 gap-3">
                                    {list.map(({ recipe, timesCooked, lastCookedAt }) => (
                                          <li key={recipe.id}>
                                                <RecipeGridCard recipe={recipe} meta={`Última vez: ${formatDate(lastCookedAt)}`} badge={<span className={coverBadge}>{plural(timesCooked, "vez", "veces")}</span>} />
                                          </li>
                                    ))}
                              </ul>
                        )}
                        <LoadMore query={cooked} />
                  </main>
            </>
      );
}
