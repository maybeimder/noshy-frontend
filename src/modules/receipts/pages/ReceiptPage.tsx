import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInvalidatePantry } from "@/modules/inventory/hooks/useInventory";
import PageHeader from "@/shared/components/layout/PageHeader";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import { formatDate, formatMoney, plural } from "@/shared/lib/format";
import ReceiptSkeleton, { ReceiptItemsSkeleton } from "../components/ReceiptSkeleton";
import { receiptsApi, type Receipt } from "../api/receipts.api";

const failures: Record<NonNullable<Receipt["failureReason"]>, string> = {
      unreadable: "No pude leerla. Prueba con más luz y la factura completa en la foto.",
      notAReceipt: "Esto no parece una factura.",
      unsupportedStore: "Todavía no conozco las facturas de esa tienda.",
};

export default function ReceiptPage() {
      const { id = "" } = useParams();
      const queryClient = useQueryClient();
      const invalidatePantry = useInvalidatePantry();
      const receipt = useQuery({
            queryKey: ["receipt", id],
            queryFn: () => receiptsApi.get(id),
            refetchInterval: ({ state }) => (state.data?.status === "processing" ? 2000 : false),
      });
      const parsed = receipt.data?.status === "parsed";
      const items = useQuery({ queryKey: ["receipt", id, "items"], queryFn: () => receiptsApi.items(id), enabled: parsed });
      const toggle = useMutation({
            mutationFn: receiptsApi.setItem,
            onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: ["receipt", id] }), invalidatePantry()]),
      });

      // A finished receipt already filled the pantry.
      useEffect(() => {
            if (parsed) void invalidatePantry();
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [parsed]);

      const r = receipt.data;
      return (
            <>
                  <PageHeader
                        title={r?.store ? `Tu factura de ${r.store.name}` : "Tu factura"}
                        backTo="/despensa"
                        subtitle={r?.total ? [r.purchasedAt && formatDate(r.purchasedAt), formatMoney(r.total), plural(r.itemsCount ?? 0, "producto", "productos")].filter(Boolean).join(" · ") : undefined}
                  />
                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                        {receipt.isPending ? (
                              <ReceiptSkeleton />
                        ) : receipt.isError ? (
                              <ErrorState message={receipt.error.message} onRetry={() => receipt.refetch()} />
                        ) : r?.status === "processing" ? (
                              <>
                                    <p role="status" className="rounded-control bg-lilac-soft p-3 text-sm font-bold text-lilac-ink">
                                          Leyendo tu factura…
                                    </p>
                                    <ReceiptItemsSkeleton />
                              </>
                        ) : r?.status === "failed" ? (
                              <EmptyState icon="receipt" title="No pude con esta factura" description={failures[r.failureReason ?? "unreadable"]} />
                        ) : (
                              <>
                                    <p className="rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                                          Agregué {plural(r?.pantryAdded ?? 0, "producto", "productos")} a tu despensa
                                          {r?.learned?.brandsCount ? ` y aprendí ${plural(r.learned.brandsCount, "marca", "marcas")}` : ""}.
                                    </p>
                                    {toggle.error && <p className="text-sm font-semibold text-error">{toggle.error.message}</p>}
                                    {items.isPending ? (
                                          <ReceiptItemsSkeleton count={r?.itemsCount ?? 5} />
                                    ) : items.isError ? (
                                          <ErrorState message={items.error.message} onRetry={() => items.refetch()} />
                                    ) : (
                                          <ul className="divide-y divide-line rounded-card bg-card px-4 shadow-soft">
                                                {items.data.items.map((item) => (
                                                      <li key={item.id} className="flex items-center gap-3 py-3">
                                                            <span className="min-w-0 flex-1">
                                                                  <span className="block truncate font-bold text-ink">{item.label ?? item.rawLabel}</span>
                                                                  <span className="block truncate text-xs font-semibold text-ink-muted">{[item.brand, formatMoney(item.price)].filter(Boolean).join(" · ")}</span>
                                                            </span>
                                                            {item.ingredientId ? (
                                                                  <label className="flex min-h-11 items-center gap-2 text-xs font-bold text-ink">
                                                                        A mi despensa
                                                                        <input
                                                                              type="checkbox"
                                                                              checked={item.addToPantry}
                                                                              disabled={toggle.isPending}
                                                                              onChange={(e) => toggle.mutate({ id, itemId: item.id, addToPantry: e.target.checked })}
                                                                              className="size-6 accent-primary-strong"
                                                                        />
                                                                  </label>
                                                            ) : (
                                                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-muted">
                                                                        <Icon name="info" className="size-4" />
                                                                        No es comida
                                                                  </span>
                                                            )}
                                                      </li>
                                                ))}
                                          </ul>
                                    )}
                              </>
                        )}
                  </main>
            </>
      );
}
