import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Dialog from "@/shared/components/ui/Dialog";
import FormAlert from "@/shared/components/ui/FormAlert";
import TextField from "@/shared/components/ui/TextField";
import { ApiError } from "@/shared/lib/axios";
import { authApi } from "../api/auth.api";
import AuthLayout, { authLinkClass } from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { validateCredentials, type FieldErrors } from "../utils/validation";

export default function LoginPage() {
      const { startSession } = useAuth();
      const location = useLocation();
      const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
      const [forgotOpen, setForgotOpen] = useState(false);

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
                  bubble={{ title: "¡Te extrañé! ¿Seguimos cocinando?", text: "Entra con tu correo para volver a tu cocina." }}
                  onSubmit={handleSubmit}
                  submitLabel={login.isPending ? "Entrando…" : "Iniciar sesión"}
                  submitting={login.isPending}
                  footer={
                        <span className="text-sm">
                              ¿No tienes cuenta?{" "}
                              <Link to="/registro" state={location.state} className={authLinkClass}>
                                    Crea tu chef
                              </Link>
                        </span>
                  }
            >
                  {formError && <FormAlert>{formError}</FormAlert>}

                  <TextField
                        label="Correo electrónico"
                        name="email"
                        type="email"
                        icon="mail"
                        tone="outline"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="tu@correo.com"
                        error={fieldErrors.email}
                        required
                  />
                  <TextField
                        label="Contraseña"
                        name="password"
                        type="password"
                        icon="lock"
                        tone="outline"
                        autoComplete="current-password"
                        placeholder="Tu contraseña"
                        error={fieldErrors.password}
                        required
                  />
                  <button type="button" onClick={() => setForgotOpen(true)} className={`${authLinkClass} self-end text-sm`}>
                        ¿Olvidaste tu contraseña?
                  </button>

                  <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} title="Recuperar contraseña">
                        <p className="text-ink-muted">
                              Todavía no podemos enviarte un enlace para cambiarla. Si no la recuerdas, crea una cuenta nueva
                              mientras activamos esta opción.
                        </p>
                  </Dialog>
            </AuthLayout>
      );
}
