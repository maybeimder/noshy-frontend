import type { PlanObjective, PlanTargets } from "../types";

export const objectives: { value: PlanObjective; label: string; description: string }[] = [
      { value: "lose_weight", label: "Bajar de peso", description: "Déficit calórico moderado." },
      { value: "burn_fat", label: "Quemar grasa", description: "Conservar músculo, reducir grasa." },
      { value: "gain_muscle", label: "Ganar músculo", description: "Más proteína y energía." },
      { value: "gain_weight", label: "Subir de peso", description: "Superávit calórico." },
      { value: "maintain", label: "Mantenerme", description: "Comer equilibrado." },
      { value: "custom", label: "Personalizado", description: "Tus propias metas." },
];

export const objectiveLabel = (objective: PlanObjective) =>
      objectives.find((o) => o.value === objective)?.label ?? objective;

export const targetFields: { key: keyof PlanTargets; label: string; unit: string }[] = [
      { key: "calories", label: "Calorías", unit: "kcal" },
      { key: "proteinGrams", label: "Proteína", unit: "g" },
      { key: "carbohydratesGrams", label: "Carbohidratos", unit: "g" },
      { key: "fatGrams", label: "Grasas", unit: "g" },
];

export const restrictionSuggestions = [
      "Vegetariano",
      "Vegano",
      "Sin gluten",
      "Sin lactosa",
      "Sin frutos secos",
      "Bajo en sodio",
];
