"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { EventTypeBreakdown } from "@/components/dashboard/event-type-breakdown";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LiveEventFeed } from "@/components/dashboard/live-event-feed";
import { RealtimeVelocityChart } from "@/components/events/realtime-velocity-chart";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { getRealtimeKpis } from "@/lib/analytics";
import { createInitialEvents, createMockEvent } from "@/lib/mock-data";
import type { AnalyticsEvent } from "@/lib/types";

export function LiveEventsRealtime() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    setEvents(createInitialEvents());
  }, []);

  useEffect(() => {
    if (events.length === 0) {
      return;
    }

    let timeoutId: number;

    const scheduleNext = () => {
      const delay = 300 + Math.floor(Math.random() * 700);

      timeoutId = window.setTimeout(() => {
        setEvents((currentEvents) => [createMockEvent(), ...currentEvents].slice(0, 180));
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => window.clearTimeout(timeoutId);
  }, [events.length]);

  const kpis = useMemo(() => getRealtimeKpis(events), [events]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="Live events"
          title="Realtime customer activity"
          description="This page keeps the live stream visible: event velocity, current funnel movement, action mix, and the newest simulated customer events."
        />
        <Badge className="w-fit gap-2 border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
          Generator running
        </Badge>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric, index) => (
          <KpiCard key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RealtimeVelocityChart events={events} />
        <EventTypeBreakdown events={events} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <FunnelChart events={events} />
        <LiveEventFeed events={events} />
      </section>

      {events.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Activity className="h-4 w-4 animate-pulse" />
          Starting event generator...
        </div>
      ) : null}
    </div>
  );
}
