import { api, ApiError, body, idempotent, newKey, unwrap, type Page } from "@/shared/lib/axios";
import type { Facet, RecipeCard, RecommendationFilters } from "@/shared/types/api";
import type { Comment, CookedRecipe, LibraryMeta, Creator, CreatorProfile, FeedItem, MyRecipe, MyRecipePatch, MyRecipeRow, RecipeDetail, SharedRecipe } from "../types";

export type ReportTarget = { targetType: "recipe" | "comment"; targetId: string };
export type ReportReason = "spam" | "offensive" | "unsafe" | "stolen" | "other";
export type FeedOptions = { q?: string; authorId?: string };
const emptyPage: Page<RecipeCard> = { data: [], meta: { nextCursor: null, limit: 0 } };

export const recipesApi = {
      detail: (id: string, options: { servings?: number; adapted?: boolean } = {}) =>
            api.get<{ data: RecipeDetail }>(`/recipes/${id}`, { params: options }).then(unwrap),
      applyAdaptation: ({ recipeId, proposalId }: { recipeId: string; proposalId: string }) =>
            api.post<{ data: RecipeDetail }>(`/recipes/${recipeId}/adaptations`, { proposalId }).then(unwrap),
      saved: (cursor?: string) =>
            api
                  .get<Page<RecipeCard>>("/me/saved-recipes", { params: { cursor, limit: 24 } })
                  .then(body)
                  .catch((error: unknown) => {
                        // A server from before this list existed.
                        if (error instanceof ApiError && error.status === 404) return emptyPage;
                        throw error;
                  }),
      /** Public: what a shared link shows. */
      shared: (key: string) => api.get<{ data: SharedRecipe }>(`/shared/recipes/${encodeURIComponent(key)}`).then(unwrap),
      setSaved: ({ id, on }: { id: string; on: boolean }) => (on ? api.put(`/me/saved-recipes/${id}`) : api.delete(`/me/saved-recipes/${id}`)).then(() => undefined),
      /** Answers the new state and the public count: { liked, likes }. */
      setLiked: ({ id, on }: { id: string; on: boolean }) =>
            (on ? api.put<{ data: { liked: boolean; likes: number } }>(`/me/liked-recipes/${id}`) : api.delete<{ data: { liked: boolean; likes: number } }>(`/me/liked-recipes/${id}`)).then(unwrap),
      recommendations: ({ usingIngredientIds, ...filters }: RecommendationFilters, cursor?: string) =>
            api
                  .get<Page<RecipeCard, LibraryMeta>>("/me/recommendations", { params: { ...filters, usingIngredientIds: usingIngredientIds?.join(","), cursor, limit: 12 } })
                  .then(body),
      cooked: (filter: string, cursor?: string) =>
            api.get<Page<CookedRecipe, { facets: Facet[] }>>("/me/cooked-recipes", { params: { filter, cursor, limit: 24 } }).then(body),

      // Own recipes
      mine: (cursor?: string) => api.get<Page<MyRecipeRow>>("/me/recipes", { params: { cursor, limit: 50 } }).then(body),
      create: ({ title, key }: { title: string; key: string }) => api.post<{ data: MyRecipe }>("/me/recipes", { title }, idempotent(key)).then(unwrap),
      update: ({ id, patch }: { id: string; patch: MyRecipePatch }) => api.patch<{ data: MyRecipe }>(`/me/recipes/${id}`, patch).then(unwrap),
      publish: (id: string) => api.post<{ data: { status: string } }>(`/me/recipes/${id}/publish`, undefined, idempotent(newKey())).then(unwrap),
      unpublish: (id: string) => api.post(`/me/recipes/${id}/unpublish`).then(() => undefined),
      remove: (id: string) => api.delete(`/me/recipes/${id}`).then(() => undefined),

      // Community
      feed: (filter: string, options: FeedOptions, cursor?: string) =>
            api.get<Page<FeedItem, { filters: Facet[] }>>("/community/feed", { params: { filter, ...options, cursor, limit: 10 } }).then(body),
      creator: (id: string) => api.get<{ data: CreatorProfile }>(`/community/users/${id}`).then(unwrap),
      removeComment: (id: string) => api.delete(`/community/comments/${id}`).then(() => undefined),
      report: (input: ReportTarget & { reason: ReportReason }) => api.post("/community/reports", input).then(() => undefined),
      creators: () => api.get<{ data: Creator[] }>("/community/creators", { params: { limit: 20 } }).then(unwrap),
      setFollowing: ({ id, on }: { id: string; on: boolean }) => (on ? api.put(`/me/following/${id}`) : api.delete(`/me/following/${id}`)).then(() => undefined),
      comments: (id: string, cursor?: string) => api.get<Page<Comment>>(`/community/recipes/${id}/comments`, { params: { cursor, limit: 20 } }).then(body),
      addComment: ({ id, text }: { id: string; text: string }) => api.post<{ data: Comment }>(`/community/recipes/${id}/comments`, { text }).then(unwrap),
};
