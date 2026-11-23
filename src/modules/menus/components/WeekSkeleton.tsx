import { Sk, SkMain, SkText, times } from "@/shared/components/ui/Skeleton";
import { useShape } from "@/shared/hooks/useShape";

/** Recipes per day, Monday first, then the ones out of the week. */
export type WeekShape = { days: number[]; other: number };
export const weekShape: WeekShape = { days: [1, 1, 1, 1, 1, 0, 0], other: 0 };

function Entries({ count }: { count: number }) {
      return (
            <div className="flex flex-col gap-2">
                  {times(count).map((i) => (
                        <div key={i} className="flex items-center gap-3 rounded-card bg-card p-3 shadow-soft">
                              <Sk className="size-14 shrink-0 rounded-full" />
                              <div className="min-w-0 flex-1">
                                    <SkText w="w-40" />
                                    <SkText size="xs" w="w-24" />
                              </div>
                        </div>
                  ))}
            </div>
      );
}

export default function WeekSkeleton() {
      const shape = useShape("week", weekShape);
      return (
            <SkMain className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                  {shape.days.map((count, day) => (
                        <div key={day} aria-hidden className="flex flex-col gap-2">
                              <SkText size="title" w="w-20" />
                              {count > 0 ? <Entries count={count} /> : <Sk className="h-12 rounded-card" />}
                        </div>
                  ))}
                  {shape.other > 0 && (
                        <div aria-hidden className="flex flex-col gap-2">
                              <SkText size="title" w="w-32" />
                              <Entries count={shape.other} />
                        </div>
                  )}
                  <Sk className="h-14 rounded-full" />
                  <Sk className="h-12 rounded-full" />
            </SkMain>
      );
}
