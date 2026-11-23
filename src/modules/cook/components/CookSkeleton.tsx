import { useShape } from "@/shared/hooks/useShape";
import { Sk, SkMain, SkText, times } from "@/shared/components/ui/Skeleton";

export type CookShape = { ingredients: number };

export default function CookSkeleton() {
      const { ingredients } = useShape<CookShape>("cook", { ingredients: 3 });
      return (
            <SkMain className="mx-auto flex min-h-dvh max-w-xl flex-col gap-5 px-5 pt-5 pb-32">
                  <div aria-hidden className="flex items-center gap-3">
                        <Sk className="size-12 rounded-full" />
                        <SkText size="title" w="w-44" />
                  </div>
                  <Sk className="h-1.5 rounded-full" />
                  <div aria-hidden>
                        <SkText size="sm" w="w-24" />
                        <SkText size="page" w="w-64" className="mt-1" />
                        <Sk className="mt-3 h-8 w-32 rounded-full" />
                  </div>
                  {ingredients > 0 && (
                        <div aria-hidden className="divide-y divide-line rounded-card bg-card px-4 shadow-soft">
                              {times(ingredients).map((i) => (
                                    <SkText key={i} w="w-48" className="box-content py-2" />
                              ))}
                        </div>
                  )}
                  {times(2).map((i) => (
                        <div key={i} aria-hidden className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-soft">
                              <SkText size="section" w="w-full" />
                              <SkText size="section" w="w-3/4" />
                              <Sk className="h-[4.25rem]" />
                        </div>
                  ))}
            </SkMain>
      );
}
