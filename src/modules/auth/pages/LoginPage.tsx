import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import { Sparkle, Star } from "@/shared/components/ui/Doodles";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import { Wordmark } from "@/shared/components/ui/Logo";
import Mascot from "@/shared/components/ui/Mascot";
import ScribbleText from "@/shared/components/ui/ScribbleText";
import Sticker from "@/shared/components/ui/Sticker";
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
                  hero={
                        <div className="relative flex flex-col items-center pt-4">
                              <Star className="absolute top-8 left-4 size-9 -rotate-12 text-primary" />
                              <Sparkle className="absolute top-40 left-12 size-5 text-primary-strong" />
                              <div className="relative">
                                    <Mascot className="w-52" />
                                    <Sticker tilt={3} className="absolute top-0 -right-20">
                                          ¡Te extrañé!
                                    </Sticker>
                              </div>
                              <div className="mt-2">
                                    <Wordmark />
                              </div>
                        </div>
                  }
                  title={
                        <>
                              Hola de <ScribbleText color="orange">nuevo</ScribbleText>
                        </>
                  }
                  subtitle="Entra para seguir cocinando con Noshy."
                  footer={
                        <>
                              ¿No tienes cuenta?{" "}
                              <Link to="/registro" state={location.state} className={authLinkClass}>
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
                              placeholder="Tu contraseña"
                              error={fieldErrors.password}
                              required
                        />
                        <button type="button" onClick={() => setForgotOpen(true)} className={`${authLinkClass} self-end text-sm`}>
                              ¿Olvidaste tu contraseña?
                        </button>

                        <Button type="submit" size="lg" fullWidth loading={login.isPending} className="mt-2">
                              {login.isPending ? "Entrando…" : "Iniciar sesión"}
                              {!login.isPending && <Icon name="arrowRight" className="size-5" strokeWidth={2.25} />}
                        </Button>
                  </form>

                  <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} title="Recuperar contraseña">
                        <p className="text-ink-muted">
                              Todavía no podemos enviarte un enlace para cambiarla. Si no la recuerdas, crea una cuenta nueva
                              mientras activamos esta opción.
                        </p>
                  </Dialog>
            </AuthLayout>
      );
}
