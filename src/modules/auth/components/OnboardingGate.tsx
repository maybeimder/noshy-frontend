import { Link, Outlet } from "react-router-dom";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import { EmptyState } from "@/shared/components/ui/QueryState";
import { useAuth } from "../hooks/useAuth";

/** Daily screens need a finished onboarding: the API answers 409 ONBOARDING_INCOMPLETE until then. */
export default function OnboardingGate() {
      const { user } = useAuth();
      if (user?.onboardingStatus === "completed") return <Outlet />;
      return (
            <main className="mx-auto max-w-xl px-5 pt-16">
                  <EmptyState
                        icon="chef"
                        title="Primero conozcamos tu cocina"
                        description="Responde unas preguntas cortas y tu chef arma tu menú, tu despensa y tu lista."
                        action={
                              <Link to="/plan/nuevo" className={`${buttonBase} ${buttonVariants.primary} min-h-12 text-sm`}>
                                    Configurar mi chef
                              </Link>
                        }
                  />
            </main>
      );
}
