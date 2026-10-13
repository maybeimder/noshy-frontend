export type PlanObjective =
      | "lose_weight"
      | "gain_weight"
      | "burn_fat"
      | "gain_muscle"
      | "maintain"
      | "custom";

export type PlanTargets = {
      calories?: number;
      carbohydratesGrams?: number;
      proteinGrams?: number;
      fatGrams?: number;
};

export type NutritionPlan = {
      id: string;
      objective: PlanObjective;
      targets: PlanTargets;
      restrictions: string[];
      mealsPerDay?: number;
      createdAt: string;
      updatedAt: string;
};

export type PlanInput = {
      objective: PlanObjective;
      targets: PlanTargets;
      restrictions?: string[];
      mealsPerDay?: number;
};
