import { Sk, SkChips, SkGroup, SkMain, SkText, times } from "@/shared/components/ui/Skeleton";
import { useShape } from "@/shared/hooks/useShape";

export type PantryShape = { rows: { bar: boolean }[]; soon: number; nudge: boolean; empty: boolean };
export const pantryShape: PantryShape = { rows: times(5).map(() => ({ bar: true })), soon: 0, nudge: false, empty: false };

export function SkPantryRows({ rows }: { rows: PantryShape["rows"] }) {
      return (
            <div aria-hidden className="flex flex-col gap-2">
                  {rows.map((row, i) => (
                        <div key={i} className="flex min-h-16 items-center gap-3 rounded-card bg-card py-2 pr-4 pl-3 shadow-soft">
                              <Sk className="size-11 shrink-0" />
                              <div className="min-w-0 flex-1">
                                    <SkText w="w-32" />
                                    <SkText size="sm" w="w-24" />
                                    {row.bar && <Sk className="mt-1.5 h-1.5 rounded-full" />}
                              </div>
                        </div>
                  ))}
            </div>
      );
}

export default function PantrySkeleton() {
      const shape = useShape("pantry", pantryShape);
      return (
            <SkMain className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                  {shape.empty && (
                        <div aria-hidden className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-soft">
                              <SkText size="title" w="w-44" />
                              <Sk className="h-12 rounded-full" />
                        </div>
                  )}
                  <Sk className="h-[4.5rem] rounded-card" />
                  {shape.nudge && <Sk className="h-16 rounded-full" />}
                  {!shape.empty && <Sk className="h-36 rounded-card" />}
                  {shape.soon > 0 && (
                        <div aria-hidden className="flex flex-col gap-3">
                              <SkText size="section" w="w-36" />
                              <div className="-mx-5 flex gap-3 overflow-hidden px-5 pb-1">
                                    {times(shape.soon).map((i) => (
                                          <div key={i} className="flex w-32 shrink-0 flex-col items-center gap-2 rounded-card bg-card p-3 shadow-soft">
                                                <Sk className="size-11" />
                                                <SkText size="sm" w="w-20" />
                                                <SkText size="xs" w="w-16" />
                                          </div>
                                    ))}
                              </div>
                        </div>
                  )}
                  {!shape.empty && <SkChips bleed />}
                  {shape.empty ? <Sk className="h-48 rounded-card" /> : <SkPantryRows rows={shape.rows} />}
            </SkMain>
      );
}

/** «Tu despensa» of the onboarding: groups of have / missing rows. */
export function PantrySetupSkeleton() {
      return (
            <SkGroup className="flex flex-col gap-6">
                  {[4, 3].map((rows, g) => (
                        <div key={g} className="rounded-card bg-card p-4 shadow-soft">
                              <div className="flex h-11 items-center">
                                    <SkText size="title" w="w-36" />
                              </div>
                              <div className="divide-y divide-line">
                                    {times(rows).map((i) => (
                                          <div key={i} className="flex items-center gap-3 py-3">
                                                <div className="min-w-0 flex-1">
                                                      <SkText w="w-28" />
                                                      <SkText size="xs" w="w-20" />
                                                </div>
                                                <Sk className="h-12 w-[10.5rem] rounded-full" />
                                          </div>
                                    ))}
                              </div>
                        </div>
                  ))}
            </SkGroup>
      );
}
