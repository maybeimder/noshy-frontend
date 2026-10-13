export type Ingredient = {
      name: string;
      quantity: number;
      unit: string;
};

/** upload: the user's photo · pexels: suggested automatically · none: the user removed it. */
export type RecipeImageSource = "upload" | "pexels" | "none";

export type Recipe = {
      id: string;
      title: string;
      ingredients: Ingredient[];
      instructions: string[];
      isPublic: boolean;
      createdAt: string;
      publishedAt?: string;
      authorName?: string;
      // Image fields are optional until the backend ships them (backend/recommendation.md §1–2).
      imageUrl?: string | null;
      imageSource?: RecipeImageSource | null;
      imageCredit?: { name: string; url: string } | null;
      authorAvatarUrl?: string | null;
};

export type RecipeInput = {
      title: string;
      ingredients: Ingredient[];
      instructions: string[];
      /** Only sent when the user changed the photo; null removes it. */
      imageUrl?: string | null;
};

export type RecipeAdaptation = {
      recipeId: string;
      title: string;
      /** Ingredients fully covered by the pantry. */
      ingredients: Ingredient[];
      /** Quantity still missing per ingredient. */
      missingIngredients: Ingredient[];
      instructions: string[];
};
