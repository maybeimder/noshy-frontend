import { useEffect } from "react";
import { keepPreviousData, useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient, type InfiniteData, type QueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useUserValue } from "@/shared/lib/user-store";
import type { Page } from "@/shared/lib/axios";
import type { RecipeCard } from "@/shared/types/api";
import type { RecommendationFilters } from "@/shared/types/api";
import { recipesApi } from "../api/recipes.api";
import type { FeedItem, RecipeDetail } from "../types";

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

const FILLING_REFRESH_MS = 5_000;

export function useRecommendations(filters: RecommendationFilters) {
      return useInfiniteQuery({
            queryKey: ["recommendations", filters],
            queryFn: ({ pageParam }) => recipesApi.recommendations(filters, pageParam),
            ...paged,
            getNextPageParam: nextPage,
            // The backend is still bringing recipes this user can eat: look again until it is done.
            refetchInterval: (query) => (query.state.data?.pages[0]?.meta.library?.status === "filling" ? FILLING_REFRESH_MS : false),
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

type Flags = { liked?: boolean; saved?: boolean; likes?: number };

/** Writes a like or a save into every cached copy of the recipe, so the heart answers at the tap. */
function patchRecipe(queryClient: QueryClient, id: string, flags: Flags) {
      queryClient.setQueriesData<RecipeDetail>({ queryKey: ["recipe", id] }, (old) =>
            old && {
                  ...old,
                  isSaved: flags.saved ?? old.isSaved,
                  viewer: { isLiked: flags.liked ?? old.viewer.isLiked, isSaved: flags.saved ?? old.viewer.isSaved },
            },
      );
      queryClient.setQueriesData<InfiniteData<Page<FeedItem>>>({ queryKey: ["feed"] }, (old) =>
            old && {
                  ...old,
                  pages: old.pages.map((page) => ({
                        ...page,
                        data: page.data.map((item) => {
                              if (item.recipe.id !== id) return item;
                              const liked = flags.liked ?? item.viewer.liked;
                              const likes = flags.likes ?? item.stats.likes + (liked === item.viewer.liked ? 0 : liked ? 1 : -1);
                              return { ...item, viewer: { liked, saved: flags.saved ?? item.viewer.saved }, stats: { ...item.stats, likes } };
                        }),
                  })),
            },
      );
      if (flags.saved !== undefined) {
            queryClient.setQueriesData<InfiniteData<Page<RecipeCard>>>({ queryKey: ["recommendations"] }, (old) =>
                  old && { ...old, pages: old.pages.map((page) => ({ ...page, data: page.data.map((r) => (r.id === id ? { ...r, isSaved: flags.saved! } : r)) })) },
            );
      }
}

/** Optimistic toggle: paint now, undo if the API says no, then settle with the server's numbers. */
/**
 * Recipes the user saved, newest first. The API stores saves but has no endpoint that lists them
 * (proposed: GET /me/saved-recipes), so this device remembers the ids it saved or saw saved.
 */
export function useSavedIds() {
      const { user } = useAuth();
      const [ids, setIds] = useUserValue<string[]>(user?.id ?? "anon", "savedRecipeIds");
      const list = ids ?? [];
      return {
            ids: list,
            mark: (id: string, on: boolean) => {
                  if (on === list.includes(id)) return;
                  setIds(on ? [id, ...list] : list.filter((x) => x !== id));
            },
      };
}

/** Keeps the local list in step with what the API says about one recipe. */
export function useSyncSaved(id: string | undefined, isSaved: boolean | undefined) {
      const { ids, mark } = useSavedIds();
      const known = id ? ids.includes(id) : false;
      useEffect(() => {
            if (id && isSaved !== undefined && isSaved !== known) mark(id, isSaved);
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [id, isSaved, known]);
}

/** The saved recipes themselves, one detail request each (cached with the recipe screens). */
export function useSavedRecipes() {
      const { ids } = useSavedIds();
      const results = useQueries({
            queries: ids.map((id) => ({ queryKey: ["recipe", id, {}], queryFn: () => recipesApi.detail(id), staleTime: 5 * 60_000, retry: false })),
      });
      return {
            pending: results.some((r) => r.isPending),
            // A recipe that no longer exists (404) simply drops out.
            recipes: results.flatMap((r) => (r.data && r.data.viewer.isSaved ? [r.data] : [])),
      };
}

function useToggle<T>(
      mutationFn: (input: { id: string; on: boolean }) => Promise<T>,
      flag: "liked" | "saved",
      settle: (result: T) => Flags,
      onDone?: (id: string, on: boolean) => void,
) {
      const queryClient = useQueryClient();
      const after = useInvalidate("recipe", "feed", "recommendations", "home");
      return useMutation({
            mutationFn,
            onMutate: async ({ id, on }) => {
                  await queryClient.cancelQueries({ queryKey: ["recipe", id] });
                  await queryClient.cancelQueries({ queryKey: ["feed"] });
                  const snapshot = [...queryClient.getQueriesData({ queryKey: ["recipe", id] }), ...queryClient.getQueriesData({ queryKey: ["feed"] }), ...queryClient.getQueriesData({ queryKey: ["recommendations"] })];
                  patchRecipe(queryClient, id, { [flag]: on });
                  return { snapshot };
            },
            onError: (_error, _input, context) => context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data)),
            onSuccess: (result, { id, on }) => {
                  patchRecipe(queryClient, id, settle(result));
                  onDone?.(id, on);
            },
            onSettled: after,
      });
}

export function useRecipeActions() {
      const saved = useSavedIds();
      const afterFollow = useInvalidate("creators", "feed");
      const afterComment = useInvalidate("comments", "feed");
      const afterAdapt = useInvalidate("recipe");
      return {
            save: useToggle(recipesApi.setSaved, "saved", () => ({}), saved.mark),
            like: useToggle(recipesApi.setLiked, "liked", (result) => ({ liked: result.liked, likes: result.likes })),
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
