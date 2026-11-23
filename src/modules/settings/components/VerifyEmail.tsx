import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/modules/auth/api/auth.api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import Button from "@/shared/components/ui/Button";
import TextField from "@/shared/components/ui/TextField";

/** 6-digit code sent to the account's email; publishing and commenting need it. */
export default function VerifyEmail({ onVerified }: { onVerified?: () => void }) {
      const { user, patchUser } = useAuth();
      const [code, setCode] = useState("");
      const verify = useMutation({
            mutationFn: authApi.verifyEmail,
            onSuccess: () => {
                  patchUser({ emailVerified: true });
                  onVerified?.();
            },
      });
      const resend = useMutation({ mutationFn: authApi.resendCode });

      return (
            // Not a <form>: the recipe editor shows it inside its own.
            <div role="group" aria-label="Verifica tu correo" className="flex flex-col gap-3 rounded-card bg-lilac-soft p-4">
                  <p className="text-sm text-lilac-ink">
                        <strong className="block">Verifica tu correo</strong>
                        Te enviamos un código a {user?.email}.
                  </p>
                  <div className="flex items-end gap-2">
                        <TextField
                              label="Código de 6 dígitos"
                              tone="card"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              value={code}
                              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                              onKeyDown={(e) => {
                                    if (e.key !== "Enter") return;
                                    e.preventDefault();
                                    if (code.length === 6) verify.mutate(code);
                              }}
                              error={verify.error?.message}
                              className="flex-1"
                        />
                        <Button loading={verify.isPending} disabled={code.length !== 6} onClick={() => verify.mutate(code)}>
                              Verificar
                        </Button>
                  </div>
                  <Button variant="tertiary" loading={resend.isPending} onClick={() => resend.mutate()} className="self-start">
                        Reenviar código
                  </Button>
                  {resend.isSuccess && <p className="text-sm font-semibold text-lilac-ink">Te enviamos otro código.</p>}
                  {resend.error && <p className="text-sm font-semibold text-error">{resend.error.message}</p>}
            </div>
      );
}
