import type { IconName } from "@/shared/components/ui/Icon";
import type { StoragePlace } from "@/shared/types/api";

export const placeOptions: { id: StoragePlace; label: string; icon: IconName }[] = [
      { id: "fridge", label: "Nevera", icon: "fridge" },
      { id: "pantry", label: "Alacena", icon: "cupboard" },
      { id: "freezer", label: "Congelador", icon: "snowflake" },
];
