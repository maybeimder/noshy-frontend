import { Suspense } from "react";
import { BrowserRouter, useLocation, useRoutes } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import Providers from "./providers";
import RouteSkeleton from "./RouteSkeleton";
import ScrollManager from "./ScrollManager";
import { routes } from "./routes";

function AppRoutes() {
      const { pathname } = useLocation();
      const screen = useRoutes(routes);
      return (
            <ErrorBoundary resetKey={pathname}>
                  <Suspense fallback={<RouteSkeleton />}>{screen}</Suspense>
            </ErrorBoundary>
      );
}

export default function App() {
      return (
            <ErrorBoundary>
                  <Providers>
                        <BrowserRouter>
                              <ScrollManager />
                              <AppRoutes />
                        </BrowserRouter>
                  </Providers>
            </ErrorBoundary>
      );
}
