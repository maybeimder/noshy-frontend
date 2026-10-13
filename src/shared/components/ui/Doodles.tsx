// Hand-drawn accents from the home reference. Purely decorative: always aria-hidden.
type DoodleProps = { className?: string };

const stroke = {
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
};

/** Wavy underline; stretch it under a word with w-full. */
export function Squiggle({ className = "" }: DoodleProps) {
      return (
            <svg aria-hidden viewBox="0 0 100 12" preserveAspectRatio="none" className={className} {...stroke} strokeWidth={4}>
                  <path d="M2 8 C 14 2, 22 2, 34 7 S 56 12, 68 6 S 88 1, 98 6" vectorEffect="non-scaling-stroke" />
            </svg>
      );
}

export function Star({ className = "" }: DoodleProps) {
      return (
            <svg aria-hidden viewBox="0 0 24 24" className={className} {...stroke} strokeWidth={1.75}>
                  <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" />
            </svg>
      );
}

/** Three wavy lines, like steam over a dish. */
export function Steam({ className = "" }: DoodleProps) {
      return (
            <svg aria-hidden viewBox="0 0 24 32" className={className} {...stroke} strokeWidth={2}>
                  <path d="M6 30c-3-4 3-7 0-11s3-7 0-11" />
                  <path d="M12 26c-3-4 3-7 0-11s3-7 0-11" />
                  <path d="M18 30c-3-4 3-7 0-11s3-7 0-11" />
            </svg>
      );
}

export function Sparkle({ className = "" }: DoodleProps) {
      return (
            <svg aria-hidden viewBox="0 0 24 24" className={className} {...stroke} strokeWidth={2}>
                  <path d="M12 4v16M4 12h16" />
            </svg>
      );
}
