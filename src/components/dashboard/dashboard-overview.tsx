import { EventTypeBreakdown } from "@/components/dashboard/event-type-breakdown";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TopProducts } from "@/components/dashboard/top-products";
import { WeeklyRevenueChart } from "@/components/dashboard/weekly-revenue-chart";
import { WeeklyVolumeChart } from "@/components/dashboard/weekly-volume-chart";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { getKpis } from "@/lib/analytics";
import { createHistoricalEvents } from "@/lib/mock-data";

export function DashboardOverview() {
  const events = createHistoricalEvents(7);
  const kpis = getKpis(events);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="Weekly analytics"
          title="E-commerce performance overview"
          description="Dashboard metrics are based on a generated 7-day dataset, so this page stays focused on business trends instead of live stream movement."
        />
        <Badge className="w-fit border-sky-400/20 bg-sky-400/10 text-sky-300">Last 7 days</Badge>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric, index) => (
          <KpiCard key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <WeeklyRevenueChart events={events} />
        <WeeklyVolumeChart events={events} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <EventTypeBreakdown events={events} />
        </div>
        <div className="lg:col-span-1">
          <FunnelChart events={events} />
        </div>
        <div className="lg:col-span-1">
          <TopProducts events={events} />
        </div>
      </section>
    </div>
  );
}
