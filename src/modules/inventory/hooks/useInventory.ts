import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounced } from "@/shared/hooks/useDebounced";
import { inventoryApi } from "../api/inventory.api";
import type { PantryFilters } from "../types";

export const pantryKey = ["pantry"] as const;

export function usePantryOverview() {
      return useQuery({ queryKey: ["pantryOverview"], queryFn: inventoryApi.overview });
}

export function usePantry(filters: PantryFilters) {
      return useInfiniteQuery({
            queryKey: [...pantryKey, filters],
            queryFn: ({ pageParam }) => inventoryApi.list(filters, pageParam),
            initialPageParam: undefined as string | undefined,
            getNextPageParam: (page) => page.meta.nextCursor ?? undefined,
            placeholderData: keepPreviousData,
      });
}

/** What is in the pantry also decides ideas, recipe matches and what is missing. */
export function useInvalidatePantry() {
      const queryClient = useQueryClient();
      return () =>
            Promise.all(
                  [pantryKey, ["pantryOverview"], ["recipe"], ["recommendations"], ["home"], ["shoppingList"]].map((queryKey) =>
                        queryClient.invalidateQueries({ queryKey }),
                  ),
            );
}

export function usePantryMutations() {
      const onSuccess = useInvalidatePantry();
      return {
            add: useMutation({ mutationFn: inventoryApi.add, onSuccess }),
            update: useMutation({ mutationFn: inventoryApi.update, onSuccess }),
            remove: useMutation({ mutationFn: inventoryApi.remove, onSuccess }),
            saveAnswers: useMutation({ mutationFn: inventoryApi.saveAnswers, onSuccess }),
      };
}

const MIN_QUERY = 2; // the backend asks for 2 characters

export function useIngredientSearch(query: string) {
      const q = useDebounced(query.trim());
      return useQuery({
            queryKey: ["ingredients", q],
            // A newer keystroke aborts the older request.
            queryFn: ({ signal }) => inventoryApi.searchIngredients(q, signal),
            enabled: q.length >= MIN_QUERY,
            staleTime: 5 * 60_000,
            placeholderData: keepPreviousData,
      });
}

export function usePantrySuggestions() {
      return useQuery({ queryKey: ["pantrySuggestions"], queryFn: inventoryApi.suggestions, staleTime: Infinity });
}
