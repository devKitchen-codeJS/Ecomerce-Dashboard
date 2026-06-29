import { Card } from "@/components/ui/card";
import { getFunnel } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

type FunnelChartProps = {
  events: AnalyticsEvent[];
};

export function FunnelChart({ events }: FunnelChartProps) {
  const funnel = getFunnel(events);

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-white">Conversion funnel</h2>
      <p className="mt-1 text-sm text-slate-500">Traffic movement through purchase intent</p>

      <div className="mt-6 space-y-4">
        {funnel.map((step) => (
          <div key={step.type}>
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-200">{step.label}</span>
              <span className="text-slate-500">{step.count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sky-300 transition-all duration-500"
                style={{ width: `${step.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
