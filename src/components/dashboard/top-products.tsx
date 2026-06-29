import { Card } from "@/components/ui/card";
import { formatCurrency, getTopProducts } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

type TopProductsProps = {
  events: AnalyticsEvent[];
};

export function TopProducts({ events }: TopProductsProps) {
  const products = getTopProducts(events);

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-white">Top products</h2>
      <p className="mt-1 text-sm text-slate-500">Ranked by views and purchases</p>

      <div className="mt-5 divide-y divide-white/10">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/5 text-sm font-semibold text-slate-300">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{product.name}</p>
                <p className="text-xs text-slate-500">
                  {product.views} views · {product.purchases} purchases
                </p>
              </div>
            </div>
            <p className="shrink-0 text-sm font-medium text-emerald-300">{formatCurrency(product.revenue)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
