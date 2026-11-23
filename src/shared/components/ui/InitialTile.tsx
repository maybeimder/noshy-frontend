import { tones, toneFor } from "@/shared/lib/tones";

/** Ingredient initial on its own soft colour. */
export default function InitialTile({ label }: { label: string }) {
      const tone = tones[toneFor(label)];
      return (
            <span aria-hidden className={`grid size-11 shrink-0 place-items-center rounded-control font-display text-title font-extrabold ${tone.soft} ${tone.ink}`}>
                  {label.trim().charAt(0).toUpperCase()}
            </span>
      );
}
