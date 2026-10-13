import type { Ingredient } from "@/modules/recipes/types";

export type ShoppingListRequest = {
      recipes: {
            /** Own recipe: the backend reads its ingredients. */
            recipeId?: string;
            /** Anything else (community, chef): send title + ingredients inline. */
            title?: string;
            ingredients?: Ingredient[];
            servings: number;
      }[];
};

export type ShoppingListItem = Ingredient & {
      availableQuantity: number;
      missingQuantity: number;
};

export type ShoppingList = {
      recipes: { recipeId?: string; title: string; servings: number }[];
      items: ShoppingListItem[];
      availableItems: Ingredient[];
      missingItems: Ingredient[];
};

/** What the browser keeps, since the backend does not store lists. */
export type SavedShoppingList = {
      list: ShoppingList;
      /** Keys (name::unit) of items already bought. */
      checked: string[];
      createdAt: string;
};
