import type { ReactNode } from "react";

/** Placeholder block: give it the size and radius of what it stands for. */
export function Sk({ className = "" }: { className?: string }) {
      return <span aria-hidden className={`block animate-pulse bg-line/70 motion-reduce:animate-none ${className.includes("rounded") ? "" : "rounded-control"} ${className}`} />;
}

// Line heights of the type scale, so a line of skeleton is as tall as the line of text.
const lines = { xs: "h-4", sm: "h-5", base: "h-6", title: "h-6", section: "h-8", page: "h-10", metric: "h-11" };

/** One line of text. `w` is its width class. */
export function SkText({ size = "base", w = "w-24", className = "" }: { size?: keyof typeof lines; w?: string; className?: string }) {
      return (
            <span aria-hidden className={`flex items-center ${lines[size]} ${className}`}>
                  <Sk className={`h-[62%] rounded-full ${w} max-w-full`} />
            </span>
      );
}

/** Announces the wait once; the blocks inside are decoration. */
export function SkMain({ className, children }: { className: string; children: ReactNode }) {
      return (
            <main className={className} aria-busy="true">
                  <span role="status" className="sr-only">
                        Cargando…
                  </span>
                  {children}
            </main>
      );
}

export function SkGroup({ className = "", children }: { className?: string; children: ReactNode }) {
      return (
            <div role="status" aria-label="Cargando…" className={className}>
                  {children}
            </div>
      );
}

export const times = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Row of filter pills, as tall as <Chips>. */
export function SkChips({ bleed = false, widths = ["w-20", "w-28", "w-24", "w-28"] }: { bleed?: boolean; widths?: string[] }) {
      return (
            <div aria-hidden className={`flex gap-2 overflow-hidden py-1 ${bleed ? "-mx-5 px-5" : ""}`}>
                  {widths.map((w, i) => (
                        <Sk key={i} className={`h-11 shrink-0 rounded-full ${w}`} />
                  ))}
            </div>
      );
}

/** Two-column recipe cards, as <RecipeGridCard>. */
export function SkRecipeGrid({ count = 4, meta = true }: { count?: number; meta?: boolean }) {
      return (
            <div aria-hidden className="grid grid-cols-2 gap-3">
                  {times(count).map((i) => (
                        <div key={i} className="overflow-hidden rounded-card bg-card">
                              <Sk className="h-36 rounded-none" />
                              <div className="flex flex-col gap-1 p-3">
                                    <span className="flex h-5 items-center">
                                          <Sk className="h-3.5 w-3/4 rounded-full" />
                                    </span>
                                    {meta && <SkText size="xs" w="w-1/2" />}
                              </div>
                        </div>
                  ))}
            </div>
      );
}
