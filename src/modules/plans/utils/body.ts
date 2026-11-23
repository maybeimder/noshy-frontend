import { parseAmount } from "@/shared/lib/units";
import type { Biometrics } from "../types";

/** Version of the health-data consent shown in «Sobre ti»; the backend stores it with the data (Ley 1581). */
export const HEALTH_CONSENT_VERSION = "2026-11";

export type Sex = "female" | "male";
export const bodyFields = ["age", "weight", "height", "waist", "neck", "hip"] as const;
export type BodyField = (typeof bodyFields)[number];

/** What the user typed. Health data: lives in memory and in the API, never in localStorage. */
export type BodyDraft = Record<BodyField, string> & { sex: Sex | null; consent: boolean };

export const emptyBody: BodyDraft = { age: "", weight: "", height: "", waist: "", neck: "", hip: "", sex: null, consent: false };

// Same limits as the backend.
const limits: Record<BodyField, { min: number; max: number; unit: string }> = {
      age: { min: 13, max: 110, unit: "años" },
      weight: { min: 25, max: 350, unit: "kg" },
      height: { min: 100, max: 250, unit: "cm" },
      waist: { min: 40, max: 250, unit: "cm" },
      neck: { min: 20, max: 80, unit: "cm" },
      hip: { min: 40, max: 250, unit: "cm" },
};
export const bodyUnit = (field: BodyField) => limits[field].unit;

const text = (value: number | null | undefined) => (value ? String(value).replace(".", ",") : "");

export function toBodyDraft(b: Biometrics | null | undefined): BodyDraft {
      if (!b) return emptyBody;
      return {
            age: String(new Date().getFullYear() - b.birthYear),
            weight: text(b.weightKg),
            height: text(b.heightCm),
            waist: text(b.waistCm),
            neck: text(b.neckCm),
            hip: text(b.hipCm),
            sex: b.sex,
            consent: true,
      };
}

export const isBodyEmpty = (body: BodyDraft) => body.sex === null && bodyFields.every((f) => !body[f].trim());

export type BodyErrors = Partial<Record<BodyField | "consent", string>>;

/** Biometrics for the API once age, weight and height are valid; measurements are optional. */
export function parseBody(body: BodyDraft): { biometrics: Biometrics | null; errors: BodyErrors } {
      if (isBodyEmpty(body)) return { biometrics: null, errors: {} };
      const errors: BodyErrors = {};
      const read = (field: BodyField, required: boolean) => {
            if (!body[field].trim()) {
                  if (required) errors[field] = "Falta este dato.";
                  return null;
            }
            const value = parseAmount(body[field]);
            const { min, max, unit } = limits[field];
            const rounded = value === null ? null : field === "age" ? Math.floor(value) : Math.round(value * 10) / 10;
            if (rounded === null || rounded < min || rounded > max) {
                  errors[field] = `Entre ${min} y ${max} ${unit}.`;
                  return null;
            }
            return rounded;
      };
      const age = read("age", true);
      const weightKg = read("weight", true);
      const heightCm = read("height", true);
      const waistCm = read("waist", false);
      const neckCm = read("neck", false);
      // The formula for men does not use the hip.
      const hipCm = body.sex === "male" ? null : read("hip", false);
      if (age === null || weightKg === null || heightCm === null || Object.keys(errors).length) return { biometrics: null, errors };
      return { biometrics: { weightKg, heightCm, birthYear: new Date().getFullYear() - age, sex: body.sex, waistCm, neckCm, hipCm }, errors };
}
