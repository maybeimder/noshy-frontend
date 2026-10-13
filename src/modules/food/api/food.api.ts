import { api } from "@/shared/lib/axios";
import type { FoodProduct, FoodSearchItem, GeneratedRecipe, RecipeGenerationInput } from "../types";

// All /food routes need a session. Without MONGO_URL (catalog) or the AI writer they answer 503.
export const foodApi = {
      search: (q: string, limit = 10, signal?: AbortSignal) =>
            api.get<FoodSearchItem[]>("/food/products", { params: { q, limit }, signal }).then((r) => r.data),
      product: (id: string) => api.get<FoodProduct>(`/food/products/${encodeURIComponent(id)}`).then((r) => r.data),
      generate: (input: RecipeGenerationInput) => api.post<GeneratedRecipe>("/food/recipes/generate", input).then((r) => r.data),
      generated: (id: string) => api.get<GeneratedRecipe>(`/food/recipes/${encodeURIComponent(id)}`).then((r) => r.data),
};
