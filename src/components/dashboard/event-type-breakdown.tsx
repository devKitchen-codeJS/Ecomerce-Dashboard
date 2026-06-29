import { Card } from "@/components/ui/card";
import { getEventTypeBreakdown } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

type EventTypeBreakdownProps = {
  events: AnalyticsEvent[];
};

export function EventTypeBreakdown({ events }: EventTypeBreakdownProps) {
  const breakdown = getEventTypeBreakdown(events);
  const total = breakdown.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-white">Event mix</h2>
      <p className="mt-1 text-sm text-slate-500">Share of tracked actions across the selected week</p>

      <div className="mt-5 space-y-4">
        {breakdown.map((item) => {
          const percentage = (item.count / total) * 100;

          return (
            <div key={item.type}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-200">{item.label}</span>
                <span className="text-slate-500">{percentage.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-emerald-300 transition-all duration-500"
                  style={{ width: `${Math.max(percentage, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
