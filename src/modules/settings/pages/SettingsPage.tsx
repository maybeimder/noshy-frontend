import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import PageHeader from "@/shared/components/layout/PageHeader";
import Avatar from "@/shared/components/ui/Avatar";
import Button from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import Dialog from "@/shared/components/ui/Dialog";
import FormAlert from "@/shared/components/ui/FormAlert";
import ImagePicker from "@/shared/components/ui/ImagePicker";
import { ErrorState } from "@/shared/components/ui/QueryState";
import TextField from "@/shared/components/ui/TextField";
import { settingsApi, type Settings, type SettingsPatch } from "../api/settings.api";
import SettingsSkeleton from "../components/SettingsSkeleton";
import VerifyEmail from "../components/VerifyEmail";
import { usePatchSettings, useSettings } from "../hooks/useSettings";

export default function SettingsPage() {
      const settings = useSettings();
      return (
            <>
                  <PageHeader title="Ajustes" backTo="/perfil" />
                  {settings.isPending ? (
                        <SettingsSkeleton />
                  ) : (
                        <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                              {settings.isError ? <ErrorState message={settings.error.message} onRetry={() => settings.refetch()} /> : <Sections settings={settings.data} />}
                        </main>
                  )}
            </>
      );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
      return (
            <section aria-label={title} className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-soft">
                  <h2 className="text-title font-extrabold text-ink">{title}</h2>
                  {children}
            </section>
      );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
      return (
            <label className="flex min-h-11 items-center justify-between gap-3 text-sm font-bold text-ink">
                  {label}
                  <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-6 shrink-0 accent-primary-strong" />
            </label>
      );
}

function Choice<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
      return (
            <div>
                  <p className="text-sm font-bold text-ink">{label}</p>
                  <Chips label={label} options={options} value={value} onChange={onChange} />
            </div>
      );
}

function Sections({ settings }: { settings: Settings }) {
      const { logout } = useAuth();
      const patch = usePatchSettings();
      const save = (input: SettingsPatch) => patch.mutate(input);
      const { account, chef, notifications } = settings;
      const [name, setName] = useState(account.name);
      const [lastName, setLastName] = useState(account.lastName ?? "");
      const accountChanged = name.trim() !== account.name || lastName.trim() !== (account.lastName ?? "");

      return (
            <>
                  {patch.error && <FormAlert>{patch.error.message}</FormAlert>}
                  {!account.emailVerified && <VerifyEmail />}

                  <Section title="Cuenta">
                        <ImagePicker
                              label="Foto de perfil"
                              purpose="avatar"
                              shape="circle"
                              value={account.avatarUrl}
                              onChange={(media) => save({ account: { avatarMediaId: media?.id ?? null } })}
                              placeholder={<Avatar name={account.name} size="lg" />}
                        />
                        <form
                              className="flex flex-col gap-3"
                              onSubmit={(e) => {
                                    e.preventDefault();
                                    if (name.trim()) save({ account: { name: name.trim(), lastName: lastName.trim() || null } });
                              }}
                        >
                              <TextField label="Nombre" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
                              <TextField label="Apellido" maxLength={60} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                              <p className="text-sm text-ink-muted">
                                    {account.email} · {account.emailVerified ? "verificado" : "sin verificar"}
                              </p>
                              {accountChanged && (
                                    <Button type="submit" loading={patch.isPending} disabled={!name.trim()}>
                                          Guardar
                                    </Button>
                              )}
                        </form>
                        <Choice<"feminine" | "masculine" | "neutral">
                              label="¿Cómo te hablo?"
                              options={[
                                    { id: "feminine", label: "Femenino" },
                                    { id: "masculine", label: "Masculino" },
                                    { id: "neutral", label: "Neutro" },
                              ]}
                              value={account.grammaticalGender ?? "neutral"}
                              onChange={(grammaticalGender) => save({ account: { grammaticalGender } })}
                        />
                  </Section>

                  <Section title="Tu chef">
                        <Choice
                              label="Tono"
                              options={[
                                    { id: "direct" as const, label: "Directo" },
                                    { id: "conversational" as const, label: "Conversador" },
                              ]}
                              value={chef.tone}
                              onChange={(tone) => save({ chef: { tone } })}
                        />
                        <Choice
                              label="Mensajes del chef"
                              options={[
                                    { id: "all" as const, label: "Todos" },
                                    { id: "important" as const, label: "Solo importantes" },
                                    { id: "none" as const, label: "Ninguno" },
                              ]}
                              value={chef.proactivity}
                              onChange={(proactivity) => save({ chef: { proactivity } })}
                        />
                        <Choice
                              label="Unidades"
                              options={[
                                    { id: "metric" as const, label: "Métrico" },
                                    { id: "imperial" as const, label: "Imperial" },
                              ]}
                              value={chef.units}
                              onChange={(units) => save({ chef: { units } })}
                        />
                        <Toggle label="Leer los pasos en voz alta" checked={chef.readStepsAloud} onChange={(readStepsAloud) => save({ chef: { readStepsAloud } })} />
                  </Section>

                  <Section title="Notificaciones">
                        <Toggle label="Cuando algo vence" checked={notifications.expiring} onChange={(expiring) => save({ notifications: { expiring } })} />
                        <Toggle label="Ideas del día" checked={notifications.dailyIdeas} onChange={(dailyIdeas) => save({ notifications: { dailyIdeas } })} />
                        <Toggle label="Comunidad" checked={notifications.community} onChange={(community) => save({ notifications: { community } })} />
                  </Section>

                  <Section title="Privacidad">
                        <DataExport />
                        <DeleteAccount email={account.email} onDeleted={logout} />
                  </Section>
            </>
      );
}

function DataExport() {
      const request = useMutation({ mutationFn: settingsApi.requestExport });
      const id = request.data?.exportId;
      const status = useQuery({
            queryKey: ["dataExport", id],
            queryFn: () => settingsApi.exportStatus(id!),
            enabled: Boolean(id),
            refetchInterval: ({ state }) => (state.data && state.data.status !== "processing" ? false : 2000),
      });
      const download = useMutation({
            // The endpoint needs the bearer token, so a plain link would not work.
            mutationFn: () => settingsApi.downloadExport(id!),
            onSuccess: (blob) => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "noshy-mis-datos.json";
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 10_000);
            },
      });
      const error = request.error ?? status.error ?? download.error;
      return (
            <div className="flex flex-col gap-2">
                  {status.data?.status === "ready" ? (
                        <Button variant="soft" loading={download.isPending} onClick={() => download.mutate()}>
                              Descargar archivo
                        </Button>
                  ) : (
                        <Button variant="soft" loading={request.isPending || (Boolean(id) && status.data?.status !== "failed" && !status.error)} onClick={() => request.mutate()}>
                              Descargar mis datos
                        </Button>
                  )}
                  {error && <p className="text-sm font-semibold text-error">{error.message}</p>}
            </div>
      );
}

function DeleteAccount({ email, onDeleted }: { email: string; onDeleted: () => void }) {
      const [open, setOpen] = useState(false);
      const [typed, setTyped] = useState("");
      const remove = useMutation({ mutationFn: settingsApi.deleteAccount, onSuccess: onDeleted });
      useEffect(() => {
            if (!open) setTyped("");
      }, [open]);
      return (
            <>
                  <Button variant="tertiary" onClick={() => setOpen(true)} className="self-start text-error!">
                        Eliminar mi cuenta
                  </Button>
                  <Dialog
                        open={open}
                        onClose={() => setOpen(false)}
                        title="¿Eliminar tu cuenta?"
                        actions={
                              <>
                                    <Button variant="soft" onClick={() => setOpen(false)}>
                                          Cancelar
                                    </Button>
                                    <Button loading={remove.isPending} disabled={typed.trim().toLowerCase() !== email.toLowerCase()} onClick={() => remove.mutate()}>
                                          Eliminar
                                    </Button>
                              </>
                        }
                  >
                        <p className="mb-3 text-ink-muted">Se borran tu perfil, despensa, listas y conversaciones. No se puede deshacer.</p>
                        <TextField label={`Escribe ${email} para confirmar`} autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} error={remove.error?.message} />
                  </Dialog>
            </>
      );
}
