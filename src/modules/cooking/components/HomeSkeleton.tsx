import { Sk, SkMain, SkText, times } from "@/shared/components/ui/Skeleton";
import { useShape } from "@/shared/hooks/useShape";

export type HomeShape = { active: boolean; meals: number; ideas: number; nudge: boolean; cooked: number };
export const homeShape: HomeShape = { active: false, meals: 4, ideas: 3, nudge: false, cooked: 0 };

export default function HomeSkeleton() {
      const shape = useShape("home", homeShape);
      return (
            <SkMain className="mx-auto flex max-w-xl flex-col gap-6 pt-3 pb-12">
                  {shape.active && <Sk className="mx-5 h-[5.5rem] rounded-card" />}
                  <div aria-hidden className="mx-5 rounded-card bg-card p-5 shadow-soft">
                        <div className="flex h-11 items-end justify-between gap-2">
                              <Sk className="h-8 w-36 rounded-full" />
                              <Sk className="mb-1 h-6 w-28 rounded-full" />
                        </div>
                        <Sk className="mt-3 h-2.5 rounded-full" />
                        <div className="mt-4 grid grid-cols-3 gap-4">
                              {times(3).map((i) => (
                                    <div key={i}>
                                          <SkText size="xs" w="w-full" />
                                          <Sk className="mt-1.5 h-1.5 rounded-full" />
                                    </div>
                              ))}
                        </div>
                  </div>
                  <div aria-hidden className="flex gap-2 overflow-hidden px-5 py-1">
                        {times(shape.meals).map((i) => (
                              <div key={i} className="w-[5.5rem] shrink-0 rounded-control bg-card p-3 shadow-soft">
                                    <Sk className="size-8 rounded-full" />
                                    <SkText size="sm" w="w-14" className="mt-2" />
                                    <SkText size="xs" w="w-12" />
                              </div>
                        ))}
                  </div>
                  {shape.nudge && <Sk className="mx-5 h-16 rounded-full" />}
                  {shape.ideas > 0 && (
                        <div aria-hidden className="flex flex-col gap-3">
                              <div className="flex h-11 items-center px-5">
                                    <Sk className="h-6 w-36 rounded-full" />
                              </div>
                              <div className="flex flex-col gap-3">
                                    <div className="flex gap-3 overflow-hidden px-5 pb-2">
                                          {times(Math.min(2, shape.ideas)).map((i) => (
                                                <Sk key={i} className="aspect-square w-[86%] max-w-sm shrink-0 rounded-card" />
                                          ))}
                                    </div>
                                    {shape.ideas > 1 && <Sk className="mx-auto h-2 w-12 rounded-full" />}
                              </div>
                        </div>
                  )}
                  <Sk className="mx-5 h-16 rounded-full" />
                  <div aria-hidden className="flex flex-col gap-3">
                        <div className="flex h-11 items-center px-5">
                              <Sk className="h-6 w-44 rounded-full" />
                        </div>
                        <div className="flex gap-3 overflow-hidden px-5 py-1">
                              {times(shape.cooked + 1).map((i) => (
                                    <div key={i} className="flex w-[4.75rem] shrink-0 flex-col items-center gap-2">
                                          <Sk className="size-[4.75rem] rounded-full" />
                                          <SkText size="xs" w="w-12" />
                                          {i < shape.cooked && <SkText size="xs" w="w-10" className="-mt-1.5" />}
                                    </div>
                              ))}
                        </div>
                  </div>
            </SkMain>
      );
}
