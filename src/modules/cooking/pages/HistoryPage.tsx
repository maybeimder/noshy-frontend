import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { ErrorState } from "@/shared/components/ui/QueryState";
import { Sk, SkMain, times } from "@/shared/components/ui/Skeleton";
import { dayToDate, formatNumber, localDay, plural } from "@/shared/lib/format";
import { homeApi } from "../api/home.api";
import DayStats from "../components/DayStats";
import MealEntries from "../components/MealEntries";

const PAGE_DAYS = 14;
const dayFormat = new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric", month: "short" });
const shift = (day: string, by: number) => {
      const date = dayToDate(day);
      date.setDate(date.getDate() + by);
      return localDay(date);
};

/** What was eaten each day against today's target; a day opens to its meals. */
export default function HistoryPage() {
      const today = localDay();
      const [to, setTo] = useState(today);
      const [open, setOpen] = useState<string | null>(null);
      const from = shift(to, 1 - PAGE_DAYS);
      const history = useQuery({ queryKey: ["days", from, to], queryFn: () => homeApi.history(from, to) });

      return (
            <>
                  <PageHeader title="Tu historial" icon="calendar" backTo="/perfil" />
                  {history.isPending ? (
                        <SkMain className="mx-auto flex max-w-xl flex-col gap-2 px-5 pt-3">
                              {times(7).map((i) => (
                                    <Sk key={i} className="h-20 rounded-card" />
                              ))}
                        </SkMain>
                  ) : (
                        <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                              {history.isError ? (
                                    <ErrorState message={history.error.message} onRetry={() => history.refetch()} />
                              ) : (
                                    <>
                                          <ul className="flex flex-col gap-2">
                                                {history.data.days.map((day) => {
                                                      const share = history.data.target.kcal > 0 ? Math.min(1, day.consumed.kcal / history.data.target.kcal) : 0;
                                                      const label = day.date === today ? "Hoy" : day.date === shift(today, -1) ? "Ayer" : dayFormat.format(dayToDate(day.date));
                                                      const expanded = open === day.date;
                                                      return (
                                                            <li key={day.date} className="overflow-hidden rounded-card bg-card shadow-soft">
                                                                  <button
                                                                        type="button"
                                                                        aria-expanded={expanded}
                                                                        disabled={day.meals === 0}
                                                                        onClick={() => setOpen(expanded ? null : day.date)}
                                                                        className="flex w-full flex-col gap-2 p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-strong"
                                                                  >
                                                                        <span className="flex w-full items-baseline gap-2">
                                                                              <span className="min-w-0 flex-1 truncate font-display font-semibold text-ink first-letter:uppercase">{label}</span>
                                                                              <span className="text-sm text-ink-muted tabular-nums">
                                                                                    {day.meals === 0 ? (
                                                                                          "Sin registros"
                                                                                    ) : (
                                                                                          <>
                                                                                                <strong className="text-ink">{formatNumber(day.consumed.kcal)}</strong> kcal · {plural(day.meals, "comida", "comidas")}
                                                                                          </>
                                                                                    )}
                                                                              </span>
                                                                              {day.meals > 0 && <Icon name="chevronDown" className={`size-4 shrink-0 self-center text-ink-muted transition-transform ${expanded ? "rotate-180" : ""}`} />}
                                                                        </span>
                                                                        {day.meals > 0 && (
                                                                              <span aria-hidden className="block h-2 w-full overflow-hidden rounded-full bg-kcal-soft">
                                                                                    <span className="block h-full rounded-full bg-kcal-bar" style={{ width: `${share * 100}%` }} />
                                                                              </span>
                                                                        )}
                                                                  </button>
                                                                  {expanded && <DayDetail date={day.date} />}
                                                            </li>
                                                      );
                                                })}
                                          </ul>
                                          <p className="text-center text-xs text-ink-muted">Comparado con tu meta de hoy: {formatNumber(history.data.target.kcal)} kcal.</p>
                                          <div className="grid grid-cols-2 gap-3 pb-4">
                                                <Button variant="secondary" onClick={() => setTo(shift(to, -PAGE_DAYS))}>
                                                      Días anteriores
                                                </Button>
                                                <Button variant="secondary" disabled={to === today} onClick={() => setTo(shift(to, PAGE_DAYS) > today ? today : shift(to, PAGE_DAYS))}>
                                                      Más recientes
                                                </Button>
                                          </div>
                                    </>
                              )}
                        </main>
                  )}
            </>
      );
}

function DayDetail({ date }: { date: string }) {
      const day = useQuery({ queryKey: ["day", date], queryFn: () => homeApi.day(date) });
      if (day.isPending) return <Sk className="m-4 h-28" />;
      if (day.isError) return <p className="p-4 text-sm font-semibold text-error">{day.error.message}</p>;
      return (
            <div className="flex flex-col gap-4 border-t border-line p-4">
                  <DayStats day={day.data} />
                  <MealEntries date={date} entries={day.data.entries ?? []} />
            </div>
      );
}
