import type { FeedbackEventType, FeedbackTargetType } from "../types";

export const eventLabels: Record<FeedbackEventType, string> = {
      selected: "Elegida",
      prepared: "Preparada",
      repeated: "Repetida",
      discarded: "Descartada",
      preference_changed: "Preferencia actualizada",
};

export const targetLabels: Record<FeedbackTargetType, string> = {
      recipe: "Receta",
      plan: "Plan",
      ingredient: "Ingrediente",
};

/** Phrase for a chip like "Preparada · Pasta rosa". */
export const describeFeedback = (eventType: FeedbackEventType, targetName: string) =>
      `${eventLabels[eventType]} · ${targetName}`;
