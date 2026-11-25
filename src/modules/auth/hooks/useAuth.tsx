import {
      createContext,
      useCallback,
      useContext,
      useEffect,
      useMemo,
      useState,
      type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, UNAUTHORIZED_EVENT } from "@/shared/lib/axios";
import { tokenStorage, userCache } from "@/shared/lib/token-storage";
import { authApi } from "../api/auth.api";
import type { AuthResponse, Tokens, User } from "../types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
      status: AuthStatus;
      user: User | null;
      /** Stores the session returned by POST /auth/login or /auth/register. */
      startSession: (auth: AuthResponse) => void;
      /** Replaces the cached user after a profile change. */
      setUser: (user: User) => void;
      /** Changes some fields of the current user (avatar, verified email, onboarding done). */
      patchUser: (patch: Partial<User>) => void;
      /** Swaps the tokens of the same session (password changed). */
      setTokens: (tokens: Tokens) => void;
      logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const meQueryKey = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
      const queryClient = useQueryClient();
      const [token, setToken] = useState(tokenStorage.get);
      const [cachedUser] = useState(() => (token ? userCache.get<User>() : null));

      // Refreshes the user once per visit; until it answers, the user saved at login stands in.
      const me = useQuery({
            queryKey: meQueryKey,
            queryFn: authApi.me,
            enabled: token !== null,
            retry: false,
            staleTime: Infinity,
            initialData: cachedUser ?? undefined,
            initialDataUpdatedAt: 0,
      });
      // Only a 401 means the token is bad; a 404 or 5xx says nothing about the session.
      const rejected = me.isError && me.error instanceof ApiError && me.error.status === 401;

      const endSession = useCallback(() => {
            tokenStorage.clear();
            setToken(null);
            queryClient.clear();
      }, [queryClient]);

      const logout = useCallback(() => {
            const refreshToken = tokenStorage.getRefresh();
            endSession();
            // Leaving never waits for the network; offline, the token just expires by itself.
            if (refreshToken) authApi.logout(refreshToken).catch(() => undefined);
      }, [endSession]);

      const setTokens = useCallback((tokens: Tokens) => {
            tokenStorage.set(tokens);
            setToken(tokens.accessToken);
      }, []);

      const startSession = useCallback(
            ({ user, tokens }: AuthResponse) => {
                  tokenStorage.set(tokens);
                  userCache.set(user);
                  queryClient.setQueryData(meQueryKey, user);
                  setToken(tokens.accessToken);
            },
            [queryClient],
      );

      const setUser = useCallback(
            (user: User) => {
                  userCache.set(user);
                  queryClient.setQueryData(meQueryKey, user);
            },
            [queryClient],
      );

      const patchUser = useCallback(
            (patch: Partial<User>) => {
                  const current = queryClient.getQueryData<User>(meQueryKey);
                  if (current) setUser({ ...current, ...patch });
            },
            [queryClient, setUser],
      );

      useEffect(() => {
            window.addEventListener(UNAUTHORIZED_EVENT, endSession);
            return () => window.removeEventListener(UNAUTHORIZED_EVENT, endSession);
      }, [endSession]);

      // Keep the saved copy fresh for the next visit.
      useEffect(() => {
            if (me.data) userCache.set(me.data);
      }, [me.data]);

      // An invalid stored token (expired, server secret rotated) ends the session.
      useEffect(() => {
            if (rejected || (me.isError && !me.data)) endSession();
      }, [rejected, me.isError, me.data, endSession]);

      const status: AuthStatus =
            token === null || rejected || (me.isError && !me.data)
                  ? "anonymous"
                  : me.data
                    ? "authenticated"
                    : "loading";

      const value = useMemo(
            () => ({ status, user: me.data ?? null, startSession, setUser, patchUser, setTokens, logout }),
            [status, me.data, startSession, setUser, patchUser, setTokens, logout],
      );

      return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
      const context = useContext(AuthContext);
      if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
      return context;
}
