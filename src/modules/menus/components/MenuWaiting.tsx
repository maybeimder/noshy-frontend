import { useEffect } from "react";
import Button from "@/shared/components/ui/Button";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import { BrandRing, MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { useMenu, useMenuMutations } from "../hooks/useMenus";

const stages = [
      { id: "restrictions", label: "Revisando tus restricciones" },
      { id: "dishes", label: "Eligiendo platos que te gusten" },
      { id: "shoppingList", label: "Armando tu lista de compras" },
] as const;

/** «Tu chef está armando tu primer menú». */
export default function MenuWaiting({ menuId, onReady, onLeave }: { menuId: string; onReady: () => void; onLeave: () => void }) {
      const menu = useMenu(menuId);
      const { retry } = useMenuMutations();
      const status = menu.data?.status;
      const stage = stages.findIndex((s) => s.id === menu.data?.progress?.stage);

      useEffect(() => {
            if (status === "ready") onReady();
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [status]);

      return (
            <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-5 text-center">
                  <BrandRing className="size-32">
                        <MascotAvatar tone="white" className="size-full" />
                  </BrandRing>
                  <h1 className="text-section font-extrabold text-ink">{status === "failed" ? "No pude armar tu menú" : "Tu chef está armando tu primer menú"}</h1>
                  {status === "failed" ? (
                        <>
                              {retry.error && <FormAlert>{retry.error.message}</FormAlert>}
                              <Button size="lg" loading={retry.isPending} onClick={() => retry.mutate(menuId)}>
                                    Reintentar
                              </Button>
                        </>
                  ) : (
                        <>
                              <div
                                    role="progressbar"
                                    aria-label="Avance del menú"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={menu.data?.progress?.percent ?? 0}
                                    className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-line"
                              >
                                    <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${Math.max(5, menu.data?.progress?.percent ?? 0)}%` }} />
                              </div>
                              <ul className="flex flex-col gap-2 text-left">
                                    {stages.map((s, i) => (
                                          <li key={s.id} className={`flex items-center gap-2 font-bold ${i <= stage ? "text-ink" : "text-ink-muted"}`}>
                                                <Icon name={i < stage || status === "ready" ? "check" : "clock"} className="size-5" />
                                                {s.label}
                                          </li>
                                    ))}
                              </ul>
                        </>
                  )}
                  {menu.error && <FormAlert>{menu.error.message}</FormAlert>}
                  <Button variant="tertiary" onClick={onLeave} className="text-ink-muted">
                        Ir a Inicio
                  </Button>
            </main>
      );
}
