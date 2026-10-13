import type { ReactNode } from "react";

type SectionHeaderProps = {
      id: string;
      title: string;
      highlight?: "primary" | "secondary";
      aside?: ReactNode;
};

// Marker-style highlight behind the lower half of the title.
const highlights = {
      primary: "after:bg-primary/30",
      secondary: "after:bg-secondary/40",
};

export default function SectionHeader({
      id,
      title,
      highlight = "primary",
      aside,
}: SectionHeaderProps) {
      return (
            <div className="flex items-baseline justify-between gap-4 px-6">
                  <h2 id={id} className="text-section font-bold">
                        <span
                              className={`relative isolate px-1 after:absolute after:inset-x-0 after:bottom-1.5 after:-z-10 after:h-3 after:rounded-full ${highlights[highlight]}`}
                        >
                              {title}
                        </span>
                  </h2>
                  {aside && (
                        <p className="shrink-0 text-sm text-ink-muted">{aside}</p>
                  )}
            </div>
      );
}
