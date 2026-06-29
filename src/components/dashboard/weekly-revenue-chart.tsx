import { Card } from "@/components/ui/card";
import { formatCurrency, getDailySeries } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

type WeeklyRevenueChartProps = {
  events: AnalyticsEvent[];
};

export function WeeklyRevenueChart({ events }: WeeklyRevenueChartProps) {
  const series = getDailySeries(events);
  const maxRevenue = Math.max(...series.map((day) => day.revenue), 1);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Weekly revenue</h2>
          <p className="mt-1 text-sm text-slate-500">Purchase value grouped by day</p>
        </div>
        <p className="text-sm font-medium text-emerald-300">
          {formatCurrency(series.reduce((sum, day) => sum + day.revenue, 0))}
        </p>
      </div>

      <div className="mt-6 flex h-64 items-end gap-3">
        {series.map((day) => (
          <div key={day.key} className="flex h-full flex-1 flex-col justify-end gap-2">
            <div className="flex flex-1 items-end rounded-md bg-white/[0.035] p-1">
              <div
                className="w-full rounded bg-gradient-to-t from-emerald-400 to-sky-300 transition-all duration-500"
                style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 6)}%` }}
                title={`${day.label}: ${formatCurrency(day.revenue)}`}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-300">{day.label}</p>
              <p className="mt-1 text-[11px] text-slate-500">{formatCurrency(day.revenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
