// Shapes of the Noshy API (contract v0.3), checked against backend/src.

export type Unit = "g" | "kg" | "ml" | "l" | "unit" | "clove" | "tbsp" | "tsp" | "cup" | "pinch" | "toTaste" | "all";
/** `display` comes ready to show («2 dientes»); `value` is only for editing. */
export type Quantity = { value: number | null; unit: Unit; display: string };
export type QuantityInput = { value: number; unit: Unit };
export type Money = { amount: number; currency: "COP" };
export type Macros = { kcal: number; proteinG: number; carbsG: number; fatG: number };
export type Labeled<Id extends string = string> = { id: Id; label: string };
export type Facet = { id: string; label: string; count?: number };
export type MealSlotId = "breakfast" | "snack1" | "lunch" | "snack2" | "dinner";
export type StoragePlace = "fridge" | "pantry" | "freezer";

export type RecommendationFilters = { slot?: MealSlotId; source?: "forYou" | "pantry" | "library"; usingIngredientIds?: string[]; maxMinutes?: number; /** Words of the title. */ q?: string };

export type ChefAction =
      | { type: "openChef"; threadId?: string; prompt?: string }
      | { type: "openRecipe"; recipeId: string }
      | { type: "openRecommendations"; filters: RecommendationFilters }
      | { type: "openScreen"; screen: "pantry" | "shoppingList" | "myKitchen" | "profile" | "community" };

export type RecipeCard = {
      id: string;
      title: string;
      imageUrl: string | null;
      cuisine: Labeled | null;
      tags: string[];
      totalTimeMinutes: { min: number; max: number };
      nutritionPerServing: Macros;
      pantryMatch: { have: number; total: number };
      isAdapted: boolean;
      isSaved: boolean;
      /** Library recipe (in English): its macros are estimated, not added up from the catalog. */
      nutritionEstimated?: boolean;
      /** The photo shows a similar dish, not this recipe. */
      imageIsReference?: boolean;
      reason?: { kind: "pantry" | "forYou" | "expiring"; label: string };
};

export type MealSlot = {
      slot: MealSlotId;
      label: string;
      status: "logged" | "current" | "pending" | "skipped";
      kcal: number | null;
      window: { from: string; to: string };
};
export type MealEntry = { id: string; slot: MealSlotId; label: string; recipeId: string | null; skipped: boolean } & Macros;
/** `entries`: what was logged, one by one; missing on older servers. */
export type DaySummary = { date: string; nutrition: { consumed: Macros; target: Macros }; meals: MealSlot[]; entries?: MealEntry[] };

export type Compatibility = { ok: boolean; conflicts: Labeled[]; adaptable: boolean };
