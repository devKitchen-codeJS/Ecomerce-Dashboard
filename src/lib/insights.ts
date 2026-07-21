import { getEventTypeBreakdown, getFunnel, getKpis, getTopProducts } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

export type InsightContext = {
  generatedAt: string;
  period: {
    label: string;
    from: string;
    to: string;
  };
  kpis: ReturnType<typeof getKpis>;
  funnel: ReturnType<typeof getFunnel>;
  eventMix: ReturnType<typeof getEventTypeBreakdown>;
  topProducts: ReturnType<typeof getTopProducts>;
  sampleSize: number;
};

export type InsightReport = {
  title: string;
  summary: string;
  insights: string[];
  recommendedActions: string[];
  anomalies: string[];
};

export function buildInsightContext(events: AnalyticsEvent[], periodLabel = "Last 7 days"): InsightContext {
  const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const fallbackTo = new Date();
  const fallbackFrom = new Date();
  fallbackFrom.setDate(fallbackTo.getDate() - 6);
  fallbackFrom.setHours(0, 0, 0, 0);

  return {
    generatedAt: new Date().toISOString(),
    period: {
      label: periodLabel,
      from: sortedEvents[0]?.timestamp ?? fallbackFrom.toISOString(),
      to: sortedEvents.at(-1)?.timestamp ?? fallbackTo.toISOString(),
    },
    kpis: getKpis(events),
    funnel: getFunnel(events),
    eventMix: getEventTypeBreakdown(events),
    topProducts: getTopProducts(events),
    sampleSize: events.length,
  };
}

export function getFallbackInsightReport(context: InsightContext): InsightReport {
  const revenue = context.kpis.find((metric) => metric.label === "Revenue")?.value ?? "$0";
  const conversion = context.kpis.find((metric) => metric.label === "Conversion rate")?.value ?? "0%";

  return {
    title: "E-commerce Analytics Report",
    summary: `During ${context.period.label}, the dataset contains ${context.sampleSize} persisted events. Revenue is ${revenue}, with a conversion rate of ${conversion}.`,
    insights: [
      "The report is based on persisted Supabase events available in the selected period.",
      "Top product and funnel performance are ready for deeper AI analysis once more traffic accumulates.",
      "Event mix can be used to identify whether users are browsing, showing purchase intent, or completing purchases.",
    ],
    recommendedActions: [
      "Keep collecting events before making major decisions if the sample size is low.",
      "Compare product views against purchases to find products with high intent but weak conversion.",
      "Use anomaly detection after hourly aggregates contain enough historical data.",
    ],
    anomalies: context.sampleSize < 25 ? ["Sample size is low, so anomaly detection is limited."] : [],
  };
}
