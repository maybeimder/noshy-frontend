import { lazy } from "react";
import { Navigate, useParams, type RouteObject } from "react-router-dom";
import OnboardingGate from "@/modules/auth/components/OnboardingGate";
import { GuestOnlyRoute, ProtectedRoute } from "@/modules/auth/components/RouteGuards";
import AppShell from "@/shared/components/layout/AppShell";

const WelcomePage = lazy(() => import("@/modules/auth/pages/WelcomePage"));
const LoginPage = lazy(() => import("@/modules/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/modules/auth/pages/RegisterPage"));
const HomePage = lazy(() => import("@/modules/cooking/pages/HomePage"));
const PlanPage = lazy(() => import("@/modules/plans/pages/PlanPage"));
const PantryPage = lazy(() => import("@/modules/inventory/pages/PantryPage"));
const ShoppingListPage = lazy(() => import("@/modules/shopping-list/pages/ShoppingListPage"));
const SharedListPage = lazy(() => import("@/modules/shopping-list/pages/SharedListPage"));
const WeekPage = lazy(() => import("@/modules/menus/pages/WeekPage"));
const ReceiptPage = lazy(() => import("@/modules/receipts/pages/ReceiptPage"));
const ChefPage = lazy(() => import("@/modules/chef/pages/ChefPage"));
const RecipesPage = lazy(() => import("@/modules/recipes/pages/RecipesPage"));
const CookedPage = lazy(() => import("@/modules/recipes/pages/CookedPage"));
const RecipeDetailPage = lazy(() => import("@/modules/recipes/pages/RecipeDetailPage"));
const SharedRecipePage = lazy(() => import("@/modules/recipes/pages/SharedRecipePage"));
const CreatorPage = lazy(() => import("@/modules/recipes/pages/CreatorPage"));
const HistoryPage = lazy(() => import("@/modules/cooking/pages/HistoryPage"));
const RecipeEditorPage = lazy(() => import("@/modules/recipes/pages/RecipeEditorPage"));
const CookPage = lazy(() => import("@/modules/cook/pages/CookPage"));
const ProfilePage = lazy(() => import("@/modules/profile/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/modules/settings/pages/SettingsPage"));

/** Old links to community recipes: every recipe now lives in /recetas. */
function ToRecipe() {
      const { id } = useParams();
      return <Navigate to={`/recetas/${id}`} replace />;
}

export const routes: RouteObject[] = [
      {
            element: <GuestOnlyRoute />,
            children: [
                  { path: "/bienvenida", element: <WelcomePage /> },
                  { path: "/login", element: <LoginPage /> },
                  { path: "/registro", element: <RegisterPage /> },
            ],
      },
      // Shared shopping list: public.
      { path: "/l/:token", element: <SharedListPage /> },
      // Shared recipe: public.
      { path: "/r/:key", element: <SharedRecipePage /> },
      {
            element: <ProtectedRoute />,
            children: [
                  // Tabs: bottom navigation visible.
                  {
                        element: <AppShell />,
                        children: [
                              // These three work before onboarding.
                              { path: "/", element: <HomePage /> },
                              { path: "/perfil", element: <ProfilePage /> },
                              { path: "/ajustes", element: <SettingsPage /> },
                              {
                                    element: <OnboardingGate />,
                                    children: [
                                          { path: "/despensa", element: <PantryPage /> },
                                          { path: "/compras", element: <ShoppingListPage /> },
                                          { path: "/semana", element: <WeekPage /> },
                                          { path: "/cocinadas", element: <CookedPage /> },
                                          { path: "/facturas/:id", element: <ReceiptPage /> },
                                          { path: "/chef", element: <ChefPage /> },
                                          { path: "/recetas", element: <RecipesPage /> },
                                          { path: "/comunidad/:id", element: <ToRecipe /> },
                                          { path: "/creador/:id", element: <CreatorPage /> },
                                          { path: "/historial", element: <HistoryPage /> },
                                    ],
                              },
                        ],
                  },
                  // Focused forms: full screen, no bottom navigation.
                  { path: "/plan/nuevo", element: <PlanPage mode="onboarding" /> },
                  {
                        element: <OnboardingGate />,
                        children: [
                              { path: "/plan/editar", element: <PlanPage mode="edit" /> },
                              { path: "/recetas/nueva", element: <RecipeEditorPage /> },
                              { path: "/recetas/:id/editar", element: <RecipeEditorPage /> },
                              // Full-bleed photo and its own action bar: no bottom navigation.
                              { path: "/recetas/:id", element: <RecipeDetailPage /> },
                              { path: "/cocinar/:id", element: <CookPage /> },
                        ],
                  },
            ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
];
