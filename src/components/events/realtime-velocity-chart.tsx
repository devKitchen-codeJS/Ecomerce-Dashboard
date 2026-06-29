"use client";

import { Card } from "@/components/ui/card";
import type { AnalyticsEvent } from "@/lib/types";

type RealtimeVelocityChartProps = {
  events: AnalyticsEvent[];
};

export function RealtimeVelocityChart({ events }: RealtimeVelocityChartProps) {
  const now = Date.now();
  const buckets = Array.from({ length: 12 }, (_, index) => {
    const bucketEnd = now - (11 - index) * 5_000;
    const bucketStart = bucketEnd - 5_000;
    const count = events.filter((event) => {
      const time = new Date(event.timestamp).getTime();

      return time >= bucketStart && time < bucketEnd;
    }).length;

    return {
      label: `${(11 - index) * 5}s`,
      count,
    };
  });
  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-white">Realtime event velocity</h2>
      <p className="mt-1 text-sm text-slate-500">Rolling 60-second stream, grouped into 5-second buckets</p>

      <div className="mt-6 flex h-56 items-end gap-2">
        {buckets.map((bucket) => (
          <div key={bucket.label} className="flex h-full flex-1 flex-col justify-end gap-2">
            <div className="flex flex-1 items-end rounded-md bg-white/[0.035] p-1">
              <div
                className="w-full rounded bg-gradient-to-t from-rose-400 to-amber-300 transition-all duration-300"
                style={{ height: `${Math.max((bucket.count / maxCount) * 100, 5)}%` }}
              />
            </div>
            <p className="text-center text-[11px] text-slate-500">{bucket.count}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
