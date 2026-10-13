import axios, { AxiosError } from "axios";
import { env } from "@/shared/config/env";
import { tokenStorage } from "./token-storage";

export const UNAUTHORIZED_EVENT = "noshy:unauthorized";

type ValidationIssue = {
      message: string;
      path?: (string | number)[];
};

// The backend answers errors in three shapes:
//   { code, message }                 — domain errors (409, 401, 503…)
//   { message, issues }               — zod validation (400)
//   { error: { code, message } }      — unknown route, bad JSON, 500
type ErrorBody = {
      code?: string;
      message?: string;
      issues?: ValidationIssue[];
      error?: { code?: string; message?: string };
};

export class ApiError extends Error {
      constructor(
            readonly status: number,
            readonly code: string,
            message: string,
            /** First validation message per top-level field, e.g. { email: "…" }. */
            readonly fieldErrors: Record<string, string> = {},
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

      const { status, data } = error.response as { status: number; data?: ErrorBody };
      const fieldErrors: Record<string, string> = {};
      for (const issue of data?.issues ?? []) {
            const field = issue.path?.[0];
            if (field !== undefined && !(String(field) in fieldErrors)) {
                  fieldErrors[String(field)] = issue.message;
            }
      }

      return new ApiError(
            status,
            data?.code ?? data?.error?.code ?? (data?.issues ? "VALIDATION_ERROR" : "HTTP_ERROR"),
            data?.message ??
                  data?.error?.message ??
                  (status >= 500
                        ? "El servidor tuvo un problema. Inténtalo más tarde."
                        : "La solicitud no es válida."),
            fieldErrors,
      );
}

export const api = axios.create({ baseURL: env.apiUrl });

api.interceptors.request.use((config) => {
      const token = tokenStorage.get();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
});

api.interceptors.response.use(undefined, (error: unknown) => {
      const apiError = toApiError(error);
      // A 401 on an authenticated request means the session is gone; login's own 401 is just bad credentials.
      const sentToken =
            error instanceof AxiosError && Boolean(error.config?.headers?.Authorization);
      if (apiError.status === 401 && sentToken) {
            window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
      return Promise.reject(apiError);
});
