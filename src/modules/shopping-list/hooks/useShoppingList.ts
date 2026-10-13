import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { Ingredient } from "@/modules/recipes/types";
import { readUserValue, useUserValue } from "@/shared/lib/user-store";
import { shoppingListApi } from "../api/shopping-list.api";
import type { SavedShoppingList, ShoppingList } from "../types";

const NAME = "shoppingList";

export const itemKey = (item: Ingredient) => `${item.name.trim().toLowerCase()}::${item.unit.trim().toLowerCase()}`;

/** The current list, kept in this browser per user (the backend does not store lists). */
export function useSavedShoppingList() {
      const { user } = useAuth();
      const userId = user?.id ?? "anonymous";
      const [saved, setSaved] = useUserValue<SavedShoppingList>(userId, NAME);
      const latest = () => readUserValue<SavedShoppingList>(userId, NAME);

      const save = useCallback(
            (list: ShoppingList) => setSaved({ list, checked: [], createdAt: new Date().toISOString() }),
            [setSaved],
      );
      const toggle = (key: string) => {
            const current = latest();
            if (!current) return;
            const checked = current.checked.includes(key)
                  ? current.checked.filter((k) => k !== key)
                  : [...current.checked, key];
            setSaved({ ...current, checked });
      };
      /** Drops items once they are in the pantry; an empty list is discarded. */
      const removeItems = (keys: string[]) => {
            const current = latest();
            if (!current) return;
            const keep = (item: Ingredient) => !keys.includes(itemKey(item));
            const list = {
                  ...current.list,
                  items: current.list.items.filter(keep),
                  missingItems: current.list.missingItems.filter(keep),
            };
            setSaved(list.missingItems.length ? { ...current, list, checked: [] } : null);
      };
      const clear = () => setSaved(null);

      return { saved, save, toggle, removeItems, clear };
}

/** Builds a list on the server and keeps it as the current one. */
export function useCreateShoppingList() {
      const { save } = useSavedShoppingList();
      return useMutation({ mutationFn: shoppingListApi.create, onSuccess: save });
}
