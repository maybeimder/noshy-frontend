import { Sk, SkMain, SkText, times } from "@/shared/components/ui/Skeleton";

/** A form step: header with progress, title and option cards. */
export default function PlanSkeleton({ onboarding = false }: { onboarding?: boolean }) {
      return (
            <SkMain className="min-h-dvh bg-canvas">
                  <div aria-hidden className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-6">
                        <div className="flex items-center gap-4">
                              <Sk className="size-12 shrink-0 rounded-full" />
                              <div className="flex-1">
                                    <SkText size="xs" w="w-32" />
                                    <Sk className="mt-2 h-2 rounded-full" />
                              </div>
                        </div>
                        <div className="mt-8 flex flex-1 flex-col gap-6 pb-8">
                              <div>
                                    <SkText size="section" w="w-64" className="h-[2.1875rem]!" />
                                    <SkText w="w-full" className="mt-2" />
                                    <SkText w="w-3/5" className="sm:hidden" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                    {times(6).map((i) => (
                                          <Sk key={i} className="h-[9.23rem] rounded-card sm:h-36" />
                                    ))}
                              </div>
                        </div>
                        <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-6">
                              <Sk className="h-16 rounded-full" />
                              {/* «Lo haré más tarde». */}
                              {onboarding && <div className="mt-2 h-11" />}
                        </div>
                  </div>
            </SkMain>
      );
}
