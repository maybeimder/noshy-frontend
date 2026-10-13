export type Ingredient = {
      name: string;
      quantity: number;
      unit: string;
};

export type Recipe = {
      id: string;
      title: string;
      ingredients: Ingredient[];
      instructions: string[];
      isPublic: boolean;
      createdAt: string;
      publishedAt?: string;
      authorName?: string;
};

export type RecipeInput = {
      title: string;
      ingredients: Ingredient[];
      instructions: string[];
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
