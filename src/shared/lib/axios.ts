import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { env } from "@/shared/config/env";
import { tokenStorage } from "./token-storage";

export const UNAUTHORIZED_EVENT = "noshy:unauthorized";

// Every error is { error: { code, message, details? } }; validation details are [{ field, code, message }].
type ErrorBody = { error?: { code?: string; message?: string; details?: unknown } };

export class ApiError extends Error {
      constructor(
            readonly status: number,
            readonly code: string,
            message: string,
            /** First validation message per field path, e.g. { "kitchen.mealsPerDay": "…" }. */
            readonly fieldErrors: Record<string, string> = {},
            /** Raw `details` of domain errors, e.g. { sessionId } of SESSION_ALREADY_ACTIVE. */
            readonly details: Record<string, unknown> = {},
      ) {
            super(message);
            this.name = "ApiError";
      }
}

function toApiError(error: unknown): ApiError {
      if (!(error instanceof AxiosError)) {
            return new ApiError(0, "UNKNOWN", "Algo salió mal. Inténtalo de nuevo.");
      }
      if (!error.response) {
            return new ApiError(
                  0,
                  "NETWORK_ERROR",
                  "No pudimos conectar con el servidor. Revisa tu conexión.",
            );
      }

      return errorFromBody(error.response.status, error.response.data as ErrorBody | undefined);
}

function errorFromBody(status: number, body: ErrorBody | undefined): ApiError {
      const { code, message, details } = body?.error ?? {};
      const fieldErrors: Record<string, string> = {};
      if (Array.isArray(details)) {
            for (const { field, message: text } of details as { field?: string; message: string }[]) {
                  if (field && !(field in fieldErrors)) fieldErrors[field] = text;
            }
      }
      return new ApiError(
            status,
            code ?? "HTTP_ERROR",
            message ?? (status >= 500 ? "El servidor tuvo un problema. Inténtalo más tarde." : "La solicitud no es válida."),
            fieldErrors,
            details && !Array.isArray(details) ? (details as Record<string, unknown>) : {},
      );
}

const baseHeaders = {
      // Days and meal slots are computed by the backend in the user's zone.
      "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      "Accept-Language": "es-CO",
};

export const api = axios.create({ baseURL: env.apiUrl, headers: baseHeaders });

type Tokens = { accessToken: string; refreshToken: string };
let refreshing: Promise<string> | null = null;

/** New access token. Throws ApiError 401 when the session is over. */
function refreshAccess(expired: string): Promise<string> {
      const run = async () => {
            // Another tab may have refreshed while this one waited for the lock.
            const current = tokenStorage.get();
            if (current && current !== expired) return current;
            const refreshToken = tokenStorage.getRefresh();
            if (!refreshToken) throw new ApiError(401, "REFRESH_TOKEN_INVALID", "Tu sesión ya no es válida. Inicia sesión de nuevo.");
            // Plain axios: the api instance would try to refresh on this call's own 401.
            const { data } = await axios.post<{ data: { tokens: Tokens } }>(`${env.apiUrl}/auth/refresh`, { refreshToken }, { headers: baseHeaders });
            tokenStorage.set(data.data.tokens);
            return data.data.tokens.accessToken;
      };
      // Refresh tokens are single use and reusing one revokes the session, so only one tab may spend it.
      refreshing ??= (navigator.locks ? navigator.locks.request("noshy.refresh", run) : run())
            .catch((error: unknown) => {
                  throw error instanceof ApiError ? error : toApiError(error);
            })
            .finally(() => {
                  refreshing = null;
            });
      return refreshing;
}

const endSession = () => window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
const bearerOf = (header: unknown) => (typeof header === "string" ? header.replace(/^Bearer /, "") : "");

api.interceptors.request.use((config) => {
      const token = tokenStorage.get();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
});

api.interceptors.response.use(undefined, async (error: unknown) => {
      const apiError = toApiError(error);
      const config = error instanceof AxiosError ? (error.config as (AxiosRequestConfig & { retried?: boolean }) | undefined) : undefined;
      const sent = bearerOf(config?.headers?.Authorization);
      // Login's own 401 carries no token: it is just bad credentials.
      if (apiError.status !== 401 || !config || !sent) throw apiError;

      if (apiError.code === "TOKEN_EXPIRED" && !config.retried) {
            try {
                  await refreshAccess(sent);
            } catch (refreshError) {
                  // Offline or a 5xx says nothing about the session; only a 401 ends it.
                  if (refreshError instanceof ApiError && refreshError.status === 401) endSession();
                  throw refreshError;
            }
            return api.request({ ...config, retried: true } as AxiosRequestConfig);
      }
      endSession();
      throw apiError;
});

/** fetch with the same session handling, for the chef's event stream (axios cannot stream in browsers). */
export async function apiFetch(path: string, init: RequestInit): Promise<Response> {
      const call = async (token: string | null) => {
            try {
                  return await fetch(`${env.apiUrl}${path}`, {
                        ...init,
                        headers: { ...baseHeaders, ...(init.headers as Record<string, string>), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                  });
            } catch (error) {
                  if (error instanceof DOMException && error.name === "AbortError") throw error;
                  throw new ApiError(0, "NETWORK_ERROR", "No pudimos conectar con el servidor. Revisa tu conexión.");
            }
      };
      const fail = async (response: Response) =>
            errorFromBody(response.status, (await response.json().catch(() => undefined)) as ErrorBody | undefined);

      const token = tokenStorage.get();
      let response = await call(token);
      if (response.ok) return response;
      let error = await fail(response);
      if (error.status === 401 && error.code === "TOKEN_EXPIRED" && token) {
            try {
                  response = await call(await refreshAccess(token));
            } catch (refreshError) {
                  if (refreshError instanceof ApiError && refreshError.status === 401) endSession();
                  throw refreshError;
            }
            if (response.ok) return response;
            error = await fail(response);
      }
      if (error.status === 401) endSession();
      throw error;
}

// ---------- Envelope: { data, meta? } ----------
export type Page<T, F = unknown> = { data: T[]; meta: { nextCursor: string | null; limit: number } & F };

/** Body of a single resource: { data } → data. */
export const unwrap = <T>(response: AxiosResponse<{ data: T }>): T => response.data.data;
/** Body of a paginated list: keeps meta. */
export const body = <T>(response: AxiosResponse<T>): T => response.data;

/** Random id for Idempotency-Key and clientMessageId (crypto.randomUUID needs https). */
export const newKey = () =>
      crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");

export const idempotent = (key: string): AxiosRequestConfig => ({ headers: { "Idempotency-Key": key } });
