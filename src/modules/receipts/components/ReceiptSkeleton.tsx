import { Sk, SkGroup, SkText, times } from "@/shared/components/ui/Skeleton";

export function ReceiptItemsSkeleton({ count = 5 }: { count?: number }) {
      return (
            <SkGroup className="divide-y divide-line rounded-card bg-card px-4 shadow-soft">
                  {times(count).map((i) => (
                        <div key={i} className="flex items-center gap-3 py-3">
                              <div className="min-w-0 flex-1">
                                    <SkText w="w-36" />
                                    <SkText size="xs" w="w-24" />
                              </div>
                              <Sk className="h-11 w-28" />
                        </div>
                  ))}
            </SkGroup>
      );
}

export default function ReceiptSkeleton() {
      return (
            <>
                  <Sk className="h-11" />
                  <ReceiptItemsSkeleton />
            </>
      );
}
