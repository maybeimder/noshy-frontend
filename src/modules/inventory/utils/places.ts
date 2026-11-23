import type { StoragePlace } from "@/shared/types/api";

export const placeOptions: { id: StoragePlace; label: string }[] = [
      { id: "fridge", label: "Nevera" },
      { id: "pantry", label: "Alacena" },
      { id: "freezer", label: "Congelador" },
];
