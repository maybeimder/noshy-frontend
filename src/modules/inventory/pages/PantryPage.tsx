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

/** «Mañana», «2 días»: short, for the use-soon chips. */
function expiryLabel(day: string) {
      const days = daysUntil(day);
      return days < 0 ? "Vencido" : days === 0 ? "Hoy" : days === 1 ? "Mañana" : `${days} días`;
}

const soonLooks = [
      { card: "bg-[linear-gradient(180deg,var(--color-rose-soft),var(--color-card))]", ink: "text-rose-ink", chip: "bg-primary-strong text-card" },
      { card: "bg-[linear-gradient(180deg,var(--color-mustard-soft),var(--color-card))]", ink: "text-mustard-ink", chip: "bg-mustard-soft text-mustard-ink" },
      { card: "bg-[linear-gradient(180deg,var(--color-lilac-soft),var(--color-card))]", ink: "text-lilac-ink", chip: "bg-lilac-soft text-lilac-ink" },
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
                        actions={
                              <>
                                    <RoundButton
                                          label={searchOpen ? "Cerrar filtro" : "Filtrar mi despensa"}
                                          onClick={() => {
                                                setSearchOpen((v) => !v);
                                                setSearch("");
                                                setAddOpen(false);
                                          }}
                                    >
                                          <Icon name={searchOpen ? "close" : "search"} />
                                    </RoundButton>
                                    <RoundButton label={addOpen ? "Cerrar añadir ingrediente" : "Añadir ingrediente"} onClick={() => {
                                                setAddOpen((v) => !v);
                                                setAddQuery(undefined);
                                                setSearchOpen(false);
                                                setSearch("");
                                          }}
                                    >
                                          <Icon name={addOpen ? "close" : "plus"} strokeWidth={2.25} />
                                    </RoundButton>
                                    <ReceiptScanner variant="button" />
                              </>
                        }
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

                        {(addOpen || empty) && <AddPantryItem key={addQuery ?? ""} initialQuery={addQuery} />}
                        {nudge.data && <NudgeCard nudge={nudge.data} />}

                        {overview.data && !empty && (
                              <Link
                                    to="/recetas?ver=explorar&fuente=pantry"
                                    className="group relative flex min-h-40 overflow-hidden rounded-card bg-[linear-gradient(110deg,var(--color-secondary)_0%,var(--color-salmon)_55%,var(--color-primary)_100%)] p-5 shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                              >
                                    {[0, 1].map((n) => (
                                          <span
                                                key={n}
                                                aria-hidden
                                                className={`absolute overflow-hidden rounded-full border-4 border-card bg-card shadow-soft ${n === 0 ? "-top-3 -right-4 size-32" : "right-14 -bottom-6 size-24"}`}
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
                                          <span className="mt-0.5 font-display text-section leading-tight font-extrabold text-ink">
                                                {overview.data.recipesPossible.count > 0 ? `${plural(overview.data.recipesPossible.count, "receta", "recetas")} esta semana` : "busquemos ideas"}
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
                                    <div className="flex items-baseline justify-between gap-3">
                                          <h2 id="use-soon" className="text-section font-extrabold text-ink">
                                                <MarkerText>Úsalos pronto</MarkerText>
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
                                                            <IngredientIcon label={item.label} icon={item.icon} shape="disc" color={look.ink} className="size-14" />
                                                            <span className="w-full truncate text-sm font-extrabold text-ink">{item.label}</span>
                                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold whitespace-nowrap ${look.chip}`}>{expiryLabel(item.expiresOn)}</span>
                                                      </li>
                                                );
                                          })}
                                    </ul>
                              </section>
                        )}

                        {!empty && (
                              <Chips
                                    bleed
                                    label="Filtrar por lugar"
                                    value={place}
                                    onChange={setPlace}
                                    options={[{ id: "all" as const, label: "Todo" }, ...placeOptions].map((o) => ({ ...o, label: o.label }))}
                              />
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
                        <IngredientIcon label={item.label} icon={item.icon} className="size-12" />
                        <span className="min-w-0 flex-1">
                              <span className="block truncate font-display font-extrabold text-ink">{item.label}</span>
                              <span className="block truncate text-sm font-semibold text-ink-muted">
                                    {[item.product?.brand, item.quantity?.display ?? item.product?.packLabel].filter(Boolean).join(" · ") ||
                                          [placeOptions.find((p) => p.id === item.storage)?.label, item.expiresOn ? `vence ${relativeDay(item.expiresOn)}` : null].filter(Boolean).join(" · ") ||
                                          "Toca para decir cuánto te queda"}
                              </span>
                        </span>
                        <span className="flex w-16 shrink-0 flex-col items-end gap-1">
                              {item.remainingPct !== null && (
                                    <span className="block h-2 w-full overflow-hidden rounded-full bg-field" role="img" aria-label={`Queda ${item.remainingPct}%`}>
                                          <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary-strong),var(--color-primary))]" style={{ width: `${item.remainingPct}%` }} />
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
