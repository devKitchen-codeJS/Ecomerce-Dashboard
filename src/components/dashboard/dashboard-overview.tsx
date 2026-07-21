"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Database, Loader2 } from "lucide-react";
import { EventTypeBreakdown } from "@/components/dashboard/event-type-breakdown";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TopProducts } from "@/components/dashboard/top-products";
import { WeeklyRevenueChart } from "@/components/dashboard/weekly-revenue-chart";
import { WeeklyVolumeChart } from "@/components/dashboard/weekly-volume-chart";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getKpis } from "@/lib/analytics";
import { fetchRecentEvents, getCurrentOrganizationId } from "@/lib/events-store";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { AnalyticsEvent } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

export function DashboardOverview() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const kpis = useMemo(() => getKpis(events), [events]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isActive = true;
    const userId = user.id;

    async function loadWeeklyEvents() {
      try {
        setIsLoading(true);
        setErrorMessage(undefined);
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - 6);
        sinceDate.setHours(0, 0, 0, 0);

        const organizationId = await getCurrentOrganizationId(supabase, userId);
        const weeklyEvents = await fetchRecentEvents(supabase, {
          organizationId,
          since: sinceDate.toISOString(),
          limit: 5_000,
        });

        if (!isActive) {
          return;
        }

        setEvents(weeklyEvents);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "Unable to load persisted weekly events.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadWeeklyEvents();

    return () => {
      isActive = false;
    };
  }, [supabase, user?.id]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="Weekly analytics"
          title="E-commerce performance overview"
          description="Dashboard metrics are based on persisted events from Supabase for the last 7 days, keeping this page focused on historical business trends."
        />
        <Badge className="w-fit border-sky-400/20 bg-sky-400/10 text-sky-300">Last 7 days</Badge>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-300">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-sky-300" /> : <Database className="h-4 w-4 text-emerald-300" />}
          {isLoading ? "Loading weekly events from Supabase..." : `${events.length} persisted events loaded for analytics.`}
        </div>
        {errorMessage ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </div>
        ) : null}
      </section>

      {!isLoading && events.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm font-semibold text-white">No persisted events yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Open Live Events for a minute to generate and save events into Supabase. This dashboard will then use
            those saved rows for weekly analytics and future AI summaries.
          </p>
        </Card>
      ) : null}

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
