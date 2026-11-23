import type { Facet, Money, Quantity, StoragePlace } from "@/shared/types/api";

export type ShoppingItem = {
      id: string;
      ingredientId: string;
      label: string;
      icon: string;
      categoryId: string;
      storage: StoragePlace;
      quantity: Quantity;
      price: { estimated: Money; actual: Money | null };
      checked: boolean;
      product: { id: string; label: string; brand: string } | null;
      suggestion: { id: string; product: { id: string; label: string; brand: string }; price: Money; reason: string; savings: Money | null } | null;
};
export type ShoppingTotals = { spent: Money; estimated: Money; savings: Money };
export type Progress = { inCart: number; total: number };
export type ShoppingList = {
      id: string;
      weekStart: string;
      recipes: { recipeId: string; title: string; servings: number }[];
      store: { id: string; name: string };
      totals: ShoppingTotals;
      progress: Progress;
      filters: Facet[];
      groups: { id: string; label: string; items: ShoppingItem[] }[];
};
export type ItemChange = { item: ShoppingItem; totals: ShoppingTotals; progress?: Progress };
export type AddResult = { added: number; merged: number; skippedInPantry?: number };
export type CheckoutResult = { spent: Money; pantryAdded: number; carriedOver: number; budget: { weekly: Money; spentThisWeek: Money } };
export type SharedList = {
      weekStart: string;
      progress: Progress;
      groups: { id: string; label: string; items: { label: string; quantity: string; checked: boolean }[] }[];
      estimated: Money;
};
