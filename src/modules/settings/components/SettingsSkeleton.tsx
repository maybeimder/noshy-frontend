import { Sk, SkMain, SkText, times } from "@/shared/components/ui/Skeleton";

export default function SettingsSkeleton() {
      return (
            <SkMain className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                  <div aria-hidden className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-soft">
                        <SkText size="title" w="w-20" />
                        <div className="flex items-center gap-4">
                              <Sk className="size-24 shrink-0 rounded-full" />
                              <div className="flex flex-col gap-2">
                                    <SkText size="sm" w="w-24" />
                                    <Sk className="h-10 w-32 rounded-full" />
                              </div>
                        </div>
                        <div className="flex flex-col gap-3">
                              {times(2).map((i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                          <SkText size="sm" w="w-20" />
                                          <Sk className="h-12" />
                                    </div>
                              ))}
                              <SkText size="sm" w="w-56" />
                        </div>
                        <div>
                              <SkText size="sm" w="w-32" />
                              <Sk className="my-1 h-11 w-72 rounded-full" />
                        </div>
                  </div>
                  <div aria-hidden className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-soft">
                        <SkText size="title" w="w-24" />
                        {times(2).map((i) => (
                              <div key={i}>
                                    <SkText size="sm" w="w-32" />
                                    <Sk className="my-1 h-11 w-64 rounded-full" />
                              </div>
                        ))}
                        <Sk className="h-11" />
                  </div>
            </SkMain>
      );
}
