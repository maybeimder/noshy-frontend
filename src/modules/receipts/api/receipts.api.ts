import { api, unwrap } from "@/shared/lib/axios";
import type { Money } from "@/shared/types/api";

export type Receipt = {
      id: string;
      status: "processing" | "parsed" | "failed";
      store: { id: string; name: string } | null;
      purchasedAt: string | null;
      total: Money | null;
      itemsCount: number | null;
      learned: { brandsCount: number; productsCount: number } | null;
      pantryAdded: number | null;
      failureReason: "unreadable" | "notAReceipt" | "unsupportedStore" | null;
};
export type ReceiptItem = { id: string; rawLabel: string; label: string | null; brand: string | null; price: Money; ingredientId: string | null; addToPantry: boolean };

export const receiptsApi = {
      upload: (file: File) => {
            const form = new FormData();
            form.append("file", file);
            return api.post<{ data: { receiptId: string } }>("/me/receipts", form).then(unwrap);
      },
      get: (id: string) => api.get<{ data: Receipt }>(`/me/receipts/${id}`).then(unwrap),
      items: (id: string) => api.get<{ data: { receipt: Receipt; items: ReceiptItem[] } }>(`/me/receipts/${id}/items`).then(unwrap),
      setItem: ({ id, itemId, addToPantry }: { id: string; itemId: string; addToPantry: boolean }) =>
            api.patch<{ data: ReceiptItem }>(`/me/receipts/${id}/items/${itemId}`, { addToPantry }).then(unwrap),
};
