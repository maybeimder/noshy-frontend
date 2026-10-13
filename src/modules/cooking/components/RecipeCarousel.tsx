import type { Recipe } from "../types";
import RecipeCard from "./RecipeCard";

type RecipeCarouselProps = {
      recipes: Recipe[];
      labelledBy: string;
};

// Cards stop short of the padded viewport so the next one peeks in from the edge.
export default function RecipeCarousel({
      recipes,
      labelledBy,
}: RecipeCarouselProps) {
      return (
            <ul
                  aria-labelledby={labelledBy}
                  className="scrollbar-none flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pt-4 pb-2"
            >
                  {recipes.map((recipe) => (
                        <li key={recipe.id} className="w-[calc(100%-1rem)] shrink-0 snap-start">
                              <RecipeCard recipe={recipe} />
                        </li>
                  ))}
                  {/* Flex scrollers drop trailing padding; this restores it. */}
                  <li aria-hidden className="w-2 shrink-0" />
            </ul>
      );
}
