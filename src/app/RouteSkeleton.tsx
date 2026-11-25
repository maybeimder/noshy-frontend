import { useLocation } from "react-router-dom";
import SplashScreen from "@/modules/auth/components/SplashScreen";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import ChefSkeleton from "@/modules/chef/components/ChefSkeleton";
import CookSkeleton from "@/modules/cook/components/CookSkeleton";
import { HomeHeaderSkeleton } from "@/modules/cooking/components/HomeHeader";
import HomeSkeleton from "@/modules/cooking/components/HomeSkeleton";
import KitchenHeader from "@/modules/inventory/components/KitchenHeader";
import PantrySkeleton from "@/modules/inventory/components/PantrySkeleton";
import WeekSkeleton from "@/modules/menus/components/WeekSkeleton";
import PlanSkeleton from "@/modules/plans/components/PlanSkeleton";
import ProfileHeader from "@/modules/profile/components/ProfileHeader";
import ProfileSkeleton from "@/modules/profile/components/ProfileSkeleton";
import ReceiptSkeleton from "@/modules/receipts/components/ReceiptSkeleton";
import { CookedSkeleton, CreatorSkeleton, EditorSkeleton, FeedSkeleton, GridSkeleton, MineSkeleton, RecipeDetailSkeleton } from "@/modules/recipes/components/RecipeSkeletons";
import SettingsSkeleton from "@/modules/settings/components/SettingsSkeleton";
import ShoppingSkeleton, { SharedListSkeleton } from "@/modules/shopping-list/components/ShoppingSkeleton";
import PageHeader from "@/shared/components/layout/PageHeader";
import CommunityHeader from "@/modules/recipes/components/CommunityHeader";
import RecipesHeader from "@/modules/recipes/components/RecipesHeader";
import ChefHeader from "@/modules/chef/components/ChefHeader";
import Logo from "@/shared/components/ui/Logo";
import { Sk, SkMain, times } from "@/shared/components/ui/Skeleton";

const round = (n: number) => times(n).map((i) => <Sk key={i} className="size-12 rounded-full" />);

/**
 * While the code of a screen downloads: the same header and skeleton that screen shows while its data
 * arrives, so nothing moves from one to the other.
 */
export default function RouteSkeleton() {
      const { pathname, search } = useLocation();
      const { status } = useAuth();
      // Public: comes before the session check.
      if (pathname.startsWith("/l/"))
            return (
                  <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-5 bg-canvas px-5 py-8">
                        <Logo />
                        <h1 className="text-page font-extrabold text-ink">Lista de compras</h1>
                        <SharedListSkeleton />
                  </main>
            );
      if (pathname.startsWith("/r/"))
            return (
                  <SkMain className="mx-auto flex min-h-dvh max-w-xl flex-col gap-5 bg-canvas px-5 py-6">
                        <Sk className="h-72 rounded-[2rem]" />
                        <Sk className="h-20 rounded-card" />
                        <Sk className="h-48 rounded-card" />
                  </SkMain>
            );
      if (status === "anonymous") return <SplashScreen />;

      if (pathname === "/")
            return (
                  <>
                        <HomeHeaderSkeleton />
                        <HomeSkeleton />
                  </>
            );
      if (pathname.startsWith("/despensa"))
            return (
                  <>
                        <KitchenHeader section="pantry" meta={null} actions={round(1)} />
                        <PantrySkeleton />
                  </>
            );
      if (pathname.startsWith("/compras"))
            return (
                  <>
                        <KitchenHeader section="pantry" pantryTab="shopping" meta={null} actions={round(2)} />
                        <ShoppingSkeleton />
                  </>
            );
      if (pathname.startsWith("/semana"))
            return (
                  <>
                        <KitchenHeader section="week" meta={null} />
                        <WeekSkeleton />
                  </>
            );
      if (pathname.startsWith("/cocinadas"))
            return (
                  <>
                        <KitchenHeader section="cooked" meta={null} actions={round(1)} />
                        <CookedSkeleton />
                  </>
            );
      if (pathname.startsWith("/chef"))
            return (
                  <>
                        <ChefHeader />
                        <ChefSkeleton />
                  </>
            );
      if (pathname.startsWith("/perfil"))
            return (
                  <>
                        <ProfileHeader />
                        <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-5">
                              <ProfileSkeleton />
                        </main>
                  </>
            );
      if (pathname.startsWith("/ajustes"))
            return (
                  <>
                        <PageHeader title="Ajustes" icon="gear" backTo="/perfil" />
                        <SettingsSkeleton />
                  </>
            );
      if (pathname.startsWith("/historial"))
            return (
                  <>
                        <PageHeader title="Tu historial" icon="calendar" backTo="/perfil" />
                        <SkMain className="mx-auto flex max-w-xl flex-col gap-2 px-5 pt-3">
                              {times(7).map((i) => (
                                    <Sk key={i} className="h-20 rounded-card" />
                              ))}
                        </SkMain>
                  </>
            );
      if (pathname.startsWith("/creador"))
            return (
                  <>
                        <PageHeader title="Creador" icon="community" backTo="/recetas?ver=comunidad" />
                        <CreatorSkeleton />
                  </>
            );
      if (pathname.startsWith("/facturas"))
            return (
                  <>
                        <PageHeader title="Tu factura" icon="receipt" backTo="/despensa" />
                        <SkMain className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                              <ReceiptSkeleton />
                        </SkMain>
                  </>
            );
      if (pathname.startsWith("/cocinar")) return <CookSkeleton />;
      if (pathname.startsWith("/plan")) return <PlanSkeleton onboarding={pathname === "/plan/nuevo"} />;
      if (pathname === "/recetas/nueva" || pathname.endsWith("/editar"))
            return (
                  <div className="min-h-dvh bg-canvas">
                        <PageHeader title={pathname.endsWith("/editar") ? "Editar receta" : "Nueva receta"} scribble="pink" decoration="star" backTo="/recetas" />
                        <EditorSkeleton />
                  </div>
            );
      if (pathname === "/recetas") {
            const tab = new URLSearchParams(search).get("ver");
            if (tab === "comunidad")
                  return (
                        <>
                              <CommunityHeader />
                              <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                                    <FeedSkeleton />
                              </main>
                        </>
                  );
            return (
                  <>
                        <RecipesHeader book={tab !== "explorar"} />
                        <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                              {tab === "explorar" ? (
                                    <div className="flex flex-col gap-4">
                                          <Sk className="h-16 rounded-full" />
                                          <Sk className="h-12 rounded-full" />
                                          <Sk className="my-1 h-11 w-64 rounded-full" />
                                          <Sk className="my-1 h-11 w-64 rounded-full" />
                                          <GridSkeleton name="explore" />
                                    </div>
                              ) : (
                                    <MineSkeleton />
                              )}
                        </main>
                  </>
            );
      }
      if (pathname.startsWith("/recetas/")) return <RecipeDetailSkeleton id={pathname.split("/")[2]} />;
      return <SplashScreen />;
}
