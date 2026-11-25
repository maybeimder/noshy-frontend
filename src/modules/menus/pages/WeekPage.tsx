import { useState } from "react";
import { Link } from "react-router-dom";
import KitchenHeader from "@/modules/inventory/components/KitchenHeader";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import Dialog from "@/shared/components/ui/Dialog";
import { DishPlate } from "@/shared/components/ui/DishArt";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import Photo from "@/shared/components/ui/Photo";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import Stepper from "@/shared/components/ui/Stepper";
import { useRememberShape } from "@/shared/hooks/useShape";
import { formatKcal, localDay, plural } from "@/shared/lib/format";
import type { MenuEntry, WeekMenu } from "../api/menus.api";
import WeekSkeleton, { type WeekShape } from "../components/WeekSkeleton";
import { useMenuMutations, useWeekMenu } from "../hooks/useMenus";
import { dayName, slotLabel, slots } from "../utils/week";

export default function WeekPage() {
      const week = useWeekMenu();
      const { toList, retry, regenerate } = useMenuMutations();
      const [renewing, setRenewing] = useState(false);
      const [editingId, setEditingId] = useState<string | null>(null);

      const menu = week.data;
      const entries = menu ? [...menu.days.flatMap((d) => d.entries), ...(menu.otherEntries ?? [])] : [];
      const editing = entries.find((e) => e.id === editingId);
      const today = localDay();
      useRememberShape<WeekShape>("week", menu?.status === "ready" ? { days: menu.days.map((d) => d.entries.length), other: menu.otherEntries?.length ?? 0 } : null);

      if (week.isPending || menu?.status === "generating") {
            return (
                  <>
                        <KitchenHeader section="week" meta={week.isPending ? null : "Tu chef está armando el menú…"} />
                        <WeekSkeleton />
                  </>
            );
      }

      return (
            <>
                  <KitchenHeader section="week" meta={plural(entries.length, "receta", "recetas")} />
                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                        {week.isError ? (
                              <ErrorState message={week.error.message} onRetry={() => week.refetch()} />
                        ) : !menu ? (
                              <EmptyState icon="kitchen" title="Aún no tienes menú" description="Tu chef arma el primero cuando terminas de configurarlo." />
                        ) : menu.status === "failed" ? (
                              <ErrorState message={retry.error?.message ?? "Tu chef no pudo armar el menú."} onRetry={() => retry.mutate(menu.id)} />
                        ) : (
                              <>
                                    {menu.days.map((day) => (
                                          <section key={day.date} aria-labelledby={`d-${day.date}`} className="flex flex-col gap-2">
                                                <h2 id={`d-${day.date}`} className={`text-title font-extrabold first-letter:uppercase ${day.date === today ? "text-primary-strong" : "text-ink"}`}>
                                                      {dayName(day.date)}
                                                      {day.date === today && " · hoy"}
                                                </h2>
                                                {day.entries.length === 0 ? (
                                                      <p className="rounded-card border-2 border-dashed border-line p-3 text-sm text-ink-muted">Sin recetas</p>
                                                ) : (
                                                      <EntryList entries={day.entries} onEdit={setEditingId} />
                                                )}
                                          </section>
                                    ))}
                                    {menu.otherEntries && (
                                          <section aria-labelledby="other" className="flex flex-col gap-2">
                                                <h2 id="other" className="text-title font-extrabold text-ink">
                                                      Otras fechas
                                                </h2>
                                                <EntryList entries={menu.otherEntries} onEdit={setEditingId} withDate />
                                          </section>
                                    )}

                                    {toList.error && <FormAlert>{toList.error.message}</FormAlert>}
                                    {toList.data && (
                                          <p role="status" className="rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                                                Agregué {plural(toList.data.added, "ingrediente", "ingredientes")} a tu lista.{" "}
                                                <Link to="/compras" className="underline underline-offset-4">
                                                      Ver lista
                                                </Link>
                                          </p>
                                    )}
                                    <Button size="lg" loading={toList.isPending} disabled={entries.length === 0} onClick={() => toList.mutate(menu.id)}>
                                          <Icon name="cart" className="size-5" />
                                          Generar lista de compras
                                    </Button>
                                    <Link to="/recetas?ver=explorar" className={`${buttonBase} ${buttonVariants.secondary} min-h-12 text-sm`}>
                                          Buscar recetas para la semana
                                    </Link>
                                    <Button variant="tertiary" onClick={() => setRenewing(true)} className="self-center text-ink-muted!">
                                          <Icon name="refresh" className="size-4" />
                                          Armar otro menú
                                    </Button>
                              </>
                        )}
                  </main>
                  {menu && (
                        <Dialog
                              open={renewing}
                              onClose={() => setRenewing(false)}
                              title="¿Armar otro menú?"
                              actions={
                                    <>
                                          <Button variant="soft" onClick={() => setRenewing(false)}>
                                                Cancelar
                                          </Button>
                                          <Button loading={regenerate.isPending} onClick={() => regenerate.mutate(menu.id, { onSuccess: () => setRenewing(false) })}>
                                                Sí, otro menú
                                          </Button>
                                    </>
                              }
                        >
                              <p className="text-ink-muted">Tu chef cambia por otras las recetas de hoy en adelante, también las que pusiste tú. Tu lista de compras no cambia.</p>
                              {regenerate.error && <FormAlert>{regenerate.error.message}</FormAlert>}
                        </Dialog>
                  )}
                  {menu && editing && <EntryDialog key={editing.id} menu={menu} entry={editing} onClose={() => setEditingId(null)} />}
            </>
      );
}

function EntryList({ entries, onEdit, withDate = false }: { entries: MenuEntry[]; onEdit: (id: string) => void; withDate?: boolean }) {
      return (
            <ul className="flex flex-col gap-2">
                  {entries.map((entry) => (
                        <li key={entry.id} className="flex items-center gap-3 rounded-card bg-card p-3 shadow-soft">
                              <span className="size-14 shrink-0 overflow-hidden rounded-full bg-field">
                                    <Photo url={entry.recipe?.imageUrl} width={112} height={112} className="size-full object-cover" fallback={<DishPlate seed={entry.id} className="size-full" />} />
                              </span>
                              <Link to={entry.recipe ? `/recetas/${entry.recipe.id}` : "#"} className="min-w-0 flex-1 focus-visible:outline-2 focus-visible:outline-primary-strong">
                                    <span className="block truncate font-bold text-ink">{entry.recipe?.title ?? "Receta no disponible"}</span>
                                    <span className="block truncate text-xs font-semibold text-ink-muted">
                                          {[withDate && dayName(entry.date), slotLabel(entry.slot), entry.recipe && formatKcal(entry.recipe)].filter(Boolean).join(" · ")}
                                    </span>
                              </Link>
                              <button
                                    type="button"
                                    aria-label={`Cambiar ${entry.recipe?.title ?? "receta"}`}
                                    onClick={() => onEdit(entry.id)}
                                    className="grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-field focus-visible:outline-2 focus-visible:outline-primary-strong"
                              >
                                    <Icon name="edit" className="size-5" />
                              </button>
                        </li>
                  ))}
            </ul>
      );
}

function EntryDialog({ menu, entry, onClose }: { menu: WeekMenu; entry: MenuEntry; onClose: () => void }) {
      const { patch, remove } = useMenuMutations();
      const [date, setDate] = useState(entry.date);
      const [slot, setSlot] = useState(entry.slot);
      const [servings, setServings] = useState(entry.servings);
      const error = patch.error ?? remove.error;
      const save = () => {
            const changes = {
                  ...(date !== entry.date ? { date } : {}),
                  ...(slot !== entry.slot ? { slot } : {}),
                  ...(servings !== entry.servings ? { servings } : {}),
            };
            if (Object.keys(changes).length === 0) return onClose();
            patch.mutate({ menuId: menu.id, entryId: entry.id, patch: changes }, { onSuccess: onClose });
      };
      return (
            <Dialog
                  open
                  variant="sheet"
                  onClose={onClose}
                  title={entry.recipe?.title ?? "Receta"}
                  actions={
                        <>
                              <Button variant="soft" loading={remove.isPending} onClick={() => remove.mutate({ menuId: menu.id, entryId: entry.id }, { onSuccess: onClose })}>
                                    Quitar
                              </Button>
                              <Button loading={patch.isPending} onClick={save}>
                                    Guardar
                              </Button>
                        </>
                  }
            >
                  <div className="flex flex-col gap-4">
                        <Chips label="Día" options={menu.days.map((d) => ({ id: d.date, label: dayName(d.date) }))} value={date} onChange={setDate} />
                        <Chips label="Comida" options={slots} value={slot} onChange={setSlot} />
                        <Stepper label="Porciones" value={servings} min={1} max={20} onChange={setServings} suffix="porciones" />
                        {error && <p className="text-sm font-semibold text-error">{error.message}</p>}
                  </div>
            </Dialog>
      );
}
