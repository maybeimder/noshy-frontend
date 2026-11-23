import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useInsights, useProfile } from "@/modules/plans/hooks/usePlan";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { ErrorState } from "@/shared/components/ui/QueryState";
import { formatNumber, plural } from "@/shared/lib/format";
import { tones, type Tone } from "@/shared/lib/tones";
import ProfileHeader from "../components/ProfileHeader";
import ProfileSkeleton, { InsightsSkeleton, noInsights, type InsightsShape } from "../components/ProfileSkeleton";
import { useRememberShape } from "@/shared/hooks/useShape";
import type { FormStep, Insight, Profile } from "@/modules/plans/types";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

const targets: { key: keyof Profile["nutritionTargets"]; label: string; unit: string; tone: Tone }[] = [
      { key: "kcal", label: "Calorías", unit: "kcal", tone: "peach" },
      { key: "proteinG", label: "Proteína", unit: "g", tone: "rose" },
      { key: "carbsG", label: "Carbohidratos", unit: "g", tone: "mustard" },
      { key: "fatG", label: "Grasas", unit: "g", tone: "sky" },
];

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
                                    <section aria-labelledby="learned" className="flex flex-col gap-2 rounded-card bg-card p-5">
                                          <h2 id="learned" className="flex items-center gap-3 text-section font-extrabold text-ink">
                                                <MascotAvatar className="size-11" />
                                                Lo que tu chef ha aprendido
                                          </h2>
                                          <p className="text-sm font-semibold text-ink-muted">
                                                {Math.round(p.learning.score * 100)}% · {plural(p.learning.signalsCount, "señal", "señales")}
                                          </p>
                                          <Insights />
                                    </section>

                                    <section aria-labelledby="targets" className="flex flex-col gap-4 rounded-card bg-card p-5">
                                          <h2 id="targets" className="text-section font-extrabold text-ink">
                                                Tus metas diarias
                                          </h2>
                                          <dl className="grid grid-cols-2 gap-3">
                                                {targets.map(({ key, label, unit, tone }) => (
                                                      <div key={key} className={`rounded-control p-4 ${tones[tone].soft}`}>
                                                            <dt className={`text-xs font-extrabold ${tones[tone].ink}`}>{label}</dt>
                                                            <dd className={`font-display text-section font-extrabold tabular-nums ${tones[tone].ink}`}>
                                                                  {formatNumber(p.nutritionTargets[key])}
                                                                  <span className="ml-0.5 text-sm">{unit}</span>
                                                            </dd>
                                                      </div>
                                                ))}
                                          </dl>
                                    </section>

                                    <section aria-labelledby="preferences" className="rounded-card bg-card p-5">
                                          <h2 id="preferences" className="mb-2 text-section font-extrabold text-ink">
                                                Tus preferencias
                                          </h2>
                                          <ul className="divide-y divide-line">
                                                {preferenceRows(p).map((row) => (
                                                      <li key={row.section}>
                                                            <Link to={`/plan/editar?paso=${row.section}`} className={`flex min-h-14 items-center gap-3 py-2 ${focus}`}>
                                                                  <span className="min-w-0 flex-1">
                                                                        <span className="block text-xs font-extrabold text-ink-muted">{row.label}</span>
                                                                        <span className="block truncate font-bold text-ink">{row.summary}</span>
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
      if (list.data.length === 0) return <p className="text-ink-muted">{noInsights}</p>;
      return (
            <>
                  <ul className="divide-y divide-line">
                        {list.data.map((insight: Insight) => (
                              <li key={insight.id} className="flex items-center gap-2 py-3">
                                    <span className="min-w-0 flex-1">
                                          <span className="block font-bold text-ink">{insight.text}</span>
                                          <span className="block text-xs font-semibold text-ink-muted">{insight.evidence.label}</span>
                                    </span>
                                    {(["up", "down"] as const).map((v) => (
                                          <button
                                                key={v}
                                                type="button"
                                                aria-label={v === "up" ? "Es cierto" : "No es cierto"}
                                                aria-pressed={insight.userVote === v}
                                                disabled={vote.isPending}
                                                onClick={() => vote.mutate({ id: insight.id, vote: v })}
                                                className={`grid size-11 shrink-0 place-items-center rounded-full ${focus} ${insight.userVote === v ? "bg-ink text-card" : "bg-field text-ink"}`}
                                          >
                                                <Icon name={v === "up" ? "thumbUp" : "thumbDown"} className="size-5" />
                                          </button>
                                    ))}
                              </li>
                        ))}
                  </ul>
                  {vote.error && <p className="text-sm font-semibold text-error">{vote.error.message}</p>}
            </>
      );
}
