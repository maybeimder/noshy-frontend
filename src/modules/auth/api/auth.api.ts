import { api } from "@/shared/lib/axios";
import type { AuthResponse, LoginInput, RegisterInput, User } from "../types";

export const authApi = {
      login: (input: LoginInput) =>
            api.post<AuthResponse>("/auth/login", input).then((r) => r.data),
      register: (input: RegisterInput) =>
            api.post<AuthResponse>("/auth/register", input).then((r) => r.data),
      me: () => api.get<User>("/auth/me").then((r) => r.data),
      /** Proposed in backend/recommendation.md §1; 404 until the backend adds it. */
      updateMe: (input: { avatarUrl: string | null }) => api.patch<User>("/auth/me", input).then((r) => r.data),
};
