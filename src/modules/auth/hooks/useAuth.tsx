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
import { UNAUTHORIZED_EVENT } from "@/shared/lib/axios";
import { tokenStorage } from "@/shared/lib/token-storage";
import { authApi } from "../api/auth.api";
import type { AuthResponse, User } from "../types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
      status: AuthStatus;
      user: User | null;
      /** Stores the session returned by POST /auth/login or /auth/register. */
      startSession: (auth: AuthResponse) => void;
      /** Replaces the cached user after a profile change. */
      setUser: (user: User) => void;
      logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const meQueryKey = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
      const queryClient = useQueryClient();
      const [token, setToken] = useState(tokenStorage.get);

      // A stored token is only trusted once /auth/me confirms it.
      const me = useQuery({
            queryKey: meQueryKey,
            queryFn: authApi.me,
            enabled: token !== null,
            retry: false,
            staleTime: Infinity,
      });

      const logout = useCallback(() => {
            tokenStorage.clear();
            setToken(null);
            queryClient.clear();
      }, [queryClient]);

      const startSession = useCallback(
            ({ user, token }: AuthResponse) => {
                  tokenStorage.set(token);
                  queryClient.setQueryData(meQueryKey, user);
                  setToken(token);
            },
            [queryClient],
      );

      const setUser = useCallback((user: User) => queryClient.setQueryData(meQueryKey, user), [queryClient]);

      useEffect(() => {
            window.addEventListener(UNAUTHORIZED_EVENT, logout);
            return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
      }, [logout]);

      // An invalid stored token (expired, server secret rotated) ends the session.
      useEffect(() => {
            if (me.isError) logout();
      }, [me.isError, logout]);

      const status: AuthStatus =
            token === null || me.isError
                  ? "anonymous"
                  : me.data
                    ? "authenticated"
                    : "loading";

      const value = useMemo(
            () => ({ status, user: me.data ?? null, startSession, setUser, logout }),
            [status, me.data, startSession, setUser, logout],
      );

      return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
      const context = useContext(AuthContext);
      if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
      return context;
}
