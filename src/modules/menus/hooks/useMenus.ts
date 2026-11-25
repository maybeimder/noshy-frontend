import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { menusApi } from "../api/menus.api";

export function useWeekMenu() {
      return useQuery({
            queryKey: ["menu", "week"],
            queryFn: menusApi.current,
            refetchInterval: ({ state }) => (state.data?.status === "generating" ? 2000 : false),
      });
}

/** Polls until the menu is ready or failed. */
export function useMenu(id: string) {
      return useQuery({
            queryKey: ["menu", id],
            queryFn: () => menusApi.get(id),
            refetchInterval: ({ state }) => (state.data && state.data.status !== "generating" ? false : 1500),
      });
}

export function useMenuMutations() {
      const queryClient = useQueryClient();
      const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["menu"] }), queryClient.invalidateQueries({ queryKey: ["shoppingList"] })]);
      return {
            retry: useMutation({ mutationFn: menusApi.retry, onSuccess: refresh }),
            regenerate: useMutation({ mutationFn: menusApi.regenerate, onSuccess: refresh }),
            add: useMutation({ mutationFn: menusApi.addEntry, onSuccess: refresh }),
            patch: useMutation({ mutationFn: menusApi.patchEntry, onSuccess: refresh }),
            remove: useMutation({ mutationFn: menusApi.removeEntry, onSuccess: refresh }),
            toList: useMutation({ mutationFn: menusApi.toShoppingList, onSuccess: refresh }),
      };
}
