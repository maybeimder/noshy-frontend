/** Opens the chef with a recipe attached as conversation context (own or community). */
export const chefLink = (id: string, title: string) =>
      `/chef?${new URLSearchParams({ receta: id, nombre: title }).toString()}`;
