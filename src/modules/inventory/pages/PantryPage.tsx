import { useState } from "react";
import { Link } from "react-router-dom";
import NudgeCard from "@/modules/cooking/components/NudgeCard";
import { useNudge } from "@/modules/cooking/hooks/useHome";
import ReceiptScanner from "@/modules/receipts/components/ReceiptScanner";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import InitialTile from "@/shared/components/ui/InitialTile";
import LoadMore from "@/shared/components/ui/LoadMore";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import { MarkerText } from "@/shared/components/ui/ScribbleText";
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

export default function PantryPage() {
      const [place, setPlace] = useState<StoragePlace | "all">("all");
      const [searchOpen, setSearchOpen] = useState(false);
      const [addOpen, setAddOpen] = useState(false);
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
                        meta={loading ? null : overview.data ? plural(overview.data.totalItems, "ingrediente", "ingredientes") : undefined}
                        actions={
                              <>
                                    <RoundButton
                                          label={searchOpen ? "Cerrar búsqueda" : "Buscar en la despensa"}
                                          onClick={() => {
                                                setSearchOpen((v) => !v);
                                                setSearch("");
                                          }}
                                    >
                                          <Icon name={searchOpen ? "close" : "search"} />
                                    </RoundButton>
                                    <RoundButton tone="primary" label={addOpen ? "Cerrar añadir ingrediente" : "Añadir ingrediente"} onClick={() => setAddOpen((v) => !v)}>
                                          <Icon name={addOpen ? "close" : "plus"} strokeWidth={2.25} />
                                    </RoundButton>
                              </>
                        }
                  />

                  {loading ? (
                  <PantrySkeleton />
                  ) : (
                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                        {searchOpen && (
                              <label className="relative">
                                    <span className="sr-only">Buscar en tu despensa</span>
                                    <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
                                    <input
                                          autoFocus
                                          type="search"
                                          placeholder="Buscar en tu despensa…"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className={`${fieldClass("card")} min-h-12 rounded-full pr-4 pl-12 shadow-soft`}
                                    />
                              </label>
                        )}

                        {(addOpen || empty) && <AddPantryItem />}
                        <ReceiptScanner />
                        {nudge.data && <NudgeCard nudge={nudge.data} />}

                        {overview.data && !empty && (
                              <Link
                                    to="/recetas?ver=explorar&fuente=pantry"
                                    className="group relative flex min-h-36 overflow-hidden rounded-card bg-peach-glow p-5 shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                              >
                                    <span aria-hidden className="absolute -top-4 -right-6 size-28 rounded-full bg-card p-1 shadow-soft">
                                          <DishPlate seed="pantry-a" dish="ensalada" className="size-full" />
                                    </span>
                                    <span aria-hidden className="absolute -right-2 -bottom-6 size-20 rounded-full bg-card p-1 shadow-soft">
                                          <DishPlate seed="pantry-b" dish="curry" className="size-full" />
                                    </span>
                                    <span className="relative flex max-w-[62%] flex-col items-start">
                                          <span className="text-sm font-bold text-ink">Con lo que tienes</span>
                                          <span className="mt-0.5 font-display text-section leading-tight font-extrabold text-ink">
                                                {overview.data.recipesPossible.count > 0 ? `puedes hacer ${plural(overview.data.recipesPossible.count, "receta", "recetas")}` : "busquemos ideas"}
                                          </span>
                                          <span className={`${buttonBase} ${buttonVariants.dark} mt-3 min-h-10 gap-1.5 px-4 text-sm`}>
                                                Ver ideas
                                                <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
                                          </span>
                                    </span>
                              </Link>
                        )}

                        {overview.data && overview.data.useSoon.length > 0 && !q && (
                              <section aria-labelledby="use-soon" className="flex flex-col gap-3">
                                    <h2 id="use-soon" className="text-section font-extrabold text-ink">
                                          <MarkerText>Úsalos pronto</MarkerText>
                                    </h2>
                                    <ul className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                                          {overview.data.useSoon.map((item) => (
                                                <li key={item.itemId} className="flex w-32 shrink-0 flex-col items-center gap-2 rounded-card bg-card p-3 text-center shadow-soft">
                                                      <InitialTile label={item.label} />
                                                      <span className="w-full truncate text-sm font-extrabold text-ink">{item.label}</span>
                                                      <span className="text-xs font-bold text-warning">{relativeDay(item.expiresOn)}</span>
                                                </li>
                                          ))}
                                    </ul>
                              </section>
                        )}

                        {!empty && (
                              <Chips
                                    bleed
                                    label="Filtrar por lugar"
                                    value={place}
                                    onChange={setPlace}
                                    options={[{ id: "all" as const, label: "Todo" }, ...placeOptions].map((o) => ({ ...o, label: counts ? `${o.label} · ${counts[o.id]}` : o.label }))}
                              />
                        )}

                        {pantry.isPlaceholderData && items.length === 0 ? (
                              <SkPantryRows rows={[{ bar: true }, { bar: true }]} />
                        ) : pantry.isError ? (
                              <ErrorState message={pantry.error.message} onRetry={() => pantry.refetch()} />
                        ) : empty ? (
                              <EmptyState icon="pantry" title="Tu despensa está vacía" description="Añade lo que tienes en casa y tu chef te dirá qué puedes cocinar y qué te falta." />
                        ) : items.length === 0 ? (
                              <p className="py-6 text-center text-base text-ink-muted">{q ? "Nada coincide con tu búsqueda." : "Aquí no hay nada todavía."}</p>
                        ) : (
                              <ul aria-label="Ingredientes" className="flex flex-col gap-2">
                                    {items.map((item) => (
                                          <PantryRow key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
                                    ))}
                              </ul>
                        )}
                        <LoadMore query={pantry} />
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
                        className="flex min-h-16 w-full items-center gap-3 rounded-card bg-card py-2 pr-4 pl-3 text-left shadow-soft hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                  >
                        <InitialTile label={item.label} />
                        <span className="min-w-0 flex-1">
                              <span className="block truncate font-bold text-ink">{item.label}</span>
                              <span className="block truncate text-sm font-semibold text-ink-muted">
                                    {[item.product?.brand, item.quantity?.display, placeOptions.find((p) => p.id === item.storage)?.label].filter(Boolean).join(" · ") || "Sin detalles"}
                              </span>
                              {item.remainingPct !== null && (
                                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-field" role="img" aria-label={`Queda ${item.remainingPct}%`}>
                                          <span className="block h-full rounded-full bg-primary" style={{ width: `${item.remainingPct}%` }} />
                                    </span>
                              )}
                        </span>
                        {item.expiresOn && (
                              <span className={`shrink-0 text-xs font-extrabold ${days! <= USE_SOON_DAYS ? "text-warning" : "text-ink-muted"}`}>{days! < 0 ? "Vencido" : relativeDay(item.expiresOn)}</span>
                        )}
                        <Icon name="chevronRight" className="size-5 shrink-0 text-ink-muted" />
                  </button>
            </li>
      );
}
