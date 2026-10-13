import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateShoppingList } from "@/modules/shopping-list/hooks/useShoppingList";
import type { ShoppingListRequest } from "@/modules/shopping-list/types";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import Stepper from "@/shared/components/ui/Stepper";
import type { Recipe } from "../types";

type ShoppingListDialogProps = {
      recipe: Recipe;
      /** Own recipes are looked up by id; others are sent inline. */
      own: boolean;
      open: boolean;
      onClose: () => void;
};

export default function ShoppingListDialog({ recipe, own, open, onClose }: ShoppingListDialogProps) {
      const navigate = useNavigate();
      const create = useCreateShoppingList();
      const [servings, setServings] = useState(1);

      const request: ShoppingListRequest = {
            recipes: [
                  own
                        ? { recipeId: recipe.id, servings }
                        : { title: recipe.title, ingredients: recipe.ingredients, servings },
            ],
      };

      return (
            <Dialog
                  open={open}
                  onClose={onClose}
                  title="Lista de compras"
                  actions={
                        <>
                              <Button variant="tertiary" onClick={onClose}>
                                    Cancelar
                              </Button>
                              <Button
                                    loading={create.isPending}
                                    onClick={() => create.mutate(request, { onSuccess: () => navigate("/compras") })}
                              >
                                    Crear lista
                              </Button>
                        </>
                  }
            >
                  <div className="flex flex-col gap-4">
                        <p className="text-ink-muted">
                              Calculamos lo que te falta de <strong className="text-ink">{recipe.title}</strong> según tu despensa.
                              Reemplaza tu lista actual.
                        </p>
                        <div className="flex flex-col gap-2">
                              <span className="text-sm font-semibold text-ink">¿Cuántas veces la vas a preparar?</span>
                              <Stepper label="Porciones" value={servings} onChange={setServings} max={20} suffix="veces" />
                        </div>
                        {create.error && <p className="text-sm text-error">{create.error.message}</p>}
                  </div>
            </Dialog>
      );
}
