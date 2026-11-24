import type { Labeled, Money, Quantity, QuantityInput, StoragePlace, Unit } from "@/shared/types/api";

export type PantryItem = {
      id: string;
      ingredientId: string;
      label: string;
      icon: string;
      categoryId: string;
      product: { id: string; brand: string; packLabel: string } | null;
      quantity: Quantity | null;
      /** null: unknown (onboarding answers). */
      remainingPct: number | null;
      storage: StoragePlace | null;
      expiresOn: string | null;
      expiryEstimated: boolean;
      source: "onboarding" | "receipt" | "shoppingList" | "manual";
      addedAt: string;
};

export type PantryOverview = {
      totalItems: number;
      recipesPossible: { count: number; previewImageUrls: string[] };
      useSoon: { itemId: string; label: string; icon: string; expiresOn: string }[];
      storageCounts: Record<"all" | StoragePlace, number>;
};

export type PantryAdd = { ingredientId: string; quantity?: QuantityInput; storage?: StoragePlace };
export type PantryPatch = { remainingPct?: number; storage?: StoragePlace; expiresOn?: string };
export type PantryFilters = { storage?: StoragePlace; q?: string; sort?: "recent" | "expiresOn" | "name" };

/** One hit of GET /catalog/ingredients/search. */
export type IngredientOption = { id: string; label: string; icon: string; /** Product photo, when the catalog has one. */ imageUrl?: string | null; defaultUnit: Unit; allowedUnits: Unit[]; conflicts: Labeled[] };

export type PantrySuggestion = { ingredientId: string; label: string; usedIn: { dishId: string; label: string }[]; packLabel: string | null; estimatedPrice: Money | null };
export type PantrySuggestions = {
      basedOn: { dishId: string; label: string }[];
      groups: { id: string; label: string; items: PantrySuggestion[] }[];
      totalItems: number;
      hiddenByRestrictions: number;
};
export type PantryAnswer = { ingredientId: string; status: "have" | "missing" };
