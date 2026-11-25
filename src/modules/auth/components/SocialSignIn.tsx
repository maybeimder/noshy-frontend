import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import Button from "@/shared/components/ui/Button";
import { env } from "@/shared/config/env";
import { newKey } from "@/shared/lib/axios";
import { authApi, type OAuthInput } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";

type GoogleId = {
      initialize: (config: { client_id: string; callback: (r: { credential: string }) => void; ux_mode: "popup" }) => void;
      renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
};
type AppleAuth = {
      init: (config: Record<string, unknown>) => void;
      signIn: () => Promise<{ authorization: { id_token: string }; user?: { name?: { firstName?: string; lastName?: string } } }>;
};
const google = () => (window as unknown as { google?: { accounts: { id: GoogleId } } }).google?.accounts.id;
const apple = () => (window as unknown as { AppleID?: { auth: AppleAuth } }).AppleID?.auth;

const scripts = new Map<string, Promise<void>>();
function load(src: string): Promise<void> {
      const known = scripts.get(src);
      if (known) return known;
      const promise = new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => {
                  // The next try asks for it again.
                  scripts.delete(src);
                  script.remove();
                  reject(new Error("No pudimos cargar el inicio de sesión. Revisa tu conexión."));
            };
            document.head.append(script);
      });
      scripts.set(src, promise);
      return promise;
}

/** Google and Apple, each one only if this build has its client id. */
export default function SocialSignIn() {
      const { startSession } = useAuth();
      const button = useRef<HTMLDivElement>(null);
      const [problem, setProblem] = useState<string | null>(null);
      const signIn = useMutation({ mutationFn: authApi.oauth, onSuccess: startSession });
      const submit = useRef<(input: OAuthInput) => void>(() => undefined);
      submit.current = (input) => signIn.mutate(input);

      useEffect(() => {
            if (!env.googleClientId) return;
            let alive = true;
            load("https://accounts.google.com/gsi/client")
                  .then(() => {
                        const el = button.current;
                        if (!alive || !el) return;
                        google()?.initialize({ client_id: env.googleClientId!, ux_mode: "popup", callback: ({ credential }) => submit.current({ provider: "google", idToken: credential }) });
                        google()?.renderButton(el, { type: "standard", theme: "outline", size: "large", shape: "pill", text: "continue_with", locale: "es", width: Math.min(400, el.offsetWidth) });
                  })
                  .catch((error: Error) => alive && setProblem(error.message));
            return () => {
                  alive = false;
            };
      }, []);

      const withApple = async () => {
            setProblem(null);
            try {
                  await load("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/es_ES/appleid.auth.js");
                  const nonce = newKey();
                  apple()?.init({ clientId: env.appleClientId, scope: "name email", redirectURI: `${window.location.origin}/login`, usePopup: true, nonce });
                  const result = await apple()!.signIn();
                  // Apple sends the name only the first time.
                  const name = [result.user?.name?.firstName, result.user?.name?.lastName].filter(Boolean).join(" ");
                  signIn.mutate({ provider: "apple", idToken: result.authorization.id_token, nonce, name: name || undefined });
            } catch (error) {
                  const code = (error as { error?: string }).error;
                  if (code === "popup_closed_by_user" || code === "user_cancelled_authorize") return;
                  setProblem("No pudimos entrar con Apple. Inténtalo de nuevo.");
            }
      };

      if (!env.googleClientId && !env.appleClientId) return null;
      const message = problem ?? signIn.error?.message;
      return (
            <div className="mt-2 flex flex-col gap-3">
                  <p className="flex items-center gap-3 text-xs font-semibold text-ink-muted">
                        <span aria-hidden className="h-px flex-1 bg-line" />o continúa con
                        <span aria-hidden className="h-px flex-1 bg-line" />
                  </p>
                  {env.googleClientId && <div ref={button} className="flex min-h-11 justify-center" />}
                  {env.appleClientId && (
                        <Button variant="dark" size="lg" loading={signIn.isPending} onClick={withApple}>
                              <Icon name="apple" className="size-5" strokeWidth={1.75} />
                              Continuar con Apple
                        </Button>
                  )}
                  {message && <FormAlert>{message}</FormAlert>}
            </div>
      );
}
