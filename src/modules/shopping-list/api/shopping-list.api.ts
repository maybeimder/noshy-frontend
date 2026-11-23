import { api, ApiError, idempotent, unwrap } from "@/shared/lib/axios";
import type { Money, QuantityInput } from "@/shared/types/api";
import type { AddResult, CheckoutResult, ItemChange, SharedList, ShoppingList } from "../types";

export type ItemPatch = { checked?: boolean; quantity?: QuantityInput; actualPrice?: Money | null };

export const shoppingListApi = {
      /** null when there is no list this week. */
      current: (sort: "category" | "storeLayout") =>
            api
                  .get<{ data: ShoppingList }>("/me/shopping-lists/current", { params: { sort } })
                  .then(unwrap)
                  .catch((error: unknown) => {
                        if (error instanceof ApiError && error.code === "NO_ACTIVE_LIST") return null;
                        throw error;
                  }),
      patchItem: ({ listId, itemId, patch }: { listId: string; itemId: string; patch: ItemPatch }) =>
            api.patch<{ data: ItemChange }>(`/me/shopping-lists/${listId}/items/${itemId}`, patch).then(unwrap),
      swap: ({ listId, itemId, suggestionId }: { listId: string; itemId: string; suggestionId: string }) =>
            api.post<{ data: ItemChange }>(`/me/shopping-lists/${listId}/items/${itemId}/swap`, { suggestionId }).then(unwrap),
      addItems: (items: { ingredientId: string; quantity?: QuantityInput; sourceRecipeId?: string }[]) =>
            api.post<{ data: AddResult }>("/me/shopping-lists/current/items", { items }).then(unwrap),
      addRecipe: (input: { recipeId: string; servings?: number; adaptationId?: string | null }) =>
            api.post<{ data: AddResult }>("/me/shopping-lists/current/recipes", input).then(unwrap),
      share: (listId: string) => api.post<{ data: { url: string; text: string } }>(`/me/shopping-lists/${listId}/share`).then(unwrap),
      checkout: ({ listId, storeId, carryOverUnchecked, key }: { listId: string; storeId: string; carryOverUnchecked: boolean; key: string }) =>
            api.post<{ data: CheckoutResult }>(`/me/shopping-lists/${listId}/checkout`, { storeId, carryOverUnchecked }, idempotent(key)).then(unwrap),
      shared: (token: string) => api.get<{ data: SharedList }>(`/shared/lists/${encodeURIComponent(token)}`).then(unwrap),
};
