import { hash, recipeColorFor } from "@/shared/lib/tones";

// Flat top-down dishes from ref/Recetas.png. Fill colours are the vivid accent tokens (CSS vars).
const c = {
      plate: "var(--color-plate)",
      cream: "var(--color-cream)",
      tomato: "var(--color-tomato)",
      salmon: "var(--color-salmon)",
      noodle: "var(--color-noodle)",
      leaf: "var(--color-leaf)",
      orange: "var(--color-secondary)",
};

function Tomatoes() {
      const slices = [
            [82, 78],
            [124, 92],
            [96, 124],
      ];
      return (
            <>
                  <circle cx="100" cy="100" r="74" fill={c.cream} />
                  {slices.map(([x, y]) => (
                        <g key={`${x}-${y}`}>
                              <circle cx={x} cy={y} r="24" fill={c.tomato} />
                              <circle cx={x} cy={y} r="17" fill={c.salmon} />
                              <ellipse cx={x! - 6} cy={y! - 3} rx="3.5" ry="2.2" fill={c.cream} />
                              <ellipse cx={x! + 5} cy={y! + 4} rx="3.5" ry="2.2" fill={c.cream} />
                              <circle cx={x! + 13} cy={y! - 15} r="2.5" fill={c.orange} />
                        </g>
                  ))}
                  <ellipse cx="62" cy="112" rx="9" ry="4.5" transform="rotate(40 62 112)" fill={c.leaf} />
                  <ellipse cx="126" cy="60" rx="9" ry="4.5" transform="rotate(-20 126 60)" fill={c.leaf} />
                  <ellipse cx="140" cy="126" rx="9" ry="4.5" transform="rotate(-50 140 126)" fill={c.leaf} />
            </>
      );
}

function Soup() {
      const pieces = [
            [78, 86, 20],
            [104, 76, -30],
            [118, 100, 10],
            [90, 112, -15],
            [112, 124, 35],
      ];
      return (
            <>
                  <circle cx="100" cy="100" r="74" fill={c.salmon} />
                  {pieces.map(([x, y, r]) => (
                        <rect
                              key={`${x}-${y}`}
                              x={x! - 13}
                              y={y! - 6}
                              width="26"
                              height="12"
                              rx="6"
                              transform={`rotate(${r} ${x} ${y})`}
                              fill={c.noodle}
                        />
                  ))}
                  <ellipse cx="72" cy="112" rx="6" ry="3" transform="rotate(30 72 112)" fill={c.leaf} />
                  <ellipse cx="128" cy="78" rx="6" ry="3" transform="rotate(-30 128 78)" fill={c.leaf} />
            </>
      );
}

function Spaghetti() {
      return (
            <>
                  <circle cx="100" cy="100" r="74" fill={c.cream} />
                  {[66, 56, 46, 36].map((r) => (
                        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke={c.noodle} strokeWidth="7" />
                  ))}
                  <circle cx="100" cy="100" r="22" fill={c.tomato} />
                  <circle cx="94" cy="94" r="6" fill={c.salmon} />
                  <ellipse cx="110" cy="92" rx="8" ry="4" transform="rotate(-30 110 92)" fill={c.leaf} />
            </>
      );
}

const dishes = [Tomatoes, Soup, Spaghetti];

/** Plate on its own (square SVG). */
export function DishPlate({ seed, className = "" }: { seed: string; className?: string }) {
      const Dish = dishes[hash(seed + "dish") % dishes.length]!;
      return (
            <svg aria-hidden viewBox="0 0 200 200" className={className}>
                  <circle cx="100" cy="100" r="96" fill={c.plate} />
                  <Dish />
            </svg>
      );
}

type DishCoverProps = {
      seed: string;
      className?: string;
      /** "card": plate peeking from the bottom (grid cards) · "hero": large plate (detail header). */
      layout?: "card" | "hero";
};

/** Illustrated cover: the recipe's vivid colour with its plate. */
export default function DishCover({ seed, className = "", layout = "card" }: DishCoverProps) {
      return (
            <div aria-hidden className={`relative overflow-hidden ${recipeColorFor(seed)} ${className}`}>
                  <DishPlate
                        seed={seed}
                        className={
                              layout === "hero"
                                    ? "absolute top-6 left-1/2 w-[92%] max-w-md -translate-x-1/2"
                                    : "absolute top-[10%] left-1/2 w-[84%] -translate-x-1/2"
                        }
                  />
            </div>
      );
}
