import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RecommendationFilters } from "@/shared/types/api";
import { recipesApi } from "../api/recipes.api";

const paged = { initialPageParam: undefined as string | undefined };
const nextPage = (page: { meta: { nextCursor: string | null } }) => page.meta.nextCursor ?? undefined;

export function useRecipe(id: string | undefined, options: { servings?: number; adapted?: boolean } = {}) {
      return useQuery({
            queryKey: ["recipe", id, options],
            queryFn: () => recipesApi.detail(id!, options),
            enabled: Boolean(id),
            placeholderData: (previous) => (previous?.id === id ? previous : undefined),
      });
}

export function useRecommendations(filters: RecommendationFilters) {
      return useInfiniteQuery({
            queryKey: ["recommendations", filters],
            queryFn: ({ pageParam }) => recipesApi.recommendations(filters, pageParam),
            ...paged,
            getNextPageParam: nextPage,
      });
}

export function useCookedRecipes(filter: string) {
      return useInfiniteQuery({
            queryKey: ["cookedRecipes", filter],
            queryFn: ({ pageParam }) => recipesApi.cooked(filter, pageParam),
            ...paged,
            getNextPageParam: nextPage,
            placeholderData: keepPreviousData,
      });
}

export function useMyRecipes() {
      return useInfiniteQuery({ queryKey: ["myRecipes"], queryFn: ({ pageParam }) => recipesApi.mine(pageParam), ...paged, getNextPageParam: nextPage });
}

export function useFeed(filter: string) {
      return useInfiniteQuery({
            queryKey: ["feed", filter],
            queryFn: ({ pageParam }) => recipesApi.feed(filter, pageParam),
            ...paged,
            getNextPageParam: nextPage,
            placeholderData: keepPreviousData,
      });
}

export function useCreators() {
      return useQuery({ queryKey: ["creators"], queryFn: recipesApi.creators });
}

export function useComments(id: string, enabled: boolean) {
      return useInfiniteQuery({
            queryKey: ["comments", id],
            queryFn: ({ pageParam }) => recipesApi.comments(id, pageParam),
            ...paged,
            getNextPageParam: nextPage,
            enabled,
      });
}

function useInvalidate(...keys: string[]) {
      const queryClient = useQueryClient();
      return () => Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
}

export function useRecipeActions() {
      const afterFlag = useInvalidate("recipe", "feed", "recommendations", "home");
      const afterFollow = useInvalidate("creators", "feed");
      const afterComment = useInvalidate("comments", "feed");
      const afterAdapt = useInvalidate("recipe");
      return {
            save: useMutation({ mutationFn: recipesApi.setSaved, onSuccess: afterFlag }),
            like: useMutation({ mutationFn: recipesApi.setLiked, onSuccess: afterFlag }),
            follow: useMutation({ mutationFn: recipesApi.setFollowing, onSuccess: afterFollow }),
            comment: useMutation({ mutationFn: recipesApi.addComment, onSuccess: afterComment }),
            adapt: useMutation({ mutationFn: recipesApi.applyAdaptation, onSuccess: afterAdapt }),
      };
}

export function useMyRecipeMutations() {
      const onSuccess = useInvalidate("myRecipes", "recipe");
      const onPublished = useInvalidate("myRecipes", "recipe", "feed", "profile");
      return {
            create: useMutation({ mutationFn: recipesApi.create, onSuccess }),
            update: useMutation({ mutationFn: recipesApi.update, onSuccess }),
            publish: useMutation({ mutationFn: recipesApi.publish, onSuccess: onPublished }),
      };
}

type Seed = { id: string; title: string; imageUrl: string | null };

/** Title and photo of a recipe if some list already brought them, to show while the detail loads. */
export function useRecipeSeed(id: string | undefined): Seed | null {
      const queryClient = useQueryClient();
      let found: Seed | null = null;
      const visit = (value: unknown, depth: number) => {
            if (found || depth > 6 || typeof value !== "object" || value === null) return;
            const v = value as Partial<Seed>;
            if (v.id === id && typeof v.title === "string" && v.imageUrl !== undefined) {
                  found = v as Seed;
                  return;
            }
            Object.values(value).forEach((child) => visit(child, depth + 1));
      };
      if (id) for (const key of ["home", "recommendations", "feed", "cookedRecipes", "menu"]) queryClient.getQueriesData({ queryKey: [key] }).forEach(([, data]) => visit(data, 0));
      return found;
}
