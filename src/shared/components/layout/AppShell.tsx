import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ErrorBoundary from "@/app/ErrorBoundary";
import RouteSkeleton from "@/app/RouteSkeleton";
import BottomNav from "./BottomNav";

// Tab screens: content scrolls above the fixed bottom navigation.
export default function AppShell() {
      const { pathname } = useLocation();
      return (
            <div className="min-h-dvh bg-canvas pb-32">
                  {/* A broken screen keeps the tabs, to leave it. */}
                  <ErrorBoundary resetKey={pathname}>
                        <Suspense fallback={<RouteSkeleton />}>
                              <Outlet />
                        </Suspense>
                  </ErrorBoundary>
                  <BottomNav />
            </div>
      );
}
