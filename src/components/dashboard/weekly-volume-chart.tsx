import { Card } from "@/components/ui/card";
import { getDailySeries } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

type WeeklyVolumeChartProps = {
  events: AnalyticsEvent[];
};

export function WeeklyVolumeChart({ events }: WeeklyVolumeChartProps) {
  const series = getDailySeries(events);
  const maxEvents = Math.max(...series.map((day) => day.events), 1);

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-white">Weekly event volume</h2>
      <p className="mt-1 text-sm text-slate-500">Total tracked events by day</p>

      <div className="mt-6 space-y-4">
        {series.map((day) => (
          <div key={day.key}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-200">{day.label}</span>
              <span className="text-slate-500">{day.events} events</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-sky-300 transition-all duration-500"
                style={{ width: `${Math.max((day.events / maxEvents) * 100, 5)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
