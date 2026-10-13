// Tone families from DESIGN.md › Paleta ampliada: a soft surface plus the text colour that reads on it.
export const tones = {
      peach: { soft: "bg-peach-soft", ink: "text-peach-ink" },
      rose: { soft: "bg-rose-soft", ink: "text-rose-ink" },
      mustard: { soft: "bg-mustard-soft", ink: "text-mustard-ink" },
      sky: { soft: "bg-sky-soft", ink: "text-sky-ink" },
      mint: { soft: "bg-mint-soft", ink: "text-mint-ink" },
      olive: { soft: "bg-olive-soft", ink: "text-olive-ink" },
      lilac: { soft: "bg-lilac-soft", ink: "text-lilac-ink" },
} as const;

export type Tone = keyof typeof tones;

const order: Tone[] = ["peach", "sky", "rose", "mustard", "olive", "mint", "lilac"];

export const hash = (value: string) => [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

/** Same input, same tone — so an ingredient keeps its colour across screens. */
export const toneFor = (seed: string): Tone => order[hash(seed.trim().toLowerCase()) % order.length]!;

/** Vivid recipe colours (cover backgrounds, history squares). */
export const recipeColors = ["bg-tomato", "bg-plum", "bg-mustard", "bg-salmon"] as const;
export const recipeColorFor = (id: string) => recipeColors[hash(id) % recipeColors.length]!;
