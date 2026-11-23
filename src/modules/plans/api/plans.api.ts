import { api, ApiError, idempotent, unwrap } from "@/shared/lib/axios";
import { HEALTH_CONSENT_VERSION, parseBody, toBodyDraft } from "../utils/body";
import { defaultPrefs, type OnboardingPrefs } from "../utils/onboarding";
import type { Biometrics, Insight, NutritionPreview, OnboardingResult, PlanData, PlanInput, PreferenceSection, Profile } from "../types";

// The plan is the user's profile: GET /me/profile reads it, POST /me/onboarding/complete creates it
// and PATCH /me/preferences edits it section by section.

// ---------- Labels of the form <-> ids of the backend catalog ----------
export const GOAL_IDS = {
      healthy: "eatHealthier",
      save_time: "saveTime",
      lose_weight: "loseWeight",
      gain_muscle: "gainMuscle",
      maintain: "maintain",
      custom: "custom",
} as const;
export const ACTIVITY_IDS = { calm: "sedentary", active: "active", very_active: "veryActive" } as const;
const SKILL_IDS = { basic: "basic", decent: "intermediate", advanced: "advanced" } as const;
const DIET_IDS: Record<string, string> = {
      Omnívoro: "omnivore",
      Vegetariano: "vegetarian",
      Vegano: "vegan",
      Pescetariano: "pescatarian",
      Flexitariano: "flexitarian",
};
const ALLERGY_IDS: Record<string, string> = {
      "Sin lactosa": "lactose",
      "Sin gluten": "gluten",
      "Sin huevo": "egg",
      "Sin mariscos": "shellfish",
      "Sin frutos secos": "nuts",
};
const CARE_IDS: Record<string, string> = { "Menos sodio": "lessSodium", "Menos azúcar": "lessSugar", "Más fibra": "moreFiber" };
const EQUIPMENT_IDS: Record<string, string> = {
      Airfryer: "airfryer",
      Horno: "oven",
      Licuadora: "blender",
      "Olla a presión": "pressureCooker",
      Microondas: "microwave",
};
const STORE_IDS: Record<string, string> = { Éxito: "exito", Carulla: "carulla", D1: "d1", Jumbo: "jumbo", Ara: "ara", Plaza: "plaza" };
/** Illustrations keep their own names; these two differ from the catalog. */
const DISH_IDS: Record<string, string> = { sopa: "soups", ensalada: "salads" };

const invert = <K extends string>(map: Record<K, string>) => Object.fromEntries(Object.entries<string>(map).map(([label, id]) => [id, label])) as Record<string, K>;
const labelById = { ...invert(DIET_IDS), ...invert(ALLERGY_IDS), ...invert(CARE_IDS) };
const goalById = invert(GOAL_IDS);
const activityById = invert(ACTIVITY_IDS);
const skillById = invert(SKILL_IDS);
const equipmentById = invert(EQUIPMENT_IDS);
const storeById = invert(STORE_IDS);

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const pick = (map: Record<string, string>, values: string[]) => values.map((v) => map[v]).filter((id): id is string => Boolean(id));

const isDiet = (label: string) => label in DIET_IDS;

/**
 * Form answers for a saved profile. The profile does not return dishes or «flexitariano», so those come
 * from this browser when it has them.
 */
export function toFormAnswers(plan: PlanData, saved: OnboardingPrefs | null): Omit<PlanInput, "kcalTarget" | "kcalAdjusted"> {
      const { goals, never, kitchen, shopping } = plan.summary;
      const restrictions = never.map((item) => (item.id && labelById[item.id]) || item.label);
      if (saved?.flexitarian && !restrictions.some(isDiet)) restrictions.push("Flexitariano");
      const minutes = kitchen.maxCookingMinutes;
      return {
            restrictions,
            mealsPerDay: kitchen.mealsPerDay,
            body: toBodyDraft(plan.biometrics),
            prefs: {
                  ...defaultPrefs,
                  ...saved,
                  ...(plan.activityLevel && activityById[plan.activityLevel] ? { activity: activityById[plan.activityLevel] } : {}),
                  goals: goals.map((g) => goalById[g.id]).filter((g) => g !== undefined),
                  cookTime: minutes === 15 ? "15" : minutes === 30 ? "30" : minutes === 45 ? "45" : "relaxed",
                  level: skillById[kitchen.skillLevel.id] ?? "decent",
                  appliances: kitchen.equipment.map((e) => equipmentById[e.id] ?? e.label),
                  stores: shopping.stores.map((s) => storeById[s.id] ?? s.name),
                  priceQuality: Math.round(shopping.priceQualityBalance * 100),
                  budget: shopping.weeklyBudget.amount,
            },
      };
}

function toSections({ prefs, body, restrictions, mealsPerDay, kcalTarget, kcalAdjusted }: PlanInput) {
      const { biometrics } = parseBody(body);
      const known = { ...DIET_IDS, ...ALLERGY_IDS, ...CARE_IDS };
      const storeIds = pick(STORE_IDS, prefs.stores);
      return {
            goals: prefs.goals.length ? { ids: prefs.goals.slice(0, 2).map((g) => GOAL_IDS[g]), customNote: null } : null,
            activityLevel: ACTIVITY_IDS[prefs.activity],
            biometrics: biometrics && body.consent ? { ...biometrics, consentVersion: HEALTH_CONSENT_VERSION } : null,
            nutrition: kcalTarget === null ? null : { kcalTarget: clamp(Math.round(kcalTarget / 50) * 50, 1400, 4000), adjustedByUser: kcalAdjusted },
            restrictions: {
                  dietStyle: DIET_IDS[restrictions.find(isDiet) ?? "Omnívoro"]!,
                  allergyIds: pick(ALLERGY_IDS, restrictions),
                  careIds: pick(CARE_IDS, restrictions),
                  customExclusions: restrictions.filter((r) => !(r in known)).slice(0, 10),
            },
            tastes: { favoriteDishIds: prefs.dishes.map((d) => DISH_IDS[d] ?? d) },
            kitchen: {
                  mealsPerDay: clamp(mealsPerDay, 1, 6),
                  maxCookingMinutes: prefs.cookTime === "relaxed" ? null : Number(prefs.cookTime),
                  skillLevel: SKILL_IDS[prefs.level],
                  equipmentIds: pick(EQUIPMENT_IDS, prefs.appliances),
            },
            // The API needs at least one store; without any, null takes its defaults.
            shopping: storeIds.length
                  ? {
                          storeIds,
                          priceQualityBalance: clamp(prefs.priceQuality, 0, 100) / 100,
                          weeklyBudget: { amount: clamp(prefs.budget, 50_000, 1_500_000), currency: "COP" as const },
                    }
                  : null,
      };
}

export const plansApi = {
      /** null until the user finishes onboarding. */
      profile: () =>
            api
                  .get<{ data: Profile }>("/me/profile")
                  .then(unwrap)
                  .catch((error: unknown) => {
                        if (error instanceof ApiError && error.code === "ONBOARDING_INCOMPLETE") return null;
                        throw error;
                  }),
      preview: ({ biometrics, ...prefs }: Pick<OnboardingPrefs, "goals" | "activity"> & { biometrics: Biometrics | null }) =>
            api
                  .post<{ data: NutritionPreview }>("/nutrition/targets/preview", {
                        goalIds: prefs.goals.map((g) => GOAL_IDS[g]),
                        activityLevel: ACTIVITY_IDS[prefs.activity],
                        biometrics,
                  })
                  .then(unwrap),
      /** `key` stays the same across retries of one submission. */
      complete: ({ input, key }: { input: PlanInput; key: string }) => {
            const sections = toSections(input);
            const skippedSteps: PreferenceSection[] = [...(sections.goals ? [] : ["goals" as const]), ...(sections.shopping ? [] : ["shopping" as const])];
            return api.post<{ data: OnboardingResult }>("/me/onboarding/complete", { ...sections, skippedSteps }, idempotent(key)).then(unwrap);
      },
      /** Sends only what differs from `before`: a section the user did not touch must not be overwritten. */
      update: ({ before, after }: { before: PlanInput; after: PlanInput }) => {
            const was = toSections(before) as Record<string, unknown>;
            const changed = Object.entries(toSections(after)).filter(
                  // null means "not answered", except for biometrics, where it deletes what was saved.
                  ([section, value]) => (value !== null || section === "biometrics") && JSON.stringify(value) !== JSON.stringify(was[section]),
            );
            if (changed.length === 0) return Promise.resolve(null);
            return api.patch<{ data: Profile }>("/me/preferences", Object.fromEntries(changed)).then(unwrap);
      },
      insights: () => api.get<{ data: Insight[] }>("/me/chef/insights", { params: { limit: 50 } }).then(unwrap),
      voteInsight: ({ id, vote }: { id: string; vote: "up" | "down" }) => api.post(`/me/chef/insights/${id}/feedback`, { vote }).then(() => undefined),
};
