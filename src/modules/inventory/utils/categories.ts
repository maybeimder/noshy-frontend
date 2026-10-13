// The API stores no category, so pantry filters ("Proteínas", "Lácteos"…) classify by name.
// Proposed as a real field in backend/recommendation.md §6.
export type Category = "Proteínas" | "Lácteos" | "Granos" | "Verduras" | "Frutas" | "Aceites" | "Especias" | "Otros";

const keywords: [Category, string[]][] = [
      ["Proteínas", ["pollo", "carne", "res", "cerdo", "camarón", "camaron", "pescado", "atún", "atun", "salmón", "salmon", "huevo", "guanciale", "tocino", "jamón", "jamon", "pavo", "chorizo", "tofu", "lenteja", "garbanzo", "frijol"]],
      ["Lácteos", ["leche", "queso", "pecorino", "parmesano", "mozzarella", "yogur", "mantequilla", "crema", "nata", "ricotta"]],
      ["Granos", ["pasta", "arroz", "harina", "avena", "pan", "quinoa", "maíz", "maiz", "espagueti", "fideo", "tortilla", "cuscús"]],
      ["Verduras", ["tomate", "cebolla", "ajo", "zanahoria", "lechuga", "espinaca", "brócoli", "brocoli", "pimiento", "papa", "patata", "calabacín", "pepino", "champiñón", "albahaca", "cilantro", "perejil"]],
      ["Frutas", ["manzana", "plátano", "platano", "banana", "limón", "limon", "naranja", "fresa", "aguacate", "mango", "uva", "piña"]],
      ["Aceites", ["aceite", "oliva", "vinagre", "manteca"]],
      ["Especias", ["sal", "pimienta", "comino", "orégano", "oregano", "canela", "pimentón", "paprika", "curry", "azúcar", "azucar"]],
];

const normalize = (value: string) => value.trim().toLowerCase();

export function categoryOf(name: string): Category {
      const words = normalize(name).split(/\s+/);
      for (const [category, list] of keywords) {
            if (list.some((k) => words.includes(k) || normalize(name).startsWith(k))) return category;
      }
      return "Otros";
}

export const categoryOrder: Category[] = ["Proteínas", "Lácteos", "Granos", "Verduras", "Frutas", "Aceites", "Especias", "Otros"];
