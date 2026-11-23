import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { Sk, SkGroup, SkText, times } from "@/shared/components/ui/Skeleton";
import { useShape } from "@/shared/hooks/useShape";

export const noInsights = "Aún nada. Cocina, compra y cuéntale qué te gusta.";
export type InsightsShape = { count: number };

export function InsightsSkeleton() {
      const { count } = useShape<InsightsShape>("insights", { count: 0 });
      // Same text, invisible: it takes the same lines at any width.
      if (count === 0) return <p aria-hidden className="invisible">{noInsights}</p>;
      return (
            <SkGroup className="divide-y divide-line">
                  {times(count).map((i) => (
                        <div key={i} className="flex items-center gap-2 py-3">
                              <div className="min-w-0 flex-1">
                                    <SkText w="w-48" />
                                    <SkText size="xs" w="w-20" />
                              </div>
                              <Sk className="size-11 rounded-full" />
                              <Sk className="size-11 rounded-full" />
                        </div>
                  ))}
            </SkGroup>
      );
}

/** The three sections under the pink header. */
export default function ProfileSkeleton() {
      return (
            <SkGroup className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 rounded-card bg-card p-5">
                        <h2 className="flex items-center gap-3 text-section font-extrabold text-ink">
                              <MascotAvatar className="size-11" />
                              Lo que tu chef ha aprendido
                        </h2>
                        <SkText size="sm" w="w-28" />
                        <InsightsSkeleton />
                  </div>
                  <div className="flex flex-col gap-4 rounded-card bg-card p-5">
                        <h2 className="text-section font-extrabold text-ink">Tus metas diarias</h2>
                        <div className="grid grid-cols-2 gap-3">
                              {times(4).map((i) => (
                                    <Sk key={i} className="h-20" />
                              ))}
                        </div>
                  </div>
                  <div className="rounded-card bg-card p-5">
                        <h2 className="mb-2 text-section font-extrabold text-ink">Tus preferencias</h2>
                        <div className="divide-y divide-line">
                              {times(7).map((i) => (
                                    <div key={i} className="flex min-h-14 flex-col justify-center py-2">
                                          <SkText size="xs" w="w-16" />
                                          <SkText w="w-40" />
                                    </div>
                              ))}
                        </div>
                  </div>
            </SkGroup>
      );
}
