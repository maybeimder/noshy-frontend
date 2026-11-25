import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useInsights, useProfile } from "@/modules/plans/hooks/usePlan";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { ErrorState } from "@/shared/components/ui/QueryState";
import type { IconName } from "@/shared/components/ui/Icon";
import { formatNumber } from "@/shared/lib/format";
import { tones, type Tone } from "@/shared/lib/tones";
import ProfileHeader from "../components/ProfileHeader";
import ProfileSkeleton, { InsightsSkeleton, noInsights, type InsightsShape } from "../components/ProfileSkeleton";
import { useRememberShape } from "@/shared/hooks/useShape";
import type { FormStep, Insight, Profile } from "@/modules/plans/types";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

/** One icon and tone per preference row. */
const sectionLook: Record<FormStep, { icon: IconName; tone: Tone }> = {
      goals: { icon: "target", tone: "mint" },
      activity: { icon: "walk", tone: "sky" },
      body: { icon: "user", tone: "olive" },
      restrictions: { icon: "alert", tone: "rose" },
      tastes: { icon: "heart", tone: "peach" },
      kitchen: { icon: "chef", tone: "mustard" },
      shopping: { icon: "cart", tone: "lilac" },
};

const RING = 2 * Math.PI * 26;

/** «72 %»: how much the chef knows, as a ring (the backend computes the score). */
function LearningRing({ score }: { score: number }) {
      const pct = Math.round(score * 100);
      return (
            <span role="img" aria-label={`Tu chef te conoce un ${pct} %`} className="relative grid size-16 shrink-0 place-items-center">
                  <svg aria-hidden viewBox="0 0 64 64" className="absolute inset-0 size-full -rotate-90">
                        <circle cx="32" cy="32" r="26" fill="none" strokeWidth="7" className="stroke-card/15" />
                        <circle cx="32" cy="32" r="26" fill="none" strokeWidth="7" strokeLinecap="round" stroke="var(--color-mustard)" strokeDasharray={RING} strokeDashoffset={RING * (1 - score)} />
                  </svg>
                  <span className="relative font-display text-base font-extrabold tabular-nums">{pct}%</span>
            </span>
      );
}

/** The API rows plus «Sobre ti», after activity as in the form. */
function preferenceRows(p: Profile): { section: FormStep; label: string; summary: string }[] {
      const b = p.biometrics;
      const body = b ? `${b.weightKg} kg · ${b.heightCm} cm · ${new Date().getFullYear() - b.birthYear} años` : "Peso, estatura y edad";
      return p.preferences.flatMap((row): { section: FormStep; label: string; summary: string }[] =>
            row.section === "activity" ? [row, { section: "body", label: "Sobre ti", summary: body }] : [row],
      );
}

export default function ProfilePage() {
      const { logout } = useAuth();
      const profile = useProfile();
      const p = profile.data;

      return (
            <>
                  <ProfileHeader profile={profile.isError ? null : p} />

                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-5">
                        {profile.isPending ? (
                              <ProfileSkeleton />
                        ) : profile.isError ? (
                              <ErrorState message={profile.error.message} onRetry={() => profile.refetch()} />
                        ) : !p ? (
                              <section className="flex flex-col gap-4 rounded-card bg-card p-5">
                                    <p className="text-base text-ink-muted">Aún no has configurado tu chef. Con eso, Noshy ajusta cada receta a tus metas.</p>
                                    <Link to="/plan/nuevo" className={`${buttonBase} ${buttonVariants.primary} min-h-12 text-sm`}>
                                          Configurar mi chef
                                    </Link>
                              </section>
                        ) : (
                              <>
                                    <section aria-labelledby="learned" className="flex flex-col gap-4 rounded-card bg-plum-glow p-5 text-card shadow-[0_18px_36px_-22px_rgb(43_20_51/0.8)]">
                                          <div className="flex items-center gap-4">
                                                <LearningRing score={p.learning.score} />
                                                <div className="min-w-0">
                                                      <h2 id="learned" className="text-title leading-tight font-extrabold">
                                                            Lo que tu chef ha aprendido
                                                      </h2>
                                                      <p className="mt-0.5 text-sm text-card/80">
                                                            {formatNumber(p.learning.signalsCount)} {p.learning.signalsCount === 1 ? "señal" : "señales"} de lo que cocinas y compras
                                                      </p>
                                                </div>
                                          </div>
                                          <Insights />
                                    </section>

                                    <Link to="/historial" className={`flex min-h-16 items-center gap-3 rounded-card bg-card px-4 py-2 shadow-soft ${focus}`}>
                                          <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-control ${tones.sky.soft} ${tones.sky.ink}`}>
                                                <Icon name="calendar" className="size-5" strokeWidth={2} />
                                          </span>
                                          <span className="min-w-0 flex-1">
                                                <span className="block font-display font-extrabold text-ink">Tu historial</span>
                                                <span className="block truncate text-sm text-ink-muted">Lo que comiste cada día</span>
                                          </span>
                                          <Icon name="chevronRight" className="size-5 shrink-0 text-ink-muted" />
                                    </Link>

                                    <section aria-labelledby="preferences">
                                          <div className="mb-3 flex items-baseline justify-between gap-3">
                                                <h2 id="preferences" className="text-section font-extrabold text-ink">
                                                      Tus preferencias
                                                </h2>
                                                <span className="text-sm font-bold text-ink-muted">{preferenceRows(p).length} pasos</span>
                                          </div>
                                          <ul className="divide-y divide-line rounded-card bg-card px-4 shadow-soft">
                                                {preferenceRows(p).map((row) => (
                                                      <li key={row.section}>
                                                            <Link to={`/plan/editar?paso=${row.section}`} className={`flex min-h-16 items-center gap-3 py-2 ${focus}`}>
                                                                  <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-control ${tones[sectionLook[row.section].tone].soft} ${tones[sectionLook[row.section].tone].ink}`}>
                                                                        <Icon name={sectionLook[row.section].icon} className="size-5" strokeWidth={2} />
                                                                  </span>
                                                                  <span className="min-w-0 flex-1">
                                                                        <span className="block font-display font-extrabold text-ink">{row.label}</span>
                                                                        <span className="block truncate text-sm text-ink-muted">{row.summary}</span>
                                                                  </span>
                                                                  <Icon name="chevronRight" className="size-5 shrink-0 text-ink-muted" />
                                                            </Link>
                                                      </li>
                                                ))}
                                          </ul>
                                    </section>
                              </>
                        )}

                        <button type="button" onClick={logout} className={`mx-auto inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-extrabold text-ink-muted hover:text-ink ${focus}`}>
                              <Icon name="logout" className="size-5" />
                              Cerrar sesión
                        </button>
                  </main>
            </>
      );
}

function Insights() {
      const { list, vote } = useInsights();
      useRememberShape<InsightsShape>("insights", list.data ? { count: list.data.length } : null);
      if (list.isPending) return <InsightsSkeleton />;
      if (list.isError) return <ErrorState message={list.error.message} onRetry={() => list.refetch()} />;
      if (list.data.length === 0) return <p className="text-card/80">{noInsights}</p>;
      return (
            <>
                  <ul className="flex flex-col gap-2">
                        {list.data.map((insight: Insight) => (
                              <li key={insight.id} className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-control bg-card/10 p-3">
                                    <span className="min-w-0 flex-1 text-sm font-bold">{insight.text}</span>
                                    {(["up", "down"] as const).map((v) => (
                                          <button
                                                key={v}
                                                type="button"
                                                aria-label={v === "up" ? "Es cierto" : "No es cierto"}
                                                aria-pressed={insight.userVote === v}
                                                disabled={vote.isPending}
                                                onClick={() => vote.mutate({ id: insight.id, vote: v })}
                                                className={`grid size-11 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card ${
                                                      insight.userVote === v ? "bg-primary-strong text-card" : "bg-card/15 text-card hover:bg-card/25"
                                                }`}
                                          >
                                                <Icon name={v === "up" ? "thumbUp" : "thumbDown"} className="size-5" />
                                          </button>
                                    ))}
                                    <span className="flex w-full items-center gap-3">
                                          <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-card/15">
                                                <span className="bar-fill block h-full rounded-full bg-brand" style={{ width: `${Math.round(insight.confidence * 100)}%` }} />
                                          </span>
                                          <span className="shrink-0 text-xs font-semibold text-card/75">{insight.evidence.label}</span>
                                    </span>
                              </li>
                        ))}
                  </ul>
                  {vote.error && <p className="text-sm font-semibold text-secondary-soft">{vote.error.message}</p>}
            </>
      );
}
