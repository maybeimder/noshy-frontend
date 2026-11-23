import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useOnboardingSkipped } from "@/modules/plans/utils/onboarding";
import AppHeader from "@/shared/components/layout/AppHeader";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { ErrorState } from "@/shared/components/ui/QueryState";
import { MarkerText } from "@/shared/components/ui/ScribbleText";
import { plural } from "@/shared/lib/format";
import type { MealSlot } from "@/shared/types/api";
import { useRememberShape } from "@/shared/hooks/useShape";
import DayCard from "../components/DayCard";
import HomeSkeleton, { type HomeShape } from "../components/HomeSkeleton";
import LogMealDialog from "../components/LogMealDialog";
import MealsRow from "../components/MealsRow";
import MostCooked from "../components/MostCooked";
import NudgeCard from "../components/NudgeCard";
import TodayCarousel from "../components/TodayCarousel";
import { useHome } from "../hooks/useHome";

const cardLink = "mx-5 flex items-center gap-4 rounded-card bg-card p-5 shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

function SectionTitle({ id, title, action }: { id: string; title: string; action?: { to: string; label: string } }) {
      return (
            <div className="flex items-end justify-between gap-3 px-5">
                  <h2 id={id} className="text-section font-extrabold text-ink">
                        <MarkerText>{title}</MarkerText>
                  </h2>
                  {action && (
                        <Link to={action.to} className="min-h-11 content-center text-sm font-extrabold text-primary-strong focus-visible:outline-2 focus-visible:outline-primary-strong">
                              {action.label}
                        </Link>
                  )}
            </div>
      );
}

export default function HomePage() {
      const { user } = useAuth();
      const home = useHome();
      const [skipped] = useOnboardingSkipped();
      const [slot, setSlot] = useState<MealSlot | null>(null);

      const shown = home.data;
      useRememberShape<HomeShape>(
            "home",
            shown
                  ? { active: Boolean(shown.activeCookingSession), meals: shown.day?.meals.length ?? 0, ideas: shown.ideas?.items.length ?? 0, nudge: Boolean(shown.nudge), cooked: shown.mostCooked?.length ?? 0 }
                  : null,
      );

      // A new account (or one that never finished) starts with the onboarding steps.
      if (user?.onboardingStatus !== "completed") {
            if (!skipped) return <Navigate to="/plan/nuevo" replace />;
            return (
                  <>
                        <AppHeader />
                        <main className="mx-auto max-w-xl pt-3">
                              <Link to="/plan/nuevo" className={cardLink}>
                                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-peach-soft text-peach-ink">
                                          <Icon name="target" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                          <span className="block font-display text-title font-extrabold text-ink">Configura tu chef</span>
                                          <span className="block text-sm text-ink-muted">Así sabe cuánto y qué te conviene comer.</span>
                                    </span>
                                    <Icon name="arrowRight" className="size-6 shrink-0 text-primary-strong" />
                              </Link>
                        </main>
                  </>
            );
      }

      const data = home.data;
      if (home.isPending) {
            return (
                  <>
                        <AppHeader />
                        <HomeSkeleton />
                  </>
            );
      }
      return (
            <>
                  <AppHeader />
                  <main className="mx-auto flex max-w-xl flex-col gap-6 pt-3 pb-12">
                        {home.isError ? (
                              <div className="px-5">
                                    <ErrorState message={home.error.message} onRetry={() => home.refetch()} />
                              </div>
                        ) : data ? (
                              <>
                                    {data.activeCookingSession && (
                                          <Link to={`/cocinar/${data.activeCookingSession.id}`} className={cardLink}>
                                                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong">
                                                      <Icon name="flame" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                      <span className="block truncate font-display text-title font-extrabold text-ink">Continuar: {data.activeCookingSession.recipe.title}</span>
                                                      <span className="block text-sm text-ink-muted">
                                                            Paso {data.activeCookingSession.currentStepIndex + 1} de {data.activeCookingSession.stepsCount}
                                                      </span>
                                                </span>
                                                <Icon name="arrowRight" className="size-6 shrink-0 text-primary-strong" />
                                          </Link>
                                    )}
                                    {data.day && (
                                          <>
                                                <DayCard day={data.day} />
                                                <MealsRow meals={data.day.meals} onPick={setSlot} />
                                          </>
                                    )}
                                    {data.nudge && (
                                          <div className="px-5">
                                                <NudgeCard nudge={data.nudge} />
                                          </div>
                                    )}
                                    {data.ideas && data.ideas.items.length > 0 && (
                                          <section aria-labelledby="for-you" className="flex flex-col gap-3">
                                                <SectionTitle id="for-you" title="Hoy para ti" action={{ to: "/recetas?ver=explorar", label: "Más ideas" }} />
                                                <TodayCarousel recipes={data.ideas.items} />
                                          </section>
                                    )}
                                    <Link
                                          to="/chef"
                                          className="mx-5 flex items-center gap-3 rounded-full bg-card p-2 pr-4 shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                    >
                                          <MascotAvatar tone="blush" className="size-12" />
                                          <span className="min-w-0 flex-1 font-display font-extrabold text-ink">
                                                {data.chef.unreadCount > 0 ? `Tienes ${plural(data.chef.unreadCount, "mensaje", "mensajes")} de tu chef` : "Habla con tu chef"}
                                          </span>
                                          <Icon name="arrowRight" className="size-5 text-primary-strong" />
                                    </Link>
                                    {data.mostCooked && (
                                          <section aria-labelledby="most-cooked" className="flex flex-col gap-3">
                                                <SectionTitle id="most-cooked" title="Lo que más cocinas" action={{ to: "/cocinadas", label: "Ver todo" }} />
                                                <MostCooked recipes={data.mostCooked} />
                                          </section>
                                    )}
                              </>
                        ) : null}
                  </main>
                  {slot && data?.day && <LogMealDialog key={slot.slot} slot={slot} date={data.day.date} onClose={() => setSlot(null)} />}
            </>
      );
}
