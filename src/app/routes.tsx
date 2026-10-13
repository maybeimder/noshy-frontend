import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { GuestOnlyRoute, ProtectedRoute } from "@/modules/auth/components/RouteGuards";
import AppShell from "@/shared/components/layout/AppShell";

const LoginPage = lazy(() => import("@/modules/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/modules/auth/pages/RegisterPage"));
const HomePage = lazy(() => import("@/modules/cooking/pages/HomePage"));
const PlanPage = lazy(() => import("@/modules/plans/pages/PlanPage"));
const PantryPage = lazy(() => import("@/modules/inventory/pages/PantryPage"));
const ChefPage = lazy(() => import("@/modules/chef/pages/ChefPage"));
const RecipesPage = lazy(() => import("@/modules/recipes/pages/RecipesPage"));
const RecipeDetailPage = lazy(() => import("@/modules/recipes/pages/RecipeDetailPage"));
const RecipeEditorPage = lazy(() => import("@/modules/recipes/pages/RecipeEditorPage"));
const CommunityRecipePage = lazy(() => import("@/modules/recipes/pages/CommunityRecipePage"));
const ShoppingListPage = lazy(() => import("@/modules/shopping-list/pages/ShoppingListPage"));
const ProfilePage = lazy(() => import("@/modules/profile/pages/ProfilePage"));
const GenerateRecipePage = lazy(() => import("@/modules/food/pages/GenerateRecipePage"));
const GeneratedRecipePage = lazy(() => import("@/modules/food/pages/GeneratedRecipePage"));

export const routes: RouteObject[] = [
      {
            element: <GuestOnlyRoute />,
            children: [
                  { path: "/login", element: <LoginPage /> },
                  { path: "/registro", element: <RegisterPage /> },
            ],
      },
      {
            element: <ProtectedRoute />,
            children: [
                  // Tabs: bottom navigation visible.
                  {
                        element: <AppShell />,
                        children: [
                              { path: "/", element: <HomePage /> },
                              { path: "/despensa", element: <PantryPage /> },
                              { path: "/chef", element: <ChefPage /> },
                              { path: "/recetas", element: <RecipesPage /> },
                              { path: "/recetas/:id", element: <RecipeDetailPage /> },
                              { path: "/comunidad/:id", element: <CommunityRecipePage /> },
                              { path: "/compras", element: <ShoppingListPage /> },
                              { path: "/perfil", element: <ProfilePage /> },
                        ],
                  },
                  // Focused forms: full screen, no bottom navigation.
                  { path: "/plan/nuevo", element: <PlanPage mode="onboarding" /> },
                  { path: "/plan/editar", element: <PlanPage mode="edit" /> },
                  { path: "/recetas/nueva", element: <RecipeEditorPage /> },
                  { path: "/recetas/:id/editar", element: <RecipeEditorPage /> },
                  { path: "/recetas/generar", element: <GenerateRecipePage /> },
                  { path: "/recetas/generada/:id", element: <GeneratedRecipePage /> },
            ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
];
