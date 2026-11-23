import { dayToDate } from "@/shared/lib/format";
import type { MealSlotId } from "@/shared/types/api";

export const slots: { id: MealSlotId; label: string }[] = [
      { id: "breakfast", label: "Desayuno" },
      { id: "snack1", label: "Snack 1" },
      { id: "lunch", label: "Almuerzo" },
      { id: "snack2", label: "Snack 2" },
      { id: "dinner", label: "Cena" },
];
export const slotLabel = (slot: MealSlotId) => slots.find((s) => s.id === slot)?.label ?? slot;

const format = new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric" });
/** «lun 19». */
export const dayName = (day: string) => format.format(dayToDate(day)).replace(",", "");
