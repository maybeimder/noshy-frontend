import { api } from "@/shared/lib/axios";
import type { InventoryItem, InventoryItemInput } from "../types";

export const inventoryApi = {
      list: () => api.get<InventoryItem[]>("/inventory/items").then((r) => r.data),
      create: (input: InventoryItemInput) =>
            api.post<InventoryItem>("/inventory/items", input).then((r) => r.data),
      update: (id: string, input: Partial<InventoryItemInput>) =>
            api.patch<InventoryItem>(`/inventory/items/${id}`, input).then((r) => r.data),
      remove: (id: string) => api.delete(`/inventory/items/${id}`).then(() => undefined),
};
