import { lazy, type ReactElement } from "react";

const HomePage = lazy(() => import("@/modules/cooking/pages/HomePage"));
const LoginPage = lazy(() => import("@/modules/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/modules/auth/pages/RegisterPage"));

/** guest: only signed-out users · private: requires a session · public: everyone. */
export type RouteAccess = "public" | "guest" | "private";

export const routes: { path: string; element: ReactElement; access: RouteAccess }[] = [
      { path: "/login", element: <LoginPage />, access: "guest" },
      { path: "/registro", element: <RegisterPage />, access: "guest" },
      { path: "/", element: <HomePage />, access: "private" },
];
