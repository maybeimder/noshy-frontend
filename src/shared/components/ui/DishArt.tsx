import { hash, recipeColorFor } from "@/shared/lib/tones";

// Flat top-down dishes. Fill colours are the vivid accent tokens (CSS vars).
const c = {
      plate: "var(--color-plate)",
      cream: "var(--color-cream)",
      tomato: "var(--color-tomato)",
      salmon: "var(--color-salmon)",
      noodle: "var(--color-noodle)",
      leaf: "var(--color-leaf)",
      orange: "var(--color-secondary)",
      mustard: "var(--color-mustard)",
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

function Bibimbap() {
      // Rice bowl with toppings in wedges around a fried egg.
      const wedges = [c.leaf, c.orange, c.tomato, c.noodle, c.salmon];
      return (
            <>
                  <circle cx="100" cy="100" r="74" fill={c.cream} />
                  {wedges.map((fill, i) => {
                        const a0 = (i / wedges.length) * Math.PI * 2;
                        const a1 = ((i + 1) / wedges.length) * Math.PI * 2;
                        const p = (a: number, r: number) => `${100 + Math.cos(a) * r} ${100 + Math.sin(a) * r}`;
                        return <path key={fill} d={`M${p(a0, 34)} L${p(a0, 66)} A66 66 0 0 1 ${p(a1, 66)} L${p(a1, 34)} A34 34 0 0 0 ${p(a0, 34)}Z`} fill={fill} opacity="0.9" />;
                  })}
                  <circle cx="100" cy="100" r="30" fill={c.plate} />
                  <circle cx="104" cy="98" r="13" fill={c.mustard} />
            </>
      );
}

function Arepa() {
      return (
            <>
                  <circle cx="100" cy="100" r="62" fill={c.noodle} />
                  <circle cx="100" cy="100" r="62" fill="none" stroke={c.orange} strokeWidth="6" strokeDasharray="2 14" strokeLinecap="round" />
                  <ellipse cx="100" cy="100" rx="40" ry="28" fill={c.cream} />
                  <circle cx="86" cy="96" r="9" fill={c.leaf} />
                  <circle cx="112" cy="104" r="8" fill={c.tomato} />
                  <circle cx="104" cy="88" r="5" fill={c.salmon} />
            </>
      );
}

function Tacos() {
      const taco = (x: number, y: number, r: number) => (
            <g key={`${x}-${y}`} transform={`rotate(${r} ${x} ${y})`}>
                  <path d={`M${x - 34} ${y} A34 34 0 0 1 ${x + 34} ${y}Z`} fill={c.noodle} />
                  <path d={`M${x - 26} ${y} A26 22 0 0 1 ${x + 26} ${y}Z`} fill={c.leaf} />
                  <circle cx={x - 8} cy={y - 8} r="5" fill={c.tomato} />
                  <circle cx={x + 10} cy={y - 6} r="4" fill={c.cream} />
            </g>
      );
      return (
            <>
                  <circle cx="100" cy="100" r="74" fill={c.cream} />
                  {taco(78, 96, -18)}
                  {taco(124, 116, 22)}
            </>
      );
}

function Poke() {
      return (
            <>
                  <circle cx="100" cy="100" r="74" fill={c.plate} />
                  <path d="M100 100 L100 30 A70 70 0 0 1 166 80Z" fill={c.salmon} />
                  <path d="M100 100 L166 80 A70 70 0 0 1 130 163Z" fill={c.leaf} />
                  <path d="M100 100 L130 163 A70 70 0 0 1 40 140Z" fill={c.cream} />
                  <path d="M100 100 L40 140 A70 70 0 0 1 100 30Z" fill={c.orange} />
                  {[
                        [118, 62],
                        [132, 76],
                        [112, 80],
                  ].map(([x, y]) => (
                        <rect key={`${x}-${y}`} x={x! - 7} y={y! - 7} width="14" height="14" rx="3" fill={c.tomato} />
                  ))}
                  <circle cx="100" cy="100" r="14" fill={c.mustard} />
            </>
      );
}

function Pancakes() {
      return (
            <>
                  <circle cx="100" cy="104" r="60" fill={c.orange} />
                  <circle cx="100" cy="98" r="58" fill={c.noodle} />
                  <circle cx="100" cy="98" r="42" fill={c.orange} opacity="0.55" />
                  <rect x="88" y="86" width="24" height="18" rx="4" fill={c.cream} />
                  {[
                        [74, 70],
                        [128, 78],
                        [120, 128],
                        [80, 124],
                  ].map(([x, y]) => (
                        <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill={c.tomato} />
                  ))}
            </>
      );
}

function Salad() {
      const leaves = [
            [80, 80, -30],
            [120, 78, 30],
            [130, 118, 70],
            [84, 124, -70],
            [104, 100, 0],
      ];
      return (
            <>
                  <circle cx="100" cy="100" r="74" fill={c.cream} />
                  {leaves.map(([x, y, r]) => (
                        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="26" ry="14" transform={`rotate(${r} ${x} ${y})`} fill={c.leaf} />
                  ))}
                  <circle cx="96" cy="72" r="8" fill={c.tomato} />
                  <circle cx="138" cy="98" r="8" fill={c.tomato} />
                  <circle cx="70" cy="104" r="7" fill={c.mustard} />
            </>
      );
}

function Curry() {
      return (
            <>
                  <circle cx="100" cy="100" r="74" fill={c.orange} />
                  <ellipse cx="74" cy="100" rx="30" ry="40" fill={c.plate} />
                  <circle cx="126" cy="86" r="10" fill={c.salmon} />
                  <circle cx="134" cy="116" r="9" fill={c.noodle} />
                  <circle cx="114" cy="126" r="7" fill={c.salmon} />
                  <ellipse cx="128" cy="62" rx="8" ry="4" transform="rotate(-30 128 62)" fill={c.leaf} />
            </>
      );
}

export const dishArt = {
      pasta: Spaghetti,
      sopa: Soup,
      tomate: Tomatoes,
      bibimbap: Bibimbap,
      arepa: Arepa,
      tacos: Tacos,
      poke: Poke,
      pancakes: Pancakes,
      ensalada: Salad,
      curry: Curry,
};

export type DishName = keyof typeof dishArt;

const dishes = Object.values(dishArt);

/** Plate on its own (square SVG): a named dish, or one picked from the seed. */
export function DishPlate({ seed, dish, className = "" }: { seed: string; dish?: DishName; className?: string }) {
      const Dish = dish ? dishArt[dish] : dishes[hash(seed + "dish") % dishes.length]!;
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
