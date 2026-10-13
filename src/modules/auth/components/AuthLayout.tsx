import type { ReactNode } from "react";
import Logo from "@/shared/components/ui/Logo";

type AuthLayoutProps = {
      title: string;
      subtitle: string;
      children: ReactNode;
      footer: ReactNode;
};

export default function AuthLayout({
      title,
      subtitle,
      children,
      footer,
}: AuthLayoutProps) {
      return (
            <div className="min-h-dvh bg-canvas px-6 py-12">
                  <main className="mx-auto flex w-full max-w-sm flex-col gap-8">
                        <Logo withTagline />

                        <div className="rounded-card bg-card p-6 shadow-[0_8px_24px_-16px_rgb(29_9_44/0.25)]">
                              <h1 className="text-section font-bold text-ink">
                                    {title}
                              </h1>
                              <p className="mt-1 text-base text-ink-muted">{subtitle}</p>
                              <div className="mt-6">{children}</div>
                        </div>

                        <p className="text-center text-sm text-ink-muted">{footer}</p>
                  </main>
            </div>
      );
}
