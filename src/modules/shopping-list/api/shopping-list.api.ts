import { api } from "@/shared/lib/axios";
import type { ShoppingList, ShoppingListRequest } from "../types";

export const shoppingListApi = {
      create: (request: ShoppingListRequest) =>
            api.post<ShoppingList>("/shopping-list", request).then((r) => r.data),
};
