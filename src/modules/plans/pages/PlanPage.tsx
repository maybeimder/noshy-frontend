import { useNavigate } from "react-router-dom";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
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

      return (
            <div className="min-h-dvh bg-canvas pb-12">
                  <PageHeader
                        title={onboarding ? "Tu plan nutricional" : "Editar plan"}
                        subtitle={onboarding ? "Paso 1 de 1 · Lo puedes cambiar luego" : undefined}
                        backTo={onboarding ? undefined : "/perfil"}
                  />
                  <main className="mx-auto max-w-xl px-6 pt-6">
                        {onboarding && (
                              <p className="mb-8 text-base text-ink-muted">
                                    Cuéntanos qué buscas y tu chef adaptará cada receta a tus metas y restricciones.
                              </p>
                        )}
                        {plan.isPending ? (
                              <LoadingState />
                        ) : plan.isError ? (
                              <ErrorState message={plan.error.message} onRetry={() => plan.refetch()} />
                        ) : (
                              <PlanForm
                                    initial={plan.data}
                                    submitLabel={onboarding ? "Guardar y empezar" : "Guardar cambios"}
                                    submitting={save.isPending}
                                    error={save.error?.message}
                                    onSubmit={(input) =>
                                          save.mutate(input, {
                                                onSuccess: () => navigate(onboarding ? "/" : "/perfil", { replace: true }),
                                          })
                                    }
                                    secondaryAction={
                                          onboarding && (
                                                <Button variant="tertiary" fullWidth onClick={() => navigate("/", { replace: true })}>
                                                      Lo haré más tarde
                                                </Button>
                                          )
                                    }
                              />
                        )}
                  </main>
            </div>
      );
}
