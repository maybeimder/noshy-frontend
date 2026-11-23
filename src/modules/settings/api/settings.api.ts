import { api, unwrap } from "@/shared/lib/axios";

export type Settings = {
      account: { name: string; lastName: string | null; email: string; emailVerified: boolean; avatarUrl: string | null; grammaticalGender: "feminine" | "masculine" | "neutral" | null };
      chef: { tone: "direct" | "conversational"; proactivity: "all" | "important" | "none"; readStepsAloud: boolean; units: "metric" | "imperial" };
      notifications: { expiring: boolean; dailyIdeas: boolean; community: boolean };
};
export type SettingsPatch = {
      account?: Partial<Pick<Settings["account"], "name" | "lastName" | "grammaticalGender"> & { avatarMediaId: string | null }>;
      chef?: Partial<Settings["chef"]>;
      notifications?: Partial<Settings["notifications"]>;
};
export type DataExport = { id: string; status: "processing" | "ready" | "failed"; downloadPath: string | null };

export const settingsApi = {
      get: () => api.get<{ data: Settings }>("/me/settings").then(unwrap),
      patch: (input: SettingsPatch) => api.patch<{ data: Settings }>("/me/settings", input).then(unwrap),
      requestExport: () => api.post<{ data: { exportId: string } }>("/me/data-exports").then(unwrap),
      exportStatus: (id: string) => api.get<{ data: DataExport }>(`/me/data-exports/${id}`).then(unwrap),
      downloadExport: (id: string) => api.get<Blob>(`/me/data-exports/${id}/download`, { responseType: "blob" }).then((r) => r.data),
      deleteAccount: () => api.delete("/me", { data: { confirm: true } }).then(() => undefined),
};
