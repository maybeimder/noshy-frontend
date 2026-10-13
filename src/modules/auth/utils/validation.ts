import type { RegisterInput } from "../types";

// Mirrors backend/src/modules/auth/http/auth.dto.ts so most errors never hit the network.
export type FieldErrors = Partial<Record<keyof RegisterInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(
      input: Partial<RegisterInput>,
      { requireName = false } = {},
): FieldErrors {
      const errors: FieldErrors = {};

      if (requireName && (input.name ?? "").trim().length < 2) {
            errors.name = "Escribe tu nombre (mínimo 2 caracteres).";
      }
      if (!EMAIL.test((input.email ?? "").trim())) {
            errors.email = "Escribe un email válido, por ejemplo ana@correo.com.";
      }
      if ((input.password ?? "").length < 8) {
            errors.password = "La contraseña debe tener al menos 8 caracteres.";
      }
      return errors;
}
