import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { Profile } from "@/modules/plans/types";
import Avatar from "@/shared/components/ui/Avatar";
import Icon from "@/shared/components/ui/Icon";
import { BrandRing } from "@/shared/components/ui/MascotBubble";
import { Sk } from "@/shared/components/ui/Skeleton";
import { formatNumber } from "@/shared/lib/format";

const since = new Intl.DateTimeFormat("es", { month: "long" });

/** Avatar in the pink ring, name, «desde agosto», then the three stat tiles. */
export default function ProfileHeader({ profile }: { profile?: Profile | null }) {
      const { user } = useAuth();
      const name = profile?.user.displayName ?? [user?.name, user?.lastName].filter(Boolean).join(" ");
      const stats = [
            { label: "Cocinadas", value: profile && formatNumber(profile.stats.cookedCount), tone: "bg-peach-soft text-peach-ink" },
            { label: "Publicadas", value: profile && formatNumber(profile.stats.publishedCount), tone: "bg-rose-soft text-rose-ink" },
            { label: "Racha", value: profile && `${profile.stats.streakWeeks} sem`, tone: "bg-mustard-soft text-mustard-ink", icon: true },
      ];

      return (
            <header className="mx-auto max-w-xl px-5 pt-6">
                  <div className="flex items-center gap-4">
                        <BrandRing className="size-20 p-1">
                              <span className="rounded-full bg-canvas p-0.5">
                                    <Avatar name={user?.name ?? ""} url={profile?.user.avatarUrl ?? user?.avatarUrl} size="md" />
                              </span>
                        </BrandRing>
                        <div className="min-w-0 flex-1">
                              <h1 className="truncate text-section leading-tight font-extrabold text-ink">{name}</h1>
                              {profile === undefined ? (
                                    <span className="flex h-5 items-center">
                                          <Sk className="h-3 w-44 rounded-full" />
                                    </span>
                              ) : (
                                    <p className="text-sm font-semibold text-ink-muted">
                                          {profile ? `Cocinando con Noshy desde ${since.format(new Date(profile.user.memberSince))}` : user?.email}
                                    </p>
                              )}
                        </div>
                        <Link
                              to="/ajustes"
                              aria-label="Ajustes"
                              className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-ink shadow-soft hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                        >
                              <Icon name="gear" />
                        </Link>
                  </div>
                  {/* null: the onboarding is not finished, so there are no stats. */}
                  {profile !== null && user?.onboardingStatus === "completed" && (
                        <dl className="mt-5 grid grid-cols-3 gap-3">
                              {stats.map(({ label, value, tone, icon }) => (
                                    <div key={label} className={`flex flex-col-reverse rounded-card px-3 py-3 ${tone}`}>
                                          <dt className="text-sm font-bold">{label}</dt>
                                          <dd className="flex h-9 items-center gap-0.5 font-display text-[1.375rem] font-extrabold whitespace-nowrap text-ink tabular-nums">
                                                {value ?? <Sk className="h-5 w-12 rounded-full" />}
                                                {icon && value && <Icon name="flame" className="size-5 text-tomato" strokeWidth={2} />}
                                          </dd>
                                    </div>
                              ))}
                        </dl>
                  )}
            </header>
      );
}
