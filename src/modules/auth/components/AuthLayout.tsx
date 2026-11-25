import type { FormEventHandler, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BackButton } from "@/modules/plans/components/OnboardingUI";
import Button from "@/shared/components/ui/Button";
import MascotBubble from "@/shared/components/ui/MascotBubble";
import SocialSignIn from "./SocialSignIn";

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

                              <SocialSignIn />

                              <div className="mt-auto flex flex-col gap-3 pt-8">
                                    <Button type="submit" size="lg" fullWidth arrow loading={submitting}>
                                          {submitLabel}
                                    </Button>
                                    <p className="text-center text-xs text-ink-muted">{footer}</p>
                              </div>
                        </form>
                  </main>
            </div>
      );
}

export const authLinkClass =
      "font-extrabold text-primary-strong underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";
