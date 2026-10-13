import { useState } from "react";
import Icon from "@/shared/components/ui/Icon";
import { imageVariant } from "@/shared/lib/images";
import type { Recipe } from "../types";

// Without a photo: a calm, deterministic cover per recipe, ciruela on soft surfaces.
const surfaces = ["bg-secondary-soft", "bg-primary-soft"];

const hash = (value: string) => [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

type RecipeCoverProps = {
      recipe: Pick<Recipe, "id" | "title" | "imageUrl" | "imageSource">;
      size?: "sm" | "lg";
};

export default function RecipeCover({ recipe, size = "sm" }: RecipeCoverProps) {
      const [failed, setFailed] = useState(false);
      const surface = surfaces[hash(recipe.id) % surfaces.length];
      const initial = recipe.title.trim().charAt(0).toUpperCase() || "·";
      const photo = recipe.imageUrl && !failed ? recipe.imageUrl : null;

      if (size === "sm") {
            return photo ? (
                  <img
                        src={imageVariant(photo, 128, 128)}
                        alt=""
                        loading="lazy"
                        onError={() => setFailed(true)}
                        className="size-16 shrink-0 rounded-control bg-secondary-soft object-cover"
                  />
            ) : (
                  <span
                        aria-hidden
                        className={`grid size-16 shrink-0 place-items-center rounded-control font-logo text-section font-extrabold text-ink ${surface}`}
                  >
                        {initial}
                  </span>
            );
      }

      if (photo) {
            return (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-secondary-soft">
                        <img
                              src={imageVariant(photo, 960, 540)}
                              alt={`Foto de ${recipe.title}`}
                              loading="lazy"
                              onError={() => setFailed(true)}
                              className="size-full object-cover"
                        />
                        {recipe.imageSource === "pexels" && (
                              // Shape + text, not color alone: this photo was picked automatically.
                              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-ink">
                                    <Icon name="sparkle" className="size-3.5" />
                                    Foto sugerida
                              </span>
                        )}
                  </div>
            );
      }

      return (
            <div aria-hidden className={`relative flex aspect-[5/2] items-end overflow-hidden rounded-card p-6 ${surface}`}>
                  <Icon name="bowl" className="absolute -top-2 right-2 size-32 text-ink/10" strokeWidth={1.25} />
                  <span className="font-logo text-metric font-extrabold text-ink/80">{initial}</span>
            </div>
      );
}

/** Pexels requires visible attribution with a link (backend/recommendation.md §2). */
export function PhotoCredit({ recipe }: { recipe: Pick<Recipe, "imageUrl" | "imageSource" | "imageCredit"> }) {
      if (!recipe.imageUrl || recipe.imageSource !== "pexels" || !recipe.imageCredit) return null;
      return (
            <p className="text-xs text-ink-muted">
                  Foto de{" "}
                  <a
                        href={recipe.imageCredit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong"
                  >
                        {recipe.imageCredit.name}
                  </a>{" "}
                  en{" "}
                  <a
                        href="https://www.pexels.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong"
                  >
                        Pexels
                  </a>
            </p>
      );
}
