import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import RouteSkeleton from "@/app/RouteSkeleton";
import BottomNav from "./BottomNav";

// Tab screens: content scrolls above the fixed bottom navigation.
export default function AppShell() {
      return (
            <div className="min-h-dvh bg-canvas pb-32">
                  <Suspense fallback={<RouteSkeleton />}>
                        <Outlet />
                  </Suspense>
                  <BottomNav />
            </div>
      );
}
