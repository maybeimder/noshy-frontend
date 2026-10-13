import type { FeedbackEntry } from "@/modules/feedback/types";
import type { InventoryItem } from "@/modules/inventory/types";
import type { NutritionPlan } from "@/modules/plans/types";
import type { Recipe } from "@/modules/recipes/types";

export type ChefSessionStatus = "active" | "closed" | "recovery_pending";

export type ChefSession = {
      id: string;
      status: ChefSessionStatus;
      basePreferencesVersion: number;
      preferencesVersion: number;
      preferencesMarkdown: string;
      startedAt: string;
      closedAt?: string;
};

export type ChefMessage = {
      id: string;
      role: "user" | "assistant";
      content: string;
      createdAt: string;
};

export type ChefContext = {
      sessionId: string;
      preferencesMarkdown: string;
      preferencesVersion: number;
      nutritionPlan?: NutritionPlan;
      inventory: InventoryItem[];
      messages: ChefMessage[];
};

export type ChefReply = {
      message: ChefMessage;
      /** Feedback the agent detected and recorded from the conversation. */
      feedback: FeedbackEntry[];
      /** Present when the user asked the chef to save a recipe ("añade esa receta a mis recetas"). */
      savedRecipe?: Recipe;
};
