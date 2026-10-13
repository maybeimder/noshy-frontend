import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/lib/axios";
import { foodApi } from "../api/food.api";

/** Value that only updates after `delay` ms without changes (search-as-you-type). */
export function useDebounced<T>(value: T, delay = 300) {
      const [debounced, setDebounced] = useState(value);
      useEffect(() => {
            const timer = setTimeout(() => setDebounced(value), delay);
            return () => clearTimeout(timer);
      }, [value, delay]);
      return debounced;
}

const MIN_QUERY = 2; // backend: "Escribe al menos 2 caracteres."

export function useFoodSearch(query: string, limit = 8) {
      const q = useDebounced(query.trim());
      return useQuery({
            queryKey: ["food", "search", q, limit],
            // React Query passes an AbortSignal, so a newer keystroke cancels the older request.
            queryFn: ({ signal }) => foodApi.search(q, limit, signal),
            enabled: q.length >= MIN_QUERY,
            // A 503 means the catalog is not configured or down: retrying only delays the message.
            retry: false,
            staleTime: 5 * 60_000,
            placeholderData: keepPreviousData,
      });
}

export function useFoodProduct(id: string | null) {
      return useQuery({
            queryKey: ["food", "product", id],
            queryFn: () => foodApi.product(id!),
            enabled: id !== null,
            retry: false,
            staleTime: 30 * 60_000,
      });
}

export function useGenerateRecipe() {
      const queryClient = useQueryClient();
      return useMutation({
            mutationFn: foodApi.generate,
            // The result page reads it from cache instead of refetching.
            onSuccess: (recipe) => queryClient.setQueryData(["food", "generated", recipe.id], recipe),
      });
}

export function useGeneratedRecipe(id: string | undefined) {
      return useQuery({
            queryKey: ["food", "generated", id],
            queryFn: () => foodApi.generated(id!),
            enabled: Boolean(id),
      });
}

/** Friendly text for the catalog/AI being down (503) vs. other errors. */
export function foodErrorMessage(error: Error) {
      if (error instanceof ApiError && error.code === "FOOD_CATALOG_UNAVAILABLE")
            return "El catálogo de alimentos no está disponible ahora. Puedes añadirlo escribiéndolo a mano.";
      if (error instanceof ApiError && error.code === "RECIPE_WRITER_UNAVAILABLE")
            return "Noshy no puede generar recetas ahora mismo. Inténtalo en un momento.";
      return error.message;
}
