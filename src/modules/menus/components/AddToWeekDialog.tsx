import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import Dialog from "@/shared/components/ui/Dialog";
import { Sk, SkChips, SkGroup } from "@/shared/components/ui/Skeleton";
import type { MealSlotId } from "@/shared/types/api";
import { useMenuMutations, useWeekMenu } from "../hooks/useMenus";
import { dayName, slots } from "../utils/week";

type AddToWeekDialogProps = { recipe: { id: string; title: string }; servings: number; open: boolean; onClose: () => void };

export default function AddToWeekDialog({ recipe, servings, open, onClose }: AddToWeekDialogProps) {
      return (
            <Dialog open={open} onClose={onClose} variant="sheet" title="Agregar a mi semana">
                  {open && <Form recipe={recipe} servings={servings} />}
            </Dialog>
      );
}

function Form({ recipe, servings }: { recipe: { id: string; title: string }; servings: number }) {
      const week = useWeekMenu();
      const { add } = useMenuMutations();
      const [date, setDate] = useState<string>();
      const [slot, setSlot] = useState<MealSlotId>("lunch");

      if (week.isPending)
            return (
                  <SkGroup className="flex flex-col gap-4">
                        <SkChips />
                        <SkChips />
                        <Sk className="h-14 rounded-full" />
                  </SkGroup>
            );
      if (week.isError) return <p className="text-error">{week.error.message}</p>;
      if (!week.data) return <p className="text-ink-muted">Todavía no tienes un menú semanal.</p>;
      const menu = week.data;
      const day = date ?? menu.days[0]!.date;

      if (add.isSuccess)
            return (
                  <p role="status" className="text-ink">
                        Listo, {recipe.title} quedó en tu semana.{" "}
                        <Link to="/semana" className="font-bold text-primary-strong underline underline-offset-4">
                              Ver mi semana
                        </Link>
                  </p>
            );
      return (
            <div className="flex flex-col gap-4">
                  <Chips label="Día" options={menu.days.map((d) => ({ id: d.date, label: dayName(d.date) }))} value={day} onChange={setDate} />
                  <Chips label="Comida" options={slots} value={slot} onChange={setSlot} />
                  {add.error && <p className="text-sm font-semibold text-error">{add.error.message}</p>}
                  <Button size="lg" loading={add.isPending} onClick={() => add.mutate({ menuId: menu.id, date: day, slot, recipeId: recipe.id, servings })}>
                        Agregar
                  </Button>
            </div>
      );
}
