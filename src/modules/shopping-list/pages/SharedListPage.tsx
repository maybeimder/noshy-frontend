import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Icon from "@/shared/components/ui/Icon";
import Logo from "@/shared/components/ui/Logo";
import { ErrorState } from "@/shared/components/ui/QueryState";
import { formatMoney } from "@/shared/lib/format";
import { SharedListSkeleton } from "../components/ShoppingSkeleton";
import { shoppingListApi } from "../api/shopping-list.api";

/** Public view of a shared list: no session needed. */
export default function SharedListPage() {
      const { token = "" } = useParams();
      const list = useQuery({ queryKey: ["sharedList", token], queryFn: () => shoppingListApi.shared(token) });

      return (
            <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-5 bg-canvas px-5 py-8">
                  <Logo />
                  <h1 className="text-page font-extrabold text-ink">Lista de compras</h1>
                  {list.isPending ? (
                        <SharedListSkeleton />
                  ) : list.isError ? (
                        <ErrorState message={list.error.message} />
                  ) : (
                        <>
                              <p className="text-sm font-semibold text-ink-muted">
                                    {list.data.progress.inCart} de {list.data.progress.total} en el carrito · {formatMoney(list.data.estimated)} aprox.
                              </p>
                              {list.data.groups.map((group) => (
                                    <section key={group.id} aria-labelledby={`g-${group.id}`} className="rounded-card bg-card p-4 shadow-soft">
                                          <h2 id={`g-${group.id}`} className="text-title font-extrabold text-ink">
                                                {group.label}
                                          </h2>
                                          <ul className="divide-y divide-line">
                                                {group.items.map((item, i) => (
                                                      <li key={i} className="flex items-center gap-3 py-2">
                                                            <Icon name={item.checked ? "check" : "minus"} className={`size-5 shrink-0 ${item.checked ? "text-mint-ink" : "text-line"}`} />
                                                            <span className={`flex-1 font-bold ${item.checked ? "text-ink-muted line-through" : "text-ink"}`}>{item.label}</span>
                                                            <span className="text-sm font-semibold text-ink-muted">{item.quantity}</span>
                                                      </li>
                                                ))}
                                          </ul>
                                    </section>
                              ))}
                        </>
                  )}
            </main>
      );
}
