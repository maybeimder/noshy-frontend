const quantityFormat = new Intl.NumberFormat("es", { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });
const dateTimeFormat = new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
});

export const formatQuantity = (quantity: number, unit: string) =>
      `${quantityFormat.format(quantity)} ${unit}`;

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));

export const plural = (count: number, one: string, many: string) =>
      `${count} ${count === 1 ? one : many}`;
