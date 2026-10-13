import type { ReactNode } from "react";

type AuthLayoutProps = {
      /** Illustrated brand block above the card (differs between login and sign-up). */
      hero: ReactNode;
      title: ReactNode;
      subtitle: string;
      children: ReactNode;
      footer: ReactNode;
};

export default function AuthLayout({ hero, title, subtitle, children, footer }: AuthLayoutProps) {
      return (
            <div className="min-h-dvh overflow-x-clip bg-canvas px-5 pt-8 pb-12">
                  <main className="mx-auto flex w-full max-w-md flex-col gap-6">
                        {hero}

                        <div className="rounded-[2rem] bg-card px-6 pt-8 pb-6 shadow-[0_24px_48px_-28px_rgb(43_20_51/0.35)]">
                              <h1 className="text-page font-extrabold text-ink">{title}</h1>
                              <p className="mt-3 text-base text-ink-muted">{subtitle}</p>
                              <div className="mt-5">{children}</div>
                        </div>

                        <p className="text-center text-base text-ink-muted">{footer}</p>
                  </main>
            </div>
      );
}

export const authLinkClass =
      "font-extrabold text-primary-strong underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";
