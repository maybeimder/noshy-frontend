import AppHeader from "@/shared/components/layout/AppHeader";
import CookStories from "../components/CookStories";
import RecipeCarousel from "../components/RecipeCarousel";
import SectionHeader from "../components/SectionHeader";
import { cooks, fromFavorites, todaysPicks } from "../data/home.mock";

const today = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
}).format(new Date());

export default function HomePage() {
      return (
            <div className="min-h-dvh bg-canvas">
                  <AppHeader />

                  <main className="mx-auto max-w-xl pb-12">
                        <CookStories cooks={cooks} />

                        <section aria-labelledby="todays-picks" className="mt-8">
                              <SectionHeader
                                    id="todays-picks"
                                    title="Today’s Picks"
                                    aside={`${today}.`}
                              />
                              <RecipeCarousel
                                    recipes={todaysPicks}
                                    labelledBy="todays-picks"
                              />
                        </section>

                        <section aria-labelledby="from-favorites" className="mt-12">
                              <SectionHeader
                                    id="from-favorites"
                                    title="From your favorites"
                                    highlight="secondary"
                              />
                              <RecipeCarousel
                                    recipes={fromFavorites}
                                    labelledBy="from-favorites"
                              />
                        </section>
                  </main>
            </div>
      );
}
