import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useFeedbackHistory } from "@/modules/feedback/hooks/useFeedback";
import { eventLabels, targetLabels } from "@/modules/feedback/utils/labels";
import { useActivePlan } from "@/modules/plans/hooks/usePlan";
import { objectiveLabel, targetFields } from "@/modules/plans/utils/labels";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { formatDateTime } from "@/shared/lib/format";

const linkButton =
      "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-6 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

export default function ProfilePage() {
      const { user, logout } = useAuth();
      const plan = useActivePlan();
      const history = useFeedbackHistory();

      return (
            <>
                  <PageHeader title="Perfil" />
                  <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 pt-6">
                        <section className="flex items-center gap-4 rounded-card bg-card p-6">
                              <span
                                    aria-hidden
                                    className="grid size-16 shrink-0 place-items-center rounded-full bg-primary font-logo text-section font-extrabold text-ink"
                              >
                                    {user?.name.charAt(0).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                    <h2 className="truncate text-section font-bold text-ink">{user?.name}</h2>
                                    <p className="truncate text-base text-ink-muted">{user?.email}</p>
                              </div>
                        </section>

                        <section aria-labelledby="plan" className="flex flex-col gap-4 rounded-card bg-card p-6">
                              <div className="flex items-center justify-between gap-4">
                                    <h2 id="plan" className="text-title font-bold text-ink">
                                          Plan nutricional
                                    </h2>
                                    {plan.data && (
                                          <Link to="/plan/editar" className={`${linkButton} bg-secondary-soft hover:bg-secondary/60`}>
                                                <Icon name="edit" className="size-5" />
                                                Editar
                                          </Link>
                                    )}
                              </div>
                              {plan.isPending ? (
                                    <LoadingState />
                              ) : plan.isError ? (
                                    <ErrorState message={plan.error.message} onRetry={() => plan.refetch()} />
                              ) : plan.data === null ? (
                                    <>
                                          <p className="text-base text-ink-muted">
                                                Aún no tienes un plan. Con él, tu chef ajusta porciones y recetas a tus metas.
                                          </p>
                                          <Link to="/plan/nuevo" className={`${linkButton} bg-primary hover:bg-primary/85`}>
                                                Crear mi plan
                                          </Link>
                                    </>
                              ) : (
                                    <>
                                          <p className="text-base text-ink">
                                                Objetivo: <strong>{objectiveLabel(plan.data.objective)}</strong>
                                                {plan.data.mealsPerDay && ` · ${plan.data.mealsPerDay} comidas al día`}
                                          </p>
                                          <dl className="grid grid-cols-2 gap-3">
                                                {targetFields
                                                      .filter(({ key }) => plan.data?.targets[key] !== undefined)
                                                      .map(({ key, label, unit }) => (
                                                            <div key={key} className="rounded-control bg-canvas p-4">
                                                                  <dt className="text-xs text-ink-muted">{label}</dt>
                                                                  <dd className="text-title font-bold text-ink tabular-nums">
                                                                        {plan.data?.targets[key]} <span className="text-sm font-normal">{unit}</span>
                                                                  </dd>
                                                            </div>
                                                      ))}
                                          </dl>
                                          {plan.data.restrictions.length > 0 && (
                                                <ul aria-label="Restricciones" className="flex flex-wrap gap-2">
                                                      {plan.data.restrictions.map((r) => (
                                                            <li key={r} className="rounded-full bg-secondary-soft px-3 py-1 text-sm text-ink">
                                                                  {r}
                                                            </li>
                                                      ))}
                                                </ul>
                                          )}
                                    </>
                              )}
                        </section>

                        <section aria-labelledby="history" className="flex flex-col gap-4 rounded-card bg-card p-6">
                              <h2 id="history" className="text-title font-bold text-ink">
                                    Lo que tu chef sabe de ti
                              </h2>
                              {history.isPending ? (
                                    <LoadingState />
                              ) : history.isError ? (
                                    <ErrorState message={history.error.message} onRetry={() => history.refetch()} />
                              ) : history.data.length === 0 ? (
                                    <p className="text-base text-ink-muted">
                                          Aún nada. Cuéntale qué cocinaste o marca «La preparé» en una receta.
                                    </p>
                              ) : (
                                    <ul className="flex flex-col divide-y divide-line">
                                          {[...history.data]
                                                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                                                .slice(0, 15)
                                                .map((entry) => (
                                                      <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
                                                            <span className="min-w-0">
                                                                  <span className="block truncate text-base font-semibold text-ink">
                                                                        {entry.targetName}
                                                                  </span>
                                                                  <span className="block text-xs text-ink-muted">
                                                                        {targetLabels[entry.targetType]} · {formatDateTime(entry.createdAt)}
                                                                  </span>
                                                            </span>
                                                            <span className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink">
                                                                  {eventLabels[entry.eventType]}
                                                            </span>
                                                      </li>
                                                ))}
                                    </ul>
                              )}
                        </section>

                        <Button variant="secondary" onClick={logout}>
                              <Icon name="logout" className="size-5" />
                              Cerrar sesión
                        </Button>
                  </main>
            </>
      );
}
