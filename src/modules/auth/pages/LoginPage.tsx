import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Button from "@/shared/components/ui/Button";
import FormAlert from "@/shared/components/ui/FormAlert";
import TextField from "@/shared/components/ui/TextField";
import { ApiError } from "@/shared/lib/axios";
import { authApi } from "../api/auth.api";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { validateCredentials, type FieldErrors } from "../utils/validation";

export default function LoginPage() {
      const { startSession } = useAuth();
      const location = useLocation();
      const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

      // On success GuestOnlyRoute redirects to wherever the user was headed.
      const login = useMutation({
            mutationFn: authApi.login,
            onSuccess: startSession,
            onError: (error) => {
                  if (error instanceof ApiError) setFieldErrors(error.fieldErrors);
            },
      });

      const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const input = {
                  email: String(form.get("email") ?? "").trim(),
                  password: String(form.get("password") ?? ""),
            };

            const errors = validateCredentials(input);
            setFieldErrors(errors);
            if (Object.keys(errors).length === 0) login.mutate(input);
      };

      const formError =
            login.error && Object.keys(fieldErrors).length === 0
                  ? login.error instanceof ApiError &&
                    login.error.code === "INVALID_CREDENTIALS"
                        ? "El email o la contraseña no coinciden. Revísalos e inténtalo de nuevo."
                        : login.error.message
                  : null;

      return (
            <AuthLayout
                  title="Hola de nuevo"
                  subtitle="Entra para seguir cocinando con tu chef."
                  footer={
                        <>
                              ¿No tienes cuenta?{" "}
                              <Link
                                    to="/registro"
                                    state={location.state}
                                    className="font-bold text-ink underline underline-offset-4"
                              >
                                    Regístrate
                              </Link>
                        </>
                  }
            >
                  <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {formError && <FormAlert>{formError}</FormAlert>}

                        <TextField
                              label="Email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              inputMode="email"
                              placeholder="ana@correo.com"
                              error={fieldErrors.email}
                              required
                        />
                        <TextField
                              label="Contraseña"
                              name="password"
                              type="password"
                              autoComplete="current-password"
                              error={fieldErrors.password}
                              required
                        />

                        <Button
                              type="submit"
                              fullWidth
                              loading={login.isPending}
                              className="mt-2"
                        >
                              {login.isPending ? "Entrando…" : "Iniciar sesión"}
                        </Button>
                  </form>
            </AuthLayout>
      );
}
