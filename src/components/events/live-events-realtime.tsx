"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertCircle, Database, Pause, Play } from "lucide-react";
import { EventTypeBreakdown } from "@/components/dashboard/event-type-breakdown";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LiveEventFeed } from "@/components/dashboard/live-event-feed";
import { RealtimeVelocityChart } from "@/components/events/realtime-velocity-chart";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { getRealtimeKpis } from "@/lib/analytics";
import { fetchRecentEvents, getCurrentOrganizationId, insertEvents, mergeEvents, realtimePayloadToEvent } from "@/lib/events-store";
import { createMockEvent } from "@/lib/mock-data";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { AnalyticsEvent } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

export function LiveEventsRealtime() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGeneratorRunning, setIsGeneratorRunning] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Connecting to Supabase...");
  const [errorMessage, setErrorMessage] = useState<string>();
  const pendingEventsRef = useRef<AnalyticsEvent[]>([]);
  const isFlushingRef = useRef(false);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isActive = true;
    const userId = user.id;

    async function loadInitialEvents() {
      try {
        setStatusMessage("Loading persisted events...");
        const currentOrganizationId = await getCurrentOrganizationId(supabase, userId);
        const initialEvents = await fetchRecentEvents(supabase, {
          organizationId: currentOrganizationId,
          limit: 180,
        });

        if (!isActive) {
          return;
        }

        setOrganizationId(currentOrganizationId);
        setEvents(initialEvents);
        setStatusMessage(
          currentOrganizationId
            ? "Persisting generated events to Supabase."
            : "Persisting events without organization scope.",
        );
        setIsInitialized(true);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "Unable to load events from Supabase.");
        setIsInitialized(true);
      }
    }

    loadInitialEvents();

    return () => {
      isActive = false;
    };
  }, [supabase, user?.id]);

  useEffect(() => {
    if (!isInitialized || !isGeneratorRunning) {
      return;
    }

    const channel = supabase
      .channel(`events-feed-${organizationId ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
          ...(organizationId ? { filter: `organization_id=eq.${organizationId}` } : {}),
        },
        (payload) => {
          const nextEvent = realtimePayloadToEvent(payload);

          if (nextEvent) {
            setEvents((currentEvents) => mergeEvents(currentEvents, [nextEvent], 180));
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setStatusMessage("Realtime subscription is active.");
          setErrorMessage(undefined);
        }

        if (status === "CHANNEL_ERROR") {
          setErrorMessage("Realtime subscription failed. Check Supabase Realtime settings for events.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isGeneratorRunning, isInitialized, organizationId, supabase]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    let timeoutId: number;
    const flushIntervalId = window.setInterval(flushPendingEvents, 1_000);

    async function flushPendingEvents() {
      if (isFlushingRef.current || pendingEventsRef.current.length === 0) {
        return;
      }

      isFlushingRef.current = true;
      const batch = pendingEventsRef.current.splice(0, pendingEventsRef.current.length);

      try {
        await insertEvents(supabase, batch, organizationId);
        setErrorMessage(undefined);
      } catch (error) {
        pendingEventsRef.current = [...batch, ...pendingEventsRef.current].slice(0, 500);
        setErrorMessage(error instanceof Error ? error.message : "Unable to persist generated events.");
      } finally {
        isFlushingRef.current = false;
      }
    }

    const scheduleNext = () => {
      const delay = 300 + Math.floor(Math.random() * 700);

      timeoutId = window.setTimeout(() => {
        pendingEventsRef.current.push(createMockEvent());
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(flushIntervalId);
      void flushPendingEvents();
    };
  }, [isInitialized, organizationId, supabase]);

  const kpis = useMemo(() => getRealtimeKpis(events), [events]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="Live events"
          title="Realtime customer activity"
          description="This page keeps the live stream visible: event velocity, current funnel movement, action mix, and the newest simulated customer events."
        />
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            className={
              isGeneratorRunning
                ? "w-fit gap-2 border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : "w-fit gap-2 border-amber-400/20 bg-amber-400/10 text-amber-300"
            }
          >
            <span className="relative flex h-2.5 w-2.5">
              {isGeneratorRunning ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
              ) : null}
              <span className={isGeneratorRunning ? "relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" : "relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300"} />
            </span>
            {isGeneratorRunning ? "Persisting events" : "Generator paused"}
          </Badge>
          <button
            type="button"
            onClick={() => setIsGeneratorRunning((current) => !current)}
            disabled={!isInitialized}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-surface-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratorRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isGeneratorRunning ? "Stop generation" : "Start generation"}
          </button>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-300">
          <Database className="h-4 w-4 text-emerald-300" />
          {statusMessage}
        </div>
        {errorMessage ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </div>
        ) : null}
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
          Waiting for persisted events...
        </div>
      ) : null}
    </div>
  );
}
