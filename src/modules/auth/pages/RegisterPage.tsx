import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import FormAlert from "@/shared/components/ui/FormAlert";
import TextField from "@/shared/components/ui/TextField";
import { ApiError } from "@/shared/lib/axios";
import { authApi } from "../api/auth.api";
import AuthLayout, { authLinkClass } from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { validateCredentials, type FieldErrors } from "../utils/validation";

export default function RegisterPage() {
      const { startSession } = useAuth();
      const location = useLocation();
      const navigate = useNavigate();
      const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

      const register = useMutation({
            mutationFn: authApi.register,
            // New accounts go straight to the plan onboarding.
            // GuestOnlyRoute redirects as soon as the session starts; point it at onboarding first.
            onSuccess: (auth) => {
                  navigate(location.pathname, { replace: true, state: { from: "/plan/nuevo" } });
                  startSession(auth);
            },
            onError: (error) => {
                  if (!(error instanceof ApiError)) return;
                  if (error.code === "EMAIL_TAKEN") {
                        setFieldErrors({ email: "Ya existe una cuenta con este email." });
                  } else {
                        setFieldErrors(error.fieldErrors);
                  }
            },
      });

      const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const input = {
                  name: String(form.get("name") ?? "").trim(),
                  email: String(form.get("email") ?? "").trim(),
                  password: String(form.get("password") ?? ""),
            };

            const errors = validateCredentials(input, { requireName: true });
            setFieldErrors(errors);
            if (Object.keys(errors).length === 0) register.mutate(input);
      };

      const formError =
            register.error && Object.keys(fieldErrors).length === 0
                  ? register.error.message
                  : null;

      return (
            <AuthLayout
                  step="Paso 0 · Tu cuenta"
                  bubble={{ title: "¡Hola! Antes de cocinar, ¿cómo te llamo?", text: "Tu chef usará tu nombre para hablarte." }}
                  onSubmit={handleSubmit}
                  submitLabel={register.isPending ? "Creando cuenta…" : "Crear cuenta"}
                  submitting={register.isPending}
                  footer={
                        <>
                              Al continuar aceptas los Términos y la Política de privacidad.{" "}
                              <span className="mt-2 block text-sm">
                                    ¿Ya tienes cuenta?{" "}
                                    <Link to="/login" state={location.state} className={authLinkClass}>
                                          Inicia sesión
                                    </Link>
                              </span>
                        </>
                  }
            >
                  {formError && <FormAlert>{formError}</FormAlert>}

                  <TextField label="Nombre" name="name" icon="smile" tone="outline" autoComplete="name" placeholder="Tu nombre" error={fieldErrors.name} required />
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
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        error={fieldErrors.password}
                        required
                  />
            </AuthLayout>
      );
}
