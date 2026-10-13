import type { LibraryRecipe } from "../types";

const MAX_GENERATE = 12; // backend recipeGenerationSchema

/** Generator pre-filled with a library recipe's ingredients (?ingredientes=a,b&idea=Title). */
export const generatorLink = (recipe: Pick<LibraryRecipe, "ner" | "title">) =>
      `/recetas/generar?${new URLSearchParams({ ingredientes: recipe.ner.slice(0, MAX_GENERATE).join(","), idea: recipe.title })}`;
