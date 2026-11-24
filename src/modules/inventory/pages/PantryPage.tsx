import { useState } from "react";
import { Link } from "react-router-dom";
import Photo from "@/shared/components/ui/Photo";
import NudgeCard from "@/modules/cooking/components/NudgeCard";
import { useNudge } from "@/modules/cooking/hooks/useHome";
import ReceiptScanner from "@/modules/receipts/components/ReceiptScanner";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import LoadMore from "@/shared/components/ui/LoadMore";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import { fieldClass } from "@/shared/components/ui/TextField";
import { useRememberShape } from "@/shared/hooks/useShape";
import { useDebounced } from "@/shared/hooks/useDebounced";
import { daysUntil, plural, relativeDay } from "@/shared/lib/format";
import type { StoragePlace } from "@/shared/types/api";
import AddPantryItem from "../components/AddPantryItem";
import KitchenHeader from "../components/KitchenHeader";
import PantryItemDialog from "../components/PantryItemDialog";
import PantrySkeleton, { SkPantryRows, type PantryShape } from "../components/PantrySkeleton";
import { usePantry, usePantryOverview } from "../hooks/useInventory";
import type { PantryItem } from "../types";
import { placeOptions } from "../utils/places";

const USE_SOON_DAYS = 3;

/** «Mañana», «2 días»: short, for the use-soon chips. */
function expiryLabel(day: string) {
      const days = daysUntil(day);
      return days < 0 ? "Vencido" : days === 0 ? "Hoy" : days === 1 ? "Mañana" : `${days} días`;
}

const soonLooks = [
      { card: "bg-[linear-gradient(160deg,var(--color-rose-soft),var(--color-peach-soft))]", ink: "text-rose-ink", chip: "bg-card text-primary-strong" },
      { card: "bg-[linear-gradient(160deg,var(--color-mustard-soft),color-mix(in_srgb,var(--color-secondary)_45%,var(--color-peach-soft)))]", ink: "text-mustard-ink", chip: "bg-card text-primary-strong" },
      { card: "bg-[linear-gradient(160deg,var(--color-sky-soft),var(--color-lilac-soft))]", ink: "text-lilac-ink", chip: "bg-card text-primary-strong" },
];

export default function PantryPage() {
      const [place, setPlace] = useState<StoragePlace | "all">("all");
      const [searchOpen, setSearchOpen] = useState(false);
      const [addOpen, setAddOpen] = useState(false);
      // Text carried from the pantry filter to the catalog search.
      const [addQuery, setAddQuery] = useState<string>();
      const [search, setSearch] = useState("");
      const [openId, setOpenId] = useState<string | null>(null);
      const q = useDebounced(search.trim());
      const overview = usePantryOverview();
      const pantry = usePantry({ storage: place === "all" ? undefined : place, q: q || undefined, sort: "name" });
      const nudge = useNudge("pantry");

      const items = (pantry.data?.pages ?? []).flatMap((p) => p.data);
      const opened = items.find((i) => i.id === openId) ?? null;
      const counts = overview.data?.storageCounts;
      const empty = overview.data?.totalItems === 0;
      // The blocks come from three calls: painting them one by one would push the list down.
      const loading = overview.isPending || pantry.isPending || nudge.isPending;
      useRememberShape<PantryShape>(
            "pantry",
            !loading && overview.data && place === "all" && !q
                  ? { rows: items.slice(0, 8).map((i) => ({ bar: i.remainingPct !== null })), soon: overview.data.useSoon.length, nudge: Boolean(nudge.data), empty: overview.data.totalItems === 0 }
                  : null,
      );

      return (
            <>
                  <KitchenHeader
                        title="Mi despensa"
                        meta={loading ? null : overview.data ? `${plural(overview.data.totalItems, "ingrediente", "ingredientes")} · hoy` : undefined}
                        actions={<ReceiptScanner variant="button" />}
                  />

                  {loading ? (
                  <PantrySkeleton />
                  ) : (
                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                        {searchOpen && (
                              <label className="relative">
                                    <span className="sr-only">Filtrar lo que ya tienes en tu despensa</span>
                                    <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
                                    <input
                                          autoFocus
                                          type="search"
                                          placeholder="Filtrar lo que ya tienes…"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className={`${fieldClass("card")} min-h-12 rounded-full pr-4 pl-12 shadow-soft`}
                                    />
                              </label>
                        )}

                        {(addOpen || empty) && (
                              <div className="flex flex-col gap-2">
                                    <AddPantryItem key={addQuery ?? ""} initialQuery={addQuery} />
                                    {!empty && (
                                          <button type="button" onClick={() => setAddOpen(false)} className="min-h-11 self-center rounded-full px-4 text-sm font-bold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-strong">
                                                Cerrar
                                          </button>
                                    )}
                              </div>
                        )}
                        {nudge.data && <NudgeCard nudge={nudge.data} />}

                        {overview.data && !empty && (
                              <Link
                                    to="/recetas?ver=explorar&fuente=pantry"
                                    className="group relative -mx-5 flex min-h-48 overflow-hidden bg-[linear-gradient(105deg,color-mix(in_srgb,var(--color-primary)_40%,var(--color-salmon))_0%,var(--color-salmon)_38%,var(--color-secondary)_100%)] px-5 py-6 shadow-[0_18px_36px_-24px_rgb(233_130_95/0.9)] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-plum"
                              >
                                    {[0, 1].map((n) => (
                                          <span
                                                key={n}
                                                aria-hidden
                                                className={`absolute overflow-hidden rounded-full border-[6px] border-card/90 bg-card shadow-[0_12px_28px_-12px_rgb(43_20_51/0.55)] transition-transform duration-500 ease-out group-hover:scale-105 ${n === 0 ? "-top-2 right-4 size-36" : "-right-1 -bottom-8 size-24"}`}
                                          >
                                                <Photo
                                                      url={overview.data!.recipesPossible.previewImageUrls[n]}
                                                      width={200}
                                                      height={200}
                                                      className="size-full object-cover"
                                                      fallback={<DishPlate seed={`pantry-${n}`} dish={n === 0 ? "ensalada" : "curry"} className="size-full" />}
                                                />
                                          </span>
                                    ))}
                                    <span className="relative flex max-w-[58%] flex-col items-start">
                                          <span className="text-sm font-bold text-ink">{overview.data.recipesPossible.count > 0 ? "Con lo que tienes salen" : "Con lo que tienes"}</span>
                                          <span className="mt-1 font-display text-[1.6rem] leading-tight font-extrabold text-ink">
                                                {overview.data.recipesPossible.count > 0 ? `${plural(overview.data.recipesPossible.count, "receta", "recetas")} esta semana` : "busquemos ideas"}
                                          </span>
                                          <span className={`${buttonBase} ${buttonVariants.dark} mt-4 min-h-11 gap-1.5 px-5 text-sm`}>
                                                Ver ideas
                                                <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
                                          </span>
                                    </span>
                              </Link>
                        )}

                        {overview.data && overview.data.useSoon.length > 0 && !q && (
                              <section aria-labelledby="use-soon" className="flex flex-col gap-3">
                                    <div className="flex items-baseline justify-between gap-3">
                                          <h2 id="use-soon" className="text-section font-extrabold text-ink">
                                                Úsalos pronto
                                          </h2>
                                          <span className="font-display text-title font-extrabold text-primary-strong tabular-nums" aria-label={plural(overview.data.useSoon.length, "ingrediente", "ingredientes")}>
                                                {overview.data.useSoon.length}
                                          </span>
                                    </div>
                                    <ul className={overview.data.useSoon.length <= 3 ? "grid grid-cols-3 gap-3" : "scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 pb-1"}>
                                          {overview.data.useSoon.map((item, index) => {
                                                const look = soonLooks[index % soonLooks.length]!;
                                                return (
                                                      <li key={item.itemId} className={`flex shrink-0 flex-col items-center gap-2 rounded-card px-2 py-4 text-center shadow-soft ${overview.data!.useSoon.length <= 3 ? "" : "w-[6.75rem]"} ${look.card}`}>
                                                            <IngredientIcon label={item.label} icon={item.icon} shape="disc" color="text-ink" className="size-14 shadow-soft" />
                                                            <span className="w-full truncate text-sm font-extrabold text-ink">{item.label}</span>
                                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold whitespace-nowrap ${look.chip}`}>{expiryLabel(item.expiresOn)}</span>
                                                      </li>
                                                );
                                          })}
                                    </ul>
                              </section>
                        )}

                        {!empty && (
                              <div className="-mx-5 flex items-center gap-2 pl-5">
                                    <button
                                          type="button"
                                          aria-label={searchOpen ? "Cerrar filtro" : "Filtrar mi despensa"}
                                          aria-pressed={searchOpen}
                                          onClick={() => {
                                                setSearchOpen((v) => !v);
                                                setSearch("");
                                          }}
                                          className={`grid size-11 shrink-0 place-items-center rounded-full shadow-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${searchOpen ? "bg-ink text-card" : "bg-card text-ink hover:bg-field"}`}
                                    >
                                          <Icon name={searchOpen ? "close" : "search"} className="size-5" />
                                    </button>
                                    <div className="min-w-0 flex-1">
                                          <Chips
                                                bleed
                                                label="Filtrar por lugar"
                                                value={place}
                                                onChange={setPlace}
                                                options={[{ id: "all" as const, label: "Todo" }, ...placeOptions].map((o) => ({ ...o, label: o.label }))}
                                          />
                                    </div>
                              </div>
                        )}

                        {pantry.isPlaceholderData && items.length === 0 ? (
                              <SkPantryRows rows={[{ bar: true }, { bar: true }]} />
                        ) : pantry.isError ? (
                              <ErrorState message={pantry.error.message} onRetry={() => pantry.refetch()} />
                        ) : empty ? (
                              <EmptyState icon="pantry" title="Tu despensa está vacía" description="Añade lo que tienes en casa y tu chef te dirá qué puedes cocinar y qué te falta." />
                        ) : items.length === 0 ? (
                              <div className="flex flex-col items-center gap-3 py-6 text-center">
                                    <p className="text-base text-ink-muted">{q ? `No tienes «${q}» en tu despensa.` : "Aquí no hay nada todavía."}</p>
                                    {q && (
                                          <button
                                                type="button"
                                                onClick={() => {
                                                      setAddQuery(q);
                                                      setAddOpen(true);
                                                      setSearchOpen(false);
                                                      setSearch("");
                                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                                className={`${buttonBase} ${buttonVariants.primary} min-h-11 text-sm`}
                                          >
                                                <Icon name="plus" className="size-4" strokeWidth={2.5} />
                                                Buscar «{q}» para añadirlo
                                          </button>
                                    )}
                              </div>
                        ) : (
                              <ul aria-label="Ingredientes" className="flex flex-col gap-2">
                                    {items.map((item) => (
                                          <PantryRow key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
                                    ))}
                              </ul>
                        )}
                        <LoadMore query={pantry} />
                        {!empty && (
                              <button
                                    type="button"
                                    onClick={() => {
                                          setAddQuery(undefined);
                                          setAddOpen(true);
                                          window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="mb-4 flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-dashed border-primary/40 font-extrabold text-primary-strong transition-colors hover:bg-primary-soft/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                              >
                                    <Icon name="plus" className="size-5" strokeWidth={2.5} />
                                    Añadir ingrediente
                              </button>
                        )}
                  </main>
                  )}

                  {opened && <PantryItemDialog key={opened.id} item={opened} onClose={() => setOpenId(null)} />}
            </>
      );
}

function PantryRow({ item, onOpen }: { item: PantryItem; onOpen: () => void }) {
      const days = item.expiresOn ? daysUntil(item.expiresOn) : null;
      return (
            <li>
                  <button
                        type="button"
                        onClick={onOpen}
                        className="flex min-h-[4.5rem] w-full items-center gap-3 rounded-[1.75rem] bg-card py-2.5 pr-5 pl-3 text-left shadow-soft transition-colors hover:bg-plate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                  >
                        <IngredientIcon label={item.label} icon={item.icon} shape="circle" className="size-12" />
                        <span className="min-w-0 flex-1">
                              <span className="block truncate font-display font-extrabold text-ink">{item.label}</span>
                              <span className="block truncate text-sm font-semibold text-ink-muted">
                                    {[item.product?.brand, item.quantity?.display ?? item.product?.packLabel].filter(Boolean).join(" · ") ||
                                          [placeOptions.find((p) => p.id === item.storage)?.label, item.expiresOn ? `vence ${relativeDay(item.expiresOn)}` : null].filter(Boolean).join(" · ") ||
                                          "Toca para decir cuánto te queda"}
                              </span>
                        </span>
                        <span className="flex w-[4.5rem] shrink-0 flex-col items-end gap-1">
                              {item.remainingPct !== null && (
                                    <span className="block h-2 w-full overflow-hidden rounded-full bg-field" role="img" aria-label={`Queda ${item.remainingPct}%`}>
                                          <span className="bar-fill block h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary-strong),var(--color-primary))]" style={{ width: `${item.remainingPct}%` }} />
                                    </span>
                              )}
                              {item.expiresOn && days! <= USE_SOON_DAYS && (
                                    <span className="text-xs font-extrabold whitespace-nowrap text-warning">{days! < 0 ? "Vencido" : relativeDay(item.expiresOn)}</span>
                              )}
                        </span>
                  </button>
            </li>
      );
}
