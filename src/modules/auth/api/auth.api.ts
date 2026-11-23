import { api, ApiError } from "@/shared/lib/axios";
import type { AuthResponse, LoginInput, RegisterInput, User } from "../types";

/** Terms the sign-up screen shows («Al continuar aceptas los Términos…»); the backend records consent to it. */
export const TERMS_VERSION = "2026-09";

/** Accepts { user, token } or the same inside { data }; anything else is a contract mismatch, not a session. */
function toSession(body: unknown): AuthResponse {
      const payload = (body as { data?: unknown })?.data ?? body;
      const { user, token } = (payload ?? {}) as Partial<AuthResponse>;
      if (typeof token !== "string" || !token || !user?.id) {
            throw new ApiError(0, "INVALID_SESSION_RESPONSE", "El servidor respondió, pero sin tu sesión. Avísanos e inténtalo más tarde.");
      }
      return { user, token };
}

export const authApi = {
      login: (input: LoginInput) => api.post("/auth/login", input).then((r) => toSession(r.data)),
      register: ({ name, email, password }: RegisterInput) =>
            api.post("/auth/register", { name, email, password, acceptedTermsVersion: TERMS_VERSION }).then((r) => toSession(r.data)),
      me: () => api.get<User>("/auth/me").then((r) => r.data),
      /** Proposed in backend/recommendation.md §1; 404 until the backend adds it. */
      updateMe: (input: { avatarUrl: string | null }) => api.patch<User>("/auth/me", input).then((r) => r.data),
};
