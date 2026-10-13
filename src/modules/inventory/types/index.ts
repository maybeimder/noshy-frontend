export type InventoryItem = {
      id: string;
      name: string;
      quantity: number;
      unit: string;
      createdAt: string;
};

export type InventoryItemInput = {
      name: string;
      quantity: number;
      unit: string;
};
