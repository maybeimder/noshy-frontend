import { Suspense } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import Providers from "./providers";
import RouteSkeleton from "./RouteSkeleton";
import { routes } from "./routes";

function AppRoutes() {
      return useRoutes(routes);
}

export default function App() {
      return (
            <Providers>
                  <BrowserRouter>
                        <Suspense fallback={<RouteSkeleton />}>
                              <AppRoutes />
                        </Suspense>
                  </BrowserRouter>
            </Providers>
      );
}
