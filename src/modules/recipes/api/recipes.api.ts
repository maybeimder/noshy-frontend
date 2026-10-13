import { api } from "@/shared/lib/axios";
import type { Recipe, RecipeAdaptation, RecipeInput } from "../types";

export const recipesApi = {
      list: () => api.get<Recipe[]>("/recipes").then((r) => r.data),
      create: (input: RecipeInput) => api.post<Recipe>("/recipes", input).then((r) => r.data),
      update: (id: string, input: Partial<RecipeInput>) =>
            api.patch<Recipe>(`/recipes/${id}`, input).then((r) => r.data),
      remove: (id: string) => api.delete(`/recipes/${id}`).then(() => undefined),
      publish: (id: string) => api.post<Recipe>(`/recipes/${id}/publish`).then((r) => r.data),
      unpublish: (id: string) => api.post<Recipe>(`/recipes/${id}/unpublish`).then((r) => r.data),
      /** Only works for the user's own recipes. */
      adapt: (recipeId: string) =>
            api.post<RecipeAdaptation>("/recipes/adapt", { recipeId }).then((r) => r.data),

      community: () => api.get<Recipe[]>("/community/recipes").then((r) => r.data),
      communityDetail: (id: string) =>
            api.get<Recipe>(`/community/recipes/${id}`).then((r) => r.data),
};
