import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import PlanDone from "../components/PlanDone";
import PlanForm from "../components/PlanForm";
import { useActivePlan, useSavePlan } from "../hooks/usePlan";
import { useOnboardingPrefs, useOnboardingSkipped } from "../utils/onboarding";

type PlanPageProps = {
      /** Onboarding right after sign-up vs. editing from the profile. */
      mode: "onboarding" | "edit";
};

export default function PlanPage({ mode }: PlanPageProps) {
      const navigate = useNavigate();
      const { user } = useAuth();
      const plan = useActivePlan();
      const save = useSavePlan({ hasPlan: Boolean(plan.data) });
      const [prefs] = useOnboardingPrefs();
      const [, setSkipped] = useOnboardingSkipped();
      // Onboarding ends on «¡Listo!»; its pencils reopen the flow on one step.
      const [view, setView] = useState<{ done: boolean; step: number }>({ done: false, step: 0 });
      const onboarding = mode === "onboarding";
      const leave = () => navigate(onboarding ? "/" : "/perfil", { replace: true });
      const skip = () => {
            setSkipped(true);
            leave();
      };

      if (plan.isPending) return <LoadingState />;
      if (plan.isError) {
            return (
                  <main className="mx-auto max-w-xl px-6 pt-12">
                        <ErrorState message={plan.error.message} onRetry={() => plan.refetch()} />
                  </main>
            );
      }

      if (view.done && plan.data) {
            return (
                  <PlanDone
                        firstName={user?.name.split(" ")[0] ?? ""}
                        plan={plan.data}
                        prefs={prefs}
                        onEdit={(step) => setView({ done: false, step })}
                        onContinue={leave}
                  />
            );
      }

      return (
            <main className="min-h-dvh bg-canvas">
                  <PlanForm
                        key={view.step}
                        initial={plan.data}
                        initialStep={view.step}
                        submitLabel={onboarding ? "Crear mi chef" : "Guardar cambios"}
                        submitting={save.isPending}
                        error={save.error?.message}
                        onSubmit={(input) => save.mutate(input, { onSuccess: onboarding ? () => setView((v) => ({ ...v, done: true })) : leave })}
                        onExit={onboarding ? skip : leave}
                        onSkip={onboarding ? skip : undefined}
                  />
            </main>
      );
}
