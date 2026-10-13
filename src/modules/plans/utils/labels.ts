import type { IconName } from "@/shared/components/ui/Icon";
import type { Tone } from "@/shared/lib/tones";
import type { PlanObjective, PlanTargets } from "../types";

export const objectives: { value: PlanObjective; label: string; description: string; icon: IconName; tone: Tone }[] = [
      { value: "lose_weight", label: "Bajar de peso", description: "Déficit calórico moderado", icon: "trendDown", tone: "peach" },
      { value: "burn_fat", label: "Quemar grasa", description: "Conservar músculo", icon: "flame", tone: "mustard" },
      { value: "gain_muscle", label: "Ganar músculo", description: "Más proteína y energía", icon: "dumbbell", tone: "rose" },
      { value: "gain_weight", label: "Subir de peso", description: "Superávit calórico", icon: "trendUp", tone: "sky" },
      { value: "maintain", label: "Mantenerme", description: "Comer equilibrado", icon: "scale", tone: "mint" },
      { value: "custom", label: "Personalizado", description: "Tus propias metas", icon: "star4", tone: "lilac" },
];

export const objectiveLabel = (objective: PlanObjective) =>
      objectives.find((o) => o.value === objective)?.label ?? objective;

/** Macro order and colours from ref/PlanNutricional2.jpeg and ref/Perfil.png. */
export const targetFields: { key: keyof PlanTargets; label: string; unit: string; tone: Tone; placeholder: string }[] = [
      { key: "calories", label: "Calorías", unit: "kcal", tone: "peach", placeholder: "2200" },
      { key: "proteinGrams", label: "Proteína", unit: "g", tone: "rose", placeholder: "120" },
      { key: "carbohydratesGrams", label: "Carbohidratos", unit: "g", tone: "mustard", placeholder: "60" },
      { key: "fatGrams", label: "Grasas", unit: "g", tone: "sky", placeholder: "60" },
];

/**
 * Starting points for "¿No las sabes? Te sugiero unas": general daily references by goal, meant to
 * be edited. Not medical advice; the user can change every value before saving.
 */
export const suggestedTargets: Record<PlanObjective, Required<PlanTargets>> = {
      lose_weight: { calories: 1800, proteinGrams: 120, carbohydratesGrams: 180, fatGrams: 60 },
      burn_fat: { calories: 1900, proteinGrams: 140, carbohydratesGrams: 160, fatGrams: 60 },
      gain_muscle: { calories: 2600, proteinGrams: 160, carbohydratesGrams: 300, fatGrams: 80 },
      gain_weight: { calories: 2800, proteinGrams: 130, carbohydratesGrams: 350, fatGrams: 90 },
      maintain: { calories: 2200, proteinGrams: 110, carbohydratesGrams: 250, fatGrams: 70 },
      custom: { calories: 2000, proteinGrams: 100, carbohydratesGrams: 230, fatGrams: 65 },
};

export const restrictionSuggestions = ["Vegetariano", "Vegano", "Sin gluten", "Sin lactosa", "Sin frutos secos", "Bajo en sodio"];
