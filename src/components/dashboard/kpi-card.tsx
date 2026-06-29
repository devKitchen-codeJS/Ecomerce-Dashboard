import { Activity, ArrowUpRight, CircleDollarSign, MousePointerClick, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { KpiMetric } from "@/lib/types";

const toneClasses: Record<KpiMetric["tone"], string> = {
  green: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  blue: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
  amber: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  rose: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
};

const icons = [Users, CircleDollarSign, MousePointerClick, Activity];

type KpiCardProps = {
  metric: KpiMetric;
  index: number;
};

export function KpiCard({ metric, index }: KpiCardProps) {
  const Icon = icons[index] ?? Activity;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-lg ring-1 ${toneClasses[metric.tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-slate-400">
        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-300" />
        {metric.trend}
      </p>
    </Card>
  );
}
