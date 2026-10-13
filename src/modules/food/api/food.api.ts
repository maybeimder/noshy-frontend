import { api } from "@/shared/lib/axios";
import type {
      FoodProduct,
      FoodSearchItem,
      GeneratedRecipe,
      LibraryBrowseFilters,
      LibraryBrowsePage,
      LibraryRecipe,
      RecipeGenerationInput,
} from "../types";

// All /food routes need a session. Without MONGO_URL (catalog) or the AI writer they answer 503.
export const foodApi = {
      search: (q: string, limit = 10, signal?: AbortSignal) =>
            api.get<FoodSearchItem[]>("/food/products", { params: { q, limit }, signal }).then((r) => r.data),
      product: (id: string) => api.get<FoodProduct>(`/food/products/${encodeURIComponent(id)}`).then((r) => r.data),
      // Both answers wrap the recipe: generate → { recipe, references, recipeInput },
      // GET /food/recipes/:id → { recipe, referenceRecipeIds, generatedAt }.
      generate: (input: RecipeGenerationInput) =>
            api.post<{ recipe: GeneratedRecipe }>("/food/recipes/generate", input).then((r) => r.data.recipe),
      generated: (id: string) =>
            api.get<{ recipe: GeneratedRecipe }>(`/food/recipes/${encodeURIComponent(id)}`).then((r) => r.data.recipe),
      /** First page uses the filters; later pages only send the cursor (it remembers the order). */
      browseLibrary: (filters: LibraryBrowseFilters, cursor?: string, limit = 20) =>
            api
                  .get<LibraryBrowsePage>("/food/library/browse", { params: cursor ? { cursor, limit } : { ...filters, limit } })
                  .then((r) => r.data),
      libraryRecipe: (id: string) => api.get<LibraryRecipe>(`/food/library/recipes/${encodeURIComponent(id)}`).then((r) => r.data),
};
