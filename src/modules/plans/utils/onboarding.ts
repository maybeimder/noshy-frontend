import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { IconName } from "@/shared/components/ui/Icon";
import type { DishName } from "@/shared/components/ui/DishArt";
import type { Tone } from "@/shared/lib/tones";
import { useUserValue } from "@/shared/lib/user-store";
import type { PlanObjective, PlanTargets } from "../types";

// Onboarding answers the plan API does not store yet (proposed in backend/recommendation.md §7).
// They live per user in the browser; objective, targets, restrictions and meals go to /plans.

export type Goal = "healthy" | "save_time" | "lose_weight" | "gain_muscle" | "maintain" | "custom";
export type Activity = "calm" | "active" | "very_active";
export type CookTime = "15" | "30" | "45" | "relaxed";
export type CookLevel = "basic" | "decent" | "advanced";

export type OnboardingPrefs = {
      goals: Goal[];
      activity: Activity;
      dishes: DishName[];
      cookTime: CookTime;
      level: CookLevel;
      appliances: string[];
      stores: string[];
      /** 0 = price first, 100 = quality first. */
      priceQuality: number;
      /** Weekly budget in COP. */
      budget: number;
};

export const defaultPrefs: OnboardingPrefs = {
      goals: [],
      activity: "active",
      dishes: [],
      cookTime: "30",
      level: "decent",
      appliances: [],
      stores: [],
      priceQuality: 60,
      budget: 180_000,
};

/** Set when the user leaves onboarding with «Lo haré más tarde», so home stops sending them back to it. */
export function useOnboardingSkipped() {
      const { user } = useAuth();
      return useUserValue<boolean>(user?.id ?? "anon", "onboardingSkipped");
}

export function useOnboardingPrefs() {
      const { user } = useAuth();
      const [value, setValue] = useUserValue<OnboardingPrefs>(user?.id ?? "anon", "onboarding");
      return [value, setValue] as const;
}

export const goals: { value: Goal; label: string; description: string; icon: IconName; tone: Tone }[] = [
      { value: "healthy", label: "Comer más sano", description: "Más verduras y comida real", icon: "bowl", tone: "peach" },
      { value: "save_time", label: "Ahorrar tiempo", description: "Recetas de 20 min o menos", icon: "bolt", tone: "lilac" },
      { value: "lose_weight", label: "Bajar de peso", description: "Déficit suave y saciante", icon: "scale", tone: "mustard" },
      { value: "gain_muscle", label: "Ganar músculo", description: "Más proteína en cada plato", icon: "dumbbell", tone: "rose" },
      { value: "maintain", label: "Mantenerme", description: "Equilibrio sin pensarlo", icon: "sprout", tone: "sky" },
      { value: "custom", label: "Personalizado", description: "Cuéntaselo a tu chef", icon: "target", tone: "lilac" },
];

export const goalLabel = (goal: Goal) => goals.find((g) => g.value === goal)?.label ?? goal;

/** The plan API keeps one objective: the strongest of the chosen goals. */
export function objectiveFor(chosen: Goal[], current?: PlanObjective): PlanObjective {
      // Keep a finer objective from before (burn_fat, gain_weight) while its goal is still chosen.
      if (current && chosen.includes(goalFor(current))) return current;
      if (chosen.includes("lose_weight")) return "lose_weight";
      if (chosen.includes("gain_muscle")) return "gain_muscle";
      if (chosen.includes("custom")) return "custom";
      return "maintain";
}

export function goalFor(objective: PlanObjective): Goal {
      if (objective === "lose_weight" || objective === "burn_fat") return "lose_weight";
      if (objective === "gain_muscle" || objective === "gain_weight") return "gain_muscle";
      if (objective === "custom") return "custom";
      return "maintain";
}

export const activities: { value: Activity; label: string; description: string; icon: IconName; factor: number }[] = [
      { value: "calm", label: "Tranquilo", description: "Trabajo sentado la mayor parte del día", icon: "sofa", factor: 0.9 },
      { value: "active", label: "Activo", description: "Camino o entreno 2–3 días por semana", icon: "walk", factor: 1 },
      { value: "very_active", label: "Muy activo", description: "Entreno casi todos los días", icon: "run", factor: 1.15 },
];

/** Daily starting point by objective and activity, rounded to 50 kcal. Only a reference the user edits. */
export function startingCalories(base: number, activity: Activity) {
      const factor = activities.find((a) => a.value === activity)?.factor ?? 1;
      return Math.round((base * factor) / 50) * 50;
}

/** Macros scaled to a calorie total, keeping the split of a reference plan. */
export function scaleTargets(reference: Required<PlanTargets>, calories: number): Required<PlanTargets> {
      const k = calories / reference.calories;
      return {
            calories,
            proteinGrams: Math.round(reference.proteinGrams * k),
            carbohydratesGrams: Math.round(reference.carbohydratesGrams * k),
            fatGrams: Math.round(reference.fatGrams * k),
      };
}

/** General reference of ~14 g of fibre per 1.000 kcal (shown, not stored). */
export const fibreFor = (calories: number) => Math.round((calories / 1000) * 14);

export const dietStyles = ["Omnívoro", "Vegetariano", "Vegano", "Pescetariano", "Flexitariano"];
export const allergies = ["Sin lactosa", "Sin gluten", "Sin huevo", "Sin mariscos", "Sin frutos secos"];
export const cares = ["Menos sodio", "Menos azúcar", "Más fibra"];

export const dishOptions: { value: DishName; label: string }[] = [
      { value: "bibimbap", label: "Bibimbap" },
      { value: "arepa", label: "Arepa" },
      { value: "pasta", label: "Pasta" },
      { value: "tacos", label: "Tacos" },
      { value: "poke", label: "Poke" },
      { value: "sopa", label: "Sopas" },
      { value: "pancakes", label: "Pancakes" },
      { value: "ensalada", label: "Ensaladas" },
      { value: "curry", label: "Curry" },
];

export const cookTimes: { value: CookTime; label: string }[] = [
      { value: "15", label: "15 min" },
      { value: "30", label: "30 min" },
      { value: "45", label: "45 min" },
      { value: "relaxed", label: "Sin prisa" },
];

export const levels: { value: CookLevel; label: string; icon: IconName }[] = [
      { value: "basic", label: "Básico", icon: "whisk" },
      { value: "decent", label: "Me defiendo", icon: "knife" },
      { value: "advanced", label: "Avanzado", icon: "chef" },
];

export const appliances = ["Airfryer", "Horno", "Licuadora", "Olla a presión", "Microondas"];

export const stores: { name: string; mark: string; tone: Tone }[] = [
      { name: "Éxito", mark: "É", tone: "mustard" },
      { name: "Carulla", mark: "C", tone: "mint" },
      { name: "D1", mark: "D1", tone: "rose" },
      { name: "Jumbo", mark: "J", tone: "sky" },
      { name: "Ara", mark: "A", tone: "peach" },
      { name: "Plaza", mark: "P", tone: "lilac" },
];

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
export const formatCop = (value: number) => cop.format(value).replace(/\s/g, "");
