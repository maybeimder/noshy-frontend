import AppHeader from "@/shared/components/layout/AppHeader";
import { Sk, SkText, times } from "@/shared/components/ui/Skeleton";
import { useShape } from "@/shared/hooks/useShape";
import type { DaySummary, MealSlot } from "@/shared/types/api";
import DayStats from "./DayStats";
import { homeShape } from "./HomeSkeleton";
import MealsRow from "./MealsRow";

// Inicio: greeting, the day's numbers and the meals in one white panel. Scrolling folds it down to the numbers.
export default function HomeHeader({ day, onPick }: { day: DaySummary; onPick: (slot: MealSlot) => void }) {
      return <AppHeader stats={<DayStats day={day} />} details={<MealsRow meals={day.meals} onPick={onPick} />} />;
}

export function HomeHeaderSkeleton() {
      const { meals } = useShape("home", homeShape);
      return (
            <AppHeader
                  stats={
                        <div aria-hidden>
                              <div className="flex h-9 items-center justify-between gap-2">
                                    <Sk className="h-7 w-36 rounded-full" />
                                    <Sk className="h-6 w-28 rounded-full" />
                              </div>
                              <Sk className="mt-3 h-3 rounded-full" />
                              <div className="mt-3.5 grid grid-cols-3 gap-3">
                                    {times(3).map((i) => (
                                          <div key={i}>
                                                <SkText size="xs" w="w-full" />
                                                <Sk className="mt-1 h-1.5 rounded-full" />
                                          </div>
                                    ))}
                              </div>
                        </div>
                  }
                  details={
                        meals > 0 ? (
                              <div aria-hidden className="flex gap-1.5 overflow-hidden px-5 pt-1 pb-6">
                                    {times(meals).map((i) => (
                                          <Sk key={i} className="h-[5.375rem] min-w-[4.6rem] flex-1 rounded-[1.25rem]" />
                                    ))}
                              </div>
                        ) : undefined
                  }
            />
      );
}
