import { Sk, SkChips, SkGroup, SkMain, SkText, times } from "@/shared/components/ui/Skeleton";
import { useShape } from "@/shared/hooks/useShape";

export type ShoppingShape = { hasList: boolean; nudge: boolean; recipes: boolean; chips: boolean; groups: { suggestion: boolean }[][] };
const plain = () => times(3).map(() => ({ suggestion: false }));
export const shoppingShape: ShoppingShape = { hasList: true, nudge: false, recipes: true, chips: true, groups: [plain(), plain()] };

export default function ShoppingSkeleton() {
      const shape = useShape("shopping", shoppingShape);
      if (!shape.hasList) {
            return (
                  <SkMain className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                        <Sk className="h-48 rounded-card" />
                        <Sk className="h-20 rounded-card" />
                  </SkMain>
            );
      }
      return (
            <SkMain className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3 pb-28">
                  {shape.nudge && <Sk className="h-16 rounded-full" />}
                  <div aria-hidden className="rounded-card bg-card p-5 shadow-soft">
                        <SkText size="xs" w="w-28" />
                        <SkText size="metric" w="w-44" className="mt-1" />
                        <Sk className="mt-3 h-2.5 rounded-full" />
                        <SkText size="sm" w="w-32" className="mt-2" />
                        {shape.recipes && <SkText size="sm" w="w-56" className="mt-1" />}
                  </div>
                  <Sk className="h-11 rounded-card" />
                  {shape.chips && <SkChips bleed />}
                  {shape.groups.map((items, g) => (
                        <div key={g} aria-hidden className="flex flex-col gap-2">
                              <SkText size="title" w="w-36" />
                              <div className="flex flex-col gap-2">
                                    {items.map((item, i) => (
                                          <div key={i} className="flex flex-col gap-2 rounded-card bg-card p-3 shadow-soft">
                                                <div className="flex min-h-11 items-center gap-3">
                                                      <Sk className="size-6 shrink-0 rounded-md" />
                                                      <div className="min-w-0 flex-1">
                                                            <SkText w="w-32" />
                                                            <SkText size="sm" w="w-20" />
                                                      </div>
                                                      <Sk className="mr-3 h-4 w-16 rounded-full" />
                                                </div>
                                                {item.suggestion && <Sk className="h-[5.5rem]" />}
                                          </div>
                                    ))}
                              </div>
                        </div>
                  ))}
            </SkMain>
      );
}

export function SharedListSkeleton() {
      return (
            <SkGroup className="flex flex-col gap-5">
                  <SkText size="sm" w="w-56" />
                  {[3, 4].map((rows, g) => (
                        <div key={g} className="rounded-card bg-card p-4 shadow-soft">
                              <SkText size="title" w="w-32" />
                              <div className="divide-y divide-line">
                                    {times(rows).map((i) => (
                                          <SkText key={i} w="w-48" className="box-content py-2" />
                                    ))}
                              </div>
                        </div>
                  ))}
            </SkGroup>
      );
}
