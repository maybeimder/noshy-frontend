import Icon from "@/shared/components/ui/Icon";
import { formatNumber } from "@/shared/lib/format";
import type { DaySummary } from "@/shared/types/api";

const macros = [
      { key: "proteinG", label: "Proteína", ink: "text-protein-ink", track: "bg-protein-soft", bar: "bg-protein" },
      { key: "carbsG", label: "Carbos", ink: "text-carbs-ink", track: "bg-carbs-soft", bar: "bg-carbs" },
      { key: "fatG", label: "Grasas", ink: "text-fat-ink", track: "bg-fat-soft", bar: "bg-fat" },
] as const;

/** Width of a fill; anything logged shows at least a sliver. */
const widthOf = (value: number, target: number) => (target > 0 && value > 0 ? `${Math.max(3, Math.min(1, value / target) * 100)}%` : "0%");

// «1.240 / 2.200 kcal»: what was logged today against the target, then each macro.
export default function DayStats({ day }: { day: DaySummary }) {
      const { consumed, target } = day.nutrition;
      const left = target.kcal - consumed.kcal;

      return (
            <section aria-label="Tu día">
                  <div className="flex items-center justify-between gap-2">
                        <p className="flex items-baseline gap-1 text-ink" aria-label={`${formatNumber(consumed.kcal)} de ${formatNumber(target.kcal)} kilocalorías hoy`}>
                              <span className="font-display text-[2.125rem] leading-9 font-bold tracking-tight tabular-nums">{formatNumber(consumed.kcal)}</span>
                              <span className="text-sm font-semibold whitespace-nowrap text-ink-muted tabular-nums">/ {formatNumber(target.kcal)} kcal</span>
                        </p>
                        <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-kcal-pill px-2.5 text-xs font-bold whitespace-nowrap text-kcal-ink tabular-nums">
                              <Icon name="flame" className="size-3.5 text-kcal" strokeWidth={2.25} />
                              {target.kcal > 0 && `${Math.round((consumed.kcal / target.kcal) * 100)}% · `}
                              {left >= 0 ? `quedan ${formatNumber(left)}` : `${formatNumber(-left)} de más`}
                        </span>
                  </div>
                  <div aria-hidden className="mt-3 h-3 overflow-hidden rounded-full bg-kcal-soft">
                        <div className="bar-fill h-full rounded-full bg-kcal-bar transition-[width] duration-500 ease-out" style={{ width: widthOf(consumed.kcal, target.kcal) }} />
                  </div>
                  <dl className="mt-3.5 grid grid-cols-3 gap-3">
                        {macros.map(({ key, label, ink, track, bar }) => (
                              <div key={key}>
                                    <div className="flex items-baseline justify-between gap-1">
                                          <dt className={`text-xs font-extrabold ${ink}`}>{label}</dt>
                                          <dd className="text-[0.6875rem] font-semibold text-ink-muted tabular-nums">
                                                {Math.round(consumed[key])}/{Math.round(target[key])}g
                                          </dd>
                                    </div>
                                    <div aria-hidden className={`mt-1 h-1.5 overflow-hidden rounded-full ${track}`}>
                                          <div className={`bar-fill h-full rounded-full transition-[width] duration-500 ease-out ${bar}`} style={{ width: widthOf(consumed[key], target[key]) }} />
                                    </div>
                              </div>
                        ))}
                  </dl>
            </section>
      );
}
