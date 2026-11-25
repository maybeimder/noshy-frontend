import { api, ApiError, unwrap } from "@/shared/lib/axios";
import type { MealSlotId, RecipeCard } from "@/shared/types/api";

export type MenuEntry = { id: string; date: string; slot: MealSlotId; servings: number; recipe: RecipeCard | null };
export type Menu = {
      id: string;
      status: "generating" | "ready" | "failed";
      progress: { stage: "restrictions" | "dishes" | "shoppingList"; percent: number } | null;
      entries: MenuEntry[];
};
export type WeekMenu = Menu & { days: { date: string; entries: MenuEntry[] }[]; otherEntries?: MenuEntry[] };

export const menusApi = {
      /** null when the user has no menu yet. */
      current: () =>
            api
                  .get<{ data: WeekMenu }>("/me/menus/current")
                  .then(unwrap)
                  .catch((error: unknown) => {
                        if (error instanceof ApiError && error.status === 404) return null;
                        throw error;
                  }),
      get: (id: string) => api.get<{ data: Menu }>(`/me/menus/${id}`).then(unwrap),
      retry: (id: string) => api.post<{ data: Menu }>(`/me/menus/${id}/retry`).then(unwrap),
      /** Other recipes from today on. */
      regenerate: (id: string) => api.post<{ data: Menu }>(`/me/menus/${id}/regenerate`).then(unwrap),
      addEntry: ({ menuId, ...input }: { menuId: string; date: string; slot: MealSlotId; recipeId: string; servings?: number }) =>
            api.post<{ data: Menu }>(`/me/menus/${menuId}/entries`, input).then(unwrap),
      patchEntry: ({ menuId, entryId, patch }: { menuId: string; entryId: string; patch: { date?: string; slot?: MealSlotId; servings?: number } }) =>
            api.patch<{ data: Menu }>(`/me/menus/${menuId}/entries/${entryId}`, patch).then(unwrap),
      removeEntry: ({ menuId, entryId }: { menuId: string; entryId: string }) => api.delete(`/me/menus/${menuId}/entries/${entryId}`).then(() => undefined),
      toShoppingList: (menuId: string) =>
            api.post<{ data: { added: number; merged: number; skippedInPantry: number; recipes: number } }>(`/me/menus/${menuId}/shopping-list`).then(unwrap),
};
