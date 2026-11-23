import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { buttonCore, buttonVariants } from "@/shared/components/ui/Button";
import { DishPlate, type DishName } from "@/shared/components/ui/DishArt";
import { Sparkle, Star } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import Mascot from "@/shared/components/ui/Mascot";
import { BrandRing, MascotAvatar } from "@/shared/components/ui/MascotBubble";

// Dishes orbiting the chef: position (% of the stage), diameter (% of its width), ring.
const orbit: { dish: DishName; x: number; y: number; size: number; ring: "pink" | "white" }[] = [
      { dish: "bibimbap", x: 4, y: 6, size: 30, ring: "white" },
      { dish: "curry", x: 68, y: 2, size: 27, ring: "pink" },
      { dish: "tacos", x: 0, y: 60, size: 29, ring: "white" },
      { dish: "poke", x: 36, y: 74, size: 22, ring: "white" },
      { dish: "pasta", x: 66, y: 58, size: 32, ring: "pink" },
];

// First screen for guests: the chef among dishes, one action to create it, a quiet way to sign in.
export default function WelcomePage() {
      const location = useLocation();

      return (
            <div className="min-h-dvh overflow-x-clip bg-plum-glow text-card">
                  <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-6 pb-8">
                        <header className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                    <span className="grid size-10 place-items-center rounded-full bg-card">
                                          <Mascot className="mt-1 size-9" />
                                    </span>
                                    <span className="font-display text-section font-extrabold tracking-tight">
                                          Noshy<span className="text-primary">.</span>
                                    </span>
                              </span>
                              <Link
                                    to="/login"
                                    state={location.state}
                                    className="inline-flex min-h-11 items-center rounded-full bg-card/15 px-4 text-sm font-extrabold text-card transition-colors hover:bg-card/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
                              >
                                    Iniciar sesión
                              </Link>
                        </header>

                        <div aria-hidden className="relative mx-auto mt-6 aspect-square w-full max-w-sm">
                              <Star className="absolute top-[42%] left-[30%] size-5 rotate-12 text-primary/80" />
                              <Sparkle className="absolute top-[30%] right-[6%] size-4 text-secondary" />
                              {orbit.map(({ dish, x, y, size, ring }, index) => (
                                    <span
                                          key={dish}
                                          className={`welcome-pop absolute grid place-items-center rounded-full p-[3px] shadow-[0_16px_30px_-14px_rgb(0_0_0/0.6)] ${ring === "pink" ? "bg-brand" : "bg-card"}`}
                                          style={{ left: `${x}%`, top: `${y}%`, width: `${size}%`, "--delay": `${120 + index * 90}ms` } as CSSProperties}
                                    >
                                          <span className="block aspect-square w-full overflow-hidden rounded-full border-4 border-plum">
                                                <DishPlate seed={dish} dish={dish} className="size-full" />
                                          </span>
                                    </span>
                              ))}
                              <div className="welcome-pop absolute top-1/2 left-1/2 w-[38%] -translate-x-1/2 -translate-y-1/2" style={{ "--delay": "0ms" } as CSSProperties}>
                                    <span className="block rounded-full bg-primary/25 p-2">
                                          <BrandRing className="aspect-square w-full p-1">
                                                <MascotAvatar tone="white" className="size-full" />
                                          </BrandRing>
                                    </span>
                                    <span className="absolute -top-3 -right-10 rotate-3 rounded-full rounded-bl-md bg-card px-3 py-1.5 font-display text-sm font-extrabold text-ink shadow-soft">
                                          ¡Hola!
                                    </span>
                              </div>
                        </div>

                        <div className="mt-auto pt-6">
                              <h1 className="text-[2.25rem] leading-[1.1] font-extrabold text-balance">Tu chef personal que aprende contigo.</h1>
                              <p className="mt-3 text-base text-card/80">Sin dietas rígidas: aprende de lo que cocinas, compras y disfrutas.</p>
                              <Link
                                    to="/registro"
                                    state={location.state}
                                    className={`${buttonCore} ${buttonVariants.primary} mt-8 min-h-14 w-full justify-between py-2 pr-4 text-title`}
                              >
                                    Crear mi chef
                                    {/* White disc with a pink arrow: reads on plum without a second translucent layer. */}
                                    <span className="-mr-2 grid size-10 place-items-center rounded-full bg-card text-primary-strong">
                                          <Icon name="arrowRight" className="size-5" strokeWidth={2.5} />
                                    </span>
                              </Link>
                        </div>
                  </main>
            </div>
      );
}
