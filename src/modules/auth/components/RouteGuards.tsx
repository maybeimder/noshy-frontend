import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SplashScreen from "./SplashScreen";

export type RedirectState = { from?: string };

export function ProtectedRoute({ children }: { children: ReactNode }) {
      const { status } = useAuth();
      const location = useLocation();

      if (status === "loading") return <SplashScreen />;
      if (status === "anonymous") {
            const state: RedirectState = {
                  from: location.pathname + location.search,
            };
            return <Navigate to="/login" replace state={state} />;
      }
      return children;
}

// Login and register are pointless once signed in.
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
      const { status } = useAuth();
      const location = useLocation();

      if (status === "loading") return <SplashScreen />;
      if (status === "authenticated") {
            const from = (location.state as RedirectState | null)?.from;
            return <Navigate to={from ?? "/"} replace />;
      }
      return children;
}
