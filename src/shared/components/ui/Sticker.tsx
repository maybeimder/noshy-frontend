import type { ReactNode } from "react";

type StickerProps = {
      children: ReactNode;
      tone?: "white" | "mustard";
      /** Tilt in degrees, like a hand-placed label. */
      tilt?: -6 | -3 | 0 | 3 | 6;
      className?: string;
};

const tilts = { [-6]: "-rotate-6", [-3]: "-rotate-3", 0: "", 3: "rotate-3", 6: "rotate-6" } as const;

// "¡Te extrañé!", "Sin camarón": ink outline with a hard offset shadow (DESIGN.md › Formas).
export default function Sticker({ children, tone = "white", tilt = -3, className = "" }: StickerProps) {
      return (
            <span
                  className={`sticker inline-block rounded-control px-3 py-1 font-display text-sm font-extrabold whitespace-nowrap text-ink ${
                        tone === "white" ? "bg-card" : "bg-mustard"
                  } ${tilts[tilt]} ${className}`}
            >
                  {children}
            </span>
      );
}
