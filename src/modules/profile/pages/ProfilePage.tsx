import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/modules/auth/api/auth.api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useFeedbackHistory } from "@/modules/feedback/hooks/useFeedback";
import type { FeedbackEventType } from "@/modules/feedback/types";
import { targetLabels } from "@/modules/feedback/utils/labels";
import { useActivePlan } from "@/modules/plans/hooks/usePlan";
import { objectiveLabel, targetFields } from "@/modules/plans/utils/labels";
import Avatar from "@/shared/components/ui/Avatar";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import { Sparkle, Star } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import ImagePicker from "@/shared/components/ui/ImagePicker";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { ApiError } from "@/shared/lib/axios";
import { formatDate } from "@/shared/lib/format";
import { recipeColorFor, tones } from "@/shared/lib/tones";

const kcal = new Intl.NumberFormat("es", { useGrouping: "always" });

// Status chips from ref/Perfil.png.
const eventChips: Record<FeedbackEventType, { label: string; className: string }> = {
      selected: { label: "Elegida", className: "bg-rose-soft text-rose-ink" },
      prepared: { label: "Preparada", className: "bg-mint-soft text-mint-ink" },
      repeated: { label: "Repetida", className: "bg-mint-soft text-mint-ink" },
      discarded: { label: "Descartado", className: "bg-mist-soft text-ink-muted" },
      preference_changed: { label: "Preferencia", className: "bg-lilac-soft text-lilac-ink" },
};

export default function ProfilePage() {
      const { user, setUser, logout } = useAuth();
      const plan = useActivePlan();
      const history = useFeedbackHistory();
      const [settingsOpen, setSettingsOpen] = useState(false);

      const avatar = useMutation({
            mutationFn: async (avatarUrl: string | null) => {
                  let updated;
                  try {
                        updated = await authApi.updateMe({ avatarUrl });
                  } catch (error) {
                        if (error instanceof ApiError && error.status === 404) throw new Error("El servidor todavía no guarda fotos de perfil.");
                        throw error;
                  }
                  // A backend without avatar support answers without the field: do not pretend it was saved.
                  if ((updated.avatarUrl ?? null) !== avatarUrl) throw new Error("El servidor todavía no guarda fotos de perfil.");
                  return updated;
            },
            onSuccess: setUser,
      });

      return (
            <>
                  <header className="relative mx-auto max-w-xl overflow-hidden rounded-b-[2rem] bg-primary-strong px-5 pt-6 pb-8 text-card">
                        <span aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-primary/70" />
                        <span aria-hidden className="absolute -bottom-24 left-1/2 size-48 rounded-full bg-primary/40" />
                        <div className="relative flex items-center justify-between">
                              <h1 className="flex items-center gap-2 text-[1.75rem] font-extrabold">
                                    Perfil
                                    <Star className="size-6 -rotate-12 text-card" />
                              </h1>
                              <button
                                    type="button"
                                    aria-label="Ajustes de perfil"
                                    onClick={() => {
                                          avatar.reset();
                                          setSettingsOpen(true);
                                    }}
                                    className="grid size-12 place-items-center rounded-full bg-card/25 text-card hover:bg-card/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
                              >
                                    <Icon name="sliders" />
                              </button>
                        </div>
                        <div className="relative mt-5 flex items-center gap-4">
                              <span className="rounded-full bg-card/40 p-1">
                                    {user?.avatarUrl ? (
                                          <Avatar name={user.name} url={user.avatarUrl} size="lg" />
                                    ) : (
                                          <span aria-hidden className="grid size-24 place-items-center rounded-full bg-card font-display text-metric font-extrabold text-primary-strong">
                                                {user?.name.charAt(0).toUpperCase()}
                                          </span>
                                    )}
                              </span>
                              <div className="min-w-0">
                                    <p className="truncate font-display text-[1.75rem] leading-tight font-extrabold">{user?.name}</p>
                                    <p className="truncate text-sm font-semibold">{user?.email}</p>
                                    {plan.data && (
                                          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-extrabold text-ink">
                                                <Icon name="target" className="size-3.5 text-primary-strong" strokeWidth={2.25} />
                                                {objectiveLabel(plan.data.objective)}
                                          </span>
                                    )}
                              </div>
                        </div>
                  </header>

                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-5">
                        <section aria-labelledby="plan" className="relative flex flex-col gap-4 rounded-card bg-card p-5">
                              <Sparkle className="absolute top-24 -right-2 size-4 text-secondary" />
                              <div className="flex items-start justify-between gap-4">
                                    <div>
                                          <h2 id="plan" className="text-section font-extrabold text-ink">
                                                Plan nutricional
                                          </h2>
                                          {plan.data?.mealsPerDay && <p className="text-sm font-semibold text-ink-muted">{plan.data.mealsPerDay} comidas al día</p>}
                                    </div>
                                    {plan.data && (
                                          <Link to="/plan/editar" className={`${buttonBase} ${buttonVariants.soft} min-h-11 text-sm`}>
                                                <Icon name="edit" className="size-4" />
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
                                          <p className="text-base text-ink-muted">Aún no tienes un plan. Con él, Noshy ajusta cada receta a tus metas.</p>
                                          <Link to="/plan/nuevo" className={`${buttonBase} ${buttonVariants.primary} min-h-12 text-sm`}>
                                                Crear mi plan
                                          </Link>
                                    </>
                              ) : (
                                    <>
                                          <dl className="grid grid-cols-2 gap-3">
                                                {targetFields
                                                      .filter(({ key }) => plan.data?.targets[key] !== undefined)
                                                      .map(({ key, label, unit, tone }) => (
                                                            <div key={key} className={`rounded-control p-4 ${tones[tone].soft}`}>
                                                                  <dt className={`text-xs font-extrabold ${tones[tone].ink}`}>{label}</dt>
                                                                  <dd className={`font-display text-section font-extrabold tabular-nums ${tones[tone].ink}`}>
                                                                        {kcal.format(plan.data!.targets[key]!)}
                                                                        <span className="ml-0.5 text-sm">{unit}</span>
                                                                  </dd>
                                                            </div>
                                                      ))}
                                          </dl>
                                          {plan.data.restrictions.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                      <span className="text-xs font-extrabold text-ink-muted">Evitas:</span>
                                                      {plan.data.restrictions.map((r) => (
                                                            <span key={r} className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-card">
                                                                  <Icon name="close" className="size-3.5" strokeWidth={2.5} />
                                                                  {r}
                                                            </span>
                                                      ))}
                                                </div>
                                          )}
                                    </>
                              )}
                        </section>

                        <section aria-labelledby="history" className="flex flex-col gap-2 rounded-card bg-card p-5">
                              <h2 id="history" className="flex items-center gap-3 text-section font-extrabold text-ink">
                                    <MascotAvatar className="size-11" />
                                    Lo que Noshy sabe de ti
                              </h2>
                              {history.isPending ? (
                                    <LoadingState />
                              ) : history.isError ? (
                                    <ErrorState message={history.error.message} onRetry={() => history.refetch()} />
                              ) : history.data.length === 0 ? (
                                    <p className="text-base text-ink-muted">Aún nada. Cuéntale qué cocinaste o marca «La preparé» en una receta.</p>
                              ) : (
                                    <ul className="flex flex-col divide-y divide-line">
                                          {[...history.data]
                                                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                                                .slice(0, 15)
                                                .map((entry) => {
                                                      const chip = eventChips[entry.eventType];
                                                      return (
                                                            <li key={entry.id} className="flex items-center gap-3 py-3">
                                                                  <span aria-hidden className={`size-11 shrink-0 rounded-control ${entry.targetType === "ingredient" ? "bg-tomato" : recipeColorFor(entry.targetId)}`} />
                                                                  <span className="min-w-0 flex-1">
                                                                        <span className="block font-bold leading-snug text-ink">{entry.targetName}</span>
                                                                        <span className="block text-xs font-semibold text-ink-muted">
                                                                              {targetLabels[entry.targetType]} · {formatDate(entry.createdAt)}
                                                                        </span>
                                                                  </span>
                                                                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${chip.className}`}>{chip.label}</span>
                                                            </li>
                                                      );
                                                })}
                                    </ul>
                              )}
                        </section>

                        <button
                              type="button"
                              onClick={logout}
                              className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-extrabold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                        >
                              <Icon name="logout" className="size-5" />
                              Cerrar sesión
                        </button>
                  </main>

                  <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Ajustes de perfil">
                        <div className="flex flex-col gap-3">
                              <ImagePicker
                                    label="Foto de perfil"
                                    purpose="avatar"
                                    shape="circle"
                                    value={user?.avatarUrl ?? null}
                                    onChange={(url) => avatar.mutate(url)}
                                    placeholder={<Avatar name={user?.name ?? ""} size="lg" />}
                              />
                              {avatar.isPending && (
                                    <p role="status" className="text-sm text-ink-muted">
                                          Guardando tu foto…
                                    </p>
                              )}
                              {avatar.error && (
                                    <p role="alert" className="flex items-start gap-1 text-sm font-semibold text-error">
                                          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
                                          {avatar.error.message}
                                    </p>
                              )}
                        </div>
                  </Dialog>
            </>
      );
}
