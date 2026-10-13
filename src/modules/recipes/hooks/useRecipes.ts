import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recipesApi } from "../api/recipes.api";
import type { RecipeInput } from "../types";

export const recipesKey = ["recipes"] as const;
export const communityKey = ["community"] as const;

export function useMyRecipes() {
      return useQuery({ queryKey: recipesKey, queryFn: recipesApi.list });
}

// There is no GET /recipes/:id, so a single recipe is read from the list.
export function useMyRecipe(id: string | undefined) {
      return useQuery({
            queryKey: recipesKey,
            queryFn: recipesApi.list,
            select: (recipes) => recipes.find((recipe) => recipe.id === id) ?? null,
            enabled: Boolean(id),
      });
}

export function useCommunityRecipes() {
      return useQuery({ queryKey: communityKey, queryFn: recipesApi.community });
}

export function useCommunityRecipe(id: string | undefined) {
      return useQuery({
            queryKey: [...communityKey, id],
            queryFn: () => recipesApi.communityDetail(id!),
            enabled: Boolean(id),
      });
}

export function useAdaptRecipe() {
      return useMutation({ mutationFn: recipesApi.adapt });
}

export function useRecipeMutations() {
      const queryClient = useQueryClient();
      // Publishing changes the community feed too.
      const onSuccess = () =>
            Promise.all([
                  queryClient.invalidateQueries({ queryKey: recipesKey }),
                  queryClient.invalidateQueries({ queryKey: communityKey }),
            ]);

      return {
            create: useMutation({ mutationFn: recipesApi.create, onSuccess }),
            update: useMutation({
                  mutationFn: ({ id, input }: { id: string; input: Partial<RecipeInput> }) =>
                        recipesApi.update(id, input),
                  onSuccess,
            }),
            remove: useMutation({ mutationFn: recipesApi.remove, onSuccess }),
            publish: useMutation({ mutationFn: recipesApi.publish, onSuccess }),
            unpublish: useMutation({ mutationFn: recipesApi.unpublish, onSuccess }),
      };
}
