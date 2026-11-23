import { api, body, idempotent, newKey, unwrap, type Page } from "@/shared/lib/axios";
import type { Facet, RecipeCard, RecommendationFilters } from "@/shared/types/api";
import type { Comment, CookedRecipe, Creator, FeedItem, MyRecipe, MyRecipePatch, MyRecipeRow, RecipeDetail } from "../types";

export const recipesApi = {
      detail: (id: string, options: { servings?: number; adapted?: boolean } = {}) =>
            api.get<{ data: RecipeDetail }>(`/recipes/${id}`, { params: options }).then(unwrap),
      applyAdaptation: ({ recipeId, proposalId }: { recipeId: string; proposalId: string }) =>
            api.post<{ data: RecipeDetail }>(`/recipes/${recipeId}/adaptations`, { proposalId }).then(unwrap),
      setSaved: ({ id, on }: { id: string; on: boolean }) => (on ? api.put(`/me/saved-recipes/${id}`) : api.delete(`/me/saved-recipes/${id}`)).then(() => undefined),
      setLiked: ({ id, on }: { id: string; on: boolean }) => (on ? api.put(`/me/liked-recipes/${id}`) : api.delete(`/me/liked-recipes/${id}`)).then(() => undefined),
      recommendations: ({ usingIngredientIds, ...filters }: RecommendationFilters, cursor?: string) =>
            api
                  .get<Page<RecipeCard>>("/me/recommendations", { params: { ...filters, usingIngredientIds: usingIngredientIds?.join(","), cursor, limit: 12 } })
                  .then(body),
      cooked: (filter: string, cursor?: string) =>
            api.get<Page<CookedRecipe, { facets: Facet[] }>>("/me/cooked-recipes", { params: { filter, cursor, limit: 24 } }).then(body),

      // Own recipes
      mine: (cursor?: string) => api.get<Page<MyRecipeRow>>("/me/recipes", { params: { cursor, limit: 50 } }).then(body),
      create: ({ title, key }: { title: string; key: string }) => api.post<{ data: MyRecipe }>("/me/recipes", { title }, idempotent(key)).then(unwrap),
      update: ({ id, patch }: { id: string; patch: MyRecipePatch }) => api.patch<{ data: MyRecipe }>(`/me/recipes/${id}`, patch).then(unwrap),
      publish: (id: string) => api.post<{ data: { status: string } }>(`/me/recipes/${id}/publish`, undefined, idempotent(newKey())).then(unwrap),

      // Community
      feed: (filter: string, cursor?: string) =>
            api.get<Page<FeedItem, { filters: Facet[] }>>("/community/feed", { params: { filter, cursor, limit: 10 } }).then(body),
      creators: () => api.get<{ data: Creator[] }>("/community/creators", { params: { limit: 20 } }).then(unwrap),
      setFollowing: ({ id, on }: { id: string; on: boolean }) => (on ? api.put(`/me/following/${id}`) : api.delete(`/me/following/${id}`)).then(() => undefined),
      comments: (id: string, cursor?: string) => api.get<Page<Comment>>(`/community/recipes/${id}/comments`, { params: { cursor, limit: 20 } }).then(body),
      addComment: ({ id, text }: { id: string; text: string }) => api.post<{ data: Comment }>(`/community/recipes/${id}/comments`, { text }).then(unwrap),
};
