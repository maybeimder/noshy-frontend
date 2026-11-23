import type { ChefAction } from "@/shared/types/api";

const screens = { pantry: "/despensa", shoppingList: "/compras", myKitchen: "/cocinadas", profile: "/perfil", community: "/recetas?ver=comunidad" } as const;

/** Where a chef action leads. */
export function actionLink(action: ChefAction): string {
      switch (action.type) {
            case "openRecipe":
                  return `/recetas/${action.recipeId}`;
            case "openScreen":
                  return screens[action.screen] ?? "/";
            case "openChef":
                  return action.prompt ? `/chef?mensaje=${encodeURIComponent(action.prompt)}` : "/chef";
            case "openRecommendations": {
                  const { slot, source, usingIngredientIds, maxMinutes } = action.filters;
                  const params = new URLSearchParams({ ver: "explorar" });
                  if (slot) params.set("franja", slot);
                  if (source) params.set("fuente", source);
                  if (usingIngredientIds?.length) params.set("con", usingIngredientIds.join(","));
                  if (maxMinutes) params.set("max", String(maxMinutes));
                  return `/recetas?${params}`;
            }
      }
}
