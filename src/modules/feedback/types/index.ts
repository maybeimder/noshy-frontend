export type FeedbackTargetType = "recipe" | "plan" | "ingredient";
export type FeedbackEventType = "selected" | "discarded" | "prepared" | "repeated" | "preference_changed";

export type FeedbackEntry = {
      id: string;
      sessionId: string;
      targetType: FeedbackTargetType;
      targetId: string;
      targetName: string;
      eventType: FeedbackEventType;
      note?: string;
      createdAt: string;
};

export type FeedbackInput = Omit<FeedbackEntry, "id" | "createdAt">;

export type Recommendation = {
      id: string;
      targetType: FeedbackTargetType;
      targetId: string;
      targetName: string;
      eventType: FeedbackEventType;
      note?: string;
      recommendation: string;
};
