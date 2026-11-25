import { Sk, SkMain } from "@/shared/components/ui/Skeleton";
import { useShape } from "@/shared/hooks/useShape";

export type ChefShape = { empty: boolean };

/** The conversation opens at its end, so the bubbles fill the screen from the top. */
export function ChefBubbles() {
      const { empty } = useShape<ChefShape>("chef", { empty: true });
      if (empty)
            return (
                  <div role="status" aria-label="Cargando…" className="flex flex-col gap-5">
                        <Sk className="h-24 w-3/5 rounded-card" />
                        <Sk className="h-36 rounded-[2rem]" />
                  </div>
            );
      return (
            <div role="status" aria-label="Cargando…" className="flex min-h-[calc(100dvh-13rem)] flex-col justify-end gap-4">
                  <Sk className="h-12 w-2/5 self-end rounded-card" />
                  <Sk className="h-24 w-4/5 rounded-card" />
                  <Sk className="h-64 rounded-card" />
                  <Sk className="h-11 w-3/5 rounded-full" />
            </div>
      );
}

export default function ChefSkeleton() {
      return (
            <SkMain className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3 pb-24">
                  <ChefBubbles />
            </SkMain>
      );
}
