const dateFormat = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });
const numberFormat = new Intl.NumberFormat("es", { useGrouping: "always", maximumFractionDigits: 0 });
const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

/** "2200" → "2.200" (Spanish skips the separator on 4 digits by default). */
export const formatNumber = (value: number) => numberFormat.format(value);

export const formatMoney = (money: { amount: number }) => `$${numberFormat.format(money.amount)}`;

export const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** Today in the user's zone as YYYY-MM-DD, the API's day format. */
export function localDay(date = new Date()) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Local midnight of an API day. `new Date("2026-10-16")` would be UTC and land on the day before here. */
export const dayToDate = (day: string) => new Date(`${day}T00:00:00`);

export const daysUntil = (day: string) => Math.round((dayToDate(day).getTime() - dayToDate(localDay()).getTime()) / 86_400_000);

/** «hoy», «mañana», «dentro de 3 días», «ayer». */
export const relativeDay = (day: string) => relative.format(daysUntil(day), "day");

export const formatTime = (range: { min: number; max: number }) =>
      range.max <= 0 ? null : range.min === range.max || range.min <= 0 ? `${range.max} min` : `${range.min}–${range.max} min`;
