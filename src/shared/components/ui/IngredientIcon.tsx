import { tones, toneFor } from "@/shared/lib/tones";

// Pictograms for ingredients, in the same stroke as Icon. The API sends an `icon` slug; when it is
// one we do not draw, the label decides, and as a last resort the initial stands in.
const glyphs = {
      cheese: "M3 17v-4L14 5l7 4v8ZM3 13h18M8 15.5h.01M13 15h.01M17 13.5h.01",
      pasta: "M3 12h18a9 9 0 0 1-18 0ZM7 12c0-3 2-5 5-5s5 2 5 5M9.5 12c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5",
      egg: "M12 3c3.5 0 6.5 5 6.5 10a6.5 6.5 0 0 1-13 0C5.5 8 8.5 3 12 3Z",
      leaf: "M5 19C5 10 10 5 20 4c0 10-5 15-14 15ZM5 19l8-8",
      tomato: "M12 21a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM9 5.5 12 7l3-1.5M12 7V3.5",
      grain: "M7 3h10l-1.5 18h-7ZM7.5 9h9",
      milk: "M8 3h8v3l2 3v12H6V9l2-3ZM6 12h12",
      chicken: "M15 3.5a5.5 5.5 0 0 1 3.9 9.4L15 14l-3 3-2 2a2 2 0 1 1-3-1 2 2 0 1 1-1-3l2-2 3-3 1.1-3.9A5.5 5.5 0 0 1 15 3.5Z",
      fish: "M3 12c3-4 8-6 13-3l5-3v12l-5-3c-5 3-10 1-13-3ZM15 11h.01",
      bread: "M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 1 7.9V19H7v-5.1A4 4 0 0 1 4 10Z",
      oil: "M10 3h4v3l2 3v12H8V9l2-3ZM8 13h8",
      fruit: "M12 7c-4-2-8 1-8 6 0 4 3 8 5.5 8 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5C17 21 20 17 20 13c0-5-4-8-8-6ZM12 7c0-2 1-3.5 3-4",
      garlic: "M12 4c-1 2-5 4-5 9a5 5 0 0 0 10 0c0-5-4-7-5-9ZM12 4V2M12 9v9",
      spice: "M8 8h8l1 13H7ZM9 8l1-4h4l1 4M11 12h.01M13 14.5h.01M11 17h.01",
      meat: "M5 12a7 6 0 0 1 14 0c0 4-3 7-7 7s-7-3-7-7ZM10 11a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
} as const;

type Glyph = keyof typeof glyphs;

const slugAliases: Record<string, Glyph> = {
      cheese: "cheese", pasta: "pasta", noodles: "pasta", egg: "egg", eggs: "egg", leaf: "leaf", herb: "leaf", vegetable: "leaf", greens: "leaf",
      tomato: "tomato", grain: "grain", oats: "grain", rice: "grain", milk: "milk", dairy: "milk", chicken: "chicken", poultry: "chicken",
      fish: "fish", seafood: "fish", bread: "bread", oil: "oil", fruit: "fruit", lemon: "fruit", garlic: "garlic", onion: "garlic",
      spice: "spice", salt: "spice", meat: "meat", beef: "meat", pork: "meat",
};

// Slugs with no glyph of their own: the closest one, only when the name says nothing better.
const closest: Record<string, Glyph> = {
      bottle: "milk", cup: "milk", glass: "milk", drop: "oil", honey: "oil", jar: "spice", can: "spice", pepper: "spice", drumstick: "chicken", shrimp: "fish",
      citrus: "fruit", banana: "fruit", pineapple: "fruit", avocado: "fruit", carrot: "leaf", cucumber: "leaf", sprout: "leaf", potato: "garlic",
      flour: "grain", legume: "grain", cereal: "grain", cookie: "bread", butter: "cheese", tofu: "cheese",
};

const words: [Glyph, RegExp][] = [
      ["cheese", /queso|pecorino|parmesano|mozzarella/],
      ["pasta", /pasta|rigatoni|espagueti|fideo|macarr/],
      ["egg", /huevo/],
      ["chicken", /pollo|pavo/],
      ["fish", /pescado|salm[oó]n|at[uú]n|camar[oó]n|bacalao|tilapia/],
      ["meat", /carne|res|cerdo|tocino|chorizo|jam[oó]n/],
      ["milk", /leche|bebida|crema|yogur|kumis/],
      ["oil", /aceite|vinagre|salsa/],
      ["bread", /pan\b|pan |tortilla|arepa/],
      ["grain", /avena|arroz|quinoa|harina|ma[ií]z|lenteja|frijol|garbanzo/],
      ["tomato", /tomate/],
      ["garlic", /ajo|cebolla|ajonjol[ií]/],
      ["fruit", /lim[oó]n|naranja|manzana|banano|pl[aá]tano|aguacate|fresa|mango|pi[nñ]a|fruta/],
      ["leaf", /espinaca|lechuga|cilantro|albahaca|perejil|br[oó]coli|verdura|hierba|kale/],
      ["spice", /sal\b|pimienta|comino|or[eé]gano|paprika|piment[oó]n|canela|especia/],
];

function glyphFor(icon: string | null | undefined, label: string): Glyph | null {
      if (icon && slugAliases[icon]) return slugAliases[icon]!;
      const name = label.toLowerCase();
      return words.find(([, re]) => re.test(name))?.[0] ?? (icon ? closest[icon] : undefined) ?? null;
}

type IngredientIconProps = {
      label: string;
      icon?: string | null;
      /** "tile": rounded square on its tone (rows) · "disc": white circle (cards on a tinted surface) · "bare": glyph only. */
      shape?: "tile" | "circle" | "disc" | "bare";
      /** Text colour class instead of the tone's own (e.g. to match a tinted card). */
      color?: string;
      className?: string;
};

/** The ingredient's pictogram on its own soft colour; same input, same colour across screens. */
export default function IngredientIcon({ label, icon, shape = "tile", color, className = "size-11" }: IngredientIconProps) {
      const tone = tones[toneFor(label)];
      const glyph = glyphFor(icon, label);
      return (
            <span aria-hidden className={`grid shrink-0 place-items-center font-display text-title font-extrabold ${shape === "tile" ? `rounded-control ${tone.soft}` : shape === "circle" ? `rounded-full ${tone.soft}` : shape === "disc" ? "rounded-full bg-card" : ""} ${color ?? tone.ink} ${className}`}>
                  {glyph ? (
                        <svg viewBox="0 0 24 24" className="size-[55%]" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                              <path d={glyphs[glyph]} />
                        </svg>
                  ) : (
                        label.trim().charAt(0).toUpperCase()
                  )}
            </span>
      );
}
