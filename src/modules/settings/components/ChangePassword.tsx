import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/modules/auth/api/auth.api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import TextField from "@/shared/components/ui/TextField";
import { ApiError } from "@/shared/lib/axios";

export default function ChangePassword() {
      const { setTokens } = useAuth();
      const [open, setOpen] = useState(false);
      const [current, setCurrent] = useState("");
      const [next, setNext] = useState("");
      const [short, setShort] = useState(false);
      const [done, setDone] = useState(false);
      const change = useMutation({
            mutationFn: authApi.changePassword,
            onSuccess: ({ tokens }) => {
                  // The old ones stop working, also in this tab.
                  setTokens(tokens);
                  setOpen(false);
                  setDone(true);
            },
      });
      const fields = change.error instanceof ApiError ? change.error.fieldErrors : {};
      const show = () => {
            change.reset();
            setCurrent("");
            setNext("");
            setShort(false);
            setDone(false);
            setOpen(true);
      };
      const submit = (event: FormEvent) => {
            event.preventDefault();
            setShort(next.length < 8);
            if (current && next.length >= 8) change.mutate({ currentPassword: current, newPassword: next });
      };

      return (
            <>
                  <Button variant="soft" onClick={show} className="self-start">
                        Cambiar contraseña
                  </Button>
                  {done && (
                        <p role="status" className="rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                              Contraseña cambiada. Cerramos tu sesión en los demás dispositivos.
                        </p>
                  )}
                  <Dialog open={open} onClose={() => setOpen(false)} title="Cambiar contraseña">
                        <form noValidate onSubmit={submit} className="flex flex-col gap-3">
                              <TextField label="Contraseña actual" type="password" autoComplete="current-password" maxLength={200} value={current} onChange={(e) => setCurrent(e.target.value)} error={fields.currentPassword} />
                              <TextField label="Contraseña nueva" type="password" autoComplete="new-password" maxLength={200} value={next} onChange={(e) => setNext(e.target.value)} error={short ? "Mínimo 8 caracteres." : fields.newPassword} />
                              {change.error && !fields.currentPassword && !fields.newPassword && <p className="text-sm font-semibold text-error">{change.error.message}</p>}
                              <Button type="submit" loading={change.isPending} disabled={!current || !next}>
                                    Cambiar
                              </Button>
                        </form>
                  </Dialog>
            </>
      );
}
