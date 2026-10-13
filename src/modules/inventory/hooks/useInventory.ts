import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory.api";
import type { InventoryItemInput } from "../types";

export const inventoryKey = ["inventory"] as const;

export function useInventory() {
      return useQuery({ queryKey: inventoryKey, queryFn: inventoryApi.list });
}

// Every pantry change also changes what recipes are missing, so refresh it as a whole.
export function useInventoryMutations() {
      const queryClient = useQueryClient();
      const onSuccess = () => queryClient.invalidateQueries({ queryKey: inventoryKey });

      return {
            create: useMutation({ mutationFn: inventoryApi.create, onSuccess }),
            /** Adds bought items, topping up an existing row (same name + unit) instead of duplicating it. */
            addMany: useMutation({
                  mutationFn: async (items: InventoryItemInput[]) => {
                        const current = await queryClient.fetchQuery({ queryKey: inventoryKey, queryFn: inventoryApi.list });
                        const key = (i: InventoryItemInput) => `${i.name.trim().toLowerCase()}::${i.unit.trim().toLowerCase()}`;
                        return Promise.all(
                              items.map((item) => {
                                    const existing = current.find((row) => key(row) === key(item));
                                    return existing
                                          ? inventoryApi.update(existing.id, { quantity: existing.quantity + item.quantity })
                                          : inventoryApi.create(item);
                              }),
                        );
                  },
                  onSuccess,
            }),
            update: useMutation({
                  mutationFn: ({ id, input }: { id: string; input: Partial<InventoryItemInput> }) =>
                        inventoryApi.update(id, input),
                  onSuccess,
            }),
            remove: useMutation({ mutationFn: inventoryApi.remove, onSuccess }),
      };
}
