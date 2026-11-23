import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import MenuWaiting from "@/modules/menus/components/MenuWaiting";
import PantrySetup from "@/modules/inventory/components/PantrySetup";
import { ErrorState } from "@/shared/components/ui/QueryState";
import { newKey } from "@/shared/lib/axios";
import PlanDone from "../components/PlanDone";
import PlanSkeleton from "../components/PlanSkeleton";
import PlanForm from "../components/PlanForm";
import { useCompleteOnboarding, useProfile, useUpdatePreferences } from "../hooks/usePlan";
import type { PlanData, FormStep, PlanInput } from "../types";
import { useOnboardingSkipped } from "../utils/onboarding";

type PlanPageProps = {
      /** Onboarding right after sign-up vs. editing from the profile. */
      mode: "onboarding" | "edit";
};

const sections: FormStep[] = ["goals", "activity", "body", "restrictions", "tastes", "kitchen", "shopping"];

/** Onboarding: form → Tu despensa → ¡Listo! → waiting for the first menu. */
type Stage = "form" | "pantry" | "done" | "menu";

export default function PlanPage({ mode }: PlanPageProps) {
      const navigate = useNavigate();
      const { user } = useAuth();
      const [params] = useSearchParams();
      const profile = useProfile();
      const complete = useCompleteOnboarding();
      const save = useUpdatePreferences();
      const [, setSkipped] = useOnboardingSkipped();
      const onboarding = mode === "onboarding";
      // From a profile row: /plan/editar?paso=kitchen
      const startStep = Math.max(0, sections.indexOf(params.get("paso") as FormStep));
      const [stage, setStage] = useState<Stage>("form");
      const [step, setStep] = useState(startStep);
      const [created, setCreated] = useState<(PlanData & { menuId: string }) | null>(null);
      // Same key for every retry of one package; a changed package is a different request.
      const submission = useRef<{ body: string; key: string }>({ body: "", key: "" });

      const leave = () => navigate(onboarding ? "/" : "/perfil", { replace: true });
      const skip = () => {
            setSkipped(true);
            leave();
      };

      const submit = (input: PlanInput, before: PlanInput) => {
            // «¡Listo!» pencils and the profile edit what already exists.
            if (created || profile.data) {
                  save.mutate({ before, after: input }, { onSuccess: (updated) => {
                        if (created && updated) setCreated({ ...created, ...updated });
                        if (created) setStage("done");
                        else leave();
                  } });
                  return;
            }
            const body = JSON.stringify(input);
            if (submission.current.body !== body) submission.current = { body, key: newKey() };
            complete.mutate(
                  { input, key: submission.current.key },
                  {
                        onSuccess: (result) => {
                              setCreated({ ...result, menuId: result.firstMenu.menuId });
                              setStage("pantry");
                        },
                  },
            );
      };

      if (profile.isPending) return <PlanSkeleton onboarding={onboarding} />;
      if (profile.isError) {
            return (
                  <main className="mx-auto max-w-xl px-6 pt-12">
                        <ErrorState message={profile.error.message} onRetry={() => profile.refetch()} />
                  </main>
            );
      }

      if (stage === "pantry") return <PantrySetup onDone={() => setStage("done")} />;
      if (stage === "done" && created) {
            return (
                  <PlanDone
                        firstName={user?.name.split(" ")[0] ?? ""}
                        plan={created}
                        onEdit={(next) => {
                              setStep(next);
                              setStage("form");
                        }}
                        onContinue={() => setStage("menu")}
                  />
            );
      }
      if (stage === "menu" && created) return <MenuWaiting menuId={created.menuId} onReady={() => navigate("/semana", { replace: true })} onLeave={leave} />;

      const error = complete.error ?? save.error;
      return (
            <main className="min-h-dvh bg-canvas">
                  <PlanForm
                        key={`${stage}-${step}`}
                        initial={created ?? profile.data}
                        initialStep={step}
                        submitLabel={onboarding && !created ? "Crear mi chef" : "Guardar cambios"}
                        submitting={complete.isPending || save.isPending}
                        error={error ? (Object.values("fieldErrors" in error ? (error.fieldErrors as Record<string, string>) : {})[0] ?? error.message) : null}
                        onSubmit={submit}
                        onExit={onboarding && !created ? skip : created ? () => setStage("done") : leave}
                        onSkip={onboarding && !created ? skip : undefined}
                  />
            </main>
      );
}
