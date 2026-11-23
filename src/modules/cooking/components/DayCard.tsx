import { formatNumber } from "@/shared/lib/format";
import { tones, type Tone } from "@/shared/lib/tones";
import type { DaySummary } from "@/shared/types/api";

const macros: { key: "proteinG" | "carbsG" | "fatG"; label: string; tone: Tone; bar: string }[] = [
      { key: "proteinG", label: "Proteína", tone: "rose", bar: "bg-primary" },
      { key: "carbsG", label: "Carbos", tone: "mustard", bar: "bg-mustard" },
      { key: "fatG", label: "Grasas", tone: "sky", bar: "bg-cobalt" },
];
const shareOf = (value: number, target: number) => (target > 0 ? Math.min(1, value / target) : 0);

// «1.240 / 2.200 kcal»: what was logged today against the target, then each macro.
export default function DayCard({ day }: { day: DaySummary }) {
      const { consumed, target } = day.nutrition;
      const share = shareOf(consumed.kcal, target.kcal);
      const left = target.kcal - consumed.kcal;

      return (
            <section aria-label="Tu día" className="mx-5 rounded-card bg-card p-5 shadow-soft">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="flex items-baseline gap-1.5 text-ink" aria-label={`${formatNumber(consumed.kcal)} de ${formatNumber(target.kcal)} kilocalorías hoy`}>
                              <span className="font-display text-metric font-extrabold tabular-nums">{formatNumber(consumed.kcal)}</span>
                              <span className="text-sm font-bold text-ink-muted tabular-nums">/ {formatNumber(target.kcal)} kcal</span>
                        </p>
                        <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-extrabold text-peach-ink tabular-nums">
                              {target.kcal > 0 && `${Math.round((consumed.kcal / target.kcal) * 100)}% · `}
                              {left >= 0 ? `quedan ${formatNumber(left)}` : `${formatNumber(-left)} de más`}
                        </span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-field">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-secondary),var(--color-primary))]" style={{ width: `${Math.max(2, share * 100)}%` }} />
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-4">
                        {macros.map(({ key, label, tone, bar }) => (
                              <div key={key}>
                                    <div className="flex items-baseline justify-between gap-1">
                                          <dt className={`text-xs font-extrabold ${tones[tone].ink}`}>{label}</dt>
                                          <dd className="text-xs font-bold text-ink-muted tabular-nums">
                                                {Math.round(consumed[key])}/{Math.round(target[key])}g
                                          </dd>
                                    </div>
                                    <div aria-hidden className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-field">
                                          <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(2, shareOf(consumed[key], target[key]) * 100)}%` }} />
                                    </div>
                              </div>
                        ))}
                  </dl>
            </section>
      );
}
