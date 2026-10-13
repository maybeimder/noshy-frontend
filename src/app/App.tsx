import { Suspense } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import SplashScreen from "@/modules/auth/components/SplashScreen";
import Providers from "./providers";
import { routes } from "./routes";

function AppRoutes() {
      return useRoutes(routes);
}

export default function App() {
      return (
            <Providers>
                  <BrowserRouter>
                        <Suspense fallback={<SplashScreen />}>
                              <AppRoutes />
                        </Suspense>
                  </BrowserRouter>
            </Providers>
      );
}
