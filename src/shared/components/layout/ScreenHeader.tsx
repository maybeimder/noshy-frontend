import type { ReactNode } from "react";
import type { IconName } from "../ui/Icon";
import { MarkerText, TitleIcon } from "../ui/ScribbleText";
import { SkText } from "../ui/Skeleton";

type ScreenHeaderProps = {
      title: string;
      /** The line over the title; null while it loads. It always keeps its place, so titles line up across screens. */
      eyebrow: string | null;
      icon?: IconName;
      /** Instead of the icon (the chef's face). */
      leading?: ReactNode;
      /** Round buttons, 48 px. */
      actions?: ReactNode;
      /** Under the title row: section tabs. */
      children?: ReactNode;
      className?: string;
};

/** Header of the main screens (Mi cocina and its sections, Comunidad, Tu chef): same place and size for everything. */
export default function ScreenHeader({ title, eyebrow, icon, leading, actions, children, className = "" }: ScreenHeaderProps) {
      return (
            <header className={`mx-auto flex max-w-xl flex-col gap-4 px-5 pt-6 pb-3 ${className}`}>
                  <div className="flex h-14 items-center gap-3">
                        <div className="min-w-0 flex-1">
                              {eyebrow === null ? <SkText size="sm" w="w-32" /> : <p className="h-5 truncate text-sm leading-5 text-ink-muted">{eyebrow}</p>}
                              <h1 className="flex h-9 items-center gap-2 text-[1.75rem] leading-9 whitespace-nowrap text-ink">
                                    {leading ?? (icon && <TitleIcon name={icon} />)}
                                    <span className="min-w-0 truncate">
                                          <MarkerText>{title}</MarkerText>
                                    </span>
                              </h1>
                        </div>
                        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                  </div>
                  {children}
            </header>
      );
}
