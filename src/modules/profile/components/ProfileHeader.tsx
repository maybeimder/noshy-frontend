import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { Profile } from "@/modules/plans/types";
import Avatar from "@/shared/components/ui/Avatar";
import { Star } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import { Sk } from "@/shared/components/ui/Skeleton";
import { formatNumber } from "@/shared/lib/format";

const since = new Intl.DateTimeFormat("es", { month: "long", year: "numeric" });

/** Pink header. Without a profile yet it keeps the room of the date and the stats. */
export default function ProfileHeader({ profile }: { profile?: Profile | null }) {
      const { user } = useAuth();
      const name = profile?.user.displayName ?? [user?.name, user?.lastName].filter(Boolean).join(" ");
      const stats = [
            ["Cocinadas", profile && formatNumber(profile.stats.cookedCount)],
            ["Publicadas", profile && formatNumber(profile.stats.publishedCount)],
            ["Racha", profile && `${profile.stats.streakWeeks} sem`],
      ] as const;

      return (
            <header className="relative mx-auto max-w-xl overflow-hidden rounded-b-[2rem] bg-primary-strong px-5 pt-6 pb-8 text-card">
                  <span aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-primary/70" />
                  <span aria-hidden className="absolute -bottom-24 left-1/2 size-48 rounded-full bg-primary/40" />
                  <div className="relative flex items-center justify-between">
                        <h1 className="flex items-center gap-2 text-[1.75rem] font-extrabold">
                              Perfil
                              <Star className="size-6 -rotate-12 text-card" />
                        </h1>
                        <Link to="/ajustes" aria-label="Ajustes" className="grid size-12 place-items-center rounded-full bg-card/25 text-card hover:bg-card/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card">
                              <Icon name="sliders" />
                        </Link>
                  </div>
                  <div className="relative mt-5 flex items-center gap-4">
                        <span className="rounded-full bg-card/40 p-1">
                              <Avatar name={user?.name ?? ""} url={user?.avatarUrl} size="lg" />
                        </span>
                        <div className="min-w-0 flex-1">
                              <p className="truncate font-display text-[1.75rem] leading-tight font-extrabold">{name}</p>
                              {profile === undefined ? (
                                    <span className="flex h-5 items-center">
                                          <Sk className="h-3 w-48 rounded-full bg-card/30!" />
                                    </span>
                              ) : (
                                    <p className="truncate text-sm font-semibold">{profile ? `Cocinando con Noshy desde ${since.format(new Date(profile.user.memberSince))}` : user?.email}</p>
                              )}
                        </div>
                  </div>
                  {/* null: the onboarding is not finished, so there are no stats. */}
                  {profile !== null && user?.onboardingStatus === "completed" && (
                        <dl className="relative mt-5 grid grid-cols-3 gap-2 text-center">
                              {stats.map(([label, value]) => (
                                    <div key={label} className="flex flex-col-reverse rounded-control bg-card/20 py-2">
                                          <dt className="text-xs font-bold">{label}</dt>
                                          <dd className="flex h-6 items-center justify-center font-display text-title font-extrabold tabular-nums">{value ?? <Sk className="h-4 w-10 rounded-full bg-card/30!" />}</dd>
                                    </div>
                              ))}
                        </dl>
                  )}
            </header>
      );
}
