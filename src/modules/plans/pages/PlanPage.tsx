import { useNavigate } from "react-router-dom";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import PlanForm from "../components/PlanForm";
import { useActivePlan, useSavePlan } from "../hooks/usePlan";

type PlanPageProps = {
      /** Onboarding right after sign-up vs. editing from the profile. */
      mode: "onboarding" | "edit";
};

export default function PlanPage({ mode }: PlanPageProps) {
      const navigate = useNavigate();
      const plan = useActivePlan();
      const save = useSavePlan({ hasPlan: Boolean(plan.data) });
      const onboarding = mode === "onboarding";
      const leave = () => navigate(onboarding ? "/" : "/perfil", { replace: true });

      if (plan.isPending) return <LoadingState />;
      if (plan.isError) {
            return (
                  <main className="mx-auto max-w-xl px-6 pt-12">
                        <ErrorState message={plan.error.message} onRetry={() => plan.refetch()} />
                  </main>
            );
      }

      return (
            <main className="min-h-dvh bg-canvas">
                  <PlanForm
                        initial={plan.data}
                        submitLabel={onboarding ? "Guardar y empezar" : "Guardar cambios"}
                        submitting={save.isPending}
                        error={save.error?.message}
                        onSubmit={(input) => save.mutate(input, { onSuccess: leave })}
                        onExit={leave}
                        onSkip={onboarding ? leave : undefined}
                  />
            </main>
      );
}
