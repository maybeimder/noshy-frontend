import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInvalidatePantry } from "@/modules/inventory/hooks/useInventory";
import { shoppingListApi } from "../api/shopping-list.api";
import type { ItemChange, ShoppingItem, ShoppingList } from "../types";

export const shoppingKey = ["shoppingList"] as const;

export function useShoppingList(sort: "category" | "storeLayout" = "category") {
      return useQuery({ queryKey: [...shoppingKey, sort], queryFn: () => shoppingListApi.current(sort), placeholderData: keepPreviousData });
}

const mapItem = (list: ShoppingList, id: string, change: (item: ShoppingItem) => ShoppingItem): ShoppingList => ({
      ...list,
      groups: list.groups.map((g) => ({ ...g, items: g.items.map((i) => (i.id === id ? change(i) : i)) })),
});

export function useShoppingMutations() {
      const queryClient = useQueryClient();
      const invalidatePantry = useInvalidatePantry();
      const invalidate = () => queryClient.invalidateQueries({ queryKey: shoppingKey });
      const setLists = (change: (list: ShoppingList) => ShoppingList) =>
            queryClient.setQueriesData<ShoppingList | null>({ queryKey: shoppingKey }, (list) => (list ? change(list) : list));
      const writeBack = ({ item, totals, progress }: ItemChange) =>
            setLists((list) => ({ ...mapItem(list, item.id, () => item), totals, progress: progress ?? list.progress }));

      return {
            patch: useMutation({
                  mutationFn: shoppingListApi.patchItem,
                  onSuccess: writeBack,
                  onError: () => void invalidate(),
            }),
            swap: useMutation({ mutationFn: shoppingListApi.swap, onSuccess: writeBack, onError: () => void invalidate() }),
            addItems: useMutation({ mutationFn: shoppingListApi.addItems, onSuccess: () => Promise.all([invalidate(), queryClient.invalidateQueries({ queryKey: ["recipe"] })]) }),
            addRecipe: useMutation({ mutationFn: shoppingListApi.addRecipe, onSuccess: () => Promise.all([invalidate(), queryClient.invalidateQueries({ queryKey: ["recipe"] })]) }),
            removeItem: useMutation({ mutationFn: shoppingListApi.removeItem, onSuccess: () => Promise.all([invalidate(), queryClient.invalidateQueries({ queryKey: ["recipe"] })]) }),
            removeRecipe: useMutation({ mutationFn: shoppingListApi.removeRecipe, onSuccess: () => Promise.all([invalidate(), queryClient.invalidateQueries({ queryKey: ["recipe"] })]) }),
            share: useMutation({ mutationFn: shoppingListApi.share }),
            checkout: useMutation({ mutationFn: shoppingListApi.checkout, onSuccess: () => invalidatePantry() }),
      };
}
