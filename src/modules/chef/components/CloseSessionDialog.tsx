import { useState } from "react";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import TextArea from "@/shared/components/ui/TextArea";

type CloseSessionDialogProps = {
      open: boolean;
      initialPreferences: string;
      closing: boolean;
      /** The session was closed elsewhere with newer preferences: this draft could not be saved. */
      conflict: boolean;
      error?: string | null;
      onConfirm: (preferences: string) => void;
      onClose: () => void;
};

export default function CloseSessionDialog({
      open,
      initialPreferences,
      closing,
      conflict,
      error,
      onConfirm,
      onClose,
}: CloseSessionDialogProps) {
      const [preferences, setPreferences] = useState(initialPreferences);
      const [copied, setCopied] = useState(false);

      const copy = async () => {
            try {
                  await navigator.clipboard.writeText(preferences);
                  setCopied(true);
            } catch {
                  setCopied(false);
            }
      };

      return (
            <Dialog
                  open={open}
                  onClose={onClose}
                  title={conflict ? "No pudimos guardar tus preferencias" : "Terminar conversación"}
                  actions={
                        conflict ? (
                              <>
                                    <Button variant="tertiary" onClick={onClose}>
                                          Cerrar
                                    </Button>
                                    <Button variant="secondary" onClick={copy}>
                                          <Icon name={copied ? "check" : "copy"} className="size-5" />
                                          {copied ? "Copiado" : "Copiar mi versión"}
                                    </Button>
                              </>
                        ) : (
                              <>
                                    <Button variant="tertiary" onClick={onClose}>
                                          Seguir hablando
                                    </Button>
                                    <Button loading={closing} onClick={() => onConfirm(preferences)}>
                                          Guardar y terminar
                                    </Button>
                              </>
                        )
                  }
            >
                  {conflict ? (
                        <div className="flex flex-col gap-4">
                              <FormAlert>
                                    Tus preferencias cambiaron en otra conversación, así que esta versión no se guardó.
                              </FormAlert>
                              <p className="text-ink-muted">
                                    Copia tu texto y pégalo al terminar tu próxima conversación para no perderlo.
                              </p>
                        </div>
                  ) : (
                        <div className="flex flex-col gap-4">
                              <p className="text-ink-muted">
                                    Esto es lo que tu chef recordará de ti la próxima vez. Puedes ajustarlo antes de guardar.
                              </p>
                              {error && <FormAlert>{error}</FormAlert>}
                              <TextArea
                                    label="Tus preferencias"
                                    rows={8}
                                    value={preferences}
                                    onChange={(e) => setPreferences(e.target.value)}
                                    maxLength={100_000}
                              />
                        </div>
                  )}
            </Dialog>
      );
}
