import Icon from "@/shared/components/ui/Icon";

// Recipes have no photos yet: a calm, deterministic cover per recipe, ciruela on soft surfaces.
const surfaces = ["bg-secondary-soft", "bg-primary-soft"];

const hash = (value: string) => [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

type RecipeCoverProps = {
      id: string;
      title: string;
      size?: "sm" | "lg";
};

export default function RecipeCover({ id, title, size = "sm" }: RecipeCoverProps) {
      const surface = surfaces[hash(id) % surfaces.length];
      const initial = title.trim().charAt(0).toUpperCase() || "·";

      return size === "sm" ? (
            <span
                  aria-hidden
                  className={`grid size-16 shrink-0 place-items-center rounded-control font-logo text-section font-extrabold text-ink ${surface}`}
            >
                  {initial}
            </span>
      ) : (
            <div
                  aria-hidden
                  className={`relative flex aspect-[5/2] items-end overflow-hidden rounded-card p-6 ${surface}`}
            >
                  <Icon
                        name="bowl"
                        className="absolute -top-2 right-2 size-32 text-ink/10"
                        strokeWidth={1.25}
                  />
                  <span className="font-logo text-metric font-extrabold text-ink/80">{initial}</span>
            </div>
      );
}
