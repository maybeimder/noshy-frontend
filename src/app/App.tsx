import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GuestOnlyRoute, ProtectedRoute } from "@/modules/auth/components/RouteGuards";
import SplashScreen from "@/modules/auth/components/SplashScreen";
import Providers from "./providers";
import { routes, type RouteAccess } from "./routes";

const guard = (access: RouteAccess, element: React.ReactElement) => {
      if (access === "private") return <ProtectedRoute>{element}</ProtectedRoute>;
      if (access === "guest") return <GuestOnlyRoute>{element}</GuestOnlyRoute>;
      return element;
};

export default function App() {
      return (
            <Providers>
                  <BrowserRouter>
                        <Suspense fallback={<SplashScreen />}>
                              <Routes>
                                    {routes.map(({ path, element, access }) => (
                                          <Route
                                                key={path}
                                                path={path}
                                                element={guard(access, element)}
                                          />
                                    ))}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                              </Routes>
                        </Suspense>
                  </BrowserRouter>
            </Providers>
      );
}
