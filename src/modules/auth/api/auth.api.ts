import { api, ApiError, unwrap } from "@/shared/lib/axios";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { AuthResponse, LoginInput, OnboardingStatus, RegisterInput, Tokens, User } from "../types";

export type OAuthInput = { provider: "google" | "apple"; idToken: string; nonce?: string; name?: string };

/** Terms the sign-up screen shows («Al continuar aceptas los Términos…»); the backend records consent to it. */
export const TERMS_VERSION = "2026-09";

function toSession(session: AuthResponse): AuthResponse {
      if (!session?.tokens?.accessToken || !session.tokens.refreshToken || !session.user?.id) {
            throw new ApiError(0, "INVALID_SESSION_RESPONSE", "El servidor respondió, pero sin tu sesión. Avísanos e inténtalo más tarde.");
      }
      return session;
}

/** User id: the `sub` claim of the access token (no endpoint returns it before onboarding ends). */
function tokenSubject(): string {
      try {
            const payload = tokenStorage.get()!.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/");
            return (JSON.parse(atob(payload)) as { sub?: string }).sub ?? "";
      } catch {
            return "";
      }
}

type Account = Pick<User, "name" | "lastName" | "email" | "emailVerified" | "avatarUrl">;

export const authApi = {
      login: (input: LoginInput) => api.post<{ data: AuthResponse }>("/auth/login", input).then(unwrap).then(toSession),
      register: ({ name, email, password }: RegisterInput) =>
            api
                  .post<{ data: AuthResponse }>("/auth/register", { name, email, password, acceptedTermsVersion: TERMS_VERSION })
                  .then(unwrap)
                  .then(toSession),
      /** Creates the account the first time. */
      oauth: ({ provider, ...input }: OAuthInput) =>
            api
                  .post<{ data: AuthResponse }>(`/auth/oauth/${provider}`, { ...input, acceptedTermsVersion: TERMS_VERSION })
                  .then(unwrap)
                  .then(toSession),
      /** Ends the session on the server too: the refresh token stops working. */
      logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }).then(() => undefined),
      /** Closes every other session; this one goes on with the new tokens. */
      changePassword: (input: { currentPassword: string; newPassword: string }) => api.post<{ data: { tokens: Tokens } }>("/me/password", input).then(unwrap),
      /** There is no /auth/me: account data and onboarding status live in two endpoints. */
      me: async (): Promise<User> => {
            const [settings, onboarding] = await Promise.all([
                  api.get<{ data: { account: Account } }>("/me/settings").then(unwrap),
                  api.get<{ data: { status: OnboardingStatus } }>("/me/onboarding").then(unwrap),
            ]);
            return { id: tokenSubject(), ...settings.account, onboardingStatus: onboarding.status };
      },
};
