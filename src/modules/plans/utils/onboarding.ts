import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { IconName } from "@/shared/components/ui/Icon";
import type { DishName } from "@/shared/components/ui/DishArt";
import type { Tone } from "@/shared/lib/tones";
import { useUserValue } from "@/shared/lib/user-store";

// Answers of the steps. Everything goes to the API; a copy stays per user in the browser because
// GET /me/profile does not return activity, dishes or «flexitariano».

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
      flexitarian?: boolean;
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

export const activities: { value: Activity; label: string; description: string; icon: IconName }[] = [
      { value: "calm", label: "Tranquilo", description: "Trabajo sentado la mayor parte del día", icon: "sofa" },
      { value: "active", label: "Activo", description: "Camino o entreno 2–3 días por semana", icon: "walk" },
      { value: "very_active", label: "Muy activo", description: "Entreno casi todos los días", icon: "run" },
];

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
