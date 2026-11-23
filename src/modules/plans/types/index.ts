import type { Labeled, Money } from "@/shared/types/api";
import type { OnboardingStatus } from "@/modules/auth/types";
import type { BodyDraft } from "../utils/body";
import type { OnboardingPrefs } from "../utils/onboarding";

export type Insight = {
      id: string;
      text: string;
      confidence: number;
      evidence: { count: number; kind: "recipes" | "receipts"; label: string };
      userVote: "up" | "down" | null;
};

export type ProfileSummary = {
      goals: Labeled[];
      never: { id: string | null; label: string; kind: "allergy" | "care" | "diet" | "custom" }[];
      loves: Labeled[];
      kitchen: { mealsPerDay: number; maxCookingMinutes: number | null; skillLevel: Labeled; equipment: Labeled[] };
      shopping: { stores: { id: string; name: string }[]; priceQualityBalance: number; weeklyBudget: Money };
};

export type NutritionTargets = { kcal: number; proteinG: number; carbsG: number; fatG: number; fiberG: number };

export type Biometrics = {
      weightKg: number;
      heightCm: number;
      birthYear: number;
      sex: "female" | "male" | null;
      waistCm?: number | null;
      neckCm?: number | null;
      hipCm?: number | null;
};

/** What POST /me/onboarding/complete and GET /me/profile share. */
export type PlanData = {
      summary: ProfileSummary;
      nutritionTargets: NutritionTargets;
      updatedAt: string;
      /** Missing on servers older than the biometrics change. */
      activityLevel?: string;
      biometrics?: Biometrics | null;
};

export type Profile = PlanData & {
      user: { id: string; name: string; lastName: string | null; displayName: string; initial: string; avatarUrl: string | null; memberSince: string };
      stats: { cookedCount: number; publishedCount: number; streakWeeks: number };
      learning: { score: number; signalsCount: number; topInsights: Insight[] };
      preferences: { section: PreferenceSection; label: string; summary: string }[];
      onboardingStatus: OnboardingStatus;
};

/** Steps of the form; "body" is not one of the API sections that can be skipped. */
export type FormStep = PreferenceSection | "body";
export type PreferenceSection = "goals" | "activity" | "restrictions" | "tastes" | "kitchen" | "shopping";

export type NutritionPreview = {
      kcal: number;
      range: { min: number; max: number; step: number };
      macroSplit: { proteinPct: number; carbsPct: number; fatPct: number };
      fiberGPer1000Kcal: number;
      basis: "populationDefault" | "biometrics";
      /** Estimated from the measurements; null when they were not used. */
      bodyFatPct?: number | null;
};

/** Answers of the steps, with the labels the form shows. */
export type PlanInput = {
      prefs: OnboardingPrefs;
      body: BodyDraft;
      restrictions: string[];
      mealsPerDay: number;
      /** null keeps what the backend computes. */
      kcalTarget: number | null;
      kcalAdjusted: boolean;
};

export type OnboardingResult = PlanData & { firstMenu: { menuId: string; status: "generating" | "ready" | "failed" } };
