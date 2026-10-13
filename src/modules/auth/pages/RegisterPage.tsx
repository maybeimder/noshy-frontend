import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Button from "@/shared/components/ui/Button";
import FormAlert from "@/shared/components/ui/FormAlert";
import TextField from "@/shared/components/ui/TextField";
import { ApiError } from "@/shared/lib/axios";
import { authApi } from "../api/auth.api";
import AuthLayout from "../components/AuthLayout";
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
            onSuccess: (auth) => {
                  startSession(auth);
                  navigate("/plan/nuevo", { replace: true });
            },
            onError: (error) => {
                  if (!(error instanceof ApiError)) return;
                  if (error.code === "USER_ALREADY_EXISTS") {
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
                  title="Crea tu cuenta"
                  subtitle="Tu chef personal se adapta a tu plan y a tu despensa."
                  footer={
                        <>
                              ¿Ya tienes cuenta?{" "}
                              <Link
                                    to="/login"
                                    state={location.state}
                                    className="font-bold text-ink underline underline-offset-4"
                              >
                                    Inicia sesión
                              </Link>
                        </>
                  }
            >
                  <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {formError && <FormAlert>{formError}</FormAlert>}

                        <TextField
                              label="Nombre"
                              name="name"
                              autoComplete="name"
                              placeholder="Ana"
                              error={fieldErrors.name}
                              required
                        />
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
                              autoComplete="new-password"
                              hint="Mínimo 8 caracteres."
                              error={fieldErrors.password}
                              required
                        />

                        <Button
                              type="submit"
                              fullWidth
                              loading={register.isPending}
                              className="mt-2"
                        >
                              {register.isPending ? "Creando cuenta…" : "Crear cuenta"}
                        </Button>
                  </form>
            </AuthLayout>
      );
}
