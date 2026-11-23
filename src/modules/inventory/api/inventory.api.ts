import { api, body, idempotent, unwrap, type Page } from "@/shared/lib/axios";
import type { IngredientOption, PantryAdd, PantryAnswer, PantryFilters, PantryItem, PantryOverview, PantryPatch, PantrySuggestions } from "../types";

export const inventoryApi = {
      overview: () => api.get<{ data: PantryOverview }>("/me/pantry/overview").then(unwrap),
      list: (filters: PantryFilters, cursor?: string) =>
            api.get<Page<PantryItem>>("/me/pantry", { params: { ...filters, q: filters.q || undefined, cursor, limit: 50 } }).then(body),
      add: (input: PantryAdd) => api.post<{ data: PantryItem }>("/me/pantry/items", input).then(unwrap),
      update: ({ id, patch }: { id: string; patch: PantryPatch }) => api.patch<{ data: PantryItem }>(`/me/pantry/${id}`, patch).then(unwrap),
      remove: ({ id, addToShoppingList }: { id: string; addToShoppingList: boolean }) =>
            api.delete(`/me/pantry/${id}`, { params: { addToShoppingList } }).then(() => undefined),
      searchIngredients: (q: string, signal?: AbortSignal) =>
            api.get<{ data: IngredientOption[] }>("/catalog/ingredients/search", { params: { q, limit: 10 }, signal }).then(unwrap),
      suggestions: () => api.get<{ data: PantrySuggestions }>("/me/pantry/suggestions").then(unwrap),
      saveAnswers: ({ answers, key }: { answers: PantryAnswer[]; key: string }) =>
            api.post("/me/pantry/bulk", { answers, skipped: answers.length === 0 }, idempotent(key)).then(() => undefined),
};
