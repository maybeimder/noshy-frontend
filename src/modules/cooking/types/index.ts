import type { ChefAction, DaySummary, Macros, MealSlotId, RecipeCard } from "@/shared/types/api";

export type NudgePlacement = "home" | "myKitchen" | "pantry" | "shoppingList";
export type Nudge = { id: string; title: string; body: string; action: ChefAction; expiresAt: string };
export type ActiveCooking = { id: string; recipe: { id: string; title: string; imageUrl: string | null }; currentStepIndex: number; stepsCount: number };

/** Any piece the backend could not build comes as null; the rest still paints. */
export type Home = {
      greeting: { name: string };
      day: DaySummary | null;
      ideas: { slot: MealSlotId; items: RecipeCard[] } | null;
      nudge: Nudge | null;
      mostCooked: { recipeId: string; title: string; imageUrl: string | null; timesCooked: number }[] | null;
      chef: { unreadCount: number };
      activeCookingSession: ActiveCooking | null;
};

export type LogMeal =
      | { slot: MealSlotId; recipeId: string; servings?: number }
      | { slot: MealSlotId; freeText: string; nutrition: Macros }
      | { slot: MealSlotId; skipped: true };
export type DaysHistory = { target: Macros; days: { date: string; meals: number; consumed: Macros }[] };
export type LoggedMeal = { meal: { id: string; slot: MealSlotId; label: string }; day: DaySummary };
