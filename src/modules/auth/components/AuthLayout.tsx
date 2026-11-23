import { useState, type FormEventHandler, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BackButton } from "@/modules/plans/components/OnboardingUI";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import MascotBubble from "@/shared/components/ui/MascotBubble";

type AuthLayoutProps = {
      /** Centered in the header («Paso 0 · Tu cuenta»). */
      step?: string;
      bubble: { title: string; text: string };
      onSubmit: FormEventHandler<HTMLFormElement>;
      submitLabel: string;
      submitting: boolean;
      children: ReactNode;
      /** Under the submit button. */
      footer: ReactNode;
};

// Sign-up and login: the chef asks, the fields answer, one pink action at the bottom.
export default function AuthLayout({ step, bubble, onSubmit, submitLabel, submitting, children, footer }: AuthLayoutProps) {
      const navigate = useNavigate();
      const location = useLocation();
      const [provider, setProvider] = useState<"Google" | "Apple" | null>(null);

      return (
            <div className="min-h-dvh overflow-x-clip bg-canvas">
                  <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-6">
                        <header className="grid grid-cols-[3rem_1fr_3rem] items-center">
                              <BackButton label="Volver" onClick={() => navigate("/bienvenida", { state: location.state })} />
                              {step && <p className="text-center text-xs font-bold text-ink-muted">{step}</p>}
                        </header>

                        <div className="mt-6">
                              <MascotBubble title={bubble.title}>{bubble.text}</MascotBubble>
                        </div>

                        <form noValidate onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col gap-4">
                              {children}

                              <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-ink-muted">
                                    <span aria-hidden className="h-px flex-1 bg-line" />o continúa con
                                    <span aria-hidden className="h-px flex-1 bg-line" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                    {(["Google", "Apple"] as const).map((name) => (
                                          <Button key={name} variant="secondary" size="lg" onClick={() => setProvider(name)}>
                                                <Icon name={name === "Google" ? "google" : "apple"} className="size-5" strokeWidth={1.75} />
                                                {name}
                                          </Button>
                                    ))}
                              </div>

                              <div className="mt-auto flex flex-col gap-3 pt-8">
                                    <Button type="submit" size="lg" fullWidth arrow loading={submitting}>
                                          {submitLabel}
                                    </Button>
                                    <p className="text-center text-xs text-ink-muted">{footer}</p>
                              </div>
                        </form>
                  </main>

                  <Dialog open={provider !== null} onClose={() => setProvider(null)} title={`Entrar con ${provider ?? ""}`}>
                        <p className="text-ink-muted">Muy pronto podrás entrar con {provider}. Por ahora usa tu correo y una contraseña.</p>
                  </Dialog>
            </div>
      );
}

export const authLinkClass =
      "font-extrabold text-primary-strong underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";
