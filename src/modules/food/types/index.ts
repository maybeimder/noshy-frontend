// Mirrors backend/src/modules/food/food.model.ts (catalog from Open Food Facts + AI recipes).

export type NutrientKey =
      | "kcal"
      | "protein_g"
      | "carbs_g"
      | "sugars_g"
      | "added_sugars_g"
      | "fat_g"
      | "sat_fat_g"
      | "trans_fat_g"
      | "fiber_g"
      | "salt_g"
      | "sodium_mg";

/** Community data: any nutrient can be missing (null). */
export type Nutrients = Partial<Record<NutrientKey, number | null>>;

export type FoodState = "raw" | "cooked" | "canned" | "plain";

export type FoodServing = { label: string; grams: number; nutrients?: Nutrients };

/** One row of GET /food/products. */
export type FoodSearchItem = {
      id: string;
      name: string;
      brand: string;
      state?: FoodState;
      isGeneric: boolean;
      image: string | null;
      kcalPer100g: number | null;
      baseServing: { label: string; grams: number };
      /** The product IS the searched food (not a flavour or a processed derivative). */
      exactMatch: boolean;
};

/** GET /food/products/:id */
export type FoodProduct = {
      id: string;
      name: string;
      brand: string;
      state?: FoodState;
      isGeneric: boolean;
      quantity: string | null;
      per100g: Nutrients;
      servings: FoodServing[];
      nutriscore?: string | null;
      nova?: number | null;
      allergens: string[];
      traces: string[];
      ingredients?: string | null;
      dietTags: string[];
      labels: string[];
      categories: string[];
      foodGroups: string[];
      nutrientLevels: string[];
      additives: string[];
      stores: string[];
      image: string | null;
};

export type RecipeTags = {
      diet: string[];
      allergens: string[];
      mealTypes: string[];
      proteins: string[];
      nutrition: string[];
      effort: string[];
};

export type MacroLine = {
      foodId: string;
      name: string;
      brand: string;
      grams: number;
      nutrients: Nutrients;
      missing: NutrientKey[];
};

export type GeneratedRecipeIngredient = {
      name: string;
      grams: number;
      foodId: string | null;
      matchedName: string | null;
      state?: FoodState;
};

/** POST /food/recipes/generate and GET /food/recipes/:id */
export type GeneratedRecipe = {
      id: string;
      title: string;
      servings: number;
      ingredients: GeneratedRecipeIngredient[];
      steps: string[];
      notes?: string;
      tags: RecipeTags;
      macros: { total: Nutrients; perServing: Nutrients; lines: MacroLine[] };
      warnings: string[];
};

export type RecipeGenerationInput = {
      ingredients: { name: string; grams?: number; foodId?: string }[];
      servings: number;
      notes?: string;
};
